<?php

namespace App\Http\Controllers;

use App\Models\Trade;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response;

class ExportController extends Controller
{
    /**
     * Export trades to CSV.
     */
    public function exportCsv(Request $request)
    {
        $query = Trade::where('user_id', Auth::id());

        // Apply filters
        if ($request->has('ticker')) {
            $query->where('ticker', 'like', '%' . $request->ticker . '%');
        }
        if ($request->has('direction')) {
            $query->where('direction', $request->direction);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('trade_date', [$request->start_date, $request->end_date]);
        }

        $trades = $query->with('tags')->orderBy('trade_date', 'desc')->get();

        $csvData = [];
        $csvData[] = ['Ticker', 'Direction', 'Entry Price', 'Exit Price', 'Quantity', 'P&L', 'Return %', 'Status', 'Trade Date', 'Notes', 'Tags'];

        foreach ($trades as $trade) {
            $pnl = ($trade->exit_price - $trade->entry_price) * $trade->quantity * ($trade->direction === 'long' ? 1 : -1);
            $returnPct = $trade->entry_price > 0 ? (($trade->exit_price - $trade->entry_price) / $trade->entry_price) * 100 * ($trade->direction === 'long' ? 1 : -1) : 0;
            $tags = $trade->tags->pluck('name')->implode(', ');

            $csvData[] = [
                $trade->ticker,
                $trade->direction,
                $trade->entry_price,
                $trade->exit_price,
                $trade->quantity,
                number_format($pnl, 2),
                number_format($returnPct, 2) . '%',
                $trade->status,
                $trade->trade_date,
                $trade->notes ?? '',
                $tags,
            ];
        }

        $filename = 'trades_' . date('Y-m-d') . '.csv';
        $callback = function () use ($csvData) {
            $handle = fopen('php://output', 'w');
            foreach ($csvData as $row) {
                fputcsv($handle, $row);
            }
            fclose($handle);
        };

        return Response::stream($callback, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Export trades to JSON.
     */
    public function exportJson(Request $request)
    {
        $query = Trade::where('user_id', Auth::id());

        if ($request->has('ticker')) {
            $query->where('ticker', 'like', '%' . $request->ticker . '%');
        }
        if ($request->has('direction')) {
            $query->where('direction', $request->direction);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('trade_date', [$request->start_date, $request->end_date]);
        }

        $trades = $query->with('tags')->orderBy('trade_date', 'desc')->get();

        $data = $trades->map(function ($trade) {
            return [
                'ticker' => $trade->ticker,
                'direction' => $trade->direction,
                'entry_price' => (float) $trade->entry_price,
                'exit_price' => (float) $trade->exit_price,
                'quantity' => (int) $trade->quantity,
                'trade_date' => $trade->trade_date,
                'notes' => $trade->notes,
                'status' => $trade->status,
                'tags' => $trade->tags->pluck('name')->toArray(),
            ];
        });

        return response()->json($data);
    }

    /**
     * Import trades from JSON.
     */
    public function importJson(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:json',
        ]);

        $file = $request->file('file');
        $content = file_get_contents($file->getRealPath());
        $trades = json_decode($content, true);

        if (!is_array($trades)) {
            return response()->json(['message' => 'Invalid JSON format'], 422);
        }

        $imported = 0;
        $errors = [];

        foreach ($trades as $index => $tradeData) {
            try {
                $trade = Trade::create([
                    'user_id' => Auth::id(),
                    'ticker' => $tradeData['ticker'] ?? strtoupper($tradeData['ticker'] ?? 'UNKNOWN'),
                    'entry_price' => $tradeData['entry_price'] ?? 0,
                    'exit_price' => $tradeData['exit_price'] ?? 0,
                    'quantity' => $tradeData['quantity'] ?? 1,
                    'trade_date' => $tradeData['trade_date'] ?? now()->toDateString(),
                    'notes' => $tradeData['notes'] ?? '',
                    'direction' => $tradeData['direction'] ?? 'long',
                    'status' => $tradeData['status'] ?? 'closed',
                ]);

                // Attach tags if provided
                if (isset($tradeData['tags']) && is_array($tradeData['tags'])) {
                    $tagIds = \App\Models\Tag::whereIn('name', $tradeData['tags'])->pluck('id');
                    $trade->tags()->attach($tagIds);
                }

                $imported++;
            } catch (\Exception $e) {
                $errors[] = "Row {$index}: " . $e->getMessage();
            }
        }

        return response()->json([
            'message' => "Imported {$imported} trades",
            'imported' => $imported,
            'errors' => $errors,
        ]);
    }
}