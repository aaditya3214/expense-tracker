<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DmartReceipt; 
use Carbon\Carbon;

class ExpenseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. पुरानी सारी एंट्रीज़ मिटा दें
        DmartReceipt::truncate();

        $items = [
            ['hsn' => '1006', 'name' => 'BASMATI RICE (INDIA GATE)', 'unit' => 'kg', 'min_qty' => 1, 'max_qty' => 5, 'rate' => 195],
            ['hsn' => '1101', 'name' => 'WHEAT FLOUR (AASHIRVAAD)', 'unit' => 'kg', 'min_qty' => 5, 'max_qty' => 10, 'rate' => 52],
            ['hsn' => '1512', 'name' => 'SUNFLOWER OIL (FORTUNE)', 'unit' => 'l', 'min_qty' => 1, 'max_qty' => 3, 'rate' => 145],
            ['hsn' => '1509', 'name' => 'FIGARO OLIVE OIL', 'unit' => 'l', 'min_qty' => 1, 'max_qty' => 1, 'rate' => 799], 
            ['hsn' => '1902', 'name' => 'MAGGI NOODLES (PACK OF 6)', 'unit' => 'pkt', 'min_qty' => 1, 'max_qty' => 2, 'rate' => 84],
            ['hsn' => '3305', 'name' => 'HEAD & SHOULDERS SHAMPOO', 'unit' => 'pcs', 'min_qty' => 1, 'max_qty' => 1, 'rate' => 340],
            ['hsn' => '3401', 'name' => 'DETTOL SOAP (PACK OF 4)', 'unit' => 'pkt', 'min_qty' => 1, 'max_qty' => 2, 'rate' => 125],
            ['hsn' => '0713', 'name' => 'TOOR DAL (TATA SAMPANN)', 'unit' => 'kg', 'min_qty' => 1, 'max_qty' => 2, 'rate' => 165],
            ['hsn' => '1701', 'name' => 'SUGAR (MADHUR)', 'unit' => 'kg', 'min_qty' => 1, 'max_qty' => 5, 'rate' => 45],
            ['hsn' => '2501', 'name' => 'TATA SALT', 'unit' => 'kg', 'min_qty' => 1, 'max_qty' => 2, 'rate' => 28],
            ['hsn' => '0405', 'name' => 'AMUL BUTTER', 'unit' => 'pcs', 'min_qty' => 1, 'max_qty' => 2, 'rate' => 55],
            ['hsn' => '2009', 'name' => 'AMLA JUICE (PATANJALI)', 'unit' => 'pcs', 'min_qty' => 1, 'max_qty' => 1, 'rate' => 130], 
            ['hsn' => '0401', 'name' => 'GOKUL MILK', 'unit' => 'l', 'min_qty' => 1, 'max_qty' => 2, 'rate' => 66],
        ];

        $dataToInsert = [];

        // 👇 NAYA LOGIC: सिर्फ ठीक 90 बार लूप चलेगा (Exact 90 Rows) 👇
        for ($i = 0; $i < 90; $i++) {
            
            // पिछले 90 दिनों में से कोई भी एक रैंडम दिन चुनें
            $randomDaysAgo = rand(0, 90);
            $randomDate = Carbon::now()->subDays($randomDaysAgo);
            
            // रैंडम आइटम चुनें
            $randomItem = $items[array_rand($items)];
            
            $qty = rand($randomItem['min_qty'] * 10, $randomItem['max_qty'] * 10) / 10; 
            $rate = $randomItem['rate'];
            $value = round($qty * $rate, 2);

            $dataToInsert[] = [
                'hsn' => $randomItem['hsn'],
                'particulars' => $randomItem['name'],
                'qty_kg' => $qty,
                'unit' => $randomItem['unit'],
                'n_rate' => $rate,
                'value' => $value,
                'created_at' => $randomDate,
                'updated_at' => $randomDate,
            ];
        }

        // 4. डेटाबेस में सेव करें
        foreach (array_chunk($dataToInsert, 50) as $chunk) {
            DmartReceipt::insert($chunk);
        }

        $this->command->info('✅ Exactly 90 Records created successfully!');
    }
}