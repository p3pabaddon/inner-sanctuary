import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ClipboardCheck, ArrowRight, RefreshCcw, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const questions = [
    {
        question: "Son 2 hafta içinde ne sıklıkla kendinizi sinirli, kaygılı veya çok gergin hissettiniz?",
        options: ["Hiç", "Birkaç gün", "Günlerin yarısından fazlası", "Neredeyse her gün"]
    },
    {
        question: "Ne sıklıkla kaygılanmayı durduramadınız veya kontrol edemediniz?",
        options: ["Hiç", "Birkaç gün", "Günlerin yarısından fazlası", "Neredeyse her gün"]
    },
    {
        question: "Ne sıklıkla çok farklı şeyler hakkında aşırı derecede kaygılandınız?",
        options: ["Hiç", "Birkaç gün", "Günlerin yarısından fazlası", "Neredeyse her gün"]
    },
    {
        question: "Ne sıklıkla rahatlamakta (gevşemekte) zorluk çektiniz?",
        options: ["Hiç", "Birkaç gün", "Günlerin yarısından fazlası", "Neredeyse her gün"]
    }
];

const AssessmentSection = () => {
    const [currentStep, setCurrentStep] = useState(-1);
    const [answers, setAnswers] = useState<number[]>([]);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });
    }, []);

    const handleStart = () => setCurrentStep(0);

    const handleAnswer = async (optionIndex: number) => {
        const newAnswers = [...answers, optionIndex];
        setAnswers(newAnswers);

        if (currentStep < questions.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // Test finished, save to Supabase
            setLoading(true);
            const score = newAnswers.reduce((a, b) => a + b, 0);
            const resultLabel = score < 4 ? "Düşük Düzey" : score < 8 ? "Orta Düzey" : "Yüksek Düzey";

            try {
                await supabase.from('test_results').insert([
                    {
                        client_id: user?.id || null,
                        score: score,
                        result_label: resultLabel,
                        answers: newAnswers
                    }
                ]);
            } catch (err) {
                console.error("Test sonucu kaydedilemedi:", err);
            }

            setLoading(false);
            setShowResult(true);
        }
    };

    const resetTest = () => {
        setCurrentStep(-1);
        setAnswers([]);
        setShowResult(false);
    };

    const calculateScore = () => {
        const sum = answers.reduce((a, b) => a + b, 0);
        if (sum < 4) return { label: "Düşük Düzey", desc: "Şu anki belirtileriniz günlük hayatınızı ciddi düzeyde etkilemiyor gibi görünüyor. Yine de kendinize vakit ayırmak önemlidir." };
        if (sum < 8) return { label: "Orta Düzey", desc: "Bazı kaygı belirtileri yaşıyor olabilirsiniz. Bir uzmanla görüşmek farkındalığınızı artırabilir." };
        return { label: "Yüksek Düzey", desc: "Yaşadığınız yoğunluk günlük kalitenizi etkiliyor olabilir. Profesyonel bir destek almak size iyi gelecektir." };
    };

    const result = showResult ? calculateScore() : null;

    return (
        <section id="assessment" className="py-32 relative overflow-hidden" ref={ref}>
            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        className="text-sm font-body font-semibold text-secondary uppercase tracking-widest"
                    >
                        Farkındalık Testi
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-display font-bold text-foreground mt-4 mb-6"
                    >
                        Öz-Değerlendirme Testi
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground font-body leading-relaxed text-lg"
                    >
                        Duygusal durumunuzu daha iyi anlamak için bu kısa testi çözebilirsiniz. Bu test tanı koyma amacı taşımaz, sadece bir farkındalık aracıdır.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.3 }}
                    className="glass-strong rounded-[2rem] p-8 md:p-12 shadow-elevated max-w-2xl mx-auto min-h-[400px] flex flex-col justify-center"
                >
                    <AnimatePresence mode="wait">
                        {currentStep === -1 && (
                            <motion.div
                                key="start"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="text-center"
                            >
                                <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-8 transition-colors">
                                    <ClipboardCheck className="text-secondary w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-display font-bold mb-4">Kaygı ve Stres Ölçeği</h3>
                                <p className="text-muted-foreground font-body mb-8">
                                    4 sorudan oluşan bu kısa test yaklaşık 1 dakikanızı alacaktır.
                                </p>
                                <button
                                    onClick={handleStart}
                                    className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium flex items-center gap-2 mx-auto hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
                                >
                                    Teste Başla <ArrowRight size={18} />
                                </button>
                            </motion.div>
                        )}

                        {currentStep >= 0 && !showResult && (
                            <motion.div
                                key={`q-${currentStep}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="w-full"
                            >
                                <div className="text-sm font-body font-semibold text-secondary mb-2">
                                    Soru {currentStep + 1} / {questions.length}
                                </div>
                                <h3 className="text-xl md:text-2xl font-display font-medium mb-8 leading-tight">
                                    {questions[currentStep].question}
                                </h3>
                                <div className="grid gap-3">
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                                            <p className="text-muted-foreground font-body">Sonuçlarınız hesaplanıyor ve kaydediliyor...</p>
                                        </div>
                                    ) : (
                                        questions[currentStep].options.map((option, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleAnswer(idx)}
                                                className="w-full p-4 rounded-xl border-muted bg-white/50 dark:bg-zinc-800/20 hover:bg-white dark:hover:bg-zinc-800/40 hover:border-primary hover:text-primary transition-all duration-300 text-left font-body text-sm md:text-base group shadow-sm"
                                            >
                                                <div className="flex items-center justify-between">
                                                    {option}
                                                    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {showResult && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center"
                            >
                                <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-8">
                                    <CheckCircle2 className="text-green-500 w-10 h-10" />
                                </div>
                                <h3 className="text-sm font-body font-semibold text-secondary uppercase tracking-widest mb-2">Sonuç</h3>
                                <h4 className="text-3xl font-display font-bold text-foreground mb-4">{result?.label}</h4>
                                <p className="text-muted-foreground font-body mb-8">
                                    {result?.desc}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <a
                                        href="#appointment"
                                        className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
                                    >
                                        Ücretsiz Ön Görüşme Yap
                                    </a>
                                    <button
                                        onClick={resetTest}
                                        className="px-8 py-4 rounded-full glass border-muted text-foreground font-medium flex items-center gap-2 justify-center hover:bg-white/50 transition-all duration-300"
                                    >
                                        <RefreshCcw size={18} /> Testi Tekrarla
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Background Decor */}
            <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] translate-y-1/2 translate-x-1/2" />
        </section>
    );
};

export default AssessmentSection;
