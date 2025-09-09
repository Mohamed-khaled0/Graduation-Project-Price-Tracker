import { User, Session } from '@supabase/supabase-js';
import { AppRole, Profile } from './user-types';
import { UserWithRole } from './admin-types';

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
  userRoles: AppRole[];
  isAdmin: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loading: boolean;
  profileLoading: boolean;
  // Admin functions
  getUserList: () => Promise<UserWithRole[]>;
  deleteUser: (userId: string) => Promise<void>;
  blockUser: (userId: string, isBlocked: boolean) => Promise<void>;
  assignRole: (userId: string, role: AppRole) => Promise<void>;
  removeRole: (userId: string, role: AppRole) => Promise<void>;
}
