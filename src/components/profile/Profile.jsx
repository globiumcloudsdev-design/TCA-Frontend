// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { toast } from 'sonner';
// import { useAuthStore } from '@/store/authStore';
// import {
//     Tabs, TabsContent, TabsList, TabsTrigger,
// } from '@/components/ui/tabs';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Separator } from '@/components/ui/separator';
// import { Label } from '@/components/ui/label';
// import {
//     InputField, SelectField, TextareaField, DatePickerField,
// } from '@/components/common';
// import PhoneInputField from '@/components/common/PhoneInput';
// import CnicInput from '@/components/common/CnicInput';
// import { Upload, X, Loader2, User } from 'lucide-react';

// import {
//     GENDER_OPTIONS, BLOOD_GROUP_OPTIONS, RELIGION_OPTIONS,
//     TEACHER_QUALIFICATION_OPTIONS, TEACHER_DESIGNATION_OPTIONS,
//     EMPLOYMENT_TYPE_OPTIONS, DOCUMENT_TYPES, RELATIONSHIP_OPTIONS,
// } from '@/constants';

// // Services
// import { teacherPortalService } from '@/services/teacherPortalService';
// import { studentPortalService } from '@/services/studentPortalService';
// import { parentPortalService } from '@/services/parentPortalService';
// import { userService } from '@/services/userService';

// // ----------------------------------------------------------------------
// // Helper: get service based on user_type
// // ----------------------------------------------------------------------
// const getServiceByUserType = (userType) => {
//     switch (userType) {
//         case 'TEACHER': return teacherPortalService;
//         case 'STUDENT': return studentPortalService;
//         case 'PARENT': return parentPortalService;
//         default: return userService;
//     }
// };

// // ----------------------------------------------------------------------
// // Zod schemas
// // ----------------------------------------------------------------------
// const baseSchema = z.object({
//     first_name: z.string().min(1, 'First name required'),
//     last_name: z.string().min(1, 'Last name required'),
//     email: z.string().email('Valid email required'),
//     phone: z.string().min(10, 'Phone number required'),
//     date_of_birth: z.string().optional(),
//     gender: z.string().optional(),
//     blood_group: z.string().optional(),
//     religion: z.string().optional(),
//     nationality: z.string().optional(),
//     cnic: z.string().optional(),
//     present_address: z.string().optional(),
//     permanent_address: z.string().optional(),
//     city: z.string().optional(),
//     documents: z.array(z.any()).default([]),
// });

// const parentSchema = baseSchema.extend({
//     occupation: z.string().optional(),
//     relation: z.string().optional(),
// });

// const teacherSchema = baseSchema.extend({
//     qualification: z.string().optional(),
//     specialization: z.string().optional(),
//     experience_years: z.string().optional(),
//     previous_institution: z.string().optional(),
//     designation: z.string().optional(),
//     employment_type: z.string().optional(),
//     contract_type: z.string().optional(),
//     joining_date: z.string().optional(),
//     contract_start_date: z.string().optional(),
//     contract_end_date: z.string().optional(),
//     salary: z.string().optional(),
//     bank_name: z.string().optional(),
//     bank_account_no: z.string().optional(),
//     bank_branch: z.string().optional(),
//     emergency_contact_name: z.string().optional(),
//     emergency_contact_relation: z.string().optional(),
//     emergency_contact_phone: z.string().optional(),
// });

// const studentSchema = baseSchema.extend({
//     registration_no: z.string().optional(),
//     roll_number: z.string().optional(),
//     class_name: z.string().optional(),
//     section_name: z.string().optional(),
//     admission_date: z.string().optional(),
//     father_name: z.string().optional(),
//     mother_name: z.string().optional(),
//     previous_school: z.string().optional(),
// });

// const staffSchema = baseSchema.extend({
//     employee_id: z.string().optional(),
//     staff_type: z.string().optional(),
//     designation: z.string().optional(),
//     employment_type: z.string().optional(),
//     contract_type: z.string().optional(),
//     joining_date: z.string().optional(),
//     contract_start_date: z.string().optional(),
//     contract_end_date: z.string().optional(),
//     salary: z.string().optional(),
//     bank_name: z.string().optional(),
//     bank_account_no: z.string().optional(),
//     bank_branch: z.string().optional(),
// });

// // ----------------------------------------------------------------------
// // Transform API data to form defaults
// // ----------------------------------------------------------------------
// const prepareDefaultValues = (userType, apiData) => {
//     if (!apiData) return {};

//     const details = apiData.details || {};

//     // PARENT (own profile) – only essential fields
//     if (userType === 'PARENT') {
//         return {
//             first_name: apiData.first_name || '',
//             last_name: apiData.last_name || '',
//             email: apiData.email || '',
//             phone: apiData.phone || '',
//             cnic: apiData.cnic || details.cnic || '',
//             occupation: apiData.occupation || details.occupation || '',
//             relation: apiData.relation || details.relation || '',
//             documents: apiData.documents || [],
//             // dummy values to avoid validation errors
//             date_of_birth: '',
//             gender: '',
//             blood_group: '',
//             religion: '',
//             nationality: 'Pakistani',
//             present_address: '',
//             permanent_address: '',
//             city: '',
//         };
//     }

//     // STUDENT
//     if (userType === 'STUDENT') {
//         // active academic session fields
//         const activeSession = apiData.active_academic_session || {};
//         return {
//             first_name: apiData.first_name || '',
//             last_name: apiData.last_name || '',
//             email: apiData.email || '',
//             phone: apiData.phone || '',
//             date_of_birth: apiData.date_of_birth || '',
//             gender: apiData.gender || '',
//             blood_group: apiData.blood_group || '',
//             religion: apiData.religion || '',
//             nationality: apiData.nationality || 'Pakistani',
//             cnic: apiData.cnic || '',
//             present_address: apiData.present_address || '',
//             permanent_address: apiData.permanent_address || '',
//             city: apiData.city || '',
//             documents: apiData.documents || [],
//             registration_no: apiData.registration_no || '',
//             roll_number: activeSession.roll_no || apiData.roll_number || '',
//             class_name: activeSession.class_name || apiData.class_name || '',
//             section_name: activeSession.section_name || apiData.section_name || '',
//             admission_date: apiData.admission_date || '',
//             father_name: apiData.father_name || '',
//             mother_name: apiData.mother_name || '',
//             previous_school: apiData.previous_school || '',
//         };
//     }

//     // TEACHER
//     if (userType === 'TEACHER') {
//         return {
//             first_name: apiData.first_name || '',
//             last_name: apiData.last_name || '',
//             email: apiData.email || '',
//             phone: apiData.phone || '',
//             date_of_birth: apiData.date_of_birth || details.date_of_birth || '',
//             gender: apiData.gender || details.gender || '',
//             blood_group: apiData.blood_group || details.blood_group || '',
//             religion: apiData.religion || details.religion || '',
//             nationality: apiData.nationality || details.nationality || 'Pakistani',
//             cnic: apiData.cnic || details.cnic || '',
//             present_address: apiData.present_address || details.present_address || '',
//             permanent_address: apiData.permanent_address || details.permanent_address || '',
//             city: apiData.city || details.city || '',
//             documents: apiData.documents || [],
//             qualification: details.qualification || '',
//             specialization: details.specialization || '',
//             experience_years: details.experience_years || '',
//             previous_institution: details.previous_institution || '',
//             designation: details.designation || '',
//             employment_type: details.employment_type || '',
//             contract_type: details.contract_type || '',
//             joining_date: details.joining_date || '',
//             contract_start_date: details.contract_start_date || '',
//             contract_end_date: details.contract_end_date || '',
//             salary: details.salary ? String(details.salary) : '',
//             bank_name: details.bank_name || '',
//             bank_account_no: details.bank_account_no || '',
//             bank_branch: details.bank_branch || '',
//             emergency_contact_name: details.emergency_contact_name || '',
//             emergency_contact_relation: details.emergency_contact_relation || '',
//             emergency_contact_phone: details.emergency_contact_phone || '',
//         };
//     }

