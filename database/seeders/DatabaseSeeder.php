<?php

namespace Database\Seeders;

use App\Models\Feedback;
use App\Models\LandUse;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            LandUseCategorySeeder::class,
            CampusSeeder::class,
            LandUseSeeder::class,
        ]);

        // Add sample feedback
        $user = User::where('role', 'user')->first();
        $tamanSelatan = LandUse::where('code', 'K4-GRN-05')->first();

        if ($user && $tamanSelatan) {
            Feedback::firstOrCreate(
                ['title' => 'Tanaman di Taman Selatan Membutuhkan Penyiraman Rutin'],
                [
                    'land_use_id' => $tamanSelatan->id,
                    'user_id' => $user->id,
                    'message' => 'Sebagian tanaman hias di area taman pembatas sisi selatan terlihat mulai mengering pada musim kemarau ini dan membutuhkan penambahan jadwal penyiraman.',
                    'status' => 'Diproses',
                ]
            );

            Feedback::firstOrCreate(
                ['title' => 'Usulan Penambahan Tempat Sampah Organik di Taman Tengah'],
                [
                    'land_use_id' => LandUse::where('code', 'K4-GRN-01')->value('id'),
                    'user_id' => $user->id,
                    'message' => 'Disarankan untuk menambah tempat sampah pilah (organik/anorganik) di sekitar gazebo taman tengah kampus.',
                    'status' => 'Menunggu',
                ]
            );
        }
    }
}
