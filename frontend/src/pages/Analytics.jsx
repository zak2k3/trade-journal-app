import { 
  MonthlyPnLChart, 
  WinLossPieChart, 
  EquityCurveChart, 
  DirectionPerformanceChart, 
  WinRateTrendChart, 
  StrategyPerformanceChart 
} from '../components/Charts';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnalytics } from '../store/analyticsSlice';

const Analytics = () => {
  const [period, setPeriod] = useState('all');
  const dispatch = useDispatch();
  const { summary, monthlyPnl, directionStats, trades, loading, error } = useSelector((state) => state.analytics);

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

  // Compute strategy stats safely
  const strategyStats = trades?.length
    ? Object.values(
        trades.reduce((acc, trade) => {
          const strategy = trade.strategy || "Unknown";

          if (!acc[strategy]) {
            acc[strategy] = {
              strategy,
              trades_count: 0,
              wins: 0,
              losses: 0,
              pnl: 0,
            };
          }

          acc[strategy].trades_count += 1;
          if (trade.result === "win") {
            acc[strategy].wins += 1;
          } else {
            acc[strategy].losses += 1;
          }
          acc[strategy].pnl += Number(trade.pnl) || 0;

          return acc;
        }, {})
      ).map((s) => ({
        ...s,
        avg_pnl: s.trades_count ? s.pnl / s.trades_count : 0,
        win_rate: s.trades_count ? (s.wins / s.trades_count) * 100 : 0,
      }))
    : [];

  return (
    <div>
      {/* Header & Period Selector */}
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
            {summary?.profit_factor
                ? Math.min(Number(summary.profit_factor), 9999).toFixed(2)
                : '—'}
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
            <DirectionPerformanceChart data={directionStats} />
          ) : (
            <p className="text-gray-500">No direction data available</p>
          )}
        </div>
      </div>

      {/* Monthly P&L Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly P&L</h2>
        {monthlyPnl && monthlyPnl.length > 0 ? (
          <MonthlyPnLChart data={monthlyPnl} />
        ) : (
          <p className="text-gray-500">No monthly data available</p>
        )}
      </div>

      {/* Strategy Breakdown */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Performance by Strategy</h2>
        <StrategyPerformanceChart data={strategyStats} />
      </div>
    </div>
  );
};

export default Analytics;