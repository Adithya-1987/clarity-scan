import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, CheckCircle, Eye, EyeOff, Calendar, Phone, Brain, Shield, Target, Sparkles, Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useNavigate } from "react-router-dom";
import heroBrain from "@/assets/hero-brain.png";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

const trustBadges = [
  { icon: Target, label: "75% Accuracy" },
  { icon: Shield, label: "100% Secure" },
  { icon: Sparkles, label: "FDA Research Level" },
];

const testimonials = [
  { text: "This tool gave me peace of mind and early detection.", author: "Sarah M., 67" },
  { text: "The educational resources have been invaluable.", author: "John D., 45" },
  { text: "Impressive accuracy matching my clinical diagnosis.", author: "Dr. Emily R." },
];

const formFieldVariants = {
  hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: "", dob: "", phone: "", terms: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((i) => (i + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const getPasswordStrength = (pw: string) => {
    if (pw.length < 4) return { label: "Weak", color: "bg-destructive", width: "w-1/4" };
    if (pw.length < 8) return { label: "Medium", color: "bg-warning", width: "w-2/4" };
    if (pw.length >= 8 && /[A-Z]/.test(pw) && /\d/.test(pw)) return { label: "Strong", color: "bg-success", width: "w-full" };
    return { label: "Medium", color: "bg-warning", width: "w-3/4" };
  };

  const strength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        navigate("/dashboard", { replace: true });
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
              dob: formData.dob,
              phone: formData.phone,
            },
          },
        });
        if (error) throw error;
        navigate("/dashboard", { replace: true });
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) setError(error.message);
  };

  const inputClass = "input-medical pl-11";

  return (
    <>
      <div className="min-h-screen flex flex-col lg:flex-row relative">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-primary-foreground/10"
              style={{
                width: Math.random() * 8 + 4,
                height: Math.random() * 8 + 4,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: Math.random() * 4 + 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <Logo size="lg" className="mb-8 [&_span]:text-primary-foreground [&_.text-gradient]:text-primary-foreground" />
          <motion.h1
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl font-heading font-bold text-primary-foreground mb-4"
          >
            AI-Powered Alzheimer's Diagnosis
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-primary-foreground/80 text-lg"
          >
            Advanced brain MRI analysis using deep learning ensemble models
          </motion.p>
        </div>

        {/* Brain image */}
        <motion.div
          className="relative z-10 flex justify-center my-8"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <motion.img
            src={heroBrain}
            alt="Brain MRI visualization"
            className="w-64 h-64 object-cover rounded-3xl opacity-80"
            whileHover={{ scale: 1.05, opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>

        {/* Trust badges */}
        <div className="relative z-10">
          <div className="flex gap-4 mb-8">
            {trustBadges.map((badge, i) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="glass-dark rounded-xl px-4 py-3 flex items-center gap-2"
              >
                <badge.icon className="h-4 w-4 text-primary-foreground" />
                <span className="text-sm font-medium text-primary-foreground">{badge.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Testimonial */}
          <AnimatePresence mode="wait">
            <motion.div
              key={testimonialIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-dark rounded-xl p-4"
            >
              <p className="text-primary-foreground/90 italic text-sm">"{testimonials[testimonialIndex].text}"</p>
              <p className="text-primary-foreground/60 text-xs mt-2">— {testimonials[testimonialIndex].author}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Logo size="lg" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "signup"}
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: -90 }}
              transition={{ duration: 0.3 }}
            >
              <motion.h2
                initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-heading font-bold text-foreground mb-2"
              >
                {isLogin ? "Welcome back" : "Create account"}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="text-muted-foreground mb-8"
              >
                {isLogin ? "Sign in to continue your analysis" : "Start your brain health journey today"}
              </motion.p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <motion.div custom={0} variants={formFieldVariants} initial="hidden" animate="visible" className="relative">
                    <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      className={inputClass}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </motion.div>
                )}

                <motion.div custom={1} variants={formFieldVariants} initial="hidden" animate="visible" className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Email address"
                    className={inputClass}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </motion.div>

                <motion.div custom={2} variants={formFieldVariants} initial="hidden" animate="visible" className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className={`${inputClass} pr-11`}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </motion.button>
                  {!isLogin && formData.password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-2"
                    >
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${strength.color} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: strength.width === "w-1/4" ? "25%" : strength.width === "w-2/4" ? "50%" : strength.width === "w-3/4" ? "75%" : "100%" }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">{strength.label}</span>
                    </motion.div>
                  )}
                </motion.div>

                {!isLogin && (
                  <>
                    <motion.div custom={3} variants={formFieldVariants} initial="hidden" animate="visible" className="relative">
                      <CheckCircle className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        className={`${inputClass} pr-11`}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      />
                      <motion.button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </motion.button>
                    </motion.div>

                    <div className="grid grid-cols-2 gap-3">
                      <motion.div custom={4} variants={formFieldVariants} initial="hidden" animate="visible" className="relative">
                        <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                        <input type="date" className={inputClass} value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} />
                      </motion.div>
                      <motion.div custom={5} variants={formFieldVariants} initial="hidden" animate="visible" className="relative">
                        <Phone className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                        <input type="tel" placeholder="Phone (optional)" className={inputClass} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                      </motion.div>
                    </div>

                    <motion.label custom={6} variants={formFieldVariants} initial="hidden" animate="visible" className="flex items-start gap-2 text-sm cursor-pointer">
                      <input type="checkbox" className="mt-0.5 accent-accent" checked={formData.terms} onChange={(e) => setFormData({ ...formData, terms: e.target.checked })} />
                      <span className="text-muted-foreground">
                        I agree to the <a href="#" className="text-accent hover:underline">Terms of Service</a> and <a href="#" className="text-accent hover:underline">Privacy Policy</a>
                      </span>
                    </motion.label>
                  </>
                )}

                {isLogin && (
                  <motion.div custom={2} variants={formFieldVariants} initial="hidden" animate="visible" className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="accent-accent" />
                      <span className="text-muted-foreground">Remember me</span>
                    </label>
                    <a href="#" className="text-accent hover:underline">Forgot password?</a>
                  </motion.div>
                )}

                <motion.button
                  whileHover={!submitting ? { scale: 1.02, boxShadow: "0 20px 40px hsla(217, 91%, 60%, 0.3)" } : {}}
                  whileTap={!submitting ? { scale: 0.98 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-medical gradient-hero text-primary-foreground text-base shadow-lg disabled:opacity-70"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : isLogin ? "Sign In" : "Create Account"}
                </motion.button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-transparent px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={handleGoogleLogin}
                  whileHover={{ scale: 1.02, backgroundColor: "hsl(var(--muted))" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full btn-medical border border-border bg-white/10 text-foreground"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Continue with Google
                </motion.button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <motion.button
                  onClick={() => { setIsLogin(!isLogin); setError(null); }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-accent font-medium hover:underline"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </motion.button>
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
      </div>
    </>
  );
}
