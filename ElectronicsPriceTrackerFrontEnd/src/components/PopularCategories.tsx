import React from "react";
import { Link } from "react-router-dom";

const categories = [
  {
    id: 1,
    name: "Laptops",
    image: "/lovable-uploads/laptop.webp",
    link: "/shop?categories=laptops",
  },
  {
    id: 2,
    name: "Smartphones",
    image: "/lovable-uploads/smartphone.webp",
    link: "/shop?categories=phones",
  },
  {
    id: 3,
    name: "Cameras",
    image: "/lovable-uploads/camera.webp",
    link: "/shop?categories=cameras",
  },
  {
    id: 4,
    name: "Headphones",
    image: "/lovable-uploads/headphone.webp",
    link: "/shop?categories=headphones",
  },
  {
    id: 5,
    name: "Smart TV",
    image: "/lovable-uploads/display2.webp",
    link: "/shop?categories=tvs",
  },
  {
    id: 6,
    name: "Smart Watches",
    image: "/lovable-uploads/applewatch.webp",
    link: "/shop?categories=smart_watches",
  },
];

const PopularCategories = () => {
  return (
    <div className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10">Popular Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={category.link}
              className="group flex flex-col items-center"
            >
              <div className="bg-[#d0e0ec] rounded-lg p-4 mb-4 w-full aspect-square flex items-center justify-center overflow-hidden group-hover:bg-[#c0d5e8] transition-colors">
                <img
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <h3 className="text-center font-medium">{category.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularCategories;
