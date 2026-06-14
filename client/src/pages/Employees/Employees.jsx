import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Shield, Key, Trash2, Edit, Plus, Search, 
  Lock, UserPlus, X, Loader2, AlertTriangle, Check, ShieldAlert, ChevronDown
} from 'lucide-react';
import * as userService from '../../services/userService';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('EMPLOYEE');
  const [status, setStatus] = useState('ACTIVE');
  const [newPassword, setNewPassword] = useState('');
  const [modalError, setModalError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await userService.getUsers();
      setEmployees(data);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to fetch staff members');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setModalError('');
    setActionLoading(true);
    try {
      const newUser = await userService.createUser({ name, email, password, role, status });
      setEmployees([...employees, newUser]);
      setShowAddModal(false);
      resetForms();
    } catch (err) {
      setModalError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to create employee');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setModalError('');
    setActionLoading(true);
    try {
      const updatedUser = await userService.updateUser(selectedUser.id, { name, role, status });
      setEmployees(employees.map(emp => emp.id === selectedUser.id ? updatedUser : emp));
      setShowEditModal(false);
      resetForms();
    } catch (err) {
      setModalError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to update employee');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setModalError('');
    setActionLoading(true);
    try {
      await userService.changePassword(selectedUser.id, newPassword);
      setShowPasswordModal(false);
      resetForms();
    } catch (err) {
      setModalError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to change password');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setModalError('');
    setActionLoading(true);
    try {
      await userService.deleteUser(selectedUser.id);
      setEmployees(employees.filter(emp => emp.id !== selectedUser.id));
      setShowDeleteModal(false);
      resetForms();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to delete employee');
      setShowDeleteModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const resetForms = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('EMPLOYEE');
    setStatus('ACTIVE');
    setNewPassword('');
    setSelectedUser(null);
    setModalError('');
  };

  const openEdit = (emp) => {
    setSelectedUser(emp);
    setName(emp.name);
    setRole(emp.role);
    setStatus(emp.status);
    setShowEditModal(true);
  };

  const openChangePassword = (emp) => {
    setSelectedUser(emp);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const openDelete = (emp) => {
    setSelectedUser(emp);
    setShowDeleteModal(true);
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <User className="text-amber-500 w-7 h-7" /> Staff Management
          </h2>
          <p className="text-gray-500 text-sm mt-1">Configure staff details, access roles, status, and credentials.</p>
        </div>
        <button 
          onClick={() => { resetForms(); setShowAddModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition font-semibold text-sm shadow-lg shadow-amber-900/10"
        >
          <UserPlus className="w-4 h-4" /> Add Employee
        </button>
      </div>

      {/* Main Content & Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition"
            />
          </div>
        </div>

        {error && (
          <div className="m-5 bg-rose-55 border border-rose-100 text-rose-600 p-4 rounded-xl text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {/* Table View */}
        {loading && employees.length === 0 ? (
          <div className="py-20 text-center text-gray-400 font-medium flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <span>Loading employees list...</span>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="py-16 text-center text-gray-500 font-medium">
            No employees found. Try a different search term or add a new staff member.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center font-bold">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-600">{emp.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-xs ${
                        emp.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-600' : 
                        emp.role === 'KITCHEN' ? 'bg-amber-50 text-amber-600' :
                        'bg-emerald-50 text-emerald-600'
                      }`}>
                        {emp.role === 'ADMIN' ? 'Admin' : emp.role === 'KITCHEN' ? 'Kitchen' : 'Employee'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full font-bold text-xs ${emp.status === 'ACTIVE' ? 'bg-emerald-55 text-emerald-600' : 'bg-rose-55 text-rose-600'}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex gap-2">
                        <button 
                          onClick={() => openEdit(emp)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-amber-600 transition"
                          title="Edit Details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openChangePassword(emp)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-indigo-600 transition"
                          title="Change Password"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openDelete(emp)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-rose-600 hover:text-rose-500 transition"
                          title="Delete Account"
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
        )}
      </div>

      {/* Modal 1: Add Employee */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md border border-gray-100 shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <UserPlus className="text-amber-500 w-5 h-5" /> Add Staff Member
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {modalError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> {modalError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Connor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="sarah.connor@cafe.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Initial Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Access Role</label>
                  <div className="relative">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full appearance-none pl-3.5 pr-10 py-2.5 bg-white border border-gray-200 hover:border-[#8A583C]/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8A583C]/20 focus:border-[#8A583C] cursor-pointer transition-all duration-200 text-gray-700"
                    >
                      <option value="EMPLOYEE">Employee (POS)</option>
                      <option value="KITCHEN">Kitchen (KDS)</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Initial Status</label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full appearance-none pl-3.5 pr-10 py-2.5 bg-white border border-gray-200 hover:border-[#8A583C]/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8A583C]/20 focus:border-[#8A583C] cursor-pointer transition-all duration-200 text-gray-700"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-semibold text-xs hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {actionLoading ? 'Saving...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Employee */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md border border-gray-100 shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Edit className="text-amber-500 w-5 h-5" /> Edit Staff Member
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              {modalError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> {modalError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Email (Read Only)</label>
                <input
                  type="email"
                  disabled
                  value={selectedUser?.email || ''}
                  className="w-full px-3.5 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-xl text-sm outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Connor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Access Role</label>
                  <div className="relative">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full appearance-none pl-3.5 pr-10 py-2.5 bg-white border border-gray-200 hover:border-[#8A583C]/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8A583C]/20 focus:border-[#8A583C] cursor-pointer transition-all duration-200 text-gray-700"
                    >
                      <option value="EMPLOYEE">Employee (POS)</option>
                      <option value="KITCHEN">Kitchen (KDS)</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Status</label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full appearance-none pl-3.5 pr-10 py-2.5 bg-white border border-gray-200 hover:border-[#8A583C]/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8A583C]/20 focus:border-[#8A583C] cursor-pointer transition-all duration-200 text-gray-700"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-semibold text-xs hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Change Password */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md border border-gray-100 shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Lock className="text-amber-500 w-5 h-5" /> Change Password
              </h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <p className="text-xs text-gray-500 font-medium">
                Changing password for staff account: <span className="font-bold text-gray-850">{selectedUser?.email}</span>
              </p>

              {modalError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> {modalError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password (min. 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-semibold text-xs hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {actionLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Delete User Warning */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm border border-gray-100 shadow-2xl overflow-hidden animate-fade-in p-6 space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            
            <div className="text-center space-y-1">
              <h3 className="text-lg font-extrabold text-gray-800">Delete Staff Account?</h3>
              <p className="text-sm text-gray-500 leading-normal">
                Are you sure you want to permanently delete <span className="font-semibold text-gray-900">{selectedUser?.name}</span> ({selectedUser?.email})? This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold text-xs hover:bg-gray-50 transition"
              >
                Keep Account
              </button>
              <button 
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-4 py-2.5 bg-rose-650 hover:bg-rose-500 text-white rounded-xl font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1.5"
              >
                {actionLoading ? 'Deleting...' : <><Trash2 className="w-3.5 h-3.5" /> Delete User</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
