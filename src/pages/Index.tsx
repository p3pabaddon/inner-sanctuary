import { useState, useEffect } from "react";
import ScrollProgress from "@/components/ScrollProgress";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import CursorGlow from "@/components/CursorGlow";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import MethodsSection from "@/components/MethodsSection";
import AssessmentSection from "@/components/AssessmentSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ComplianceSection from "@/components/ComplianceSection";
import BlogSection from "@/components/BlogSection";
import AppointmentSection from "@/components/AppointmentSection";
import FAQSection from "@/components/FAQSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import AdminPanel from "@/components/AdminPanel";
import ClientPortal from "@/components/ClientPortal";
import { supabase } from "@/lib/supabase";

const Index = () => {
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        checkUserRole(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        checkUserRole(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      // If profile doesn't exist yet, we can't assume admin
      setUser({ id: userId, isAdmin: !!profile?.is_admin });
    } catch (err) {
      console.error("Role check error:", err);
      setUser({ id: userId, isAdmin: false });
    }
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (user?.isAdmin && isPortalOpen) {
      console.log("Admin detected, switching portal...");
      setIsPortalOpen(false);
      setIsAdminOpen(true);
    }
  }, [user?.isAdmin, isPortalOpen]);

  const handlePortalToggle = () => {
    if (user?.isAdmin) {
      setIsAdminOpen(true);
    } else {
      setIsPortalOpen(true);
    }
  };

  return (
    <div className="relative">
      <CursorGlow />
      <ScrollProgress />
      <Navbar onPortalOpen={handlePortalToggle} />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <MethodsSection />
      <AssessmentSection />
      <TestimonialsSection />
      <ComplianceSection />
      <BlogSection />
      <AppointmentSection />
      <FAQSection />
      <ContactSection />
      <Footer />

      <ClientPortal isOpen={isPortalOpen} onClose={() => setIsPortalOpen(false)} />
      <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />

      {/* Dark Mode Toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
        className="fixed bottom-8 right-8 z-[100] w-14 h-14 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md rounded-full shadow-elevated border border-white/50 dark:border-zinc-700/50 flex items-center justify-center text-primary transition-all"
        title={theme === 'light' ? 'Karanlık Mod' : 'Aydınlık Mod'}
      >
        {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
      </motion.button>
    </div>
  );
};

export default Index;
