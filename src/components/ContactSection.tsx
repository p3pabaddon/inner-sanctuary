import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";

const ContactSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="contact" className="py-32 bg-accent/50 relative noise-overlay" ref={ref}>
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="text-sm font-body font-semibold text-secondary uppercase tracking-widest">Contact</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-4">
            Get in Touch
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            {[
              { icon: MapPin, label: "Address", value: "123 Wellness Street, Suite 4B\nIstanbul, Turkey 34000" },
              { icon: Phone, label: "Phone", value: "+90 (212) 555-0184" },
              { icon: Mail, label: "Email", value: "info@mindcare.com" },
            ].map((item) => (
              <div key={item.label} className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-body font-semibold text-foreground">{item.label}</div>
                  <div className="text-muted-foreground font-body whitespace-pre-line">{item.value}</div>
                </div>
              </div>
            ))}

            <div className="flex gap-3 pt-4">
              <a
                href="https://wa.me/902125550184"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center hover:bg-[#25D366]/20 transition-colors duration-300 hover:-translate-y-1 hover:shadow-soft"
              >
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
              </a>
              <a
                href="mailto:info@mindcare.com"
                className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors duration-300 hover:-translate-y-1 hover:shadow-soft"
              >
                <Mail className="w-5 h-5 text-primary" />
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="rounded-2xl overflow-hidden shadow-card h-80 md:h-auto"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3009.0977!2d28.9784!3d41.0082!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDAwJzI5LjUiTiAyOMKwNTgnNDIuMiJF!5e0!3m2!1sen!2str!4v1600000000000!5m2!1sen!2str"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: 320 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Office Location"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
