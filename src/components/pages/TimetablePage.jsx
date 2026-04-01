// // // // src/components/pages/TimetablePage.jsx (UPDATED WITH DAYS CONFIG)

// // // 'use client';

// // // import { useState, useMemo, useEffect } from 'react';
// // // import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// // // import { useForm } from 'react-hook-form';
// // // import { DndProvider, useDrag, useDrop } from 'react-dnd';
// // // import { HTML5Backend } from 'react-dnd-html5-backend';
// // // import {
// // //   Plus, Pencil, Trash2, GripVertical, Calendar, Clock,
// // //   BookOpen, Users, DoorOpen, Copy, Power, Eye, Filter, Settings, Sun
// // // } from 'lucide-react';
// // // import { toast } from 'sonner';

// // // import useAuthStore from '@/store/authStore';
// // // import useInstituteStore from '@/store/instituteStore';
// // // import useInstituteConfig from '@/hooks/useInstituteConfig';

// // // import PageHeader from '@/components/common/PageHeader';
// // // import AppModal from '@/components/common/AppModal';
// // // import ConfirmDialog from '@/components/common/ConfirmDialog';
// // // import SelectField from '@/components/common/SelectField';
// // // import InputField from '@/components/common/InputField';
// // // import FormSubmitButton from '@/components/common/FormSubmitButton';
// // // import ErrorAlert from '@/components/common/ErrorAlert';
// // // import PageLoader from '@/components/common/PageLoader';
// // // import StatusBadge from '@/components/common/StatusBadge';
// // // import TimePickerField from '@/components/common/TimePickerField';

// // // import { Button } from '@/components/ui/button';
// // // import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// // // import { Badge } from '@/components/ui/badge';
// // // import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// // // import { Separator } from '@/components/ui/separator';
// // // import { Label } from '@/components/ui/label';
// // // import { Checkbox } from '@/components/ui/checkbox';
// // // import { cn } from '@/lib/utils';

// // // // Import services
// // // import { classService } from '@/services/classService';
// // // import { teacherService } from '@/services/teacherService';
// // // import { academicYearService } from '@/services/academicYearService';
// // // import { timetableService } from '@/services/timetableService';

// // // // Days Constants
// // // const ALL_DAYS = [
// // //   { value: 'monday', label: 'Monday', short: 'Mon' },
// // //   { value: 'tuesday', label: 'Tuesday', short: 'Tue' },
// // //   { value: 'wednesday', label: 'Wednesday', short: 'Wed' },
// // //   { value: 'thursday', label: 'Thursday', short: 'Thu' },
// // //   { value: 'friday', label: 'Friday', short: 'Fri' },
// // //   { value: 'saturday', label: 'Saturday', short: 'Sat' },
// // //   { value: 'sunday', label: 'Sunday', short: 'Sun' }
// // // ];

// // // // Entity type mapping
// // // const getEntityTypeFromInstitute = (instituteType) => {
// // //   const mapping = {
// // //     school: 'school',
// // //     coaching: 'coaching',
// // //     academy: 'academy',
// // //     college: 'college',
// // //     university: 'university',
// // //     tuition_center: 'school'
// // //   };
// // //   return mapping[instituteType] || 'school';
// // // };

// // // const TYPE = 'TIMETABLE_SLOT';

// // // // Subject color mapping
// // // const SUBJECT_COLORS = {
// // //   'Mathematics': 'bg-blue-100 text-blue-700 border-blue-200',
// // //   'Physics': 'bg-purple-100 text-purple-700 border-purple-200',
// // //   'Chemistry': 'bg-green-100 text-green-700 border-green-200',
// // //   'Biology': 'bg-emerald-100 text-emerald-700 border-emerald-200',
// // //   'English': 'bg-yellow-100 text-yellow-700 border-yellow-200',
// // //   'Urdu': 'bg-orange-100 text-orange-700 border-orange-200',
// // //   'Islamiat': 'bg-indigo-100 text-indigo-700 border-indigo-200',
// // //   'Computer': 'bg-pink-100 text-pink-700 border-pink-200',
// // //   'History': 'bg-amber-100 text-amber-700 border-amber-200',
// // //   'Geography': 'bg-teal-100 text-teal-700 border-teal-200',
// // //   'default': 'bg-gray-100 text-gray-700 border-gray-200'
// // // };

// // // /* ---------- Timetable Cell Component ---------- */
// // // function TimetableCell({ slot, day, period, periodConfig, onDrop, onEdit, onDelete }) {
// // //   const [{ isDragging }, drag] = useDrag(() => ({
// // //     type: TYPE,
// // //     item: slot,
// // //     canDrag: !!slot && !slot.is_break,
// // //     collect: (monitor) => ({ isDragging: monitor.isDragging() })
// // //   }));

// // //   const [{ isOver }, drop] = useDrop(() => ({
// // //     accept: TYPE,
// // //     drop: (item) => onDrop(item, day, period),
// // //     collect: (monitor) => ({ isOver: monitor.isOver() })
// // //   }));

// // //   const periodInfo = periodConfig?.periods?.find(p => p.period === period);
// // //   const getSubjectColor = (subject) => SUBJECT_COLORS[subject] || SUBJECT_COLORS.default;

// // //   if (slot?.is_break) {
// // //     return (
// // //       <div className="h-24 rounded-lg border-2 border-dashed border-amber-200 bg-amber-50 p-2">
// // //         <div className="text-center">
// // //           <p className="font-medium text-amber-700">{slot.break_name || 'Break'}</p>
// // //           {periodInfo && (
// // //             <p className="text-xs text-amber-600">
// // //               {periodInfo.start_time} - {periodInfo.end_time}
// // //             </p>
// // //           )}
// // //         </div>
// // //       </div>
// // //     );
// // //   }

