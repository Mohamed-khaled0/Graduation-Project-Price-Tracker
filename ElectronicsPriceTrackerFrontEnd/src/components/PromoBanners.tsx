import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const PromoBanners = () => {
  const navigate = useNavigate();

  const handleStartShopping = () => {
    navigate('/shop');
  };

  return (
    <div className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* First banner - Mega Sales */}
        <div className="bg-[#d0e0ec] rounded-lg mb-8">
          <div className="flex flex-col md:flex-row">
            <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Save Big on Tech Today</h2>
              <p className="text-gray-700 mb-6">
                Compare deals, set alerts, and buy at the absolute lowest price.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="bg-[#39536f] hover:bg-[#2a405a]"
                  onClick={handleStartShopping}
                >
                  Start Shopping
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 hidden md:flex items-end justify-end relative">
              <img 
                src="/lovable-uploads/iphoneHero.webp" 
                alt="Mega sales" 
                className="max-h-[180px] md:max-h-[200px] lg:max-h-[300px] object-contain"
              />
            </div>
          </div>
        </div>

        {/* Two-column banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Laptop Surface Pro banner */}
          <div className="bg-[#d0e0ec] rounded-lg overflow-hidden">
            <div className="p-8 relative">
              <div className="max-w-[60%]">
                <h3 className="text-2xl font-bold mb-2">Get the Best Deal, Every Time</h3>
                <p className="text-sm text-gray-700 mb-4">
                Live price updates & drop alerts so you never miss a bargain
                </p>
                <Button 
                  className="bg-[#39536f] hover:bg-[#2a405a]"
                  onClick={handleStartShopping}
                >
                  $699 Or Off
                </Button>
              </div>
              <img 
                src="/lovable-uploads/camera.webp" 
                alt="Laptop Surface Pro" 
                className="absolute right-0 bottom-0 max-h-[100px] md:max-h-[110px] lg:max-h-[160px] object-contain"
              />
            </div>
          </div>

          {/* HP Monitor banner */}
          <div className="bg-[#d0e0ec] rounded-lg overflow-hidden">
            <div className="p-8 relative">
              <div className="max-w-[60%]">
                <h3 className="text-2xl font-bold mb-2">Seasonal Price Drop</h3>
                <p className="text-sm text-gray-700 mb-4">
                Predictive AI flags today's lowest price—see what you save.
                </p>
                <Button 
                  className="bg-[#39536f] hover:bg-[#2a405a]"
                  onClick={handleStartShopping}
                >
                  Upto 50 Off
                </Button>
              </div>
              <img 
                src="/lovable-uploads/tablet.webp" 
                loading="lazy"
                alt="HP Monitor" 
                className="absolute right-0 bottom-0 max-h-[100px] md:max-h-[110px] lg:max-h-[160px] object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoBanners;
