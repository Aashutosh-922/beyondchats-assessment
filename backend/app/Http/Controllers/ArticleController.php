<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    // GET /api/articles
    public function index()
    {
        // Sort by newest first so you see the generated article at the top
        return response()->json(Article::orderBy('id', 'desc')->paginate(5));
    }

    // POST /api/articles (THIS WAS MISSING)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
            'source_url' => 'nullable|string',
            'image_url' => 'nullable|string',
        ]);

        $article = Article::create($validated);
        return response()->json($article, 201);
    }

    // GET /api/articles/{id}
    public function show($id)
    {
        $article = Article::find($id);
        if (!$article) {
            return response()->json(['message' => 'Article not found'], 404);
        }
        return response()->json($article);
    }
}