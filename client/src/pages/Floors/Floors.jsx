import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Loader2, Layers, 
  Check, X, AlertCircle, RefreshCw, Eye, EyeOff, LayoutGrid
} from 'lucide-react';
import { 
  getFloors, 
  createFloor, 
  updateFloor, 
  deleteFloor 
} from '../../services/floorService';

export default function Floors() {
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
    name: '',
    active: true
  });

  // Fetch Floors
  const fetchFloorsList = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getFloors();
      setFloors(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load restaurant floors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFloorsList();
  }, []);

  // Open modal for Create
  const handleOpenCreate = () => {
    setModalMode('CREATE');
    setFormData({
      id: null,
      name: '',
      active: true
    });
    setError('');
    setShowModal(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (floor) => {
    setModalMode('EDIT');
    setFormData({
      id: floor.id,
      name: floor.name,
      active: floor.active !== undefined ? floor.active : true
    });
    setError('');
    setShowModal(true);
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) return setError('Floor name is required.');

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        active: formData.active
      };

      if (modalMode === 'CREATE') {
        await createFloor(payload);
      } else {
        await updateFloor(formData.id, payload);
      }
      
      setShowModal(false);
      fetchFloorsList();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save floor.');
    } finally {
      setSaving(false);
    }
  };

  // Toggle Floor Active Status Directly
  const handleToggleActive = async (floor) => {
    try {
      const nextActive = !floor.active;
      await updateFloor(floor.id, { name: floor.name, active: nextActive });
      fetchFloorsList();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to toggle floor status.');
    }
  };

  // Delete Floor
  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete the floor "${name}"? All tables belonging to this floor will also be permanently deleted. This action cannot be undone.`)) return;

    try {
      await deleteFloor(id);
      fetchFloorsList();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to delete floor.');
    }
  };

  // Filter Floors
  const filteredFloors = floors.filter(floor => 
    floor.name.toLowerCase().includes(search.toLowerCase())
  );

  // Helper to calculate floor occupancy details
  const getFloorStats = (floor) => {
    const tables = floor.tables || [];
    const totalTables = tables.length;
    const activeTables = tables.filter(t => t.active);
    const occupiedTables = tables.filter(t => t.active && t.orders && t.orders.length > 0).length;
    const totalSeats = tables.reduce((sum, t) => sum + t.seatsCount, 0);
    const isFull = activeTables.length > 0 && occupiedTables === activeTables.length;
    
    return {
      totalTables,
      activeTablesCount: activeTables.length,
      occupiedTables,
      totalSeats,
      isFull
    };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in font-sans">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Layers className="text-[#8A583C] w-7 h-7" />
            Cafe Floor Plan
          </h2>
          <p className="text-slate-500 text-sm mt-1">Configure layout zones, manage customer seating capacity, and disable floors when full or reserved.</p>
        </div>
        <div className="flex gap-2.5 shrink-0">
          <button 
            onClick={fetchFloorsList}
            className="p-3 text-slate-500 hover:text-[#8A583C] bg-[#FAF8F6] hover:bg-[#FAF6F0] rounded-xl border border-slate-100/50 transition duration-300"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={handleOpenCreate}
            className="px-5 py-3 bg-[#8A583C] hover:bg-[#73442A] text-white rounded-xl shadow-lg shadow-amber-900/10 transition duration-300 flex items-center gap-2 text-sm font-semibold"
          >
            <Plus className="w-4.5 h-4.5" /> Add Floor
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search floors by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-[#8A583C] transition duration-300"
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

      {/* Floors Grid */}
      {loading ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#8A583C] animate-spin" />
          <p className="text-slate-500 text-sm">Fetching floor plans from database...</p>
        </div>
      ) : filteredFloors.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center flex flex-col items-center justify-center space-y-4">
          <div className="bg-[#FAF6F0] p-4 rounded-full text-[#8A583C]">
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">No Floors Configured</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
              {floors.length === 0 
                ? "You haven't defined any cafe floor zones yet. Create a floor layout to begin seating management." 
                : "No floor zones match your current search queries."}
            </p>
          </div>
          {floors.length === 0 && (
            <button 
              onClick={handleOpenCreate}
              className="px-5 py-2.5 bg-[#8A583C] hover:bg-[#73442A] text-white rounded-xl text-sm font-semibold shadow-md transition duration-300"
            >
              Create First Floor Plan
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFloors.map((floor) => {
            const stats = getFloorStats(floor);
            const occupancyPercent = stats.activeTablesCount > 0 
              ? Math.round((stats.occupiedTables / stats.activeTablesCount) * 100) 
              : 0;

            return (
              <div 
                key={floor.id} 
                className={`bg-white p-6 rounded-3xl border shadow-sm flex flex-col justify-between h-56 transition duration-300 relative overflow-hidden ${
                  !floor.active 
                    ? 'border-gray-200 bg-gray-50/55 opacity-75' 
                    : stats.isFull
                      ? 'border-rose-200' 
                      : 'border-gray-100 hover:shadow-md'
                }`}
              >
                {/* Status Badges */}
                <div className="absolute top-4 right-4 flex gap-2">
                  {!floor.active ? (
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 font-bold text-[10px] rounded-full border border-slate-200 uppercase tracking-wider">
                      Disabled
                    </span>
                  ) : stats.isFull ? (
                    <span className="px-2.5 py-0.5 bg-rose-50 text-rose-600 font-bold text-[10px] rounded-full border border-rose-250 uppercase tracking-wider animate-pulse">
                      Full
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 font-bold text-[10px] rounded-full border border-emerald-250 uppercase tracking-wider">
                      Active
                    </span>
                  )}
                </div>

                {/* Title & Stats */}
                <div>
                  <h3 className="font-extrabold text-xl text-slate-800 flex items-center gap-2 pr-16 truncate">
                    <LayoutGrid className={`w-5 h-5 ${floor.active ? 'text-[#8A583C]' : 'text-slate-400'}`} />
                    {floor.name}
                  </h3>
                  
                  {/* Seating Details */}
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-semibold text-slate-500">
                    <div>
                      <span className="block text-slate-400 font-bold text-[9px] uppercase tracking-wider">Capacity</span>
                      <span className="text-slate-800 text-sm font-extrabold">{stats.totalSeats} Seats</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-bold text-[9px] uppercase tracking-wider">Tables</span>
                      <span className="text-slate-800 text-sm font-extrabold">{stats.activeTablesCount} / {stats.totalTables} Active</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar indicator */}
                {floor.active && stats.activeTablesCount > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">
                      <span>Occupancy</span>
                      <span className={stats.isFull ? 'text-rose-600 font-extrabold' : 'text-slate-700'}>
                        {stats.occupiedTables} / {stats.activeTablesCount} tables ({occupancyPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-100">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          stats.isFull 
                            ? 'bg-rose-500' 
                            : occupancyPercent > 70 
                              ? 'bg-amber-500' 
                              : 'bg-emerald-500'
                        }`}
                        style={{ width: `${occupancyPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Card Action footer */}
                <div className="flex justify-between items-center border-t border-slate-50 pt-4 mt-4">
                  {/* Disable Floor Switch Toggle */}
                  <button 
                    onClick={() => handleToggleActive(floor)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition duration-300 flex items-center gap-1.5 ${
                      floor.active 
                        ? 'bg-amber-50 text-amber-700 border-amber-200/55 hover:bg-amber-100' 
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {floor.active ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" /> Disable Floor
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" /> Enable Floor
                      </>
                    )}
                  </button>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleOpenEdit(floor)}
                      className="p-2 text-slate-400 hover:text-[#8A583C] hover:bg-[#FAF6F0] rounded-xl transition duration-300"
                      title="Edit Floor name"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(floor.id, floor.name)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition duration-300"
                      title="Delete Floor plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
                {modalMode === 'CREATE' ? 'Add New Floor Zone' : `Edit Floor Zone`}
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
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Floor Zone Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Ground Floor, Garden Area"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-[#8A583C] transition duration-300"
                />
              </div>

              {/* Status checkboxes */}
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  className="rounded text-[#8A583C] focus:ring-[#8A583C] border-slate-200"
                />
                <label htmlFor="active" className="text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer">
                  Enable this Floor zone by default
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
                      <Check className="w-4 h-4" /> Save Floor
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
