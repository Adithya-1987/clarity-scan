import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, CheckCircle, AlertTriangle, XCircle, AlertOctagon,
  Activity, Brain, Heart, Moon, Users, Smile, Dumbbell, Apple,
  Puzzle, BedDouble, HandshakeIcon, Flower2, ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";


const tabs = ["Overview", "Stages", "Symptoms", "Risk Factors", "Prevention", "Treatment"];

const stages = [
  {
    title: "Non-Demented",
    subtitle: "No Cognitive Decline",
    icon: CheckCircle,
    color: "bg-success",
    borderColor: "border-success/30",
    bgColor: "bg-success/5",
    description: "Normal cognitive function with no memory problems detected.",
    characteristics: ["Intact memory function", "Normal daily activities", "No symptoms present"],
    action: "Maintain healthy lifestyle and regular check-ups",
    prevalence: "65% of adults over 65",
  },
  {
    title: "Very Mild Demented",
    subtitle: "Mild Cognitive Impairment",
    icon: AlertTriangle,
    color: "bg-warning",
    borderColor: "border-warning/30",
    bgColor: "bg-warning/5",
    description: "Subtle changes in memory and thinking that may go unnoticed.",
    characteristics: ["Occasional memory lapses", "Difficulty with complex tasks", "Mild word-finding problems"],
    action: "Cognitive screening tests and lifestyle modifications",
    prevalence: "15-20% of adults over 65",
  },
  {
    title: "Mild Demented",
    subtitle: "Mild Alzheimer's Disease",
    icon: XCircle,
    color: "bg-warning",
    borderColor: "border-warning/30",
    bgColor: "bg-warning/5",
    description: "Noticeable symptoms affecting daily life and relationships.",
    characteristics: ["Clear memory problems", "Confusion about location/time", "Difficulty with finances", "Personality changes"],
    action: "Establish care plan and begin treatment options",
    prevalence: "Average duration: 2-4 years",
  },
  {
    title: "Moderate Demented",
    subtitle: "Moderate to Severe AD",
    icon: AlertOctagon,
    color: "bg-destructive",
    borderColor: "border-destructive/30",
    bgColor: "bg-destructive/5",
    description: "Significant impairment requiring full-time assistance.",
    characteristics: ["Severe memory loss", "Cannot recognize family", "Need help with daily activities", "Behavioral changes"],
    action: "Full-time care consideration and safety measures",
    prevalence: "Duration: 2-10 years",
  },
];

const warningSigns = [
  "Memory loss disrupting daily life",
  "Challenges in planning or solving problems",
  "Difficulty completing familiar tasks",
  "Confusion with time or place",
  "Trouble understanding visual images",
  "New problems with words in speaking/writing",
  "Misplacing things and losing ability to retrace steps",
  "Decreased or poor judgment",
  "Withdrawal from work or social activities",
  "Changes in mood and personality",
];

