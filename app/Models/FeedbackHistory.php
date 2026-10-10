<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeedbackHistory extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'feedback_id',
        'user_id',
        'actor_id',
        'feedback_title',
        'action',
        'old_status',
        'new_status',
        'note',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    /** Pemilik feedback */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /** Yang melakukan aksi (admin/pengurus) */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    /** Feedback asli (nullable karena bisa sudah dihapus) */
    public function feedback(): BelongsTo
    {
        return $this->belongsTo(Feedback::class)->withTrashed();
    }
}
