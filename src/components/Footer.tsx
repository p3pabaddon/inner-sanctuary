import { Heart } from "lucide-react";

const Footer = () => (
  <footer className="py-12 border-t border-border">
    <div className="container mx-auto px-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="font-highlight text-xl text-primary">MindCare</div>
        <p className="text-sm text-muted-foreground font-body flex items-center gap-1">
          © {new Date().getFullYear()} MindCare. Made with <Heart className="w-3.5 h-3.5 text-secondary fill-secondary" /> for mental wellness
        </p>
        <div className="flex gap-6">
          {["Privacy", "Terms", "Sitemap"].map((link) => (
            <a key={link} href="#" className="text-sm text-muted-foreground hover:text-primary font-body transition-colors duration-300">
              {link}
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
