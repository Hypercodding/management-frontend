import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, FileText, Package, DollarSign, Users, FolderOpen, Printer, Trash2, UserCheck, Banknote, CreditCard, Briefcase, Edit, Menu, X, Check } from 'lucide-react';
import {
  clientsAPI,
  projectsAPI,
  inventoryAPI,
  invoicesAPI,
  expensesAPI,
  transactionsAPI,
  employeesAPI,
  salariesAPI,
  loansAPI,
  advancesAPI
} from '../services/api';
import ClientsTab from './Clients';
import ProjectsTab from './Projects';
import InventoryTab from './Inventory';
import InvoicesTab from './Invoice';
import EmployeesTab from './Employee';
import SalariesTab from './Salary';
import LoansTab from './Loans';
import ExpensesTab from './Expense';
import printInvoice from '../utils/printInvoice';
import printReceipt from '../utils/printReceipt';
import {
  fetchAllData,
  setClients as setClientsAction,
  addClient as addClientAction,
  removeClient as removeClientAction,
  setProjects as setProjectsAction,
  addProject as addProjectAction,
  updateProjectInState as updateProjectInStore,
  removeProject as removeProjectAction,
  setInventory as setInventoryAction,
  addInventoryItem as addInventoryItemAction,
  updateInventoryItem as updateInventoryItemAction,
  removeInventoryItem as removeInventoryItemAction,
  setInvoices as setInvoicesAction,
  addInvoice as addInvoiceAction,
  updateInvoiceInState as updateInvoiceInStore,
  removeInvoice as removeInvoiceAction,
  setExpenses as setExpensesAction,
  setTransactions as setTransactionsAction,
  setEmployees as setEmployeesAction,
  setSalaries as setSalariesAction,
  setLoans as setLoansAction,
  setAdvances as setAdvancesAction,
} from '../store/dataSlice';

