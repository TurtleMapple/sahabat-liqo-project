<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Announcement extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'content',
        'event_at',
        'file_path',
        'file_type',
    ];

    protected $casts = [
        'event_at' => 'datetime',
    ];

    // Scope untuk pengumuman aktif (event_at <= sekarang)
    public function scopeActive($query)
    {
        return $query->where('event_at', '<=', now());
    }

    // Scope untuk pengumuman expired (event_at < hari ini)
    public function scopeExpired($query)
    {
        return $query->where('event_at', '<', now()->startOfDay());
    }

    // Scope untuk pengumuman scheduled (event_at > hari ini)
    public function scopeScheduled($query)
    {
        return $query->where('event_at', '>', now());
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}