import React, { useRef, useEffect } from "react";
import "../scroll.css"; // We'll add CSS for no-scrollbar here

const brands = [
  { id: 1, name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
  { id: 2, name: "HP", logo: "https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg" },
  { id: 3, name: "Dell", logo: "https://upload.wikimedia.org/wikipedia/commons/1/18/Dell_logo_2016.svg" },
  { id: 4, name: "Lenovo", logo: "https://1000logos.net/wp-content/uploads/2017/03/Lenovo-Logo-768x432.png" },
  { id: 5, name: "Samsung", logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg" },
  { id: 6, name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
  { id: 7, name: "Noon", logo: "/lovable-uploads/noon.svg",},
  { id: 8, name: "Jumia", logo: "/lovable-uploads/Jumia.svg" },
];

const FeaturedBrands: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto scroll on hover
  const startScroll = () => {
    if (intervalRef.current || !containerRef.current) return;

    intervalRef.current = setInterval(() => {
      const container = containerRef.current!;
      container.scrollLeft += 1;
      if (container.scrollLeft >= container.scrollWidth / 2) {
        container.scrollLeft = 0;
      }
    }, 16);
  };

  const stopScroll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Duplicate brands to create infinite loop effect
  const loopedBrands = [...brands, ...brands];

  return (
    <div className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10">Featured Brands</h2>
        <div
          ref={containerRef}
          onMouseEnter={startScroll}
          onMouseLeave={stopScroll}
          className="scroll-container flex overflow-x-auto items-center space-x-8"
        >
          {loopedBrands.map((brand, index) => (
            <div key={`${brand.id}-${index}`} className="flex-shrink-0 w-24 md:w-32">
              <img
                src={brand.logo}
                alt={brand.name}
                loading="lazy"
                className="w-full h-auto object-contain max-h-16"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedBrands;
