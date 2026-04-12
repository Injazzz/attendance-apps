<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class EmployeeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'employee_code'   => 'EMP-' . $this->faker->unique()->numerify('####'),
            'full_name'       => $this->faker->name(),
            'email'           => $this->faker->unique()->safeEmail(),
            'phone'           => '08' . $this->faker->numerify('#########'),
            'gender'          => $this->faker->randomElement(['male', 'female']),
            'marital_status'  => $this->faker->randomElement(['single', 'married']),
            'tax_status'      => 'TK0',
            'birthdate'       => $this->faker->dateTimeBetween('-50 years', '-22 years'),
            'birthplace'      => $this->faker->city(),
            'hire_date'       => $this->faker->dateTimeBetween('-5 years', 'now'),
            'employment_type' => $this->faker->randomElement(['permanent', 'contract']),
            'status'          => 'active',
        ];
    }

    public function active(): static
    {
        return $this->state(fn() => ['status' => 'active']);
    }

    public function inactive(): static
    {
        return $this->state(fn() => ['status' => 'inactive']);
    }
}
