import {useState, useEffect} from 'react';

const fetchNews = async () => {
  console.log("fetching news...");
  const url = 'https://newsapi.org/v2/everything?' +
              'q=Tennis&' +
              'from=2024-09-24&' +
              'pageSize=18&' +
              'sortBy=popularity&' +
              'apiKey='; // Replace with your actual API key

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
    return data.articles; // Return the articles array
  } catch (error) {
    console.error("Error fetching news:", error);
  }
};


const NewsCards = ({ newsContent }) => {
  return ( 
    <div className = "card p-10 max-w-1/4">
                <h5 className = "card-title text-xl font-bold mb-2">{newsContent.title}</h5>
                <p className = "card-text">
                    {newsContent.content}
                </p>
                <button className = "btn btn-primary">Read More</button>
                </div>
  )
                
};

function News() {
  const [newsArticles, setNewsArticles] = useState([]);

  useEffect(() => {
    const getNews = async () => {
      const articles = await fetchNews();
      setNewsArticles(articles);
    };
    getNews();
  }, []);

  return (
    <>
      <div className = "main-container flex w-full p-10">
      <div className="recent-news flex flex-col w-3/4 gap-3 p-8">
        {/* Recent News Header */}
        <div>
          <h2>Recent News</h2>
        </div>

        {/* Recent News Cards Main Container */}
        {/* <div className="all-news-cards grid grid-cols-3 gap-5">
          {newsArticles.map((article, index) => (
            <NewsCards key={index} newsContent={article} />
          ))}
        </div> */}
        
      </div>

        {/* Upcoming Tournaments */}
        <div className = "upcoming-tournaments flex flex-col gap-3 p-8">
            <div className = "leaderboard container">
            <h2> Upcoming Tournaments </h2>
            </div>
            <div className = "leaderboard-box bg-gray-100 border border-gray-300 text-sm text-center w-full h-72 min-w-72 flex items-center justify-center min-height-500px">
              Add Upcoming Tournaments here.
            </div>
        </div>
      </div>
    </>
  );
}

export default News;
