import React, { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { useAuthState, useAuthMethods, useAdminFunctions } from './hooks';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Get auth state (session, user, profile, roles)
  const { 
    session,
    user,
    profile,
    userRoles,
    isAdmin,
    loading: authStateLoading,
    setProfile
  } = useAuthState();

  // Get auth methods (signIn, signUp, etc)
  const {
    loading: authMethodsLoading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword
  } = useAuthMethods();

  // Get admin functions
  const {
    getUserList,
    deleteUser,
    blockUser,
    assignRole,
    removeRole
  } = useAdminFunctions();

  // Combine loading states
  const loading = authStateLoading || authMethodsLoading;

  const value = {
    session,
    user,
    profile,
    userRoles,
    isAdmin,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    loading,
    setProfile,
    // Admin functions
    getUserList,
    deleteUser,
    blockUser,
    assignRole,
    removeRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
