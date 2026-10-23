import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  isDemoUser: false,
  enableDemoMode: () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const isPlaceholderConfig = !supabaseUrl || 
    supabaseUrl.includes('placeholder.supabase.co') || 
    !import.meta.env.VITE_SUPABASE_ANON_KEY || 
    import.meta.env.VITE_SUPABASE_ANON_KEY === 'placeholder-anon-key';

  useEffect(() => {
    // Check if demo or local user flag was saved
    const demoActive = localStorage.getItem('docuvault-demo-mode') === 'true';
    const savedLocalUser = localStorage.getItem('docuvault-local-user');

    if (demoActive) {
      if (savedLocalUser) {
        try {
          setUser(JSON.parse(savedLocalUser));
        } catch {
          setUser({
            id: 'demo-user-12345678-abcd-ef01',
            email: 'alex.morgan@docuvault.dev',
            user_metadata: { full_name: 'Alex Morgan' },
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      } else {
        setUser({
          id: 'demo-user-12345678-abcd-ef01',
          email: 'alex.morgan@docuvault.dev',
          user_metadata: { full_name: 'Alex Morgan' },
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
      setIsDemoUser(true);
      setLoading(false);
      return;
    }

    // Initialize Supabase Auth listener if live credentials exist
    let mounted = true;

    async function initAuth() {
      if (isPlaceholderConfig) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Supabase getSession failed:', err);
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    if (!isPlaceholderConfig) {
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      });

      return () => {
        mounted = false;
        authListener?.subscription?.unsubscribe();
      };
    } else {
      setLoading(false);
    }
  }, [isPlaceholderConfig]);

  const signIn = async (email, password) => {
    if (isPlaceholderConfig) {
      const localUser = {
        id: 'local-user-' + Math.random().toString(36).substring(2, 9),
        email,
        user_metadata: { full_name: email.split('@')[0] },
        created_at: new Date().toISOString()
      };
      localStorage.setItem('docuvault-demo-mode', 'true');
      localStorage.setItem('docuvault-local-user', JSON.stringify(localUser));
      setUser(localUser);
      setIsDemoUser(true);
      return { user: localUser };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      localStorage.removeItem('docuvault-demo-mode');
      localStorage.removeItem('docuvault-local-user');
      setIsDemoUser(false);
      return data;
    } catch (err) {
      if (err.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to Supabase: Please check your VITE_SUPABASE_URL in frontend/.env or click "Explore Instant Demo Mode" below.');
      }
      throw err;
    }
  };

  const signUp = async (email, password, fullName) => {
    if (isPlaceholderConfig) {
      // Allow instant local sign-in with the user's custom name and email
      const localUser = {
        id: 'local-user-' + Math.random().toString(36).substring(2, 9),
        email,
        user_metadata: { full_name: fullName || email.split('@')[0] },
        created_at: new Date().toISOString()
      };
      localStorage.setItem('docuvault-demo-mode', 'true');
      localStorage.setItem('docuvault-local-user', JSON.stringify(localUser));
      setUser(localUser);
      setIsDemoUser(true);
      return { user: localUser };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });
      if (error) throw error;
      return data;
    } catch (err) {
      if (err.message?.includes('Failed to fetch')) {
        throw new Error('Cannot reach Supabase: Please configure your live Supabase project in frontend/.env or click "Explore Instant Demo Mode" below.');
      }
      throw err;
    }
  };

  const signOut = async () => {
    localStorage.removeItem('docuvault-demo-mode');
    localStorage.removeItem('docuvault-local-user');
    setIsDemoUser(false);
    setUser(null);
    setSession(null);

    if (!isPlaceholderConfig) {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('SignOut error:', error);
      }
    }
  };

  const resetPassword = async (email) => {
    if (isPlaceholderConfig) {
      return { message: 'Demo mode: password reset simulated.' };
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });
    if (error) throw error;
    return data;
  };

  const enableDemoMode = () => {
    const mockUser = {
      id: 'demo-user-12345678-abcd-ef01',
      email: 'alex.morgan@docuvault.dev',
      user_metadata: { full_name: 'Alex Morgan' },
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    localStorage.setItem('docuvault-demo-mode', 'true');
    localStorage.removeItem('docuvault-local-user');
    setUser(mockUser);
    setIsDemoUser(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        isDemoUser,
        enableDemoMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
