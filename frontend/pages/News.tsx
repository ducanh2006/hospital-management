
import React, { useState, useEffect } from 'react';
import { newsService } from '../services/hospitalService';
import { MedicalNews } from '../types';
import { formatDate } from '../utils/helpers';

const News: React.FC = () => {
  const [newsList, setNewsList] = useState<MedicalNews[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<MedicalNews | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await newsService.getAll();
        const rawData = res.data;
        const data = Array.isArray(rawData) ? [...rawData] : [];
        
        data.sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime());
        setNewsList(data);
      } catch (err) {
        console.error("Error loading news", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (selectedNews) {
    return (
      <div className="fixed inset-0 z-[100] bg-white overflow-y-auto animate-fade-in-up">
        <div className="container mx-auto max-w-3xl px-6 py-12">
          <div className="sticky top-0 bg-white/80 backdrop-blur-sm py-6 border-b mb-10 z-10">
            <button 
              onClick={() => setSelectedNews(null)}
              className="px-6 py-2 border-2 border-[#0093E9] text-[#0093E9] rounded-xl font-bold flex items-center gap-2 hover:bg-[#0093E9] hover:text-white transition-all"
            >
              <i className="fas fa-arrow-left"></i> Quay lại danh sách
            </button>
          </div>
          <article className="prose lg:prose-xl max-w-none">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2 leading-tight">{selectedNews.title}</h1>
            <p className="text-gray-400 italic mb-8 border-b pb-4">Cập nhật: {formatDate(selectedNews.lastUpdate)}</p>
            <div className="text-lg leading-relaxed text-gray-700 whitespace-pre-line text-justify">
              {selectedNews.content}
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight">Tin tức nổi bật</h1>
      </header>

      {isLoading ? (
        <div className="space-y-6">
          {[1,2,3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-3xl animate-pulse"></div>)}
        </div>
      ) : newsList.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {newsList.map(news => (
            <article key={news.id} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
              <h2 className="text-2xl font-bold mb-3 group-hover:text-[#0093E9] transition-colors">
                <button onClick={() => setSelectedNews(news)} className="text-left">{news.title}</button>
              </h2>
              <p className="text-sm text-gray-400 font-medium mb-4">{formatDate(news.lastUpdate)}</p>
              <p className="text-gray-600 line-clamp-3 mb-6 leading-relaxed">
                {news.content.substring(0, 200)}...
              </p>
              <button 
                onClick={() => setSelectedNews(news)}
                className="text-[#0093E9] font-bold text-sm flex items-center gap-2 hover:gap-4 transition-all"
              >
                Đọc thêm <i className="fas fa-arrow-right"></i>
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <i className="fas fa-newspaper text-6xl mb-4"></i>
          <p>Chưa có tin tức nào được đăng tải.</p>
        </div>
      )}
    </div>
  );
};

export default News;
