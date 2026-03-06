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
    Map
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type View = "stats" | "blog" | "services" | "config" | "security";

const MasterAdminDashboard = ({ onClose }: { onClose: () => void }) => {
    const [activeView, setActiveView] = useState<View>("stats");
    const [loading, setLoading] = useState(false);

    // Blog State
    const [posts, setPosts] = useState<any[]>([]);
    const [isEditingPost, setIsEditingPost] = useState(false);
    const [currentPost, setCurrentPost] = useState<any>(null);

    // Services State
    const [services, setServices] = useState<any[]>([]);

    // Mock Analytics Data for "Wow" effect
    const [stats] = useState({
        totalRevenue: "128,450",
        appointmentCount: 482,
        clientsCount: 224,
        blogViews: "12,8K",
        performance: 99,
        securityScore: "A+",
        serverUptime: "99.99%",
        systemLoad: 12
    });

    useEffect(() => {
        fetchData();
    }, [activeView]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeView === "blog") {
                const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
                if (data) setPosts(data);
            } else if (activeView === "services") {
                const { data } = await supabase.from('services').select('*').order('name');
                if (data) setServices(data);
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const handleSavePost = async () => {
        setLoading(true);
        const { error } = await supabase
            .from('blog_posts')
            .upsert({
                ...currentPost,
                updated_at: new Date().toISOString()
            });

        if (error) {
            toast.error("Yazı kaydedilemedi: " + error.message);
        } else {
            toast.success("Yazı başarıyla kaydedildi.");
            setIsEditingPost(false);
            fetchData();
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[60] bg-[#050505] text-zinc-100 flex overflow-hidden font-sans selection:bg-secondary/30">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-primary/5 blur-[100px] rounded-full" />
                <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-blue-500/5 blur-[80px] rounded-full" />
            </div>

            {/* Sidebar - Elite Glass Design */}
            <aside className="relative z-10 w-24 lg:w-80 h-full bg-zinc-900/50 backdrop-blur-2xl border-r border-zinc-800/50 flex flex-col items-center lg:items-start transition-all">
                <div className="p-8 mb-8 flex items-center gap-4 w-full justify-center lg:justify-start">
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        className="w-12 h-12 bg-gradient-to-br from-secondary to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(249,123,34,0.3)] ring-1 ring-white/20"
                    >
                        <Zap size={24} fill="white" />
                    </motion.div>
                    <div className="hidden lg:block">
                        <h1 className="text-xl font-bold tracking-tight text-white font-display uppercase">Command Center</h1>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">System Active</span>
                        </div>
                    </div>
                </div>

                <nav className="w-full px-4 space-y-2">
                    {[
                        { id: "stats", label: "Dashboard", icon: LayoutDashboard },
                        { id: "blog", label: "CMS Editor", icon: FileText },
                        { id: "services", label: "Economics", icon: Briefcase },
                        { id: "security", label: "Security", icon: ShieldCheck },
                        { id: "config", label: "Settings", icon: Settings },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveView(item.id as View);
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
                                <span className="hidden lg:block ml-auto px-1.5 py-0.5 rounded-md bg-zinc-800 text-[8px] font-black text-secondary ring-1 ring-secondary/20">LIVE</span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto w-full p-4 space-y-4">
                    <div className="bg-zinc-800/20 rounded-2xl p-4 border border-zinc-700/30 hidden lg:block">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase">Database Load</span>
                            <span className="text-xs font-mono text-zinc-400">12%</span>
                        </div>
                        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "12%" }}
                                className="h-full bg-secondary shadow-[0_0_10px_rgba(249,123,34,0.5)]"
                            />
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full flex items-center gap-4 p-4 text-zinc-500 hover:text-destructive transition-colors group"
                    >
                        <LogOut size={20} />
                        <span className="hidden lg:block font-bold text-sm uppercase tracking-widest text-[10px]">Terminate Session</span>
                    </button>
                </div>
            </aside>

            {/* Main Content - Bento Canvas */}
            <main className="relative z-10 flex-1 overflow-y-auto bg-gradient-to-b from-[#0a0a0a] to-black p-6 md:p-12 lg:p-16">
                <header className="mb-12 flex justify-between items-end">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h2 className="text-5xl font-black tracking-tighter text-white mb-2 italic">CORE <span className="text-secondary not-italic">COMMAND</span></h2>
                        <div className="flex items-center gap-4 text-zinc-500 text-xs font-bold uppercase tracking-[0.2em]">
                            <span>Alpha 0.6</span>
                            <span className="w-1 h-1 rounded-full bg-zinc-700" />
                            <span>v{new Date().toISOString().split('T')[0].replace(/-/g, '.')}</span>
                        </div>
                    </motion.div>

                    <div className="hidden lg:flex gap-3">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-[10px] font-bold">U{i}</div>
                            ))}
                        </div>
                        <div className="h-10 px-4 bg-zinc-900/50 backdrop-blur-md rounded-xl border border-zinc-800 flex items-center gap-3">
                            <Bell size={16} className="text-zinc-500" />
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                        </div>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {activeView === "stats" && (
                        <motion.div
                            key="stats"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            className="grid lg:grid-cols-4 lg:grid-rows-6 gap-6 h-[1000px] lg:h-[800px]"
                        >
                            {/* Revenue Card - High Priority */}
                            <div className="lg:col-span-2 lg:row-span-3 bg-zinc-900/30 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-10 flex flex-col justify-between group overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-secondary/10 transition-colors" />
                                <div>
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="bg-secondary/10 p-3 rounded-2xl border border-secondary/20">
                                            <TrendingUp className="text-secondary" size={24} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest bg-emerald-500/5 px-3 py-1 rounded-full ring-1 ring-emerald-500/20">+12.4% MoM</span>
                                    </div>
                                    <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-2">Portfolio Value</div>
                                    <div className="text-6xl font-black text-white tracking-tighter">₺{stats.totalRevenue}</div>
                                </div>
                                <div className="mt-12 h-24 flex items-end gap-1.5">
                                    {[20, 45, 30, 60, 40, 50, 80, 55, 90, 70, 85, 95].map((h, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ height: 0 }}
                                            animate={{ height: `${h}%` }}
                                            transition={{ delay: i * 0.05 }}
                                            className="flex-1 bg-gradient-to-t from-secondary to-orange-400 rounded-t-md opacity-40 group-hover:opacity-100 transition-opacity"
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Performance Ring */}
                            <div className="lg:col-span-1 lg:row-span-3 bg-zinc-900/30 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                                <Activity className="absolute top-6 right-6 text-zinc-700 group-hover:text-secondary transition-colors" size={20} />
                                <div className="relative w-40 h-40 mb-6">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="80" cy="80" r="70"
                                            fill="none" strokeWidth="6"
                                            className="stroke-zinc-800"
                                        />
                                        <motion.circle
                                            cx="80" cy="80" r="70"
                                            fill="none" strokeWidth="8"
                                            strokeDasharray="440"
                                            initial={{ strokeDashoffset: 440 }}
                                            animate={{ strokeDashoffset: 440 - (440 * 99) / 100 }}
                                            className="stroke-secondary"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-4xl font-black text-white">99%</span>
                                        <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-[.25em]">Optimal</span>
                                    </div>
                                </div>
                                <h3 className="font-bold text-zinc-300">System Performance</h3>
                                <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-bold">Hardware Latency: 4ms</p>
                            </div>

                            {/* Live Terminal / Events */}
                            <div className="lg:col-span-1 lg:row-span-4 bg-[#0a0a0a] rounded-[2.5rem] border border-zinc-800/50 p-6 flex flex-col gap-4 relative overflow-hidden">
                                <div className="flex items-center gap-2 mb-2 p-2 border-b border-zinc-800/50">
                                    <Terminal size={14} className="text-secondary" />
                                    <span className="text-[10px] font-mono text-zinc-500">Live Traffic Logs</span>
                                </div>
                                <div className="flex-1 font-mono text-[10px] space-y-3 overflow-hidden">
                                    {[
                                        { time: "12:04:22", event: "NEW_APPOINTMENT_CREATED", id: "ap_394" },
                                        { time: "12:02:10", event: "CLIENT_PORTAL_AUTH_SUCCESS", id: "user_82" },
                                        { time: "11:58:45", event: "DOC_UPLOAD_INITIATED", id: "scan_02.pdf" },
                                        { time: "11:55:12", event: "DB_SYNC_COMPLETED", id: "sh_central" },
                                        { time: "11:50:01", event: "CACHE_PURGED", id: "edge_node_tr" },
                                        { time: "11:45:30", event: "SMS_REMINDER_SENT", id: "c_829" },
                                        { time: "11:40:12", event: "WEBSOCKET_OPENED", id: "id_912" },
                                        { time: "11:35:45", event: "SEO_INDEX_RESCAN", id: "google_bot" },
                                        { time: "11:30:00", event: "BACKUP_SNAPSHOT_TAKEN", id: "aws_s3" }
                                    ].map((log, i) => (
                                        <div key={i} className="flex gap-4 opacity-50 hover:opacity-100 transition-opacity">
                                            <span className="text-zinc-600">{log.time}</span>
                                            <span className="text-secondary truncate">{log.event}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Geo Location Map Box */}
                            <div className="lg:col-span-2 lg:row-span-3 bg-zinc-900/30 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8 flex flex-col relative overflow-hidden group">
                                <div className="absolute inset-0 opacity-10 pointer-events-none p-12">
                                    <Map className="w-full h-full text-white" />
                                </div>
                                <div className="flex justify-between items-start relative z-10 mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold">Geo-Traffic Monitoring</h3>
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Node Distribution</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                                        <span className="text-[10px] font-mono font-bold text-secondary">Active Region: Istanbul / TR</span>
                                    </div>
                                </div>
                                <div className="mt-auto relative z-10 grid grid-cols-3 gap-8">
                                    <div>
                                        <div className="text-2xl font-black uppercase tracking-tighter">94%</div>
                                        <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Turkey</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black uppercase tracking-tighter">4%</div>
                                        <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Germany</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black uppercase tracking-tighter">2%</div>
                                        <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Netherlands</div>
                                    </div>
                                </div>
                            </div>

                            {/* Mini Stats Cards */}
                            <div className="lg:col-span-1 lg:row-span-2 bg-gradient-to-br from-secondary/20 to-orange-600/5 backdrop-blur-xl rounded-[2.5rem] border border-secondary/20 p-8 flex flex-col justify-between group cursor-pointer hover:shadow-[0_0_30px_rgba(249,123,34,0.1)] transition-all">
                                <Users className="text-secondary mb-4 group-hover:scale-110 transition-transform" size={28} />
                                <div>
                                    <div className="text-4xl font-black leading-none mb-1">{stats.clientsCount}</div>
                                    <div className="text-[10px] text-secondary font-bold uppercase tracking-widest">Active Clients</div>
                                </div>
                            </div>

                            <div className="lg:col-span-1 lg:row-span-2 bg-zinc-900/40 rounded-[2.5rem] border border-zinc-800 p-8 flex flex-col justify-between group cursor-pointer hover:bg-zinc-800/50 transition-all">
                                <Zap className="text-white/20 mb-4 group-hover:text-amber-500 transition-colors" size={28} />
                                <div>
                                    <div className="text-4xl font-black leading-none mb-1">{stats.blogViews}</div>
                                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Interactions</div>
                                </div>
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
                                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">Master <span className="text-secondary not-italic">CMS</span></h3>
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">Intelligence Editorial Suite</span>
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
                                        <Plus size={18} /> NEW BRIEF
                                    </motion.button>
                                )}
                                {isEditingPost && (
                                    <div className="flex gap-4">
                                        <button onClick={() => setIsEditingPost(false)} className="px-6 py-3 text-zinc-400 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest underline decoration-secondary underline-offset-8">Cancel</button>
                                        <button
                                            onClick={handleSavePost}
                                            className="px-8 py-3 bg-secondary text-white rounded-2xl font-bold shadow-lg flex items-center gap-2"
                                        >
                                            <Save size={18} /> DEPLOY
                                        </button>
                                    </div>
                                )}
                            </header>

                            {!isEditingPost ? (
                                <div className="p-12 grid gap-4 overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-zinc-800">
                                    {posts.map((post) => (
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
                                                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Modified: {new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
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
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 overflow-y-auto space-y-12 max-w-5xl mx-auto w-full">
                                    <div className="space-y-4">
                                        <span className="text-[10px] text-secondary font-black uppercase tracking-[0.5em]">Intel Payload</span>
                                        <input
                                            type="text"
                                            placeholder="ENGAGING HEADLINE..."
                                            value={currentPost.title}
                                            onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                                            className="w-full text-6xl font-black bg-transparent border-none outline-none placeholder:opacity-10 italic uppercase tracking-tighter"
                                        />
                                        <div className="flex items-center gap-2 font-mono text-zinc-500 text-xs">
                                            <Globe size={12} />
                                            <span>icselsiginak.com/blog/</span>
                                            <input
                                                type="text"
                                                placeholder="url-end-point"
                                                value={currentPost.slug}
                                                onChange={(e) => setCurrentPost({ ...currentPost, slug: e.target.value })}
                                                className="bg-zinc-950/50 px-3 py-1 rounded-md border border-zinc-800 text-secondary outline-none w-64"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-6 pt-4 border-t border-zinc-800/50">
                                        <div className="space-y-3">
                                            <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block">Metadata Section</span>
                                            <select
                                                value={currentPost.category}
                                                onChange={(e) => setCurrentPost({ ...currentPost, category: e.target.value })}
                                                className="bg-zinc-950 border border-zinc-800 px-6 py-3 rounded-xl text-xs outline-none focus:border-secondary transition-all font-bold uppercase tracking-widest pr-10"
                                            >
                                                <option value="Genel">General Intelligence</option>
                                                <option value="Farkındalık">Mindfulness</option>
                                                <option value="Terapi">Clinical Therapy</option>
                                                <option value="Motivasyon">Strategic Motivation</option>
                                            </select>
                                        </div>
                                        <div className="space-y-3 flex-1">
                                            <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block">Visual Interface Header</span>
                                            <div className="flex items-center gap-4 bg-zinc-950 border border-zinc-800 px-6 py-3 rounded-xl">
                                                <ImageIcon size={18} className="text-secondary" />
                                                <input
                                                    type="text"
                                                    placeholder="SOURCE_IMAGE_PATH_HTTPS://"
                                                    value={currentPost.image_url}
                                                    onChange={(e) => setCurrentPost({ ...currentPost, image_url: e.target.value })}
                                                    className="bg-transparent border-none outline-none text-xs w-full font-mono text-zinc-400"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block">Engagement Brief (Excerpt)</span>
                                        <textarea
                                            placeholder="Write a compelling executive summary..."
                                            value={currentPost.excerpt}
                                            onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })}
                                            className="w-full p-8 bg-zinc-950/50 rounded-[2.5rem] border border-zinc-800 outline-none font-body text-zinc-300 text-lg resize-none focus:border-secondary/50 transition-all leading-relaxed"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="space-y-4 pb-12">
                                        <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block">Main Decrypted Content</span>
                                        <textarea
                                            placeholder="Transmit your message to the world..."
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
                                <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-4 text-white">Security <span className="text-secondary not-italic">Shield</span></h2>
                                <p className="text-zinc-500 font-body max-w-2xl leading-relaxed">Real-time encryption monitoring and access audit protocols enabled across all edge nodes.</p>
                            </header>

                            <div className="grid lg:grid-cols-2 gap-8">
                                <div className="bg-zinc-900/40 border border-zinc-800 rounded-[3rem] p-10 space-y-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl" />
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary ring-1 ring-secondary/30">
                                            <ShieldCheck size={28} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold">RLS Protocol</h4>
                                            <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Active & Validated</span>
                                        </div>
                                    </div>
                                    <p className="text-zinc-500 text-sm leading-relaxed">
                                        Veritabanı erişimi, kullanıcı bazlı Row Level Security (RLS) politikaları ile %100 izole edilmiştir. Admin harici hiçbir kullanıcı diğer kullanıcıların verilerine (notlar, dosyalar, seanslar) erişemez.
                                    </p>
                                    <div className="bg-[#050505] p-6 rounded-2xl border border-zinc-800 font-mono text-[10px] text-zinc-500">
                                        <span className="text-secondary"># Security Audit Log</span><br />
                                        [12:10] TLS_CERT_VALIDATED: true<br />
                                        [12:10] CORS_POLICY: enforced (allowed_origins: *)<br />
                                        [12:11] RLS_STATUS: operational
                                    </div>
                                </div>

                                <div className="bg-zinc-900/40 border border-zinc-800 rounded-[3rem] p-10 space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary ring-1 ring-secondary/30">
                                            <Lock size={28} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold">Encrypted Storage</h4>
                                            <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">AES-256 Verified</span>
                                        </div>
                                    </div>
                                    <p className="text-zinc-500 text-sm leading-relaxed">
                                        Yüklenen tüm dosyalar ve seans notları, istirahatte ve transferde yüksek seviyeli şifreleme ile korunur. Supabase Auth altyapısı sayesinde şifreler asla okunamaz formatta (hashed) tutulur.
                                    </p>
                                    <div className="flex items-center justify-between p-6 bg-zinc-950 rounded-2xl border border-zinc-800">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="text-emerald-500" size={16} />
                                            <span className="text-xs font-bold uppercase tracking-widest">SSL Encryption</span>
                                        </div>
                                        <div className="text-[10px] font-mono font-black text-secondary">A+ STABLE</div>
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
                                    <h2 className="text-5xl font-black italic tracking-tighter uppercase mb-2">Commerce <span className="text-secondary not-italic">Center</span></h2>
                                    <p className="text-zinc-500 font-body">Manage service offerings and dynamic pricing tier analytics.</p>
                                </div>
                                <button className="px-10 py-4 bg-secondary text-white rounded-[1.5rem] font-bold shadow-[0_10px_30px_rgba(249,123,34,0.3)] hover:-translate-y-1 transition-all flex items-center gap-3">
                                    <Plus size={20} /> CREATE OFFERING
                                </button>
                            </header>

                            <div className="grid lg:grid-cols-2 gap-8">
                                {services.length > 0 ? services.map((service) => (
                                    <div key={service.id} className="bg-zinc-900/30 backdrop-blur-xl p-10 rounded-[3rem] border border-white/5 group hover:border-secondary/30 transition-all cursor-pointer overflow-hidden relative">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-3xl -mr-10 -mt-10" />
                                        <div className="flex justify-between items-start mb-10 relative z-10">
                                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white ring-1 ring-white/10 group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                                                <Layers size={28} />
                                            </div>
                                            <div className="text-4xl font-black text-secondary tracking-tighter pt-2">₺{service.price}</div>
                                        </div>
                                        <h3 className="text-2xl font-bold mb-3 relative z-10">{service.name}</h3>
                                        <p className="text-zinc-500 text-sm font-body leading-relaxed mb-10 h-10 line-clamp-2 relative z-10">{service.description}</p>
                                        <div className="flex items-center justify-between pt-8 border-t border-white/5 relative z-10">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{service.duration} Minutes Session</span>
                                            </div>
                                            <div className="flex gap-4 opacity-30 group-hover:opacity-100 transition-opacity">
                                                <button className="text-zinc-500 hover:text-white transition-colors transition-all"><Edit3 size={20} /></button>
                                                <button className="text-zinc-500 hover:text-red-500 transition-colors transition-all"><Trash2 size={20} /></button>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-32 bg-zinc-900/20 rounded-[3rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center">
                                        <Briefcase size={64} className="text-white/5 mb-6" />
                                        <p className="text-zinc-500 font-body text-xl italic max-w-sm leading-relaxed">Economic infrastructure not yet established. Create your first service to begin operations.</p>
                                        <button className="mt-8 px-10 py-4 border border-zinc-700 rounded-2xl text-xs font-black tracking-widest hover:border-secondary hover:text-secondary transition-all">INITIALIZE MODULE</button>
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
