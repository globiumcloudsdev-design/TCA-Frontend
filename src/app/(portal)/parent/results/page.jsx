// 'use client';

// import { useState } from 'react';
// import { BookOpen, Award, TrendingUp, User } from 'lucide-react';
// import usePortalStore from '@/store/portalStore';
// import { DUMMY_PARENTS } from '@/data/portalDummyData';
// import { getPortalTerms } from '@/constants/portalInstituteConfig';

// const GRADE_COLORS = {
//   'A+': 'text-emerald-600 bg-emerald-50', A: 'text-blue-600 bg-blue-50',
//   'B+': 'text-indigo-600 bg-indigo-50', B: 'text-violet-600 bg-violet-50',
//   'C': 'text-amber-600 bg-amber-50', F: 'text-red-600 bg-red-50',
// };

// function ResultCard({ result, childName, t }) {
//   const pct = result.percentage;
//   const arcColor = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';

//   return (
//     <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
//       <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-5">
//         <div className="flex items-start justify-between">
//           <div>
//             <p className="text-white/70 text-xs">{result.exam?.name || 'Exam'}</p>
//             <h3 className="text-xl font-extrabold text-white mt-0.5">{childName}</h3>
//             <div className="flex items-center gap-3 mt-2">
//               <span className="text-sm text-white/80">
//                 📅 {result.exam?.start_date || 'N/A'}
//               </span>
//               <span className="text-sm text-white/80">
//                 🏆 Rank #{result.position} of {result.class_total}
//               </span>
//             </div>
//           </div>
//           <div className="text-center bg-white/20 rounded-xl px-4 py-3">
//             <p className="text-3xl font-extrabold text-white">{pct}%</p>
//             <p className="text-xs text-white/70 mt-0.5">
//               {result.total_marks}/{result.total_full}
//             </p>
//             <span className={`mt-1 inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white`}>
//               Grade {result.grade}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Subjects table */}
//       <div className="p-5">
//         <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t.subjectsLabel}-wise {t.resultsLabel}</p>
//         <div className="space-y-2.5">
//           {result.subjects.map((s) => {
//             const pctS = Math.round((s.marks / s.total) * 100);
//             const gradeCls = GRADE_COLORS[s.grade] || 'text-slate-600 bg-slate-50';
//             return (
//               <div key={s.name} className="flex items-center gap-3">
//                 <span className="text-sm text-slate-700 w-28 flex-shrink-0 font-medium">{s.name}</span>
//                 <div className="flex-1 bg-slate-100 rounded-full h-2">
//                   <div
//                     className={`h-2 rounded-full transition-all ${pctS >= 80 ? 'bg-emerald-500' : pctS >= 60 ? 'bg-indigo-500' : 'bg-amber-500'}`}
//                     style={{ width: `${pctS}%` }}
//                   />
//                 </div>
//                 <span className="text-sm font-bold text-slate-700 w-10 text-right">{s.marks}</span>
//                 <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${gradeCls}`}>{s.grade}</span>
//               </div>
//             );
//           })}
//         </div>

//         {result.remarks && (
//           <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
//             <p className="text-xs font-semibold text-indigo-700">{t.teacherLabel}&apos;s Remarks</p>
//             <p className="text-sm text-indigo-600 mt-0.5">{result.remarks}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default function ParentResultsPage() {
//   const { portalUser } = usePortalStore();
//   const parent = portalUser || DUMMY_PARENTS[0];
//   const t = getPortalTerms(parent?.institute_type);
//   const children = parent.children || [];
//   const [selectedChild, setSelectedChild] = useState(0);

//   const child = children[selectedChild];
//   const results = child?.results || [];

//   return (
//     <div className="space-y-6 max-w-4xl mx-auto">
//       <div>
//         <h1 className="text-xl font-extrabold text-slate-900">{t.resultsLabel}</h1>
//         <p className="text-sm text-slate-500 mt-1">Published {t.examLabel.toLowerCase()} results and {t.subjectLabel.toLowerCase()}-wise performance.</p>
//       </div>