const BusinessManagementApp = () => {
  const dispatch = useDispatch();
  const {
    clients,
    projects,
    inventory,
    transactions,
    invoices,
    expenses,
    employees,
    salaries,
    loans,
    advances,
  } = useSelector((state) => state.data);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  
  // Date range for dashboard (default to current month)
  const getCurrentMonthRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0]
    };
  };
  const currentMonthRange = getCurrentMonthRange();
  const [dashboardDateRange, setDashboardDateRange] = useState({
    startDate: currentMonthRange.start,
    endDate: currentMonthRange.end
  });
  const [paymentFilters, setPaymentFilters] = useState({
    search: '',
    type: 'all',
    category: 'all',
    source: 'all',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: ''
  });

  const loadAllData = useCallback(
    async (showLoading = false) => {
    try {
        if (showLoading) {
      setLoading(true);
        }
        await dispatch(fetchAllData()).unwrap();
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data. Please make sure the backend server is running and migrations are applied.');
    } finally {
        if (showLoading) {
      setLoading(false);
    }
      }
    },
    [dispatch]
  );

  // Load data from API on mount
  useEffect(() => {
    loadAllData(true);
  }, [loadAllData]);

  const refreshData = useCallback(
    async (entities = []) => {
      const fetchMap = {
        clients: clientsAPI.getAll,
        projects: projectsAPI.getAll,
        inventory: inventoryAPI.getAll,
        transactions: transactionsAPI.getAll,
        invoices: invoicesAPI.getAll,
        expenses: expensesAPI.getAll,
        employees: () => employeesAPI.getAll().catch(() => ({ data: [] })),
        salaries: () => salariesAPI.getAll().catch(() => ({ data: [] })),
        loans: () => loansAPI.getAll().catch(() => ({ data: [] })),
        advances: () => advancesAPI.getAll().catch(() => ({ data: [] })),
      };

      const setMap = {
        clients: (data) => dispatch(setClientsAction(data)),
        projects: (data) => dispatch(setProjectsAction(data)),
        inventory: (data) => dispatch(setInventoryAction(data)),
        transactions: (data) => dispatch(setTransactionsAction(data)),
        invoices: (data) => dispatch(setInvoicesAction(data)),
        expenses: (data) => dispatch(setExpensesAction(data)),
        employees: (data) => dispatch(setEmployeesAction(data)),
        salaries: (data) => dispatch(setSalariesAction(data)),
        loans: (data) => dispatch(setLoansAction(data)),
        advances: (data) => dispatch(setAdvancesAction(data)),
      };

      await Promise.all(
        entities.map(async (entity) => {
          const fetcher = fetchMap[entity];
          const setter = setMap[entity];
          if (!fetcher || !setter) return;
          try {
            const response = await fetcher();
            setter(response.data);
          } catch (error) {
            console.error(`Error refreshing ${entity}:`, error);
          }
        })
      );
    },
    [dispatch]
  );

  // Client Management
  const addClient = async (client) => {
    try {
      const response = await clientsAPI.create(client);
      dispatch(addClientAction(response.data));
    } catch (error) {
      console.error('Error adding client:', error);
      alert('Error adding client');
    }
  };

  const deleteClient = async (id) => {
    try {
      await clientsAPI.delete(id);
      dispatch(removeClientAction(id));
      await refreshData(['projects', 'invoices', 'transactions']);
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Error deleting client');
    }
  };

  // Project Management
  const addProject = async (project) => {
    try {
      const response = await projectsAPI.create(project);
      dispatch(addProjectAction(response.data));
    } catch (error) {
      console.error('Error adding project:', error);
      alert('Error adding project');
    }
  };

  const updateProject = async (id, updates) => {
    try {
      const response = await projectsAPI.update(id, updates);
      dispatch(updateProjectInStore({ id, project: response.data }));
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Error updating project');
    }
  };

  const deleteProject = async (id) => {
    try {
      await projectsAPI.delete(id);
      dispatch(removeProjectAction(id));
      await refreshData(['transactions']);
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project');
    }
  };

  // Inventory Management
  const addInventoryItem = async (item) => {
    try {
      const response = await inventoryAPI.create(item);
      dispatch(addInventoryItemAction(response.data));
    } catch (error) {
      console.error('Error adding inventory item:', error);
      alert('Error adding inventory item');
    }
  };

  const updateInventory = async (id, quantity) => {
    try {
      const response = await inventoryAPI.updateQuantity(id, quantity);
      dispatch(updateInventoryItemAction(response.data));
    } catch (error) {
      console.error('Error updating inventory:', error);
      alert('Error updating inventory');
    }
  };

  const deleteInventoryItem = async (id) => {
    try {
      await inventoryAPI.delete(id);
      dispatch(removeInventoryItemAction(id));
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      alert('Error deleting inventory item');
    }
  };

  // Invoice Management
  const addInvoice = async (invoice) => {
    try {
      const response = await invoicesAPI.create(invoice);
      dispatch(addInvoiceAction(response.data));
      await refreshData(['transactions']);
    } catch (error) {
      console.error('Error adding invoice:', error);
      alert('Error adding invoice');
    }
  };

  const updateInvoiceStatus = async (id, status) => {
    try {
      const response = await invoicesAPI.updateStatus(id, status);
      dispatch(updateInvoiceInStore({ id, updates: { status: response.data.status } }));
    } catch (error) {
      console.error('Error updating invoice status:', error);
      alert('Error updating invoice status');
    }
  };

  const deleteInvoice = async (id) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    
    try {
      await invoicesAPI.delete(id);
      dispatch(removeInvoiceAction(id));
      await refreshData(['transactions']);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Error deleting invoice');
    }
  };

  // Expense Management
  const addExpense = async (expense) => {
    try {
      const response = await expensesAPI.create(expense);
      if (response?.data) {
        dispatch(setExpensesAction([response.data, ...expenses]));
      }
      await refreshData(['transactions', 'expenses']);
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Error adding expense');
      throw error; // Re-throw so handleSubmit can catch it
    }
  };

  const deleteExpense = async (id) => {
    try {
      await expensesAPI.delete(id);
      dispatch(setExpensesAction(expenses.filter(e => e.id !== id)));
      await refreshData(['transactions']);
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Error deleting expense');
    }
  };

  // Calculate Dashboard Stats based on date range
  const dashboardFilteredTransactions = useMemo(() => {
    if (!dashboardDateRange.startDate || !dashboardDateRange.endDate) return transactions;
    const start = new Date(dashboardDateRange.startDate);
    const end = new Date(dashboardDateRange.endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date
    
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= start && tDate <= end;
    });
  }, [transactions, dashboardDateRange]);

  const dashboardFilteredInvoices = useMemo(() => {
    if (!dashboardDateRange.startDate || !dashboardDateRange.endDate) return invoices;
    const start = new Date(dashboardDateRange.startDate);
    const end = new Date(dashboardDateRange.endDate);
    end.setHours(23, 59, 59, 999);
    
    return invoices.filter(inv => {
      const invDate = new Date(inv.date || inv.created_at);
      return invDate >= start && invDate <= end;
    });
  }, [invoices, dashboardDateRange]);

  // Dashboard Stats based on date range
  const dashboardRevenue = dashboardFilteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const dashboardExpenses = dashboardFilteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const dashboardProfit = dashboardRevenue - dashboardExpenses;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const unpaidInvoices = dashboardFilteredInvoices.filter(inv => inv.status === 'unpaid').length;
  const totalInvoices = dashboardFilteredInvoices.length;
  const paidInvoices = dashboardFilteredInvoices.filter(inv => inv.status === 'paid').length;

  // Currency formatting function - always uses PKR
  const formatCurrency = (amount) => {
    return `PKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  // Get currency symbol for display
  const getCurrencySymbol = () => {
    return 'PKR';
  };

  const resetPaymentFilters = () => {
    setPaymentFilters({
      search: '',
      type: 'all',
      category: 'all',
      source: 'all',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: ''
    });
  };

  const getTransactionSourceType = (transaction) => {
    if (transaction.invoice_id) return 'invoice';
    if (transaction.project_payment_id) return 'project';
    if (transaction.expense_id) return 'expense';
    return 'general';
  };

  const getTransactionSourceLabel = (transaction) => {
    if (transaction.invoice_id) return `Invoice #${transaction.invoice_id}`;
    if (transaction.project_payment_id) return `Project Payment #${transaction.project_payment_id}`;
    if (transaction.expense_id) return `Expense #${transaction.expense_id}`;
    return transaction.category ? `General - ${transaction.category}` : 'General';
  };

  const navigationTabs = useMemo(() => ([
    { id: 'dashboard', icon: DollarSign, label: 'Dashboard' },
    { id: 'clients', icon: Users, label: 'Clients' },
    { id: 'employees', icon: UserCheck, label: 'Employees' },
    { id: 'salaries', icon: Banknote, label: 'Salaries' },
    { id: 'loans', icon: CreditCard, label: 'Loans' },
    { id: 'projects', icon: FolderOpen, label: 'Projects' },
    { id: 'inventory', icon: Package, label: 'Inventory' },
    { id: 'invoices', icon: FileText, label: 'Invoices' },
    { id: 'expenses', icon: Briefcase, label: 'Expenses' }
  ]), []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeTab]);

  const handleToggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const handleMobileMenuKeyDown = useCallback((event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsMobileMenuOpen((prev) => !prev);
      return;
    }

    if (event.key === 'Escape') {
      setIsMobileMenuOpen(false);
    }
  }, []);

  const categoryOptions = useMemo(() => {
    const categories = new Set();
    transactions.forEach((t) => {
      categories.add(t.category || 'Uncategorized');
    });
    return Array.from(categories);
  }, [transactions]);

  const sourceOptions = [
    { value: 'invoice', label: 'Invoices' },
    { value: 'project', label: 'Project Payments' },
    { value: 'expense', label: 'Expenses' },
    { value: 'general', label: 'General Entries' }
  ];

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const amount = parseFloat(t.amount) || 0;
      if (paymentFilters.type !== 'all' && t.type !== paymentFilters.type) return false;
      if (paymentFilters.category !== 'all') {
        const categoryValue = t.category || 'Uncategorized';
        if (categoryValue !== paymentFilters.category) return false;
      }
      if (paymentFilters.source !== 'all' && getTransactionSourceType(t) !== paymentFilters.source) return false;
      if (paymentFilters.startDate && new Date(t.date) < new Date(paymentFilters.startDate)) return false;
      if (paymentFilters.endDate && new Date(t.date) > new Date(paymentFilters.endDate)) return false;
      if (paymentFilters.minAmount && amount < parseFloat(paymentFilters.minAmount)) return false;
      if (paymentFilters.maxAmount && amount > parseFloat(paymentFilters.maxAmount)) return false;
      if (paymentFilters.search) {
        const term = paymentFilters.search.toLowerCase();
        const description = t.description?.toLowerCase() || '';
        const category = (t.category || '').toLowerCase();
        const sourceLabel = getTransactionSourceLabel(t).toLowerCase();
        if (!description.includes(term) && !category.includes(term) && !sourceLabel.includes(term)) {
          return false;
        }
      }
      return true;
    });
  }, [transactions, paymentFilters]);

  const filteredIncomeTotal = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  }, [filteredTransactions]);

  const filteredExpenseTotal = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  }, [filteredTransactions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between h-16 sm:h-20">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Business Manager</span>
              </div>
              <button
                type="button"
                onClick={handleToggleMobileMenu}
                onKeyDown={handleMobileMenuKeyDown}
                className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:hidden"
                aria-label="Toggle navigation menu"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
            <div className="hidden sm:flex sm:items-center sm:space-x-1 sm:h-20">
              {navigationTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="whitespace-nowrap">{tab.label}</span>
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
                  )}
                </button>
              ))}
            </div>
          </div>
          {isMobileMenuOpen && (
            <div
              id="mobile-navigation"
              className="sm:hidden pb-4"
            >
              <div className="mt-2 space-y-1 rounded-lg border border-gray-100 bg-white p-2 shadow">
                {navigationTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </div>
                    {activeTab === tab.id && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Date Range:</label>
                  <input
                    type="date"
                    value={dashboardDateRange.startDate}
                    onChange={(e) => setDashboardDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                  <span className="text-sm text-gray-500">to</span>
                  <input
                    type="date"
                    value={dashboardDateRange.endDate}
                    onChange={(e) => setDashboardDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                  <button
                    onClick={() => {
                      const range = getCurrentMonthRange();
                      setDashboardDateRange({ startDate: range.start, endDate: range.end });
                    }}
                    className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Reset to current month"
                  >
                    This Month
                  </button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Revenue" 
                value={formatCurrency(dashboardRevenue)} 
                color="green" 
                subtitle={`${dashboardFilteredTransactions.filter(t => t.type === 'income').length} transactions`} 
              />
              <StatCard 
                title="Expenses" 
                value={formatCurrency(dashboardExpenses)} 
                color="red" 
                subtitle={`${dashboardFilteredTransactions.filter(t => t.type === 'expense').length} transactions`} 
              />
              <StatCard 
                title="Net Profit" 
                value={formatCurrency(dashboardProfit)} 
                color={dashboardProfit >= 0 ? 'blue' : 'red'} 
                subtitle={dashboardProfit >= 0 ? 'Positive' : 'Negative'} 
              />
              <StatCard 
                title="Active Projects" 
                value={activeProjects} 
                color="purple" 
                subtitle={`Total: ${projects.length}`} 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Total Invoices" 
                value={totalInvoices} 
                color="blue" 
                subtitle={`Paid: ${paidInvoices} | Unpaid: ${unpaidInvoices}`} 
              />
              <StatCard 
                title="Unpaid Invoices" 
                value={unpaidInvoices} 
                color="orange" 
                subtitle={unpaidInvoices > 0 ? 'Action Required' : 'All Paid'} 
              />
              <StatCard 
                title="Transactions" 
                value={dashboardFilteredTransactions.length} 
                color="gray" 
                subtitle={`Income: ${dashboardFilteredTransactions.filter(t => t.type === 'income').length} | Expense: ${dashboardFilteredTransactions.filter(t => t.type === 'expense').length}`} 
              />
              <StatCard 
                title="Date Range" 
                value={dashboardDateRange.startDate && dashboardDateRange.endDate 
                  ? `${new Date(dashboardDateRange.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(dashboardDateRange.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                  : 'All Time'
                } 
                color="gray" 
                subtitle="Selected Period" 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Recent Transactions</h3>
                  {dashboardFilteredTransactions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowPaymentsModal(true)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      View History
                    </button>
                  )}
                </div>
                {dashboardFilteredTransactions.length === 0 ? (
                  <p className="text-sm text-gray-500">No transactions in selected date range.</p>
                ) : (
                <div className="space-y-3">
                  {dashboardFilteredTransactions.slice(0, 5).map(t => (
                    <div key={t.id} className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-medium">{t.description}</p>
                        <p className="text-sm text-gray-500">{new Date(t.date).toLocaleDateString()}</p>
                      </div>
                      <span className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(t.amount))}
                      </span>
                    </div>
                  ))}
                </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Unpaid Invoices ({unpaidInvoices})</h3>
                {unpaidInvoices === 0 ? (
                  <p className="text-sm text-gray-500">All invoices are paid in the selected date range.</p>
                ) : (
                  <div className="space-y-3">
                    {dashboardFilteredInvoices.filter(inv => inv.status === 'unpaid').slice(0, 5).map(inv => (
                      <div key={inv.id} className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                        <div>
                          <p className="font-medium">Invoice #{inv.id}</p>
                          <p className="text-sm text-gray-500">{inv.clientName || inv.client_name}</p>
                        </div>
                        <span className="font-bold text-orange-600">{formatCurrency(parseFloat(inv.total))}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Clients */}
        {activeTab === 'clients' && (
          <ClientsTab clients={clients} addClient={addClient} deleteClient={deleteClient} />
        )}

        {/* Projects */}
        {activeTab === 'projects' && (
          <ProjectsTab 
            projects={projects} 
            clients={clients}
            addProject={addProject} 
            updateProject={updateProject}
            deleteProject={deleteProject}
            loadAllData={loadAllData}
          />
        )}

        {/* Inventory */}
        {activeTab === 'inventory' && (
          <InventoryTab 
            inventory={inventory}
            addInventoryItem={addInventoryItem}
            updateInventory={updateInventory}
            deleteInventoryItem={deleteInventoryItem}
          />
        )}

        {/* Invoices */}
        {activeTab === 'invoices' && (
          <InvoicesTab 
            invoices={invoices}
            clients={clients}
            addInvoice={addInvoice}
            updateInvoiceStatus={updateInvoiceStatus}
            printInvoice={printInvoice}
            deleteInvoice={deleteInvoice}
          />
        )}

        {/* Employees */}
        {activeTab === 'employees' && (
          <EmployeesTab 
            employees={employees}
            setEmployees={(next) => dispatch(setEmployeesAction(next))}
            loadAllData={() => refreshData(['employees'])}
          />
        )}

        {/* Salaries */}
        {activeTab === 'salaries' && (
          <SalariesTab 
            salaries={salaries}
            employees={employees}
            loans={loans}
            advances={advances}
            setSalaries={(next) => dispatch(setSalariesAction(next))}
            loadAllData={() => refreshData(['salaries', 'expenses', 'transactions', 'loans', 'advances'])}
          />
        )}

        {/* Loans */}
        {activeTab === 'loans' && (
          <LoansTab 
            loans={loans}
            employees={employees}
            setLoans={(next) => dispatch(setLoansAction(next))}
            loadAllData={() => refreshData(['loans'])}
          />
        )}

        {/* Expenses */}
        {activeTab === 'expenses' && (
          <ExpensesTab 
            expenses={expenses}
            addExpense={addExpense}
            deleteExpense={deleteExpense}
            printReceipt={printReceipt}
          />
        )}
      </div>
    </div>
    {showPaymentsModal && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/40 backdrop-blur-sm"
        onClick={() => setShowPaymentsModal(false)}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between border-b px-6 py-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Payment History</h2>
              <p className="text-sm text-gray-500">Review every income and expense with powerful filters.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowPaymentsModal(false)}
              className="text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              Close
            </button>
          </div>
          <div className="px-6 py-4 flex-1 flex flex-col overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Matching Records</p>
                <p className="text-2xl font-semibold text-gray-900">{filteredTransactions.length}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-xs text-green-600 uppercase tracking-wide">Income Total</p>
                <p className="text-2xl font-semibold text-green-700">{formatCurrency(filteredIncomeTotal)}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-xs text-red-600 uppercase tracking-wide">Expense Total</p>
                <p className="text-2xl font-semibold text-red-700">{formatCurrency(filteredExpenseTotal)}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  value={paymentFilters.search}
                  onChange={(e) => setPaymentFilters((prev) => ({ ...prev, search: e.target.value }))}
                  placeholder="Search description, category, or reference"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={paymentFilters.type}
                  onChange={(e) => setPaymentFilters((prev) => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="all">All types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={paymentFilters.category}
                  onChange={(e) => setPaymentFilters((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="all">All categories</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <select
                  value={paymentFilters.source}
                  onChange={(e) => setPaymentFilters((prev) => ({ ...prev, source: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="all">All sources</option>
                  {sourceOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={paymentFilters.startDate}
                  onChange={(e) => setPaymentFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={paymentFilters.endDate}
                  onChange={(e) => setPaymentFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
                <input
                  type="number"
                  value={paymentFilters.minAmount}
                  onChange={(e) => setPaymentFilters((prev) => ({ ...prev, minAmount: e.target.value }))}
                  placeholder={`Min (${getCurrencySymbol()})`}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
                <input
                  type="number"
                  value={paymentFilters.maxAmount}
                  onChange={(e) => setPaymentFilters((prev) => ({ ...prev, maxAmount: e.target.value }))}
                  placeholder={`Max (${getCurrencySymbol()})`}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={resetPaymentFilters}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Reset Filters
                </button>
              </div>
            </div>
            {filteredTransactions.length === 0 ? (
              <div className="flex-1 border border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-500 text-sm">
                No payments match the selected filters.
              </div>
            ) : (
              <div className="flex-1 overflow-hidden">
                <div className="border rounded-xl overflow-hidden">
                  <div className="overflow-x-auto overflow-y-auto max-h-[45vh]">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      <tr>
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3 text-left">Description</th>
                        <th className="px-4 py-3 text-left">Category</th>
                        <th className="px-4 py-3 text-left">Source</th>
                        <th className="px-4 py-3 text-left">Type</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredTransactions.map((t) => (
                        <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                            {new Date(t.date).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">{t.description}</p>
                            <p className="text-xs text-gray-500">#{t.id}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{t.category || 'Uncategorized'}</td>
                          <td className="px-4 py-3 text-gray-600">{getTransactionSourceLabel(t)}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                t.type === 'income'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {t.type === 'income' ? 'Income' : 'Expense'}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-right font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(t.amount) || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
};

const StatCard = ({ title, value, color, subtitle }) => {
  const colors = {
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

export default BusinessManagementApp;

