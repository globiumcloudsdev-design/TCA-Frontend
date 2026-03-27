// // src/components/forms/ClassForm.jsx
// /**
//  * ClassForm — Create / Edit class with sections and courses (Fully Responsive)
//  * ─────────────────────────────────────────────────────────────────
//  * Props:
//  *   defaultValues      object          Pre-filled values for edit mode
//  *   onSubmit           (data) => void  Called with form data
//  *   onCancel           () => void
//  *   loading            boolean
//  *   academicYearOptions { value, label }[]
//  *   teacherOptions     { value, label }[]
//  *   instituteType      string
//  *   isEdit             boolean
//  */

// src/components/forms/ClassForm.jsx (COMPLETE FIXED VERSION)

'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  InputField,
  SelectField,
  StatusBadge,
  TextareaField,
  FormSubmitButton,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  BookOpen, 
  Users, 
  FileText,
  Upload,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

// Constants
const MAX_PDF_MB = 10;
const MAX_PDF_BYTES = MAX_PDF_MB * 1024 * 1024;

// Validation Schemas
const materialSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Material name is required'),
  description: z.string().optional().default(''),
  file: z.any().optional(),
  pdf_url: z.string().optional(),
  active: z.boolean().default(true),
});

const courseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Course name is required'),
  code: z.string().optional().default(''),
  description: z.string().optional().default(''),
  active: z.boolean().default(true),
  materials: z.array(materialSchema).default([]),
});

const sectionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Section name is required'),
  room_no: z.string().optional(),
  capacity: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
    z.number().min(1, 'Capacity must be at least 1').optional()
  ),
  active: z.boolean().default(true),
});

const classSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  description: z.string().optional().default(''),
  academic_year_id: z.string().min(1, 'Academic year is required'),
  active: z.boolean().default(true),
  sections: z.array(sectionSchema).default([]),
  courses: z.array(courseSchema).default([]),
});

