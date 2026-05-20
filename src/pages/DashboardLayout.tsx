import { useState, useEffect } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, User, Brain, BookOpen, BarChart3, Settings, LogOut,
  Menu, X, ChevronRight, Upload, FileText, Calendar, TrendingUp, Activity,
  Bell, Inbox,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

interface RecentScan {
  id: string;
  image_path: string;
  prediction: string | null;
  confidence: number | null;
  status: string;
  created_at: string;
}

function formatPrediction(pred: string | null): string {
  if (!pred) return '—';
  if (pred === 'NonDemented') return 'Non Demented';
  if (pred === 'VeryMildDemented') return 'Very Mild';
  if (pred === 'MildDemented') return 'Mild';
  if (pred === 'ModerateDemented') return 'Moderate';
  // Already human-readable
  return pred;
}

function getRiskLevel(pred: string | null): { value: string; color: string } {
  if (!pred) return { value: '—', color: 'text-muted-foreground' };
  const p = pred.toLowerCase();
  if (p.includes('non')) return { value: 'Low', color: 'text-success' };
  if (p.includes('very') && p.includes('mild')) return { value: 'Low', color: 'text-success' };
  if (p.includes('mild')) return { value: 'Moderate', color: 'text-warning' };
  if (p.includes('moderate')) return { value: 'High', color: 'text-destructive' };
  return { value: 'Unknown', color: 'text-muted-foreground' };
}

function getScanBadgeColor(pred: string | null, status: string): string {
  if (status === 'failed') return 'bg-destructive';
  if (!pred || status !== 'done') return 'bg-warning';
  const p = pred.toLowerCase();
  if (p.includes('non')) return 'bg-success';
  if (p.includes('very') || p.includes('mild')) return 'bg-warning';
  if (p.includes('moderate')) return 'bg-destructive';
  return 'bg-warning';
}

function getFilename(imagePath: string): string {
  const parts = imagePath.split('/');
  const full = parts[parts.length - 1];
  const idx = full.indexOf('_');
  return idx !== -1 ? full.slice(idx + 1) : full;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", badge: "" },
  { icon: User, label: "My Profile", path: "/dashboard/profile", badge: "" },
  { icon: Brain, label: "Upload & Analyze", path: "/dashboard/upload", badge: "New" },
  { icon: BookOpen, label: "About Alzheimer's", path: "/about", badge: "" },
  { icon: BarChart3, label: "My Reports", path: "/dashboard/reports", badge: "" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings", badge: "" },
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
    await signOut();
    navigate('/auth', { replace: true });
    // Fallback in case navigate doesn't trigger within 1 second
    setTimeout(() => {
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth';
      }
    }, 1000);
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

  const [statsLoading, setStatsLoading] = useState(true);
  const [totalScans, setTotalScans] = useState(0);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [latestScan, setLatestScan] = useState<RecentScan | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, count } = await supabase
        .from('scans')
        .select('id, created_at, prediction, confidence, status, image_path', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      setTotalScans(count ?? 0);
      const rows = data ?? [];
      setRecentScans(rows);
      setLatestScan(rows[0] ?? null);
      setStatsLoading(false);
    })();
  }, [user]);

  const risk = getRiskLevel(latestScan?.prediction ?? null);
  const latestLabel = latestScan
    ? (latestScan.status === 'done' ? formatPrediction(latestScan.prediction) : 'Processing…')
    : 'No scans yet';
  const latestDate = latestScan
    ? new Date(latestScan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';
  const latestColor = latestScan?.status === 'done' && latestScan.prediction
    ? getRiskLevel(latestScan.prediction).color
    : 'text-muted-foreground';

  const quickStats = [
    { icon: BarChart3, label: "Total Scans", value: statsLoading ? "—" : String(totalScans), trend: "lifetime scans", color: "text-primary" },
    { icon: Activity, label: "Latest Result", value: statsLoading ? "—" : latestLabel, trend: latestDate, color: latestColor },
    { icon: TrendingUp, label: "Risk Level", value: statsLoading ? "—" : risk.value, trend: "Based on latest scan", color: risk.color },
    { icon: Calendar, label: "Last Scan", value: statsLoading ? "—" : (latestScan ? new Date(latestScan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Never"), trend: latestScan ? "most recent" : "no scans yet", color: "text-accent" },
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

        {statsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : recentScans.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <Inbox className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm mb-4">No scans yet</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard/upload')}
              className="btn-medical gradient-hero text-primary-foreground text-sm"
            >
              <Upload className="h-4 w-4" /> Upload Your First Scan
            </motion.button>
          </motion.div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">File</th>
                  <th className="pb-3 font-medium">Result</th>
                  <th className="pb-3 font-medium">Confidence</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentScans.map((scan, i) => {
                  const badgeColor = getScanBadgeColor(scan.prediction, scan.status);
                  const label = scan.status === 'done' ? formatPrediction(scan.prediction) : scan.status === 'failed' ? 'Failed' : 'Pending';
                  const filename = getFilename(scan.image_path);
                  const date = new Date(scan.created_at).toLocaleDateString('en-CA');
                  return (
                    <motion.tr
                      key={scan.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.08 }}
                      whileHover={{ backgroundColor: "hsl(var(--muted) / 0.5)" }}
                      className="border-b border-border/50 last:border-0 transition-colors"
                    >
                      <td className="py-3 mono text-xs text-muted-foreground">{date}</td>
                      <td className="py-3 text-xs text-muted-foreground max-w-[140px] truncate">{filename}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColor} text-primary-foreground`}>
                          {label}
                        </span>
                      </td>
                      <td className="py-3">
                        {scan.confidence != null ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                className={`h-full ${badgeColor} rounded-full`}
                                initial={{ width: 0 }}
                                animate={{ width: `${scan.confidence}%` }}
                                transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                              />
                            </div>
                            <span className="mono text-xs">{scan.confidence}%</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => navigate('/dashboard/reports')}
                          className="text-accent hover:underline text-xs font-medium"
                        >
                          View
                        </motion.button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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
