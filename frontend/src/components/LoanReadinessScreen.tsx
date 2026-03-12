import {
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Shield,
  DollarSign
} from "lucide-react";
import { Progress } from "./ui/progress";
import { useNavigate } from "react-router";
import { useApplicantData } from "../hooks/useApplicantData";
import {
  getReadinessScore,
  getSafeLoanAmount,
  getMaxAffordablePayment,
  getDebtToIncome,
  getSavingsBufferMonths,
  getApprovalLikelihood
} from "../utils/financialMetrics";
import { motion } from "motion/react";
import { useState, useEffect } from "react";

interface ScreenProps {
  onNavigate?: (screen: string) => void;
}

export function LoanReadinessScreen({ onNavigate }: ScreenProps) {
  const navigate = useNavigate();
  const { applicant, loading } = useApplicantData();
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
          Loading loan readiness...
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

  const readinessData = {
    score: getReadinessScore(applicant),
    safeLoanAmount: getSafeLoanAmount(applicant),
    maxAffordablePayment: getMaxAffordablePayment(applicant),
    debtToIncome: getDebtToIncome(applicant),
    savingsBuffer: getSavingsBufferMonths(applicant),
    approvalLikelihood: getApprovalLikelihood(applicant)
  };

  const formattedDebtToIncome = readinessData.debtToIncome.toFixed(1);
  const formattedSavingsBuffer = readinessData.savingsBuffer.toFixed(1);
  const formattedApprovalLikelihood = Math.round(readinessData.approvalLikelihood);

  const indicators = [
    {
      label: "Debt-to-Income Ratio",
      value: readinessData.debtToIncome,
      icon: TrendingUp,
      description: `${formattedDebtToIncome}% - ${
        readinessData.debtToIncome <= 36 ? "Healthy range" : "Needs improvement"
      }`,
      color:
        readinessData.debtToIncome <= 36 ? "text-green-600" : "text-yellow-600",
      bgColor:
        readinessData.debtToIncome <= 36 ? "bg-green-100" : "bg-yellow-100"
    },
    {
      label: "Savings Buffer",
      value: Math.min((readinessData.savingsBuffer / 12) * 100, 100),
      icon: Shield,
      description: `${formattedSavingsBuffer} months of expenses saved`,
      color:
        readinessData.savingsBuffer >= 3 ? "text-green-600" : "text-yellow-600",
      bgColor:
        readinessData.savingsBuffer >= 3 ? "bg-green-100" : "bg-yellow-100"
    },
    {
      label: "Approval Likelihood",
      value: readinessData.approvalLikelihood,
      icon: DollarSign,
      description: `${formattedApprovalLikelihood}% - estimated chance with current profile`,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 pb-20">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-blue-600 via-blue-600 to-teal-500 px-6 pt-12 pb-8 rounded-b-3xl shadow-xl"
      >
        <h1 className="text-2xl text-white mb-2">Loan Readiness</h1>
        <p className="text-blue-100">Your borrowing capacity analysis</p>
      </motion.div>

      {/* Safe Loan Amount Card */}
      <div className="px-6 -mt-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300"
        >
          <div className="flex items-center gap-3 mb-4">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shadow-sm"
            >
              <DollarSign className="w-6 h-6 text-green-600" />
            </motion.div>
            <div>
              <h2 className="text-sm text-gray-600">Estimated Safe Loan Amount</h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-3xl text-gray-900"
              >
                ${readinessData.safeLoanAmount.toLocaleString()}
              </motion.p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200/50">
            <p className="text-sm text-green-800">
              Based on your current income, debt, and expenses, this is a safer
              borrowing range to avoid financial strain.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Max monthly payment</span>
              <motion.span 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="text-gray-900 font-medium"
              >
                ${readinessData.maxAffordablePayment}/mo
              </motion.span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Risk Indicators */}
      <div className="px-6 mt-6">
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-lg text-gray-900 mb-4"
        >
          Risk Indicators
        </motion.h2>
        <div className="space-y-4">
          {indicators.map((indicator, index) => {
            const Icon = indicator.icon;
            return (
              <motion.div
                key={indicator.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              >
                <div className="flex items-start gap-3 mb-3">
                  <motion.div 
                    whileHover={{ rotate: 5 }}
                    transition={{ duration: 0.2 }}
                    className={`w-10 h-10 ${indicator.bgColor} rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm`}
                  >
                    <Icon className={`w-5 h-5 ${indicator.color}`} />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-sm text-gray-900 mb-1 font-medium">{indicator.label}</h3>
                    <p className={`text-xs ${indicator.color}`}>{indicator.description}</p>
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                >
                  <Progress 
                    value={mounted ? indicator.value : 0} 
                    className="h-2"
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Readiness Factors */}
      <div className="px-6 mt-6">
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="text-lg text-gray-900 mb-4"
        >
          Readiness Factors
        </motion.h2>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100 shadow-sm overflow-hidden"
        >
          <motion.div 
            whileHover={{ backgroundColor: "rgba(249, 250, 251, 1)", transition: { duration: 0.2 } }}
            className="p-4 flex items-center gap-3 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-gray-900 font-medium">Stable Income Stream</p>
              <p className="text-xs text-gray-500 mt-1">
                Monthly income: ${applicant.income.toLocaleString()}
              </p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ backgroundColor: "rgba(249, 250, 251, 1)", transition: { duration: 0.2 } }}
            className="p-4 flex items-center gap-3 cursor-pointer"
          >
            {readinessData.savingsBuffer >= 3 ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="text-sm text-gray-900 font-medium">Savings Buffer</p>
              <p className="text-xs text-gray-500 mt-1">
                {formattedSavingsBuffer} months of expenses saved
              </p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ backgroundColor: "rgba(249, 250, 251, 1)", transition: { duration: 0.2 } }}
            className="p-4 flex items-center gap-3 cursor-pointer"
          >
            {readinessData.debtToIncome <= 36 ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="text-sm text-gray-900 font-medium">Debt-to-Income</p>
              <p className="text-xs text-gray-500 mt-1">
                {formattedDebtToIncome}% compared to income
              </p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ backgroundColor: "rgba(249, 250, 251, 1)", transition: { duration: 0.2 } }}
            className="p-4 flex items-center gap-3 cursor-pointer"
          >
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-gray-900 font-medium">Potential Improvements</p>
              <p className="text-xs text-gray-500 mt-1">
                Lower debt and higher savings can improve terms
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="px-6 mt-6 mb-6 space-y-3"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/improvement")}
          className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          View Improvement Plan
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/simulator")}
          className="w-full bg-white hover:bg-gray-50 text-gray-900 h-12 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
        >
          Try Loan Scenarios
        </motion.button>
      </motion.div>

      {/* Footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="px-6 mb-6 mt-12"
      >
        <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl p-4 border border-gray-200/50">
          <p className="text-xs text-gray-600 leading-relaxed">
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
  );
}
