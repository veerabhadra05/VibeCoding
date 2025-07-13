import { useState, useEffect } from 'react';
import { Customer, Creditor } from '../types/Customer';

interface NotificationSettings {
  enabled: boolean;
  reminderDays: number; // Days before due date to send reminder
  overdueReminders: boolean;
  weeklyReports: boolean;
}

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('notification_settings');
    return saved ? JSON.parse(saved) : {
      enabled: false,
      reminderDays: 3,
      overdueReminders: true,
      weeklyReports: false
    };
  });

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('notification_settings', JSON.stringify(settings));
  }, [settings]);

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return false;
    }

    if (permission === 'granted') {
      return true;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    
    if (result === 'granted') {
      // Show welcome notification
      new Notification('Payment Reminders Enabled! 🔔', {
        body: 'You will now receive payment reminders and overdue notifications.',
        icon: '/vite.svg',
        badge: '/vite.svg'
      });
      return true;
    }
    
    return false;
  };

  const sendNotification = (title: string, body: string, options?: NotificationOptions) => {
    if (permission !== 'granted' || !settings.enabled) {
      return;
    }

    const notification = new Notification(title, {
      body,
      icon: '/vite.svg',
      badge: '/vite.svg',
      requireInteraction: true,
      ...options
    });

    // Auto close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);

    return notification;
  };

  const checkPaymentReminders = (customers: Customer[], creditors: Creditor[]) => {
    if (!settings.enabled || permission !== 'granted') {
      return;
    }

    const now = new Date();
    const reminderDate = new Date();
    reminderDate.setDate(now.getDate() + settings.reminderDays);

    // Check for upcoming due dates (creditors)
    creditors.forEach(creditor => {
      creditor.payables.forEach(payable => {
        if (payable.status === 'unpaid' && payable.dueDate) {
          const dueDate = new Date(payable.dueDate);
          
          // Upcoming due date reminder
          if (dueDate <= reminderDate && dueDate > now) {
            const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            sendNotification(
              `Payment Due Soon! ⏰`,
              `${creditor.name}: ₹${payable.amount.toLocaleString()} due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`,
              {
                tag: `due-soon-${payable.id}`,
                data: { type: 'due_soon', creditorId: creditor.id, payableId: payable.id }
              }
            );
          }
          
          // Overdue reminder
          if (settings.overdueReminders && dueDate < now) {
            const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
            sendNotification(
              `Payment Overdue! 🚨`,
              `${creditor.name}: ₹${payable.amount.toLocaleString()} overdue by ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}`,
              {
                tag: `overdue-${payable.id}`,
                data: { type: 'overdue', creditorId: creditor.id, payableId: payable.id }
              }
            );
          }
        }
      });
    });

    // Check for long outstanding receivables (customers)
    customers.forEach(customer => {
      if (customer.status === 'unpaid') {
        const lastTransactionDate = new Date(customer.lastTransactionDate);
        const daysSinceLastTransaction = Math.ceil((now.getTime() - lastTransactionDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Remind about receivables older than 30 days
        if (daysSinceLastTransaction >= 30 && daysSinceLastTransaction % 7 === 0) {
          sendNotification(
            `Outstanding Receivable 💰`,
            `${customer.name}: ₹${customer.totalDue.toLocaleString()} pending for ${daysSinceLastTransaction} days`,
            {
              tag: `receivable-${customer.id}`,
              data: { type: 'receivable_reminder', customerId: customer.id }
            }
          );
        }
      }
    });
  };

  const sendWeeklyReport = (customers: Customer[], creditors: Creditor[]) => {
    if (!settings.enabled || !settings.weeklyReports || permission !== 'granted') {
      return;
    }

    const totalReceivables = customers.reduce((sum, c) => sum + c.totalDue, 0);
    const totalPayables = creditors.reduce((sum, c) => sum + c.totalOwed, 0);
    const unpaidCustomers = customers.filter(c => c.status === 'unpaid').length;
    const unpaidCreditors = creditors.filter(c => c.status === 'unpaid').length;

    sendNotification(
      `Weekly Financial Report 📊`,
      `Receivables: ₹${totalReceivables.toLocaleString()} (${unpaidCustomers} pending) | Payables: ₹${totalPayables.toLocaleString()} (${unpaidCreditors} pending)`,
      {
        tag: 'weekly-report',
        data: { type: 'weekly_report' }
      }
    );
  };

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const scheduleNotifications = (customers: Customer[], creditors: Creditor[]) => {
    // Clear existing intervals
    const existingInterval = localStorage.getItem('notification_interval');
    if (existingInterval) {
      clearInterval(parseInt(existingInterval));
    }

    if (!settings.enabled) {
      return;
    }

    // Check for reminders every hour
    const intervalId = setInterval(() => {
      checkPaymentReminders(customers, creditors);
    }, 60 * 60 * 1000); // 1 hour

    localStorage.setItem('notification_interval', intervalId.toString());

    // Schedule weekly reports (every Sunday at 9 AM)
    if (settings.weeklyReports) {
      const now = new Date();
      const nextSunday = new Date();
      nextSunday.setDate(now.getDate() + (7 - now.getDay()));
      nextSunday.setHours(9, 0, 0, 0);

      const timeUntilSunday = nextSunday.getTime() - now.getTime();
      
      setTimeout(() => {
        sendWeeklyReport(customers, creditors);
        
        // Set up weekly interval
        setInterval(() => {
          sendWeeklyReport(customers, creditors);
        }, 7 * 24 * 60 * 60 * 1000); // 1 week
      }, timeUntilSunday);
    }

    // Initial check
    checkPaymentReminders(customers, creditors);
  };

  return {
    permission,
    settings,
    requestPermission,
    sendNotification,
    updateSettings,
    scheduleNotifications,
    checkPaymentReminders,
    sendWeeklyReport
  };
};