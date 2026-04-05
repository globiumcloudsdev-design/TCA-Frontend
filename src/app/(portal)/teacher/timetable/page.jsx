//src/app/teacher/timetable/page.jsx
'use client';

import { useState } from 'react';
import { CalendarDays, Clock3, MapPin, BookOpen, Users, LayoutGrid, List } from 'lucide-react';
import { getPortalTerms } from '@/constants/portalInstituteConfig';
import { useTeacherTimetable } from '@/hooks/useTeacherPortal';
import useAuthStore from '@/store/authStore';

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const DAY_LABELS = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
};

const DAY_COLORS = [
    { dot: '#185FA5', light: '#E6F1FB', text: '#0C447C', bar: '#378ADD', badge: '#B5D4F4' },
    { dot: '#0F6E56', light: '#E1F5EE', text: '#085041', bar: '#1D9E75', badge: '#9FE1CB' },
    { dot: '#993556', light: '#FBEAF0', text: '#72243E', bar: '#D4537E', badge: '#F4C0D1' },
    { dot: '#854F0B', light: '#FAEEDA', text: '#633806', bar: '#BA7517', badge: '#FAC775' },
    { dot: '#533AB7', light: '#EEEDFE', text: '#3C3489', bar: '#7F77DD', badge: '#CECBF6' },
    { dot: '#A32D2D', light: '#FCEBEB', text: '#791F1F', bar: '#E24B4A', badge: '#F7C1C1' },
];

const PERIOD_COLORS = [
    { bg: '#E6F1FB', color: '#0C447C' },
    { bg: '#E1F5EE', color: '#085041' },
    { bg: '#EEEDFE', color: '#3C3489' },
    { bg: '#FAEEDA', color: '#633806' },
    { bg: '#FBEAF0', color: '#72243E' },
    { bg: '#EAF3DE', color: '#27500A' },
];

function getTodayKey() {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
}

function getWeekLabel() {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay() + 1);
    const end = new Date(start);
    end.setDate(start.getDate() + 5);
    const fmt = (d) => d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
    return `${fmt(start)} – ${fmt(end)}`;
}

