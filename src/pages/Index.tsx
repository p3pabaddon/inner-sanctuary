import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ScrollProgress from "@/components/ScrollProgress";
import CursorGlow from "@/components/CursorGlow";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import MethodsSection from "@/components/MethodsSection";
import BlogSection from "@/components/BlogSection";
import AppointmentSection from "@/components/AppointmentSection";
import Footer from "@/components/Footer";
import AdminPanel from "@/components/AdminPanel";
import ClientPortal from "@/components/ClientPortal";
import { supabase } from "@/lib/supabase";

const Index = () => {
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('portal') === 'open') {
      setIsPortalOpen(true);
    }
  }, [searchParams]);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

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
      <BlogSection />
      <AppointmentSection />
      <Footer />

      <ClientPortal isOpen={isPortalOpen} onClose={() => setIsPortalOpen(false)} />
      <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </div>
  );
};

export default Index;
