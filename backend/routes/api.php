<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ArticleController;

// This single line creates all routes: GET, POST, PUT, DELETE
Route::apiResource('articles', ArticleController::class);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});