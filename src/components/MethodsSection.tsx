import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Brain, Heart, Milestone, Users, ArrowRight } from "lucide-react";

const methods = [
  {
    title: "Bilişsel Davranışçı Terapi (BDT)",
    desc: "Olumsuz düşünce kalıplarını belirleyip değiştirerek stres ve kaygıyı yönetmek için pratik stratejiler sunar.",
    icon: <Brain className="text-secondary" size={32} />,
    color: "from-orange-500/20 to-secondary/10",
  },
  {
    title: "Farkındalık (Mindfulness)",
    desc: "Şu ana odaklanarak duygusal düzenlemeyi artıran ve kendinizle derin bağ kurmanızı sağlayan teknikler.",
    icon: <Heart className="text-rose-500" size={32} />,
    color: "from-rose-500/20 to-pink-500/10",
  },
  {
    title: "Travma Odaklı Terapi (EMDR)",
    desc: "Travmatik deneyimleri işleyerek sıkıntı verici belirtileri azaltan ve kontrol duygunuzu geri kazandıran süreç.",
    icon: <Milestone className="text-emerald-500" size={32} />,
    color: "from-emerald-500/20 to-teal-500/10",
  },
  {
    title: "Aile Sistemleri Terapisi",
    desc: "Sistemik Yaklaşımlarla aile içi etkileşim kalıplarını iyileştiren ve iletişimi güçlendiren yöntemler.",
    icon: <Users className="text-blue-500" size={32} />,
    color: "from-blue-500/20 to-indigo-500/10",
  },
];

const MethodsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="methods" className="py-32 bg-accent/30 relative noise-overlay" ref={ref}>
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="text-sm font-black text-secondary uppercase tracking-[0.3em] block mb-4 font-body"
          >
            YAKLAŞIM VE METOTLAR
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-black text-foreground mb-8 tracking-tighter"
          >
            İyileşme <span className="italic text-secondary">Yolculuğunuzda</span> Bilimsel Temeller
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground font-body text-xl leading-relaxed"
          >
            Her bireyin hikayesi benzersizdir. Bu yüzden tedavinizi size en uygun, kanıta dayalı yöntemlerle kişiselleştiriyorum.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {methods.map((method, i) => (
            <motion.div
              key={method.title}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
              whileHover={{ y: -10 }}
              className="group relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${method.color} rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative h-full glass backdrop-blur-xl border-muted p-10 rounded-[2.5rem] flex flex-col justify-between hover:border-secondary/20 transition-all duration-500 shadow-card">
                <div>
                  <div className="mb-8 p-4 bg-secondary/10 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-500 group-hover:bg-secondary/20">
                    {method.icon}
                  </div>
                  <h3 className="text-2xl font-display font-bold text-foreground mb-4 leading-tight">
                    {method.title}
                  </h3>
                  <p className="text-muted-foreground font-body leading-relaxed text-sm">
                    {method.desc}
                  </p>
                </div>

                <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-secondary group-hover:gap-4 transition-all opacity-0 group-hover:opacity-100 cursor-pointer">
                  DETAYLI İNCELE <ArrowRight size={14} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-20 p-12 bg-gradient-to-r from-secondary/5 via-transparent to-secondary/5 rounded-[3rem] border border-muted text-center"
        >
          <p className="text-muted-foreground italic font-body max-w-2xl mx-auto">
            "Sadece semptomları değil, kök nedenleri anlamaya odaklanan bir bütünsel yaklaşımla çalışıyoruz."
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default MethodsSection;
