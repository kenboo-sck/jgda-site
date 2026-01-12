import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <main className="bg-white min-h-screen pb-20 font-sans text-slate-900 border-t border-slate-100">
            <div className="bg-[#001f3f] text-white py-16 px-4 border-b-4 border-red-600">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                        Privacy <span className="text-red-600">Policy</span>
                    </h1>
                    <p className="text-slate-400 font-bold mt-4 tracking-[0.3em] uppercase text-xs italic">プライバシーポリシー</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-16 lg:py-24">
                <div className="prose prose-slate max-w-none space-y-12 text-slate-600 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-black text-[#001f3f] mb-6 flex items-center gap-3 italic">
                            <span className="w-8 h-[2px] bg-red-600"></span>
                            個人情報の保護について
                        </h2>
                        <p>
                            一般社団法人 日本プロゴルフ選手育成協会（以下「当協会」といえます）は、本ウェブサイトの運営にあたり、ユーザーのプライバシーを尊重し、個人情報の保護に関する法令を遵守します。以下に定める通り、個人情報を適切に取り扱い、保護に努めます。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-[#001f3f] mb-6 flex items-center gap-3 italic">
                            <span className="w-8 h-[2px] bg-red-600"></span>
                            1. 個人情報の収集
                        </h2>
                        <p>
                            当協会は、本サイトの提供、大会エントリー、お問い合わせへの対応等のために、必要最小限の範囲でユーザーの個人情報（氏名、生年月日、住所、電話番号、メールアドレス等）を収集することがあります。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-[#001f3f] mb-6 flex items-center gap-3 italic">
                            <span className="w-8 h-[2px] bg-red-600"></span>
                            2. 個人情報の利用目的
                        </h2>
                        <p>収集した個人情報は、以下の目的のために利用します。</p>
                        <ul className="list-disc pl-6 space-y-2 mt-4">
                            <li>本サイトの運営およびサービスの提供。</li>
                            <li>大会エントリー、選考、結果通知等の事務手続き。</li>
                            <li>ユーザーからのお問い合わせに対する回答。</li>
                            <li>当協会に関連する情報の提供、お知らせの送付。</li>
                            <li>統計情報の作成（個人を特定できない形式）。</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-[#001f3f] mb-6 flex items-center gap-3 italic">
                            <span className="w-8 h-[2px] bg-red-600"></span>
                            3. 個人情報の第三者提供
                        </h2>
                        <p>
                            当協会は、法令に基づく場合を除き、ユーザーの同意を得ることなく、個人情報を第三者に提供することはありません。ただし、業務委託先に対して利用目的の達成に必要な範囲で委託を行う場合があります。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-[#001f3f] mb-6 flex items-center gap-3 italic">
                            <span className="w-8 h-[2px] bg-red-600"></span>
                            4. 個人情報の管理・安全対策
                        </h2>
                        <p>
                            当協会は、収集した個人情報の漏えい、滅失、または毀損の防止のために、適切な安全管理措置を講じます。また、個人データを取り扱う従業員や委託先に対し、適切な監督を行います。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-[#001f3f] mb-6 flex items-center gap-3 italic">
                            <span className="w-8 h-[2px] bg-red-600"></span>
                            5. 開示・訂正・利用停止
                        </h2>
                        <p>
                            ユーザー本人が自らの個人情報の開示、訂正、追加、削除、または利用停止を希望される場合には、当協会のお問い合わせ窓口までご連絡ください。合理的な範囲で速やかに対応いたします。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-[#001f3f] mb-6 flex items-center gap-3 italic">
                            <span className="w-8 h-[2px] bg-red-600"></span>
                            6. お問い合わせ窓口
                        </h2>
                        <p>
                            個人情報の取り扱いに関するお問い合わせは、協会事務局までご連絡ください。
                        </p>
                        <p className="font-bold text-[#001f3f] mt-2">
                            Email: <a href="mailto:info@jgda.or.jp" className="hover:text-red-600 transition-colors">info@jgda.or.jp</a>
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
