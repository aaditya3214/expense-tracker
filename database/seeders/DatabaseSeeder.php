<?php

namespace Database\Seeders;

use App\Models\DmartReceipt;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Get or create the main user
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Aaditya Kushwaha',
                'password' => bcrypt('password'),
            ]
        );

        // 2. Clear all old receipts to provide a fresh environment
        DmartReceipt::truncate();

        // 3. Create 10,000 records for this user
        $this->command->info('Creating 10,000 realistic records... (This might take a few seconds)');
        DmartReceipt::factory(10000)->create([
            'user_id' => $user->id,
        ]);
        $this->command->info('Done! 10,000 records successfully generated.');
    }
}
