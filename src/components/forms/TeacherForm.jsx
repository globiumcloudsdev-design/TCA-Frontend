// src/components/forms/TeacherForm.jsx (COMPLETE FIXED VERSION)

'use client';

import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  InputField,
  SelectField,
  TextareaField,
  DatePickerField,
  FormSubmitButton,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Upload } from 'lucide-react';
import { 
  GENDER_OPTIONS, 
  RELIGION_OPTIONS, 
  BLOOD_GROUP_OPTIONS,
  TEACHER_QUALIFICATION_OPTIONS,
  TEACHER_DESIGNATION_OPTIONS,
  TEACHER_DEPARTMENT_OPTIONS,
  TEACHER_STATUS_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  DOCUMENT_TYPES,
  RELATIONSHIP_OPTIONS
} from '@/constants/index';
import CnicInput from '../common/CnicInput';
import PhoneInputField from '../common/PhoneInput';

// Constants
const MAX_FILE_MB = 10;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

// Validation Schemas
const documentSchema = z.object({
  id: z.string().optional(),
  type: z.string().min(1, 'Document type required'),
  customType: z.string().optional(),
  title: z.string().min(1, 'Document title required'),
  file: z.any().optional(),
  file_url: z.string().optional(),
  file_name: z.string().optional(),
  verified: z.boolean().default(false),
});

const teacherSchema = z.object({
  // Personal Info
  first_name: z.string().min(1, 'First name required'),
  last_name: z.string().min(1, 'Last name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Phone number required'),
  alternate_phone: z.string().optional(),
  
  // Identity
  employee_id: z.string().optional(),
  cnic: z.string().optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  blood_group: z.string().optional(),
  religion: z.string().optional(),
  nationality: z.string().default('Pakistani'),
  
  // Address
  present_address: z.string().optional(),
  permanent_address: z.string().optional(),
  city: z.string().optional(),
  
  // Professional - REMOVED SUBJECTS
  qualification: z.string().optional(),
  specialization: z.string().optional(),
  experience_years: z.string().optional(),
  previous_institution: z.string().optional(),
  
  // Employment
  designation: z.string().optional(),
  department: z.string().optional(),
  employment_type: z.string().optional(),
  joining_date: z.string().optional(),
  contract_start_date: z.string().optional(),
  contract_end_date: z.string().optional(),
  salary: z.string().optional(),
  
  // Bank
  bank_name: z.string().optional(),
  bank_account_no: z.string().optional(),
  bank_branch: z.string().optional(),
  
  // Emergency Contact
  emergency_contact_name: z.string().optional(),
  emergency_contact_relation: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  
  // Status
  status: z.string().default('active'),
  
  // Password (for new accounts)
  password: z.string().optional(),
  send_email: z.boolean().default(true),
  
  // Documents
  documents: z.array(documentSchema).default([]),
});

export default function TeacherForm({
  defaultValues = {},
  onSubmit,
  onCancel,
  loading = false,
  isEdit = false,
}) {
  const [activeTab, setActiveTab] = useState('personal');
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [showCustomType, setShowCustomType] = useState({});

  // ✅ Transform API data to form structure
  const transformDefaultValues = (data) => {
    if (!data || Object.keys(data).length === 0) {
      return {
        nationality: 'Pakistani',
        status: 'active',
        send_email: true,
        documents: [],
      };
    }

    // Extract teacherDetails if exists
    const teacherDetails = data.details?.teacherDetails || {};
    
    return {
      // Basic Info
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      email: data.email || '',
      phone: data.phone || '',
      alternate_phone: data.alternate_phone || '',
      
      // Identity - from teacherDetails
      employee_id: teacherDetails.employee_id || data.employee_id || '',
      cnic: teacherDetails.cnic || '',
      dob: teacherDetails.date_of_birth || data.dob || '',
      gender: teacherDetails.gender || '',
      blood_group: teacherDetails.blood_group || '',
      religion: teacherDetails.religion || '',
      nationality: teacherDetails.nationality || 'Pakistani',
      
      // Address
      present_address: teacherDetails.present_address || '',
      permanent_address: teacherDetails.permanent_address || '',
      city: teacherDetails.city || '',
      
      // Professional
      qualification: teacherDetails.qualification || '',
      specialization: teacherDetails.specialization || '',
      experience_years: teacherDetails.experience_years || '',
      previous_institution: teacherDetails.previous_institution || '',
      
      // Employment
      designation: teacherDetails.designation || '',
      department: teacherDetails.department || '',
      employment_type: teacherDetails.employment_type || '',
      joining_date: teacherDetails.joining_date || '',
      contract_start_date: teacherDetails.contract_start_date || '',
      contract_end_date: teacherDetails.contract_end_date || '',
      salary: teacherDetails.salary ? String(teacherDetails.salary) : '',
      
      // Bank
      bank_name: teacherDetails.bank_name || '',
      bank_account_no: teacherDetails.bank_account_no || '',
      bank_branch: teacherDetails.bank_branch || '',
      
      // Emergency Contact
      emergency_contact_name: teacherDetails.emergency_contact_name || '',
      emergency_contact_relation: teacherDetails.emergency_contact_relation || '',
      emergency_contact_phone: teacherDetails.emergency_contact_phone || '',
      
      // Status
      status: teacherDetails.status || 'active',
      
      // Documents
      documents: data.documents || [],
      
      // Password (never for edit)
      password: '',
      send_email: false,
    };
  };

  const transformedDefaultValues = transformDefaultValues(defaultValues);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(teacherSchema),
    defaultValues: transformedDefaultValues,
  });

  // Watch documents for dynamic UI
  const watchDocuments = watch('documents');

  // Handle document upload
  const handleDocumentUpload = (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > MAX_FILE_BYTES) {
      alert(`File size must be less than ${MAX_FILE_MB}MB`);
      return;
    }
    
    const currentDocs = getValues('documents') || [];
    const updatedDocs = [...currentDocs];
    
    if (updatedDocs[index]) {
      updatedDocs[index] = {
        ...updatedDocs[index],
        file: file,
        file_name: file.name,
        title: updatedDocs[index].title || file.name,
      };
    }
    
    setValue('documents', updatedDocs);
    setUploadingFiles(prev => ({ ...prev, [index]: file.name }));
  };

  // Add new document
  const addDocument = () => {
    const currentDocs = getValues('documents') || [];
    setValue('documents', [...currentDocs, { type: '', title: '', verified: false }]);
  };

  // Remove document
  const removeDocument = (index) => {
    const currentDocs = getValues('documents') || [];
    setValue('documents', currentDocs.filter((_, i) => i !== index));
    setUploadingFiles(prev => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });
  };

  // Handle document type change
  const handleDocumentTypeChange = (index, value) => {
    const currentDocs = getValues('documents') || [];
    const updatedDocs = [...currentDocs];
    if (!updatedDocs[index]) updatedDocs[index] = {};
    updatedDocs[index].type = value;
    setValue('documents', updatedDocs);
    
    setShowCustomType(prev => ({ ...prev, [index]: value === 'other' }));
  };

  // Navigation for mobile
  const nextTab = () => {
    const tabs = ['personal', 'professional', 'employment', 'documents'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1]);
  };

  const prevTab = () => {
    const tabs = ['personal', 'professional', 'employment', 'documents'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1]);
  };

  // Form submit
  const onSubmitForm = (data) => {
    console.log('📤 Form submitting:', data);
    
    const formattedDocuments = (data.documents || []).map(doc => ({
      ...doc,
      type: doc.type === 'other' ? doc.customType : doc.type,
      customType: undefined,
      // Don't send file object to API
      file: undefined,
    }));
    
    // Prepare data for API
    const formattedData = {
      ...data,
      documents: formattedDocuments,
      // Ensure numbers are numbers
      salary: data.salary ? Number(data.salary) : null,
      experience_years: data.experience_years ? Number(data.experience_years) : null,
    };
    
    onSubmit(formattedData);
  };

  // Check mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 sm:space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Tabs List */}
        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className={`inline-flex w-auto sm:grid ${isMobile ? 'flex-nowrap' : 'grid-cols-4'} mb-4 sm:mb-6`}>
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="employment">Employment</TabsTrigger>
            <TabsTrigger value="documents">
              Documents
              {watchDocuments?.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {watchDocuments.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Mobile Navigation */}
        {isMobile && (
          <div className="flex items-center justify-between mb-4">
            <Button type="button" variant="outline" size="sm" onClick={prevTab} disabled={activeTab === 'personal'}>
              Previous
            </Button>
            <span className="text-sm font-medium capitalize">{activeTab}</span>
            <Button type="button" variant="outline" size="sm" onClick={nextTab} disabled={activeTab === 'documents'}>
              Next
            </Button>
          </div>
        )}

        {/* Tab 1: Personal Information */}
        <TabsContent value="personal">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <InputField
                    label="First Name *"
                    name="first_name"
                    register={register}
                    error={errors.first_name}
                    required
                    placeholder="Ahmed"
                  />
                  
                  <InputField
                    label="Last Name *"
                    name="last_name"
                    register={register}
                    error={errors.last_name}
                    required
                    placeholder="Hassan"
                  />
                  
                  <InputField
                    label="Employee ID"
                    name="employee_id"
                    register={register}
                    error={errors.employee_id}
                    placeholder="TCH-2024-001"
                  />
                  
                  <DatePickerField
                    label="Date of Birth"
                    name="dob"
                    control={control}
                    error={errors.dob}
                  />
                  
                  <SelectField
                    label="Gender"
                    name="gender"
                    control={control}
                    error={errors.gender}
                    options={GENDER_OPTIONS}
                    placeholder="Select gender"
                  />
                  
                  <SelectField
                    label="Blood Group"
                    name="blood_group"
                    control={control}
                    error={errors.blood_group}
                    options={BLOOD_GROUP_OPTIONS}
                    placeholder="Select"
                  />
                  
                  <SelectField
                    label="Religion"
                    name="religion"
                    control={control}
                    error={errors.religion}
                    options={RELIGION_OPTIONS}
                    placeholder="Select"
                  />
                  
                  <CnicInput
                    label="CNIC / B-Form"
                    value={watch('cnic') || ''}
                    onChange={val => setValue('cnic', val)}
                    error={errors.cnic}
                  />
                </div>

                <Separator />

                <h3 className="text-lg font-semibold">Contact Information</h3>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputField
                    label="Email *"
                    name="email"
                    register={register}
                    error={errors.email}
                    required
                    type="email"
                    placeholder="teacher@school.com"
                  />
                  
                  <PhoneInputField
                    label="Phone Number"
                    value={watch('phone') || ''}
                    onChange={val => setValue('phone', val)}
                    error={errors.phone}
                  />
                  
                  <PhoneInputField
                    label="Alternate Phone"
                    value={watch('alternate_phone') || ''}
                    onChange={val => setValue('alternate_phone', val)}
                    error={errors.alternate_phone}
                  />
                  
                  <InputField
                    label="City"
                    name="city"
                    register={register}
                    error={errors.city}
                    placeholder="Karachi"
                  />
                </div>

                <TextareaField
                  label="Present Address"
                  name="present_address"
                  register={register}
                  error={errors.present_address}
                  placeholder="Full residential address"
                  rows={2}
                />

                <TextareaField
                  label="Permanent Address"
                  name="permanent_address"
                  register={register}
                  error={errors.permanent_address}
                  placeholder="If different from present address"
                  rows={2}
                />

                <Separator />

                <h3 className="text-lg font-semibold">Emergency Contact</h3>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <InputField
                    label="Contact Person"
                    name="emergency_contact_name"
                    register={register}
                    error={errors.emergency_contact_name}
                    placeholder="Kamran Khan"
                  />
                  
                  <SelectField
                    label="Relation"
                    name="emergency_contact_relation"
                    control={control}
                    error={errors.emergency_contact_relation}
                    options={RELATIONSHIP_OPTIONS}
                    placeholder="Select"
                  />
                  
                  <PhoneInputField
                    label="Emergency Contact Phone"
                    value={watch('emergency_contact_phone') || ''}
                    onChange={val => setValue('emergency_contact_phone', val)}
                    error={errors.emergency_contact_phone}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Professional Information - REMOVED SUBJECTS */}
        <TabsContent value="professional">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Qualifications & Experience</h3>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <SelectField
                    label="Highest Qualification"
                    name="qualification"
                    control={control}
                    error={errors.qualification}
                    options={TEACHER_QUALIFICATION_OPTIONS}
                    placeholder="Select"
                  />
                  
                  <InputField
                    label="Specialization"
                    name="specialization"
                    register={register}
                    error={errors.specialization}
                    placeholder="e.g. Mathematics"
                  />
                  
                  <InputField
                    label="Experience (Years)"
                    name="experience_years"
                    register={register}
                    error={errors.experience_years}
                    type="number"
                    placeholder="5"
                  />
                  
                  <InputField
                    label="Previous Institution"
                    name="previous_institution"
                    register={register}
                    error={errors.previous_institution}
                    placeholder="Last school/college"
                    className="sm:col-span-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Employment Information */}
        <TabsContent value="employment">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Employment Details</h3>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <SelectField
                    label="Designation"
                    name="designation"
                    control={control}
                    error={errors.designation}
                    options={TEACHER_DESIGNATION_OPTIONS}
                    placeholder="Select"
                  />
                  
                  <SelectField
                    label="Department"
                    name="department"
                    control={control}
                    error={errors.department}
                    options={TEACHER_DEPARTMENT_OPTIONS}
                    placeholder="Select"
                  />
                  
                  <SelectField
                    label="Employment Type"
                    name="employment_type"
                    control={control}
                    error={errors.employment_type}
                    options={EMPLOYMENT_TYPE_OPTIONS}
                    placeholder="Select"
                  />
                  
                  <DatePickerField
                    label="Joining Date"
                    name="joining_date"
                    control={control}
                    error={errors.joining_date}
                  />
                  
                  <DatePickerField
                    label="Contract Start"
                    name="contract_start_date"
                    control={control}
                    error={errors.contract_start_date}
                  />
                  
                  <DatePickerField
                    label="Contract End"
                    name="contract_end_date"
                    control={control}
                    error={errors.contract_end_date}
                  />
                  
                  <InputField
                    label="Monthly Salary (PKR)"
                    name="salary"
                    register={register}
                    error={errors.salary}
                    type="number"
                    placeholder="50000"
                  />
                  
                  <SelectField
                    label="Status"
                    name="status"
                    control={control}
                    error={errors.status}
                    options={TEACHER_STATUS_OPTIONS}
                    placeholder="Select"
                  />
                </div>

                <Separator />

                <h3 className="text-lg font-semibold">Bank Details</h3>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <InputField
                    label="Bank Name"
                    name="bank_name"
                    register={register}
                    error={errors.bank_name}
                    placeholder="e.g. HBL"
                  />
                  
                  <InputField
                    label="Account Number"
                    name="bank_account_no"
                    register={register}
                    error={errors.bank_account_no}
                    placeholder="1234567890"
                  />
                  
                  <InputField
                    label="Branch"
                    name="bank_branch"
                    register={register}
                    error={errors.bank_branch}
                    placeholder="Main Branch"
                  />
                </div>

                {!isEdit && (
                  <>
                    <Separator />
                    <h3 className="text-lg font-semibold">Account Access</h3>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <InputField
                        label="Password (Leave empty to auto-generate)"
                        name="password"
                        register={register}
                        error={errors.password}
                        type="password"
                        placeholder="Enter password or leave blank"
                      />
                      
                      <div className="flex items-center space-x-2 mt-8">
                        <input
                          type="checkbox"
                          id="send_email"
                          {...register('send_email')}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="send_email">Send welcome email with credentials</Label>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Documents */}
        <TabsContent value="documents">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Documents</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addDocument}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Document
                  </Button>
                </div>

                {watchDocuments?.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No documents added yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Click "Add Document" to upload files
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {watchDocuments.map((doc, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between mb-3">
                          <h4 className="font-medium">Document {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDocument(index)}
                            className="text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <SelectField
                              label="Document Type *"
                              name={`documents.${index}.type`}
                              control={control}
                              error={errors.documents?.[index]?.type}
                              options={DOCUMENT_TYPES}
                              placeholder="Select type"
                              onChange={(value) => handleDocumentTypeChange(index, value)}
                              required
                            />
                            
                            {showCustomType[index] && (
                              <div className="mt-2">
                                <InputField
                                  label="Specify Document Type"
                                  name={`documents.${index}.customType`}
                                  register={register}
                                  error={errors.documents?.[index]?.customType}
                                  placeholder="e.g. Training Certificate"
                                  required
                                />
                              </div>
                            )}
                          </div>

                          <InputField
                            label="Document Title *"
                            name={`documents.${index}.title`}
                            register={register}
                            error={errors.documents?.[index]?.title}
                            placeholder="e.g. CNIC, Degree"
                            required
                          />
                        </div>

                        <div className="mt-3">
                          <Label>Upload File (Max {MAX_FILE_MB}MB)</Label>
                          
                          {doc.file_url && !uploadingFiles[index] && (
                            <div className="flex items-center gap-2 text-sm bg-accent/30 rounded px-3 py-2 mb-2">
                              <span className="truncate">{doc.file_name || 'Current file'}</span>
                              <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline ml-auto"
                              >
                                View
                              </a>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              id={`doc-${index}`}
                              className="hidden"
                              onChange={(e) => handleDocumentUpload(e, index)}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById(`doc-${index}`).click()}
                              className="flex-1"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {uploadingFiles[index] || 'Choose File'}
                            </Button>
                          </div>
                        </div>

                        {isEdit && doc.file_url && (
                          <div className="mt-3 flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`verified-${index}`}
                              checked={doc.verified || false}
                              onChange={(e) => {
                                const currentDocs = getValues('documents') || [];
                                const updatedDocs = [...currentDocs];
                                updatedDocs[index].verified = e.target.checked;
                                setValue('documents', updatedDocs);
                              }}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor={`verified-${index}`}>Verified</Label>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tab Navigation & Actions */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
        {activeTab !== 'personal' && (
          <Button
            type="button"
            variant="outline"
            onClick={prevTab}
            className="w-full sm:w-auto"
          >
            Previous
          </Button>
        )}
        {activeTab !== 'documents' ? (
          <Button
            type="button"
            onClick={nextTab}
            className="w-full sm:w-auto"
          >
            Next
          </Button>
        ) : (
          <FormSubmitButton
            loading={loading}
            label={isEdit ? 'Save Changes' : 'Add Teacher'}
            loadingLabel={isEdit ? 'Saving…' : 'Adding…'}
            className="w-full sm:w-auto"
          />
        )}
      </div>
    </form>
  );
}