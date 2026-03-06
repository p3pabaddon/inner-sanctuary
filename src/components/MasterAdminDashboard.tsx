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
    CheckCircle2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type View = "stats" | "blog" | "services" | "config";

const MasterAdminDashboard = ({ onClose }: { onClose: () => void }) => {
    const [activeView, setActiveView] = useState<View>("stats");
    const [loading, setLoading] = useState(false);

    // Blog State
    const [posts, setPosts] = useState<any[]>([]);
    const [isEditingPost, setIsEditingPost] = useState(false);
    const [currentPost, setCurrentPost] = useState<any>(null);

    // Services State
    const [services, setServices] = useState<any[]>([]);

    // Stats State
    const [stats, setStats] = useState({
        totalRevenue: 24500,
        appointmentCount: 156,
        clientsCount: 84,
        blogViews: 1205
    });

    useEffect(() => {
        fetchData();
    }, [activeView]);

    const fetchData = async () => {
        setLoading(true);
        if (activeView === "blog") {
            const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
            if (data) setPosts(data);
        } else if (activeView === "services") {
            const { data } = await supabase.from('services').select('*').order('name');
            if (data) setServices(data);
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
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-xl flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar */}
            <aside className="w-full md:w-80 bg-white dark:bg-zinc-900 border-r border-border p-8 flex flex-col">
                <div className="flex items-center gap-4 mb-12">
                    <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <LayoutDashboard size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-display font-bold">Master Admin</h1>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-body">Komuta Merkezi</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    {[
                        { id: "stats", label: "İstatistikler", icon: BarChart3 },
                        { id: "blog", label: "Blog Yönetimi", icon: FileText },
                        { id: "services", label: "Hizmetler & Fiyatlar", icon: Briefcase },
                        { id: "config", label: "Site Ayarları", icon: Settings },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveView(item.id as View);
                                setIsEditingPost(false);
                            }}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-display font-bold text-sm ${activeView === item.id
                                ? "bg-secondary text-white shadow-md"
                                : "hover:bg-accent dark:hover:bg-zinc-800 text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <item.icon size={20} /> {item.label}
                        </button>
                    ))}
                </nav>

                <button
                    onClick={onClose}
                    className="mt-8 flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:text-destructive transition-colors font-body group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Geri Dön
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-accent/5 dark:bg-zinc-950/50 p-6 md:p-12">
                <AnimatePresence mode="wait">
                    {activeView === "stats" && (
                        <motion.div
                            key="stats"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <header>
                                <h2 className="text-4xl font-display font-bold mb-2">Genel Bakış</h2>
                                <p className="text-muted-foreground italic">İşletmenizin performans özeti.</p>
                            </header>

                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: "Toplam Gelir", value: "₺" + stats.totalRevenue, icon: TrendingUp, color: "text-emerald-500" },
                                    { label: "Randevular", value: stats.appointmentCount, icon: Calendar, color: "text-sky-500" },
                                    { label: "Danışanlar", value: stats.clientsCount, icon: Users, color: "text-purple-500" },
                                    { label: "Blog Okunma", value: stats.blogViews, icon: Globe, color: "text-amber-500" },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-border shadow-sm">
                                        <stat.icon className={`${stat.color} mb-4`} size={24} />
                                        <div className="text-3xl font-display font-bold mb-1">{stat.value}</div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeView === "blog" && !isEditingPost && (
                        <motion.div
                            key="blog-list"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <header className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-4xl font-display font-bold mb-2">Blog Yönetimi</h2>
                                    <p className="text-muted-foreground italic">Yazılarınızı buradan oluşturun ve güncelleyin.</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setCurrentPost({ title: "", excerpt: "", content: "", category: "Genel", is_published: true, slug: "" });
                                        setIsEditingPost(true);
                                    }}
                                    className="px-8 py-4 bg-secondary text-white rounded-2xl font-display font-bold hover:shadow-lg transition-all flex items-center gap-2"
                                >
                                    <Plus size={20} /> Yeni Yazı
                                </button>
                            </header>

                            <div className="grid gap-4">
                                {posts.map((post) => (
                                    <div key={post.id} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-border flex items-center justify-between group transition-all hover:border-secondary/50">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-accent rounded-xl overflow-hidden">
                                                <img src={post.image_url || "https://images.unsplash.com/photo-1499209974431-9dac3adaf471"} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h3 className="font-display font-bold text-lg">{post.title}</h3>
                                                <div className="flex gap-3 mt-1">
                                                    <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-bold uppercase">{post.category}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase">{new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    setCurrentPost(post);
                                                    setIsEditingPost(true);
                                                }}
                                                className="p-3 rounded-xl hover:bg-secondary/10 text-secondary transition-all"
                                            >
                                                <Edit3 size={20} />
                                            </button>
                                            <button className="p-3 rounded-xl hover:bg-destructive/10 text-destructive transition-all">
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeView === "blog" && isEditingPost && (
                        <motion.div
                            key="blog-editor"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-zinc-900 rounded-[3rem] border border-border overflow-hidden flex flex-col h-full shadow-2xl"
                        >
                            <header className="p-8 border-b border-border flex justify-between items-center bg-accent/5">
                                <div className="flex items-center gap-4 font-display font-bold">
                                    <button onClick={() => setIsEditingPost(false)} className="p-2 hover:bg-accent rounded-full">
                                        <X size={20} />
                                    </button>
                                    <span>Yazı Editörü</span>
                                </div>
                                <button
                                    onClick={handleSavePost}
                                    className="px-8 py-3 bg-secondary text-white rounded-xl font-display font-bold hover:shadow-md transition-all flex items-center gap-2"
                                >
                                    <Save size={18} /> Kaydet
                                </button>
                            </header>
                            <div className="p-12 overflow-y-auto space-y-8 max-w-4xl mx-auto w-full">
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Yazı Başlığı..."
                                        value={currentPost.title}
                                        onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                                        className="w-full text-4xl font-display font-bold bg-transparent border-none outline-none placeholder:opacity-30"
                                    />
                                    <input
                                        type="text"
                                        placeholder="slug-adresi"
                                        value={currentPost.slug}
                                        onChange={(e) => setCurrentPost({ ...currentPost, slug: e.target.value })}
                                        className="w-full text-xs font-mono text-muted-foreground bg-transparent border-none outline-none"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <select
                                        value={currentPost.category}
                                        onChange={(e) => setCurrentPost({ ...currentPost, category: e.target.value })}
                                        className="bg-accent/50 px-4 py-2 rounded-xl text-sm outline-none border border-border"
                                    >
                                        <option value="Genel">Genel</option>
                                        <option value="Farkındalık">Farkındalık</option>
                                        <option value="Terapi">Terapi</option>
                                        <option value="Motivasyon">Motivasyon</option>
                                    </select>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-accent/50 rounded-xl border border-border">
                                        <ImageIcon size={16} className="text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="Görsel URL..."
                                            value={currentPost.image_url}
                                            onChange={(e) => setCurrentPost({ ...currentPost, image_url: e.target.value })}
                                            className="bg-transparent border-none outline-none text-xs w-64"
                                        />
                                    </div>
                                </div>

                                <textarea
                                    placeholder="Yazı özeti (kısa açıklama)..."
                                    value={currentPost.excerpt}
                                    onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })}
                                    className="w-full p-6 bg-accent/5 rounded-2xl border border-border outline-none font-body text-sm resize-none"
                                    rows={3}
                                />

                                <textarea
                                    placeholder="Yazı içeriği buraya gelecek..."
                                    value={currentPost.content}
                                    onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })}
                                    className="w-full p-8 bg-accent/5 rounded-2xl border border-border outline-none font-body text-lg min-h-[400px]"
                                />
                            </div>
                        </motion.div>
                    )}

                    {activeView === "services" && (
                        <motion.div
                            key="services"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-8"
                        >
                            <header className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-4xl font-display font-bold mb-2">Hizmetler & Fiyatlar</h2>
                                    <p className="text-muted-foreground italic">Danışanlarınıza sunduğunuz paketleri yönetin.</p>
                                </div>
                                <button className="px-8 py-4 bg-secondary text-white rounded-2xl font-display font-bold hover:shadow-lg transition-all flex items-center gap-2">
                                    <Plus size={20} /> Yeni Hizmet
                                </button>
                            </header>

                            <div className="grid lg:grid-cols-2 gap-6">
                                {services.length > 0 ? services.map((service) => (
                                    <div key={service.id} className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-border shadow-sm group hover:border-secondary/30 transition-all">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary">
                                                <Briefcase size={28} />
                                            </div>
                                            <div className="text-2xl font-display font-bold text-secondary">₺{service.price}</div>
                                        </div>
                                        <h3 className="text-xl font-display font-bold mb-2">{service.name}</h3>
                                        <p className="text-sm text-muted-foreground font-body leading-relaxed mb-8">{service.description}</p>
                                        <div className="flex items-center justify-between pt-6 border-t border-border">
                                            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{service.duration} Dakika</div>
                                            <div className="flex gap-2">
                                                <button className="p-2 hover:bg-accent rounded-lg transition-colors"><Edit3 size={18} /></button>
                                                <button className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"><Trash2 size={18} /></button>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-20 bg-white dark:bg-zinc-900/50 rounded-[3rem] border border-dashed border-border flex flex-col items-center justify-center">
                                        <p className="text-muted-foreground font-body italic">Henüz hizmet tanımlanmamış. Hemen bir tane ekleyin!</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeView === "config" && (
                        <motion.div
                            key="config"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8 max-w-4xl"
                        >
                            <header>
                                <h2 className="text-4xl font-display font-bold mb-2">Site Ayarları</h2>
                                <p className="text-muted-foreground italic">Sitenizin kimliğini buradan kontrol edin.</p>
                            </header>

                            <div className="space-y-6">
                                <div className="bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] border border-border space-y-8">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Site Başlığı</label>
                                            <input type="text" defaultValue="İçsel Sığınak" className="w-full p-4 rounded-xl bg-accent/5 border border-border outline-none font-display font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">İletişim E-posta</label>
                                            <input type="email" defaultValue="iletisim@icselsiginak.com" className="w-full p-4 rounded-xl bg-accent/5 border border-border outline-none font-body" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Site Sloganı</label>
                                        <textarea rows={2} className="w-full p-4 rounded-xl bg-accent/5 border border-border outline-none font-body resize-none">Profesyonel Psikolojik Danışmanlık ve Terapi Merkezi</textarea>
                                    </div>
                                    <div className="flex justify-end">
                                        <button className="px-10 py-4 bg-secondary text-white rounded-2xl font-display font-bold hover:shadow-lg transition-all flex items-center gap-2">
                                            <Save size={20} /> Ayarları Güncelle
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default MasterAdminDashboard;
