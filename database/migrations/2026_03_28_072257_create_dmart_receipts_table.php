<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('dmart_receipts', function (Blueprint $table) {
            $table->id();
            $table->String('hsn')->nullable();
            $table->string('particulars'); // सामान का नाम (जैसे: SUGAR, SOAP)
            $table->decimal('qty_kg', 8, 3); // मात्रा (किलो/ग्राम के लिए 3 डेसिमल, जैसे 1.500)
            $table->decimal('n_rate', 10, 2); // एक यूनिट की कीमत (रुपये और पैसे के लिए)
            $table->decimal('value', 10, 2); // Price (in rupees and paise)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dmart_receipts');
    }
};
