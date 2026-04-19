<?php

namespace Database\Seeders;

use App\Models\DmartReceipt;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FreshDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Clear existing data
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DmartReceipt::truncate();
        Vendor::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 2. Find the target user (Aaditya Kushwaha)
        $user = User::where('name', 'Aaditya Kushwaha')->first() ?: User::first();

        if (! $user) {
            $this->command->error('No user found to seed records for.');

            return;
        }

        $this->command->info("Seeding realistic vendors for user: {$user->name}");

        // 3. Realistic Indian Vendors with Real GSTIN formats
        $realVendors = [
            ['name' => 'DMart', 'gstin' => '27AADCA1234A1Z5', 'contact' => '022-33445566', 'address' => 'Andheri East, Mumbai, Maharashtra'],
            ['name' => 'Reliance Smart', 'gstin' => '27AADCR5678R1Z2', 'contact' => '1800-889-9999', 'address' => 'Reliance Corporate Park, Navi Mumbai'],
            ['name' => 'Big Bazaar', 'gstin' => '27AAACB9012B1Z0', 'contact' => '1800-210-0005', 'address' => 'Vile Parle, Mumbai, Maharashtra'],
            ['name' => 'Blinkit', 'gstin' => '07AABCB3456B1Z8', 'contact' => '011-44556677', 'address' => 'Gurugram, Haryana'],
            ['name' => 'Zepto', 'gstin' => '27AAFCZ7890Z1Z4', 'contact' => '022-66778899', 'address' => 'Powai, Mumbai, Maharashtra'],
            ['name' => 'Swiggy Instamart', 'gstin' => '29AABCS1122S1Z9', 'contact' => '080-33441122', 'address' => 'Koramangala, Bengaluru, Karnataka'],
            ['name' => 'Amazon Fresh', 'gstin' => '07AAACA4455A1Z1', 'contact' => '1800-3000-9009', 'address' => 'Saket, New Delhi'],
            ['name' => 'BigBasket', 'gstin' => '29AAACB3344B1Z3', 'contact' => '1860-123-1000', 'address' => 'Indiranagar, Bengaluru, Karnataka'],
            ['name' => 'Star Bazaar', 'gstin' => '27AADCT5566T1Z7', 'contact' => '022-22334455', 'address' => 'Thane West, Maharashtra'],
            ['name' => 'Apollo Pharmacy', 'gstin' => '27AAACA5544A1ZA', 'contact' => '1860-500-0101', 'address' => 'Dadar, Mumbai, Maharashtra'],
            ['name' => 'Spencer\'s', 'gstin' => '19AAACS7788S1Z6', 'contact' => '1800-123-4567', 'address' => 'Kolkata, West Bengal'],
            ['name' => 'Nature\'s Basket', 'gstin' => '27AAACN9900N1Z2', 'contact' => '022-44558899', 'address' => 'Worli, Mumbai, Maharashtra'],
            ['name' => 'Local Kirana Store', 'gstin' => '27AAALK2233K1Z4', 'contact' => '9876543210', 'address' => 'Bhayandar East, Thane, Maharashtra'],
        ];

        foreach ($realVendors as $v) {
            Vendor::create([
                'user_id' => $user->id,
                'name' => $v['name'],
                'gstin' => $v['gstin'],
                'contact_number' => $v['contact'],
                'address' => $v['address'],
            ]);
        }

        $this->command->info("Seeding 10,000 records for user: {$user->name} (ID: {$user->id})");

        // 4. Prepare chunks for faster insertion
        $totalRecords = 10000;
        $chunkSize = 1000;
        $vendorNames = collect($realVendors)->pluck('name')->toArray();

        for ($i = 0; $i < $totalRecords / $chunkSize; $i++) {
            $records = DmartReceipt::factory()
                ->count($chunkSize)
                ->make([
                    'user_id' => $user->id,
                ])
                ->map(function ($record) use ($vendorNames) {
                    $array = $record->toArray();
                    $array['vendor'] = fake()->randomElement($vendorNames);
                    $array['created_at'] = $record->created_at->format('Y-m-d H:i:s');
                    $array['updated_at'] = $record->updated_at->format('Y-m-d H:i:s');

                    return $array;
                })
                ->toArray();

            DB::table('dmart_receipts')->insert($records);
            $this->command->info('Inserted '.(($i + 1) * $chunkSize).' records...');
        }

        $this->command->info('Seeding completed successfully!');
    }
}
