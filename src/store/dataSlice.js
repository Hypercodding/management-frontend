import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
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
  advancesAPI,
} from '../services/api';

const initialState = {
  clients: [],
  projects: [],
  inventory: [],
  transactions: [],
  invoices: [],
  expenses: [],
  employees: [],
  salaries: [],
  loans: [],
  advances: [],
  loading: false,
  error: null,
};

export const fetchAllData = createAsyncThunk('data/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const [
      clientsRes,
      projectsRes,
      inventoryRes,
      transactionsRes,
      invoicesRes,
      expensesRes,
      employeesRes,
      salariesRes,
      loansRes,
      advancesRes,
    ] = await Promise.all([
      clientsAPI.getAll(),
      projectsAPI.getAll(),
      inventoryAPI.getAll(),
      transactionsAPI.getAll(),
      invoicesAPI.getAll(),
      expensesAPI.getAll(),
      employeesAPI.getAll().catch(() => ({ data: [] })),
      salariesAPI.getAll().catch(() => ({ data: [] })),
      loansAPI.getAll().catch(() => ({ data: [] })),
      advancesAPI.getAll().catch(() => ({ data: [] })),
    ]);

    return {
      clients: clientsRes.data,
      projects: projectsRes.data,
      inventory: inventoryRes.data,
      transactions: transactionsRes.data,
      invoices: invoicesRes.data,
      expenses: expensesRes.data,
      employees: employeesRes.data,
      salaries: salariesRes.data,
      loans: loansRes.data,
      advances: advancesRes.data,
    };
  } catch (error) {
    const message = error.response?.data?.error || error.message || 'Failed to load data';
    return rejectWithValue(message);
  }
});

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setClients: (state, action) => {
      state.clients = action.payload;
    },
    addClient: (state, action) => {
      state.clients.push(action.payload);
    },
    removeClient: (state, action) => {
      state.clients = state.clients.filter((client) => client.id !== action.payload);
    },
    setProjects: (state, action) => {
      state.projects = action.payload;
    },
    addProject: (state, action) => {
      state.projects.push(action.payload);
    },
    updateProjectInState: (state, action) => {
      const { id, project } = action.payload;
      state.projects = state.projects.map((p) => (p.id === id ? { ...p, ...project } : p));
    },
    removeProject: (state, action) => {
      state.projects = state.projects.filter((project) => project.id !== action.payload);
    },
    setInventory: (state, action) => {
      state.inventory = action.payload;
    },
    addInventoryItem: (state, action) => {
      state.inventory.push(action.payload);
    },
    updateInventoryItem: (state, action) => {
      const updatedItem = action.payload;
      state.inventory = state.inventory.map((item) => (item.id === updatedItem.id ? updatedItem : item));
    },
    removeInventoryItem: (state, action) => {
      state.inventory = state.inventory.filter((item) => item.id !== action.payload);
    },
    setInvoices: (state, action) => {
      state.invoices = action.payload;
    },
    addInvoice: (state, action) => {
      state.invoices.push(action.payload);
    },
    updateInvoiceInState: (state, action) => {
      const { id, updates } = action.payload;
      state.invoices = state.invoices.map((invoice) => (invoice.id === id ? { ...invoice, ...updates } : invoice));
    },
    removeInvoice: (state, action) => {
      state.invoices = state.invoices.filter((invoice) => invoice.id !== action.payload);
    },
    setExpenses: (state, action) => {
      state.expenses = action.payload;
    },
    setTransactions: (state, action) => {
      state.transactions = action.payload;
    },
    setEmployees: (state, action) => {
      state.employees = action.payload;
    },
    addEmployee: (state, action) => {
      state.employees.push(action.payload);
    },
    updateEmployeeInState: (state, action) => {
      const { id, updates } = action.payload;
      state.employees = state.employees.map((employee) => (employee.id === id ? { ...employee, ...updates } : employee));
    },
    removeEmployee: (state, action) => {
      state.employees = state.employees.filter((employee) => employee.id !== action.payload);
    },
    setSalaries: (state, action) => {
      state.salaries = action.payload;
    },
    addSalary: (state, action) => {
      state.salaries.push(action.payload);
    },
    removeSalary: (state, action) => {
      state.salaries = state.salaries.filter((salary) => salary.id !== action.payload);
    },
    setLoans: (state, action) => {
      state.loans = action.payload;
    },
    addLoan: (state, action) => {
      state.loans.push(action.payload);
    },
    removeLoan: (state, action) => {
      state.loans = state.loans.filter((loan) => loan.id !== action.payload);
    },
    setAdvances: (state, action) => {
      state.advances = action.payload;
    },
    addAdvance: (state, action) => {
      state.advances.push(action.payload);
    },
    removeAdvance: (state, action) => {
      state.advances = state.advances.filter((advance) => advance.id !== action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllData.fulfilled, (state, action) => {
        state.loading = false;
        Object.assign(state, action.payload);
      })
      .addCase(fetchAllData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load data';
      });
  },
});

export const {
  setClients,
  addClient,
  removeClient,
  setProjects,
  addProject,
  updateProjectInState,
  removeProject,
  setInventory,
  addInventoryItem,
  updateInventoryItem,
  removeInventoryItem,
  setInvoices,
  addInvoice,
  updateInvoiceInState,
  removeInvoice,
  setExpenses,
  setTransactions,
  setEmployees,
  addEmployee,
  updateEmployeeInState,
  removeEmployee,
  setSalaries,
  addSalary,
  removeSalary,
  setLoans,
  addLoan,
  removeLoan,
  setAdvances,
  addAdvance,
  removeAdvance,
  setLoading,
  setError,
} = dataSlice.actions;

export default dataSlice.reducer;

