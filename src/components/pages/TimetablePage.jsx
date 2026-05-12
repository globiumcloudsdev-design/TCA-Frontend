// src/components/pages/TimetablePage.jsx

'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { createPortal } from 'react-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  Plus, Pencil, Trash2, GripVertical, Calendar, Clock,
  BookOpen, Users, DoorOpen, Copy, Power, Eye, Filter, Settings, Sun, AlertTriangle, Coffee, Utensils,
  Download, Printer
} from 'lucide-react';
import { toast } from 'sonner';

import useAuthStore from '@/store/authStore';
import useInstituteStore from '@/store/instituteStore';
import useInstituteConfig from '@/hooks/useInstituteConfig';

import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import SelectField from '@/components/common/SelectField';
import InputField from '@/components/common/InputField';
import FormSubmitButton from '@/components/common/FormSubmitButton';
import ErrorAlert from '@/components/common/ErrorAlert';
import PageLoader from '@/components/common/PageLoader';
import ButtonLoader from '@/components/common/ButtonLoader';
import StatusBadge from '@/components/common/StatusBadge';
import TimePickerField from '@/components/common/TimePickerField';
import DatePickerField from '@/components/common/DatePickerField';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

// Import services
import { classService } from '@/services/classService';
import { teacherService } from '@/services/teacherService';
import { academicYearService } from '@/services/academicYearService';
import { timetableService } from '@/services/timetableService';

// Days Constants
const ALL_DAYS = [
  { value: 'monday', label: 'Monday', short: 'Mon' },
  { value: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { value: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { value: 'thursday', label: 'Thursday', short: 'Thu' },
  { value: 'friday', label: 'Friday', short: 'Fri' },
  { value: 'saturday', label: 'Saturday', short: 'Sat' },
  { value: 'sunday', label: 'Sunday', short: 'Sun' }
];

// Entity type mapping
const getEntityTypeFromInstitute = (instituteType) => {
  const mapping = {
    school: 'school',
    coaching: 'coaching',
    academy: 'academy',
    college: 'college',
    university: 'university',
    tuition_center: 'school'
  };
  return mapping[instituteType] || 'school';
};

const TYPE = 'TIMETABLE_SLOT';

// Subject color mapping
const SUBJECT_COLORS = {
  'Mathematics': 'bg-blue-100 text-blue-700 border-blue-200',
  'Physics': 'bg-purple-100 text-purple-700 border-purple-200',
  'Chemistry': 'bg-green-100 text-green-700 border-green-200',
  'Biology': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'English': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Urdu': 'bg-orange-100 text-orange-700 border-orange-200',
  'Islamiat': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Computer': 'bg-pink-100 text-pink-700 border-pink-200',
  'History': 'bg-amber-100 text-amber-700 border-amber-200',
  'Geography': 'bg-teal-100 text-teal-700 border-teal-200',
  'default': 'bg-gray-100 text-gray-700 border-gray-200'
};

// Break icon mapping
const getBreakIcon = (breakName) => {
  const name = breakName?.toLowerCase() || '';
  if (name.includes('lunch') || name.includes('food')) return <Utensils size={14} />;
  if (name.includes('coffee') || name.includes('tea')) return <Coffee size={14} />;
  if (name.includes('prayer')) return <Clock size={14} />;
  return <Clock size={14} />;
};

/* ---------- Timetable Cell Component ---------- */
function TimetableCell({ slot, day, period, periodConfig, onDrop, onEdit, onDelete, isBusyTeacher }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: TYPE,
    item: slot,
    canDrag: !!slot && !slot.is_break, // Break slots cannot be dragged
    collect: (monitor) => ({ isDragging: monitor.isDragging() })
  }));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: TYPE,
    drop: (item) => onDrop(item, day, period),
    collect: (monitor) => ({ isOver: monitor.isOver() })
  }));

  const periodInfo = periodConfig?.periods?.find(p => p.period === period);
  const getSubjectColor = (subject) => SUBJECT_COLORS[subject] || SUBJECT_COLORS.default;
  
  const hasConflict = slot && isBusyTeacher && !slot.is_break;

  // Break period rendering
  if (slot?.is_break) {
    return (
      <div className="h-24 rounded-lg border-2 border-dashed border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-2">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="flex items-center gap-1 text-amber-600 mb-1">
            {getBreakIcon(slot.break_name)}
            <p className="font-semibold text-sm">{slot.break_name || 'Break'}</p>
          </div>
          {periodInfo && (
            <p className="text-xs text-amber-500">
              {periodInfo.start_time} - {periodInfo.end_time}
            </p>
          )}
          <p className="text-[10px] text-amber-400 mt-1">Non-editable</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={cn(
        'relative h-24 rounded-lg border-2 transition-all duration-200',
        isOver && 'border-primary bg-primary/5',
        isDragging && 'opacity-50',
        hasConflict && 'border-red-400 bg-red-50',
        slot ? 'cursor-move hover:shadow-md' : 'cursor-pointer hover:border-dashed hover:border-primary'
      )}
      onClick={() => !slot && onEdit({ day, period })}
    >
      {slot ? (
        <div className={cn('h-full w-full rounded-lg p-2', getSubjectColor(slot.subject_name), hasConflict && 'ring-1 ring-red-400')}>
          <div className="flex items-start justify-between">
            <GripVertical size={14} className="opacity-50" />
            <div className="flex gap-1">
              <button onClick={(e) => { e.stopPropagation(); onEdit(slot); }} className="rounded p-1 hover:bg-black/5">
                <Pencil size={12} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(slot); }} className="rounded p-1 hover:bg-black/5 text-destructive">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
          <div className="mt-1 space-y-1">
            <p className="font-semibold text-sm truncate">{slot.subject_name}</p>
            <p className="text-xs opacity-75 truncate flex items-center gap-1">
              👨‍🏫 {slot.teacher_name}
              {hasConflict && (
                <span className="text-red-500 text-[10px]" title="Teacher already busy at this time">
                  ⚠️
                </span>
              )}
            </p>
            {slot.room_no && (
              <p className="text-xs opacity-50 flex items-center gap-1">
                <DoorOpen size={10} /> {slot.room_no}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center text-muted-foreground hover:text-primary">
          <Plus size={24} />
        </div>
      )}
    </div>
  );
}

