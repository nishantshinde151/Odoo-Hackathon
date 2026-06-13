// Payment service logic helpers (e.g. interfacing with external gateways, cash change calculations)
export const calculateCashChange = (receivedAmount, totalPayable) => {
  if (receivedAmount < totalPayable) {
    throw new Error('Received amount is less than total payable');
  }
  return receivedAmount - totalPayable;
};
