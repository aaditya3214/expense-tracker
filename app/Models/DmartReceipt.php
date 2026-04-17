<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DmartReceipt extends Model
{
    use HasFactory; 

    // 👇 PRO FIX: 'user_id' को यहाँ परमिशन देना ज़रूरी है ताकि डेटा आइसोलेशन काम करे!
    protected $fillable = [
        'user_id', 
        'hsn',
        'particulars',
        'qty_kg',
        'unit',
        'n_rate',
        'value',
    ];
}