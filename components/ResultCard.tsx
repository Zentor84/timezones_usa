
import React from 'react';
import { LookupResult, Language } from '../types';

interface ResultCardProps {
  result: LookupResult;
  lang: Language;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, lang }) => {
  const i18n = {
    vi: {
      location: "Vị trí",
      timezone: "Múi giờ",
      nowInVN: "Bây giờ tại VN",
      nowInUS: "Bây giờ tại US",
      suggestion: "So sánh & Gợi ý gọi",
      ref: "Nguồn tham khảo",
      copied: "Đã sao chép kết quả!",
      copy: "Copy",
      note: "Lưu ý",
      dst: "DST Đang chạy"
    },
    en: {
      location: "Location",
      timezone: "Timezone",
      nowInVN: "Current Time in VN",
      nowInUS: "Current Time in US",
      suggestion: "Comparison & Calling Suggestions",
      ref: "Sources",
      copied: "Result copied!",
      copy: "Copy",
      note: "Note",
      dst: "DST Active"
    }
  }[lang];

  const copyToClipboard = () => {
    const text = `Query: ${result.query}\n${i18n.location}: ${result.state} – ${result.cities.join('/')}\n${i18n.timezone}: ${result.timezoneName} (${result.ianaTimezone})\n${result.difference}\nVN ${result.vnTime} → US ${result.usTime}\nSuggestion: ${result.suggestions[0].vn} VN (${result.suggestions[0].us} ${result.timezoneName})`;
    navigator.clipboard.writeText(text);
    alert(i18n.copied);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-bold text-lg text-blue-700">{result.query}</h3>
        <button 
          onClick={copyToClipboard}
          className="text-xs bg-white border border-slate-300 px-2 py-1 rounded hover:bg-slate-100 transition-colors flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          {i18n.copy}
        </button>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{i18n.location}</p>
            <p className="text-slate-800 font-medium">{result.state} – {result.cities.join(', ') || '...'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{i18n.timezone}</p>
            <p className="text-slate-800 font-medium">{result.timezoneName} <span className="text-slate-400 font-normal text-sm">({result.ianaTimezone})</span> {result.isDST && <span className="ml-1 px-1 bg-yellow-100 text-yellow-700 text-[10px] rounded">{i18n.dst}</span>}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 py-2 bg-blue-50/50 rounded-lg px-3">
          <div className="flex-1 text-center border-r border-blue-100">
             <p className="text-[10px] text-blue-600 font-bold uppercase">{i18n.nowInVN}</p>
             <p className="text-xl font-bold text-slate-800">{result.vnTime}</p>
          </div>
          <div className="flex-1 text-center">
             <p className="text-[10px] text-blue-600 font-bold uppercase">{i18n.nowInUS}</p>
             <p className="text-xl font-bold text-slate-800">{result.usTime}</p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{i18n.suggestion}</p>
          <p className="text-sm text-slate-700">{result.difference}</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {result.suggestions.map((s, idx) => (
              <div key={idx} className="bg-emerald-50 border border-emerald-100 px-2 py-1 rounded text-xs text-emerald-700">
                <span className="font-bold">{s.vn} VN</span> → {s.us} {result.timezoneName}
              </div>
            ))}
          </div>
        </div>

        {result.error && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700 italic">
            <strong>{i18n.note}:</strong> {result.error}
          </div>
        )}

        {result.sources && result.sources.length > 0 && (
          <div className="pt-2 mt-2 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">{i18n.ref}</p>
            <div className="flex flex-wrap gap-2">
              {result.sources.slice(0, 2).map((s, idx) => (
                <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 hover:underline truncate max-w-[150px]">
                  {s.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultCard;
