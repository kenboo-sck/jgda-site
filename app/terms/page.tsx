import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
    return (
        <main className="bg-white min-h-screen pb-20 font-sans text-slate-900 border-t border-slate-100">
            <div className="bg-[#001f3f] text-white py-16 px-4 border-b-4 border-red-600">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                        Terms of <span className="text-red-600">Service</span>
                    </h1>
                    <p className="text-slate-400 font-bold mt-4 tracking-[0.3em] uppercase text-xs italic">利用規約</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-16 lg:py-24">
                <div className="prose prose-slate max-w-none space-y-12 text-slate-600 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-black text-[#001f3f] mb-6 flex items-center gap-3 italic">
                            <span className="w-8 h-[2px] bg-red-600"></span>
                            第1条（適用）
                        </h2>
                        <p>
                            本規約は、一般社団法人 日本プロゴルフ選手育成協会（以下「当協会」といえます）が運営する本ウェブサイト（以下「本サイト」といえます）の利用条件を定めるものです。本サイトを利用するすべてのユーザー（以下「ユーザー」といえます）に適用されます。ユーザーは、本サイトを利用することにより、本規約に同意したものとみなされます。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-[#001f3f] mb-6 flex items-center gap-3 italic">
                            <span className="w-8 h-[2px] bg-red-600"></span>
                            第2条（禁止事項）
                        </h2>
                        <p>ユーザーは、本サイトの利用にあたり、以下の行為を行ってはならないものとします。</p>
                        <ul className="list-disc pl-6 space-y-2 mt-4">
                            <li>法令または公序良俗に違反する行為。</li>
                            <li>本サイトの運営を妨害する行為、またはその恐れのある行為。</li>
                            <li>当協会、他のユーザー、または第三者の知的財産権、プライバシー等を侵害する行為。</li>
                            <li>本サイト上のコンテンツを無断で転載、複製、配布する行為。</li>
                            <li>その他、当協会が不適切と判断する行為。</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-[#001f3f] mb-6 flex items-center gap-3 italic">
                            <span className="w-8 h-[2px] bg-red-600"></span>
                            第3条（知的財産権）
                        </h2>
                        <p>
                            本サイトに掲載されているテキスト、画像、動画、ロゴ等のすべての著作権およびその他の知的財産権は、当協会または正当な権利者に帰属します。私的使用など法律で認められる範囲を超えて、無断で使用することはできません。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-[#001f3f] mb-6 flex items-center gap-3 italic">
                            <span className="w-8 h-[2px] bg-red-600"></span>
                            第4条（免責事項）
                        </h2>
                        <p>
                            当協会は、本サイトに掲載される情報の正確性について万全を期していますが、その完全性や正確性を保証するものではありません。ユーザーが本サイトを利用したことにより生じた損害について、当協会は一切の責任を負いません。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-[#001f3f] mb-6 flex items-center gap-3 italic">
                            <span className="w-8 h-[2px] bg-red-600"></span>
                            第5条（規約の変更）
                        </h2>
                        <p>
                            当協会は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。変更後の規約は、本サイト上に表示した時点から効力を生じるものとします。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-[#001f3f] mb-6 flex items-center gap-3 italic">
                            <span className="w-8 h-[2px] bg-red-600"></span>
                            第6条（準拠法・裁判管轄）
                        </h2>
                        <p>
                            本規約の解釈にあたっては、日本法を準拠法とします。本サイトの利用に関して紛争が生じた場合には、当協会の所在地を管轄する裁判所を専属的合意管轄とします。
                        </p>
                    </section>
                </div>

                <div className="mt-24 pt-12 border-t border-slate-100 flex justify-center">
                    <Link href="/" className="group flex flex-col items-center gap-2">
                        <span className="text-[10px] font-black tracking-[0.5em] text-slate-400 group-hover:text-red-600 transition-colors uppercase">Back to Home</span>
                        <div className="w-8 h-[1px] bg-slate-200 group-hover:w-12 group-hover:bg-red-600 transition-all"></div>
                    </Link>
                </div>
            </div>
        </main>
    );
}
