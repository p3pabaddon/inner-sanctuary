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
    Trash2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const AdminPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const detailsRef = useRef<HTMLDivElement>(null);
    const [clients, setClients] = useState<any[]>([]);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [stats, setStats] = useState({ total: 0, active: 0 });
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

    useEffect(() => {
        // Body scroll lock
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        if (isOpen) {
            fetchAdminData();
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        // Auto-scroll to details on mobile when a client is selected
        if (selectedClient && window.innerWidth < 1024 && detailsRef.current) {
            // Use a small timeout to ensure the DOM has rendered the new content
            const scrollTimeout = setTimeout(() => {
                const element = detailsRef.current;
                if (element) {
                    // Try to scroll the parent container (the modal)
                    const container = element.closest('.overflow-y-auto');
                    if (container) {
                        const top = element.offsetTop;
                        container.scrollTo({ top, behavior: 'smooth' });
                    } else {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            }, 150);
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
            setStats({
                total: profiles.length,
                active: profiles.filter(p => p.progress > 0).length
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
    };

    const sendAdminMessage = async () => {
        if (!adminMessage.trim() || !selectedClient) return;

        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        const { error } = await supabase.from('messages').insert([
            {
                sender_id: user.user.id,
                receiver_id: selectedClient.id,
                text: adminMessage,
                sender_role: 'Specialist'
            }
        ]);

        if (!error) {
            setMessages([...messages, {
                text: adminMessage,
                sender_role: 'Specialist',
                created_at: new Date().toISOString()
            }]);
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
            alert("Not başarıyla kaydedildi.");
        } else {
            alert("Not kaydedilirken bir hata oluştu: " + error?.message);
        }
        setLoading(false);
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
            alert("Not başarıyla silindi.");
        } else {
            alert("Not silinirken bir hata oluştu: " + error?.message);
        }
        setLoading(false);
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
                alert("Dosya başarıyla yüklendi.");
            }
        } catch (error: any) {
            console.error("Yükleme hatası:", error);
            alert("Dosya yüklenirken bir hata oluştu: " + (error.message || "Bilinmeyen hata"));
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 md:p-4">
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
                className="relative w-full lg:max-w-7xl bg-white/90 dark:bg-zinc-900/90 glass-strong rounded-none md:rounded-[2.5rem] shadow-elevated overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row h-full max-h-screen md:max-h-[95vh] lg:h-[85vh] z-10"
            >
                {/* Fixed Close Button for Mobile - Moved inside scrollable area or kept fixed */}
                <button
                    onClick={onClose}
                    className="fixed top-4 right-4 z-[150] p-2 rounded-full bg-primary text-white shadow-2xl md:hidden flex items-center justify-center"
                >
                    <X size={24} />
                </button>
                {/* Admin Sidebar */}
                <div className="w-full lg:w-80 border-r border-border p-6 lg:p-8 flex flex-col bg-accent/10 overflow-y-auto lg:overflow-visible flex-shrink-0">
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
                                    <div className="text-left">
                                        <div className="font-display font-bold text-sm">{client.full_name || "İsimsiz"}</div>
                                        <div className={`text-[10px] ${selectedClient?.id === client.id ? "text-white/70" : "text-muted-foreground"}`}>
                                            %{client.progress || 0} Gelişim
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className={selectedClient?.id === client.id ? "text-white" : "text-muted-foreground group-hover:translate-x-1 transition-transform"} />
                                </button>
                            ))}
                    </div>

                    <button
                        onClick={async () => {
                            await supabase.auth.signOut();
                            onClose();
                        }}
                        className="mt-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors font-body py-2 group"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> Çıkış Yap
                    </button>
                </div>

                {/* Main Content Detail */}
                <div
                    ref={detailsRef}
                    id="client-details-section"
                    className="flex-1 flex flex-col bg-white dark:bg-zinc-900 transition-colors overflow-visible lg:overflow-hidden"
                >
                    {selectedClient ? (
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
                                </div>
                            </header>

                            <div className="flex-1 flex flex-col lg:flex-row overflow-visible lg:overflow-hidden">
                                {/* Chat Area */}
                                <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-border flex flex-col p-6 lg:p-8 flex-shrink-0 min-h-[500px] lg:min-h-0 order-2 lg:order-1 outline-none">
                                    <h4 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
                                        <MessageSquare size={20} className="text-primary" /> Mesajlaşma
                                    </h4>
                                    <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
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
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={adminMessage}
                                            onChange={(e) => setAdminMessage(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && sendAdminMessage()}
                                            placeholder="Mesajınızı yazın..."
                                            className="w-full pl-6 pr-14 py-4 rounded-2xl bg-accent/20 dark:bg-zinc-800/50 border-none focus:ring-2 focus:ring-primary/20 outline-none font-body text-sm text-foreground placeholder:text-muted-foreground/50"
                                        />
                                        <button
                                            onClick={sendAdminMessage}
                                            className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-primary text-white hover:scale-105 active:scale-95 transition-all"
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Activity & Files */}
                                <div className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-8 order-1 lg:order-2">
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
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
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
        </div>
    );
};

export default AdminPanel;
