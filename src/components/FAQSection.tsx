import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "İlk seansta neler beklemeliyim?", a: "İlk seansınız birbirimizi tanıma fırsatıdır. Endişelerinizi, hedeflerinizi ve geçmişinizi rahat ve yargısız bir ortamda konuşacağız. Bu, ihtiyaçlarınıza özel kişiselleştirilmiş bir tedavi planı oluşturmama yardımcı olur." },
  { q: "Her terapi seansı ne kadar sürer?", a: "Standart seanslar 50 dakikadır. İlk değerlendirme seansı, ihtiyaçlarınızı kapsamlı bir şekilde anlamamız için yeterli zaman olması adına 60-75 dakika sürebilir." },
  { q: "Paylaştığım her şey gizli kalır mı?", a: "Kesinlikle. Gizlilik, terapötik ilişkimizin temel taşıdır. Seanslarda tartışılan her şey kesinlikle gizli tutulur, yalnızca ilk görüşmemizde açıklayacağım nadir yasal istisnalar vardır." },
  { q: "Kaç seansa ihtiyacım olacak?", a: "Terapinin süresi, benzersiz durumunuza ve hedeflerinize bağlı olarak değişir. Bazı danışanlar 8-12 seansta önemli iyileşme görürken, diğerleri daha uzun süreli destekten fayda görür. İlerlemenizi birlikte düzenli olarak değerlendireceğiz." },
  { q: "Online terapi seansı sunuyor musunuz?", a: "Evet, yüz yüze terapi kadar etkili olan güvenli online video seansları sunuyorum. Bu seçenek, özellikle yoğun programları olanlar veya ulaşım sorunu yaşayanlar için esneklik ve erişilebilirlik sağlar." },
  { q: "Ücretleriniz nedir ve sigorta kabul ediyor musunuz?", a: "Güncel ücret bilgisi için lütfen doğrudan benimle iletişime geçin. Birçok sigorta kurumuyla çalışıyorum ve terapinin erişilebilir kalmasını sağlamak için belirli durumlarda esnek ücret seçenekleri de sunabilirim." },
];

const FAQSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-32" ref={ref}>
      <div className="container mx-auto px-6 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="text-sm font-body font-semibold text-secondary uppercase tracking-widest">SSS</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-4">
            Sık Sorulan Sorular
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.08 * i }}
              className="glass rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-body font-medium text-foreground pr-4">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-primary shrink-0 transition-transform duration-300 ${openIndex === i ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 text-muted-foreground font-body leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;