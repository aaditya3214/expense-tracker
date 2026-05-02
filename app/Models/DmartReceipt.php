<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DmartReceipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'purchased_at',
        'hsn',
        'particulars',
        'qty_kg',
        'unit',
        'n_rate',
        'value',
        'vendor',
    ];

    /**
     * Get the user that owns the receipt.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
