/**
 * masterAdminDummyData.js
 * ─────────────────────────────────────────────────────────────
 * Single source of truth for ALL Master-Admin dummy/static data.
 * Import from here in every master-admin page — never duplicate.
 */

// ── Revenue trend (last 6 months) ──────────────────────────────────────────
export const REVENUE_TREND = [
  { month: 'Oct', revenue: 2100000 },
  { month: 'Nov', revenue: 2350000 },
  { month: 'Dec', revenue: 2150000 },
  { month: 'Jan', revenue: 2650000 },
  { month: 'Feb', revenue: 2845000 },
  { month: 'Mar', revenue: 3100000 },
];

// ── Institute-type distribution ──────────────────────────────────────────────
export const PIE_DATA = [
  { name: 'School',     value: 45, color: '#3b82f6' },
  { name: 'College',    value: 25, color: '#06b6d4' },
  { name: 'Coaching',   value: 18, color: '#f97316' },
  { name: 'Academy',    value: 8,  color: '#8b5cf6' },
  { name: 'University', value: 4,  color: '#ec4899' },
];

// ── Top performing institutes ────────────────────────────────────────────────
export const TOP_INSTITUTES = [
  { name: 'TCA Academy',       revenue: '₨ 4.5L', change: +12 },
  { name: 'Star Coaching',     revenue: '₨ 3.2L', change: +8  },
  { name: 'Punjab College',    revenue: '₨ 2.8L', change: -3  },
  { name: 'Horizon IT',        revenue: '₨ 2.1L', change: +21 },
  { name: 'Allied School FSD', revenue: '₨ 1.9L', change: +5  },
];

// ── Recent platform activities ───────────────────────────────────────────────
export const ACTIVITIES = [
  { time: '10:30 AM',  text: 'New Institute registered: "Elite Academy" — Lahore', type: 'success' },
  { time: '09:45 AM',  text: 'Payment received: ₨ 50,000 from City School',         type: 'success' },
  { time: '08:20 AM',  text: '5 subscriptions expiring in 7 days',                  type: 'warning' },
  { time: '07:15 AM',  text: 'System backup completed successfully (450 GB)',        type: 'info'    },
  { time: 'Yesterday', text: 'Star Coaching upgraded to Premium plan',              type: 'success' },
];