// // //   return (
// // //     <div
// // //       ref={(node) => drag(drop(node))}
// // //       className={cn(
// // //         'relative h-24 rounded-lg border-2 transition-all duration-200',
// // //         isOver && 'border-primary bg-primary/5',
// // //         isDragging && 'opacity-50',
// // //         slot ? 'cursor-move hover:shadow-md' : 'cursor-pointer hover:border-dashed hover:border-primary'
// // //       )}
// // //       onClick={() => !slot && onEdit({ day, period })}
// // //     >
// // //       {slot ? (
// // //         <div className={cn('h-full w-full rounded-lg p-2', getSubjectColor(slot.subject_name))}>
// // //           <div className="flex items-start justify-between">
// // //             <GripVertical size={14} className="opacity-50" />
// // //             <div className="flex gap-1">
// // //               <button onClick={(e) => { e.stopPropagation(); onEdit(slot); }} className="rounded p-1 hover:bg-black/5">
// // //                 <Pencil size={12} />
// // //               </button>
// // //               <button onClick={(e) => { e.stopPropagation(); onDelete(slot); }} className="rounded p-1 hover:bg-black/5 text-destructive">
// // //                 <Trash2 size={12} />
// // //               </button>
// // //             </div>
// // //           </div>
// // //           <div className="mt-1 space-y-1">
// // //             <p className="font-semibold text-sm truncate">{slot.subject_name}</p>
// // //             <p className="text-xs opacity-75 truncate">{slot.teacher_name}</p>
// // //             {slot.room_no && (
// // //               <p className="text-xs opacity-50 flex items-center gap-1">
// // //                 <DoorOpen size={10} /> {slot.room_no}
// // //               </p>
// // //             )}
// // //           </div>
// // //         </div>
// // //       ) : (
// // //         <div className="flex h-full items-center justify-center text-muted-foreground hover:text-primary">
// // //           <Plus size={24} />
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // }

// // // /* ---------- Period & Days Config Modal ---------- */
// // // function TimetableConfigModal({ open, onClose, onSubmit, initialConfig = null, loading }) {
// // //   const [periods, setPeriods] = useState([]);
// // //   const [breaks, setBreaks] = useState([]);
// // //   const [totalPeriods, setTotalPeriods] = useState(8);
// // //   const [selectedDays, setSelectedDays] = useState([]);

// // //   // Initialize form when modal opens
// // //   useEffect(() => {
// // //     if (open) {
// // //       if (initialConfig) {
// // //         // Edit mode - use existing config
// // //         setTotalPeriods(initialConfig.total_periods || 8);
// // //         setPeriods(initialConfig.periods || []);
// // //         setBreaks(initialConfig.breaks || []);
// // //         setSelectedDays(initialConfig.days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
// // //       } else {
// // //         // Create mode - default config
// // //         setTotalPeriods(8);
// // //         setPeriods([
// // //           { period: 1, start_time: '08:00', end_time: '08:40', name: 'Period 1', type: 'study' },
// // //           { period: 2, start_time: '08:40', end_time: '09:20', name: 'Period 2', type: 'study' },
// // //           { period: 3, start_time: '09:20', end_time: '10:00', name: 'Period 3', type: 'study' },
// // //           { period: 4, start_time: '10:30', end_time: '11:10', name: 'Period 4', type: 'study' },
// // //           { period: 5, start_time: '11:10', end_time: '11:50', name: 'Period 5', type: 'study' },
// // //           { period: 6, start_time: '11:50', end_time: '12:30', name: 'Period 6', type: 'study' },
// // //           { period: 7, start_time: '13:30', end_time: '14:10', name: 'Period 7', type: 'study' },
// // //           { period: 8, start_time: '14:10', end_time: '14:50', name: 'Period 8', type: 'study' }
// // //         ]);
// // //         setBreaks([
// // //           { name: 'Break', start_time: '10:00', end_time: '10:30' },
// // //           { name: 'Lunch', start_time: '12:30', end_time: '13:30' }
// // //         ]);
// // //         setSelectedDays(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
// // //       }
// // //     }
// // //   }, [open, initialConfig]);

// // //   // Update periods when totalPeriods changes
// // //   const handleTotalPeriodsChange = (e) => {
// // //     const newTotal = parseInt(e.target.value) || 1;
// // //     setTotalPeriods(newTotal);

// // //     // Adjust periods array
// // //     const newPeriods = [];
// // //     for (let i = 1; i <= newTotal; i++) {
// // //       const existing = periods.find(p => p.period === i);
// // //       if (existing) {
// // //         newPeriods.push(existing);
// // //       } else {
// // //         newPeriods.push({
// // //           period: i,
// // //           start_time: '08:00',
// // //           end_time: '08:40',
// // //           name: `Period ${i}`,
// // //           type: 'study'
// // //         });
// // //       }
// // //     }
// // //     setPeriods(newPeriods);
// // //   };

// // //   // Toggle day selection
// // //   const toggleDay = (dayValue) => {
// // //     setSelectedDays(prev =>
// // //       prev.includes(dayValue)
// // //         ? prev.filter(d => d !== dayValue)
// // //         : [...prev, dayValue]
// // //     );
// // //   };

// // //   // Select all days
// // //   const selectAllDays = () => {
// // //     setSelectedDays(ALL_DAYS.map(d => d.value));
// // //   };

// // //   // Clear all days
// // //   const clearAllDays = () => {
// // //     setSelectedDays([]);
// // //   };

// // //   // Update period field
// // //   const handlePeriodChange = (index, field, value) => {
// // //     const updatedPeriods = [...periods];
// // //     updatedPeriods[index] = { ...updatedPeriods[index], [field]: value };
// // //     setPeriods(updatedPeriods);
// // //   };

// // //   // Update break field
// // //   const handleBreakChange = (index, field, value) => {
// // //     const updatedBreaks = [...breaks];
// // //     updatedBreaks[index] = { ...updatedBreaks[index], [field]: value };
// // //     setBreaks(updatedBreaks);
// // //   };

// // //   // Add new break
// // //   const handleAddBreak = () => {
// // //     setBreaks([...breaks, { name: '', start_time: '', end_time: '' }]);
// // //   };

// // //   // Remove break
// // //   const handleRemoveBreak = (index) => {
// // //     const updatedBreaks = breaks.filter((_, i) => i !== index);
// // //     setBreaks(updatedBreaks);
// // //   };

// // //   // Validate form
// // //   const validateForm = () => {
// // //     // Check days
// // //     if (selectedDays.length === 0) {
// // //       toast.error('Please select at least one day');
// // //       return false;
// // //     }

// // //     // Check periods
// // //     for (let i = 0; i < periods.length; i++) {
// // //       const p = periods[i];
// // //       if (!p.start_time || !p.end_time) {
// // //         toast.error(`Period ${p.period} timing required`);
// // //         return false;
// // //       }
// // //       if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(p.start_time)) {
// // //         toast.error(`Period ${p.period} start time invalid`);
// // //         return false;
// // //       }
// // //       if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(p.end_time)) {
// // //         toast.error(`Period ${p.period} end time invalid`);
// // //         return false;
// // //       }
// // //     }

