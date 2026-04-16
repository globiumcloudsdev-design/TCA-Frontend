// src/components/portal/PortalShell.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";
import {
  GraduationCap,
  LayoutDashboard,
  Calendar,
  DollarSign,
  BookOpen,
  Bell,
  Clock,
  LogOut,
  Menu,
  Users,
  Briefcase,
  FileText,
  ClipboardList,
  NotebookPen,
  UserCheck,
  BookMarked,
  Settings,
  HelpCircle,
  ChevronDown,
  Award,
  TrendingUp,
  PieChart,
  MessageSquare,
  Home,
  Star,
  Heart,
  Dumbbell,
  Truck,
  Building,
  Library,
  AlertCircle,
  User,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import usePortalStore from "@/store/portalStore";
import useAuthStore from "@/store/authStore";
import { getPortalTerms, getNavItems } from "@/constants/portalInstituteConfig";
import { PERM } from "@/constants/permissions";

// ─── Nav helpers with updated permissions ────────────────────────────────────
function buildParentNav(t, navLabels) {
  return [
    {
      label: navLabels.overview,
      href: "/parent",
      icon: LayoutDashboard,
      permission: PERM.DASHBOARD_VIEW,
    },
    {
      // label: navLabels.attendance,
      label: 'Child Attendance',
      href: "/parent/attendance",
      icon: Calendar,
      permission: PERM.ATTENDANCE_VIEW,
    },
    {
      label: navLabels.results,
      href: "/parent/results",
      icon: BookOpen,
      permission: PERM.EXAM_RESULTS_VIEW,
    },
    {
      label: navLabels.fees,
      href: "/parent/fees",
      icon: DollarSign,
      permission: PERM.FEES_READ,
    },
    {
      label: navLabels.announcements,
      href: "/parent/announcements",
      icon: Bell,
      permission: PERM.NOTICES_READ,
    },
  ];
}

function buildStudentNav(t, navLabels) {
  return [
    {
      label: navLabels.overview,
      href: "/student",
      icon: LayoutDashboard,
      permission: PERM.DASHBOARD_VIEW,
    },
    {
      label: navLabels.myAttendance,
      href: "/student/attendance",
      icon: Calendar,
      permission: PERM.ATTENDANCE_VIEW,
    },
    {
      label: navLabels.myTimetable,
      href: "/student/timetable",
      icon: Clock,
      permission: PERM.TIMETABLE_READ,
    },
    {
      label: navLabels.syllabus,
      href: "/student/syllabus",
      icon: BookOpen,
      permission: PERM.ASSIGNMENTS_READ || PERM.SYLLABUS_READ,
    },
    {
      label: navLabels.assignments,
      href: "/student/assignments",
      icon: ClipboardList,
      permission: PERM.ASSIGNMENTS_READ,
    },
    {
      label: navLabels.homework,
      href: "/student/homework",
      icon: NotebookPen,
      permission: PERM.HOMEWORK_READ,
    },
    {
      label: navLabels.notes,
      href: "/student/notes",
      icon: FileText,
      permission: PERM.NOTES_READ,
    },
    {
      label: navLabels.announcements,
      href: "/student/announcements",
      icon: Bell,
      permission: PERM.NOTICES_READ,
    },
    {
      label: navLabels.exams,
      href: "/student/exams",
      icon: FileText,
      permission: PERM.EXAMS_READ,
    },
    // { label: navLabels.myFees, href: '/student/fees', icon: DollarSign, permission: PERM.FEES_READ },
  ];
}

function buildTeacherNav(t, navLabels) {
  return [
    {
      label: navLabels.overview,
      href: "/teacher",
      icon: LayoutDashboard,
      permission: PERM.DASHBOARD_VIEW,
    },
    {
      label: navLabels.myClasses,
      href: "/teacher/classes",
      icon: Briefcase,
      permission: PERM.CLASSES_READ,
    },
    {
      label: navLabels.myStudents,
      href: "/teacher/students",
      icon: Users,
      permission: PERM.STUDENTS_READ,
    },
    {
      label: navLabels.myTimetable,
      href: "/teacher/timetable",
      icon: Clock,
      permission: PERM.TIMETABLE_READ,
    },
    {
      label: navLabels.attendance,
      href: "/teacher/attendance",
      icon: Calendar,
      permission: PERM.ATTENDANCE_MARK,
    },
    {
      label: navLabels.homework,
      href: "/teacher/homework",
      icon: NotebookPen,
      permission: PERM.HOMEWORK_CREATE,
    },
    {
      label: navLabels.assignments,
      href: "/teacher/assignments",
      icon: ClipboardList,
      permission: PERM.ASSIGNMENTS_CREATE,
    },
    {
      label: navLabels.notes,
      href: "/teacher/notes",
      icon: FileText,
      permission: PERM.NOTES_CREATE,
    },
    // { label: t.notesLabel, href: '/teacher/study-material', icon: BookMarked, permission: PERM.NOTES_CREATE },
    // { label: t.syllabusLabel, href: '/teacher/syllabus', icon: BookOpen, permission: PERM.SYLLABUS_UPDATE },
    {
      label: t.examsLabel,
      href: "/teacher/exams",
      icon: FileText,
      permission: PERM.EXAMS_UPDATE,
    },
    // { label: t.resultsLabel, href: '/teacher/exam-results', icon: TrendingUp, permission: PERM.EXAM_RESULTS_ENTER },
    {
      label: navLabels.announcements,
      href: "/teacher/announcements",
      icon: Bell,
      permission: PERM.NOTICES_CREATE,
    },
    // { label: navLabels.reports, href: '/teacher/reports', icon: PieChart, permission: PERM.REPORTS_STUDENT },
    // { label: t.nav.grade, href: '/teacher/gradebook', icon: BookOpen, permission: PERM.EXAM_RESULTS_GRADE },
    // { label: navLabels.lessonPlans, href: '/teacher/lesson-plans', icon: FileText, permission: PERM.LESSON_PLANS_CREATE },
    // { label: t.profileLabel, href: '/teacher/profile', icon: User, permission: PERM.TEACHER_PROFILE_VIEW },
    // { label: t.achievementsLabel, href: '/teacher/achievements', icon: Award, permission: PERM.TEACHER_ACHIEVEMENTS },
    {
      label: "My Attendance",
      href: "/teacher/selfAttendance",
      icon: Calendar,
    },
    { label: "My Payroll", href: "/teacher/payroll", icon: DollarSign },
  ];
}
// ─────────────────────────────────────────────────────────────────────────────

export default function PortalShell({ children, type }) {
  const pathname = usePathname();
  const router = useRouter();
  const { portalUser, clearPortal, getInstituteType, canDo } = usePortalStore();
  const logout = useAuthStore((s) => s.logout);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const user = portalUser;

  useEffect(() => {
    if (usePortalStore.persist?.hasHydrated?.()) {
      setHydrated(true);
      return;
    }
    const unsub = usePortalStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    return () => unsub?.();
  }, []);

  // Redirect if not logged in
  // useEffect(() => {
  //   if (hydrated && !portalUser) {
  //     router.replace('/portal-login');
  //   }
  // }, [portalUser, hydrated, router]);

  useEffect(() => {
    const portalToken = Cookies.get("portal_token");

    if (hydrated && !portalUser && !portalToken) {
      router.replace("/portal-login");
    }
  }, [portalUser, hydrated, router]);

  // Mock notifications
  useEffect(() => {
    if (portalUser) {
      setNotifications([
        {
          id: 1,
          title: "New assignment added",
          time: "5 min ago",
          read: false,
        },
        { id: 2, title: "Attendance marked", time: "1 hour ago", read: false },
        { id: 3, title: "Fee due tomorrow", time: "2 hours ago", read: true },
      ]);
    }
  }, [portalUser]);

  if (!hydrated || !portalUser) {
    return null;
  }

  const instituteType = getInstituteType();
  const t = getPortalTerms(instituteType);
  const navLabels = getNavItems(instituteType, type);

  const isParent = type === "PARENT";
  const isTeacher = type === "TEACHER";
  const isStudent = type === "STUDENT";

  // Build and filter nav items by permissions
  const allNavItems = isParent
    ? buildParentNav(t, navLabels)
    : isTeacher
      ? buildTeacherNav(t, navLabels)
      : buildStudentNav(t, navLabels);
  
  // If permission is undefined, it's allowed by default (or handle specially)
  const navItems = allNavItems.filter((item) => {
    if (!item.permission) return true;
    return canDo(item.permission);
  });

  const themeClasses = isParent
    ? {
        accent: "indigo",
        activeBg: "bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600",
        sidebarHeader: "bg-gradient-to-b from-indigo-700 to-indigo-800",
        badge: "bg-indigo-100 text-indigo-700",
        button: "bg-indigo-600 hover:bg-indigo-700",
        lightBg: "bg-indigo-50",
        text: "text-indigo-600",
        border: "border-indigo-200",
        hover: "hover:bg-indigo-50",
      }
    : isTeacher
      ? {
          accent: "blue",
          activeBg: "bg-blue-50 text-blue-700 border-l-2 border-blue-600",
          sidebarHeader: "bg-gradient-to-b from-blue-700 to-sky-800",
          badge: "bg-blue-100 text-blue-700",
          button: "bg-blue-600 hover:bg-blue-700",
          lightBg: "bg-blue-50",
          text: "text-blue-600",
          border: "border-blue-200",
          hover: "hover:bg-blue-50",
        }
      : {
          accent: "emerald",
          activeBg:
            "bg-emerald-50 text-emerald-700 border-l-2 border-emerald-600",
          sidebarHeader: "bg-gradient-to-b from-emerald-700 to-emerald-800",
          badge: "bg-emerald-100 text-emerald-700",
          button: "bg-emerald-600 hover:bg-emerald-700",
          lightBg: "bg-emerald-50",
          text: "text-emerald-600",
          border: "border-emerald-200",
          hover: "hover:bg-emerald-50",
        };

  const displayName = isTeacher
    ? `${portalUser.first_name || ""} ${portalUser.last_name || ""}`.trim() ||
      t.teacherLabel
    : isParent
      ? portalUser?.name || "Parent"
      : `${portalUser.first_name || ""} ${portalUser.last_name || ""}`.trim() ||
        t.studentLabel;

  const displaySub = isTeacher
    ? portalUser?.details?.designation ||
      portalUser?.staff_type ||
      t.teacherLabel
    : isParent
      ? portalUser?.details?.relation
        ? `${portalUser.details.relation} · ${portalUser?.children?.length || 0} child(ren)`
        : "Parent Account"
      : portalUser?.details?.class_name ||
        portalUser?.class_name ||
        t.studentLabel;

  const portalLabel = isTeacher
    ? `${t.teacherLabel} Portal`
    : isParent
      ? "Parent Portal"
      : `${t.studentLabel} Portal`;

  const handleLogout = () => {
    clearPortal();
    logout();
    Cookies.remove("portal_token");
    Cookies.remove("portal_type");
    Cookies.remove("access_token");
    Cookies.remove("user_type");
    toast.success("Logged out successfully");
    router.replace("/portal-login");
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Sidebar header - Improved */}
      <div className={`${themeClasses.sidebarHeader} px-4 py-5`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">
              {user?.institute?.name ||
                user?.school?.name ||
                "The Clouds Academy"}
            </p>
            <p className="text-[10px] text-white/60 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
              {portalLabel}
            </p>
          </div>
        </div>

        {/* User info - Enhanced */}
        <div className="bg-white/10 rounded-xl px-3 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-white/30">
              <AvatarImage src={portalUser?.avatar_url} />
              <AvatarFallback
                className={`${isTeacher ? "bg-blue-500" : isParent ? "bg-indigo-500" : "bg-emerald-500"} text-white text-sm font-bold`}
              >
                {displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate flex items-center gap-1">
                {displayName}
                {isTeacher && (
                  <Badge
                    variant="outline"
                    className="text-[8px] px-1 py-0 h-3 bg-white/20 text-white border-white/30"
                  >
                    Staff
                  </Badge>
                )}
              </p>
              <p className="text-[10px] text-white/60 truncate flex items-center gap-1">
                <Mail className="w-2.5 h-2.5" />
                {portalUser?.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Nav - Original UI preserved */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {navItems.length === 0 ? (
          <p className="text-center text-sm text-slate-500 py-4">
            No menu items available
          </p>
        ) : (
          navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? themeClasses.activeBg
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${isActive ? "" : "opacity-70"}`}
                />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })
        )}
      </nav>

      {/* Footer - Original */}
      <div className="px-3 py-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop Sidebar - Original width w-60 */}
      <aside className="hidden md:flex md:flex-col w-60 bg-white border-r border-slate-200 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-10 w-60 bg-white flex flex-col h-full shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navbar - Improved Header */}
        <header className="bg-white border-b border-slate-200 px-4 h-16 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
                {navItems.find(
                  (n) =>
                    n.href === pathname || pathname.startsWith(n.href + "/"),
                )?.label || t.overviewLabel}
                {isTeacher && (
                  <Badge
                    variant="outline"
                    className={`${themeClasses.lightBg} ${themeClasses.text} border-0 text-xs`}
                  >
                    Teacher
                  </Badge>
                )}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:flex items-center gap-1">
                <Home className="w-3 h-3" />
                {portalLabel} · {user?.institute?.name || "The Clouds Academy"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-slate-600 hover:bg-slate-100"
              onClick={() => toast.info("Notifications coming soon")}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>

            {/* User Role Badge - Original preserved */}
            <span
              className={`hidden sm:inline-flex text-xs font-semibold px-3 py-1.5 rounded-full ${themeClasses.badge}`}
            >
              {isTeacher
                ? `👨‍🏫 ${t.teacherLabel}`
                : isParent
                  ? "👨‍👩‍👧 Parent"
                  : `🎓 ${t.studentLabel}`}
            </span>

            {/* Profile Dropdown Menu - New */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2 hover:bg-slate-100"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={portalUser?.avatar_url} />
                    <AvatarFallback
                      className={`${isTeacher ? "bg-blue-500" : isParent ? "bg-indigo-500" : "bg-emerald-500"} text-white text-xs`}
                    >
                      {displayName[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-slate-700">
                      {displayName}
                    </p>
                    <p className="text-xs text-slate-500">{displaySub}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 hidden lg:block" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="flex items-center gap-3 p-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback
                      className={`${isTeacher ? "bg-blue-500" : isParent ? "bg-indigo-500" : "bg-emerald-500"} text-white`}
                    >
                      {displayName[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{displayName}</p>
                    <p className="text-xs text-slate-500">
                      {portalUser?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link
                    href={`/${type.toLowerCase()}/profile`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href={`/${type.toLowerCase()}/settings`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link
                    href={`/${type.toLowerCase()}/help`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>Help & Support</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <a
                    href="mailto:support@thecloudsacademy.com"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Contact Support</span>
                  </a>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content - Original padding preserved */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
