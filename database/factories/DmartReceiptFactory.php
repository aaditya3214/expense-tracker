<?php

namespace Database\Factories;

use App\Models\DmartReceipt;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DmartReceipt>
 */
class DmartReceiptFactory extends Factory
{
    protected $model = DmartReceipt::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $products = [
            'PREMIUM SUGAR 1 KG', 'TATA SALT 1KG', 'AMUL BUTTER 500G', 'BRITANNIA GOOD DAY',
            'BROOKE BOND RED LABEL', 'PREMIUM BROWN RICE', 'AASHIRVAAD ATTA 5KG', 'MAGGI NOODLES',
            'FORTUNE SUNFLOWER OIL 1L', 'COLGATE TOOTHPASTE', 'SURF EXCEL 1KG', 'DOVE SOAP',
            'DETTOL HANDWASH', 'MILKY MIST PANEER', 'EVEREST GARAM MASALA', 'LAYS CLASSIC SALTED',
            'DAAWAT BASMATI RICE', 'PARLE-G 200G', 'NESCAFE CLASSIC 100G', 'BOURNVITA 500G',
            'CADBURY DAIRY MILK', 'PEPSODENT TOOTHBRUSH', 'KISSAN TOMATO KETCHUP', 'VIM BAR 200G',
            'TIDE DETERGENT 2KG', 'HARPIC CLEANER', 'COLGATE MOUTHWASH', 'LUX SOAP 3X125G',
            'PANTENE SHAMPOO', 'GILLETTE SHAVING CREAM', 'WAGH BAKRI TEA 1KG', 'AMUL TAZA MILK 1L',
            'CHAKKI FRESH ATTA 10KG', 'SURAJ MUSTARD OIL 1L', 'MTR JAMUN MIX', 'BINGO CHIPS',
            'OREO BISCUITS', 'SQUARE NOTEBOOK', 'NATRAJ PENCILS', 'A4 PAPER PACK',
            'USB CABLE 1M', 'DURACELL BATTERY AA', 'LIZOL DISINFECTANT', 'LIFEBUOY HAND WASH',
        ];

        $units = ['kg', 'g', 'l', 'ml', 'pcs', 'pkt'];
        $vendors = [
            'DMart', 'Big Bazaar', 'Reliance Smart', 'Reliance Fresh', 'Blinkit', 'Zepto',
            'Swiggy Instamart', 'Star Bazaar', 'Nature\'s Basket', 'Spencer\'s', 'Amazon',
            'Flipkart', 'BigBasket', 'Milk Basket', 'Dunzo', 'Local Kirana Store', 'Apollo Pharmacy',
        ];

        $qty = fake()->randomFloat(3, 0.1, 10);
        $rate = fake()->randomFloat(2, 5, 2500);

        return [
            'user_id' => 1, // Default, usually overridden in seeder
            'hsn' => fake()->optional(0.8)->numerify('####'),
            'particulars' => fake()->randomElement($products),
            'qty_kg' => $qty,
            'unit' => fake()->randomElement($units),
            'n_rate' => $rate,
            'value' => round($qty * $rate, 2),
            'vendor' => fake()->randomElement($vendors),
            'created_at' => fake()->dateTimeBetween('-4 months', 'now'),
            'updated_at' => now(),
        ];
    }
}