export default function TeacherTimetablePage() {
    const user = useAuthStore((state) => state.user);
    const t = getPortalTerms(user?.institute_type || 'school');
    const { timetable, loading } = useTeacherTimetable();

    const [activeDay, setActiveDay] = useState('all');
    const [view, setView] = useState('grid');

    const todayKey = getTodayKey();

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-3 p-6">
                    <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                    <span className="text-sm text-slate-500">Loading timetable...</span>
                </div>
            </div>
        );
    }

    // Stats
    let totalPeriods = 0;
    const uniqueClasses = new Set();
    const workingDays = DAY_ORDER.filter((d) => (timetable?.[d] || []).length > 0);
    DAY_ORDER.forEach((d) => {
        (timetable?.[d] || []).forEach((s) => {
            totalPeriods++;
            uniqueClasses.add(`${s.class || ''}${s.section_name || ''}`);
        });
    });

    const visibleDays = activeDay === 'all' ? DAY_ORDER : [activeDay];

    return (
        <div className="max-w-5xl mx-auto space-y-5">

            {/* ── Header ── */}
            <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-[22px] font-bold text-slate-900 flex items-center gap-2.5">
                            <span className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <CalendarDays className="w-[18px] h-[18px] text-blue-600" />
                            </span>
                            {t.nav.myTimetable}
                        </h1>
                        <p className="text-sm text-slate-400 mt-1 ml-11">Your assigned classes and periods for each day</p>
                    </div>
                    <span className="text-xs font-medium bg-slate-100 text-slate-500 rounded-full px-3 py-1.5 border border-slate-200">
                        {getWeekLabel()}
                    </span>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-2">
                    {[
                        { label: 'Total periods / week', val: totalPeriods },
                        { label: 'Classes assigned', val: uniqueClasses.size },
                        { label: 'Working days', val: workingDays.length },
                    ].map((s) => (
                        <span key={s.label} className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-3 py-1">
                            <strong className="text-slate-800 font-medium">{s.val}</strong> {s.label}
                        </span>
                    ))}
                </div>

                {/* Controls row */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    {/* Day filter */}
                    <div className="flex flex-wrap gap-1.5">
                        <button
                            onClick={() => setActiveDay('all')}
                            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                                activeDay === 'all'
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
                            }`}
                        >
                            All days
                        </button>
                        {DAY_ORDER.map((day) => (
                            <button
                                key={day}
                                onClick={() => setActiveDay(day)}
                                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                                    activeDay === day
                                        ? 'bg-slate-900 text-white border-slate-900'
                                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
                                }`}
                            >
                                {DAY_LABELS[day].slice(0, 3)}
                                {day === todayKey ? ' ·' : ''}
                            </button>
                        ))}
                    </div>

                    {/* View toggle */}
                    <div className="flex border border-slate-200 rounded-lg overflow-hidden">
                        {[
                            { key: 'grid', icon: LayoutGrid, label: 'Grid' },
                            { key: 'list', icon: List, label: 'Table' },
                        ].map(({ key, icon: Icon, label }) => (
                            <button
                                key={key}
                                onClick={() => setView(key)}
                                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 transition-all ${
                                    view === key
                                        ? 'bg-slate-100 text-slate-800'
                                        : 'bg-white text-slate-400 hover:text-slate-700'
                                } ${key !== 'grid' ? 'border-l border-slate-200' : ''}`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Grid View ── */}
            {view === 'grid' && (
                <div className="grid md:grid-cols-2 gap-3">
                    {visibleDays.map((day, di) => {
                        const slots = timetable?.[day] || [];
                        const c = DAY_COLORS[di % DAY_COLORS.length];
                        const isToday = day === todayKey;

                        return (
                            <div
                                key={day}
                                className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
                                style={{ borderLeft: `3px solid ${c.dot}` }}
                            >
                                {/* Day header */}
                                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="w-2 h-2 rounded-full flex-shrink-0"
                                            style={{ background: c.dot }}
                                        />
                                        <p className="text-sm font-medium text-slate-800">{DAY_LABELS[day]}</p>
                                        {isToday && (
                                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: c.light, color: c.text }}>
                                                Today
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-full px-2 py-0.5">
                                        {slots.length} {slots.length === 1 ? 'period' : 'periods'}
                                    </span>
                                </div>

                                {/* Slots */}
                                {slots.length === 0 ? (
                                    <div className="px-4 py-8 flex flex-col items-center gap-2">
                                        <BookOpen className="w-5 h-5 text-slate-200" />
                                        <p className="text-xs text-slate-400">No classes scheduled</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-50">
                                        {slots.map((slot) => {
                                            const pc = PERIOD_COLORS[((slot.period || 1) - 1) % PERIOD_COLORS.length];
                                            return (
                                                <div
                                                    key={slot.id}
                                                    className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors"
                                                >
                                                    {/* Period badge */}
                                                    <span
                                                        className="text-[10px] font-medium rounded-lg flex items-center justify-center w-7 h-7 flex-shrink-0 mt-0.5"
                                                        style={{ background: pc.bg, color: pc.color }}
                                                    >
                                                        P{slot.period || '-'}
                                                    </span>

                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-slate-800 truncate">{slot.subject || 'Subject'}</p>
                                                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                                                            {slot.class || 'Class'}
                                                            {slot.section_name ? ` · Sec ${slot.section_name}` : ''}
                                                        </p>
                                                        <div className="mt-2 flex flex-wrap gap-3">
                                                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                                                                <Clock3 className="w-3 h-3" />
                                                                {slot.start_time || '--:--'} – {slot.end_time || '--:--'}
                                                            </span>
                                                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                                                                <MapPin className="w-3 h-3" />
                                                                Room {slot.room || '-'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Table View ── */}
            {view === 'list' && (
                <div className="flex flex-col gap-3">
                    {visibleDays.map((day, di) => {
                        const slots = timetable?.[day] || [];
                        const c = DAY_COLORS[di % DAY_COLORS.length];
                        const isToday = day === todayKey;

                        return (
                            <div key={day} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                                {/* Day header */}
                                <div className="px-4 py-3 flex items-center gap-3 border-b border-slate-100">
                                    <div className="w-1 h-5 rounded-full flex-shrink-0" style={{ background: c.bar }} />
                                    <p className="text-sm font-medium text-slate-800">{DAY_LABELS[day]}</p>
                                    {isToday && (
                                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: c.light, color: c.text }}>
                                            Today
                                        </span>
                                    )}
                                    <span className="ml-auto text-xs text-slate-400">
                                        {slots.length} {slots.length === 1 ? 'period' : 'periods'}
                                    </span>
                                </div>

                                {slots.length === 0 ? (
                                    <div className="px-4 py-6 text-center text-xs text-slate-400">No classes scheduled</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50">
                                                    {['Period', 'Subject', 'Class', 'Time', 'Room'].map((h) => (
                                                        <th key={h} className="text-left text-[11px] font-medium text-slate-400 px-4 py-2.5 border-b border-slate-100 whitespace-nowrap">
                                                            {h}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {slots.map((slot) => {
                                                    const pc = PERIOD_COLORS[((slot.period || 1) - 1) % PERIOD_COLORS.length];
                                                    return (
                                                        <tr key={slot.id} className="hover:bg-slate-50 transition-colors">
                                                            <td className="px-4 py-3">
                                                                <span
                                                                    className="text-[10px] font-medium rounded-md inline-flex items-center justify-center w-[22px] h-[22px]"
                                                                    style={{ background: pc.bg, color: pc.color }}
                                                                >
                                                                    P{slot.period || '-'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{slot.subject || 'Subject'}</td>
                                                            <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                                                                {slot.class || ''}
                                                                {slot.section_name ? ` · Sec ${slot.section_name}` : ''}
                                                            </td>
                                                            <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-xs">
                                                                {slot.start_time || '--:--'} – {slot.end_time || '--:--'}
                                                            </td>
                                                            <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">Room {slot.room || '-'}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}