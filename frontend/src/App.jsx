import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH DATA
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/articles')
      .then(response => {
        // Handle Laravel pagination (response.data.data) or simple array
        const data = response.data.data ? response.data.data : response.data;
        setArticles(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="container" style={{textAlign:'center'}}>Loading Articles...</div>;

  return (
    <div className="container">
      <header>
        <h1>BeyondChats Blog</h1>
        <p className="subtitle">Original Scrapes & AI Remasters</p>
      </header>

      <div className="grid">
        {articles.map(article => {
          // Detect if it's an AI Remastered article based on title
          const isRemastered = article.title.includes('(Remastered)');

          return (
            <article key={article.id} className="card">
              <div className="card-image">
                {article.image_url ? (
                  <img src={article.image_url} alt={article.title} />
                ) : (
                  <div style={{height: '100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#9ca3af'}}>
                    No Image
                  </div>
                )}
              </div>
              
              <div className="card-content">
                <span className={`badge ${isRemastered ? 'badge-ai' : 'badge-original'}`}>
                  {isRemastered ? 'AI Enhanced' : 'Original'}
                </span>
                
                <h2>{article.title}</h2>
                
                {/* Simple truncate for preview */}
                <p className="excerpt">
                  {article.content.substring(0, 150)}...
                </p>

                <div className="card-footer">
                  <span className="date">
                    {new Date(article.created_at).toLocaleDateString()}
                  </span>
                  <a 
                    href={article.source_url || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn"
                  >
                    Read Source →
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default App;