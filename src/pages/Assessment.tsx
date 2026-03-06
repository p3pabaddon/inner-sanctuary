import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AssessmentSection from "@/components/AssessmentSection";
import ClientPortal from "@/components/ClientPortal";
import AdminPanel from "@/components/AdminPanel";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import CursorGlow from "@/components/CursorGlow";
import ScrollProgress from "@/components/ScrollProgress";

const Assessment = () => {
    const navigate = useNavigate();
    const [isPortalOpen, setIsPortalOpen] = useState(false);
    const [isAdminOpen, setIsAdminOpen] = useState(false);
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    const handlePortalToggle = () => {
        setIsPortalOpen(true);
    };

    return (
        <div className="relative min-h-screen bg-background">
            <CursorGlow />
            <ScrollProgress />
            <Navbar onPortalOpen={handlePortalToggle} />

            <main className="pt-20">
                <AssessmentSection />
            </main>

            <Footer />
            <ClientPortal isOpen={isPortalOpen} onClose={() => setIsPortalOpen(false)} />
            <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
        </div>
    );
};

export default Assessment;
