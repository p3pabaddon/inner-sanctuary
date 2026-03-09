import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import ThemeToggle from "@/components/ThemeToggle";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Assessment from "./pages/Assessment";
import Testimonials from "./pages/Testimonials";
import Compliance from "./pages/Compliance";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import MasterAdminDashboard from "@/components/MasterAdminDashboard";

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
          </BrowserRouter>
          <ThemeToggle />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
