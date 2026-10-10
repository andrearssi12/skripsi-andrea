<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CampusSpatialPlan extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'campus_spatial_plans';

    protected $fillable = [
        'campus_id',
        'land_use_id',
        'geometry',
        'title',
        'pillar_type',
        'description',
        'target_year',
        'area_size',
        'potential_gain_percent',
        'status',
        'approved_by',
        'approved_at',
        'notes',
    ];

    protected $casts = [
        'area_size' => 'float',
        'potential_gain_percent' => 'float',
        'approved_at' => 'datetime',
        'geometry' => 'array',
    ];

    /**
     * Get effective geometry (custom geometry if set, fallback to associated landUse geometry)
     */
    public function getEffectiveGeometryAttribute(): ?array
    {
        if (!empty($this->geometry)) {
            return is_string($this->geometry) ? json_decode($this->geometry, true) : $this->geometry;
        }

        $lu = $this->landUse;
        if ($lu && !empty($lu->geometry)) {
            $g = $lu->geometry;
            return is_string($g) ? json_decode($g, true) : $g;
        }

        return null;
    }

    public function campus(): BelongsTo
    {
        return $this->belongsTo(Campus::class);
    }

    public function landUse(): BelongsTo
    {
        return $this->belongsTo(LandUse::class);
    }

    public function approvedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeForCampus($query, $campusId)
    {
        return $query->where('campus_id', $campusId);
    }
}
