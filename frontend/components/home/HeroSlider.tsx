
import React, { useState, useEffect } from 'react';

const slides = [
  {
    text: "Đặt lịch khám nhanh - gọi 0123.456.789",
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1600&q=80"
  },
  {
    text: "Chăm sóc tận tâm với đội ngũ bác sĩ chuyên khoa",
    image: "https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&w=1600&q=80"
  },
  {
    text: "Kết quả xét nghiệm online an toàn & bảo mật",
    image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1600&q=80"
  }
];

const HeroSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[320px] md:h-[450px] overflow-hidden rounded-2xl my-6">
      <div
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className="min-w-full h-full relative flex items-center justify-center text-center px-6"
            style={{
              background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${slide.image}) center/cover`
            }}
          >
            <h2 className="text-white text-3xl md:text-5xl font-extrabold max-w-4xl drop-shadow-lg">
              {slide.text}
            </h2>
          </div>
        ))}
      </div>

      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full border-2 border-white transition-all ${current === index ? 'bg-white scale-125' : 'bg-white/40'
              }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
