import React, { useState } from 'react';
import { Creditor, Payable, Payment } from '../types/Customer';
import { ArrowLeft, Phone, MapPin, Calendar, DollarSign, CheckCircle, XCircle, Plus, Trash2, Eye, Mail, Tag, Clock, CreditCard, Banknote, FileText, Camera, Upload } from 'lucide-react';
import { formatDate, formatDateTime, getCurrentDateForInput } from '../utils/dateUtils';
import PhotoViewer from './PhotoViewer';

interface CreditorDetailProps {
  creditor: Creditor;
  onBack: () => void;
  onAddPayable: (creditorId: string, payable: Omit<Payable, 'id'>) => void;
  onMarkPaid: (creditorId: string, payableId: string) => void;
  onDeleteCreditor: (creditorId: string) => void;
  onDeletePayable: (creditorId: string, payableId: string) => void;
  onAddPayment: (creditorId: string, payableId: string, payment: Omit<Payment, 'id'>) => void;
}

const CreditorDetail: React.FC<CreditorDetailProps> = ({ 
  creditor, 
  onBack, 
  onAddPayable, 
  onMarkPaid,
  onDeleteCreditor,
  onDeletePayable,
  onAddPayment
}) => {
  const [showAddPayable, setShowAddPayable] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState<string | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<{ url: string; title: string } | null>(null);
  const [newPayable, setNewPayable] = useState({
    amount: 0,
    date: getCurrentDateForInput(),
    dueDate: '',
    description: '',
    billPhoto: '',
    category: 'purchase' as Payable['category']
  });
  const [newPayment, setNewPayment] = useState({
    amount: 0,
    date: getCurrentDateForInput(),
    method: 'cash' as Payment['method'],
    description: '',
    receiptPhoto: ''
  });

  const handleAddPayable = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPayable.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    onAddPayable(creditor.id, {
      ...newPayable,
      status: 'unpaid'
    });
    
    setNewPayable({
      amount: 0,
      date: getCurrentDateForInput(),
      dueDate: '',
      description: '',
      billPhoto: '',
      category: 'purchase'
    });
    setShowAddPayable(false);
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddPayment || newPayment.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    onAddPayment(creditor.id, showAddPayment, newPayment);
    
    setNewPayment({
      amount: 0,
      date: getCurrentDateForInput(),
      method: 'cash',
      description: '',
      receiptPhoto: ''
    });
    setShowAddPayment(null);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'payable' | 'payment') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (type === 'payable') {
          setNewPayable(prev => ({ ...prev, billPhoto: result }));
        } else {
          setNewPayment(prev => ({ ...prev, receiptPhoto: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${creditor.name}? This action cannot be undone.`)) {
      onDeleteCreditor(creditor.id);
      onBack();
    }
  };

  const handleDeletePayable = (payableId: string) => {
    if (window.confirm('Are you sure you want to delete this payable? This action cannot be undone.')) {
      onDeletePayable(creditor.id, payableId);
    }
  };

  const handleViewPhoto = (url: string, title: string) => {
    setViewingPhoto({ url, title });
  };

  const handleCallCreditor = () => {
    window.open(`tel:${creditor.mobile}`, '_self');
  };

  const handleEmailCreditor = () => {
    if (creditor.email) {
      window.open(`mailto:${creditor.email}`, '_self');
    }
  };

  const getCategoryColor = (category: Payable['category']) => {
    switch (category) {
      case 'purchase':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'loan':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'service':
        return 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200';
      case 'rent':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
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

  const getTotalPaid = (payable: Payable) => {
    return payable.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  };

  const getRemainingAmount = (payable: Payable) => {
    return payable.amount - getTotalPaid(payable);
  };

  const isOverdue = (payable: Payable) => {
    if (!payable.dueDate || payable.status === 'paid') return false;
    return new Date(payable.dueDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-4 p-2 text-white hover:bg-red-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-white">Creditor Details</h1>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start space-x-6">
            <div className="relative">
              {creditor.photo ? (
                <div className="relative group">
                  <img
                    src={creditor.photo}
                    alt={creditor.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
                  />
                  <button
                    onClick={() => handleViewPhoto(creditor.photo!, `${creditor.name}'s Photo`)}
                    className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Eye className="w-6 h-6 text-white" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center border-4 border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-300 font-medium text-2xl">
                    {creditor.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{creditor.name}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                <button
                  onClick={handleCallCreditor}
                  className="flex items-center hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {creditor.mobile}
                </button>
                
                {creditor.email && (
                  <button
                    onClick={handleEmailCreditor}
                    className="flex items-center hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {creditor.email}
                  </button>
                )}
                
                {creditor.address.street && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {creditor.address.street}
                    {creditor.address.city && `, ${creditor.address.city}`}
                  </div>
                )}
                
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Last bill: {formatDate(creditor.lastPayableDate)}
                </div>
                
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Total owed: <span className={`font-bold ml-1 ${creditor.totalOwed > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    ₹{creditor.totalOwed.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center">
                  <Tag className="w-4 h-4 mr-2" />
                  {creditor.category.charAt(0).toUpperCase() + creditor.category.slice(1)}
                </div>
              </div>
            </div>

            <button
              onClick={handleDelete}
              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete Creditor"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Payable History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payable History</h3>
          <button
            onClick={() => setShowAddPayable(!showAddPayable)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Payable
          </button>
        </div>

        {/* Add Payable Form */}
        {showAddPayable && (
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <form onSubmit={handleAddPayable} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    value={newPayable.amount || ''}
                    onChange={(e) => setNewPayable(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                    value={newPayable.date}
                    onChange={(e) => setNewPayable(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newPayable.dueDate}
                    onChange={(e) => setNewPayable(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newPayable.category}
                    onChange={(e) => setNewPayable(prev => ({ ...prev, category: e.target.value as Payable['category'] }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="purchase">Purchase</option>
                    <option value="loan">Loan</option>
                    <option value="service">Service</option>
                    <option value="rent">Rent</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={newPayable.description}
                    onChange={(e) => setNewPayable(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Enter description"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bill Photo (Optional)
                </label>
                {newPayable.billPhoto && (
                  <div className="mb-2 relative group inline-block">
                    <img
                      src={newPayable.billPhoto}
                      alt="Bill"
                      className="w-20 h-20 object-cover rounded border border-gray-300 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => handleViewPhoto(newPayable.billPhoto, 'Bill Photo Preview')}
                      className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye className="w-4 h-4 text-white" />
                    </button>
                  </div>
                )}
                <div className="flex space-x-2">
                  <label className="cursor-pointer bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors flex items-center">
                    <Camera className="w-3 h-3 mr-1" />
                    Camera
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handlePhotoUpload(e, 'payable')}
                      className="hidden"
                    />
                  </label>
                  <label className="cursor-pointer bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors flex items-center">
                    <Upload className="w-3 h-3 mr-1" />
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, 'payable')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Add Payable
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddPayable(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Payables List */}
        <div className="p-6">
          {creditor.payables.length > 0 ? (
            <div className="space-y-6">
              {creditor.payables
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((payable) => {
                  const totalPaid = getTotalPaid(payable);
                  const remainingAmount = getRemainingAmount(payable);
                  const isFullyPaid = remainingAmount <= 0;
                  const overdue = isOverdue(payable);

                  return (
                    <div
                      key={payable.id}
                      className={`border rounded-lg p-4 space-y-4 ${
                        overdue 
                          ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20' 
                          : 'border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      {/* Payable Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {isFullyPaid ? (
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                          ) : (
                            <XCircle className={`w-6 h-6 ${overdue ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`} />
                          )}
                          
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              ₹{payable.amount.toLocaleString()}
                            </p>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <p>{formatDate(payable.date)}</p>
                              {payable.dueDate && (
                                <p className={overdue ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                                  Due: {formatDate(payable.dueDate)}
                                  {overdue && ' (Overdue)'}
                                </p>
                              )}
                              {payable.description && (
                                <p className="italic">{payable.description}</p>
                              )}
                            </div>
                          </div>
                          
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(payable.category)}`}>
                            {payable.category}
                          </span>
                          
                          {payable.billPhoto && (
                            <div className="relative group">
                              <img
                                src={payable.billPhoto}
                                alt="Bill"
                                className="w-12 h-12 object-cover rounded border border-gray-300 dark:border-gray-600"
                              />
                              <button
                                onClick={() => handleViewPhoto(
                                  payable.billPhoto!, 
                                  `Bill - ${creditor.name} - ${formatDate(payable.date)}`
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
                              onClick={() => setShowAddPayment(payable.id)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                            >
                              Add Payment
                            </button>
                          )}

                          <button
                            onClick={() => handleDeletePayable(payable.id)}
                            className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Delete Payable"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Payment History */}
                      {payable.payments && payable.payments.length > 0 && (
                        <div className="ml-10 space-y-2">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment History:</h4>
                          {payable.payments.map((payment) => (
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
                                        `Receipt - ${creditor.name} - ${formatDateTime(payment.date)}`
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
                      {showAddPayment === payable.id && (
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
              <p>No payables yet</p>
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

export default CreditorDetail;