//     // STAFF / INSTITUTE_ADMIN / BRANCH_ADMIN
//     if (userType === 'STAFF' || userType === 'INSTITUTE_ADMIN' || userType === 'BRANCH_ADMIN') {
//         let dobValue = apiData.date_of_birth || details.date_of_birth;
//         if (!dobValue) dobValue = details.dob;
//         return {
//             first_name: apiData.first_name || '',
//             last_name: apiData.last_name || '',
//             email: apiData.email || '',
//             phone: apiData.phone || '',
//             date_of_birth: dobValue || '',
//             gender: apiData.gender || details.gender || '',
//             blood_group: apiData.blood_group || details.blood_group || '',
//             religion: apiData.religion || details.religion || '',
//             nationality: apiData.nationality || details.nationality || 'Pakistani',
//             cnic: apiData.cnic || details.cnic || '',
//             present_address: apiData.present_address || details.present_address || '',
//             permanent_address: apiData.permanent_address || details.permanent_address || '',
//             city: apiData.city || details.city || '',
//             documents: apiData.documents || [],
//             employee_id: details.employee_id || apiData.employee_id || '',
//             staff_type: details.staff_type || apiData.staff_type || '',
//             designation: details.designation || apiData.designation || '',
//             employment_type: details.employment_type || apiData.employment_type || '',
//             contract_type: details.contract_type || apiData.contract_type || '',
//             joining_date: details.joining_date || apiData.joining_date || '',
//             contract_start_date: details.contract_start_date || apiData.contract_start_date || '',
//             contract_end_date: details.contract_end_date || apiData.contract_end_date || '',
//             salary: details.salary ? String(details.salary) : (apiData.salary ? String(apiData.salary) : ''),
//             bank_name: details.bank_name || apiData.bank_name || '',
//             bank_account_no: details.bank_account_no || apiData.bank_account_no || '',
//             bank_branch: details.bank_branch || apiData.bank_branch || '',
//         };
//     }

//     return {};
// };

// // ----------------------------------------------------------------------
// // Main Component
// // ----------------------------------------------------------------------
// export default function Profile() {
//     const { user, refreshUserData } = useAuthStore();
//     const userType = user?.user_type;
//     const [activeTab, setActiveTab] = useState('personal');
//     const [loading, setLoading] = useState(true);
//     const [saving, setSaving] = useState(false);
//     const [avatarPreview, setAvatarPreview] = useState(null);
//     const [avatarFile, setAvatarFile] = useState(null);
//     const [uploadingFiles, setUploadingFiles] = useState({});
//     const [showCustomType, setShowCustomType] = useState({});

//     // Parent specific states
//     const [children, setChildren] = useState([]);
//     const [selectedChildId, setSelectedChildId] = useState(null);
//     const [isEditingChild, setIsEditingChild] = useState(false);
//     const [viewOwnProfile, setViewOwnProfile] = useState(true);

//     // Determine schema and service
//     let schema;
//     let service;
//     let isParent = false;
//     switch (userType) {
//         case 'TEACHER': schema = teacherSchema; service = teacherPortalService; break;
//         case 'STUDENT': schema = studentSchema; service = studentPortalService; break;
//         case 'STAFF': schema = staffSchema; service = userService; break;
//         case 'PARENT':
//             schema = parentSchema;
//             service = parentPortalService;
//             isParent = true;
//             break;
//         default:
//             schema = baseSchema;
//             service = userService;
//             break;
//     }

//     const {
//         register, control, handleSubmit, setValue, getValues, watch, formState: { errors },
//     } = useForm({
//         resolver: zodResolver(schema),
//         defaultValues: {},
//     });

//     const watchDocuments = watch('documents');

//     // Fetch profile data
//     const fetchProfile = useCallback(async () => {
//         if (!service) return;
//         setLoading(true);
//         try {
//             const res = await service.getProfile();
//             const profileData = res.data || res;
//             const defaultVals = prepareDefaultValues(userType, profileData);
//             Object.keys(defaultVals).forEach(key => {
//                 setValue(key, defaultVals[key]);
//             });
//             setAvatarPreview(profileData.avatar_url || profileData.avatar || null);

//             if (isParent) {
//                 const childrenRes = await parentPortalService.getChildren();
//                 const childrenList = childrenRes.data || childrenRes;
//                 setChildren(childrenList);
//                 setViewOwnProfile(true);
//                 setSelectedChildId(null);
//                 setIsEditingChild(false);
//             }
//         } catch (err) {
//             console.error('Failed to load profile:', err);
//             toast.error('Failed to load profile');
//         } finally {
//             setLoading(false);
//         }
//     }, [service, userType, setValue, isParent]);

//     useEffect(() => {
//         fetchProfile();
//     }, [fetchProfile]);

//     // When parent toggles to view child, fetch child details
//     useEffect(() => {
//         if (isParent && !viewOwnProfile && selectedChildId) {
//             const fetchChild = async () => {
//                 setLoading(true);
//                 try {
//                     const res = await parentPortalService.getChildDetails(selectedChildId);
//                     // API returns { child: {...}, attendance, results, ... }
//                     const childData = res.child || res.data || res;
//                     const childVals = prepareDefaultValues('STUDENT', childData);
//                     Object.keys(childVals).forEach(key => setValue(key, childVals[key]));
//                     setAvatarPreview(childData.avatar_url || childData.avatar || null);
//                     setIsEditingChild(true);
//                 } catch (err) {
//                     console.error(err);
//                     toast.error('Failed to load child data');
//                 } finally {
//                     setLoading(false);
//                 }
//             };
//             fetchChild();
//         } else if (isParent && viewOwnProfile) {
//             const loadParentOwn = async () => {
//                 setLoading(true);
//                 try {
//                     const res = await service.getProfile();
//                     const profileData = res.data || res;
//                     const defaultVals = prepareDefaultValues(userType, profileData);
//                     Object.keys(defaultVals).forEach(key => setValue(key, defaultVals[key]));
//                     setAvatarPreview(profileData.avatar_url || profileData.avatar || null);
//                     setIsEditingChild(false);
//                 } catch (err) {
//                     console.error(err);
//                 } finally {
//                     setLoading(false);
//                 }
//             };
//             loadParentOwn();
//         }
//     }, [viewOwnProfile, selectedChildId, isParent, service, userType, setValue]);

//     // Avatar handlers
//     const handleAvatarChange = (e) => {
//         const file = e.target.files[0];
//         if (!file) return;
//         if (!file.type.startsWith('image/')) {
//             toast.error('Only image files allowed');
//             return;
//         }
//         if (file.size > 5 * 1024 * 1024) {
//             toast.error('Max file size 5MB');
//             return;
//         }
//         const reader = new FileReader();
//         reader.onload = (ev) => setAvatarPreview(ev.target.result);
//         reader.readAsDataURL(file);
//         setAvatarFile(file);
//     };

//     const removeAvatar = () => {
//         setAvatarPreview(null);
//         setAvatarFile(null);
//     };

