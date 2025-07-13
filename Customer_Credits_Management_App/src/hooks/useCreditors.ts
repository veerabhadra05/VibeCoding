import { useState, useEffect } from 'react';
import { Creditor, Payable, Payment } from '../types/Customer';

const CREDITORS_STORAGE_KEY = 'customer_credit_creditors';

export const useCreditors = () => {
  const [creditors, setCreditors] = useState<Creditor[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(CREDITORS_STORAGE_KEY);
    if (saved) {
      try {
        setCreditors(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load creditor data:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CREDITORS_STORAGE_KEY, JSON.stringify(creditors));
  }, [creditors]);

  const addCreditor = (creditorData: Omit<Creditor, 'id' | 'totalOwed' | 'lastPayableDate' | 'status'>) => {
    const newCreditor: Creditor = {
      ...creditorData,
      id: Date.now().toString(),
      totalOwed: calculateTotalOwed(creditorData.payables),
      lastPayableDate: creditorData.payables[creditorData.payables.length - 1]?.date || new Date().toISOString(),
      status: calculateStatus(creditorData.payables)
    };
    
    setCreditors(prev => [...prev, newCreditor]);
    return newCreditor;
  };

  const updateCreditor = (id: string, updates: Partial<Creditor>) => {
    setCreditors(prev => prev.map(creditor => 
      creditor.id === id 
        ? { 
            ...creditor, 
            ...updates,
            totalOwed: updates.payables 
              ? calculateTotalOwed(updates.payables)
              : creditor.totalOwed,
            status: updates.payables 
              ? calculateStatus(updates.payables)
              : creditor.status
          }
        : creditor
    ));
  };

  const deleteCreditor = (id: string) => {
    setCreditors(prev => prev.filter(creditor => creditor.id !== id));
  };

  const addPayable = (creditorId: string, payable: Omit<Payable, 'id'>) => {
    const newPayable: Payable = {
      ...payable,
      id: Date.now().toString(),
      payments: []
    };

    setCreditors(prev => prev.map(creditor => {
      if (creditor.id === creditorId) {
        const updatedPayables = [...creditor.payables, newPayable];
        return {
          ...creditor,
          payables: updatedPayables,
          totalOwed: calculateTotalOwed(updatedPayables),
          lastPayableDate: newPayable.date,
          status: calculateStatus(updatedPayables)
        };
      }
      return creditor;
    }));
  };

  const deletePayable = (creditorId: string, payableId: string) => {
    setCreditors(prev => prev.map(creditor => {
      if (creditor.id === creditorId) {
        const updatedPayables = creditor.payables.filter(p => p.id !== payableId);
        return {
          ...creditor,
          payables: updatedPayables,
          totalOwed: calculateTotalOwed(updatedPayables),
          lastPayableDate: updatedPayables.length > 0 
            ? updatedPayables[updatedPayables.length - 1].date 
            : new Date().toISOString(),
          status: calculateStatus(updatedPayables)
        };
      }
      return creditor;
    }));
  };

  const addPayment = (creditorId: string, payableId: string, payment: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...payment,
      id: Date.now().toString()
    };

    setCreditors(prev => prev.map(creditor => {
      if (creditor.id === creditorId) {
        const updatedPayables = creditor.payables.map(payable => {
          if (payable.id === payableId) {
            const updatedPayments = [...(payable.payments || []), newPayment];
            const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
            const isFullyPaid = totalPaid >= payable.amount;
            
            return {
              ...payable,
              payments: updatedPayments,
              status: isFullyPaid ? 'paid' as const : 'unpaid' as const,
              paidDate: isFullyPaid ? newPayment.date : undefined
            };
          }
          return payable;
        });

        return {
          ...creditor,
          payables: updatedPayables,
          totalOwed: calculateTotalOwed(updatedPayables),
          status: calculateStatus(updatedPayables)
        };
      }
      return creditor;
    }));
  };

  const markPayablePaid = (creditorId: string, payableId: string) => {
    setCreditors(prev => prev.map(creditor => {
      if (creditor.id === creditorId) {
        const updatedPayables = creditor.payables.map(p => 
          p.id === payableId 
            ? { ...p, status: 'paid' as const, paidDate: new Date().toISOString() }
            : p
        );
        return {
          ...creditor,
          payables: updatedPayables,
          totalOwed: calculateTotalOwed(updatedPayables),
          status: calculateStatus(updatedPayables)
        };
      }
      return creditor;
    }));
  };

  const calculateTotalOwed = (payables: Payable[]): number => {
    return payables.reduce((sum, p) => {
      if (p.status === 'paid') return sum;
      const totalPaid = p.payments?.reduce((pSum, payment) => pSum + payment.amount, 0) || 0;
      return sum + (p.amount - totalPaid);
    }, 0);
  };

  const calculateStatus = (payables: Payable[]): Creditor['status'] => {
    const totalOwed = calculateTotalOwed(payables);
    if (totalOwed === 0) return 'paid';
    
    const hasPartialPayments = payables.some(p => 
      p.payments && p.payments.length > 0 && p.status === 'unpaid'
    );
    
    return hasPartialPayments ? 'partial' : 'unpaid';
  };

  const mergeCreditors = (existingCreditors: Creditor[], newCreditors: Creditor[]): Creditor[] => {
    const merged = [...existingCreditors];
    
    newCreditors.forEach(newCreditor => {
      const existingIndex = merged.findIndex(c => 
        c.mobile === newCreditor.mobile || 
        (c.email && newCreditor.email && c.email === newCreditor.email)
      );
      
      if (existingIndex >= 0) {
        // Merge payables for existing creditor
        const existingCreditor = merged[existingIndex];
        const existingPayableIds = new Set(existingCreditor.payables.map(p => p.id));
        const newPayables = newCreditor.payables.filter(p => !existingPayableIds.has(p.id));
        
        merged[existingIndex] = {
          ...existingCreditor,
          payables: [...existingCreditor.payables, ...newPayables],
          email: existingCreditor.email || newCreditor.email,
          photo: existingCreditor.photo || newCreditor.photo,
          address: {
            street: existingCreditor.address.street || newCreditor.address.street,
            city: existingCreditor.address.city || newCreditor.address.city
          }
        };
        
        // Recalculate totals
        const allPayables = merged[existingIndex].payables;
        merged[existingIndex].totalOwed = calculateTotalOwed(allPayables);
        merged[existingIndex].status = calculateStatus(allPayables);
        merged[existingIndex].lastPayableDate = allPayables
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date || new Date().toISOString();
      } else {
        // Add new creditor with unique ID
        merged.push({
          ...newCreditor,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
        });
      }
    });
    
    return merged;
  };

  const exportCreditorData = () => {
    const dataStr = JSON.stringify(creditors, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `creditor_data_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importCreditorData = (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          const mergedCreditors = mergeCreditors(creditors, importedData);
          setCreditors(mergedCreditors);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  };

  const mergeCloudCreditorData = (cloudData: Creditor[]) => {
    const mergedCreditors = mergeCreditors(creditors, cloudData);
    setCreditors(mergedCreditors);
  };

  return {
    creditors,
    setCreditors,
    addCreditor,
    updateCreditor,
    deleteCreditor,
    addPayable,
    deletePayable,
    addPayment,
    markPayablePaid,
    exportCreditorData,
    importCreditorData,
    mergeCloudCreditorData
  };
};