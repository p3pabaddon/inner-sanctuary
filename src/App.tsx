import { Suspense, lazy, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import ThemeToggle from "@/components/ThemeToggle";
import { supabase } from "@/lib/supabase";

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Assessment = lazy(() => import("./pages/Assessment"));
const Testimonials = lazy(() => import("./pages/Testimonials"));
const Compliance = lazy(() => import("./pages/Compliance"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MasterAdminDashboard = lazy(() => import("@/components/MasterAdminDashboard"));

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
  </div>
);

const queryClient = new QueryClient();

const App = () => {
  const [isMasterAdminOpen, setIsMasterAdminOpen] = useState(false);

  useEffect(() => {
    // Real-time Heartbeat & Location Tracking
    const updateActivity = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Try to get city from IP if not already set this session
        const lastCity = sessionStorage.getItem('user_city');
        let city = lastCity;

        if (!city) {
          const res = await fetch('https://ipapi.co/json/');
          const data = await res.json();
          city = data.city || 'Bilinmiyor';
          sessionStorage.setItem('user_city', city);
        }

        await supabase.from('profiles').update({
          last_seen: new Date().toISOString(),
          last_known_city: city
        }).eq('id', user.id);
      } catch (e) {
        console.error("Heartbeat error:", e);
      }
    };

    updateActivity();
    const interval = setInterval(updateActivity, 120000); // Every 2 mins
    return () => clearInterval(interval);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/degerlendirme" element={<Assessment />} />
                <Route path="/yorumlar" element={<Testimonials />} />
                <Route path="/uyumluluk" element={<Compliance />} />
                <Route path="/sss" element={<FAQ />} />
                <Route path="/iletisim" element={<Contact />} />
                {/* Master Admin Route */}
                <Route path="/yonetim-paneli" element={
                  <div className="min-h-screen bg-background text-foreground">
                    <MasterAdminDashboard onClose={() => window.location.href = '/'} />
                  </div>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <ThemeToggle />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
