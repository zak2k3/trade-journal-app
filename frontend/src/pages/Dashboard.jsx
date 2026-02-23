import { CardSkeleton, TableSkeleton } from '../components/Skeleton';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnalytics } from '../store/analyticsSlice';
import { fetchTrades } from '../store/tradesSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { summary, monthlyPnl, loading, error } = useSelector((state) => state.analytics);
  const { trades } = useSelector((state) => state.trades);

  useEffect(() => {
    dispatch(fetchAnalytics('all'));
    dispatch(fetchTrades());
  }, [dispatch]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${value.toFixed(2)}%`;
  };

  const recentTrades = trades?.slice(0, 5) || [];

  if (loading && !summary) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <TableSkeleton />
    </div>
  );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Total P&L</p>
          <p className={`text-3xl font-bold ${summary?.total_pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(summary?.total_pnl || 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Win Rate</p>
          <p className="text-3xl font-bold text-blue-600">
            {formatPercent(summary?.win_rate || 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Total Trades</p>
          <p className="text-3xl font-bold text-gray-800">
            {summary?.total_trades || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Profit Factor</p>
          <p className="text-3xl font-bold text-gray-800">
            {summary?.profit_factor?.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Winning Trades</p>
          <p className="text-2xl font-bold text-green-600">{summary?.winning_trades || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Losing Trades</p>
          <p className="text-2xl font-bold text-red-600">{summary?.losing_trades || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Average P&L per Trade</p>
          <p className={`text-2xl font-bold ${summary?.avg_pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(summary?.avg_pnl || 0)}
          </p>
        </div>
      </div>

      {/* Recent Trades */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Recent Trades</h2>
          <Link to="/trades" className="text-blue-600 hover:underline">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticker</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Direction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">P&L</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentTrades.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No trades yet. <Link to="/trades/new" className="text-blue-600 hover:underline">Add your first trade</Link>
                  </td>
                </tr>
              ) : (
                recentTrades.map((trade) => {
                  const pnl = (trade.exit_price - trade.entry_price) * trade.quantity * (trade.direction === 'long' ? 1 : -1);
                  return (
                    <tr key={trade.id}>
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
                      <td className={`px-6 py-4 whitespace-nowrap font-medium ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(pnl)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {new Date(trade.trade_date).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link
          to="/trades/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          + Add New Trade
        </Link>
        <Link
          to="/analytics"
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          View Analytics
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;