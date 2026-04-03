'use client';

import React, { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { academicYearService, classService } from '@/services';
import { SelectField, DatePickerField } from '@/components/common';

/**
 * Reusable Attendance Filter Component
 * Standardizes Academic Year, Class, Section, and Date filters across attendance pages.
 * 
 * @param {Object} filters - State object containing { academic_year_id, class_id, section_id, date }
 * @param {Function} setFilters - State setter function
 * @param {Object} terms - Institute custom terms (class, section, etc.)
 * @param {boolean} showDate - Whether to show the date picker
 */
const AttendanceFilter = ({ 
  filters, 
  setFilters, 
  terms = {}, 
  showDate = true 
}) => {
  // Fetch Academic Years
  const { data: yearsData } = useQuery({
    queryKey: ['academic-years'],
    queryFn: () => academicYearService.getAll({ is_active: true }),
  });

  // Fetch Classes
  const { data: classesData } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.getAll(),
  });

  // Default to current academic year if not set
  useEffect(() => {
    if (yearsData?.data && !filters.academic_year_id) {
      const currentYear = yearsData.data.find(y => 
        y.is_current === true || 
        String(y.is_current) === '1' || 
        String(y.is_current) === 'true'
      ) || yearsData.data[0];
      
      if (currentYear) {
        setFilters(prev => ({ ...prev, academic_year_id: currentYear.id }));
      }
    }
  }, [yearsData, filters.academic_year_id, setFilters]);

  const classes = classesData?.data?.rows ?? classesData?.data ?? [];
  
  // Calculate sections based on selected class
  const sections = useMemo(() => {
    if (!filters.class_id || !classes.length) return [];
    const selectedClass = classes.find(c => String(c.id) === String(filters.class_id));
    return selectedClass?.sections || [];
  }, [filters.class_id, classes]);

  const handleFilterChange = (name, val) => {
    setFilters(prev => {
      const next = { ...prev, [name]: val };
      // Reset section if class changes
      if (name === 'class_id') {
        next.section_id = '';
      }
      return next;
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {showDate && (
        <DatePickerField 
          label="Date" 
          value={filters.date} 
          onChange={v => handleFilterChange('date', v)} 
        />
      )}
      
      <SelectField 
        label={terms.academic_year || "Academic Year"} 
        options={yearsData?.data?.map(y => ({ value: y.id, label: y.name })) || []} 
        value={filters.academic_year_id} 
        onChange={v => handleFilterChange('academic_year_id', v)} 
        placeholder="Select Year"
      />

      <SelectField 
        label={terms.class || "Class"} 
        options={classes.map(c => ({ value: String(c.id), label: c.name })) || []} 
        value={String(filters.class_id || '')} 
        onChange={v => handleFilterChange('class_id', v)} 
        placeholder="Select Class" 
      />

      <SelectField 
        label={terms.section || "Section"} 
        options={sections.map(s => ({ value: String(s.id), label: s.name }))} 
        value={String(filters.section_id || '')} 
        onChange={v => handleFilterChange('section_id', v)} 
        placeholder="All Sections" 
        disabled={!filters.class_id} 
      />
    </div>
  );
};

export default AttendanceFilter;
