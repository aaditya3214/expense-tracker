<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ExpenseSeeder extends Seeder
{
    public function run()
    {
        // 1. आपके असली टेबल 'dmart_receipts' का पुराना डेटा डिलीट करें
        DB::table('dmart_receipts')->truncate(); 

        // 2. D-Mart के आइटम्स की लिस्ट
        $items = [
            ['hsn' => '1001', 'name' => 'WHEAT FLOUR (AASHIRVAAD)', 'unit' => 'KG', 'min_qty' => 5, 'max_qty' => 10, 'rate' => 45.50],
            ['hsn' => '1006', 'name' => 'BASMATI RICE (INDIA GATE)', 'unit' => 'KG', 'min_qty' => 5, 'max_qty' => 20, 'rate' => 120.00],
            ['hsn' => '1508', 'name' => 'SUNFLOWER OIL (FORTUNE)', 'unit' => 'LTR', 'min_qty' => 1, 'max_qty' => 5, 'rate' => 145.00],
            ['hsn' => '0401', 'name' => 'AMUL TAAZA MILK', 'unit' => 'LTR', 'min_qty' => 1, 'max_qty' => 2, 'rate' => 54.00],
            ['hsn' => '1701', 'name' => 'MADHUR SUGAR', 'unit' => 'KG', 'min_qty' => 2, 'max_qty' => 5, 'rate' => 42.00],
            ['hsn' => '3401', 'name' => 'DETTOL SOAP (PACK OF 4)', 'unit' => 'PCS', 'min_qty' => 1, 'max_qty' => 3, 'rate' => 140.00],
            ['hsn' => '3305', 'name' => 'HEAD & SHOULDERS SHAMPOO', 'unit' => 'PCS', 'min_qty' => 1, 'max_qty' => 2, 'rate' => 320.00],
            ['hsn' => '0713', 'name' => 'TATA SAMPANN TOOR DAL', 'unit' => 'KG', 'min_qty' => 1, 'max_qty' => 3, 'rate' => 165.00],
        ];

        $expenses = [];
        $startDate = Carbon::create(2026, 1, 1, 10, 0, 0); 

        // 3. 90 दिनों का लूप
        for ($i = 0; $i < 90; $i++) {
            $currentDate = $startDate->copy()->addDays($i);
            $randomItem = $items[array_rand($items)];

            $qty = rand($randomItem['min_qty'] * 10, $randomItem['max_qty'] * 10) / 10;
            $rate = $randomItem['rate'] + rand(-5, 5); 
            $value = round($qty * $rate, 2);

            $expenses[] = [
                'hsn' => $randomItem['hsn'],
                'particulars' => $randomItem['name'],
                'qty_kg' => $qty,
                'unit' => $randomItem['unit'],
                'n_rate' => $rate,
                'value' => $value,
                'created_at' => $currentDate->format('Y-m-d H:i:s'),
                'updated_at' => $currentDate->format('Y-m-d H:i:s'),
            ];
        }

        // 4. आपके असली टेबल 'dmart_receipts' में डेटा सेव करें
        DB::table('dmart_receipts')->insert($expenses);
        
        $this->command->info('✅ 90 Days of Real Life D-Mart Data Inserted Successfully in dmart_receipts table!');
    }
}