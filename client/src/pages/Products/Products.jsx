import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Loader2, Tag, 
  Info, Check, X, AlertCircle, Layers, ChevronDown 
} from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/productService';
import { getCategories } from '../../services/categoryService';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Search and Filter State
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE'); // 'CREATE' | 'EDIT'
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    categoryId: '',
    price: '',
    taxPercentage: '5.00',
    uom: 'Unit',
    description: '',
    active: true
  });

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [prodsData, catsData] = await Promise.all([
        getProducts(),
        getCategories()
      ]);
      setProducts(prodsData);
      setCategories(catsData);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load products and categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Open modal for Create
  const handleOpenCreate = () => {
    setModalMode('CREATE');
    setFormData({
      id: null,
      name: '',
      categoryId: categories.length > 0 ? categories[0].id.toString() : '',
      price: '',
      taxPercentage: '5.00',
      uom: 'Unit',
      description: '',
      active: true
    });
    setError('');
    setShowModal(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (prod) => {
    setModalMode('EDIT');
    setFormData({
      id: prod.id,
      name: prod.name,
      categoryId: prod.categoryId.toString(),
      price: prod.price.toString(),
      taxPercentage: prod.taxPercentage.toString(),
      uom: prod.uom || 'Unit',
      description: prod.description || '',
      active: prod.active
    });
    setError('');
    setShowModal(true);
  };

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validations
    if (!formData.name.trim()) return setError('Product name is required.');
    if (!formData.categoryId) return setError('Please select a category.');
    if (parseFloat(formData.price) < 0 || isNaN(parseFloat(formData.price))) {
      return setError('Price must be a valid positive number.');
    }
    if (parseFloat(formData.taxPercentage) < 0 || isNaN(parseFloat(formData.taxPercentage))) {
      return setError('Tax percentage must be a valid positive number.');
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        categoryId: parseInt(formData.categoryId),
        price: parseFloat(formData.price),
        taxPercentage: parseFloat(formData.taxPercentage),
        uom: formData.uom,
        description: formData.description.trim() || null,
        active: formData.active
      };

      if (modalMode === 'CREATE') {
        await createProduct(payload);
      } else {
        await updateProduct(formData.id, payload);
      }
      
      setShowModal(false);
      fetchData(); // reload
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Product
  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    try {
      await deleteProduct(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to delete product.');
    }
  };

  // Toggle Active Status directly
  const handleToggleActive = async (prod) => {
    try {
      await updateProduct(prod.id, {
        active: !prod.active
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to toggle status.');
    }
  };

  // Filters logic
  const filteredProducts = products.filter(prod => {
    const matchesSearch = prod.name.toLowerCase().includes(search.toLowerCase()) || 
      (prod.description && prod.description.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'ALL' || prod.categoryId.toString() === categoryFilter;
    
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && prod.active) || 
      (statusFilter === 'ARCHIVED' && !prod.active);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Layers className="text-amber-500 w-7 h-7" />
            Menu Products
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage cafe menu items, pricing, taxations, and inventory units.</p>
        </div>
        <div className="flex gap-2.5">
          <button 
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-600/20 hover:shadow-amber-500/30 transition flex items-center gap-2 text-sm font-semibold"
          >
            <Plus className="w-4.5 h-4.5" /> Add Product
          </button>
        </div>
      </div>

      {/* Search and Filters panel */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search products by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-8 py-2 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-amber-500 transition"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <div className="flex-1 min-w-[140px] sm:w-48 relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full appearance-none pl-3.5 pr-10 py-2 border border-slate-200 hover:border-[#8A583C]/40 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#8A583C]/20 focus:border-[#8A583C] cursor-pointer transition-all duration-200"
            >
              <option value="ALL">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>

          {/* Status Filter */}
          <div className="flex-1 min-w-[120px] sm:w-36 relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none pl-3.5 pr-10 py-2 border border-slate-200 hover:border-[#8A583C]/40 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#8A583C]/20 focus:border-[#8A583C] cursor-pointer transition-all duration-200"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>
        </div>
      </div>

      {/* Main Table section */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-slate-500 text-sm">Fetching products and database structure...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="bg-amber-50 p-4 rounded-full text-amber-600">
            <Info className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">No Products Found</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
              {products.length === 0 
                ? "Your product catalog is empty. Start by adding items to your menu." 
                : "No items match your active filters. Try adjusting your search query or filters."}
            </p>
          </div>
          {products.length === 0 && (
            <button 
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-semibold transition"
            >
              Create First Product
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-gray-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Product Info</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Tax Rate</th>
                  <th className="px-6 py-4">UOM</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-slate-600">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/25 transition">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-slate-800">{prod.name}</div>
                        {prod.description && (
                          <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{prod.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        <span 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: prod.category?.color || '#94a3b8' }}
                        ></span>
                        {prod.category?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      ₹{parseFloat(prod.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {parseFloat(prod.taxPercentage).toFixed(0)}%
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-0.5 border border-slate-100 bg-slate-50 rounded text-slate-500 font-medium uppercase tracking-wide">
                        {prod.uom}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleToggleActive(prod)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition hover:opacity-85 ${
                          prod.active 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : 'bg-rose-50 text-rose-500'
                        }`}
                        title="Click to toggle status"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${prod.active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {prod.active ? 'Active' : 'Archived'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(prod.id, prod.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Product"
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
      )}

      {/* Floating Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Tag className="text-amber-500 w-5 h-5" />
                {modalMode === 'CREATE' ? 'Add New Product' : `Edit: ${formData.name}`}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 bg-white hover:bg-slate-100 rounded-lg transition border border-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error alerts */}
            {error && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Product Name</label>
                <input 
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Mocha Frappuccino"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                  <div className="relative">
                    <select
                      name="categoryId"
                      required
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className="w-full appearance-none pl-3.5 pr-10 py-2.5 border border-slate-200 hover:border-[#8A583C]/40 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#8A583C]/20 focus:border-[#8A583C] cursor-pointer transition-all duration-200 text-slate-700"
                    >
                      <option value="" disabled>Select category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Unit of Measure (UOM)</label>
                  <div className="relative">
                    <select
                      name="uom"
                      value={formData.uom}
                      onChange={handleInputChange}
                      className="w-full appearance-none pl-3.5 pr-10 py-2.5 border border-slate-200 hover:border-[#8A583C]/40 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#8A583C]/20 focus:border-[#8A583C] cursor-pointer transition-all duration-200 text-slate-700"
                    >
                      <option value="Unit">Unit</option>
                      <option value="Cup">Cup</option>
                      <option value="Plate">Plate</option>
                      <option value="Slice">Slice</option>
                      <option value="Glass">Glass</option>
                      <option value="Bottle">Bottle</option>
                      <option value="Gram">Gram</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Selling Price (₹)</label>
                  <input 
                    type="number"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tax rate (%)</label>
                  <input 
                    type="number"
                    name="taxPercentage"
                    required
                    min="0"
                    step="0.01"
                    placeholder="5.00"
                    value={formData.taxPercentage}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description (Optional)</label>
                <textarea 
                  name="description"
                  rows="3"
                  placeholder="Describe ingredients or details..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-amber-500 transition resize-none"
                />
              </div>

              {modalMode === 'EDIT' && (
                <div className="flex items-center gap-2 py-1 bg-slate-50/50 px-3.5 rounded-xl border border-slate-100">
                  <input 
                    type="checkbox"
                    id="active-toggle"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                    className="w-4.5 h-4.5 accent-amber-600 rounded cursor-pointer"
                  />
                  <label htmlFor="active-toggle" className="text-sm font-semibold text-slate-700 cursor-pointer">
                    Product is active and available for orders
                  </label>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white rounded-xl text-sm font-semibold shadow-lg shadow-amber-600/10 transition flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Save Product
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
