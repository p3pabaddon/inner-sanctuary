import { useState, useEffect, Suspense, lazy } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import { supabase } from "@/lib/supabase";

// Lazy load non-critical components below the fold
const ScrollProgress = lazy(() => import("@/components/ScrollProgress"));
const CursorGlow = lazy(() => import("@/components/CursorGlow"));
const AboutSection = lazy(() => import("@/components/AboutSection"));
const ServicesSection = lazy(() => import("@/components/ServicesSection"));
const MethodsSection = lazy(() => import("@/components/MethodsSection"));
const BlogSection = lazy(() => import("@/components/BlogSection"));
const GuideSection = lazy(() => import("@/components/GuideSection"));
const AppointmentSection = lazy(() => import("@/components/AppointmentSection"));
const Footer = lazy(() => import("@/components/Footer"));
const AdminPanel = lazy(() => import("@/components/AdminPanel"));
const ClientPortal = lazy(() => import("@/components/ClientPortal"));

const SectionLoader = () => <div className="h-20" />;

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
      <Suspense fallback={null}>
        <CursorGlow />
        <ScrollProgress />
      </Suspense>

      <Navbar onPortalOpen={handlePortalToggle} />
      <HeroSection />

      <Suspense fallback={<SectionLoader />}>
        <AboutSection />
        <ServicesSection />
        <MethodsSection />
        <BlogSection />
        <GuideSection />
        <AppointmentSection />
        <Footer />
        <ClientPortal isOpen={isPortalOpen} onClose={() => setIsPortalOpen(false)} />
        <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
      </Suspense>
    </div>
  );
};

export default Index;
