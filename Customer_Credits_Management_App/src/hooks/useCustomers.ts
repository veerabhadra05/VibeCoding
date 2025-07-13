import { useState, useEffect } from 'react';
import { Customer, Transaction, Payment } from '../types/Customer';

const STORAGE_KEY = 'customer_credit_data';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setCustomers(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load customer data:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
  }, [customers]);

  const addCustomer = (customerData: Omit<Customer, 'id' | 'totalDue' | 'lastTransactionDate' | 'status'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      totalDue: customerData.transactions.reduce((sum, t) => t.status === 'unpaid' ? sum + t.amount : sum, 0),
      lastTransactionDate: customerData.transactions[customerData.transactions.length - 1]?.date || new Date().toISOString(),
      status: customerData.transactions.some(t => t.status === 'unpaid') ? 'unpaid' : 'paid'
    };
    
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(customer => 
      customer.id === id 
        ? { 
            ...customer, 
            ...updates,
            totalDue: updates.transactions 
              ? calculateTotalDue(updates.transactions)
              : customer.totalDue,
            status: updates.transactions 
              ? calculateStatus(updates.transactions)
              : customer.status
          }
        : customer
    ));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(customer => customer.id !== id));
  };

  const addTransaction = (customerId: string, transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      payments: []
    };

    setCustomers(prev => prev.map(customer => {
      if (customer.id === customerId) {
        const updatedTransactions = [...customer.transactions, newTransaction];
        return {
          ...customer,
          transactions: updatedTransactions,
          totalDue: calculateTotalDue(updatedTransactions),
          lastTransactionDate: newTransaction.date,
          status: calculateStatus(updatedTransactions)
        };
      }
      return customer;
    }));
  };

  const deleteTransaction = (customerId: string, transactionId: string) => {
    setCustomers(prev => prev.map(customer => {
      if (customer.id === customerId) {
        const updatedTransactions = customer.transactions.filter(t => t.id !== transactionId);
        return {
          ...customer,
          transactions: updatedTransactions,
          totalDue: calculateTotalDue(updatedTransactions),
          lastTransactionDate: updatedTransactions.length > 0 
            ? updatedTransactions[updatedTransactions.length - 1].date 
            : new Date().toISOString(),
          status: calculateStatus(updatedTransactions)
        };
      }
      return customer;
    }));
  };

  const addPayment = (customerId: string, transactionId: string, payment: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...payment,
      id: Date.now().toString()
    };

    setCustomers(prev => prev.map(customer => {
      if (customer.id === customerId) {
        const updatedTransactions = customer.transactions.map(transaction => {
          if (transaction.id === transactionId) {
            const updatedPayments = [...(transaction.payments || []), newPayment];
            const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
            const isFullyPaid = totalPaid >= transaction.amount;
            
            return {
              ...transaction,
              payments: updatedPayments,
              status: isFullyPaid ? 'paid' as const : 'unpaid' as const,
              paidDate: isFullyPaid ? newPayment.date : undefined
            };
          }
          return transaction;
        });

        return {
          ...customer,
          transactions: updatedTransactions,
          totalDue: calculateTotalDue(updatedTransactions),
          status: calculateStatus(updatedTransactions)
        };
      }
      return customer;
    }));
  };

  const markTransactionPaid = (customerId: string, transactionId: string) => {
    setCustomers(prev => prev.map(customer => {
      if (customer.id === customerId) {
        const updatedTransactions = customer.transactions.map(t => 
          t.id === transactionId 
            ? { ...t, status: 'paid' as const, paidDate: new Date().toISOString() }
            : t
        );
        return {
          ...customer,
          transactions: updatedTransactions,
          totalDue: calculateTotalDue(updatedTransactions),
          status: calculateStatus(updatedTransactions)
        };
      }
      return customer;
    }));
  };

  const calculateTotalDue = (transactions: Transaction[]): number => {
    return transactions.reduce((sum, t) => {
      if (t.status === 'paid') return sum;
      const totalPaid = t.payments?.reduce((pSum, p) => pSum + p.amount, 0) || 0;
      return sum + (t.amount - totalPaid);
    }, 0);
  };

  const calculateStatus = (transactions: Transaction[]): Customer['status'] => {
    const totalDue = calculateTotalDue(transactions);
    if (totalDue === 0) return 'paid';
    
    const hasPartialPayments = transactions.some(t => 
      t.payments && t.payments.length > 0 && t.status === 'unpaid'
    );
    
    return hasPartialPayments ? 'partial' : 'unpaid';
  };

  const exportData = () => {
    const dataStr = JSON.stringify(customers, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `customer_data_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const mergeCustomers = (existingCustomers: Customer[], newCustomers: Customer[]): Customer[] => {
    const merged = [...existingCustomers];
    
    newCustomers.forEach(newCustomer => {
      const existingIndex = merged.findIndex(c => 
        c.mobile === newCustomer.mobile || 
        (c.email && newCustomer.email && c.email === newCustomer.email)
      );
      
      if (existingIndex >= 0) {
        // Merge transactions for existing customer
        const existingCustomer = merged[existingIndex];
        const existingTransactionIds = new Set(existingCustomer.transactions.map(t => t.id));
        const newTransactions = newCustomer.transactions.filter(t => !existingTransactionIds.has(t.id));
        
        merged[existingIndex] = {
          ...existingCustomer,
          transactions: [...existingCustomer.transactions, ...newTransactions],
          // Update other fields if they're empty in existing customer
          email: existingCustomer.email || newCustomer.email,
          photo: existingCustomer.photo || newCustomer.photo,
          address: {
            street: existingCustomer.address.street || newCustomer.address.street,
            city: existingCustomer.address.city || newCustomer.address.city
          }
        };
        
        // Recalculate totals
        const allTransactions = merged[existingIndex].transactions;
        merged[existingIndex].totalDue = calculateTotalDue(allTransactions);
        merged[existingIndex].status = calculateStatus(allTransactions);
        merged[existingIndex].lastTransactionDate = allTransactions
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date || new Date().toISOString();
      } else {
        // Add new customer with unique ID
        merged.push({
          ...newCustomer,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
        });
      }
    });
    
    return merged;
  };

  const importData = (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          const mergedCustomers = mergeCustomers(customers, importedData);
          setCustomers(mergedCustomers);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  };

  const mergeCloudData = (cloudData: Customer[]) => {
    const mergedCustomers = mergeCustomers(customers, cloudData);
    setCustomers(mergedCustomers);
  };

  return {
    customers,
    setCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addTransaction,
    deleteTransaction,
    addPayment,
    markTransactionPaid,
    exportData,
    importData,
    mergeCloudData
  };
};