import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FcGoogle } from "react-icons/fc";
import { Separator } from "@/components/ui/separator";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/contexts/auth';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const EmailLoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signInWithGoogle, loading } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await signIn(values.email, values.password);
    } catch (error) {
      console.error('Login error:', error);
      // Error is handled in the AuthContext
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign in error:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium text-[#39536f]">Email Address</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
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
        
        <div className="text-right">
          <Link to="/forgot-password" className="text-gray-600 hover:text-[#39536f] hover:underline">
            Lost Your Password?
          </Link>
        </div>
        
        <Button 
          type="submit" 
          className="w-full py-6 bg-[#39536f] hover:bg-[#2a405a]"
          disabled={loading}
        >
          <LogIn className="mr-2 h-5 w-5" /> {loading ? 'Logging in...' : 'Log In'}
        </Button>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or continue with</span>
          </div>
        </div>
        
        <Button
          type="button"
          variant="outline"
          className="flex items-center justify-center gap-2 w-full py-5"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <FcGoogle size={20} />
          {loading ? 'Processing...' : 'Sign in with Google'}
        </Button>
      </form>
    </Form>
  );
};

export default EmailLoginForm;
