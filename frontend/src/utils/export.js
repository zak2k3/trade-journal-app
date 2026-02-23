export const exportToCSV = (trades, filename = 'trades.csv') => {
  // Define CSV headers
  const headers = [
    'Ticker',
    'Direction',
    'Entry Price',
    'Exit Price',
    'Quantity',
    'P&L',
    'Return %',
    'Status',
    'Trade Date',
    'Notes',
    'Tags',
  ];

  // Convert trades to CSV rows
  const rows = trades.map((trade) => {
    const pnl = (trade.exit_price - trade.entry_price) * trade.quantity * (trade.direction === 'long' ? 1 : -1);
    const returnPct = ((trade.exit_price - trade.entry_price) / trade.entry_price) * 100 * (trade.direction === 'long' ? 1 : -1);
    const tags = trade.tags?.map((t) => t.name).join(', ') || '';

    return [
      trade.ticker,
      trade.direction,
      trade.entry_price,
      trade.exit_price,
      trade.quantity,
      pnl.toFixed(2),
      returnPct.toFixed(2) + '%',
      trade.status,
      trade.trade_date,
      `"${trade.notes || ''}"`, // Quote notes to handle commas
      `"${tags}"`,
    ];
  });

  // Combine headers and rows
  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (trades, filename = 'trades.json') => {
  const data = trades.map((trade) => ({
    ticker: trade.ticker,
    direction: trade.direction,
    entry_price: parseFloat(trade.entry_price),
    exit_price: parseFloat(trade.exit_price),
    quantity: trade.quantity,
    trade_date: trade.trade_date,
    notes: trade.notes,
    status: trade.status,
    tags: trade.tags?.map((t) => t.name) || [],
  }));

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};  