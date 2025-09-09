import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ExternalLink } from "lucide-react";
import { ProductData } from "./Shop";
import { useCart } from "@/contexts/cart";
import PriceForecastChart from "@/components/PriceForecastChart";

const fetchProductDetailAPI = async (id: string): Promise<ProductData> => {
  const res = await fetch(`/api/Product/${id}`);
  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(`Failed to fetch product details: ${res.status} ${errorData || res.statusText}`);
  }
  const backendData: any = await res.json();

  return {
    id: backendData.productId,
    title: backendData.name,
    category: backendData.category,
    thumbnail: backendData.imageUrl || 'https://via.placeholder.com/300?text=No+Image',
    price: backendData.currentPrice || 0,
    productUrl: backendData.productUrl,
    platformName: backendData.platformName,
    platformLogoUrl: backendData.platformLogoUrl,
  };
};

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();

  const { data: product, isLoading, error } = useQuery<ProductData, Error>({
    queryKey: ["productDetail", id],
    queryFn: () => fetchProductDetailAPI(id!),
    enabled: !!id,
  });

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading product details...</div>;
  }

  if (error || !product) {
    return <div className="text-red-600 text-center mt-10">Error: Product not found or failed to load. {error?.message}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-4 sm:py-6 md:py-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8">
          <div className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
            <Link to="/" className="hover:text-[#39536f]">Home</Link> {' > '}
            <Link to="/shop" className="hover:text-[#39536f]"> Shop</Link> {' > '}
            <Link to={`/shop?category=${product.category}`} className="hover:text-[#39536f]"> {product.category}</Link> {' > '}
            <span className="text-[#39536f]"> {product.title}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
            <div className="space-y-3 sm:space-y-4">
              <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="w-full h-36 sm:h-48 md:h-64 lg:h-80 object-contain p-4"
                />
              </div>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#39536f]">{product.title}</h1>
              
              {(product.platformName || product.platformLogoUrl) && (
                <div className="mt-2 flex items-center space-x-2">
                  {product.platformLogoUrl ? (
                    <img src={product.platformLogoUrl} alt={product.platformName || 'Platform'} className="h-6 w-auto max-w-[80px] object-contain" />
                  ) : null}
                  {product.platformName && !product.platformLogoUrl && (
                    <span className="text-md text-gray-600">Sold on: {product.platformName}</span>
                  )}
                </div>
              )}

              <div className="mt-4 sm:mt-6">
                <span className="text-xl sm:text-2xl font-bold text-[#39536f]">EGP {product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="mt-4 sm:mt-6">
                <h2 className="text-base sm:text-lg font-semibold">Category</h2>
                <p className="mt-2 text-sm sm:text-base text-gray-700 capitalize">{product.category}</p>
              </div>

              <div className="mt-6 sm:mt-8 flex flex-col gap-2 sm:gap-3">
                <Button
                  className="w-full gap-2 bg-[#39536f] hover:bg-[#2a405a] text-xs sm:text-base py-1.5 sm:py-3"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart size={14} className="sm:w-5 sm:h-5" />
                  <span>Add to Cart</span>
                </Button>
                {product.productUrl && (
                  <a href={product.productUrl} target="_blank" rel="noopener noreferrer">
                    <Button
                      variant="outline"
                      className="w-full gap-2 text-[#39536f] border-[#39536f] hover:bg-[#39536f] hover:text-white text-xs sm:text-base py-1.5 sm:py-3"
                    >
                       <ExternalLink size={14} className="sm:w-5 sm:h-5" />
                      View on {product.platformName || 'Store'}
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>

          <PriceForecastChart
            currentPrice={product.price}
            productName={product.title}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};
export default ProductDetail;
