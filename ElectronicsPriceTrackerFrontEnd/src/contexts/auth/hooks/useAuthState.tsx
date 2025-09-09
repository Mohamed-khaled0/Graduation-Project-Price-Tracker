import { useState, useEffect, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AppRole, Profile } from '../types';
import { toast } from 'sonner';
import { fetchUserProfile, fetchUserRoles } from '../authUtils';

export const useAuthState = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRoles, setUserRoles] = useState<AppRole[]>(['user']);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const prevSession = useRef<Session | null>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setProfile(null);
        setProfileLoading(true);
        
        if (newSession?.user) {
          setTimeout(() => {
            setProfileLoading(true);
            fetchUserProfile(newSession.user.id).then(profileData => {
              if (profileData) {
                setProfile(profileData);
              } else {
                setProfile(null);
              }
              setProfileLoading(false);
            });
          }, 0);
        } else {
          setProfile(null);
          setUserRoles(['user']);
          setIsAdmin(false);
          setProfileLoading(false);
        }

        // Only show toast for sign out
        if (event === 'SIGNED_OUT') {
          toast.info('You have been signed out');
        }
        prevSession.current = newSession;
      }
    );

    // Check for existing session (do not show toast here)
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      setProfile(null);
      setProfileLoading(true);
      if (existingSession?.user) {
        fetchUserProfile(existingSession.user.id).then(profileData => {
          if (profileData) {
            setProfile(profileData);
          } else {
            setProfile(null);
          }
          setProfileLoading(false);
        });
      } else {
        setProfileLoading(false);
      }
      setLoading(false);
      prevSession.current = existingSession;
      isInitialLoad.current = false;
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // React to profile changes for roles and blocked status
  useEffect(() => {
    if (profile && user) {
      // Set roles from profile, default to ['user']
      const roles = Array.isArray(profile.roles) && profile.roles.length > 0 ? profile.roles : ['user'];
      setUserRoles(roles as AppRole[]);
      setIsAdmin((roles as AppRole[]).includes('admin'));
      // Blocked user: sign out and show toast
      if (profile.blocked) {
        toast.error('Your account has been blocked. Please contact support.');
        supabase.auth.signOut();
      }
    } else {
      setUserRoles(['user']);
      setIsAdmin(false);
    }
  }, [profile, user]);

  return {
    session,
    user,
    profile,
    userRoles,
    isAdmin,
    loading,
    setProfile,
    profileLoading,
  };
};
