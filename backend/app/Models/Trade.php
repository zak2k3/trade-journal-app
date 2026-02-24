<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Trade extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'ticker',
        'entry_price',
        'exit_price',
        'quantity',
        'trade_date',
        'notes',
        'strategy',
        'direction',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'entry_price' => 'decimal:2',
        'exit_price' => 'decimal:2',
        'trade_date' => 'date',
    ];

    /**
     * Calculate profit/loss for this trade.
     */
    public function calculatePnL(): float
    {
        $multiplier = $this->direction === 'long' ? 1 : -1;
        return ($this->exit_price - $this->entry_price) * $this->quantity * $multiplier;
    }

    /**
     * Calculate return percentage.
     */
    public function calculateReturn(): float
    {
        if ($this->entry_price == 0) {
            return 0;
        }
        
        $multiplier = $this->direction === 'long' ? 1 : -1;
        return (($this->exit_price - $this->entry_price) / $this->entry_price) * 100 * $multiplier;
    }

    /**
     * Get the user that owns the trade.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the tags associated with the trade.
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'trade_tag', 'trade_id', 'tag_id');
    }

    /**
     * Scope to filter by user.
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope for closed trades only.
     */
    public function scopeClosed($query)
    {
        return $query->where('status', 'closed');
    }

    /**
     * Scope for open trades only.
     */
    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }
}