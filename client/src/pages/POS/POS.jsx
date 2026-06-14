import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { 
  Layers, LayoutGrid, Users, Plus, Check, X, Search, Loader2, 
  ArrowLeft, Trash2, ShoppingCart, UserPlus, CreditCard, Send, Coffee,
  RefreshCw, AlertCircle
} from 'lucide-react';
import { getFloors } from '../../services/floorService';
import { getProducts } from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import { getCustomers, createCustomer } from '../../services/customerService';
import { createOrder, updateOrder, updateOrderStatus } from '../../services/orderService';
import { getActiveSession, openSession, closeSession } from '../../services/sessionService';
import { validateCoupon } from '../../services/couponService';
import { getActivePromotions } from '../../services/promotionService';

export default function POS() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  // Session management states
  const [activeSession, setActiveSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [openingBalance, setOpeningBalance] = useState('');
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closingCashInput, setClosingCashInput] = useState('');
  const [closingSummary, setClosingSummary] = useState(null);

  // Coupons and promotions states
  const [promotions, setPromotions] = useState([]);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

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
  const fetchPOSData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [floorsData, productsData, categoriesData, customersData, promotionsData] = await Promise.all([
        getFloors(),
        getProducts(),
        getCategories(),
        getCustomers(),
        getActivePromotions()
      ]);
      
      setFloors(floorsData);
      setProducts(productsData.filter(p => p.active));
      setCategories(categoriesData);
      setCustomers(customersData);
      setPromotions(promotionsData);
      
      // Default to the first active floor
      const firstActiveFloor = floorsData.find(f => f.active);
      if (firstActiveFloor) {
        setActiveFloorId(firstActiveFloor.id);
      }
    } catch (err) {
      console.error('Error loading POS initial data:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const checkSessionStatus = async () => {
    setCheckingSession(true);
    try {
      const active = await getActiveSession();
      setActiveSession(active);
      if (active) {
        await fetchPOSData();
      }
    } catch (err) {
      console.error('Error checking active POS session:', err);
    } finally {
      setCheckingSession(false);
    }
  };

  const handleOpenSession = async (e) => {
    e.preventDefault();
    const parsed = parseFloat(openingBalance);
    if (isNaN(parsed) || parsed < 0) {
      alert('Please enter a valid opening balance.');
      return;
    }
    setLoading(true);
    try {
      const sess = await openSession(parsed);
      setActiveSession({
        ...sess,
        openingBalance: parsed,
        totalSales: 0,
        ordersCount: 0
      });
      await fetchPOSData();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to open session.';
      console.error('Failed to open session:', err);
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSession = async (e) => {
    e.preventDefault();
    const parsed = parseFloat(closingCashInput);
    if (isNaN(parsed) || parsed < 0) {
      alert('Please enter a valid closing balance.');
      return;
    }
    setLoading(true);
    try {
      const res = await closeSession(parsed);
      setClosingSummary(res.summary);
      setShowCloseModal(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to close session.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSessionStatus();

    const socket = io('/', { path: '/socket.io' });
    
    socket.on('pos:order_status_update', (order) => {
      // Refresh floor/tables silently
      fetchPOSData(true);
      // Update active order if it matches the one being viewed
      setActiveOrder(prev => {
        if (prev && prev.id === order.id) {
          return { ...prev, status: order.status };
        }
        return prev;
      });
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (activeSession && floors.length > 0) {
      const orderIdParam = searchParams.get('orderId');
      const tableIdParam = searchParams.get('tableId');
      if (orderIdParam && tableIdParam) {
        const tableId = parseInt(tableIdParam);
        const orderId = parseInt(orderIdParam);
        
        let foundTable = null;
        for (const floor of floors) {
          const tbl = floor.tables?.find(t => t.id === tableId);
          if (tbl) {
            foundTable = tbl;
            break;
          }
        }
        
        if (foundTable) {
          setSelectedTable(foundTable);
          const tblOrders = foundTable.orders || [];
          const targetOrder = tblOrders.find(o => o.id === orderId);
          if (targetOrder) {
            setActiveOrder(targetOrder);
            
            // Map order items to cart state
            const mappedCart = (targetOrder.orderItems || []).map(item => ({
              productId: item.productId,
              name: item.product?.name || 'Unknown Item',
              price: parseFloat(item.unitPrice),
              qty: item.quantity
            }));
            setCart(mappedCart);
            
            // Load applied coupon if present
            const couponRecord = targetOrder.orderCoupons && targetOrder.orderCoupons[0];
            if (couponRecord) {
              setAppliedCoupon({
                id: couponRecord.coupon.id,
                code: couponRecord.coupon.code,
                discountType: couponRecord.coupon.discountType,
                discountValue: parseFloat(couponRecord.coupon.discountValue)
              });
            } else {
              setAppliedCoupon(null);
            }
          }
        }
        
        // Clear search parameters from URL so refreshing doesn't force re-opening
        setSearchParams({}, { replace: true });
      }
    }
  }, [activeSession, floors, searchParams, setSearchParams]);

  // Recalculate cart figures with coupons and promotions
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const tax = subtotal * 0.05; // 5% GST

  // 1. Evaluate Promotions
  let promoDiscount = 0;
  let activePromo = null;
  for (const promo of promotions) {
    if (promo.type === 'ORDER') {
      if (promo.triggerValue && subtotal >= promo.triggerValue) {
        if (promo.discountValue > promoDiscount) {
          promoDiscount = promo.discountValue;
          activePromo = promo;
        }
      }
    } else if (promo.type === 'PRODUCT' && promo.triggerQty) {
      let applicableDiscount = 0;
      for (const item of cart) {
        if (item.qty >= promo.triggerQty) {
          applicableDiscount += promo.discountValue * item.qty;
        }
      }
      if (applicableDiscount > promoDiscount) {
        promoDiscount = applicableDiscount;
        activePromo = promo;
      }
    }
  }
  promoDiscount = Math.min(promoDiscount, subtotal);

  // 2. Evaluate Coupon
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      couponDiscount = subtotal * (appliedCoupon.discountValue / 100);
    } else if (appliedCoupon.discountType === 'FIXED') {
      couponDiscount = appliedCoupon.discountValue;
    }
  }
  couponDiscount = Math.min(couponDiscount, subtotal - promoDiscount);

  const totalDiscount = couponDiscount + promoDiscount;
  const grandTotal = Math.max(0, subtotal + tax - totalDiscount);

  // Sync cart modifications to DB in Draft Order
  const syncCartToBackend = async (newCart, currentCoupon = appliedCoupon) => {
    if (!activeOrder || activeOrder.status !== 'DRAFT') return;
    setUpdatingCart(true);
    try {
      const itemsPayload = newCart.map(c => ({
        productId: c.productId,
        quantity: c.qty,
        unitPrice: c.price,
        total: c.price * c.qty
      }));

      // Calculate figures locally based on newCart
      const sub = newCart.reduce((acc, item) => acc + (item.price * item.qty), 0);
      const tx = sub * 0.05;
      
      // Calculate promo discount
      let pDiscount = 0;
      for (const promo of promotions) {
        if (promo.type === 'ORDER') {
          if (promo.triggerValue && sub >= promo.triggerValue) {
            pDiscount = Math.max(pDiscount, promo.discountValue);
          }
        } else if (promo.type === 'PRODUCT' && promo.triggerQty) {
          let appDiscount = 0;
          for (const item of newCart) {
            if (item.qty >= promo.triggerQty) {
              appDiscount += promo.discountValue * item.qty;
            }
          }
          pDiscount = Math.max(pDiscount, appDiscount);
        }
      }
      pDiscount = Math.min(pDiscount, sub);

      // Calculate coupon discount
      let cDiscount = 0;
      if (currentCoupon) {
        if (currentCoupon.discountType === 'PERCENTAGE') {
          cDiscount = sub * (currentCoupon.discountValue / 100);
        } else if (currentCoupon.discountType === 'FIXED') {
          cDiscount = currentCoupon.discountValue;
        }
      }
      cDiscount = Math.min(cDiscount, sub - pDiscount);

      const totalD = cDiscount + pDiscount;
      const grandT = Math.max(0, sub + tx - totalD);

      const updated = await updateOrder(activeOrder.id, {
        customerId: activeOrder.customerId,
        subtotal: sub,
        tax: tx,
        discount: totalD,
        grandTotal: grandT,
        items: itemsPayload,
        couponId: currentCoupon ? currentCoupon.id : null
      });
      setActiveOrder(updated);
    } catch (err) {
      console.error('Failed to sync order update:', err);
    } finally {
      setUpdatingCart(false);
    }
  };

  const syncCouponToBackend = async (couponId) => {
    if (!activeOrder || activeOrder.status !== 'DRAFT') return;
    setUpdatingCart(true);
    try {
      const itemsPayload = cart.map(c => ({
        productId: c.productId,
        quantity: c.qty,
        unitPrice: c.price,
        total: c.price * c.qty
      }));

      // Calculate discount
      let pDiscount = 0;
      for (const promo of promotions) {
        if (promo.type === 'ORDER') {
          if (promo.triggerValue && subtotal >= promo.triggerValue) {
            pDiscount = Math.max(pDiscount, promo.discountValue);
          }
        } else if (promo.type === 'PRODUCT' && promo.triggerQty) {
          let appDiscount = 0;
          for (const item of cart) {
            if (item.qty >= promo.triggerQty) {
              appDiscount += promo.discountValue * item.qty;
            }
          }
          pDiscount = Math.max(pDiscount, appDiscount);
        }
      }
      pDiscount = Math.min(pDiscount, subtotal);

      let cDiscount = 0;
      let targetCoupon = null;
      if (couponId) {
        if (appliedCoupon && appliedCoupon.id === couponId) {
          targetCoupon = appliedCoupon;
        } else {
          targetCoupon = appliedCoupon;
        }
      }

      if (targetCoupon) {
        if (targetCoupon.discountType === 'PERCENTAGE') {
          cDiscount = subtotal * (targetCoupon.discountValue / 100);
        } else if (targetCoupon.discountType === 'FIXED') {
          cDiscount = targetCoupon.discountValue;
        }
      }
      cDiscount = Math.min(cDiscount, subtotal - pDiscount);

      const totalD = cDiscount + pDiscount;
      const grandT = Math.max(0, subtotal + tax - totalD);

      const updated = await updateOrder(activeOrder.id, {
        customerId: activeOrder.customerId,
        subtotal,
        tax,
        discount: totalD,
        grandTotal: grandT,
        items: itemsPayload,
        couponId: couponId
      });
      setActiveOrder(updated);
    } catch (err) {
      console.error('Failed to sync coupon update:', err);
    } finally {
      setUpdatingCart(false);
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    try {
      const res = await validateCoupon(couponCodeInput.trim(), subtotal);
      if (res.valid) {
        const validatedCoupon = {
          id: res.coupon.id,
          code: res.coupon.code,
          discountType: res.coupon.discountType,
          discountValue: parseFloat(res.coupon.discountValue)
        };
        setAppliedCoupon(validatedCoupon);
        setCouponCodeInput('');
        
        // Sync to backend immediately if in draft!
        if (activeOrder && activeOrder.status === 'DRAFT') {
          setUpdatingCart(true);
          // Calculate discount
          let pDiscount = 0;
          for (const promo of promotions) {
            if (promo.type === 'ORDER') {
              if (promo.triggerValue && subtotal >= promo.triggerValue) {
                pDiscount = Math.max(pDiscount, promo.discountValue);
              }
            } else if (promo.type === 'PRODUCT' && promo.triggerQty) {
              let appDiscount = 0;
              for (const item of cart) {
                if (item.qty >= promo.triggerQty) {
                  appDiscount += promo.discountValue * item.qty;
                }
              }
              pDiscount = Math.max(pDiscount, appDiscount);
            }
          }
          pDiscount = Math.min(pDiscount, subtotal);

          let cDiscount = 0;
          if (validatedCoupon.discountType === 'PERCENTAGE') {
            cDiscount = subtotal * (validatedCoupon.discountValue / 100);
          } else if (validatedCoupon.discountType === 'FIXED') {
            cDiscount = validatedCoupon.discountValue;
          }
          cDiscount = Math.min(cDiscount, subtotal - pDiscount);

          const totalD = cDiscount + pDiscount;
          const grandT = Math.max(0, subtotal + tax - totalD);

          const itemsPayload = cart.map(c => ({
            productId: c.productId,
            quantity: c.qty,
            unitPrice: c.price,
            total: c.price * c.qty
          }));

          const updated = await updateOrder(activeOrder.id, {
            customerId: activeOrder.customerId,
            subtotal,
            tax,
            discount: totalD,
            grandTotal: grandT,
            items: itemsPayload,
            couponId: validatedCoupon.id
          });
          setActiveOrder(updated);
          setUpdatingCart(false);
        }
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Invalid coupon code.');
    }
  };

  const handleRemoveCoupon = async () => {
    setAppliedCoupon(null);
    if (activeOrder && activeOrder.status === 'DRAFT') {
      setUpdatingCart(true);
      // Calculate promo discount only
      let pDiscount = 0;
      for (const promo of promotions) {
        if (promo.type === 'ORDER') {
          if (promo.triggerValue && subtotal >= promo.triggerValue) {
            pDiscount = Math.max(pDiscount, promo.discountValue);
          }
        } else if (promo.type === 'PRODUCT' && promo.triggerQty) {
          let appDiscount = 0;
          for (const item of cart) {
            if (item.qty >= promo.triggerQty) {
              appDiscount += promo.discountValue * item.qty;
            }
          }
          pDiscount = Math.max(pDiscount, appDiscount);
        }
      }
      pDiscount = Math.min(pDiscount, subtotal);
      const grandT = Math.max(0, subtotal + tax - pDiscount);

      const itemsPayload = cart.map(c => ({
        productId: c.productId,
        quantity: c.qty,
        unitPrice: c.price,
        total: c.price * c.qty
      }));

      const updated = await updateOrder(activeOrder.id, {
        customerId: activeOrder.customerId,
        subtotal,
        tax,
        discount: pDiscount,
        grandTotal: grandT,
        items: itemsPayload,
        couponId: null
      });
      setActiveOrder(updated);
      setUpdatingCart(false);
    }
  };

  // Add Item to Cart
  const handleAddToCart = async (product) => {
    let currentOrder = activeOrder;
    
    // If no active order or active order is not DRAFT, look for an existing draft order
    if (!currentOrder || currentOrder.status !== 'DRAFT') {
      const tblOrders = getTableOrders(selectedTable.id);
      const existingDraft = tblOrders.find(o => o.status === 'DRAFT');
      
      if (existingDraft) {
        currentOrder = existingDraft;
        setActiveOrder(existingDraft);
        const mappedCart = (existingDraft.orderItems || []).map(item => ({
          productId: item.productId,
          name: item.product?.name || 'Unknown Item',
          price: parseFloat(item.unitPrice),
          qty: item.quantity
        }));
        
        const newCart = [...mappedCart];
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
        setUpdatingCart(true);
        try {
          const itemsPayload = newCart.map(c => ({
            productId: c.productId,
            quantity: c.qty,
            unitPrice: c.price,
            total: c.price * c.qty
          }));
          const sub = newCart.reduce((acc, item) => acc + (item.price * item.qty), 0);
          const tx = sub * 0.05;
          const gt = sub + tx;
          const updated = await updateOrder(existingDraft.id, {
            customerId: existingDraft.customerId,
            subtotal: sub,
            tax: tx,
            discount: 0,
            grandTotal: gt,
            items: itemsPayload
          });
          setActiveOrder(updated);
          // Refresh floor layout silently
          const floorsData = await getFloors();
          setFloors(floorsData);
        } catch (err) {
          console.error(err);
        } finally {
          setUpdatingCart(false);
        }
        return;
      } else {
        // No existing draft: create a new one!
        setUpdatingCart(true);
        try {
          const existingCustomerId = tblOrders[0]?.customerId || null;
          const newOrd = await createOrder({
            tableId: selectedTable.id,
            customerId: existingCustomerId,
            subtotal: 0,
            tax: 0,
            discount: 0,
            grandTotal: 0,
            items: []
          });
          currentOrder = newOrd;
          setActiveOrder(newOrd);
          
          const newCart = [{
            productId: product.id,
            name: product.name,
            price: parseFloat(product.price),
            qty: 1
          }];
          setCart(newCart);
          
          const itemsPayload = newCart.map(c => ({
            productId: c.productId,
            quantity: c.qty,
            unitPrice: c.price,
            total: c.price * c.qty
          }));
          const sub = parseFloat(product.price);
          const tx = sub * 0.05;
          const gt = sub + tx;
          const updated = await updateOrder(newOrd.id, {
            customerId: newOrd.customerId,
            subtotal: sub,
            tax: tx,
            discount: 0,
            grandTotal: gt,
            items: itemsPayload
          });
          setActiveOrder(updated);
          // Refresh floor layout
          const floorsData = await getFloors();
          setFloors(floorsData);
        } catch (err) {
          alert('Failed to start new order: ' + (err.response?.data?.error || err.message));
        } finally {
          setUpdatingCart(false);
        }
        return;
      }
    }

    // Normal path: current order is already a DRAFT
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
    if (!activeOrder || activeOrder.status !== 'DRAFT') {
      alert('This order has already been sent to the kitchen and cannot be modified.');
      return;
    }
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
    if (!activeOrder || activeOrder.status !== 'DRAFT') {
      alert('This order has already been sent to the kitchen and cannot be modified.');
      return;
    }
    const newCart = cart.filter(item => item.productId !== productId);
    setCart(newCart);
    syncCartToBackend(newCart);
  };

  const getTableOrders = (tableId) => {
    if (!tableId) return [];
    for (const floor of floors) {
      const table = floor.tables?.find(t => t.id === tableId);
      if (table) return table.orders || [];
    }
    return [];
  };

  const handleStartNewOrder = async () => {
    if (!selectedTable) return;
    setLoading(true);
    try {
      const existingCustomerId = getTableOrders(selectedTable.id)[0]?.customerId || null;
      const newOrd = await createOrder({
        tableId: selectedTable.id,
        customerId: existingCustomerId,
        subtotal: 0,
        tax: 0,
        discount: 0,
        grandTotal: 0,
        items: []
      });
      setActiveOrder(newOrd);
      setCart([]);
      setAppliedCoupon(null);
      
      // Refresh floor layout
      const floorsData = await getFloors();
      setFloors(floorsData);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create new order.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Table click: Occupied -> resume ordering, Available -> allocate
  const handleTableClick = (tbl) => {
    if (!tbl.active) return; // Inactive tables cannot be selected

    const tblOrders = tbl.orders || [];
    const draftOrder = tblOrders.find(o => o.status === 'DRAFT');
    const activeOrd = draftOrder || tblOrders[0];

    if (activeOrd) {
      // Occupied: load order
      setSelectedTable(tbl);
      setActiveOrder(activeOrd);
      
      // Load applied coupon if present
      const couponRecord = activeOrd.orderCoupons && activeOrd.orderCoupons[0];
      if (couponRecord) {
        setAppliedCoupon({
          id: couponRecord.coupon.id,
          code: couponRecord.coupon.code,
          discountType: couponRecord.coupon.discountType,
          discountValue: parseFloat(couponRecord.coupon.discountValue)
        });
      } else {
        setAppliedCoupon(null);
      }
      
      // Map order items to cart state
      const mappedCart = (activeOrd.orderItems || []).map(item => ({
        productId: item.productId,
        name: item.product?.name || 'Unknown Item',
        price: parseFloat(item.unitPrice),
        qty: item.quantity
      }));
      setCart(mappedCart);
    } else {
      setAppliedCoupon(null);
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
      setAppliedCoupon(null);
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
      await updateOrderStatus(activeOrder.id, 'KITCHEN');
      
      // Reset POS view back to floor selection
      setSelectedTable(null);
      setActiveOrder(null);
      setCart([]);
      setAppliedCoupon(null);
      fetchPOSData();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to send order to kitchen.';
      console.error('Failed to send order to kitchen:', err);
      alert(errorMsg);
    }
  };

  // Process checkout/payment
  const handlePayOrder = async () => {
    if (!activeOrder) return;
    navigate(`/payments?orderId=${activeOrder.id}`);
  };

  // Release table completely without order/cancel order
  const handleCancelOrder = async () => {
    if (!activeOrder) return;
    if (!confirm('Are you sure you want to cancel this booking and delete the draft order?')) return;
    
    try {
      await updateOrderStatus(activeOrder.id, 'CANCELLED');
      
      const otherUnpaid = getTableOrders(selectedTable.id).filter(o => o.id !== activeOrder.id && o.status !== 'PAID' && o.status !== 'CANCELLED');
      if (otherUnpaid.length > 0) {
        alert(`Order ${activeOrder.orderNumber} cancelled successfully. Other active orders still remain for Table ${selectedTable.tableNumber}.`);
      } else {
        alert(`Order ${activeOrder.orderNumber} cancelled successfully. Table ${selectedTable.tableNumber} is now free.`);
      }
      
      setSelectedTable(null);
      setActiveOrder(null);
      setCart([]);
      setAppliedCoupon(null);
      fetchPOSData();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to cancel order.';
      console.error('Failed to cancel order:', err);
      alert(errorMsg);
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

  if (checkingSession) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-[#8A583C] animate-spin" />
        <span className="text-slate-500 font-semibold text-sm">Checking POS session status...</span>
      </div>
    );
  }

  if (closingSummary) {
    return (
      <div className="min-h-[500px] flex items-center justify-center bg-[#FAF8F6] px-4 font-sans animate-fade-in">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
            <Check className="w-9 h-9" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Session Closed</h2>
            <p className="text-slate-400 text-xs mt-1">The POS shift session has been audited and closed.</p>
          </div>

          <div className="border border-slate-100 rounded-2xl p-4 text-left divide-y divide-slate-100 text-xs text-slate-600 font-semibold space-y-3">
            <div className="flex justify-between pt-1">
              <span>Opening Cash Balance</span>
              <span className="text-slate-800 font-bold">₹{closingSummary.openingBalance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span>Total Session Sales</span>
              <span className="text-slate-800 font-bold">₹{closingSummary.totalSales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span>Expected Balance</span>
              <span className="text-slate-800 font-bold">₹{closingSummary.expectedAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span>Actual Drawer Balance</span>
              <span className="text-slate-800 font-bold">₹{closingSummary.actualAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 text-sm font-bold">
              <span>Audit Discrepancy</span>
              <span className={closingSummary.discrepancy >= 0 ? 'text-emerald-600 font-extrabold' : 'text-rose-600 font-extrabold'}>
                {closingSummary.discrepancy >= 0 ? '+' : ''}₹{closingSummary.discrepancy.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setClosingSummary(null);
              setActiveSession(null);
              setCheckingSession(false);
              setOpeningBalance('');
            }}
            className="w-full py-3 bg-[#8A583C] hover:bg-[#73442A] text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-900/10 transition"
          >
            Start New POS Session
          </button>
        </div>
      </div>
    );
  }

  if (!activeSession) {
    return (
      <div className="min-h-[500px] flex items-center justify-center bg-[#FAF8F6] px-4 font-sans animate-fade-in">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[#8A583C]/10 flex items-center justify-center text-[#8A583C]">
            <Coffee className="w-9 h-9" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Open POS Session</h2>
            <p className="text-slate-400 text-xs mt-1">Please set the opening control balance to start registering customer orders.</p>
          </div>
          <form onSubmit={handleOpenSession} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Opening Cash Balance (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                placeholder="e.g. 1000.00"
                className="w-full px-4.5 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#8A583C] transition"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#8A583C] hover:bg-[#73442A] text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-900/10 transition"
            >
              Open Session & Start POS
            </button>
          </form>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden md:block">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Session Open Time</span>
              <span className="text-slate-700 text-xs font-semibold">
                {new Date(activeSession.openingTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
            <button 
              onClick={() => {
                setClosingCashInput('');
                setShowCloseModal(true);
              }}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-900/10 transition"
            >
              Close Session
            </button>
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
        {/* CLOSE SESSION MODAL */}
        {showCloseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 font-sans">
            <div className="bg-white rounded-3xl max-w-md w-full border border-slate-150 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center px-6 py-4.5 border-b border-slate-100 bg-[#FAF8F6]">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">Close POS Session</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Validate and record the actual cash in the drawer.</p>
                </div>
                <button 
                  onClick={() => setShowCloseModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 bg-white hover:bg-slate-100 border border-slate-100 rounded-lg transition duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-650 bg-slate-50/50 p-4.5 rounded-2xl border border-slate-100">
                  <div>
                    <span className="block text-slate-400 uppercase text-[9px] font-bold tracking-wide">Opening Balance</span>
                    <span className="text-slate-800 text-sm font-bold">₹{activeSession.openingBalance.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 uppercase text-[9px] font-bold tracking-wide">Session Sales (Paid)</span>
                    <span className="text-slate-800 text-sm font-bold">₹{(activeSession.totalSales || 0).toFixed(2)}</span>
                  </div>
                  <div className="col-span-2 border-t border-slate-200/60 pt-3 mt-1">
                    <span className="block text-slate-400 uppercase text-[9px] font-bold tracking-wide">Expected Drawer Balance</span>
                    <span className="text-[#8A583C] text-base font-black">
                      ₹{(activeSession.openingBalance + (activeSession.totalSales || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleCloseSession} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Actual Cash in Drawer (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="Enter actual cash count"
                      value={closingCashInput}
                      onChange={(e) => setClosingCashInput(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#8A583C] transition"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCloseModal(false)}
                      className="flex-1 py-3 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-50 transition"
                    >
                      Keep Open
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-900/10"
                    >
                      Close Session
                    </button>
                  </div>
                </form>
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
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[10px] bg-[#8A583C]/10 text-[#8A583C] px-3 py-1 rounded-xl font-bold uppercase border border-[#8A583C]/10">
                Table {selectedTable.tableNumber}
              </span>
              {activeOrder && activeOrder.status && (
                <span className={`text-[9px] px-2 py-0.5 rounded-lg font-bold uppercase ${
                  activeOrder.status === 'KITCHEN' ? 'bg-rose-100 text-rose-600' :
                  activeOrder.status === 'PREPARING' ? 'bg-amber-100 text-amber-600' :
                  activeOrder.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' :
                  'bg-slate-100 text-slate-500'
                }`}>
                  {activeOrder.status}
                </span>
              )}
            </div>
          </div>

          {/* Active Orders Selector (Tabs) */}
          {(() => {
            const tableOrders = getTableOrders(selectedTable.id);
            if (tableOrders.length > 0) {
              return (
                <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between overflow-x-auto gap-2 shrink-0 select-none">
                  <div className="flex gap-2">
                    {tableOrders.map((ord, idx) => {
                      const isActive = activeOrder && activeOrder.id === ord.id;
                      return (
                        <button
                          key={ord.id}
                          onClick={() => {
                            setActiveOrder(ord);
                            const mappedCart = (ord.orderItems || []).map(item => ({
                              productId: item.productId,
                              name: item.product?.name || 'Unknown Item',
                              price: parseFloat(item.unitPrice),
                              qty: item.quantity
                            }));
                            setCart(mappedCart);
                          }}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition whitespace-nowrap ${
                            isActive
                              ? 'bg-[#8A583C] text-white shadow-sm'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 shadow-sm'
                          }`}
                        >
                          Ticket #{idx + 1} ({ord.status})
                        </button>
                      );
                    })}
                  </div>
                  {!tableOrders.some(o => o.status === 'DRAFT') && (
                    <button
                      onClick={handleStartNewOrder}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition shrink-0 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> New
                    </button>
                  )}
                </div>
              );
            }
            return null;
          })()}

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

        {/* Coupon and Promotion panel */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 space-y-2 shrink-0">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Discount Coupon / Promo</label>
          
          {/* Coupon Display or Input */}
          {appliedCoupon ? (
            <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-2xl flex justify-between items-center text-[11px] font-bold text-emerald-700 animate-fade-in">
              <div className="flex items-center gap-1.5 truncate">
                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span className="truncate">Applied: {appliedCoupon.code} (-{appliedCoupon.discountType === 'PERCENTAGE' ? `${appliedCoupon.discountValue}%` : `₹${appliedCoupon.discountValue}`})</span>
              </div>
              <button 
                onClick={handleRemoveCoupon} 
                disabled={activeOrder?.status !== 'DRAFT'}
                className="text-rose-500 hover:bg-rose-100/50 p-1.5 rounded-lg disabled:opacity-50 transition flex-shrink-0"
                title="Remove Coupon"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon code..."
                value={couponCodeInput}
                onChange={(e) => setCouponCodeInput(e.target.value)}
                disabled={activeOrder?.status !== 'DRAFT' || cart.length === 0}
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-xs uppercase placeholder:normal-case font-bold text-slate-700 focus:outline-none focus:border-[#8A583C] transition bg-white disabled:bg-slate-100 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!couponCodeInput.trim() || activeOrder?.status !== 'DRAFT' || cart.length === 0}
                className="px-3.5 py-1.5 bg-[#8A583C] hover:bg-[#73442A] text-white font-bold rounded-xl text-xs disabled:opacity-50 transition shrink-0"
              >
                Apply
              </button>
            </form>
          )}

          {/* Active Auto Promo Notification */}
          {activePromo && (
            <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-2xl text-[11px] font-bold text-amber-800 flex items-center gap-1.5 animate-fade-in">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 animate-pulse" />
              <span>Promo: {activePromo.name} applied</span>
            </div>
          )}
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
            {(couponDiscount > 0 || promoDiscount > 0) && (
              <div className="space-y-1 bg-slate-100/50 p-2 rounded-xl mt-1 border border-slate-200/40">
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                    <span>Coupon Discount</span>
                    <span>-₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-amber-650 text-[10px] font-bold uppercase tracking-wider">
                    <span>Promo Discount</span>
                    <span>-₹{promoDiscount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
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
              disabled={cart.length === 0 || updatingCart || activeOrder?.status !== 'DRAFT'}
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
            {activeOrder?.status === 'DRAFT' ? 'Cancel Draft / Release Table' : 'Cancel Ticket'}
          </button>
        </div>
      </div>
    </div>
  );
}