// // //     // Check breaks
// // //     for (let i = 0; i < breaks.length; i++) {
// // //       const b = breaks[i];
// // //       if (!b.name || !b.start_time || !b.end_time) {
// // //         toast.error(`Break ${i + 1} incomplete`);
// // //         return false;
// // //       }
// // //       if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(b.start_time)) {
// // //         toast.error(`Break ${i + 1} start time invalid`);
// // //         return false;
// // //       }
// // //       if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(b.end_time)) {
// // //         toast.error(`Break ${i + 1} end time invalid`);
// // //         return false;
// // //       }
// // //     }

// // //     return true;
// // //   };

// // //   const handleSubmit = () => {
// // //     if (!validateForm()) return;

// // //     const config = {
// // //       total_periods: totalPeriods,
// // //       periods: periods,
// // //       breaks: breaks,
// // //       days: selectedDays,
// // //       days_count: selectedDays.length
// // //     };

// // //     onSubmit(config);
// // //   };

// // //   return (
// // //     <AppModal
// // //       open={open}
// // //       onClose={onClose}
// // //       title={initialConfig ? "Edit Timetable Configuration" : "Configure Timetable"}
// // //       size="lg"
// // //       footer={
// // //         <div className="flex justify-end gap-3">
// // //           <Button type="button" variant="outline" onClick={onClose}>
// // //             Cancel
// // //           </Button>
// // //           <Button onClick={handleSubmit} disabled={loading}>
// // //             {loading ? 'Saving...' : initialConfig ? 'Update Timetable' : 'Create Timetable'}
// // //           </Button>
// // //         </div>
// // //       }
// // //     >
// // //       <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
// // //         {/* Days Selection */}
// // //         <div className="space-y-3">
// // //           <div className="flex items-center justify-between">
// // //             <Label className="text-base font-semibold">Working Days</Label>
// // //             <div className="flex gap-2">
// // //               <Button type="button" variant="outline" size="sm" onClick={selectAllDays}>
// // //                 Select All
// // //               </Button>
// // //               <Button type="button" variant="outline" size="sm" onClick={clearAllDays}>
// // //                 Clear
// // //               </Button>
// // //             </div>
// // //           </div>
// // //           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
// // //             {ALL_DAYS.map(day => (
// // //               <div key={day.value} className="flex items-center space-x-2">
// // //                 <Checkbox
// // //                   id={`day-${day.value}`}
// // //                   checked={selectedDays.includes(day.value)}
// // //                   onCheckedChange={() => toggleDay(day.value)}
// // //                 />
// // //                 <Label htmlFor={`day-${day.value}`} className="text-sm cursor-pointer">
// // //                   {day.label}
// // //                 </Label>
// // //               </div>
// // //             ))}
// // //           </div>
// // //           <p className="text-xs text-muted-foreground">
// // //             Selected: {selectedDays.length} days ({selectedDays.map(d => 
// // //               ALL_DAYS.find(day => day.value === d)?.short
// // //             ).join(', ')})
// // //           </p>
// // //         </div>

// // //         <Separator />

// // //         {/* Total Periods */}
// // //         <div className="space-y-2">
// // //           <Label className="text-base font-semibold">Total Periods Per Day</Label>
// // //           <input
// // //             type="number"
// // //             value={totalPeriods}
// // //             onChange={handleTotalPeriodsChange}
// // //             min="1"
// // //             max="12"
// // //             className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
// // //           />
// // //         </div>

// // //         {/* Periods List */}
// // //         <div className="space-y-4">
// // //           <h3 className="text-sm font-semibold">Period Timings</h3>
// // //           <div className="space-y-3">
// // //             {periods.map((period, index) => (
// // //               <div key={period.period} className="grid grid-cols-4 gap-2 items-center">
// // //                 <span className="text-sm font-medium">Period {period.period}</span>
// // //                 <TimePickerField
// // //                   mode="google"
// // //                   value={period.start_time}
// // //                   onChange={(value) => handlePeriodChange(index, 'start_time', value)}
// // //                 />
// // //                 <span className="text-center">to</span>
// // //                 <TimePickerField
// // //                   mode="google"
// // //                   value={period.end_time}
// // //                   onChange={(value) => handlePeriodChange(index, 'end_time', value)}
// // //                 />
// // //               </div>
// // //             ))}
// // //           </div>
// // //         </div>

// // //         {/* Break Periods */}
// // //         <div className="space-y-4">
// // //           <div className="flex justify-between items-center">
// // //             <h3 className="text-sm font-semibold">Break Periods</h3>
// // //             <Button type="button" variant="outline" size="sm" onClick={handleAddBreak}>
// // //               <Plus className="h-4 w-4 mr-2" />
// // //               Add Break
// // //             </Button>
// // //           </div>
// // //           <div className="space-y-3">
// // //             {breaks.map((breakPeriod, index) => (
// // //               <div key={index} className="grid grid-cols-6 gap-2 items-center">
// // //                 <input
// // //                   type="text"
// // //                   value={breakPeriod.name}
// // //                   onChange={(e) => handleBreakChange(index, 'name', e.target.value)}
// // //                   placeholder="Break name"
// // //                   className="col-span-2 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
// // //                 />
// // //                 <TimePickerField
// // //                   mode="google"
// // //                   value={breakPeriod.start_time}
// // //                   onChange={(value) => handleBreakChange(index, 'start_time', value)}
// // //                 />
// // //                 <span className="text-center">to</span>
// // //                 <TimePickerField
// // //                   mode="google"
// // //                   value={breakPeriod.end_time}
// // //                   onChange={(value) => handleBreakChange(index, 'end_time', value)}
// // //                 />
// // //                 <Button
// // //                   type="button"
// // //                   variant="ghost"
// // //                   size="sm"
// // //                   onClick={() => handleRemoveBreak(index)}
// // //                   className="text-destructive hover:bg-destructive/10"
// // //                 >
// // //                   <Trash2 className="h-4 w-4" />
// // //                 </Button>
// // //               </div>
// // //             ))}
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </AppModal>
// // //   );
// // // }

// // // /* ---------- Main Component ---------- */
// // // export default function TimetablePage({ type }) {
// // //   const queryClient = useQueryClient();
// // //   const { canDo } = useAuthStore();
// // //   const { currentInstitute } = useInstituteStore();
// // //   const { terms } = useInstituteConfig();

