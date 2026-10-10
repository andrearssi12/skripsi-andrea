<?php

use App\Models\Campus;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('check:campuses', function () {
    foreach (Campus::all() as $c) {
        $this->info("ID: {$c->id} | Code: {$c->code} | Name: {$c->name} | Geom: " . json_encode($c->boundary_geometry));
    }
});
