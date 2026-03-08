import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Download, FileText, CheckCircle2, Sparkles } from "lucide-react";

const guides = [
    {
        title: "Kaygı ile Başa Çıkma Rehberi",
        desc: "Günlük hayatta anksiyeteyi yönetmek için 5 pratik teknik.",
        icon: <FileText size={40} className="text-orange-500" />,
        color: "from-orange-500/20 to-secondary/10",
    },
    {
        title: "Özgüven Geliştirme El Kitabı",
        desc: "Kendinize olan inancınızı artırmak için bilimsel yaklaşımlar.",
        icon: <Sparkles size={40} className="text-rose-500" />,
        color: "from-rose-500/20 to-pink-500/10",
    },
];

const GuideSection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section className="py-32 relative overflow-hidden" ref={ref}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-secondary/5 blur-[120px] rounded-full -z-10" />

            <div className="container mx-auto px-6">
                <div className="glass backdrop-blur-3xl border-muted rounded-[4rem] p-12 md:p-20 overflow-hidden relative shadow-elevated">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="flex items-center gap-3 text-secondary mb-6">
                                <Sparkles size={24} />
                                <span className="text-sm font-black uppercase tracking-[0.3em]">ÜCRETSİZ KAYNAKLAR</span>
                            </div>
                            <h2 className="text-5xl md:text-7xl font-display font-black text-foreground mb-8 tracking-tighter leading-tight">
                                Zihinsel <span className="italic text-secondary">Dengeyi</span> Bulmanız İçin Rehberler
                            </h2>
                            <p className="text-muted-foreground font-body text-xl mb-12 leading-relaxed">
                                Kendi hızınızda iyileşmeye başlamanız için hazırladığım ücretsiz uzman rehberlerini indirin.
                            </p>

                            <ul className="space-y-6 mb-12">
                                {["Tamamen bilimsel temelli yaklaşımlar", "Pratik ve uygulanabilir egzersizler", "Uzman görüşleri ve öneriler"].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-4 text-foreground font-medium font-body">
                                        <CheckCircle2 className="text-secondary" size={24} /> {item}
                                    </li>
                                ))}
                            </ul>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <input
                                    type="email"
                                    placeholder="E-posta adresiniz..."
                                    className="px-8 py-5 rounded-2xl glass border-muted focus:border-secondary outline-none transition-all flex-1 font-body text-foreground"
                                />
                                <button className="px-10 py-5 bg-secondary text-white rounded-2xl font-black uppercase tracking-widest hover:bg-secondary/90 transition-all shadow-xl shadow-secondary/20">
                                    REHBERLERİ AL
                                </button>
                            </div>
                        </motion.div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            {guides.map((guide, i) => (
                                <motion.div
                                    key={guide.title}
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ delay: 0.4 + (i * 0.2), duration: 0.8 }}
                                    whileHover={{ y: -15, scale: 1.05 }}
                                    className={`bg-gradient-to-br ${guide.color} border-muted rounded-[3rem] p-10 flex flex-col justify-between aspect-[3/4] group transition-all duration-500 shadow-card`}
                                >
                                    <div>
                                        <div className="bg-white/20 dark:bg-black/40 p-5 rounded-[1.5rem] w-fit mb-8 group-hover:bg-white/30 dark:group-hover:bg-black/60 transition-colors">
                                            {guide.icon}
                                        </div>
                                        <h4 className="text-2xl font-display font-black text-foreground leading-tight mb-4">
                                            {guide.title}
                                        </h4>
                                        <p className="text-muted-foreground font-body text-sm">
                                            {guide.desc}
                                        </p>
                                    </div>

                                    <button className="flex items-center justify-center gap-3 w-full py-4 glass-strong dark:bg-white/10 dark:backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white dark:hover:bg-white text-foreground transition-all">
                                        <Download size={16} /> İNDİR (.PDF)
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GuideSection;
