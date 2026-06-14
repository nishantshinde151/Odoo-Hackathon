import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Loader2, Tag, 
  Check, X, AlertCircle, FolderKanban 
} from 'lucide-react';
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../../services/categoryService';


const tea = {name: 'red' , value:"'#1c1c1c"};

// Predefined palette colors for the cafe theme
const CAFE_COLORS = [
  { name: 'Coffee Brown', value: '#6F4E37' },
  { name: 'Warm Caramel', value: '#C08261' },
  { name: 'Latte Gold', value: '#D2B48C' },
  { name: 'Dark Chocolate', value: '#3F2512' },
  { name: 'Warm Crimson', value: '#C65D52' },
  { name: 'Orange Peel', value: '#E67E22' },
  { name: 'Mustard Gold', value: '#D4AC0D' },
  { name: 'Matcha Green', value: '#58D68D' },
  { name: 'Teal Brew', value: '#16A085' },
  { name: 'Chilled Berry', value: '#AF7AC5' }
];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE'); // 'CREATE' | 'EDIT'
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    color: '#6F4E37' // Default color: Coffee Brown
  });

  // Fetch Categories
  const fetchCategoriesList = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load product categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesList();
  }, []);

  // Open modal for Create
  const handleOpenCreate = () => {
    setModalMode('CREATE');
    setFormData({
      id: null,
      name: '',
      color: '#6F4E37'
    });
    setError('');
    setShowModal(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (cat) => {
    setModalMode('EDIT');
    setFormData({
      id: cat.id,
      name: cat.name,
      color: cat.color || '#6F4E37'
    });
    setError('');
    setShowModal(true);
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) return setError('Category name is required.');
    if (!formData.color.trim()) return setError('Category color is required.');

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        color: formData.color.trim()
      };

      if (modalMode === 'CREATE') {
        await createCategory(payload);
      } else {
        await updateCategory(formData.id, payload);
      }
      
      setShowModal(false);
      fetchCategoriesList();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Category
  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete the category "${name}"? This action cannot be undone.`)) return;

    try {
      await deleteCategory(id);
      fetchCategoriesList();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to delete category. Ensure no products are currently assigned to it.');
    }
  };

  // Filter Categories
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in font-sans">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <FolderKanban className="text-[#8A583C] w-7 h-7" />
            Product Categories
          </h2>
          <p className="text-slate-500 text-sm mt-1">Organize your cafe menu items into custom categories and assign theme colors.</p>
        </div>
        <div className="flex gap-2.5 shrink-0">
          <button 
            onClick={handleOpenCreate}
            className="px-5 py-3 bg-[#8A583C] hover:bg-[#73442A] text-white rounded-xl shadow-lg shadow-amber-900/10 transition duration-300 flex items-center gap-2 text-sm font-semibold"
          >
            <Plus className="w-4.5 h-4.5" /> Add Category
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search categories by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-[#8A583C] transition duration-300"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#8A583C] animate-spin" />
          <p className="text-slate-500 text-sm">Fetching categories from database...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center flex flex-col items-center justify-center space-y-4">
          <div className="bg-[#FAF6F0] p-4 rounded-full text-[#8A583C]">
            <FolderKanban className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">No Categories Found</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
              {categories.length === 0 
                ? "You haven't defined any product categories yet. Create one to classify your menu items." 
                : "No categories match your current search queries."}
            </p>
          </div>
          {categories.length === 0 && (
            <button 
              onClick={handleOpenCreate}
              className="px-5 py-2.5 bg-[#8A583C] hover:bg-[#73442A] text-white rounded-xl text-sm font-semibold shadow-md transition duration-300"
            >
              Create First Category
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCategories.map((cat) => (
            <div 
              key={cat.id} 
              className="bg-white p-5 rounded-3xl shadow-sm hover:shadow-md border border-gray-100/60 flex flex-col justify-between h-40 group transition duration-300 relative overflow-hidden"
            >
              {/* Colored top indicator border */}
              <div 
                className="absolute top-0 left-0 right-0 h-1.5" 
                style={{ backgroundColor: cat.color || '#8A583C' }}
              />

              {/* Title & Product Count Placeholder */}
              <div className="pt-2">
                <h3 className="font-extrabold text-lg text-gray-800 group-hover:text-[#8A583C] transition duration-200">{cat.name}</h3>
                <span className="text-xs text-gray-400 font-semibold block mt-1 uppercase tracking-wider">
                  Color: {cat.color || '#6F4E37'}
                </span>
              </div>

              {/* Footer with actions and color preview */}
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-5.5 h-5.5 rounded-xl border border-gray-200/50 shadow-sm block" 
                    style={{ backgroundColor: cat.color || '#6F4E37' }} 
                  />
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleOpenEdit(cat)}
                    className="p-2 text-slate-400 hover:text-[#8A583C] hover:bg-[#FAF6F0] rounded-xl transition duration-300"
                    title="Edit Category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition duration-300"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Create/Edit Modal overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-150 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4.5 border-b border-slate-100 bg-[#FAF8F6]">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Tag className="text-[#8A583C] w-5 h-5" />
                {modalMode === 'CREATE' ? 'Add New Category' : `Edit Category`}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 bg-white hover:bg-slate-100 border border-slate-100 rounded-lg transition duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Message banner */}
            {error && (
              <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Cold Brews, Pastries"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-[#8A583C] transition duration-300"
                />
              </div>

              {/* Custom Color Selector & Palette picker */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Color</label>
                
                {/* 1. Predefined Cafe Palettes */}
                <div className="grid grid-cols-5 gap-2.5 mb-4">
                  {CAFE_COLORS.map((col) => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color: col.value }))}
                      className={`w-8.5 h-8.5 rounded-full border shadow-sm transition duration-200 hover:scale-110 flex items-center justify-center ${
                        formData.color.toLowerCase() === col.value.toLowerCase()
                          ? 'border-[#8A583C] ring-2 ring-[#8A583C]/30'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: col.value }}
                      title={col.name}
                    >
                      {formData.color.toLowerCase() === col.value.toLowerCase() && (
                        <Check className="w-3.5 h-3.5 text-white drop-shadow-sm" />
                      )}
                    </button>
                  ))}
                </div>

                {/* 2. Custom Color Picker input */}
                <div className="flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-slate-200 cursor-pointer">
                    <input 
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="absolute inset-0 w-[120%] h-[120%] -translate-x-1 -translate-y-1 cursor-pointer border-0 p-0"
                    />
                  </div>
                  <div className="flex-1">
                    <input 
                      type="text"
                      placeholder="#FFFFFF"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs uppercase text-slate-700 font-semibold focus:outline-none focus:border-[#8A583C] transition"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-[#8A583C] hover:bg-[#73442A] disabled:opacity-60 text-white rounded-xl text-sm font-semibold shadow-lg shadow-amber-900/10 transition duration-300 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Save Category
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
