import React, { useState } from 'react';
import { Customer, Transaction, Payment } from '../types/Customer';
import { ArrowLeft, Phone, MapPin, Calendar, DollarSign, CheckCircle, XCircle, Plus, Trash2, Eye, Mail, CreditCard, Banknote, FileText, Camera, Upload } from 'lucide-react';
import { formatDate, formatDateTime, getCurrentDateForInput } from '../utils/dateUtils';
import PhotoViewer from './PhotoViewer';

interface CustomerDetailProps {
  customer: Customer;
  onBack: () => void;
  onAddTransaction: (customerId: string, transaction: Omit<Transaction, 'id'>) => void;
  onMarkPaid: (customerId: string, transactionId: string) => void;
  onDeleteCustomer: (customerId: string) => void;
  onDeleteTransaction: (customerId: string, transactionId: string) => void;
  onAddPayment: (customerId: string, transactionId: string, payment: Omit<Payment, 'id'>) => void;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ 
  customer, 
  onBack, 
  onAddTransaction, 
  onMarkPaid,
  onDeleteCustomer,
  onDeleteTransaction,
  onAddPayment
}) => {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState<string | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<{ url: string; title: string } | null>(null);
  const [newTransaction, setNewTransaction] = useState({
    amount: 0,
    date: getCurrentDateForInput(),
    description: '',
    billPhoto: ''
  });
  const [newPayment, setNewPayment] = useState({
    amount: 0,
    date: getCurrentDateForInput(),
    method: 'cash' as Payment['method'],
    description: '',
    receiptPhoto: ''
  });

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTransaction.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    onAddTransaction(customer.id, {
      ...newTransaction,
      status: 'unpaid'
    });
    
    setNewTransaction({
      amount: 0,
      date: getCurrentDateForInput(),
      description: '',
      billPhoto: ''
    });
    setShowAddTransaction(false);
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddPayment || newPayment.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    onAddPayment(customer.id, showAddPayment, newPayment);
    
    setNewPayment({
      amount: 0,
      date: getCurrentDateForInput(),
      method: 'cash',
      description: '',
      receiptPhoto: ''
    });
    setShowAddPayment(null);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'transaction' | 'payment') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (type === 'transaction') {
          setNewTransaction(prev => ({ ...prev, billPhoto: result }));
        } else {
          setNewPayment(prev => ({ ...prev, receiptPhoto: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${customer.name}? This action cannot be undone.`)) {
      onDeleteCustomer(customer.id);
      onBack();
    }
  };

  const handleDeleteTransaction = (transactionId: string) => {
    if (window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      onDeleteTransaction(customer.id, transactionId);
    }
  };

  const handleViewPhoto = (url: string, title: string) => {
    setViewingPhoto({ url, title });
  };

  const handleCallCustomer = () => {
    window.open(`tel:${customer.mobile}`, '_self');
  };

  const handleEmailCustomer = () => {
    if (customer.email) {
      window.open(`mailto:${customer.email}`, '_self');
    }
  };

  const getPaymentMethodIcon = (method: Payment['method']) => {
    switch (method) {
      case 'cash':
        return <Banknote className="w-4 h-4" />;
      case 'online':
      case 'bank_transfer':
        return <CreditCard className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getPaymentMethodColor = (method: Payment['method']) => {
    switch (method) {
      case 'cash':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'online':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'bank_transfer':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'cheque':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getTotalPaid = (transaction: Transaction) => {
    return transaction.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  };

  const getRemainingAmount = (transaction: Transaction) => {
    return transaction.amount - getTotalPaid(transaction);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-4 p-2 text-white hover:bg-blue-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-white">Customer Details</h1>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start space-x-6">
            <div className="relative">
              {customer.photo ? (
                <div className="relative group">
                  <img
                    src={customer.photo}
                    alt={customer.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
                  />
                  <button
                    onClick={() => handleViewPhoto(customer.photo!, `${customer.name}'s Photo`)}
                    className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Eye className="w-6 h-6 text-white" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center border-4 border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-300 font-medium text-2xl">
                    {customer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{customer.name}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                <button
                  onClick={handleCallCustomer}
                  className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {customer.mobile}
                </button>
                
                {customer.email && (
                  <button
                    onClick={handleEmailCustomer}
                    className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {customer.email}
                  </button>
                )}
                
                {customer.address.street && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {customer.address.street}
                    {customer.address.city && `, ${customer.address.city}`}
                  </div>
                )}
                
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Last transaction: {formatDate(customer.lastTransactionDate)}
                </div>
                
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Total due: <span className={`font-bold ml-1 ${customer.totalDue > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    ₹{customer.totalDue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleDelete}
              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete Customer"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction History</h3>
          <button
            onClick={() => setShowAddTransaction(!showAddTransaction)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </button>
        </div>

        {/* Add Transaction Form */}
        {showAddTransaction && (
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    value={newTransaction.amount || ''}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Enter amount"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bill Photo (Optional)
                </label>
                {newTransaction.billPhoto && (
                  <div className="mb-2 relative group inline-block">
                    <img
                      src={newTransaction.billPhoto}
                      alt="Bill"
                      className="w-20 h-20 object-cover rounded border border-gray-300 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => handleViewPhoto(newTransaction.billPhoto, 'Bill Photo Preview')}
                      className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye className="w-4 h-4 text-white" />
                    </button>
                  </div>
                )}
                <div className="flex space-x-2">
                  <label className="cursor-pointer bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center">
                    <Camera className="w-3 h-3 mr-1" />
                    Camera
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handlePhotoUpload(e, 'transaction')}
                      className="hidden"
                    />
                  </label>
                  <label className="cursor-pointer bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors flex items-center">
                    <Upload className="w-3 h-3 mr-1" />
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, 'transaction')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Transaction
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddTransaction(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Transactions List */}
        <div className="p-6">
          {customer.transactions.length > 0 ? (
            <div className="space-y-6">
              {customer.transactions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((transaction) => {
                  const totalPaid = getTotalPaid(transaction);
                  const remainingAmount = getRemainingAmount(transaction);
                  const isFullyPaid = remainingAmount <= 0;

                  return (
                    <div
                      key={transaction.id}
                      className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-4"
                    >
                      {/* Transaction Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {isFullyPaid ? (
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                          )}
                          
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              ₹{transaction.amount.toLocaleString()}
                            </p>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <p>{formatDate(transaction.date)}</p>
                              {transaction.description && (
                                <p className="italic">{transaction.description}</p>
                              )}
                            </div>
                          </div>
                          
                          {transaction.billPhoto && (
                            <div className="relative group">
                              <img
                                src={transaction.billPhoto}
                                alt="Bill"
                                className="w-12 h-12 object-cover rounded border border-gray-300 dark:border-gray-600"
                              />
                              <button
                                onClick={() => handleViewPhoto(
                                  transaction.billPhoto!, 
                                  `Bill - ${customer.name} - ${formatDate(transaction.date)}`
                                )}
                                className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Eye className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Paid: ₹{totalPaid.toLocaleString()}
                            </p>
                            <p className={`text-sm font-medium ${remainingAmount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                              Remaining: ₹{remainingAmount.toLocaleString()}
                            </p>
                          </div>

                          {!isFullyPaid && (
                            <button
                              onClick={() => setShowAddPayment(transaction.id)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                            >
                              Add Payment
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Delete Transaction"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Payment History */}
                      {transaction.payments && transaction.payments.length > 0 && (
                        <div className="ml-10 space-y-2">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment History:</h4>
                          {transaction.payments.map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                              <div className="flex items-center space-x-3">
                                <div className={`p-1 rounded ${getPaymentMethodColor(payment.method)}`}>
                                  {getPaymentMethodIcon(payment.method)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    ₹{payment.amount.toLocaleString()}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {formatDateTime(payment.date)} • {payment.method.replace('_', ' ')}
                                  </p>
                                  {payment.description && (
                                    <p className="text-xs text-gray-500 dark:text-gray-500 italic">
                                      {payment.description}
                                    </p>
                                  )}
                                </div>
                                {payment.receiptPhoto && (
                                  <div className="relative group">
                                    <img
                                      src={payment.receiptPhoto}
                                      alt="Receipt"
                                      className="w-8 h-8 object-cover rounded border border-gray-300 dark:border-gray-600"
                                    />
                                    <button
                                      onClick={() => handleViewPhoto(
                                        payment.receiptPhoto!, 
                                        `Receipt - ${customer.name} - ${formatDateTime(payment.date)}`
                                      )}
                                      className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Eye className="w-3 h-3 text-white" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Payment Form */}
                      {showAddPayment === transaction.id && (
                        <div className="ml-10 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <form onSubmit={handleAddPayment} className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Amount * (Max: ₹{remainingAmount})
                                </label>
                                <input
                                  type="number"
                                  value={newPayment.amount || ''}
                                  onChange={(e) => setNewPayment(prev => ({ ...prev, amount: Math.min(parseFloat(e.target.value) || 0, remainingAmount) }))}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                  placeholder="Enter amount"
                                  min="0"
                                  max={remainingAmount}
                                  step="0.01"
                                  required
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Payment Method
                                </label>
                                <select
                                  value={newPayment.method}
                                  onChange={(e) => setNewPayment(prev => ({ ...prev, method: e.target.value as Payment['method'] }))}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                >
                                  <option value="cash">Cash</option>
                                  <option value="online">Online</option>
                                  <option value="bank_transfer">Bank Transfer</option>
                                  <option value="cheque">Cheque</option>
                                  <option value="other">Other</option>
                                </select>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Date
                                </label>
                                <input
                                  type="date"
                                  value={newPayment.date}
                                  onChange={(e) => setNewPayment(prev => ({ ...prev, date: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description (Optional)
                              </label>
                              <input
                                type="text"
                                value={newPayment.description}
                                onChange={(e) => setNewPayment(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                placeholder="Enter payment description"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Receipt Photo (Optional)
                              </label>
                              {newPayment.receiptPhoto && (
                                <div className="mb-2 relative group inline-block">
                                  <img
                                    src={newPayment.receiptPhoto}
                                    alt="Receipt"
                                    className="w-16 h-16 object-cover rounded border border-gray-300 dark:border-gray-600"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleViewPhoto(newPayment.receiptPhoto, 'Receipt Photo Preview')}
                                    className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Eye className="w-3 h-3 text-white" />
                                  </button>
                                </div>
                              )}
                              <div className="flex space-x-2">
                                <label className="cursor-pointer bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors flex items-center">
                                  <Camera className="w-3 h-3 mr-1" />
                                  Camera
                                  <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={(e) => handlePhotoUpload(e, 'payment')}
                                    className="hidden"
                                  />
                                </label>
                                <label className="cursor-pointer bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700 transition-colors flex items-center">
                                  <Upload className="w-3 h-3 mr-1" />
                                  Upload
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handlePhotoUpload(e, 'payment')}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <button
                                type="submit"
                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                              >
                                Add Payment
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowAddPayment(null)}
                                className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No transactions yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Photo Viewer Modal */}
      {viewingPhoto && (
        <PhotoViewer
          imageUrl={viewingPhoto.url}
          title={viewingPhoto.title}
          onClose={() => setViewingPhoto(null)}
        />
      )}
    </div>
  );
};

export default CustomerDetail;