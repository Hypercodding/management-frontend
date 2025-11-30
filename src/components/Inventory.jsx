import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Search, Filter, X, AlertTriangle } from 'lucide-react';

const InventoryTab = ({ inventory, addInventoryItem, updateInventory, deleteInventoryItem }) => {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
      name: '',
      category: '',
      quantity: '',
      unit: '',
      costPerUnit: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [stockFilter, setStockFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [lowStockThreshold, setLowStockThreshold] = useState(10);
  
    const handleSubmit = (e) => {
      e.preventDefault();
      
      // Validation
      if (parseInt(formData.quantity) < 0) {
        alert('Quantity cannot be negative');
        return;
      }
      if (parseFloat(formData.costPerUnit) < 0) {
        alert('Cost per unit cannot be negative');
        return;
      }
      
      addInventoryItem({
        ...formData,
        quantity: parseInt(formData.quantity),
        costPerUnit: parseFloat(formData.costPerUnit)
      });
      setFormData({ name: '', category: '', quantity: '', unit: '', costPerUnit: '' });
      setShowForm(false);
    };

    const categories = useMemo(() => {
      const cats = new Set(inventory.map(item => item.category).filter(Boolean));
      return Array.from(cats).sort();
    }, [inventory]);

    const filteredInventory = useMemo(() => {
      let filtered = inventory.filter(item => {
        // Search filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          if (!item.name?.toLowerCase().includes(searchLower) && 
              !item.category?.toLowerCase().includes(searchLower)) {
            return false;
          }
        }

        // Category filter
        if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;

        // Stock filter
        if (stockFilter === 'low' && item.quantity >= lowStockThreshold) return false;
        if (stockFilter === 'out' && item.quantity > 0) return false;

        return true;
      });

      return filtered;
    }, [inventory, searchTerm, categoryFilter, stockFilter, lowStockThreshold]);

    const stats = useMemo(() => {
      const totalItems = inventory.length;
      const lowStockItems = inventory.filter(item => item.quantity < lowStockThreshold && item.quantity > 0).length;
      const outOfStockItems = inventory.filter(item => item.quantity === 0).length;
      const totalValue = inventory.reduce((sum, item) => 
        sum + (item.quantity * parseFloat(item.cost_per_unit || 0)), 0);
      return { totalItems, lowStockItems, outOfStockItems, totalValue };
    }, [inventory, lowStockThreshold]);
  
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
            <p className="text-sm text-gray-600 mt-1">
              Total Items: {stats.totalItems} | Low Stock: {stats.lowStockItems} | Out of Stock: {stats.outOfStockItems}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Item</span>
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Inventory Value</p>
            <p className="text-2xl font-bold text-gray-900">PKR {stats.totalValue.toFixed(2)}</p>
          </div>
          {stats.lowStockItems > 0 && (
            <div className="bg-orange-50 rounded-lg shadow p-4 border border-orange-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-orange-600 font-medium">Low Stock Items</p>
                  <p className="text-xl font-bold text-orange-700">{stats.lowStockItems}</p>
                </div>
              </div>
            </div>
          )}
          {stats.outOfStockItems > 0 && (
            <div className="bg-red-50 rounded-lg shadow p-4 border border-red-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm text-red-600 font-medium">Out of Stock</p>
                  <p className="text-xl font-bold text-red-700">{stats.outOfStockItems}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by item name or category..."
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
              {(searchTerm || categoryFilter !== 'all' || stockFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                    setStockFilter('all');
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value="all">All Items</option>
                  <option value="low">Low Stock</option>
                  <option value="out">Out of Stock</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                <input
                  type="number"
                  min="1"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 10)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
            </div>
          )}
        </div>
  
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New Inventory Item</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Item Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Category *"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Quantity *"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Unit (e.g., pcs, kg) *"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Cost per Unit *"
                  value={formData.costPerUnit}
                  onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Add Item
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
  
        {filteredInventory.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">
              {searchTerm || categoryFilter !== 'all' || stockFilter !== 'all'
                ? 'No items found matching your filters.'
                : 'No inventory items yet. Add your first item to get started!'}
            </p>
          </div>
        ) : (
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
                {filteredInventory.map(item => {
                  const isLowStock = item.quantity < lowStockThreshold && item.quantity > 0;
                  const isOutOfStock = item.quantity === 0;
                  return (
                    <tr key={item.id} className={isOutOfStock ? 'bg-red-50' : isLowStock ? 'bg-orange-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{item.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={isOutOfStock ? 'text-red-600 font-semibold' : isLowStock ? 'text-orange-600 font-semibold' : 'text-gray-900'}>
                            {item.quantity}
                          </span>
                          {isOutOfStock && <AlertTriangle className="w-4 h-4 text-red-600" />}
                          {isLowStock && !isOutOfStock && <AlertTriangle className="w-4 h-4 text-orange-600" />}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{item.unit}</td>
                      <td className="px-6 py-4 whitespace-nowrap">PKR {parseFloat(item.cost_per_unit || 0).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold">
                        PKR {(item.quantity * parseFloat(item.cost_per_unit || 0)).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              const qty = parseInt(prompt('Add quantity:', '1'));
                              if (qty && qty > 0) {
                                updateInventory(item.id, qty);
                              } else if (qty !== null) {
                                alert('Please enter a valid positive number');
                              }
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                            title="Add stock"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => {
                              const qty = parseInt(prompt('Remove quantity:', '1'));
                              if (qty && qty > 0) {
                                if (qty > item.quantity) {
                                  alert(`Cannot remove more than available quantity (${item.quantity})`);
                                  return;
                                }
                                updateInventory(item.id, -qty);
                              } else if (qty !== null) {
                                alert('Please enter a valid positive number');
                              }
                            }}
                            className="text-orange-600 hover:text-orange-800 text-sm font-medium transition-colors"
                            title="Remove stock"
                          >
                            Remove
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${item.name}?`)) {
                                deleteInventoryItem(item.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  export default InventoryTab;
