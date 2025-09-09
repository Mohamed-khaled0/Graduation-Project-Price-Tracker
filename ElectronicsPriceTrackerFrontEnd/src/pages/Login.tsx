
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoginContainer from '@/pages/auth/LoginContainer';
import { useAuth } from '@/contexts/auth';

const Login = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // If already logged in, redirect to homepage
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  // If not authenticated, show login page
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex">
        <LoginContainer />
      </main>
      <Footer />
    </div>
  );
};

export default Login;
