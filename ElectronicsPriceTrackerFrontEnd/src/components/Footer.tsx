import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#e6eef1] py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo and Description */}
          <div className="col-span-1">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-2xl md:text-xl font-bold tracking-tight">
              <span className="text-[#39536f]">H</span>
              <span className="text-[#6f7d95]">ardware</span>
                <span className="text-[#39536f]"> P</span>
                <span className="text-[#6f7d95]">rice</span>
                <span className="text-[#39536f]"> T</span>
                <span className="text-[#6f7d95]">racker</span>
              </h1>
            </Link>
            <p className="text-sm text-gray-700 mb-2">
            Hardware Price Tracker helps you track electronics prices across Egypt's top stores.
            </p>
          </div>

          {/* Categories */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li><Link to="/smartphones" className="hover:text-navy hover:underline">Smartphones</Link></li>
              <li><Link to="/laptops" className="hover:text-navy hover:underline">Laptops</Link></li>
              <li><Link to="/tvs" className="hover:text-navy hover:underline">Televisions</Link></li>
              <li><Link to="/accessories" className="hover:text-navy hover:underline">Accessories</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-navy hover:underline">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-navy hover:underline">Contact Us</Link></li>
              <li><Link to="/privacy" className="hover:text-navy hover:underline">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-navy hover:underline">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-10 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Hardware Price Tracker. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
