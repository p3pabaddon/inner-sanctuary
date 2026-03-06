import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ShieldCheck, Scale, FileText, Lock } from "lucide-react";

const complianceItems = [
    {
        icon: ShieldCheck,
        title: "Mesleki Etik Kurallar",
        desc: "Türk Psikologlar Derneği (TPD) tarafından belirlenen mesleki etik ilkelere tam uyum sağlıyorum. Dürüstlük, gizlilik ve danışan refahı temel önceliğimdir.",
    },
    {
        icon: Lock,
        title: "Gizlilik ve Güvenlik",
        desc: "Tüm seanslar ve kayıtlar en üst düzeyde gizlilik prensibiyle korunur. Paylaştığınız bilgiler, yasal zorunluluklar dışında asla üçüncü taraflarla paylaşılmaz.",
    },
    {
        icon: Scale,
        title: "KVKK Uyumluluğu",
        desc: "Kişisel verileriniz 6698 sayılı Kişisel Verilerin Korunması Kanunu'na uygun olarak işlenmekte ve güvenli bir şekilde muhafaza edilmektedir.",
    },
    {
        icon: FileText,
        title: "Bilgilendirilmiş Onam",
        desc: "Terapi süreci başlamadan önce süreç, yöntemler ve haklarınız konusunda detaylı olarak bilgilendirilir ve onayınız alınır.",
    },
];

const ComplianceSection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });

    return (
        <section id="compliance" className="py-32 bg-accent/30" ref={ref}>
            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-sm font-body font-semibold text-secondary uppercase tracking-widest">Güven & Etik</span>
                        <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-4 mb-6 leading-tight">
                            Güvenli ve Etik Bir <br /> Alan İnşası
                        </h2>
                        <p className="text-muted-foreground font-body leading-relaxed text-lg mb-8">
                            Psikolojik danışmanlık süreci karşılıklı güven üzerine kuruludur. Mesleki standartlara ve yasal mevzuata tam uyum sağlayarak, kendinizi güvende hissedeceğiniz bir ortam sunuyorum.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <div className="px-6 py-3 rounded-full glass border-border text-sm font-body font-medium flex items-center gap-2">
                                <ShieldCheck size={18} className="text-secondary" /> TPD Etik Yönetmeliği
                            </div>
                            <div className="px-6 py-3 rounded-full glass border-border text-sm font-body font-medium flex items-center gap-2">
                                <Lock size={18} className="text-secondary" /> KVKK Uyumlu
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 gap-6">
                        {complianceItems.map((item, i) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ delay: 0.2 + (i * 0.1) }}
                                className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm p-8 rounded-2xl border border-white dark:border-zinc-800 hover:border-primary/20 hover:shadow-md transition-all duration-500"
                            >
                                <div className="w-12 h-12 bg-accent dark:bg-zinc-800 rounded-xl flex items-center justify-center mb-6 text-secondary dark:text-primary transition-colors">
                                    <item.icon size={24} />
                                </div>
                                <h3 className="text-xl font-display font-bold text-foreground mb-3">{item.title}</h3>
                                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ComplianceSection;
