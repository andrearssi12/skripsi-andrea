<?php

namespace Database\Seeders;

use App\Models\Campus;
use Illuminate\Database\Seeder;

class CampusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. UAD Kampus 4 Utama (Ringroad Selatan)
        Campus::updateOrCreate(
            ['code' => 'KAMPUS-4'],
            [
                'name' => 'UAD Kampus 4 (Utama)',
                'address' => 'Jl. Ringroad Selatan, Tamanan, Banguntapan, Bantul, DIY 55191',
                'total_area' => 52000.00,
                'boundary_geometry' => [
                    'type' => 'Polygon',
                    'coordinates' => [
                        [
                            [110.381200, -7.831500],
                            [110.385500, -7.831500],
                            [110.385500, -7.835000],
                            [110.381200, -7.835000],
                            [110.381200, -7.831500],
                        ],
                    ],
                ],
                'description' => 'Kampus Utama UAD yang menjadi pusat administrasi, rektorat, Islamic Center, Fakultas Kedokteran, MIPA, FTI, FSBK, dan laboratorium terpadu.',
            ]
        );

        // 2. UAD Kampus 1 (Semaki)
        Campus::updateOrCreate(
            ['code' => 'KAMPUS-1'],
            [
                'name' => 'UAD Kampus 1 (Semaki)',
                'address' => 'Jl. Kapas No.9, Semaki, Kec. Umbulharjo, Kota Yogyakarta, DIY 55166',
                'total_area' => 12500.00,
                'boundary_geometry' => [
                    'type' => 'Polygon',
                    'coordinates' => [
                        [
                            [110.388000, -7.798500],
                            [110.390500, -7.798500],
                            [110.390500, -7.800500],
                            [110.388000, -7.800500],
                            [110.388000, -7.798500],
                        ],
                    ],
                ],
                'description' => 'Kampus bersejarah UAD di kawasan Semaki yang menjadi pusat perkantoran Fakultas Keguruan dan Ilmu Pendidikan (FKIP) dan ruang perkuliahan.',
            ]
        );

        // 3. UAD Kampus 2 (Pramuka)
        Campus::updateOrCreate(
            ['code' => 'KAMPUS-2'],
            [
                'name' => 'UAD Kampus 2 (Pramuka)',
                'address' => 'Jl. Pramuka No.42, Pandeyan, Kec. Umbulharjo, Kota Yogyakarta, DIY 55161',
                'total_area' => 8900.00,
                'boundary_geometry' => [
                    'type' => 'Polygon',
                    'coordinates' => [
                        [
                            [110.383000, -7.818000],
                            [110.385500, -7.818000],
                            [110.385500, -7.820000],
                            [110.383000, -7.820000],
                            [110.383000, -7.818000],
                        ],
                    ],
                ],
                'description' => 'Kampus UAD unit 2 yang memfasilitasi program studi pendidikan bahasa dan seni dengan fasilitas taman inner-courtyard dan laboratorium.',
            ]
        );

        // 4. UAD Kampus 3 (Prof. Dr. Soepomo)
        Campus::updateOrCreate(
            ['code' => 'KAMPUS-3'],
            [
                'name' => 'UAD Kampus 3 (Janturan)',
                'address' => 'Jl. Prof. DR. Soepomo Sh, Warungboto, Kec. Umbulharjo, Kota Yogyakarta, DIY 55164',
                'total_area' => 18400.00,
                'boundary_geometry' => [
                    'type' => 'Polygon',
                    'coordinates' => [
                        [
                            [110.387000, -7.809000],
                            [110.390500, -7.809000],
                            [110.390500, -7.812000],
                            [110.387000, -7.812000],
                            [110.387000, -7.809000],
                        ],
                    ],
                ],
                'description' => 'Kampus UAD di Janturan yang menaungi Fakultas Farmasi, Kesehatan Masyarakat, dan Sains Terapan dengan area taman toga (tanaman obat keluarga).',
            ]
        );

        // 5. UAD Kampus 5 (Ki Ageng Pemanahan)
        Campus::updateOrCreate(
            ['code' => 'KAMPUS-5'],
            [
                'name' => 'UAD Kampus 5 (Sorosutan)',
                'address' => 'Jl. Ki Ageng Pemanahan No.19, Sorosutan, Kec. Umbulharjo, Kota Yogyakarta, DIY 55162',
                'total_area' => 7600.00,
                'boundary_geometry' => [
                    'type' => 'Polygon',
                    'coordinates' => [
                        [
                            [110.378000, -7.824000],
                            [110.380500, -7.824000],
                            [110.380500, -7.826000],
                            [110.378000, -7.826000],
                            [110.378000, -7.824000],
                        ],
                    ],
                ],
                'description' => 'Kampus UAD di Sorosutan yang menaungi Fakultas Agama Islam (FAI) dan pusat studi keislaman dengan vegetasi peneduh yang asri.',
            ]
        );
    }
}
