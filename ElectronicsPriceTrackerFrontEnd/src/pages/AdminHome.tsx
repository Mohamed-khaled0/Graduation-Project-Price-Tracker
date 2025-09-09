import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/auth';

export default function AdminHome() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    userCount: 0,
    productCount: 0,
    apiStatus: 'OK'
  });

  useEffect(() => {
    // Redirect if not admin
    if (user && !isAdmin) {
      navigate('/');
    }

    // TODO: Fetch actual stats from your API
    // This is just placeholder data
    setStats({
      userCount: 150,
      productCount: 1200,
      apiStatus: 'OK'
    });
  }, [user, isAdmin, navigate]);

  if (!user || !isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8 flex items-center">
          <Shield className="mr-2 h-7 w-7 text-purple-600" />
          Admin Dashboard
        </h1>

        <div className="min-h-[400px] max-w-4xl mx-auto mt-8 bg-white rounded-2xl shadow-lg p-10 flex flex-col justify-between">
          <div className="flex justify-between mb-10">
            <div>
              <Button variant="outline" className="text-lg mb-4 pointer-events-none cursor-default">
                API Status: {stats.apiStatus}
              </Button>
              <div className="rounded-xl border mt-4 p-8 text-center text-2xl">
                <Users className="mx-auto h-8 w-8 mb-2 text-purple-600" />
                Total Users
                <span className="font-bold text-4xl block mt-2">{stats.userCount}</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <Button variant="outline" className="text-lg mb-4 pointer-events-none cursor-default">
                Product Count
              </Button>
              <div className="rounded-xl border mt-4 p-8 text-center text-2xl">
                <Package className="mx-auto h-8 w-8 mb-2 text-purple-600" />
                Total Products
                <span className="font-bold text-4xl block mt-2">{stats.productCount}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              className="rounded-xl px-10 py-8 text-2xl"
              onClick={() => navigate('/admin/users')}
            >
              <Users className="mr-2 h-6 w-6" />
              User Management
            </Button>
            <Button
              variant="outline"
              className="rounded-xl px-10 py-8 text-2xl"
              onClick={() => navigate('/admin/products')}
            >
              <Package className="mr-2 h-6 w-6" />
              Product Management
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 