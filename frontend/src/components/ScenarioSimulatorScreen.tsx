import { useState, useEffect } from "react";
import { 
  Calculator, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles, 
  ArrowRight 
} from "lucide-react";
import { Slider } from "./ui/slider";
import { 
 LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { useApplicantData } from "../hooks/useApplicantData";
import { 
  getSafeLoanAmount, 
  getReadinessScore 
} from "../utils/financialMetrics";
import { motion, AnimatePresence } from "framer-motion";

interface LoanSuggestion {
  title: string;
  rate: string;
  term: string;
  reason: string;
  link?: string;
}

interface ScreenProps {
  onNavigate?: (screen: string) => void;
}

export function ScenarioSimulatorScreen({ onNavigate }: ScreenProps) {
  const { applicant, loading } = useApplicantData();

  // --- STATE ---
  const [loanAmount, setLoanAmount] = useState([15000]);
  const [interestRate, setInterestRate] = useState([7.5]);
  const [loanTerm, setLoanTerm] = useState([36]);
  const [loanType, setLoanType] = useState<"Car" | "Mortgage" | "Student">("Car");
  const [suggestions, setSuggestions] = useState<LoanSuggestion[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync initial loan amount with applicant's safe limit when data arrives
  useEffect(() => {
    if (applicant) {
      const safeAmount = getSafeLoanAmount(applicant);
      setLoanAmount([Math.max(1000, Math.min(50000, safeAmount))]);
    }
  }, [applicant]);

  // Loading States
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-blue-600 font-bold"
          >
            Loading simulator data...
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-red-500">No applicant data available. Please login.</div>
      </div>
    );
  }

  // --- CALCULATIONS (FIXED MATH) ---
  const monthlyIncome = applicant.income;
  const readinessScore = getReadinessScore(applicant); 

  const r = interestRate[0] / 100 / 12;
  const n = loanTerm[0];
  
  const monthlyPayment = r === 0 
    ? loanAmount[0] / n 
    : (loanAmount[0] * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  // Use Debt-to-Income (DTI) ratio for the sliders to be responsive
  // A payment under 15% of total income is generally considered "Safe"
  const paymentToIncomeRatio = (monthlyPayment / monthlyIncome) * 100;
  
  const isAffordable = paymentToIncomeRatio < 15;
  const riskLevel = paymentToIncomeRatio < 10 ? "low" : paymentToIncomeRatio < 20 ? "medium" : "high";

  // --- AI LOGIC ---
  const getAiSuggestions = async () => {
    setIsAiLoading(true);
    setSuggestions([]); 
    
    try {
      const response = await fetch('http://localhost:5001/api/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          income: monthlyIncome, 
          score: readinessScore,
          loanType: loanType 
        })
      });
      
      const data = await response.json();
      if (Array.isArray(data)) {
        setSuggestions(data);
      } else {
        throw new Error("Invalid format");
      }
    } catch (error: any) {
      console.error("AI Fetch Error:", error);
      setSuggestions([{
        title: "Service Busy",
        rate: "N/A",
        term: "N/A",
        reason: "The AI advisor is currently handling high volume. Please try again.",
        link: "#"
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const generateSchedule = () => {
    const schedule = [];
    const interval = Math.max(1, Math.floor(n / 10));
    for (let month = 0; month <= n; month += interval) {
      const factor = r === 0 ? 1 : Math.pow(1 + r, month);
      const balance = r === 0 
        ? loanAmount[0] - (monthlyPayment * month)
        : loanAmount[0] * (Math.pow(1 + r, n) - factor) / (Math.pow(1 + r, n) - 1);
      schedule.push({ month: month, balance: Math.max(0, balance) });
    }
    return schedule;
  };

  const riskColors = {
    low: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", gradient: "from-green-100 to-emerald-100" },
    medium: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200", gradient: "from-yellow-100 to-amber-100" },
    high: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200", gradient: "from-red-100 to-rose-100" }
  }[riskLevel];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-teal-50/30 pb-20">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-blue-600 via-blue-600 to-teal-500 px-6 pt-12 pb-10 rounded-b-[40px] shadow-xl"
      >
        <h1 className="text-3xl text-white tracking-tight">Loan Simulator</h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-blue-100 opacity-90"
        >
          Simulating options for your {readinessScore}/100 score
        </motion.p>
      </motion.div>

      {/* Payment Display */}
      <div className="px-6 -mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 hover:shadow-3xl transition-shadow duration-300"
        >
          <div className="text-center mb-6">
            <h2 className="text-xs text-gray-400 mb-1 font-bold uppercase tracking-wider">Estimated Monthly Payment</h2>
            <motion.p 
              key={monthlyPayment.toFixed(0)}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, type: "spring" }}
              className="text-5xl text-gray-900"
            >
              ${monthlyPayment.toFixed(0)}
            </motion.p>
          </div>
          <motion.div 
            layout
            className={`bg-gradient-to-br ${riskColors.gradient} ${riskColors.border} border-2 rounded-2xl p-4 flex items-center justify-center gap-3`}
          >
            <motion.div
              key={isAffordable ? "check" : "alert"}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.3, type: "spring" }}
            >
              {isAffordable ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
              )}
            </motion.div>
            <p className={`text-sm font-bold ${riskColors.text}`}>
              {isAffordable ? "Within Recommended Budget" : "Exceeds Safe Budget Limits"}
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Type Selector */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="px-6 mt-10"
      >
        <div className="flex gap-2 bg-gray-200/50 p-1.5 rounded-2xl backdrop-blur-sm">
          {(["Car", "Mortgage", "Student"] as const).map((type, index) => (
            <motion.button
              key={type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setLoanType(type); setSuggestions([]); }}
              className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all ${
                loanType === type ? 'bg-white text-blue-600 shadow-lg' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {type}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Sliders */}
      <div className="px-6 mt-8 space-y-5">
        {[ 
          { label: "Loan Amount", val: loanAmount, set: setLoanAmount, min: 1000, max: 100000, step: 1000, unit: "$" },
          { label: "Interest Rate", val: interestRate, set: setInterestRate, min: 1, max: 25, step: 0.1, unit: "%" },
          { label: "Loan Term", val: loanTerm, set: setLoanTerm, min: 6, max: 72, step: 6, unit: "mo" }
        ].map((s, index) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{s.label}</label>
              <motion.span 
                key={s.val[0]}
                initial={{ scale: 1.1, color: "#3b82f6" }}
                animate={{ scale: 1, color: "#3b82f6" }}
                transition={{ duration: 0.2 }}
                className="text-xl text-blue-600 font-bold"
              >
                {s.unit === "$" ? `$${s.val[0].toLocaleString()}` : `${s.val[0]}${s.unit}`}
              </motion.span>
            </div>
            <Slider value={s.val} onValueChange={s.set} min={s.min} max={s.max} step={s.step} />
          </motion.div>
        ))}
      </div>

      {/* AI Suggestions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="px-6 mt-12"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div 
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatDelay: 3
              }}
              className="bg-gradient-to-br from-blue-100 to-purple-100 p-2 rounded-xl shadow-sm"
            >
              <Sparkles className="w-5 h-5 text-blue-600" />
            </motion.div>
            <h2 className="text-2xl text-gray-900">AI Lending Advice</h2>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={getAiSuggestions}
            disabled={isAiLoading}
            className="text-xs bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 hover:shadow-xl hover:from-blue-700 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-400 transition-all duration-300"
          >
            {isAiLoading ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  ⚡
                </motion.span>
                Consulting...
              </span>
            ) : (
              "Get AI Matches"
            )}
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {isAiLoading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white border border-blue-100 rounded-[32px] p-8 shadow-lg"
                >
                  <motion.div
                    animate={{ 
                      backgroundPosition: ["0% 0%", "100% 100%"],
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg mb-4"
                    style={{ backgroundSize: "200% 200%" }}
                  />
                  <div className="h-4 bg-gray-100 rounded-lg mb-6 w-1/2" />
                  <div className="h-20 bg-gray-50 rounded-2xl mb-6" />
                  <div className="h-12 bg-gray-100 rounded-2xl" />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {suggestions.map((loan, idx) => (
                <motion.div
                  key={`${idx}-${loan.title}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="group relative bg-white border border-blue-100 hover:border-blue-400 rounded-[32px] p-8 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col"
                >
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: idx * 0.1 + 0.2, duration: 0.5 }}
                    className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 via-teal-400 to-blue-400 rounded-t-[32px]"
                    style={{ transformOrigin: "left" }}
                  />
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-gray-900 text-xl leading-tight">{loan.title}</h4>
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className="bg-gradient-to-br from-blue-50 to-blue-100 px-3 py-1 rounded-full"
                      >
                        <span className="text-blue-600 font-bold text-xs">{loan.rate}</span>
                      </motion.div>
                    </div>
                    <div className="flex items-center gap-2 mb-6 text-gray-400 text-xs font-bold uppercase">
                      <TrendingUp className="w-4 h-4 text-teal-500" />
                      <span>{loan.term}</span>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-4 rounded-2xl border border-gray-100 mb-6">
                      <p className="text-sm text-gray-600 italic">"{loan.reason}"</p>
                    </div>
                  </div>
                  {loan.link && (
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href={loan.link}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl text-sm font-bold hover:from-blue-700 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Check Eligibility <ArrowRight className="w-4 h-4" />
                    </motion.a>
                  )}
                </motion.div>
              ))}
              {suggestions.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-16 border-4 border-dashed border-gray-200 rounded-[40px] flex flex-col items-center justify-center"
                >
                  <motion.div
                    animate={{ 
                      opacity: [0.1, 0.2, 0.1],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Calculator className="w-16 h-16 mb-4 text-gray-300" />
                  </motion.div>
                  <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Tap "Get AI Matches" for local NC options</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Chart Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="px-6 mt-12"
      >
        <motion.div 
          whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
          className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <h2 className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest">Repayment Trajectory</h2>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={generateSchedule()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                  formatter={(v: any) => [`$${Math.round(v).toLocaleString()}`, 'Balance']} 
                />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="url(#colorGradient)" 
                  strokeWidth={4} 
                  dot={false}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}