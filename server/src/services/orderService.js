// Business operations logic relating to order items calculations, taxes and promo logic
export const calculateOrderTotals = (items, discountPercentage = 0) => {
  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const tax = subtotal * 0.05; // 5% standard VAT/GST
  const discount = subtotal * (discountPercentage / 100);
  const grandTotal = (subtotal + tax) - discount;

  return {
    subtotal,
    tax,
    discount,
    grandTotal
  };
};
