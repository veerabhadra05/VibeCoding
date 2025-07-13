import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, Loader, AlertCircle, Users, CreditCard, Upload, ArrowRight } from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';

interface DatabaseSetupProps {
  onComplete: () => void;
}

const DatabaseSetup: React.FC<DatabaseSetupProps> = ({ onComplete }) => {
  const { isConnected, isLoading, error, initializeDatabase, migrateLocalData, setupUserAccount } = useSupabase();
  const [currentStep, setCurrentStep] = useState(1);
  const [stepStatus, setStepStatus] = useState<Record<number, 'pending' | 'loading' | 'complete' | 'error'>>({
    1: 'pending',
    2: 'pending',
    3: 'pending',
    4: 'pending'
  });

  useEffect(() => {
    if (isConnected && !isLoading) {
      startSetupProcess();
    }
  }, [isConnected, isLoading]);

  const startSetupProcess = async () => {
    try {
      // Step 1: Initialize Database
      setStepStatus(prev => ({ ...prev, 1: 'loading' }));
      setCurrentStep(1);
      await new Promise(resolve => setTimeout(resolve, 1500));
      await initializeDatabase();
      setStepStatus(prev => ({ ...prev, 1: 'complete' }));

      // Step 2: Setup User Account
      setStepStatus(prev => ({ ...prev, 2: 'loading' }));
      setCurrentStep(2);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await setupUserAccount('user-' + Date.now());
      setStepStatus(prev => ({ ...prev, 2: 'complete' }));

      // Step 3: Migrate Local Data
      setStepStatus(prev => ({ ...prev, 3: 'loading' }));
      setCurrentStep(3);
      const hasMigrated = await migrateLocalData();
      setStepStatus(prev => ({ ...prev, 3: 'complete' }));

      // Step 4: Finalize Setup
      setStepStatus(prev => ({ ...prev, 4: 'loading' }));
      setCurrentStep(4);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStepStatus(prev => ({ ...prev, 4: 'complete' }));

      // Complete setup
      setTimeout(() => {
        onComplete();
      }, 1500);

    } catch (err) {
      console.error('Setup process error:', err);
      setStepStatus(prev => ({ ...prev, [currentStep]: 'error' }));
    }
  };

  const getStepIcon = (step: number) => {
    const status = stepStatus[step];
    switch (status) {
      case 'loading':
        return <Loader className="w-5 h-5 animate-spin text-blue-600" />;
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStepColor = (step: number) => {
    const status = stepStatus[step];
    switch (status) {
      case 'loading':
        return 'text-blue-600 dark:text-blue-400';
      case 'complete':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Setup Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
          <div className="flex items-center">
            <Database className="w-8 h-8 text-white mr-4" />
            <div>
              <h1 className="text-2xl font-bold text-white">Setting Up Your Database</h1>
              <p className="text-blue-100">Configuring your customer credit management system</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="p-8">
          <div className="space-y-6">
            {/* Step 1: Initialize Database */}
            <div className="flex items-center space-x-4">
              {getStepIcon(1)}
              <div className="flex-1">
                <h3 className={`font-medium ${getStepColor(1)}`}>
                  Initialize Database Tables
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Creating tables for customers, creditors, and transactions
                </p>
              </div>
              {stepStatus[1] === 'complete' && (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
            </div>

            {/* Step 2: Setup User Account */}
            <div className="flex items-center space-x-4">
              {getStepIcon(2)}
              <div className="flex-1">
                <h3 className={`font-medium ${getStepColor(2)}`}>
                  Setup User Account
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Creating your personal data space with security
                </p>
              </div>
              {stepStatus[2] === 'complete' && (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
            </div>

            {/* Step 3: Migrate Local Data */}
            <div className="flex items-center space-x-4">
              {getStepIcon(3)}
              <div className="flex-1">
                <h3 className={`font-medium ${getStepColor(3)}`}>
                  Migrate Existing Data
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Moving your local data to the secure database
                </p>
              </div>
              {stepStatus[3] === 'complete' && (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
            </div>

            {/* Step 4: Finalize Setup */}
            <div className="flex items-center space-x-4">
              {getStepIcon(4)}
              <div className="flex-1">
                <h3 className={`font-medium ${getStepColor(4)}`}>
                  Finalize Configuration
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Completing setup and enabling cloud features
                </p>
              </div>
              {stepStatus[4] === 'complete' && (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
            </div>
          </div>

          {/* Current Step Indicator */}
          {currentStep <= 4 && (
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center">
                <Loader className="w-5 h-5 animate-spin text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {currentStep === 1 && "Setting up database structure..."}
                    {currentStep === 2 && "Configuring your account..."}
                    {currentStep === 3 && "Transferring your data..."}
                    {currentStep === 4 && "Finalizing setup..."}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    This may take a few moments. Please don't close this window.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {Object.values(stepStatus).every(status => status === 'complete') && (
            <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-green-900 dark:text-green-100 mb-2">
                Setup Complete! 🎉
              </h3>
              <p className="text-green-700 dark:text-green-300 mb-4">
                Your database is ready and your data has been securely migrated.
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-green-600 dark:text-green-400">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  Multi-device access
                </div>
                <div className="flex items-center">
                  <Database className="w-4 h-4 mr-1" />
                  Cloud backup
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Data security
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseSetup;