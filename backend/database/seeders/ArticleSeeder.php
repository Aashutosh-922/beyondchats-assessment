<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Article;
use Illuminate\Support\Facades\File;

class ArticleSeeder extends Seeder
{
    public function run()
    {
        // Points to storage/app/articles.json
        $path = storage_path('app/articles.json');
        
        if (!File::exists($path)) {
            $this->command->error("File not found at: " . $path);
            return;
        }

        $json = File::get($path);
        $articles = json_decode($json);

        foreach ($articles as $article) {
            Article::create([
                'title' => $article->title,
                'content' => $article->content,
                'source_url' => $article->source_url,
                'image_url' => $article->image_url,
            ]);
        }
    }
}