import React, { useState, useEffect } from 'react';
import { 
  Layers, LayoutGrid, Users, Plus, Check, X, Search, Loader2, 
  ArrowLeft, Trash2, ShoppingCart, UserPlus, CreditCard, Send, Coffee,
  RefreshCw, AlertCircle
} from 'lucide-react';
import { getFloors } from '../../services/floorService';
import { getProducts } from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import { getCustomers, createCustomer } from '../../services/customerService';
import { createOrder, updateOrder } from '../../services/orderService';

export default function POS() {
  // Master lists loaded from API
  const [floors, setFloors] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  // App state
  const [loading, setLoading] = useState(true);
  const [activeFloorId, setActiveFloorId] = useState(null);
  
  // Selected table/order context
  const [selectedTable, setSelectedTable] = useState(null); // the active table
  const [activeOrder, setActiveOrder] = useState(null); // active backend order
  const [cart, setCart] = useState([]); // cart items [{ productId, name, price, qty }]
  
  // Modal & search states for customer allocation
  const [showAllocModal, setShowAllocModal] = useState(false);
  const [allocatingTable, setAllocatingTable] = useState(null);
  const [searchCustQuery, setSearchCustQuery] = useState('');
  const [selectedCustId, setSelectedCustId] = useState('');
  
  // Quick-create customer form state
  const [showQuickCust, setShowQuickCust] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [creatingCust, setCreatingCust] = useState(false);

  // Cart operations loading states
  const [updatingCart, setUpdatingCart] = useState(false);

  // Catalog Filters
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [productSearch, setProductSearch] = useState('');

  // Initial Data Fetch
  const fetchPOSData = async () => {
    setLoading(true);
    try {
      const [floorsData, productsData, categoriesData, customersData] = await Promise.all([
        getFloors(),
        getProducts(),
        getCategories(),
        getCustomers()
      ]);
      
      setFloors(floorsData);
      setProducts(productsData.filter(p => p.active));
      setCategories(categoriesData);
      setCustomers(customersData);
      
      // Default to the first active floor
      const firstActiveFloor = floorsData.find(f => f.active);
      if (firstActiveFloor) {
        setActiveFloorId(firstActiveFloor.id);
      }
    } catch (err) {
      console.error('Error loading POS initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPOSData();
  }, []);

  // Recalculate cart figures
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const tax = subtotal * 0.05; // 5% GST
  const grandTotal = subtotal + tax;

  // Sync cart modifications to DB in Draft Order
  const syncCartToBackend = async (newCart) => {
    if (!activeOrder) return;
    setUpdatingCart(true);
    try {
      const itemsPayload = newCart.map(c => ({
        productId: c.productId,
        quantity: c.qty,
        unitPrice: c.price,
        total: c.price * c.qty
      }));

      const updated = await updateOrder(activeOrder.id, {
        customerId: activeOrder.customerId,
        subtotal,
        tax,
        discount: 0,
        grandTotal,
        items: itemsPayload
      });
      setActiveOrder(updated);
    } catch (err) {
      console.error('Failed to sync order update:', err);
    } finally {
      setUpdatingCart(false);
    }
  };

  // Add Item to Cart
  const handleAddToCart = (product) => {
    let newCart = [...cart];
    const existing = newCart.find(item => item.productId === product.id);
    
    if (existing) {
      existing.qty += 1;
    } else {
      newCart.push({
        productId: product.id,
        name: product.name,
        price: parseFloat(product.price),
        qty: 1
      });
    }
    
    setCart(newCart);
    syncCartToBackend(newCart);
  };

  // Modify Quantity
  const handleUpdateQty = (productId, delta) => {
    let newCart = cart.map(item => {
      if (item.productId === productId) {
        const nextQty = item.qty + delta;
        return nextQty > 0 ? { ...item, qty: nextQty } : null;
      }
      return item;
    }).filter(Boolean);

    setCart(newCart);
    syncCartToBackend(newCart);
  };

  // Remove Item
  const handleRemoveItem = (productId) => {
    const newCart = cart.filter(item => item.productId !== productId);
    setCart(newCart);
    syncCartToBackend(newCart);
  };

  // Handle Table click: Occupied -> resume ordering, Available -> allocate
  const handleTableClick = (tbl) => {
    if (!tbl.active) return; // Inactive tables cannot be selected

    const activeOrd = tbl.orders && tbl.orders[0];
    if (activeOrd) {
      // Occupied: load order
      setSelectedTable(tbl);
      setActiveOrder(activeOrd);
      
      // Map order items to cart state
      const mappedCart = (activeOrd.orderItems || []).map(item => ({
        productId: item.productId,
        name: item.product?.name || 'Unknown Item',
        price: parseFloat(item.unitPrice),
        qty: item.quantity
      }));
      setCart(mappedCart);
    } else {
      // Available: open allocation modal
      setAllocatingTable(tbl);
      setSelectedCustId('');
      setSearchCustQuery('');
      setShowQuickCust(false);
      setNewCustName('');
      setNewCustPhone('');
      setNewCustEmail('');
      setShowAllocModal(true);
    }
  };

  // Quick Customer Creation during seating
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!newCustName.trim()) return;
    setCreatingCust(true);
    try {
      const newCust = await createCustomer({
        name: newCustName.trim(),
        phone: newCustPhone.trim() || null,
        email: newCustEmail.trim() || null
      });
      // Update list
      setCustomers(prev => [...prev, newCust]);
      setSelectedCustId(newCust.id);
      setShowQuickCust(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create customer');
    } finally {
      setCreatingCust(false);
    }
  };

  // Allocate table to Customer (creates DRAFT order in backend)
  const handleConfirmAllocation = async () => {
    if (!allocatingTable) return;
    
    setLoading(true);
    try {
      const custId = selectedCustId ? parseInt(selectedCustId) : null;
      
      // Create draft order
      const newOrd = await createOrder({
        tableId: allocatingTable.id,
        customerId: custId,
        subtotal: 0,
        tax: 0,
        discount: 0,
        grandTotal: 0,
        items: []
      });

      setSelectedTable(allocatingTable);
      setActiveOrder(newOrd);
      setCart([]);
      setShowAllocModal(false);
      
      // Refresh floors list in background so maps are updated
      const floorsData = await getFloors();
      setFloors(floorsData);
    } catch (err) {
      alert(err.response?.data?.error || 'Seating allocation failed.');
    } finally {
      setLoading(false);
    }
  };

  // Send Order to Kitchen
  const handleSendToKitchen = async () => {
    if (!activeOrder) return;
    try {
      await updateOrder(activeOrder.id, {
        ...activeOrder,
        status: 'KITCHEN'
      });
      
      // Reset POS view back to floor selection
      setSelectedTable(null);
      setActiveOrder(null);
      setCart([]);
      fetchPOSData();
    } catch (err) {
      alert('Failed to send order to kitchen.');
    }
  };

  // Process checkout/payment
  const handlePayOrder = async () => {
    if (!activeOrder) return;
    try {
      // Mark as paid
      await updateOrder(activeOrder.id, {
        ...activeOrder,
        status: 'PAID'
      });
      
      alert(`Order ${activeOrder.orderNumber} checkout successful. Table ${selectedTable.tableNumber} is now free.`);
      
      // Return to floor plan
      setSelectedTable(null);
      setActiveOrder(null);
      setCart([]);
      fetchPOSData();
    } catch (err) {
      alert('Failed to checkout order.');
    }
  };

  // Release table completely without order/cancel order
  const handleCancelOrder = async () => {
    if (!activeOrder) return;
    if (!confirm('Are you sure you want to cancel this booking and delete the draft order?')) return;
    
    try {
      await updateOrder(activeOrder.id, {
        ...activeOrder,
        status: 'CANCELLED'
      });
      
      setSelectedTable(null);
      setActiveOrder(null);
      setCart([]);
      fetchPOSData();
    } catch (err) {
      alert('Failed to cancel order.');
    }
  };

  // Filtering products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || p.categoryId === parseInt(selectedCategory);
    return matchesSearch && matchesCat;
  });

  // Filter customers for dropdown search
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchCustQuery.toLowerCase()) ||
    (c.phone && c.phone.includes(searchCustQuery))
  );

  // If loading the main views
  if (loading && floors.length === 0) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-[#8A583C] animate-spin" />
        <span className="text-slate-500 font-semibold text-sm">Loading POS layouts...</span>
      </div>
    );
  }

  // SCREEN 1: Floor Plan Table Seating Layout
  if (!selectedTable) {
    const currentFloor = floors.find(f => f.id === activeFloorId);
    const tablesOnFloor = currentFloor?.tables || [];
    const activeTables = tablesOnFloor.filter(t => t.active);
    const occupiedTables = activeTables.filter(t => t.orders && t.orders.length > 0).length;
    const isFloorFull = activeTables.length > 0 && occupiedTables === activeTables.length;

    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in font-sans">
        {/* TOP POS HEADER */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <Coffee className="text-[#8A583C] w-7 h-7" />
              Smart Cafe POS Seating Map
            </h2>
            <p className="text-slate-500 text-sm mt-1">Select an active floor plan and allocate dining tables to incoming customers.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button 
              onClick={fetchPOSData}
              className="p-3 text-slate-500 hover:text-[#8A583C] bg-[#FAF8F6] hover:bg-[#FAF6F0] rounded-xl border border-slate-100/50 transition duration-300"
              title="Refresh Seating"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* FLOOR PLAN NAVIGATION TABS */}
        <div className="flex flex-wrap gap-2.5 border-b border-slate-200 pb-3">
          {floors.filter(f => f.active).map(floor => (
            <button
              key={floor.id}
              onClick={() => setActiveFloorId(floor.id)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition duration-200 ${
                activeFloorId === floor.id
                  ? 'bg-[#8A583C] text-white shadow-md shadow-amber-900/10'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {floor.name}
            </button>
          ))}
        </div>

        {/* CURRENT FLOOR GRID MAP */}
        {tablesOnFloor.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center flex flex-col items-center justify-center space-y-4">
            <div className="bg-[#FAF6F0] p-4 rounded-full text-[#8A583C]">
              <LayoutGrid className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 font-sans">No Tables Configured</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-sm font-sans">
                There are no seating tables configured on "{currentFloor?.name}". Go to **Tables Setup** in admin menu to configure layouts.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {isFloorFull && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm font-bold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 animate-pulse" />
                <span>Notice: All active tables on {currentFloor?.name} are currently occupied. Admin option to disable/close this floor is available in floor configuration.</span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {tablesOnFloor.map(tbl => {
                const activeOrd = tbl.orders && tbl.orders[0];
                const isOccupied = tbl.active && activeOrd;
                const customerName = activeOrd?.customer?.name || 'Walk-in Customer';

                return (
                  <button
                    key={tbl.id}
                    disabled={!tbl.active}
                    onClick={() => handleTableClick(tbl)}
                    className={`p-5 rounded-3xl border text-left flex flex-col justify-between h-40 transition-all duration-300 relative group select-none ${
                      !tbl.active 
                        ? 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed'
                        : isOccupied 
                          ? 'bg-rose-50/40 border-rose-200 hover:border-rose-400 hover:shadow-md hover:shadow-rose-900/5' 
                          : 'bg-white border-slate-100 hover:border-[#8A583C] hover:shadow-md hover:shadow-amber-900/5'
                    }`}
                  >
                    <div>
                      {/* Table Status Indication Dot */}
                      <span className={`w-3.5 h-3.5 rounded-full absolute top-5 right-5 border border-white ${
                        !tbl.active 
                          ? 'bg-slate-400' 
                          : isOccupied 
                            ? 'bg-rose-500 ring-4 ring-rose-500/20' 
                            : 'bg-emerald-500 ring-4 ring-emerald-500/20'
                      }`} />

                      {/* Title & Location */}
                      <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider">Table</span>
                      <h4 className="font-extrabold text-2xl text-slate-800">{tbl.tableNumber}</h4>
                      
                      {/* Seats Count */}
                      <span className="text-xs text-slate-500 font-semibold mt-1 block">{tbl.seatsCount} Seats</span>
                    </div>

                    {/* Occupied Customer Info */}
                    <div className="mt-4 pt-3 border-t border-slate-100/60 w-full">
                      {isOccupied ? (
                        <div className="truncate">
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-rose-500 block">Occupied By</span>
                          <span className="text-slate-800 text-xs font-bold truncate block">{customerName}</span>
                        </div>
                      ) : tbl.active ? (
                        <span className="text-emerald-600 text-xs font-bold block group-hover:translate-x-1 transition duration-200">
                          Seating +
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs italic block">Inactive</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* CUSTOMER ALLOCATION MODAL POPUP */}
        {showAllocModal && allocatingTable && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl max-w-md w-full border border-slate-150 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4.5 border-b border-slate-100 bg-[#FAF8F6]">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">Seating Customer</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Table {allocatingTable.tableNumber} - {currentFloor?.name}</p>
                </div>
                <button 
                  onClick={() => setShowAllocModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 bg-white hover:bg-slate-100 border border-slate-100 rounded-lg transition duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* 1. Existing Customer Quick Search Dropdown */}
                {!showQuickCust ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Select Existing Customer</label>
                      <button
                        type="button"
                        onClick={() => setShowQuickCust(true)}
                        className="text-xs font-bold text-[#8A583C] hover:underline flex items-center gap-1"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Register New
                      </button>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search by customer name or phone..."
                        value={searchCustQuery}
                        onChange={(e) => setSearchCustQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#8A583C] transition"
                      />
                    </div>

                    {/* Filtered customers dropdown container */}
                    <div className="max-h-36 overflow-y-auto border border-slate-100 rounded-xl bg-slate-50/50 p-1 divide-y divide-slate-100">
                      {filteredCustomers.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">No matching customers found.</p>
                      ) : (
                        filteredCustomers.map(cust => (
                          <button
                            key={cust.id}
                            type="button"
                            onClick={() => {
                              setSelectedCustId(cust.id);
                              setSearchCustQuery(cust.name);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex justify-between items-center transition ${
                              selectedCustId === cust.id 
                                ? 'bg-[#8A583C]/10 text-[#8A583C]' 
                                : 'hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <span>{cust.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold">{cust.phone || 'No phone'}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  /* 2. Quick Create Customer Inline Form */
                  <form onSubmit={handleCreateCustomer} className="space-y-3.5 border border-slate-100 bg-slate-50/40 p-4.5 rounded-2xl">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Register New Customer</h4>
                      <button
                        type="button"
                        onClick={() => setShowQuickCust(false)}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>

                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Full Name (required)"
                        value={newCustName}
                        onChange={(e) => setNewCustName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#8A583C] bg-white transition"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Phone Number"
                        value={newCustPhone}
                        onChange={(e) => setNewCustPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#8A583C] bg-white transition"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={newCustEmail}
                        onChange={(e) => setNewCustEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#8A583C] bg-white transition"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={creatingCust}
                      className="w-full py-2 bg-[#8A583C] hover:bg-[#73442A] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      {creatingCust ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Create Customer'}
                    </button>
                  </form>
                )}

                {/* Final allocation triggers */}
                <div className="space-y-2 pt-4 border-t border-slate-100 mt-6">
                  <button
                    onClick={handleConfirmAllocation}
                    className="w-full py-3 bg-[#8A583C] hover:bg-[#73442A] text-white rounded-xl text-sm font-semibold shadow-lg shadow-amber-900/10 transition flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> 
                    {selectedCustId ? 'Assign Selected Customer' : 'Proceed as Walk-in Customer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // SCREEN 2: POS Order Placement & Catalog View (Table is selected!)
  const customerName = activeOrder?.customer?.name || 'Walk-in Customer';

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 animate-fade-in font-sans">
      {/* 1. PRODUCT CATALOG AND GRID PANEL */}
      <div className="flex-1 flex flex-col space-y-4">
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4.5 rounded-3xl border border-slate-100 shadow-sm shrink-0">
          <button
            onClick={() => {
              setSelectedTable(null);
              setActiveOrder(null);
              setCart([]);
              fetchPOSData();
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#8A583C] px-3.5 py-2 hover:bg-[#FAF8F6] rounded-xl transition border border-slate-150/60"
          >
            <ArrowLeft className="w-4 h-4" /> Floor Map
          </button>

          {/* Product category selector and filter */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedCategory === 'ALL'
                  ? 'bg-[#8A583C] text-white'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
              }`}
            >
              All Items
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id.toString())}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedCategory === cat.id.toString()
                    ? 'bg-[#8A583C] text-white'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Product search box */}
          <div className="relative w-full sm:w-52">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search catalog..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#8A583C] transition"
            />
          </div>
        </div>

        {/* Product items Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 flex-1 overflow-y-auto pr-2 pb-6 min-h-[300px]">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl p-16 text-center text-slate-400">
              <Coffee className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">No active products found matching the filters.</p>
            </div>
          ) : (
            filteredProducts.map(prod => (
              <div
                key={prod.id}
                onClick={() => handleAddToCart(prod)}
                className="bg-white p-4.5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-[#8A583C] cursor-pointer transition group"
              >
                <div>
                  <span className="text-[9px] uppercase font-extrabold text-[#8A583C] bg-[#FAF6F0] px-2 py-0.5 rounded-full border border-[#FAF6F0]">
                    {prod.category?.name || 'Item'}
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-800 mt-2.5 truncate group-hover:text-[#8A583C] transition">
                    {prod.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-normal">
                    {prod.description || 'No description provided'}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-4 border-t border-slate-50 pt-3.5 shrink-0">
                  <span className="font-black text-slate-900 text-sm">₹{parseFloat(prod.price).toFixed(2)}</span>
                  <button className="w-8 h-8 bg-amber-50 group-hover:bg-[#8A583C] text-[#8A583C] group-hover:text-white font-bold flex items-center justify-center rounded-xl transition duration-200">
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. ORDER CART SIDEBAR PANEL */}
      <div className="w-full lg:w-96 bg-white border border-slate-100 rounded-3xl shadow-lg flex flex-col justify-between overflow-hidden shrink-0 h-[600px] lg:h-auto">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Cart Header */}
          <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
            <div>
              <div className="flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-[#8A583C]" />
                <h3 className="font-extrabold text-slate-800">Current Order</h3>
              </div>
              <p className="text-slate-400 text-xs mt-0.5 truncate max-w-[200px]">
                {customerName}
              </p>
            </div>
            <span className="text-[10px] bg-[#8A583C]/10 text-[#8A583C] px-3 py-1 rounded-xl font-bold uppercase border border-[#8A583C]/10">
              Table {selectedTable.tableNumber}
            </span>
          </div>

          {/* Cart Line Items */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2.5">
                <ShoppingCart className="w-10 h-10 text-slate-200" />
                <p className="text-xs font-semibold">Your ordering cart is empty.</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.productId} className="flex justify-between items-center text-xs border-b border-slate-50 pb-3">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-extrabold text-slate-800 truncate">{item.name}</p>
                    <p className="text-slate-400 font-semibold mt-0.5">₹{item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center space-x-2.5 shrink-0">
                    <button
                      onClick={() => handleUpdateQty(item.productId, -1)}
                      className="w-6.5 h-6.5 border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center justify-center font-bold text-slate-500 transition"
                    >
                      -
                    </button>
                    <span className="font-bold text-slate-800 w-5 text-center">{item.qty}</span>
                    <button
                      onClick={() => handleUpdateQty(item.productId, 1)}
                      className="w-6.5 h-6.5 border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center justify-center font-bold text-slate-500 transition"
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.productId)}
                      className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition ml-1"
                      title="Remove product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pricing Subtotals & Actions */}
        <div className="p-5 border-t border-slate-100 bg-[#FAF8F6] space-y-4 shrink-0">
          <div className="space-y-1.5 text-xs text-slate-500 font-semibold">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-slate-800">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST Tax (5%)</span>
              <span className="text-slate-800">₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-800 font-extrabold text-sm pt-2.5 border-t border-slate-200 mt-2">
              <span>Total Bill</span>
              <span className="text-[#8A583C] text-base font-black">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Sync indicator */}
          {updatingCart && (
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider py-1 select-none">
              <Loader2 className="w-3 h-3 animate-spin text-[#8A583C]" />
              <span>Saving changes...</span>
            </div>
          )}

          {/* POS cart actions */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleSendToKitchen}
              disabled={cart.length === 0 || updatingCart}
              className="py-3 bg-white hover:bg-slate-50 border border-slate-200 disabled:opacity-55 disabled:cursor-not-allowed text-slate-700 rounded-2xl font-bold transition text-xs flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5 text-slate-500" /> Send Kitchen
            </button>
            <button
              onClick={handlePayOrder}
              disabled={cart.length === 0 || updatingCart}
              className="py-3 bg-[#8A583C] hover:bg-[#73442A] disabled:opacity-55 disabled:cursor-not-allowed text-white rounded-2xl font-bold transition text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-900/10"
            >
              <CreditCard className="w-3.5 h-3.5" /> Check Out
            </button>
          </div>

          <button
            onClick={handleCancelOrder}
            className="w-full py-2 bg-transparent text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-2xl text-[10px] font-bold uppercase transition"
          >
            Cancel Booking
          </button>
        </div>
      </div>
    </div>
  );
}