//     // Document handlers
//     const handleDocumentUpload = (e, index) => {
//         const file = e.target.files[0];
//         if (!file) return;
//         const currentDocs = getValues('documents') || [];
//         const updated = [...currentDocs];
//         if (updated[index]) {
//             updated[index] = {
//                 ...updated[index],
//                 file,
//                 file_name: file.name,
//                 title: updated[index].title || file.name,
//             };
//         }
//         setValue('documents', updated);
//         setUploadingFiles(prev => ({ ...prev, [index]: file.name }));
//     };

//     const addDocument = () => {
//         const current = getValues('documents') || [];
//         setValue('documents', [...current, { type: '', title: '', verified: false }]);
//     };

//     const removeDocument = (index) => {
//         const current = getValues('documents') || [];
//         setValue('documents', current.filter((_, i) => i !== index));
//     };

//     const handleDocumentTypeChange = (index, value) => {
//         const current = getValues('documents') || [];
//         const updated = [...current];
//         updated[index].type = value;
//         setValue('documents', updated);
//         setShowCustomType(prev => ({ ...prev, [index]: value === 'other' }));
//     };

//     // Submit handler
//     const onSubmit = async (data) => {
//         setSaving(true);
//         try {
//             const formData = new FormData();
//             Object.keys(data).forEach(key => {
//                 if (key === 'documents') return;
//                 if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
//                     formData.append(key, data[key]);
//                 }
//             });
//             if (avatarFile) {
//                 formData.append('avatar', avatarFile);
//             }
//             const docMetadata = [];
//             const docs = data.documents || [];
//             docs.forEach((doc, idx) => {
//                 if (doc.file instanceof File) {
//                     formData.append('documents', doc.file);
//                 }
//                 const { file, ...meta } = doc;
//                 docMetadata.push(meta);
//             });
//             formData.append('documents_meta', JSON.stringify(docMetadata));

//             if (isParent && isEditingChild && selectedChildId) {
//                 await parentPortalService.updateChildProfile(selectedChildId, formData);
//                 toast.success('Child profile updated successfully');
//                 // Refresh child data
//                 const refreshed = await parentPortalService.getChildDetails(selectedChildId);
//                 const childData = refreshed.child || refreshed.data || refreshed;
//                 const childVals = prepareDefaultValues('STUDENT', childData);
//                 Object.keys(childVals).forEach(key => setValue(key, childVals[key]));
//                 setAvatarPreview(childData.avatar_url || childData.avatar || null);
//             } else {
//                 await service.updateProfile(formData);
//                 toast.success('Profile updated successfully');
//                 await refreshUserData();
//                 // Refresh own profile
//                 const res = await service.getProfile();
//                 const profileData = res.data || res;
//                 const defaultVals = prepareDefaultValues(userType, profileData);
//                 Object.keys(defaultVals).forEach(key => setValue(key, defaultVals[key]));
//                 setAvatarPreview(profileData.avatar_url || profileData.avatar || null);
//             }
//         } catch (err) {
//             console.error(err);
//             toast.error(err.response?.data?.message || 'Update failed');
//         } finally {
//             setSaving(false);
//         }
//     };

//     if (loading) {
//         return (
//             <div className="flex justify-center items-center h-64">
//                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
//             </div>
//         );
//     }

//     const showProfessionalTab = userType === 'TEACHER' || userType === 'STAFF';
//     const showAcademicTab = userType === 'STUDENT' || (isParent && !viewOwnProfile && selectedChildId);
//     const showParentToggle = isParent && children.length > 0;

//     const childOptions = children.map(child => ({
//         value: child.id,
//         label: `${child.first_name} ${child.last_name} (${child.registration_no || 'N/A'})`
//     }));

//     // Helper: should show extra personal fields (DOB, gender, etc.) for current view
//     const showExtraPersonalFields = () => {
//         if (userType === 'PARENT') {
//             return !viewOwnProfile; // Only show for child, not for parent own profile
//         }
//         return true; // For teachers, staff, students
//     };

//     return (
//         <div className="container mx-auto py-6 px-4 max-w-6xl">
//             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
//                 <h1 className="text-2xl font-bold">My Profile</h1>

//                 {showParentToggle && (
//                     <div className="flex items-center gap-4">
//                         <div className="flex gap-2">
//                             <Button
//                                 type="button"
//                                 variant={viewOwnProfile ? "default" : "outline"}
//                                 size="sm"
//                                 onClick={() => {
//                                     setViewOwnProfile(true);
//                                     setSelectedChildId(null);
//                                 }}
//                             >
//                                 My Profile
//                             </Button>
//                             <Button
//                                 type="button"
//                                 variant={!viewOwnProfile ? "default" : "outline"}
//                                 size="sm"
//                                 onClick={() => {
//                                     setViewOwnProfile(false);
//                                     if (children.length > 0 && !selectedChildId) {
//                                         setSelectedChildId(children[0].id);
//                                     }
//                                 }}
//                             >
//                                 View Child
//                             </Button>
//                         </div>

//                         {!viewOwnProfile && (
//                             <SelectField
//                                 label="Select Child"
//                                 name="childSelector"
//                                 value={selectedChildId || ''}
//                                 onChange={(val) => setSelectedChildId(val)}
//                                 options={childOptions}
//                                 className="w-64"
//                             />
//                         )}
//                     </div>
//                 )}
//             </div>

//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//                 <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//                     <TabsList className="grid w-full grid-cols-3 md:grid-cols-4">
//                         <TabsTrigger value="personal">Personal</TabsTrigger>
//                         {(showProfessionalTab || showAcademicTab) && (
//                             <TabsTrigger value="professional">
//                                 {userType === 'STUDENT' || (isParent && !viewOwnProfile) ? 'Academic' : 'Professional'}
//                             </TabsTrigger>
//                         )}
//                         <TabsTrigger value="documents">
//                             Documents {watchDocuments?.length > 0 && `(${watchDocuments.length})`}
//                         </TabsTrigger>
//                     </TabsList>

//                     {/* Personal Tab */}
//                     <TabsContent value="personal">
//                         <Card>
//                             <CardContent className="p-6 space-y-6">
//                                 {/* Avatar */}
//                                 <div className="flex flex-col sm:flex-row items-center gap-6">
//                                     <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted">
//                                         {avatarPreview ? (
//                                             <img src={avatarPreview} alt="Avatar" className="object-cover w-full h-full" />
//                                         ) : (
//                                             <div className="flex items-center justify-center w-full h-full text-muted-foreground">
//                                                 <User size={40} />
//                                             </div>
//                                         )}
//                                     </div>
//                                     <div className="flex gap-2">
//                                         <Button type="button" variant="outline" onClick={() => document.getElementById('avatar-upload').click()}>
//                                             <Upload className="h-4 w-4 mr-2" /> Upload Photo
//                                         </Button>
//                                         {avatarPreview && (
//                                             <Button type="button" variant="ghost" onClick={removeAvatar} className="text-destructive">
//                                                 Remove
//                                             </Button>
//                                         )}
//                                         <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
//                                     </div>
//                                 </div>

//                                 <Separator />

