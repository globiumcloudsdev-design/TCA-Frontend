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
  SwitchField,
  BranchSelectField,
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
import useBranchAccess from '@/hooks/useBranchAccess';
import { classService, academicYearService, settingService } from '@/services';
import { toast } from 'react-hot-toast';
import { cn, getActiveAcademicYear } from '@/lib/utils';

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
  const { activeBranchId } = useBranchAccess();

  // Fetch settingsData to check document allowance settings
  const { data: settingsData } = useQuery({
    queryKey: ['institute-settings'],
    queryFn: () => settingService.getSettings(),
    staleTime: 5 * 60_000,
  });

  // ✅ CORRECT: Check if student docs are allowed from settings
  const studentDocsAllowed = settingsData?.data?.settings?.document_settings?.student_docs_allowed === true;

  // ✅ Define available tabs based on document setting
  const availableTabs = useMemo(() => {
    const tabs = ['personal', 'academic', 'guardian', 'contact', 'fee'];
    if (studentDocsAllowed) {
      tabs.push('documents');
    }
    return tabs;
  }, [studentDocsAllowed]);

  // ✅ Reset active tab if current tab is not available
  useEffect(() => {
    if (!availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0]);
    }
  }, [availableTabs, activeTab]);
  
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
      // Normalize guardians array so Father / Mother are not lost
      let normalizedGuardians = Array.isArray(defaultValues.guardians) && defaultValues.guardians.length > 0
        ? defaultValues.guardians.map(g => ({
            name: g.name || '',
            relation: g.relation || g.type || 'father',
            type: g.type || g.relation || 'father',
            phone: g.phone || '',
            cnic: g.cnic || '',
            email: g.email || ''
          }))
        : [];

      if (normalizedGuardians.length === 0) {
        if (defaultValues.father_name) {
          normalizedGuardians.push({ name: defaultValues.father_name, relation: 'father', type: 'father', phone: defaultValues.father_phone || '', cnic: defaultValues.father_cnic || '', email: '' });
        }
        if (defaultValues.mother_name) {
          normalizedGuardians.push({ name: defaultValues.mother_name, relation: 'mother', type: 'mother', phone: defaultValues.mother_phone || '', cnic: defaultValues.mother_cnic || '', email: '' });
        }
        if (defaultValues.guardian_name) {
          normalizedGuardians.push({ name: defaultValues.guardian_name, relation: defaultValues.guardian_relation || 'guardian', type: defaultValues.guardian_type || 'guardian', phone: defaultValues.guardian_phone || '', cnic: defaultValues.guardian_cnic || '', email: defaultValues.guardian_email || '' });
        }
      }

      if (normalizedGuardians.length === 0) {
        normalizedGuardians = [{ name: '', relation: 'father', phone: '', cnic: '', email: '', type: 'father' }];
      }

      const cleanDob = defaultValues.dob || defaultValues.date_of_birth || defaultValues.details?.studentDetails?.date_of_birth || defaultValues.details?.studentDetails?.dob;

      reset({
        ...defaultValues,
        guardians: normalizedGuardians,
        dob: cleanDob,
        date_of_birth: cleanDob,
        monthly_fee: defaultValues.monthly_fee ?? defaultValues.details?.studentDetails?.monthly_fee ?? '',
        admission_fee: defaultValues.admission_fee ?? defaultValues.details?.studentDetails?.admission_fee ?? defaultValues.details?.studentDetails?.admission_charges ?? '',
      });
      
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
    queryKey: ['academic-years', instituteId, activeBranchId],
    queryFn: () => academicYearService.getAll({ institute_id: instituteId, branch_id: activeBranchId, is_active: true }),
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
    if (academicYears.length > 0 && !watchAcademicYear) {
      const current = getActiveAcademicYear(academicYears);
      if (current) {
        setValue('academic_year_id', current.value);
        setSelectedAcademicYear(current.value);
      }
    }
  }, [academicYears, watchAcademicYear, setValue]);

  const watchBranch = watch('branch_id');
  const effectiveBranchId = watchBranch || defaultValues.branch_id || (activeBranchId && activeBranchId !== 'all' ? activeBranchId : undefined);

  // Fetch Classes — scoped to branch
  const { data: classes = [] } = useQuery({
    queryKey: ['classes', instituteId, selectedAcademicYear, effectiveBranchId],
    queryFn: async () => {
      const response = await classService.getAll({
        academic_year_id: selectedAcademicYear || undefined,
        branch_id: effectiveBranchId || undefined,
        include_sections: true,
        limit: 500,
        fetchAll: true,
      });
      const data = response?.data?.rows || response?.rows || (Array.isArray(response?.data) ? response.data : []) || (Array.isArray(response) ? response : []);
      return Array.isArray(data) ? data : [];
    },
    enabled: true,
  });

  const classOptions = useMemo(() => {
    return (Array.isArray(classes) ? classes : []).map(c => ({ value: String(c.id), label: c.name }));
  }, [classes]);

  const selectedClassData = useMemo(() => {
    return Array.isArray(classes) ? classes.find((c) => String(c?.id) === String(watchClass)) : null;
  }, [classes, watchClass]);

  const sections = useMemo(() => {
    if (!watchClass || !selectedClassData) return [];
    const rawSections = Array.isArray(selectedClassData?.sections) ? selectedClassData.sections : [];
    return rawSections.map(s => ({ id: s.id, name: s.name, is_active: s.is_active !== false })).filter(s => s.id && s.is_active);
  }, [watchClass, selectedClassData]);

  const sectionOptions = useMemo(() => {
    return (Array.isArray(sections) ? sections : []).map(s => ({ value: String(s.id), label: s.name }));
  }, [sections]);

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
    if (getValues('class_name') !== className) {
      setValue('class_name', className, { shouldDirty: false });
    }
    if (getValues('section_name') !== sectionName) {
      setValue('section_name', sectionName, { shouldDirty: false });
    }
  }, [selectedClassData?.name, selectedSectionData?.name, setValue, getValues]);

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
      
      if (targetSectionId && !watchSection && currentClassId === originalClassId) {
        setValue('section_id', targetSectionId);
      }
    }
  }, [isEdit, sections, watchSection, watchClass, setValue, defaultValues]);

  const TAB_LABELS = {
    personal: 'Personal',
    academic: 'Academic',
    guardian: 'Guardian',
    contact: 'Contact',
    fee: 'Fee',
    documents: 'Docs',
  };

  // Helper to determine if a tab currently contains errors
  const tabHasErrors = (tabKey) => {
    if (!errors || Object.keys(errors).length === 0) return false;

    switch (tabKey) {
      case 'personal':
        return Boolean(
          errors.first_name ||
          errors.dob ||
          errors.gender ||
          errors.cnic ||
          errors.nationality
        );
      case 'academic':
        return Boolean(
          errors.branch_id ||
          errors.academic_year_id ||
          errors.class_id ||
          errors.section_id ||
          errors.roll_no ||
          errors.admission_date
        );
      case 'guardian':
        return Boolean(errors.guardians);
      case 'contact':
        return Boolean(
          errors.city ||
          errors.present_address ||
          errors.phone ||
          errors.email
        );
      case 'fee':
        return Boolean(
          errors.monthly_fee ||
          errors.admission_fee ||
          errors.concession_type ||
          errors.discount_type ||
          errors.concession_percentage ||
          errors.concession_amount
        );
      case 'documents':
        return Boolean(errors.documents);
      default:
        return false;
    }
  };

  const getTabFields = (tab) => {
    switch (tab) {
      case 'personal':
        return ['first_name', 'dob', 'gender'];
      case 'academic': {
        const fields = ['academic_year_id', 'class_id', 'section_id', 'roll_no', 'admission_date'];
        if (watch('branch_id') !== undefined) {
          fields.push('branch_id');
        }
        return fields;
      }
      case 'guardian': {
        const guardianValues = getValues('guardians') || [];
        const fields = ['guardians'];
        guardianValues.forEach((_, idx) => {
          fields.push(`guardians.${idx}.name`);
          fields.push(`guardians.${idx}.type`);
        });
        return fields;
      }
      case 'contact':
        return ['city', 'present_address'];
      case 'fee':
        return ['monthly_fee'];
      case 'documents':
        return ['documents'];
      default:
        return [];
    }
  };

  const validateTab = async (tab) => {
    const fields = getTabFields(tab);
    if (!fields.length) return true;
    const isValid = await trigger(fields);
    if (!isValid) {
      toast.error(`Please complete the required fields in ${TAB_LABELS[tab] || tab}.`);
    }
    return isValid;
  };

  const nextTab = async () => {
    const isValid = await validateTab(activeTab);
    if (!isValid) return;
    const currentIndex = availableTabs.indexOf(activeTab);
    if (currentIndex < availableTabs.length - 1) {
      setActiveTab(availableTabs[currentIndex + 1]);
    }
  };

  const prevTab = () => {
    const currentIndex = availableTabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(availableTabs[currentIndex - 1]);
    }
  };

  const handleTabChange = async (targetTab) => {
    const currentIndex = availableTabs.indexOf(activeTab);
    const targetIndex = availableTabs.indexOf(targetTab);
    
    if (targetIndex === -1) return;
    
    // Moving backwards is always allowed
    if (targetIndex <= currentIndex) {
      setActiveTab(targetTab);
      return;
    }
    
    // Moving forwards: Validate all tabs between current and target
    for (let i = currentIndex; i < targetIndex; i++) {
      const tabToValidate = availableTabs[i];
      const fields = getTabFields(tabToValidate);
      const isTabValid = await trigger(fields);
      if (!isTabValid) {
        toast.error(`Please complete the required fields in ${TAB_LABELS[tabToValidate] || tabToValidate} first.`);
        setActiveTab(tabToValidate);
        return;
      }
    }
    
    setActiveTab(targetTab);
  };

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
    const editableKeys = ['first_name', 'last_name', 'email', 'phone', 'registration_no', 'dob', 'gender', 'blood_group', 'religion', 'nationality', 'cnic', 'branch_id', 'academic_year_id', 'class_id', 'section_id', 'roll_no', 'admission_date', 'present_address', 'permanent_address', 'city', 'monthly_fee', 'admission_fee', 'discount_type', 'lab_charges', 'annual_charges', 'concession_type', 'concession_percentage', 'concession_reason', 'medical_conditions', 'allergies', 'previous_school', 'previous_class', 'is_active'];
    
    editableKeys.forEach(key => { if (data[key] !== undefined && data[key] !== null) formData.append(key, data[key]); });
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

  const onInvalid = async (formErrors) => {
    console.warn('StudentForm submission prevented due to errors:', formErrors);

    // Trigger validation across all available tabs so every tab with errors turns red
    for (const tab of availableTabs) {
      const fields = getTabFields(tab);
      if (fields.length) {
        await trigger(fields);
      }
    }

    // Direct user to the first tab that has an error
    for (const tab of availableTabs) {
      if (tabHasErrors(tab)) {
        setActiveTab(tab);
        break;
      }
    }

    toast.error('Please complete all required fields. The highlighted tab(s) in red have missing information.');
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

      <form onSubmit={handleSubmit(onSubmitForm, onInvalid)} className="space-y-4 sm:space-y-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="overflow-x-auto pb-2 mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList 
              className="inline-flex w-auto sm:grid min-w-full gap-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200" 
              style={{ gridTemplateColumns: `repeat(${availableTabs.length}, minmax(0, 1fr))` }}
            >
              {availableTabs.map((tab) => {
                const hasError = tabHasErrors(tab);
                return (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className={cn(
                      "relative transition-all font-medium py-2 px-3 text-xs sm:text-sm rounded-lg",
                      hasError && "!text-red-600 !border-red-500 bg-red-50/80 hover:bg-red-100 data-[state=active]:!bg-red-100 data-[state=active]:!text-red-700 data-[state=active]:!border-red-600 data-[state=active]:font-semibold border shadow-xs"
                    )}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <span>{TAB_LABELS[tab] || tab}</span>
                      {hasError && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
                        </span>
                      )}
                    </span>
                  </TabsTrigger>
                );
              })}
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
                <InputField 
                  label="First Name" 
                  name="first_name" 
                  register={register} 
                  rules={{ 
                    required: 'First name is required',
                    validate: (v) => (v && v.trim().length >= 2) || 'First name must be at least 2 characters'
                  }}
                  error={errors.first_name} 
                  required 
                  placeholder="Ahmed" 
                  onInput={e => e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '')} 
                />
                <InputField 
                  label="Last Name" 
                  name="last_name" 
                  register={register} 
                  error={errors.last_name} 
                  placeholder="Ali (Optional)" 
                  onInput={e => e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '')} 
                />
                <InputField label="GR/Reg No" name="registration_no" register={register} placeholder="e.g. 2024-001" />
                <DatePickerField 
                  label="Date of Birth" 
                  name="dob" 
                  control={control} 
                  rules={{ required: 'Date of birth is required' }}
                  error={errors.dob} 
                  required 
                  disableFutureDates 
                  placeholder="Select birth date" 
                />
                <SelectField 
                  label="Gender" 
                  name="gender" 
                  control={control} 
                  rules={{ required: 'Gender is required' }}
                  error={errors.gender} 
                  options={GENDER_OPTIONS} 
                  required 
                  placeholder="Select gender" 
                />
                <SelectField label="Religion" name="religion" control={control} options={RELIGION_OPTIONS} placeholder="Select religion" />
                <InputField label="Nationality" name="nationality" register={register} defaultValue="Pakistani" placeholder="e.g. Pakistani" />
                <Controller name="cnic" control={control} render={({ field }) => <CnicInput label="CNIC / B-Form" {...field} error={errors.cnic} placeholder="XXXXX-XXXXXXX-X" />} />
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="academic">
            <Card><CardContent className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <BranchSelectField 
                  control={control} 
                  error={errors.branch_id} 
                  setValue={setValue} 
                  watch={watch} 
                  rules={{ required: 'Branch is required' }}
                  required 
                />
                <SelectField 
                  label="Academic Year" 
                  name="academic_year_id" 
                  control={control} 
                  rules={{ required: 'Academic year is required' }}
                  error={errors.academic_year_id} 
                  options={academicYears} 
                  required 
                  placeholder="Select year" 
                />
                <SelectField 
                  label={getTerm('class')} 
                  name="class_id" 
                  control={control} 
                  rules={{ required: `${getTerm('class')} is required` }}
                  error={errors.class_id} 
                  options={classOptions} 
                  required 
                  placeholder={`Select ${getTerm('class')}`} 
                />
                <SelectField 
                  label={getTerm('section')} 
                  name="section_id" 
                  control={control} 
                  rules={{ required: `${getTerm('section')} is required` }}
                  error={errors.section_id} 
                  options={sectionOptions} 
                  required 
                  placeholder="Select section" 
                />
                <InputField 
                  label="Roll Number" 
                  name="roll_no" 
                  register={register} 
                  rules={{ required: 'Roll number is required' }}
                  error={errors.roll_no} 
                  required 
                  placeholder="e.g. 101" 
                  onInput={e => e.target.value = e.target.value.replace(/[^0-9]/g, '')} 
                />
                <DatePickerField 
                  label="Admission Date" 
                  name="admission_date" 
                  control={control} 
                  rules={{ required: 'Admission date is required' }}
                  error={errors.admission_date} 
                  required 
                  disableFutureDates 
                  placeholder="Select admission date" 
                />
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="guardian">
            <Card><CardContent className="p-4 sm:p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Guardians</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => appendGuardian({ name: '', type: 'father', phone: '' })}><Plus className="w-4 h-4 mr-2" />Add</Button>
              </div>
              {guardianFields.map((field, index) => (
                <div key={field.id} className="border p-4 rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Guardian {index + 1}</span>
                    {guardianFields.length > 1 && <Button type="button" variant="ghost" size="sm" onClick={() => removeGuardian(index)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>}
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <SelectField 
                      label="Type" 
                      name={`guardians.${index}.type`} 
                      control={control} 
                      rules={{ required: 'Guardian type is required' }}
                      error={errors.guardians?.[index]?.type}
                      options={GUARDIAN_TYPES} 
                      required 
                      placeholder="Select Type" 
                    />
                    <InputField 
                      label="Name" 
                      name={`guardians.${index}.name`} 
                      register={register} 
                      rules={{ 
                        required: 'Guardian name is required',
                        validate: (v) => (v && v.trim().length >= 2) || 'Guardian name must be at least 2 characters'
                      }}
                      error={errors.guardians?.[index]?.name}
                      required 
                      placeholder="Enter Guardian Name" 
                      onInput={e => e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '')} 
                    />
                    <Controller name={`guardians.${index}.cnic`} control={control} render={({ field }) => <CnicInput label="CNIC" {...field} placeholder="XXXXX-XXXXXXX-X" />} />
                    <Controller 
                      name={`guardians.${index}.phone`} 
                      control={control} 
                      render={({ field }) => <PhoneInputField label="Phone" {...field} country="pk" />} 
                    />
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
                <InputField 
                  label="City" 
                  name="city" 
                  register={register} 
                  rules={{ 
                    required: 'City is required',
                    validate: (v) => (v && v.trim().length >= 2) || 'City is required'
                  }}
                  error={errors.city}
                  required 
                  placeholder="Enter city" 
                  onInput={e => e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '')} 
                />
              </div>
              <TextareaField 
                label="Present Address" 
                name="present_address" 
                register={register} 
                rules={{ 
                  required: 'Present address is required',
                  validate: (v) => (v && v.trim().length >= 3) || 'Present address is required'
                }}
                error={errors.present_address}
                required 
                placeholder="Enter present address" 
              />
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
                <InputField 
                  label="Monthly Fee" 
                  name="monthly_fee" 
                  register={register} 
                  rules={{ 
                    required: 'Monthly fee is required', 
                    min: { value: 0, message: 'Monthly fee must be 0 or greater' } 
                  }}
                  error={errors.monthly_fee}
                  required 
                  type="number" 
                  placeholder="Enter monthly fee" 
                />
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

          {/* ✅ Documents Tab - Only render if studentDocsAllowed is true */}
          {studentDocsAllowed && (
            <TabsContent value="documents">
              <Card><CardContent className="p-4 sm:p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Documents</h3>
                  <Button type="button" variant="outline" onClick={() => document.getElementById('doc-upload').click()}>
                    <Upload className="w-4 h-4 mr-2" />Upload
                  </Button>
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
                        <SelectField label="Type" name={`documents.${index}.type`} control={control} options={DOCUMENT_TYPES} required placeholder="Select Type" />
                        <InputField label="Title" name={`documents.${index}.title`} register={register} required placeholder="e.g. B-Form Front" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent></Card>
            </TabsContent>
          )}
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button type="button" variant="ghost" onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            Cancel Admission
          </Button>
          
          <div className="flex gap-3">
            {activeTab !== availableTabs[0] && (
              <Button type="button" variant="outline" onClick={prevTab} className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
            )}

            {activeTab !== availableTabs[availableTabs.length - 1] ? (
              <Button type="button" onClick={nextTab} className="gap-2">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <div className="flex flex-col items-end gap-2">
                {Object.keys(errors).length > 0 && (
                  <p className="text-xs text-red-500 font-medium animate-pulse">
                    Please fix required fields in the highlighted tabs before submitting
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