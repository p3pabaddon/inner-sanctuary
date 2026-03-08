import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

const ContactSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const contactInfos = [
    { icon: MapPin, label: "Adres", value: "Valikonağı Cd. No: 45, Kat: 2\nNişantaşı, İstanbul" },
    { icon: Phone, label: "Telefon", value: "+90 (212) 555 78 90" },
    { icon: Mail, label: "E-posta", value: "bilgi@dengeterapi.com.tr" },
  ];

  return (
    <section id="contact" className="py-32 bg-background relative noise-overlay" ref={ref}>
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="text-sm font-body font-semibold text-secondary uppercase tracking-widest">İletişim</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-4">
            Bize Ulaşın
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              {contactInfos.map((item, index) => (
                <div key={index} className="flex gap-4 p-4 rounded-2xl glass border-muted shadow-sm backdrop-blur-sm">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-body font-semibold text-foreground">{item.label}</div>
                    <div className="text-muted-foreground font-body whitespace-pre-line">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <a
                href="https://wa.me/905000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center hover:bg-[#25D366]/20 transition-colors duration-300 hover:-translate-y-1"
              >
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
              </a>
              <a
                href="mailto:bilgi@dengeterapi.com.tr"
                className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors duration-300 hover:-translate-y-1"
              >
                <Mail className="w-5 h-5 text-primary" />
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="glass p-8 rounded-3xl border-muted shadow-soft backdrop-blur-lg"
          >
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid md:grid-cols-2 gap-4">
                <Input placeholder="Adınız" className="bg-white/10 dark:bg-zinc-800/50 border-muted focus:border-primary" />
                <Input placeholder="E-posta" type="email" className="bg-white/10 dark:bg-zinc-800/50 border-muted focus:border-primary" />
              </div>
              <Input placeholder="Konu" className="bg-white/10 dark:bg-zinc-800/50 border-muted focus:border-primary" />
              <Textarea placeholder="Mesajınız..." className="min-h-[120px] bg-white/10 dark:bg-zinc-800/50 border-muted focus:border-primary" />
              <Button className="w-full h-12 text-lg font-medium">Mesaj Gönder</Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;