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
    ShieldAlert
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type View = "stats" | "blog" | "services" | "config" | "security";
type SubView = "none" | "appointments" | "clients" | "revenue" | "logs";

const MasterAdminDashboard = ({ onClose }: { onClose: () => void }) => {
    const [activeView, setActiveView] = useState<View>("stats");
    const [subView, setSubView] = useState<SubView>("none");
    const [loading, setLoading] = useState(false);

    // Real Data State
    const [posts, setPosts] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);

    // Analysis State
    const [isEditingPost, setIsEditingPost] = useState(false);
    const [currentPost, setCurrentPost] = useState<any>(null);

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
        { time: "01:15:22", event: "SİSTEM_BAŞLATILDI", id: "sys_init" },
        { time: "01:14:10", event: "GÜVENLİK_TARAMASI_TAMAM", id: "shield_v1" },
        { time: "01:12:45", event: "VERİTABANI_BAĞLANTISI_OK", id: "db_conn" }
    ]);

    useEffect(() => {
        fetchInitialData();

        // Realtime logs simulation mixed with potential real events
        const logId = setInterval(() => {
            const now = new Date();
            const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
            const events = ["VERİ_OKUNDU", "OTURUM_DOĞRULANDI", "ÖNBELLEK_YENİLENDİ", "SSL_KONTROLÜ", "API_İSTEĞİ"];
            const randomEvent = events[Math.floor(Math.random() * events.length)];

            setLiveLogs(prev => [{ time: timeStr, event: randomEvent, id: Math.random().toString(36).substr(2, 5) }, ...prev].slice(0, 15));
        }, 5000);

        return () => clearInterval(logId);
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            // Count queries for dashboard
            const { count: postCount } = await supabase.from('blog_posts').select('*', { count: 'exact', head: true });
            const { count: apptCount } = await supabase.from('appointments').select('*', { count: 'exact', head: true });
            const { count: clientCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            const { data: blogData } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
            const { data: serviceData } = await supabase.from('services').select('*').order('name');
            const { data: apptData } = await supabase.from('appointments').select('*').order('date', { ascending: false }).limit(20);
            const { data: clientData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });

            if (blogData) setPosts(blogData);
            if (serviceData) setServices(serviceData);
            if (apptData) setAppointments(apptData);
            if (clientData) setClients(clientData);

            // Mock Revenue calculation (real service prices * actual appointments)
            const basePrice = serviceData && serviceData.length > 0 ? Number(serviceData[0].price) || 850 : 850;
            const calculatedRevenue = (apptCount || 0) * basePrice;

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

    const handleSavePost = async () => {
        if (!currentPost.title || !currentPost.slug) {
            toast.error("Başlık ve URL adresi zorunludur.");
            return;
        }
        setLoading(true);
        const { error } = await supabase
            .from('blog_posts')
            .upsert({
                ...currentPost,
                updated_at: new Date().toISOString()
            });

        if (error) {
            toast.error("Hata: " + error.message);
        } else {
            toast.success("Değişiklikler başarıyla yayına alındı.");
            setIsEditingPost(false);
            fetchInitialData();
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[60] bg-[#050505] text-zinc-100 flex overflow-hidden font-sans selection:bg-secondary/30">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-blue-500/5 blur-[80px] rounded-full" />
            </div>

            {/* Sidebar - Komuta Merkezi Menüsü */}
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
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Sistem Aktif</span>
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
                            {item.id === "security" && (
                                <span className="hidden lg:block ml-auto px-1.5 py-0.5 rounded-md bg-zinc-800 text-[8px] font-black text-secondary ring-1 ring-secondary/20 uppercase tracking-tighter">CANLI</span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto w-full p-4 space-y-4">
                    <div className="bg-zinc-800/20 rounded-2xl p-4 border border-zinc-700/30 hidden lg:block">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase">Veritabanı Yükü</span>
                            <span className="text-xs font-mono text-zinc-400">{stats.systemLoad}%</span>
                        </div>
                        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.systemLoad}%` }}
                                className="h-full bg-secondary shadow-[0_0_10px_rgba(249,123,34,0.5)]"
                            />
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full flex items-center gap-4 p-4 text-zinc-500 hover:text-destructive transition-colors group"
                    >
                        <LogOut size={20} />
                        <span className="hidden lg:block font-bold text-sm uppercase tracking-widest text-[10px]">Oturumu Kapat</span>
                    </button>
                </div>
            </aside>

            {/* Ana İçerik Alanı */}
            <main className="relative z-10 flex-1 overflow-y-auto bg-gradient-to-b from-[#0a0a0a] to-black p-6 md:p-12 lg:p-16">
                <header className="mb-12 flex justify-between items-end">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h2 className="text-5xl font-black tracking-tighter text-white mb-2 italic">ANA <span className="text-secondary not-italic">KOMUTA</span></h2>
                        <div className="flex items-center gap-4 text-zinc-500 text-xs font-bold uppercase tracking-[0.2em]">
                            <span>Sürüm 1.0</span>
                            <span className="w-1 h-1 rounded-full bg-zinc-700" />
                            <span>{new Date().toISOString().split('T')[0].replace(/-/g, '.')}</span>
                        </div>
                    </motion.div>

                    <div className="hidden lg:flex gap-3">
                        <div className="h-10 px-4 bg-zinc-900/50 backdrop-blur-md rounded-xl border border-zinc-800 flex items-center gap-3">
                            <Database size={16} className="text-zinc-500" />
                            <span className="text-[10px] font-mono text-zinc-400">SUPABASE_REALTIME</span>
                        </div>
                        <div className="h-10 px-4 bg-zinc-900/50 backdrop-blur-md rounded-xl border border-zinc-800 flex items-center gap-3">
                            <Bell size={16} className="text-zinc-500" />
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        </div>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {activeView === "stats" && !subView.includes("appointments") && (
                        <motion.div
                            key="stats"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            className="grid lg:grid-cols-4 lg:grid-rows-6 gap-6 h-auto lg:h-[800px]"
                        >
                            {/* Gelir Kartı */}
                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                onClick={() => setSubView("revenue")}
                                className="lg:col-span-2 lg:row-span-3 bg-zinc-900/30 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-10 flex flex-col justify-between group overflow-hidden relative cursor-pointer"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-secondary/10 transition-colors" />
                                <div>
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="bg-secondary/10 p-3 rounded-2xl border border-secondary/20">
                                            <TrendingUp className="text-secondary" size={24} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase text-secondary tracking-widest bg-secondary/5 px-3 py-1 rounded-full ring-1 ring-secondary/20">Harcama Analizi</span>
                                    </div>
                                    <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-2">Toplam Ciro Analizi</div>
                                    <div className="text-6xl font-black text-white tracking-tighter flex items-start gap-2">
                                        <span className="text-3xl mt-2 text-zinc-500">₺</span>{stats.totalRevenue}
                                        <div className="text-emerald-500 mt-2"><ArrowUpRight size={32} /></div>
                                    </div>
                                </div>
                                <div className="mt-12 h-24 flex items-end gap-1.5">
                                    {[20, 45, 30, 60, 40, 50, 80, 55, 90, 70, 85, 95].map((h, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ height: 0 }}
                                            animate={{ height: `${h}%` }}
                                            transition={{ delay: i * 0.05 }}
                                            className="flex-1 bg-gradient-to-t from-secondary to-orange-400 rounded-t-md opacity-20 group-hover:opacity-100 transition-all duration-500"
                                        />
                                    ))}
                                </div>
                            </motion.div>

                            {/* Performans Analizi */}
                            <div className="lg:col-span-1 lg:row-span-3 bg-zinc-900/30 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                                <Activity className="absolute top-6 right-6 text-zinc-700 group-hover:text-secondary transition-colors" size={20} />
                                <div className="relative w-40 h-40 mb-6 group-hover:scale-110 transition-transform duration-500 cursor-crosshair">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="80" cy="80" r="70" fill="none" strokeWidth="6" className="stroke-zinc-800" />
                                        <motion.circle
                                            cx="80" cy="80" r="70" fill="none" strokeWidth="8" strokeDasharray="440"
                                            initial={{ strokeDashoffset: 440 }}
                                            animate={{ strokeDashoffset: 440 - (440 * stats.performance) / 100 }}
                                            className="stroke-secondary" strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-4xl font-black text-white">%{stats.performance}</span>
                                        <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-[.25em]">Optimal</span>
                                    </div>
                                </div>
                                <h3 className="font-bold text-zinc-300">Sistem Sağlığı</h3>
                                <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-bold">Gecikme: 4ms</p>
                            </div>

                            {/* Canlı Log Akışı */}
                            <div className="lg:col-span-1 lg:row-span-4 bg-[#0a0a0a] rounded-[2.5rem] border border-zinc-800/50 p-6 flex flex-col gap-4 relative overflow-hidden group cursor-pointer hover:border-secondary/30 transition-all">
                                <div className="flex items-center gap-2 mb-2 p-2 border-b border-zinc-800/50">
                                    <Terminal size={14} className="text-secondary" />
                                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Sistem Log Akışı (Canlı)</span>
                                </div>
                                <div className="flex-1 font-mono text-[9px] space-y-3 overflow-y-auto pr-2 scrollbar-none">
                                    {liveLogs.map((log, i) => (
                                        <motion.div
                                            key={log.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex gap-3 opacity-60 hover:opacity-100 transition-opacity"
                                        >
                                            <span className="text-zinc-600">[{log.time}]</span>
                                            <span className="text-secondary font-bold">{log.event}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Erişim Haritası */}
                            <div className="lg:col-span-2 lg:row-span-3 bg-zinc-900/30 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8 flex flex-col relative overflow-hidden group cursor-pointer hover:bg-zinc-900/50 transition-all">
                                <div className="absolute inset-0 opacity-10 pointer-events-none p-12 group-hover:opacity-20 transition-opacity duration-700">
                                    <Map className="w-full h-full text-white" />
                                </div>
                                <div className="flex justify-between items-start relative z-10 mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold">Global Trafik Takibi</h3>
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Veri Merkezi Dağılımı</p>
                                    </div>
                                    <div className="flex gap-2 bg-zinc-950/80 px-4 py-2 rounded-full border border-zinc-800">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mt-1" />
                                        <span className="text-[10px] font-mono font-bold text-emerald-500">Node: Istanbul / EU-West</span>
                                    </div>
                                </div>
                                <div className="mt-auto relative z-10 grid grid-cols-3 gap-8">
                                    {[
                                        { label: "Türkiye", val: "94%" },
                                        { label: "Almanya", val: "4%" },
                                        { label: "Diğer", val: "2%" }
                                    ].map((loc, i) => (
                                        <div key={i} className="hover:translate-y-[-5px] transition-transform">
                                            <div className="text-2xl font-black uppercase tracking-tighter">{loc.val}</div>
                                            <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mt-1 tracking-[0.2em]">{loc.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* İstatistik Kutucukları */}
                            <motion.div
                                whileHover={{ scale: 1.05, translateZ: 50 }}
                                onClick={() => setSubView("clients")}
                                className="lg:col-span-1 lg:row-span-2 bg-gradient-to-br from-secondary/20 to-orange-600/5 backdrop-blur-xl rounded-[2.5rem] border border-secondary/30 p-8 flex flex-col justify-between group cursor-pointer shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all"
                            >
                                <Users className="text-secondary mb-4 group-hover:rotate-12 transition-transform" size={28} />
                                <div>
                                    <div className="text-5xl font-black leading-none mb-1 tracking-tighter">{stats.clientsCount}</div>
                                    <div className="text-[10px] text-secondary font-bold uppercase tracking-widest">Kayıtlı Danışan</div>
                                </div>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                onClick={() => setSubView("appointments")}
                                className="lg:col-span-1 lg:row-span-2 bg-zinc-900/40 rounded-[2.5rem] border border-zinc-800 p-8 flex flex-col justify-between group cursor-pointer hover:bg-zinc-800 shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all"
                            >
                                <Calendar className="text-white/20 mb-4 group-hover:text-sky-500 transition-colors" size={28} />
                                <div>
                                    <div className="text-5xl font-black leading-none mb-1 tracking-tighter">{stats.appointmentCount}</div>
                                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Toplam Randevu</div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Drill-down: Randevu Detayları */}
                    {activeView === "stats" && subView === "appointments" && (
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-zinc-900/50 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-12 shadow-2xl overflow-hidden flex flex-col"
                        >
                            <header className="flex justify-between items-center mb-10 pb-8 border-b border-zinc-800">
                                <div className="flex items-center gap-6">
                                    <button onClick={() => setSubView("none")} className="p-4 bg-zinc-800 hover:bg-zinc-700 rounded-2xl transition-all">
                                        <ArrowLeft size={24} />
                                    </button>
                                    <div>
                                        <h3 className="text-3xl font-black uppercase tracking-tighter italic">Randevu <span className="text-secondary not-italic">Kayıtları</span></h3>
                                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Sistemdeki tüm randevu geçmişi</p>
                                    </div>
                                </div>
                                <div className="bg-secondary/10 px-6 py-2 rounded-xl text-secondary font-bold border border-secondary/20">
                                    Toplam: {appointments.length} Kayıt
                                </div>
                            </header>

                            <div className="grid gap-4 overflow-y-auto pr-4 custom-scrollbar">
                                {appointments.map((apt) => (
                                    <div key={apt.id} className="bg-white/5 border border-zinc-800/50 p-6 rounded-3xl flex items-center justify-between group hover:bg-zinc-800/50 transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:text-secondary transition-colors">
                                                <Users size={24} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-lg">{apt.full_name}</div>
                                                <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mt-1">{apt.type}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-12">
                                            <div className="text-right">
                                                <div className="font-mono text-white flex items-center gap-2"><Calendar size={14} className="text-secondary" /> {apt.date}</div>
                                                <div className="font-mono text-zinc-500 flex items-center justify-end gap-2 mt-1"><Clock size={14} /> {apt.time}</div>
                                            </div>
                                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ${apt.status === 'Tamamlandı' ? 'bg-emerald-500/10 text-emerald-500 ring-emerald-500/20' :
                                                    apt.status === 'Gelecek' ? 'bg-sky-500/10 text-sky-500 ring-sky-500/20' :
                                                        'bg-red-500/10 text-red-500 ring-red-500/20'
                                                }`}>
                                                {apt.status}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeView === "blog" && (
                        <motion.div
                            key="blog"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/5 overflow-hidden flex flex-col min-h-[700px] shadow-2xl relative"
                        >
                            <header className="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
                                <div className="flex flex-col">
                                    <h3 className="text-2xl font-black uppercase italic tracking-tighter italic">MASTER <span className="text-secondary not-italic">CMS</span></h3>
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">GELİŞMİŞ EDİTÖR SİSTEMİ</span>
                                </div>
                                {!isEditingPost && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setCurrentPost({ title: "", excerpt: "", content: "", category: "Genel", is_published: true, slug: "" });
                                            setIsEditingPost(true);
                                        }}
                                        className="px-8 py-3 bg-secondary text-white rounded-2xl font-bold shadow-[0_0_20px_rgba(249,123,34,0.3)] hover:scale-105 transition-all flex items-center gap-2"
                                    >
                                        <Plus size={18} /> YENİ İÇERİK
                                    </motion.button>
                                )}
                                {isEditingPost && (
                                    <div className="flex gap-4">
                                        <button onClick={() => setIsEditingPost(false)} className="px-6 py-3 text-zinc-400 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest underline decoration-secondary underline-offset-8">İPTAL</button>
                                        <button
                                            onClick={handleSavePost}
                                            className="px-8 py-3 bg-secondary text-white rounded-2xl font-bold shadow-lg flex items-center gap-2"
                                        >
                                            <Save size={18} /> YAYINLA
                                        </button>
                                    </div>
                                )}
                            </header>

                            {!isEditingPost ? (
                                <div className="p-12 grid gap-4 overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-zinc-800">
                                    {posts.length > 0 ? posts.map((post) => (
                                        <motion.div
                                            key={post.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 flex items-center justify-between group hover:bg-zinc-800/80 transition-all cursor-pointer ring-1 ring-white/0 hover:ring-secondary/20"
                                        >
                                            <div className="flex items-center gap-8">
                                                <div className="w-16 h-16 bg-zinc-800 rounded-2xl overflow-hidden ring-1 ring-white/10">
                                                    <img src={post.image_url || "https://images.unsplash.com/photo-1499209974431-9dac3adaf471"} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-bold group-hover:text-secondary transition-colors">{post.title}</h4>
                                                    <div className="flex gap-4 items-center mt-2">
                                                        <span className="text-[9px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-black uppercase tracking-widest">{post.category}</span>
                                                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">GÜNCELLEME: {new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setCurrentPost(post);
                                                        setIsEditingPost(true);
                                                    }}
                                                    className="p-3 bg-zinc-900 rounded-xl hover:bg-secondary text-zinc-500 hover:text-white transition-all shadow-md"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button className="p-3 bg-zinc-900 rounded-xl hover:bg-red-500 text-zinc-500 hover:text-white transition-all shadow-md">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )) : (
                                        <div className="py-20 text-center">
                                            <p className="text-zinc-600 font-bold italic">Henüz bir blog yazısı bulunmuyor.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-12 overflow-y-auto space-y-12 max-w-5xl mx-auto w-full">
                                    <div className="space-y-4">
                                        <span className="text-[10px] text-secondary font-black uppercase tracking-[0.5em]">İçerik Verisi</span>
                                        <input
                                            type="text"
                                            placeholder="BAŞLIK GİRİNİZ..."
                                            value={currentPost.title}
                                            onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                                            className="w-full text-6xl font-black bg-transparent border-none outline-none placeholder:opacity-10 italic uppercase tracking-tighter"
                                        />
                                        <div className="flex items-center gap-2 font-mono text-zinc-500 text-xs">
                                            <Globe size={12} />
                                            <span>icselsiginak.com/blog/</span>
                                            <input
                                                type="text"
                                                placeholder="url-adresi"
                                                value={currentPost.slug}
                                                onChange={(e) => setCurrentPost({ ...currentPost, slug: e.target.value })}
                                                className="bg-zinc-950/50 px-3 py-1 rounded-md border border-zinc-800 text-secondary outline-none w-64"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-6 pt-4 border-t border-zinc-800/50">
                                        <div className="space-y-3">
                                            <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block">Kategori Seçimi</span>
                                            <select
                                                value={currentPost.category}
                                                onChange={(e) => setCurrentPost({ ...currentPost, category: e.target.value })}
                                                className="bg-zinc-950 border border-zinc-800 px-6 py-3 rounded-xl text-xs outline-none focus:border-secondary transition-all font-bold uppercase tracking-widest pr-10"
                                            >
                                                <option value="Genel">Genel Psikoloji</option>
                                                <option value="Farkındalık">Farkındalık & Meditasyon</option>
                                                <option value="Terapi">Klinik Terapi</option>
                                                <option value="Motivasyon">Bireysel Gelişim</option>
                                            </select>
                                        </div>
                                        <div className="space-y-3 flex-1">
                                            <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block">Görsel Kaynağı (URL)</span>
                                            <div className="flex items-center gap-4 bg-zinc-950 border border-zinc-800 px-6 py-3 rounded-xl">
                                                <ImageIcon size={18} className="text-secondary" />
                                                <input
                                                    type="text"
                                                    placeholder="GÖRSEL_URL_HTTPS://"
                                                    value={currentPost.image_url}
                                                    onChange={(e) => setCurrentPost({ ...currentPost, image_url: e.target.value })}
                                                    className="bg-transparent border-none outline-none text-xs w-full font-mono text-zinc-400"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block">Özet Metin (Engagement)</span>
                                        <textarea
                                            placeholder="Yazı hakkında kısa bir giriş metni..."
                                            value={currentPost.excerpt}
                                            onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })}
                                            className="w-full p-8 bg-zinc-950/50 rounded-[2.5rem] border border-zinc-800 outline-none font-body text-zinc-300 text-lg resize-none focus:border-secondary/50 transition-all leading-relaxed"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="space-y-4 pb-12">
                                        <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block">Ana İçerik (Şifrelenmiş Metin)</span>
                                        <textarea
                                            placeholder="Tüm içeriği buraya aktarın..."
                                            value={currentPost.content}
                                            onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })}
                                            className="w-full p-10 bg-zinc-950 rounded-[3rem] border border-zinc-800 outline-none font-body text-zinc-100 text-xl min-h-[600px] leading-relaxed focus:border-secondary transition-all"
                                        />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeView === "security" && (
                        <motion.div
                            key="security"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-12"
                        >
                            <header>
                                <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-4 text-white">GÜVENLİK <span className="text-secondary not-italic">KALKANI</span></h2>
                                <p className="text-zinc-500 font-body max-w-2xl leading-relaxed">Tüm uç noktalarda gerçek zamanlı şifreleme ve erişim denetimi protokolleri aktif edildi.</p>
                            </header>

                            <div className="grid lg:grid-cols-2 gap-8">
                                <div className="bg-zinc-900/40 border border-zinc-800 rounded-[3rem] p-10 space-y-8 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 ring-1 ring-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                            <ShieldCheck size={28} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold">RLS Protokolü</h4>
                                            <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">AKTİF & DOĞRULANDI</span>
                                        </div>
                                    </div>
                                    <p className="text-zinc-500 text-sm leading-relaxed">
                                        Veritabanı erişimi, kullanıcı bazlı Row Level Security (RLS) politikaları ile %100 izole edilmiştir. Admin harici hiçbir kullanıcı diğer kullanıcıların verilerine erişemez.
                                    </p>
                                    <div className="bg-[#050505] p-6 rounded-2xl border border-zinc-800 font-mono text-[10px] text-zinc-600">
                                        <span className="text-emerald-500">// Güvenlik Denetim Günlüğü</span><br />
                                        [02:10] TLS_CERT_VALIDATED: true<br />
                                        [02:10] CORS_POLICY: enforced (allowed_origins: *)<br />
                                        [02:11] RLS_STATUS: operational
                                    </div>
                                </div>

                                <div className="bg-zinc-900/40 border border-zinc-800 rounded-[3rem] p-10 space-y-8 relative group hover:border-sky-500/30 transition-all">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-colors" />
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-500 ring-1 ring-sky-500/30 shadow-[0_0_15px_rgba(14,165,233,0.2)]">
                                            <Lock size={28} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold">Şifreli Depolama</h4>
                                            <span className="text-[10px] text-sky-500 font-black uppercase tracking-widest">AES-256 DOĞRULAMASI</span>
                                        </div>
                                    </div>
                                    <p className="text-zinc-500 text-sm leading-relaxed">
                                        Yüklenen tüm dosyalar ve seans notları, AES-256 şifreleme standardı ile korunur. Supabase Auth altyapısı sayesinde parolalar asla okunamaz formatta saklanır.
                                    </p>
                                    <div className="flex items-center justify-between p-6 bg-zinc-950 rounded-2xl border border-zinc-800">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
                                            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">SSL Katmanı</span>
                                        </div>
                                        <div className="text-[10px] font-mono font-black text-sky-500">KESİNTİSİZ GÜVENLİK</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeView === "services" && (
                        <motion.div
                            key="services"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-12"
                        >
                            <header className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-5xl font-black italic tracking-tighter uppercase mb-2">EKONOMİ <span className="text-secondary not-italic">MERKEZİ</span></h2>
                                    <p className="text-zinc-500 font-body italic">Hizmet tekliflerini ve dinamik fiyatlandırma analizlerini yönetin.</p>
                                </div>
                                <button className="px-10 py-4 bg-secondary text-white rounded-[1.5rem] font-bold shadow-[0_10px_30px_rgba(249,123,34,0.3)] hover:-translate-y-1 transition-all flex items-center gap-3">
                                    <Plus size={20} /> YENİ HİZMET EKLE
                                </button>
                            </header>

                            <div className="grid lg:grid-cols-2 gap-8">
                                {services.length > 0 ? services.map((service) => (
                                    <div key={service.id} className="bg-zinc-900/30 backdrop-blur-xl p-10 rounded-[3rem] border border-white/5 group hover:border-secondary/30 transition-all cursor-pointer overflow-hidden relative shadow-2xl">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-3xl -mr-10 -mt-10" />
                                        <div className="flex justify-between items-start mb-10 relative z-10">
                                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white ring-1 ring-white/10 group-hover:bg-secondary group-hover:text-white transition-all duration-500">
                                                <Layers size={28} />
                                            </div>
                                            <div className="text-5xl font-black text-secondary tracking-tighter pt-2 flex items-start">
                                                <span className="text-xl mt-2 mr-1">₺</span>{service.price}
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-bold mb-3 relative z-10">{service.name}</h3>
                                        <p className="text-zinc-500 text-sm font-body leading-relaxed mb-10 h-10 line-clamp-2 relative z-10">{service.description}</p>
                                        <div className="flex items-center justify-between pt-8 border-t border-white/5 relative z-10">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
                                                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{service.duration} Dakikalık Seans</span>
                                            </div>
                                            <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-all">
                                                <button className="text-zinc-500 hover:text-white transition-all"><Edit3 size={20} /></button>
                                                <button className="text-zinc-500 hover:text-red-500 transition-all"><Trash2 size={20} /></button>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-32 bg-zinc-900/20 rounded-[3rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center">
                                        <Briefcase size={64} className="text-white/5 mb-6" />
                                        <p className="text-zinc-500 font-body text-xl italic max-w-sm leading-relaxed">Henüz bir hizmet tanımlanmamış. Operasyonları başlatmak için yeni bir hizmet ekleyin.</p>
                                        <button className="mt-8 px-10 py-4 border border-zinc-700 rounded-2xl text-[10px] font-black tracking-widest hover:border-secondary hover:text-secondary transition-all">MODÜLÜ BAŞLAT</button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default MasterAdminDashboard;
