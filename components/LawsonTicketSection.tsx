import React from 'react';
import Link from 'next/link';

interface LawsonTicketSectionProps {
  qrUrl?: string;
  entryUrl?: string;
}

export default function LawsonTicketSection({ qrUrl, entryUrl = "#" }: LawsonTicketSectionProps) {
  return (
    <section className="p-8 bg-slate-50 border border-slate-200 rounded-sm text-center">
      <h3 className="text-xl font-black italic text-[#001f3f] mb-8 uppercase tracking-tighter">
        大会 <span className="text-red-600">Entry</span>
      </h3>
      <div className="flex flex-col items-center gap-8">
        {/* QRコードエリア */}
        {qrUrl && (
          <div className="bg-white p-4 border border-slate-200 shadow-sm">
            <img 
              src={qrUrl} 
              alt="Lawson Ticket QR Code" 
              className="w-40 h-40 object-contain"
            />
          </div>
        )}

        {/* リンクボタン (指定された画像を使用) */}
        <div className="flex flex-col items-center gap-3">
          <Link 
            href={entryUrl} 
            target="_blank"
            rel="noopener noreferrer"
            className="group transition-all duration-300 hover:scale-105"
          >
            <img 
              src="/images/head_logo_pc_scl.png" 
              alt="Lawson Ticket" 
              className="h-14 w-auto object-contain"
            />
          </Link>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
            ※外部サイト（LAWSON DO! SPORTS）へ移動します
          </p>
        </div>
      </div>
    </section>
  );
}