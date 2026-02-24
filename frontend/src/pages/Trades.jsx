import { exportTradesCSV, exportTradesJSON, importTradesJSON } from '../services/api';
import EmptyState from '../components/EmptyState';
import { toast } from 'react-toastify';
import { exportToCSV, exportToJSON } from '../utils/export';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrades, deleteTrade } from '../store/tradesSlice';


const Trades = () => {
    // export function
    const handleExportCSV = async () => {
    try {
        await exportTradesCSV(filters);
        toast.success('CSV exported successfully');
    } catch (error) {
        toast.error('Failed to export CSV');
    }
    };

    const handleExportJSON = async () => {
    try {
        const data = await exportTradesJSON(filters);
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `trades_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success('JSON exported successfully');
    } catch (error) {
        toast.error('Failed to export JSON');
    }
    };

    // const handleImport = async (event) => {
    // const file = event.target.files[0];
    // if (!file) return;

    // try {
    //     const result = await importTradesJSON(file);
    //     toast.success(result.message);
    //     dispatch(fetchTrades());
    // } catch (error) {
    //     toast.error('Failed to import JSON');
    // }
    
    // event.target.value = '';
    // };
    
    // import function
    const handleImport = (event) => {
      const file = event.target.files[0];
      if (!file) return;
    
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
            const data = JSON.parse(e.target.result);
          
          if (!Array.isArray(data)) {
            toast.error('Invalid JSON format');
            return;
        }
        
        let imported = 0;
        for (const trade of data) {
            try {
                await dispatch(createTrade({
                ticker: trade.ticker,
                entry_price: parseFloat(trade.entry_price),
                exit_price: parseFloat(trade.exit_price),
                quantity: parseInt(trade.quantity),
                trade_date: trade.trade_date,
                notes: trade.notes || '',
                direction: trade.direction || 'long',
                status: trade.status || 'closed',
                tags: trade.tags || [],
              }));
              imported++;
            } catch (err) {
              console.error('Failed to import trade:', trade.ticker, err);
            }
          }
    
          toast.success(`Imported ${imported} trades successfully`);
          dispatch(fetchTrades());
        } catch (err) {
          toast.error('Failed to parse JSON file');
        }
      };
      
      reader.readAsText(file);
      event.target.value = ''; // Reset input
    };
    // 
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
      ticker: searchParams.get('ticker') || '',
      direction: searchParams.get('direction') || '',
      status: searchParams.get('status') || '',
      strategy: searchParams.get('strategy') || '',
      start_date: searchParams.get('start_date') || '',
      end_date: searchParams.get('end_date') || '',
    });
    const [selectedTrades, setSelectedTrades] = useState([]);
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedTrades(trades.map((t) => t.id));
        } else {
            setSelectedTrades([]);
        }
    };

    const handleSelectTrade = (id) => {
        setSelectedTrades((prev) =>
            prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
        );
    };
    const handleBulkDelete = async () => {
        if (selectedTrades.length === 0) {
            toast.error('No trades selected');
            return;
        }
        
        if (window.confirm(`Are you sure you want to delete ${selectedTrades.length} trades?`)) {
            for (const id of selectedTrades) {
            await dispatch(deleteTrade(id));
        }
            setSelectedTrades([]);
            toast.success(`Deleted ${selectedTrades.length} trades`);
        }
    };
    
  const dispatch = useDispatch();
  const { trades, loading, error, pagination } = useSelector((state) => state.trades);
  // state summary
  const totalPnL = trades.reduce((sum, trade) => {
    return sum + (trade.exit_price - trade.entry_price) * trade.quantity * (trade.direction === 'long' ? 1 : -1);
  }, 0);
  
  const winningTrades = trades.filter((trade) => {
    const pnl = (trade.exit_price - trade.entry_price) * trade.quantity * (trade.direction === 'long' ? 1 : -1);
    return pnl > 0;
  }).length;
  
  const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0;
  // p&l percentage calculator
  const calculateReturn = (trade) => {
    const returnPct = ((trade.exit_price - trade.entry_price) / trade.entry_price) * 100 * (trade.direction === 'long' ? 1 : -1);
    return returnPct;
  };
  
  useEffect(() => {
    const params = {};
    if (filters.ticker) params.ticker = filters.ticker;
    if (filters.direction) params.direction = filters.direction;
    if (filters.status) params.status = filters.status;
    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date) params.end_date = filters.end_date;
    dispatch(fetchTrades(params));
    }, [dispatch, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this trade?')) {
      dispatch(deleteTrade(id));
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const calculatePnL = (trade) => {
    const pnl = (trade.exit_price - trade.entry_price) * trade.quantity * (trade.direction === 'long' ? 1 : -1);
    return pnl;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Trades</h1>
        {/* export button */}
        <div className="flex gap-2">
            <button
                onClick={handleExportCSV}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
                Export CSV
            </button>
            <button
                onClick={handleExportJSON}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
                Export JSON
            </button>
            <Link
                to="/trades/new"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
                + Add Trade
            </Link>
        </div>
        {/* import button */}
        <label className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition-colors cursor-pointer">
            Import JSON
                <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                />
        </label>
        {/*  */}
        <Link
          to="/trades/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          + Add Trade
        </Link>
      </div>

      {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ticker</label>
            <input
                type="text"
                name="ticker"
                value={filters.ticker}
                onChange={handleFilterChange}
                placeholder="Search ticker..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
            <select
                name="direction"
                value={filters.direction}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">All</option>
                <option value="long">Long</option>
                <option value="short">Short</option>
            </select>
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">All</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
            </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Strategy</label>
                <select
                    name="strategy"
                    value={filters.strategy}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">All</option>
                    <option value="Breakout">Breakout</option>
                    <option value="Pullback">Pullback</option>
                    <option value="Reversal">Reversal</option>
                    <option value="Momentum">Momentum</option>
                    <option value="Swing Trade">Swing Trade</option>
                    <option value="Day Trade">Day Trade</option>
                    <option value="Scalp">Scalp</option>
                    <option value="Trend Following">Trend Following</option>
                    <option value="Value">Value</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
                type="date"
                name="start_date"
                value={filters.start_date || ''}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
                type="date"
                name="end_date"
                value={filters.end_date || ''}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            </div>
        </div>
        <div className="mt-4 flex justify-end">
            <button
            onClick={() => setFilters({ ticker: '', direction: '', status: '', start_date: '', end_date: '' })}
            className="text-blue-600 hover:underline text-sm"
            >
            Clear Filters
            </button>
        </div>
        </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="text-gray-500">Loading trades...</div>
        </div>
      )}
      {/* quick state */}
      {/* Quick Stats */}
      {trades.length > 0 && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
        <p className="text-gray-500 text-sm">Total P&L</p>
        <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalPnL)}
        </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
        <p className="text-gray-500 text-sm">Win Rate</p>
        <p className="text-2xl font-bold text-blue-600">{winRate.toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
        <p className="text-gray-500 text-sm">Total Trades</p>
        <p className="text-2xl font-bold text-gray-800">{trades.length}</p>
        </div>
        </div>
      )}

      {/* buil actions */}
      {!loading && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            {selectedTrades.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex justify-between items-center">
                    <span className="text-blue-800 font-medium">
                    {selectedTrades.length} trade(s) selected
                    </span>
                    <div className="flex gap-2">
                    <button
                        onClick={handleBulkDelete}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg transition-colors"
                    >
                        Delete Selected
                    </button>
                    <button
                        onClick={() => setSelectedTrades([])}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    </div>
                </div>
            )}
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-10">
                    <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={trades.length > 0 && selectedTrades.length === trades.length}
                        className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticker</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Direction</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entry Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exit Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">P&L</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tags</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Return</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                  {!loading && trades.length === 0 ? (
                  <tr>
                    <td colSpan="12">
                    <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                        <p className="text-gray-500 text-lg font-medium">No trades yet</p>
                        <Link
                        to="/trades/new"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                        ADD YOUR FIRST TRADE
                        </Link>
                    </div>
                    </td>
                  </tr>
                  ):(
                  trades.map((trade) => {
                    const pnl = calculatePnL(trade);
                    return (
                      <tr key={trade.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap w-10">
                            <input
                                type="checkbox"
                                checked={selectedTrades.includes(trade.id)}
                                onChange={() => handleSelectTrade(trade.id)}
                                className="rounded border-gray-300"
                            />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{trade.ticker}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            trade.direction === 'long' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {trade.direction}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(trade.entry_price)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(trade.exit_price)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{trade.quantity}</td>
                        <td className={`px-6 py-4 whitespace-nowrap font-medium ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(pnl)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {new Date(trade.trade_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2 flex-wrap">
                                {trade.tags && trade.tags.length > 0 ? (
                                    trade.tags.slice(0, 3).map((tag) => (
                                        <span
                                            key={tag.id}
                                            className="px-2 py-1 text-xs font-semibold rounded-full"
                                            style={{
                                                backgroundColor: tag.color || '#3B82F6',
                                                color: '#fff',
                                            }}
                                        >
                                        {tag.name}
                                        </span>
                                    ))
                                    ) : (
                                    <span className="text-gray-400 text-sm">-</span>
                                    )}
                                    {trade.tags && trade.tags.length > 3 && (
                                <span className="text-gray-500 text-xs">+{trade.tags.length - 3}</span>
                                )}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                            {trade.notes || '-'}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap font-medium ${calculateReturn(trade) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {calculateReturn(trade).toFixed(2)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                            <Link
                                to={`/trades/${trade.id}/edit`}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Edit
                            </Link>
                            <button
                                onClick={() => handleDelete(trade.id)}
                                className="text-red-600 hover:text-red-800 font-medium"
                            >
                                Delete
                            </button>
                            </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.lastPage > 1 && (
            <div className="px-6 py-4 border-t flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Showing {((pagination.currentPage - 1) * 20) + 1} to {Math.min(pagination.currentPage * 20, pagination.total)} of {pagination.total} trades
              </div>
              <div className="flex gap-2">
                <button
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.currentPage === pagination.lastPage}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Trades;