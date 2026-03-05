import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Brain, Heart, Users, CloudRain, Monitor } from "lucide-react";

const services = [
  { icon: Brain, title: "Bireysel Terapi", desc: "Kişisel gelişim hedeflerinize ve ihtiyaçlarınıza özel olarak tasarlanmış birebir seanslar." },
  { icon: Heart, title: "Çift Terapisi", desc: "Geliştirilmiş iletişim ve anlayış yoluyla ilişkinizi güçlendirin." },
  { icon: CloudRain, title: "Kaygı Tedavisi", desc: "Kaygıyı yönetmek ve hayatınızın kontrolünü yeniden ele almak için kanıta dayalı yaklaşımlar." },
  { icon: Users, title: "Depresyon Terapisi", desc: "Zor zamanlarda ışık ve motivasyon bulmanıza yardımcı olacak şefkatli destek." },
  { icon: Monitor, title: "Online Terapi", desc: "Güvenli video görüşmeleri ile evinizin konforunda profesyonel terapi." },
];

const ServicesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="services" className="py-32 bg-accent/50 relative noise-overlay" ref={ref}>
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="text-sm font-body font-semibold text-secondary uppercase tracking-widest">Hizmetler</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-4">
            Nasıl Yardımcı Olabilirim
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 * i, duration: 0.6 }}
              className="group glass rounded-2xl p-8 hover:shadow-elevated transition-all duration-500 hover:-translate-y-2 cursor-pointer"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                <service.icon className="w-7 h-7 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-3">{service.title}</h3>
              <p className="text-muted-foreground font-body leading-relaxed">{service.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;