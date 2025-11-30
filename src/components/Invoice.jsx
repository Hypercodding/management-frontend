import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Printer, Search, Filter, X, Calendar, DollarSign, FileText } from 'lucide-react';

const InvoicesTab = ({ invoices, clients, addInvoice, updateInvoiceStatus, printInvoice, deleteInvoice }) => {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
      clientId: '',
      items: [{ description: '', quantity: 1, rate: 0, commission: 0 }]
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [clientFilter, setClientFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
  
    const handleSubmit = (e) => {
      e.preventDefault();
      
      // Validation
      if (!formData.clientId) {
        alert('Please select a client');
        return;
      }
      
      if (formData.items.some(item => !item.description || item.quantity <= 0 || item.rate <= 0)) {
        alert('Please fill in all required fields for all items');
        return;
      }
      
      const client = clients.find(c => c.id === parseInt(formData.clientId));
      const total = formData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
      
      if (total <= 0) {
        alert('Invoice total must be greater than 0');
        return;
      }
      
      addInvoice({
        clientName: client ? client.name : 'Unknown',
        clientId: formData.clientId,
        items: formData.items,
        total
      });
      
      setFormData({ clientId: '', items: [{ description: '', quantity: 1, rate: 0, commission: 0 }] });
      setShowForm(false);
    };
  
    const addItem = () => {
      setFormData({
        ...formData,
        items: [...formData.items, { description: '', quantity: 1, rate: 0, commission: 0 }]
      });
    };
  
    const updateItem = (index, field, value) => {
      const newItems = [...formData.items];
      if (field === 'description') {
        newItems[index][field] = value;
      } else {
        const numValue = parseFloat(value) || 0;
        if (field === 'quantity' && numValue < 0) return;
        if (field === 'rate' && numValue < 0) return;
        if (field === 'commission' && numValue < 0) return;
        newItems[index][field] = numValue;
      }
      setFormData({ ...formData, items: newItems });
    };
  
    const removeItem = (index) => {
      if (formData.items.length === 1) {
        alert('Invoice must have at least one item');
        return;
      }
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index)
      });
    };

    // Current month calculations
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthInvoices = useMemo(() => {
      return invoices.filter(inv => {
        const invDate = new Date(inv.date || inv.created_at);
        return invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear;
      });
    }, [invoices, currentMonth, currentYear]);

    const stats = useMemo(() => {
      const total = invoices.length;
      const paid = invoices.filter(inv => inv.status === 'paid').length;
      const unpaid = invoices.filter(inv => inv.status === 'unpaid').length;
      const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
      const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
      const unpaidAmount = invoices.filter(inv => inv.status === 'unpaid').reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
      const currentMonthTotal = currentMonthInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
      const currentMonthPaid = currentMonthInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
      return { total, paid, unpaid, totalAmount, paidAmount, unpaidAmount, currentMonthTotal, currentMonthPaid };
    }, [invoices, currentMonthInvoices]);

    const filteredAndSortedInvoices = useMemo(() => {
      let filtered = invoices.filter(invoice => {
        // Search filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          const matchesSearch = 
            invoice.id?.toString().includes(searchLower) ||
            (invoice.clientName || invoice.client_name)?.toLowerCase().includes(searchLower) ||
            invoice.items?.some(item => item.description?.toLowerCase().includes(searchLower));
          if (!matchesSearch) return false;
        }

        // Status filter
        if (statusFilter !== 'all' && invoice.status !== statusFilter) return false;

        // Client filter
        if (clientFilter !== 'all') {
          const clientId = invoice.clientId || invoice.client_id;
          if (clientId !== parseInt(clientFilter)) return false;
        }

        // Date filter
        if (dateFilter !== 'all') {
          const invDate = new Date(invoice.date || invoice.created_at);
          const now = new Date();
          
          if (dateFilter === 'today') {
            if (invDate.toDateString() !== now.toDateString()) return false;
          } else if (dateFilter === 'thisWeek') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (invDate < weekAgo) return false;
          } else if (dateFilter === 'thisMonth') {
            if (invDate.getMonth() !== now.getMonth() || invDate.getFullYear() !== now.getFullYear()) return false;
          } else if (dateFilter === 'lastMonth') {
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            if (invDate < lastMonth || invDate >= thisMonth) return false;
          }
        }

        return true;
      });

      // Sort
      filtered.sort((a, b) => {
        let aVal, bVal;
        
        if (sortBy === 'date') {
          aVal = new Date(a.date || a.created_at).getTime();
          bVal = new Date(b.date || b.created_at).getTime();
        } else if (sortBy === 'amount') {
          aVal = parseFloat(a.total || 0);
          bVal = parseFloat(b.total || 0);
        } else if (sortBy === 'client') {
          aVal = (a.clientName || a.client_name || '').toLowerCase();
          bVal = (b.clientName || b.client_name || '').toLowerCase();
        } else {
          aVal = a.id;
          bVal = b.id;
        }
        
        return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
      });

      return filtered;
    }, [invoices, searchTerm, statusFilter, clientFilter, dateFilter, sortBy, sortOrder]);
  
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
            <p className="text-sm text-gray-600 mt-1">
              Total: {stats.total} | Paid: {stats.paid} | Unpaid: {stats.unpaid}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Invoice</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-xl font-bold text-gray-900">PKR {stats.totalAmount.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paid Amount</p>
                <p className="text-xl font-bold text-green-600">PKR {stats.paidAmount.toFixed(2)}</p>
              </div>
              <FileText className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unpaid Amount</p>
                <p className="text-xl font-bold text-orange-600">PKR {stats.unpaidAmount.toFixed(2)}</p>
              </div>
              <FileText className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-xl font-bold text-blue-600">PKR {stats.currentMonthTotal.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">Paid: PKR {stats.currentMonthPaid.toFixed(2)}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by invoice ID, client name, or item description..."
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
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="thisWeek">This Week</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  >
                    <option value="date">Date</option>
                    <option value="amount">Amount</option>
                    <option value="client">Client</option>
                    <option value="id">Invoice ID</option>
                  </select>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  >
                    <option value="desc">Desc</option>
                    <option value="asc">Asc</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
  
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create New Invoice</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              >
                <option value="">Select Client *</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
  
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Invoice Items</h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>
                <div className="border rounded-lg p-4 space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 bg-gray-50 rounded">
                      <input
                        type="text"
                        placeholder="Description *"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className="col-span-4 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        required
                      />
                      <input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Qty *"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        className="col-span-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        required
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Rate *"
                        value={item.rate}
                        onChange={(e) => updateItem(index, 'rate', e.target.value)}
                        className="col-span-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        required
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Commission"
                        value={item.commission}
                        onChange={(e) => updateItem(index, 'commission', e.target.value)}
                        className="col-span-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                      <div className="col-span-1 text-center font-semibold text-sm text-gray-700">
                        PKR {(item.quantity * item.rate).toFixed(2)}
                      </div>
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="col-span-1 text-red-600 hover:text-red-800 flex justify-center"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
  
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-700">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    PKR {formData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0).toFixed(2)}
                  </span>
                </div>
                {formData.items.some(item => item.commission > 0) && (
                  <div className="mt-2 pt-2 border-t border-blue-200">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Total Commission:</span>
                      <span className="font-semibold text-green-600">
                        PKR {formData.items.reduce((sum, item) => sum + parseFloat(item.commission || 0), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
  
              <div className="flex space-x-3">
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Create Invoice
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
  
        {filteredAndSortedInvoices.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">
              {searchTerm || statusFilter !== 'all' || clientFilter !== 'all' || dateFilter !== 'all'
                ? 'No invoices found matching your filters.'
                : 'No invoices yet. Create your first invoice to get started!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedInvoices.map(invoice => (
              <div key={invoice.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">Invoice #{invoice.id}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        invoice.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {invoice.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">Client:</span> {invoice.clientName || invoice.client_name}</p>
                      <p><span className="font-medium">Date:</span> {new Date(invoice.date || invoice.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-3">PKR {parseFloat(invoice.total).toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => printInvoice(invoice)}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print</span>
                    </button>
                    {invoice.status === 'unpaid' && (
                      <button
                        onClick={() => {
                          if (confirm(`Mark invoice #${invoice.id} as paid?`)) {
                            updateInvoiceStatus(invoice.id, 'paid');
                          }
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Mark Paid
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete invoice #${invoice.id}? This action cannot be undone.`)) {
                          deleteInvoice(invoice.id);
                        }
                      }}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold mb-3 text-gray-900">Items:</h4>
                  <div className="space-y-2">
                    {invoice.items && invoice.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">{item.description}</span>
                          <span className="text-gray-500 text-sm ml-2">({item.quantity} × PKR {parseFloat(item.rate).toFixed(2)})</span>
                          {item.commission > 0 && (
                            <span className="text-green-600 text-sm ml-2 font-medium">
                              Commission: PKR {parseFloat(item.commission).toFixed(2)}
                            </span>
                          )}
                        </div>
                        <span className="font-semibold text-gray-900">PKR {(item.quantity * parseFloat(item.rate)).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  export default InvoicesTab;
