
import { Link } from 'react-router-dom';
import EmailLoginForm from './components/EmailLoginForm';

const LoginContainer = () => {
  return (
    <div className="container mx-auto px-4 py-10 flex flex-col md:flex-row">
      {/* Left Side - Form */}
      <div className="flex-1 md:pr-8">
        <h1 className="text-4xl font-bold mb-2">Log In</h1>
        <p className="text-lg text-gray-700 mb-8">
          Log Into Your Account And Enjoy A Faster Checkout.
        </p>
        
        <EmailLoginForm />
        
        <div className="text-center mt-6">
          <span className="text-gray-600">Don't Have An Account? </span>
          <Link to="/signup" className="text-[#0a0b0b] hover:underline font-medium">
            Sign Up
          </Link>
        </div>
      </div>
      
      {/* Right Side - Image */}
      <div className="hidden md:block flex-1 mt-10 md:mt-0">
        <div className="h-full rounded-3xl overflow-hidden bg-[#dbe7f0]">
          <img 
            src="/lovable-uploads/login.webp" 
            loading="lazy"
            alt="Modern tablet device" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginContainer;
