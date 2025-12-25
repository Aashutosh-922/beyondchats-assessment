# BeyondChats Assessment - Full Stack AI Content Pipeline

This monolithic repository contains a 3-phase project implementing an automated AI content generation pipeline.

## 📂 Project Structure

* **`scraper.py`**: Python script to scrape initial articles from BeyondChats.
* **`backend/`**: Laravel API (MySQL/SQLite) to store and serve articles.
* **`ai-worker/`**: Node.js worker that researches topics via Google, scrapes context, and rewrites content using Google Gemini AI.
* **`frontend/`**: React (Vite) dashboard to view Original vs. Remastered articles.

## 📊 Architecture & Data Flow


1. **Python Scraper** scrapes the web and saves data to JSON.
2. **Laravel Backend** seeds this data into a SQLite/MySQL database.
3. **Node.js Worker** fetches the latest article from Laravel.
4. **Puppeteer** searches Google and scrapes external blog context.
5. **Google Gemini AI** rewrites the article based on the scraped context.
6. **Node.js Worker** posts the new "Remastered" article back to Laravel.
7. **React Frontend** displays the Original vs. Remastered articles in a grid.

## 🚀 Live Demo
* **Status:** Local Setup Only
* **Note:** Due to the complex nature of the backend (requiring Python for scraping, PHP/Laravel for the API, and a Node.js Headless Browser for the AI Worker), this project is designed to be run locally. Please refer to the **Local Setup Instructions** below to spin up the full stack in minutes.

---

## 🛠️ Local Setup Instructions

### 1. Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
touch database/database.sqlite
# Edit .env to set DB_CONNECTION=sqlite
php artisan migrate
php artisan db:seed --class=ArticleSeeder
php artisan serve
```

### 2. AI Worker (Node.js)
```bash
cd ai-worker
npm install
# Ensure GEMINI_API_KEY is set in worker.js
node worker.js
```

### 3. Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

## 📊 Architecture & Data Flow

```mermaid
graph TD
    User((User))
    subgraph Frontend
    A[React Dashboard]
    end
    
    subgraph Backend
    B[Laravel API]
    C[(SQLite Database)]
    end
    
    subgraph "AI Worker"
    D[Node.js Script]
    E[Puppeteer Scraper]
    F[Google Gemini API]
    end
    
    subgraph "Initial Setup"
    G[Python Scraper]
    end

    G -->|Seeds Data| B
    B <-->|Read/Write| C
    User -->|Views| A
    A -->|Fetches JSON| B
    D -->|1. Gets Article| B
    D -->|2. Search & Scrape| E
    E -->|3. Context| D
    D -->|4. Rewrites| F
    D -->|5. Updates DB| B