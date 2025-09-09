import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/cart';
import { ProductData } from '@/pages/Shop'; // Or from types/product.ts

// ProductCardProps now strictly matches ProductData
interface ProductCardProps extends ProductData {}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  price,
  category,
  thumbnail,
  productUrl,
  platformName,
  platformLogoUrl,
}) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      id,
      title,
      price,
      category,
      thumbnail,
      productUrl,
      platformName,
    });
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full border-2 rounded-xl w-full max-w-[100%] sm:max-w-[280px] mx-auto">
      <Link to={`/product/${id}`} className="block w-full">
        <div className="relative w-full h-[140px] sm:h-[220px] md:h-[250px] overflow-hidden">
          <img
            src={thumbnail}
            alt={title}
            width={300}
            height={300}
            loading="lazy"
            className="w-full h-full object-contain p-0.5 sm:p-2 md:p-0 transition-transform hover:scale-105"
          />
        </div>
      </Link>

      <CardHeader className="p-2 sm:p-4 pb-0">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <Link to={`/product/${id}`}>
              <CardTitle className="text-sm sm:text-lg lg:text-xl hover:text-[#39536f] hover:underline line-clamp-2">{title}</CardTitle>
            </Link>
            <CardDescription className="text-xs sm:text-base mt-0.5 sm:mt-1 capitalize">{category || 'General'}</CardDescription>
          </div>
        </div>
        {(platformName || platformLogoUrl) && (
          <div className="mt-2 flex items-center space-x-2">
            {platformLogoUrl ? (
              <img src={platformLogoUrl} alt={platformName || 'Platform'} className="h-5 w-auto max-w-[70px] object-contain" />
            ) : null}
            {platformName && !platformLogoUrl && (
              <span className="text-sm text-gray-600">Sold on: {platformName}</span>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-2 sm:p-4">
        <p className="text-lg sm:text-xl font-bold text-[#39536f] mb-2">
          EGP {price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        {/* Full description removed */}
        {/* Price comparisons from other stores removed */}
      </CardContent>

      <CardFooter className="p-2 sm:p-4 pt-0 flex flex-col gap-2">
        <Button
          className="w-full gap-1 sm:gap-2 bg-[#39536f] hover:bg-[#2a405a] text-xs sm:text-base py-1.5 sm:py-3"
          onClick={handleAddToCart}
        >
          <ShoppingCart size={14} className="sm:w-5 sm:h-5" />
          <span>Add to Cart</span>
        </Button>
        {productUrl && (
          <a href={productUrl} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button
              variant="outline"
              className="w-full gap-2 text-[#39536f] border-[#39536f] hover:bg-[#39536f] hover:text-white text-xs sm:text-base py-1.5 sm:py-3"
            >
              <ExternalLink size={14} className="sm:w-5 sm:h-5" />
              View on {platformName || 'Store'}
            </Button>
          </a>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
