import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Calendar, Clock, User, Mail, ArrowRight, Check, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const therapyTypes = ["Bireysel Terapi", "Çift Terapisi", "Kaygı Tedavisi", "Depresyon Terapisi", "Online Terapi"];
const timeSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

const AppointmentSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const steps = ["Terapi Türü", "Tarih ve Saat", "Bilgileriniz", "Onay"];

  const canProceed = () => {
    if (step === 0) return !!selectedType;
    if (step === 1) return !!selectedDate && !!selectedTime;
    if (step === 2) return !!name && !!email;
    return true;
  };

  const handleNext = async () => {
    if (step === 2) {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('appointments')
          .insert([
            {
              full_name: name,
              email: email,
              type: selectedType,
              date: selectedDate,
              time: selectedTime,
              status: 'Gelecek'
            }
          ]);

        if (error) throw error;
        setStep(3);
      } catch (err) {
        console.error("Randevu kaydedilemedi:", err);
        alert("Randevu kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.");
      } finally {
        setLoading(false);
      }
    } else {
      setStep(step + 1);
    }
  };

  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  }).filter((d) => d.getDay() !== 0 && d.getDay() !== 6);

  return (
    <section id="appointment" className="py-32 bg-accent/50 relative noise-overlay" ref={ref}>
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="text-sm font-body font-semibold text-secondary uppercase tracking-widest">Randevu</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-4">
            Randevunuzu Alın
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-2 mb-12">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-body font-medium transition-all duration-300 ${i <= step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                    }`}
                >
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-8 h-0.5 transition-colors duration-300 ${i < step ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>

          <div className="glass-strong rounded-3xl p-8 md:p-12">
            {/* Step 0: Therapy Type */}
            {step === 0 && (
              <div className="space-y-3">
                <h3 className="font-display text-xl font-semibold text-foreground mb-6">Terapi türünü seçin</h3>
                {therapyTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`w-full text-left p-4 rounded-xl font-body transition-all duration-300 ${selectedType === type
                      ? "bg-primary/10 dark:bg-primary/20 border-2 border-primary/30 dark:border-primary/50 text-foreground"
                      : "glass hover:shadow-soft text-foreground"
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}

            {/* Step 1: Date & Time */}
            {step === 1 && (
              <div className="space-y-8">
                <div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" /> Tarih Seçin
                  </h3>
                  <div className="grid grid-cols-5 gap-2">
                    {dates.slice(0, 10).map((d) => {
                      const key = d.toISOString().split("T")[0];
                      return (
                        <button
                          key={key}
                          onClick={() => setSelectedDate(key)}
                          className={`p-3 rounded-xl text-center font-body text-sm transition-all duration-300 ${selectedDate === key
                            ? "bg-primary text-primary-foreground"
                            : "glass hover:shadow-soft text-foreground"
                            }`}
                        >
                          <div className="font-medium">{d.toLocaleDateString("tr-TR", { weekday: "short" })}</div>
                          <div className="text-lg font-semibold">{d.getDate()}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" /> Saat Seçin
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-3 rounded-xl font-body text-sm transition-all duration-300 ${selectedTime === time
                          ? "bg-primary text-primary-foreground"
                          : "glass hover:shadow-soft text-foreground"
                          }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="font-display text-xl font-semibold text-foreground mb-6">Bilgileriniz</h3>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Ad Soyad"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl glass font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-300"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="E-posta Adresi"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl glass font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-300"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mx-auto">
                  <Check className="w-10 h-10 text-secondary" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-foreground">Randevunuz Onaylandı!</h3>
                <div className="glass rounded-xl p-6 text-left space-y-2 font-body">
                  <p className="text-muted-foreground"><strong className="text-foreground">Tür:</strong> {selectedType}</p>
                  <p className="text-muted-foreground"><strong className="text-foreground">Tarih:</strong> {selectedDate}</p>
                  <p className="text-muted-foreground"><strong className="text-foreground">Saat:</strong> {selectedTime}</p>
                  <p className="text-muted-foreground"><strong className="text-foreground">İsim:</strong> {name}</p>
                  <p className="text-muted-foreground"><strong className="text-foreground">E-posta:</strong> {email}</p>
                </div>
              </div>
            )}

            {/* Navigation */}
            {step < 3 && (
              <div className="flex justify-between mt-8">
                {step > 0 ? (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="px-6 py-3 rounded-full glass font-body font-medium text-foreground hover:shadow-soft transition-all duration-300"
                  >
                    Geri
                  </button>
                ) : (
                  <div />
                )}
                <button
                  onClick={handleNext}
                  disabled={!canProceed() || loading}
                  className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-body font-medium flex items-center gap-2 hover:shadow-elevated transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {step === 2 ? "Onayla" : "İleri"} <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AppointmentSection;