// // //   const entityType = getEntityTypeFromInstitute(type);

// // //   // State
// // //   const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
// // //   const [selectedClass, setSelectedClass] = useState('');
// // //   const [selectedSection, setSelectedSection] = useState('');
// // //   const [modalOpen, setModalOpen] = useState(false);
// // //   const [configModalOpen, setConfigModalOpen] = useState(false);
// // //   const [editingSlot, setEditingSlot] = useState(null);
// // //   const [deletingSlot, setDeletingSlot] = useState(null);
// // //   const [periodConfig, setPeriodConfig] = useState(null);

// // //   // Data states
// // //   const [classes, setClasses] = useState([]);
// // //   const [sections, setSections] = useState([]);
// // //   const [subjects, setSubjects] = useState([]);
// // //   const [teachers, setTeachers] = useState([]);
// // //   const [academicYears, setAcademicYears] = useState([]);
// // //   const [selectedClassData, setSelectedClassData] = useState(null);
// // //   const [activeDays, setActiveDays] = useState([]);

// // //   // Filter Form
// // //   const {
// // //     control: filterControl,
// // //     watch: filterWatch,
// // //     setValue: setFilterValue,
// // //     reset: resetFilters
// // //   } = useForm({
// // //     defaultValues: {
// // //       academic_year: '',
// // //       class: '',
// // //       section: '',
// // //     }
// // //   });

// // //   const watchedAcademicYear = filterWatch('academic_year');
// // //   const watchedClass = filterWatch('class');
// // //   const watchedSection = filterWatch('section');

// // //   // Update selected values
// // //   useEffect(() => {
// // //     setSelectedAcademicYear(watchedAcademicYear || '');
// // //   }, [watchedAcademicYear]);

// // //   useEffect(() => {
// // //     setSelectedClass(watchedClass || '');
// // //     setSelectedSection('');
// // //     setFilterValue('section', '');

// // //     if (watchedClass) {
// // //       const classData = classes.find(c => c.id === watchedClass);
// // //       setSelectedClassData(classData);
// // //       setSections(classData?.sections || []);

// // //       // Extract subjects from courses
// // //       const extractedSubjects = [];
// // //       if (classData?.courses?.length) {
// // //         classData.courses.forEach(course => {
// // //           if (course?.name) {
// // //             extractedSubjects.push({
// // //               id: course.id,
// // //               name: course.name,
// // //               code: course.course_code || ''
// // //             });
// // //           }
// // //         });
// // //       }

// // //       // Remove duplicates
// // //       const uniqueSubjects = Array.from(
// // //         new Map(extractedSubjects.map(s => [s.id, s])).values()
// // //       );
// // //       setSubjects(uniqueSubjects);
// // //     } else {
// // //       setSelectedClassData(null);
// // //       setSections([]);
// // //       setSubjects([]);
// // //     }
// // //   }, [watchedClass, classes, setFilterValue]);

// // //   useEffect(() => {
// // //     setSelectedSection(watchedSection || '');
// // //   }, [watchedSection]);

// // //   // Fetch Academic Years
// // //   const { data: academicYearsData, isLoading: academicYearsLoading } = useQuery({
// // //     queryKey: ['academic-years', currentInstitute?.id],
// // //     queryFn: () => academicYearService.getAll({ institute_id: currentInstitute?.id, is_active: true }),
// // //     enabled: !!currentInstitute?.id,
// // //   });

// // //   useEffect(() => {
// // //     if (academicYearsData?.data) {
// // //       setAcademicYears(academicYearsData.data);
// // //     }
// // //   }, [academicYearsData]);

// // //   // Fetch Classes
// // //   const { data: classesData, isLoading: classesLoading } = useQuery({
// // //     queryKey: ['classes', currentInstitute?.id, selectedAcademicYear],
// // //     queryFn: () => classService.getAll({
// // //       institute_id: currentInstitute?.id,
// // //       academic_year_id: selectedAcademicYear,
// // //       is_active: true
// // //     }),
// // //     enabled: !!currentInstitute?.id && !!selectedAcademicYear,
// // //   });

// // //   useEffect(() => {
// // //     if (classesData?.data) {
// // //       setClasses(classesData.data);
// // //     }
// // //   }, [classesData]);

// // //   // Fetch Teachers
// // //   const { data: teachersData, isLoading: teachersLoading } = useQuery({
// // //     queryKey: ['teachers', currentInstitute?.id],
// // //     queryFn: () => teacherService.getAll({
// // //       institute_id: currentInstitute?.id,
// // //       is_active: true,
// // //       limit: 200
// // //     }),
// // //     enabled: !!currentInstitute?.id,
// // //   });

// // //   useEffect(() => {
// // //     if (teachersData?.data) {
// // //       setTeachers(teachersData.data);
// // //     }
// // //   }, [teachersData]);

// // //   // Fetch timetables
// // //   const {
// // //     data: timetablesData,
// // //     isLoading,
// // //     error,
// // //     refetch
// // //   } = useQuery({
// // //     queryKey: ['timetables', currentInstitute?.id, selectedAcademicYear, entityType, selectedClass, selectedSection],
// // //     queryFn: () => timetableService.getAll({
// // //       academic_year_id: selectedAcademicYear,
// // //       entity_type: entityType,
// // //       class_id: selectedClass || undefined,
// // //       section_id: selectedSection || undefined
// // //     }),
// // //     enabled: !!currentInstitute?.id && !!selectedAcademicYear,
// // //   });

// // //   const timetables = timetablesData?.data || [];

// // //   // Current timetable
// // //   const currentTimetable = useMemo(() => {
// // //     if (!timetables.length) return null;
// // //     const entityIds = {};
// // //     if (selectedClass) entityIds.class_id = selectedClass;
// // //     if (selectedSection) entityIds.section_id = selectedSection;
// // //     return timetables.find(t =>
// // //       t.entity_type === entityType &&
// // //       Object.keys(entityIds).every(key => t.entity_ids?.[key] === entityIds[key])
// // //     );
// // //   }, [timetables, entityType, selectedClass, selectedSection]);

// // //   // Update active days when timetable changes
// // //   useEffect(() => {
// // //     if (currentTimetable?.period_config?.days) {
// // //       setActiveDays(currentTimetable.period_config.days);
// // //     } else {
// // //       setActiveDays(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
// // //     }
// // //   }, [currentTimetable]);

