import React, { useState, useEffect } from 'react';
import { Plus, FileText, Package, DollarSign, Users, FolderOpen, Printer, Download, Edit, Trash2, Search, Calendar, CheckSquare } from 'lucide-react';

const BusinessManagementApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // Load data from storage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const clientsData = await window.storage.get('clients');
        const projectsData = await window.storage.get('projects');
        const inventoryData = await window.storage.get('inventory');
        const transactionsData = await window.storage.get('transactions');
        const invoicesData = await window.storage.get('invoices');
        const expensesData = await window.storage.get('expenses');

        if (clientsData) setClients(JSON.parse(clientsData.value));
        if (projectsData) setProjects(JSON.parse(projectsData.value));
        if (inventoryData) setInventory(JSON.parse(inventoryData.value));
        if (transactionsData) setTransactions(JSON.parse(transactionsData.value));
        if (invoicesData) setInvoices(JSON.parse(invoicesData.value));
        if (expensesData) setExpenses(JSON.parse(expensesData.value));
      } catch (error) {
        console.log('No existing data or error loading:', error);
      }
    };
    loadData();
  }, []);

  // Save data to storage
  const saveData = async (key, data) => {
    try {
      await window.storage.set(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // Client Management
  const addClient = (client) => {
    const newClient = { ...client, id: Date.now() };
    const updated = [...clients, newClient];
    setClients(updated);
    saveData('clients', updated);
  };

  const deleteClient = (id) => {
    const updated = clients.filter(c => c.id !== id);
    setClients(updated);
    saveData('clients', updated);
  };

  // Project Management
  const addProject = (project) => {
    const newProject = { ...project, id: Date.now(), tasks: [], status: 'active' };
    const updated = [...projects, newProject];
    setProjects(updated);
    saveData('projects', updated);
  };

  const updateProject = (id, updates) => {
    const updated = projects.map(p => p.id === id ? { ...p, ...updates } : p);
    setProjects(updated);
    saveData('projects', updated);
  };

  const deleteProject = (id) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    saveData('projects', updated);
  };

  // Inventory Management
  const addInventoryItem = (item) => {
    const newItem = { ...item, id: Date.now() };
    const updated = [...inventory, newItem];
    setInventory(updated);
    saveData('inventory', updated);
  };

  const updateInventory = (id, quantity) => {
    const updated = inventory.map(i => i.id === id ? { ...i, quantity: i.quantity + quantity } : i);
    setInventory(updated);
    saveData('inventory', updated);
  };

  const deleteInventoryItem = (id) => {
    const updated = inventory.filter(i => i.id !== id);
    setInventory(updated);
    saveData('inventory', updated);
  };

  // Invoice Management
  const addInvoice = (invoice) => {
    const newInvoice = { ...invoice, id: Date.now(), date: new Date().toISOString(), status: 'unpaid' };
    const updated = [...invoices, newInvoice];
    setInvoices(updated);
    saveData('invoices', updated);

    const transaction = {
      id: Date.now(),
      type: 'income',
      amount: invoice.total,
      description: `Invoice #${newInvoice.id} - ${invoice.clientName}`,
      date: new Date().toISOString(),
      category: 'Service Revenue'
    };
    const updatedTransactions = [...transactions, transaction];
    setTransactions(updatedTransactions);
    saveData('transactions', updatedTransactions);
  };

  const updateInvoiceStatus = (id, status) => {
    const updated = invoices.map(inv => inv.id === id ? { ...inv, status } : inv);
    setInvoices(updated);
    saveData('invoices', updated);
  };

  // Expense Management
  const addExpense = (expense) => {
    const newExpense = { ...expense, id: Date.now(), date: new Date().toISOString() };
    const updated = [...expenses, newExpense];
    setExpenses(updated);
    saveData('expenses', updated);

    const transaction = {
      id: Date.now(),
      type: 'expense',
      amount: expense.amount,
      description: expense.description,
      date: new Date().toISOString(),
      category: expense.category
    };
    const updatedTransactions = [...transactions, transaction];
    setTransactions(updatedTransactions);
    saveData('transactions', updatedTransactions);
  };

  const deleteExpense = (id) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    saveData('expenses', updated);
  };

  // Print Functions
  const printInvoice = (invoice) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${invoice.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-name { font-size: 24px; font-weight: bold; color: #2563eb; }
            .invoice-details { margin: 30px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f3f4f6; }
            .total { font-size: 20px; font-weight: bold; text-align: right; margin-top: 20px; }
            .footer { margin-top: 50px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Your Company Name</div>
            <p>Software Development Services</p>
          </div>
          <div class="invoice-details">
            <h2>INVOICE #${invoice.id}</h2>
            <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString()}</p>
            <p><strong>Client:</strong> ${invoice.clientName}</p>
            <p><strong>Status:</strong> ${invoice.status.toUpperCase()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.rate}</td>
                  <td>$${item.quantity * item.rate}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            Total: $${invoice.total}
          </div>
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Payment terms: Net 30 days</p>
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
  const totalRevenue = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const unpaidInvoices = invoices.filter(inv => inv.status === 'unpaid').length;

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
                { id: 'projects', icon: FolderOpen, label: 'Projects' },
                { id: 'inventory', icon: Package, label: 'Inventory' },
                { id: 'invoices', icon: FileText, label: 'Invoices' },
                { id: 'expenses', icon: DollarSign, label: 'Expenses' }
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
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} color="green" icon={DollarSign} />
              <StatCard title="Total Expenses" value={`$${totalExpenses.toFixed(2)}`} color="red" icon={DollarSign} />
              <StatCard title="Net Profit" value={`$${netProfit.toFixed(2)}`} color="blue" icon={DollarSign} />
              <StatCard title="Active Projects" value={activeProjects} color="purple" icon={FolderOpen} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                  {transactions.slice(-5).reverse().map(t => (
                    <div key={t.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{t.description}</p>
                        <p className="text-sm text-gray-500">{new Date(t.date).toLocaleDateString()}</p>
                      </div>
                      <span className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'income' ? '+' : '-'}${t.amount}
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
                        <p className="text-sm text-gray-500">{inv.clientName}</p>
                      </div>
                      <span className="font-bold text-orange-600">${inv.total}</span>
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

const StatCard = ({ title, value, color, icon: Icon }) => {
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
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
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

const ProjectsTab = ({ projects, clients, addProject, updateProject, deleteProject }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    clientId: '',
    description: '',
    budget: '',
    deadline: '',
    progress: 0
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
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
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
        {projects.map(project => (
          <div key={project.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                <p className="text-gray-600 mb-2">{project.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Client: {project.clientName}</span>
                  <span>Budget: ${project.budget}</span>
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
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
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
          </div>
        ))}
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
                <td className="px-6 py-4 whitespace-nowrap">${item.costPerUnit}</td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold">
                  ${(item.quantity * item.costPerUnit).toFixed(2)}
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

const InvoicesTab = ({ invoices, clients, addInvoice, updateInvoiceStatus, printInvoice }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    items: [{ description: '', quantity: 1, rate: 0 }]
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
    
    setFormData({ clientId: '', items: [{ description: '', quantity: 1, rate: 0 }] });
    setShowForm(false);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, rate: 0 }]
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
                    className="col-span-6 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                  <div className="col-span-1 text-center font-semibold">
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
                <p className="text-gray-600">Client: {invoice.clientName}</p>
                <p className="text-gray-600">Date: {new Date(invoice.date).toLocaleDateString()}</p>
                <p className="text-2xl font-bold mt-2">${invoice.total.toFixed(2)}</p>
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
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Items:</h4>
              <div className="space-y-1">
                {invoice.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{item.description} ({item.quantity} × ${item.rate})</span>
                    <span className="font-semibold">${(item.quantity * item.rate).toFixed(2)}</span>
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
    category: ''
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

  const handleSubmit = (e) => {
    e.preventDefault();
    addExpense({
      ...formData,
      amount: parseFloat(formData.amount)
    });
    setFormData({ description: '', amount: '', category: '' });
    setShowForm(false);
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

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
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
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
                  ${expense.amount.toFixed(2)}
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

export default BusinessManagementApp;