/* ---------- Period & Days Config Modal ---------- */
function TimetableConfigModal({ open, onClose, onSubmit, initialConfig = null, loading }) {
  const [periods, setPeriods] = useState([]);
  const [breaks, setBreaks] = useState([]);
  const [totalPeriods, setTotalPeriods] = useState(8);
  const [selectedDays, setSelectedDays] = useState([]);
  
  // Extra Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().split('T')[0]);
  const [effectiveTo, setEffectiveTo] = useState('');

  // Initialize form when modal opens
  useEffect(() => {
    if (open) {
      if (initialConfig) {
        // Edit mode - use existing config
        setName(initialConfig.name || '');
        setDescription(initialConfig.description || '');
        setIsActive(initialConfig.is_active !== false);
        setEffectiveFrom(initialConfig.effective_from ? new Date(initialConfig.effective_from).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
        setEffectiveTo(initialConfig.effective_to ? new Date(initialConfig.effective_to).toISOString().split('T')[0] : '');

        const config = initialConfig.period_config || {};
        setTotalPeriods(config.total_periods || 8);
        setPeriods(config.periods || []);
        setBreaks(config.breaks || []);
        setSelectedDays(config.days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
      } else {
        // Create mode
        setName('');
        setDescription('');
        setIsActive(true);
        setEffectiveFrom(new Date().toISOString().split('T')[0]);
        setEffectiveTo('');
        
        setTotalPeriods(8);
        const defaultPeriods = [];
        let currentTime = 8 * 60; // 8:00 AM
        
        for (let i = 1; i <= 8; i++) {
          const startHour = Math.floor(currentTime / 60);
          const startMin = currentTime % 60;
          const startTime = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
          
          let endTime;
          if (i === 4) {
            endTime = '10:30';
            currentTime = 10 * 60 + 30;
          } else if (i === 6) {
            endTime = '12:30';
            currentTime = 12 * 60 + 30;
          } else if (i === 7) {
            endTime = '14:10';
            currentTime = 14 * 60 + 10;
          } else {
            currentTime += 40;
            const endHour = Math.floor(currentTime / 60);
            const endMin = currentTime % 60;
            endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
          }
          
          defaultPeriods.push({
            period: i,
            start_time: startTime,
            end_time: endTime,
            name: `Period ${i}`,
            type: 'study'
          });
        }
        
        setPeriods(defaultPeriods);
        setBreaks([
          { name: 'Prayer Break', start_time: '10:30', end_time: '11:00' },
          { name: 'Lunch Break', start_time: '12:30', end_time: '13:30' },
          { name: 'Tea Break', start_time: '15:00', end_time: '15:15' }
        ]);
        setSelectedDays(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
      }
    }
  }, [open, initialConfig]);

  // Update periods when totalPeriods changes
  const handleTotalPeriodsChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setTotalPeriods('');
      return;
    }

    let newTotal = parseInt(val) || 1;
    
    // Safety limit to prevent browser hang
    if (newTotal > 15) {
      toast.error('Maximum 15 periods allowed per day');
      newTotal = 15;
    }
    
    setTotalPeriods(newTotal);

    setPeriods(prev => {
      const newPeriods = [];
      let currentTime = 8 * 60; // 8:00 AM
      
      for (let i = 1; i <= newTotal; i++) {
        const existing = prev.find(p => p.period === i);
        if (existing) {
          newPeriods.push(existing);
        } else {
          const startHour = Math.floor(currentTime / 60);
          const startMin = currentTime % 60;
          const startTime = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
          
          currentTime += 40;
          const endHour = Math.floor(currentTime / 60);
          const endMin = currentTime % 60;
          const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
          
          newPeriods.push({
            period: i,
            start_time: startTime,
            end_time: endTime,
            name: `Period ${i}`,
            type: 'study'
          });
        }
      }
      return newPeriods;
    });
  };

  // Toggle day selection
  const toggleDay = (dayValue) => {
    setSelectedDays(prev =>
      prev.includes(dayValue)
        ? prev.filter(d => d !== dayValue)
        : [...prev, dayValue]
    );
  };

  // Select all days
  const selectAllDays = () => {
    setSelectedDays(ALL_DAYS.map(d => d.value));
  };

  // Clear all days
  const clearAllDays = () => {
    setSelectedDays([]);
  };

  // Update period field
  const handlePeriodChange = (index, field, value) => {
    const updatedPeriods = [...periods];
    updatedPeriods[index] = { ...updatedPeriods[index], [field]: value };
    setPeriods(updatedPeriods);
  };

  // Update break field
  const handleBreakChange = (index, field, value) => {
    const updatedBreaks = [...breaks];
    updatedBreaks[index] = { ...updatedBreaks[index], [field]: value };
    setBreaks(updatedBreaks);
  };

  // Add new break
  const handleAddBreak = () => {
    setBreaks([...breaks, { name: '', start_time: '', end_time: '' }]);
  };

  // Remove break
  const handleRemoveBreak = (index) => {
    const updatedBreaks = breaks.filter((_, i) => i !== index);
    setBreaks(updatedBreaks);
  };

  // Validate form
  const validateForm = () => {
    if (selectedDays.length === 0) {
      toast.error('Please select at least one day');
      return false;
    }

    for (let i = 0; i < periods.length; i++) {
      const p = periods[i];
      if (!p.start_time || !p.end_time) {
        toast.error(`Period ${p.period} timing required`);
        return false;
      }
      if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(p.start_time)) {
        toast.error(`Period ${p.period} start time invalid`);
        return false;
      }
      if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(p.end_time)) {
        toast.error(`Period ${p.period} end time invalid`);
        return false;
      }
    }

    for (let i = 0; i < breaks.length; i++) {
      const b = breaks[i];
      if (!b.name || !b.start_time || !b.end_time) {
        toast.error(`Break ${i + 1} incomplete`);
        return false;
      }
      if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(b.start_time)) {
        toast.error(`Break ${i + 1} start time invalid`);
        return false;
      }
      if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(b.end_time)) {
        toast.error(`Break ${i + 1} end time invalid`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const data = {
      name: name || '',
      description: description || '',
      is_active: isActive,
      effective_from: effectiveFrom,
      effective_to: effectiveTo || null,
      period_config: {
        total_periods: totalPeriods,
        periods: periods,
        breaks: breaks,
        days: selectedDays,
        days_count: selectedDays.length
      }
    };

    onSubmit(data);
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={initialConfig ? "Edit Timetable Configuration" : "Configure Timetable"}
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="gap-2">
            {loading && <ButtonLoader />}
            {initialConfig ? 'Update Timetable' : 'Create Timetable'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Timetable Name</Label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Class 1 Section A Timetable"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
          <DatePickerField
            label="Effective From"
            name="effective_from"
            value={effectiveFrom}
            onChange={setEffectiveFrom}
            required
          />
          <DatePickerField
            label="Effective To (Optional)"
            name="effective_to"
            value={effectiveTo}
            onChange={setEffectiveTo}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="modal_is_active" 
            checked={isActive} 
            onCheckedChange={setIsActive} 
          />
          <Label htmlFor="modal_is_active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Timetable is Active
          </Label>
        </div>

        <Separator />

        {/* Days Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Working Days</Label>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={selectAllDays}>
                Select All
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={clearAllDays}>
                Clear
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ALL_DAYS.map(day => (
              <div key={day.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${day.value}`}
                  checked={selectedDays.includes(day.value)}
                  onCheckedChange={() => toggleDay(day.value)}
                />
                <Label htmlFor={`day-${day.value}`} className="text-sm cursor-pointer">
                  {day.label}
                </Label>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Selected: {selectedDays.length} days ({selectedDays.map(d => 
              ALL_DAYS.find(day => day.value === d)?.short
            ).join(', ')})
          </p>
        </div>

        <Separator />

        {/* Total Periods */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Total Periods Per Day</Label>
          <input
            type="number"
            value={totalPeriods}
            onChange={handleTotalPeriodsChange}
            min="1"
            max="12"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </div>

        {/* Periods List */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Period Timings</h3>
          <div className="space-y-3">
            {periods.map((period, index) => (
              <div key={period.period} className="grid grid-cols-4 gap-2 items-center">
                <span className="text-sm font-medium">Period {period.period}</span>
                <TimePickerField
                  mode="google"
                  value={period.start_time}
                  onChange={(value) => handlePeriodChange(index, 'start_time', value)}
                />
                <span className="text-center text-sm">to</span>
                <TimePickerField
                  mode="google"
                  value={period.end_time}
                  onChange={(value) => handlePeriodChange(index, 'end_time', value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Break Periods */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold">Break Periods</h3>
            <Button type="button" variant="outline" size="sm" onClick={handleAddBreak}>
              <Plus className="h-4 w-4 mr-2" />
              Add Break
            </Button>
          </div>
          <div className="space-y-3">
            {breaks.map((breakPeriod, index) => (
              <div key={index} className="grid grid-cols-6 gap-2 items-center">
                <input
                  type="text"
                  value={breakPeriod.name}
                  onChange={(e) => handleBreakChange(index, 'name', e.target.value)}
                  placeholder="Break name (e.g., Prayer Break, Lunch Break)"
                  className="col-span-2 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
                <TimePickerField
                  mode="google"
                  value={breakPeriod.start_time}
                  onChange={(value) => handleBreakChange(index, 'start_time', value)}
                />
                <span className="text-center text-sm">to</span>
                <TimePickerField
                  mode="google"
                  value={breakPeriod.end_time}
                  onChange={(value) => handleBreakChange(index, 'end_time', value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveBreak(index)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Info about breaks in timetable */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 <span className="font-semibold">Note:</span> Break periods will automatically appear as non-editable slots in your timetable.
            You can configure breaks anytime from the Settings button. Break slots cannot be dragged, edited, or deleted from the timetable grid.
          </p>
        </div>
      </div>
    </AppModal>
  );
}

/* ---------- Main Component ---------- */
export default function TimetablePage({ type }) {
  const queryClient = useQueryClient();
  const { canDo } = useAuthStore();
  const { currentInstitute } = useInstituteStore();
  const { terms } = useInstituteConfig();

  const entityType = getEntityTypeFromInstitute(type);

  // State
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [deletingSlot, setDeletingSlot] = useState(null);
  const [periodConfig, setPeriodConfig] = useState(null);
  const [busyTeachers, setBusyTeachers] = useState([]);
  const [isCheckingBusyTeachers, setIsCheckingBusyTeachers] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printSettings, setPrintSettings] = useState({
    paperSize: 'a4',
    orientation: 'landscape',
    print: false
  });

  // Data states
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedClassData, setSelectedClassData] = useState(null);
  const [activeDays, setActiveDays] = useState([]);

  // Filter Form
  const {
    control: filterControl,
    watch: filterWatch,
    setValue: setFilterValue,
    reset: resetFilters
  } = useForm({
    defaultValues: {
      academic_year: '',
      class: '',
      section: '',
    }
  });

  const watchedAcademicYear = filterWatch('academic_year');
  const watchedClass = filterWatch('class');
  const watchedSection = filterWatch('section');

  // Update selected values
  useEffect(() => {
    setSelectedAcademicYear(watchedAcademicYear || '');
  }, [watchedAcademicYear]);

  useEffect(() => {
    setSelectedClass(watchedClass || '');
    setSelectedSection('');
    setFilterValue('section', '');

    if (watchedClass) {
      const classData = classes.find(c => c.id === watchedClass);
      setSelectedClassData(classData);
      setSections(classData?.sections || []);

      // Extract subjects from courses
      const extractedSubjects = [];
      if (classData?.courses?.length) {
        classData.courses.forEach(course => {
          if (course?.name) {
            extractedSubjects.push({
              id: course.id,
              name: course.name,
              code: course.course_code || ''
            });
          }
          // Also extract from materials if available
          if (course?.materials?.length) {
            course.materials.forEach(m => {
              if (m.subject_name && !extractedSubjects.find(s => s.name === m.subject_name)) {
                extractedSubjects.push({
                  id: m.subject_id || m.subject_name,
                  name: m.subject_name,
                  code: ''
                });
              }
            });
          }
        });
      }

      // Remove duplicates
      const uniqueSubjects = Array.from(
        new Map(extractedSubjects.map(s => [s.id, s])).values()
      );
      setSubjects(uniqueSubjects);
    } else {
      setSelectedClassData(null);
      setSections([]);
      setSubjects([]);
    }
  }, [watchedClass, classes, setFilterValue]);

  useEffect(() => {
    setSelectedSection(watchedSection || '');
  }, [watchedSection]);

  // Fetch Academic Years
  const { data: academicYearsData, isLoading: academicYearsLoading } = useQuery({
    queryKey: ['academic-years', currentInstitute?.id],
    queryFn: () => academicYearService.getAll({ institute_id: currentInstitute?.id, is_active: true }),
    enabled: !!currentInstitute?.id,
  });

  useEffect(() => {
    if (academicYearsData?.data && !watchedAcademicYear) {
      setAcademicYears(academicYearsData.data);
      const currentYear = academicYearsData.data.find(y => y.is_current);
      if (currentYear) {
        setFilterValue('academic_year', String(currentYear.id));
      } else if (academicYearsData.data.length > 0) {
        setFilterValue('academic_year', String(academicYearsData.data[0].id));
      }
    } else if (academicYearsData?.data) {
      setAcademicYears(academicYearsData.data);
    }
  }, [academicYearsData, watchedAcademicYear, setFilterValue]);

  // Fetch Classes
  const { data: classesData, isLoading: classesLoading } = useQuery({
    queryKey: ['classes', currentInstitute?.id, selectedAcademicYear],
    queryFn: () => classService.getAll({
      institute_id: currentInstitute?.id,
      academic_year_id: selectedAcademicYear,
      is_active: true
    }),
    enabled: !!currentInstitute?.id && !!selectedAcademicYear,
  });

  useEffect(() => {
    if (classesData?.data) {
      setClasses(classesData.data);
    }
  }, [classesData]);

  // Fetch Teachers
  const { data: teachersData, isLoading: teachersLoading } = useQuery({
    queryKey: ['teachers', currentInstitute?.id],
    queryFn: () => teacherService.getAll({
      institute_id: currentInstitute?.id,
      is_active: true,
      limit: 200
    }),
    enabled: !!currentInstitute?.id,
  });

  useEffect(() => {
    if (teachersData?.data) {
      setTeachers(teachersData.data);
    }
  }, [teachersData]);

  // Fetch timetables
  const {
    data: timetablesData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['timetables', currentInstitute?.id, selectedAcademicYear, entityType, selectedClass, selectedSection],
    queryFn: () => timetableService.getAll({
      academic_year_id: selectedAcademicYear,
      entity_type: entityType,
      class_id: selectedClass || undefined,
      section_id: selectedSection || undefined
    }),
    enabled: !!currentInstitute?.id && !!selectedAcademicYear,
  });

  const timetables = timetablesData?.data || [];

  // Current timetable
  const currentTimetable = useMemo(() => {
    if (!timetables.length) return null;
    const entityIds = {};
    if (selectedClass) entityIds.class_id = selectedClass;
    if (selectedSection) entityIds.section_id = selectedSection;
    return timetables.find(t =>
      t.entity_type === entityType &&
      Object.keys(entityIds).every(key => t.entity_ids?.[key] === entityIds[key])
    );
  }, [timetables, entityType, selectedClass, selectedSection]);

  // Function to fetch busy teachers
  const fetchBusyTeachers = useCallback(async (day, period) => {
    if (!day || !period || !currentTimetable) return;
    
    setIsCheckingBusyTeachers(true);
    try {
      const periodInfo = currentTimetable.period_config?.periods?.find(p => p.period === parseInt(period));
      
      const response = await timetableService.getBusyTeachers({
        day,
        period,
        start_time: periodInfo?.start_time,
        end_time: periodInfo?.end_time,
        exclude_timetable_id: currentTimetable.id,
        class_id: selectedClass,
        section_id: selectedSection
      });
      
      if (response.success) {
        setBusyTeachers(response.data?.busyTeachers || []);
      }
    } catch (error) {
      console.error('Error fetching busy teachers:', error);
      setBusyTeachers([]);
    } finally {
      setIsCheckingBusyTeachers(false);
    }
  }, [currentTimetable, selectedClass, selectedSection]);

  // Update active days when timetable changes
  useEffect(() => {
    if (currentTimetable?.period_config?.days) {
      setActiveDays(currentTimetable.period_config.days);
    } else {
      setActiveDays(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
    }
  }, [currentTimetable]);

  // Filter days based on active days
  const displayedDays = useMemo(() => {
    return ALL_DAYS.filter(day => activeDays.includes(day.value));
  }, [activeDays]);

  // Create busy teachers map for quick lookup
  const busyTeachersMap = useMemo(() => {
    const map = {};
    busyTeachers.forEach(id => { map[id] = true; });
    return map;
  }, [busyTeachers]);

  // Generate break slots from config
  const getBreakSlots = useCallback(() => {
    if (!currentTimetable?.period_config?.breaks) return [];
    
    const breakSlots = [];
    const breaks = currentTimetable.period_config.breaks;
    const periods = currentTimetable.period_config.periods;
    
    breaks.forEach(breakItem => {
      // Find which period this break falls into or between
      const periodIndex = periods.findIndex(p => 
        p.start_time <= breakItem.start_time && p.end_time >= breakItem.end_time
      );
      
      if (periodIndex !== -1) {
        const period = periods[periodIndex];
        breakSlots.push({
          id: `break-${breakItem.name}-${period.period}`,
          period: period.period,
          is_break: true,
          break_name: breakItem.name,
          break_start: breakItem.start_time,
          break_end: breakItem.end_time
        });
      }
    });
    
    return breakSlots;
  }, [currentTimetable]);

  // Merge regular slots with break slots
  const mergedSlots = useMemo(() => {
    if (!currentTimetable?.slots) return [];
    
    const regularSlots = currentTimetable.slots;
    const breakSlots = getBreakSlots();
    
    // Remove any regular slots that are in break periods (prevent conflicts)
    const filteredRegularSlots = regularSlots.filter(slot => {
      const breakSlot = breakSlots.find(b => b.period === slot.period);
      return !breakSlot; // Don't allow regular slots in break periods
    });
    
    return [...filteredRegularSlots, ...breakSlots];
  }, [currentTimetable, getBreakSlots]);

  // Grid
  const grid = useMemo(() => {
    const g = {};
    displayedDays.forEach(d => { g[d.value] = {}; });
    
    if (currentTimetable?.slots) {
      currentTimetable.slots.forEach(slot => {
        if (slot.period && displayedDays.some(d => d.value === slot.day)) {
          g[slot.day][slot.period] = slot;
        }
      });
    }
    
    return g;
  }, [currentTimetable?.slots, displayedDays]);

  // Combined sequence of periods and breaks for row rendering
  const timeSequence = useMemo(() => {
    if (!currentTimetable?.period_config) return [];
    
    const { periods = [], breaks = [] } = currentTimetable.period_config;
    
    const combined = [
      ...periods.map(p => ({ ...p, is_break: false, key: `period-${p.period}` })),
      ...breaks.map((b, idx) => ({ ...b, is_break: true, key: `break-${idx}`, period: null }))
    ];
    
    // Sort by start time
    return combined.sort((a, b) => {
      const aTime = a.start_time || '00:00';
      const bTime = b.start_time || '00:00';
      return aTime.localeCompare(bTime);
    });
  }, [currentTimetable?.period_config]);

  // Mutations
  const createTimetableMutation = useMutation({
    mutationFn: (data) => timetableService.create(data),
    onSuccess: () => {
      toast.success('Timetable created successfully');
      queryClient.invalidateQueries({ queryKey: ['timetables'] });
      setConfigModalOpen(false);
    },
    onError: (error) => toast.error(error.message || 'Failed to create timetable')
  });

  const updateTimetableMutation = useMutation({
    mutationFn: ({ id, data }) => timetableService.update(id, data),
    onSuccess: () => {
      toast.success('Timetable updated successfully');
      queryClient.invalidateQueries({ queryKey: ['timetables'] });
      setConfigModalOpen(false);
      setPeriodConfig(null);
    },
    onError: (error) => toast.error(error.message || 'Failed to update timetable')
  });

  const addSlotMutation = useMutation({
    mutationFn: ({ id, data }) => timetableService.update(id, data),
    onSuccess: () => {
      toast.success('Slot added successfully');
      queryClient.invalidateQueries({ queryKey: ['timetables'] });
      setModalOpen(false);
      setEditingSlot(null);
      setBusyTeachers([]);
    },
    onError: (error) => toast.error(error.message || 'Failed to add slot')
  });

  const deleteSlotMutation = useMutation({
    mutationFn: ({ id, data }) => timetableService.update(id, data),
    onSuccess: () => {
      toast.success('Slot deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['timetables'] });
      setDeletingSlot(null);
    },
    onError: (error) => toast.error(error.message || 'Failed to delete slot')
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }) => timetableService.toggleStatus(id, isActive),
    onSuccess: (data) => {
      toast.success(data.message || 'Status updated');
      queryClient.invalidateQueries({ queryKey: ['timetables'] });
    },
    onError: (error) => toast.error(error.message || 'Failed to update status')
  });

  // Slot Form
  const { control, register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      day: '',
      period: '',
      subject_id: '',
      teacher_id: '',
      room_no: '',
      is_break: false,
      break_name: ''
    }
  });

  const watchedDay = watch('day');
  const watchedPeriod = watch('period');
  const watchedIsBreak = watch('is_break');

  // Watch day and period changes to fetch busy teachers
  useEffect(() => {
    if (watchedDay && watchedPeriod && !watchedIsBreak && currentTimetable) {
      fetchBusyTeachers(watchedDay, watchedPeriod);
    } else {
      setBusyTeachers([]);
    }
  }, [watchedDay, watchedPeriod, watchedIsBreak, currentTimetable, fetchBusyTeachers]);

  // Check if selected period is a break period
  const isBreakPeriod = useCallback((day, period) => {
    if (!currentTimetable?.period_config?.breaks) return false;
    return grid[day]?.[period]?.is_break === true;
  }, [currentTimetable, grid]);

  // Auto-fill room number
  useEffect(() => {
    if (selectedSection && selectedClassData) {
      const section = selectedClassData.sections?.find(s => s.id === selectedSection);
      if (section?.room_no) {
        setValue('room_no', section.room_no);
      }
    }
  }, [selectedSection, selectedClassData, setValue]);

  // Teacher options with disabled state for busy teachers
  const teacherOptions = useMemo(() => {
    const options = [
      { value: '', label: 'Select Teacher', disabled: false }
    ];
    
    teachers.forEach(teacher => {
      const isBusy = busyTeachers.includes(teacher.id);
      
      options.push({
        value: teacher.id,
        label: `${teacher.first_name} ${teacher.last_name}${isBusy ? ' (Busy at this time)' : ''}`,
        disabled: isBusy // COMPLETELY DISABLE busy teachers
      });
    });
    
    return options;
  }, [teachers, busyTeachers]);

  // Handlers
  const handleDropSlot = async (draggedSlot, newDay, newPeriod) => {
    if (!currentTimetable) {
      toast.error('Please select/create a timetable first');
      return;
    }
    
    // Prevent dropping onto break periods
    if (isBreakPeriod(newDay, newPeriod)) {
      toast.error('Cannot drop slot onto a break period');
      return;
    }
    
    // Prevent dragging break slots
    if (draggedSlot.is_break) {
      toast.error('Break slots cannot be moved');
      return;
    }
    
    if (draggedSlot.day === newDay && draggedSlot.period === newPeriod) return;

    const periodInfo = currentTimetable.period_config?.periods?.find(p => p.period === newPeriod);
    
    const conflictCheck = await timetableService.checkConflict({
      teacher_id: draggedSlot.teacher_id,
      day: newDay,
      period: newPeriod,
      start_time: periodInfo?.start_time,
      end_time: periodInfo?.end_time,
      exclude_id: draggedSlot.id
    });

    if (conflictCheck.data?.hasConflict) {
      toast.error(`${draggedSlot.teacher_name} is already assigned at this time in another class`);
      return;
    }

    const updatedSlots = currentTimetable.slots.map(slot =>
      slot.id === draggedSlot.id
        ? { ...slot, day: newDay, period: newPeriod, updated_at: new Date().toISOString() }
        : slot
    );

    addSlotMutation.mutate({
      id: currentTimetable.id,
      data: { slots: updatedSlots }
    });
  };

  const handleEditSlot = (slotData) => {
    if (!currentTimetable) {
      toast.error('Please select/create a timetable first');
      return;
    }

    // Prevent editing break slots
    if (slotData?.is_break) {
      toast.error('Break periods cannot be edited. Please modify breaks in configuration.');
      return;
    }

    if (slotData?.id) {
      // Existing slot edit
      setEditingSlot(slotData);
      reset({
        day: slotData.day,
        period: String(slotData.period),
        subject_id: slotData.subject_id || '',
        teacher_id: slotData.teacher_id || '',
        room_no: slotData.room_no || '',
        is_break: false,
        break_name: ''
      });
    } else {
      // NEW SLOT (table click)
      // Check if trying to add to break period
      if (isBreakPeriod(slotData.day, slotData.period)) {
        toast.error('Cannot add slot to a break period. Please modify breaks in configuration if needed.');
        return;
      }
      
      setEditingSlot(null);
      const sectionRoom = selectedSection && selectedClassData
        ? selectedClassData.sections?.find(s => s.id === selectedSection)?.room_no
        : '';

      reset({
        day: slotData.day,
        period: String(slotData.period),
        subject_id: '',
        teacher_id: '',
        room_no: sectionRoom || '',
        is_break: false,
        break_name: ''
      });
    }
    setModalOpen(true);
  };

  const handleDeleteSlot = (slot) => {
    // Prevent deleting break slots
    if (slot?.is_break) {
      toast.error('Break periods cannot be deleted. Please modify breaks in configuration.');
      return;
    }
    setDeletingSlot(slot);
  };

  const handleCreateTimetable = () => {
    if (!selectedClass) {
      toast.error('Please select a class');
      return;
    }
    setPeriodConfig(null);
    setConfigModalOpen(true);
  };

  const handleEditConfig = () => {
    if (currentTimetable) {
      setPeriodConfig(currentTimetable);
      setConfigModalOpen(true);
    }
  };

  const handleConfigSubmit = (formData) => {
    const entityIds = {};
    let autoName = '';

    if (entityType === 'school') {
      entityIds.class_id = selectedClass;
      const classObj = classes.find(c => c.id === selectedClass);
      autoName = classObj?.name || 'Class';

      if (selectedSection) {
        entityIds.section_id = selectedSection;
        const section = classObj?.sections?.find(s => s.id === selectedSection);
        autoName += ` - ${section?.name || 'Section'}`;
      }
    }

    const payload = {
      ...formData,
      name: formData.name || `${autoName} Timetable`,
      academic_year_id: selectedAcademicYear,
      entity_type: entityType,
      entity_ids: entityIds,
    };

    if (currentTimetable) {
      // Update existing timetable
      updateTimetableMutation.mutate({
        id: currentTimetable.id,
        data: payload
      });
    } else {
      // Create new timetable
      createTimetableMutation.mutate({
        ...payload,
        slots: []
      });
    }
  };

  const validateTeacherSelection = (teacherId) => {
    if (busyTeachers.includes(teacherId)) {
      toast.error('This teacher is already busy at this time period! Please select another time or teacher.');
      return false;
    }
    return true;
  };

  const handleExportPDF = async (settings = {}) => {
    if (!currentTimetable) return;

    const { 
      paperSize = 'a4', 
      orientation = 'landscape',
      print = false
    } = settings;

    toast.loading(print ? 'Preparing for print...' : 'Preparing PDF...', { id: 'export-pdf' });

    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF({
        orientation: orientation === 'landscape' ? 'l' : 'p',
        unit: 'mm',
        format: paperSize,
      });

      const margin = 15;
      let yPos = margin;

      // 1. Branding & Header
      const instituteName = currentInstitute?.name || 'THE CLOUDS ACADEMY';
      const instituteLogo = currentInstitute?.logo_url;
      const instituteAddress = currentInstitute?.address || '';

      // Logo with compression to keep PDF small
      if (instituteLogo) {
        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = instituteLogo;
          await new Promise((resolve) => {
            img.onload = () => {
              const ratio = img.width / img.height;
              // Use JPEG and compression to keep file size tiny
              doc.addImage(img, 'JPEG', margin, yPos, 15 * ratio, 15, undefined, 'FAST');
              resolve();
            };
            img.onerror = resolve;
            setTimeout(resolve, 2000);
          });
        } catch (e) { console.error('Logo load failed', e); }
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(30, 41, 59);
      doc.text(instituteName.toUpperCase(), margin + (instituteLogo ? 25 : 0), yPos + 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(instituteAddress, margin + (instituteLogo ? 25 : 0), yPos + 12);

      // Title Section
      yPos += 25;
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('WEEKLY CLASS TIMETABLE', margin, yPos);
      
      if (currentTimetable?.name) {
        yPos += 6;
        doc.setFontSize(11);
        doc.setTextColor(71, 85, 105);
        doc.text(`${currentTimetable.name} (${currentTimetable.is_active ? 'ACTIVE' : 'INACTIVE'})`, margin, yPos);
      }

      // Class Info
      yPos += 7;
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      const classObj = classes.find(c => c.id === selectedClass);
      const sectionObj = sections.find(s => s.id === selectedSection);
      const yearObj = academicYears.find(y => String(y.id) === String(selectedAcademicYear));

      let infoText = `${terms.primary_unit || 'Class'}: ${classObj?.name || 'N/A'}`;
      if (sectionObj) infoText += `  |  ${terms.grouping_unit || 'Section'}: ${sectionObj.name}`;
      infoText += `  |  Session: ${yearObj?.name || 'N/A'}`;

      doc.text(infoText, margin, yPos);

      yPos += 10;

      // 2. Table Generation
      const tableHeaders = ['PERIOD', ...displayedDays.map(d => d.label.toUpperCase())];
      
      const tableBody = timeSequence.map(item => {
        if (item.is_break) {
          return [
            { 
              content: `${item.name?.toUpperCase() || 'BREAK'}\n(${item.start_time} - ${item.end_time})`, 
              colSpan: tableHeaders.length,
              styles: { 
                halign: 'center', 
                fillColor: [255, 251, 235],
                textColor: [180, 83, 9],
                fontStyle: 'bold',
                cellPadding: 4
              } 
            }
          ];
        }

        const row = [
          { content: `PERIOD ${item.period}\n${item.start_time} - ${item.end_time}`, styles: { fontStyle: 'bold' } }
        ];

        displayedDays.forEach(day => {
          const slot = grid[day.value]?.[item.period];
          if (slot) {
            row.push(`${slot.subject_name}\n${slot.teacher_name}${slot.room_no ? `\nRoom: ${slot.room_no}` : ''}`);
          } else {
            row.push('—');
          }
        });

        return row;
      });

      autoTable(doc, {
        head: [tableHeaders],
        body: tableBody,
        startY: yPos,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 3,
          valign: 'middle',
          halign: 'center',
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 30, halign: 'left', fillColor: [248, 250, 252] },
        },
        didDrawPage: (data) => {
          // Footer removed as requested
        },
      });

      if (print) {
        window.print();
        toast.success('Opening print dialog...', { id: 'export-pdf' });
      } else {
        doc.save(`Timetable_${classObj?.name || 'Class'}_${sectionObj?.name || 'All'}.pdf`);
        toast.success('Timetable exported successfully!', { id: 'export-pdf' });
      }
    } catch (error) {
      console.error('Export failed', error);
      toast.error('Failed to export PDF', { id: 'export-pdf' });
    }
  };

  const onSubmitSlot = async (formData) => {
    if (!currentTimetable) return;

    // Validate teacher is not busy
    if (formData.teacher_id && !formData.is_break) {
      if (!validateTeacherSelection(formData.teacher_id)) {
        return;
      }

      const periodInfo = currentTimetable.period_config?.periods?.find(p => p.period === parseInt(formData.period));
      
      const conflictCheck = await timetableService.checkConflict({
        teacher_id: formData.teacher_id,
        day: formData.day,
        period: formData.period,
        start_time: periodInfo?.start_time,
        end_time: periodInfo?.end_time,
        exclude_id: editingSlot?.id
      });

      if (conflictCheck.data?.hasConflict) {
        toast.error('Teacher already assigned at this time in another class');
        return;
      }
    }

    // Prevent adding break slots via form (breaks should only come from config)
    if (formData.is_break) {
      toast.error('Break periods can only be configured in timetable settings');
      return;
    }

    let updatedSlots = [...(currentTimetable.slots || [])];

    // Remove any existing slot at this day/period (replace)
    updatedSlots = updatedSlots.filter(slot => 
      !(slot.day === formData.day && slot.period === parseInt(formData.period))
    );

    const subject = subjects.find(s => s.id === formData.subject_id);
    const teacher = teachers.find(t => t.id === formData.teacher_id);
    
    const newSlot = {
      id: editingSlot?.id || `slot-${Date.now()}-${Math.random()}`,
      day: formData.day,
      period: parseInt(formData.period),
      subject_id: formData.subject_id,
      subject_name: subject?.name || '',
      teacher_id: formData.teacher_id,
      teacher_name: teacher ? `${teacher.first_name} ${teacher.last_name}` : '',
      room_no: formData.room_no,
      is_break: false,
      created_at: editingSlot?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    updatedSlots = [...updatedSlots, newSlot];

    addSlotMutation.mutate({
      id: currentTimetable.id,
      data: { slots: updatedSlots }
    });
  };

  const confirmDeleteSlot = () => {
    if (!currentTimetable || !deletingSlot) return;
    const updatedSlots = currentTimetable.slots.filter(s => s.id !== deletingSlot.id);
    deleteSlotMutation.mutate({
      id: currentTimetable.id,
      data: { slots: updatedSlots }
    });
  };

  const handleClearFilters = () => {
    resetFilters();
    setSelectedClass('');
    setSelectedSection('');
  };

  if (isLoading || academicYearsLoading || classesLoading || teachersLoading) {
    return <PageLoader message="Loading timetable..." />;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        <div className="no-print">
          <PageHeader
          title="Weekly Timetable"
          description="Manage class schedules and periods - Break periods are configured in settings"
          action={
            <div className="flex gap-2">
              {currentTimetable && canDo('timetable.update') && (
                <Button
                  variant="outline"
                  onClick={handleEditConfig}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Configure Breaks & Periods
                </Button>
              )}
              {canDo('timetable.create') && (
                <Button
                  onClick={handleCreateTimetable}
                  disabled={!selectedAcademicYear || !selectedClass}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create New
                </Button>
              )}
              {currentTimetable && (
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10"
                  onClick={() => setPrintModalOpen(true)}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print / Export
                </Button>
              )}
            </div>
          }
        />
        </div>

        <ErrorAlert message={error?.message} />

        <style dangerouslySetInnerHTML={{ __html: `
          @media screen {
            .timetable-print-container { display: none !important; }
          }
          @media print {
            /* Basic resets */
            html, body {
              height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: visible !important;
            }
            /* Hide EVERYTHING by default */
            body * {
              visibility: hidden !important;
              margin: 0 !important;
            }
            /* Show ONLY the portal print container and its children */
            .timetable-print-container, .timetable-print-container * {
              visibility: visible !important;
            }
            .timetable-print-container { 
              display: block !important; 
              width: 100% !important;
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              z-index: 99999 !important;
              background: white !important;
              padding: 10mm !important;
              font-family: 'Inter', sans-serif !important;
              zoom: ${printSettings.orientation === 'landscape' ? '0.85' : '0.70'} !important;
            }
            
            @page {
              size: ${printSettings.orientation === 'landscape' ? 'landscape' : 'portrait'};
              margin: 0;
            }
            
            /* Enhanced Branding Header */
            .print-header {
              display: flex !important;
              justify-content: space-between !important;
              align-items: center !important;
              border-bottom: 4px solid #1e293b !important;
              padding-bottom: 15px !important;
              margin-bottom: 10px !important;
            }
            .print-logo-section {
              display: flex !important;
              align-items: center !important;
              gap: 20px !important;
            }
            .print-logo {
              height: 75px !important;
              width: 75px !important;
              object-fit: contain !important;
            }
            .print-inst-name {
              font-size: 28px !important;
              font-weight: 900 !important;
              text-transform: uppercase !important;
              margin: 0 !important;
              color: #0f172a !important;
              letter-spacing: -0.02em !important;
            }
            .print-inst-addr {
              font-size: 11px !important;
              color: #475569 !important;
              margin-top: 4px !important;
              font-weight: 500 !important;
            }
            
            /* Info Sub-header */
            .print-info-grid {
              display: grid !important;
              grid-template-columns: repeat(3, 1fr) !important;
              background-color: #f8fafc !important;
              border: 1px solid #e2e8f0 !important;
              padding: 10px 15px !important;
              margin-bottom: 20px !important;
              border-radius: 4px !important;
            }
            .info-item {
              display: flex !important;
              flex-direction: column !important;
            }
            .info-label {
              font-size: 9px !important;
              text-transform: uppercase !important;
              color: #64748b !important;
              font-weight: 700 !important;
              letter-spacing: 0.05em !important;
            }
            .info-value {
              font-size: 13px !important;
              font-weight: 700 !important;
              color: #1e293b !important;
            }

            /* Table Styling */
            .print-table {
              width: 100% !important;
              border-collapse: collapse !important;
              table-layout: fixed !important;
            }
            .print-table th, .print-table td {
              border: 1.2px solid #334155 !important;
              padding: 6px 4px !important;
              text-align: center !important;
              vertical-align: middle !important;
              word-wrap: break-word !important;
            }
            .print-table th {
              background-color: #1e293b !important;
              color: #ffffff !important;
              -webkit-print-color-adjust: exact;
              font-size: 10px !important;
              font-weight: 800 !important;
              text-transform: uppercase !important;
              letter-spacing: 0.05em !important;
            }
            .period-col {
              background-color: #f1f5f9 !important;
              font-weight: 800 !important;
              font-size: 10px !important;
              width: 90px !important;
            }
            .slot-subject {
              font-size: 11px !important;
              font-weight: 800 !important;
              color: #0f172a !important;
              margin-bottom: 2px !important;
            }
            .slot-teacher {
              font-size: 9px !important;
              color: #475569 !important;
              font-weight: 500 !important;
            }
            .slot-room {
              font-size: 8px !important;
              color: #64748b !important;
              margin-top: 2px !important;
              font-weight: 600 !important;
            }
            .print-break-row td {
              background-color: #fffbeb !important;
              -webkit-print-color-adjust: exact;
              font-weight: 800 !important;
              color: #92400e !important;
              text-transform: uppercase !important;
              letter-spacing: 0.3em !important;
              font-size: 10px !important;
              height: 30px !important;
            }

            /* Signature & Footer */
            .print-footer {
              margin-top: 40px !important;
              display: flex !important;
              justify-content: space-between !important;
              align-items: flex-end !important;
            }
            .sig-box {
              width: 180px !important;
              border-top: 1.5px solid #000 !important;
              padding-top: 8px !important;
              text-align: center !important;
              font-size: 11px !important;
              font-weight: 700 !important;
              text-transform: uppercase !important;
            }
            .gen-info {
              font-size: 8px !important;
              color: #94a3b8 !important;
              font-style: italic !important;
            }
          }
        `}} />

        {typeof document !== 'undefined' && createPortal(
          <div className="timetable-print-container">
            {/* Header */}
            <div className="print-header">
              <div className="print-logo-section">
                {currentInstitute?.logo_url && (
                  <img src={currentInstitute.logo_url} alt="Logo" className="print-logo" />
                )}
                <div>
                  <h1 className="print-inst-name">{currentInstitute?.name || 'THE CLOUDS ACADEMY'}</h1>
                  <p className="print-inst-addr">{currentInstitute?.address || 'Institutional ERP System'}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-slate-900 text-white px-2 py-0.5 rounded text-[8px] font-black tracking-widest inline-block mb-1">OFFICIAL DOCUMENT</div>
                <h2 className="text-xl font-black text-slate-900 leading-tight">WEEKLY<br/>SCHEDULE</h2>
              </div>
            </div>

            {/* Info Grid */}
            <div className="print-info-grid">
              <div className="info-item">
                <span className="info-label">{terms.primary_unit || 'Class'}</span>
                <span className="info-value">{classes.find(c => c.id === selectedClass)?.name || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{terms.grouping_unit || 'Section'}</span>
                <span className="info-value">
                  {selectedSection ? sections.find(s => s.id === selectedSection)?.name : 'All Sections'}
                </span>
              </div>
              <div className="info-item text-right">
                <span className="info-label">Academic Session</span>
                <span className="info-value">
                  {academicYears.find(y => String(y.id) === String(selectedAcademicYear))?.name || 'Current'}
                </span>
              </div>
            </div>

            {/* Timetable Table */}
            <table className="print-table">
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>Period</th>
                  {displayedDays.map(day => (
                    <th key={day.value}>{day.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSequence.map((item) => {
                  if (item.is_break) {
                    return (
                      <tr key={item.key} className="print-break-row">
                        <td>{item.start_time} - {item.end_time}</td>
                        <td colSpan={displayedDays.length}>
                           ✦ {item.name || 'BREAK'} ✦
                        </td>
                      </tr>
                    );
                  }
                  return (
                    <tr key={item.key}>
                      <td className="period-col">
                        PERIOD {item.period}<br/>
                        <span className="text-[8px] font-normal opacity-60 italic">({item.start_time} - {item.end_time})</span>
                      </td>
                      {displayedDays.map(day => {
                        const slot = grid[day.value]?.[item.period];
                        return (
                          <td key={day.value}>
                            {slot ? (
                              <div className="flex flex-col gap-0.5">
                                <div className="slot-subject">{slot.subject_name}</div>
                                <div className="slot-teacher">{slot.teacher_name}</div>
                                {slot.room_no && <div className="slot-room">R: {slot.room_no}</div>}
                              </div>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Footer / Signature Area */}
            <div className="print-footer">
              <div className="gen-info">
                {/* System info removed as requested */}
              </div>
              <div className="flex gap-12">
                <div className="sig-box">Coordinator</div>
                <div className="sig-box">Principal</div>
              </div>
            </div>
          </div>,
          document.body
        )}

        <div className="no-print">
        <Card className="no-print">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Select Timetable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <SelectField
                label="Academic Year"
                name="academic_year"
                control={filterControl}
                options={[
                  { value: '', label: 'Select Academic Year' },
                  ...academicYears.map(y => ({ value: y.id, label: y.name }))
                ]}
                placeholder="Select Academic Year"
              />

              <SelectField
                label="Class"
                name="class"
                control={filterControl}
                options={[
                  { value: '', label: 'Select Class' },
                  ...classes.map(c => ({ value: c.id, label: c.name }))
                ]}
                placeholder="Select Class"
                disabled={!selectedAcademicYear}
              />

              {watchedClass && sections.length > 0 && (
                <SelectField
                  label="Section"
                  name="section"
                  control={filterControl}
                  options={[
                    { value: '', label: 'All Sections' },
                    ...sections.map(s => ({ value: s.id, label: s.name }))
                  ]}
                  placeholder="Select Section"
                />
              )}
            </div>

            {currentTimetable && (
              <div className="mt-4 flex flex-wrap items-center gap-4 p-3 bg-muted/30 rounded-lg">
                <Badge variant="outline" className="text-sm">
                  {currentTimetable.name}
                </Badge>
                <div className="flex items-center gap-2">
                  <StatusBadge status={currentTimetable.is_active ? 'active' : 'inactive'} />
                  {canDo('timetable.update') && (
                    <Button 
                      variant="ghost" 
                      size="xs" 
                      className="h-7 px-2 text-[10px]"
                      onClick={() => toggleStatusMutation.mutate({ 
                        id: currentTimetable.id, 
                        isActive: !currentTimetable.is_active 
                      })}
                      disabled={toggleStatusMutation.isPending}
                    >
                      {currentTimetable.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  Periods: {currentTimetable.period_config?.total_periods || 8}
                </span>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Sun className="h-3 w-3" />
                  Days: {currentTimetable.period_config?.days_count || 5}
                </span>
                {currentTimetable.period_config?.breaks?.length > 0 && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Breaks: {currentTimetable.period_config.breaks.map(b => b.name).join(', ')}
                  </span>
                )}
              </div>
            )}

            {(watchedClass || selectedAcademicYear) && (
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                  Clear All Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timetable Grid */}
        {currentTimetable ? (
          <Card>
            <CardContent className="p-4 overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 w-24 text-left font-semibold border-b bg-muted/20">Period / Day</th>
                    {displayedDays.map(day => (
                      <th key={day.value} className="p-3 text-center font-semibold border-b bg-muted/20">
                        {day.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSequence.map((item) => {
                    if (item.is_break) {
                      return (
                        <tr key={item.key} className="bg-amber-50/40">
                          <td className="p-3 font-medium border-r border-amber-200">
                            <div className="flex items-center gap-2 text-amber-700">
                              <div className="p-1.5 bg-amber-100 rounded-full">
                                <Clock className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-sm font-bold uppercase tracking-wider">{item.name || 'Break'}</p>
                                <p className="text-[10px] font-semibold opacity-70">
                                  {item.start_time} - {item.end_time}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td colSpan={displayedDays.length} className="p-2 border-b border-amber-100 relative overflow-hidden">
                            <div className="flex items-center justify-center h-16 rounded-xl border-2 border-dashed border-amber-200/60 bg-gradient-to-r from-amber-50/50 via-amber-100/30 to-amber-50/50">
                              <p className="font-bold text-amber-800/80 tracking-[0.2em] uppercase flex items-center gap-4 text-xs sm:text-sm">
                                <span className="opacity-30">✦</span> 
                                {item.name || 'REST BREAK'} 
                                <span className="opacity-30">✦</span>
                              </p>
                              {/* Decorative background element */}
                              <div className="absolute -right-4 -bottom-4 opacity-[0.03]">
                                <Clock className="h-24 w-24" />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={item.key}>
                        <td className="p-2 font-medium border-r">
                          <div>
                            <p className="font-bold">Period {item.period}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.start_time} - {item.end_time}
                            </p>
                          </div>
                        </td>
                        {displayedDays.map(day => {
                          const slot = grid[day.value]?.[item.period];
                          const isBusyTeacher = slot?.teacher_id ? busyTeachersMap[slot.teacher_id] : false;
                          return (
                            <td key={day.value} className="p-2">
                              <TimetableCell
                                slot={slot}
                                day={day.value}
                                period={item.period}
                                periodConfig={currentTimetable.period_config}
                                onDrop={handleDropSlot}
                                onEdit={handleEditSlot}
                                onDelete={handleDeleteSlot}
                                isBusyTeacher={isBusyTeacher}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Timetable Selected</h3>
              <p className="text-muted-foreground mb-4">
                Please select an academic year and class to view or create a timetable
              </p>
              {selectedAcademicYear && selectedClass && (
                <Button onClick={handleCreateTimetable}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Timetable
                </Button>
              )}
            </CardContent>
          </Card>
        )}
        </div>

        {/* Timetable Config Modal */}
        <TimetableConfigModal
          open={configModalOpen}
          onClose={() => {
            setConfigModalOpen(false);
            setPeriodConfig(null);
          }}
          onSubmit={handleConfigSubmit}
          initialConfig={periodConfig}
          loading={createTimetableMutation.isPending || updateTimetableMutation.isPending}
        />

        {/* Add/Edit Slot Modal */}
        <AppModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditingSlot(null); reset(); setBusyTeachers([]); }}
          title={editingSlot ? 'Edit Slot' : 'Add Slot'}
          size="md"
        >
          <form onSubmit={handleSubmit(onSubmitSlot)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="Day"
                name="day"
                control={control}
                options={displayedDays.map(d => ({ value: d.value, label: d.label }))}
                error={errors.day}
                required
              />
              <SelectField
                label="Period"
                name="period"
                control={control}
                options={currentTimetable?.period_config?.periods?.map(p => {
                  const isBreak = displayedDays.some(day => 
                    grid[day.value]?.[p.period]?.is_break === true
                  );
                  return {
                    value: p.period,
                    label: `Period ${p.period} (${p.start_time} - ${p.end_time})${isBreak ? ' - Break Period' : ''}`,
                    disabled: isBreak // Disable break periods from being selected
                  };
                }) || []}
                error={errors.period}
                required
              />
            </div>

            <Separator />

            <div className="flex items-center space-x-2 opacity-50 cursor-not-allowed">
              <input
                type="checkbox"
                id="is_break"
                {...register('is_break')}
                className="h-4 w-4 rounded border-gray-300 cursor-not-allowed"
                disabled={true}
              />
              <Label htmlFor="is_break" className="text-muted-foreground">
                Break periods can only be configured in timetable settings
              </Label>
            </div>

            <div className="space-y-4">
              <SelectField
                label="Subject"
                name="subject_id"
                control={control}
                options={[
                  { value: '', label: 'Select Subject' },
                  ...subjects.map(s => ({
                    value: s.id,
                    label: s.name
                  }))
                ]}
                error={errors.subject_id}
                required
              />

              <div className="space-y-2">
                <SelectField
                  label="Teacher"
                  name="teacher_id"
                  control={control}
                  options={teacherOptions}
                  error={errors.teacher_id}
                  required={true}
                  disabled={isCheckingBusyTeachers}
                />
                {isCheckingBusyTeachers && (
                  <p className="text-xs text-muted-foreground">Checking teacher availability...</p>
                )}
                {!watchedIsBreak && watchedDay && watchedPeriod && busyTeachers.length > 0 && (
                  <div className="mt-2 p-3 bg-amber-50 rounded-md border border-amber-200">
                    <p className="text-sm text-amber-700 flex items-center gap-2 font-semibold">
                      <AlertTriangle className="h-4 w-4" />
                      These teachers are busy at this time:
                    </p>
                    <ul className="mt-2 text-xs text-amber-600 space-y-1">
                      {teachers
                        .filter(t => busyTeachers.includes(t.id))
                        .map(t => (
                          <li key={t.id} className="flex items-center gap-2">
                            <span>•</span>
                            {t.first_name} {t.last_name}
                          </li>
                        ))
                      }
                    </ul>
                    <p className="mt-2 text-xs text-amber-600">
                      Busy teachers are disabled in the dropdown above.
                    </p>
                  </div>
                )}
              </div>

              <InputField
                label="Room No."
                name="room_no"
                register={register}
                error={errors.room_no}
                placeholder="e.g. 101, Lab 2"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => { setModalOpen(false); reset(); setBusyTeachers([]); }}>
                Cancel
              </Button>
              <FormSubmitButton
                loading={addSlotMutation.isPending}
                label={editingSlot ? 'Update Slot' : 'Add Slot'}
                loadingLabel="Saving..."
              />
            </div>
          </form>
        </AppModal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={!!deletingSlot}
          onClose={() => setDeletingSlot(null)}
          onConfirm={confirmDeleteSlot}
          loading={deleteSlotMutation.isPending}
          title="Delete Timetable Slot"
          description={
            deletingSlot?.is_break
              ? `Break periods cannot be deleted. Please modify breaks in configuration.`
              : `Are you sure you want to delete ${deletingSlot?.subject_name} (Period ${deletingSlot?.period})?`
          }
          confirmLabel="Delete"
          variant="destructive"
          disabled={deletingSlot?.is_break}
        />
      </div>

      {/* Print / Export Modal */}
      <AppModal
        open={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        title="Print / Export Timetable"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Paper Size"
              value={printSettings.paperSize}
              onChange={(v) => setPrintSettings(s => ({ ...s, paperSize: v }))}
              options={[
                { value: 'a4', label: 'A4 (Standard)' },
                { value: 'letter', label: 'Letter' },
                { value: 'legal', label: 'Legal' }
              ]}
            />
            <SelectField
              label="Orientation"
              value={printSettings.orientation}
              onChange={(v) => setPrintSettings(s => ({ ...s, orientation: v }))}
              options={[
                { value: 'landscape', label: 'Landscape (Recommended)' },
                { value: 'portrait', label: 'Portrait' }
              ]}
            />
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-500" />
              Print Preview Info
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Professional header with institute logo and branding.</li>
              <li>• Full weekly schedule with periods and breaks.</li>
              <li>• Optimized to fit on a single page.</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setPrintModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => { handleExportPDF(printSettings); setPrintModalOpen(false); }}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="default" onClick={() => { handleExportPDF({ ...printSettings, print: true }); setPrintModalOpen(false); }}>
              <Printer className="mr-2 h-4 w-4" />
              Print Now
            </Button>
          </div>
        </div>
      </AppModal>
    </DndProvider>
  );
}