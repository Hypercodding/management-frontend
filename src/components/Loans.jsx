import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, X, CreditCard, DollarSign } from 'lucide-react';
import { loansAPI } from '../services/api';

const LoansTab = ({ loans, employees, setLoans, loadAllData }) => {
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [formData, setFormData] = useState({
      employee_id: '',
      loan_type: 'Personal Loan',
      loan_amount: '',
      interest_rate: '5',
      monthly_installment: '',
      installments_total: '12',
      loan_date: new Date().toISOString().split('T')[0],
      first_payment_date: ''
    });
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      // Validation
      if (!formData.employee_id) {
        alert('Please select an employee');
        return;
      }
      if (parseFloat(formData.loan_amount) <= 0) {
        alert('Loan amount must be greater than 0');
        return;
      }
      if (parseFloat(formData.monthly_installment) <= 0) {
        alert('Monthly installment must be greater than 0');
        return;
      }
      if (parseInt(formData.installments_total) <= 0) {
        alert('Number of installments must be greater than 0');
        return;
      }
      
      try {
        const response = await loansAPI.create({
          ...formData,
          employee_id: parseInt(formData.employee_id),
          loan_amount: parseFloat(formData.loan_amount),
          interest_rate: parseFloat(formData.interest_rate),
          monthly_installment: parseFloat(formData.monthly_installment),
          installments_total: parseInt(formData.installments_total)
        });
        setLoans([...loans, response.data]);
        setFormData({
          employee_id: '', loan_type: 'Personal Loan', loan_amount: '', interest_rate: '5',
          monthly_installment: '', installments_total: '12',
          loan_date: new Date().toISOString().split('T')[0], first_payment_date: ''
        });
        setShowForm(false);
        alert('Loan created successfully!');
      } catch (error) {
        console.error('Error adding loan:', error);
        alert('Error adding loan: ' + (error.response?.data?.error || error.message));
      }
    };

    const stats = useMemo(() => {
      const total = loans.length;
      const totalAmount = loans.reduce((sum, loan) => sum + parseFloat(loan.total_amount || 0), 0);
      const totalPaid = loans.reduce((sum, loan) => sum + parseFloat(loan.amount_paid || 0), 0);
      const totalRemaining = loans.reduce((sum, loan) => sum + parseFloat(loan.amount_remaining || 0), 0);
      const active = loans.filter(loan => loan.status !== 'completed').length;
      const completed = loans.filter(loan => loan.status === 'completed').length;
      return { total, totalAmount, totalPaid, totalRemaining, active, completed };
    }, [loans]);

    const filteredLoans = useMemo(() => {
      let filtered = loans.filter(loan => {
        // Search filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          const employee = employees.find(e => e.id === loan.employee_id);
          if (!employee?.name?.toLowerCase().includes(searchLower) &&
              !loan.loan_type?.toLowerCase().includes(searchLower)) {
            return false;
          }
        }

        // Status filter
        if (statusFilter !== 'all' && loan.status !== statusFilter) return false;

        return true;
      });

      // Sort by loan date (newest first)
      filtered.sort((a, b) => {
        const dateA = new Date(a.loan_date).getTime();
        const dateB = new Date(b.loan_date).getTime();
        return dateB - dateA;
      });

      return filtered;
    }, [loans, employees, searchTerm, statusFilter]);
  
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Loan Management</h1>
            <p className="text-sm text-gray-600 mt-1">
              Total: {stats.total} | Active: {stats.active} | Completed: {stats.completed}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Loan</span>
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Loan Amount</p>
            <p className="text-xl font-bold text-gray-900">PKR {stats.totalAmount.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Paid</p>
            <p className="text-xl font-bold text-green-600">PKR {stats.totalPaid.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Remaining</p>
            <p className="text-xl font-bold text-orange-600">PKR {stats.totalRemaining.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Completion Rate</p>
            <p className="text-xl font-bold text-blue-600">
              {stats.total > 0 ? ((stats.totalPaid / stats.totalAmount) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by employee name or loan type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                  showFilters ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              {(searchTerm || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
  
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">Select Employee *</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} - {emp.position}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Loan Type *"
                  value={formData.loan_type}
                  onChange={(e) => setFormData({ ...formData, loan_type: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Loan Amount *"
                  value={formData.loan_amount}
                  onChange={(e) => setFormData({ ...formData, loan_amount: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Interest Rate % *"
                  value={formData.interest_rate}
                  onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Monthly Installment *"
                  value={formData.monthly_installment}
                  onChange={(e) => setFormData({ ...formData, monthly_installment: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
                <input
                  type="number"
                  placeholder="Number of Installments *"
                  value={formData.installments_total}
                  onChange={(e) => setFormData({ ...formData, installments_total: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loan Date *</label>
                <input
                  type="date"
                  value={formData.loan_date}
                  onChange={(e) => setFormData({ ...formData, loan_date: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Payment Date *</label>
                <input
                  type="date"
                  value={formData.first_payment_date}
                  onChange={(e) => setFormData({ ...formData, first_payment_date: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
                </div>
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Create Loan
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
  
        {filteredLoans.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">
              {searchTerm || statusFilter !== 'all'
                ? 'No loans found matching your filters.'
                : 'No loans yet. Create your first loan to get started!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredLoans.map(loan => (
            <div key={loan.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{loan.employee_name}</h3>
                  <p className="text-gray-600">{loan.loan_type}</p>
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Loan Amount</p>
                      <p className="text-lg font-bold">PKR {parseFloat(loan.total_amount).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Paid</p>
                      <p className="text-lg font-bold text-green-600">PKR {parseFloat(loan.amount_paid || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Remaining</p>
                      <p className="text-lg font-bold text-orange-600">PKR {parseFloat(loan.amount_remaining).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                        loan.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {loan.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${((parseFloat(loan.amount_paid || 0) / parseFloat(loan.total_amount)) * 100).toFixed(0)}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {loan.installments_paid || 0} / {loan.installments_total} installments paid
                    </p>
                  </div>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  export default LoansTab;  