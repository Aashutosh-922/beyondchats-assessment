import requests
from bs4 import BeautifulSoup
import json
import time

BASE_URL = "https://beyondchats.com/blogs/"

def get_soup(url):
    response = requests.get(url)
    if response.status_code != 200:
        print(f"Failed to retrieve {url}")
        return None
    return BeautifulSoup(response.text, 'html.parser')

def find_last_page():
    # Start at page 1 and follow 'next' links to find the end
    current_url = BASE_URL
    last_url = current_url
    
    print("Navigating to the last page...")
    
    while True:
        soup = get_soup(current_url)
        if not soup:
            break
            
        # This selector depends on the specific site structure.
        # Based on standard WP/Blog structures, we look for 'Next' pagination links
        # Adjust the class names based on actual inspection of the site if needed.
        next_link = soup.find('a', class_='next') # Common class for next page
        
        # Fallback: sometimes pagination uses page numbers
        if not next_link:
             # Try finding the highest page number link if 'next' isn't obvious
             # For this example, we assume standard 'next' traversal
             break

        current_url = next_link.get('href')
        last_url = current_url
        print(f"Found page: {current_url}")
        time.sleep(1) # Be polite to the server

    return last_url

def scrape_articles(url):
    soup = get_soup(url)
    articles_data = []
    
    # Select article containers. 
    # Note: Class names '.post', '.entry-title' are placeholders. 
    # You may need to Inspect Element on the site to get exact classes.
    articles = soup.select('article') # Generic HTML5 tag often used
    
    if not articles:
        # Fallback for div based layouts
        articles = soup.select('.blog-post') 

    print(f"Found {len(articles)} articles on the last page.")

    for article in articles:
        try:
            title_tag = article.find('h2') or article.find('h3')
            link_tag = article.find('a')
            
            title = title_tag.get_text(strip=True) if title_tag else "No Title"
            link = link_tag.get('href') if link_tag else None
            
            # Simple content extraction (snippet)
            excerpt_tag = article.find('p')
            content = excerpt_tag.get_text(strip=True) if excerpt_tag else ""
            
            # Image URL
            img_tag = article.find('img')
            image_url = img_tag.get('src') if img_tag else None

            articles_data.append({
                "title": title,
                "content": content,
                "source_url": link,
                "image_url": image_url
            })
        except Exception as e:
            print(f"Error parsing article: {e}")

    # Return only the 5 oldest (assuming page order is Newest -> Oldest, 
    # the last 5 on the last page are the oldest of the old).
    return articles_data[-5:] 

if __name__ == "__main__":
    last_page_url = find_last_page()
    print(f"Last page identified: {last_page_url}")
    
    data = scrape_articles(last_page_url)
    
    with open('articles.json', 'w') as f:
        json.dump(data, f, indent=4)
    
    print("Scraping complete. Data saved to articles.json")