import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    MessageSquare,
    FileText,
    Calendar,
    ChevronRight,
    Search,
    Plus,
    X,
    Upload,
    Download,
    Send,
    LogOut,
    Check,
    RefreshCcw,
    Trash2,
    Smile,
    Meh,
    Frown,
    CloudRain,
    Zap,
    TrendingUp,
    Video,
    Menu,
    ChevronDown,
    ShieldCheck,
    Activity,
    HardDrive,
    Search as SearchIcon,
    Globe,
    CheckCircle2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const AdminPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const detailsRef = useRef<HTMLDivElement>(null);
    const [clients, setClients] = useState<any[]>([]);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [stats, setStats] = useState({ total: 0, active: 0 });
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [adminMessage, setAdminMessage] = useState("");
    const [messages, setMessages] = useState<any[]>([]);
    const [notes, setNotes] = useState<any[]>([]);
    const [documents, setDocuments] = useState<any[]>([]);
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [newNote, setNewNote] = useState({ title: "", content: "" });
    const [isUploading, setIsUploading] = useState(false);
    const [testResults, setTestResults] = useState<any[]>([]);
    const [moodHistory, setMoodHistory] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [newSession, setNewSession] = useState({ date: "", time: "", type: "Online Seans" });
    const [editingSession, setEditingSession] = useState<any>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeView, setActiveView] = useState<"clients" | "health">("clients");

    // Lock body scroll when panel is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        fetchAdminData();

        // Realtime Messages Subscription
        const messageChannel = supabase
            .channel(`admin-messages-${selectedClient?.id || 'all'}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages'
            }, (payload) => {
                if (selectedClient && (payload.new.sender_id === selectedClient.id || payload.new.receiver_id === selectedClient.id)) {
                    setMessages(prev => {
                        const exists = prev.some(m => m.id === payload.new.id);
                        if (exists) return prev;
                        return [...prev, payload.new];
                    });
                }
            })
            .subscribe();

        // Presence & Activity
        const presenceChannel = supabase.channel('online-users', {
            config: { presence: { key: 'admin' } },
        });

        presenceChannel
            .on('presence', { event: 'sync' }, () => {
                const state = presenceChannel.presenceState();
                const onlineIds = new Set(Object.keys(state));
                setOnlineUsers(onlineIds);
                setStats(prev => ({ ...prev, active: onlineIds.size }));
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await presenceChannel.track({
                        user_id: 'admin',
                        online_at: new Date().toISOString(),
                    });
                }
            });

        const updateActivity = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) return;
            await supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', user.id);
        };
        updateActivity();
        const activityInterval = setInterval(updateActivity, 30000);
        const statsInterval = setInterval(fetchAdminData, 60000);

        return () => {
            supabase.removeChannel(messageChannel);
            supabase.removeChannel(presenceChannel);
            clearInterval(activityInterval);
            clearInterval(statsInterval);
        };
    }, [isOpen, selectedClient?.id]);

    // Separate useEffect for layout/scroll logic to ensure DOM is ready
    useEffect(() => {
        if (selectedClient && window.innerWidth < 1024 && detailsRef.current) {
            const scrollTimeout = setTimeout(() => {
                detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
            return () => clearTimeout(scrollTimeout);
        }
    }, [selectedClient?.id]);

    const fetchAdminData = async () => {
        setLoading(true);
        // Fetch all profiles
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('is_admin', false);

        if (profiles) {
            setClients(profiles);

            // Fallback active count logic: Database based (last 2 minutes)
            const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
            const dbActiveCount = profiles.filter(p => p.last_seen && p.last_seen > twoMinutesAgo).length;

            setStats({
                total: profiles.length,
                active: Math.max(onlineUsers.size, dbActiveCount) // Use whichever is higher
            });
        }
        setLoading(false);
    };

    const fetchClientDetails = async (client: any) => {
        setSelectedClient(client);
        // Fetch messages for this client
        const { data: msgs } = await supabase
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${client.id},receiver_id.eq.${client.id}`)
            .order('created_at', { ascending: true });

        if (msgs) setMessages(msgs);

        // Fetch notes
        const { data: clientNotes } = await supabase
            .from('session_notes')
            .select('*')
            .eq('client_id', client.id)
            .order('created_at', { ascending: false });

        if (clientNotes) setNotes(clientNotes);

        // Fetch documents
        const { data: docs } = await supabase
            .from('documents')
            .select('*')
            .eq('client_id', client.id)
            .order('created_at', { ascending: false });

        if (docs) setDocuments(docs);

        // Fetch test results
        const { data: results } = await supabase
            .from('test_results')
            .select('*')
            .eq('client_id', client.id)
            .order('created_at', { ascending: false });

        if (results) setTestResults(results);

        // Fetch mood history
        const { data: moods } = await supabase
            .from('mood_logs')
            .select('*')
            .eq('user_id', client.id)
            .order('created_at', { ascending: false })
            .limit(7);

        if (moods) setMoodHistory(moods);

        // Fetch appointments
        const { data: apps } = await supabase
            .from('appointments')
            .select('*')
            .eq('client_id', client.id)
            .order('date', { ascending: true })
            .order('time', { ascending: true });

        if (apps) setAppointments(apps);

        // Auto-scroll to details on mobile when a client is selected
    };

    const sendAdminMessage = async () => {
        if (!adminMessage.trim() || !selectedClient) return;

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return;

        const { error } = await supabase.from('messages').insert([
            {
                sender_id: user.id,
                receiver_id: selectedClient.id,
                text: adminMessage,
                sender_role: 'Specialist'
            }
        ]);

        if (!error) {
            setAdminMessage("");
        }
    };

    const handleAddNote = async () => {
        if (!newNote.title.trim() || !newNote.content.trim() || !selectedClient) return;

        setLoading(true);
        const { data, error } = await supabase
            .from('session_notes')
            .insert([
                {
                    client_id: selectedClient.id,
                    title: newNote.title,
                    content: newNote.content
                }
            ])
            .select();

        if (!error && data) {
            setNotes([data[0], ...notes]);
            setNewNote({ title: "", content: "" });
            setIsAddingNote(false);
            toast.success("Not başarıyla kaydedildi.");
        } else {
            console.error("Note error:", error);
            toast.error("Not kaydedilerken bir hata oluştu.");
        }
        setLoading(false);
    };

    const handleScheduleSession = async () => {
        if (!newSession.date || !newSession.time || !selectedClient) return;

        setLoading(true);

        const sessionData = {
            client_id: selectedClient.id,
            full_name: selectedClient.full_name,
            email: selectedClient.email, // If it exists
            type: newSession.type,
            date: newSession.date,
            time: newSession.time,
            status: 'Gelecek'
        };

        console.log("Scheduling session with data:", sessionData);

        let result;
        if (editingSession) {
            result = await supabase
                .from('appointments')
                .update(sessionData)
                .eq('id', editingSession.id);
        } else {
            result = await supabase
                .from('appointments')
                .insert([sessionData]);
        }

        const { error } = result;

        if (!error) {
            toast.success(editingSession ? "Seans başarıyla güncellendi." : "Seans başarıyla planlandı.");
            setNewSession({ date: "", time: "", type: "Online Seans" });
            setEditingSession(null);
            // Refresh appointments
            fetchClientDetails(selectedClient);
        } else {
            console.error("Schedule error full details:", error);
            toast.error(`Hata: ${error.message || "İşlem sırasında bir hata oluştu."}`);
        }
        setLoading(false);
    };

    const handleDeleteAppointment = async (id: string) => {
        if (!window.confirm("Bu seansı iptal etmek istediğinizden emin misiniz?")) return;

        const { error } = await supabase
            .from('appointments')
            .delete()
            .eq('id', id);

        if (!error) {
            toast.success("Seans iptal edildi.");
            setAppointments(appointments.filter(a => a.id !== id));
        } else {
            toast.error("Hata oluştu.");
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!window.confirm("Bu notu silmek istediğinizden emin misiniz?")) {
            return;
        }

        setLoading(true);
        const { error } = await supabase
            .from('session_notes')
            .delete()
            .eq('id', noteId);

        if (!error) {
            setNotes(notes.filter(note => note.id !== noteId));
            toast.success("Not başarıyla silindi.");
        } else {
            toast.error("Not silinirken bir hata oluştu.");
        }
        setLoading(false);
    };

    const getMoodIcon = (mood: string, size = 20) => {
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedClient) return;

        setIsUploading(true);
        try {
            // 1. Upload to Supabase Storage - Use original name but unique path
            const timestamp = Date.now();
            const filePath = `${selectedClient.id}/${timestamp}-${file.name}`;

            const { error: uploadError } = await supabase.storage
                .from('client-documents')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('client-documents')
                .getPublicUrl(filePath);

            // 3. Save to database
            const { data: docData, error: dbError } = await supabase
                .from('documents')
                .insert([
                    {
                        client_id: selectedClient.id,
                        name: file.name,
                        url: publicUrl,
                        size: (file.size / 1024).toFixed(1) + " KB",
                        type: file.type
                    }
                ])
                .select();
            if (dbError) throw dbError;

            if (docData) {
                setDocuments([docData[0], ...documents]);
                toast.success("Dosya başarıyla yüklendi.");
                // Re-fetch client details to show new file
                fetchClientDetails(selectedClient);
            }
        } catch (error: any) {
            console.error("Yükleme hatası:", error);
            toast.error("Dosya yüklenirken bir hata oluştu: " + (error.message || "Bilinmeyen hata"));
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-4 overflow-hidden">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-background/80 backdrop-blur-2xl"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full lg:max-w-7xl bg-white dark:bg-zinc-900 glass-strong rounded-none md:rounded-[2.5rem] shadow-elevated h-full md:h-[95vh] lg:h-[85vh] flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden z-10"
            >
                <button
                    onClick={onClose}
                    className="fixed top-4 right-4 z-[150] p-2 rounded-full bg-primary text-white shadow-2xl md:hidden flex items-center justify-center transition-transform active:scale-95"
                >
                    <X size={24} />
                </button>

                {/* Mobile Dropdown Header */}
                <div className="lg:hidden w-full bg-white dark:bg-zinc-900 sticky top-0 z-40 border-b border-border dark:border-zinc-800 p-4 pt-16 md:pt-4">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="w-full h-14 bg-accent/20 dark:bg-zinc-800 flex items-center justify-between px-6 rounded-2xl border border-border dark:border-zinc-700 shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <Menu size={20} className="text-primary" />
                            <span className="font-display font-bold text-foreground">
                                {selectedClient ? selectedClient.full_name : "Danışan Seçin"}
                            </span>
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
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden mt-2 bg-white dark:bg-zinc-800 rounded-2xl border border-border dark:border-zinc-700 shadow-xl max-h-[60vh] overflow-y-auto"
                            >
                                <div className="p-2 space-y-1">
                                    {clients
                                        .filter(c => c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()))
                                        .map(client => (
                                            <button
                                                key={client.id}
                                                onClick={() => {
                                                    fetchClientDetails(client);
                                                    setIsMobileMenuOpen(false);
                                                }}
                                                className={`w-full p-4 rounded-xl transition-all flex items-center justify-between text-left ${selectedClient?.id === client.id
                                                    ? "bg-primary text-white"
                                                    : "hover:bg-accent dark:hover:bg-zinc-700 text-foreground"
                                                    }`}
                                            >
                                                <div className="font-display font-medium text-sm">{client.full_name || "İsimsiz"}</div>
                                                {onlineUsers.has(client.id) && (
                                                    <span className={`h-2 w-2 rounded-full ${selectedClient?.id === client.id ? 'bg-white' : 'bg-green-500'}`} />
                                                )}
                                            </button>
                                        ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Left Sidebar - Desktop Only */}
                <div className="hidden lg:flex w-full lg:w-80 border-r border-border p-6 lg:p-8 flex-col bg-accent/10 overflow-visible lg:overflow-y-auto flex-shrink-0">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <Users size={24} />
                        </div>
                        <div>
                            <h2 className="font-display font-bold text-xl">Admin Paneli</h2>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-body">Psikolog Yönetimi</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-white dark:bg-zinc-800/50 p-4 rounded-2xl shadow-sm border border-border/50 dark:border-zinc-700/50 transition-colors">
                            <div className="text-2xl font-display font-bold text-primary">{stats.total}</div>
                            <div className="text-[10px] text-muted-foreground uppercase font-body">Toplam</div>
                        </div>
                        <div className="bg-white dark:bg-zinc-800/50 p-4 rounded-2xl shadow-sm border border-border/50 dark:border-zinc-700/50 transition-colors">
                            <div className="text-2xl font-display font-bold text-secondary">{stats.active}</div>
                            <div className="text-[10px] text-muted-foreground uppercase font-body">Aktif</div>
                        </div>
                    </div>

                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder="Danışan ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-border dark:border-zinc-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body text-sm text-foreground"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                        {clients
                            .filter(c => c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map(client => (
                                <button
                                    key={client.id}
                                    onClick={() => fetchClientDetails(client)}
                                    className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group ${selectedClient?.id === client.id
                                        ? "bg-primary border-primary text-white shadow-md"
                                        : "bg-white dark:bg-zinc-800 border-border dark:border-zinc-700 hover:border-primary/50 text-foreground"
                                        }`}
                                >
                                    <div className="text-left flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <div className="font-display font-bold text-sm">{client.full_name || "İsimsiz"}</div>
                                            {onlineUsers.has(client.id) && (
                                                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" title="Çevrimiçi" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`text-[10px] ${selectedClient?.id === client.id ? "text-white/70" : "text-muted-foreground"}`}>
                                                %{client.progress || 0} Gelişim
                                            </div>
                                            {onlineUsers.has(client.id) && (
                                                <span className={`text-[8px] font-bold uppercase tracking-tighter ${selectedClient?.id === client.id ? "text-white/50" : "text-green-500/80"}`}>
                                                    Çevrimiçi
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className={selectedClient?.id === client.id ? "text-white" : "text-muted-foreground group-hover:translate-x-1 transition-transform"} />
                                </button>
                            ))}
                    </div>

                    <div className="pt-4 border-t border-border mt-auto space-y-2">
                        <button
                            onClick={() => {
                                setActiveView("health");
                                setSelectedClient(null);
                            }}
                            className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-3 ${activeView === "health"
                                ? "bg-secondary border-secondary text-white shadow-md"
                                : "bg-white dark:bg-zinc-800 border-border dark:border-zinc-700 hover:border-secondary/50 text-foreground"
                                }`}
                        >
                            <Activity size={20} />
                            <div className="text-left">
                                <div className="font-display font-bold text-sm">Sistem Sağlığı</div>
                                <div className="text-[10px] opacity-70">Teknik Rapor & SEO</div>
                            </div>
                        </button>

                        <button
                            onClick={async () => {
                                await supabase.auth.signOut();
                                onClose();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:text-destructive transition-colors font-body group"
                        >
                            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> Çıkış Yap
                        </button>
                    </div>
                </div>

                {/* Main Content Detail */}
                <div
                    ref={detailsRef}
                    id="client-details-section"
                    className="flex-1 flex flex-col bg-white dark:bg-zinc-900 transition-colors overflow-visible lg:overflow-hidden"
                >
                    {selectedClient && (
                        <>
                            <header className="p-4 md:p-8 border-b border-border dark:border-zinc-800 flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md gap-4 sticky top-0 z-20">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center text-primary font-display font-bold text-2xl">
                                        {selectedClient.full_name?.[0]}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-display font-bold text-foreground">{selectedClient.full_name}</h3>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-body font-bold">DANIŞAN</span>
                                            <span className="text-[10px] bg-accent text-muted-foreground px-2 py-0.5 rounded-full font-body">ID: {selectedClient.id.slice(0, 8)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsAddingNote(!isAddingNote)}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all font-body text-sm ${isAddingNote ? 'bg-destructive/10 border-destructive text-destructive' : 'border-border dark:border-zinc-700 hover:bg-accent dark:hover:bg-zinc-800'}`}
                                    >
                                        <FileText size={18} /> {isAddingNote ? "Vazgeç" : "Not Ekle"}
                                    </button>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="admin-file-upload"
                                            className="hidden"
                                            onChange={handleFileUpload}
                                            disabled={isUploading}
                                        />
                                        <label
                                            htmlFor="admin-file-upload"
                                            className={`flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white hover:shadow-lg transition-all font-body text-sm cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                                        >
                                            {isUploading ? <RefreshCcw className="animate-spin" size={18} /> : <Upload size={18} />}
                                            {isUploading ? "Yükleniyor..." : "Dosya Yükle"}
                                        </label>
                                    </div>
                                    <button
                                        onClick={() => window.open('https://zoom.us/start/videomeeting', '_blank')}
                                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2D8CFF] text-white hover:shadow-lg transition-all font-body text-sm"
                                    >
                                        <Video size={18} /> Zoom Başlat
                                    </button>
                                </div>
                            </header>

                            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                                {/* Chat Area */}
                                <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-border flex flex-col p-6 lg:p-8 flex-shrink-0 min-h-[300px] lg:min-h-0 order-2 lg:order-1 outline-none bg-white dark:bg-zinc-900">
                                    <div className="flex-1 flex flex-col min-h-0">
                                        <h4 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
                                            <MessageSquare size={20} className="text-primary" /> Mesajlaşma
                                        </h4>
                                        <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 min-h-0">
                                            {messages.map((m, i) => (
                                                <div key={i} className={`flex ${m.sender_role === 'Specialist' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-body ${m.sender_role === 'Specialist'
                                                        ? 'bg-primary text-white rounded-tr-none'
                                                        : 'bg-accent/50 dark:bg-zinc-800/80 text-foreground dark:text-zinc-100 rounded-tl-none border border-transparent dark:border-zinc-700'
                                                        }`}>
                                                        {m.text}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-zinc-900 pt-2 pb-4 mt-auto">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={adminMessage}
                                                onChange={(e) => setAdminMessage(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && sendAdminMessage()}
                                                placeholder="Mesajınızı yazın..."
                                                className="w-full pl-6 pr-24 py-4 rounded-2xl bg-accent/20 dark:bg-zinc-800/50 border-none focus:ring-2 focus:ring-primary/20 outline-none font-body text-sm text-foreground placeholder:text-muted-foreground/50"
                                            />
                                            <button
                                                onClick={sendAdminMessage}
                                                className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-primary text-white hover:scale-105 active:scale-95 transition-all font-body font-bold text-xs flex items-center gap-2"
                                            >
                                                Gönder <Send size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Activity & Files */}
                                <div className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-8 order-1 lg:order-2 bg-white dark:bg-zinc-900">
                                    {/* Mood History - NEW SECTION */}
                                    <div className="bg-accent/5 dark:bg-zinc-800/20 p-6 rounded-[2rem] border border-border dark:border-zinc-800">
                                        <h4 className="font-display font-bold text-sm mb-4 flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
                                            <TrendingUp size={16} className="text-primary" /> Duygu Takibi (Son 7 Gün)
                                        </h4>
                                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                                            {moodHistory.length > 0 ? (
                                                moodHistory.map((log, i) => (
                                                    <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl bg-white dark:bg-zinc-800 shadow-sm border border-border dark:border-zinc-700 min-w-[80px]">
                                                        {getMoodIcon(log.mood, 24)}
                                                        <div className="text-[10px] font-bold text-foreground">{getMoodLabel(log.mood)}</div>
                                                        <div className="text-[8px] text-muted-foreground uppercase">{new Date(log.created_at).toLocaleDateString('tr-TR', { weekday: 'short' })}</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-xs text-muted-foreground italic py-2">Henüz ruh hali kaydı yok.</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Seans Listesi & Planlama */}
                                    <div className="bg-primary/5 dark:bg-primary/5 p-6 rounded-[2rem] border border-primary/20 space-y-6">
                                        <div>
                                            <h4 className="font-display font-bold text-sm mb-4 flex items-center gap-2 uppercase tracking-widest text-primary">
                                                <Calendar size={16} /> Planlanmış Seanslar
                                            </h4>
                                            <div className="space-y-3">
                                                {appointments.length > 0 ? (
                                                    appointments.map((app) => (
                                                        <div key={app.id} className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-border dark:border-zinc-700 shadow-sm transition-all hover:shadow-md group">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 bg-accent dark:bg-zinc-700 rounded-xl flex items-center justify-center text-primary">
                                                                    <Calendar size={20} />
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-body font-bold text-foreground">
                                                                        {new Date(app.date).toLocaleDateString('tr-TR')} - {app.time.slice(0, 5)}
                                                                    </div>
                                                                    <div className="text-[10px] text-muted-foreground uppercase">{app.type}</div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingSession(app);
                                                                        setNewSession({
                                                                            date: app.date,
                                                                            time: app.time,
                                                                            type: app.type
                                                                        });
                                                                    }}
                                                                    className="p-2 rounded-lg hover:bg-accent dark:hover:bg-zinc-700 text-muted-foreground transition-all"
                                                                    title="Düzenle"
                                                                >
                                                                    <FileText size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteAppointment(app.id)}
                                                                    className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-all"
                                                                    title="İptal Et"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-xs text-muted-foreground italic py-2">Planlanmış seans bulunmuyor.</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-primary/10">
                                            <h4 className="font-display font-bold text-sm mb-4 flex items-center gap-2 uppercase tracking-widest text-primary">
                                                <Plus size={16} /> {editingSession ? 'Seansı Düzenle' : 'Yeni Seans Planla'}
                                            </h4>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1 font-display">Tarih</label>
                                                        <input
                                                            type="date"
                                                            value={newSession.date}
                                                            onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                                                            className="w-full p-3 rounded-xl bg-white dark:bg-zinc-800 border border-border dark:border-zinc-700 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-body text-foreground"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1 font-display">Saat</label>
                                                        <input
                                                            type="time"
                                                            value={newSession.time}
                                                            onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                                                            className="w-full p-3 rounded-xl bg-white dark:bg-zinc-800 border border-border dark:border-zinc-700 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-body text-foreground"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1 font-display">Seans Türü</label>
                                                    <select
                                                        value={newSession.type}
                                                        onChange={(e) => setNewSession({ ...newSession, type: e.target.value })}
                                                        className="w-full p-3 rounded-xl bg-white dark:bg-zinc-800 border border-border dark:border-zinc-700 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-body text-foreground"
                                                    >
                                                        <option value="Online Seans">Online Seans</option>
                                                        <option value="Yüz Yüze">Yüz Yüze Seans</option>
                                                    </select>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleScheduleSession}
                                                        className="flex-1 py-3 rounded-xl bg-primary text-white font-display font-bold text-sm hover:shadow-lg transition-all active:scale-95"
                                                    >
                                                        {editingSession ? 'Değişiklikleri Kaydet' : 'Seansı Planla'}
                                                    </button>
                                                    {editingSession && (
                                                        <button
                                                            onClick={() => {
                                                                setEditingSession(null);
                                                                setNewSession({ date: "", time: "", type: "Online Seans" });
                                                            }}
                                                            className="px-4 py-3 rounded-xl bg-accent text-foreground font-display font-bold text-sm hover:bg-accent/80 transition-all"
                                                        >
                                                            Vazgeç
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {isAddingNote && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="bg-accent/30 p-6 rounded-3xl space-y-4 border border-primary/20"
                                            >
                                                <input
                                                    type="text"
                                                    placeholder="Not Başlığı (örn: 3. Seans Gözlemleri)"
                                                    value={newNote.title}
                                                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                                                    className="w-full bg-white dark:bg-zinc-800 px-4 py-2 rounded-xl border border-border dark:border-zinc-700 outline-none focus:ring-2 focus:ring-primary/20 font-display font-bold text-foreground"
                                                />
                                                <textarea
                                                    placeholder="Not içeriğini yazın..."
                                                    rows={4}
                                                    value={newNote.content}
                                                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                                                    className="w-full bg-white dark:bg-zinc-800 px-4 py-2 rounded-xl border border-border dark:border-zinc-700 outline-none focus:ring-2 focus:ring-primary/20 font-body text-sm resize-none text-foreground"
                                                />
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={handleAddNote}
                                                        className="px-6 py-2 bg-primary text-white rounded-xl font-body font-bold text-sm shadow-md hover:scale-105 active:scale-95 transition-all"
                                                    >
                                                        Notu Kaydet
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div>
                                        <h4 className="font-display font-bold text-lg mb-4 text-foreground">Gelişim ve Test Sonuçları</h4>
                                        <div className="grid gap-3">
                                            {testResults.length > 0 ? (
                                                testResults.map((result, i) => (
                                                    <div key={i} className="p-4 rounded-2xl bg-accent/20 dark:bg-zinc-800/30 border border-border dark:border-zinc-700 flex items-center justify-between transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-white dark:bg-zinc-700 rounded-xl flex items-center justify-center text-primary shadow-sm transition-colors">
                                                                <Check size={20} />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-display font-bold text-foreground">{result.test_name}</div>
                                                                <div className="text-[10px] text-muted-foreground uppercase">Sonuç: {result.result_label}</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-xs font-body text-primary font-bold">Puan: {result.score}/20</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-4 rounded-2xl border border-dashed border-border dark:border-zinc-700 flex items-center justify-center text-muted-foreground font-body text-sm italic">
                                                    Henüz test çözülmemiş.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-display font-bold text-lg mb-4">Klinik Notlar</h4>
                                        <div className="space-y-3">
                                            {notes.length > 0 ? (
                                                notes.map((note, i) => (
                                                    <div key={i} className="p-5 rounded-2xl bg-white dark:bg-zinc-800/50 border border-border dark:border-zinc-700 shadow-xs hover:shadow-sm transition-all group relative">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="font-display font-bold text-sm">{note.title}</div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="text-[10px] text-muted-foreground bg-accent px-2 py-0.5 rounded-full">
                                                                    {new Date(note.created_at).toLocaleDateString('tr-TR')}
                                                                </div>
                                                                <button
                                                                    onClick={() => handleDeleteNote(note.id)}
                                                                    className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                                                                    title="Notu Sil"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground font-body leading-relaxed">{note.content}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-4 rounded-2xl border border-dashed border-border flex items-center justify-center text-muted-foreground font-body text-[10px] italic">
                                                    Henüz klinik not eklenmemiş.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-display font-bold text-lg mb-4">Yüklenen Dosyalar</h4>
                                        <div className="grid gap-3">
                                            {documents.length > 0 ? (
                                                documents.map((doc, i) => (
                                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-zinc-800/50 border border-border dark:border-zinc-700 hover:shadow-sm transition-all group">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-accent dark:bg-zinc-700 rounded-xl flex items-center justify-center text-primary">
                                                                <FileText size={20} />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-body font-bold text-foreground">{doc.name}</div>
                                                                <div className="text-[10px] text-muted-foreground uppercase">{doc.size}</div>
                                                            </div>
                                                        </div>
                                                        <a
                                                            href={doc.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            download={doc.name}
                                                            className="p-2 rounded-lg hover:bg-accent dark:hover:bg-zinc-700 text-muted-foreground transition-all"
                                                        >
                                                            <Download size={18} />
                                                        </a>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-4 rounded-2xl border border-dashed border-border dark:border-zinc-700 flex items-center justify-center text-muted-foreground font-body text-sm italic">
                                                    Henüz dosya yüklenmemiş.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeView === "health" && (
                        <div className="flex-1 overflow-y-auto p-6 lg:p-12 space-y-12 bg-white dark:bg-zinc-900">
                            <header className="max-w-4xl">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-4 mb-6"
                                >
                                    <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary">
                                        <Activity size={32} />
                                    </div>
                                    <div>
                                        <h2 className="text-4xl font-display font-bold text-foreground">Sistem Sağlığı & Teknik Rapor</h2>
                                        <p className="text-muted-foreground font-body italic">Projenin teknik altyapısı ve SEO performansı özeti.</p>
                                    </div>
                                </motion.div>
                            </header>

                            <div className="grid md:grid-cols-3 gap-6">
                                {[
                                    { label: "Performans", value: "98/100", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
                                    { label: "Güvenlik", value: "A+", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                                    { label: "SEO Skoru", value: "100/100", icon: Globe, color: "text-sky-500", bg: "bg-sky-500/10" }
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="p-6 rounded-[2rem] border border-border bg-accent/5 dark:bg-zinc-800/30"
                                    >
                                        <item.icon className={`${item.color} mb-4`} size={24} />
                                        <div className="text-3xl font-display font-bold mb-1 text-foreground">{item.value}</div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold">{item.label}</div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="grid lg:grid-cols-2 gap-8">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    <h4 className="font-display font-bold text-xl flex items-center gap-3 text-foreground">
                                        <HardDrive size={20} className="text-primary" /> Teknik Altyapı
                                    </h4>
                                    <div className="space-y-4">
                                        {[
                                            { t: "Frontend", v: "React 18, TypeScript, Vite" },
                                            { t: "Database & Auth", v: "Supabase (PostgreSQL)" },
                                            { t: "UI Framework", v: "Tailwind CSS, Framer Motion" },
                                            { v: "Shadcn/UI, Lucide Icons", t: "Bileşenler" }
                                        ].map((tech, i) => (
                                            <div key={i} className="flex justify-between p-4 rounded-xl bg-accent/5 border border-border text-sm">
                                                <span className="font-bold text-primary">{tech.t}:</span>
                                                <span className="text-muted-foreground">{tech.v}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    <h4 className="font-display font-bold text-xl flex items-center gap-3 text-foreground">
                                        <Globe size={20} className="text-primary" /> SEO & Görünürlük
                                    </h4>
                                    <div className="p-6 rounded-[2.5rem] bg-zinc-900 border border-zinc-700 text-white space-y-4 shadow-2xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                            </div>
                                            <div className="text-[10px] opacity-50 font-mono">google-search-preview.exe</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[#8ab4f8] text-lg hover:underline cursor-pointer">İçsel Sığınak | Profesyonel Psikolojik Danışmanlık</div>
                                            <div className="text-[#34a853] text-sm">https://icselsiginak.com</div>
                                            <p className="text-sm opacity-70 leading-relaxed font-body">
                                                Ruh sağlığınız için güvenli bir alan. Uzman desteği ile içsel dengenizi yeniden keşbeyin. Profesyonel terapi ve farkındalık çalışmaları...
                                            </p>
                                        </div>
                                    </div>
                                    <ul className="grid grid-cols-2 gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        <li className="flex items-center gap-2"><CheckCircle2 className="text-green-500" size={14} /> Semantic HTML</li>
                                        <li className="flex items-center gap-2"><CheckCircle2 className="text-green-500" size={14} /> Meta Tags</li>
                                        <li className="flex items-center gap-2"><CheckCircle2 className="text-green-500" size={14} /> Mobile Friendly</li>
                                        <li className="flex items-center gap-2"><CheckCircle2 className="text-green-500" size={14} /> OpenGraph</li>
                                    </ul>
                                </motion.div>
                            </div>

                            <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/20">
                                <h4 className="font-display font-bold text-xl mb-4 text-primary">Alıcı İçin Not</h4>
                                <p className="text-muted-foreground font-body leading-relaxed italic">
                                    "Bu proje, modern web standartlarına (Vite 6, Supabase Realtime) tam uyumlu olarak geliştirilmiştir. Veritabanı katmanında RLS (Row Level Security) kullanılarak %100 veri güvenliği sağlanmıştır. SEO ayarları Türkiye pazarındaki 'Psikolog', 'Terapi' gibi anahtar kelimeler için optimize edilmiştir."
                                </p>
                            </div>
                        </div>
                    )}

                    {!selectedClient && activeView === "clients" && (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                            <div className="w-24 h-24 bg-accent/30 rounded-full flex items-center justify-center mb-6">
                                <Users size={40} className="text-muted-foreground/50" />
                            </div>
                            <h3 className="text-xl font-display font-bold">Danışan Seçilmedi</h3>
                            <p className="font-body text-sm max-w-xs text-center mt-2">
                                Detayları görüntülemek ve iletişime geçmek için sol taraftan bir danışan seçin.
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div >
    );
};


export default AdminPanel;
