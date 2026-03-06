import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import blog1 from "@/assets/blog-1.jpg";
import blog2 from "@/assets/blog-2.jpg";
import blog3 from "@/assets/blog-3.jpg";

const articles = [
  {
    img: blog1,
    title: "Kaygıyı Anlamak: Belirtiler ve Baş Etme Stratejileri",
    desc: "Kaygı kalıplarını tanımayı öğrenin ve günlük stresi yönetmek için kanıta dayalı teknikleri keşfedin.",
    date: "2 Mart 2026",
    slug: "kaygiyi-anlamak"
  },
  {
    img: blog2,
    title: "Günlük Hayatta Farkındalığın Gücü",
    desc: "Basit farkındalık uygulamalarının ruh sağlığınızı nasıl dönüştürebileceğini ve duygusal düzenlemeyi nasıl geliştirebileceğini öğrenin.",
    date: "18 Şubat 2026",
    slug: "farkindaligin-gucu"
  },
  {
    img: blog3,
    title: "Travma Sonrası Dayanıklılık Oluşturmak",
    desc: "Travma tepkilerini anlama ve iyileşme ile travma sonrası büyüme yoluna ilişkin bir rehber.",
    date: "5 Şubat 2026",
    slug: "travma-sonrasi-dayaniklilik"
  },
];

const BlogSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="blog" className="py-32" ref={ref}>
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="text-sm font-body font-semibold text-secondary uppercase tracking-widest">Makaleler</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-4">
            Psikoloji Yazıları
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {articles.map((article, i) => (
            <motion.article
              key={article.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 * i }}
              className="group cursor-pointer"
            >
              <Link to={`/blog`}>
                <div className="relative overflow-hidden rounded-2xl mb-5 aspect-[4/3]">
                  <img
                    src={article.img}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="text-sm text-muted-foreground font-body mb-2">{article.date}</div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                  {article.title}
                </h3>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">{article.desc}</p>
                <span className="inline-flex items-center gap-2 text-primary font-body font-medium text-sm group-hover:gap-3 transition-all duration-300">
                  Devamını Oku <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-white font-body font-bold hover:shadow-elevated transition-all hover:-translate-y-1"
          >
            Tüm Yazıları Gör <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default BlogSection;