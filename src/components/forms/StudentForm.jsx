// /**
//  * StudentForm — Create / Edit student
//  * ─────────────────────────────────────────────────────────────────
//  * Props:
//  *   defaultValues      object          Pre-filled values for edit mode
//  *   onSubmit           (data) => void  Called with form data
//  *   onCancel           () => void
//  *   loading            boolean
//  *   classOptions       { value, label }[]
//  *   sectionOptions     { value, label }[]
//  *   academicYearOptions{ value, label }[]
//  *   isEdit             boolean
//  */
'use client';

import { useForm, Controller, useFieldArray } from 'react-hook-form'; 
import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  InputField,
  SelectField,
  TextareaField,
  DatePickerField,
  FormSubmitButton,
  SwitchField
} from '@/components/common';
import PhoneInputField from '@/components/common/PhoneInput';
import CnicInput from '@/components/common/CnicInput';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  X, Upload, ChevronLeft, ChevronRight, Plus, Trash2, 
  User, GraduationCap, Users, Phone, MapPin, Heart, DollarSign, BookOpen, Eye
} from 'lucide-react';
import {
  GENDER_OPTIONS, RELIGION_OPTIONS, BLOOD_GROUP_OPTIONS, DOCUMENT_TYPES, CONCESSION_OPTIONS, GUARDIAN_TYPES
} from '@/constants';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { classService, academicYearService } from '@/services';
import { toast } from 'react-hot-toast';

const generateUniqueId = (prefix = 'doc') => `${prefix}-${new Date().getTime()}-${Math.floor(Math.random() * 1000)}`;
const VALID_DOCUMENT_TYPES = new Set(DOCUMENT_TYPES.map((d) => d.value));

