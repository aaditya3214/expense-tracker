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
        // असली लगने वाले कुछ प्रोडक्ट्स के नाम
        $products = [
            'PREMIUM SUGAR 1 KG', 'TATA SALT 1KG', 'AMUL BUTTER 500G', 
            'BRITANNIA GOOD DAY', 'BROOKE BOND RED LABEL', 'PREMIUM BROWN RICE', 
            'AASHIRVAAD ATTA 5KG', 'MAGGI NOODLES', 'FORTUNE SUNFLOWER OIL 1L', 
            'COLGATE TOOTHPASTE', 'SURF EXCEL 1KG', 'DOVE SOAP', 'DETTOL HANDWASH',
            'MILKY MIST PANEER', 'EVEREST GARAM MASALA', 'LAYS CLASSIC SALTED'
        ];

        $units = ['kg', 'g', 'l', 'ml', 'pcs', 'pkt'];

        // 0.100 ग्राम से 5 किलो तक रैंडम वज़न
        $qty = fake()->randomFloat(3, 0.1, 5); 
        // 10 रुपये से 1000 रुपये तक रैंडम रेट
        $rate = fake()->randomFloat(2, 10, 1000);

        return [
            // 70% चांस है कि 4 अंकों का HSN कोड होगा, वरना खाली
            'hsn' => fake()->optional(0.7)->numerify('####'), 
            
            // रैंडम असली प्रोडक्ट का नाम
            'particulars' => fake()->randomElement($products), 
            
            'qty_kg' => $qty,
            'unit' => fake()->randomElement($units), // 👇 नया Unit कॉलम
            'n_rate' => $rate,
            
            // Qty और Rate को गुणा करके असली Total Value बनाना
            'value' => round($qty * $rate, 2),

            // 👇 पिछले 1 साल की कोई भी रैंडम तारीख जनरेट करना 👇
            'created_at' => fake()->dateTimeBetween('-1 year', 'now'), 
            'updated_at' => now(),
        ];
    }
}