const preventionPillars = [
  { icon: Dumbbell, title: "Regular Exercise", desc: "150 minutes/week of moderate activity boosts brain health" },
  { icon: Apple, title: "Healthy Diet", desc: "Mediterranean & MIND diets reduce cognitive decline risk" },
  { icon: Puzzle, title: "Mental Stimulation", desc: "Puzzles, learning, and new skills strengthen neural pathways" },
  { icon: BedDouble, title: "Quality Sleep", desc: "7-9 hours of restorative sleep clears brain toxins" },
  { icon: Users, title: "Social Connection", desc: "Active social engagement protects against cognitive decline" },
  { icon: Flower2, title: "Stress Management", desc: "Meditation and mindfulness reduce cortisol brain damage" },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 glass shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/home"><Logo size="sm" /></Link>
        <div className="hidden md:flex items-center gap-6">
          {[
            { to: "/home", label: "Home" },
            { to: "/about", label: "About Alzheimer's", active: true },
            { to: "/dashboard", label: "Dashboard" },
          ].map((link) => (
            <motion.div key={link.label} whileHover={{ y: -1 }} className="relative">
              <Link to={link.to} className={`text-sm font-medium transition-colors ${link.active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {link.label}
              </Link>
            </motion.div>
          ))}
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link to="/dashboard/upload" className="btn-medical gradient-hero text-primary-foreground text-sm px-4 py-2">Upload Scan</Link>
        </motion.div>
      </div>
    </nav>
  );
}

export default function AboutAlzheimersPage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [expandedStage, setExpandedStage] = useState<number | null>(null);
  const [checkedSigns, setCheckedSigns] = useState<boolean[]>(new Array(10).fill(false));
  const checkedCount = checkedSigns.filter(Boolean).length;

  const toggleSign = (i: number) => {
    const next = [...checkedSigns];
    next[i] = !next[i];
    setCheckedSigns(next);
  };

  return (
    <>
      <div className="min-h-screen relative">
      <Navbar />

      {/* Hero */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl font-heading font-bold text-primary-foreground mb-4"
          >
            Understanding Alzheimer's Disease
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-primary-foreground/80 text-lg max-w-2xl mx-auto"
          >
            Evidence-based information for patients, caregivers, and families
          </motion.p>
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-16 z-40 bg-black/40 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto gap-1 py-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab ? "gradient-hero text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {tab}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
        {/* Overview */}
        {activeTab === "Overview" && (
          <motion.div key="overview" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="card-medical max-w-3xl mx-auto"
            >
              <div className="flex items-start gap-4">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="h-12 w-12 rounded-xl gradient-hero flex items-center justify-center flex-shrink-0"
                >
                  <Brain className="h-6 w-6 text-primary-foreground" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-heading font-bold text-foreground mb-2">What is Alzheimer's Disease?</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Alzheimer's disease is a progressive neurological disorder that causes the brain to shrink (atrophy) and brain cells to die. 
                    It is the most common cause of dementia — a continuous decline in thinking, behavioral and social skills that affects a person's ability to function independently.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid sm:grid-cols-3 gap-6"
            >
              {[
                { value: "50M+", label: "People worldwide affected", icon: Users },
                { value: "Every 3s", label: "Someone develops dementia", icon: Activity },
                { value: "#6", label: "Leading cause of death", icon: Heart },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={staggerItem}
                  whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
                  className="card-medical text-center"
                >
                  <motion.div whileHover={{ scale: 1.2, rotate: 10 }} transition={{ type: "spring" }}>
                    <stat.icon className="h-8 w-8 text-accent mx-auto mb-3" />
                  </motion.div>
                  <p className="text-3xl font-heading font-bold text-foreground mono">{stat.value}</p>
                  <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>

            <div className="card-medical">
              <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Frequently Asked Questions</h3>
              <div className="space-y-3">
                {[
                  { q: "How accurate is this AI model?", a: "Our ensemble model achieves 75% overall accuracy with 100% precision for moderate cases." },
                  { q: "Can I use this instead of seeing a doctor?", a: "No. This is a screening tool only. Always consult a medical professional for diagnosis." },
                  { q: "What types of MRI scans are supported?", a: "We support T1, T2, and FLAIR MRI scans in JPG, PNG, and DICOM formats." },
                  { q: "Is my data secure and private?", a: "Yes. All data is encrypted and stored securely. We follow HIPAA compliance standards." },
                ].map((faq, i) => (
                  <motion.details
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group"
                  >
                    <summary className="flex items-center justify-between p-3 rounded-xl hover:bg-muted cursor-pointer text-sm font-medium text-foreground transition-colors">
                      {faq.q}
                      <ChevronDown className="h-4 w-4 text-muted-foreground group-open:rotate-180 transition-transform duration-300" />
                    </summary>
                    <p className="px-3 pb-3 text-sm text-muted-foreground">{faq.a}</p>
                  </motion.details>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Stages */}
        {activeTab === "Stages" && (
          <motion.div key="stages" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Four Stages of Alzheimer's Disease</h2>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid sm:grid-cols-2 gap-6"
            >
              {stages.map((stage, i) => (
                <motion.div
                  key={i}
                  variants={staggerItem}
                  whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
                  className={`rounded-2xl border ${stage.borderColor} ${stage.bgColor} overflow-hidden cursor-pointer transition-all`}
                  onClick={() => setExpandedStage(expandedStage === i ? null : i)}
                >
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className={`h-10 w-10 rounded-xl ${stage.color} flex items-center justify-center`}
                      >
                        <stage.icon className="h-5 w-5 text-primary-foreground" />
                      </motion.div>
                      <div>
                        <h3 className="font-heading font-semibold text-foreground">{stage.title}</h3>
                        <p className="text-xs text-muted-foreground">{stage.subtitle}</p>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/80 mb-3">{stage.description}</p>
                    <AnimatePresence>
                      {expandedStage === i && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-3 overflow-hidden"
                        >
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Characteristics</p>
                            <ul className="space-y-1">
                              {stage.characteristics.map((c, j) => (
                                <motion.li
                                  key={j}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: j * 0.05 }}
                                  className="text-sm text-foreground/80 flex items-center gap-2"
                                >
                                  <div className={`h-1.5 w-1.5 rounded-full ${stage.color}`} />
                                  {c}
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                          <div className="p-3 bg-white/5 rounded-xl text-sm">
                            <p className="font-medium text-foreground mb-1">What to do:</p>
                            <p className="text-muted-foreground">{stage.action}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mono">{stage.prevalence}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <button className="text-accent text-xs font-medium mt-2">
                      {expandedStage === i ? "Show less" : "Learn more →"}
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Symptoms */}
        {activeTab === "Symptoms" && (
          <motion.div key="symptoms" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-8">
            <div>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-2">10 Early Warning Signs</h2>
              <p className="text-muted-foreground">Check any signs you or a loved one may be experiencing</p>
            </div>

            <AnimatePresence>
              {checkedCount >= 3 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-warning/10 border border-warning/20 rounded-xl flex items-center gap-3 text-sm"
                >
                  <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
                  <p className="text-foreground">You checked {checkedCount}/10 items. Consider scheduling a cognitive screening with your doctor.</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              {warningSigns.map((sign, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => toggleSign(i)}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.99 }}
                  className={`card-medical cursor-pointer flex items-center gap-4 !p-4 transition-colors ${checkedSigns[i] ? "border-accent/50 bg-accent/5" : ""}`}
                >
                  <motion.div
                    animate={checkedSigns[i] ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    className={`h-6 w-6 rounded-md border-2 flex items-center justify-center transition-all ${checkedSigns[i] ? "bg-accent border-accent" : "border-border"}`}
                  >
                    {checkedSigns[i] && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
                        <CheckCircle className="h-4 w-4 text-accent-foreground" />
                      </motion.div>
                    )}
                  </motion.div>
                  <span className="text-sm text-foreground">{i + 1}. {sign}</span>
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <motion.p
                key={checkedCount}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="mono text-lg font-semibold text-foreground"
              >
                You checked {checkedCount}/10 items
              </motion.p>
            </div>
          </motion.div>
        )}

        {/* Risk Factors */}
        {activeTab === "Risk Factors" && (
          <motion.div key="risk" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-8">
            <h2 className="text-2xl font-heading font-bold text-foreground">Understanding Risk Factors</h2>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[
                { title: "Age", desc: "Greatest known risk factor. Risk doubles every 5 years after 65.", modifiable: false },
                { title: "Genetics", desc: "APOE-e4 gene variant increases risk 3-12x depending on copies.", modifiable: false },
                { title: "Family History", desc: "First-degree relative with AD increases risk by 10-30%.", modifiable: false },
                { title: "Heart Health", desc: "High blood pressure, diabetes, and high cholesterol increase risk.", modifiable: true },
                { title: "Head Injury", desc: "Traumatic brain injury linked to higher dementia risk.", modifiable: true },
                { title: "Lifestyle", desc: "Physical inactivity, poor diet, and smoking contribute to risk.", modifiable: true },
              ].map((factor) => (
                <motion.div
                  key={factor.title}
                  variants={staggerItem}
                  whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
                  className="card-medical"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-heading font-semibold text-foreground">{factor.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${factor.modifiable ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                      {factor.modifiable ? "Modifiable" : "Non-modifiable"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{factor.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Prevention */}
        {activeTab === "Prevention" && (
          <motion.div key="prevention" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-8">
            <h2 className="text-2xl font-heading font-bold text-foreground">6 Pillars of Brain Health</h2>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {preventionPillars.map((pillar) => (
                <motion.div
                  key={pillar.title}
                  variants={staggerItem}
                  whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}
                  className="card-medical group"
                >
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="h-12 w-12 rounded-xl gradient-hero flex items-center justify-center mb-4"
                  >
                    <pillar.icon className="h-6 w-6 text-primary-foreground" />
                  </motion.div>
                  <h3 className="font-heading font-semibold text-foreground mb-2 transition-colors group-hover:text-accent">{pillar.title}</h3>
                  <p className="text-sm text-muted-foreground">{pillar.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Treatment */}
        {activeTab === "Treatment" && (
          <motion.div key="treatment" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-8">
            <h2 className="text-2xl font-heading font-bold text-foreground">Treatment Options</h2>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid sm:grid-cols-2 gap-6"
            >
              {[
                { title: "Cholinesterase Inhibitors", desc: "Donepezil, Rivastigmine, Galantamine — for early to moderate stages", stage: "Early Stage" },
                { title: "Memantine (Namenda)", desc: "For moderate-to-severe AD, regulates glutamate activity", stage: "Moderate-Severe" },
                { title: "Lecanemab", desc: "FDA-approved anti-amyloid antibody therapy showing 27% slowing of decline", stage: "Early Stage" },
                { title: "Cognitive Training", desc: "Structured mental exercises to maintain cognitive function", stage: "All Stages" },
                { title: "Lifestyle Interventions", desc: "Exercise, diet, sleep optimization, and social engagement", stage: "Prevention & All" },
                { title: "Caregiver Support", desc: "Resources, respite care, and behavioral management strategies", stage: "All Stages" },
              ].map((treatment) => (
                <motion.div
                  key={treatment.title}
                  variants={staggerItem}
                  whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
                  className="card-medical"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-heading font-semibold text-foreground">{treatment.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">{treatment.stage}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{treatment.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
      </div>
    </>
  );
}
