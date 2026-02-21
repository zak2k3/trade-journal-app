<?php

namespace App\Http\Controllers;

use App\Models\Trade;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    /**
     * Display analytics for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = Auth::id();
        $period = $request->get('period', 'all'); // day, week, month, year, all

        $query = Trade::where('user_id', $userId)->where('status', 'closed');

        // Apply period filter
        if ($period !== 'all') {
            $query->where('trade_date', '>=', now()->subPeriod($period)->startOfDay());
        }

        $trades = $query->get();

        // Calculate metrics
        $totalTrades = $trades->count();
        $winningTrades = $trades->filter(fn($trade) => $trade->calculatePnL() > 0)->count();
        $losingTrades = $trades->filter(fn($trade) => $trade->calculatePnL() < 0)->count();
        $breakevenTrades = $trades->filter(fn($trade) => $trade->calculatePnL() == 0)->count();

        $totalPnL = $trades->sum(fn($trade) => $trade->calculatePnL());
        $winRate = $totalTrades > 0 ? ($winningTrades / $totalTrades) * 100 : 0;

        $avgWin = $trades->filter(fn($t) => $t->calculatePnL() > 0)->avg(fn($t) => $t->calculatePnL()) ?? 0;
        $avgLoss = $trades->filter(fn($t) => $t->calculatePnL() < 0)->avg(fn($t) => $t->calculatePnL()) ?? 0;
        $avgPnL = $totalTrades > 0 ? $totalPnL / $totalTrades : 0;

        // Profit factor
        $grossProfit = $trades->filter(fn($t) => $t->calculatePnL() > 0)->sum(fn($t) => $t->calculatePnL());
        $grossLoss = abs($trades->filter(fn($t) => $t->calculatePnL() < 0)->sum(fn($t) => $t->calculatePnL()));
        $profitFactor = $grossLoss > 0 
            ? $grossProfit / $grossLoss 
            : ($grossProfit > 0 ? PHP_FLOAT_MAX : 0);

        // Monthly P&L
        $monthlyPnL = $trades
            ->groupBy(fn($trade) => $trade->trade_date->format('Y-m'))
            ->map(fn($monthlyTrades, $month) => [
                'month' => $month,
                'pnl' => $monthlyTrades->sum(fn($t) => $t->calculatePnL()),
                'trades_count' => $monthlyTrades->count(),
            ])
            ->sortBy('month')
            ->values();

        // Direction breakdown
        $directionStats = $trades->groupBy('direction')->map(fn($dirTrades, $direction) => [
            'direction' => $direction,
            'trades_count' => $dirTrades->count(),
            'pnl' => $dirTrades->sum(fn($t) => $t->calculatePnL()),
            'win_rate' => $dirTrades->count() > 0 
                ? ($dirTrades->filter(fn($t) => $t->calculatePnL() > 0)->count() / $dirTrades->count()) * 100 
                : 0,
        ]);

        return response()->json([
            'summary' => [
                'total_trades' => $totalTrades,
                'winning_trades' => $winningTrades,
                'losing_trades' => $losingTrades,
                'breakeven_trades' => $breakevenTrades,
                'total_pnl' => round($totalPnL, 2),
                'win_rate' => round($winRate, 2),
                'avg_win' => round($avgWin, 2),
                'avg_loss' => round($avgLoss, 2),
                'avg_pnl' => round($avgPnL, 2),
                'profit_factor' => round($profitFactor, 2),
            ],
            'monthly_pnl' => $monthlyPnL,
            'direction_stats' => $directionStats,
        ]);
    }
};