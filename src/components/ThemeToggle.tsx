import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="fixed bottom-8 right-8 z-[100] w-14 h-14 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md rounded-full shadow-elevated border border-white/50 dark:border-zinc-700/50 flex items-center justify-center text-primary transition-all"
            title={theme === "light" ? "Karanlık Mod" : "Aydınlık Mod"}
        >
            {theme === "light" ? <Moon size={24} /> : <Sun size={24} />}
        </motion.button>
    );
};

export default ThemeToggle;
