<<<<<<< HEAD
import { LogIn } from 'lucide-react';
=======

import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
>>>>>>> 8be7c0daf31c446fd39bc8eecd55d8ffb02280b7
import EmailLoginForm from './EmailLoginForm';

const LoginTabs = () => {
  return (
<<<<<<< HEAD
    <div>
      <div className="flex items-center gap-2 mb-6">
        <LogIn className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Sign in with Email</h2>
      </div>
=======
    <div className="w-full">
>>>>>>> 8be7c0daf31c446fd39bc8eecd55d8ffb02280b7
      <EmailLoginForm />
    </div>
  );
};

export default LoginTabs;
