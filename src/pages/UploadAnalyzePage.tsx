import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Brain, FileText, X, ZoomIn, ZoomOut, AlertTriangle,
  Download, Share2, Mail, CheckCircle, Loader2,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

const analysisStages = [
  "Applying CLAHE preprocessing...",
  "Running ResNet-50 model...",
  "Running EfficientNet-B3 model...",
  "Generating Grad-CAM visualization...",
  "Creating detailed report...",
];

const resultData = [
  { name: "Non-Demented", value: 3.2, color: "hsl(160, 84%, 39%)" },
  { name: "Very Mild", value: 5.1, color: "hsl(38, 92%, 50%)" },
  { name: "Mild", value: 4.4, color: "hsl(25, 95%, 53%)" },
  { name: "Moderate", value: 87.3, color: "hsl(0, 84%, 60%)" },
];

const indicators = [
  { name: "Hippocampal Atrophy", level: 85, severity: "High" },
  { name: "Cortical Thinning", level: 60, severity: "Moderate" },
  { name: "Ventricular Enlargement", level: 80, severity: "High" },
  { name: "White Matter Changes", level: 35, severity: "Mild" },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function UploadAnalyzePage() {
  const [step, setStep] = useState<"upload" | "uploading" | "analyzing" | "results">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { user } = useAuth();

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setUploadError(null);
    setUploadSuccess(false);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleUpload = async () => {
    if (!file || !user) return;
    setUploadError(null);
    setUploadSuccess(false);
    setStep("uploading");
    setProgress(0);

    try {
      const timestamp = Date.now();
      const filePath = `${user.id}/${timestamp}_${file.name}`;

      // Simulate upload progress (Supabase JS doesn't expose progress natively)
      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 15, 90));
      }, 200);

      const { error: storageError } = await supabase.storage
        .from("mri-scans")
        .upload(filePath, file);

      clearInterval(progressInterval);

      if (storageError) throw storageError;

      setProgress(95);

      const { error: dbError } = await supabase.from("scans").insert({
        user_id: user.id,
        image_path: filePath,
        status: "pending",
      });

      if (dbError) throw dbError;

      setProgress(100);
      setUploadSuccess(true);
      setStep("upload");
    } catch (err: any) {
      setUploadError(err.message || "Upload failed");
      setStep("upload");
    }
  };

  const startAnalysis = () => {
    setStep("analyzing");
    setProgress(0);
    setCurrentStage(0);
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 3 + 1;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => setStep("results"), 500);
      }
      setProgress(Math.min(p, 100));
      setCurrentStage(Math.min(Math.floor(p / 20), 4));
    }, 100);
  };

  return (
    <>
      <div className="max-w-4xl mx-auto relative">
      <AnimatePresence mode="wait">
        {step === "upload" && (
          <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <motion.h1
              initial={{ opacity: 0, filter: "blur(8px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              className="text-2xl font-heading font-bold text-foreground mb-2"
            >
              Upload & Analyze MRI Scan
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mb-8"
            >
              Upload a brain MRI scan for AI-powered analysis
            </motion.p>

            {/* Upload Area */}
            <motion.div
              whileHover={!file ? { scale: 1.01, borderColor: "hsl(174, 84%, 32%)" } : {}}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !file && document.getElementById("file-input")?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
                dragOver ? "border-accent bg-accent/5 scale-[1.02]" : file ? "border-success bg-success/5" : "border-border hover:border-accent/50 hover:bg-muted/50"
              }`}
            >
              <input id="file-input" type="file" accept="image/*,.dcm" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              {file && preview ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <img src={preview} alt="MRI Preview" className="max-h-64 mx-auto rounded-xl shadow-md" />
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <span className="text-foreground font-medium">{file.name}</span>
                    <span className="text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    <motion.button
                      onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-destructive hover:underline flex items-center gap-1"
                    >
                      <X className="h-4 w-4" /> Remove
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <>
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  </motion.div>
                  <p className="text-foreground font-medium mb-1">Drag & drop your MRI scan here</p>
                  <p className="text-muted-foreground text-sm mb-2">or click to browse</p>
                  <p className="text-muted-foreground/60 text-xs">Supported: JPG, PNG, DICOM • Max: 10MB</p>
                </>
              )}
            </motion.div>

            {/* Status Messages */}
            {uploadError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
              >
                {uploadError}
              </motion.div>
            )}
            {uploadSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 rounded-xl bg-success/10 border border-success/20 text-success text-sm flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Scan submitted, analysis pending
              </motion.div>
            )}

            {/* Upload Progress */}
            {step === "uploading" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full gradient-hero rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2 text-center">Uploading... {Math.round(progress)}%</p>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <motion.button
                whileHover={file && step !== "uploading" ? { scale: 1.02, boxShadow: "0 15px 30px hsla(217, 91%, 60%, 0.25)" } : {}}
                whileTap={file && step !== "uploading" ? { scale: 0.98 } : {}}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                disabled={!file || step === "uploading"}
                onClick={handleUpload}
                className={`btn-medical flex-1 text-base ${file && step !== "uploading" ? "gradient-hero text-primary-foreground shadow-lg" : "bg-muted text-muted-foreground cursor-not-allowed"}`}
              >
                {step === "uploading" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                {step === "uploading" ? "Uploading..." : "Upload Scan"}
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === "analyzing" && (
          <motion.div key="analyzing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="text-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-8"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Brain className="h-20 w-20 text-accent" />
              </motion.div>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, filter: "blur(8px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              className="text-2xl font-heading font-bold text-foreground mb-4"
            >
              Analyzing your MRI scan...
            </motion.h2>
            
            {/* Progress Bar */}
            <div className="max-w-md mx-auto mb-8">
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full gradient-hero rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="mono text-sm text-muted-foreground mt-2">{Math.round(progress)}%</p>
            </div>

            {/* Stage Indicators */}
            <div className="max-w-sm mx-auto space-y-3 text-left">
              {analysisStages.map((stage, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 text-sm"
                >
                  {i < currentStage ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    </motion.div>
                  ) : i === currentStage ? (
                    <Loader2 className="h-5 w-5 text-accent animate-spin flex-shrink-0" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-border flex-shrink-0" />
                  )}
                  <span className={i <= currentStage ? "text-foreground" : "text-muted-foreground"}>{stage}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {step === "results" && (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Notice Banner */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 bg-warning/10 border border-warning/20 rounded-xl text-sm"
            >
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
              <p className="text-foreground">This is not a clinical diagnosis. Please consult a medical professional for definitive results.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-between"
            >
              <div>
                <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
                  <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300 }}>
                    <CheckCircle className="h-6 w-6 text-success" />
                  </motion.div>
                  Analysis Complete
                </h1>
                <p className="text-muted-foreground text-sm mono mt-1">March 8, 2026 at 10:42 AM</p>
              </div>
              <div className="flex gap-2">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-medical border border-border bg-white/10 text-foreground text-sm px-4 py-2">
                  <Download className="h-4 w-4" /> PDF
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-medical border border-border bg-white/10 text-foreground text-sm px-4 py-2">
                  <Share2 className="h-4 w-4" /> Share
                </motion.button>
              </div>
            </motion.div>

            {/* Result Overview Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="bg-destructive/10 border border-destructive/20 rounded-2xl p-8"
            >
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-20 w-20 rounded-2xl bg-destructive flex items-center justify-center"
                >
                  <Brain className="h-10 w-10 text-destructive-foreground" />
                </motion.div>
                <div className="text-center sm:text-left">
                  <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-destructive text-destructive-foreground font-bold text-lg mb-2">
                    MODERATE DEMENTED
                  </div>
                  <p className="text-foreground/80">Significant cognitive impairment detected</p>
                  <div className="flex items-center gap-4 mt-2">
                    <motion.span
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                      className="mono text-3xl font-bold text-foreground"
                    >
                      87.3%
                    </motion.span>
                    <span className="text-sm text-muted-foreground">confidence score</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Detailed Analysis Grid */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid md:grid-cols-2 gap-6"
            >
              {/* Class Probabilities */}
              <motion.div variants={staggerItem} className="card-medical">
                <h3 className="font-heading font-semibold text-foreground mb-4">Class Probabilities</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={resultData} layout="vertical">
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(val: number) => `${val}%`} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} animationDuration={1200}>
                      {resultData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Clinical Indicators */}
              <motion.div variants={staggerItem} className="card-medical">
                <h3 className="font-heading font-semibold text-foreground mb-4">Clinical Indicators</h3>
                <div className="space-y-4">
                  {indicators.map((ind, i) => (
                    <div key={ind.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground">{ind.name}</span>
                        <span className={`font-medium ${ind.level > 70 ? "text-destructive" : ind.level > 50 ? "text-warning" : "text-success"}`}>{ind.severity}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${ind.level}%` }}
                          transition={{ duration: 1, delay: 0.5 + i * 0.15, ease: "easeOut" }}
                          className={`h-full rounded-full ${ind.level > 70 ? "bg-destructive" : ind.level > 50 ? "bg-warning" : "bg-success"}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Grad-CAM Visualization */}
              <motion.div variants={staggerItem} className="card-medical">
                <h3 className="font-heading font-semibold text-foreground mb-4">Grad-CAM Visualization</h3>
                {preview ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Original</p>
                      <motion.img
                        src={preview}
                        alt="Original MRI"
                        className="rounded-xl w-full aspect-square object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Heatmap Overlay</p>
                      <motion.div
                        className="relative rounded-xl w-full aspect-square overflow-hidden"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      >
                        <img src={preview} alt="Heatmap" className="w-full h-full object-cover" />
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 1, delay: 0.8 }}
                          className="absolute inset-0 bg-gradient-to-br from-destructive/40 via-warning/30 to-transparent mix-blend-multiply"
                        />
                      </motion.div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted rounded-xl p-8 text-center text-muted-foreground text-sm">No image available</div>
                )}
                <p className="text-xs text-muted-foreground mt-3">Red areas indicate regions most influential in diagnosis</p>
              </motion.div>

              {/* Recommendations */}
              <motion.div variants={staggerItem} className="card-medical">
                <h3 className="font-heading font-semibold text-foreground mb-4">Recommended Actions</h3>
                <div className="space-y-3">
                  {[
                    { emoji: "🩺", text: "Consult a neurologist within 2 weeks" },
                    { emoji: "📋", text: "Get comprehensive cognitive assessment" },
                    { emoji: "🧪", text: "Consider additional tests (blood work, PET scan)" },
                    { emoji: "📝", text: "Start maintaining symptom diary" },
                  ].map((rec, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      whileHover={{ x: 5, backgroundColor: "hsl(var(--accent) / 0.05)" }}
                      className="flex items-start gap-3 p-3 bg-muted rounded-xl text-sm transition-colors"
                    >
                      <span className="text-lg">{rec.emoji}</span>
                      <span className="text-foreground">{rec.text}</span>
                    </motion.div>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 25px hsla(217, 91%, 60%, 0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-medical gradient-hero text-primary-foreground text-sm w-full mt-4"
                >
                  Find Specialists Near You
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-3"
            >
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-medical gradient-hero text-primary-foreground text-sm">
                <Mail className="h-4 w-4" /> Email to Doctor
              </motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-medical border border-border bg-white/10 text-foreground text-sm">
                <Download className="h-4 w-4" /> Download PDF
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setStep("upload"); setFile(null); setPreview(null); }}
                className="btn-medical border border-border bg-white/10 text-foreground text-sm"
              >
                <Upload className="h-4 w-4" /> New Scan
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </>
  );
}
