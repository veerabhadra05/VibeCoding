import React, { useState, useEffect } from 'react';
import { useCustomers } from './hooks/useCustomers';
import { useCreditors } from './hooks/useCreditors';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { useGoogleDrive } from './hooks/useGoogleDrive';
import { useProfile } from './hooks/useProfile';
import { useNotifications } from './hooks/useNotifications';
import { useSupabase } from './hooks/useSupabase';
import { Customer, CustomerFormData, Transaction, Creditor, CreditorFormData, Payable, Payment } from './types/Customer';
import AuthScreen from './components/AuthScreen';
import DatabaseSetup from './components/DatabaseSetup';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import CustomerForm from './components/CustomerForm';
import CustomerList from './components/CustomerList';
import CustomerDetail from './components/CustomerDetail';
import CreditorForm from './components/CreditorForm';
import CreditorList from './components/CreditorList';
import CreditorDetail from './components/CreditorDetail';
import Settings from './components/Settings';

function App() {
  const { isAuthenticated, user, isLoading, loginWithEmail, loginWithMobile, sendOTP, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { profile, updateProfile } = useProfile();
  const { isConnected: isDatabaseConnected, isLoading: isDatabaseLoading, migrateLocalData } = useSupabase();
  const [showDatabaseSetup, setShowDatabaseSetup] = useState(false);
  const {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addTransaction,
    deleteTransaction,
    addPayment: addCustomerPayment,
    markTransactionPaid,
    exportData,
    importData,
    setCustomers,
    mergeCloudData
  } = useCustomers();
  const {
    creditors,
    addCreditor,
    updateCreditor,
    deleteCreditor,
    addPayable,
    deletePayable,
    addPayment: addCreditorPayment,
    markPayablePaid,
    exportCreditorData,
    importCreditorData,
    setCreditors,
    mergeCloudCreditorData
  } = useCreditors();
  const {
    isConnected: isGoogleDriveConnected,
    isLoading: isCloudLoading,
    connectToGoogleDrive,
    backupToGoogleDrive,
    restoreFromGoogleDrive
  } = useGoogleDrive();
  const {
    permission: notificationPermission,
    settings: notificationSettings,
    requestPermission: requestNotificationPermission,
    updateSettings: updateNotificationSettings,
    scheduleNotifications,
    sendNotification
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedCreditor, setSelectedCreditor] = useState<Creditor | null>(null);
  const [addType, setAddType] = useState<'customer' | 'creditor'>('customer');

  // Check if we should show database setup
  useEffect(() => {
    if (isAuthenticated && isDatabaseConnected && !localStorage.getItem('database_setup_complete')) {
      setShowDatabaseSetup(true);
    }
  }, [isAuthenticated, isDatabaseConnected]);

  // Schedule notifications when data changes
  useEffect(() => {
    if (isAuthenticated && notificationSettings.enabled) {
      scheduleNotifications(customers, creditors);
    }
  }, [customers, creditors, notificationSettings.enabled, isAuthenticated]);

  // Show loading screen while checking authentication or database
  if (isLoading || isDatabaseLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {isLoading ? 'Loading...' : 'Connecting to database...'}
          </p>
        </div>
      </div>
    );
  }

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthScreen
        onEmailLogin={loginWithEmail}
        onMobileLogin={loginWithMobile}
        onSendOTP={sendOTP}
        isLoading={isLoading}
      />
    );
  }

  // Show database setup if needed
  if (showDatabaseSetup) {
    return (
      <DatabaseSetup
        onComplete={() => {
          localStorage.setItem('database_setup_complete', 'true');
          setShowDatabaseSetup(false);
        }}
      />
    );
  }

  const handleAddCustomer = (formData: CustomerFormData) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      amount: formData.billAmount,
      date: formData.transactionDate,
      status: 'unpaid',
      billPhoto: formData.billPhoto,
      description: formData.description || 'Initial bill',
      payments: []
    };

    const customerData = {
      name: formData.name,
      mobile: formData.mobile,
      email: formData.email,
      photo: formData.photo,
      address: {
        street: formData.street,
        city: formData.city
      },
      transactions: [newTransaction]
    };

    addCustomer(customerData);
    setActiveTab('customers');
  };

  const handleAddCreditor = (formData: CreditorFormData) => {
    const newPayable: Payable = {
      id: Date.now().toString(),
      amount: formData.billAmount,
      date: formData.transactionDate,
      dueDate: formData.dueDate,
      status: 'unpaid',
      billPhoto: formData.billPhoto,
      description: formData.description || 'Initial bill',
      category: formData.payableCategory,
      payments: []
    };

    const creditorData = {
      name: formData.name,
      mobile: formData.mobile,
      email: formData.email,
      photo: formData.photo,
      address: {
        street: formData.street,
        city: formData.city
      },
      payables: [newPayable],
      category: formData.category
    };

    addCreditor(creditorData);
    setActiveTab('creditors');
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const handleCreditorSelect = (creditor: Creditor) => {
    setSelectedCreditor(creditor);
  };

  const handleBackToCustomerList = () => {
    setSelectedCustomer(null);
  };

  const handleBackToCreditorList = () => {
    setSelectedCreditor(null);
  };

  const handleMarkTransactionPaid = (customerId: string, transactionId: string) => {
    markTransactionPaid(customerId, transactionId);
    // Update selected customer if it's the one being modified
    if (selectedCustomer && selectedCustomer.id === customerId) {
      const updatedCustomer = customers.find(c => c.id === customerId);
      if (updatedCustomer) {
        setSelectedCustomer(updatedCustomer);
      }
    }
  };

  const handleMarkPayablePaid = (creditorId: string, payableId: string) => {
    markPayablePaid(creditorId, payableId);
    // Update selected creditor if it's the one being modified
    if (selectedCreditor && selectedCreditor.id === creditorId) {
      const updatedCreditor = creditors.find(c => c.id === creditorId);
      if (updatedCreditor) {
        setSelectedCreditor(updatedCreditor);
      }
    }
  };

  const handleAddTransaction = (customerId: string, transaction: Omit<Transaction, 'id'>) => {
    addTransaction(customerId, transaction);
    // Update selected customer
    const updatedCustomer = customers.find(c => c.id === customerId);
    if (updatedCustomer) {
      setSelectedCustomer(updatedCustomer);
    }
  };

  const handleAddPayable = (creditorId: string, payable: Omit<Payable, 'id'>) => {
    addPayable(creditorId, payable);
    // Update selected creditor
    const updatedCreditor = creditors.find(c => c.id === creditorId);
    if (updatedCreditor) {
      setSelectedCreditor(updatedCreditor);
    }
  };

  const handleDeleteTransaction = (customerId: string, transactionId: string) => {
    deleteTransaction(customerId, transactionId);
    // Update selected customer
    const updatedCustomer = customers.find(c => c.id === customerId);
    if (updatedCustomer) {
      setSelectedCustomer(updatedCustomer);
    }
  };

  const handleDeletePayable = (creditorId: string, payableId: string) => {
    deletePayable(creditorId, payableId);
    // Update selected creditor
    const updatedCreditor = creditors.find(c => c.id === creditorId);
    if (updatedCreditor) {
      setSelectedCreditor(updatedCreditor);
    }
  };

  const handleAddCustomerPayment = (customerId: string, transactionId: string, payment: Omit<Payment, 'id'>) => {
    addCustomerPayment(customerId, transactionId, payment);
    // Update selected customer
    const updatedCustomer = customers.find(c => c.id === customerId);
    if (updatedCustomer) {
      setSelectedCustomer(updatedCustomer);
    }
  };

  const handleAddCreditorPayment = (creditorId: string, payableId: string, payment: Omit<Payment, 'id'>) => {
    addCreditorPayment(creditorId, payableId, payment);
    // Update selected creditor
    const updatedCreditor = creditors.find(c => c.id === creditorId);
    if (updatedCreditor) {
      setSelectedCreditor(updatedCreditor);
    }
  };

  const handleClearData = () => {
    localStorage.removeItem('customer_credit_data');
    localStorage.removeItem('customer_credit_creditors');
    window.location.reload();
  };

  const handleBackupToCloud = async () => {
    const allData = { customers, creditors };
    await backupToGoogleDrive(allData);
  };

  const handleRestoreFromCloud = async () => {
    const cloudData = await restoreFromGoogleDrive();
    if (cloudData.customers) {
      mergeCloudData(cloudData.customers);
    }
    if (cloudData.creditors) {
      mergeCloudCreditorData(cloudData.creditors);
    }
  };

  const handleExportAllData = () => {
    const allData = { customers, creditors };
    const dataStr = JSON.stringify(allData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `financial_data_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportAllData = (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.customers) {
            mergeCloudData(data.customers);
          }
          if (data.creditors) {
            mergeCloudCreditorData(data.creditors);
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  };

  const handleTestNotification = () => {
    sendNotification(
      'Test Notification 🔔',
      'Payment reminders are working perfectly! You will receive notifications for due dates and overdue payments.',
      { tag: 'test-notification' }
    );
  };

  const displayName = profile.name || profile.businessName || user?.name || 'User';

  const renderContent = () => {
    if (activeTab === 'customers' && selectedCustomer) {
      return (
        <CustomerDetail
          customer={selectedCustomer}
          onBack={handleBackToCustomerList}
          onAddTransaction={handleAddTransaction}
          onMarkPaid={handleMarkTransactionPaid}
          onDeleteCustomer={deleteCustomer}
          onDeleteTransaction={handleDeleteTransaction}
          onAddPayment={handleAddCustomerPayment}
        />
      );
    }

    if (activeTab === 'creditors' && selectedCreditor) {
      return (
        <CreditorDetail
          creditor={selectedCreditor}
          onBack={handleBackToCreditorList}
          onAddPayable={handleAddPayable}
          onMarkPaid={handleMarkPayablePaid}
          onDeleteCreditor={deleteCreditor}
          onDeletePayable={handleDeletePayable}
          onAddPayment={handleAddCreditorPayment}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            customers={customers}
            creditors={creditors}
            onViewCustomers={() => setActiveTab('customers')}
            onViewCreditors={() => setActiveTab('creditors')}
            isDark={isDark}
            onToggleTheme={toggleTheme}
            userName={displayName}
          />
        );
      case 'customers':
        return (
          <CustomerList
            customers={customers}
            onCustomerSelect={handleCustomerSelect}
          />
        );
      case 'creditors':
        return (
          <CreditorList
            creditors={creditors}
            onCreditorSelect={handleCreditorSelect}
          />
        );
      case 'add':
        return (
          <div className="space-y-6">
            {/* Add Type Selector */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">What would you like to add?</h2>
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setAddType('customer')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    addType === 'customer'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  Customer (Money to Receive)
                </button>
                <button
                  onClick={() => setAddType('creditor')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    addType === 'creditor'
                      ? 'bg-white dark:bg-gray-600 text-red-600 dark:text-red-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  Creditor (Money to Pay)
                </button>
              </div>
            </div>

            {/* Form */}
            {addType === 'customer' ? (
              <CustomerForm onSubmit={handleAddCustomer} />
            ) : (
              <CreditorForm onSubmit={handleAddCreditor} />
            )}
          </div>
        );
      case 'settings':
        return (
          <Settings
            onExportData={handleExportAllData}
            onImportData={handleImportAllData}
            onClearData={handleClearData}
            onBackupToCloud={handleBackupToCloud}
            onRestoreFromCloud={handleRestoreFromCloud}
            onConnectGoogleDrive={connectToGoogleDrive}
            isGoogleDriveConnected={isGoogleDriveConnected}
            isCloudLoading={isCloudLoading}
            profile={profile}
            onUpdateProfile={updateProfile}
            onLogout={logout}
            notificationPermission={notificationPermission}
            notificationSettings={notificationSettings}
            onRequestNotificationPermission={requestNotificationPermission}
            onUpdateNotificationSettings={updateNotificationSettings}
            onTestNotification={handleTestNotification}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors">
      {/* Database Connected Indicator */}
      {isDatabaseConnected && (
        <div className="bg-green-600 text-white text-center py-2 text-sm">
          🎉 Database connected! Your data is now synced across all devices.
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 pb-20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {renderContent()}
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}

export default App;