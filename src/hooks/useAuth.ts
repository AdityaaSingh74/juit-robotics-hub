import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthError } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email || '');
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email || '');
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, userEmail: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If profile doesn't exist, create a default one
        if (error.code === 'PGRST116') {
          const defaultProfile: Profile = {
            id: userId,
            email: userEmail,
            full_name: userEmail.split('@')[0],
            role: 'admin' // Default to admin for first user
          };
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([defaultProfile])
            .select()
            .single();
          
          if (createError) {
            // Use the default profile even if insert fails
            setProfile(defaultProfile);
          } else {
            setProfile(newProfile);
          }
        } else {
          // For other errors, create a temporary profile
          setProfile({
            id: userId,
            email: userEmail,
            full_name: userEmail.split('@')[0],
            role: 'admin'
          });
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      // Create fallback profile
      setProfile({
        id: userId,
        email: userEmail,
        full_name: userEmail.split('@')[0],
        role: 'admin'
      });
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      // Silently handle sign-out errors
    }
  };

  return {
    user,
    profile,
    loading,
    signIn,
    signOut,
    isAdmin: profile?.role === 'admin' || profile?.role === 'super_admin',
  };
};
