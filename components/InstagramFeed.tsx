import React from 'react';

interface InstagramPost {
    id: string;
    mediaUrl: string;
    permalink: string;
    caption?: string;
    mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
}

export default function InstagramFeed({ data }: { data: InstagramPost[] }) {
    // データがない場合はモックを表示（デザイン確認用）
    const posts = data && data.length > 0 ? data : Array(6).fill(null).map((_, i) => ({
        id: `mock-${i}`,
        mediaUrl: '',
        permalink: 'https://instagram.com',
        caption: 'Instagram Post Placeholder',
        mediaType: 'IMAGE' as const
    }));

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

            {/* Instagram Grid - 3 columns on desktop, 2 columns on mobile (Free plan 6 posts) */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {posts.map((post, i) => (
                    <a
                        key={post.id}
                        href={post.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative aspect-square bg-slate-100 overflow-hidden border border-slate-200 transition-all duration-500 hover:shadow-2xl"
                    >
                        {post.mediaUrl ? (
                            <img
                                src={post.mediaUrl}
                                alt={post.caption || 'Instagram Post'}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-200">
                                <svg className="w-12 h-12 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </div>
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="text-white text-center p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                <svg className="w-8 h-8 mx-auto mb-2 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                                <span className="text-[10px] font-black tracking-widest uppercase italic">View on Instagram</span>
                            </div>
                        </div>
                    </a>
                ))}
            </div>

            {/* Follow Button */}
            <div className="flex justify-center mt-12">
                <a
                    href="https://www.instagram.com/"
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
