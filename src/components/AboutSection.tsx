import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import portraitImage from "@/assets/psychologist-portrait.jpg";

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-32 relative" ref={ref}>
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute -inset-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-[2rem]" />
            <div className="relative overflow-hidden rounded-[2rem]">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2070&auto=format&fit=crop"
                alt="Uzm. Kln. Psk. Ayşe Yılmaz"
                className="w-full object-cover aspect-square"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
            </div>
          </motion.div>

          {/* Text */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="text-sm font-body font-semibold text-secondary uppercase tracking-widest"
            >
              Hakkımızda
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl md:text-5xl font-display font-bold text-foreground mt-4 mb-6"
            >
              Uzm. Kln. Psk. Ayşe Yılmaz
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 }}
              className="text-lg text-primary font-highlight italic mb-6"
            >
              Kurucu & Klinik Psikolog
            </motion.p>

            {[
              "Kanıta dayalı terapötik yaklaşımlarla bireylerin kaygı, travma ve duygusal zorluklarını aşmalarına yardımcı oluyorum.",
              "15 yılı aşkın klinik deneyimimle, iyileşmenin başladığı güvenli ve yargısız bir alan sunuyorum. Yaklaşımım bilişsel-davranışçı terapi, farkındalık teknikleri ve travma odaklı bakımı bir arada kullanmaktadır.",
              "Her bireyin yolculuğu eşsizdir. Birlikte, hayatın zorluklarını dayanıklılık ve netlikle aşmanızı sağlayacak kişiselleştirilmiş stratejiler geliştireceğiz.",
            ].map((text, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.6 + i * 0.15 }}
                className="text-muted-foreground font-body leading-relaxed mb-4"
              >
                {text}
              </motion.p>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1 }}
              className="flex gap-8 mt-8"
            >
              {[
                { num: "2000+", label: "Seans" },
                { num: "500+", label: "Danışan" },
                { num: "15+", label: "Yıl" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-display font-bold text-primary">{stat.num}</div>
                  <div className="text-sm text-muted-foreground font-body">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;