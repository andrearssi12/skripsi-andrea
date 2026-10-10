<?php

namespace Database\Seeders;

use App\Models\LandUseCategory;
use Illuminate\Database\Seeder;

class LandUseCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Bangunan',
                'color' => '#64748b', // Slate
                'icon' => 'building-2',
                'description' => 'Fasilitas gedung perkuliahan, laboratorium, dan rektorat.',
            ],
            [
                'name' => 'Parkiran',
                'color' => '#f59e0b', // Amber
                'icon' => 'car',
                'description' => 'Area parkir kendaraan roda 2 dan roda 4.',
            ],
            [
                'name' => 'Jalan',
                'color' => '#475569', // Dark Slate
                'icon' => 'milestone',
                'description' => 'Akses jalan sirkulasi internal dan pedestrian.',
            ],
            [
                'name' => 'Lapangan',
                'color' => '#0284c7', // Sky Blue
                'icon' => 'target',
                'description' => 'Lapangan olahraga dan upacara.',
            ],
            [
                'name' => 'Taman',
                'color' => '#10b981', // Emerald
                'icon' => 'trees',
                'description' => 'Taman kampus berpohon dan tanaman hias tertata.',
            ],
            [
                'name' => 'Rumput',
                'color' => '#22c55e', // Green
                'icon' => 'sprout',
                'description' => 'Hamparan rumput terbuka kampus.',
            ],
            [
                'name' => 'Jalur Hijau',
                'color' => '#16a34a', // Dark Green
                'icon' => 'leaf',
                'description' => 'Jalur vegetasi di sepanjang koridor jalan kampus.',
            ],
            [
                'name' => 'Kebun',
                'color' => '#059669', // Deep Emerald
                'icon' => 'flower-2',
                'description' => 'Kebun botani dan kebun percontohan penelitian.',
            ],
            [
                'name' => 'Vegetasi',
                'color' => '#84cc16', // Lime
                'icon' => 'tree-pine',
                'description' => 'Kluster vegetasi perindang dan tanaman peneduh.',
            ],
            [
                'name' => 'Lainnya',
                'color' => '#8b5cf6', // Violet
                'icon' => 'shapes',
                'description' => 'Objek penggunaan lahan lainnya.',
            ],
        ];

        foreach ($categories as $category) {
            LandUseCategory::firstOrCreate(
                ['name' => $category['name']],
                $category
            );
        }
    }
}
