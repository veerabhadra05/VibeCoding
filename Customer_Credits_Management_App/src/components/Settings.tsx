import React, { useRef, useState } from 'react';
import { Download, Upload, Trash2, Cloud, CloudOff, Loader, User, LogOut, Save } from 'lucide-react';
import { UserProfile } from '../types/Customer';
import { formatDateTime } from '../utils/dateUtils';
import NotificationSettings from './NotificationSettings';

interface SettingsProps {
  onExportData: () => void;
  onImportData: (file: File) => Promise<void>;
  onClearData: () => void;
  onBackupToCloud: () => Promise<void>;
  onRestoreFromCloud: () => Promise<void>;
  onConnectGoogleDrive: () => Promise<void>;
  isGoogleDriveConnected: boolean;
  isCloudLoading: boolean;
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onLogout: () => void;
  notificationPermission: NotificationPermission;
  notificationSettings: {
    enabled: boolean;
    reminderDays: number;
    overdueReminders: boolean;
    weeklyReports: boolean;
  };
  onRequestNotificationPermission: () => Promise<boolean>;
  onUpdateNotificationSettings: (settings: any) => void;
  onTestNotification: () => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  onExportData, 
  onImportData, 
  onClearData,
  onBackupToCloud,
  onRestoreFromCloud,
  onConnectGoogleDrive,
  isGoogleDriveConnected,
  isCloudLoading,
  profile,
  onUpdateProfile,
  onLogout,
  notificationPermission,
  notificationSettings,
  onRequestNotificationPermission,
  onUpdateNotificationSettings,
  onTestNotification
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'data' | 'cloud'>('profile');
  const [profileForm, setProfileForm] = useState(profile);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsImporting(true);
      try {
        await onImportData(file);
        alert('Data imported and merged successfully!');
      } catch (error) {
        alert('Failed to import data. Please check the file format.');
      } finally {
        setIsImporting(false);
        // Reset the input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      onClearData();
      alert('All data has been cleared.');
    }
  };

  const handleBackupToCloud = async () => {
    try {
      await onBackupToCloud();
      alert('Data backed up to Google Drive successfully!');
    } catch (error) {
      alert('Failed to backup data to Google Drive.');
    }
  };

  const handleRestoreFromCloud = async () => {
    if (window.confirm('This will merge data from Google Drive with your current data. Continue?')) {
      try {
        await onRestoreFromCloud();
        alert('Data restored and merged from Google Drive successfully!');
      } catch (error) {
        alert('Failed to restore data from Google Drive.');
      }
    }
  };

  const handleSaveProfile = () => {
    onUpdateProfile(profileForm);
    alert('Profile updated successfully!');
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setProfileForm(prev => ({ ...prev, mobile: value }));
  };

  const getLastBackupTime = () => {
    const lastBackup = localStorage.getItem('last_backup_time');
    return lastBackup ? formatDateTime(lastBackup) : 'Never';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h1 className="text-xl font-bold text-white">Settings</h1>
          <p className="text-blue-100 text-sm">Manage your profile, notifications, data and app preferences</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'profile'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('cloud')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'cloud'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Cloud Backup
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'data'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Data
          </button>
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center mb-6">
            <User className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Information</h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter your name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={profileForm.businessName}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, businessName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter business name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={profileForm.mobile}
                  onChange={handleMobileChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={profileForm.description}
                onChange={(e) => setProfileForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter description about your business"
              />
            </div>

            <button
              onClick={handleSaveProfile}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <NotificationSettings
          permission={notificationPermission}
          settings={notificationSettings}
          onRequestPermission={onRequestNotificationPermission}
          onUpdateSettings={onUpdateNotificationSettings}
          onTestNotification={onTestNotification}
        />
      )}

      {/* Google Drive Integration Tab */}
      {activeTab === 'cloud' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Google Drive Backup</h2>
          
          <div className="space-y-4">
            {/* Connect to Google Drive */}
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100">Google Drive Connection</h3>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  {isGoogleDriveConnected ? 'Connected to Google Drive' : 'Connect to backup your data to Google Drive'}
                </p>
              </div>
              <button
                onClick={onConnectGoogleDrive}
                disabled={isCloudLoading}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                  isGoogleDriveConnected
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isCloudLoading ? (
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                ) : isGoogleDriveConnected ? (
                  <Cloud className="w-4 h-4 mr-2" />
                ) : (
                  <CloudOff className="w-4 h-4 mr-2" />
                )}
                {isGoogleDriveConnected ? 'Connected' : 'Connect'}
              </button>
            </div>

            {/* Manual Backup and Restore Options */}
            {isGoogleDriveConnected && (
              <>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Manual Backup</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Manually backup your data to Google Drive
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Last backup: {getLastBackupTime()}
                    </p>
                  </div>
                  <button
                    onClick={handleBackupToCloud}
                    disabled={isCloudLoading}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCloudLoading ? (
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    Backup Now
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Restore from Google Drive</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Merge data from Google Drive backup with current data</p>
                  </div>
                  <button
                    onClick={handleRestoreFromCloud}
                    disabled={isCloudLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCloudLoading ? (
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Restore
                  </button>
                </div>
              </>
            )}

            {/* Connection Status Info */}
            {!isGoogleDriveConnected && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <h3 className="font-medium text-amber-900 dark:text-amber-100 mb-2">📋 Cloud Backup Benefits</h3>
                <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                  <li>• Access your data from any device</li>
                  <li>• Automatic backup protection</li>
                  <li>• Restore data after device changes</li>
                  <li>• Secure cloud storage with Google Drive</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Local Data Management Tab */}
      {activeTab === 'data' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Local Data Management</h2>
          
          <div className="space-y-4">
            {/* Export Data */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Export Data</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Download your customer data as a JSON file</p>
              </div>
              <button
                onClick={onExportData}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>

            {/* Import Data */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Import Data</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upload a JSON file to merge with your current data</p>
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isImporting ? (
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Import
                </button>
              </div>
            </div>

            {/* Clear Data */}
            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div>
                <h3 className="font-medium text-red-900 dark:text-red-100">Clear All Data</h3>
                <p className="text-sm text-red-600 dark:text-red-300">This will permanently delete all customer data</p>
              </div>
              <button
                onClick={handleClearData}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* App Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">App Information</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Version</span>
            <span className="font-medium text-gray-900 dark:text-white">1.0.0</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Data Storage</span>
            <span className="font-medium text-gray-900 dark:text-white">Local + Cloud</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Notifications</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {notificationSettings.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Last Updated</span>
            <span className="font-medium text-gray-900 dark:text-white">{formatDateTime(new Date().toISOString())}</span>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <button
          onClick={onLogout}
          className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center font-medium"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Log Out
        </button>
      </div>

      {/* Tips */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
        <h3 className="font-medium text-amber-900 dark:text-amber-100 mb-2">💡 Tips</h3>
        <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
          <li>• Enable notifications to never miss payment due dates</li>
          <li>• Set reminder days based on your payment cycle preferences</li>
          <li>• Weekly reports help you stay on top of your finances</li>
          <li>• Notifications work even when the browser is closed on mobile</li>
          <li>• Add the app to your home screen for the best mobile experience</li>
          <li>• Use the same login method to access your data on different devices</li>
          <li>• Click on phone numbers to call and email addresses to send emails</li>
          <li>• Click on photos to view them in full size</li>
        </ul>
      </div>
    </div>
  );
};

export default Settings;