export default function StudentForm({
  defaultValues = {},
  onSubmit,
  onCancel,
  loading = false,
  instituteId,
  instituteType = 'school',
  isEdit = false,
}) {
  const [activeTab, setActiveTab] = useState('personal');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(
    defaultValues.academic_year_id || defaultValues.details?.studentDetails?.academic_year_id || ''
  );
  const [avatarPreview, setAvatarPreview] = useState(defaultValues.avatar_url || null);
  const avatarFileRef = useRef(null);
  const prevClassRef = useRef(defaultValues.class_id || defaultValues.details?.studentDetails?.class_id || '');

  const isMobile = useMediaQuery('(max-width: 640px)');

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    trigger,
    formState: { errors },
  } = useForm({
    mode: 'onTouched',
    defaultValues: {
      documents: [],
      guardians: [{ name: '', relation: '', phone: '', cnic: '', email: '', type: 'father' }],
      nationality: defaultValues.nationality || 'Pakistan',
      admission_date: isEdit ? defaultValues.admission_date : new Date(),
      is_active: defaultValues.is_active ?? true,
      ...defaultValues,
      details: {
        studentDetails: {
          ...defaultValues.details?.studentDetails,
        }
      }
    }
  });

  const watchAcademicYear = watch('academic_year_id');
  const watchClass = watch('class_id');
  const watchSection = watch('section_id');

  const { fields: guardianFields, append: appendGuardian, remove: removeGuardian } = useFieldArray({
    control,
    name: 'guardians'
  });

  const { fields: docFields, append: appendDoc, remove: removeDoc } = useFieldArray({
    control,
    name: 'documents'
  });

  useEffect(() => {
    if (isEdit && defaultValues?.id) {
      reset(defaultValues);
      
      const academicYearId = defaultValues.academic_year_id || defaultValues.details?.studentDetails?.academic_year_id;
      if (academicYearId) {
        setSelectedAcademicYear(academicYearId);
        setValue('academic_year_id', academicYearId);
      }
      
      const classId = defaultValues.class_id || defaultValues.details?.studentDetails?.class_id;
      if (classId) {
        prevClassRef.current = classId;
        setValue('class_id', classId);
      }

      const sectionId = defaultValues.section_id || defaultValues.details?.studentDetails?.section_id;
      if (sectionId) {
        setValue('section_id', sectionId);
      }
    }
  }, [defaultValues?.id, reset]);

  // Fetch Academic Years
  const { data: rawAcademicYearsData = [] } = useQuery({
    queryKey: ['academic-years', instituteId],
    queryFn: () => academicYearService.getAll({ institute_id: instituteId, is_active: true }),
    enabled: !!instituteId,
  });

  const academicYears = useMemo(() => {
    let arr = rawAcademicYearsData?.data || rawAcademicYearsData || [];
    if (rawAcademicYearsData?.data?.data) arr = rawAcademicYearsData.data.data;
    return arr.map(y => ({
      value: y.id,
      label: y.name || `${y.start_date} to ${y.end_date}`,
      is_current: y.is_current
    }));
  }, [rawAcademicYearsData]);

  // Auto-select current academic year
  useEffect(() => {
    if (academicYears.length > 0 && !watchAcademicYear && !isEdit) {
      const current = academicYears.find(y => y.is_current) || academicYears[0];
      if (current) {
        setValue('academic_year_id', current.value);
        setSelectedAcademicYear(current.value);
      }
    }
  }, [academicYears, watchAcademicYear, isEdit, setValue]);

  // Fetch Classes
  const { data: classes = [] } = useQuery({
    queryKey: ['classes', instituteId, selectedAcademicYear],
    queryFn: async () => {
      if (!selectedAcademicYear) return [];
      const response = await classService.getAll({ academic_year_id: selectedAcademicYear, include_sections: true });
      const data = response.data || response || [];
      return Array.isArray(data.rows) ? data.rows : (Array.isArray(data) ? data : []);
    },
    enabled: !!selectedAcademicYear,
  });

  const selectedClassData = useMemo(() => {
    return Array.isArray(classes) ? classes.find((c) => String(c?.id) === String(watchClass)) : null;
  }, [classes, watchClass]);

  const sections = useMemo(() => {
    if (!watchClass || !selectedClassData) return [];
    const rawSections = Array.isArray(selectedClassData?.sections) ? selectedClassData.sections : [];
    return rawSections.map(s => ({ id: s.id, name: s.name, is_active: s.is_active !== false })).filter(s => s.id && s.is_active);
  }, [watchClass, selectedClassData]);

  const selectedSectionData = useMemo(() => {
    return sections.find((s) => String(s?.id) === String(watchSection)) || null;
  }, [sections, watchSection]);

  useEffect(() => {
    if (watchAcademicYear && watchAcademicYear !== selectedAcademicYear) {
      setSelectedAcademicYear(watchAcademicYear);
      setValue('class_id', '');
      setValue('section_id', '');
    }
  }, [watchAcademicYear, selectedAcademicYear, setValue]);

  useEffect(() => {
    if (watchClass && watchClass !== prevClassRef.current) {
      setValue('section_id', '');
      prevClassRef.current = watchClass;
    }
  }, [watchClass, setValue]);

  useEffect(() => {
    const className = selectedClassData?.name || '';
    const sectionName = selectedSectionData?.name || '';
    setValue('class_name', className, { shouldDirty: false });
    setValue('section_name', sectionName, { shouldDirty: false });
  }, [selectedClassData, selectedSectionData, setValue]);

  // Sync Class and Section once data is loaded
  useEffect(() => {
    if (isEdit && classes.length > 0) {
      const targetClassId = defaultValues.class_id || defaultValues.details?.studentDetails?.class_id;
      if (targetClassId && !watchClass) {
        setValue('class_id', targetClassId);
        prevClassRef.current = targetClassId;
      }
    }
  }, [isEdit, classes, watchClass, setValue, defaultValues]);

  useEffect(() => {
    if (isEdit && sections.length > 0) {
      const targetSectionId = defaultValues.section_id || defaultValues.details?.studentDetails?.section_id;
      const currentClassId = watchClass;
      const originalClassId = defaultValues.class_id || defaultValues.details?.studentDetails?.class_id;
      
      // Only auto-select section if we are still on the original class
      if (targetSectionId && !watchSection && currentClassId === originalClassId) {
        setValue('section_id', targetSectionId);
      }
    }
  }, [isEdit, sections, watchSection, watchClass, setValue, defaultValues]);

  // Tab Navigation logic
  const validateTab = async (tab) => {
    let fields = [];
    if (tab === 'personal') {
      fields = ['first_name', 'last_name', 'dob', 'gender'];
    } else if (tab === 'academic') {
      fields = ['academic_year_id', 'class_id', 'section_id', 'roll_no', 'admission_date'];
    } else if (tab === 'guardian') {
      fields = ['guardians'];
    } else if (tab === 'contact') {
      fields = ['phone', 'city', 'present_address'];
    } else if (tab === 'fee') {
      fields = ['monthly_fee', 'concession_type'];
    }
    return await trigger(fields);
  };

  const nextTab = async () => {
    const isValid = await validateTab(activeTab);
    if (!isValid) return;
    const tabs = ['personal', 'academic', 'guardian', 'contact', 'fee', 'documents'];
    const idx = tabs.indexOf(activeTab);
    if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1]);
  };

  const prevTab = () => {
    const tabs = ['personal', 'academic', 'guardian', 'contact', 'fee', 'documents'];
    const idx = tabs.indexOf(activeTab);
    if (idx > 0) setActiveTab(tabs[idx - 1]);
  };

  const handleTabChange = async (value) => {
    const tabs = ['personal', 'academic', 'guardian', 'contact', 'fee', 'documents'];
    const currentIdx = tabs.indexOf(activeTab);
    const targetIdx = tabs.indexOf(value);
    if (targetIdx > currentIdx) {
      const isValid = await validateTab(activeTab);
      if (!isValid) return;
    }
    setActiveTab(value);
  };

  // Auto-navigate to first error tab
  useEffect(() => {
    const errorFields = Object.keys(errors);
    if (errorFields.length > 0) {
      const personalFields = ['first_name', 'last_name', 'dob', 'gender', 'cnic', 'nationality', 'city'];
      const academicFields = ['academic_year_id', 'class_id', 'section_id', 'roll_no', 'admission_date'];
      const contactFields = ['phone', 'email', 'present_address', 'permanent_address'];
      const feeFields = ['monthly_fee', 'admission_fee', 'concession_type', 'discount_type'];
      
      if (errorFields.some(f => personalFields.includes(f))) setActiveTab('personal');
      else if (errorFields.some(f => academicFields.includes(f))) setActiveTab('academic');
      else if (errorFields.some(f => f.startsWith('guardians'))) setActiveTab('guardian');
      else if (errorFields.some(f => contactFields.includes(f))) setActiveTab('contact');
      else if (errorFields.some(f => feeFields.includes(f))) setActiveTab('fee');
      else if (errorFields.some(f => f.startsWith('documents'))) setActiveTab('documents');
    }
  }, [errors]);

  const watchConcessionType = watch('concession_type');
  const isConcessionNone = watchConcessionType === 'none' || !watchConcessionType;

  useEffect(() => {
    if (watchConcessionType === 'full') {
      setValue('discount_type', 'percentage', { shouldDirty: true });
      setValue('concession_percentage', 100, { shouldDirty: true });
      setValue('concession_reason', 'Full Concession Scholarship', { shouldDirty: true });
    } else if (watchConcessionType === 'half') {
      setValue('discount_type', 'percentage', { shouldDirty: true });
      setValue('concession_percentage', 50, { shouldDirty: true });
      setValue('concession_reason', 'Half Concession Scholarship', { shouldDirty: true });
    }
  }, [watchConcessionType, setValue]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
    setValue('avatar_file', file, { shouldDirty: true });
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    setValue('avatar_file', null);
  };

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      appendDoc({
        id: generateUniqueId(),
        type: 'other',
        title: file.name,
        file_name: file.name,
        file_url: URL.createObjectURL(file),
        file: file
      });
    });
    e.target.value = '';
  };

  const onSubmitForm = (data) => {
    const formData = new FormData();
    const editableKeys = ['first_name', 'last_name', 'email', 'phone', 'registration_no', 'dob', 'gender', 'blood_group', 'religion', 'nationality', 'cnic', 'academic_year_id', 'class_id', 'section_id', 'roll_no', 'admission_date', 'present_address', 'permanent_address', 'city', 'monthly_fee', 'admission_fee', 'discount_type', 'lab_charges', 'annual_charges', 'concession_type', 'concession_percentage', 'concession_reason', 'medical_conditions', 'allergies', 'previous_school', 'previous_class', 'is_active'];
    
    editableKeys.forEach(key => { if (data[key] !== undefined) formData.append(key, data[key]); });
    if (data.avatar_file instanceof File) formData.append('photo', data.avatar_file);
    
    const normalizedGuardians = (data.guardians || []).map(g => ({ ...g, type: g.type || 'father', relation: g.relation || g.type || 'father' }));
    formData.append('guardians', JSON.stringify(normalizedGuardians));
    
    const details = { studentDetails: { ...data.details?.studentDetails, class_id: watchClass, section_id: watchSection } };
    formData.append('details', JSON.stringify(details));

    const documentMetadata = (data.documents || []).map(doc => {
      if (doc.file instanceof File) formData.append('documents', doc.file);
      const { file, ...meta } = doc;
      return meta;
    });
    formData.append('documents_meta', JSON.stringify(documentMetadata));
    formData.append('institute_id', instituteId);
    formData.append('institute_type', instituteType);

    onSubmit(formData);
  };

  const getTerm = (key) => {
    const terms = { school: { class: 'Class', section: 'Section', student: 'Student' } };
    return terms[instituteType]?.[key] || key;
  };

  return (
    <div className="relative">
      {loading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-[2px] transition-all">
          <div className="relative flex items-center justify-center">
            <div className="h-20 w-20 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
            <div className="absolute h-12 w-12 rounded-full border-4 border-white/10 border-b-white animate-spin-slow"></div>
          </div>
          <div className="mt-6 flex flex-col items-center gap-2 text-center">
            <h2 className="text-xl font-bold text-white tracking-tight">{isEdit ? 'Updating Student Record...' : 'Processing Admission...'}</h2>
            <p className="text-indigo-200 text-sm font-medium animate-pulse px-4">Synchronizing with institutional database</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 sm:space-y-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="overflow-x-auto pb-2 mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-auto sm:grid sm:grid-cols-6 min-w-full">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="academic">Academic</TabsTrigger>
              <TabsTrigger value="guardian">Guardian</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="fee">Fee</TabsTrigger>
              <TabsTrigger value="documents">Docs</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="personal">
            <Card><CardContent className="p-4 sm:p-6 space-y-6">
              <div className="flex flex-col items-center p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300">
                {avatarPreview ? (
                  <div className="relative">
                    <img src={avatarPreview} alt="Preview" className="w-32 h-32 rounded-full object-cover shadow-lg" />
                    <button type="button" onClick={removeAvatar} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X className="w-4 h-4" /></button>
                  </div>
                ) : <div className="w-32 h-32 rounded-full bg-slate-200 flex items-center justify-center"><User className="w-16 h-16 text-slate-400" /></div>}
                <Button type="button" variant="black" className="mt-4" onClick={() => avatarFileRef.current.click()}><Upload className="w-4 h-4 mr-2" />Upload Photo</Button>
                <input ref={avatarFileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <InputField label="First Name *" name="first_name" register={register} error={errors.first_name} placeholder="Ahmed" onInput={e => e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '')} />
                <InputField label="Last Name" name="last_name" register={register} error={errors.last_name} placeholder="Ali" onInput={e => e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '')} />
                <InputField label="GR/Reg No" name="registration_no" register={register} placeholder="e.g. 2024-001" />
                <DatePickerField label="Date of Birth" name="dob" control={control} error={errors.dob} required disableFutureDates placeholder="Select birth date" />
                <SelectField label="Gender" name="gender" control={control} error={errors.gender} options={GENDER_OPTIONS} required placeholder="Select gender" />
                <SelectField label="Religion" name="religion" control={control} options={RELIGION_OPTIONS} placeholder="Select religion" />
                <InputField label="Nationality" name="nationality" register={register} defaultValue="Pakistani" placeholder="e.g. Pakistani" />
                <Controller name="cnic" control={control} render={({ field }) => <CnicInput label="CNIC / B-Form" {...field} error={errors.cnic} placeholder="XXXXX-XXXXXXX-X" />} />
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="academic">
            <Card><CardContent className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <SelectField label="Academic Year" name="academic_year_id" control={control} options={academicYears} required placeholder="Select year" />
                <SelectField label={getTerm('class')} name="class_id" control={control} options={classes.map(c => ({ value: c.id, label: c.name }))} required placeholder={`Select ${getTerm('class')}`} />
                <SelectField label={getTerm('section')} name="section_id" control={control} options={sections.map(s => ({ value: s.id, label: s.name }))} required placeholder="Select section" />
                <InputField label="Roll Number *" name="roll_no" register={register} required placeholder="e.g. 101" onInput={e => e.target.value = e.target.value.replace(/[^0-9]/g, '')} />
                <DatePickerField label="Admission Date" name="admission_date" control={control} required disableFutureDates placeholder="Select admission date" />
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="guardian">
            <Card><CardContent className="p-4 sm:p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Guardians</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => appendGuardian({ name: '', type: 'father' })}><Plus className="w-4 h-4 mr-2" />Add</Button>
              </div>
              {guardianFields.map((field, index) => (
                <div key={field.id} className="border p-4 rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Guardian {index + 1}</span>
                    {guardianFields.length > 1 && <Button type="button" variant="ghost" size="sm" onClick={() => removeGuardian(index)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>}
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <SelectField label="Type *" name={`guardians.${index}.type`} control={control} options={GUARDIAN_TYPES} required placeholder="Select Type" />
                    <InputField label="Name *" name={`guardians.${index}.name`} register={register} required placeholder="Enter Guardian Name" onInput={e => e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '')} />
                    <Controller name={`guardians.${index}.cnic`} control={control} render={({ field }) => <CnicInput label="CNIC" {...field} placeholder="XXXXX-XXXXXXX-X" />} />
                    <Controller name={`guardians.${index}.phone`} control={control} render={({ field }) => <PhoneInputField label="Phone" {...field} country="pk" />} />
                    <InputField label="Email" name={`guardians.${index}.email`} register={register} type="email" placeholder="guardian@example.com" />
                  </div>
                </div>
              ))}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card><CardContent className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Controller name="phone" control={control} render={({ field }) => <PhoneInputField label="Phone" {...field} country="pk" />} />
                <InputField label="Email" name="email" register={register} type="email" placeholder="student@example.com" />
                <InputField label="City *" name="city" register={register} required placeholder="Enter city" onInput={e => e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '')} />
              </div>
              <TextareaField label="Present Address" name="present_address" register={register} required placeholder="Enter present address" />
              <TextareaField label="Permanent Address" name="permanent_address" register={register} placeholder="Enter permanent address" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <InputField label="Emergency Contact Person" name="emergency_contact_name" register={register} placeholder="Contact name" />
                <InputField label="Relation" name="emergency_contact_relation" register={register} placeholder="e.g. Uncle" />
                <Controller name="emergency_contact_phone" control={control} render={({ field }) => <PhoneInputField label="Phone" {...field} country="pk" />} />
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="fee">
            <Card><CardContent className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <InputField label="Monthly Fee" name="monthly_fee" register={register} type="number" placeholder="Enter monthly fee" />
                <InputField label="Admission Fee" name="admission_fee" register={register} type="number" placeholder="Enter admission fee" />
                <SelectField label="Concession" name="concession_type" control={control} options={CONCESSION_OPTIONS} placeholder="Select concession" />
              </div>
              {!isConcessionNone && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <SelectField label="Discount Type" name="discount_type" control={control} options={[{ value: 'fixed', label: 'Fixed' }, { value: 'percentage', label: 'Percentage' }]} placeholder="Select type" />
                  {watch('discount_type') === 'percentage' ? (
                    <InputField label="Percentage %" name="concession_percentage" register={register} type="number" min={0} max={100} placeholder="e.g. 50" />
                  ) : <InputField label="Amount" name="concession_amount" register={register} type="number" placeholder="e.g. 500" />}
                  <TextareaField label="Reason" name="concession_reason" register={register} rows={1} placeholder="Reason for concession" />
                </div>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputField label="Annual Charges" name="annual_charges" register={register} type="number" placeholder="Enter annual charges" />
                <InputField label="Lab Charges" name="lab_charges" register={register} type="number" placeholder="Enter lab charges" />
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">Medical Info</h3>
                <TextareaField label="Medical Conditions" name="medical_conditions" register={register} rows={2} placeholder="Any medical conditions" />
                <TextareaField label="Allergies" name="allergies" register={register} rows={2} placeholder="Any allergies" />
              </div>
              <div className="flex items-center justify-between border p-4 rounded-lg">
                <SwitchField label="Active Status" name="is_active" control={control} />
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card><CardContent className="p-4 sm:p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Documents</h3>
                <Button type="button" variant="outline" onClick={() => document.getElementById('doc-upload').click()}><Upload className="w-4 h-4 mr-2" />Upload</Button>
                <input id="doc-upload" type="file" multiple className="hidden" onChange={handleDocumentUpload} />
              </div>
              <div className="space-y-4">
                {docFields.map((field, index) => (
                  <div key={field.id} className="border p-4 rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Document {index + 1}</span>
                        {field.file_url && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-blue-500 hover:text-blue-600 h-8 gap-1 px-2"
                            onClick={() => window.open(field.file_url, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="text-xs">View</span>
                          </Button>
                        )}
                      </div>
                      <Button type="button" variant="ghost" onClick={() => removeDoc(index)} className="text-red-500 h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <SelectField label="Type *" name={`documents.${index}.type`} control={control} options={DOCUMENT_TYPES} required placeholder="Select Type" />
                      <InputField label="Title *" name={`documents.${index}.title`} register={register} required placeholder="e.g. B-Form Front" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent></Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button type="button" variant="ghost" onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            Cancel Admission
          </Button>
          
          <div className="flex gap-3">
            {activeTab !== 'personal' && (
              <Button type="button" variant="outline" onClick={prevTab} className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
            )}

            {activeTab !== 'documents' ? (
              <Button type="button" onClick={nextTab} className="gap-2">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <div className="flex flex-col items-end gap-2">
                {Object.keys(errors).length > 0 && (
                  <p className="text-xs text-red-500 font-medium animate-pulse">
                    Please fix errors in other tabs before submitting
                  </p>
                )}
                <FormSubmitButton 
                  loading={loading} 
                  label={isEdit ? 'Update Student' : 'Add Student'} 
                  className="w-full sm:w-auto shadow-lg hover:shadow-indigo-500/20 transition-all" 
                />
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
