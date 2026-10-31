import React, { useState } from 'react';
import { UserProfile, FormAlertItem } from '../../types';
import { Bell, Calendar, ExternalLink, Filter, Search, ShieldCheck, Clock, Bookmark, AlertTriangle } from 'lucide-react';

interface FormAlertProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

export const FormAlert: React.FC<FormAlertProps> = ({ profile, onUpdateProfile }) => {
  const isHi = profile.language === 'hi';
  const [selectedQualification, setSelectedQualification] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'job' | 'exam' | 'scholarship'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const liveAlerts: FormAlertItem[] = [
    {
      id: 'fa1',
      title: 'SSC CGL Tier-1 Combined Graduate Level Examination 2026',
      organization: 'Staff Selection Commission (SSC)',
      qualification: 'Graduate',
      lastDate: '2026-10-15',
      state: 'All India',
      category: 'job',
      applyUrl: 'https://ssc.gov.in',
      fee: '₹100 (SC/ST/Female Free)'
    },
    {
      id: 'fa2',
      title: 'UPSC Civil Services Mains / IAS Registration 2026-2027',
      organization: 'Union Public Service Commission',
      qualification: 'Graduate',
      lastDate: '2026-11-10',
      state: 'All India',
      category: 'job',
      applyUrl: 'https://upsc.gov.in',
      fee: '₹100'
    },
    {
      id: 'fa3',
      title: 'NEET UG Counselling & Choice Filling Round 2',
      organization: 'National Testing Agency (NTA)',
      qualification: '12th Pass (PCB)',
      lastDate: '2026-10-20',
      state: 'All India',
      category: 'exam',
      applyUrl: 'https://neet.nta.nic.in',
      fee: 'N/A'
    },
    {
      id: 'fa4',
      title: 'PM Yasasvi Scholarship Scheme for OBC / EBC / DNT Students',
      organization: 'Ministry of Social Justice & Empowerment',
      qualification: '9th / 11th Pass',
      lastDate: '2026-11-28',
      state: 'All India',
      category: 'scholarship',
      applyUrl: 'https://yet.nta.ac.in',
      fee: 'Free Application'
    },
    {
      id: 'fa5',
      title: 'IBPS PO / Management Trainee XVI Recruitment 2026-2027',
      organization: 'Institute of Banking Personnel Selection',
      qualification: 'Graduate',
      lastDate: '2026-12-15',
      state: 'All India',
      category: 'job',
      applyUrl: 'https://ibps.in',
      fee: '₹850 (SC/ST/PWD ₹175)'
    },
    {
      id: 'fa6',
      title: 'MPPEB MP Police Constable & Sub-Inspector Bharti',
      organization: 'Madhya Pradesh Employees Selection Board',
      qualification: '10th / 12th Pass',
      lastDate: '2026-10-30',
      state: 'Madhya Pradesh',
      category: 'job',
      applyUrl: 'https://esb.mp.gov.in',
      fee: '₹500'
    }
  ];

  const filteredAlerts = liveAlerts.filter((item) => {
    const matchesQual = selectedQualification === 'All' || item.qualification.toLowerCase().includes(selectedQualification.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.organization.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesQual && matchesCat && matchesSearch;
  });

  const calculateDaysLeft = (targetDateStr: string) => {
    const target = new Date(targetDateStr).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((target - now) / (1000 * 3600 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#000080] via-[#1e1b4b] to-[#138808] text-white shadow-xl relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-400/30">
          <Bell className="w-3.5 h-3.5" />
          <span>{isHi ? 'सरकारी नौकरियां, प्रवेश परीक्षा व छात्रवृत्ति अलर्ट' : 'Govt Jobs, Exams & Scholarship Deadlines'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{isHi ? 'फॉर्म अलर्ट' : 'Form Alert'}</h2>
        <p className="text-sm text-slate-200 mt-1">
          {isHi ? 'किसी भी फॉर्म की अंतिम तिथि न चूकें। केवल आधिकारिक सरकारी पोर्टल।' : 'Never miss an application deadline. Verified Indian official portals only.'}
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isHi ? 'परीक्षा, SSC, बैंक, NEET खोजें...' : 'Search exam, SSC, Bank, NEET...'}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#000080]"
            />
          </div>

          {/* Qualification Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 select-none">
            {[
              { id: 'All', label: isHi ? 'सभी' : 'All' },
              { id: '10th Pass', label: isHi ? '10वीं पास' : '10th' },
              { id: '12th Pass', label: isHi ? '12वीं पास' : '12th' },
              { id: 'Graduate', label: isHi ? 'स्नातक' : 'Graduate' }
            ].map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => setSelectedQualification(q.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors select-none touch-manipulation cursor-pointer ${
                  selectedQualification === q.id
                    ? 'bg-[#000080] dark:bg-amber-400 text-white dark:text-slate-950 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-slate-100 dark:border-slate-800 pt-3 select-none">
          {[
            { id: 'all', label: isHi ? 'सभी' : 'All' },
            { id: 'job', label: isHi ? '💼 सरकारी नौकरी' : '💼 Jobs' },
            { id: 'exam', label: isHi ? '🎓 प्रवेश परीक्षा' : '🎓 Exams' },
            { id: 'scholarship', label: isHi ? '💰 छात्रवृत्ति' : '💰 Scholarships' }
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors select-none touch-manipulation cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAlerts.map((alert) => {
          const daysLeft = calculateDaysLeft(alert.lastDate);
          const isUrgent = daysLeft <= 10;

          return (
            <div
              key={alert.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {alert.organization}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                    daysLeft < 0
                      ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      : isUrgent
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 animate-pulse'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    <Clock className="w-3 h-3" />
                    <span>
                      {daysLeft < 0
                        ? (isHi ? 'आवेदन समाप्त' : 'Closed')
                        : daysLeft === 0
                          ? (isHi ? 'आज अंतिम दिन!' : 'Last Day Today!')
                          : `${daysLeft} ${isHi ? 'दिन शेष' : 'Days Left'}`}
                    </span>
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                  {alert.title}
                </h3>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl">
                  <div>
                    <span className="text-slate-400 block text-[10px]">{isHi ? 'योग्यता:' : 'QUALIFICATION:'}</span>
                    <strong className="text-slate-800 dark:text-slate-200">{alert.qualification}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{isHi ? 'आवेदन शुल्क:' : 'APPLICATION FEE:'}</span>
                    <strong className="text-slate-800 dark:text-slate-200">{alert.fee}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#FF9933]" />
                  <span>{isHi ? 'अंतिम तिथि:' : 'Last Date:'} <strong>{alert.lastDate}</strong></span>
                </span>

                <a
                  href={alert.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#000080] hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <span>{isHi ? 'आवेदन करें' : 'Apply'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}

        {filteredAlerts.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-700 dark:text-slate-300 text-sm">
            {isHi ? 'आपकी योग्यता या खोज से मेल खाता कोई फॉर्म अलर्ट नहीं मिला।' : 'No form alerts found matching your qualification or search term.'}
          </div>
        )}
      </div>
    </div>
  );
};
