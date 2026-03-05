import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const methods = [
  {
    title: "Cognitive Behavioral Therapy (CBT)",
    desc: "CBT helps you identify and change negative thinking patterns and behaviors. Through structured sessions, you'll learn practical strategies to manage stress, anxiety, and depression by reshaping how you perceive and respond to challenging situations.",
  },
  {
    title: "Mindfulness-Based Therapy",
    desc: "Integrating mindfulness and meditation techniques into therapy to help you develop present-moment awareness. This approach reduces rumination, increases emotional regulation, and fosters a deeper connection with yourself.",
  },
  {
    title: "Trauma-Focused Therapy",
    desc: "Specialized treatment for trauma and PTSD using evidence-based approaches like EMDR. This gentle process helps you process traumatic experiences, reduce distressing symptoms, and reclaim your sense of safety and control.",
  },
  {
    title: "Family Systems Therapy",
    desc: "Understanding and improving family dynamics through systemic approaches. This method examines patterns of interaction within the family unit and works toward healthier communication and stronger relationships.",
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
            <span className="text-sm font-body font-semibold text-secondary uppercase tracking-widest">Approach</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-4 mb-6">
              Therapy Methods
            </h2>
            <p className="text-muted-foreground font-body leading-relaxed text-lg">
              I use a variety of evidence-based therapeutic approaches, carefully selected and combined to address your unique needs and goals.
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
