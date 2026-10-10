<?php

namespace Database\Seeders;

use App\Models\Campus;
use App\Models\LandUse;
use App\Models\LandUseCategory;
use Illuminate\Database\Seeder;

class LandUseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = LandUseCategory::all()->keyBy('name');

        // ==========================================
        // 1. KAMPUS 4 (Utama)
        // ==========================================
        $k4 = Campus::where('code', 'KAMPUS-4')->first();
        if ($k4) {
            // Gedung Rektorat
            LandUse::updateOrCreate(
                ['code' => 'K4-BLD-01'],
                [
                    'campus_id' => $k4->id,
                    'category_id' => $categories['Bangunan']->id,
                    'name' => 'Gedung Utama Rektorat UAD',
                    'area_size' => 4500.00,
                    'green_status' => 'Non-Green Area',
                    'condition' => 'Baik',
                    'geometry' => [
                        'type' => 'Polygon',
                        'coordinates' => [
                            [
                                [110.382000, -7.832000],
                                [110.383200, -7.832000],
                                [110.383200, -7.832800],
                                [110.382000, -7.832800],
                                [110.382000, -7.832000],
                            ],
                        ],
                    ],
                    'description' => 'Gedung utama 10 lantai pusat administrasi dan rektorat UAD.',
                ]
            );

            // Islamic Center
            LandUse::updateOrCreate(
                ['code' => 'K4-BLD-02'],
                [
                    'campus_id' => $k4->id,
                    'category_id' => $categories['Bangunan']->id,
                    'name' => 'Masjid Islamic Center UAD',
                    'area_size' => 2800.00,
                    'green_status' => 'Non-Green Area',
                    'condition' => 'Baik',
                    'geometry' => [
                        'type' => 'Polygon',
                        'coordinates' => [
                            [
                                [110.383600, -7.832000],
                                [110.384600, -7.832000],
                                [110.384600, -7.832800],
                                [110.383600, -7.832800],
                                [110.383600, -7.832000],
                            ],
                        ],
                    ],
                    'description' => 'Masjid utama kampus 4 tempat ibadah civitas dan kegiatan keislaman.',
                ]
            );

            // Gedung FK
            LandUse::updateOrCreate(
                ['code' => 'K4-BLD-03'],
                [
                    'campus_id' => $k4->id,
                    'category_id' => $categories['Bangunan']->id,
                    'name' => 'Gedung Fakultas Kedokteran',
                    'area_size' => 3200.00,
                    'green_status' => 'Non-Green Area',
                    'condition' => 'Baik',
                    'geometry' => [
                        'type' => 'Polygon',
                        'coordinates' => [
                            [
                                [110.382000, -7.833800],
                                [110.383200, -7.833800],
                                [110.383200, -7.834600],
                                [110.382000, -7.834600],
                                [110.382000, -7.833800],
                            ],
                        ],
                    ],
                    'description' => 'Gedung perkuliahan dan laboratorium Fakultas Kedokteran.',
                ]
            );

            // Parkiran Barat
            $parkiranBarat = LandUse::updateOrCreate(
                ['code' => 'K4-PKG-01'],
                [
                    'campus_id' => $k4->id,
                    'category_id' => $categories['Parkiran']->id,
                    'name' => 'Parkiran Barat Mobil',
                    'area_size' => 3500.00,
                    'green_status' => 'Non-Green Area',
                    'condition' => 'Baik',
                    'geometry' => [
                        'type' => 'Polygon',
                        'coordinates' => [
                            [
                                [110.381300, -7.832000],
                                [110.381900, -7.832000],
                                [110.381900, -7.834000],
                                [110.381300, -7.834000],
                                [110.381300, -7.832000],
                            ],
                        ],
                    ],
                    'description' => 'Area parkir mobil sebelah barat gedung utama.',
                ]
            );

            // Vegetasi Parkiran Barat (Child)
            LandUse::updateOrCreate(
                ['code' => 'K4-VEG-01'],
                [
                    'campus_id' => $k4->id,
                    'category_id' => $categories['Vegetasi']->id,
                    'parent_id' => $parkiranBarat->id,
                    'name' => 'Vegetasi Peneduh Parkiran Barat',
                    'area_size' => 450.00,
                    'green_status' => 'Vegetasi Non-RTH',
                    'condition' => 'Baik',
                    'geometry' => [
                        'type' => 'Polygon',
                        'coordinates' => [
                            [
                                [110.381400, -7.832200],
                                [110.381600, -7.832200],
                                [110.381600, -7.833500],
                                [110.381400, -7.833500],
                                [110.381400, -7.832200],
                            ],
                        ],
                    ],
                    'description' => 'Pohon trembesi dan peneduh di pulau parkiran barat.',
                ]
            );

            // Parkiran Timur
            LandUse::updateOrCreate(
                ['code' => 'K4-PKG-02'],
                [
                    'campus_id' => $k4->id,
                    'category_id' => $categories['Parkiran']->id,
                    'name' => 'Parkiran Timur Motor Mahasiswa',
                    'area_size' => 2800.00,
                    'green_status' => 'Non-Green Area',
                    'condition' => 'Sedang',
                    'geometry' => [
                        'type' => 'Polygon',
                        'coordinates' => [
                            [
                                [110.384800, -7.832000],
                                [110.385400, -7.832000],
                                [110.385400, -7.834000],
                                [110.384800, -7.834000],
                                [110.384800, -7.832000],
                            ],
                        ],
                    ],
                    'description' => 'Kawasan parkir khusus kendaraan roda dua mahasiswa.',
                ]
            );

            // Taman Tengah Kampus
            LandUse::updateOrCreate(
                ['code' => 'K4-GRN-01'],
                [
                    'campus_id' => $k4->id,
                    'category_id' => $categories['Taman']->id,
                    'name' => 'Taman Tengah Kampus Utama',
                    'area_size' => 3800.00,
                    'green_status' => 'Green Area',
                    'condition' => 'Baik',
                    'geometry' => [
                        'type' => 'Polygon',
                        'coordinates' => [
                            [
                                [110.382200, -7.833000],
                                [110.383500, -7.833000],
                                [110.383500, -7.833600],
                                [110.382200, -7.833600],
                                [110.382200, -7.833000],
                            ],
                        ],
                    ],
                    'description' => 'Taman asri di tengah kampus dengan tanaman peneduh, bangku taman, dan kolam bio-retensi.',
                ]
            );

            // Hamparan Rumput
            LandUse::updateOrCreate(
                ['code' => 'K4-GRN-02'],
                [
                    'campus_id' => $k4->id,
                    'category_id' => $categories['Rumput']->id,
                    'name' => 'Hamparan Rumput Depan Islamic Center',
                    'area_size' => 4200.00,
                    'green_status' => 'Green Area',
                    'condition' => 'Baik',
                    'geometry' => [
                        'type' => 'Polygon',
                        'coordinates' => [
                            [
                                [110.383700, -7.833000],
                                [110.384600, -7.833000],
                                [110.384600, -7.833600],
                                [110.383700, -7.833600],
                                [110.383700, -7.833000],
                            ],
                        ],
                    ],
                    'description' => 'Area rumput terbuka sebagai ruang serapan air hujan dan ruang interaksi civitas.',
                ]
            );

            // Jalur Hijau Boulevard
            LandUse::updateOrCreate(
                ['code' => 'K4-GRN-03'],
                [
                    'campus_id' => $k4->id,
                    'category_id' => $categories['Jalur Hijau']->id,
                    'name' => 'Jalur Hijau Boulevard Kampus',
                    'area_size' => 3100.00,
                    'green_status' => 'Green Area',
                    'condition' => 'Baik',
                    'geometry' => [
                        'type' => 'Polygon',
                        'coordinates' => [
                            [
                                [110.381300, -7.831600],
                                [110.385400, -7.831600],
                                [110.385400, -7.831900],
                                [110.381300, -7.831900],
                                [110.381300, -7.831600],
                            ],
                        ],
                    ],
                    'description' => 'Jalur hijau perindang di sepanjang koridor utama masuk kampus.',
                ]
            );

            // Kebun Botani Farmasi
            LandUse::updateOrCreate(
                ['code' => 'K4-GRN-04'],
                [
                    'campus_id' => $k4->id,
                    'category_id' => $categories['Kebun']->id,
                    'name' => 'Kebun Botani & Tanaman Obat Farmasi UAD',
                    'area_size' => 2800.00,
                    'green_status' => 'Green Area',
                    'condition' => 'Baik',
                    'geometry' => [
                        'type' => 'Polygon',
                        'coordinates' => [
                            [
                                [110.383600, -7.833800],
                                [110.384600, -7.833800],
                                [110.384600, -7.834600],
                                [110.383600, -7.834600],
                                [110.383600, -7.833800],
                            ],
                        ],
                    ],
                    'description' => 'Kebun percontohan tanaman herbal dan keanekaragaman hayati Fakultas Farmasi.',
                ]
            );

            // Taman Selatan
            LandUse::updateOrCreate(
                ['code' => 'K4-GRN-05'],
                [
                    'campus_id' => $k4->id,
                    'category_id' => $categories['Taman']->id,
                    'name' => 'Taman Selatan Belakang FK',
                    'area_size' => 2600.00,
                    'green_status' => 'Green Area',
                    'condition' => 'Sedang',
                    'geometry' => [
                        'type' => 'Polygon',
                        'coordinates' => [
                            [
                                [110.382000, -7.834700],
                                [110.384500, -7.834700],
                                [110.384500, -7.834950],
                                [110.382000, -7.834950],
                                [110.382000, -7.834700],
                            ],
                        ],
                    ],
                    'description' => 'Taman pembatas di sisi selatan kampus yang membutuhkan perawatan tanaman berkala.',
                ]
            );

            // Lapangan Olahraga
            LandUse::updateOrCreate(
                ['code' => 'K4-FLD-01'],
                [
                    'campus_id' => $k4->id,
                    'category_id' => $categories['Lapangan']->id,
                    'name' => 'Lapangan Olahraga Multi-Fungsi',
                    'area_size' => 3200.00,
                    'green_status' => 'Non-Green Area',
                    'condition' => 'Baik',
                    'geometry' => [
                        'type' => 'Polygon',
                        'coordinates' => [
                            [
                                [110.384800, -7.834100],
                                [110.385400, -7.834100],
                                [110.385400, -7.834950],
                                [110.384800, -7.834950],
                                [110.384800, -7.834100],
                            ],
                        ],
                    ],
                    'description' => 'Fasilitas lapangan basket, voli, dan futsal outdoor civitas.',
                ]
            );
        }

        // ==========================================
        // 2. KAMPUS 1 (Semaki)
        // ==========================================
        $k1 = Campus::where('code', 'KAMPUS-1')->first();
        if ($k1) {
            LandUse::updateOrCreate(
                ['code' => 'K1-BLD-01'],
                [
                    'campus_id' => $k1->id,
                    'category_id' => $categories['Bangunan']->id,
                    'name' => 'Gedung Perkuliahan FKIP Semaki',
                    'area_size' => 4800.00,
                    'green_status' => 'Non-Green Area',
                    'condition' => 'Baik',
                    'geometry' => [
                        'type' => 'Polygon',
                        'coordinates' => [
                            [
                                [110.388200, -7.798700],
                                [110.389800, -7.798700],
                                [110.389800, -7.799600],
                                [110.388200, -7.799600],
                                [110.388200, -7.798700],
                            ],
                        ],
                    ],
                    'description' => 'Gedung kuliah dan kantor dekanat FKIP Kampus 1.',
                ]
            );

            LandUse::updateOrCreate(
                ['code' => 'K1-GRN-01'],
                [
                    'campus_id' => $k1->id,
                    'category_id' => $categories['Taman']->id,
                    'name' => 'Taman Plaza FKIP Semaki',
                    'area_size' => 2400.00,
                    'green_status' => 'Green Area',
                    'condition' => 'Baik',
                    'geometry' => [
                        'type' => 'Polygon',
                        'coordinates' => [
                            [
                                [110.388500, -7.799700],
                                [110.390000, -7.799700],
                                [110.390000, -7.800300],
                                [110.388500, -7.800300],
                                [110.388500, -7.799700],
                            ],
                        ],
                    ],
                    'description' => 'Ruang terbuka hijau interaktif dengan gazebo belajar.',
                ]
            );
        }

        // ==========================================
        // 3. KAMPUS 3 (Janturan / Soepomo)
        // ==========================================
        $k3 = Campus::where('code', 'KAMPUS-3')->first();
        if ($k3) {
            LandUse::updateOrCreate(
                ['code' => 'K3-BLD-01'],
                [
                    'campus_id' => $k3->id,
                    'category_id' => $categories['Bangunan']->id,
                    'name' => 'Gedung Laboratorium Farmasi & FKM',
                    'area_size' => 6200.00,
                    'green_status' => 'Non-Green Area',
                    'condition' => 'Baik',
                    'geometry' => [
                        'type' => 'Polygon',
                        'coordinates' => [
                            [
                                [110.387200, -7.809300],
                                [110.389200, -7.809300],
                                [110.389200, -7.810500],
                                [110.387200, -7.810500],
                                [110.387200, -7.809300],
                            ],
                        ],
                    ],
                    'description' => 'Pusat riset sains terapan dan farmasi.',
                ]
            );

            LandUse::updateOrCreate(
                ['code' => 'K3-GRN-01'],
                [
                    'campus_id' => $k3->id,
                    'category_id' => $categories['Kebun']->id,
                    'name' => 'Taman Toga Herbal Janturan',
                    'area_size' => 3800.00,
                    'green_status' => 'Green Area',
                    'condition' => 'Baik',
                    'geometry' => [
                        'type' => 'Polygon',
                        'coordinates' => [
                            [
                                [110.387500, -7.810700],
                                [110.389800, -7.810700],
                                [110.389800, -7.811800],
                                [110.387500, -7.811800],
                                [110.387500, -7.810700],
                            ],
                        ],
                    ],
                    'description' => 'Taman tanaman obat keluarga dan ruang hijau terbuka.',
                ]
            );
        }
    }
}
