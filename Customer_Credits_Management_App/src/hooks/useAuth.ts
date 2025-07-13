import { useState, useEffect } from 'react';
import { User, AuthState } from '../types/Customer';

const AUTH_STORAGE_KEY = 'customer_credit_auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true
  });

  useEffect(() => {
    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedAuth) {
      try {
        const user = JSON.parse(savedAuth);
        setAuthState({
          isAuthenticated: true,
          user,
          isLoading: false
        });
      } catch (error) {
        console.error('Failed to load auth data:', error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const loginWithEmail = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, accept any email/password combination
    const user: User = {
      id: Date.now().toString(),
      email,
      name: email.split('@')[0],
      authMethod: 'email'
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    setAuthState({
      isAuthenticated: true,
      user,
      isLoading: false
    });

    return true;
  };

  const loginWithMobile = async (mobile: string, otp: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, accept any mobile/OTP combination
    const user: User = {
      id: Date.now().toString(),
      mobile,
      name: `User ${mobile.slice(-4)}`,
      authMethod: 'mobile'
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    setAuthState({
      isAuthenticated: true,
      user,
      isLoading: false
    });

    return true;
  };

  const sendOTP = async (mobile: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false
    });
  };

  return {
    ...authState,
    loginWithEmail,
    loginWithMobile,
    sendOTP,
    logout
  };
};