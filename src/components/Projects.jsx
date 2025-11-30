import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, DollarSign, Search, Filter, X, Calendar } from 'lucide-react';
import { projectsAPI } from '../services/api';

export default function Projects({ projects, clients, addProject, updateProject, deleteProject, loadAllData }) {
    const [showForm, setShowForm] = useState(false);
    const [showPaymentForm, setShowPaymentForm] = useState(null);
    const [showPaymentHistory, setShowPaymentHistory] = useState(null);
    const [projectPayments, setProjectPayments] = useState({});
    const [paymentSummaries, setPaymentSummaries] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [clientFilter, setClientFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [formData, setFormData] = useState({
      name: '',
      clientId: '',
      description: '',
      budget: '',
      deadline: '',
      progress: 0
    });
    const [paymentFormData, setPaymentFormData] = useState({
      amount: '',
      paymentMethod: 'Bank Transfer',
      notes: ''
    });
  
    const handleSubmit = (e) => {
      e.preventDefault();
      const client = clients.find(c => c.id === parseInt(formData.clientId));
      addProject({
        ...formData,
        clientName: client ? client.name : 'Unknown',
        budget: parseFloat(formData.budget)
      });
      setFormData({ name: '', clientId: '', description: '', budget: '', deadline: '', progress: 0 });
      setShowForm(false);
    };
  
    const loadPaymentSummary = async (projectId) => {
      try {
        const response = await projectsAPI.getPaymentSummary(projectId);
        setPaymentSummaries(prev => ({
          ...prev,
          [projectId]: response.data
        }));
      } catch (error) {
        console.error('Error loading payment summary:', error);
      }
    };
  
    const loadProjectPayments = async (projectId) => {
      try {
        const response = await projectsAPI.getPayments(projectId);
        setProjectPayments(prev => ({
          ...prev,
          [projectId]: response.data
        }));
      } catch (error) {
        console.error('Error loading payments:', error);
      }
    };
  
    const handleAddPayment = async (projectId) => {
      // Validation
      if (!paymentFormData.amount || parseFloat(paymentFormData.amount) <= 0) {
        alert('Please enter a valid payment amount');
        return;
      }
  
      try {
        const response = await projectsAPI.createPayment(projectId, {
          amount: parseFloat(paymentFormData.amount),
          paymentMethod: paymentFormData.paymentMethod,
          notes: paymentFormData.notes
        });
        
        console.log('Payment created:', response.data);
        
        // Reset form and close
        setPaymentFormData({ amount: '', paymentMethod: 'Bank Transfer', notes: '' });
        setShowPaymentForm(null);
        
        // Reload payment data
        await loadPaymentSummary(projectId);
        await loadProjectPayments(projectId);
        
        // Reload all data to update transactions and revenue
        await loadAllData();
        
        alert('Payment added successfully! Revenue has been updated.');
      } catch (error) {
        console.error('Error adding payment:', error);
        const errorMsg = error.response?.data?.error || error.message || 'Unknown error';
        alert(`Error adding payment: ${errorMsg}\n\nPlease check:\n1. Backend server is running\n2. Database migration has been run\n3. Browser console for details`);
      }
    };
  
    const handleDeletePayment = async (projectId, paymentId) => {
      if (!confirm('Are you sure you want to delete this payment?')) return;
      
      try {
        await projectsAPI.deletePayment(projectId, paymentId);
        await loadPaymentSummary(projectId);
        await loadProjectPayments(projectId);
        // Reload all data to update dashboard (revenue/transactions)
        await loadAllData();
        alert('Payment deleted successfully!');
      } catch (error) {
        console.error('Error deleting payment:', error);
        alert('Error deleting payment');
      }
    };
  
    const handleShowPaymentHistory = async (projectId) => {
      setShowPaymentHistory(projectId);
      await loadProjectPayments(projectId);
    };
  
    useEffect(() => {
      // Load payment summaries for all projects
      projects.forEach(project => {
        loadPaymentSummary(project.id);
      });
    }, [projects]);

    const filteredProjects = useMemo(() => {
      let filtered = projects.filter(project => {
        // Search filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          const matchesSearch = 
            project.name?.toLowerCase().includes(searchLower) ||
            project.description?.toLowerCase().includes(searchLower) ||
            (project.clientName || project.client_name)?.toLowerCase().includes(searchLower);
          if (!matchesSearch) return false;
        }

        // Status filter
        if (statusFilter !== 'all' && project.status !== statusFilter) return false;

        // Client filter
        if (clientFilter !== 'all' && project.clientId !== parseInt(clientFilter) && project.client_id !== parseInt(clientFilter)) return false;

        // Date filter
        if (dateFilter !== 'all' && project.deadline) {
          const deadline = new Date(project.deadline);
          const now = new Date();
          if (dateFilter === 'overdue' && deadline >= now) return false;
          if (dateFilter === 'thisMonth') {
            const month = now.getMonth();
            const year = now.getFullYear();
            if (deadline.getMonth() !== month || deadline.getFullYear() !== year) return false;
          }
          if (dateFilter === 'nextMonth') {
            const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const month = nextMonth.getMonth();
            const year = nextMonth.getFullYear();
            if (deadline.getMonth() !== month || deadline.getFullYear() !== year) return false;
          }
        }

        return true;
      });

      return filtered;
    }, [projects, searchTerm, statusFilter, clientFilter, dateFilter]);

    const stats = useMemo(() => {
      const active = projects.filter(p => p.status === 'active').length;
      const completed = projects.filter(p => p.status === 'completed').length;
      const totalBudget = projects.reduce((sum, p) => sum + parseFloat(p.budget || 0), 0);
      return { active, completed, total: projects.length, totalBudget };
    }, [projects]);
  
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-sm text-gray-600 mt-1">
              Active: {stats.active} | Completed: {stats.completed} | Total: {stats.total}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Project</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects by name, description, or client..."
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
              {(searchTerm || statusFilter !== 'all' || clientFilter !== 'all' || dateFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setClientFilter('all');
                    setDateFilter('all');
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                <select
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value="all">All Clients</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value="all">All Dates</option>
                  <option value="overdue">Overdue</option>
                  <option value="thisMonth">This Month</option>
                  <option value="nextMonth">Next Month</option>
                </select>
              </div>
            </div>
          )}
        </div>
  
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Project Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">Select Client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Budget"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline *</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
                </div>
              </div>
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                rows="3"
              />
              <div className="flex space-x-3">
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Create Project
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
  
        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">
              {searchTerm || statusFilter !== 'all' || clientFilter !== 'all' || dateFilter !== 'all'
                ? 'No projects found matching your filters.'
                : 'No projects yet. Create your first project to get started!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map(project => {
            const summary = paymentSummaries[project.id] || {};
            return (
              <div key={project.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                    <p className="text-gray-600 mb-2">{project.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Client: {project.clientName || project.client_name}</span>
                      <span>Budget: PKR {parseFloat(project.budget).toFixed(2)}</span>
                      <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                      <span className={`px-3 py-1 rounded-full ${
                        project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateProject(project.id, { 
                        status: project.status === 'active' ? 'completed' : 'active'
                      })}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      {project.status === 'active' ? 'Complete' : 'Reopen'}
                    </button>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
  
                {/* Payment Tracking Section */}
                <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-800">Payment Tracking</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowPaymentForm(project.id)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        <DollarSign className="w-4 h-4" />
                        <span>Add Payment</span>
                      </button>
                      <button
                        onClick={() => handleShowPaymentHistory(project.id)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        View History
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-600">Total Budget</p>
                      <p className="text-lg font-bold text-gray-800">PKR {summary.budget?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Total Paid</p>
                      <p className="text-lg font-bold text-green-600">PKR {summary.totalPaid?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Remaining</p>
                      <p className="text-lg font-bold text-orange-600">PKR {summary.remaining?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
  
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Payment Progress</span>
                    <span className="font-semibold">{summary.percentagePaid?.toFixed(1) || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        (summary.percentagePaid || 0) >= 100 ? 'bg-green-600' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(summary.percentagePaid || 0, 100)}%` }}
                    />
                  </div>
                </div>
  
                {/* Work Progress Section */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Work Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={project.progress}
                    onChange={(e) => updateProject(project.id, { progress: parseInt(e.target.value) })}
                    className="w-full mt-2"
                  />
                </div>
  
                {/* Add Payment Form */}
                {showPaymentForm === project.id && (
                  <div className="mt-4 p-4 bg-white border-2 border-green-500 rounded-lg">
                    <h4 className="font-semibold mb-3">Add Payment</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Amount"
                        value={paymentFormData.amount}
                        onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        required
                      />
                      <select
                        value={paymentFormData.paymentMethod}
                        onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentMethod: e.target.value })}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Check">Check</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="PayPal">PayPal</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <textarea
                      placeholder="Notes (optional)"
                      value={paymentFormData.notes}
                      onChange={(e) => setPaymentFormData({ ...paymentFormData, notes: e.target.value })}
                      className="w-full mt-3 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                      rows="2"
                    />
                    <div className="flex space-x-3 mt-3">
                      <button
                        onClick={() => handleAddPayment(project.id)}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Save Payment
                      </button>
                      <button
                        onClick={() => {
                          setShowPaymentForm(null);
                          setPaymentFormData({ amount: '', paymentMethod: 'Bank Transfer', notes: '' });
                        }}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
  
                {/* Payment History Modal */}
                {showPaymentHistory === project.id && (
                  <div className="mt-4 p-4 bg-white border-2 border-blue-500 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold">Payment History</h4>
                      <button
                        onClick={() => setShowPaymentHistory(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>
                    {projectPayments[project.id]?.length > 0 ? (
                      <div className="space-y-2">
                        {projectPayments[project.id].map(payment => (
                          <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                            <div className="flex-1">
                              <p className="font-semibold text-green-600">PKR {parseFloat(payment.amount).toFixed(2)}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(payment.payment_date).toLocaleDateString()} • {payment.payment_method}
                              </p>
                              {payment.notes && <p className="text-sm text-gray-500 mt-1">{payment.notes}</p>}
                            </div>
                            <button
                              onClick={() => handleDeletePayment(project.id, payment.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No payments recorded yet</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          </div>
        )}
      </div>
    );
  };