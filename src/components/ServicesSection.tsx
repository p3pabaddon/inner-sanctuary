import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Brain, Heart, Users, CloudRain, Monitor, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

const staticServices = [
  { icon: Brain, title: "Bireysel Terapi", desc: "Kişisel gelişim hedeflerinize ve ihtiyaçlarınıza özel olarak tasarlanmış birebir seanslar." },
  { icon: Heart, title: "Çift Terapisi", desc: "Geliştirilmiş iletişim ve anlayış yoluyla ilişkinizi güçlendirin." },
  { icon: CloudRain, title: "Kaygı Tedavisi", desc: "Kaygıyı yönetmek ve hayatınızın kontrolünü yeniden ele almak için kanıta dayalı yaklaşımlar." },
  { icon: Users, title: "Depresyon Terapisi", desc: "Zor zamanlarda ışık ve motivasyon bulmanıza yardımcı olacak şefkatli destek." },
  { icon: Monitor, title: "Online Terapi", desc: "Güvenli video görüşmeleri ile evinizin konforunda profesyonel terapi." },
];

const iconMap: { [key: string]: any } = {
  "Bireysel Terapi": Brain,
  "Çift Terapisi": Heart,
  "Kaygı Tedavisi": CloudRain,
  "Depresyon Terapisi": Users,
  "Online Terapi": Monitor,
};

const ServicesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [liveServices, setLiveServices] = useState<any[]>(staticServices);

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("name");

    if (!error && data && data.length > 0) {
      setLiveServices(data.map((s: any) => ({
        icon: iconMap[s.name] || Sparkles,
        title: s.name,
        desc: s.description || "Profesyonel terapi desteği.",
        price: s.price,
        duration: s.duration
      })));
    } else {
      setLiveServices(staticServices);
    }
  };

  useEffect(() => {
    fetchServices();

    const subscription = supabase
      .channel('services-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, () => {
        fetchServices();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <section id="services" className="py-32 bg-accent/50 relative noise-overlay" ref={ref}>
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="text-sm font-body font-semibold text-secondary uppercase tracking-widest">Hizmetler</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-4 leading-tight">
            Nasıl Yardımcı <span className="italic text-secondary">Olabilirim?</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveServices.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 * i, duration: 0.6 }}
              whileHover={{ y: -8 }}
              className="group glass rounded-[2.5rem] p-10 hover:shadow-2xl hover:shadow-secondary/10 transition-all duration-500 cursor-pointer border border-white/5 hover:border-secondary/20 h-full flex flex-col"
            >
              <div className="w-16 h-16 rounded-[1.25rem] bg-secondary/10 flex items-center justify-center mb-8 group-hover:bg-secondary/20 transition-all duration-500 ring-1 ring-secondary/20">
                <service.icon className="w-8 h-8 text-secondary group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h3 className="text-2xl font-display font-bold text-foreground mb-4 group-hover:text-secondary transition-colors">{service.title}</h3>
              <p className="text-muted-foreground font-body leading-relaxed flex-1">{service.desc}</p>

              {service.price && (
                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{service.duration ? `${service.duration} DK SEANS` : 'UZMAN DESTEĞİ'}</span>
                  <span className="text-lg font-display font-black text-secondary">₺{service.price}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
