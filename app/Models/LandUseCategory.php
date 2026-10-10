<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LandUseCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'color',
        'icon',
        'description',
    ];

    /**
     * Land uses belonging to this category.
     */
    public function landUses(): HasMany
    {
        return $this->hasMany(LandUse::class, 'category_id');
    }
}
