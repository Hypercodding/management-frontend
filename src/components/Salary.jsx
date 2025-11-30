import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Filter, X, Info, Calculator, Printer, Eye, Trash2 } from 'lucide-react';
import { salariesAPI } from '../services/api';
import printSalarySlip from '../utils/printSalarySlip';

const SalariesTab = ({ salaries, employees, setSalaries, loadAllData }) => {
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [monthFilter, setMonthFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [activeSection, setActiveSection] = useState('basic'); // basic, allowances, deductions, bonuses, tracking
    
    const [formData, setFormData] = useState({
      // Basic Info
      employee_id: '',
      payment_month: '',
      base_salary: '',
      payment_cycle: 'monthly',
      
      // Allowances
      allowances: '',
      housing_allowance: '',
      transport_allowance: '',
      medical_allowance: '',
      food_allowance: '',
      other_allowances: '',
      
      // Overtime & Hours
      overtime_hours: '',
      overtime_pay: '',
      
      // Bonuses & Incentives
      bonus: '',
      performance_bonus: '',
      incentive: '',
      arrears: '',
      salary_revision_amount: '',
      
      // Deductions
      tax_deduction: '',
      income_tax: '',
      insurance_deduction: '',
      provident_fund: '',
      professional_tax: '',
      esi_deduction: '',
      other_deductions: '',
      
      // Leave Management
      leave_days: '0',
      paid_leaves: '0',
      unpaid_leaves: '0',
      
      // Payment Info
      payment_method: 'bank_transfer',
      payment_reference_number: '',
      notes: '',
      
      // Flags
      is_prorated: false
    });

    // Calculate working days and prorated salary
    const calculateSalaryDetails = useMemo(() => {
      if (!formData.employee_id || !formData.payment_month || !formData.base_salary) {
        return null;
      }

      const employee = employees.find(e => e.id === parseInt(formData.employee_id));
      if (!employee) return null;

      const paymentMonth = new Date(formData.payment_month + '-01');
      const year = paymentMonth.getFullYear();
      const month = paymentMonth.getMonth();

      // Get total days in the month
      const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
      
      // Get first day of month
      const firstDayOfMonth = new Date(year, month, 1);
      
      // Get last day of month
      const lastDayOfMonth = new Date(year, month + 1, 0);

      // Check if employee joined mid-month
      let workingDaysStart = 1;
      let workingDaysEnd = totalDaysInMonth;
      let isProrated = false;
      let prorationReason = '';

      if (employee.hire_date) {
        const hireDate = new Date(employee.hire_date);
        hireDate.setHours(0, 0, 0, 0);
        
        if (hireDate > firstDayOfMonth) {
          workingDaysStart = hireDate.getDate();
          isProrated = true;
          prorationReason = `Employee joined on ${hireDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        }
      }

      // Check if employee left/resigned during the month
      if (employee.contract_end_date || employee.status === 'terminated' || employee.status === 'resigned') {
        let endDate = null;
        if (employee.contract_end_date) {
          endDate = new Date(employee.contract_end_date);
        }
        
        if (endDate && endDate < lastDayOfMonth && endDate >= firstDayOfMonth) {
          workingDaysEnd = endDate.getDate();
          isProrated = true;
          prorationReason = prorationReason 
            ? `${prorationReason}, left on ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
            : `Employee left on ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        }
      }

      // Calculate working days (excluding weekends and leaves)
      const leaveDays = parseFloat(formData.leave_days) || 0;
      const unpaidLeaves = parseFloat(formData.unpaid_leaves) || 0;
      const totalWorkingDays = (workingDaysEnd - workingDaysStart + 1) - leaveDays;
      
      const actualWorkingDays = Math.max(0, totalWorkingDays);
      const safeTotalDays = totalDaysInMonth || 1;
      const safeNumber = (value) => (Number.isFinite(value) && !isNaN(value)) ? value : 0;

      // Calculate prorated base salary
      const baseSalary = parseFloat(formData.base_salary) || 0;
      const dailyRate = safeNumber(safeTotalDays > 0 ? baseSalary / safeTotalDays : 0);
      const proratedBaseSalary = safeNumber(dailyRate * actualWorkingDays);

      return {
        totalDaysInMonth,
        workingDaysStart,
        workingDaysEnd,
        leaveDays,
        unpaidLeaves,
        actualWorkingDays,
        isProrated,
        prorationReason,
        dailyRate,
        proratedBaseSalary,
        baseSalary
      };
    }, [formData, employees]);

    // Update form when employee or month changes
    useEffect(() => {
      if (formData.employee_id && formData.payment_month) {
        const employee = employees.find(e => e.id === parseInt(formData.employee_id));
        if (employee) {
          setFormData(prev => ({
            ...prev,
            base_salary: employee.base_salary || prev.base_salary,
            allowances: employee.allowances || prev.allowances,
            is_prorated: calculateSalaryDetails?.isProrated || false
          }));
        }
      }
    }, [formData.employee_id, formData.payment_month, employees, calculateSalaryDetails]);

    // Load preview from backend
    const handlePreview = async () => {
      if (!formData.employee_id || !formData.payment_month) {
        alert('Please select employee and payment month first');
        return;
      }

      setLoadingPreview(true);
      try {
        const paymentMonthDate = formData.payment_month ? `${formData.payment_month}-01` : '';
        
        const previewPayload = {
          employee_id: parseInt(formData.employee_id),
          payment_month: paymentMonthDate,
          base_salary: calculateSalaryDetails?.proratedBaseSalary || formData.base_salary,
          allowances: formData.allowances || 0,
          housing_allowance: formData.housing_allowance || 0,
          transport_allowance: formData.transport_allowance || 0,
          medical_allowance: formData.medical_allowance || 0,
          food_allowance: formData.food_allowance || 0,
          other_allowances: formData.other_allowances || 0,
          overtime_hours: formData.overtime_hours || 0,
          overtime_pay: formData.overtime_pay || 0,
          bonus: formData.bonus || 0,
          performance_bonus: formData.performance_bonus || 0,
          incentive: formData.incentive || 0,
          arrears: formData.arrears || 0,
          tax_deduction: formData.tax_deduction || 0,
          income_tax: formData.income_tax || 0,
          insurance_deduction: formData.insurance_deduction || 0,
          provident_fund: formData.provident_fund || 0,
          professional_tax: formData.professional_tax || 0,
          esi_deduction: formData.esi_deduction || 0,
          other_deductions: formData.other_deductions || 0,
          unpaid_leaves: formData.unpaid_leaves || 0,
          total_days_in_month: calculateSalaryDetails?.totalDaysInMonth || 30
        };

        const response = await salariesAPI.preview(previewPayload);
        setPreviewData(response.data);
        setShowPreview(true);
      } catch (error) {
        console.error('Error loading preview:', error);
        alert('Error loading preview: ' + (error.response?.data?.error || error.message));
      } finally {
        setLoadingPreview(false);
      }
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!formData.employee_id) {
        alert('Please select an employee');
        return;
      }
      if (!formData.payment_month) {
        alert('Please select a payment month');
        return;
      }
      if (parseFloat(formData.base_salary) <= 0) {
        alert('Base salary must be greater than 0');
        return;
      }

      const leaveDays = parseFloat(formData.leave_days) || 0;
      if (leaveDays < 0) {
        alert('Leave days cannot be negative');
        return;
      }

      if (!calculateSalaryDetails) {
        alert('Unable to calculate salary details. Please check the form.');
        return;
      }

      if (calculateSalaryDetails.actualWorkingDays <= 0) {
        alert('Working days cannot be zero or negative. Please check leave days and employee dates.');
        return;
      }
      
      try {
        const paymentMonthDate = formData.payment_month ? `${formData.payment_month}-01` : '';
        
        // Calculate total allowances
        const totalAllowances = parseFloat(formData.allowances || 0) +
          parseFloat(formData.housing_allowance || 0) +
          parseFloat(formData.transport_allowance || 0) +
          parseFloat(formData.medical_allowance || 0) +
          parseFloat(formData.food_allowance || 0) +
          parseFloat(formData.other_allowances || 0);

        // Use preview if available, otherwise calculate locally
        let salaryData;
        if (previewData && previewData.calculation) {
          const calc = previewData.calculation;
          salaryData = {
            ...formData,
            payment_month: paymentMonthDate,
            employee_id: parseInt(formData.employee_id),
            base_salary: calc.base_salary,
            allowances: calc.allowances,
            overtime_hours: parseFloat(formData.overtime_hours || 0),
            overtime_pay: calc.overtime_pay,
            bonus: calc.bonus,
            performance_bonus: calc.performance_bonus || 0,
            incentive: calc.incentive || 0,
            arrears: calc.arrears || 0,
            tax_deduction: calc.deductions?.tax || 0,
            income_tax: calc.deductions?.income_tax || 0,
            insurance_deduction: calc.deductions?.insurance || 0,
            provident_fund: calc.deductions?.provident_fund || 0,
            professional_tax: calc.deductions?.professional_tax || 0,
            esi_deduction: calc.deductions?.esi || 0,
            loan_deduction: calc.deductions?.loan || 0,
            advance_deduction: calc.deductions?.advance || 0,
            loss_of_pay: calc.deductions?.loss_of_pay || 0,
            other_deductions: calc.deductions?.other || 0,
            leave_days: leaveDays,
            paid_leaves: parseFloat(formData.paid_leaves || 0),
            unpaid_leaves: parseFloat(formData.unpaid_leaves || 0),
            working_days: calculateSalaryDetails.actualWorkingDays,
            total_days_in_month: calculateSalaryDetails.totalDaysInMonth,
            is_prorated: calculateSalaryDetails.isProrated,
            payment_method: formData.payment_method,
            payment_reference_number: formData.payment_reference_number || null,
            notes: formData.notes || null
          };
        } else {
          salaryData = {
          ...formData,
          payment_month: paymentMonthDate,
          employee_id: parseInt(formData.employee_id),
          base_salary: calculateSalaryDetails.proratedBaseSalary,
            allowances: totalAllowances,
            overtime_hours: parseFloat(formData.overtime_hours || 0),
          overtime_pay: parseFloat(formData.overtime_pay || 0),
          bonus: parseFloat(formData.bonus || 0),
            performance_bonus: parseFloat(formData.performance_bonus || 0),
            incentive: parseFloat(formData.incentive || 0),
            arrears: parseFloat(formData.arrears || 0),
            tax_deduction: parseFloat(formData.tax_deduction || 0),
            income_tax: parseFloat(formData.income_tax || 0),
            insurance_deduction: parseFloat(formData.insurance_deduction || 0),
            provident_fund: parseFloat(formData.provident_fund || 0),
            professional_tax: parseFloat(formData.professional_tax || 0),
            esi_deduction: parseFloat(formData.esi_deduction || 0),
            other_deductions: parseFloat(formData.other_deductions || 0),
          leave_days: leaveDays,
            paid_leaves: parseFloat(formData.paid_leaves || 0),
            unpaid_leaves: parseFloat(formData.unpaid_leaves || 0),
          working_days: calculateSalaryDetails.actualWorkingDays,
          total_days_in_month: calculateSalaryDetails.totalDaysInMonth,
            is_prorated: calculateSalaryDetails.isProrated,
            payment_method: formData.payment_method,
            payment_reference_number: formData.payment_reference_number || null,
            notes: formData.notes || null
        };
        }
        
        const response = await salariesAPI.create(salaryData);
        setSalaries([...salaries, response.data]);
        
        // Reset form
        setFormData({
          employee_id: '', payment_month: '', base_salary: '', payment_cycle: 'monthly',
          allowances: '', housing_allowance: '', transport_allowance: '', medical_allowance: '',
          food_allowance: '', other_allowances: '', overtime_hours: '', overtime_pay: '',
          bonus: '', performance_bonus: '', incentive: '', arrears: '', salary_revision_amount: '',
          tax_deduction: '', income_tax: '', insurance_deduction: '', provident_fund: '',
          professional_tax: '', esi_deduction: '', other_deductions: '',
          leave_days: '0', paid_leaves: '0', unpaid_leaves: '0',
          payment_method: 'bank_transfer', payment_reference_number: '', notes: '',
          is_prorated: false
        });
        setPreviewData(null);
        setShowPreview(false);
        setShowForm(false);
        alert('Salary payment recorded successfully!');
        await loadAllData();
      } catch (error) {
        console.error('Error adding salary:', error);
        alert('Error adding salary payment: ' + (error.response?.data?.error || error.message));
      }
    };

    const handleDelete = async (salaryId, employeeName, paymentMonth) => {
      const confirmMessage = `Are you sure you want to delete the salary payment for ${employeeName} for ${new Date(paymentMonth).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}?\n\nThis action cannot be undone.`;
      
      if (!window.confirm(confirmMessage)) {
        return;
      }

      try {
        await salariesAPI.delete(salaryId);
        alert('Salary payment deleted successfully!');
        // Refresh all data including salaries, transactions, and expenses to update dashboard
        await loadAllData();
      } catch (error) {
        console.error('Error deleting salary:', error);
        alert('Error deleting salary payment: ' + (error.response?.data?.error || error.message));
      }
    };

    // Current month calculations
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthSalaries = useMemo(() => {
      return salaries.filter(salary => {
        const salaryDate = new Date(salary.payment_month);
        return salaryDate.getMonth() === currentMonth && salaryDate.getFullYear() === currentYear;
      });
    }, [salaries, currentMonth, currentYear]);

    const stats = useMemo(() => {
      const total = salaries.length;
      const totalGross = salaries.reduce((sum, s) => sum + parseFloat(s.gross_salary || 0), 0);
      const totalNet = salaries.reduce((sum, s) => sum + parseFloat(s.net_salary || 0), 0);
      const currentMonthGross = currentMonthSalaries.reduce((sum, s) => sum + parseFloat(s.gross_salary || 0), 0);
      const currentMonthNet = currentMonthSalaries.reduce((sum, s) => sum + parseFloat(s.net_salary || 0), 0);
      return { total, totalGross, totalNet, currentMonthGross, currentMonthNet };
    }, [salaries, currentMonthSalaries]);

    const filteredSalaries = useMemo(() => {
      let filtered = salaries.filter(salary => {
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          const employee = employees.find(e => e.id === salary.employee_id);
          if (!employee?.name?.toLowerCase().includes(searchLower)) {
            return false;
          }
        }

        if (monthFilter !== 'all') {
          const salaryDate = new Date(salary.payment_month);
          const now = new Date();
          
          if (monthFilter === 'thisMonth') {
            if (salaryDate.getMonth() !== now.getMonth() || salaryDate.getFullYear() !== now.getFullYear()) {
              return false;
            }
          } else if (monthFilter === 'lastMonth') {
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            if (salaryDate < lastMonth || salaryDate >= thisMonth) return false;
          }
        }

        return true;
      });

      filtered.sort((a, b) => {
        const dateA = new Date(a.payment_month).getTime();
        const dateB = new Date(b.payment_month).getTime();
        return dateB - dateA;
      });

      return filtered;
    }, [salaries, employees, searchTerm, monthFilter]);
  
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Salary Management</h1>
            <p className="text-sm text-gray-600 mt-1">
              Total Payments: {stats.total} | This Month: {currentMonthSalaries.length}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Pay Salary</span>
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Gross Salary</p>
            <p className="text-xl font-bold text-gray-900">PKR {stats.totalGross.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Net Salary</p>
            <p className="text-xl font-bold text-green-600">PKR {stats.totalNet.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">This Month Gross</p>
            <p className="text-xl font-bold text-blue-600">PKR {stats.currentMonthGross.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">This Month Net</p>
            <p className="text-xl font-bold text-green-600">PKR {stats.currentMonthNet.toFixed(2)}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by employee name..."
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
              {(searchTerm || monthFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setMonthFilter('all');
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <select
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  >
                    <option value="all">All Months</option>
                    <option value="thisMonth">This Month</option>
                    <option value="lastMonth">Last Month</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
  
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Process Salary Payment</h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setShowPreview(false);
                  setPreviewData(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Section Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
              {['basic', 'allowances', 'deductions', 'bonuses', 'tracking'].map(section => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeSection === section
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
                  <select
                    value={formData.employee_id}
                    onChange={(e) => {
                      const empId = e.target.value;
                      const emp = employees.find(e => e.id === parseInt(empId));
                      setFormData({
                        ...formData,
                        employee_id: empId,
                        base_salary: emp ? (emp.base_salary || '') : '',
                        allowances: emp ? (emp.allowances || '') : ''
                      });
                    }}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="">Select Employee *</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} - {emp.position}
                        {emp.hire_date ? ` (Joined: ${new Date(emp.hire_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Base Salary (Monthly) *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Base Salary *"
                        value={formData.base_salary}
                        onChange={(e) => setFormData({ ...formData, base_salary: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                      {calculateSalaryDetails && (
                        <p className="text-xs text-gray-500 mt-1">
                          Prorated: PKR {(calculateSalaryDetails.proratedBaseSalary || 0).toFixed(2)} 
                          ({calculateSalaryDetails.actualWorkingDays} days)
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Cycle</label>
                      <select
                        value={formData.payment_cycle}
                        onChange={(e) => setFormData({ ...formData, payment_cycle: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="bi-weekly">Bi-Weekly</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Overtime Hours</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="Overtime Hours"
                        value={formData.overtime_hours}
                        onChange={(e) => setFormData({ ...formData, overtime_hours: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Overtime Pay</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Overtime Pay"
                        value={formData.overtime_pay}
                        onChange={(e) => setFormData({ ...formData, overtime_pay: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Leave Management */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Leave Management</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Leave Days</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          placeholder="Leave Days"
                          value={formData.leave_days}
                          onChange={(e) => setFormData({ ...formData, leave_days: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Paid Leaves</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          placeholder="Paid Leaves"
                          value={formData.paid_leaves}
                          onChange={(e) => setFormData({ ...formData, paid_leaves: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unpaid Leaves (LOP)</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          placeholder="Unpaid Leaves"
                          value={formData.unpaid_leaves}
                          onChange={(e) => setFormData({ ...formData, unpaid_leaves: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>
              </div>

              {/* Salary Calculation Info */}
              {calculateSalaryDetails && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Calculator className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 mb-2">Salary Calculation Details</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Total Days in Month</p>
                          <p className="font-semibold text-gray-900">{calculateSalaryDetails.totalDaysInMonth}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Working Days</p>
                          <p className="font-semibold text-green-600">{calculateSalaryDetails.actualWorkingDays}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Leave Days</p>
                          <p className="font-semibold text-orange-600">{calculateSalaryDetails.leaveDays}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Daily Rate</p>
                          <p className="font-semibold text-gray-900">PKR {(calculateSalaryDetails.dailyRate || 0).toFixed(2)}</p>
                        </div>
                      </div>
                      {calculateSalaryDetails.isProrated && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-blue-900">Prorated Salary</p>
                              <p className="text-xs text-blue-700 mt-1">{calculateSalaryDetails.prorationReason}</p>
                              <p className="text-xs text-blue-700">
                                Working period: Day {calculateSalaryDetails.workingDaysStart} to Day {calculateSalaryDetails.workingDaysEnd}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                    </div>
                  )}
                </div>
              )}

              {/* Allowances Section */}
              {activeSection === 'allowances' && (
                <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">General Allowances</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                        placeholder="General Allowances"
                        value={formData.allowances}
                        onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Housing Allowance</label>
                  <input
                    type="number"
                        step="0.01"
                    min="0"
                        placeholder="Housing/Rent Allowance"
                        value={formData.housing_allowance}
                        onChange={(e) => setFormData({ ...formData, housing_allowance: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Transport Allowance</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                        placeholder="Transportation Allowance"
                        value={formData.transport_allowance}
                        onChange={(e) => setFormData({ ...formData, transport_allowance: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Medical Allowance</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                        placeholder="Medical Allowance"
                        value={formData.medical_allowance}
                        onChange={(e) => setFormData({ ...formData, medical_allowance: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Food Allowance</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                        placeholder="Food/Meal Allowance"
                        value={formData.food_allowance}
                        onChange={(e) => setFormData({ ...formData, food_allowance: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Other Allowances</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Other Miscellaneous Allowances"
                        value={formData.other_allowances}
                        onChange={(e) => setFormData({ ...formData, other_allowances: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Deductions Section */}
              {activeSection === 'deductions' && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-semibold mb-1">Automatic Deductions</p>
                        <p>Loan and advance deductions will be automatically calculated from active loans/advances.</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tax Deduction</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Tax Deduction"
                    value={formData.tax_deduction}
                    onChange={(e) => setFormData({ ...formData, tax_deduction: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Income Tax (TDS)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Income Tax"
                        value={formData.income_tax}
                        onChange={(e) => setFormData({ ...formData, income_tax: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Professional Tax</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Professional Tax (Auto-calculated if left empty)"
                        value={formData.professional_tax}
                        onChange={(e) => setFormData({ ...formData, professional_tax: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Deduction</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Insurance Deduction"
                    value={formData.insurance_deduction}
                    onChange={(e) => setFormData({ ...formData, insurance_deduction: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Provident Fund (EPF)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Provident Fund (Optional - enter amount if applicable)"
                        value={formData.provident_fund}
                        onChange={(e) => setFormData({ ...formData, provident_fund: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ESI Deduction</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Employee State Insurance"
                        value={formData.esi_deduction}
                        onChange={(e) => setFormData({ ...formData, esi_deduction: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Other Deductions</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Other Miscellaneous Deductions"
                        value={formData.other_deductions}
                        onChange={(e) => setFormData({ ...formData, other_deductions: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bonuses & Incentives Section */}
              {activeSection === 'bonuses' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bonus</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Bonus Amount"
                        value={formData.bonus}
                        onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Performance Bonus</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Performance-based Bonus"
                        value={formData.performance_bonus}
                        onChange={(e) => setFormData({ ...formData, performance_bonus: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
              </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Incentive</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Sales/Performance Incentive"
                        value={formData.incentive}
                        onChange={(e) => setFormData({ ...formData, incentive: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Arrears</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Salary Arrears (Back Pay)"
                        value={formData.arrears}
                        onChange={(e) => setFormData({ ...formData, arrears: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Salary Revision Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Amount due to salary revision"
                        value={formData.salary_revision_amount}
                        onChange={(e) => setFormData({ ...formData, salary_revision_amount: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Tracking Section */}
              {activeSection === 'tracking' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                      <select
                        value={formData.payment_method}
                        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cash">Cash</option>
                        <option value="cheque">Cheque</option>
                        <option value="online">Online Payment</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Reference Number</label>
                      <input
                        type="text"
                        placeholder="Bank Transfer Reference Number"
                        value={formData.payment_reference_number}
                        onChange={(e) => setFormData({ ...formData, payment_reference_number: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        rows="3"
                        placeholder="Additional notes or remarks..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    </div>
                    </div>
              )}

              {/* Preview Section */}
              {showPreview && previewData && previewData.calculation && (
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-green-900">Salary Preview</h3>
                    <button
                      type="button"
                      onClick={() => setShowPreview(false)}
                      className="text-green-700 hover:text-green-900"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    </div>
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600">Base Salary:</p>
                        <p className="font-semibold text-gray-900">PKR {(previewData.calculation.base_salary || 0).toFixed(2)}</p>
                    </div>
                      <div>
                        <p className="text-gray-600">Total Allowances:</p>
                        <p className="font-semibold text-gray-900">PKR {(previewData.calculation.allowances || 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Overtime Pay:</p>
                        <p className="font-semibold text-gray-900">PKR {(previewData.calculation.overtime_pay || 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Bonus:</p>
                        <p className="font-semibold text-gray-900">PKR {(previewData.calculation.bonus || 0).toFixed(2)}</p>
                      </div>
                      {(previewData.calculation.performance_bonus || 0) > 0 && (
                        <div>
                          <p className="text-gray-600">Performance Bonus:</p>
                          <p className="font-semibold text-gray-900">PKR {(previewData.calculation.performance_bonus || 0).toFixed(2)}</p>
                        </div>
                      )}
                      {(previewData.calculation.arrears || 0) > 0 && (
                        <div>
                          <p className="text-gray-600">Arrears:</p>
                          <p className="font-semibold text-gray-900">PKR {(previewData.calculation.arrears || 0).toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                    <div className="pt-3 border-t border-green-200">
                      <p className="text-gray-600 mb-1">Gross Salary:</p>
                      <p className="text-xl font-bold text-green-700">PKR {(previewData.calculation.gross_salary || 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-white rounded p-3 space-y-2">
                      <p className="font-semibold text-gray-900 mb-2">Deductions Breakdown:</p>
                      {Object.entries(previewData.calculation.deductions || {}).map(([key, value]) => {
                        if (parseFloat(value) <= 0) return null;
                        return (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                            <span className="font-semibold text-red-600">-PKR {parseFloat(value).toFixed(2)}</span>
                          </div>
                        );
                      })}
                      {(previewData.calculation.loan_deductions?.total || 0) > 0 && (
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-sm font-semibold text-gray-700 mb-1">Loan Deductions:</p>
                          {previewData.calculation.loan_deductions.breakdown?.map((loan, idx) => (
                            <div key={idx} className="flex justify-between text-xs text-gray-600 ml-2">
                              <span>Loan #{loan.loan_id}:</span>
                              <span>-PKR {parseFloat(loan.amount).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {(previewData.calculation.advance_deductions?.total || 0) > 0 && (
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-sm font-semibold text-gray-700 mb-1">Advance Deductions:</p>
                          {previewData.calculation.advance_deductions.breakdown?.map((adv, idx) => (
                            <div key={idx} className="flex justify-between text-xs text-gray-600 ml-2">
                              <span>Advance #{adv.advance_id}:</span>
                              <span>-PKR {parseFloat(adv.amount).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="pt-3 border-t-2 border-green-300">
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-semibold text-gray-900">Total Deductions:</p>
                        <p className="text-lg font-bold text-red-600">-PKR {(previewData.calculation.total_deductions || 0).toFixed(2)}</p>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xl font-bold text-gray-900">Net Salary:</p>
                        <p className="text-2xl font-bold text-blue-600">PKR {(previewData.calculation.net_salary || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handlePreview}
                  disabled={loadingPreview || !formData.employee_id || !formData.payment_month}
                  className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Eye className="w-4 h-4" />
                  <span>{loadingPreview ? 'Loading Preview...' : 'Preview Salary'}</span>
                </button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Process Salary
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setShowPreview(false);
                    setPreviewData(null);
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
  
        {filteredSalaries.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">
              {searchTerm || monthFilter !== 'all'
                ? 'No salary payments found matching your filters.'
                : 'No salary payments yet. Process your first salary payment to get started!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredSalaries.map(salary => (
            <div key={salary.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{salary.employee_name}</h3>
                    {salary.is_prorated && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        Prorated
                      </span>
                    )}
                    {salary.leave_days > 0 && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                        {salary.leave_days} Leave Day{salary.leave_days !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4">
                    Month: {new Date(salary.payment_month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                    {salary.working_days && salary.total_days_in_month && (
                      <span className="ml-2 text-sm">
                        ({salary.working_days}/{salary.total_days_in_month} days)
                      </span>
                    )}
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Gross Salary</p>
                      <p className="text-lg font-bold text-green-600">PKR {parseFloat(salary.gross_salary || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Deductions</p>
                      <p className="text-lg font-bold text-red-600">PKR {parseFloat(salary.total_deductions || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Net Salary</p>
                      <p className="text-lg font-bold text-blue-600">PKR {parseFloat(salary.net_salary || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex flex-col gap-2">
                  <button
                    onClick={() => printSalarySlip(salary)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    aria-label="Print salary slip"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Slip</span>
                  </button>
                  <button
                    onClick={() => handleDelete(salary.id, salary.employee_name, salary.payment_month)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    aria-label="Delete salary payment"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  export default SalariesTab;
