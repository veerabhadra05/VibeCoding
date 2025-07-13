import React from 'react';
import { Customer, Creditor, FinancialSummary } from '../types/Customer';
import { Users, DollarSign, AlertTriangle, TrendingUp, Sun, Moon, ArrowUp, ArrowDown, Minus, CreditCard } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

interface DashboardProps {
  customers: Customer[];
  creditors: Creditor[];
  onViewCustomers: () => void;
  onViewCreditors: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  userName: string;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  customers, 
  creditors,
  onViewCustomers,
  onViewCreditors,
  isDark, 
  onToggleTheme, 
  userName 
}) => {
  const totalCustomers = customers.length;
  const totalCreditors = creditors.length;
  const unpaidCustomers = customers.filter(c => c.status === 'unpaid');
  const unpaidCreditors = creditors.filter(c => c.status === 'unpaid');
  
  const totalReceivables = customers.reduce((sum, c) => sum + c.totalDue, 0);
  const totalPayables = creditors.reduce((sum, c) => sum + c.totalOwed, 0);
  const netPosition = totalReceivables - totalPayables;
  
  const overdueCustomers = customers.filter(c => {
    const lastTransaction = new Date(c.lastTransactionDate);
    const daysDiff = Math.floor((Date.now() - lastTransaction.getTime()) / (1000 * 60 * 60 * 24));
    return c.status === 'unpaid' && daysDiff > 30;
  });

  const overdueCreditors = creditors.filter(c => {
    return c.payables.some(p => {
      if (!p.dueDate || p.status === 'paid') return false;
      return new Date(p.dueDate) < new Date();
    });
  });

  const recentTransactions = customers
    .flatMap(c => 
      c.transactions.map(t => ({ ...t, customerName: c.name, customerId: c.id, type: 'receivable' as const }))
    )
    .concat(
      creditors.flatMap(c =>
        c.payables.map(p => ({ ...p, customerName: c.name, customerId: c.id, type: 'payable' as const }))
      )
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  const StatCard = ({ icon: Icon, title, value, bgColor, textColor, subtitle, onClick }: any) => (
    <div 
      className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className={`p-2 ${bgColor} rounded-lg`}>
          <Icon className={`w-4 h-4 md:w-6 md:h-6 ${textColor}`} />
        </div>
        <div className="ml-3 md:ml-4">
          <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const getNetPositionColor = () => {
    if (netPosition > 0) return 'text-green-600 dark:text-green-400';
    if (netPosition < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getNetPositionIcon = () => {
    if (netPosition > 0) return ArrowUp;
    if (netPosition < 0) return ArrowDown;
    return Minus;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 md:p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold mb-2">Welcome, {userName}</h1>
            <p className="text-blue-100 text-sm">Manage your financial relationships efficiently</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleTheme}
              className="p-2 bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <ArrowUp className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Money to Receive</span>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{totalReceivables.toLocaleString()}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">{unpaidCustomers.length} pending customers</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <ArrowDown className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Money to Pay</span>
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">₹{totalPayables.toLocaleString()}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">{unpaidCreditors.length} pending creditors</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              {React.createElement(getNetPositionIcon(), { className: `w-5 h-5 ${getNetPositionColor()} mr-2` })}
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Position</span>
            </div>
            <p className={`text-2xl font-bold ${getNetPositionColor()}`}>
              ₹{Math.abs(netPosition).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {netPosition > 0 ? 'Net receivable' : netPosition < 0 ? 'Net payable' : 'Balanced'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard
          icon={Users}
          title="Customers"
          value={totalCustomers}
          subtitle={`${unpaidCustomers.length} unpaid`}
          bgColor="bg-blue-100 dark:bg-blue-900"
          textColor="text-blue-600 dark:text-blue-400"
          onClick={onViewCustomers}
        />
        <StatCard
          icon={CreditCard}
          title="Creditors"
          value={totalCreditors}
          subtitle={`${unpaidCreditors.length} unpaid`}
          bgColor="bg-red-100 dark:bg-red-900"
          textColor="text-red-600 dark:text-red-400"
          onClick={onViewCreditors}
        />
        <StatCard
          icon={AlertTriangle}
          title="Overdue Receivables"
          value={overdueCustomers.length}
          bgColor="bg-amber-100 dark:bg-amber-900"
          textColor="text-amber-600 dark:text-amber-400"
          onClick={onViewCustomers}
        />
        <StatCard
          icon={TrendingUp}
          title="Overdue Payables"
          value={overdueCreditors.length}
          bgColor="bg-orange-100 dark:bg-orange-900"
          textColor="text-orange-600 dark:text-orange-400"
          onClick={onViewCreditors}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
          </div>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction, index) => (
                <div key={`${transaction.id}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'receivable' 
                        ? 'bg-green-100 dark:bg-green-900' 
                        : 'bg-red-100 dark:bg-red-900'
                    }`}>
                      {transaction.type === 'receivable' ? (
                        <ArrowUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{transaction.customerName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(transaction.date)} • {transaction.type === 'receivable' ? 'Receivable' : 'Payable'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'receivable' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.type === 'receivable' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      transaction.status === 'paid' 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                        : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                    }`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No transactions yet</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Priority Actions</h2>
          <div className="space-y-3">
            {overdueCustomers.slice(0, 3).map((customer) => (
              <div key={customer.id} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{customer.name}</p>
                    <p className="text-sm text-amber-600 dark:text-amber-400">Overdue receivable</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-amber-600 dark:text-amber-400">₹{customer.totalDue.toLocaleString()}</p>
                </div>
              </div>
            ))}
            
            {overdueCreditors.slice(0, 3).map((creditor) => (
              <div key={creditor.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{creditor.name}</p>
                    <p className="text-sm text-red-600 dark:text-red-400">Overdue payable</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600 dark:text-red-400">₹{creditor.totalOwed.toLocaleString()}</p>
                </div>
              </div>
            ))}
            
            {overdueCustomers.length === 0 && overdueCreditors.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">All payments are up to date!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;