
import React, { useState } from 'react';
import { lookupQueries } from './services/geminiService';
import { LookupResult, SearchHistoryItem, Language } from './types';
import ResultCard from './components/ResultCard';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('vi');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [currentResults, setCurrentResults] = useState<LookupResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const i18n = {
    vi: {
      title: "Bot tra cứu múi giờ tại Mỹ so với Việt Nam",
      subtitle: "Hỗ trợ tra cứu nhanh múi giờ & khung giờ gọi tốt",
      creator: "Người tạo Bot: Truong Zentor",
      label: "Nhập số điện thoại, Area Code (3 số) hoặc Tên Tiểu Bang",
      placeholder: "VD: +1 336 123 4567, 408, California, New York",
      hint: "Có thể nhập nhiều giá trị, cách nhau bởi dấu phẩy hoặc xuống dòng.",
      button: "Tra cứu ngay",
      searching: "Đang tra cứu dữ liệu thực tế...",
      latestResults: "Kết quả tra cứu mới nhất",
      history: "Lịch sử tra cứu",
      clearHistory: "Xoá lịch sử",
      invalid: "Vui lòng nhập thông tin hợp lệ (Area code, Số điện thoại hoặc Tên bang).",
      whyTitle: "Tính năng nổi bật",
      reason1Title: "Múi giờ thực tế",
      reason1Desc: "Tự động tra cứu Google Search để lấy múi giờ và trạng thái DST mới nhất.",
      reason2Title: "Gợi ý giờ gọi",
      reason2Desc: "Đề xuất khung giờ phù hợp cho cả hai bên để liên lạc hiệu quả nhất.",
      reason3Title: "Đa năng",
      reason3Desc: "Hỗ trợ tra cứu theo mã vùng điện thoại hoặc trực tiếp theo địa danh."
    },
    en: {
      title: "US-Vietnam Timezone Lookup Bot",
      subtitle: "Fast lookup for US timezones & best calling hours",
      creator: "Bot Creator: Truong Zentor",
      label: "Enter phone number, Area Code, or US State Name",
      placeholder: "e.g., +1 336 123 4567, 408, California, New York",
      hint: "You can enter multiple values, separated by commas or new lines.",
      button: "Lookup Now",
      searching: "Searching real-time data...",
      latestResults: "Latest Search Results",
      history: "Search History",
      clearHistory: "Clear History",
      invalid: "Please enter a valid format (Area code, Phone number, or State name).",
      whyTitle: "Key Features",
      reason1Title: "Real-time Timezone",
      reason1Desc: "Uses Google Search to fetch accurate timezones and current DST status.",
      reason2Title: "Calling Suggestions",
      reason2Desc: "Recommends the best time slots for both parties to communicate.",
      reason3Title: "Versatile",
      reason3Desc: "Search by phone prefix, area code, or specific state names."
    }
  }[lang];

  const extractQueries = (input: string): string[] => {
    const queries: Set<string> = new Set();
    const parts = input.split(/[\s,;\n]+/);
    
    parts.forEach(part => {
      const cleanPart = part.trim();
      if (!cleanPart) return;

      const digitsOnly = cleanPart.replace(/[^\d+]/g, '');
      if (digitsOnly.startsWith('+1')) {
        const ac = digitsOnly.substring(2, 5);
        if (ac.length === 3) queries.add(ac);
      } else if (/^\d{3,}$/.test(digitsOnly)) {
        const ac = digitsOnly.startsWith('1') && digitsOnly.length > 3 ? digitsOnly.substring(1, 4) : digitsOnly.substring(0, 3);
        if (ac.length === 3) queries.add(ac);
      } else if (cleanPart.length >= 2) {
        queries.add(cleanPart);
      }
    });

    return Array.from(queries);
  };

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    setError(null);
    const queries = extractQueries(inputValue);
    
    if (queries.length === 0) {
      setError(i18n.invalid);
      return;
    }

    setIsLoading(true);
    setCurrentResults([]); // Clear results to show loading state better
    try {
      const results = await lookupQueries(queries, lang);
      setCurrentResults(results);
      setHistory(prev => [{ timestamp: Date.now(), input: inputValue, results }, ...prev].slice(0, 10));
    } catch (err: any) {
      setError(err.message || (lang === 'vi' ? 'Đã có lỗi kết nối với máy chủ.' : 'Connection error with the server.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-12 bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <h1 className="font-bold text-lg sm:text-xl text-slate-800 leading-tight">{i18n.title}</h1>
              <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">{i18n.creator}</p>
            </div>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
             <button onClick={() => setLang('vi')} className={`px-2 py-1 text-xs font-bold rounded transition-all ${lang === 'vi' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>VN</button>
             <button onClick={() => setLang('en')} className={`px-2 py-1 text-xs font-bold rounded transition-all ${lang === 'en' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>EN</button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8 space-y-8">
        <section className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8">
          <form onSubmit={handleLookup} className="space-y-4">
            <label className="block">
              <span className="text-sm font-bold text-slate-700 mb-2 block">{i18n.label}</span>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={i18n.placeholder}
                rows={2}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800 font-medium placeholder:text-slate-400 resize-none"
              />
            </label>
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
               <p className="text-xs text-slate-400 italic">{i18n.hint}</p>
               <button
                 type="submit"
                 disabled={isLoading || !inputValue.trim()}
                 className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95 ${
                   isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                 }`}
               >
                 {isLoading ? (
                   <span className="flex items-center gap-2">
                     <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     {i18n.searching}
                   </span>
                 ) : i18n.button}
               </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <div>
                <p className="font-bold">{lang === 'vi' ? 'Lỗi' : 'Error'}</p>
                <p>{error}</p>
              </div>
            </div>
          )}
        </section>

        {currentResults.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2 px-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              {i18n.latestResults}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentResults.map(res => (
                <ResultCard key={res.id} result={res} lang={lang} />
              ))}
            </div>
          </section>
        )}

        {isLoading && currentResults.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium animate-pulse">{i18n.searching}</p>
          </div>
        )}

        {history.length > 0 && (
          <section className="pt-8">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">{i18n.history}</h2>
              <button onClick={() => setHistory([])} className="text-xs text-slate-400 hover:text-red-500 transition-colors">{i18n.clearHistory}</button>
            </div>
            <div className="space-y-3">
               {history.slice(currentResults.length > 0 ? 1 : 0).map((item, idx) => (
                 <div key={idx} className="bg-white rounded-xl p-4 border border-slate-200 hover:border-indigo-200 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                       <p className="text-xs font-bold text-slate-400">{new Date(item.timestamp).toLocaleTimeString(lang === 'vi' ? 'vi-VN' : 'en-US')}</p>
                       <p className="text-xs text-slate-400 truncate max-w-[200px]">Input: {item.input}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.results.map(r => (
                        <span key={r.id} className="inline-block px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase">
                          {r.query} • {r.state}
                        </span>
                      ))}
                    </div>
                 </div>
               ))}
            </div>
          </section>
        )}

        {currentResults.length === 0 && history.length === 0 && !isLoading && (
          <section className="bg-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl">
             <div className="relative z-10">
               <h3 className="text-2xl font-bold mb-6">{i18n.whyTitle}</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="space-y-2">
                    <p className="font-bold text-indigo-200 uppercase text-[10px] tracking-widest">{i18n.reason1Title}</p>
                    <p className="text-sm text-indigo-50 leading-relaxed">{i18n.reason1Desc}</p>
                 </div>
                 <div className="space-y-2">
                    <p className="font-bold text-indigo-200 uppercase text-[10px] tracking-widest">{i18n.reason2Title}</p>
                    <p className="text-sm text-indigo-50 leading-relaxed">{i18n.reason2Desc}</p>
                 </div>
                 <div className="space-y-2">
                    <p className="font-bold text-indigo-200 uppercase text-[10px] tracking-widest">{i18n.reason3Title}</p>
                    <p className="text-sm text-indigo-50 leading-relaxed">{i18n.reason3Desc}</p>
                 </div>
               </div>
             </div>
             <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-500 rounded-full opacity-50 blur-2xl"></div>
             <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-800 rounded-full opacity-30 blur-2xl"></div>
          </section>
        )}
      </main>

      <footer className="max-w-4xl mx-auto px-4 mt-12 text-center text-slate-400 text-xs">
        <p>© 2024 {i18n.title}</p>
        <p className="mt-1 font-medium">{i18n.creator}</p>
      </footer>
    </div>
  );
};

export default App;
