import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnalytics } from '../store/analyticsSlice';

const Analytics = () => {
  const [period, setPeriod] = useState('all');
  const dispatch = useDispatch();
  const { summary, monthlyPnl, directionStats, loading, error } = useSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchAnalytics(period));
  }, [dispatch, period]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${value.toFixed(2)}%`;
  };

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading analytics...</div>
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Time</option>
          <option value="year">This Year</option>
          <option value="month">This Month</option>
          <option value="week">This Week</option>
        </select>
      </div>

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
          <p className="text-gray-500 text-sm">Profit Factor</p>
          <p className="text-3xl font-bold text-gray-800">
            {summary?.profit_factor?.toFixed(2) || '0.00'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Average P&L</p>
          <p className={`text-3xl font-bold ${summary?.avg_pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(summary?.avg_pnl || 0)}
          </p>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Win/Loss Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Win/Loss Breakdown</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Trades</span>
              <span className="font-semibold">{summary?.total_trades || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-600">Winning Trades</span>
              <span className="font-semibold text-green-600">{summary?.winning_trades || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-red-600">Losing Trades</span>
              <span className="font-semibold text-red-600">{summary?.losing_trades || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Breakeven Trades</span>
              <span className="font-semibold">{summary?.breakeven_trades || 0}</span>
            </div>
            <hr />
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Win</span>
              <span className="font-semibold text-green-600">{formatCurrency(summary?.avg_win || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Loss</span>
              <span className="font-semibold text-red-600">{formatCurrency(summary?.avg_loss || 0)}</span>
            </div>
          </div>
        </div>

        {/* Direction Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Performance by Direction</h2>
          {directionStats && directionStats.length > 0 ? (
            <div className="space-y-4">
              {directionStats.map((stat) => (
                <div key={stat.direction} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-semibold capitalize ${
                      stat.direction === 'long' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.direction}
                    </span>
                    <span className="text-sm text-gray-500">{stat.trades_count} trades</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">P&L:</span>
                      <span className={`ml-2 font-medium ${stat.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(stat.pnl)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Win Rate:</span>
                      <span className="ml-2 font-medium">{formatPercent(stat.win_rate)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No direction data available</p>
          )}
        </div>
      </div>

      {/* Monthly P&L Chart (Text-based for MVP) */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly P&L</h2>
        {monthlyPnl && monthlyPnl.length > 0 ? (
          <div className="space-y-3">
            {monthlyPnl.slice().reverse().map((month) => (
              <div key={month.month} className="flex items-center">
                <span className="w-24 text-gray-600 text-sm">{month.month}</span>
                <div className="flex-1 mx-4">
                  <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${month.pnl >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{
                        width: `${Math.min(Math.abs(month.pnl) / Math.max(...monthlyPnl.map(m => Math.abs(m.pnl))) * 100, 100)}%`,
                        marginLeft: month.pnl < 0 ? 'auto' : 0
                      }}
                    />
                  </div>
                </div>
                <span className={`w-24 text-right font-medium ${month.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(month.pnl)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No monthly data available</p>
        )}
      </div>
    </div>
  );
};

export default Analytics;