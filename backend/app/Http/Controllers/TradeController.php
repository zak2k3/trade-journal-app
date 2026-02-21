<?php

namespace App\Http\Controllers;

use App\Models\Trade;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class TradeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
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

        if ($request->has('tag')) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('name', $request->tag);
            });
        }

        $trades = $query->with('tags')->orderBy('trade_date', 'desc')->paginate(20);

        return response()->json([
            'trades' => $trades,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ticker' => ['required', 'string', 'max:10'],
            'entry_price' => ['required', 'numeric', 'min:0'],
            'exit_price' => ['required', 'numeric', 'min:0'],
            'quantity' => ['required', 'integer', 'min:1'],
            'trade_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
            'direction' => ['required', 'in:long,short'],
            'status' => ['required', 'in:open,closed'],
        ]);

        $trade = Trade::create([
            ...$validated,
            'user_id' => Auth::id(),
        ]);

        // Attach tags if provided
        if ($request->has('tags') && is_array($request->tags)) {
            $tagIds = Tag::whereIn('name', $request->tags)->pluck('id');
            $trade->tags()->attach($tagIds);
        }

        return response()->json([
            'message' => 'Trade created successfully',
            'trade' => $trade->load('tags'),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Trade $trade): JsonResponse
    {
        // Ensure user owns this trade
        if ($trade->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'trade' => $trade->load('tags'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Trade $trade): JsonResponse
    {
        // Ensure user owns this trade
        if ($trade->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'ticker' => ['sometimes', 'string', 'max:10'],
            'entry_price' => ['sometimes', 'numeric', 'min:0'],
            'exit_price' => ['sometimes', 'numeric', 'min:0'],
            'quantity' => ['sometimes', 'integer', 'min:1'],
            'trade_date' => ['sometimes', 'date'],
            'notes' => ['nullable', 'string'],
            'direction' => ['sometimes', 'in:long,short'],
            'status' => ['sometimes', 'in:open,closed'],
        ]);

        $trade->update($validated);

        // Sync tags if provided
        if ($request->has('tags') && is_array($request->tags)) {
            $tagIds = Tag::whereIn('name', $request->tags)->pluck('id');
            $trade->tags()->sync($tagIds);
        }

        return response()->json([
            'message' => 'Trade updated successfully',
            'trade' => $trade->load('tags'),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Trade $trade): JsonResponse
    {
        // Ensure user owns this trade
        if ($trade->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $trade->delete();

        return response()->json([
            'message' => 'Trade deleted successfully',
        ]);
    }

    /**
     * Attach tags to a trade.
     */
    public function attachTags(Request $request, Trade $trade): JsonResponse
    {
        if ($trade->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'tags' => ['required', 'array'],
            'tags.*' => ['string'],
        ]);

        $tagIds = Tag::whereIn('name', $validated['tags'])->pluck('id');
        $trade->tags()->syncWithoutDetaching($tagIds);

        return response()->json([
            'message' => 'Tags attached successfully',
            'trade' => $trade->load('tags'),
        ]);
    }

    /**
     * Detach a tag from a trade.
     */
    public function detachTag(Request $request, Trade $trade, Tag $tag): JsonResponse
    {
        if ($trade->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $trade->tags()->detach($tag);

        return response()->json([
            'message' => 'Tag detached successfully',
            'trade' => $trade->load('tags'),
        ]);
    }
}