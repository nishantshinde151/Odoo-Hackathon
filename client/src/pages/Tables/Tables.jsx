import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Loader2, Check, X, 
  AlertCircle, Layers, ToggleLeft, ToggleRight, ChevronDown
} from 'lucide-react';
import { 
  getTables, 
  createTable, 
  updateTable, 
  deleteTable 
} from '../../services/tableService';
import { getFloors } from '../../services/floorService';

export default function Tables() {
  const [tables, setTables] = useState([]);
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE'); // 'CREATE' | 'EDIT'
  const [formData, setFormData] = useState({
    id: null,
    tableNumber: '',
    floorId: '',
    seatsCount: 4,
    active: true
  });

  // Fetch Tables & Floors
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [tablesData, floorsData] = await Promise.all([
        getTables(),
        getFloors()
      ]);
      setTables(tablesData);
      setFloors(floorsData);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load tables and floor configurations.');
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
      tableNumber: '',
      floorId: floors.length > 0 ? floors[0].id : '',
      seatsCount: 4,
      active: true
    });
    setError('');
    setShowModal(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (tbl) => {
    setModalMode('EDIT');
    setFormData({
      id: tbl.id,
      tableNumber: tbl.tableNumber,
      floorId: tbl.floorId,
      seatsCount: tbl.seatsCount,
      active: tbl.active !== undefined ? tbl.active : true
    });
    setError('');
    setShowModal(true);
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.tableNumber.trim()) return setError('Table number is required.');
    if (!formData.floorId) return setError('Floor location is required.');
    if (!formData.seatsCount || formData.seatsCount <= 0) return setError('Seats count must be greater than 0.');

    setSaving(true);
    try {
      const payload = {
        tableNumber: formData.tableNumber.trim(),
        floorId: parseInt(formData.floorId),
        seatsCount: parseInt(formData.seatsCount),
        active: formData.active
      };

      if (modalMode === 'CREATE') {
        await createTable(payload);
      } else {
        await updateTable(formData.id, payload);
      }
      
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save table.');
    } finally {
      setSaving(false);
    }
  };

  // Toggle Table Active Status directly
  const handleToggleActive = async (tbl) => {
    try {
      const nextActive = !tbl.active;
      await updateTable(tbl.id, { 
        tableNumber: tbl.tableNumber, 
        floorId: tbl.floorId, 
        seatsCount: tbl.seatsCount, 
        active: nextActive 
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to toggle table status.');
    }
  };

  // Delete Table
  const handleDelete = async (id, tableNumber) => {
    if (!confirm(`Are you sure you want to delete table "${tableNumber}"? This action cannot be undone.`)) return;

    try {
      await deleteTable(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to delete table.');
    }
  };

  // Filter Tables
  const filteredTables = tables.filter(tbl => 
    tbl.tableNumber.toLowerCase().includes(search.toLowerCase()) ||
    (tbl.floor?.name && tbl.floor.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in font-sans">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Layers className="text-[#8A583C] w-7 h-7" />
            Dining Tables Configuration
          </h2>
          <p className="text-slate-500 text-sm mt-1">Configure layout tables, manage seating counts, assign floors, and activate/deactivate tables.</p>
        </div>
        <div className="flex gap-2.5 shrink-0">
          <button 
            onClick={handleOpenCreate}
            disabled={floors.length === 0}
            className="px-5 py-3 bg-[#8A583C] hover:bg-[#73442A] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl shadow-lg shadow-amber-900/10 transition duration-300 flex items-center gap-2 text-sm font-semibold"
            title={floors.length === 0 ? "Create a floor first before adding tables" : ""}
          >
            <Plus className="w-4.5 h-4.5" /> Add Table
          </button>
        </div>
      </div>

      {floors.length === 0 && !loading && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span>You need to define at least one **Floor Plan** in the <a href="/floors" className="underline font-bold text-[#8A583C]">Floor Plan page</a> before you can create tables.</span>
        </div>
      )}

      {/* Search Input Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search tables by table number or floor location..."
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

      {/* Tables Grid / Table Layout */}
      {loading ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#8A583C] animate-spin" />
          <p className="text-slate-500 text-sm">Fetching table configuration from database...</p>
        </div>
      ) : filteredTables.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center flex flex-col items-center justify-center space-y-4">
          <div className="bg-[#FAF6F0] p-4 rounded-full text-[#8A583C]">
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">No Tables Configured</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
              {tables.length === 0 
                ? "You haven't defined any dining tables yet. Create tables to configure your seating areas." 
                : "No tables match your current search queries."}
            </p>
          </div>
          {tables.length === 0 && floors.length > 0 && (
            <button 
              onClick={handleOpenCreate}
              className="px-5 py-2.5 bg-[#8A583C] hover:bg-[#73442A] text-white rounded-xl text-sm font-semibold shadow-md transition duration-300"
            >
              Create First Table
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F6] border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-8 py-5">Table Number</th>
                  <th className="px-8 py-5">Floor Location</th>
                  <th className="px-8 py-5">Seats Count</th>
                  <th className="px-8 py-5">Occupancy</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600 font-sans">
                {filteredTables.map((tbl) => {
                  const activeOrder = tbl.orders && tbl.orders[0];
                  const isOccupied = tbl.active && activeOrder;
                  const customerName = activeOrder?.customer?.name || 'Walk-in Customer';

                  return (
                    <tr key={tbl.id} className="hover:bg-slate-50/50 transition">
                      {/* Table Number */}
                      <td className="px-8 py-4 font-bold text-slate-800 text-base">{tbl.tableNumber}</td>
                      
                      {/* Floor Location */}
                      <td className="px-8 py-4">
                        <span className="font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl text-xs">
                          {tbl.floor?.name || 'Unknown Floor'}
                        </span>
                      </td>

                      {/* Seats Count */}
                      <td className="px-8 py-4 font-bold text-slate-700">{tbl.seatsCount} Seats</td>

                      {/* Occupancy Status */}
                      <td className="px-8 py-4">
                        {isOccupied ? (
                          <div className="flex flex-col">
                            <span className="px-2.5 py-0.5 w-fit bg-amber-50 text-amber-700 border border-amber-250 font-bold text-[10px] rounded-full uppercase tracking-wider">
                              Occupied
                            </span>
                            <span className="text-[11px] text-slate-400 font-bold mt-0.5">{customerName}</span>
                          </div>
                        ) : tbl.active ? (
                          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-250 font-bold text-[10px] rounded-full uppercase tracking-wider">
                            Available
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">N/A (Inactive)</span>
                        )}
                      </td>

                      {/* Table Status (active/inactive toggle) */}
                      <td className="px-8 py-4">
                        <button
                          onClick={() => handleToggleActive(tbl)}
                          className="flex items-center gap-1 hover:opacity-85 transition"
                          title={tbl.active ? "Click to Deactivate Table" : "Click to Activate Table"}
                        >
                          {tbl.active ? (
                            <span className="text-emerald-500 flex items-center font-semibold text-xs gap-1">
                              <Check className="w-4.5 h-4.5" /> Active
                            </span>
                          ) : (
                            <span className="text-slate-400 flex items-center font-semibold text-xs gap-1">
                              <X className="w-4.5 h-4.5" /> Inactive
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-8 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button 
                            onClick={() => handleOpenEdit(tbl)}
                            className="p-2 text-slate-400 hover:text-[#8A583C] hover:bg-[#FAF6F0] rounded-xl transition duration-300"
                            title="Edit Table Details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(tbl.id, tbl.tableNumber)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition duration-300"
                            title="Delete Table"
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
        </div>
      )}

      {/* Floating Create/Edit Modal overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-150 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4.5 border-b border-slate-100 bg-[#FAF8F6]">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Layers className="text-[#8A583C] w-5 h-5" />
                {modalMode === 'CREATE' ? 'Add Dining Table' : 'Edit Dining Table'}
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
              {/* Table Number */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Table Number / Identifier</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. T01, B03, Terrace-4"
                  value={formData.tableNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, tableNumber: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-[#8A583C] transition duration-300"
                />
              </div>

              {/* Floor Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Floor Location</label>
                <div className="relative">
                  <select 
                    required
                    value={formData.floorId}
                    onChange={(e) => setFormData(prev => ({ ...prev, floorId: e.target.value }))}
                    className="w-full appearance-none pl-3.5 pr-10 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#8A583C]/20 focus:border-[#8A583C] cursor-pointer transition-all duration-200"
                  >
                    <option value="" disabled>Select Floor Zone</option>
                    {floors.map(floor => (
                      <option key={floor.id} value={floor.id}>
                        {floor.name} {!floor.active ? '(Inactive)' : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                </div>
              </div>

              {/* Seats Count */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Number of Seats</label>
                <input 
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={formData.seatsCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, seatsCount: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#8A583C] transition duration-300"
                />
              </div>

              {/* Active Toggles */}
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox"
                  id="tableActive"
                  checked={formData.active}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  className="rounded text-[#8A583C] focus:ring-[#8A583C] border-slate-200"
                />
                <label htmlFor="tableActive" className="text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer">
                  Activate this table by default
                </label>
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
                      <Check className="w-4 h-4" /> Save Table
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
