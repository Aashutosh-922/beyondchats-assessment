const axios = require('axios');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// 1. CONFIGURATION
const LARAVEL_API = 'http://127.0.0.1:8000/api/articles';
const GEMINI_API_KEY = ''; // <--- PASTE YOUR GOOGLE KEY HERE
const GOOGLE_SEARCH_QUERY_SUFFIX = ' blog';

// Setup Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

puppeteer.use(StealthPlugin());

async function main() {
    try {
        console.log("--- PHASE 2 STARTED (Gemini Version) ---");

        // STEP 1: Fetch from Laravel
        console.log("1. Fetching latest article from Laravel...");
        const response = await axios.get(LARAVEL_API);
        const articles = response.data.data ? response.data.data : response.data;
        
        if (!articles || articles.length === 0) throw new Error("No articles found.");
        const originalArticle = articles[0]; 
        console.log(`   Found: "${originalArticle.title}"`);

        // STEP 2: Google Search (With Fallback)
        console.log(`2. Searching Google for: "${originalArticle.title}"...`);
        let searchResults = [];
        
        try {
            searchResults = await googleSearch(originalArticle.title + GOOGLE_SEARCH_QUERY_SUFFIX);
        } catch (e) {
            console.log("   [Warning] Google search failed. Using fallback URLs.");
        }

        if (searchResults.length < 2) {
            console.log("   Using HARDCODED fallback links to bypass Google blocking...");
            searchResults = [
                "https://chatbotsmagazine.com/the-complete-beginners-guide-to-chatbots-8280b7b906ca",
                "https://www.evozon.com/en/knowledge-center/beginners-guide-to-ai-chatbot-development/"
            ];
        }

        console.log(`   Ref 1: ${searchResults[0]}`);
        console.log(`   Ref 2: ${searchResults[1]}`);

        // STEP 3: Scrape Content
        console.log("3. Scraping external articles...");
        const context1 = await scrapeWithPuppeteer(searchResults[0]);
        const context2 = await scrapeWithPuppeteer(searchResults[1]);
        
        console.log(`   Article 1 length: ${context1.length} chars`);
        console.log(`   Article 2 length: ${context2.length} chars`);

        // STEP 4: LLM Rewrite (Using Gemini)
        console.log("4. Sending to Gemini for rewriting...");
        const prompt = `
            You are an expert editor. 
            ORIGINAL CONTENT:
            ${originalArticle.content}

            REFERENCE 1:
            ${context1.substring(0, 4000)}...

            REFERENCE 2:
            ${context2.substring(0, 4000)}...

            TASK:
            Rewrite the ORIGINAL CONTENT to match the professional tone and depth of the REFERENCES.
            The content should be at least 300 words long.
            
            MANDATORY FOOTER:
            At the bottom, add a section "References":
            1. ${searchResults[0]}
            2. ${searchResults[1]}
        `;

        // Gemini Call
        const result = await model.generateContent(prompt);
        const newContent = result.response.text();
        
        console.log("   Gemini generation complete.");

        // STEP 5: Publish
        console.log("5. Publishing to Laravel...");
        await axios.post(LARAVEL_API, {
            title: originalArticle.title + " (Remastered)",
            content: newContent,
            source_url: originalArticle.source_url,
            image_url: originalArticle.image_url
        });

        console.log("--- SUCCESS: Article Processed and Uploaded! ---");

    } catch (error) {
        console.error("ERROR:", error.message);
        if (error.response) console.error("API Response:", error.response.data);
    }
}

// Search Function
async function googleSearch(query) {
    const browser = await puppeteer.launch({ headless: false }); 
    const page = await browser.newPage();
    await page.goto('https://www.google.com/search?q=' + encodeURIComponent(query), { waitUntil: 'domcontentloaded', timeout: 30000 });

    try {
        await page.waitForSelector('#search', { timeout: 10000 });
    } catch (e) { }

    const links = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a'));
        return anchors
            .map(a => a.href)
            .filter(href => href && href.startsWith('http') && !href.includes('google') && !href.includes('beyondchats'))
            .slice(0, 2);
    });

    await browser.close();
    return links;
}

// Scraper Function
async function scrapeWithPuppeteer(url) {
    try {
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        
        // 1. Block heavy resources to speed up loading
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const resourceType = req.resourceType();
            if(['image', 'stylesheet', 'font', 'media', 'other'].includes(resourceType)){
                req.abort();
            } else {
                req.continue();
            }
        });

        // 2. Increase timeout to 90 seconds (90000ms)
        // 3. Use 'domcontentloaded' which fires sooner than 'networkidle'
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
        
        const content = await page.content();
        const dom = new JSDOM(content, { url });
        const reader = new Readability(dom.window.document);
        const article = reader.parse();
        
        await browser.close();
        return article ? article.textContent : "Content unavailable";
    } catch (e) {
        console.log(`   [Error] Failed to scrape ${url}: ${e.message}`);
        return "Content unavailable";
    }
}

main();