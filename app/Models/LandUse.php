<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class LandUse extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'campus_id',
        'category_id',
        'parent_id',
        'code',
        'name',
        'area_size',
        'green_status',
        'condition',
        'geometry',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'area_size' => 'float',
            'geometry' => 'array',
        ];
    }

    public function campus(): BelongsTo
    {
        return $this->belongsTo(Campus::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(LandUseCategory::class, 'category_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(LandUse::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(LandUse::class, 'parent_id');
    }

    public function feedback(): HasMany
    {
        return $this->hasMany(Feedback::class, 'land_use_id');
    }
}
