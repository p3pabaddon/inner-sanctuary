import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Calendar, User, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";

const Blog = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            const { data } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('is_published', true)
                .order('created_at', { ascending: false });

            if (data) setPosts(data);
            setLoading(false);
        };
        fetchPosts();
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar onPortalOpen={() => navigate('/?portal=open')} />
            <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <header className="mb-16 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-display font-bold mb-6 italic"
                    >
                        Psikoloji <span className="text-primary font-body not-italic">Notları</span>
                    </motion.h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto font-body text-lg">
                        Ruh sağlığı, farkındalık ve içsel denge üzerine güncel yazılarımızı keşfedin.
                    </p>
                </header>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post, i) => (
                            <motion.article
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group relative bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-border overflow-hidden hover:shadow-elevated transition-all flex flex-col"
                            >
                                <div className="aspect-video overflow-hidden">
                                    <img
                                        src={post.image_url || "https://images.unsplash.com/photo-1499209974431-9dac3adaf471?auto=format&fit=crop&q=80"}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                </div>
                                <div className="p-8 flex flex-col flex-1">
                                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-4">
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
                                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">{post.category || 'Genel'}</span>
                                    </div>
                                    <h2 className="text-2xl font-display font-bold mb-4 group-hover:text-primary transition-colors leading-tight">
                                        {post.title}
                                    </h2>
                                    <p className="text-muted-foreground font-body text-sm line-clamp-3 mb-6">
                                        {post.excerpt}
                                    </p>
                                    <Link
                                        to={`/blog/${post.slug}`}
                                        className="mt-auto flex items-center gap-2 text-primary font-bold text-sm group/btn"
                                    >
                                        Devamını Oku <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </motion.article>
                        ))}

                        {posts.length === 0 && (
                            <div className="col-span-full text-center py-20 bg-accent/5 rounded-[2.5rem] border border-dashed border-border">
                                <p className="text-muted-foreground font-body italic">Henüz bir yazı paylaşılmadı. Çok yakında buradayız!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Blog;
