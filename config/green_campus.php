<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Target Green Area Percentage
    |--------------------------------------------------------------------------
    |
    | Target persentase kawasan hijau terhadap total luas kampus (Green Campus).
    | Standar penelitian Green Campus: 30%.
    |
    */
    'target_green_percentage' => (float) env('TARGET_GREEN_PERCENTAGE', 30.0),

    /*
    |--------------------------------------------------------------------------
    | Green Status Options
    |--------------------------------------------------------------------------
    */
    'green_statuses' => [
        'Green Area',
        'Vegetasi Non-RTH',
        'Non-Green Area',
    ],

    /*
    |--------------------------------------------------------------------------
    | Condition Options
    |--------------------------------------------------------------------------
    */
    'conditions' => [
        'Baik',
        'Sedang',
        'Kurang',
    ],

    /*
    |--------------------------------------------------------------------------
    | Feedback Status Options
    |--------------------------------------------------------------------------
    */
    'feedback_statuses' => [
        'Menunggu',
        'Diproses',
        'Selesai',
    ],
];
