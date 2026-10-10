<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Campus extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'address',
        'total_area',
        'boundary_geometry',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'total_area' => 'float',
            'boundary_geometry' => 'array',
        ];
    }

    /**
     * All land uses associated with this campus.
     */
    public function landUses(): HasMany
    {
        return $this->hasMany(LandUse::class);
    }
}
