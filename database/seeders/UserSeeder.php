<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@uad.ac.id'],
            [
                'name' => 'Administrator Green Campus',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'pengurus@uad.ac.id'],
            [
                'name' => 'Pengurus Lingkungan Kampus',
                'password' => Hash::make('password'),
                'role' => 'pengurus',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'user@uad.ac.id'],
            [
                'name' => 'Civitas Academica UAD',
                'password' => Hash::make('password'),
                'role' => 'user',
                'email_verified_at' => now(),
            ]
        );
    }
}
