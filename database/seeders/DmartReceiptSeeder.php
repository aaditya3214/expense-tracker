<?php

namespace Database\Seeders;

use App\Models\DmartReceipt;
use App\Models\User;
use Illuminate\Database\Seeder;

class DmartReceiptSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find the specific user Aaditya Kushwaha
        $user = User::where('name', 'like', '%Aaditya%')->first();

        // Ensure no previous data for this specific run (optional, but requested to create 90 fresh ones)
        if ($user) {
            DmartReceipt::where('user_id', $user->id)->delete();

            // Running 10,000 creations in chunks to avoid maxing out memory
            for ($i = 0; $i < 10; $i++) {
                DmartReceipt::factory()->count(1000)->create([
                    'user_id' => $user->id,
                ]);
            }
        }
    }
}
