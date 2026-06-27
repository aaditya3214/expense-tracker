<?php

use App\Models\User;

test('guest cannot bulk save expenses', function () {
    $response = $this->post(route('expenses.store-bulk'), [
        'items' => [
            [
                'purchased_at' => '2026-06-27',
                'hsn' => '123456',
                'particulars' => 'Tomato',
                'qty_kg' => 1.5,
                'unit' => 'kg',
                'n_rate' => 40.0,
                'value' => 60.0,
                'vendor' => 'DMart',
            ],
        ],
    ]);

    $response->assertRedirect(route('login'));
});

test('authenticated user can bulk save expenses and vendor is automatically registered', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    expect($user->receipts()->count())->toBe(0);
    expect($user->vendors()->where('name', 'DMart')->exists())->toBeFalse();

    $response = $this->post(route('expenses.store-bulk'), [
        'items' => [
            [
                'purchased_at' => '2026-06-27',
                'hsn' => '123456',
                'particulars' => 'Tomato',
                'qty_kg' => 1.5,
                'unit' => 'kg',
                'n_rate' => 40.0,
                'value' => 60.0,
                'vendor' => 'DMart',
            ],
            [
                'purchased_at' => '2026-06-27',
                'hsn' => '789012',
                'particulars' => 'Milk 1L',
                'qty_kg' => 2,
                'unit' => 'pcs',
                'n_rate' => 60.0,
                'value' => 120.0,
                'vendor' => 'Star Bazaar',
            ],
        ],
    ]);

    $response->assertRedirect(route('expenses.index'));

    expect($user->receipts()->count())->toBe(2);

    // Verify the data stored correctly
    $tomato = $user->receipts()->where('particulars', 'Tomato')->first();
    expect($tomato)->not->toBeNull();
    expect((float) $tomato->qty_kg)->toBe(1.5);
    expect((float) $tomato->value)->toBe(60.0);
    expect($tomato->vendor)->toBe('DMart');

    $milk = $user->receipts()->where('particulars', 'Milk 1L')->first();
    expect($milk)->not->toBeNull();
    expect((float) $milk->qty_kg)->toBe(2.0);
    expect((float) $milk->value)->toBe(120.0);
    expect($milk->vendor)->toBe('Star Bazaar');

    // Check if vendors are created
    expect($user->vendors()->where('name', 'DMart')->exists())->toBeTrue();
    expect($user->vendors()->where('name', 'Star Bazaar')->exists())->toBeTrue();
});

test('bulk save fails validation if required fields are missing', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->post(route('expenses.store-bulk'), [
        'items' => [
            [
                // Missing particulars and value
                'purchased_at' => '2026-06-27',
                'qty_kg' => 1.5,
                'unit' => 'kg',
                'n_rate' => 40.0,
                'vendor' => 'DMart',
            ],
        ],
    ]);

    $response->assertSessionHasErrors(['items.0.particulars', 'items.0.value']);
    expect($user->receipts()->count())->toBe(0);
});