// // //   // Filter days based on active days
// // //   const displayedDays = useMemo(() => {
// // //     return ALL_DAYS.filter(day => activeDays.includes(day.value));
// // //   }, [activeDays]);

// // //   // Grid
// // //   const grid = useMemo(() => {
// // //     const g = {};
// // //     displayedDays.forEach(d => { g[d.value] = {}; });
// // //     if (currentTimetable?.slots) {
// // //       currentTimetable.slots.forEach(slot => {
// // //         if (slot.period && displayedDays.some(d => d.value === slot.day)) {
// // //           g[slot.day][slot.period] = slot;
// // //         }
// // //       });
// // //     }
// // //     return g;
// // //   }, [currentTimetable, displayedDays]);

// // //   // Mutations
// // //   const createTimetableMutation = useMutation({
// // //     mutationFn: (data) => timetableService.create(data),
// // //     onSuccess: () => {
// // //       toast.success('Timetable created successfully');
// // //       queryClient.invalidateQueries({ queryKey: ['timetables'] });
// // //       setConfigModalOpen(false);
// // //     },
// // //     onError: (error) => toast.error(error.message || 'Failed to create timetable')
// // //   });

// // //   const updateTimetableMutation = useMutation({
// // //     mutationFn: ({ id, data }) => timetableService.update(id, data),
// // //     onSuccess: () => {
// // //       toast.success('Timetable updated successfully');
// // //       queryClient.invalidateQueries({ queryKey: ['timetables'] });
// // //       setConfigModalOpen(false);
// // //       setPeriodConfig(null);
// // //     },
// // //     onError: (error) => toast.error(error.message || 'Failed to update timetable')
// // //   });

// // //   const addSlotMutation = useMutation({
// // //     mutationFn: ({ id, data }) => timetableService.update(id, data),
// // //     onSuccess: () => {
// // //       toast.success('Slot added successfully');
// // //       queryClient.invalidateQueries({ queryKey: ['timetables'] });
// // //       setModalOpen(false);
// // //       setEditingSlot(null);
// // //     },
// // //     onError: (error) => toast.error(error.message || 'Failed to add slot')
// // //   });

// // //   const deleteSlotMutation = useMutation({
// // //     mutationFn: ({ id, data }) => timetableService.update(id, data),
// // //     onSuccess: () => {
// // //       toast.success('Slot deleted successfully');
// // //       queryClient.invalidateQueries({ queryKey: ['timetables'] });
// // //       setDeletingSlot(null);
// // //     },
// // //     onError: (error) => toast.error(error.message || 'Failed to delete slot')
// // //   });

// // //   // Slot Form
// // //   const { control, register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
// // //     defaultValues: {
// // //       day: '',
// // //       period: '',
// // //       subject_id: '',
// // //       teacher_id: '',
// // //       room_no: '',
// // //       is_break: false,
// // //       break_name: ''
// // //     }
// // //   });

// // //   const watchedDay = watch('day');
// // //   const watchedPeriod = watch('period');
// // //   const watchedIsBreak = watch('is_break');

// // //   // Auto-fill room number
// // //   useEffect(() => {
// // //     if (selectedSection && selectedClassData) {
// // //       const section = selectedClassData.sections?.find(s => s.id === selectedSection);
// // //       if (section?.room_no) {
// // //         setValue('room_no', section.room_no);
// // //       }
// // //     }
// // //   }, [selectedSection, selectedClassData, setValue]);

// // //   // Handlers
// // //   const handleDropSlot = async (draggedSlot, newDay, newPeriod) => {
// // //     if (!currentTimetable) {
// // //       toast.error('Please select/create a timetable first');
// // //       return;
// // //     }
// // //     if (draggedSlot.day === newDay && draggedSlot.period === newPeriod) return;

// // //     const conflictCheck = await timetableService.checkConflict({
// // //       teacher_id: draggedSlot.teacher_id,
// // //       day: newDay,
// // //       period: newPeriod,
// // //       exclude_id: draggedSlot.id
// // //     });

// // //     if (conflictCheck.data?.hasConflict) {
// // //       toast.error('Teacher already assigned at this time');
// // //       return;
// // //     }

// // //     const updatedSlots = currentTimetable.slots.map(slot =>
// // //       slot.id === draggedSlot.id
// // //         ? { ...slot, day: newDay, period: newPeriod, updated_at: new Date().toISOString() }
// // //         : slot
// // //     );

// // //     addSlotMutation.mutate({
// // //       id: currentTimetable.id,
// // //       data: { slots: updatedSlots }
// // //     });
// // //   };

// // //   const handleEditSlot = (slotData) => {
// // //     if (!currentTimetable) {
// // //       toast.error('Please select/create a timetable first');
// // //       return;
// // //     }

// // //     if (slotData?.id) {
// // //       // Existing slot edit
// // //       setEditingSlot(slotData);
// // //       reset({
// // //         day: slotData.day,
// // //         period: String(slotData.period),
// // //         subject_id: slotData.subject_id || '',
// // //         teacher_id: slotData.teacher_id || '',
// // //         room_no: slotData.room_no || '',
// // //         is_break: slotData.is_break || false,
// // //         break_name: slotData.break_name || ''
// // //       });
// // //     } else {
// // //       // NEW SLOT (table click)
// // //       setEditingSlot(null);
// // //       const sectionRoom = selectedSection && selectedClassData
// // //         ? selectedClassData.sections?.find(s => s.id === selectedSection)?.room_no
// // //         : '';

// // //       reset({
// // //         day: slotData.day,
// // //         period: String(slotData.period),
// // //         subject_id: '',
// // //         teacher_id: '',
// // //         room_no: sectionRoom || '',
// // //         is_break: false,
// // //         break_name: ''
// // //       });
// // //     }
// // //     setModalOpen(true);
// // //   };

// // //   const handleDeleteSlot = (slot) => {
// // //     setDeletingSlot(slot);
// // //   };

// // //   const handleCreateTimetable = () => {
// // //     if (!selectedClass) {
// // //       toast.error('Please select a class');
// // //       return;
// // //     }
// // //     setPeriodConfig(null);
// // //     setConfigModalOpen(true);
// // //   };

// // //   const handleEditConfig = () => {
// // //     if (currentTimetable) {
// // //       setPeriodConfig(currentTimetable.period_config);
// // //       setConfigModalOpen(true);
// // //     }
// // //   };

