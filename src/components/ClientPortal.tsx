import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    User,
    Lock,
    X,
    FileText,
    TrendingUp,
    Calendar,
    Download,
    LogOut,
    ChevronRight,
    MessageSquare,
    RefreshCcw,
    Circle,
    Smile,
    Meh,
    Frown,
    CloudRain,
    Zap,
    ChevronDown,
    Menu
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ClientPortalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ClientPortal = ({ isOpen, onClose }: ClientPortalProps) => {
    const [user, setUser] = useState<any>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [loading, setLoading] = useState(false);
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [message, setMessage] = useState("");
    const [dashboardData, setDashboardData] = useState<any>({
        progress: 0,
        nextSession: "Yükleniyor...",
        recentNotes: [],
        documents: [],
        sessions: [],
        messages: [],
        moodHistory: []
    });
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [moodNote, setMoodNote] = useState("");
    const [isLoggingMood, setIsLoggingMood] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        // Body scroll lock
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Check session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setUser(session.user);
                setIsLoggedIn(true);
                fetchPortalData(session.user.id);
            }
        });

        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setUser(session.user);
                setIsLoggedIn(true);
                fetchPortalData(session.user.id);
            } else {
                setUser(null);
                setIsLoggedIn(false);
            }
        });

        // Realtime Messages Subscription
        let messageSubscription: any;
        if (isLoggedIn && user) {
            messageSubscription = supabase
                .channel('realtime-messages')
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_id=eq.${user.id}`
                }, (payload) => {
                    const newMessage = {
                        sender: payload.new.sender_role,
                        text: payload.new.text,
                        time: new Date(payload.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                    setDashboardData((prev: any) => ({
                        ...prev,
                        messages: [...prev.messages, newMessage]
                    }));
                })
                .subscribe();
        }

        // Activity Heartbeat (last_seen)
        let activityInterval: any;
        if (isLoggedIn && user) {
            const updateActivity = async () => {
                await supabase
                    .from('profiles')
                    .update({ last_seen: new Date().toISOString() })
                    .eq('id', user.id);
            };
            updateActivity();
            activityInterval = setInterval(updateActivity, 30000); // Every 30 seconds
        }

        // Supabase Presence for Online Status
        let presenceChannel: any;
        if (isLoggedIn && user) {
            presenceChannel = supabase.channel('online-users', {
                config: {
                    presence: {
                        key: user.id,
                    },
                },
            });

            presenceChannel
                .subscribe(async (status: string) => {
                    if (status === 'SUBSCRIBED') {
                        await presenceChannel.track({
                            user_id: user.id,
                            online_at: new Date().toISOString(),
                        });
                    }
                });
        }

        return () => {
            document.body.style.overflow = 'unset';
            authSubscription.unsubscribe();
            if (messageSubscription) supabase.removeChannel(messageSubscription);
            if (presenceChannel) supabase.removeChannel(presenceChannel);
            if (activityInterval) clearInterval(activityInterval);
        };
    }, [isOpen, isLoggedIn, user?.id]);

    const fetchPortalData = async (userId: string) => {
        setLoading(true);
        try {
            // 1. Fetch Profile (Progress & Next Session)
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            // 2. Fetch Documents
            const { data: docs } = await supabase
                .from('documents')
                .select('*')
                .eq('client_id', userId)
                .order('created_at', { ascending: false });

            // 3. Fetch Messages
            const { data: msgs } = await supabase
                .from('messages')
                .select('*')
                .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
                .order('created_at', { ascending: true });

            // 4. Fetch Mood Logs
            const { data: moodLogs } = await supabase
                .from('mood_logs')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(7);

            // 5. Fetch Upcoming Appointment
            const { data: upcomingApp } = await supabase
                .from('appointments')
                .select('*')
                .eq('client_id', userId)
                .gte('date', new Date().toISOString().split('T')[0])
                .order('date', { ascending: true })
                .order('time', { ascending: true })
                .limit(1)
                .maybeSingle();

            const nextSessionStr = upcomingApp
                ? `${new Date(upcomingApp.date).toLocaleDateString('tr-TR')} saat ${upcomingApp.time.slice(0, 5)}`
                : "Henüz planlanmadı";

            setDashboardData({
                progress: profile?.progress || 0,
                nextSession: nextSessionStr,
                recentNotes: [],
                documents: docs || [],
                sessions: [],
                messages: msgs?.map(m => ({
                    sender: m.sender_role,
                    text: m.text,
                    time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                })) || [],
                moodHistory: moodLogs || []
            });
        } catch (error) {
            console.error("Portal data fetch error:", error);
        } finally {
            setLoading(false);
        }
    };
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                alert("Giriş Hatası: " + error.message);
            }
        } catch (err) {
            console.error(err);
            alert("Beklenmedik bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("🚀 Kayıt işlemi başlatılıyor...", { email, fullName });
        if (!fullName.trim()) return alert("Lütfen ad soyad girin.");

        setLoading(true);
        try {
            const { error, data } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        is_admin: false
                    }
                }
            });

            console.log("📦 Supabase signUp yanıtı:", { data, error });

            if (error) {
                alert("Kayıt Hatası: " + error.message);
            } else if (data.user) {
                if (data.session === null) {
                    setIsVerifying(true);
                    console.log("✅ Doğrulama moduna geçiş (isVerifying = true)");
                    alert("Kayıt başarılı! Lütfen e-postanıza gelen 6 haneli kodu girin.");
                } else {
                    alert("Kayıt başarılı! Giriş yapıldı.");
                }
            } else {
                console.warn("⚠️ data.user boş döndü.");
                alert("Kullanıcı oluşturulamadı. Lütfen farklı bir e-posta deneyin.");
            }
        } catch (err) {
            console.error("❌ Catch error in handleSignup:", err);
            alert("Kayıt sırasında teknik bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("🔑 Kod doğrulanıyor...", { email, token: otpCode });
        setLoading(true);
        try {
            const { error, data } = await supabase.auth.verifyOtp({
                email,
                token: otpCode,
                type: 'signup',
            });

            console.log("📦 Supabase verifyOtp yanıtı:", { data, error });

            if (error) {
                alert("Doğrulama Hatası: " + error.message);
            } else {
                alert("Doğrulama başarılı! Hoş geldiniz.");
                setIsVerifying(false);
                setIsSignup(false);
            }
        } catch (err) {
            console.error("❌ Catch error in handleVerifyOtp:", err);
            alert("Doğrulama sırasında bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsLoggedIn(false);
    };

    const sendMessage = async () => {
        if (!message.trim() || !user) return;

        const { error } = await supabase.from('messages').insert([
            {
                text: message,
                sender_id: user.id,
                receiver_id: '00000000-0000-0000-0000-000000000000', // Default admin ID placeholder
                sender_role: 'User'
            }
        ]);

        if (!error) {
            const newMessage = {
                sender: "User",
                text: message,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setDashboardData((prev: any) => ({
                ...prev,
                messages: [...prev.messages, newMessage]
            }));
            setMessage("");
        }
    };

    const handleMoodLog = async (mood: string) => {
        if (!user) return;
        setIsLoggingMood(true);
        const { data, error } = await supabase
            .from('mood_logs')
            .insert([{ user_id: user.id, mood, note: moodNote }])
            .select()
            .single();

        if (!error && data) {
            setDashboardData((prev: any) => ({
                ...prev,
                moodHistory: [data, ...prev.moodHistory].slice(0, 7)
            }));
            setSelectedMood(null);
            setMoodNote("");
            toast.success("Ruh halin kaydedildi. Harikasın! ✨");
        }
        setIsLoggingMood(false);
    };

    const getMoodIcon = (mood: string, size = 24) => {
        switch (mood) {
            case 'happy': return <Smile size={size} className="text-green-500" />;
            case 'neutral': return <Meh size={size} className="text-yellow-500" />;
            case 'sad': return <Frown size={size} className="text-blue-500" />;
            case 'anxious': return <CloudRain size={size} className="text-purple-500" />;
            case 'angry': return <Zap size={size} className="text-red-500" />;
            default: return <Meh size={size} />;
        }
    };

    const getMoodLabel = (mood: string) => {
        switch (mood) {
            case 'happy': return 'Mutlu';
            case 'neutral': return 'Normal';
            case 'sad': return 'Üzgün';
            case 'anxious': return 'Kaygılı';
            case 'angry': return 'Öfkeli';
            default: return mood;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-background/60 backdrop-blur-xl"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full lg:max-w-5xl bg-gradient-to-br from-white/90 dark:from-zinc-900/90 via-accent/30 dark:via-zinc-800/30 to-white/80 dark:to-zinc-900/80 glass-strong rounded-none md:rounded-[2.5rem] shadow-elevated overflow-y-auto md:overflow-hidden flex flex-col md:flex-row h-full max-h-screen md:max-h-[90vh] md:min-h-[650px] z-10"
            >
                <button
                    onClick={onClose}
                    className="fixed top-4 right-4 z-[150] p-2 rounded-full bg-primary text-white shadow-2xl md:hidden flex items-center justify-center"
                >
                    <X size={24} />
                </button>
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-10 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors hidden md:block"
                >
                    <X size={20} className="text-muted-foreground" />
                </button>

                {!isLoggedIn ? (
                    <div className="w-full flex flex-col items-center justify-center p-6 md:p-12 bg-gradient-to-b from-transparent to-accent/20 overflow-y-auto">
                        <div className="w-20 h-20 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center mb-8 shadow-sm flex-shrink-0">
                            <Lock className="text-primary w-10 h-10" />
                        </div>

                        {isVerifying ? (
                            <div className="w-full flex flex-col items-center">
                                <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4 text-center">
                                    E-posta Doğrulama
                                </h2>
                                <p className="text-muted-foreground font-body text-center mb-8 max-w-sm">
                                    {email} adresine gönderilen 6 haneli doğrulama kodunu girin.
                                </p>
                                <form onSubmit={handleVerifyOtp} className="w-full max-w-sm space-y-4">
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Doğrulama Kodu (OTP)"
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value)}
                                            required
                                            maxLength={6}
                                            className="w-full px-6 py-4 rounded-2xl border border-white/50 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800 text-center text-2xl tracking-[0.5em] font-display focus:bg-white dark:focus:bg-zinc-700 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/30 placeholder:text-sm placeholder:tracking-normal text-foreground"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-[0.98] mt-4"
                                    >
                                        {loading ? (
                                            <RefreshCcw className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>Doğrula ve Giriş Yap <ChevronRight size={18} /></>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsVerifying(false)}
                                        className="w-full text-sm text-muted-foreground hover:text-primary transition-colors font-body mt-2"
                                    >
                                        Vazgeç
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-3xl font-display font-bold text-foreground mb-4">
                                    {isSignup ? "Yeni Kayıt Oluştur" : "Danışan Paneli Girişi"}
                                </h2>
                                <p className="text-muted-foreground font-body text-center mb-8 px-4 text-sm md:text-base">
                                    {isSignup
                                        ? "Bilgilerinizi doldurarak hemen kaydolun ve yolculuğunuza başlayın."
                                        : "Gelişim raporlarınıza ve dokümanlarınıza erişmek için güvenli giriş yapın."}
                                </p>
                                <form onSubmit={isSignup ? handleSignup : handleLogin} className="w-full max-w-[calc(100vw-48px)] md:max-w-sm space-y-4">
                                    {isSignup && (
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                placeholder="Ad Soyad"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                required
                                                className="w-full px-6 py-4 rounded-2xl border border-white/50 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-700 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-body placeholder:text-muted-foreground/60 text-foreground"
                                            />
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <input
                                            type="email"
                                            placeholder="E-posta Adresi"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full px-6 py-4 rounded-2xl border border-white/50 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-700 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-body placeholder:text-muted-foreground/60 text-foreground"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <input
                                            type="password"
                                            placeholder="Şifre"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="w-full px-6 py-4 rounded-2xl border border-white/50 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-700 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-body placeholder:text-muted-foreground/60 text-foreground"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-[0.98] mt-4"
                                    >
                                        {loading ? (
                                            <RefreshCcw className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>{isSignup ? "Kayıt Ol" : "Giriş Yap"} <ChevronRight size={18} /></>
                                        )}
                                    </button>
                                </form>

                                <p className="mt-8 text-sm text-muted-foreground font-body">
                                    {isSignup ? "Zaten hesabınız var mı?" : "Henüz hesabınız yok mu?"}{" "}
                                    <button
                                        onClick={() => setIsSignup(!isSignup)}
                                        className="text-primary font-bold hover:underline"
                                    >
                                        {isSignup ? "Giriş Yap" : "Hemen Kaydol"}
                                    </button>
                                </p>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Mobile Dropdown Navigation */}
                        <div className="md:hidden w-full bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md p-4 border-b border-white/20 dark:border-zinc-800 sticky top-0 z-50">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="w-full flex items-center justify-between px-5 py-4 bg-white dark:bg-zinc-800 rounded-2xl border border-white/50 dark:border-zinc-700 shadow-soft h-14"
                            >
                                <div className="flex items-center gap-3">
                                    {(() => {
                                        const active = [
                                            { id: "dashboard", icon: TrendingUp, label: "Genel Bakış" },
                                            { id: "documents", icon: FileText, label: "Dosyalarım" },
                                            { id: "sessions", icon: Calendar, label: "Randevularım" },
                                            { id: "messages", icon: MessageSquare, label: "Mesajlar" }
                                        ].find(item => item.id === activeTab);
                                        return active ? (
                                            <>
                                                <Menu size={20} className="text-primary" />
                                                <span className="font-display font-bold text-foreground">{active.label}</span>
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <Menu size={20} className="text-primary" />
                                                <span className="font-display font-bold text-foreground">Menü</span>
                                            </div>
                                        );
                                    })()}
                                </div>
                                <motion.div
                                    animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ChevronDown size={20} className="text-muted-foreground" />
                                </motion.div>
                            </button>

                            <AnimatePresence>
                                {isMobileMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                        animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                        className="overflow-hidden bg-white/60 dark:bg-zinc-800/60 backdrop-blur-lg rounded-[2rem] border border-white/40 dark:border-zinc-700/40 shadow-xl"
                                    >
                                        <div className="p-3 space-y-1">
                                            {[
                                                { id: "dashboard", icon: TrendingUp, label: "Genel Bakış" },
                                                { id: "documents", icon: FileText, label: "Dosyalarım" },
                                                { id: "sessions", icon: Calendar, label: "Randevularım" },
                                                { id: "messages", icon: MessageSquare, label: "Mesajlar" }
                                            ].map((item) => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => {
                                                        setActiveTab(item.id);
                                                        setIsMobileMenuOpen(false);
                                                    }}
                                                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 font-body text-sm ${activeTab === item.id
                                                        ? "bg-white dark:bg-zinc-800 text-primary shadow-sm font-bold"
                                                        : "text-muted-foreground hover:bg-white/40 dark:hover:bg-zinc-700/40"
                                                        }`}
                                                >
                                                    <item.icon size={18} className={activeTab === item.id ? "text-primary" : "text-muted-foreground"} />
                                                    {item.label}
                                                </button>
                                            ))}
                                            <div className="pt-2 mt-2 border-t border-white/20 dark:border-zinc-700/20">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-muted-foreground hover:text-destructive transition-colors font-body text-sm"
                                                >
                                                    <LogOut size={18} /> Çıkış Yap
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Sidebar (Desktop Only) */}
                        <div className="hidden md:flex w-72 bg-white/30 dark:bg-zinc-900/30 backdrop-blur-sm p-8 border-r border-white/20 dark:border-zinc-800 flex-col flex-shrink-0">
                            <div className="flex items-center gap-4 mb-12">
                                <div className="w-14 h-14 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center text-primary border border-white/50 dark:border-zinc-700/50 shadow-sm transition-transform duration-500 hover:rotate-6">
                                    <User size={28} />
                                </div>
                                <div>
                                    <div className="font-display font-bold text-foreground text-lg">{user?.user_metadata?.full_name || "Danışan"}</div>
                                    <div className="text-[10px] text-muted-foreground font-body uppercase tracking-widest bg-white/50 dark:bg-zinc-800/50 px-2 py-0.5 rounded-md inline-block">Aktif Oturum</div>
                                </div>
                            </div>

                            <nav className="space-y-1 flex-1">
                                {[
                                    { id: "dashboard", icon: TrendingUp, label: "Genel Bakış" },
                                    { id: "documents", icon: FileText, label: "Dosyalarım" },
                                    { id: "sessions", icon: Calendar, label: "Randevularım" },
                                    { id: "messages", icon: MessageSquare, label: "Mesajlar" }
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-body text-sm group ${activeTab === item.id
                                            ? "bg-white dark:bg-zinc-800 text-primary shadow-soft font-semibold"
                                            : "text-muted-foreground hover:bg-white/40 dark:hover:bg-zinc-800/40"
                                            }`}
                                    >
                                        <item.icon size={18} className={activeTab === item.id ? "text-primary" : "text-muted-foreground group-hover:translate-x-1 transition-transform"} />
                                        {item.label}
                                    </button>
                                ))}
                            </nav>

                            <button
                                onClick={handleLogout}
                                className="mt-auto flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors font-body py-2 group"
                            >
                                <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> Çıkış Yap
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 p-6 md:p-12 overflow-y-auto bg-white/10 dark:bg-zinc-900/10 min-h-0">
                            <AnimatePresence mode="wait">
                                {activeTab === "dashboard" && (
                                    <motion.div
                                        key="dashboard"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-8"
                                    >
                                        <header className="mb-6 md:mb-8">
                                            <h3 className="text-3xl font-display font-bold text-foreground mb-2 italic">Merhaba,</h3>
                                            <p className="text-muted-foreground font-body">Bugün kendini nasıl hissediyorsun?</p>
                                        </header>

                                        <div className="flex flex-wrap gap-4 items-center mb-8">
                                            {[
                                                { id: 'happy', icon: Smile, color: 'bg-green-500/10 text-green-500' },
                                                { id: 'neutral', icon: Meh, color: 'bg-yellow-500/10 text-yellow-500' },
                                                { id: 'sad', icon: Frown, color: 'bg-blue-500/10 text-blue-500' },
                                                { id: 'anxious', icon: CloudRain, color: 'bg-purple-500/10 text-purple-500' },
                                                { id: 'angry', icon: Zap, color: 'bg-red-500/10 text-red-500' }
                                            ].map((m) => (
                                                <button
                                                    key={m.id}
                                                    onClick={() => handleMoodLog(m.id)}
                                                    disabled={isLoggingMood}
                                                    className={`w-16 h-16 rounded-3xl flex flex-col items-center justify-center transition-all hover:scale-110 active:scale-95 ${m.color} border border-transparent hover:border-current shadow-sm group relative`}
                                                >
                                                    <m.icon size={28} />
                                                    <span className="absolute -bottom-6 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">{getMoodLabel(m.id)}</span>
                                                </button>
                                            ))}
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-6">
                                            <div className="bg-white/60 dark:bg-zinc-800/40 p-7 rounded-[2.5rem] border border-white dark:border-zinc-700/50 shadow-soft relative overflow-hidden group">
                                                <div className="flex items-center justify-between mb-6 relative z-10">
                                                    <span className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-widest">Gelişim Durumu</span>
                                                    <TrendingUp size={20} className="text-primary" />
                                                </div>
                                                <div className="text-4xl font-display font-bold text-primary mb-3 relative z-10">%{dashboardData.progress}</div>
                                                <div className="w-full bg-accent/30 h-1.5 rounded-full overflow-hidden relative z-10">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${dashboardData.progress}%` }}
                                                        transition={{ duration: 1, delay: 0.5 }}
                                                        className="bg-primary h-full"
                                                    />
                                                </div>
                                                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                            </div>

                                            <div className="bg-white/60 p-7 rounded-[2.5rem] border border-white shadow-soft relative overflow-hidden group">
                                                <div className="flex items-center justify-between mb-6 relative z-10">
                                                    <span className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-widest">Gelecek Seans</span>
                                                    <Calendar size={20} className="text-secondary" />
                                                </div>
                                                <div className="text-xl font-display font-bold text-foreground leading-tight relative z-10">{dashboardData.nextSession}</div>
                                                <div className="mt-4 text-xs font-body text-secondary flex items-center gap-1 cursor-pointer hover:font-bold transition-all relative z-10">
                                                    Seans Detayları <ChevronRight size={12} />
                                                </div>
                                                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-secondary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                            </div>
                                        </div>

                                        {/* Mood History Chart Area (Simplified for now) */}
                                        <div className="bg-white/40 dark:bg-zinc-800/20 p-8 rounded-[2.5rem] border border-white dark:border-zinc-800 shadow-soft">
                                            <h4 className="text-sm font-display font-bold text-foreground mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <TrendingUp size={16} className="text-primary" /> Son Ruh Hali Kayıtların
                                            </h4>
                                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                                                {dashboardData.moodHistory.length > 0 ? (
                                                    dashboardData.moodHistory.map((log: any, i: number) => (
                                                        <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-zinc-800 shadow-xs border border-white dark:border-zinc-700 min-w-[100px]">
                                                            {getMoodIcon(log.mood, 32)}
                                                            <div className="text-[10px] font-bold text-foreground">{getMoodLabel(log.mood)}</div>
                                                            <div className="text-[9px] text-muted-foreground uppercase">{new Date(log.created_at).toLocaleDateString('tr-TR', { weekday: 'short' })}</div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-sm text-muted-foreground italic py-4">Henüz bir kayıt yok. Yukarıdan seçim yaparak başlayabilirsin!</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* No notes for client portal for privacy */}
                                    </motion.div>
                                )}

                                {activeTab === "sessions" && (
                                    <motion.div
                                        key="sessions"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        <header>
                                            <h3 className="text-3xl font-display font-bold text-foreground">Randevularım</h3>
                                            <p className="text-muted-foreground font-body">Tüm seans geçmişiniz ve planlanan randevular.</p>
                                        </header>
                                        <div className="space-y-4">
                                            {dashboardData.sessions.map((session, i) => (
                                                <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-white/50 border border-white hover:shadow-md transition-all group">
                                                    <div className="flex items-center gap-5">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${session.status === "Gelecek" ? "bg-primary/10 text-primary" : "bg-accent/50 text-muted-foreground"}`}>
                                                            <Calendar size={22} />
                                                        </div>
                                                        <div>
                                                            <div className="text-base font-display font-bold text-foreground">{session.date} - {session.time}</div>
                                                            <div className="text-xs text-muted-foreground font-body">{session.type}</div>
                                                        </div>
                                                    </div>
                                                    <span className={`text-[10px] px-3 py-1 rounded-full font-body font-bold uppercase tracking-widest ${session.status === "Gelecek" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                                                        {session.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === "messages" && (
                                    <motion.div
                                        key="messages"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex flex-col h-full space-y-6 min-h-[450px]"
                                    >
                                        <header>
                                            <h3 className="text-3xl font-display font-bold text-foreground italic">Mesajlar</h3>
                                            <p className="text-muted-foreground font-body">Uzmanınızla güvenli iletişim kanalı.</p>
                                        </header>

                                        <div className="flex-1 space-y-4 px-2 py-4">
                                            {dashboardData.messages.map((msg, i) => (
                                                <div key={i} className={`flex ${msg.sender === "User" ? "justify-end" : "justify-start"}`}>
                                                    <div className={`max-w-[80%] p-4 rounded-3xl text-sm font-body shadow-xs ${msg.sender === "User"
                                                        ? "bg-primary text-white rounded-tr-none"
                                                        : "bg-white dark:bg-zinc-800 text-foreground dark:text-zinc-100 rounded-tl-none border border-white dark:border-zinc-700"
                                                        }`}>
                                                        {msg.text}
                                                        <div className={`text-[9px] mt-1 opacity-60 ${msg.sender === "User" ? "text-right" : "text-left"}`}>{msg.time}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-4 mt-auto">
                                            <div className="relative group">
                                                <input
                                                    type="text"
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                    placeholder="Mesajınızı yazın..."
                                                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                                    className="w-full px-6 py-4 pr-16 rounded-2xl border border-white dark:border-zinc-700 bg-white/50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-700 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-body text-sm text-foreground"
                                                />
                                                <button
                                                    onClick={sendMessage}
                                                    className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-primary text-white hover:scale-105 active:scale-95 transition-all"
                                                >
                                                    Gönder
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === "documents" && (
                                    <motion.div
                                        key="documents"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        <header>
                                            <h3 className="text-3xl font-display font-bold text-foreground">Dosyalarım</h3>
                                            <p className="text-muted-foreground font-body">Paylaşılan tüm dokümanlar ve test sonuçları.</p>
                                        </header>
                                        <div className="grid gap-4">
                                            {dashboardData.documents.length > 0 ? dashboardData.documents.map((doc, i) => (
                                                <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-white/50 dark:bg-zinc-800/50 border border-white dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 transition-all group shadow-xs">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-white/80 dark:bg-zinc-700 rounded-2xl shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                            <FileText size={22} />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-body font-bold text-foreground">{doc.name}</div>
                                                            <div className="text-[10px] text-muted-foreground font-body uppercase tracking-tighter">{doc.size}</div>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={doc.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        download={doc.name}
                                                        className="p-3 rounded-xl bg-white/50 dark:bg-zinc-700 text-muted-foreground hover:bg-primary hover:text-white transition-all shadow-xs"
                                                    >
                                                        <Download size={20} />
                                                    </a>
                                                </div>
                                            )) : (
                                                <div className="p-12 border border-dashed border-border dark:border-zinc-700 rounded-3xl text-center text-muted-foreground italic">
                                                    Henüz paylaşılan bir dosya yok.
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </>
                )}
            </motion.div>
        </div >
    );
};

export default ClientPortal;