//                                 {/* Common fields for all */}
//                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                                     <InputField label="First Name *" name="first_name" register={register} error={errors.first_name} required />
//                                     <InputField label="Last Name *" name="last_name" register={register} error={errors.last_name} required />
//                                     <InputField label="Email *" name="email" register={register} error={errors.email} type="email" />
//                                     <PhoneInputField
//                                         label="Phone Number"
//                                         value={watch('phone') || ''}
//                                         onChange={val => setValue('phone', val)}
//                                         error={errors.phone}
//                                     />
//                                     <CnicInput
//                                         label="CNIC / B-Form"
//                                         value={watch('cnic') || ''}
//                                         onChange={val => setValue('cnic', val)}
//                                         error={errors.cnic}
//                                     />
//                                 </div>

//                                 {/* Extra personal fields (DOB, Gender, etc.) – hidden for parent own profile */}
//                                 {showExtraPersonalFields() && (
//                                     <>
//                                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                                             <DatePickerField label="Date of Birth" name="date_of_birth" control={control} error={errors.date_of_birth} />
//                                             <SelectField label="Gender" name="gender" control={control} error={errors.gender} options={GENDER_OPTIONS} />
//                                             <SelectField label="Blood Group" name="blood_group" control={control} error={errors.blood_group} options={BLOOD_GROUP_OPTIONS} />
//                                             <SelectField label="Religion" name="religion" control={control} error={errors.religion} options={RELIGION_OPTIONS} />
//                                             <InputField label="Nationality" name="nationality" register={register} error={errors.nationality} />
//                                             <InputField label="City" name="city" register={register} error={errors.city} />
//                                         </div>
//                                         <TextareaField label="Present Address" name="present_address" register={register} error={errors.present_address} rows={2} />
//                                         <TextareaField label="Permanent Address" name="permanent_address" register={register} error={errors.permanent_address} rows={2} />
//                                     </>
//                                 )}

//                                 {/* Parent specific fields (only when viewing own profile) */}
//                                 {userType === 'PARENT' && viewOwnProfile && (
//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                         <InputField label="Occupation" name="occupation" register={register} error={errors.occupation} />
//                                         <InputField label="Relation to Child" name="relation" register={register} error={errors.relation} />
//                                     </div>
//                                 )}
//                             </CardContent>
//                         </Card>
//                     </TabsContent>

//                     {/* Professional / Academic Tab */}
//                     {(showProfessionalTab || showAcademicTab) && (
//                         <TabsContent value="professional">
//                             <Card>
//                                 <CardContent className="p-6 space-y-6">
//                                     {/* Teacher Professional Section */}
//                                     {userType === 'TEACHER' && (
//                                         <>
//                                             <h3 className="text-lg font-semibold">Qualifications & Experience</h3>
//                                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                                                 <SelectField label="Qualification" name="qualification" control={control} options={TEACHER_QUALIFICATION_OPTIONS} />
//                                                 <InputField label="Specialization" name="specialization" register={register} />
//                                                 <InputField label="Experience (Years)" name="experience_years" register={register} type="number" />
//                                                 <InputField label="Previous Institution" name="previous_institution" register={register} className="md:col-span-2" />
//                                             </div>
//                                             <Separator />
//                                             <h3 className="text-lg font-semibold">Employment Details</h3>
//                                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                                                 <SelectField label="Designation" name="designation" control={control} options={TEACHER_DESIGNATION_OPTIONS} />
//                                                 <SelectField label="Employment Type" name="employment_type" control={control} options={EMPLOYMENT_TYPE_OPTIONS} />
//                                                 <SelectField label="Contract Type" name="contract_type" control={control} options={[
//                                                     { value: 'permanent', label: 'Permanent' },
//                                                     { value: 'contract', label: 'Contract' },
//                                                     { value: 'probation', label: 'Probation' },
//                                                 ]} />
//                                                 <DatePickerField label="Joining Date" name="joining_date" control={control} />
//                                                 <DatePickerField label="Contract Start Date" name="contract_start_date" control={control} />
//                                                 {watch('contract_type') === 'contract' && (
//                                                     <DatePickerField label="Contract End Date" name="contract_end_date" control={control} />
//                                                 )}
//                                                 <InputField label="Monthly Salary (PKR)" name="salary" register={register} type="number" />
//                                             </div>
//                                             <Separator />
//                                             <h3 className="text-lg font-semibold">Bank Details</h3>
//                                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                                 <InputField label="Bank Name" name="bank_name" register={register} />
//                                                 <InputField label="Account Number" name="bank_account_no" register={register} />
//                                                 <InputField label="Branch" name="bank_branch" register={register} />
//                                             </div>
//                                             <Separator />
//                                             <h3 className="text-lg font-semibold">Emergency Contact</h3>
//                                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                                 <InputField label="Contact Person" name="emergency_contact_name" register={register} />
//                                                 <SelectField label="Relation" name="emergency_contact_relation" control={control} options={RELATIONSHIP_OPTIONS} />
//                                                 <PhoneInputField
//                                                     label="Emergency Phone"
//                                                     value={watch('emergency_contact_phone') || ''}
//                                                     onChange={val => setValue('emergency_contact_phone', val)}
//                                                 />
//                                             </div>
//                                         </>
//                                     )}

//                                     {/* Student Academic Section (for both student self and parent viewing child) */}
//                                     {(userType === 'STUDENT' || (isParent && !viewOwnProfile)) && (
//                                         <>
//                                             <h3 className="text-lg font-semibold">Academic Information</h3>
//                                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                                                 <InputField label="Registration No" name="registration_no" register={register} />
//                                                 <InputField label="Roll Number" name="roll_number" register={register} />
//                                                 <InputField label="Class" name="class_name" register={register} />
//                                                 <InputField label="Section" name="section_name" register={register} />
//                                                 <DatePickerField label="Admission Date" name="admission_date" control={control} />
//                                                 <InputField label="Father's Name" name="father_name" register={register} />
//                                                 <InputField label="Mother's Name" name="mother_name" register={register} />
//                                                 <InputField label="Previous School" name="previous_school" register={register} className="md:col-span-2" />
//                                             </div>
//                                         </>
//                                     )}

//                                     {/* Staff Professional Section */}
//                                     {userType === 'STAFF' && (
//                                         <>
//                                             <h3 className="text-lg font-semibold">Staff Details</h3>
//                                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                                                 <InputField label="Employee ID" name="employee_id" register={register} />
//                                                 <InputField label="Staff Type" name="staff_type" register={register} />
//                                                 <InputField label="Designation" name="designation" register={register} />
//                                                 <SelectField label="Employment Type" name="employment_type" control={control} options={EMPLOYMENT_TYPE_OPTIONS} />
//                                                 <SelectField label="Contract Type" name="contract_type" control={control} options={[{ value: 'permanent', label: 'Permanent' }, { value: 'contract', label: 'Contract' }]} />
//                                                 <DatePickerField label="Joining Date" name="joining_date" control={control} />
//                                                 <DatePickerField label="Contract Start Date" name="contract_start_date" control={control} />
//                                                 {watch('contract_type') === 'contract' && (
//                                                     <DatePickerField label="Contract End Date" name="contract_end_date" control={control} />
//                                                 )}
//                                                 <InputField label="Monthly Salary (PKR)" name="salary" register={register} type="number" />
//                                             </div>
//                                             <Separator />
//                                             <h3 className="text-lg font-semibold">Bank Details</h3>
//                                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                                 <InputField label="Bank Name" name="bank_name" register={register} />
//                                                 <InputField label="Account Number" name="bank_account_no" register={register} />
//                                                 <InputField label="Branch" name="bank_branch" register={register} />
//                                             </div>
//                                         </>
//                                     )}
//                                 </CardContent>
//                             </Card>
//                         </TabsContent>
//                     )}

