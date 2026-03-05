import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const methods = [
  {
    title: "Bilişsel Davranışçı Terapi (BDT)",
    desc: "BDT, olumsuz düşünce kalıplarını ve davranışları belirlemenize ve değiştirmenize yardımcı olur. Yapılandırılmış seanslar aracılığıyla, zorlu durumları nasıl algıladığınızı ve bunlara nasıl tepki verdiğinizi yeniden şekillendirerek stres, kaygı ve depresyonu yönetmek için pratik stratejiler öğreneceksiniz.",
  },
  {
    title: "Farkındalık Temelli Terapi",
    desc: "Şu ana dair farkındalık geliştirmenize yardımcı olmak için farkındalık ve meditasyon tekniklerini terapiye entegre ediyorum. Bu yaklaşım ruminasyonu azaltır, duygusal düzenlemeyi artırır ve kendinizle daha derin bir bağ kurmanızı sağlar.",
  },
  {
    title: "Travma Odaklı Terapi",
    desc: "EMDR gibi kanıta dayalı yaklaşımlar kullanarak travma ve TSSB için özelleştirilmiş tedavi. Bu nazik süreç, travmatik deneyimleri işlemenize, sıkıntı verici belirtileri azaltmanıza ve güvenlik ve kontrol duygunuzu yeniden kazanmanıza yardımcı olur.",
  },
  {
    title: "Aile Sistemleri Terapisi",
    desc: "Sistemik yaklaşımlarla aile dinamiklerini anlama ve geliştirme. Bu yöntem, aile birimi içindeki etkileşim kalıplarını inceler ve daha sağlıklı iletişim ile daha güçlü ilişkilere doğru çalışır.",
  },
];

const MethodsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="methods" className="py-32" ref={ref}>
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
          >
            <span className="text-sm font-body font-semibold text-secondary uppercase tracking-widest">Yaklaşım</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-4 mb-6">
              Terapi Yöntemleri
            </h2>
            <p className="text-muted-foreground font-body leading-relaxed text-lg">
              Benzersiz ihtiyaçlarınıza ve hedeflerinize yönelik olarak özenle seçilmiş ve birleştirilmiş çeşitli kanıta dayalı terapötik yaklaşımlar kullanıyorum.
            </p>
          </motion.div>

          <div className="space-y-4">
            {methods.map((method, i) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 * i }}
                className="glass rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-display text-lg font-semibold text-foreground">{method.title}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-primary transition-transform duration-300 ${
                      openIndex === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 text-muted-foreground font-body leading-relaxed">
                        {method.desc}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MethodsSection;