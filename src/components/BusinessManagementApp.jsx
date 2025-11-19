import React, { useState, useEffect } from 'react';
import { Plus, FileText, Package, DollarSign, Users, FolderOpen, Printer, Trash2, UserCheck, Banknote, CreditCard, Briefcase, Edit } from 'lucide-react';
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

const BusinessManagementApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [loans, setLoans] = useState([]);
  const [advances, setAdvances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardCurrency, setDashboardCurrency] = useState('PKR');
  const [exchangeRate, setExchangeRate] = useState(280); // PKR to USD rate (default: 280 PKR = 1 USD)

  // Load data from API on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const [clientsRes, projectsRes, inventoryRes, transactionsRes, invoicesRes, expensesRes, employeesRes, salariesRes, loansRes, advancesRes] = await Promise.all([
        clientsAPI.getAll(),
        projectsAPI.getAll(),
        inventoryAPI.getAll(),
        transactionsAPI.getAll(),
        invoicesAPI.getAll(),
        expensesAPI.getAll(),
        employeesAPI.getAll().catch(() => ({ data: [] })),
        salariesAPI.getAll().catch(() => ({ data: [] })),
        loansAPI.getAll().catch(() => ({ data: [] })),
        advancesAPI.getAll().catch(() => ({ data: [] }))
      ]);

      setClients(clientsRes.data);
      setProjects(projectsRes.data);
      setInventory(inventoryRes.data);
      setTransactions(transactionsRes.data);
      setInvoices(invoicesRes.data);
      setExpenses(expensesRes.data);
      setEmployees(employeesRes.data);
      setSalaries(salariesRes.data);
      setLoans(loansRes.data);
      setAdvances(advancesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data. Please make sure the backend server is running and migrations are applied.');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // Client Management
  const addClient = async (client) => {
    try {
      const response = await clientsAPI.create(client);
      setClients([...clients, response.data]);
    } catch (error) {
      console.error('Error adding client:', error);
      alert('Error adding client');
    }
  };

  const deleteClient = async (id) => {
    try {
      await clientsAPI.delete(id);
      setClients(clients.filter(c => c.id !== id));
      // Reload all data to update dashboard (projects/invoices may be affected)
      await loadAllData();
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Error deleting client');
    }
  };

  // Project Management
  const addProject = async (project) => {
    try {
      const response = await projectsAPI.create(project);
      setProjects([...projects, response.data]);
    } catch (error) {
      console.error('Error adding project:', error);
      alert('Error adding project');
    }
  };

  const updateProject = async (id, updates) => {
    try {
      const response = await projectsAPI.update(id, updates);
      setProjects(projects.map(p => p.id === id ? { ...p, ...response.data } : p));
      // Reload all data to update dashboard (active projects count may change)
      await loadAllData();
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Error updating project');
    }
  };

  const deleteProject = async (id) => {
    try {
      await projectsAPI.delete(id);
      setProjects(projects.filter(p => p.id !== id));
      // Reload all data to update dashboard (active projects count)
      await loadAllData();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project');
    }
  };

  // Inventory Management
  const addInventoryItem = async (item) => {
    try {
      const response = await inventoryAPI.create(item);
      setInventory([...inventory, response.data]);
    } catch (error) {
      console.error('Error adding inventory item:', error);
      alert('Error adding inventory item');
    }
  };
 const updatePaymentIcon = async (id, icon) => {
  try {
    const response = await inventoryAPI.updateIcon(id, icon);
    setInventory(inventory.map(i => i.id === id ? response.data : i));
  } catch (error) {
    console.error('Error updating payment icon:', error);
    alert('Error updating payment icon');
  }
 };
 const deletePaymentIcon = async (id) => {
  try {
    const response = await inventoryAPI.deleteIcon(id);
    setInventory(inventory.filter(i => i.id !== id));
  } catch (error) {
    console.error('Error deleting payment icon:', error);
    alert('Error deleting payment icon');
  }
 };
  const updateInventory = async (id, quantity) => {
    try {
      const response = await inventoryAPI.updateQuantity(id, quantity);
      setInventory(inventory.map(i => i.id === id ? response.data : i));
    } catch (error) {
      console.error('Error updating inventory:', error);
      alert('Error updating inventory');
    }
  };

  const deleteInventoryItem = async (id) => {
    try {
      await inventoryAPI.delete(id);
      setInventory(inventory.filter(i => i.id !== id));
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      alert('Error deleting inventory item');
    }
  };

  // Invoice Management
  const addInvoice = async (invoice) => {
    try {
      const response = await invoicesAPI.create(invoice);
      setInvoices([...invoices, response.data]);
      // Reload all data to update dashboard
      await loadAllData();
    } catch (error) {
      console.error('Error adding invoice:', error);
      alert('Error adding invoice');
    }
  };

  const updateInvoiceStatus = async (id, status) => {
    try {
      const response = await invoicesAPI.updateStatus(id, status);
      setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: response.data.status } : inv));
      // Reload all data to update dashboard (unpaid invoices count)
      await loadAllData();
    } catch (error) {
      console.error('Error updating invoice status:', error);
      alert('Error updating invoice status');
    }
  };

  const deleteInvoice = async (id) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    
    try {
      await invoicesAPI.delete(id);
      setInvoices(invoices.filter(inv => inv.id !== id));
      // Reload all data to update dashboard
      await loadAllData();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Error deleting invoice');
    }
  };

  // Expense Management
  const addExpense = async (expense) => {
    try {
      const response = await expensesAPI.create(expense);
      setExpenses([...expenses, response.data]);
      // Reload transactions and expenses to update dashboard without showing loading screen
      const [transactionsRes, expensesRes] = await Promise.all([
        transactionsAPI.getAll(),
        expensesAPI.getAll()
      ]);
      setTransactions(transactionsRes.data);
      setExpenses(expensesRes.data);
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Error adding expense');
      throw error; // Re-throw so handleSubmit can catch it
    }
  };

  const deleteExpense = async (id) => {
    try {
      await expensesAPI.delete(id);
      setExpenses(expenses.filter(e => e.id !== id));
      // Reload transactions to update dashboard (expense transaction is deleted on backend)
      const transactionsRes = await transactionsAPI.getAll();
      setTransactions(transactionsRes.data);
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Error deleting expense');
    }
  };

  // Print Functions
  const printInvoice = (invoice) => {
    const printWindow = window.open('', '', 'width=900,height=700');
    const totalCommission = invoice.items.reduce((sum, item) => sum + parseFloat(item.commission || 0), 0);
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${invoice.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 40px; 
              color: #333;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .invoice-container {
              background: white;
              border-radius: 16px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              overflow: hidden;
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px;
              position: relative;
            }
            .company-name { 
              font-size: 36px; 
              font-weight: bold; 
              margin-bottom: 8px;
              letter-spacing: 1px;
            }
            .company-address {
              font-size: 14px;
              opacity: 0.95;
              line-height: 1.6;
            }
            .invoice-title {
              position: absolute;
              right: 40px;
              top: 40px;
              text-align: right;
            }
            .invoice-title h1 {
              font-size: 48px;
              font-weight: 300;
              letter-spacing: 2px;
            }
            .invoice-number {
              font-size: 18px;
              opacity: 0.9;
              margin-top: 5px;
            }
            .content { 
              padding: 40px;
            }
            .invoice-details { 
              display: flex;
              justify-content: space-between;
              margin-bottom: 40px;
              padding-bottom: 30px;
              border-bottom: 2px solid #e5e7eb;
            }
            .details-section h3 {
              color: #667eea;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 12px;
              font-weight: 600;
            }
            .details-section p {
              margin: 6px 0;
              font-size: 15px;
            }
            .status-badge {
              display: inline-block;
              padding: 6px 16px;
              border-radius: 20px;
              font-size: 13px;
              font-weight: 600;
              margin-top: 8px;
              ${invoice.status === 'paid' 
                ? 'background: #d1fae5; color: #065f46;' 
                : 'background: #fed7aa; color: #9a3412;'
              }
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 30px 0;
            }
            thead {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            th { 
              padding: 16px; 
              text-align: left; 
              font-weight: 600;
              text-transform: uppercase;
              font-size: 12px;
              letter-spacing: 1px;
            }
            td { 
              padding: 16px; 
              border-bottom: 1px solid #e5e7eb;
            }
            tbody tr:hover {
              background-color: #f9fafb;
            }
            .commission-cell {
              color: #10b981;
              font-weight: 600;
            }
            .totals-section {
              margin-top: 40px;
              display: flex;
              justify-content: flex-end;
            }
            .totals-box {
              width: 350px;
              background: #f9fafb;
              padding: 24px;
              border-radius: 12px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 12px 0;
              font-size: 15px;
            }
            .total-row.grand-total {
              border-top: 2px solid #667eea;
              padding-top: 16px;
              margin-top: 16px;
              font-size: 24px;
              font-weight: bold;
              color: #667eea;
            }
            .footer { 
              margin-top: 60px; 
              text-align: center; 
              color: #6b7280;
              padding-top: 30px;
              border-top: 2px solid #e5e7eb;
            }
            .footer p {
              margin: 8px 0;
              font-size: 14px;
            }
            .thank-you {
              font-size: 18px;
              font-weight: 600;
              color: #667eea;
              margin-bottom: 12px;
            }
            @media print {
              body { 
                background: white; 
                padding: 0; 
              }
              .invoice-container {
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div>
                <div class="company-name">Vision Nexera</div>
                <div class="company-address">
                  Plaza 18, Usman Block<br>
                  Alkabir Town, Phase 2
                </div>
              </div>
              <div class="invoice-title">
                <h1>INVOICE</h1>
                <div class="invoice-number">#${invoice.id}</div>
              </div>
            </div>
            
            <div class="content">
              <div class="invoice-details">
                <div class="details-section">
                  <h3>Billed To</h3>
                  <p><strong>${invoice.clientName || invoice.client_name}</strong></p>
                </div>
                <div class="details-section">
                  <h3>Invoice Details</h3>
                  <p><strong>Date:</strong> ${new Date(invoice.date || invoice.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p><strong>Status:</strong> <span class="status-badge">${invoice.status.toUpperCase()}</span></p>
                </div>
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Rate</th>
                    <th style="text-align: right;">Commission</th>
                    <th style="text-align: right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoice.items.map(item => `
                    <tr>
                      <td>${item.description}</td>
                      <td style="text-align: center;">${item.quantity}</td>
                      <td style="text-align: right;">$${parseFloat(item.rate).toFixed(2)}</td>
                      <td style="text-align: right;" class="commission-cell">$${parseFloat(item.commission || 0).toFixed(2)}</td>
                      <td style="text-align: right; font-weight: 600;">$${(item.quantity * parseFloat(item.rate)).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <div class="totals-section">
                <div class="totals-box">
                  <div class="total-row">
                    <span>Subtotal:</span>
                    <span>$${parseFloat(invoice.total).toFixed(2)}</span>
                  </div>
                  ${totalCommission > 0 ? `
                  <div class="total-row">
                    <span>Total Commission:</span>
                    <span class="commission-cell">$${totalCommission.toFixed(2)}</span>
                  </div>
                  ` : ''}
                  <div class="total-row grand-total">
                    <span>Total:</span>
                    <span>$${parseFloat(invoice.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div class="footer">
                <p class="thank-you">Thank you for your business!</p>
                <p>Payment terms: Net 30 days</p>
                <p>If you have any questions, please contact us.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const printReceipt = (transaction) => {
    const printWindow = window.open('', '', 'width=600,height=400');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; }
            .header { text-align: center; margin-bottom: 20px; }
            .receipt-details { margin: 20px 0; }
            .amount { font-size: 24px; font-weight: bold; color: #10b981; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>RECEIPT</h2>
            <p>Your Company Name</p>
          </div>
          <div class="receipt-details">
            <p><strong>Receipt #:</strong> ${transaction.id}</p>
            <p><strong>Date:</strong> ${new Date(transaction.date).toLocaleDateString()}</p>
            <p><strong>Description:</strong> ${transaction.description}</p>
            <div class="amount">Amount: $${transaction.amount}</div>
            <p><strong>Category:</strong> ${transaction.category}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Calculate Dashboard Stats
  const totalRevenue = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const netProfit = totalRevenue - totalExpenses;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const unpaidInvoices = invoices.filter(inv => inv.status === 'unpaid').length;

  // Currency conversion function
  const formatCurrency = (amount) => {
    if (dashboardCurrency === 'USD') {
      const usdAmount = amount / exchangeRate;
      return `$${usdAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `PKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };
  
  // Get currency symbol for display
  const getCurrencySymbol = () => {
    return dashboardCurrency === 'USD' ? '$' : 'PKR';
  };

  // Convert amount based on selected currency
  const convertAmount = (amount) => {
    if (dashboardCurrency === 'USD') {
      return amount / exchangeRate;
    }
    return amount;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Business Manager</span>
            </div>
            <div className="flex space-x-1">
              {[
                { id: 'dashboard', icon: DollarSign, label: 'Dashboard' },
                { id: 'clients', icon: Users, label: 'Clients' },
                { id: 'employees', icon: UserCheck, label: 'Employees' },
                { id: 'salaries', icon: Banknote, label: 'Salaries' },
                { id: 'loans', icon: CreditCard, label: 'Loans' },
                { id: 'projects', icon: FolderOpen, label: 'Projects' },
                { id: 'inventory', icon: Package, label: 'Inventory' },
                { id: 'invoices', icon: FileText, label: 'Invoices' },
                { id: 'expenses', icon: Briefcase, label: 'Expenses' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
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
                  <label className="text-sm font-medium text-gray-700">Currency:</label>
                  <select
                    value={dashboardCurrency}
                    onChange={(e) => setDashboardCurrency(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="PKR">PKR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                {dashboardCurrency === 'USD' && (
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Exchange Rate:</label>
                    <input
                      type="number"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 280)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      step="0.01"
                      min="1"
                      placeholder="280"
                    />
                    <span className="text-sm text-gray-500">PKR/USD</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} color="green"  />
              <StatCard title="Total Expenses" value={formatCurrency(totalExpenses)} color="red"  />
              <StatCard title="Net Profit" value={formatCurrency(netProfit)} color="blue"  />
              <StatCard title="Active Projects" value={activeProjects} color="purple"  />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                  {transactions.slice(0, 5).map(t => (
                    <div key={t.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
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
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Unpaid Invoices ({unpaidInvoices})</h3>
                <div className="space-y-3">
                  {invoices.filter(inv => inv.status === 'unpaid').slice(0, 5).map(inv => (
                    <div key={inv.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">Invoice #{inv.id}</p>
                        <p className="text-sm text-gray-500">{inv.clientName || inv.client_name}</p>
                      </div>
                      <span className="font-bold text-orange-600">{formatCurrency(parseFloat(inv.total))}</span>
                    </div>
                  ))}
                </div>
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
            setEmployees={setEmployees}
            loadAllData={loadAllData}
          />
        )}

        {/* Salaries */}
        {activeTab === 'salaries' && (
          <SalariesTab 
            salaries={salaries}
            employees={employees}
            setSalaries={setSalaries}
            loadAllData={loadAllData}
          />
        )}

        {/* Loans */}
        {activeTab === 'loans' && (
          <LoansTab 
            loans={loans}
            employees={employees}
            setLoans={setLoans}
            loadAllData={loadAllData}
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
  );
};

const StatCard = ({ title, value, color }) => {
  const colors = {
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        {/* <div className={`p-3 rounded-lg ${colors[color]}`}>
          <DollarSign className="w-6 h-6" />
        </div> */}
      </div>
    </div>
  );
};

const ClientsTab = ({ clients, addClient, deleteClient }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    addClient(formData);
    setFormData({ name: '', email: '', phone: '', company: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          <span>Add Client</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Client Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <input
                type="text"
                placeholder="Company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Client
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map(client => (
          <div key={client.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{client.name}</h3>
                {client.company && <p className="text-sm text-gray-600">{client.company}</p>}
              </div>
              <button
                onClick={() => deleteClient(client.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <p>📧 {client.email}</p>
              <p>📞 {client.phone}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProjectsTab = ({ projects, clients, addProject, updateProject, deleteProject, loadAllData }) => {
  const [showForm, setShowForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(null);
  const [showPaymentHistory, setShowPaymentHistory] = useState(null);
  const [projectPayments, setProjectPayments] = useState({});
  const [paymentSummaries, setPaymentSummaries] = useState({});
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

  React.useEffect(() => {
    // Load payment summaries for all projects
    projects.forEach(project => {
      loadPaymentSummary(project.id);
    });
  }, [projects]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          <span>Add Project</span>
        </button>
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

      <div className="space-y-4">
        {projects.map(project => {
          const summary = paymentSummaries[project.id] || {};
          return (
            <div key={project.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                  <p className="text-gray-600 mb-2">{project.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Client: {project.clientName || project.client_name}</span>
                    <span>Budget: ${parseFloat(project.budget).toFixed(2)}</span>
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
                    <p className="text-lg font-bold text-gray-800">${summary.budget?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total Paid</p>
                    <p className="text-lg font-bold text-green-600">${summary.totalPaid?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Remaining</p>
                    <p className="text-lg font-bold text-orange-600">${summary.remaining?.toFixed(2) || '0.00'}</p>
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
                            <p className="font-semibold text-green-600">${parseFloat(payment.amount).toFixed(2)}</p>
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
    </div>
  );
};

const InventoryTab = ({ inventory, addInventoryItem, updateInventory, deleteInventoryItem }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: '',
    costPerUnit: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addInventoryItem({
      ...formData,
      quantity: parseInt(formData.quantity),
      costPerUnit: parseFloat(formData.costPerUnit)
    });
    setFormData({ name: '', category: '', quantity: '', unit: '', costPerUnit: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          <span>Add Item</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Item Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <input
                type="text"
                placeholder="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <input
                type="number"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <input
                type="text"
                placeholder="Unit (e.g., pcs, kg)"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Cost per Unit"
                value={formData.costPerUnit}
                onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Add Item
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost/Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {inventory.map(item => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{item.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={item.quantity < 10 ? 'text-red-600 font-semibold' : ''}>
                    {item.quantity}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{item.unit}</td>
                <td className="px-6 py-4 whitespace-nowrap">${parseFloat(item.cost_per_unit).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold">
                  ${(item.quantity * parseFloat(item.cost_per_unit)).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        const qty = parseInt(prompt('Add quantity:', '1'));
                        if (qty) updateInventory(item.id, qty);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        const qty = parseInt(prompt('Remove quantity:', '1'));
                        if (qty) updateInventory(item.id, -qty);
                      }}
                      className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => deleteInventoryItem(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const InvoicesTab = ({ invoices, clients, addInvoice, updateInvoiceStatus, printInvoice, deleteInvoice }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    items: [{ description: '', quantity: 1, rate: 0, commission: 0 }]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const client = clients.find(c => c.id === parseInt(formData.clientId));
    const total = formData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    
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
    newItems[index][field] = field === 'description' ? value : parseFloat(value) || 0;
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          <span>Create Invoice</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <select
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            >
              <option value="">Select Client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>

            <div className="space-y-3">
              <h3 className="font-semibold">Invoice Items</h3>
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="col-span-4 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    className="col-span-2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Rate"
                    value={item.rate}
                    onChange={(e) => updateItem(index, 'rate', e.target.value)}
                    className="col-span-2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Commission"
                    value={item.commission}
                    onChange={(e) => updateItem(index, 'commission', e.target.value)}
                    className="col-span-2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <div className="col-span-1 text-center font-semibold text-sm">
                    ${(item.quantity * item.rate).toFixed(2)}
                  </div>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="col-span-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addItem}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Add Item
              </button>
            </div>

            <div className="text-right text-xl font-bold">
              Total: ${formData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0).toFixed(2)}
            </div>

            <div className="flex space-x-3">
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Create Invoice
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

      <div className="space-y-4">
        {invoices.map(invoice => (
          <div key={invoice.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold mb-2">Invoice #{invoice.id}</h3>
                <p className="text-gray-600">Client: {invoice.clientName || invoice.client_name}</p>
                <p className="text-gray-600">Date: {new Date(invoice.date || invoice.created_at).toLocaleDateString()}</p>
                <p className="text-2xl font-bold mt-2">${parseFloat(invoice.total).toFixed(2)}</p>
              </div>
              <div className="flex flex-col space-y-2">
                <span className={`px-4 py-2 rounded-full text-center text-sm font-semibold ${
                  invoice.status === 'paid' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {invoice.status.toUpperCase()}
                </span>
                <button
                  onClick={() => printInvoice(invoice)}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
                {invoice.status === 'unpaid' && (
                  <button
                    onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Mark Paid
                  </button>
                )}
                <button
                  onClick={() => deleteInvoice(invoice.id)}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Items:</h4>
              <div className="space-y-1">
                {invoice.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <span>{item.description}</span>
                      <span className="text-gray-500"> ({item.quantity} × ${parseFloat(item.rate).toFixed(2)})</span>
                      {item.commission > 0 && (
                        <span className="text-green-600 ml-2">Commission: ${parseFloat(item.commission).toFixed(2)}</span>
                      )}
                    </div>
                    <span className="font-semibold">${(item.quantity * parseFloat(item.rate)).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ExpensesTab = ({ expenses, addExpense, deleteExpense, printReceipt }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    salary: ''
  });

  const categories = [
    'Salaries',
    'Software & Tools',
    'Hardware',
    'Office Rent',
    'Utilities',
    'Marketing',
    'Travel',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addExpense({
      ...formData,
      amount: parseFloat(formData.amount),
      salary: parseFloat(formData.salary) || 0
    });
    setFormData({ description: '', amount: '', category: '', salary: '' });
    setShowForm(false);
    } catch (error) {
      // Error is already handled in addExpense
      console.error('Error in handleSubmit:', error);
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          <span>Add Expense</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-2">Total Expenses</h3>
        <p className="text-3xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <div className="grid grid-cols-3 gap-4">
              <input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Salary (optional)"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Add Expense
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salary</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {expenses.map(expense => (
              <tr key={expense.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(expense.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 font-medium">{expense.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                    {expense.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold text-red-600">
                  ${parseFloat(expense.amount).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold text-blue-600">
                  ${parseFloat(expense.salary || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => printReceipt({
                        ...expense,
                        type: 'expense'
                      })}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==================== NEW MODULES ====================

const EmployeesTab = ({ employees, setEmployees, loadAllData }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [activeSection, setActiveSection] = useState('basic');
  const [formData, setFormData] = useState({
    // Basic Information
    employee_code: '',
    name: '',
    email: '',
    phone: '',
    alternative_phone: '',
    alternative_email: '',
    // Personal Details
    date_of_birth: '',
    gender: '',
    marital_status: '',
    blood_group: '',
    nationality: '',
    // Identification
    national_id: '',
    passport_number: '',
    passport_expiry_date: '',
    // Address Details
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    // Employment Details
    position: '',
    department: '',
    manager_id: '',
    work_location: '',
    work_shift: '',
    hire_date: '',
    probation_end_date: '',
    contract_end_date: '',
    notice_period_days: '30',
    employment_type: 'full-time',
    status: 'active',
    // Compensation
    base_salary: '',
    allowances: '',
    currency: 'PKR',
    payment_frequency: 'monthly',
    // Bank Details
    bank_name: '',
    bank_account_number: '',
    bank_branch: '',
    bank_swift_code: '',
    bank_routing_number: '',
    // Tax & Insurance
    tax_id: '',
    insurance_number: '',
    social_security_number: '',
    // Emergency Contact
    emergency_contact: '',
    emergency_phone: '',
    emergency_relationship: '',
    emergency_address: '',
    // Professional Details
    education_level: '',
    qualification: '',
    previous_experience_years: '0',
    skills: '',
    languages_spoken: '',
    // Social & Professional Links
    linkedin_profile: '',
    skype_id: '',
    github_username: '',
    portfolio_website: '',
    // Documents & Media
    photo_url: '',
    resume_url: '',
    id_document_url: '',
    contract_document_url: '',
    // Additional Information
    notes: '',
    internal_notes: ''
  });

  const resetForm = () => {
    setFormData({
      employee_code: '', name: '', email: '', phone: '', alternative_phone: '', alternative_email: '',
      date_of_birth: '', gender: '', marital_status: '', blood_group: '', nationality: '',
      national_id: '', passport_number: '', passport_expiry_date: '',
      address: '', city: '', state: '', country: '', postal_code: '',
      position: '', department: '', manager_id: '', work_location: '', work_shift: '',
      hire_date: '', probation_end_date: '', contract_end_date: '', notice_period_days: '30',
      employment_type: 'full-time', status: 'active',
      base_salary: '', allowances: '', currency: 'USD', payment_frequency: 'monthly',
      bank_name: '', bank_account_number: '', bank_branch: '', bank_swift_code: '', bank_routing_number: '',
      tax_id: '', insurance_number: '', social_security_number: '',
      emergency_contact: '', emergency_phone: '', emergency_relationship: '', emergency_address: '',
      education_level: '', qualification: '', previous_experience_years: '0', skills: '', languages_spoken: '',
      linkedin_profile: '', skype_id: '', github_username: '', portfolio_website: '',
      photo_url: '', resume_url: '', id_document_url: '', contract_document_url: '',
      notes: '', internal_notes: ''
    });
    setEditingEmployee(null);
    setActiveSection('basic');
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      employee_code: employee.employee_code || '',
      name: employee.name || '',
      email: employee.email || '',
      phone: employee.phone || '',
      alternative_phone: employee.alternative_phone || '',
      alternative_email: employee.alternative_email || '',
      date_of_birth: employee.date_of_birth || '',
      gender: employee.gender || '',
      marital_status: employee.marital_status || '',
      blood_group: employee.blood_group || '',
      nationality: employee.nationality || '',
      national_id: employee.national_id || '',
      passport_number: employee.passport_number || '',
      passport_expiry_date: employee.passport_expiry_date || '',
      address: employee.address || '',
      city: employee.city || '',
      state: employee.state || '',
      country: employee.country || '',
      postal_code: employee.postal_code || '',
      position: employee.position || '',
      department: employee.department || '',
      manager_id: employee.manager_id || '',
      work_location: employee.work_location || '',
      work_shift: employee.work_shift || '',
      hire_date: employee.hire_date ? employee.hire_date.split('T')[0] : '',
      probation_end_date: employee.probation_end_date ? employee.probation_end_date.split('T')[0] : '',
      contract_end_date: employee.contract_end_date ? employee.contract_end_date.split('T')[0] : '',
      notice_period_days: employee.notice_period_days?.toString() || '30',
      employment_type: employee.employment_type || 'full-time',
      status: employee.status || 'active',
      base_salary: employee.base_salary?.toString() || '',
      allowances: employee.allowances?.toString() || '',
      currency: employee.currency || 'USD',
      payment_frequency: employee.payment_frequency || 'monthly',
      bank_name: employee.bank_name || '',
      bank_account_number: employee.bank_account_number || '',
      bank_branch: employee.bank_branch || '',
      bank_swift_code: employee.bank_swift_code || '',
      bank_routing_number: employee.bank_routing_number || '',
      tax_id: employee.tax_id || '',
      insurance_number: employee.insurance_number || '',
      social_security_number: employee.social_security_number || '',
      emergency_contact: employee.emergency_contact || '',
      emergency_phone: employee.emergency_phone || '',
      emergency_relationship: employee.emergency_relationship || '',
      emergency_address: employee.emergency_address || '',
      education_level: employee.education_level || '',
      qualification: employee.qualification || '',
      previous_experience_years: employee.previous_experience_years?.toString() || '0',
      skills: employee.skills || '',
      languages_spoken: employee.languages_spoken || '',
      linkedin_profile: employee.linkedin_profile || '',
      skype_id: employee.skype_id || '',
      github_username: employee.github_username || '',
      portfolio_website: employee.portfolio_website || '',
      photo_url: employee.photo_url || '',
      resume_url: employee.resume_url || '',
      id_document_url: employee.id_document_url || '',
      contract_document_url: employee.contract_document_url || '',
      notes: employee.notes || '',
      internal_notes: employee.internal_notes || ''
    });
    setShowForm(true);
    setActiveSection('basic');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        base_salary: parseFloat(formData.base_salary),
        allowances: parseFloat(formData.allowances || 0),
        previous_experience_years: parseInt(formData.previous_experience_years || 0),
        notice_period_days: parseInt(formData.notice_period_days || 30),
        manager_id: formData.manager_id ? parseInt(formData.manager_id) : null
      };

      let response;
      if (editingEmployee) {
        response = await employeesAPI.update(editingEmployee.id, submitData);
        setEmployees(employees.map(emp => emp.id === editingEmployee.id ? response.data : emp));
        alert('Employee updated successfully!');
      } else {
        response = await employeesAPI.create(submitData);
      setEmployees([...employees, response.data]);
      alert('Employee added successfully!');
      }
      
      resetForm();
      setShowForm(false);
      await loadAllData();
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Error saving employee: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure? This will delete all related salaries, loans, and advances.')) return;
    try {
      await employeesAPI.delete(id);
      setEmployees(employees.filter(e => e.id !== id));
      alert('Employee deleted successfully!');
      await loadAllData(); // Reload to update dashboard
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Error deleting employee');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          <span>{editingEmployee ? 'Edit Employee' : 'Add Employee'}</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h2>
          
          {/* Section Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
            {['basic', 'personal', 'address', 'employment', 'compensation', 'bank', 'tax', 'emergency', 'professional', 'documents', 'notes'].map(section => (
              <button
                key={section}
                type="button"
                onClick={() => setActiveSection(section)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === section
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
            </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            {activeSection === 'basic' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <input type="text" placeholder="Employee Code *" value={formData.employee_code} onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                  <input type="text" placeholder="Full Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                  <input type="email" placeholder="Email *" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                  <input type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="tel" placeholder="Alternative Phone" value={formData.alternative_phone} onChange={(e) => setFormData({ ...formData, alternative_phone: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="email" placeholder="Alternative Email" value={formData.alternative_email} onChange={(e) => setFormData({ ...formData, alternative_email: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            )}

            {/* Personal Details Section */}
            {activeSection === 'personal' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Personal Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input type="date" value={formData.date_of_birth} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                  <select value={formData.marital_status} onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">Marital Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                  <input type="text" placeholder="Blood Group" value={formData.blood_group} onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="text" placeholder="Nationality" value={formData.nationality} onChange={(e) => setFormData({ ...formData, nationality: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="text" placeholder="National ID" value={formData.national_id} onChange={(e) => setFormData({ ...formData, national_id: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="text" placeholder="Passport Number" value={formData.passport_number} onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Passport Expiry Date</label>
                    <input type="date" value={formData.passport_expiry_date} onChange={(e) => setFormData({ ...formData, passport_expiry_date: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              </div>
            )}

            {/* Address Section */}
            {activeSection === 'address' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Address Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <textarea placeholder="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows="3" />
                  <input type="text" placeholder="City" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="text" placeholder="State/Province" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="text" placeholder="Country" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="text" placeholder="Postal Code" value={formData.postal_code} onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            )}

            {/* Employment Section */}
            {activeSection === 'employment' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Employment Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <input type="text" placeholder="Position *" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                  <input type="text" placeholder="Department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <select value={formData.manager_id} onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">Select Manager</option>
                    {employees.filter(emp => emp.id !== editingEmployee?.id).map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} - {emp.position}</option>
                    ))}
                  </select>
                  <input type="text" placeholder="Work Location" value={formData.work_location} onChange={(e) => setFormData({ ...formData, work_location: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="text" placeholder="Work Shift" value={formData.work_shift} onChange={(e) => setFormData({ ...formData, work_shift: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date *</label>
                    <input type="date" value={formData.hire_date} onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Probation End Date</label>
                    <input type="date" value={formData.probation_end_date} onChange={(e) => setFormData({ ...formData, probation_end_date: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contract End Date</label>
                    <input type="date" value={formData.contract_end_date} onChange={(e) => setFormData({ ...formData, contract_end_date: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <input type="number" placeholder="Notice Period (Days)" value={formData.notice_period_days} onChange={(e) => setFormData({ ...formData, notice_period_days: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <select value={formData.employment_type} onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="intern">Intern</option>
                  </select>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="active">Active</option>
                    <option value="on-leave">On Leave</option>
                    <option value="terminated">Terminated</option>
                    <option value="resigned">Resigned</option>
                  </select>
                </div>
              </div>
            )}

            {/* Compensation Section */}
            {activeSection === 'compensation' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Compensation</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <input type="number" step="0.01" placeholder="Base Salary *" value={formData.base_salary} onChange={(e) => setFormData({ ...formData, base_salary: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                  <input type="number" step="0.01" placeholder="Allowances" value={formData.allowances} onChange={(e) => setFormData({ ...formData, allowances: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <select value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="PKR">PKR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR</option>
                    <option value="AED">AED</option>
                  </select>
                  <select value={formData.payment_frequency} onChange={(e) => setFormData({ ...formData, payment_frequency: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
            )}

            {/* Bank Details Section */}
            {activeSection === 'bank' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Bank Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <input type="text" placeholder="Bank Name" value={formData.bank_name} onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="text" placeholder="Account Number" value={formData.bank_account_number} onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="text" placeholder="Branch" value={formData.bank_branch} onChange={(e) => setFormData({ ...formData, bank_branch: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="text" placeholder="SWIFT Code" value={formData.bank_swift_code} onChange={(e) => setFormData({ ...formData, bank_swift_code: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="text" placeholder="Routing Number" value={formData.bank_routing_number} onChange={(e) => setFormData({ ...formData, bank_routing_number: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            )}

            {/* Tax & Insurance Section */}
            {activeSection === 'tax' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Tax & Insurance</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <input type="text" placeholder="Tax ID" value={formData.tax_id} onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="text" placeholder="Insurance Number" value={formData.insurance_number} onChange={(e) => setFormData({ ...formData, insurance_number: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="text" placeholder="Social Security Number" value={formData.social_security_number} onChange={(e) => setFormData({ ...formData, social_security_number: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            )}

            {/* Emergency Contact Section */}
            {activeSection === 'emergency' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Emergency Contact Name" value={formData.emergency_contact} onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="tel" placeholder="Emergency Phone" value={formData.emergency_phone} onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="text" placeholder="Relationship" value={formData.emergency_relationship} onChange={(e) => setFormData({ ...formData, emergency_relationship: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <textarea placeholder="Emergency Address" value={formData.emergency_address} onChange={(e) => setFormData({ ...formData, emergency_address: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows="3" />
                </div>
              </div>
            )}

            {/* Professional Details Section */}
            {activeSection === 'professional' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Professional Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Education Level" value={formData.education_level} onChange={(e) => setFormData({ ...formData, education_level: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="number" placeholder="Previous Experience (Years)" value={formData.previous_experience_years} onChange={(e) => setFormData({ ...formData, previous_experience_years: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <textarea placeholder="Qualifications" value={formData.qualification} onChange={(e) => setFormData({ ...formData, qualification: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows="3" />
                  <textarea placeholder="Skills" value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows="3" />
                  <textarea placeholder="Languages Spoken" value={formData.languages_spoken} onChange={(e) => setFormData({ ...formData, languages_spoken: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows="2" />
                  <div className="space-y-2">
                    <input type="url" placeholder="LinkedIn Profile" value={formData.linkedin_profile} onChange={(e) => setFormData({ ...formData, linkedin_profile: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full" />
                    <input type="text" placeholder="Skype ID" value={formData.skype_id} onChange={(e) => setFormData({ ...formData, skype_id: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full" />
                    <input type="text" placeholder="GitHub Username" value={formData.github_username} onChange={(e) => setFormData({ ...formData, github_username: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full" />
                    <input type="url" placeholder="Portfolio Website" value={formData.portfolio_website} onChange={(e) => setFormData({ ...formData, portfolio_website: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full" />
                  </div>
                </div>
              </div>
            )}

            {/* Documents Section */}
            {activeSection === 'documents' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Documents & Media</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="url" placeholder="Photo URL" value={formData.photo_url} onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="url" placeholder="Resume/CV URL" value={formData.resume_url} onChange={(e) => setFormData({ ...formData, resume_url: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="url" placeholder="ID Document URL" value={formData.id_document_url} onChange={(e) => setFormData({ ...formData, id_document_url: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="url" placeholder="Contract Document URL" value={formData.contract_document_url} onChange={(e) => setFormData({ ...formData, contract_document_url: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            )}

            {/* Notes Section */}
            {activeSection === 'notes' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Additional Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  <textarea placeholder="Public Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows="4" />
                  <textarea placeholder="Internal Notes (Private)" value={formData.internal_notes} onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows="4" />
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex space-x-3 pt-4 border-t">
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                {editingEmployee ? 'Update Employee' : 'Save Employee'}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Salary</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {employees.map(emp => (
              <tr key={emp.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{emp.employee_code}</td>
                <td className="px-6 py-4 whitespace-nowrap">{emp.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{emp.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{emp.position}</td>
                <td className="px-6 py-4 whitespace-nowrap">{emp.department}</td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold text-green-600">
                  ${parseFloat(emp.base_salary).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {emp.status || 'active'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(emp)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit Employee"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  <button
                    onClick={() => handleDelete(emp.id)}
                    className="text-red-600 hover:text-red-800"
                      title="Delete Employee"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {employees.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No employees yet. Click "Add Employee" to get started!
          </div>
        )}
      </div>
    </div>
  );
};

const SalariesTab = ({ salaries, employees, setSalaries, loadAllData }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    payment_month: '',
    base_salary: '',
    allowances: '',
    overtime_pay: '',
    bonus: '',
    tax_deduction: '',
    insurance_deduction: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert month (YYYY-MM) to date (YYYY-MM-01) for the API
      const paymentMonthDate = formData.payment_month ? `${formData.payment_month}-01` : '';
      
      const response = await salariesAPI.create({
        ...formData,
        payment_month: paymentMonthDate,
        employee_id: parseInt(formData.employee_id),
        base_salary: parseFloat(formData.base_salary),
        allowances: parseFloat(formData.allowances || 0),
        overtime_pay: parseFloat(formData.overtime_pay || 0),
        bonus: parseFloat(formData.bonus || 0),
        tax_deduction: parseFloat(formData.tax_deduction || 0),
        insurance_deduction: parseFloat(formData.insurance_deduction || 0)
      });
      setSalaries([...salaries, response.data]);
      setFormData({
        employee_id: '', payment_month: '', base_salary: '', allowances: '',
        overtime_pay: '', bonus: '', tax_deduction: '', insurance_deduction: ''
      });
      setShowForm(false);
      alert('Salary payment recorded successfully!');
      await loadAllData(); // Reload to update dashboard
    } catch (error) {
      console.error('Error adding salary:', error);
      alert('Error adding salary payment: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Salary Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          <span>Pay Salary</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <select
                value={formData.employee_id}
                onChange={(e) => {
                  const empId = e.target.value;
                  const emp = employees.find(e => e.id === parseInt(empId));
                  setFormData({
                    ...formData,
                    employee_id: empId,
                    base_salary: emp ? emp.base_salary : '',
                    allowances: emp ? emp.allowances : ''
                  });
                }}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              >
                <option value="">Select Employee *</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} - {emp.position}</option>
                ))}
              </select>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Month *</label>
                <input
                  type="month"
                  value={formData.payment_month}
                  onChange={(e) => setFormData({ ...formData, payment_month: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <input
                type="number"
                step="0.01"
                placeholder="Base Salary *"
                value={formData.base_salary}
                onChange={(e) => setFormData({ ...formData, base_salary: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Allowances"
                value={formData.allowances}
                onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Overtime Pay"
                value={formData.overtime_pay}
                onChange={(e) => setFormData({ ...formData, overtime_pay: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Bonus"
                value={formData.bonus}
                onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Tax Deduction"
                value={formData.tax_deduction}
                onChange={(e) => setFormData({ ...formData, tax_deduction: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Insurance Deduction"
                value={formData.insurance_deduction}
                onChange={(e) => setFormData({ ...formData, insurance_deduction: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Process Salary
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

      <div className="grid grid-cols-1 gap-4">
        {salaries.map(salary => (
          <div key={salary.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{salary.employee_name}</h3>
                <p className="text-gray-600">Month: {new Date(salary.payment_month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Gross Salary</p>
                    <p className="text-lg font-bold text-green-600">${parseFloat(salary.gross_salary).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Deductions</p>
                    <p className="text-lg font-bold text-red-600">${parseFloat(salary.total_deductions).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Net Salary</p>
                    <p className="text-lg font-bold text-blue-600">${parseFloat(salary.net_salary).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {salaries.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No salary payments yet. Click "Pay Salary" to process payroll!
          </div>
        )}
      </div>
    </div>
  );
};

const LoansTab = ({ loans, employees, setLoans, loadAllData }) => {
  const [showForm, setShowForm] = useState(false);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Loan Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          <span>Create Loan</span>
        </button>
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

      <div className="grid grid-cols-1 gap-4">
        {loans.map(loan => (
          <div key={loan.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{loan.employee_name}</h3>
                <p className="text-gray-600">{loan.loan_type}</p>
                <div className="mt-4 grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Loan Amount</p>
                    <p className="text-lg font-bold">${parseFloat(loan.total_amount).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Paid</p>
                    <p className="text-lg font-bold text-green-600">${parseFloat(loan.amount_paid || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Remaining</p>
                    <p className="text-lg font-bold text-orange-600">${parseFloat(loan.amount_remaining).toFixed(2)}</p>
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
        {loans.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No loans yet. Click "Create Loan" to get started!
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessManagementApp;

