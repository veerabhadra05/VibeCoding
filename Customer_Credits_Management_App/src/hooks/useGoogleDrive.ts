import { useState } from 'react';
import { Customer } from '../types/Customer';

export const useGoogleDrive = () => {
  const [isConnected, setIsConnected] = useState(() => {
    return localStorage.getItem('google_drive_connected') === 'true';
  });
  const [isLoading, setIsLoading] = useState(false);

  const connectToGoogleDrive = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate Google Drive connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsConnected(true);
      localStorage.setItem('google_drive_connected', 'true');
      return true;
    } catch (error) {
      console.error('Failed to connect to Google Drive:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const backupToGoogleDrive = async (data: Customer[]): Promise<boolean> => {
    if (!isConnected) {
      throw new Error('Not connected to Google Drive');
    }

    setIsLoading(true);
    try {
      // Simulate backup to Google Drive
      await new Promise(resolve => setTimeout(resolve, 3000));
      // Store backup timestamp
      localStorage.setItem('last_backup_time', new Date().toISOString());
      return true;
    } catch (error) {
      console.error('Failed to backup to Google Drive:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const restoreFromGoogleDrive = async (): Promise<Customer[]> => {
    if (!isConnected) {
      throw new Error('Not connected to Google Drive');
    }

    setIsLoading(true);
    try {
      // Simulate restore from Google Drive
      await new Promise(resolve => setTimeout(resolve, 3000));
      // Return mock data for demo - in real implementation, this would fetch from Google Drive
      const mockCloudData: Customer[] = [];
      return mockCloudData;
    } catch (error) {
      console.error('Failed to restore from Google Drive:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    localStorage.removeItem('google_drive_connected');
    localStorage.removeItem('last_backup_time');
  };

  const getLastBackupTime = (): string | null => {
    return localStorage.getItem('last_backup_time');
  };

  return {
    isConnected,
    isLoading,
    connectToGoogleDrive,
    backupToGoogleDrive,
    restoreFromGoogleDrive,
    disconnect,
    getLastBackupTime
  };
};