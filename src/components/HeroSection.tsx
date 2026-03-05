import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import heroImage from "@/assets/psychologist-hero.jpg";

const FloatingShape = ({ className, delay = 0 }: { className?: string; delay?: number }) => (
  <motion.div
    className={`absolute rounded-full opacity-20 blur-3xl ${className}`}
    animate={{
      y: [0, -30, 0],
      x: [0, 15, 0],
      scale: [1, 1.1, 1],
    }}
    transition={{ duration: 8, repeat: Infinity, delay, ease: "easeInOut" }}
  />
);

const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  const words = ["Your", "Mind", "Deserves", "Care"];

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center overflow-hidden noise-overlay"
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent via-background to-muted animate-gradient-shift" />

      {/* Floating shapes */}
      <FloatingShape className="w-96 h-96 bg-primary top-10 -left-20" delay={0} />
      <FloatingShape className="w-72 h-72 bg-secondary top-1/3 right-10" delay={2} />
      <FloatingShape className="w-64 h-64 bg-secondary/50 bottom-20 left-1/4" delay={4} />

      {/* Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-primary/20"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
        />
      ))}

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen py-32">
          {/* Text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-block px-4 py-1.5 rounded-full glass text-sm font-body text-primary mb-8"
            >
              Clinical Psychology Practice
            </motion.div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold leading-[0.95] mb-8">
              {words.map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.15, duration: 0.8, ease: "easeOut" }}
                  className={`inline-block mr-4 ${i === 3 ? "text-gradient-primary" : "text-foreground"}`}
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="text-lg md:text-xl text-muted-foreground font-body max-w-lg mb-10 leading-relaxed"
            >
              Professional psychological counseling in a safe and supportive environment. Begin your journey toward inner peace.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="flex flex-wrap gap-4"
            >
              <a
                href="#appointment"
                className="group relative px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated animate-pulse-glow"
              >
                <span className="relative z-10">Book Appointment</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </a>
              <a
                href="#about"
                className="px-8 py-4 rounded-full glass font-medium text-foreground hover:shadow-soft transition-all duration-300 hover:-translate-y-1"
              >
                Learn More
              </a>
            </motion.div>
          </div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 1.2 }}
            className="relative hidden lg:block"
            style={{
              transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)`,
              transition: "transform 0.3s ease-out",
            }}
          >
            <div className="relative animate-float">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-[2rem] blur-2xl" />
              <img
                src={heroImage}
                alt="Dr. Ayşe Yılmaz - Clinical Psychologist"
                className="relative rounded-[2rem] shadow-elevated w-full object-cover aspect-[16/10]"
              />
              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.8 }}
                className="absolute -bottom-6 -left-6 glass-strong rounded-2xl p-4 shadow-card"
              >
                <div className="text-sm font-body text-muted-foreground">Experience</div>
                <div className="text-2xl font-display font-bold text-primary">15+ Years</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-primary/30 flex justify-center pt-2"
        >
          <motion.div className="w-1.5 h-1.5 rounded-full bg-primary" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
