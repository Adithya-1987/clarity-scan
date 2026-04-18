import { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, User, Brain, BookOpen, BarChart3, Settings, LogOut,
  Menu, X, ChevronRight, Upload, FileText, Calendar, TrendingUp, Activity,
  Bell,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", badge: "" },
  { icon: User, label: "My Profile", path: "/dashboard/profile", badge: "" },
  { icon: Brain, label: "Upload & Analyze", path: "/dashboard/upload", badge: "New" },
  { icon: BookOpen, label: "About Alzheimer's", path: "/about", badge: "" },
  { icon: BarChart3, label: "My Reports", path: "/dashboard/reports", badge: "3" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings", badge: "" },
];

const recentScans = [
  { date: "2026-03-07", type: "T1 MRI", result: "Non-Demented", confidence: 92, color: "bg-success" },
  { date: "2026-02-20", type: "FLAIR", result: "Very Mild", confidence: 78, color: "bg-warning" },
  { date: "2026-01-15", type: "T2 MRI", result: "Mild", confidence: 85, color: "bg-warning" },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

function DashboardSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    navigate("/home", { replace: true });
    await signOut();
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const displayEmail = user?.email || "";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-black/50 backdrop-blur-md border-r border-border flex flex-col h-screen sticky top-0 overflow-hidden"
      style={{ zIndex: 10, position: 'relative' }}
    >
      <div className="p-4 flex items-center justify-between border-b border-border">
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Logo size="sm" />
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          onClick={onToggle}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </motion.button>
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 border-b border-border"
          >
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="h-10 w-10 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-bold text-sm"
              >
                {initials}
              </motion.div>
              <div>
                <p className="font-semibold text-sm text-foreground">{displayName}</p>
                <p className="text-xs text-muted-foreground">{displayEmail}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item, i) => {
          const active = location.pathname === item.path;
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ x: 3 }}
            >
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active ? "gradient-hero text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!collapsed && item.badge && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={`text-xs px-2 py-0.5 rounded-full ${active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-accent text-accent-foreground"}`}
                  >
                    {item.badge}
                  </motion.span>
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <motion.button
          onClick={handleLogout}
          whileHover={{ x: 3, color: "hsl(0, 84%, 60%)" }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all w-full"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Logout</motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );
}

function DashboardOverview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const firstName = (user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there").split(" ")[0];
  const quickStats = [
    { icon: BarChart3, label: "Total Scans", value: "12", trend: "+3 this month", color: "text-primary" },
    { icon: Activity, label: "Latest Result", value: "Non-Demented", trend: "Mar 7, 2026", color: "text-success" },
    { icon: TrendingUp, label: "Risk Level", value: "Low", trend: "Based on latest scan", color: "text-success" },
    { icon: Calendar, label: "Next Checkup", value: "Apr 7", trend: "30 days away", color: "text-accent" },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-heading font-bold text-foreground">Welcome back, {firstName}! 👋</h1>
        <p className="text-muted-foreground mt-1">Here's your brain health overview</p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {quickStats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={staggerItem}
            whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
            className="card-medical"
          >
            <div className="flex items-center justify-between mb-3">
              <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </motion.div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-heading font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            <p className="text-xs text-accent mt-0.5">{stat.trend}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.button
          variants={staggerItem}
          whileHover={{ scale: 1.03, boxShadow: "0 15px 30px hsla(217, 91%, 60%, 0.2)" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/dashboard/upload")}
          className="card-medical gradient-hero text-primary-foreground text-left"
        >
          <Upload className="h-6 w-6 mb-2" />
          <p className="font-semibold">Upload New Scan</p>
          <p className="text-xs text-primary-foreground/70 mt-1">Analyze a brain MRI</p>
        </motion.button>
        <motion.button
          variants={staggerItem}
          whileHover={{ scale: 1.03, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/dashboard/reports")}
          className="card-medical text-left"
        >
          <FileText className="h-6 w-6 mb-2 text-info" />
          <p className="font-semibold text-foreground">View Reports</p>
          <p className="text-xs text-muted-foreground mt-1">See past analyses</p>
        </motion.button>
        <motion.button
          variants={staggerItem}
          whileHover={{ scale: 1.03, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/about")}
          className="card-medical text-left"
        >
          <BookOpen className="h-6 w-6 mb-2 text-accent" />
          <p className="font-semibold text-foreground">Learn About AD</p>
          <p className="text-xs text-muted-foreground mt-1">Educational resources</p>
        </motion.button>
        <motion.button
          variants={staggerItem}
          whileHover={{ scale: 1.03, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
          whileTap={{ scale: 0.97 }}
          className="card-medical text-left"
        >
          <Calendar className="h-6 w-6 mb-2 text-warning" />
          <p className="font-semibold text-foreground">Book Consultation</p>
          <p className="text-xs text-muted-foreground mt-1">Find a specialist</p>
        </motion.button>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card-medical"
      >
        <h2 className="font-heading font-semibold text-foreground mb-4">Recent Activity</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Scan Type</th>
                <th className="pb-3 font-medium">Result</th>
                <th className="pb-3 font-medium">Confidence</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentScans.map((scan, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  whileHover={{ backgroundColor: "hsl(var(--muted) / 0.5)" }}
                  className="border-b border-border/50 last:border-0 transition-colors"
                >
                  <td className="py-3 mono text-xs text-muted-foreground">{scan.date}</td>
                  <td className="py-3">{scan.type}</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${scan.color} text-primary-foreground`}>
                      {scan.result}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${scan.color} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${scan.confidence}%` }}
                          transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                        />
                      </div>
                      <span className="mono text-xs">{scan.confidence}%</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <motion.button whileHover={{ scale: 1.05 }} className="text-accent hover:underline text-xs font-medium">View</motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const isDashboardRoot = location.pathname === "/dashboard";

  return (
    <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh' }}>
      <div className="flex min-h-screen w-full relative">
        <DashboardSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <main className="flex-1 p-6 lg:p-8 overflow-auto" style={{ position: 'relative', zIndex: 10 }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
              {!isDashboardRoot && <ChevronRight className="h-4 w-4" />}
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full"
              />
            </motion.button>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {isDashboardRoot ? <DashboardOverview /> : <Outlet />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
