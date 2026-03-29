<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory; // <--- यह होना चाहिए
use Illuminate\Database\Eloquent\Model;

class DmartReceipt extends Model
{
    use HasFactory; // <--- यह होना चाहिए

    //give permission to save data in model 
    protected $fillable = [
        'hsn',
        'particulars',
        'qty_kg',
        'unit',
        'n_rate',
        'value',
    ];
}
