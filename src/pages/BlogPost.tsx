import { useState, useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Calendar, User, Share2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";

const BlogPost = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => {
        const fetchPost = async () => {
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error || !data) {
                navigate('/blog');
                return;
            }
            setPost(data);
            setLoading(false);
        };
        fetchPost();
    }, [slug, navigate]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-background">
            <motion.div
                className="fixed top-0 left-0 right-0 h-1.5 bg-primary origin-left z-[1001]"
                style={{ scaleX }}
            />
            <Navbar onPortalOpen={() => navigate('/?portal=open')} />

            <article className="pt-32 pb-20">
                <div className="max-w-4xl mx-auto px-6">
                    <Link
                        to="/blog"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-body text-sm mb-12 group"
                    >
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Blog'a Dön
                    </Link>

                    <header className="mb-12">
                        <div className="flex items-center gap-4 text-xs font-bold text-primary uppercase tracking-widest mb-6">
                            <span>{post.category || 'Genel'}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-border" />
                            <span className="text-muted-foreground">{new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-8 leading-tight">
                            {post.title}
                        </h1>
                        <div className="aspect-[21/9] rounded-[2.5rem] overflow-hidden shadow-elevated border border-border">
                            <img
                                src={post.image_url || "https://images.unsplash.com/photo-1499209974431-9dac3adaf471?auto=format&fit=crop&q=80"}
                                alt={post.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </header>

                    <div
                        className="prose prose-lg dark:prose-invert max-w-none font-body text-foreground/80 leading-relaxed
                        prose-headings:font-display prose-headings:font-bold prose-headings:text-foreground
                        prose-p:mb-8 prose-li:mb-2
                        prose-img:rounded-[2.5rem] prose-img:border prose-img:border-border"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    <footer className="mt-20 pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-primary">
                                <User size={24} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-foreground">Denge Psikolojik Danışmanlık</div>
                                <div className="text-xs text-muted-foreground">İçsel Yolculuğunuzda Rehber</div>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                toast.success("Link kopyalandı!");
                            }}
                            className="flex items-center gap-2 px-6 py-3 rounded-full bg-accent/50 hover:bg-primary hover:text-white transition-all font-body text-sm font-bold"
                        >
                            <Share2 size={16} /> Yazıyı Paylaş
                        </button>
                    </footer>
                </div>
            </article>
        </div>
    );
};

export default BlogPost;
