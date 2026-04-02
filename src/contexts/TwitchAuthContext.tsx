import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  profile_image_url: string;
}

interface TwitchAuthContextType {
  user: TwitchUser | null;
  token: string | null;
  login: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const TwitchAuthContext = createContext<TwitchAuthContextType | undefined>(undefined);

export function TwitchAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TwitchUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Load from localStorage on mount
    const storedToken = localStorage.getItem('twitch_token');
    const storedUser = localStorage.getItem('twitch_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    // Listen for OAuth success message from popup
    const handleMessage = (event: MessageEvent) => {
      // Validate origin is from AI Studio preview or localhost
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const { token, user } = event.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('twitch_token', token);
        localStorage.setItem('twitch_user', JSON.stringify(user));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const login = async () => {
    try {
      const response = await fetch('/api/auth/url');
      if (!response.ok) {
        throw new Error('Failed to get auth URL');
      }
      const { url } = await response.json();

      const authWindow = window.open(
        url,
        'oauth_popup',
        'width=600,height=700'
      );

      if (!authWindow) {
        alert('يرجى السماح بالنوافذ المنبثقة لهذا الموقع لربط حسابك.');
      }
    } catch (error) {
      console.error('OAuth error:', error);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('twitch_token');
    localStorage.removeItem('twitch_user');
  };

  return (
    <TwitchAuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!token && !!user
    }}>
      {children}
    </TwitchAuthContext.Provider>
  );
}

export function useTwitchAuth() {
  const context = useContext(TwitchAuthContext);
  if (context === undefined) {
    throw new Error('useTwitchAuth must be used within a TwitchAuthProvider');
  }
  return context;
}
