import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, FileText, Eye, Loader2, Inbox } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

interface Scan {
  id: string;
  image_path: string;
  prediction: string | null;
  confidence: number | null;
  status: string;
  created_at: string;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "done":
      return { color: "bg-success", label: "Done" };
    case "failed":
      return { color: "bg-destructive", label: "Failed" };
    default:
      return { color: "bg-warning", label: "Pending" };
  }
}

function getFilename(imagePath: string) {
  const parts = imagePath.split("/");
  const full = parts[parts.length - 1];
  // Strip the leading timestamp_
  const underscoreIdx = full.indexOf("_");
  return underscoreIdx !== -1 ? full.slice(underscoreIdx + 1) : full;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export default function ReportsPage() {
  const { user } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchScans = async () => {
      const { data } = await supabase
        .from("scans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setScans(data || []);
      setLoading(false);
    };
    fetchScans();
  }, [user]);

  return (
    <>
      <div className="max-w-4xl mx-auto relative">
      <motion.div
        initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">My Reports</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {loading ? "Loading..." : `${scans.length} scan${scans.length !== 1 ? "s" : ""} found`}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-medical border border-border bg-white/10 text-foreground text-sm"
        >
          <Download className="h-4 w-4" /> Export All
        </motion.button>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
        </div>
      ) : scans.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-medical flex flex-col items-center justify-center py-16 text-center"
        >
          <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-heading font-semibold text-foreground mb-1">No scans yet</h2>
          <p className="text-muted-foreground text-sm">Upload your first MRI scan to see results here.</p>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-4"
        >
          {scans.map((scan, i) => {
            const badge = getStatusBadge(scan.status);
            const filename = getFilename(scan.image_path);
            const date = new Date(scan.created_at).toLocaleDateString("en-CA");
            return (
              <motion.div
                key={scan.id}
                variants={staggerItem}
                whileHover={{ y: -3, boxShadow: "0 15px 30px rgba(0,0,0,0.08)" }}
                className="card-medical flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center"
                  >
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </motion.div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{filename}</p>
                    <p className="text-xs text-muted-foreground mono">{date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color} text-primary-foreground`}>
                    {scan.prediction || badge.label}
                  </span>
                  {scan.confidence != null && (
                    <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${badge.color} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${scan.confidence}%` }}
                          transition={{ duration: 0.8, delay: 0.2 + i * 0.08 }}
                        />
                      </div>
                      <span className="mono">{scan.confidence}%</span>
                    </div>
                  )}
                  <div className="flex gap-1">
                    <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <Download className="h-4 w-4 text-muted-foreground" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
      </div>
    </>
  );
}
