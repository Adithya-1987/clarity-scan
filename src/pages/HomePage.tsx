import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Brain, Zap, FileText, Shield, Stethoscope, Heart,
  Upload, Lightbulb, ArrowRight, Play, ChevronUp, ChevronDown,
  Images, Target, Layers, Trophy, Star, Mail, LogOut,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useScrollAnimation, useCountUp } from "@/hooks/useScrollAnimation";
import { useAuth } from "@/hooks/useAuth";
import heroBrain from "@/assets/hero-brain.png";

const features = [
  { icon: Brain, title: "AI-Powered Analysis", desc: "ResNet-50 + EfficientNet-B3 ensemble architecture", color: "text-primary" },
  { icon: Zap, title: "Instant Results", desc: "Get detailed diagnosis in under 30 seconds", color: "text-warning" },
  { icon: FileText, title: "Comprehensive Reports", desc: "Detailed analysis with Grad-CAM visualizations", color: "text-info" },
  { icon: Shield, title: "100% Secure", desc: "HIPAA-compliant data encryption and storage", color: "text-success" },
  { icon: Stethoscope, title: "Expert Validated", desc: "Based on peer-reviewed research (99.32% target)", color: "text-accent" },
  { icon: Heart, title: "Personalized Care", desc: "Stage-specific treatment recommendations", color: "text-destructive" },
];

const steps = [
  { icon: Upload, title: "Upload MRI Scan", desc: "Drag and drop your brain MRI scan in JPG, PNG, or DICOM format" },
  { icon: Brain, title: "AI Analysis", desc: "Our ensemble model processes your scan using advanced deep learning" },
  { icon: FileText, title: "Get Results", desc: "Receive detailed diagnosis with confidence scores and heatmaps" },
  { icon: Lightbulb, title: "Understand & Act", desc: "Get personalized recommendations and educational resources" },
];

const stats = [
  { icon: Images, value: 33984, label: "Scans Analyzed", suffix: "+" },
  { icon: Target, value: 75, label: "Accuracy Rate", suffix: "%" },
  { icon: Layers, value: 4, label: "Disease Stages", suffix: "" },
  { icon: Trophy, value: 100, label: "Moderate Detection", suffix: "%" },
];

const testimonials = [
  { text: "This tool gave me peace of mind and early detection. The detailed reports helped my doctor create a treatment plan immediately.", author: "Sarah M.", role: "Patient, 67", rating: 5 },
  { text: "As a caregiver, the educational resources have been invaluable. I finally understand what my mother is going through.", author: "John D.", role: "Caregiver, 45", rating: 5 },
  { text: "The accuracy is impressive. It matched my clinical diagnosis and provided insights my neurologist found helpful.", author: "Dr. Emily R.", role: "Neurologist", rating: 5 },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    navigate("/home");
    await signOut();
  };

  const firstName = (profile?.full_name || user?.email?.split("@")[0] || "").split(" ")[0];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        backgroundColor: scrolled ? "rgba(10,14,39,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.08)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Logo size="sm" />
        <div className="hidden md:flex items-center gap-8">
          {[
            { href: "#features", label: "How It Works" },
            { to: "/about", label: "About Alzheimer's" },
            { to: "/dashboard", label: "Dashboard" },
          ].map((link) => (
            <motion.div key={link.label} whileHover={{ y: -1 }} className="relative group">
              {"to" in link ? (
                <Link to={link.to!} className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                  {link.label}
                </Link>
              ) : (
                <a href={link.href} className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                  {link.label}
                </a>
              )}
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent origin-left"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.2 }}
              />
            </motion.div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-2">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-full gradient-hero flex items-center justify-center text-primary-foreground text-xs font-bold">
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-foreground/80 hidden sm:inline">{firstName}</span>
              </Link>
              <motion.button
                onClick={handleSignOut}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </motion.button>
            </>
          ) : (
            <Link to="/auth" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">Login</Link>
          )}
          <motion.div whileHover={{ scale: 1.02, boxShadow: "0 8px 25px hsla(217, 91%, 60%, 0.3)" }} whileTap={{ scale: 0.98 }}>
            <Link to="/dashboard/upload" className="btn-medical gradient-hero text-primary-foreground text-sm px-4 py-2">
              Upload Scan
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
}

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      style={{ scaleX: scrollYProgress }}
      className="fixed top-0 left-0 right-0 h-1 gradient-hero origin-left z-[60]"
    />
  );
}

function TypewriterText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.03, delay: 0.5 + i * 0.025 }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

