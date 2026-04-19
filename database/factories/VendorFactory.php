<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Vendor>
 */
class VendorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->company(),
            'gstin' => fake()->optional()->bothify('##??#?####?#?#?'), // Example GSTIN format
            'contact_number' => fake()->phoneNumber(),
            'address' => fake()->address(),
        ];
    }
}
