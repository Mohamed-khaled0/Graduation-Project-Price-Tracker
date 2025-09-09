import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, User, ShoppingCart, LogOut, Settings, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/cart';
import { useAuth } from '@/contexts/auth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { getItemCount } = useCart();
  const { user, profile, signOut, userRoles, isAdmin, profileLoading } = useAuth();

  const cartItemCount = getItemCount();
  const isShopPage = location.pathname === '/shop';

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
    }
  };

  return (
    <div className="w-full">
      {/* Top Navigation Bar */}
      <div className="relative bg-white px-4 md:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Text Logo */}
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-2xl sm:text-3xl md:text-2xl font-bold tracking-tight">
              <span className="text-[#39536f]">H</span>
              <span className="text-[#6f7d95]">ardware</span>
              <span className="text-[#39536f]"> P</span>
              <span className="text-[#6f7d95]">rice</span>
              <span className="text-[#39536f]"> T</span>
              <span className="text-[#6f7d95]">racker</span>
            </h1>
          </Link>

          {/* Search Bar - Hidden on mobile and shop page */}
          {!isShopPage && (
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-3xl mx-4">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-[#6f7d95] rounded-2xl focus:outline-none text-base"
                  type="text"
                  placeholder="Search products, brands..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>
          )}

          {/* Login/User and Cart Buttons */}
          <div className="flex items-center gap-2">
            {user ? (
              profileLoading ? (
                <span className="animate-pulse text-gray-400 px-4 py-2">Loading...</span>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center bg-[#39536f] text-white rounded-full px-4 py-2 hover:bg-[#2a405a] transition-colors">
                      <Avatar className="w-7 h-7 mr-2">
                        <AvatarImage src={profile?.avatar_url || ''} alt={profile?.username || 'User'} />
                        <AvatarFallback>{profile?.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-base">
                        {profile?.username 
                          ? profile.username.length > 20 
                            ? profile.username.substring(0, 17) + '...'
                            : profile.username
                          : user.email?.split('@')[0]}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center">
                        <Settings className="mr-2 h-5 w-5" />
                        <span className="text-base">Profile Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin/users" className="flex items-center">
                          <Shield className="mr-2 h-5 w-5" />
                          <span className="text-base">Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                      <LogOut className="mr-2 h-5 w-5" />
                      <span className="text-base">Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            ) : (
              <Link to="/login">
                <button className="flex items-center bg-[#39536f] text-white rounded-full px-4 py-2 hover:bg-[#2a405a] transition-colors">
                  <User className="w-6 h-6 mr-2" />
                  <span className="font-medium text-base">Login</span>
                </button>
              </Link>
            )}
            <Link to="/cart">
              <button className="flex items-center bg-[#39536f] text-white rounded-full px-4 py-2 hover:bg-[#2a405a] transition-colors">
                <ShoppingCart className="w-6 h-6 mr-2" />
                <span className="font-medium text-base">Wish List ({cartItemCount})</span>
              </button>
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-[#39536f] focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile search - Hidden on shop page */}
          {!isShopPage && (
            <form onSubmit={handleSearch} className="md:hidden w-full mt-2">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  className="w-full pl-10 pr-4 py-2 border-2 border-[#6f7d95] rounded-2xl focus:outline-none text-base"
                  type="text"
                  placeholder="Search products, brands, categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="bg-[#39536f] px-4 md:px-8">
        {/* Desktop menu */}
        <div className="hidden md:flex max-w-7xl mx-auto">
          <nav className="flex">
            <Link to="/" className="text-white font-semibold text-base px-5 py-3 hover:bg-[#2a405a] transition-colors">Home</Link>
            <Link to="/shop" className="text-white font-semibold text-base px-5 py-3 hover:bg-[#2a405a] transition-colors">Shop</Link>
            <Link to="/about" className="text-white font-semibold text-base px-5 py-3 hover:bg-[#2a405a] transition-colors">About Us</Link>
            <Link to="/contact" className="text-white font-semibold text-base px-5 py-3 hover:bg-[#2a405a] transition-colors">Contact Us</Link>
            {isAdmin && (
              <Link to="/admin/users" className="text-white font-semibold text-base px-5 py-3 hover:bg-[#2a405a] transition-colors bg-purple-700">
                Admin
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={cn(
          "md:hidden bg-[#2a405a] transition-all duration-300 ease-in-out overflow-hidden",
          isMenuOpen ? "max-h-60" : "max-h-0"
        )}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link to="/" className="text-white block px-3 py-2 font-semibold text-base hover:bg-[#39536f] rounded-md">Home</Link>
          <Link to="/shop" className="text-white block px-3 py-2 font-semibold text-base hover:bg-[#39536f] rounded-md">Shop</Link>
          <Link to="/about" className="text-white block px-3 py-2 font-semibold text-base hover:bg-[#39536f] rounded-md">About Us</Link>
          <Link to="/contact" className="text-white block px-3 py-2 font-semibold text-base hover:bg-[#39536f] rounded-md">Contact Us</Link>
          {user && (
            <Link to="/profile" className="text-white block px-3 py-2 font-semibold text-base hover:bg-[#39536f] rounded-md">Profile</Link>
          )}
          {isAdmin && (
            <Link to="/admin/users" className="text-white block px-3 py-2 font-semibold text-base hover:bg-[#39536f] rounded-md bg-purple-700">Admin</Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
