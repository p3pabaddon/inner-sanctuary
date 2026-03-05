import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Selin M.",
    text: "Dr. Yılmaz, kaygımı başka kimsenin yapamadığı şekilde anlamamı sağladı. Altı ay sonra tamamen farklı bir insan gibi hissediyorum. Sabrı ve uzmanlığı için minnettarım.",
    rating: 5,
    role: "Kaygı Tedavisi",
  },
  {
    name: "Ahmet K.",
    text: "Çift terapisi seansları evliliğimizi kurtardı. Açık ve dürüst iletişim kurmayı öğrendik. Dr. Yılmaz'ı şefkatli yaklaşımı için yeterince tavsiye edemem.",
    rating: 5,
    role: "Çift Terapisi",
  },
  {
    name: "Elif R.",
    text: "Yıllarca travmayla mücadele ettikten sonra, sonunda gerçekten anlayan birini buldum. EMDR terapisi hayatımı değiştirdi. Yıllar sonra ilk kez kendimi güvende ve umutlu hissediyorum.",
    rating: 5,
    role: "Travma Terapisi",
  },
  {
    name: "Deniz L.",
    text: "Online terapi, yoğun programıma rağmen yardım almamı mümkün kıldı. Dr. Yılmaz ekran üzerinden bile inanılmaz profesyonel ve ilgili.",
    rating: 5,
    role: "Online Terapi",
  },
];

const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1));

  return (
    <section id="testimonials" className="py-32 bg-accent/50 relative noise-overlay" ref={ref}>
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="text-sm font-body font-semibold text-secondary uppercase tracking-widest">Yorumlar</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-4">
            Danışanlarım Ne Diyor
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          <div className="glass-strong rounded-3xl p-8 md:p-12 relative">
            <Quote className="w-12 h-12 text-primary/15 absolute top-8 left-8" />
            
            <div className="relative z-10">
              <div className="flex gap-1 mb-6 justify-center">
                {[...Array(testimonials[current].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-secondary text-secondary" />
                ))}
              </div>

              <motion.p
                key={current}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg md:text-xl text-foreground font-body text-center leading-relaxed mb-8 italic"
              >
                "{testimonials[current].text}"
              </motion.p>

              <div className="text-center">
                <div className="font-display font-semibold text-foreground text-lg">
                  {testimonials[current].name}
                </div>
                <div className="text-sm text-muted-foreground font-body">
                  {testimonials[current].role}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-12 h-12 rounded-full glass flex items-center justify-center hover:shadow-soft transition-all duration-300 hover:-translate-y-0.5"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    i === current ? "bg-primary w-8" : "bg-primary/20"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-12 h-12 rounded-full glass flex items-center justify-center hover:shadow-soft transition-all duration-300 hover:-translate-y-0.5"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;