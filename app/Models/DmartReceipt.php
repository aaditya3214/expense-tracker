<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
}
