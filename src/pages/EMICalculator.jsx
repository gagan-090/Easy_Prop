import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calculator, Home, TrendingUp, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';

const EMICalculator = () => {
  const { id } = useParams();
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [loanTenure, setLoanTenure] = useState(20);
  const [emi, setEmi] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  // Calculate EMI
  useEffect(() => {
    const principal = loanAmount;
    const rate = interestRate / 12 / 100;
    const tenure = loanTenure * 12;

    if (principal && rate && tenure) {
      const emiValue = (principal * rate * Math.pow(1 + rate, tenure)) / (Math.pow(1 + rate, tenure) - 1);
      const totalAmountValue = emiValue * tenure;
      const totalInterestValue = totalAmountValue - principal;

      setEmi(Math.round(emiValue));
      setTotalAmount(Math.round(totalAmountValue));
      setTotalInterest(Math.round(totalInterestValue));
    }
  }, [loanAmount, interestRate, loanTenure]);

  const formatCurrency = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to={id ? `/property/${id}` : '/'}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Property</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Calculator className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-slate-900">EMI Calculator</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Calculator Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Home className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Loan Calculator</h2>
                <p className="text-slate-600">Calculate your monthly EMI</p>
              </div>
            </div>

            <div className="space-y-8">
              {/* Loan Amount */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Loan Amount
                </label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="1000000"
                    max="50000000"
                    step="100000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>₹10L</span>
                    <span className="font-semibold text-blue-600">{formatCurrency(loanAmount)}</span>
                    <span>₹5Cr</span>
                  </div>
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Interest Rate */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Interest Rate (% per annum)
                </label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="6"
                    max="15"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>6%</span>
                    <span className="font-semibold text-blue-600">{interestRate}%</span>
                    <span>15%</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Loan Tenure */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Loan Tenure (Years)
                </label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    value={loanTenure}
                    onChange={(e) => setLoanTenure(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>5 Years</span>
                    <span className="font-semibold text-blue-600">{loanTenure} Years</span>
                    <span>30 Years</span>
                  </div>
                  <input
                    type="number"
                    value={loanTenure}
                    onChange={(e) => setLoanTenure(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* EMI Result */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Monthly EMI</h3>
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="text-4xl font-bold mb-2">{formatCurrency(emi)}</div>
              <p className="text-blue-100">Per month for {loanTenure} years</p>
            </div>

            {/* Breakdown */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <PieChart className="h-6 w-6 text-slate-600" />
                <h3 className="text-xl font-bold text-slate-900">Loan Breakdown</h3>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                  <span className="font-medium text-slate-700">Principal Amount</span>
                  <span className="font-bold text-slate-900">{formatCurrency(loanAmount)}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl">
                  <span className="font-medium text-slate-700">Total Interest</span>
                  <span className="font-bold text-red-600">{formatCurrency(totalInterest)}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                  <span className="font-medium text-slate-700">Total Amount</span>
                  <span className="font-bold text-green-600">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              {/* Visual Breakdown */}
              <div className="mt-8">
                <div className="flex rounded-xl overflow-hidden h-4">
                  <div 
                    className="bg-blue-500"
                    style={{ width: `${(loanAmount / totalAmount) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-red-500"
                    style={{ width: `${(totalInterest / totalAmount) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-3 text-sm">
                  <span className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    Principal ({((loanAmount / totalAmount) * 100).toFixed(1)}%)
                  </span>
                  <span className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    Interest ({((totalInterest / totalAmount) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                Apply for Loan
              </button>
              
              {id && (
                <Link
                  to={`/schedule-tour/${id}`}
                  className="block w-full text-center border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300"
                >
                  Schedule Property Tour
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EMICalculator;