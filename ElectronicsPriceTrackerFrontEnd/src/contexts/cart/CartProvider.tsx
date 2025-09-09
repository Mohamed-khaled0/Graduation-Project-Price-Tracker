import React, { ReactNode, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { CartContext } from './CartContext';
import { CartItem } from './types';
import { ProductData } from '@/pages/Shop';
// import { ProductResponseDto } from '@/types/api';

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        console.log("CartProvider: User identified, loading cart for user_id:", user.id);
        try {
          const { data: cartDbItems, error: cartError } = await supabase
            .from('cart_items')
            .select('id, product_id, quantity')
            .eq('user_id', user.id);

          if (cartError) {
            console.error('Error loading cart_items from Supabase:', cartError);
            toast.error("Could not load your cart items from database.");
            return;
          }
          console.log("CartProvider: Fetched cart_items from Supabase:", cartDbItems);


          if (cartDbItems && cartDbItems.length > 0) {
            const detailedCartItemsPromises = cartDbItems.map(async (cartDbItem) => {
              try {
                console.log(`CartProvider: Fetching details for product_id: ${cartDbItem.product_id}`);
                const res = await fetch(`/api/Product/${cartDbItem.product_id}`);
                if (!res.ok) {
                  console.warn(`CartProvider: Failed to fetch details for product ${cartDbItem.product_id}. Status: ${res.status}`);
                  const errorText = await res.text();
                  console.warn(`CartProvider: Error response for product ${cartDbItem.product_id}:`, errorText);
                  return null;
                }


                const productDetailsApi: ProductResponseDto = await res.json();
                console.log(`CartProvider: Successfully fetched details for product ${cartDbItem.product_id}:`, productDetailsApi);

                return {
                  id: cartDbItem.id,
                  product_id: cartDbItem.product_id,
                  title: productDetailsApi.name,
                  price: productDetailsApi.currentPrice,
                  quantity: cartDbItem.quantity,
                  thumbnail: productDetailsApi.imageUrl || 'https://via.placeholder.com/150',
                  category: productDetailsApi.category,
                  productUrl: productDetailsApi.productUrl,
                  platformName: productDetailsApi.platformName,
                } as CartItem;
              } catch (fetchError) {
                console.error(`CartProvider: Error fetching product details for cart item (product_id ${cartDbItem.product_id}):`, fetchError);
                return null;
              }
            });
            const resolvedItems = (await Promise.all(detailedCartItemsPromises)).filter(item => item !== null) as CartItem[];
            console.log("CartProvider: Resolved detailed cart items:", resolvedItems);
            setItems(resolvedItems);
          } else {
            console.log("CartProvider: No cart items found in database for this user or cartDbItems is null.");
            setItems([]);
          }
        } catch (error) {
          console.error('CartProvider: General error in loadCart:', error);
          toast.error("An error occurred while loading your cart.");
        }
      } else {
        console.log("CartProvider: No user identified, clearing local cart items.");
        setItems([]);
      }
    };
    loadCart();
  }, [user]);

  const addToCart = async (product: ProductData) => {
    if (!requireAuth() || !user) return;
    try {
      const existingItem = items.find(item => item.product_id === product.id);
      if (existingItem) {
        toast.warning(`${product.title} is already in your cart.`);
        return;
      }

      const { data, error } = await supabase
        .from('cart_items')
        .insert([{ user_id: user.id, product_id: product.id, quantity: 1 }])
        .select()
        .single();

      if (error) throw error;

      if (data) {

        const newItem: CartItem = {
          id: data.id,
          product_id: data.product_id,
          title: product.title,
          price: product.price,
          quantity: data.quantity,
          thumbnail: product.thumbnail,
          category: product.category,
          productUrl: product.productUrl,
          platformName: product.platformName,
        };
        setItems(prevItems => [...prevItems, newItem]);
        toast.success(`${product.title} added to cart!`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add item to cart');
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    if (!requireAuth() || !user) return;
    try {
      const itemToRemove = items.find(item => item.id === cartItemId);
      const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);
      if (error) throw error;
      setItems(prevItems => prevItems.filter(item => item.id !== cartItemId));
      if (itemToRemove) toast.success(`${itemToRemove.title} removed from cart`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove item.');
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (!requireAuth() || !user) return;
    if (quantity < 1) return;
    try {
      const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', cartItemId);
      if (error) throw error;
      setItems(prevItems => prevItems.map(item => item.id === cartItemId ? { ...item, quantity } : item));
    } catch (error: any) {
      toast.error(error.message || 'Failed to update quantity.');
      console.error('Error updating quantity:', error);
    }
  };

  const clearCart = async () => {
    if (!requireAuth() || !user) return;
    try {
      const { error } = await supabase.from('cart_items').delete().eq('user_id', user.id);
      if (error) throw error;
      setItems([]);
      toast.success('Cart cleared');
    } catch (error: any) {
      toast.error(error.message || 'Failed to clear cart.');
      console.error('Error clearing cart:', error);
    }
  };

  const getItemCount = () => items.reduce((sum, item) => sum + item.quantity, 0);
  const getTotal = () => items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const requireAuth = () => {
    if (!user) {
      toast.error("Please sign in to use the cart", {
        action: { label: "Sign In", onClick: () => navigate("/login") },
      });
      return false;
    }
    return true;
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getItemCount,
      getTotal,
      requireAuth
    }}>
      {children}
    </CartContext.Provider>
  );
};
