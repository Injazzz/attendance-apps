<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'employee_id'           => null,
            'name'                  => $this->faker->name(),
            'username'              => $this->faker->unique()->userName(),
            'email'                 => $this->faker->unique()->safeEmail(),
            'email_verified_at'     => now(),
            'password'              => Hash::make('password'),
            'role'                  => 'employee',
            'is_active'             => true,
            'failed_login_attempts' => 0,
            'remember_token'        => Str::random(10),
        ];
    }

    public function superAdmin(): static
    {
        return $this->state(fn() => ['role' => 'super_admin']);
    }

    public function admin(): static
    {
        return $this->state(fn() => ['role' => 'admin']);
    }

    public function hrd(): static
    {
        return $this->state(fn() => ['role' => 'hrd']);
    }

    public function inactive(): static
    {
        return $this->state(fn() => ['is_active' => false]);
    }

    public function locked(): static
    {
        return $this->state(fn() => [
            'failed_login_attempts' => 5,
            'locked_until'          => now()->addMinutes(30),
        ]);
    }
}