// ── Dashboard quick-action tiles ─────────────────────────────────────────────
export const QUICK_ACTIONS = [
  { label: '+ New Institute',  href: '/master-admin/schools',      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200'       },
  { label: 'Generate Invoice', href: '/master-admin/subscriptions', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200' },
  { label: 'Bulk Email',       href: '/master-admin/emails',        color: 'bg-violet-50 text-violet-700 hover:bg-violet-100 border-violet-200'    },
  { label: 'Create Report',    href: '/master-admin/reports',       color: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200'       },
  { label: 'Search Institute', href: '/master-admin/schools',       color: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-200'           },
  { label: 'System Health',    href: '#',                           color: 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200'            },
];

// ── Dummy email history (sent campaigns) ────────────────────────────────────
export const DUMMY_EMAIL_CAMPAIGNS = [
  {
    id: 1, subject: 'Platform Downtime Notice — 15 Mar', recipient_group: 'All Institutes',
    sent_to: 245, delivered: 240, opened: 180, failed: 5,
    status: 'sent', sent_at: '2026-03-05T10:00:00Z', sender: 'admin@clouds.edu.pk',
  },
  {
    id: 2, subject: 'Subscription Renewal Reminder — March 2026', recipient_group: 'Expiring Subs',
    sent_to: 38, delivered: 38, opened: 25, failed: 0,
    status: 'sent', sent_at: '2026-03-04T09:30:00Z', sender: 'admin@clouds.edu.pk',
  },
  {
    id: 3, subject: 'New Feature: Payroll Module Now Live', recipient_group: 'Premium & Enterprise',
    sent_to: 72, delivered: 71, opened: 55, failed: 1,
    status: 'sent', sent_at: '2026-03-02T14:00:00Z', sender: 'admin@clouds.edu.pk',
  },
  {
    id: 4, subject: 'Welcome to The Clouds Academy Platform', recipient_group: 'New Institutes (Mar)',
    sent_to: 8, delivered: 8, opened: 8, failed: 0,
    status: 'sent', sent_at: '2026-03-01T10:00:00Z', sender: 'admin@clouds.edu.pk',
  },
  {
    id: 5, subject: 'Invoice for Feb 2026 — Action Required', recipient_group: 'Overdue Accounts',
    sent_to: 14, delivered: 12, opened: 7, failed: 2,
    status: 'partial', sent_at: '2026-02-28T08:00:00Z', sender: 'admin@clouds.edu.pk',
  },
  {
    id: 6, subject: 'Monthly Newsletter — February 2026', recipient_group: 'All Institutes',
    sent_to: 238, delivered: 235, opened: 198, failed: 3,
    status: 'sent', sent_at: '2026-02-25T11:00:00Z', sender: 'admin@clouds.edu.pk',
  },
  {
    id: 7, subject: 'Security Update: 2FA Now Required', recipient_group: 'All Admins',
    sent_to: 245, delivered: 244, opened: 201, failed: 1,
    status: 'sent', sent_at: '2026-02-20T09:00:00Z', sender: 'admin@clouds.edu.pk',
  },
  {
    id: 8, subject: 'Q1 2026 Platform Report', recipient_group: 'All Institutes',
    sent_to: 245, delivered: 0, opened: 0, failed: 0,
    status: 'scheduled', sent_at: '2026-03-10T10:00:00Z', sender: 'admin@clouds.edu.pk',
  },
];

// ── Dummy revenue report rows ────────────────────────────────────────────────
export const DUMMY_REVENUE_REPORT = [
  { id: 1, institute: 'TCA Academy',        type: 'Academy',    plan: 'Premium',    amount: 45000, month: 'Mar 2026', status: 'paid', paid_on: '2026-03-01' },
  { id: 2, institute: 'Star Coaching',      type: 'Coaching',   plan: 'Standard',   amount: 32000, month: 'Mar 2026', status: 'paid', paid_on: '2026-03-02' },
  { id: 3, institute: 'Punjab College',     type: 'College',    plan: 'Premium',    amount: 28000, month: 'Mar 2026', status: 'paid', paid_on: '2026-03-03' },
  { id: 4, institute: 'Horizon IT',         type: 'Academy',    plan: 'Enterprise', amount: 21000, month: 'Mar 2026', status: 'paid', paid_on: '2026-03-01' },
  { id: 5, institute: 'Allied School FSD',  type: 'School',     plan: 'Basic',      amount: 19000, month: 'Mar 2026', status: 'paid', paid_on: '2026-03-04' },
  { id: 6, institute: 'Bahria School',      type: 'School',     plan: 'Standard',   amount: 17500, month: 'Mar 2026', status: 'pending', paid_on: null },
  { id: 7, institute: 'Al-Huda Academy',    type: 'Academy',    plan: 'Basic',      amount: 15000, month: 'Mar 2026', status: 'paid', paid_on: '2026-03-05' },
  { id: 8, institute: 'OPF School',         type: 'School',     plan: 'Standard',   amount: 14000, month: 'Mar 2026', status: 'overdue', paid_on: null },
  { id: 9, institute: 'KIPS Lahore',        type: 'Coaching',   plan: 'Enterprise', amount: 55000, month: 'Mar 2026', status: 'paid', paid_on: '2026-03-01' },
  { id: 10, institute: 'Beaconhouse',       type: 'School',     plan: 'Enterprise', amount: 75000, month: 'Mar 2026', status: 'paid', paid_on: '2026-03-01' },
  { id: 11, institute: 'City School',       type: 'School',     plan: 'Premium',    amount: 38000, month: 'Mar 2026', status: 'paid', paid_on: '2026-03-02' },
  { id: 12, institute: 'FG Degree College', type: 'College',    plan: 'Standard',   amount: 22000, month: 'Feb 2026', status: 'paid', paid_on: '2026-02-28' },
  { id: 13, institute: 'Superior College',  type: 'College',    plan: 'Premium',    amount: 35000, month: 'Feb 2026', status: 'paid', paid_on: '2026-02-27' },
  { id: 14, institute: 'UET Lahore',        type: 'University', plan: 'Enterprise', amount: 90000, month: 'Feb 2026', status: 'paid', paid_on: '2026-02-25' },
  { id: 15, institute: 'BZU Multan',        type: 'University', plan: 'Enterprise', amount: 85000, month: 'Feb 2026', status: 'overdue', paid_on: null },
];

// ── Dummy subscription report rows ──────────────────────────────────────────
export const DUMMY_SUBSCRIPTION_REPORT = [
  { id: 1,  institute: 'TCA Academy',        plan: 'Premium',    start: '2026-01-01', expires: '2026-12-31', status: 'active',    amount: 45000 },
  { id: 2,  institute: 'Star Coaching',      plan: 'Standard',   start: '2026-01-01', expires: '2026-06-30', status: 'active',    amount: 32000 },
  { id: 3,  institute: 'Punjab College',     plan: 'Premium',    start: '2025-04-01', expires: '2026-03-31', status: 'active',    amount: 28000 },
  { id: 4,  institute: 'Horizon IT',         plan: 'Enterprise', start: '2025-07-01', expires: '2026-06-30', status: 'active',    amount: 21000 },
  { id: 5,  institute: 'Allied School FSD',  plan: 'Basic',      start: '2025-09-01', expires: '2026-03-10', status: 'expiring',  amount: 19000 },
  { id: 6,  institute: 'Bahria School',      plan: 'Standard',   start: '2025-08-01', expires: '2026-03-08', status: 'expiring',  amount: 17500 },
  { id: 7,  institute: 'Al-Huda Academy',    plan: 'Basic',      start: '2025-12-01', expires: '2026-11-30', status: 'active',    amount: 15000 },
  { id: 8,  institute: 'OPF School',         plan: 'Standard',   start: '2025-06-01', expires: '2026-02-28', status: 'expired',   amount: 14000 },
  { id: 9,  institute: 'KIPS Lahore',        plan: 'Enterprise', start: '2026-01-01', expires: '2026-12-31', status: 'active',    amount: 55000 },
  { id: 10, institute: 'Beaconhouse',        plan: 'Enterprise', start: '2025-03-01', expires: '2026-02-28', status: 'expired',   amount: 75000 },
];

// ── Dummy institute (schools) report rows ────────────────────────────────────
export const DUMMY_INSTITUTES_REPORT = [
  { id: 1,  name: 'TCA Academy',        type: 'Academy',    city: 'Lahore',     plan: 'Premium',    students: 1200, teachers: 85, branches: 3, status: 'active',   joined: '2024-01-15' },
  { id: 2,  name: 'Star Coaching',      type: 'Coaching',   city: 'Lahore',     plan: 'Standard',   students: 850,  teachers: 40, branches: 1, status: 'active',   joined: '2024-03-10' },
  { id: 3,  name: 'Punjab College',     type: 'College',    city: 'Rawalpindi', plan: 'Premium',    students: 2200, teachers: 120, branches: 2, status: 'active',  joined: '2023-08-20' },
  { id: 4,  name: 'Horizon IT',         type: 'Academy',    city: 'Islamabad',  plan: 'Enterprise', students: 400,  teachers: 30, branches: 2, status: 'active',   joined: '2024-06-01' },
  { id: 5,  name: 'Allied School FSD',  type: 'School',     city: 'Faisalabad', plan: 'Basic',      students: 600,  teachers: 35, branches: 1, status: 'active',   joined: '2025-02-01' },
  { id: 6,  name: 'KIPS Lahore',        type: 'Coaching',   city: 'Lahore',     plan: 'Enterprise', students: 3000, teachers: 200, branches: 8, status: 'active',  joined: '2023-05-15' },
  { id: 7,  name: 'Beaconhouse',        type: 'School',     city: 'Lahore',     plan: 'Enterprise', students: 5000, teachers: 350, branches: 15, status: 'active', joined: '2023-01-10' },
  { id: 8,  name: 'OPF School',         type: 'School',     city: 'Rawalpindi', plan: 'Standard',   students: 700,  teachers: 45, branches: 1, status: 'inactive', joined: '2024-09-01' },
  { id: 9,  name: 'UET Lahore',         type: 'University', city: 'Lahore',     plan: 'Enterprise', students: 8000, teachers: 500, branches: 1, status: 'active',  joined: '2023-03-01' },
  { id: 10, name: 'BZU Multan',         type: 'University', city: 'Multan',     plan: 'Enterprise', students: 6500, teachers: 400, branches: 1, status: 'active',  joined: '2023-06-01' },
];

// ── Dummy user activity report rows ─────────────────────────────────────────
export const DUMMY_USER_ACTIVITY = [
  { id: 1,  name: 'Ahmed Raza',     role: 'School Admin',  institute: 'TCA Academy',    logins: 42, last_login: '2026-03-05T09:00:00Z', status: 'active' },
  { id: 2,  name: 'Sara Malik',     role: 'Teacher',       institute: 'Star Coaching',  logins: 38, last_login: '2026-03-05T08:30:00Z', status: 'active' },
  { id: 3,  name: 'Bilal Hussain',  role: 'School Admin',  institute: 'Punjab College', logins: 55, last_login: '2026-03-04T18:00:00Z', status: 'active' },
  { id: 4,  name: 'Nadia Khan',     role: 'Accountant',    institute: 'Horizon IT',     logins: 29, last_login: '2026-03-03T11:00:00Z', status: 'active' },
  { id: 5,  name: 'Usman Ali',      role: 'Teacher',       institute: 'KIPS Lahore',    logins: 61, last_login: '2026-03-05T10:00:00Z', status: 'active' },
  { id: 6,  name: 'Fatima Sheikh',  role: 'School Admin',  institute: 'Beaconhouse',    logins: 47, last_login: '2026-03-05T07:45:00Z', status: 'active' },
  { id: 7,  name: 'Hassan Qureshi', role: 'Teacher',       institute: 'OPF School',     logins: 12, last_login: '2026-02-20T09:00:00Z', status: 'inactive' },
  { id: 8,  name: 'Ayesha Siddiqui', role: 'Librarian',   institute: 'UET Lahore',     logins: 22, last_login: '2026-03-02T14:00:00Z', status: 'active' },
];

// ── Email recipient group options ────────────────────────────────────────────
export const EMAIL_RECIPIENT_GROUPS = [
  { value: 'all',           label: '📢 All Institutes (245)'          },
  { value: 'active',        label: '🟢 Active Institutes (198)'        },
  { value: 'inactive',      label: '🔴 Inactive Institutes (47)'       },
  { value: 'expiring',      label: '⚠️ Expiring Subscriptions (12)'   },
  { value: 'expired',       label: '🚫 Expired Subscriptions (28)'    },
  { value: 'plan_basic',    label: '💎 Basic Plan Institutes (98)'     },
  { value: 'plan_standard', label: '⭐ Standard Plan Institutes (75)'  },
  { value: 'plan_premium',  label: '👑 Premium Plan Institutes (45)'   },
  { value: 'plan_enterprise',label: '🏢 Enterprise Plan Institutes (27)' },
  { value: 'new_march',     label: '🆕 New This Month (8)'            },
  { value: 'all_admins',    label: '👤 All Institute Admins (245)'     },
  { value: 'overdue',       label: '🔔 Overdue Payments (14)'          },
];

// ── Email stats summary ──────────────────────────────────────────────────────
export const EMAIL_STATS = {
  total_sent:      1847,
  delivered:       1830,
  opened:          1420,
  failed:          17,
  open_rate:       77.6,
  delivery_rate:   99.1,
};

// ── Report summary stats ─────────────────────────────────────────────────────
export const REPORT_SUMMARY = {
  total_revenue_mtd:   3100000,
  total_revenue_ytd:  15145000,
  active_institutes:       198,
  expiring_subs:            12,
  overdue_payments:         14,
  new_institutes_mtd:        8,
};
// ── Per-Institute: Students ───────────────────────────────────────────────────
export const DUMMY_INSTITUTE_STUDENTS = [
  { id:'st-01', name:'Zaid Ahmed',        father:'Mr. Ahmed Ali',      gender:'Male',   dob:'2014-05-10', class:'Grade 6',  roll:'101', phone:'0311-1111111', fee_status:'paid',    status:'active',   admission_date:'2022-04-01', address:'House 12, DHA Lahore' },
  { id:'st-02', name:'Sana Butt',         father:'Mr. Imran Butt',     gender:'Female', dob:'2015-08-22', class:'Grade 5',  roll:'102', phone:'0312-2222222', fee_status:'paid',    status:'active',   admission_date:'2022-04-01', address:'Block C, Gulberg Lahore' },
  { id:'st-03', name:'Ali Hassan',        father:'Mr. Hassan Raza',    gender:'Male',   dob:'2013-11-03', class:'Grade 7',  roll:'103', phone:'0313-3333333', fee_status:'unpaid',  status:'active',   admission_date:'2021-08-10', address:'Street 5, Model Town' },
  { id:'st-04', name:'Maryam Khan',       father:'Mr. Usman Khan',     gender:'Female', dob:'2012-03-17', class:'Grade 8',  roll:'104', phone:'0321-4444444', fee_status:'paid',    status:'active',   admission_date:'2020-04-01', address:'Johar Town, Lahore' },
  { id:'st-05', name:'Bilal Sheikh',      father:'Mr. Tariq Sheikh',   gender:'Male',   dob:'2016-07-29', class:'Grade 4',  roll:'105', phone:'0333-5555555', fee_status:'partial', status:'active',   admission_date:'2023-04-01', address:'Bahria Town, Lahore' },
  { id:'st-06', name:'Hina Akhtar',       father:'Mr. Khalid Akhtar',  gender:'Female', dob:'2011-01-14', class:'Grade 9',  roll:'106', phone:'0345-6666666', fee_status:'paid',    status:'active',   admission_date:'2019-08-01', address:'Shadman, Lahore' },
  { id:'st-07', name:'Hamza Malik',       father:'Mr. Asif Malik',     gender:'Male',   dob:'2010-09-05', class:'Grade 10', roll:'107', phone:'0300-7777777', fee_status:'paid',    status:'active',   admission_date:'2018-04-01', address:'Icchra, Lahore' },
  { id:'st-08', name:'Fatima Noor',       father:'Mr. Noor Din',       gender:'Female', dob:'2015-04-18', class:'Grade 5',  roll:'108', phone:'0322-8888888', fee_status:'unpaid',  status:'inactive', admission_date:'2022-04-01', address:'Township, Lahore' },
  { id:'st-09', name:'Omer Farooq',       father:'Mr. Farooq Ahmed',   gender:'Male',   dob:'2013-06-12', class:'Grade 7',  roll:'109', phone:'0315-9999999', fee_status:'paid',    status:'active',   admission_date:'2021-04-01', address:'Garden Town, Lahore' },
  { id:'st-10', name:'Zara Hussain',      father:'Mr. Sajjad Hussain', gender:'Female', dob:'2014-12-01', class:'Grade 6',  roll:'110', phone:'0316-0000000', fee_status:'paid',    status:'active',   admission_date:'2022-08-01', address:'Wapda Town, Lahore' },
  { id:'st-11', name:'Usman Qureshi',     father:'Mr. Saeed Qureshi',  gender:'Male',   dob:'2012-02-25', class:'Grade 8',  roll:'111', phone:'0317-1111111', fee_status:'partial', status:'active',   admission_date:'2020-08-15', address:'Cantt, Lahore' },
  { id:'st-12', name:'Ayesha Riaz',       father:'Mr. Riaz Ahmed',     gender:'Female', dob:'2011-07-08', class:'Grade 9',  roll:'112', phone:'0318-2222222', fee_status:'paid',    status:'active',   admission_date:'2019-04-01', address:'Cavalry Ground, Lahore' },
  { id:'st-13', name:'Danish Iqbal',      father:'Mr. Iqbal Hussain',  gender:'Male',   dob:'2016-10-30', class:'Grade 4',  roll:'113', phone:'0319-3333333', fee_status:'paid',    status:'active',   admission_date:'2023-08-01', address:'Samnabad, Lahore' },
  { id:'st-14', name:'Rabia Saleem',      father:'Mr. Saleem Akhtar',  gender:'Female', dob:'2010-05-22', class:'Grade 10', roll:'114', phone:'0320-4444444', fee_status:'paid',    status:'active',   admission_date:'2018-08-01', address:'Misri Shah, Lahore' },
  { id:'st-15', name:'Talha Nawaz',       father:'Mr. Nawaz Ahmed',    gender:'Male',   dob:'2015-03-09', class:'Grade 5',  roll:'115', phone:'0323-5555555', fee_status:'unpaid',  status:'active',   admission_date:'2023-04-01', address:'Band Road, Lahore' },
];

// ── Per-Institute: Teachers ───────────────────────────────────────────────────
export const DUMMY_INSTITUTE_TEACHERS = [
  { id:'tc-01', name:'Mr. Hassan Raza',    subject:'Mathematics',  qualification:'M.Sc Mathematics', experience:'8 years',  phone:'0311-1010101', email:'hassan.raza@school.pk',   join_date:'2018-03-01', salary:60000, status:'active',   gender:'Male'   },
  { id:'tc-02', name:'Ms. Amna Siddiqui',  subject:'English',      qualification:'M.A English',       experience:'5 years',  phone:'0312-2020202', email:'amna.siddiqui@school.pk',  join_date:'2021-04-01', salary:50000, status:'active',   gender:'Female' },
  { id:'tc-03', name:'Mr. Tariq Mehmood',  subject:'Physics',      qualification:'M.Sc Physics',      experience:'12 years', phone:'0313-3030303', email:'tariq.mehmood@school.pk',  join_date:'2014-08-01', salary:70000, status:'active',   gender:'Male'   },
  { id:'tc-04', name:'Ms. Sara Naqvi',     subject:'Chemistry',    qualification:'M.Sc Chemistry',    experience:'7 years',  phone:'0314-4040404', email:'sara.naqvi@school.pk',     join_date:'2019-01-01', salary:55000, status:'active',   gender:'Female' },
  { id:'tc-05', name:'Mr. Kamran Waheed',  subject:'Biology',      qualification:'M.Sc Zoology',      experience:'6 years',  phone:'0315-5050505', email:'kamran.waheed@school.pk',  join_date:'2020-04-01', salary:52000, status:'active',   gender:'Male'   },
  { id:'tc-06', name:'Ms. Nadia Khan',     subject:'Urdu',         qualification:'M.A Urdu',          experience:'10 years', phone:'0316-6060606', email:'nadia.khan@school.pk',     join_date:'2016-08-01', salary:48000, status:'active',   gender:'Female' },
  { id:'tc-07', name:'Mr. Zahid Iqbal',    subject:'Computer',     qualification:'MS Computer Sci',   experience:'4 years',  phone:'0317-7070707', email:'zahid.iqbal@school.pk',    join_date:'2022-01-01', salary:65000, status:'active',   gender:'Male'   },
  { id:'tc-08', name:'Ms. Huma Qureshi',   subject:'Islamiat',     qualification:'M.A Islamic Studies','experience':'9 years',phone:'0318-8080808', email:'huma.qureshi@school.pk',  join_date:'2017-04-01', salary:45000, status:'inactive', gender:'Female' },
  { id:'tc-09', name:'Mr. Bilal Chaudhry', subject:'Pakistan Studies','qualification':'M.A History',   experience:'5 years',  phone:'0319-9090909', email:'bilal.chaudhry@school.pk',join_date:'2021-08-01', salary:46000, status:'active',   gender:'Male'   },
  { id:'tc-10', name:'Ms. Farah Anwar',    subject:'Arts',         qualification:'BFA Fine Arts',     experience:'3 years',  phone:'0320-0000101', email:'farah.anwar@school.pk',    join_date:'2023-04-01', salary:42000, status:'active',   gender:'Female' },
];

// ── Per-Institute: Parents ────────────────────────────────────────────────────
export const DUMMY_INSTITUTE_PARENTS = [
  { id:'pr-01', name:'Mr. Ahmed Ali',       phone:'0311-1111111', email:'ahmed.ali@gmail.com',      cnic:'35201-1234561-1', children:2, children_names:'Zaid, Zara',           status:'active', address:'House 12, DHA Lahore'         },
  { id:'pr-02', name:'Mr. Imran Butt',      phone:'0312-2222222', email:'imran.butt@hotmail.com',   cnic:'35201-2345672-3', children:1, children_names:'Sana',                 status:'active', address:'Block C, Gulberg Lahore'       },
  { id:'pr-03', name:'Mr. Hassan Raza',     phone:'0313-3333333', email:'hassan.raza@yahoo.com',    cnic:'35201-3456783-5', children:1, children_names:'Ali',                  status:'active', address:'Street 5, Model Town'         },
  { id:'pr-04', name:'Mr. Usman Khan',      phone:'0321-4444444', email:'usman.khan@gmail.com',     cnic:'35201-4567894-7', children:2, children_names:'Maryam, Talha',        status:'active', address:'Johar Town, Lahore'           },
  { id:'pr-05', name:'Mr. Tariq Sheikh',    phone:'0333-5555555', email:'tariq.sheikh@outlook.com', cnic:'35201-5678905-9', children:1, children_names:'Bilal',                status:'active', address:'Bahria Town, Lahore'          },
  { id:'pr-06', name:'Mr. Khalid Akhtar',   phone:'0345-6666666', email:'khalid.akhtar@gmail.com',  cnic:'35201-6789016-1', children:1, children_names:'Hina',                 status:'active', address:'Shadman, Lahore'              },
  { id:'pr-07', name:'Mr. Asif Malik',      phone:'0300-7777777', email:'asif.malik@gmail.com',     cnic:'35201-7890127-3', children:1, children_names:'Hamza',                status:'active', address:'Icchra, Lahore'               },
  { id:'pr-08', name:'Mr. Noor Din',        phone:'0322-8888888', email:'noor.din@yahoo.com',       cnic:'35201-8901238-5', children:2, children_names:'Fatima, Danish',       status:'inactive',address:'Township, Lahore'            },
  { id:'pr-09', name:'Mr. Farooq Ahmed',    phone:'0315-9999999', email:'farooq.ahmed@gmail.com',   cnic:'35201-9012349-7', children:1, children_names:'Omer',                 status:'active', address:'Garden Town, Lahore'          },
  { id:'pr-10', name:'Mr. Sajjad Hussain',  phone:'0316-0000000', email:'sajjad.hussain@gmail.com', cnic:'35201-0123450-9', children:1, children_names:'Zara',                 status:'active', address:'Wapda Town, Lahore'           },
  { id:'pr-11', name:'Mr. Saeed Qureshi',   phone:'0317-1010101', email:'saeed.qureshi@hotmail.com',cnic:'35201-1234561-1', children:1, children_names:'Usman',                status:'active', address:'Cantt, Lahore'                },
  { id:'pr-12', name:'Mr. Riaz Ahmed',      phone:'0318-2020202', email:'riaz.ahmed@gmail.com',     cnic:'35201-2345672-3', children:1, children_names:'Ayesha',               status:'active', address:'Cavalry Ground, Lahore'       },
];

// ── Per-Institute: Staff ──────────────────────────────────────────────────────
export const DUMMY_INSTITUTE_STAFF = [
  { id:'sf-01', name:'Mr. Usman Habib',    role:'Accountant',       department:'Finance',       phone:'0300-1010101', email:'usman.habib@school.pk',    join_date:'2020-01-15', salary:55000, status:'active'   },
  { id:'sf-02', name:'Ms. Asma Pervaiz',   role:'Admin Officer',    department:'Administration',phone:'0301-2020202', email:'asma.pervaiz@school.pk',   join_date:'2019-08-01', salary:45000, status:'active'   },
  { id:'sf-03', name:'Mr. Rashid Ali',     role:'Librarian',        department:'Library',       phone:'0302-3030303', email:'rashid.ali@school.pk',     join_date:'2021-04-01', salary:40000, status:'active'   },
  { id:'sf-04', name:'Ms. Samra Bibi',     role:'Receptionist',     department:'Front Office',  phone:'0303-4040404', email:'samra.bibi@school.pk',     join_date:'2022-01-01', salary:38000, status:'active'   },
  { id:'sf-05', name:'Mr. Ghulam Abbas',   role:'Peon',             department:'General',       phone:'0304-5050505', email:'ghulam.abbas@school.pk',   join_date:'2018-06-01', salary:28000, status:'active'   },
  { id:'sf-06', name:'Mr. Zulfiqar Ahmed', role:'Security Guard',   department:'Security',      phone:'0305-6060606', email:'zulfiqar.ahmed@school.pk', join_date:'2017-03-01', salary:30000, status:'inactive' },
];

// ── Notifications History ─────────────────────────────────────────────────────
export const DUMMY_NOTIFICATIONS_HISTORY = [
  { id:'notif-01', subject:'Welcome to TCA Platform',          type:'info',         recipients:'all', recipientLabel:'All Institutes',              message:'Dear Institute Admin, welcome to The Clouds Academy management platform. Your account is fully set up and ready to use. Please explore the dashboard to get started.',       sentAt:'2026-03-01T10:30:00', status:'sent',      sentBy:'Super Admin', scheduled:false },
  { id:'notif-02', subject:'Subscription Renewal Reminder',    type:'reminder',     recipients:'2',   recipientLabel:'Star Coaching — Karachi',      message:'Your subscription plan is expiring in 7 days. Please renew your plan before the due date to avoid any service interruption.',                                             sentAt:'2026-02-28T09:00:00', status:'sent',      sentBy:'Super Admin', scheduled:false },
  { id:'notif-03', subject:'System Maintenance Scheduled',     type:'warning',      recipients:'all', recipientLabel:'All Institutes',              message:'The platform will undergo scheduled maintenance on March 5, 2026 from 2:00 AM to 4:00 AM PKT. Services may be temporarily unavailable during this window.',              sentAt:'2026-02-27T14:00:00', status:'sent',      sentBy:'Super Admin', scheduled:false },
  { id:'notif-04', subject:'Invoice Generated for February',   type:'payment',      recipients:'all', recipientLabel:'All Institutes',              message:'Your invoice for the month of February 2026 has been generated and is available in your billing panel. Please review and process payment before due date.',               sentAt:'2026-03-01T08:00:00', status:'sent',      sentBy:'System',      scheduled:false },
  { id:'notif-05', subject:'Q1 Performance Report Available',  type:'announcement', recipients:'all', recipientLabel:'All Institutes',              message:'The Q1 2026 performance reports are now available. Login to your dashboard and navigate to the Reports section to view detailed analytics for your institute.',         sentAt:'2026-02-25T11:00:00', status:'sent',      sentBy:'Super Admin', scheduled:false },
  { id:'notif-06', subject:'Critical Security Update',         type:'alert',        recipients:'1',   recipientLabel:'TCA Academy — Lahore',         message:'A critical security vulnerability has been identified and patched. As a precautionary measure, please update your admin password immediately and review active sessions.',  sentAt:'2026-02-24T16:30:00', status:'sent',      sentBy:'Super Admin', scheduled:false },
  { id:'notif-07', subject:'Subscription Plan Upgraded',       type:'subscription', recipients:'3',   recipientLabel:'Beacon School — Islamabad',    message:'Your subscription has been successfully upgraded to the Enterprise plan. All new features including advanced analytics and unlimited branches are now active.',          sentAt:'2026-02-23T10:00:00', status:'sent',      sentBy:'Super Admin', scheduled:false },
  { id:'notif-08', subject:'New Feature: Payroll Module',      type:'announcement', recipients:'all', recipientLabel:'All Institutes',              message:'We are excited to announce the launch of the Payroll Management module. You can now manage staff salaries, deductions, and payslips directly from the admin panel.',    sentAt:'2026-02-20T09:00:00', status:'sent',      sentBy:'Super Admin', scheduled:false },
  { id:'notif-09', subject:'Fee Payment Overdue Alert',        type:'alert',        recipients:'5',   recipientLabel:'Elite Academy — Faisalabad',   message:'Your platform subscription fee payment is now overdue by 10 days. Please make payment immediately to avoid automatic suspension of your institute account.',           sentAt:'2026-02-18T13:00:00', status:'sent',      sentBy:'System',      scheduled:false },
  { id:'notif-10', subject:'Monthly Usage Summary — March',    type:'info',         recipients:'all', recipientLabel:'All Institutes',              message:'Your monthly usage summary for March 2026 has been compiled. Login to view detailed analytics including active users, sessions, and feature usage statistics.',           sentAt:'2026-03-05T08:00:00', status:'scheduled', sentBy:'Super Admin', scheduled:true,  scheduledAt:'2026-03-31T09:00:00' },
  { id:'notif-11', subject:'Upcoming Price Revision Notice',   type:'warning',      recipients:'all', recipientLabel:'All Institutes',              message:'Please note that our subscription plan prices will be revised effective from April 1, 2026. Your current pricing is locked until your next renewal cycle.',               sentAt:'2026-02-15T11:00:00', status:'sent',      sentBy:'Super Admin', scheduled:false },
  { id:'notif-12', subject:'Eid Holiday Office Closure',       type:'announcement', recipients:'all', recipientLabel:'All Institutes',              message:'Our offices will be closed from March 28 to April 2, 2026 for Eid ul-Fitr holidays. Support response times will be limited. We wish all institutes Eid Mubarak!',     sentAt:'2026-03-06T08:30:00', status:'scheduled', sentBy:'Super Admin', scheduled:true,  scheduledAt:'2026-03-25T10:00:00' },
  { id:'notif-13', subject:'Trial Period Ending Soon',         type:'reminder',     recipients:'7',   recipientLabel:'Scholars Hub — Multan',        message:'Your free 30-day trial period ends in 3 days. Please select and activate a paid subscription plan to continue accessing all premium features without interruption.',    sentAt:'2026-02-10T09:00:00', status:'sent',      sentBy:'System',      scheduled:false },
  { id:'notif-14', subject:'Monthly Data Backup Completed',    type:'info',         recipients:'all', recipientLabel:'All Institutes',              message:'Your monthly secure data backup has been completed successfully. All records including student data, fee history, and academic records are safely stored on cloud servers.', sentAt:'2026-02-01T03:00:00', status:'sent',      sentBy:'System',      scheduled:false },
  { id:'notif-15', subject:'Admin Panel Update v2.5 Live',     type:'announcement', recipients:'all', recipientLabel:'All Institutes',              message:'The Clouds Academy admin panel v2.5 is now live. This update includes improved performance, a refreshed UI, new report filters, and several critical bug fixes.',       sentAt:'2026-01-25T10:00:00', status:'sent',      sentBy:'Super Admin', scheduled:false },
];