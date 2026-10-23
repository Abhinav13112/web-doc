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

  useEffect(() => {
    // Check if demo user flag was saved
    const demoActive = localStorage.getItem('docuvault-demo-mode') === 'true';
    if (demoActive) {
      setUser({
        id: 'demo-user-12345678-abcd-ef01',
        email: 'alex.morgan@docuvault.dev',
        user_metadata: { full_name: 'Alex Morgan' },
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      setIsDemoUser(true);
      setLoading(false);
      return;
    }

    // Initialize Supabase Auth listener
    let mounted = true;

    async function initAuth() {
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

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    localStorage.removeItem('docuvault-demo-mode');
    setIsDemoUser(false);
    return data;
  };

  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    if (isDemoUser) {
      localStorage.removeItem('docuvault-demo-mode');
      setIsDemoUser(false);
      setUser(null);
      setSession(null);
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) console.error('SignOut error:', error);
    setUser(null);
    setSession(null);
  };

  const resetPassword = async (email) => {
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
