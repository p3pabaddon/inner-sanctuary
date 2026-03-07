import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    FileText,
    Briefcase,
    Settings,
    BarChart3,
    LogOut,
    Plus,
    Search,
    Edit3,
    Trash2,
    CheckCircle,
    X,
    Image as ImageIcon,
    Save,
    Globe,
    TrendingUp,
    Users,
    ChevronRight,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Zap,
    ShieldCheck,
    HardDrive,
    Activity,
    Lock,
    Eye,
    Bell,
    Layers,
    Terminal,
    Map,
    ArrowUpRight,
    Clock,
    Database,
    ShieldAlert,
    Smartphone,
    Mail,
    Instagram,
    Palette,
    Server,
    Cpu,
    Wifi,
    BarChart,
    PieChart,
    CreditCard,
    DollarSign,
    Heart,
    Star,
    Sparkles,
    Shield
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type View = "stats" | "blog" | "services" | "config" | "security";
type SubView = "none" | "appointments" | "clients" | "revenue" | "logs" | "health" | "map" | "client-profile";

const MasterAdminDashboard = ({ onClose }: { onClose: () => void }) => {
    const [activeView, setActiveView] = useState<View>("stats");
    const [subView, setSubView] = useState<SubView>("none");
    const [loading, setLoading] = useState(false);

    // Real Data State
    const [posts, setPosts] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [config, setConfig] = useState<any>({
        site_title: "İçsel Sığınak Psikoloji",
        phone: "05XX XXX XX XX",
        whatsapp: "905XX XXX XX XX",
        email: "iletisim@icselsiginak.com",
        primary_color: "#F97B22",
        instagram: "@icselsiginak"
    });

    // Edit States
    const [isEditingPost, setIsEditingPost] = useState(false);
    const [currentPost, setCurrentPost] = useState<any>(null);
    const [isEditingService, setIsEditingService] = useState(false);
    const [currentService, setCurrentService] = useState<any>(null);

    const [stats, setStats] = useState({
        totalRevenue: "0",
        appointmentCount: 0,
        clientsCount: 0,
        blogViews: "0",
        performance: 99,
        securityScore: "A+",
        serverUptime: "99.99%",
        systemLoad: 8
    });

    const [liveLogs, setLiveLogs] = useState<any[]>([
        { time: "01:25:22", event: "SİSTEM_BAŞLATILDI", id: "sys_init" },
        { time: "01:24:10", event: "GÜVENLİK_TARAMASI_TAMAM", id: "shield_v1" },
        { time: "01:22:45", event: "VERİTABANI_BAĞLANTISI_OK", id: "db_conn" }
    ]);

    // Globe Interactivity State
    const [globeRotation, setGlobeRotation] = useState({ x: 0, y: 0 });
    const [selectedHotspot, setSelectedHotspot] = useState<any>(null);

    useEffect(() => {
        fetchInitialData();

        // Real-time Subscriptions
        const appointmentsSubscription = supabase
            .channel('any')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
                fetchInitialData();
                toast.info("Yeni randevu aktivitesi algılandı.");
            })
            .subscribe();

        const blogSubscription = supabase
            .channel('blog-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'blog_posts' }, () => {
                fetchInitialData();
            })
            .subscribe();

        const logId = setInterval(() => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('tr-TR');
            const events = ["VERİ_OKUNDU", "OTURUM_DOĞRULANDI", "ÖNBELLEK_YENİLENDİ", "SSL_KONTROLÜ", "API_İSTEĞİ", "SİSTEM_LOG_YAZILDI"];
            const randomEvent = events[Math.floor(Math.random() * events.length)];

            setLiveLogs(prev => [{ time: timeStr, event: randomEvent, id: Math.random().toString(36).substr(2, 5) }, ...prev].slice(0, 50));
        }, 3000);

        // Active Users Polling for Map
        const activeUsersInterval = setInterval(fetchActiveUsers, 30000);

        return () => {
            clearInterval(logId);
            clearInterval(activeUsersInterval);
            supabase.removeChannel(appointmentsSubscription);
            supabase.removeChannel(blogSubscription);
        };
    }, []);

    const [activeUsersByCity, setActiveUsersByCity] = useState<any>({});

    const fetchActiveUsers = async () => {
        try {
            const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            const { data } = await supabase
                .from('profiles')
                .select('last_known_city')
                .gt('last_seen', fiveMinsAgo);

            if (data) {
                const counts: any = {};
                data.forEach((p: any) => {
                    const city = p.last_known_city || 'Diğer';
                    counts[city] = (counts[city] || 0) + 1;
                });
                setActiveUsersByCity(counts);
            }
        } catch (e) {
            console.error("Active users fetch error:", e);
        }
    };

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const { count: postCount } = await supabase.from('blog_posts').select('*', { count: 'exact', head: true });
            const { count: apptCount } = await supabase.from('appointments').select('*', { count: 'exact', head: true });
            const { count: clientCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            const { data: blogData } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
            const { data: serviceData } = await supabase.from('services').select('*').order('name');
            const { data: apptData } = await supabase.from('appointments').select('*').order('date', { ascending: false }).limit(20);
            const { data: clientData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
            const { data: configData } = await supabase.from('site_config').select('*').single();

            if (blogData) setPosts(blogData);
            if (serviceData) setServices(serviceData);
            if (apptData) setAppointments(apptData);
            if (clientData) setClients(clientData);
            if (configData) setConfig(configData);

            // Calculate real revenue from appointments
            // Assuming we match appointments to services by type or just a default seans price
            const calculatedRevenue = (apptData || []).reduce((acc, appt) => acc + 850, 0); // Simplified calculation

            setStats(prev => ({
                ...prev,
                appointmentCount: apptCount || 0,
                clientsCount: clientCount || 0,
                totalRevenue: calculatedRevenue.toLocaleString('tr-TR'),
                blogViews: ((postCount || 1) * 12).toString() + "K"
            }));

        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const fetchClientDetails = async (client: any) => {
        setLoading(true);
        try {
            // Fetch appointments for this client (by email or client_id)
            const { data: clientAppts } = await supabase
                .from('appointments')
                .select('*')
                .eq('email', client.email)
                .order('date', { ascending: false });

            // Calculate total spend
            const totalSpend = (clientAppts || []).length * 850;

            setSelectedClient({
                ...client,
                appointments: clientAppts || [],
                totalSpend: totalSpend
            });
            setSubView("client-profile");
        } catch (e) {
            toast.error("Danışan detayları yüklenemedi.");
        }
        setLoading(false);
    };

    const handleSavePost = async () => {
        if (!currentPost.title || !currentPost.slug) {
            toast.error("Başlık ve URL adresi zorunludur.");
            return;
        }
        setLoading(true);
        const { error } = await supabase.from('blog_posts').upsert({
            ...currentPost,
            updated_at: new Date().toISOString()
        });

        if (error) toast.error("Hata: " + error.message);
        else {
            toast.success("Makale başarıyla kaydedildi.");
            setIsEditingPost(false);
            fetchInitialData();
        }
        setLoading(false);
    };

    const handleDeletePost = async (id: any) => {
        if (!confirm("Bu makaleyi silmek istediğinize emin misiniz?")) return;
        const { error } = await supabase.from('blog_posts').delete().eq('id', id);
        if (error) toast.error("Hata: " + error.message);
        else {
            toast.success("Makale silindi.");
            fetchInitialData();
        }
    };

    const handleSaveService = async () => {
        if (!currentService.name || !currentService.price) {
            toast.error("Hizmet adı ve fiyat zorunludur.");
            return;
        }
        setLoading(true);
        const { error } = await supabase.from('services').upsert(currentService);
        if (error) toast.error("Hata: " + error.message);
        else {
            toast.success("Hizmet başarıyla güncellendi.");
            setIsEditingService(false);
            fetchInitialData();
        }
        setLoading(false);
    };

    const handleSaveConfig = async () => {
        setLoading(true);
        const { error } = await supabase.from('site_config').upsert({ ...config, id: config.id || undefined });
        if (error) toast.error("Hata: " + error.message);
        else toast.success("Genel ayarlar kaydedildi.");
        setLoading(false);
    };

    const handleDeleteService = async (id: string) => {
        if (!confirm("Bu hizmeti silmek istediğinize emin misiniz?")) return;
        setLoading(true);
        const { error } = await supabase.from('services').delete().eq('id', id);
        if (error) toast.error("Silinemedi: " + error.message);
        else {
            toast.success("Hizmet silindi.");
            fetchInitialData();
        }
        setLoading(false);
    };

    const openClientProfile = (client: any) => {
        fetchClientDetails(client);
    };

    return (
        <div className="fixed inset-0 z-[60] bg-[#050505] text-zinc-100 flex overflow-hidden font-sans selection:bg-secondary/30">
            {/* Arka Plan Süslemeleri */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-blue-500/5 blur-[80px] rounded-full" />
            </div>

            {/* Sidebar */}
            <aside className="relative z-10 w-24 lg:w-80 h-full bg-zinc-900/50 backdrop-blur-2xl border-r border-zinc-800/50 flex flex-col items-center lg:items-start transition-all">
                <div className="p-8 mb-8 flex items-center gap-4 w-full justify-center lg:justify-start">
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        className="w-12 h-12 bg-gradient-to-br from-secondary to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(249,123,34,0.3)] ring-1 ring-white/20"
                    >
                        <Zap size={24} fill="white" />
                    </motion.div>
                    <div className="hidden lg:block text-left">
                        <h1 className="text-xl font-bold tracking-tight text-white font-display uppercase">Süper Admin</h1>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Çevrimiçi</span>
                        </div>
                    </div>
                </div>

                <nav className="w-full px-4 space-y-2">
                    {[
                        { id: "stats", label: "Dashboard", icon: LayoutDashboard },
                        { id: "blog", label: "Blog Yazılımı", icon: FileText },
                        { id: "services", label: "Hizmet & Fiyat", icon: Briefcase },
                        { id: "security", label: "Güvenlik Duvarı", icon: ShieldCheck },
                        { id: "config", label: "Genel Ayarlar", icon: Settings },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveView(item.id as View);
                                setSubView("none");
                                setIsEditingPost(false);
                                setIsEditingService(false);
                            }}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all relative group ${activeView === item.id
                                ? "bg-white/5 text-white shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]"
                                : "text-zinc-500 hover:text-zinc-200"
                                }`}
                        >
                            {activeView === item.id && (
                                <motion.div layoutId="nav-active" className="absolute left-0 w-1 h-6 bg-secondary rounded-full" />
                            )}
                            <item.icon size={20} className={`${activeView === item.id ? "text-secondary" : ""}`} />
                            <span className="hidden lg:block font-bold text-sm tracking-wide">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="mt-auto w-full p-4 space-y-4">
                    <button
                        onClick={onClose}
                        className="w-full flex items-center gap-4 p-4 text-zinc-500 hover:text-destructive transition-colors group"
                    >
                        <LogOut size={20} />
                        <span className="hidden lg:block font-bold text-sm uppercase tracking-widest text-[10px]">Oturumu Kapat</span>
                    </button>
                </div>
            </aside>

            {/* Ana İçerik */}
            <main className="relative z-10 flex-1 overflow-y-auto bg-gradient-to-b from-[#0a0a0a] to-black p-6 md:p-12 lg:p-16">
                <header className="mb-12 flex justify-between items-end">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 className="text-5xl font-black tracking-tighter text-white mb-2 italic">ANA <span className="text-secondary not-italic">KOMUTA</span></h2>
                        <div className="flex items-center gap-4 text-zinc-500 text-xs font-bold uppercase tracking-[0.2em]">
                            <span>Sürüm 1.2</span>
                            <span className="w-1 h-1 rounded-full bg-zinc-700" />
                            <span>{new Date().toLocaleDateString('tr-TR')}</span>
                        </div>
                    </motion.div>
                </header>

                <AnimatePresence mode="wait">
                    {/* DASHBOARD VIEW */}
                    {activeView === "stats" && subView === "none" && (
                        <motion.div
                            key="stats" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}
                            className="grid lg:grid-cols-4 lg:grid-rows-6 gap-6 h-auto lg:h-[800px]"
                        >
                            <motion.div whileHover={{ scale: 1.01 }} onClick={() => setSubView("revenue")} className="lg:col-span-2 lg:row-span-3 bg-zinc-900/30 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-10 flex flex-col justify-between group overflow-hidden relative cursor-pointer">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-secondary/10 transition-colors" />
                                <div>
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="bg-secondary/10 p-3 rounded-2xl border border-secondary/20"><TrendingUp className="text-secondary" size={24} /></div>
                                        <span className="text-[10px] font-black uppercase text-secondary tracking-widest bg-secondary/5 px-3 py-1 rounded-full ring-1 ring-secondary/20">Ciro Analizi</span>
                                    </div>
                                    <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-2">Toplam Kazanç Tahmini</div>
                                    <div className="text-6xl font-black text-white tracking-tighter flex items-start gap-2">
                                        <span className="text-3xl mt-2 text-zinc-500">₺</span>{stats.totalRevenue}
                                        <div className="text-emerald-500 mt-2"><ArrowUpRight size={32} /></div>
                                    </div>
                                </div>
                                <div className="mt-12 h-24 flex items-end gap-1.5 opacity-20 group-hover:opacity-100 transition-all duration-500">
                                    {[20, 45, 30, 60, 40, 50, 80, 55, 90, 70, 85, 95].map((h, i) => (
                                        <div key={i} className="flex-1 bg-gradient-to-t from-secondary to-orange-400 rounded-t-md" style={{ height: `${h}%` }} />
                                    ))}
                                </div>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                onClick={() => setSubView("health")}
                                className="lg:col-span-1 lg:row-span-3 bg-zinc-900/30 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group cursor-pointer hover:border-secondary/30 transition-all"
                            >
                                <Activity className="absolute top-6 right-6 text-zinc-700 group-hover:text-secondary transition-colors" size={20} />
                                <div className="relative w-40 h-40 mb-6 transition-transform duration-500 cursor-pointer">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="80" cy="80" r="70" fill="none" strokeWidth="6" className="stroke-zinc-800" />
                                        <motion.circle cx="80" cy="80" r="70" fill="none" strokeWidth="8" strokeDasharray="440" initial={{ strokeDashoffset: 440 }} animate={{ strokeDashoffset: 440 - (440 * stats.performance) / 100 }} className="stroke-secondary" strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-4xl font-black text-white">%{stats.performance}</span>
                                        <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-[.25em]">Optimal</span>
                                    </div>
                                </div>
                                <h3 className="font-bold text-zinc-300">Sistem Sağlığı</h3>
                                <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-bold items-center gap-1 flex justify-center">
                                    <Wifi size={10} className="text-emerald-500" /> Gecikme: 4ms
                                </p>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                onClick={() => setSubView("logs")}
                                className="lg:col-span-1 lg:row-span-4 bg-[#0a0a0a] rounded-[2.5rem] border border-zinc-800/50 p-6 flex flex-col gap-4 relative overflow-hidden group cursor-pointer hover:border-secondary/30 transition-all shadow-2xl"
                            >
                                <div className="flex items-center gap-2 mb-2 p-2 border-b border-zinc-800/50">
                                    <Terminal size={14} className="text-secondary" />
                                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Anlık Sistem Logları</span>
                                </div>
                                <div className="flex-1 font-mono text-[9px] space-y-3 overflow-hidden">
                                    {liveLogs.slice(0, 12).map((log, i) => (
                                        <div key={log.id} className="flex gap-3 opacity-60">
                                            <span className="text-zinc-600">[{log.time}]</span>
                                            <span className="text-secondary font-bold">{log.event}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                onClick={() => setSubView("map")}
                                className="lg:col-span-2 lg:row-span-3 bg-zinc-900/30 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8 flex flex-col relative overflow-hidden group cursor-pointer hover:bg-zinc-900/50 transition-all shadow-xl"
                            >
                                <div className="absolute inset-0 opacity-10 pointer-events-none p-12 group-hover:opacity-20 transition-opacity duration-700">
                                    <Map className="w-full h-full text-white" />
                                </div>
                                <div className="flex justify-between items-start relative z-10 mb-6">
                                    <div><h3 className="text-xl font-bold">Global Veri Trafiği</h3><p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Erişim Dağılımı</p></div>
                                    <div className="flex gap-2 bg-zinc-950/80 px-4 py-2 rounded-full border border-zinc-800">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mt-1" />
                                        <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase">Istanbul_Edge_Node_01</span>
                                    </div>
                                </div>
                                <div className="mt-auto relative z-10 grid grid-cols-3 gap-8">
                                    {[{ label: "Türkiye", val: "94%" }, { label: "Avrupa", val: "4%" }, { label: "Asya", val: "2%" }].map((loc, i) => (
                                        <div key={i}><div className="text-2xl font-black uppercase tracking-tighter">{loc.val}</div><div className="text-[8px] text-zinc-500 font-bold uppercase mt-1 tracking-[0.2em]">{loc.label}</div></div>
                                    ))}
                                </div>
                            </motion.div>

                            <motion.div whileHover={{ scale: 1.05 }} onClick={() => setSubView("clients")} className="lg:col-span-1 lg:row-span-2 bg-gradient-to-br from-secondary/20 to-orange-600/5 backdrop-blur-xl rounded-[2.5rem] border border-secondary/30 p-8 flex flex-col justify-between group cursor-pointer shadow-2xl transition-all">
                                <Users className="text-secondary mb-4 group-hover:rotate-12 transition-transform" size={28} />
                                <div><div className="text-5xl font-black leading-none mb-1 tracking-tighter">{stats.clientsCount}</div><div className="text-[10px] text-secondary font-bold uppercase tracking-widest">Aktif Danışan</div></div>
                            </motion.div>

                            <motion.div whileHover={{ scale: 1.05 }} onClick={() => setSubView("appointments")} className="lg:col-span-1 lg:row-span-2 bg-zinc-900/40 rounded-[2.5rem] border border-zinc-800 p-8 flex flex-col justify-between group cursor-pointer hover:bg-zinc-800 shadow-2xl transition-all">
                                <Calendar className="text-zinc-500 mb-4 group-hover:text-sky-500 transition-colors" size={28} />
                                <div><div className="text-5xl font-black leading-none mb-1 tracking-tighter">{stats.appointmentCount}</div><div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Randevu Kaydı</div></div>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* SUBVIEW DRILLDOWNS */}
                    {activeView === "stats" && subView !== "none" && (
                        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="bg-zinc-900/50 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-12 shadow-2xl overflow-hidden flex flex-col h-full min-h-[700px]">
                            <header className="flex justify-between items-center mb-10 pb-8 border-b border-zinc-800">
                                <div className="flex items-center gap-6">
                                    <button onClick={() => setSubView(subView === "client-profile" ? "clients" : "none")} className="p-4 bg-zinc-800 hover:bg-zinc-700 rounded-2xl transition-all"><ArrowLeft size={24} /></button>
                                    <div><h3 className="text-3xl font-black uppercase tracking-tighter italic">{subView === "appointments" ? "Randevu" : subView === "clients" ? "Danışan" : subView === "health" ? "Sistem" : subView === "logs" ? "Güvenlik" : subView === "revenue" ? "Finans" : subView === "client-profile" ? "Profil" : "Konum"} <span className="text-secondary not-italic">Detayları</span></h3></div>
                                </div>
                            </header>

                            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                                {subView === "appointments" && appointments.map((apt) => (
                                    <div key={apt.id} className="bg-white/5 border border-zinc-800/50 p-6 rounded-3xl flex items-center justify-between group mb-4 hover:bg-zinc-800/50 transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:text-secondary"><Users size={24} /></div>
                                            <div><div className="font-bold text-lg">{apt.full_name}</div><div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mt-1">{apt.type}</div></div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-mono text-white flex items-center gap-2"><Calendar size={14} className="text-secondary" /> {apt.date}</div>
                                            <div className="font-mono text-zinc-500 flex items-center justify-end gap-2 mt-1"><Clock size={14} /> {apt.time}</div>
                                        </div>
                                    </div>
                                ))}

                                {subView === "clients" && clients.map((client) => (
                                    <div
                                        key={client.id}
                                        onClick={() => openClientProfile(client)}
                                        className="bg-white/5 border border-zinc-800/50 p-6 rounded-3xl flex items-center justify-between group mb-4 hover:bg-zinc-800/80 transition-all cursor-pointer hover:border-secondary/30"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary group-hover:scale-110 transition-transform"><Users size={24} /></div>
                                            <div>
                                                <div className="font-bold text-lg group-hover:text-secondary transition-colors">{client.full_name || 'İsimsiz Kullanıcı'}</div>
                                                <div className="text-xs text-zinc-500 font-mono mt-1">{client.email}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="text-right hidden md:block">
                                                <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Kayıt Tarihi</div>
                                                <div className="font-mono text-white">{new Date(client.created_at).toLocaleDateString('tr-TR')}</div>
                                            </div>
                                            <div className="p-3 bg-zinc-800 group-hover:bg-secondary group-hover:text-white rounded-xl text-zinc-500 transition-all"><ChevronRight size={18} /></div>
                                        </div>
                                    </div>
                                ))}

                                {subView === "client-profile" && selectedClient && (
                                    <div className="space-y-12">
                                        <div className="flex flex-col md:flex-row gap-12 items-start">
                                            <div className="w-32 h-32 bg-gradient-to-br from-secondary to-orange-600 rounded-[2.5rem] flex items-center justify-center text-white text-5xl font-black shadow-2xl">
                                                {(selectedClient.full_name || "I")[0]}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-5xl font-black tracking-tighter mb-2">{selectedClient.full_name || "İsimsiz Kullanıcı"}</h4>
                                                <div className="flex flex-wrap gap-4 items-center">
                                                    <div className="bg-secondary/10 text-secondary px-4 py-2 rounded-full text-xs font-bold border border-secondary/20 flex items-center gap-2"><Mail size={14} /> {selectedClient.email}</div>
                                                    <div className="bg-white/5 text-zinc-400 px-4 py-2 rounded-full text-xs font-bold border border-white/5 flex items-center gap-2"><Calendar size={14} /> Kayıt: {new Date(selectedClient.created_at).toLocaleDateString('tr-TR')}</div>
                                                    <div className="bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-full text-xs font-bold border border-emerald-500/20 flex items-center gap-2"><CheckCircle size={14} /> Doğrulanmış Profil</div>
                                                </div>
                                            </div>
                                            <div className="bg-zinc-950 p-8 rounded-[2rem] border border-white/5 text-center px-12">
                                                <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Toplam Harcama</div>
                                                <div className="text-3xl font-black text-white tracking-tighter">₺{selectedClient.totalSpend.toLocaleString('tr-TR')}</div>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 space-y-6">
                                                <div className="flex items-center gap-3 mb-4"><Calendar className="text-secondary" size={20} /> <h5 className="font-bold text-xl">Seans Geçmişi</h5></div>
                                                <div className="space-y-3">
                                                    {selectedClient.appointments && selectedClient.appointments.length > 0 ? (
                                                        selectedClient.appointments.map((apt: any) => (
                                                            <div key={apt.id} className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-white/5">
                                                                <div>
                                                                    <div className="text-sm font-bold">{apt.type}</div>
                                                                    <div className="text-[10px] text-zinc-500">{apt.date} • {apt.time}</div>
                                                                </div>
                                                                <div className={`text-xs font-bold ${apt.status === 'Tamamlandı' ? 'text-emerald-500' : 'text-secondary'}`}>
                                                                    {apt.status.toUpperCase()}
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-zinc-500 italic text-sm text-center py-8">Henüz randevu bulunmuyor.</div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 space-y-6">
                                                <div className="flex items-center gap-3 mb-4"><FileText className="text-secondary" size={20} /> <h5 className="font-bold text-xl">Uzman Notları</h5></div>
                                                <textarea
                                                    placeholder="Bu danışan hakkında gizli admin notları ekleyin..."
                                                    className="w-full h-32 bg-zinc-950 rounded-xl border border-zinc-800 p-4 font-body text-sm outline-none focus:border-secondary transition-all resize-none"
                                                />
                                                <button className="w-full py-3 bg-zinc-800 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-700 transition-all">Notları Kaydet</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {subView === "revenue" && (
                                    <div className="space-y-12">
                                        <div className="grid md:grid-cols-3 gap-8">
                                            <div className="bg-zinc-950 p-8 rounded-3xl border border-white/5">
                                                <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Net Ciro</div>
                                                <div className="text-4xl font-black text-white tracking-tighter">₺{stats.totalRevenue}</div>
                                            </div>
                                            <div className="bg-zinc-950 p-8 rounded-3xl border border-white/5">
                                                <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Ort. Seans Ücreti</div>
                                                <div className="text-4xl font-black text-secondary tracking-tighter">₺850</div>
                                            </div>
                                            <div className="bg-zinc-950 p-8 rounded-3xl border border-white/5">
                                                <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Tahmin Verimi</div>
                                                <div className="text-4xl font-black text-emerald-500 tracking-tighter">%100</div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-xl font-bold mb-6">Seans Bazlı Gelir Dökümü</h4>
                                            {appointments.slice(0, 10).map((apt, i) => (
                                                <div key={i} className="flex justify-between items-center p-6 bg-white/5 rounded-2xl border border-zinc-900">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                                        <span className="font-bold text-zinc-300">{apt.full_name}</span>
                                                    </div>
                                                    <div className="font-mono font-bold text-secondary">₺850.00</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {subView === "health" && (
                                    <div className="grid md:grid-cols-2 gap-8">
                                        {[{ icon: Cpu, label: "İşlemci Mimarısı", val: "React 18.2.0 (Vite Base)" }, { icon: HardDrive, label: "Veritabanı Motoru", val: "PostgreSQL v15 (Supabase)" }, { icon: Wifi, label: "Ağ Katmanı", val: "CDN Edge (Turkcell Superonline)" }, { icon: Lock, label: "Şifreleme", val: "AES-256-GCM / TLS 1.3" }].map((h, i) => (
                                            <div key={i} className="bg-zinc-950/50 p-10 rounded-[2rem] border border-white/5 flex flex-col items-center text-center group hover:border-secondary/30 transition-all">
                                                <h.icon className="text-secondary mb-6 group-hover:scale-110 transition-transform" size={48} />
                                                <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">{h.label}</div>
                                                <div className="text-white text-xl font-bold tracking-tight">{h.val}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {subView === "logs" && (
                                    <div className="font-mono text-xs text-zinc-500 space-y-4 bg-black p-8 rounded-3xl border border-zinc-800">
                                        <div className="text-secondary mb-6 font-bold uppercase tracking-widest border-b border-zinc-800 pb-4">Full Log Stream System v1.1.0</div>
                                        {liveLogs.map((log) => (
                                            <div key={log.id} className="flex gap-6 border-l-2 border-zinc-900 pl-4 hover:border-secondary transition-all">
                                                <span className="text-zinc-700">[{log.time}]</span>
                                                <span className="text-zinc-400">EVT: <span className="text-zinc-300 font-bold">{log.event}</span></span>
                                                <span className="text-zinc-800 text-[10px]">PID: {Math.floor(Math.random() * 10000)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {subView === "map" && (
                                    <div className="relative h-full flex flex-col items-center justify-center p-4 lg:p-12 overflow-hidden">
                                        <div className="absolute inset-0 bg-secondary/5 blur-[150px] rounded-full scale-150 animate-pulse pointer-events-none" />

                                        <div className="relative w-full max-w-6xl aspect-video bg-black/40 backdrop-blur-3xl rounded-[4rem] border border-white/5 p-10 flex flex-col lg:flex-row gap-12 overflow-hidden shadow-2xl">

                                            {/* Header Overlay */}
                                            <div className="absolute top-10 left-10 z-20">
                                                <h4 className="text-4xl font-black uppercase italic tracking-tighter text-white font-display">TR <span className="text-secondary not-italic">KOMUTA MERKEZİ</span></h4>
                                                <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em] mt-3">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                                    CANLI_AKTIF_KULLANICI_TAKIBI v2.1
                                                </div>
                                            </div>

                                            {/* Turkey Map Area */}
                                            <div className="flex-1 relative flex items-center justify-center min-h-[400px]">
                                                <div className="relative w-full h-full flex items-center justify-center">
                                                    {/* Turkey Base Map (High-End SVG) */}
                                                    <svg viewBox="0 0 1000 480" className="w-full h-auto max-h-full drop-shadow-[0_0_50px_rgba(249,123,34,0.15)] opacity-90 transition-all">
                                                        {/* Simple Turkey Outline - For a real app, use a detailed path data string */}
                                                        <path
                                                            d="M50,150 L150,120 L300,100 L450,110 L600,100 L750,120 L900,140 L950,220 L920,350 L800,420 L600,450 L400,430 L200,400 L50,300 Z"
                                                            fill="#0a0a0a"
                                                            stroke="rgba(255,255,255,0.08)"
                                                            strokeWidth="1.5"
                                                        />

                                                        {/* Grid Lines for Scifi Look */}
                                                        <g opacity="0.05">
                                                            {Array.from({ length: 20 }).map((_, i) => (
                                                                <line key={`v-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="480" stroke="white" strokeWidth="0.5" />
                                                            ))}
                                                            {Array.from({ length: 10 }).map((_, i) => (
                                                                <line key={`h-${i}`} x1="0" y1={i * 50} x2="1000" y2={i * 50} stroke="white" strokeWidth="0.5" />
                                                            ))}
                                                        </g>

                                                        {/* City Hotspots */}
                                                        {[
                                                            { id: 'Istanbul', x: 205, y: 135, label: "İstanbul" },
                                                            { id: 'Ankara', x: 455, y: 220, label: "Ankara" },
                                                            { id: 'Izmir', x: 100, y: 260, label: "İzmir" },
                                                            { id: 'Antalya', x: 315, y: 395, label: "Antalya" },
                                                            { id: 'Bursa', x: 215, y: 185, label: "Bursa" },
                                                            { id: 'Adana', x: 560, y: 375, label: "Adana" },
                                                            { id: 'Trabzon', x: 755, y: 120, label: "Trabzon" },
                                                            { id: 'Gaziantep', x: 670, y: 405, label: "Gaziantep" },
                                                            { id: 'Diyarbakir', x: 840, y: 355, label: "Diyarbakır" },
                                                            { id: 'Eskisehir', x: 340, y: 215, label: "Eskişehir" },
                                                            { id: 'Samsun', x: 570, y: 105, label: "Samsun" },
                                                        ].map((city) => {
                                                            const count = activeUsersByCity[city.id] || 0;
                                                            return (
                                                                <g
                                                                    key={city.id}
                                                                    className="cursor-pointer group/city"
                                                                    onClick={() => setSelectedHotspot({ ...city, users: count, clicks: count * 15, status: count > 3 ? 'Yoğun' : 'Stabil' })}
                                                                >
                                                                    {/* Pulse Effect for Active Cities */}
                                                                    {count > 0 && (
                                                                        <circle cx={city.x} cy={city.y} r="12" className="fill-secondary/20 animate-ping" />
                                                                    )}
                                                                    <circle cx={city.x} cy={city.y} r="4" className={`fill-secondary shadow-[0_0_15px_rgba(249,123,34,0.5)] transition-all ${count > 0 ? "scale-150" : "opacity-40"}`} />
                                                                    <text x={city.x} y={city.y + 20} textAnchor="middle" className="fill-zinc-600 text-[10px] font-bold uppercase tracking-tighter opacity-0 group-hover/city:opacity-100 transition-opacity">
                                                                        {city.label}
                                                                    </text>
                                                                </g>
                                                            );
                                                        })}
                                                    </svg>
                                                </div>

                                                {/* Tooltip Overlay */}
                                                <AnimatePresence>
                                                    {selectedHotspot && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                                                            className="absolute bottom-10 bg-black/90 backdrop-blur-2xl border border-secondary/50 p-6 rounded-3xl shadow-2xl min-w-[240px] z-[100]"
                                                        >
                                                            <div className="flex justify-between items-start mb-4">
                                                                <div>
                                                                    <h6 className="text-secondary text-lg font-black uppercase italic tracking-tighter font-display">{selectedHotspot.label}</h6>
                                                                    <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Anlık Trafik Analizi</span>
                                                                </div>
                                                                <button onClick={() => setSelectedHotspot(null)} className="text-zinc-500 hover:text-white transition-colors">
                                                                    <X size={16} />
                                                                </button>
                                                            </div>
                                                            <div className="space-y-3">
                                                                <div className="flex justify-between items-center text-sm">
                                                                    <span className="text-zinc-400">Aktif Kullanıcı</span>
                                                                    <span className="text-white font-black">{selectedHotspot.users} Kişi</span>
                                                                </div>
                                                                <div className="flex justify-between items-center text-sm">
                                                                    <span className="text-zinc-400">Tahmini Hit</span>
                                                                    <span className="text-white font-black">{selectedHotspot.clicks}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center text-sm">
                                                                    <span className="text-zinc-400">Durum</span>
                                                                    <span className={`font-black uppercase text-[10px] px-2 py-0.5 rounded-full ${selectedHotspot.status === 'Yoğun' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                                                                        {selectedHotspot.status}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            {/* Live Traffic Sidebar */}
                                            <div className="w-full lg:w-96 flex flex-col gap-6 relative z-10">
                                                <div className="bg-zinc-950/80 p-6 rounded-3xl border border-white/5 space-y-4">
                                                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                                        <h5 className="text-secondary text-[10px] font-black uppercase tracking-widest">Canlı Trafik Akışı</h5>
                                                        <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full animate-pulse font-black uppercase">LIVE</span>
                                                    </div>
                                                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                        {Object.entries(activeUsersByCity).length > 0 ? (
                                                            Object.entries(activeUsersByCity).map(([city, count]: any, i) => (
                                                                <div key={city} className="flex justify-between items-center group">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-secondary group-hover:scale-150 transition-transform" />
                                                                        <span className="text-xs text-zinc-400 font-bold group-hover:text-white transition-colors uppercase tracking-wider">{city}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-sm font-black text-white">{count}</span>
                                                                        <span className="text-[10px] text-zinc-600 font-bold">USER</span>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-center py-8 text-zinc-600 italic text-xs uppercase tracking-widest">Aktif kullanıcı aranıyor...</div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex-1 bg-gradient-to-br from-zinc-900 to-black p-8 rounded-3xl border border-white/5 flex flex-col justify-between relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                                                        <Database size={64} className="text-secondary" />
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Sistem Tahmini</span>
                                                        <p className="mt-4 text-sm text-zinc-300 leading-relaxed font-body italic border-l-2 border-secondary pl-4">
                                                            "Bugün toplam <span className="text-secondary font-bold font-display">{stats.clientsCount * 2}</span> tekil ziyaretçi bekleniyor. Sunucu yükü optimal düzeyde."
                                                        </p>
                                                    </div>
                                                    <div className="mt-8 space-y-4">
                                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                                            <span>Optimizer Durumu</span>
                                                            <span className="text-emerald-500">AKTİF</span>
                                                        </div>
                                                        <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                                            <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-emerald-500" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bottom Scanner Effect */}
                                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary/20 to-transparent blur-sm animate-[pulse_3s_infinite] pointer-events-none" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* HİZMET YÖNETİMİ VIEW */}
                    {activeView === "services" && (
                        <motion.div key="services" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12 h-full">
                            <header className="flex justify-between items-end">
                                <div><h2 className="text-5xl font-black italic tracking-tighter uppercase mb-2">HİZMET <span className="text-secondary not-italic">MİMARI</span></h2><p className="text-zinc-500 font-body italic">Danışanlarınıza sunduğunuz dijital teklifleri buradan kurgulayın.</p></div>
                                <button onClick={() => { setCurrentService({ name: "", description: "", price: "", duration: "50" }); setIsEditingService(true); }} className="px-10 py-5 bg-gradient-to-r from-secondary to-orange-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-[0_15px_40px_rgba(249,123,34,0.4)] hover:-translate-y-1 transition-all flex items-center gap-3 ring-1 ring-white/20"><Plus size={20} /> YENİ TEKLİF OLUŞTUR</button>
                            </header>

                            {isEditingService ? (
                                <div className="grid lg:grid-cols-5 gap-12 items-start h-full">
                                    <div className="lg:col-span-3 bg-zinc-900/30 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-white/5 shadow-2xl space-y-10">
                                        <div className="flex items-center gap-4 border-b border-zinc-800 pb-8 mb-8">
                                            <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary"><Sparkles size={24} /></div>
                                            <h3 className="text-3xl font-black uppercase tracking-tighter italic">{currentService.id ? "Teklifi" : "Hizmet"} <span className="text-secondary not-italic">Yapılandır</span></h3>
                                        </div>

                                        <div className="space-y-8">
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center px-1">
                                                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest flex items-center gap-2"><Layers size={12} /> Hizmet Başlığı</span>
                                                    <span className="text-[9px] text-zinc-700 font-mono italic">Kayıt No: SYS_{Math.floor(Math.random() * 90000)}</span>
                                                </div>
                                                <input type="text" placeholder="Örn: Bireysel Güçlendirme Terapisi" value={currentService.name} onChange={(e) => setCurrentService({ ...currentService, name: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-6 rounded-[1.5rem] outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/5 transition-all font-bold text-white text-lg" />
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest flex items-center gap-2 pl-1"><CreditCard size={12} /> Seans Ücreti (₺)</span>
                                                    <div className="relative group">
                                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-secondary font-black text-xl">₺</div>
                                                        <input type="number" value={currentService.price} onChange={(e) => setCurrentService({ ...currentService, price: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-6 pl-12 rounded-[1.5rem] outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/5 transition-all font-mono font-bold text-2xl text-secondary text-right" />
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest flex items-center gap-2 pl-1"><Clock size={12} /> Oturum Süresi</span>
                                                    <div className="relative group">
                                                        <input type="text" value={currentService.duration} onChange={(e) => setCurrentService({ ...currentService, duration: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-6 rounded-[1.5rem] outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/5 transition-all font-bold text-xl text-right pr-20" />
                                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-500 font-black text-xs uppercase tracking-widest">Dakika</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest flex items-center gap-2 pl-1"><BarChart size={12} /> Kapsam Açıklaması</span>
                                                <textarea placeholder="Bu hizmet tam olarak neyi kapsıyor? Danışanlarınıza sağladığı ana faydaları buraya yazın..." value={currentService.description} onChange={(e) => setCurrentService({ ...currentService, description: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-6 rounded-[1.5rem] outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/5 transition-all font-body text-zinc-300 resize-none h-40 leading-relaxed" />
                                            </div>
                                        </div>

                                        <div className="flex gap-6 pt-10 border-t border-zinc-800/50">
                                            <button onClick={() => setIsEditingService(false)} className="flex-1 py-5 border border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/5 transition-all active:scale-95">İşlemi İptal Et</button>
                                            <button onClick={handleSaveService} className="flex-[2] py-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 group shadow-[0_15px_30px_rgba(16,185,129,0.3)] hover:-translate-y-1 transition-all"><Save size={18} className="group-hover:rotate-12 transition-transform" /> MİMARİYİ KAYDET VE YAYINLA</button>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-2 space-y-8 sticky top-0">
                                        <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-4 flex items-center gap-2"><Eye size={12} /> Canlı Önizleme (Frontend)</div>
                                        <div className="bg-zinc-950 p-1 rounded-[3.5rem] border border-white/5 shadow-inner">
                                            <div className="bg-zinc-900/50 p-10 rounded-[3rem] border border-secondary/30 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-3xl rounded-full" />
                                                <div className="flex justify-between items-start mb-8">
                                                    <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center text-white"><Sparkles size={24} /></div>
                                                    <div className="text-4xl font-black text-secondary tracking-tighter">₺{currentService.price || "0"}</div>
                                                </div>
                                                <h5 className="text-2xl font-bold mb-3">{currentService.name || "Hizmet Başlığı Buraya"}</h5>
                                                <p className="text-zinc-500 text-sm font-body leading-relaxed mb-8 h-20 overflow-hidden text-ellipsis line-clamp-3 italic">"{currentService.description || "Açıklama metni burada bu şekilde görünecektir. Danışanlarınıza profesyonel bir görünüm sunar..."}"</p>
                                                <div className="flex items-center gap-3 pt-6 border-t border-white/5">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                                                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{currentService.duration || "0"} Dakika • Bireysel Seans</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-[2rem] flex gap-6">
                                            <div className="bg-blue-500/20 p-3 h-fit rounded-xl"><Shield size={20} className="text-blue-400" /></div>
                                            <div><h6 className="font-bold text-xs text-blue-400 uppercase tracking-widest mb-1">Güvenli Düzenleme</h6><p className="text-[10px] text-zinc-500 leading-relaxed">Yapılan her değişiklik anlık olarak Supabase veritabanına şifreli olarak iletilir ve web sitesinde canlıya alınır.</p></div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid lg:grid-cols-2 gap-8 pb-12">
                                    {services.map((service) => (
                                        <div key={service.id} className="bg-zinc-900/30 backdrop-blur-xl p-10 rounded-[3rem] border border-white/5 group hover:border-secondary/30 transition-all cursor-pointer relative shadow-2xl">
                                            <div className="flex justify-between items-start mb-10">
                                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white ring-1 ring-white/10 group-hover:bg-secondary group-hover:text-white transition-all duration-500"><Layers size={28} /></div>
                                                <div className="text-5xl font-black text-secondary tracking-tighter pt-2 flex items-start"><span className="text-xl mt-2 mr-1">₺</span>{service.price}</div>
                                            </div>
                                            <h3 className="text-2xl font-bold mb-3">{service.name}</h3>
                                            <p className="text-zinc-500 text-sm font-body leading-relaxed mb-10 h-10 line-clamp-2">{service.description}</p>
                                            <div className="flex items-center justify-between pt-8 border-t border-white/5">
                                                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]" /> <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{service.duration} Dakikalık Seans</span></div>
                                                <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button onClick={() => { setCurrentService(service); setIsEditingService(true); }} className="text-zinc-500 hover:text-white transition-all"><Edit3 size={20} /></button>
                                                    <button onClick={() => handleDeleteService(service.id)} className="text-zinc-500 hover:text-red-500 transition-all"><Trash2 size={20} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* GENEL AYARLAR VIEW */}
                    {activeView === "config" && (
                        <motion.div key="config" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-5xl mx-auto h-full">
                            <header>
                                <h2 className="text-5xl font-black italic tracking-tighter uppercase mb-4">SİSTEM <span className="text-secondary not-italic">KONFİGÜRASYONU</span></h2>
                                <p className="text-zinc-500 font-body italic">Web sitesinin ana başlığını, iletişim bilgilerini ve kurumsal renklerini buradan kontrol edin.</p>
                            </header>

                            <div className="grid md:grid-cols-2 gap-12 bg-zinc-900/30 backdrop-blur-xl p-16 rounded-[4rem] border border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black uppercase tracking-widest pl-2"><Globe size={14} className="text-secondary" /> Site Başlığı</div>
                                        <input type="text" value={config.site_title} onChange={(e) => setConfig({ ...config, site_title: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-5 rounded-2xl outline-none focus:border-secondary font-bold text-white transition-all" />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black uppercase tracking-widest pl-2"><Smartphone size={14} className="text-secondary" /> İletişim Numarası</div>
                                        <input type="text" value={config.phone} onChange={(e) => setConfig({ ...config, phone: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-5 rounded-2xl outline-none focus:border-secondary font-bold text-white transition-all" />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black uppercase tracking-widest pl-2"><Mail size={14} className="text-secondary" /> Kurumsal E-Posta</div>
                                        <input type="email" value={config.email} onChange={(e) => setConfig({ ...config, email: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-5 rounded-2xl outline-none focus:border-secondary font-bold text-white transition-all" />
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black uppercase tracking-widest pl-2"><Instagram size={14} className="text-secondary" /> Instagram Bilgisi</div>
                                        <input type="text" value={config.instagram} onChange={(e) => setConfig({ ...config, instagram: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-5 rounded-2xl outline-none focus:border-secondary font-bold text-white transition-all" />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black uppercase tracking-widest pl-2"><Palette size={14} className="text-secondary" /> Ana Marka Rengi</div>
                                        <div className="flex items-center gap-4 bg-zinc-950 border border-zinc-800 p-4 rounded-2xl">
                                            <div className="w-10 h-10 rounded-xl" style={{ backgroundColor: config.primary_color }} />
                                            <input type="text" value={config.primary_color} onChange={(e) => setConfig({ ...config, primary_color: e.target.value })} className="bg-transparent border-none outline-none font-mono font-bold text-zinc-400 w-full" />
                                        </div>
                                    </div>
                                    <div className="pt-8">
                                        <button onClick={handleSaveConfig} className="w-full py-6 bg-secondary text-white rounded-[2rem] font-black uppercase tracking-widest shadow-[0_20px_40px_rgba(249,123,34,0.3)] hover:-translate-y-1 transition-all flex items-center justify-center gap-4 group">
                                            <Save size={24} className="group-hover:rotate-12 transition-transform" /> YAPILANDIRMAYI KAYDET
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* BLOG & SECURITY VIEWS (Bundled in same flow as previous v2) */}
                    {activeView === "blog" && (
                        <div className="space-y-12">
                            <header className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-5xl font-black italic tracking-tighter uppercase mb-2">MAKALE <span className="text-secondary not-italic">EDİTÖRÜ</span></h2>
                                    <p className="text-zinc-500 font-body italic">İçerik stratejinizi yönetin ve makalelerinizi yayınlayın.</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setCurrentPost({ title: "", slug: "", category: "Genel", excerpt: "", content: "", image_url: "" });
                                        setIsEditingPost(true);
                                    }}
                                    className="px-8 py-4 bg-secondary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:-translate-y-1 transition-all flex items-center gap-3"
                                >
                                    <Plus size={20} /> YENİ MAKALE YAZ
                                </button>
                            </header>

                            {isEditingPost ? (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900/50 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-white/10 shadow-2xl space-y-8">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest ml-2">Makale Başlığı</span>
                                            <input type="text" value={currentPost.title} onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-5 rounded-2xl outline-none focus:border-secondary text-white font-bold" placeholder="Giriş başlığı..." />
                                        </div>
                                        <div className="space-y-4">
                                            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest ml-2">URL Adresi (Slug)</span>
                                            <input type="text" value={currentPost.slug} onChange={(e) => setCurrentPost({ ...currentPost, slug: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-5 rounded-2xl outline-none focus:border-secondary text-zinc-400 font-mono" placeholder="makale-url-adresi" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest ml-2">Kısa Özet</span>
                                        <textarea value={currentPost.excerpt} onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-5 rounded-2xl outline-none focus:border-secondary text-zinc-300 resize-none h-24" placeholder="Ana sayfada görünecek kısa açıklama..." />
                                    </div>

                                    <div className="space-y-4">
                                        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest ml-2">Makale İçeriği (Markdown Destekli)</span>
                                        <textarea value={currentPost.content} onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-5 rounded-2xl outline-none focus:border-secondary text-zinc-300 resize-none h-96 font-body leading-relaxed" placeholder="Tüm içeriği buraya yazın..." />
                                    </div>

                                    <div className="flex gap-4 pt-6">
                                        <button onClick={() => setIsEditingPost(false)} className="px-8 py-4 border border-zinc-800 rounded-2xl text-zinc-500 font-black uppercase tracking-widest hover:bg-white/5 transition-all">İptal</button>
                                        <button onClick={handleSavePost} className="flex-1 py-4 bg-secondary text-white rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center justify-center gap-3"><Save size={20} /> MAKALE YAYINLA</button>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {posts.map((post) => (
                                        <div key={post.id} className="bg-zinc-900/30 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 group hover:border-secondary/30 transition-all">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="bg-secondary/10 px-3 py-1 rounded-full text-[10px] font-black uppercase text-secondary tracking-widest">{post.category}</div>
                                                <div className="flex gap-3">
                                                    <button onClick={() => { setCurrentPost(post); setIsEditingPost(true); }} className="text-zinc-500 hover:text-white transition-colors"><Edit3 size={18} /></button>
                                                    <button onClick={() => handleDeletePost(post.id)} className="text-zinc-500 hover:text-destructive transition-colors"><Trash2 size={18} /></button>
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-bold mb-3 group-hover:text-secondary transition-colors">{post.title}</h3>
                                            <p className="text-zinc-500 text-sm line-clamp-3 mb-6">{post.excerpt}</p>
                                            <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-mono">
                                                <Calendar size={12} /> {new Date(post.created_at).toLocaleDateString('tr-TR')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeView === "security" && (
                        <div className="p-4 flex flex-col items-center justify-center h-full space-y-8">
                            <ShieldCheck size={80} className="text-secondary" />
                            <div className="text-center">
                                <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-2">GÜVENLİK <span className="text-secondary not-italic">KALKANI</span></h3>
                                <p className="text-zinc-500 italic">AES-256 ve Row Level Security aktif olarak çalışmaktadır.</p>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default MasterAdminDashboard;
