// src/components/common/TeacherSelectWithStatus.jsx

import { useState, useEffect } from 'react';
import { AlertCircle, Clock, BookOpen, Users } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { timetableService } from '@/services/timetableService';

export default function TeacherSelectWithStatus({
  value,
  onChange,
  day,
  period,
  timetableId,
  classId,
  sectionId,
  error,
  required,
  label = "Teacher",
  placeholder = "Select Teacher",
  disabled = false
}) {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeacherBusy, setSelectedTeacherBusy] = useState(null);

  // Fetch teachers with availability status
  useEffect(() => {
    if (!day || !period) return;

    const fetchTeachers = async () => {
      setLoading(true);
      try {
        const response = await timetableService.getTeachersAvailability(day, period, timetableId);
        if (response.success) {
          setTeachers(response.data);
        }
      } catch (error) {
        console.error('Error fetching teachers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [day, period, timetableId]);

  // Check if selected teacher is busy
  useEffect(() => {
    if (value && teachers.length > 0) {
      const teacher = teachers.find(t => t.id === value);
      setSelectedTeacherBusy(teacher?.isBusy ? teacher.busyDetails : null);
    } else {
      setSelectedTeacherBusy(null);
    }
  }, [value, teachers]);

  const handleTeacherChange = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    
    if (teacher?.isBusy) {
      // Show warning but allow selection? 
      // Better to prevent selection
      return;
    }
    
    onChange(teacherId);
  };

  const getTeacherStatusColor = (teacher) => {
    if (teacher.isBusy) return 'text-red-600 bg-red-50';
    return 'text-green-600 bg-green-50';
  };

  const getBusyTooltipContent = (busyDetails) => {
    if (!busyDetails) return '';
    return `${busyDetails.entityDisplay} mein ${busyDetails.subjectName} ${busyDetails.period}th period mein pada rahe hain`;
  };

  return (
    <div className="space-y-2">
      <Label className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ''}>
        {label}
      </Label>
      
      <Select
        value={value}
        onValueChange={handleTeacherChange}
        disabled={disabled || loading || !day || !period}
      >
        <SelectTrigger className={error ? 'border-red-500' : ''}>
          <SelectValue placeholder={loading ? "Loading teachers..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {teachers.map((teacher) => (
            <TooltipProvider key={teacher.id}>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <SelectItem
                    value={teacher.id}
                    disabled={teacher.isBusy}
                    className={teacher.isBusy ? 'opacity-60 cursor-not-allowed' : ''}
                  >
                    <div className="flex items-center justify-between w-full gap-2">
                      <span className="flex-1">{teacher.name}</span>
                      {teacher.isBusy && (
                        <span className="flex items-center gap-1 text-xs text-red-600">
                          <Clock className="h-3 w-3" />
                          Busy
                        </span>
                      )}
                    </div>
                  </SelectItem>
                </TooltipTrigger>
                {teacher.isBusy && teacher.busyDetails && (
                  <TooltipContent side="left" className="max-w-sm">
                    <div className="space-y-1 p-1">
                      <p className="font-semibold text-sm flex items-center gap-1">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        Teacher is busy!
                      </p>
                      <div className="text-xs space-y-1 text-muted-foreground">
                        <p className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {teacher.busyDetails.subjectName}
                        </p>
                        <p className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {teacher.busyDetails.entityDisplay}
                        </p>
                        <p className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Period {teacher.busyDetails.period} - Day {teacher.busyDetails.day}
                        </p>
                      </div>
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          ))}
          
          {teachers.length === 0 && !loading && (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No teachers found
            </div>
          )}
          
          {loading && (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Loading teachers...
            </div>
          )}
        </SelectContent>
      </Select>
      
      {selectedTeacherBusy && (
        <div className="mt-2 p-2 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Warning: Teacher is busy!</p>
            <p className="text-red-600">
              Yeh teacher {selectedTeacherBusy.entityDisplay} mein 
              "{selectedTeacherBusy.subjectName}" subject 
              {selectedTeacherBusy.period}th period mein pada rahe hain.
            </p>
            <p className="text-red-500 mt-1">
              Please select different time or different teacher.
            </p>
          </div>
        </div>
      )}
      
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
}