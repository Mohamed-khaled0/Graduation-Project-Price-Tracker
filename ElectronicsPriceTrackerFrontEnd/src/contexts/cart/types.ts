import { ProductData } from '@/pages/Shop';


export interface PriceComparison {
  store: string;
  price: number;
  url: string;
}

export interface CartItem {
  id: string;
  product_id: number;
  title: string;
  price: number;
  quantity: number;
  thumbnail: string;
  category?: string;
  productUrl?: string;
  platformName?: string;
}

export interface CartContextType {
  items: CartItem[];
  addToCart: (product: ProductData) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotal: () => number;
  requireAuth: () => boolean;
}
