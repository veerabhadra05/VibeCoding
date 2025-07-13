import React from 'react';
import { Bell, BellOff, Clock, Calendar, AlertTriangle, BarChart3 } from 'lucide-react';

interface NotificationSettingsProps {
  permission: NotificationPermission;
  settings: {
    enabled: boolean;
    reminderDays: number;
    overdueReminders: boolean;
    weeklyReports: boolean;
  };
  onRequestPermission: () => Promise<boolean>;
  onUpdateSettings: (settings: any) => void;
  onTestNotification: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  permission,
  settings,
  onRequestPermission,
  onUpdateSettings,
  onTestNotification
}) => {
  const handleEnableNotifications = async () => {
    const granted = await onRequestPermission();
    if (granted) {
      onUpdateSettings({ enabled: true });
    }
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { color: 'text-green-600 dark:text-green-400', text: 'Granted' };
      case 'denied':
        return { color: 'text-red-600 dark:text-red-400', text: 'Denied' };
      default:
        return { color: 'text-amber-600 dark:text-amber-400', text: 'Not Requested' };
    }
  };

  const permissionStatus = getPermissionStatus();

  return (
    <div className="space-y-6">
      {/* Permission Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Browser Notifications</h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            permission === 'granted' 
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              : permission === 'denied'
              ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
          }`}>
            {permissionStatus.text}
          </span>
        </div>

        {permission !== 'granted' ? (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Enable browser notifications to receive payment reminders and overdue alerts even when the app is closed.
            </p>
            
            {permission === 'denied' ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200 text-sm">
                  <strong>Notifications are blocked.</strong> To enable them:
                </p>
                <ul className="text-red-700 dark:text-red-300 text-sm mt-2 space-y-1">
                  <li>• Click the lock/notification icon in your browser's address bar</li>
                  <li>• Select "Allow" for notifications</li>
                  <li>• Refresh the page and try again</li>
                </ul>
              </div>
            ) : (
              <button
                onClick={handleEnableNotifications}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Bell className="w-4 h-4 mr-2" />
                Enable Notifications
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg mr-3 ${
                  settings.enabled 
                    ? 'bg-green-100 dark:bg-green-900' 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  {settings.enabled ? (
                    <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <BellOff className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Payment Reminders
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {settings.enabled ? 'Active' : 'Disabled'}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => onUpdateSettings({ enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {settings.enabled && (
              <button
                onClick={onTestNotification}
                className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
              >
                Send Test Notification
              </button>
            )}
          </div>
        )}
      </div>

      {/* Notification Settings */}
      {permission === 'granted' && settings.enabled && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notification Preferences</h3>
          
          <div className="space-y-6">
            {/* Reminder Days */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Due Date Reminders</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified {settings.reminderDays} days before payments are due
                  </p>
                </div>
              </div>
              <select
                value={settings.reminderDays}
                onChange={(e) => onUpdateSettings({ reminderDays: parseInt(e.target.value) })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={1}>1 day</option>
                <option value={2}>2 days</option>
                <option value={3}>3 days</option>
                <option value={5}>5 days</option>
                <option value={7}>1 week</option>
              </select>
            </div>

            {/* Overdue Reminders */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Overdue Alerts</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified about overdue payments and long-pending receivables
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.overdueReminders}
                  onChange={(e) => onUpdateSettings({ overdueReminders: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Weekly Reports */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Weekly Reports</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get a weekly summary of your financial status every Sunday
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.weeklyReports}
                  onChange={(e) => onUpdateSettings({ weeklyReports: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-3">📱 How Mobile Notifications Work</h3>
        <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-2">
          <li>• <strong>Browser Notifications:</strong> Work on all devices with modern browsers</li>
          <li>• <strong>Mobile Support:</strong> Notifications appear even when browser is closed</li>
          <li>• <strong>Add to Home Screen:</strong> Install as PWA for better mobile experience</li>
          <li>• <strong>Smart Timing:</strong> Reminders sent at optimal times to avoid spam</li>
          <li>• <strong>Privacy First:</strong> All data stays on your device, no external servers</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationSettings;