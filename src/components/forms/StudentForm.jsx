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

import { useForm, Controller, useFieldArray } from 'react-hook-form'; // Added useFieldArray
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  PlusCircle, X, Upload, ChevronLeft, ChevronRight, Plus, Trash2, // Added Plus, Trash2
  User, GraduationCap, Users, Phone, MapPin, Heart, DollarSign, BookOpen
} from 'lucide-react';
import {
  GENDER_OPTIONS, RELIGION_OPTIONS, BLOOD_GROUP_OPTIONS, DOCUMENT_TYPES, CONCESSION_OPTIONS, GUARDIAN_TYPES
} from '@/constants';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useRef, useMemo } from 'react';
import { classService, academicYearService } from '@/services';

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
    defaultValues.details?.studentDetails?.academic_year_id || ''
  );
  const [avatarPreview, setAvatarPreview] = useState(defaultValues.avatar_url || null);
  const avatarFileRef = useRef(null);

  // Use refs to track previous values for reset logic without triggering re-renders
  const prevClassRef = useRef(defaultValues.details?.studentDetails?.class_id || '');

  // Debug: Log component props
  useEffect(() => {
    console.log('🎯 StudentForm mounted/updated with:', {
      instituteId,
      instituteType,
      isEdit,
      defaultValuesId: defaultValues?.id
    });
  }, [instituteId, instituteType, isEdit, defaultValues?.id]);

  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      documents: [],
      guardians: [{ name: '', relation: 'guardian', phone: '', cnic: '', email: '', type: 'guardian' }],
      ...defaultValues,
      details: {
        studentDetails: {
          ...defaultValues.details?.studentDetails,
        }
      }
    }
  });

  // Guardians Array
  const { fields: guardianFields, append: appendGuardian, remove: removeGuardian } = useFieldArray({
    control,
    name: 'guardians'
  });

  // Documents Array (Syncing with TeacherForm pattern)
  const { fields: docFields, append: appendDoc, remove: removeDoc } = useFieldArray({
    control,
    name: 'documents'
  });

  // Watch documents for preview
  const watchDocuments = watch('documents');
  const watchGuardians = watch('guardians');

  // Reset form when defaultValues change
  useEffect(() => {
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      console.log('🔄 Resetting form with:', defaultValues);
      reset(defaultValues);

      const fallbackAdmissionFee =
        defaultValues?.admission_fee ??
        defaultValues?.details?.studentDetails?.admission_fee ??
        defaultValues?.details?.studentDetails?.admission_charges;
      if (fallbackAdmissionFee !== undefined && fallbackAdmissionFee !== null) {
        setValue('admission_fee', fallbackAdmissionFee, { shouldDirty: false });
      }

      // Set selected values
      if (defaultValues.details?.studentDetails?.academic_year_id) {
        setSelectedAcademicYear(defaultValues.details.studentDetails.academic_year_id);
      }
      // Re-init prevClassRef
      if (defaultValues.details?.studentDetails?.class_id) {
        prevClassRef.current = defaultValues.details.studentDetails.class_id;
      }
    }
  }, [defaultValues?.id, reset, setValue]);

  // ─────────────────────────────────────────────────────────────────
  // FETCH ACADEMIC YEARS
  // ─────────────────────────────────────────────────────────────────
  const { data: rawAcademicYearsData = [], isLoading: yearsLoading, isError: yearsError, error: yearsErrorMsg } = useQuery({
    queryKey: ['academic-years', instituteId],
    queryFn: async () => {
      const response = await academicYearService.getAll({
        institute_id: instituteId,
        is_active: true
      });
      return response;
    },
    enabled: !!instituteId,
  });

  // Since React Query caches by queryKey, we might get the raw response object if it was 
  // fetched elsewhere in the app. We'll extract and map the final array safely here.
  const academicYears = useMemo(() => {
    // 1. Extract array wherever it might be nested
    let arr = [];
    if (Array.isArray(rawAcademicYearsData)) {
      arr = rawAcademicYearsData;
    } else if (Array.isArray(rawAcademicYearsData?.data)) {
      arr = rawAcademicYearsData.data;
    } else if (Array.isArray(rawAcademicYearsData?.data?.data)) {
      arr = rawAcademicYearsData.data.data;
    }

    // 2. Map to dropdown format { value, label }
    return arr.map(y => ({
      value: y.id,
      label: y.name || `${y.start_date} to ${y.end_date}`
    }));
  }, [rawAcademicYearsData]);

  // ─────────────────────────────────────────────────────────────────
  // FETCH CLASSES with their SECTIONS
  // ─────────────────────────────────────────────────────────────────
  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: ['classes', instituteId, selectedAcademicYear],
    queryFn: async () => {
      if (!selectedAcademicYear) return [];

      try {
        const response = await classService.getAll({
          academic_year_id: selectedAcademicYear,
          include_sections: true
        });

        // Ensure we always return an array
        const data = response.data || response || [];
        const classList = Array.isArray(data.rows) ? data.rows : (Array.isArray(data) ? data : []);

        console.log('📚 Classes with sections:', classList);
        return classList;
      } catch (error) {
        console.error('Error fetching classes:', error);
        return [];
      }
    },
    enabled: !!selectedAcademicYear,
  });

  // Watch values
  const watchAcademicYear = watch('academic_year_id');
  const watchClass = watch('class_id');
  const watchSection = watch('section_id');

  const selectedClassData = useMemo(() => {
    if (!Array.isArray(classes)) return null;
    return classes.find((c) => String(c?.id) === String(watchClass)) || null;
  }, [classes, watchClass]);

  // Sections are embedded inside selected class payload.
  const sections = useMemo(() => {
    if (!watchClass || !selectedClassData) return [];

    const rawSections = Array.isArray(selectedClassData?.sections) ? selectedClassData.sections : [];

    return rawSections
      .map((section) => ({
        id: section?.id || section?.section_id || null,
        name: section?.name || section?.section_name || 'Section',
        is_active: section?.is_active !== false
      }))
      .filter((section) => section.id)
      .filter((section) => section.is_active);
  }, [watchClass, selectedClassData]);

  const selectedSectionData = useMemo(() => {
    if (!Array.isArray(sections)) return null;
    return sections.find((s) => String(s?.id) === String(watchSection)) || null;
  }, [sections, watchSection]);

  // Handle academic year change
  useEffect(() => {
    // Only update if academic year actually changes and is different from selected state
    if (watchAcademicYear && watchAcademicYear !== selectedAcademicYear) {
      setSelectedAcademicYear(watchAcademicYear);
      // Reset dependent fields when academic year changes
      setValue('class_id', '');
      setValue('section_id', '');
    }
  }, [watchAcademicYear, selectedAcademicYear, setValue]);

  // Handle class change (for resetting section)
  useEffect(() => {
    if (watchClass && watchClass !== prevClassRef.current) {
      // Only reset section if class changed
      setValue('section_id', '');
      prevClassRef.current = watchClass;
    } else if (watchClass && !prevClassRef.current) {
      // Initial load or first selection
      prevClassRef.current = watchClass;
    }
  }, [watchClass, setValue]);

  // Keep class/section names synced with current selected IDs (prevents stale names in edit payload).
  useEffect(() => {
    const className = selectedClassData?.name || '';
    const sectionName = selectedSectionData?.name || '';

    setValue('class_name', className, { shouldDirty: false });
    setValue('section_name', sectionName, { shouldDirty: false });
    setValue('details.studentDetails.class_name', className, { shouldDirty: false });
    setValue('details.studentDetails.section_name', sectionName, { shouldDirty: false });
  }, [selectedClassData, selectedSectionData, setValue]);

  // Keep guardian relation aligned with guardian type
  useEffect(() => {
    if (!Array.isArray(watchGuardians)) return;

    watchGuardians.forEach((g, index) => {
      const normalizedType = String(g?.type || 'guardian').toLowerCase();
      if (g?.type !== normalizedType) {
        setValue(`guardians.${index}.type`, normalizedType, { shouldDirty: true });
      }
      if (g?.relation !== normalizedType) {
        setValue(`guardians.${index}.relation`, normalizedType, { shouldDirty: true });
      }
    });
  }, [watchGuardians, setValue]);


  // ─────────────────────────────────────────────────────────────────
  // AVATAR HANDLING
  // ─────────────────────────────────────────────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Store file for upload
    setValue('avatar_file', file, { shouldDirty: true });
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    setValue('avatar_file', null);
    if (avatarFileRef.current) {
      avatarFileRef.current.value = '';
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // DOCUMENT HANDLERS
  // ─────────────────────────────────────────────────────────────────
  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      appendDoc({
        id: generateUniqueId(),
        type: 'other',
        title: file.name,
        file_name: file.name,
        file_url: URL.createObjectURL(file), // Preview URL
        uploaded_at: new Date().toISOString(),
        verified: false,
        file: file // Keep file object for upload
      });
    });
    // Reset file input value so same file can be selected again
    e.target.value = '';
  };

  const removeDocument = (index) => {
    removeDoc(index);
  };

  // ─────────────────────────────────────────────────────────────────
  // Navigation for mobile tabs
  // ─────────────────────────────────────────────────────────────────
  const nextTab = () => {
    const tabs = ['personal', 'academic', 'guardian', 'contact', 'fee', 'documents'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const prevTab = () => {
    const tabs = ['personal', 'academic', 'guardian', 'contact', 'fee', 'documents'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // Get terms based on institute type
  // ─────────────────────────────────────────────────────────────────
  const getTerm = (key) => {
    const terms = {
      school: {
        class: 'Class',
        section: 'Section',
        student: 'Student',
      },
      college: {
        class: 'Program',
        section: 'Batch',
        student: 'Student',
      },
      university: {
        class: 'Department',
        section: 'Semester',
        student: 'Student',
      },
      coaching: {
        class: 'Course',
        section: 'Batch',
        student: 'Candidate',
      },
      academy: {
        class: 'Program',
        section: 'Batch',
        student: 'Trainee',
      },
    };
    return terms[instituteType]?.[key] || key;
  };

  // ─────────────────────────────────────────────────────────────────
  // Form Submit
  // ─────────────────────────────────────────────────────────────────
  const onSubmitForm = (data) => {
    console.log('📤 Submitting form data:', data);

    // Create FormData for multipart/form-data submission (required for files)
    const formData = new FormData();

    const editableKeys = new Set([
      'first_name',
      'last_name',
      'email',
      'phone',
      'registration_no',
      'dob',
      'gender',
      'blood_group',
      'religion',
      'nationality',
      'cnic',
      'academic_year_id',
      'class_id',
      'section_id',
      'roll_no',
      'admission_date',
      'father_name',
      'father_cnic',
      'father_phone',
      'father_occupation',
      'father_education',
      'mother_name',
      'mother_cnic',
      'mother_phone',
      'mother_occupation',
      'present_address',
      'permanent_address',
      'city',
      'fee_plan_id',
      'monthly_fee',
      'admission_fee',
      'discount_type',
      'lab_charges',
      'annual_charges',
      'concession_type',
      'concession_percentage',
      'concession_reason',
      'medical_conditions',
      'allergies',
      'previous_school',
      'previous_class',
      'status',
      'is_active'
    ]);

    // 1. Basic Fields
    Object.keys(data).forEach((key) => {
      if (!editableKeys.has(key)) return;
      if (data[key] === undefined || data[key] === null) return;
      formData.append(key, data[key]);
    });

    // Force class/section IDs and names from currently selected options.
    const classId = selectedClassData?.id || data.class_id || '';
    const sectionId = selectedSectionData?.id || data.section_id || '';
    const className = selectedClassData?.name || '';
    const sectionName = selectedSectionData?.name || '';

    if (classId) formData.set('class_id', classId);
    if (sectionId) formData.set('section_id', sectionId);
    if (className) formData.set('class_name', className);
    if (sectionName) formData.set('section_name', sectionName);

    // 🖼️ AVATAR FILE UPLOAD
    if (data.avatar_file && data.avatar_file instanceof File) {
      formData.append('photo', data.avatar_file); // Backend expects 'photo' field
    }

    // 2. Guardians (normalize: guardian type == relation + include email)
    const normalizedGuardians = (Array.isArray(data.guardians) ? data.guardians : [])
      .map((g) => {
        const normalizedType = String(g?.type || g?.relation || 'guardian').toLowerCase();
        return {
          name: g?.name || '',
          type: normalizedType,
          relation: normalizedType,
          phone: g?.phone || '',
          cnic: g?.cnic || '',
          email: g?.email || ''
        };
      })
      .filter((g) => g.name || g.phone || g.cnic || g.email);

    if (normalizedGuardians.length > 0) {
      formData.append('guardians', JSON.stringify(normalizedGuardians));
    }

    // 3. Details (Send as JSON string or flat fields? Backend expects flat for some, JSON for others?)
    // The previous implementation sent `details` object. If strict multipart, we might need to stringify it.
    // However, `student.controller.js` parses body... let's see.
    // Ideally, we should stringify complex objects.
    if (data.details) {
      const nextDetails = {
        ...(data.details || {}),
        studentDetails: {
          ...(data.details?.studentDetails || {}),
          class_id: classId || data.details?.studentDetails?.class_id || null,
          class_name: className || data.details?.studentDetails?.class_name || null,
          section_id: sectionId || data.details?.studentDetails?.section_id || null,
          section_name: sectionName || data.details?.studentDetails?.section_name || null,
        }
      };

      // Never send root-level academicSessions from stale defaultValues.
      delete nextDetails.academicSessions;

      formData.append('details', JSON.stringify(nextDetails));
    }

    // 4. Documents & Files
    // The `documents` array contains metadata. The actual files are in `doc.file`.
    // We need to separate metadata and files.

    const documentMetadata = [];

    if (data.documents && Array.isArray(data.documents)) {
      data.documents.forEach((doc, index) => {
        // Add file to FormData if it exists and is a File object
        if (doc.file instanceof File) {
          // Append file with a specific name or just 'documents' array
          // calculate index or just append all to 'files' or 'documents'
          // teacher.routes uses uploadMultiple('documents'). 
          // Multer will populate req.files with these files.
          formData.append('documents', doc.file);
        }

        // Add metadata (excluding the File object itself to avoid circular json issues or huge payload)
        const { file, ...meta } = doc;
        const normalizedType = VALID_DOCUMENT_TYPES.has(meta.type)
          ? meta.type
          : String(meta.type || '').toLowerCase().replace(/\s+/g, '_') || 'other';

        documentMetadata.push({
          ...meta,
          type: VALID_DOCUMENT_TYPES.has(normalizedType) ? normalizedType : 'other'
        });
      });
    }

    // Append document metadata as JSON string
    const documentsJson = JSON.stringify(documentMetadata);
    formData.append('documents_meta', documentsJson);
    formData.append('documents', documentsJson);
    formData.append('institute_id', instituteId);
    formData.append('institute_type', instituteType);

    // Submit FormData
    onSubmit(formData);
  };

  // ─────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 sm:space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Tabs List */}
        <div className="overflow-x-auto pb-2 mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-auto sm:grid sm:grid-cols-6 min-w-full">
            <TabsTrigger value="personal" className="px-3 py-1.5 text-xs sm:text-sm">
              Personal
            </TabsTrigger>
            <TabsTrigger value="academic" className="px-3 py-1.5 text-xs sm:text-sm">
              Academic
            </TabsTrigger>
            <TabsTrigger value="guardian" className="px-3 py-1.5 text-xs sm:text-sm">
              Guardian
            </TabsTrigger>
            <TabsTrigger value="contact" className="px-3 py-1.5 text-xs sm:text-sm">
              Contact
            </TabsTrigger>
            <TabsTrigger value="fee" className="px-3 py-1.5 text-xs sm:text-sm">
              Fee
            </TabsTrigger>
            <TabsTrigger value="documents" className="px-3 py-1.5 text-xs sm:text-sm">
              Docs
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Mobile Navigation */}
        {isMobile && (
          <div className="flex items-center justify-between mb-4">
            <Button type="button" variant="outline" size="sm" onClick={prevTab} disabled={activeTab === 'personal'}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium capitalize">{activeTab}</span>
            <Button type="button" variant="outline" size="sm" onClick={nextTab} disabled={activeTab === 'documents'}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Tab 1: Personal Information */}
        <TabsContent value="personal">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-6">
                {/* Avatar/Profile Photo Section */}
                <div className="flex flex-col items-center p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300">
                  {avatarPreview ? (
                    <div className="relative">
                      <img 
                        src={avatarPreview} 
                        alt="Avatar preview" 
                        className="w-32 h-32 rounded-full object-cover shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-slate-200 flex items-center justify-center">
                      <User className="w-16 h-16 text-slate-400" />
                    </div>
                  )}
                  
                  <Label className="mt-4 text-sm font-semibold text-slate-700">Profile Photo</Label>
                  <input
                    ref={avatarFileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={loading}
                  />
                  
                  <Button
                    type="button"
                    variant="black"
                    onClick={() => avatarFileRef.current?.click()}
                    disabled={loading}
                  >
                    <Upload className="w-4 h-4" />
                    {avatarPreview ? 'Change Photo' : 'Upload Photo'}
                  </Button>
                  <p className="text-[11px] text-slate-500 mt-2 text-center">JPG, PNG, GIF (Max 5MB)</p>
                </div>

                <Separator />

                {/* Basic Information */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Basic Information</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <InputField
                      label="First Name"
                      name="first_name"
                      register={register}
                      error={errors.first_name}
                      required
                      placeholder="e.g. Ahmed"
                    />
                    <InputField
                      label="Last Name"
                      name="last_name"
                      register={register}
                      error={errors.last_name}
                      required
                      placeholder="e.g. Ali"
                    />
                    <InputField
                      label="GR/Reg No"
                      name="registration_no"
                      register={register}
                      error={errors.registration_no}
                      placeholder="e.g. 2024-001"
                    />
                    <DatePickerField
                      label="Date of Birth"
                      name="dob"
                      control={control}
                      error={errors.dob}
                      required
                    />
                    <SelectField
                      label="Gender"
                      name="gender"
                      control={control}
                      error={errors.gender}
                      options={GENDER_OPTIONS}
                      placeholder="Select gender"
                      required
                    />
                    <SelectField
                      label="Blood Group"
                      name="blood_group"
                      control={control}
                      error={errors.blood_group}
                      options={BLOOD_GROUP_OPTIONS}
                      placeholder="Select blood group"
                    />
                    <SelectField
                      label="Religion"
                      name="religion"
                      control={control}
                      error={errors.religion}
                      options={RELIGION_OPTIONS}
                      placeholder="Select religion"
                    />
                    <InputField
                      label="Nationality"
                      name="nationality"
                      register={register}
                      error={errors.nationality}
                      placeholder="e.g. Pakistani"
                      defaultValue="Pakistani"
                    />
                    <Controller
                      name="cnic"
                      control={control}
                      render={({ field }) => (
                        <CnicInput
                          label="CNIC / B-Form"
                          value={field.value || ''}
                          onChange={field.onChange}
                          country="pk"
                          placeholder="00000-0000000-0"
                          error={errors.cnic}
                          {...field}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Academic Information - IMPORTANT: Class aur Section yahan hain */}
        <TabsContent value="academic">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Academic Details</h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Academic Year */}
                  <SelectField
                    label="Academic Year"
                    name="academic_year_id"
                    control={control}
                    error={errors.academic_year_id}
                    options={academicYears}
                    placeholder={yearsLoading ? "Loading..." : "Select"}
                    required
                  />

                  {/* Class - ismein sections embedded hain */}
                  <SelectField
                    label={getTerm('class')}
                    name="class_id"
                    control={control}
                    error={errors.class_id}
                    options={classes.map(c => ({ value: c.id, label: c.name }))}
                    placeholder={!selectedAcademicYear ? "Select year first" : (classesLoading ? "Loading..." : `Select ${getTerm('class')}`)}
                    required
                    disabled={!selectedAcademicYear}
                  />

                  {/* Section - yeh class ke sections se aayega */}
                  <SelectField
                    label={getTerm('section')}
                    name="section_id"
                    control={control}
                    error={errors.section_id}
                    options={sections.map(s => ({ value: s.id, label: s.name }))}
                    placeholder={!watchClass ? `Select ${getTerm('class')} first` : 'Select section'}
                    disabled={!watchClass}
                  />

                  {/* Roll Number */}
                  <InputField
                    label="Roll Number"
                    name="roll_no"
                    register={register}
                    error={errors.roll_no}
                  />

                  {/* Admission Date */}
                  <DatePickerField
                    label="Admission Date"
                    name="admission_date"
                    control={control}
                    error={errors.admission_date}
                    required
                  />
                </div>

                {/* Previous School Info */}
                <Separator className="my-4" />

                <h4 className="text-sm font-medium">Previous Education</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputField
                    label="Previous School/College"
                    name="previous_school"
                    register={register}
                    error={errors.previous_school}
                  />
                  <InputField
                    label="Previous Class/Grade"
                    name="previous_class"
                    register={register}
                    error={errors.previous_class}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Guardian Information */}
        <TabsContent value="guardian">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Guardian Information</h3>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendGuardian({ name: '', relation: 'guardian', phone: '', cnic: '', email: '', type: 'guardian' })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Guardian
                  </Button>
                </div>

                {guardianFields.map((field, index) => (
                  <div key={field.id} className="relative border p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-sm font-medium">Guardian {index + 1}</h4>
                      {guardianFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGuardian(index)}
                          className="text-destructive h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <SelectField
                        label="Type *"
                        name={`guardians.${index}.type`}
                        control={control}
                        error={errors.guardians?.[index]?.type}
                        options={GUARDIAN_TYPES}
                        placeholder="Select Type"
                        required
                      />
                      <InputField
                        label="Name *"
                        name={`guardians.${index}.name`}
                        register={register}
                        error={errors.guardians?.[index]?.name}
                        required
                      />
                      <InputField
                        label="Relation"
                        name={`guardians.${index}.relation`}
                        register={register}
                        error={errors.guardians?.[index]?.relation}
                        disabled
                      />
                      <Controller
                        name={`guardians.${index}.cnic`}
                        control={control}
                        render={({ field }) => (
                          <CnicInput
                            label="Guardian CNIC / B-Form"
                            value={field.value || ''}
                            onChange={field.onChange}
                            country="pk"
                            placeholder="00000-0000000-0"
                            error={errors.guardians?.[index]?.cnic}
                            {...field}
                          />
                        )}
                      />
                      <Controller
                        name={`guardians.${index}.phone`}
                        control={control}
                        render={({ field }) => (
                          <PhoneInputField
                            label="Guardian Phone"
                            value={field.value || ''}
                            onChange={field.onChange}
                            country="pk"
                            error={errors.guardians?.[index]?.phone}
                            inputProps={{ required: true, name: field.name }}
                          />
                        )}
                      />
                      <InputField
                        label="Email"
                        name={`guardians.${index}.email`}
                        register={register}
                        error={errors.guardians?.[index]?.email}
                        type="email"
                      />
                    </div>
                  </div>
                ))}

                {guardianFields.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <p className="text-sm text-muted-foreground">No guardians added</p>
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => appendGuardian({ name: '', relation: 'father', phone: '', cnic: '', email: '', type: 'father' })}
                    >
                      Add Primary Guardian
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Contact Information */}
        <TabsContent value="contact">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Contact Details</h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <PhoneInputField
                        label="Phone Number"
                        value={field.value || ''}
                        onChange={field.onChange}
                        country="pk"
                        error={errors.phone}
                        inputProps={{ required: true, name: field.name }}
                      />
                    )}
                  />
                  <InputField label="Email" name="email" register={register} error={errors.email} type="email" />
                  <InputField label="City" name="city" register={register} error={errors.city} required />
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Address</h3>
                </div>

                <TextareaField
                  label="Present Address"
                  name="present_address"
                  register={register}
                  error={errors.present_address}
                  required
                  rows={2}
                />

                <TextareaField
                  label="Permanent Address"
                  name="permanent_address"
                  register={register}
                  error={errors.permanent_address}
                  rows={2}
                />

                <Separator className="my-4" />

                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Emergency Contact</h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <InputField label="Contact Person" name="emergency_contact_name" register={register} error={errors.emergency_contact_name} />
                  <InputField label="Relation" name="emergency_contact_relation" register={register} error={errors.emergency_contact_relation} />
                  <Controller
                    name="emergency_contact_phone"
                    control={control}
                    render={({ field }) => (
                      <PhoneInputField
                        label="Emergency Contact Phone"
                        value={field.value || ''}
                        onChange={field.onChange}
                        country="pk"
                        error={errors.emergency_contact_phone}
                        inputProps={{ name: field.name }}
                      />
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Fee Information */}
        <TabsContent value="fee">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Fee Details</h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <InputField
                    placeholder="Enter Monthly Fee charges"
                    label="Monthly Fee (PKR)"
                    name="monthly_fee"
                    register={register}
                    error={errors.monthly_fee}
                    type="number"
                  />
                  <InputField
                    label="Admission Fee (PKR)"
                    name="admission_fee"
                    register={register}
                    error={errors.admission_fee}
                    placeholder="Enter Admission Fee charges"
                    type="number"
                  />
                  <SelectField label="Concession" name="concession_type" control={control} error={errors.concession_type} options={CONCESSION_OPTIONS} />
                  {/* Discount Type and Concession logic */}
                  <Controller
                    name="discount_type"
                    control={control}
                    defaultValue="fixed"
                    render={({ field }) => (
                      <SelectField
                        label="Discount Type"
                        options={[
                          { value: 'fixed', label: 'Fixed' },
                          { value: 'percentage', label: 'Percentage' },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.discount_type}
                        placeholder="Select discount type"
                      />
                    )}
                  />
                  {/* Show Concession % only if discount_type is percentage */}
                  {watch('discount_type') === 'percentage' && (
                    <InputField
                      label="Concession %"
                      name="concession_percentage"
                      register={register}
                      error={errors.concession_percentage}
                      placeholder="Enter Concession %"
                      type="number"
                      min={0}
                      max={100}
                    />
                  )}
                  {/* Show Concession Amount only if discount_type is fixed */}
                  {watch('discount_type') === 'fixed' && (
                    <InputField
                      label="Concession Amount"
                      name="concession_amount"
                      register={register}
                      error={errors.concession_amount}
                      placeholder="Enter Concession Amount"
                      type="number"
                      min={0}
                    />
                  )}
                  <InputField
                    label="Annual Charges"
                    type="number"
                    min={0}
                    step={0.01}
                    {...register('annual_charges')}
                    error={errors.annual_charges}
                    placeholder="Enter annual charges"
                  />
                  <InputField
                    label="Lab Charges"
                    type="number"
                    min={0}
                    step={0.01}
                    {...register('lab_charges')}
                    error={errors.lab_charges}
                    placeholder="Enter lab charges"
                  />
                </div>

                <TextareaField label="Concession Reason" name="concession_reason" register={register} error={errors.concession_reason} rows={1} />

                <Separator className="my-4" />

                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Medical Information</h3>
                </div>

                <TextareaField label="Medical Conditions" name="medical_conditions" register={register} error={errors.medical_conditions} rows={2} />
                <TextareaField label="Allergies" name="allergies" register={register} error={errors.allergies} rows={2} />

                <Separator className="my-4" />

                {/* Status */}
                <div className="flex items-center justify-between rounded-lg border p-4">

                  <SwitchField
                    label="Active"
                    name="is_active"
                    control={control}
                    hint="Student can login and access portal"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: Documents */}
        <TabsContent value="documents">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Documents</h3>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('document-upload').click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                  <input
                    type="file"
                    id="document-upload"
                    multiple
                    className="hidden"
                    onChange={handleDocumentUpload}
                  />
                </div>

                <p className="text-sm text-muted-foreground">Upload Student Documents (Results, B-Form, etc.)</p>

                {docFields.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <p className="text-sm text-muted-foreground">No documents uploaded</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {docFields.map((field, index) => (
                      <div key={field.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-sm">Document {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDoc(index)}
                            className="text-destructive p-0 h-6 w-6"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <SelectField
                            label="Type *"
                            name={`documents.${index}.type`}
                            control={control}
                            error={errors.documents?.[index]?.type}
                            options={DOCUMENT_TYPES}
                            placeholder="Select Type"
                            required
                          />
                          <InputField
                            label="Title *"
                            name={`documents.${index}.title`}
                            register={register}
                            error={errors.documents?.[index]?.title}
                            placeholder="Details.."
                            required
                          />
                        </div>

                        <div className="mt-2 text-xs text-muted-foreground flex items-center justify-between">
                          <span>{field.file_name}</span>
                          {field.file_url && (
                            <a href={field.file_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">View</a>
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
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {activeTab !== 'documents' ? (
          <Button type="button" onClick={nextTab}>
            Next
          </Button>
        ) : (
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : (isEdit ? 'Update' : 'Add')}
          </Button>
        )}
      </div>
    </form>
  );
}
