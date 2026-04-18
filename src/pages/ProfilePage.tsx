import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, MapPin, Heart, Pill, AlertTriangle, Camera, Save, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

const tabs = ["Personal Info", "Medical History", "Account Settings"];

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("Personal Info");
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "Male",
    phone: "",
    address: "",
    bloodGroup: "O+",
    medicalHistory: "",
    medications: "",
    allergies: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const email = user?.email || "";
  const avatarUrl = profile?.avatar_url || null;
  const initials = (formData.name || email.split("@")[0] || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        name: profile.full_name || "",
      }));
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    await supabase
      .from("profiles")
      .update({ full_name: formData.name, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setAvatarUploading(true);

    const ext = file.name.split(".").pop() || "png";
    const filePath = `${user.id}/avatar.${ext}`;

    await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    await refreshProfile();
    setAvatarUploading(false);
  };

  return (
    <>
      <div className="max-w-4xl mx-auto relative">
      <motion.h1
        initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        className="text-2xl font-heading font-bold text-foreground mb-6"
      >
        My Profile
      </motion.h1>

      <div className="grid md:grid-cols-[280px,1fr] gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="card-medical text-center sticky top-24 self-start"
        >
          <div className="relative mx-auto w-24 h-24 mb-4 group">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full gradient-hero flex items-center justify-center text-primary-foreground text-3xl font-bold">
                {initials}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            <motion.button
              onClick={() => fileInputRef.current?.click()}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              disabled={avatarUploading}
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-md opacity-80 group-hover:opacity-100 transition-opacity"
            >
              {avatarUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            </motion.button>
          </div>
          <h2 className="font-heading font-semibold text-foreground">{formData.name || email.split("@")[0]}</h2>
          <p className="text-sm text-muted-foreground">{email}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—"}
          </p>

          <div className="mt-4 pt-4 border-t border-border text-left space-y-2 text-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Account Type</span><span className="font-semibold text-foreground">Free</span>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex gap-1 mb-6 bg-muted rounded-xl p-1">
            {tabs.map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? "bg-white/10 shadow-sm text-foreground" : "text-muted-foreground"}`}
              >
                {tab}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "Personal Info" && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {saved && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3 rounded-xl bg-success/10 border border-success/20 text-success text-sm flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Profile saved successfully
                  </motion.div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <input className="input-medical pl-10" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <input className="input-medical pl-10 bg-muted/50 cursor-not-allowed" value={email} readOnly />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Date of Birth</label>
                    <input type="date" className="input-medical" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Gender</label>
                    <select className="input-medical" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                      <option>Male</option><option>Female</option><option>Other</option><option>Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <input className="input-medical pl-10" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Blood Group</label>
                    <select className="input-medical" value={formData.bloodGroup} onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}>
                      <option>O+</option><option>O-</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <textarea className="input-medical pl-10 min-h-[80px]" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Enter your address" />
                  </div>
                </div>

                <h3 className="font-heading font-semibold text-foreground pt-4">Medical Information</h3>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Medical History</label>
                  <textarea className="input-medical min-h-[80px]" value={formData.medicalHistory} onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })} placeholder="Any relevant medical history..." />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 flex items-center gap-1"><Pill className="h-3.5 w-3.5" /> Medications</label>
                    <input className="input-medical" value={formData.medications} onChange={(e) => setFormData({ ...formData, medications: e.target.value })} placeholder="Current medications..." />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Allergies</label>
                    <input className="input-medical" value={formData.allergies} onChange={(e) => setFormData({ ...formData, allergies: e.target.value })} placeholder="Known allergies..." />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <motion.button
                    onClick={handleSave}
                    disabled={saving}
                    whileHover={!saving ? { scale: 1.02, boxShadow: "0 10px 25px hsla(217, 91%, 60%, 0.2)" } : {}}
                    whileTap={!saving ? { scale: 0.98 } : {}}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="btn-medical gradient-hero text-primary-foreground text-sm disabled:opacity-70"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {saving ? "Saving..." : "Save Changes"}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {activeTab === "Medical History" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <p className="text-muted-foreground text-sm">Your scan history and medical records appear here.</p>
                <div className="card-medical text-center py-12">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  </motion.div>
                  <p className="text-muted-foreground">No medical records added yet</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-medical gradient-hero text-primary-foreground text-sm mt-4"
                  >
                    Add Record
                  </motion.button>
                </div>
              </motion.div>
            )}

            {activeTab === "Account Settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="card-medical">
                  <h3 className="font-heading font-semibold text-foreground mb-4">Change Password</h3>
                  <div className="space-y-3 max-w-sm">
                    <input className="input-medical" type="password" placeholder="Current password" />
                    <input className="input-medical" type="password" placeholder="New password" />
                    <input className="input-medical" type="password" placeholder="Confirm new password" />
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-medical gradient-hero text-primary-foreground text-sm">Update Password</motion.button>
                  </div>
                </div>

                <div className="card-medical">
                  <h3 className="font-heading font-semibold text-foreground mb-4">Email Preferences</h3>
                  <div className="space-y-3">
                    {["Scan results notifications", "Educational updates", "Promotional emails"].map((pref) => (
                      <motion.label key={pref} whileHover={{ x: 3 }} className="flex items-center gap-3 text-sm cursor-pointer">
                        <input type="checkbox" defaultChecked className="accent-accent" />
                        <span className="text-foreground">{pref}</span>
                      </motion.label>
                    ))}
                  </div>
                </div>

                <motion.div
                  whileHover={{ borderColor: "hsl(0, 84%, 60%)" }}
                  className="card-medical border-destructive/20 transition-colors"
                >
                  <h3 className="font-heading font-semibold text-destructive mb-2">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back.</p>
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 25px hsla(0, 63%, 50%, 0.2)" }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-medical bg-destructive text-destructive-foreground text-sm"
                  >
                    Delete Account
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      </div>
    </>
  );
}
