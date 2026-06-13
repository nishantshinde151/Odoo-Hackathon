// Business metrics processing (export formats, custom trends parsing)
export const formatSalesReportExcel = (salesData) => {
  // Mock Excel file structure mapping
  return {
    headers: ['Order Number', 'Amount', 'Date'],
    rows: salesData.map(s => [s.orderNo, s.amount, s.date])
  };
};
