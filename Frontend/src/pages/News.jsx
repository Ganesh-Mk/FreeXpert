import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { newsData } from '../Data/NewsData';

const News = () => {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 15;

  const navigate = useNavigate();
  const DEFAULT_NEWS_IMAGE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 200' width='400' height='200'%3E%3Crect width='400' height='200' fill='%23f3f4f6'/%3E%3Cg fill='%236b7280'%3E%3Cpath d='M160 80h80v40h-80z'/%3E%3Ccircle cx='200' cy='70' r='20'/%3E%3Crect x='140' y='130' width='120' height='6' rx='3'/%3E%3Crect x='160' y='145' width='80' height='6' rx='3'/%3E%3C/g%3E%3C/svg%3E`;

  useEffect(() => {
    if (JSON.parse(localStorage.getItem('userData')) === null) {
      navigate('/login');
    }
  })

  useEffect(() => {
    const fetchNews = async () => {
      const apiKey = import.meta.env.VITE_NEWS_API_KEY;
      const url = `https://newsapi.org/v2/everything?q=freelance&pageSize=50&apiKey=${apiKey}`;

      try {
        setLoading(true);
        const data = await axios.get(url);

        const validArticles = data.data.articles.filter(article =>
          article.title &&
          article.title !== '[Removed]' &&
          article.description &&
          article.description !== '[Removed]' &&
          article.url &&
          article.url !== 'https://removed.com' &&
          article.urlToImage
        );

        console.log(validArticles);
        setArticles(validArticles);
      } catch (err) {
        setArticles(newsData);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [currentPage]);

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource = selectedSource === 'all' || article.source?.name === selectedSource;
    return matchesSearch && matchesSource;
  });

  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSource]);

  const sources = ['all', ...new Set(articles.map(article => article.source?.name).filter(Boolean))];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center space-x-4 mt-8">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg bg-gray-700 hover:bg-gray-600 
            ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''} transition-colors`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="text-sm text-gray-300">
          Page {currentPage} of {totalPages}
        </div>

        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg bg-gray-700 hover:bg-gray-600
            ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''} transition-colors`}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    );
  };

  // if (error) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen p-4 bg-gray-900">
  //       <div className="text-center">
  //         <h2 className="text-2xl font-bold text-red-500 mb-2">News API works only in localhost</h2>
  //         <p className="text-gray-300">due to subscription limitations</p>
  //       </div>
  //     </div>
  //   );
  // }



  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="fixed top-[4rem] py-2 left-0 right-0 z-50 bg-gray-900 shadow-md">
        <div className="container mx-auto px-4 py-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl font-bold">freelance News</h1>

            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  className="pl-10 pr-4 py-2 rounded-lg w-full bg-gray-700 border-gray-600 
                    focus:bg-gray-600 border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="px-4 py-2 rounded-lg bg-gray-700 border-gray-600 
                  border focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
              >
                {sources.map(source => (
                  <option key={source} value={source}>
                    {source.charAt(0).toUpperCase() + source.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 pt-32">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl overflow-hidden bg-gray-800 shadow-lg">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <p className="my-2 text-gray-500">
              Showing {indexOfFirstArticle + 1}-{Math.min(indexOfLastArticle, filteredArticles.length)} of {filteredArticles.length} articles
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentArticles.map((article, index) => (
                <article
                  key={index}
                  className="rounded-xl overflow-hidden bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  {article.urlToImage && (
                    <img
                      src={article.urlToImage}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = DEFAULT_NEWS_IMAGE;
                        e.target.alt = "News template image";
                      }}
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">
                        {article.source?.name}
                      </span>
                      <span className="text-sm text-gray-400">
                        {formatDate(article.publishedAt)}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold mb-2 line-clamp-2">
                      {article.title}
                    </h2>
                    <p className="mb-4 line-clamp-3 text-gray-300">
                      {article.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-400 font-medium"
                      >
                        Read more →
                      </a>
                      {article.author && (
                        <span className="text-sm text-gray-400">
                          By {article.author}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <PaginationControls />
          </>
        )}
      </main>
    </div>
  );
};

export default News;