export default function ClassForm({
  defaultValues = {},
  onSubmit,
  onCancel,
  loading = false,
  academicYearOptions = [],
  instituteType = 'school',
  isEdit = false,
}) {
  const [activeTab, setActiveTab] = useState('basic');
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  // ✅ FIXED: Log incoming props for debugging
  useEffect(() => {
    console.log('📥 ClassForm received defaultValues:', defaultValues);
    console.log('📥 isEdit mode:', isEdit);
  }, [defaultValues, isEdit]);

  // Check if mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ✅ FIXED: Prepare initial values
  const getInitialValues = () => {
    const initial = {
      name: '',
      description: '',
      academic_year_id: '',
      active: true,
      sections: [],
      courses: [],
      ...defaultValues,
    };
    
    // Ensure sections have all fields
    initial.sections = (initial.sections || []).map(s => ({
      id: s.id,
      name: s.name || '',
      room_no: s.room_no || '',
      capacity: s.capacity || 30,
      active: s.active ?? true,
    }));

    // Ensure courses have all fields
    initial.courses = (initial.courses || []).map(c => ({
      id: c.id,
      name: c.name || '',
      code: c.code || '',
      description: c.description || '',
      active: c.active ?? true,
      materials: (c.materials || []).map(m => ({
        id: m.id,
        name: m.name || '',
        description: m.description || '',
        pdf_url: m.pdf_url || null,
        active: m.active ?? true,
      })),
    }));

    return initial;
  };

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(classSchema),
    defaultValues: getInitialValues(),
  });

  const selectedAcademicYearId = watch('academic_year_id');
  const selectedAcademicYear = (academicYearOptions || []).find(
    (option) => String(option.value) === String(selectedAcademicYearId)
  );

  // ✅ FIXED: Reset form when defaultValues change (important for edit mode)
  useEffect(() => {
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      console.log('🔄 Resetting form with new values:', defaultValues);
      reset(getInitialValues());
    }
  }, [defaultValues?.id]); // Only reset when ID changes

  // Field arrays
  const { 
    fields: sectionFields, 
    append: appendSection, 
    remove: removeSection 
  } = useFieldArray({ control, name: 'sections' });

  const { 
    fields: courseFields, 
    append: appendCourse, 
    remove: removeCourse 
  } = useFieldArray({ control, name: 'courses' });

  // Navigation for mobile tabs
  const nextTab = () => {
    const tabs = ['basic', 'sections', 'courses'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const prevTab = () => {
    const tabs = ['basic', 'sections', 'courses'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  // Get term based on institute type
  const getTerm = (key) => {
    const terms = {
      school: { class: 'Class', section: 'Section', course: 'Subject' },
      college: { class: 'Program', section: 'Batch', course: 'Course' },
      university: { class: 'Department', section: 'Semester', course: 'Course' },
      coaching: { class: 'Batch', section: 'Group', course: 'Subject' },
      academy: { class: 'Program', section: 'Batch', course: 'Module' },
      tuition_center: { class: 'Grade', section: 'Group', course: 'Subject' },
    };
    return terms[instituteType]?.[key] || key;
  };

  // Handle file selection
  const handleFileChange = (courseIndex, materialIndex, file, onChange) => {
    if (file && file.size > MAX_PDF_BYTES) {
      alert(`File size must be less than ${MAX_PDF_MB}MB`);
      return;
    }
    
    onChange(file);
    
    setUploadingFiles(prev => ({
      ...prev,
      [`${courseIndex}-${materialIndex}`]: file ? {
        name: file.name,
        size: file.size,
        type: file.type
      } : null,
    }));
  };

  // Remove file
  const removeMaterialFile = (courseIndex, materialIndex) => {
    setValue(`courses.${courseIndex}.materials.${materialIndex}.file`, null);
    setUploadingFiles(prev => {
      const newState = { ...prev };
      delete newState[`${courseIndex}-${materialIndex}`];
      return newState;
    });
  };

  // Add new section
  const handleAddSection = () => {
    appendSection({
      name: '',
      room_no: '',
      capacity: 30,
      active: true,
    });
  };

  // Add new course
  const handleAddCourse = () => {
    appendCourse({
      name: '',
      code: '',
      description: '',
      active: true,
      materials: [],
    });
  };

  // Add material to course
  const handleAddMaterial = (courseIndex) => {
    const currentMaterials = getValues(`courses.${courseIndex}.materials`) || [];
    setValue(`courses.${courseIndex}.materials`, [
      ...currentMaterials,
      { name: '', description: '', active: true, file: null }
    ]);
  };

  // Remove material from course
  const handleRemoveMaterial = (courseIndex, materialIndex) => {
    const materials = getValues(`courses.${courseIndex}.materials`) || [];
    materials.splice(materialIndex, 1);
    setValue(`courses.${courseIndex}.materials`, materials);
    
    setUploadingFiles(prev => {
      const newState = { ...prev };
      delete newState[`${courseIndex}-${materialIndex}`];
      return newState;
    });
  };

  // ✅ FIXED: Form submit handler with validation
  const onSubmitForm = (data) => {
    console.log('📤 Form submitting with data:', data);
    console.log('📤 Form is dirty:', isDirty);
    
    // Format data for API
    const formattedData = {
      ...data,
      sections: data.sections.map(section => ({
        id: section.id, // Keep ID for updates
        name: section.name,
        room_no: section.room_no || '',
        capacity: section.capacity ? Number(section.capacity) : null,
        active: section.active,
      })),
      courses: data.courses.map(course => ({
        id: course.id, // Keep ID for updates
        name: course.name,
        code: course.code || '',
        description: course.description || '',
        active: course.active,
        materials: (course.materials || []).map(material => ({
          id: material.id, // Keep ID for updates
          name: material.name,
          description: material.description || '',
          pdf_url: material.pdf_url,
          active: material.active,
          file: material.file instanceof File ? material.file : undefined,
        }))
      }))
    };
    
    console.log('📦 Formatted data for API:', formattedData);
    onSubmit(formattedData);
  };

  // Handle form errors
  const onFormError = (errs) => {
    console.log('❌ Form validation errors:', errs);
    
    if (errs.name || errs.academic_year_id) {
      setActiveTab('basic');
    } else if (errs.sections) {
      setActiveTab('sections');
    } else if (errs.courses) {
      setActiveTab('courses');
    }
    
    // Show error toast
    toast.error('Please fix the errors in the form');
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm, onFormError)} className="space-y-4 sm:space-y-6">
      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-muted-foreground p-2 border rounded">
          <p>Mode: {isEdit ? 'Edit' : 'Create'}</p>
          <p>Form Dirty: {isDirty ? 'Yes' : 'No'}</p>
          <p>Sections: {sectionFields.length}</p>
          <p>Courses: {courseFields.length}</p>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className={`inline-flex w-auto sm:grid ${isMobile ? 'flex-nowrap' : 'grid-cols-3'} mb-4 sm:mb-6`}>
            <TabsTrigger value="basic" className="px-3 sm:px-4">
              Basic Info
              {(errors.name || errors.academic_year_id) && (
                <span className="ml-1 h-2 w-2 rounded-full bg-destructive inline-block" />
              )}
            </TabsTrigger>
            <TabsTrigger value="sections" className="px-3 sm:px-4">
              {getTerm('section')}s
              {sectionFields.length > 0 && (
                <Badge variant="secondary" className="ml-1 sm:ml-2 text-[10px] sm:text-xs">
                  {sectionFields.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="courses" className="px-3 sm:px-4">
              {getTerm('course')}s
              {courseFields.length > 0 && (
                <Badge variant="secondary" className="ml-1 sm:ml-2 text-[10px] sm:text-xs">
                  {courseFields.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Mobile Navigation */}
        {isMobile && (
          <div className="flex items-center justify-between mb-4">
            <Button type="button" variant="outline" size="sm" onClick={prevTab} disabled={activeTab === 'basic'}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium capitalize">
              {activeTab === 'basic' ? 'Basic Info' : activeTab}
            </span>
            <Button type="button" variant="outline" size="sm" onClick={nextTab} disabled={activeTab === 'courses'}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Tab 1: Basic Information */}
        <TabsContent value="basic">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-5">
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {getTerm('class')} Information
                </p>
                
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                  <InputField
                    label={`${getTerm('class')} Name`}
                    name="name"
                    register={register}
                    error={errors.name}
                    required
                    placeholder={`e.g. ${getTerm('class')} 9`}
                  />
                  
                  <SelectField
                    label="Academic Year"
                    name="academic_year_id"
                    control={control}
                    error={errors.academic_year_id}
                    options={academicYearOptions}
                    placeholder="Select"
                    required
                  />
                  {selectedAcademicYear?.is_current ? (
                    <div className="-mt-2">
                      <StatusBadge status="current" label="Current Academic Year" />
                    </div>
                  ) : null}
                  
                  <div className="col-span-1 md:col-span-2">
                    <TextareaField
                      label="Description (Optional)"
                      name="description"
                      register={register}
                      error={errors.description}
                      placeholder={`Description for this ${getTerm('class').toLowerCase()} (optional)`}
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-3 sm:p-4 gap-3">
                  <div>
                    <Label htmlFor="active" className="text-sm sm:text-base font-medium">
                      Status
                    </Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {watch('active') ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <Controller
                    name="active"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="active"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Sections */}
        <TabsContent value="sections">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {getTerm('section')} Management
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddSection}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add {getTerm('section')}
                  </Button>
                </div>

                {sectionFields.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 border-2 border-dashed rounded-lg">
                    <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm sm:text-base text-muted-foreground">No sections added yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {sectionFields.map((field, index) => (
                      <div key={field.id} className="border rounded-lg p-3 sm:p-4 relative">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
                          onClick={() => removeSection(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3 pr-8">
                          <InputField
                            label={`${getTerm('section')} Name`}
                            name={`sections.${index}.name`}
                            register={register}
                            error={errors.sections?.[index]?.name}
                            required
                            placeholder={`e.g. A, Morning`}
                          />
                          
                          <InputField
                            label="Room No."
                            name={`sections.${index}.room_no`}
                            register={register}
                            error={errors.sections?.[index]?.room_no}
                            placeholder="e.g. 101"
                          />
                          
                          <InputField
                            label="Capacity"
                            name={`sections.${index}.capacity`}
                            register={register}
                            error={errors.sections?.[index]?.capacity}
                            type="number"
                            placeholder="e.g. 40"
                          />
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <Label htmlFor={`section-${index}-active`}>Status</Label>
                          <Controller
                            name={`sections.${index}.active`}
                            control={control}
                            render={({ field }) => (
                              <Switch
                                id={`section-${index}-active`}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Courses */}
        <TabsContent value="courses">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {getTerm('course')} Management
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCourse}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add {getTerm('course')}
                  </Button>
                </div>

                {courseFields.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 border-2 border-dashed rounded-lg">
                    <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm sm:text-base text-muted-foreground">No courses added yet</p>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {courseFields.map((field, courseIndex) => (
                      <div key={field.id} className="border rounded-lg p-3 sm:p-4">
                        {/* Course Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                          <h4 className="text-sm sm:text-base font-medium">
                            {getTerm('course')} {courseIndex + 1}: {watch(`courses.${courseIndex}.name`) || 'New Course'}
                          </h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 w-full sm:w-auto"
                            onClick={() => removeCourse(courseIndex)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>

                        {/* Course Details */}
                        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                          <InputField
                            label="Course Name"
                            name={`courses.${courseIndex}.name`}
                            register={register}
                            error={errors.courses?.[courseIndex]?.name}
                            required
                            placeholder="e.g. Mathematics"
                          />
                          
                          <InputField
                            label="Course Code (Optional)"
                            name={`courses.${courseIndex}.code`}
                            register={register}
                            error={errors.courses?.[courseIndex]?.code}
                            placeholder="e.g. MATH-101"
                          />
                          
                          <div className="col-span-1 md:col-span-2">
                            <TextareaField
                              label="Description (Optional)"
                              name={`courses.${courseIndex}.description`}
                              register={register}
                              error={errors.courses?.[courseIndex]?.description}
                              placeholder="Course description (optional)"
                              rows={2}
                            />
                          </div>
                        </div>

                        {/* Course Status */}
                        <div className="mt-3 flex items-center justify-between border-t pt-3">
                          <Label htmlFor={`course-${courseIndex}-active`}>Course Status</Label>
                          <Controller
                            name={`courses.${courseIndex}.active`}
                            control={control}
                            render={({ field }) => (
                              <Switch
                                id={`course-${courseIndex}-active`}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            )}
                          />
                        </div>

                        {/* Materials Section */}
                        <div className="mt-4 border-t pt-4">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                            <h5 className="text-xs sm:text-sm font-medium flex items-center">
                              <FileText className="h-4 w-4 mr-2" />
                              Course Materials
                            </h5>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddMaterial(courseIndex)}
                              className="w-full sm:w-auto"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Material
                            </Button>
                          </div>

                          {(!watch(`courses.${courseIndex}.materials`) || 
                            watch(`courses.${courseIndex}.materials`).length === 0) ? (
                            <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">
                              No materials added yet
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {watch(`courses.${courseIndex}.materials`).map((material, materialIndex) => (
                                <div key={materialIndex} className="bg-accent/20 rounded-lg p-3">
                                  {/* Material Header */}
                                  <div className="flex flex-col sm:flex-row items-start justify-between mb-2 gap-2">
                                    <div className="w-full sm:flex-1">
                                      <InputField
                                        label="Material Name"
                                        name={`courses.${courseIndex}.materials.${materialIndex}.name`}
                                        register={register}
                                        error={errors.courses?.[courseIndex]?.materials?.[materialIndex]?.name}
                                        required
                                        placeholder="e.g. Chapter 1 Notes"
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive hover:bg-destructive/10 w-full sm:w-auto mt-1 sm:mt-0"
                                      onClick={() => handleRemoveMaterial(courseIndex, materialIndex)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  {/* Material Description */}
                                  <div className="mb-3">
                                    <TextareaField
                                      label="Description (Optional)"
                                      name={`courses.${courseIndex}.materials.${materialIndex}.description`}
                                      register={register}
                                      error={errors.courses?.[courseIndex]?.materials?.[materialIndex]?.description}
                                      placeholder="Material description (optional)"
                                      rows={1}
                                    />
                                  </div>

                                  {/* File Upload Section */}
                                  <div className="space-y-2 mb-3">
                                    <Label>PDF File (Max {MAX_PDF_MB}MB)</Label>

                                    {/* Show existing PDF if any */}
                                    {watch(`courses.${courseIndex}.materials.${materialIndex}.pdf_url`) && 
                                     !uploadingFiles[`${courseIndex}-${materialIndex}`] && (
                                      <div className="flex items-center gap-2 text-xs bg-accent/30 rounded px-2 py-1 mb-2">
                                        <FileText className="h-3 w-3 shrink-0" />
                                        <a
                                          href={watch(`courses.${courseIndex}.materials.${materialIndex}.pdf_url`)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="truncate hover:underline text-blue-600"
                                        >
                                          Current PDF
                                        </a>
                                        <span className="text-muted-foreground">(upload new to replace)</span>
                                      </div>
                                    )}

                                    {/* File Input */}
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                      <Controller
                                        name={`courses.${courseIndex}.materials.${materialIndex}.file`}
                                        control={control}
                                        render={({ field: { onChange } }) => (
                                          <>
                                            <input
                                              type="file"
                                              accept=".pdf,application/pdf"
                                              onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                handleFileChange(courseIndex, materialIndex, file, onChange);
                                              }}
                                              className="hidden"
                                              id={`file-${courseIndex}-${materialIndex}`}
                                            />
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="sm"
                                              onClick={() => document.getElementById(`file-${courseIndex}-${materialIndex}`).click()}
                                              className="flex-1"
                                            >
                                              <Upload className="h-4 w-4 mr-2" />
                                              <span className="truncate">
                                                {uploadingFiles[`${courseIndex}-${materialIndex}`]?.name || 'Choose PDF'}
                                              </span>
                                            </Button>
                                          </>
                                        )}
                                      />
                                      
                                      {uploadingFiles[`${courseIndex}-${materialIndex}`] && (
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeMaterialFile(courseIndex, materialIndex)}
                                          className="w-full sm:w-auto"
                                        >
                                          <X className="h-4 w-4" />
                                          Clear
                                        </Button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Material Status */}
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor={`material-${courseIndex}-${materialIndex}-active`}>
                                      Active
                                    </Label>
                                    <Controller
                                      name={`courses.${courseIndex}.materials.${materialIndex}.active`}
                                      control={control}
                                      render={({ field }) => (
                                        <Switch
                                          id={`material-${courseIndex}-${materialIndex}-active`}
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      )}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        
        {/* ✅ FIXED: Submit button with proper loading state */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? (
            <>
              <span className="mr-2">Saving...</span>
              <span className="animate-spin">⏳</span>
            </>
          ) : (
            isEdit ? 'Save Changes' : `Create ${getTerm('class')}`
          )}
        </Button>
      </div>
    </form>
  );
}