function HeroSection() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary-foreground/5"
            style={{ width: Math.random() * 6 + 2, height: Math.random() * 6 + 2, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ y: [0, -40, 0], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: Math.random() * 5 + 4, repeat: Infinity, delay: Math.random() * 3 }}
          />
        ))}
      </div>
      <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative z-10 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-center lg:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-primary-foreground leading-tight"
          >
            Advanced AI for Early{" "}
            <TypewriterText text="Alzheimer's Detection" className="text-accent-foreground/90" />
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-xl text-primary-foreground/80 mt-6 max-w-lg"
          >
            Analyze brain MRI scans in seconds with 75% accuracy using our deep learning ensemble model
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 mt-8 justify-center lg:justify-start"
          >
            <motion.div
              whileHover={{ scale: 1.04, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link to="/dashboard/upload" className="btn-medical bg-primary-foreground text-primary text-base font-bold shadow-lg px-8 py-4">
                Upload MRI Scan <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.04, borderColor: "rgba(255,255,255,0.5)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="btn-medical border-2 border-primary-foreground/30 text-primary-foreground text-base px-8 py-4"
            >
              <Play className="h-5 w-5" /> Watch Demo
            </motion.button>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
          className="flex-1 flex justify-center"
        >
          <motion.img
            src={heroBrain}
            alt="AI Brain Analysis"
            className="w-80 h-80 lg:w-[28rem] lg:h-[28rem] object-cover rounded-3xl shadow-2xl"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            whileHover={{ scale: 1.03, boxShadow: "0 30px 60px rgba(0,0,0,0.3)" }}
          />
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="h-6 w-6 text-primary-foreground/60" />
      </motion.div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground">
            Why Choose <span className="text-gradient">NeuroScan AI</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Our cutting-edge AI technology provides accurate, fast, and secure brain MRI analysis
          </p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={staggerItem}
              whileHover={{ y: -8, boxShadow: "0 20px 40px hsla(217, 91%, 60%, 0.15)" }}
              transition={{ duration: 0.3 }}
              className="card-medical group"
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="h-12 w-12 rounded-xl gradient-hero flex items-center justify-center mb-4"
              >
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </motion.div>
              <h3 className="text-lg font-heading font-semibold text-foreground mb-2 transition-colors duration-300 group-hover:text-accent">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground">
            How It <span className="text-gradient">Works</span>
          </h2>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-4 gap-8"
        >
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              variants={staggerItem}
              className="text-center relative group"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-hero mb-4"
              >
                <step.icon className="h-8 w-8 text-primary-foreground" />
              </motion.div>
              <div className="absolute top-8 left-[60%] right-0 h-0.5 bg-border hidden md:block" style={{ display: i === 3 ? "none" : undefined }} />
              <div className="mono text-xs font-semibold text-accent mb-2">STEP {i + 1}</div>
              <h3 className="font-heading font-semibold text-foreground mb-2 transition-colors group-hover:text-accent">{step.title}</h3>
              <p className="text-muted-foreground text-sm">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function StatsSection() {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <section ref={ref} className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => {
          const count = useCountUp(stat.value, 2000, isVisible);
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, type: "spring", stiffness: 200 }}
              className="text-center"
            >
              <motion.div
                animate={isVisible ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <stat.icon className="h-8 w-8 text-primary-foreground/60 mx-auto mb-3" />
              </motion.div>
              <div className="mono text-4xl sm:text-5xl font-bold text-primary-foreground">
                {count.toLocaleString()}{stat.suffix}
              </div>
              <div className="text-primary-foreground/70 text-sm mt-2">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground">
            Trusted by <span className="text-gradient">Thousands</span>
          </h2>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-6"
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              whileHover={{ y: -5, boxShadow: "0 20px 40px hsla(217, 91%, 60%, 0.12)" }}
              className="card-medical"
            >
              <div className="flex gap-1 mb-3">
                {[...Array(t.rating)].map((_, j) => (
                  <motion.div
                    key={j}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + j * 0.1, type: "spring", stiffness: 300 }}
                  >
                    <Star className="h-4 w-4 fill-warning text-warning" />
                  </motion.div>
                ))}
              </div>
              <p className="text-foreground/80 italic mb-4">"{t.text}"</p>
              <div>
                <p className="font-semibold text-foreground">{t.author}</p>
                <p className="text-muted-foreground text-sm">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="text-foreground py-16 border-t border-border">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8"
      >
        <div>
          <Logo size="sm" className="mb-4" />
          <p className="text-muted-foreground text-sm">AI-powered brain health analysis for early detection and intervention.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Quick Links</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            {[
              { to: "/home", label: "Home" },
              { to: "/about", label: "About Alzheimer's" },
              { to: "/dashboard", label: "Dashboard" },
            ].map((link) => (
              <motion.div key={link.label} whileHover={{ x: 3 }} transition={{ duration: 0.2 }}>
                <Link to={link.to} className="block hover:text-foreground transition-colors">{link.label}</Link>
              </motion.div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Resources</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            {["Research Paper", "Privacy Policy", "FAQ"].map((text) => (
              <motion.div key={text} whileHover={{ x: 3 }} transition={{ duration: 0.2 }}>
                <a href="#" className="block hover:text-foreground transition-colors">{text}</a>
              </motion.div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Newsletter</h4>
          <p className="text-sm text-muted-foreground mb-3">Stay updated on brain health research</p>
          <div className="flex gap-2">
            <input type="email" placeholder="Email" className="input-medical text-sm flex-1" />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-medical bg-accent text-accent-foreground px-4 py-2 text-sm"
            >
              <Mail className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
        © 2026 NeuroScan AI. All rights reserved. Not a clinical diagnostic tool.
      </div>
    </footer>
  );
}

function ScrollToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          whileHover={{ scale: 1.15, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full gradient-hero text-primary-foreground shadow-lg flex items-center justify-center"
        >
          <ChevronUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default function HomePage() {
  return (
    <>
      <div className="min-h-screen relative">
        <ScrollProgressBar />
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <StatsSection />
        <TestimonialsSection />
        <Footer />
        <ScrollToTop />
      </div>
    </>
  );
}
