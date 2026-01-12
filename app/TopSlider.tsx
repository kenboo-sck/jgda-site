'use client';

import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface SliderItem {
  id: string;
  title: string;
  text: string;
  image: {
    url: string;
  };
  link?: string;
}

export default function TopSlider({ data }: { data: SliderItem[] }) {
  const [swiper, setSwiper] = useState<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!data || data.length === 0) return null;

  // スライドが少ない場合、ループの隙間を防ぐためにデータを倍増させる
  const isSmallCount = data.length > 0 && data.length < 6;
  const slides = isSmallCount ? [...data, ...data] : data;

  return (
    <section className="w-full py-8 mb-12 overflow-hidden bg-[#001f3f]">
      <Swiper
        key={slides.length}
        modules={[Autoplay, Navigation, Pagination]}
        onSwiper={setSwiper}
        loop={true}
        centeredSlides={true}
        slidesPerView={1}
        speed={1300}
        watchSlidesProgress={true}
        grabCursor={true}
        spaceBetween={20}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        navigation={true}
        pagination={false}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex % data.length)}
        breakpoints={{
          1024: {
            slidesPerView: 1.8,
            spaceBetween: 40,
          },
        }}
        className="top-swiper"
      >
        {slides.map((item, index) => (
          <SwiperSlide key={`${item.id}-${index}`}>
            <div className="flex flex-col group pb-6">
              {/* 画像エリア */}
              <div className="relative aspect-[16/9] md:aspect-[16/9] overflow-hidden bg-slate-100 shadow-lg">
                {item.image?.url ? (
                  <img
                    src={item.image.url}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold italic">NO IMAGE</div>
                )}
              </div>
              
              {/* テキストエリア */}
              <div className="mt-6 px-4 md:px-12 text-center md:text-left">
                <h3 className="text-xl md:text-4xl font-black italic uppercase text-white tracking-tighter leading-tight group-hover:text-red-600 transition-colors">
                  {item.title}
                </h3>
                <p className="mt-3 text-slate-300 text-sm md:text-lg font-medium leading-relaxed max-w-3xl">
                  {item.text}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* カスタムページネーション：ドットの数を元のデータ数（3つ）に固定 */}
      <div className="flex justify-center gap-3 mt-4 relative z-10">
        {data.map((_, i) => (
          <button
            key={i}
            onClick={() => swiper?.slideToLoop(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === activeIndex ? 'bg-[#dc2626] w-8' : 'bg-white/30 w-2'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      <style jsx global>{`
        .top-swiper .swiper-button-next,
        .top-swiper .swiper-button-prev {
          color: rgba(255, 255, 255, 0.3);
          background: none;
          border: none;
          transition: all 0.3s;
        }
        .top-swiper .swiper-button-next:hover,
        .top-swiper .swiper-button-prev:hover {
          color: rgba(255, 255, 255, 1);
          transform: scale(1.1);
        }
        .top-swiper .swiper-button-next:after,
        .top-swiper .swiper-button-prev:after {
          font-size: 32px;
        }
        .top-swiper .swiper-pagination-bullet-active {
          background: #dc2626;
        }
        .top-swiper .swiper-slide {
          opacity: 0.4;
          transition: opacity 0.5s;
        }
        .top-swiper .swiper-slide-active {
          opacity: 1;
        }
      `}</style>
    </section>
  );
}