// // //   const handleConfigSubmit = (config) => {
// // //     const entityIds = {};
// // //     let name = '';

// // //     if (entityType === 'school') {
// // //       entityIds.class_id = selectedClass;
// // //       const classObj = classes.find(c => c.id === selectedClass);
// // //       name = classObj?.name || 'Class';

// // //       if (selectedSection) {
// // //         entityIds.section_id = selectedSection;
// // //         const section = classObj?.sections?.find(s => s.id === selectedSection);
// // //         name += ` - ${section?.name || 'Section'}`;
// // //       }
// // //     }

// // //     if (currentTimetable) {
// // //       // Update existing timetable config
// // //       updateTimetableMutation.mutate({
// // //         id: currentTimetable.id,
// // //         data: { period_config: config }
// // //       });
// // //     } else {
// // //       // Create new timetable
// // //       createTimetableMutation.mutate({
// // //         name: `${name} Timetable`,
// // //         academic_year_id: selectedAcademicYear,
// // //         entity_type: entityType,
// // //         entity_ids: entityIds,
// // //         period_config: config,
// // //         slots: []
// // //       });
// // //     }
// // //   };

// // //   const onSubmitSlot = async (formData) => {
// // //     if (!currentTimetable) return;

// // //     if (formData.teacher_id && !formData.is_break) {
// // //       const conflictCheck = await timetableService.checkConflict({
// // //         teacher_id: formData.teacher_id,
// // //         day: formData.day,
// // //         period: formData.period,
// // //         exclude_id: editingSlot?.id
// // //       });

// // //       if (conflictCheck.data?.hasConflict) {
// // //         toast.error('Teacher already assigned at this time');
// // //         return;
// // //       }
// // //     }

// // //     let updatedSlots = [...(currentTimetable.slots || [])];

// // //     if (formData.is_break) {
// // //       const newSlot = {
// // //         id: editingSlot?.id || `temp-${Date.now()}`,
// // //         day: formData.day,
// // //         period: parseInt(formData.period),
// // //         is_break: true,
// // //         break_name: formData.break_name || 'Break',
// // //         created_at: new Date().toISOString(),
// // //         updated_at: new Date().toISOString()
// // //       };
// // //       updatedSlots = editingSlot
// // //         ? updatedSlots.map(s => s.id === editingSlot.id ? newSlot : s)
// // //         : [...updatedSlots, newSlot];
// // //     } else {
// // //       const subject = subjects.find(s => s.id === formData.subject_id);
// // //       const teacher = teachers.find(t => t.id === formData.teacher_id);
// // //       const newSlot = {
// // //         id: editingSlot?.id || `temp-${Date.now()}`,
// // //         day: formData.day,
// // //         period: parseInt(formData.period),
// // //         subject_id: formData.subject_id,
// // //         subject_name: subject?.name || '',
// // //         teacher_id: formData.teacher_id,
// // //         teacher_name: teacher ? `${teacher.first_name} ${teacher.last_name}` : '',
// // //         room_no: formData.room_no,
// // //         is_break: false,
// // //         created_at: new Date().toISOString(),
// // //         updated_at: new Date().toISOString()
// // //       };
// // //       updatedSlots = editingSlot
// // //         ? updatedSlots.map(s => s.id === editingSlot.id ? newSlot : s)
// // //         : [...updatedSlots, newSlot];
// // //     }

// // //     addSlotMutation.mutate({
// // //       id: currentTimetable.id,
// // //       data: { slots: updatedSlots }
// // //     });
// // //   };

// // //   const confirmDeleteSlot = () => {
// // //     if (!currentTimetable || !deletingSlot) return;
// // //     const updatedSlots = currentTimetable.slots.filter(s => s.id !== deletingSlot.id);
// // //     deleteSlotMutation.mutate({
// // //       id: currentTimetable.id,
// // //       data: { slots: updatedSlots }
// // //     });
// // //   };

// // //   const handleClearFilters = () => {
// // //     resetFilters();
// // //     setSelectedClass('');
// // //     setSelectedSection('');
// // //   };

// // //   if (isLoading || academicYearsLoading || classesLoading || teachersLoading) {
// // //     return <PageLoader message="Loading timetable..." />;
// // //   }

// // //   return (
// // //     <DndProvider backend={HTML5Backend}>
// // //       <div className="space-y-6">
// // //         <PageHeader
// // //           title="Weekly Timetable"
// // //           description="Manage class schedules and periods"
// // //           action={
// // //             <div className="flex gap-2">
// // //               {currentTimetable && canDo('timetable.update') && (
// // //                 <Button
// // //                   variant="outline"
// // //                   onClick={handleEditConfig}
// // //                 >
// // //                   <Settings className="mr-2 h-4 w-4" />
// // //                   Configure
// // //                 </Button>
// // //               )}
// // //               {canDo('timetable.create') && (
// // //                 <Button
// // //                   onClick={handleCreateTimetable}
// // //                   disabled={!selectedAcademicYear || !selectedClass}
// // //                 >
// // //                   <Plus className="mr-2 h-4 w-4" />
// // //                   Create New
// // //                 </Button>
// // //               )}
// // //             </div>
// // //           }
// // //         />

// // //         <ErrorAlert message={error?.message} />

// // //         {/* Filters */}
// // //         <Card>
// // //           <CardHeader className="py-3">
// // //             <CardTitle className="text-sm font-medium flex items-center">
// // //               <Filter className="h-4 w-4 mr-2" />
// // //               Select Timetable
// // //             </CardTitle>
// // //           </CardHeader>
// // //           <CardContent>
// // //             <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
// // //               <SelectField
// // //                 label="Academic Year"
// // //                 name="academic_year"
// // //                 control={filterControl}
// // //                 options={[
// // //                   { value: 'all', label: 'Select Academic Year' },
// // //                   ...academicYears.map(y => ({ value: y.id, label: y.name }))
// // //                 ]}
// // //                 placeholder="Select Academic Year"
// // //               />

// // //               <SelectField
// // //                 label="Class"
// // //                 name="class"
// // //                 control={filterControl}
// // //                 options={[
// // //                   { value: 'all', label: 'Select Class' },
// // //                   ...classes.map(c => ({ value: c.id, label: c.name }))
// // //                 ]}
// // //                 placeholder="Select Class"
// // //                 disabled={!selectedAcademicYear}
// // //               />

