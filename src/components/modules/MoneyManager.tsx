import React, { useState, useRef, useEffect, useMemo, memo } from 'react';
import { UserProfile, MoneyRecord } from '../../types';
import { Wallet, Plus, TrendingDown, TrendingUp, Sparkles, PieChart, ArrowUpRight, ArrowDownRight, Loader2, Download, Trash2, Edit2 } from 'lucide-react';
import { AISolutionSkeleton } from '../skeletons/ModuleSkeleton';
import { t } from '../../lib/translations';
import { SwipeableList } from '../common/SwipeableList';

interface MoneyManagerProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

export const MoneyManager: React.FC<MoneyManagerProps> = memo(({ profile, onUpdateProfile }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('Groceries');
  const [aiAdvice, setAiAdvice] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const isHi = profile.language === 'hi';

  const categories = useMemo(() => [
    'Groceries', 'Rent', 'Food & Chai', 'Utilities', 'Salary', 'Freelance', 'Shopping', 'Travel', 'Medical', 'Entertainment'
  ], []);

  const { totalIncome, totalExpense, balance } = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const e of profile.expenses) {
      if (e.type === 'income') income += e.amount;
      else if (e.type === 'expense') expense += e.amount;
    }
    return { totalIncome: income, totalExpense: expense, balance: income - expense };
  }, [profile.expenses]);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setTitle('');
    setAmount('');
    setType('expense');
    setCategory('Groceries');
    setShowAddModal(true);
  };

  const handleEdit = (item: MoneyRecord) => {
    setEditingId(item.id);
    setTitle(item.title);
    setAmount(item.amount.toString());
    setType(item.type);
    setCategory(item.category);
    setShowAddModal(true);
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    if (editingId) {
      const updatedExpenses = profile.expenses.map(exp => 
        exp.id === editingId 
          ? { ...exp, title, amount: parseFloat(amount), type, category }
          : exp
      );
      onUpdateProfile({ expenses: updatedExpenses });
    } else {
      const newRecord: MoneyRecord = {
        id: 'ex_' + Date.now(),
        title,
        amount: parseFloat(amount),
        type,
        category,
        date: new Date().toISOString().split('T')[0]
      };

      onUpdateProfile({
        expenses: [newRecord, ...profile.expenses]
      });
    }

    setTitle('');
    setAmount('');
    setEditingId(null);
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    onUpdateProfile({
      expenses: profile.expenses.filter((e) => e.id !== id)
    });
  };

  const fetchAiAdvice = async () => {
    setLoadingAi(true);
    setAiAdvice('');
    try {
      const topCat = Array.from(new Set(profile.expenses.map((e) => e.category))).slice(0, 4).join(', ');
      const res = await fetch('/api/ai/money', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyIncome: totalIncome || 35000,
          totalExpense: totalExpense || 25000,
          topCategories: topCat,
          goal: 'Emergency Fund & Monthly Savings',
          language: profile.language
        })
      });
      const data = await res.json();
      if (data.result) {
        setAiAdvice(data.result);
      }
    } catch (err) {
      setAiAdvice('Could not load AI financial advice at this moment.');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#000080] via-[#000066] to-[#0f172a] text-white shadow-xl relative overflow-hidden border border-amber-500/20">
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-[#FF9933]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-400/30">
              <Wallet className="w-3.5 h-3.5" />
              <span>{isHi ? 'स्मार्ट भारतीय खर्च ट्रैकर' : 'Smart Indian Expense Engine'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{isHi ? 'मनी मैनेजर' : 'Money Manager'}</h2>
            <p className="text-sm text-slate-300 mt-1">{isHi ? 'किराना, किराया, चाय और आमदनी को आसानी से ट्रैक करें।' : 'Track Kirana, Rent, Chai & Freelance earnings in Indian Rupees.'}</p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-2xl bg-[#FF9933] hover:bg-amber-500 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>{isHi ? 'जोड़ें' : 'Add'}</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isHi ? 'कुल आय' : 'Total Income'}</p>
            <p className="text-2xl font-bold text-[#138808] dark:text-emerald-400 mt-1">₹{totalIncome.toLocaleString('en-IN')}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-[#138808] dark:text-emerald-400">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isHi ? 'कुल खर्च' : 'Total Expenses'}</p>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">₹{totalExpense.toLocaleString('en-IN')}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isHi ? 'कुल बचत' : 'Net Balance'}</p>
            <p className={`text-2xl font-bold mt-1 ${balance >= 0 ? 'text-[#000080] dark:text-sky-300' : 'text-rose-600'}`}>
              ₹{balance.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center text-[#000080] dark:text-sky-300">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* AI Financial Advisor Card */}
      <div className="p-6 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF9933]" />
            <h3 className="font-bold text-slate-900 dark:text-amber-200 text-base">{isHi ? 'AI वित्तीय बचत सलाहकार' : 'AI Financial Savings Advisor'}</h3>
          </div>
          <button
            onClick={fetchAiAdvice}
            disabled={loadingAi}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {loadingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isHi ? 'बचत योजना' : 'Savings Plan'}</span>
          </button>
        </div>

        {loadingAi ? (
          <AISolutionSkeleton />
        ) : aiAdvice ? (
          <div className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed bg-white/80 dark:bg-slate-900/40 dark:backdrop-blur-xl/80 p-4 rounded-xl border border-amber-200/60 dark:border-amber-800/40 animate-fade-in">
            {aiAdvice}
          </div>
        ) : (
          <p className="text-xs text-slate-700 dark:text-slate-300">
            {isHi ? '50/30/20 बजट विश्लेषण और किराना, चाय व सब्सक्रिप्शन पर पैसे बचाने की टिप्स के लिए ऊपर क्लिक करें।' : 'Click above to generate customized 50/30/20 budget analysis and Jugaad cost-cutting tips for Kirana, Chai & Subscriptions.'}
          </p>
        )}
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">{isHi ? 'लेन-देन सूची' : 'Transaction Records'}</h3>
          <span className="text-xs text-slate-700 dark:text-slate-300">{profile.expenses.length} {isHi ? 'प्रविष्टियां' : 'entries'}</span>
        </div>

        <SwipeableList
          items={profile.expenses}
          keyExtractor={(item) => item.id}
          onDelete={handleDelete}
          onEdit={(_, item) => handleEdit(item)}
          language={profile.language}
          confirmTitle={() => (isHi ? 'लेन-देन हटाएं?' : 'Delete Transaction?')}
          confirmMessage={(item) => (isHi ? `क्या आप "${item.title}" हटाना चाहते हैं?` : `Are you sure you want to delete "${item.title}"?`)}
          renderItem={(item) => (
            <div className="py-3 px-3 sm:px-4 flex items-center justify-between gap-3 min-w-0 w-full overflow-hidden bg-white dark:bg-slate-900/90 dark:backdrop-blur-xl border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 overflow-hidden">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0 ${
                  item.type === 'income' ? 'bg-emerald-100 text-[#138808] dark:bg-emerald-950/80 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400'
                }`}>
                  {item.category.charAt(0)}
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white break-words [overflow-wrap:anywhere] leading-snug">{item.title}</p>
                  <p className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 break-words [overflow-wrap:anywhere] leading-tight mt-0.5">{item.category} • {item.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 text-right pr-1">
                <span className={`font-extrabold text-xs sm:text-sm whitespace-nowrap ${item.type === 'income' ? 'text-[#138808] dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}>
                  {item.type === 'income' ? '+' : '-'}₹{item.amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}
          emptyState={
            <div className="py-10 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl my-2 flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center text-[#FF9933]">
                <Wallet className="w-6 h-6" />
              </div>
              <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                {isHi ? 'कोई लेन-देन नहीं है' : 'No transactions yet'}
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300 max-w-xs">
                {isHi ? 'नया लेन-देन जोड़ने के लिए ऊपर जोड़ें बटन दबाएं।' : 'Click Add above to log your expenses and income.'}
              </p>
            </div>
          }
        />
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/60">
          <div className="w-full max-w-md bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">
              {editingId ? (isHi ? 'संपादित करें' : 'Edit Transaction') : (isHi ? 'लेन-देन जोड़ें' : 'Add Transaction')}
            </h3>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isHi ? 'विवरण' : 'Description'}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={isHi ? 'उदा. किराना स्टोर, चाय, फ्रीलांस' : 'e.g. Kirana store, Chai, Freelance payout'}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#000080]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isHi ? 'राशि (₹)' : 'Amount (₹)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="250"
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#000080]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isHi ? 'प्रकार' : 'Type'}
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#000080]"
                  >
                    <option value="expense">{isHi ? 'खर्च (-)' : 'Expense (-)'}</option>
                    <option value="income">{isHi ? 'आय (+)' : 'Income (+)'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isHi ? 'श्रेणी' : 'Category'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#000080]"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  {isHi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#000080] hover:bg-blue-900 rounded-xl"
                >
                  {isHi ? 'सहेजें' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
});
