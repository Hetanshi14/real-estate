import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('authUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUser = async () => {
    try {
      setAuthLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('AuthProvider: Session fetched:', { session: session ? 'exists' : 'null', sessionError });
      if (sessionError) {
        console.error('AuthProvider: Error fetching session:', sessionError);
        throw new Error(`Failed to fetch session: ${sessionError.message}`);
      }

      if (!session) {
        console.log('AuthProvider: No session found');
        setUser(null);
        localStorage.removeItem('authUser');
        if (location.pathname === '/profile') {
          console.log('AuthProvider: Redirecting to /login (no session for /profile)', { from: location.pathname });
          navigate('/login', { state: { from: location.pathname }, replace: true });
        }
        return;
      }
      const authContextValue = {
        user,
        authLoading,
        refreshUser,
        setUser, // Ensure this is included
      };
      const userInfo = {
        id: session.user.id,
        email: session.user.email,
        username: session.user.user_metadata?.username || session.user.email,
        role: session.user.user_metadata?.role || 'customer',
        needsProfile: false,
        developer_logo: session.user.user_metadata?.developer_logo || '',
        developer_image: session.user.user_metadata?.developer_image || '',
      };

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, username, email, role, developer_logo, developer_image')
        .eq('id', session.user.id)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        console.error('AuthProvider: Error fetching user data:', userError);
        throw new Error(`Failed to fetch user data: ${userError.message}`);
      }

      if (userData) {
        userInfo.username = userData.username || userInfo.username;
        userInfo.role = userData.role || userInfo.role;
        userInfo.developer_logo = userData.developer_logo || userInfo.developer_logo;
        userInfo.developer_image = userData.developer_image || userInfo.developer_image;
        userInfo.needsProfile = false;
      } else {
        userInfo.needsProfile = true;
        console.log('AuthProvider: User needs to complete profile:', userInfo);
      }

      setUser(userInfo);
      localStorage.setItem('authUser', JSON.stringify(userInfo));
      console.log('AuthProvider: User set:', userInfo);

      if (userInfo.needsProfile && location.pathname !== '/complete-profile') {
        console.log('AuthProvider: Redirecting to /complete-profile', { from: location.pathname });
        navigate('/complete-profile', { state: { from: location.pathname }, replace: true });
      }
    } catch (error) {
      console.error('AuthProvider: Error in fetchUser:', error);
      setUser(null);
      localStorage.removeItem('authUser');
      if (location.pathname === '/profile') {
        console.log('AuthProvider: Redirecting to /login due to error:', error.message, { from: location.pathname });
        navigate('/login', { state: { from: location.pathname }, replace: true });
      }
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AuthProvider: Auth state changed:', event, session);
      fetchUser();
    });
    return () => authListener.subscription?.unsubscribe?.();
  }, [navigate, location.pathname]);

  const refreshUser = async () => {
    setAuthLoading(true);
    try {
      await fetchUser();
    } catch (error) {
      console.error('AuthProvider: Error in refreshUser:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('AuthProvider: Sign out error:', error);
        throw new Error(`Failed to sign out: ${error.message}`);
      }
      setUser(null);
      localStorage.removeItem('authUser');
      console.log('AuthProvider: User signed out');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('AuthProvider: Error in signOut:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, authLoading, refreshUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;