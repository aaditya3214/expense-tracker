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
        Schema::table('dmart_receipts', function (Blueprint $table) {
            //
            $table->string('unit')->default('kg')->after('qty_kg');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dmart_receipts', function (Blueprint $table) {
            //
            $table->dropColumn('unit');
        });
    }
};