//       {children.length > 1 && (
//         <div className="flex flex-wrap gap-2">
//           {children.map((c, i) => (
//             <button key={c.id} onClick={() => setSelectedChild(i)}
//               className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${selectedChild === i ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'}`}>
//               {c.name}
//             </button>
//           ))}
//         </div>
//       )}

//       {results.length === 0 ? (
//         <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
//           <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
//           <p className="font-semibold text-slate-500">No published results yet</p>
//           <p className="text-sm text-slate-400 mt-1">Results will appear here once published by the school.</p>
//         </div>
//       ) : (
//         <div className="space-y-5">
//           {results.map((r) => (
//             <ResultCard key={`${r.exam_id}-${r.student_id}`} result={r} childName={`${child.first_name} ${child.last_name}`} t={t} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }






// frontend/src/app/(portal)/parent/results/page.jsx

'use client';

import { useState } from 'react';
import { 
  BookOpen, Award, TrendingUp, User, Calendar, 
  Filter, ChevronDown, Download, Eye, Star, 
  BarChart3, PieChart, Activity, Target, Trophy,
  TrendingDown, TrendingUp as TrendingUpIcon, Minus,
  X, FileText, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import usePortalStore from '@/store/portalStore';
import { getPortalTerms } from '@/constants/portalInstituteConfig';
import { useChildResults, useResultStatistics } from '@/hooks/useParentPortal';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const GRADE_COLORS = {
  'A+': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'A': 'bg-blue-100 text-blue-700 border-blue-200',
  'B+': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'B': 'bg-violet-100 text-violet-700 border-violet-200',
  'C': 'bg-amber-100 text-amber-700 border-amber-200',
  'D': 'bg-orange-100 text-orange-700 border-orange-200',
  'F': 'bg-red-100 text-red-700 border-red-200',
};

const EXAM_TYPES = {
  monthly: { label: 'Monthly Test', icon: Calendar },
  quarterly: { label: 'Quarterly Exam', icon: FileText },
  half_yearly: { label: 'Half Yearly', icon: BookOpen },
  annual: { label: 'Annual Exam', icon: Award },
  weekly: { label: 'Weekly Test', icon: Clock },
};

// Result Details Modal
const ResultDetailsModal = ({ result, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('subjects');
  
  if (!isOpen || !result) return null;

  const percentageColor = result.percentage >= 80 ? 'text-emerald-600' : 
                          result.percentage >= 60 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{result.exam_name}</h2>
            <p className="text-xs text-slate-500">
              {format(new Date(result.exam_date), 'dd MMM yyyy')} • {result.exam_type}
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Score Overview */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90">Overall Score</p>
                <p className="text-3xl font-bold">{result.percentage}%</p>
                <p className="text-sm opacity-90 mt-1">Grade: {result.grade}</p>
              </div>
              <div className="text-center">
                <p className="text-sm opacity-90">Rank</p>
                <p className="text-2xl font-bold">{result.rank || '-'}</p>
                <p className="text-xs opacity-90">out of {result.total_students || '-'}</p>
              </div>
              <div className="text-center">
                <p className="text-sm opacity-90">Marks</p>
                <p className="text-2xl font-bold">{result.obtained_marks}</p>
                <p className="text-xs opacity-90">/ {result.total_marks}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-100">
            {['subjects', 'analysis', 'feedback'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium capitalize transition ${
                  activeTab === tab 
                    ? 'text-indigo-600 border-b-2 border-indigo-600' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Subjects Tab */}
          {activeTab === 'subjects' && (
            <div className="space-y-4">
              {result.subjects?.map((subject, idx) => {
                const percentage = (subject.marks_obtained / subject.total_marks) * 100;
                const gradeColor = GRADE_COLORS[subject.grade] || GRADE_COLORS['C'];
                
                return (
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-slate-800">{subject.subject_name}</p>
                        <p className="text-xs text-slate-500">
                          {subject.marks_obtained} / {subject.total_marks} marks
                        </p>
                      </div>
                      <Badge className={gradeColor}>
                        {subject.grade}
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-indigo-600 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-slate-500">Score</span>
                        <span className="text-xs font-medium text-slate-700">{Math.round(percentage)}%</span>
                      </div>
                    </div>
                    {subject.remarks && (
                      <p className="text-xs text-slate-500 mt-2 italic">{subject.remarks}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Analysis Tab */}
          {activeTab === 'analysis' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-500">Passed Subjects</p>
                  <p className="text-2xl font-bold text-emerald-600">{result.passed_subjects || result.subjects?.filter(s => s.grade !== 'F').length || 0}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-500">Failed Subjects</p>
                  <p className="text-2xl font-bold text-red-600">{result.failed_subjects || result.subjects?.filter(s => s.grade === 'F').length || 0}</p>
                </div>
              </div>
              
              {result.class_average && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Class Performance Comparison</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-slate-500">Your Score</p>
                      <p className="text-lg font-bold text-indigo-600">{result.percentage}%</p>
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div className="text-xs text-slate-500">Class Average: {Math.round(result.class_average)}%</div>
                        </div>
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-slate-200">
                          <div
                            style={{ width: `${result.class_average}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-slate-500"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Difference</p>
                      <p className={`text-lg font-bold ${result.performance_compared_to_class >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {result.performance_compared_to_class >= 0 ? '+' : ''}{Math.round(result.performance_compared_to_class)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Feedback Tab */}
          {activeTab === 'feedback' && (
            <div className="space-y-4">
              {result.remarks && (
                <div className="bg-indigo-50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-indigo-800 mb-2">Teacher's Remarks</p>
                  <p className="text-sm text-indigo-700">{result.remarks}</p>
                </div>
              )}
              {result.teacher_feedback && (
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-amber-800 mb-2">Detailed Feedback</p>
                  <p className="text-sm text-amber-700">{result.teacher_feedback}</p>
                </div>
              )}
              {!result.remarks && !result.teacher_feedback && (
                <p className="text-center text-slate-500 py-8">No additional feedback available</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Result Card Component
const ResultCard = ({ result, childName, onViewDetails }) => {
  const percentage = result.percentage;
  const arcColor = percentage >= 80 ? '#10b981' : percentage >= 60 ? '#f59e0b' : '#ef4444';
  const examType = EXAM_TYPES[result.exam_type] || EXAM_TYPES.monthly;
  const TypeIcon = examType.icon;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className={`bg-gradient-to-r p-5 ${
        percentage >= 80 ? 'from-emerald-600 to-teal-600' :
        percentage >= 60 ? 'from-amber-600 to-orange-600' : 'from-red-600 to-rose-600'
      }`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <TypeIcon className="w-4 h-4 text-white/70" />
              <p className="text-white/70 text-xs">{examType.label}</p>
            </div>
            <h3 className="text-xl font-extrabold text-white mt-1">{result.exam_name}</h3>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm text-white/80">
                📅 {format(new Date(result.date), 'dd MMM yyyy')}
              </span>
              {result.rank && (
                <span className="text-sm text-white/80">
                  🏆 Rank #{result.rank}
                </span>
              )}
            </div>
          </div>
          <div className="text-center bg-white/20 rounded-xl px-4 py-3">
            <p className="text-3xl font-extrabold text-white">{percentage}%</p>
            <p className="text-xs text-white/70 mt-0.5">
              {result.obtained_marks}/{result.total_marks}
            </p>
            <span className={`mt-1 inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white`}>
              Grade {result.grade}
            </span>
          </div>
        </div>
      </div>

      {/* Subjects preview */}
      <div className="p-5">
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Subject-wise Performance
          </p>
          <button
            onClick={() => onViewDetails(result)}
            className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <Eye className="w-3 h-3" />
            View Details
          </button>
        </div>
        <div className="space-y-2.5">
          {result.subjects?.map((s, idx) => {
            const pct = (s.marks / s.total) * 100;
            const gradeCls = GRADE_COLORS[s.grade] || 'text-slate-600 bg-slate-50';
            return (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-sm text-slate-700 w-24 flex-shrink-0 font-medium truncate">
                  {s.name}
                </span>
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-indigo-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-slate-700 w-10 text-right">{s.marks}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${gradeCls}`}>
                  {s.grade}
                </span>
              </div>
            );
          })}
        </div>

        {result.subjects?.length > 3 && (
          <p className="text-xs text-slate-400 mt-3 text-center">
            +{result.subjects.length - 3} more subjects
          </p>
        )}
      </div>
    </div>
  );
};

// Statistics Cards Component
const StatisticsCards = ({ statistics }) => {
  if (!statistics) return null;

  const trendIcon = statistics.trend === 'improving' ? <TrendingUpIcon className="w-4 h-4 text-emerald-600" /> :
                    statistics.trend === 'declining' ? <TrendingDown className="w-4 h-4 text-red-600" /> :
                    <Minus className="w-4 h-4 text-amber-600" />;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-4 h-4 text-indigo-600" />
          <span className="text-xs text-slate-500">Average Score</span>
        </div>
        <p className="text-2xl font-extrabold text-slate-800">{statistics.overall_average || 0}%</p>
        <div className="flex items-center gap-1 mt-1">
          {trendIcon}
          <span className="text-xs capitalize text-slate-500">{statistics.trend || 'stable'}</span>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span className="text-xs text-slate-500">Total Exams</span>
        </div>
        <p className="text-2xl font-extrabold text-slate-800">{statistics.total_exams || 0}</p>
      </div>
      
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-4 h-4 text-indigo-600" />
          <span className="text-xs text-slate-500">Best Performance</span>
        </div>
        <p className="text-lg font-bold text-slate-800 truncate">
          {statistics.best_exam?.exam_name || '-'}
        </p>
        <p className="text-xs text-emerald-600">{statistics.best_exam?.percentage || 0}%</p>
      </div>
      
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-indigo-600" />
          <span className="text-xs text-slate-500">Top Subject</span>
        </div>
        {statistics.subject_wise && Object.entries(statistics.subject_wise).length > 0 && (
          <>
            <p className="text-lg font-bold text-slate-800 truncate">
              {Object.entries(statistics.subject_wise).sort((a, b) => b[1].average_percentage - a[1].average_percentage)[0]?.[0] || '-'}
            </p>
            <p className="text-xs text-emerald-600">
              {Math.round(Object.entries(statistics.subject_wise).sort((a, b) => b[1].average_percentage - a[1].average_percentage)[0]?.[1]?.average_percentage || 0)}%
            </p>
          </>
        )}
      </div>
    </div>
  );
};

// Subject Performance Component
const SubjectPerformance = ({ subjectStats }) => {
  if (!subjectStats || Object.keys(subjectStats).length === 0) return null;

  const sortedSubjects = Object.entries(subjectStats)
    .sort((a, b) => b[1].average_percentage - a[1].average_percentage);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-indigo-600" />
        Subject-wise Performance (Overall)
      </h2>
      <div className="space-y-4">
        {sortedSubjects.map(([subject, data]) => (
          <div key={subject}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-slate-700">{subject}</span>
              <span className="text-slate-500">{Math.round(data.average_percentage)}%</span>
            </div>
            <div className="flex gap-2 text-xs text-slate-500 mb-1">
              <span>Best: {Math.round(data.best_score)}%</span>
              <span>Exams: {data.exam_count}</span>
            </div>
            <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                style={{ width: `${data.average_percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Exam Type Breakdown Component
const ExamTypeBreakdown = ({ breakdown }) => {
  if (!breakdown || Object.keys(breakdown).length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
        <PieChart className="w-5 h-5 text-indigo-600" />
        Performance by Exam Type
      </h2>
      <div className="space-y-4">
        {Object.entries(breakdown).map(([type, data]) => {
          const TypeIcon = EXAM_TYPES[type]?.icon || FileText;
          return (
            <div key={type} className="p-3 bg-slate-50 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <TypeIcon className="w-4 h-4 text-indigo-600" />
                  <span className="font-semibold text-slate-700 capitalize">{type}</span>
                </div>
                <span className="text-sm font-bold text-indigo-600">{data.average_percentage}%</span>
              </div>
              <div className="bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all"
                  style={{ width: `${data.average_percentage}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">{data.count} exams taken</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Upcoming Exams Component
const UpcomingExams = ({ exams }) => {
  if (!exams || exams.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-indigo-600" />
        Upcoming Exams
      </h2>
      <div className="space-y-3">
        {exams.map((exam) => (
          <div key={exam.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
            <div>
              <p className="font-medium text-slate-800">{exam.name}</p>
              <p className="text-xs text-slate-500">
                {format(new Date(exam.start_date), 'dd MMM yyyy')} - {format(new Date(exam.end_date), 'dd MMM yyyy')}
              </p>
              <p className="text-xs text-slate-500 mt-1">{exam.subjects_count} subjects</p>
            </div>
            <div className="text-right">
              <Badge className="bg-amber-100 text-amber-700">
                {exam.type}
              </Badge>
              <p className="text-xs text-slate-500 mt-1">Total: {exam.total_marks} marks</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Results Page Component
export default function ParentResultsPage() {
  const { portalUser } = usePortalStore();
  const parent = portalUser;
  const t = getPortalTerms(parent?.institute_type);
  const children = parent?.children || [];

  const [selectedChild, setSelectedChild] = useState(0);
  const [examTypeFilter, setExamTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);

  const child = children[selectedChild];
  
  const { data: resultsData, isLoading } = useChildResults(child?.id, {
    exam_type: examTypeFilter !== 'all' ? examTypeFilter : null
  });
  
  const { data: statisticsData } = useResultStatistics(child?.id);

  const results = resultsData?.data?.results || [];
  const statistics = statisticsData?.data;
  const upcomingExams = resultsData?.data?.upcoming_exams || [];

  const handleViewDetails = (result) => {
    setSelectedResult(result);
    setShowResultModal(true);
  };

  const handleExport = () => {
    if (!results.length) return;
    
    const csvContent = [
      ['Exam Name', 'Type', 'Date', 'Percentage', 'Grade', 'Rank', 'Obtained Marks', 'Total Marks'].join(','),
      ...results.map(r => [
        r.exam_name,
        r.exam_type,
        format(new Date(r.date), 'yyyy-MM-dd'),
        r.percentage,
        r.grade,
        r.rank || '-',
        r.obtained_marks,
        r.total_marks
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `results_${child?.name}_${new Date().getFullYear()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Exam Results</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track academic performance, view detailed results, and monitor progress
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={!results.length}
          className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition flex items-center gap-2 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          Export Results
        </button>
      </div>

      {/* Child Selector */}
      {children.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {children.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setSelectedChild(i)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                selectedChild === i
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Child Info */}
      {child && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">{child.name}</h2>
              <p className="text-sm text-slate-500">
                Reg: {child.registration_no} | Class: {child.class} | Section: {child.section} | Roll: {child.roll_number}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {statistics && <StatisticsCards statistics={statistics} />}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-50"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          {showFilters && (
            <div className="flex flex-wrap gap-3">
              <select
                value={examTypeFilter}
                onChange={(e) => setExamTypeFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
              >
                <option value="all">All Exam Types</option>
                <option value="monthly">Monthly Tests</option>
                <option value="quarterly">Quarterly Exams</option>
                <option value="half_yearly">Half Yearly</option>
                <option value="annual">Annual Exams</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-500">Loading results...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="font-semibold text-slate-500">No results published yet</p>
          <p className="text-sm text-slate-400 mt-1">
            Results will appear here once published by the school
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {results.map((result, idx) => (
              <ResultCard
                key={`${result.exam_id}-${idx}`}
                result={result}
                childName={child?.name}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {/* Additional Analytics */}
          <div className="grid lg:grid-cols-2 gap-6">
            <SubjectPerformance subjectStats={statistics?.subject_wise} />
            <div className="space-y-6">
              <ExamTypeBreakdown breakdown={statistics?.exam_type_breakdown} />
              <UpcomingExams exams={upcomingExams} />
            </div>
          </div>
        </>
      )}

      {/* Result Details Modal */}
      <ResultDetailsModal
        result={selectedResult}
        isOpen={showResultModal}
        onClose={() => {
          setShowResultModal(false);
          setSelectedResult(null);
        }}
      />
    </div>
  );
}