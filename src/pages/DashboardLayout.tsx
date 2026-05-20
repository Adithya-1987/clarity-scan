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

// Shared nav content — used by both desktop sidebar and mobile drawer
function SidebarContent({
  collapsed = false,
  onToggle,
  onClose,
}: {
  collapsed?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    onClose?.();
    await signOut();
    navigate('/auth', { replace: true });
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const displayEmail = user?.email || "";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      <div className="p-4 flex items-center justify-between border-b border-border flex-shrink-0">
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Logo size="sm" />
            </motion.div>
          )}
        </AnimatePresence>
        {onToggle && (
          <motion.button
            onClick={onToggle}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg hover:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </motion.button>
        )}
        {!onToggle && onClose && (
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg hover:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="h-5 w-5" />
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 border-b border-border flex-shrink-0"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
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
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 min-h-[44px] ${
                  active
                    ? "gradient-hero text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!collapsed && item.badge && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      active
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-accent text-accent-foreground"
                    }`}
                  >
                    {item.badge}
                  </motion.span>
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border flex-shrink-0">
        <motion.button
          onClick={handleLogout}
          whileHover={{ x: 3, color: "hsl(0, 84%, 60%)" }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all w-full min-h-[44px]"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  );
}

// Desktop sidebar with collapse animation — hidden on mobile
function DesktopSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="hidden lg:flex flex-col bg-black/50 backdrop-blur-md border-r border-border h-screen sticky top-0 overflow-hidden"
      style={{ zIndex: 10 }}
    >
      <SidebarContent collapsed={collapsed} onToggle={onToggle} />
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
    <div className="space-y-6 lg:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-xl lg:text-2xl font-heading font-bold text-foreground">Welcome back, {firstName}! 👋</h1>
        <p className="text-muted-foreground mt-1 text-sm">Here's your brain health overview</p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
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
            <p className="text-xl lg:text-2xl font-heading font-bold text-foreground truncate">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            <p className="text-xs text-accent mt-0.5 truncate">{stat.trend}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
      >
        <motion.button
          variants={staggerItem}
          whileHover={{ scale: 1.03, boxShadow: "0 15px 30px hsla(217, 91%, 60%, 0.2)" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/dashboard/upload")}
          className="card-medical gradient-hero text-primary-foreground text-left min-h-[44px]"
        >
          <Upload className="h-6 w-6 mb-2" />
          <p className="font-semibold text-sm lg:text-base">Upload New Scan</p>
          <p className="text-xs text-primary-foreground/70 mt-1 hidden sm:block">Analyze a brain MRI</p>
        </motion.button>
        <motion.button
          variants={staggerItem}
          whileHover={{ scale: 1.03, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/dashboard/reports")}
          className="card-medical text-left min-h-[44px]"
        >
          <FileText className="h-6 w-6 mb-2 text-info" />
          <p className="font-semibold text-foreground text-sm lg:text-base">View Reports</p>
          <p className="text-xs text-muted-foreground mt-1 hidden sm:block">See past analyses</p>
        </motion.button>
        <motion.button
          variants={staggerItem}
          whileHover={{ scale: 1.03, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/about")}
          className="card-medical text-left min-h-[44px]"
        >
          <BookOpen className="h-6 w-6 mb-2 text-accent" />
          <p className="font-semibold text-foreground text-sm lg:text-base">Learn About AD</p>
          <p className="text-xs text-muted-foreground mt-1 hidden sm:block">Educational resources</p>
        </motion.button>
        <motion.button
          variants={staggerItem}
          whileHover={{ scale: 1.03, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
          whileTap={{ scale: 0.97 }}
          className="card-medical text-left min-h-[44px]"
        >
          <Calendar className="h-6 w-6 mb-2 text-warning" />
          <p className="font-semibold text-foreground text-sm lg:text-base">Book Consultation</p>
          <p className="text-xs text-muted-foreground mt-1 hidden sm:block">Find a specialist</p>
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
          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full text-sm min-w-[480px]">
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
                      <td className="py-3 mono text-xs text-muted-foreground whitespace-nowrap">{date}</td>
                      <td className="py-3 text-xs text-muted-foreground max-w-[140px] truncate">{filename}</td>
                      <td className="py-3 whitespace-nowrap">
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
                            <span className="mono text-xs whitespace-nowrap">{scan.confidence}%</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => navigate('/dashboard/reports')}
                          className="text-accent hover:underline text-xs font-medium min-h-[44px] flex items-center"
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isDashboardRoot = location.pathname === "/dashboard";

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh' }}>
      {/* Mobile drawer — backdrop + slide-in sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              key="mobile-sidebar"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed left-0 top-0 h-full w-[280px] z-50 lg:hidden bg-black/95 backdrop-blur-md border-r border-border flex flex-col"
            >
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-h-screen w-full relative">
        {/* Desktop sidebar */}
        <DesktopSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4 lg:p-8 overflow-auto" style={{ position: 'relative', zIndex: 10 }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 min-w-0">
              {/* Hamburger — mobile only */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </motion.button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                <Link to="/dashboard" className="hover:text-foreground transition-colors whitespace-nowrap">Dashboard</Link>
                {!isDashboardRoot && <ChevronRight className="h-4 w-4 flex-shrink-0" />}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              className="relative p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
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
