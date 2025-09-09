import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User } from 'lucide-react';
import { FcGoogle } from "react-icons/fc";
import { Separator } from "@/components/ui/separator";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { useAuth } from '@/contexts/auth';

const signupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupFormValues = z.infer<typeof signupSchema>;

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { signUp, signInWithGoogle, user, loading } = useAuth();
  const navigate = useNavigate();
  
  // If already logged in, redirect to homepage
  if (user) {
    navigate('/');
    return null;
  }
  
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: SignupFormValues) => {
    try {
      await signUp(values.email, values.password, values.username);
    } catch (error) {
      console.error('Signup error:', error);
      // Error is handled in the AuthContext
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign up error:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex">
        <div className="container mx-auto px-4 py-10 flex flex-col md:flex-row">
          {/* Left Side - Form */}
          <div className="flex-1 md:pr-8">
            <h1 className="text-4xl font-bold mb-2">Sign Up</h1>
            <p className="text-lg text-gray-700 mb-8">
              Create An Account And Enjoy Fast Easy Checkout, Order Tracking, And Loyalty Points.
            </p>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-[#39536f]">Username</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          placeholder="Enter username (max 2 words, 20 chars)"
                          className="w-full bg-gray-200 border-0 focus:outline-none focus:border-2 focus:border-[#d0e0ec]"
                          maxLength={20}
                          onChange={(e) => {
                            const value = e.target.value;
                            const words = value.trim().split(/\s+/);
                            
                            if (words.length > 2) {
                              toast.error("Username can only contain up to 2 words");
                              return;
                            }
                            
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-gray-500">
                        Maximum 2 words and 20 characters
                      </FormDescription>
                      <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-[#39536f]">Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          type="email"
                          placeholder="Insert Email Address Here"
                          className="w-full bg-gray-200 border-0 focus:outline-none focus:border-2 focus:border-[#d0e0ec]" 
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-[#39536f]">Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="****************"
                            className="w-full bg-gray-200 border-0 focus:outline-none focus:border-2 focus:border-[#d0e0ec] pr-10"
                          />
                        </FormControl>
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                        </button>
                      </div>
                      <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full py-6 bg-[#39536f] hover:bg-[#2a405a]"
                  disabled={loading}
                >
                  <User className="mr-2 h-5 w-5" /> {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or sign up with</span>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center justify-center gap-2 w-full py-5"
                  onClick={handleGoogleSignUp}
                  disabled={loading}
                >
                  <FcGoogle size={20} />
                  {loading ? 'Processing...' : 'Sign up with Google'}
                </Button>
                
                <div className="text-center">
                  <span className="text-gray-600">Already have an account? </span>
                  <Link to="/login" className="text-[#39536f] hover:underline font-medium">
                    Log In
                  </Link>
                </div>
              </form>
            </Form>
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
      </main>
      
      <Footer />
    </div>
  );
};

export default SignUp;