// // //               {watchedClass && (
// // //                 <SelectField
// // //                   label="Section"
// // //                   name="section"
// // //                   control={filterControl}
// // //                   options={[
// // //                     { value: 'all', label: 'All Sections' },
// // //                     ...sections.map(s => ({ value: s.id, label: s.name }))
// // //                   ]}
// // //                   placeholder="Select Section"
// // //                 />
// // //               )}
// // //             </div>

// // //             {currentTimetable && (
// // //               <div className="mt-4 flex flex-wrap items-center gap-4 p-3 bg-muted/30 rounded-lg">
// // //                 <Badge variant="outline" className="text-sm">
// // //                   {currentTimetable.name}
// // //                 </Badge>
// // //                 <StatusBadge status={currentTimetable.is_active ? 'active' : 'inactive'} />
// // //                 <span className="text-sm text-muted-foreground">
// // //                   Periods: {currentTimetable.period_config?.total_periods || 8}
// // //                 </span>
// // //                 <span className="text-sm text-muted-foreground flex items-center gap-1">
// // //                   <Sun className="h-3 w-3" />
// // //                   Days: {currentTimetable.period_config?.days_count || 5}
// // //                 </span>
// // //               </div>
// // //             )}

// // //             {(watchedClass || selectedAcademicYear) && (
// // //               <div className="mt-4 flex justify-end">
// // //                 <Button variant="ghost" size="sm" onClick={handleClearFilters}>
// // //                   Clear All Filters
// // //                 </Button>
// // //               </div>
// // //             )}
// // //           </CardContent>
// // //         </Card>

// // //         {/* Timetable Grid */}
// // //         {currentTimetable ? (
// // //           <Card>
// // //             <CardContent className="p-4 overflow-x-auto">
// // //               <table className="w-full min-w-[800px] border-collapse">
// // //                 <thead>
// // //                   <tr>
// // //                     <th className="p-3 w-24 text-left font-semibold border-b">Period / Day</th>
// // //                     {displayedDays.map(day => (
// // //                       <th key={day.value} className="p-3 text-center font-semibold border-b">
// // //                         {day.label}
// // //                       </th>
// // //                     ))}
// // //                   </tr>
// // //                 </thead>
// // //                 <tbody>
// // //                   {currentTimetable.period_config?.periods?.map(period => (
// // //                     <tr key={period.period}>
// // //                       <td className="p-2 font-medium border-r">
// // //                         <div>
// // //                           <p>Period {period.period}</p>
// // //                           <p className="text-xs text-muted-foreground">
// // //                             {period.start_time} - {period.end_time}
// // //                           </p>
// // //                         </div>
// // //                       </td>
// // //                       {displayedDays.map(day => {
// // //                         const slot = grid[day.value]?.[period.period];
// // //                         return (
// // //                           <td key={day.value} className="p-2">
// // //                             <TimetableCell
// // //                               slot={slot}
// // //                               day={day.value}
// // //                               period={period.period}
// // //                               periodConfig={currentTimetable.period_config}
// // //                               onDrop={handleDropSlot}
// // //                               onEdit={handleEditSlot}
// // //                               onDelete={handleDeleteSlot}
// // //                             />
// // //                           </td>
// // //                         );
// // //                       })}
// // //                     </tr>
// // //                   ))}
// // //                 </tbody>
// // //               </table>
// // //             </CardContent>
// // //           </Card>
// // //         ) : (
// // //           <Card>
// // //             <CardContent className="p-12 text-center">
// // //               <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
// // //               <h3 className="text-lg font-semibold mb-2">No Timetable Selected</h3>
// // //               <p className="text-muted-foreground mb-4">
// // //                 Please select an academic year and class to view or create a timetable
// // //               </p>
// // //               {selectedAcademicYear && selectedClass && (
// // //                 <Button onClick={handleCreateTimetable}>
// // //                   <Plus className="mr-2 h-4 w-4" />
// // //                   Create New Timetable
// // //                 </Button>
// // //               )}
// // //             </CardContent>
// // //           </Card>
// // //         )}

// // //         {/* Timetable Config Modal */}
// // //         <TimetableConfigModal
// // //           open={configModalOpen}
// // //           onClose={() => {
// // //             setConfigModalOpen(false);
// // //             setPeriodConfig(null);
// // //           }}
// // //           onSubmit={handleConfigSubmit}
// // //           initialConfig={periodConfig}
// // //           loading={createTimetableMutation.isPending || updateTimetableMutation.isPending}
// // //         />

// // //         {/* Add/Edit Slot Modal */}
// // //         <AppModal
// // //           open={modalOpen}
// // //           onClose={() => { setModalOpen(false); setEditingSlot(null); reset(); }}
// // //           title={editingSlot ? 'Edit Slot' : 'Add Slot'}
// // //           size="md"
// // //         >
// // //           <form onSubmit={handleSubmit(onSubmitSlot)} className="space-y-4">
// // //             <div className="grid grid-cols-2 gap-4">
// // //               <SelectField
// // //                 label="Day"
// // //                 name="day"
// // //                 control={control}
// // //                 options={displayedDays.map(d => ({ value: d.value, label: d.label }))}
// // //                 error={errors.day}
// // //                 required
// // //               />
// // //               <SelectField
// // //                 label="Period"
// // //                 name="period"
// // //                 control={control}
// // //                 options={currentTimetable?.period_config?.periods?.map(p => ({
// // //                   value: p.period,
// // //                   label: `Period ${p.period} (${p.start_time} - ${p.end_time})`
// // //                 })) || []}
// // //                 error={errors.period}
// // //                 required
// // //               />
// // //             </div>

// // //             <Separator />

// // //             {/* <div className="flex items-center space-x-2">
// // //               <input
// // //                 type="checkbox"
// // //                 id="is_break"
// // //                 {...register('is_break')}
// // //                 className="h-4 w-4 rounded border-gray-300"
// // //               />
// // //               <Label htmlFor="is_break">This is a break period</Label>
// // //             </div> */}

// // //             {watchedIsBreak ? (
// // //               <InputField
// // //                 label="Break Name"
// // //                 name="break_name"
// // //                 register={register}
// // //                 error={errors.break_name}
// // //                 placeholder="e.g. Lunch, Prayer Break"
// // //                 required
// // //               />
// // //             ) : (
// // //               <>
// // //                 <SelectField
// // //                   label="Subject"
// // //                   name="subject_id"
// // //                   control={control}
// // //                   options={[
// // //                     { value: 'all', label: 'Select Subject' },
// // //                     ...subjects.map(s => ({
// // //                       value: s.id,
// // //                       label: s.name
// // //                     }))
// // //                   ]}
// // //                   error={errors.subject_id}
// // //                   required
// // //                 />

