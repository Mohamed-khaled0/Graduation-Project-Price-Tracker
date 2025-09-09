import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const heroData = {
  title: "Never Overpay Again!",
  description: "Real‑time price tracking across all your favorite electronics stores",
  buttonText: "Shop Now",
  buttonLink: "/shop",
  image: "/lovable-uploads/display.webp",
  bgColor: "bg-[#d0e0ec]",
};

const Hero = () => {
  return (
    <div className="relative w-full overflow-hidden">
      <div className={`min-w-full h-auto md:h-[450px] relative ${heroData.bgColor}`}>
        <div className="container mx-auto px-4 h-full flex flex-col md:flex-row items-center md:items-center relative">
          <div className="max-w-lg pr-0 md:pr-4 z-10 pt-8 md:pt-0">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gray-800 text-center md:text-left">{heroData.title}</h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 text-center md:text-left">{heroData.description}</p>
            <div className="flex justify-center md:justify-start">
              <Button 
                className="bg-[#39536f] hover:bg-[#2a405a] text-white px-8 py-6 mb-8 rounded-lg text-lg"
                asChild
              >
                <Link to={heroData.buttonLink}>{heroData.buttonText}</Link>
              </Button>
            </div>
          </div>
          {/* Responsive image: below text on md, absolute on lg+ */}
          <div className="hidden md:flex justify-end mt-6 md:mt-0 md:w-auto lg:absolute lg:right-10 lg:bottom-0">
            <img 
              src={heroData.image} 
              alt="Hero product" 
              width={260}
              height={260}
              loading="eager"
              className="max-h-[180px] md:max-h-[260px] lg:max-h-[400px] w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
