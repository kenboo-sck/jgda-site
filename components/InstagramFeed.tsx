'use client';

import Script from 'next/script';

export default function InstagramFeed() {
    return (
        <section className="py-24 border-t border-slate-100">
            {/* Section Header */}
            <div className="mb-16 flex items-end justify-between border-b-2 border-slate-100 pb-8">
                <div>
                    <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase leading-none text-[#001f3f]">
                        Insta<span className="text-red-600">gram</span>
                    </h2>
                    <p className="mt-4 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] italic">
                        Official Social Feed
                    </p>
                </div>
                <div className="hidden md:block w-24 h-1 bg-red-600"></div>
            </div>

            {/* Behold.so Instagram Widget */}
            <div data-behold-id="aOBCTZ6jmXuKnDDVz3vi"></div>
            <Script
                src="https://w.behold.so/widget.js"
                type="module"
                strategy="lazyOnload"
            />

            {/* Follow Button */}
            <div className="flex justify-center mt-12">
                <a
                    href="https://www.instagram.com/jgda.or.jp/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-4 px-10 py-4 bg-[#001f3f] text-white text-[11px] font-black tracking-[0.3em] uppercase italic transition-all hover:bg-red-600 hover:shadow-xl hover:-translate-y-1"
                >
                    Follow Us <span className="group-hover:translate-x-2 transition-transform">→</span>
                </a>
            </div>
        </section>
    );
}
