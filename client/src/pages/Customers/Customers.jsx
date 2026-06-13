import React, { useState, useEffect } from 'react';
import { Plus, X, Check, Loader2, AlertCircle } from 'lucide-react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../../services/customerService';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE'); // CREATE | EDIT
  const [formData, setFormData] = useState({ id: null, name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);

  // Fetch customers
  const fetchCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenCreate = () => {
    setModalMode('CREATE');
    setFormData({ id: null, name: '', email: '', phone: '' });
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (cust) => {
    setModalMode('EDIT');
    setFormData({ id: cust.id, name: cust.name, email: cust.email, phone: cust.phone });
    setError('');
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name.trim()) return setError('Name is required');
    if (!formData.email.trim()) return setError('Email is required');
    if (!formData.phone.trim()) return setError('Phone number is required');
    setSaving(true);
    try {
      const payload = { name: formData.name.trim(), email: formData.email.trim(), phone: formData.phone.trim() };
      if (modalMode === 'CREATE') {
        await createCustomer(payload);
      } else {
        await updateCustomer(formData.id, payload);
      }
      setShowModal(false);
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteCustomer(id);
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to delete customer');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Customer Directory</h2>
        <button onClick={handleOpenCreate} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition">
          <Plus className="w-4 h-4 inline-block mr-1" /> Add Customer
        </button>
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-500">
          <Loader2 className="w-6 h-6 mr-2 animate-spin" /> Loading customers...
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {customers.map((cust) => (
                <tr key={cust.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-semibold text-gray-900">{cust.name}</td>
                  <td className="px-6 py-4">{cust.email}</td>
                  <td className="px-6 py-4">{cust.phone}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleOpenEdit(cust)} className="text-amber-600 hover:text-amber-500 text-xs font-bold mr-3">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(cust.id, cust.name)} className="text-rose-600 hover:text-rose-500 text-xs font-bold">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl overflow-hidden animate-in fade-in zoom-in">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-lg font-bold">{modalMode === 'CREATE' ? 'Add New Customer' : 'Edit Customer'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            {error && (
              <div className="px-6 py-2 bg-rose-50 border border-rose-100 text-rose-600 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input name="name" value={formData.name} onChange={handleInputChange} required className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input name="email" type="email" value={formData.email} onChange={handleInputChange} required className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input name="phone" value={formData.phone} onChange={handleInputChange} required className="w-full border rounded px-3 py-2" />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded text-sm flex items-center gap-2">
                  {saving ? (<><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>) : (<><Check className="w-4 h-4" /> Save</>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
