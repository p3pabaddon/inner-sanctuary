import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ComplianceSection from "@/components/ComplianceSection";
import ClientPortal from "@/components/ClientPortal";
import AdminPanel from "@/components/AdminPanel";
import CursorGlow from "@/components/CursorGlow";
import ScrollProgress from "@/components/ScrollProgress";

const Compliance = () => {
    const [isPortalOpen, setIsPortalOpen] = useState(false);
    const [isAdminOpen, setIsAdminOpen] = useState(false);

    const handlePortalToggle = () => {
        setIsPortalOpen(true);
    };

    return (
        <div className="relative min-h-screen bg-background text-foreground">
            <CursorGlow />
            <ScrollProgress />
            <Navbar onPortalOpen={handlePortalToggle} />

            <main className="pt-20">
                <ComplianceSection />
            </main>

            <Footer />
            <ClientPortal isOpen={isPortalOpen} onClose={() => setIsPortalOpen(false)} />
            <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
        </div>
    );
};

export default Compliance;
