import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899'];

/**
 * Monthly P&L Bar Chart
 * Shows P&L for each month
 */
export const MonthlyPnLChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-center">No data available</p>
      </div>
    );
  }

  const chartData = [...data].reverse().map((item) => ({
    ...item,
    pnl: parseFloat(item.pnl),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="month" 
          tick={{ fill: '#6b7280', fontSize: 12 }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis 
          tick={{ fill: '#6b7280', fontSize: 12 }}
          axisLine={{ stroke: '#e5e7eb' }}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          formatter={(value) => [`$${value.toFixed(2)}`, 'P&L']}
          contentStyle={{ 
            borderRadius: '8px', 
            border: 'none', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#fff',
            padding: '12px'
          }}
        />
        <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.pnl >= 0 ? '#10B981' : '#EF4444'} 
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

/**
 * Win/Loss Pie Chart
 * Shows distribution of wins, losses, and breakeven trades
 */
export const WinLossPieChart = ({ winning, losing, breakeven }) => {
  const data = [
    { name: 'Wins', value: winning, color: '#10B981' },
    { name: 'Losses', value: losing, color: '#EF4444' },
    { name: 'Breakeven', value: breakeven, color: '#F59E0B' },
  ].filter((item) => item.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-center">No data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color}
              stroke="#fff"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );
};

/**
 * Equity Curve Line Chart
 * Shows cumulative P&L over time
 */
export const EquityCurveChart = ({ trades }) => {
  if (!trades || trades.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-center">No data available</p>
      </div>
    );
  }

  const sortedTrades = [...trades]
    .sort((a, b) => new Date(a.trade_date) - new Date(b.trade_date));

  let cumulativePnL = 0;
  const chartData = sortedTrades.map((trade) => {
    const tradePnL = (trade.exit_price - trade.entry_price) * trade.quantity * (trade.direction === 'long' ? 1 : -1);
    cumulativePnL += tradePnL;
    return {
      date: new Date(trade.trade_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      equity: cumulativePnL,
      trade: trade.ticker,
      rawDate: trade.trade_date,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} />
        <YAxis tickFormatter={(value) => `$${value}`} tick={{ fill: '#6b7280', fontSize: 12 }} />
        <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Equity']} />
        <Line
          type="monotone"
          dataKey="equity"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

/**
 * Direction Performance Chart
 * Shows P&L for long vs short trades
 */
export const DirectionPerformanceChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-center">No data available</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    pnl: parseFloat(item.pnl),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 60, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis type="number" tickFormatter={(value) => `$${value}`} tick={{ fill: '#6b7280', fontSize: 12 }} />
        <YAxis dataKey="direction" type="category" width={60} tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)} />
        <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'P&L']} />
        <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.direction === 'long' ? '#10B981' : '#EF4444'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

/**
 * Win Rate Trend Chart
 * Shows win rate progression over time
 */
export const WinRateTrendChart = ({ trades }) => {
  if (!trades || trades.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-center">No data available</p>
      </div>
    );
  }

  const monthlyData = {};
  [...trades]
    .sort((a, b) => new Date(a.trade_date) - new Date(b.trade_date))
    .forEach((trade) => {
      const month = new Date(trade.trade_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      const pnl = (trade.exit_price - trade.entry_price) * trade.quantity * (trade.direction === 'long' ? 1 : -1);
      
      if (!monthlyData[month]) {
        monthlyData[month] = { wins: 0, losses: 0 };
      }
      
      if (pnl > 0) monthlyData[month].wins++;
      else if (pnl < 0) monthlyData[month].losses++;
    });

  const chartData = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    winRate: data.wins + data.losses > 0 ? (data.wins / (data.wins + data.losses)) * 100 : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} />
        <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{ fill: '#6b7280', fontSize: 12 }} />
        <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Win Rate']} />
        <Line type="monotone" dataKey="winRate" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: '#8B5CF6', r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

/**
 * Strategy Performance Chart
 * Shows P&L and win rate by strategy
 */
export const StrategyPerformanceChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-center">No strategy data available</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    pnl: parseFloat(item.pnl),
    avg_pnl: parseFloat(item.avg_pnl),
    win_rate: parseFloat(item.win_rate),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="strategy" tick={{ fill: '#6b7280', fontSize: 12 }} />
        <YAxis tickFormatter={(value) => `$${value}`} tick={{ fill: '#6b7280', fontSize: 12 }} />
        <Tooltip
          formatter={(value, name) => [
            name === 'pnl' ? `$${value.toFixed(2)}` : `${value.toFixed(1)}%`,
            name === 'pnl' ? 'Total P&L' : 'Win Rate'
          ]}
        />
        <Bar dataKey="pnl" name="Total P&L" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10B981' : '#EF4444'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

/**
 * Ticker Performance Chart
 * Shows P&L by ticker symbol
 */
export const TickerPerformanceChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-center">No ticker data available</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    pnl: parseFloat(item.pnl),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 60, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis type="number" tickFormatter={(value) => `$${value}`} tick={{ fill: '#6b7280', fontSize: 12 }} />
        <YAxis dataKey="ticker" type="category" width={60} tick={{ fill: '#6b7280', fontSize: 12 }} />
        <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'P&L']} />
        <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10B981' : '#EF4444'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default {
  MonthlyPnLChart,
  WinLossPieChart,
  EquityCurveChart,
  DirectionPerformanceChart,
  WinRateTrendChart,
  StrategyPerformanceChart,
  TickerPerformanceChart,
};