//                     {/* Documents Tab */}
//                     <TabsContent value="documents">
//                         <Card>
//                             <CardContent className="p-6 space-y-4">
//                                 <div className="flex justify-between items-center">
//                                     <h3 className="text-lg font-semibold">Documents</h3>
//                                     <Button type="button" variant="outline" size="sm" onClick={addDocument}>
//                                         <Upload className="h-4 w-4 mr-2" /> Add Document
//                                     </Button>
//                                 </div>
//                                 {(!watchDocuments || watchDocuments.length === 0) ? (
//                                     <div className="text-center py-8 border-2 border-dashed rounded-lg">
//                                         <p className="text-muted-foreground">No documents uploaded</p>
//                                     </div>
//                                 ) : (
//                                     <div className="space-y-4">
//                                         {watchDocuments.map((doc, idx) => (
//                                             <div key={idx} className="border rounded-lg p-4 relative">
//                                                 <Button
//                                                     type="button"
//                                                     variant="ghost"
//                                                     size="sm"
//                                                     className="absolute top-2 right-2 text-destructive"
//                                                     onClick={() => removeDocument(idx)}
//                                                 >
//                                                     <X className="h-4 w-4" />
//                                                 </Button>
//                                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
//                                                     <SelectField
//                                                         label="Document Type"
//                                                         name={`documents.${idx}.type`}
//                                                         control={control}
//                                                         error={errors.documents?.[idx]?.type}
//                                                         options={DOCUMENT_TYPES}
//                                                         onChange={(val) => handleDocumentTypeChange(idx, val)}
//                                                     />
//                                                     <InputField
//                                                         label="Title"
//                                                         name={`documents.${idx}.title`}
//                                                         register={register}
//                                                         error={errors.documents?.[idx]?.title}
//                                                     />
//                                                 </div>
//                                                 {showCustomType[idx] && (
//                                                     <div className="mb-3">
//                                                         <InputField
//                                                             label="Specify Type"
//                                                             name={`documents.${idx}.customType`}
//                                                             register={register}
//                                                         />
//                                                     </div>
//                                                 )}
//                                                 <div>
//                                                     <Label>Upload File</Label>
//                                                     <div className="flex items-center gap-2 mt-1">
//                                                         <input
//                                                             type="file"
//                                                             id={`doc-${idx}`}
//                                                             className="hidden"
//                                                             onChange={(e) => handleDocumentUpload(e, idx)}
//                                                         />
//                                                         <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById(`doc-${idx}`).click()}>
//                                                             <Upload className="h-4 w-4 mr-2" />
//                                                             {uploadingFiles[idx] || 'Choose File'}
//                                                         </Button>
//                                                         {doc.file_url && !uploadingFiles[idx] && (
//                                                             <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-blue-600 text-sm">View</a>
//                                                         )}
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 )}
//                             </CardContent>
//                         </Card>
//                     </TabsContent>
//                 </Tabs>

