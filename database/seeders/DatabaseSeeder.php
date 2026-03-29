<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\DmartReceipt;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 👇 यह कोड ठीक 500 डमी डेटा बनाएगा 👇
        DmartReceipt::factory(500)->create();

        // अगर यह यूज़र पहले से मौजूद नहीं है, तभी इसे बनाएगा (ताकि एरर न आए)
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password') // डिफ़ॉल्ट पासवर्ड
            ]
        );
    }
}