// // //                 <SelectField
// // //                   label="Teacher"
// // //                   name="teacher_id"
// // //                   control={control}
// // //                   options={[
// // //                     { value: 'all', label: 'Select Teacher' },
// // //                     ...teachers.map(t => ({
// // //                       value: t.id,
// // //                       label: `${t.first_name} ${t.last_name}`
// // //                     }))
// // //                   ]}
// // //                   error={errors.teacher_id}
// // //                   required
// // //                 />

// // //                 <InputField
// // //                   label="Room No."
// // //                   name="room_no"
// // //                   register={register}
// // //                   error={errors.room_no}
// // //                   placeholder="e.g. 101, Lab 2"
// // //                 />
// // //               </>
// // //             )}

// // //             <div className="flex justify-end gap-3 pt-4">
// // //               <Button type="button" variant="outline" onClick={() => { setModalOpen(false); reset(); }}>
// // //                 Cancel
// // //               </Button>
// // //               <FormSubmitButton
// // //                 loading={addSlotMutation.isPending}
// // //                 label={editingSlot ? 'Update Slot' : 'Add Slot'}
// // //                 loadingLabel="Saving..."
// // //               />
// // //             </div>
// // //           </form>
// // //         </AppModal>

// // //         {/* Delete Confirmation */}
// // //         <ConfirmDialog
// // //           open={!!deletingSlot}
// // //           onClose={() => setDeletingSlot(null)}
// // //           onConfirm={confirmDeleteSlot}
// // //           loading={deleteSlotMutation.isPending}
// // //           title="Delete Timetable Slot"
// // //           description={
// // //             deletingSlot?.is_break
// // //               ? `Are you sure you want to delete the break "${deletingSlot.break_name}"?`
// // //               : `Are you sure you want to delete ${deletingSlot?.subject_name} (Period ${deletingSlot?.period})?`
// // //           }
// // //           confirmLabel="Delete"
// // //           variant="destructive"
// // //         />
// // //       </div>
// // //     </DndProvider>
// // //   );
// // // }







// src/components/pages/TimetablePage.jsx

'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  Plus, Pencil, Trash2, GripVertical, Calendar, Clock,
  BookOpen, Users, DoorOpen, Copy, Power, Eye, Filter, Settings, Sun, AlertTriangle, Coffee, Utensils
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
import StatusBadge from '@/components/common/StatusBadge';
import TimePickerField from '@/components/common/TimePickerField';

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

  // Initialize form when modal opens
  useEffect(() => {
    if (open) {
      if (initialConfig) {
        // Edit mode - use existing config
        setTotalPeriods(initialConfig.total_periods || 8);
        setPeriods(initialConfig.periods || []);
        setBreaks(initialConfig.breaks || []);
        setSelectedDays(initialConfig.days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
      } else {
        // Create mode - default config
        setTotalPeriods(8);
        const defaultPeriods = [];
        let currentTime = 8 * 60; // 8:00 AM in minutes
        
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
    const newTotal = parseInt(e.target.value) || 1;
    setTotalPeriods(newTotal);

    const newPeriods = [];
    let currentTime = 8 * 60; // 8:00 AM
    
    for (let i = 1; i <= newTotal; i++) {
      const existing = periods.find(p => p.period === i);
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
    setPeriods(newPeriods);
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

    const config = {
      total_periods: totalPeriods,
      periods: periods,
      breaks: breaks,
      days: selectedDays,
      days_count: selectedDays.length
    };

    onSubmit(config);
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
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : initialConfig ? 'Update Timetable' : 'Create Timetable'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
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
    if (academicYearsData?.data) {
      setAcademicYears(academicYearsData.data);
    }
  }, [academicYearsData]);

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
    
    if (mergedSlots) {
      mergedSlots.forEach(slot => {
        if (slot.period && displayedDays.some(d => d.value === slot.day)) {
          g[slot.day][slot.period] = slot;
        }
      });
    }
    
    return g;
  }, [mergedSlots, displayedDays]);

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
      setPeriodConfig(currentTimetable.period_config);
      setConfigModalOpen(true);
    }
  };

  const handleConfigSubmit = (config) => {
    const entityIds = {};
    let name = '';

    if (entityType === 'school') {
      entityIds.class_id = selectedClass;
      const classObj = classes.find(c => c.id === selectedClass);
      name = classObj?.name || 'Class';

      if (selectedSection) {
        entityIds.section_id = selectedSection;
        const section = classObj?.sections?.find(s => s.id === selectedSection);
        name += ` - ${section?.name || 'Section'}`;
      }
    }

    if (currentTimetable) {
      // Update existing timetable config
      updateTimetableMutation.mutate({
        id: currentTimetable.id,
        data: { period_config: config }
      });
    } else {
      // Create new timetable
      createTimetableMutation.mutate({
        name: `${name} Timetable`,
        academic_year_id: selectedAcademicYear,
        entity_type: entityType,
        entity_ids: entityIds,
        period_config: config,
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
            </div>
          }
        />

        <ErrorAlert message={error?.message} />

        {/* Filters */}
        <Card>
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
                <StatusBadge status={currentTimetable.is_active ? 'active' : 'inactive'} />
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
                  {currentTimetable.period_config?.periods?.map(period => {
                    // Check if this period is a break period across any day
                    const isBreakPeriodForAnyDay = displayedDays.some(day => 
                      grid[day.value]?.[period.period]?.is_break === true
                    );
                    
                    return (
                      <tr key={period.period} className={isBreakPeriodForAnyDay ? 'bg-amber-50/30' : ''}>
                        <td className="p-2 font-medium border-r">
                          <div>
                            <p>Period {period.period}</p>
                            <p className="text-xs text-muted-foreground">
                              {period.start_time} - {period.end_time}
                            </p>
                          </div>
                        </td>
                        {displayedDays.map(day => {
                          const slot = grid[day.value]?.[period.period];
                          const isBusyTeacher = slot?.teacher_id ? busyTeachersMap[slot.teacher_id] : false;
                          return (
                            <td key={day.value} className="p-2">
                              <TimetableCell
                                slot={slot}
                                day={day.value}
                                period={period.period}
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
    </DndProvider>
  );
}