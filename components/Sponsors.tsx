import React from 'react';

interface Sponsor {
  id: string;
  name: string;
  logo?: { url: string };
  url?: string;
}

export default function Sponsors({ data }: { data: Sponsor[] }) {
  // スポンサーデータが空の場合は何も表示しない
  if (!data || data.length === 0) return null;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Section Header */}
        <div className="mb-16 flex items-end justify-between border-b-2 border-slate-100 pb-8">
          <div>
            <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase leading-none text-[#001f3f]">
              Official <span className="text-red-600">Sponsors</span>
            </h2>
            <p className="mt-4 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] italic">
              Supporting our passion and community
            </p>
          </div>
          <div className="hidden md:block w-24 h-1 bg-red-600"></div>
        </div>

        {/* Sponsors Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.map((sponsor) => (
            <a
              key={sponsor.id}
              href={sponsor.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-center h-40 md:h-56 bg-slate-50 border border-slate-100 overflow-hidden transition-all duration-500 hover:border-red-600/30 hover:shadow-2xl hover:-translate-y-1"
            >
              {/* Background Accent */}
              <div className="absolute top-0 left-0 w-1 h-0 bg-red-600 transition-all duration-500 group-hover:h-full"></div>
              
              {sponsor.logo?.url ? (
                <img
                  src={sponsor.logo.url}
                  alt={sponsor.name}
                  className="max-w-[80%] max-h-[70%] object-contain transition-all duration-500 group-hover:grayscale group-hover:opacity-50"
                />
              ) : (
                <span className="text-slate-300 font-bold italic text-sm">{sponsor.name}</span>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}