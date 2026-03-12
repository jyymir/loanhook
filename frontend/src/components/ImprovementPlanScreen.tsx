import { useState, useEffect } from "react";
import {
  Target,
  TrendingUp,
  CreditCard,
  PiggyBank,
  Clock,
  ArrowLeft,
  CheckCircle2
} from "lucide-react";
import { Progress } from "./ui/progress";
import { useApplicantData } from "../hooks/useApplicantData";
import {
  getReadinessScore,
  getMonthlyExpenses
} from "../utils/financialMetrics";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

interface ImprovementPlanProps {
  onNavigate?: (screen: string) => void;
}

export function ImprovementPlanScreen({ onNavigate }: ImprovementPlanProps) {
  const navigate = useNavigate();
  const { applicant, loading } = useApplicantData();
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-600"
        >
          Loading improvement plan...
        </motion.div>
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-gray-600">No applicant data available.</div>
      </div>
    );
  }

  const monthlyExpenses = getMonthlyExpenses(applicant);
  const currentScore = getReadinessScore(applicant);

  const emergencyFundTarget = monthlyExpenses * 6;
  const emergencyProgress = Math.min(
    100,
    Math.round((applicant.savings / (emergencyFundTarget || 1)) * 100)
  );

  const debtPaydownProgress =
    applicant.debt === 0
      ? 100
      : Math.max(0, Math.min(100, Math.round((1 - applicant.debt / 5000) * 100)));

  const incomeTarget = applicant.income + 500;
  const incomeProgress = Math.min(
    100,
    Math.round((applicant.income / (incomeTarget || 1)) * 100)
  );

  const potentialScore = Math.min(100, currentScore + 20);

  const improvements = [
    {
      id: "savings",
      title: "Build Emergency Fund",
      description: "Increase savings to cover 6 months of expenses",
      priority: "high",
      impact: "+15 pts",
      currentProgress: emergencyProgress,
      targetAmount: `$${emergencyFundTarget.toLocaleString()}`,
      currentAmount: `$${applicant.savings.toLocaleString()}`,
      icon: PiggyBank,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      hoverBorder: "hover:border-blue-300",
      timeline: "3-6 months",
      steps: [
        "Set up automatic monthly savings transfers",
        "Reduce nonessential spending categories",
        "Save toward at least 6 months of expenses"
      ]
    },
    {
      id: "debt",
      title: "Reduce Debt",
      description: "Pay down existing debt to improve cash flow",
      priority: "medium",
      impact: "+8 pts",
      currentProgress: debtPaydownProgress,
      targetAmount: "$0",
      currentAmount: `$${applicant.debt.toLocaleString()}`,
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      hoverBorder: "hover:border-purple-300",
      timeline: "6-12 months",
      steps: [
        "Pay above the minimum each month",
        "Avoid adding new revolving debt",
        "Prioritize high-interest balances first"
      ]
    },
    {
      id: "income",
      title: "Increase Income",
      description: "Boost monthly earnings through raises or side work",
      priority: "low",
      impact: "+12 pts",
      currentProgress: incomeProgress,
      targetAmount: `$${incomeTarget.toLocaleString()}/mo`,
      currentAmount: `$${applicant.income.toLocaleString()}/mo`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      hoverBorder: "hover:border-green-300",
      timeline: "Ongoing",
      steps: [
        "Explore side income opportunities",
        "Ask about promotion or added hours",
        "Invest in skills that increase earnings"
      ]
    }
  ];

  const toggleStep = (step: string) => {
    setCompletedSteps((prev) =>
      prev.includes(step) ? prev.filter((s) => s !== step) : [...prev, step]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-green-100 text-green-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 pb-20">
      {/* HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-blue-600 via-blue-600 to-teal-500 px-6 pt-6 pb-20 rounded-b-3xl shadow-xl relative"
      >
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>

          <div>
            <h1 className="text-2xl text-white">Improvement Plan</h1>
            <p className="text-blue-100 text-sm mt-0.5">
              Personalized Strategy
            </p>
          </div>
        </div>
      </motion.div>

      {/* CONTENT */}
      <div className="max-w-3xl mx-auto px-6 relative z-10 -mt-10">
        {/* SCORE COMPARISON CARD */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 mb-8 hover:shadow-2xl transition-shadow duration-300"
        >
          <div className="flex items-center justify-around text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <p className="text-xs text-gray-500 font-medium mb-2">
                Current
              </p>
              <p className="text-4xl text-gray-900">{currentScore}</p>
            </motion.div>

            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
              className="flex flex-col items-center"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-sm">
                <Target className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Potential</p>
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.5, type: "spring", stiffness: 200 }}
            >
              <p className="text-xs text-gray-500 font-medium mb-2">
                Target
              </p>
              <p className="text-4xl text-green-600">
                {potentialScore}
              </p>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl border border-blue-200/50 text-center"
          >
            <p className="text-sm text-blue-800">
              Complete the priority actions below to boost your score.
            </p>
          </motion.div>
        </motion.div>

        {/* PRIORITY ACTIONS */}
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4"
        >
          Priority Actions
        </motion.h2>

        <div className="space-y-6">
          {improvements.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className={`group bg-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 ${item.hoverBorder} hover:shadow-lg`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-4">
                      <motion.div
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                        className={`w-12 h-12 ${item.bgColor} rounded-xl flex items-center justify-center shadow-sm`}
                      >
                        <Icon className={`w-6 h-6 ${item.color}`} />
                      </motion.div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium text-gray-900">
                            {item.title}
                          </h3>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full uppercase ${getPriorityColor(
                              item.priority
                            )}`}
                          >
                            {item.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>

                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.1, type: "spring" }}
                      className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-lg border border-green-200"
                    >
                      {item.impact}
                    </motion.span>
                  </div>

                  {/* PROGRESS AREA */}
                  <div className="mb-6">
                    <div className="flex justify-between text-xs font-medium text-gray-500 mb-2">
                      <span>Current: {item.currentAmount}</span>
                      <motion.span 
                        key={item.currentProgress}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-gray-900"
                      >
                        {mounted ? item.currentProgress : 0}%
                      </motion.span>
                    </div>

                    <Progress value={mounted ? item.currentProgress : 0} className="h-2" />

                    <div className="text-right mt-2">
                      <span className="text-xs text-gray-500">
                        Target: {item.targetAmount}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4 text-xs text-gray-600 font-medium">
                    <Clock className="w-4 h-4" />
                    <span>Est. Timeline: {item.timeline}</span>
                  </div>

                  {/* CHECKLIST STEPS */}
                  <div className="space-y-2 border-t border-gray-100 pt-4">
                    {item.steps.map((step, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => toggleStep(step)}
                        className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left group/step"
                      >
                        <motion.div
                          animate={{
                            scale: completedSteps.includes(step) ? [1, 1.2, 1] : 1,
                            rotate: completedSteps.includes(step) ? [0, 10, -10, 0] : 0
                          }}
                          transition={{ duration: 0.4 }}
                        >
                          <CheckCircle2
                            className={`w-5 h-5 mt-0.5 flex-shrink-0 transition-colors ${
                              completedSteps.includes(step)
                                ? "text-green-500"
                                : "text-gray-300 group-hover/step:text-gray-400"
                            }`}
                          />
                        </motion.div>
                        <span
                          className={`text-sm transition-all duration-300 ${
                            completedSteps.includes(step)
                              ? "text-gray-400 line-through"
                              : "text-gray-700"
                          }`}
                        >
                          {step}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* BOTTOM TIP */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="mt-8 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-shadow duration-300"
        >
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Target className="w-6 h-6 text-teal-400" />
            </motion.div>
            <h3 className="font-medium text-base">Strategic Focus</h3>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            Focus first on your <span className="text-white font-medium">Build Emergency Fund</span>{" "}
            goal. Lenders prioritize applicants with high liquidity as it drastically
            reduces default risk.
          </p>
        </motion.div>

        {/* FOOTER */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mt-12 mb-6"
        >
          <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl p-4 border border-gray-200/50">
            <p className="text-xs text-gray-600 text-center leading-relaxed">
              © Copyright 2024 LoanHook. All rights reserved. Jy'Mir Fuller &
              Joseph Ajumobi |{" "}
              <a href="#" className="text-blue-600 hover:underline transition-colors duration-200">
                Privacy Policy
              </a>{" "}
              |{" "}
              <a href="#" className="text-blue-600 hover:underline transition-colors duration-200">
                Terms of Service
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
