import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "What should I expect during my first session?", a: "Your first session is an opportunity for us to get to know each other. We'll discuss your concerns, goals, and history in a relaxed, non-judgmental setting. This helps me create a personalized treatment plan tailored to your needs." },
  { q: "How long does each therapy session last?", a: "Standard sessions are 50 minutes. The initial assessment session may run slightly longer at 60-75 minutes to ensure we have enough time to understand your needs thoroughly." },
  { q: "Is everything I share kept confidential?", a: "Absolutely. Confidentiality is the cornerstone of our therapeutic relationship. Everything discussed in sessions is strictly confidential, with only rare legal exceptions that I'll explain during our first meeting." },
  { q: "How many sessions will I need?", a: "The duration of therapy varies based on your unique situation and goals. Some clients see significant improvement in 8-12 sessions, while others benefit from longer-term support. We'll regularly review your progress together." },
  { q: "Do you offer online therapy sessions?", a: "Yes, I offer secure online video sessions that are just as effective as in-person therapy. This option provides flexibility and accessibility, especially for those with busy schedules or mobility concerns." },
  { q: "What are your fees and do you accept insurance?", a: "Please contact me directly for current fee information. I work with several insurance providers and can also offer sliding scale fees in certain circumstances to ensure therapy remains accessible." },
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
          <span className="text-sm font-body font-semibold text-secondary uppercase tracking-widest">FAQ</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-4">
            Common Questions
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
