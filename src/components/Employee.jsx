import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Search, Filter, X } from 'lucide-react';
import { employeesAPI } from '../services/api';

const EmployeesTab = ({ employees, setEmployees, loadAllData }) => {
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
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
        base_salary: '', allowances: '', currency: 'PKR', payment_frequency: 'monthly',
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
        currency: employee.currency || 'PKR',
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
        // Clean up form data - convert empty strings to null and handle NaN values
        const cleanData = { ...formData };
        
        // Helper function to safely parse numbers
        const safeParseFloat = (val) => {
          if (!val || val === '') return null;
          const parsed = parseFloat(val);
          return isNaN(parsed) ? null : parsed;
        };
        
        const safeParseInt = (val) => {
          if (!val || val === '') return null;
          const parsed = parseInt(val);
          return isNaN(parsed) ? null : parsed;
        };
        
        const submitData = {
          ...cleanData,
          base_salary: safeParseFloat(formData.base_salary),
          allowances: safeParseFloat(formData.allowances),
          previous_experience_years: safeParseInt(formData.previous_experience_years) || 0,
          notice_period_days: safeParseInt(formData.notice_period_days) || 30,
          manager_id: formData.manager_id ? parseInt(formData.manager_id) : null,
          // Convert empty strings to null for optional fields
          alternative_phone: formData.alternative_phone || null,
          alternative_email: formData.alternative_email || null,
          date_of_birth: formData.date_of_birth || null,
          gender: formData.gender || null,
          marital_status: formData.marital_status || null,
          blood_group: formData.blood_group || null,
          nationality: formData.nationality || null,
          national_id: formData.national_id || null,
          passport_number: formData.passport_number || null,
          passport_expiry_date: formData.passport_expiry_date || null,
          address: formData.address || null,
          city: formData.city || null,
          state: formData.state || null,
          country: formData.country || null,
          postal_code: formData.postal_code || null,
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

    const departments = useMemo(() => {
      const depts = new Set(employees.map(emp => emp.department).filter(Boolean));
      return Array.from(depts).sort();
    }, [employees]);

    const filteredEmployees = useMemo(() => {
      let filtered = employees.filter(employee => {
        // Search filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          if (!employee.name?.toLowerCase().includes(searchLower) &&
              !employee.email?.toLowerCase().includes(searchLower) &&
              !employee.employee_code?.toLowerCase().includes(searchLower) &&
              !employee.position?.toLowerCase().includes(searchLower)) {
            return false;
          }
        }

        // Status filter
        if (statusFilter !== 'all' && employee.status !== statusFilter) return false;

        // Department filter
        if (departmentFilter !== 'all' && employee.department !== departmentFilter) return false;

        return true;
      });

      return filtered;
    }, [employees, searchTerm, statusFilter, departmentFilter]);
  
    const stats = useMemo(() => {
      const total = employees.length;
      const active = employees.filter(e => e.status === 'active').length;
      const onLeave = employees.filter(e => e.status === 'on-leave').length;
      return { total, active, onLeave };
    }, [employees]);

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
            <p className="text-sm text-gray-600 mt-1">
              Total: {stats.total} | Active: {stats.active} | On Leave: {stats.onLeave}
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>{editingEmployee ? 'Edit Employee' : 'Add Employee'}</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, code, or position..."
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
              {(searchTerm || statusFilter !== 'all' || departmentFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setDepartmentFilter('all');
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="on-leave">On Leave</option>
                  <option value="terminated">Terminated</option>
                  <option value="resigned">Resigned</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
  
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h2>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Section Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
              {['basic', 'personal', 'address', 'employment', 'compensation', 'bank', 'tax', 'emergency', 'professional', 'documents', 'notes'].map(section => (
                <button
                  key={section}
                  type="button"
                  onClick={() => setActiveSection(section)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeSection === section
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1).replace(/_/g, ' ')}
                </button>
              ))}
            </div>
  
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information Section */}
              {activeSection === 'basic' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Employee Code *</label>
                      <input type="text" placeholder="Employee Code" value={formData.employee_code} onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alternative Phone</label>
                      <input type="tel" placeholder="Alternative Phone" value={formData.alternative_phone} onChange={(e) => setFormData({ ...formData, alternative_phone: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alternative Email</label>
                      <input type="email" placeholder="Alternative Email" value={formData.alternative_email} onChange={(e) => setFormData({ ...formData, alternative_email: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
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
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  {editingEmployee ? 'Update Employee' : 'Save Employee'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
  
        {filteredEmployees.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">
              {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all'
                ? 'No employees found matching your filters.'
                : 'No employees yet. Add your first employee to get started!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map(emp => (
              <div key={emp.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{emp.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        emp.status === 'active' ? 'bg-green-100 text-green-800' :
                        emp.status === 'on-leave' ? 'bg-yellow-100 text-yellow-800' :
                        emp.status === 'terminated' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {emp.status || 'active'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Code:</span> {emp.employee_code}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Position:</span> {emp.position}
                    </p>
                    {emp.department && (
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Department:</span> {emp.department}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">Email:</span> {emp.email}
                    </p>
                    {emp.base_salary && (
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600">Base Salary</p>
                        <p className="text-lg font-bold text-green-600">
                          PKR {parseFloat(emp.base_salary || 0).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEdit(emp)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="Edit Employee"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(emp.id)}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    title="Delete Employee"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  export default EmployeesTab;