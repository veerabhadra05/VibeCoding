import React, { useState, useMemo } from 'react';
import { Customer } from '../types/Customer';
import { Search, Filter, ArrowUpDown, Phone, MapPin, Calendar, CheckCircle, XCircle, Clock, ChevronDown, Mail } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

interface CustomerListProps {
  customers: Customer[];
  onCustomerSelect: (customer: Customer) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ customers, onCustomerSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'amount-low' | 'amount-high' | 'date'>('name-asc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [filterArea, setFilterArea] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);

  const areas = useMemo(() => {
    return Array.from(new Set(customers.map(c => c.address.street).filter(Boolean)));
  }, [customers]);

  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = customers.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.mobile.includes(searchTerm) ||
                           (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
      const matchesArea = !filterArea || customer.address.street === filterArea;
      
      return matchesSearch && matchesStatus && matchesArea;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'amount-low':
          return a.totalDue - b.totalDue;
        case 'amount-high':
          return b.totalDue - a.totalDue;
        case 'date':
          return new Date(b.lastTransactionDate).getTime() - new Date(a.lastTransactionDate).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [customers, searchTerm, sortBy, filterStatus, filterArea]);

  const getSortLabel = () => {
    switch (sortBy) {
      case 'name-asc': return 'A-Z';
      case 'name-desc': return 'Z-A';
      case 'amount-low': return 'Amount: Low to High';
      case 'amount-high': return 'Amount: High to Low';
      case 'date': return 'Date';
      default: return 'Sort';
    }
  };

  const getStatusIcon = (status: Customer['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'unpaid':
        return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'partial':
        return <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
    }
  };

  const getStatusColor = (status: Customer['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'unpaid':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'partial':
        return 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200';
    }
  };

  const handleCallCustomer = (e: React.MouseEvent, mobile: string) => {
    e.stopPropagation();
    window.open(`tel:${mobile}`, '_self');
  };

  const handleEmailCustomer = (e: React.MouseEvent, email: string) => {
    e.stopPropagation();
    window.open(`mailto:${email}`, '_self');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Customer Management</h2>
        
        {/* Mobile-Optimized Search and Controls */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Sort Button */}
              <div className="relative">
                <button
                  onClick={() => setShowSortOptions(!showSortOptions)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  <span className="text-sm font-medium">{getSortLabel()}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showSortOptions ? 'rotate-180' : ''}`} />
                </button>

                {/* Sort Dropdown */}
                {showSortOptions && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
                    <div className="py-2">
                      <button
                        onClick={() => { setSortBy('name-asc'); setShowSortOptions(false); }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        A-Z
                      </button>
                      <button
                        onClick={() => { setSortBy('name-desc'); setShowSortOptions(false); }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        Z-A
                      </button>
                      <button
                        onClick={() => { setSortBy('amount-low'); setShowSortOptions(false); }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        Amount: Low to High
                      </button>
                      <button
                        onClick={() => { setSortBy('amount-high'); setShowSortOptions(false); }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        Amount: High to Low
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Date Sort Button */}
            <button
              onClick={() => setSortBy('date')}
              className={`p-2 rounded-lg transition-colors ${
                sortBy === 'date' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
              title="Sort by Date"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'paid' | 'unpaid')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>

              {areas.length > 0 && (
                <select
                  value={filterArea}
                  onChange={(e) => setFilterArea(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">All Areas</option>
                  {areas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Customer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedCustomers.map((customer) => (
          <div
            key={customer.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onCustomerSelect(customer)}
          >
            <div className="p-6">
              {/* Customer Header */}
              <div className="flex items-center mb-4">
                {customer.photo ? (
                  <img
                    src={customer.photo}
                    alt={customer.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-gray-600 dark:text-gray-300 font-medium text-lg">
                      {customer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{customer.name}</h3>
                  <button
                    onClick={(e) => handleCallCustomer(e, customer.mobile)}
                    className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    {customer.mobile}
                  </button>
                </div>
                {getStatusIcon(customer.status)}
              </div>

              {/* Customer Details */}
              <div className="space-y-2 mb-4">
                {customer.email && (
                  <button
                    onClick={(e) => handleEmailCustomer(e, customer.email)}
                    className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {customer.email}
                  </button>
                )}
                {customer.address.street && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4 mr-2" />
                    {customer.address.street}
                    {customer.address.city && `, ${customer.address.city}`}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4 mr-2" />
                  Last transaction: {formatDate(customer.lastTransactionDate)}
                </div>
              </div>

              {/* Amount Due */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Amount Due</p>
                  <p className={`text-xl font-bold ${customer.totalDue > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    ₹{customer.totalDue.toLocaleString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                  {customer.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedCustomers.length === 0 && (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <div className="text-gray-400 mb-4">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No customers found</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default CustomerList;