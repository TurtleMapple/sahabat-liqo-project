<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Mentee extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'group_id',
        'full_name',
        'gender',
        'nickname',
        'birth_date',
        'phone_number',
        'activity_class',
        'hobby',
        'address',
        'status',
    ];

    public function group()
    {
        return $this->belongsTo(Group::class);
    }

    public function menteeGroupHistories()
    {
        return $this->hasMany(MenteeGroupHistory::class);
    }
}