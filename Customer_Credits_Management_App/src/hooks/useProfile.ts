import { useState, useEffect } from 'react';
import { UserProfile } from '../types/Customer';

const PROFILE_STORAGE_KEY = 'customer_credit_profile';

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    businessName: '',
    email: '',
    mobile: '',
    description: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load profile data:', error);
      }
    }
  }, []);

  const updateProfile = (updates: Partial<UserProfile>) => {
    const updatedProfile = { ...profile, ...updates };
    setProfile(updatedProfile);
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
  };

  return {
    profile,
    updateProfile
  };
};