//                 <div className="flex justify-end gap-3 pt-4 border-t">
//                     <Button type="submit" disabled={saving}>
//                         {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                         Save Changes
//                     </Button>
//                 </div>
//             </form>
//         </div>
//     );
// }

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import {
    Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import {
    InputField, SelectField, TextareaField, DatePickerField,
} from '@/components/common';
import PhoneInputField from '@/components/common/PhoneInput';
import CnicInput from '@/components/common/CnicInput';
import { Upload, X, Loader2, User } from 'lucide-react';

import {
    GENDER_OPTIONS, BLOOD_GROUP_OPTIONS, RELIGION_OPTIONS,
    TEACHER_QUALIFICATION_OPTIONS, TEACHER_DESIGNATION_OPTIONS,
    EMPLOYMENT_TYPE_OPTIONS, DOCUMENT_TYPES, RELATIONSHIP_OPTIONS,
} from '@/constants';

// Services
import { teacherPortalService } from '@/services/teacherPortalService';
import { studentPortalService } from '@/services/studentPortalService';
import { parentPortalService } from '@/services/parentPortalService';
import { userService } from '@/services/userService';

// ----------------------------------------------------------------------
// Helper
// ----------------------------------------------------------------------
const getServiceByUserType = (userType) => {
    switch (userType) {
        case 'TEACHER': return teacherPortalService;
        case 'STUDENT': return studentPortalService;
        case 'PARENT': return parentPortalService;
        default: return userService;
    }
};

// ----------------------------------------------------------------------
// Zod schemas (unchanged)
// ----------------------------------------------------------------------
const baseSchema = z.object({
    first_name: z.string().min(1, 'First name required'),
    last_name: z.string().min(1, 'Last name required'),
    email: z.string().email('Valid email required'),
    phone: z.string().min(10, 'Phone number required'),
    date_of_birth: z.string().optional(),
    gender: z.string().optional(),
    blood_group: z.string().optional(),
    religion: z.string().optional(),
    nationality: z.string().optional(),
    cnic: z.string().optional(),
    present_address: z.string().optional(),
    permanent_address: z.string().optional(),
    city: z.string().optional(),
    documents: z.array(z.any()).default([]),
});

const parentSchema = baseSchema.extend({
    occupation: z.string().optional(),
    relation: z.string().optional(),
});

const teacherSchema = baseSchema.extend({
    qualification: z.string().optional(),
    specialization: z.string().optional(),
    experience_years: z.string().optional(),
    previous_institution: z.string().optional(),
    designation: z.string().optional(),
    employment_type: z.string().optional(),
    contract_type: z.string().optional(),
    joining_date: z.string().optional(),
    contract_start_date: z.string().optional(),
    contract_end_date: z.string().optional(),
    salary: z.string().optional(),
    bank_name: z.string().optional(),
    bank_account_no: z.string().optional(),
    bank_branch: z.string().optional(),
    emergency_contact_name: z.string().optional(),
    emergency_contact_relation: z.string().optional(),
    emergency_contact_phone: z.string().optional(),
});

const studentSchema = baseSchema.extend({
    registration_no: z.string().optional(),
    roll_number: z.string().optional(),
    class_name: z.string().optional(),
    section_name: z.string().optional(),
    admission_date: z.string().optional(),
    father_name: z.string().optional(),
    mother_name: z.string().optional(),
    previous_school: z.string().optional(),
});

const staffSchema = baseSchema.extend({
    employee_id: z.string().optional(),
    staff_type: z.string().optional(),
    designation: z.string().optional(),
    employment_type: z.string().optional(),
    contract_type: z.string().optional(),
    joining_date: z.string().optional(),
    contract_start_date: z.string().optional(),
    contract_end_date: z.string().optional(),
    salary: z.string().optional(),
    bank_name: z.string().optional(),
    bank_account_no: z.string().optional(),
    bank_branch: z.string().optional(),
});

// ----------------------------------------------------------------------
// Transform API data to form defaults - FIXED FOR STUDENT (child data)
// ----------------------------------------------------------------------
const prepareDefaultValues = (userType, apiData) => {
    if (!apiData) return {};

    const details = apiData.details || {};

    // PARENT (own profile)
    if (userType === 'PARENT') {
        return {
            first_name: apiData.first_name || '',
            last_name: apiData.last_name || '',
            email: apiData.email || '',
            phone: apiData.phone || '',
            cnic: apiData.cnic || details.cnic || '',
            occupation: apiData.occupation || details.occupation || '',
            relation: apiData.relation || details.relation || '',
            documents: apiData.documents || [],
            date_of_birth: '',
            gender: '',
            blood_group: '',
            religion: '',
            nationality: 'Pakistani',
            present_address: '',
            permanent_address: '',
            city: '',
        };
    }

    // STUDENT (for both student self-view and parent viewing child)
    if (userType === 'STUDENT') {
        // Support both field naming conventions
        const getClass = () => apiData.class_name || apiData.class || '';
        const getSection = () => apiData.section_name || apiData.section || '';
        const getRollNo = () => apiData.roll_number || apiData.roll_no || '';
        
        // Active academic session (if present)
        const activeSession = apiData.active_academic_session || {};
        
        return {
            first_name: apiData.first_name || '',
            last_name: apiData.last_name || '',
            email: apiData.email || '',
            phone: apiData.phone || '',
            date_of_birth: apiData.date_of_birth || '',
            gender: apiData.gender || '',
            blood_group: apiData.blood_group || '',
            religion: apiData.religion || '',
            nationality: apiData.nationality || 'Pakistani',
            cnic: apiData.cnic || '',
            present_address: apiData.present_address || '',
            permanent_address: apiData.permanent_address || '',
            city: apiData.city || '',
            documents: apiData.documents || [],
            registration_no: apiData.registration_no || '',
            roll_number: activeSession.roll_no || getRollNo(),
            class_name: activeSession.class_name || getClass(),
            section_name: activeSession.section_name || getSection(),
            admission_date: apiData.admission_date || '',
            father_name: apiData.father_name || '',
            mother_name: apiData.mother_name || '',
            previous_school: apiData.previous_school || '',
        };
    }

    // TEACHER (unchanged)
    if (userType === 'TEACHER') {
        return {
            first_name: apiData.first_name || '',
            last_name: apiData.last_name || '',
            email: apiData.email || '',
            phone: apiData.phone || '',
            date_of_birth: apiData.date_of_birth || details.date_of_birth || '',
            gender: apiData.gender || details.gender || '',
            blood_group: apiData.blood_group || details.blood_group || '',
            religion: apiData.religion || details.religion || '',
            nationality: apiData.nationality || details.nationality || 'Pakistani',
            cnic: apiData.cnic || details.cnic || '',
            present_address: apiData.present_address || details.present_address || '',
            permanent_address: apiData.permanent_address || details.permanent_address || '',
            city: apiData.city || details.city || '',
            documents: apiData.documents || [],
            qualification: details.qualification || '',
            specialization: details.specialization || '',
            experience_years: details.experience_years || '',
            previous_institution: details.previous_institution || '',
            designation: details.designation || '',
            employment_type: details.employment_type || '',
            contract_type: details.contract_type || '',
            joining_date: details.joining_date || '',
            contract_start_date: details.contract_start_date || '',
            contract_end_date: details.contract_end_date || '',
            salary: details.salary ? String(details.salary) : '',
            bank_name: details.bank_name || '',
            bank_account_no: details.bank_account_no || '',
            bank_branch: details.bank_branch || '',
            emergency_contact_name: details.emergency_contact_name || '',
            emergency_contact_relation: details.emergency_contact_relation || '',
            emergency_contact_phone: details.emergency_contact_phone || '',
        };
    }

    // STAFF (unchanged)
    if (userType === 'STAFF' || userType === 'INSTITUTE_ADMIN' || userType === 'BRANCH_ADMIN') {
        let dobValue = apiData.date_of_birth || details.date_of_birth;
        if (!dobValue) dobValue = details.dob;
        return {
            first_name: apiData.first_name || '',
            last_name: apiData.last_name || '',
            email: apiData.email || '',
            phone: apiData.phone || '',
            date_of_birth: dobValue || '',
            gender: apiData.gender || details.gender || '',
            blood_group: apiData.blood_group || details.blood_group || '',
            religion: apiData.religion || details.religion || '',
            nationality: apiData.nationality || details.nationality || 'Pakistani',
            cnic: apiData.cnic || details.cnic || '',
            present_address: apiData.present_address || details.present_address || '',
            permanent_address: apiData.permanent_address || details.permanent_address || '',
            city: apiData.city || details.city || '',
            documents: apiData.documents || [],
            employee_id: details.employee_id || apiData.employee_id || '',
            staff_type: details.staff_type || apiData.staff_type || '',
            designation: details.designation || apiData.designation || '',
            employment_type: details.employment_type || apiData.employment_type || '',
            contract_type: details.contract_type || apiData.contract_type || '',
            joining_date: details.joining_date || apiData.joining_date || '',
            contract_start_date: details.contract_start_date || apiData.contract_start_date || '',
            contract_end_date: details.contract_end_date || apiData.contract_end_date || '',
            salary: details.salary ? String(details.salary) : (apiData.salary ? String(apiData.salary) : ''),
            bank_name: details.bank_name || apiData.bank_name || '',
            bank_account_no: details.bank_account_no || apiData.bank_account_no || '',
            bank_branch: details.bank_branch || apiData.bank_branch || '',
        };
    }

    return {};
};

// ----------------------------------------------------------------------
// Main Component (same as before, but with fixed mapping)
// ----------------------------------------------------------------------
export default function Profile() {
    const { user, refreshUserData } = useAuthStore();
    const userType = user?.user_type;
    const [activeTab, setActiveTab] = useState('personal');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [uploadingFiles, setUploadingFiles] = useState({});
    const [showCustomType, setShowCustomType] = useState({});

    // Parent specific
    const [children, setChildren] = useState([]);
    const [selectedChildId, setSelectedChildId] = useState(null);
    const [isEditingChild, setIsEditingChild] = useState(false);
    const [viewOwnProfile, setViewOwnProfile] = useState(true);

    // Determine schema & service
    let schema;
    let service;
    let isParent = false;
    switch (userType) {
        case 'TEACHER': schema = teacherSchema; service = teacherPortalService; break;
        case 'STUDENT': schema = studentSchema; service = studentPortalService; break;
        case 'STAFF': schema = staffSchema; service = userService; break;
        case 'PARENT':
            schema = parentSchema;
            service = parentPortalService;
            isParent = true;
            break;
        default:
            schema = baseSchema;
            service = userService;
            break;
    }

    const {
        register, control, handleSubmit, setValue, getValues, watch, formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {},
    });

    const watchDocuments = watch('documents');

    // Fetch parent profile & children list
    const fetchProfile = useCallback(async () => {
        if (!service) return;
        setLoading(true);
        try {
            const res = await service.getProfile();
            const profileData = res.data || res;
            const defaultVals = prepareDefaultValues(userType, profileData);
            Object.keys(defaultVals).forEach(key => setValue(key, defaultVals[key]));
            setAvatarPreview(profileData.avatar_url || profileData.avatar || null);

            if (isParent) {
                const childrenRes = await parentPortalService.getChildren();
                console.log('Fetched children list:', childrenRes);
                // const childrenList = childrenRes.data || childrenRes;
                const childrenList = childrenRes?.data || [];
                setChildren(childrenList);
                setViewOwnProfile(true);
                setSelectedChildId(null);
                setIsEditingChild(false);
            }
        } catch (err) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    }, [service, userType, setValue, isParent]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    // When parent selects a child, fetch full child details
    useEffect(() => {
        if (isParent && !viewOwnProfile && selectedChildId) {
            const fetchChild = async () => {
                setLoading(true);
                try {
                    const res = await parentPortalService.getChildDetails(selectedChildId);
                    // Backend returns { child: {...}, attendance, results, ... }
                    const childData = res.child || res.data.child || res;
                    const childVals = prepareDefaultValues('STUDENT', childData);
                    Object.keys(childVals).forEach(key => setValue(key, childVals[key]));
                    setAvatarPreview(childData.avatar_url || childData.avatar || null);
                    setIsEditingChild(true);
                } catch (err) {
                    toast.error('Failed to load child data');
                } finally {
                    setLoading(false);
                }
            };
            fetchChild();
        } else if (isParent && viewOwnProfile) {
            // Reload parent own profile
            const loadParentOwn = async () => {
                setLoading(true);
                try {
                    const res = await service.getProfile();
                    const profileData = res.data || res;
                    const defaultVals = prepareDefaultValues(userType, profileData);
                    Object.keys(defaultVals).forEach(key => setValue(key, defaultVals[key]));
                    setAvatarPreview(profileData.avatar_url || profileData.avatar || null);
                    setIsEditingChild(false);
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            loadParentOwn();
        }
    }, [viewOwnProfile, selectedChildId, isParent, service, userType, setValue]);

    // Avatar handlers (same)
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { toast.error('Only image files allowed'); return; }
        if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }
        const reader = new FileReader();
        reader.onload = (ev) => setAvatarPreview(ev.target.result);
        reader.readAsDataURL(file);
        setAvatarFile(file);
    };
    const removeAvatar = () => { setAvatarPreview(null); setAvatarFile(null); };

    // Document handlers
    const handleDocumentUpload = (e, index) => {
        const file = e.target.files[0];
        if (!file) return;
        const currentDocs = getValues('documents') || [];
        const updated = [...currentDocs];
        if (updated[index]) {
            updated[index] = { ...updated[index], file, file_name: file.name, title: updated[index].title || file.name };
        }
        setValue('documents', updated);
        setUploadingFiles(prev => ({ ...prev, [index]: file.name }));
    };
    const addDocument = () => {
        const current = getValues('documents') || [];
        setValue('documents', [...current, { type: '', title: '', verified: false }]);
    };
    const removeDocument = (index) => {
        const current = getValues('documents') || [];
        setValue('documents', current.filter((_, i) => i !== index));
    };
    const handleDocumentTypeChange = (index, value) => {
        const current = getValues('documents') || [];
        const updated = [...current];
        updated[index].type = value;
        setValue('documents', updated);
        setShowCustomType(prev => ({ ...prev, [index]: value === 'other' }));
    };

    // Submit handler
    const onSubmit = async (data) => {
        setSaving(true);
        try {
            const formData = new FormData();
            Object.keys(data).forEach(key => {
                if (key === 'documents') return;
                if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
                    formData.append(key, data[key]);
                }
            });
            if (avatarFile) formData.append('avatar', avatarFile);
            const docMetadata = [];
            const docs = data.documents || [];
            docs.forEach((doc, idx) => {
                if (doc.file instanceof File) formData.append('documents', doc.file);
                const { file, ...meta } = doc;
                docMetadata.push(meta);
            });
            formData.append('documents_meta', JSON.stringify(docMetadata));

            if (isParent && isEditingChild && selectedChildId) {
                await parentPortalService.updateChildProfile(selectedChildId, formData);
                toast.success('Child profile updated');
                // Refresh child data
                const refreshed = await parentPortalService.getChildDetails(selectedChildId);
                const childData = refreshed.child || refreshed.data || refreshed;
                const childVals = prepareDefaultValues('STUDENT', childData);
                Object.keys(childVals).forEach(key => setValue(key, childVals[key]));
                setAvatarPreview(childData.avatar_url || childData.avatar || null);
            } else {
                await service.updateProfile(formData);
                toast.success('Profile updated');
                await refreshUserData();
                const res = await service.getProfile();
                const profileData = res.data || res;
                const defaultVals = prepareDefaultValues(userType, profileData);
                Object.keys(defaultVals).forEach(key => setValue(key, defaultVals[key]));
                setAvatarPreview(profileData.avatar_url || profileData.avatar || null);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    const showProfessionalTab = userType === 'TEACHER' || userType === 'STAFF';
    const showAcademicTab = userType === 'STUDENT' || (isParent && !viewOwnProfile && selectedChildId);
    const showParentToggle = isParent && children.length > 0;
    const childOptions = children.map(child => ({ value: child.id, label: `${child.first_name} ${child.last_name} (${child.registration_no || 'N/A'})` }));
    const showExtraPersonalFields = () => !(userType === 'PARENT' && viewOwnProfile);

    return (
        <div className="container mx-auto py-6 px-4 max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold">My Profile</h1>
                {showParentToggle && (
                    <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                            <Button type="button" variant={viewOwnProfile ? "default" : "outline"} size="sm" onClick={() => { setViewOwnProfile(true); setSelectedChildId(null); }}>My Profile</Button>
                            <Button type="button" variant={!viewOwnProfile ? "default" : "outline"} size="sm" onClick={() => { setViewOwnProfile(false); if (children.length > 0 && !selectedChildId) setSelectedChildId(children[0].id); }}>View Child</Button>
                        </div>
                        {!viewOwnProfile && <SelectField label="Select Child" name="childSelector" value={selectedChildId || ''} onChange={(val) => setSelectedChildId(val)} options={childOptions} className="w-64" />}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 md:grid-cols-4">
                        <TabsTrigger value="personal">Personal</TabsTrigger>
                        {(showProfessionalTab || showAcademicTab) && <TabsTrigger value="professional">{userType === 'STUDENT' || (isParent && !viewOwnProfile) ? 'Academic' : 'Professional'}</TabsTrigger>}
                        <TabsTrigger value="documents">Documents {watchDocuments?.length > 0 && `(${watchDocuments.length})`}</TabsTrigger>
                    </TabsList>

                    {/* Personal Tab */}
                    <TabsContent value="personal">
                        <Card>
                            <CardContent className="p-6 space-y-6">
                                {/* Avatar */}
                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted">
                                        {avatarPreview ? <img src={avatarPreview} alt="Avatar" className="object-cover w-full h-full" /> : <div className="flex items-center justify-center w-full h-full text-muted-foreground"><User size={40} /></div>}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="button" variant="outline" onClick={() => document.getElementById('avatar-upload').click()}><Upload className="h-4 w-4 mr-2" /> Upload Photo</Button>
                                        {avatarPreview && <Button type="button" variant="ghost" onClick={removeAvatar} className="text-destructive">Remove</Button>}
                                        <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                    </div>
                                </div>
                                <Separator />
                                {/* Common fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <InputField label="First Name *" name="first_name" register={register} error={errors.first_name} required />
                                    <InputField label="Last Name *" name="last_name" register={register} error={errors.last_name} required />
                                    <InputField label="Email *" name="email" register={register} error={errors.email} type="email" />
                                    <PhoneInputField label="Phone Number" value={watch('phone') || ''} onChange={val => setValue('phone', val)} error={errors.phone} />
                                    <CnicInput label="CNIC / B-Form" value={watch('cnic') || ''} onChange={val => setValue('cnic', val)} error={errors.cnic} />
                                </div>
                                {/* Extra personal fields (for child or non-parent) */}
                                {showExtraPersonalFields() && (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <DatePickerField label="Date of Birth" name="date_of_birth" control={control} error={errors.date_of_birth} />
                                            <SelectField label="Gender" name="gender" control={control} error={errors.gender} options={GENDER_OPTIONS} />
                                            <SelectField label="Blood Group" name="blood_group" control={control} error={errors.blood_group} options={BLOOD_GROUP_OPTIONS} />
                                            <SelectField label="Religion" name="religion" control={control} error={errors.religion} options={RELIGION_OPTIONS} />
                                            <InputField label="Nationality" name="nationality" register={register} error={errors.nationality} />
                                            <InputField label="City" name="city" register={register} error={errors.city} />
                                        </div>
                                        <TextareaField label="Present Address" name="present_address" register={register} error={errors.present_address} rows={2} />
                                        <TextareaField label="Permanent Address" name="permanent_address" register={register} error={errors.permanent_address} rows={2} />
                                    </>
                                )}
                                {/* Parent own extra fields */}
                                {userType === 'PARENT' && viewOwnProfile && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputField label="Occupation" name="occupation" register={register} error={errors.occupation} />
                                        <InputField label="Relation to Child" name="relation" register={register} error={errors.relation} />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Professional / Academic Tab */}
                    {(showProfessionalTab || showAcademicTab) && (
                        <TabsContent value="professional">
                            <Card>
                                <CardContent className="p-6 space-y-6">
                                    {/* Teacher section (same as before, omitted for brevity) */}
                                    {userType === 'TEACHER' && (
                                        <>
                                            <h3 className="text-lg font-semibold">Qualifications & Experience</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <SelectField label="Qualification" name="qualification" control={control} options={TEACHER_QUALIFICATION_OPTIONS} />
                                                <InputField label="Specialization" name="specialization" register={register} />
                                                <InputField label="Experience (Years)" name="experience_years" register={register} type="number" />
                                                <InputField label="Previous Institution" name="previous_institution" register={register} className="md:col-span-2" />
                                            </div>
                                            <Separator />
                                            <h3 className="text-lg font-semibold">Employment Details</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <SelectField label="Designation" name="designation" control={control} options={TEACHER_DESIGNATION_OPTIONS} />
                                                <SelectField label="Employment Type" name="employment_type" control={control} options={EMPLOYMENT_TYPE_OPTIONS} />
                                                <SelectField label="Contract Type" name="contract_type" control={control} options={[{ value: 'permanent', label: 'Permanent' }, { value: 'contract', label: 'Contract' }, { value: 'probation', label: 'Probation' }]} />
                                                <DatePickerField label="Joining Date" name="joining_date" control={control} />
                                                <DatePickerField label="Contract Start Date" name="contract_start_date" control={control} />
                                                {watch('contract_type') === 'contract' && <DatePickerField label="Contract End Date" name="contract_end_date" control={control} />}
                                                <InputField label="Monthly Salary (PKR)" name="salary" register={register} type="number" />
                                            </div>
                                            <Separator />
                                            <h3 className="text-lg font-semibold">Bank Details</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <InputField label="Bank Name" name="bank_name" register={register} />
                                                <InputField label="Account Number" name="bank_account_no" register={register} />
                                                <InputField label="Branch" name="bank_branch" register={register} />
                                            </div>
                                            <Separator />
                                            <h3 className="text-lg font-semibold">Emergency Contact</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <InputField label="Contact Person" name="emergency_contact_name" register={register} />
                                                <SelectField label="Relation" name="emergency_contact_relation" control={control} options={RELATIONSHIP_OPTIONS} />
                                                <PhoneInputField label="Emergency Phone" value={watch('emergency_contact_phone') || ''} onChange={val => setValue('emergency_contact_phone', val)} />
                                            </div>
                                        </>
                                    )}

                                    {/* Student Academic Section (for student self-view OR parent viewing child) */}
                                    {(userType === 'STUDENT' || (isParent && !viewOwnProfile)) && (
                                        <>
                                            <h3 className="text-lg font-semibold">Academic Information</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <InputField label="Registration No" name="registration_no" register={register} />
                                                <InputField label="Roll Number" name="roll_number" register={register} />
                                                <InputField label="Class" name="class_name" register={register} />
                                                <InputField label="Section" name="section_name" register={register} />
                                                <DatePickerField label="Admission Date" name="admission_date" control={control} />
                                                <InputField label="Father's Name" name="father_name" register={register} />
                                                <InputField label="Mother's Name" name="mother_name" register={register} />
                                                <InputField label="Previous School" name="previous_school" register={register} className="md:col-span-2" />
                                            </div>
                                        </>
                                    )}

                                    {/* Staff section (same as before, omitted) */}
                                    {userType === 'STAFF' && (
                                        <>
                                            <h3 className="text-lg font-semibold">Staff Details</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <InputField label="Employee ID" name="employee_id" register={register} />
                                                <InputField label="Staff Type" name="staff_type" register={register} />
                                                <InputField label="Designation" name="designation" register={register} />
                                                <SelectField label="Employment Type" name="employment_type" control={control} options={EMPLOYMENT_TYPE_OPTIONS} />
                                                <SelectField label="Contract Type" name="contract_type" control={control} options={[{ value: 'permanent', label: 'Permanent' }, { value: 'contract', label: 'Contract' }]} />
                                                <DatePickerField label="Joining Date" name="joining_date" control={control} />
                                                <DatePickerField label="Contract Start Date" name="contract_start_date" control={control} />
                                                {watch('contract_type') === 'contract' && <DatePickerField label="Contract End Date" name="contract_end_date" control={control} />}
                                                <InputField label="Monthly Salary (PKR)" name="salary" register={register} type="number" />
                                            </div>
                                            <Separator />
                                            <h3 className="text-lg font-semibold">Bank Details</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <InputField label="Bank Name" name="bank_name" register={register} />
                                                <InputField label="Account Number" name="bank_account_no" register={register} />
                                                <InputField label="Branch" name="bank_branch" register={register} />
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}

                    {/* Documents Tab (same as before) */}
                    <TabsContent value="documents">
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">Documents</h3>
                                    <Button type="button" variant="outline" size="sm" onClick={addDocument}><Upload className="h-4 w-4 mr-2" /> Add Document</Button>
                                </div>
                                {(!watchDocuments || watchDocuments.length === 0) ? (
                                    <div className="text-center py-8 border-2 border-dashed rounded-lg"><p className="text-muted-foreground">No documents uploaded</p></div>
                                ) : (
                                    <div className="space-y-4">
                                        {watchDocuments.map((doc, idx) => (
                                            <div key={idx} className="border rounded-lg p-4 relative">
                                                <Button type="button" variant="ghost" size="sm" className="absolute top-2 right-2 text-destructive" onClick={() => removeDocument(idx)}><X className="h-4 w-4" /></Button>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                                    <SelectField label="Document Type" name={`documents.${idx}.type`} control={control} error={errors.documents?.[idx]?.type} options={DOCUMENT_TYPES} onChange={(val) => handleDocumentTypeChange(idx, val)} />
                                                    <InputField label="Title" name={`documents.${idx}.title`} register={register} error={errors.documents?.[idx]?.title} />
                                                </div>
                                                {showCustomType[idx] && <div className="mb-3"><InputField label="Specify Type" name={`documents.${idx}.customType`} register={register} /></div>}
                                                <div>
                                                    <Label>Upload File</Label>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <input type="file" id={`doc-${idx}`} className="hidden" onChange={(e) => handleDocumentUpload(e, idx)} />
                                                        <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById(`doc-${idx}`).click()}><Upload className="h-4 w-4 mr-2" /> {uploadingFiles[idx] || 'Choose File'}</Button>
                                                        {doc.file_url && !uploadingFiles[idx] && <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-blue-600 text-sm">View</a>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="submit" disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes</Button>
                </div>
            </form>
        </div>
    );
}