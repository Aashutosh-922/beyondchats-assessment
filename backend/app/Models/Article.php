<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasFactory;

    // ADD THIS PART
    protected $fillable = ['title', 'content', 'source_url', 'image_url'];
}