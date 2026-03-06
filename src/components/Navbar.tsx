import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { label: "Hakkımda", href: "/#about" },
  { label: "Hizmetler", href: "/#services" },
  { label: "Yöntemler", href: "/#methods" },
  { label: "Öz-Değerlendirme", href: "/#assessment" },
  { label: "Yorumlar", href: "/#testimonials" },
  { label: "Etik & Güven", href: "/#compliance" },
  { label: "Makaleler", href: "/blog" },
  { label: "SSS", href: "/#faq" },
  { label: "İletişim", href: "/#contact" },
];

const Navbar = ({ onPortalOpen }: { onPortalOpen: () => void }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "glass-strong shadow-soft py-3" : "py-6"
        }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <a href="#" className="font-highlight text-2xl text-primary tracking-wide">
          Denge Terapi
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-8 mr-4">
            {navLinks.map((link) => (
              link.href.startsWith("/#") ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-body font-medium text-muted-foreground hover:text-primary transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm font-body font-medium text-muted-foreground hover:text-primary transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>
          <div className="flex items-center gap-4">
            <a
              href="#appointment"
              className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:shadow-elevated transition-all duration-300 hover:-translate-y-0.5"
            >
              Randevu Al
            </a>
            <button
              onClick={onPortalOpen}
              className="px-5 py-2.5 rounded-full glass border-primary/20 text-primary text-sm font-medium hover:bg-primary/5 transition-all duration-300 hover:-translate-y-0.5"
            >
              Danışan Paneli
            </button>
          </div>
        </div>

        {/* Mobile toggle & Portal Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onPortalOpen}
            className="px-4 py-1.5 rounded-full glass border-primary/20 text-primary text-[10px] font-bold hover:bg-primary/5 transition-all duration-300 flex-shrink-0"
          >
            Danışan Paneli
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-foreground"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong mt-2 mx-4 rounded-2xl overflow-hidden"
          >
            <div className="p-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-foreground font-medium py-2"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-3 mt-2">
                <a
                  href="#appointment"
                  onClick={() => setMobileOpen(false)}
                  className="px-5 py-3 rounded-full bg-primary text-primary-foreground text-center font-medium"
                >
                  Randevu Al
                </a>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    onPortalOpen();
                  }}
                  className="px-5 py-3 rounded-full glass border-primary/20 text-primary text-center font-medium"
                >
                  Danışan Paneli
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;