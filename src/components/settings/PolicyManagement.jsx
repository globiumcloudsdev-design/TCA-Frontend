// // src/components/settings/PolicyManagement.jsx
// 'use client';

// import { useState, useMemo } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { Plus, Edit, Trash2, Eye, CheckCircle, XCircle, RefreshCw, QrCode, Barcode, Settings, Info, User, Users } from 'lucide-react';
// import { toast } from 'sonner';

// import { policyService } from '@/services/policyService';
// import { POLICY_TYPES, POLICY_TYPE_LABELS, POLICY_TYPE_ICONS, POLICY_CONFIG_TEMPLATES, getFieldsByCardType, getCardConfigByType } from '@/constants/policy.constants';
// import useAuthStore from '@/store/authStore';
// import DataTable from '@/components/common/DataTable';
// import PageHeader from '@/components/common/PageHeader';
// import AppModal from '@/components/common/AppModal';
// import SelectField from '@/components/common/SelectField';
// import { cn } from '@/lib/utils';
// import IDCardViewer from '../common/IDCard';
// // import { IDCardPreviewWithControls } from '@/components/common/IDCard';

// // ==================== MAIN ID CARD PREVIEW (Wrapper) ====================
// // const IDCardPreview = ({ config }) => {
// //   const cardType = config?.card_type || 'staff';
  
// //   // Extract design from config
// //   const design = {
// //     background_color: config.design?.background_color,
// //     accent_color: config.design?.accent_color,
// //     text_color: config.design?.text_color,
// //     border_radius: config.design?.border_radius,
// //     show_border: config.design?.show_border,
// //     border_color: config.design?.border_color,
// //     photo_border_radius: config.design?.photo_border_radius || '12px',
// //     card_shadow: config.design?.card_shadow
// //   };

// //   // Extract school info
// //   const schoolInfo = {
// //     name: config.school_info?.name,
// //     tagline: config.school_info?.tagline,
// //     phone: config.school_info?.phone,
// //     email: config.school_info?.email
// //   };

// //   // Get sample data based on card type
// //   const sampleData = cardType === 'staff' ? {
// //     full_name: 'Sajood Ali',
// //     designation: 'Senior Teacher',
// //     employee_id: 'TCH-2024-001',
// //     department: 'Science Department',
// //     blood_group: 'O+',
// //     valid_upto: '31 Dec 2025',
// //     phone: '+92-123-456-7890',
// //     email: 'teacher@schoolname.com'
// //   } : {
// //     full_name: 'Shoaib Raza',
// //     class: '10th Grade',
// //     section: 'A',
// //     roll_number: '2024-1001',
// //     blood_group: 'B+',
// //     dob: '15 May 2010',
// //     parent_name: 'Mr. Nasir Parekh',
// //     parent_contact: '+92-987-654-3210',
// //     emergency_contact: '+92-998-877-6655',
// //     address: '123 Green Avenue, Springfield'
// //   };

// //   return (
// //     <div className="rounded-lg border bg-white p-4 shadow-sm">
// //       <div className="mb-3 flex items-center justify-between">
// //         <h4 className="text-sm font-semibold flex items-center gap-2">
// //           {cardType === 'staff' ? '👨‍🏫' : '👨‍🎓'} 
// //           {cardType === 'staff' ? 'Staff ID Card' : 'Student ID Card'} Preview
// //         </h4>
// //         <span className="text-xs text-muted-foreground">
// //           {config.size || 'CR80'} • {config.layout || 'vertical'}
// //         </span>
// //       </div>

// //       {/* <IDCardPreviewWithControls
// //         type={cardType}
// //         initialData={sampleData}
// //         config={config}
// //         design={design}
// //         schoolInfo={schoolInfo}
// //       /> */}

// //       <IDCardViewer 
// //       // studentData={{ full_name: 'Ahmad Ali', roll_number: 'SCH-001', ... }} 
// //       studentData={sampleData}
// //               config={config}

// //       />

// //       {/* Instructions */}
// //       {config.card_instructions?.enabled && config.card_instructions?.text && (
// //         <div className="mt-3 text-center text-[9px] text-muted-foreground bg-amber-50 p-2 rounded-md">
// //           <Info size={12} className="inline mr-1 text-amber-600" />
// //           {config.card_instructions.text}
// //         </div>
// //       )}
// //     </div>
// //   );
// // };
// // Replace the IDCardPreview component with this:

// const IDCardPreview = ({ config }) => {
//   const cardType = config?.card_type || 'student';
  
//   // Get sample data based on card type
//   const sampleData = {
//     full_name: 'Marsha Williams',
//     parent_name: 'James Williams',
//     roll_number: 'SCH-1234-567',
//     class: '2',
//     section: 'A',
//     blood_group: 'O+',
//     dob: '15 May 2012',
//   };

//   return (
//     <div className="rounded-lg border bg-white p-4 shadow-sm">
//       <div className="mb-3 flex items-center justify-between">
//         <h4 className="text-sm font-semibold flex items-center gap-2">
//           {cardType === 'staff' ? '👨‍🏫' : '👨‍🎓'} 
//           {cardType === 'staff' ? 'Staff ID Card' : 'Student ID Card'} Preview
//         </h4>
//         <span className="text-xs text-muted-foreground">
//           {config.size || 'CR80'} • {config.layout || 'vertical'}
//         </span>
//       </div>

//       <IDCardViewer 
//         studentData={sampleData}
//         policyOverride={{ 
//           config: config,
//           policy_name: 'Preview Policy',
//           version: 1
//         }}
//       />

//       {/* Instructions */}
//       {config.card_instructions?.enabled && config.card_instructions?.text && (
//         <div className="mt-3 text-center text-[9px] text-muted-foreground bg-amber-50 p-2 rounded-md">
//           <Info size={12} className="inline mr-1 text-amber-600" />
//           {config.card_instructions.text}
//         </div>
//       )}
//     </div>
//   );
// };

// // ==================== SALARY STRUCTURE EXPLANATION ====================
// const SalaryStructureExplanation = ({ config }) => {
//   const basicPercentage = config.salary_calculation?.basic_percentage || 50;
//   const allowances = config.salary_calculation?.allowances || [];
//   const totalAllowancePercentage = allowances.reduce((sum, a) => sum + (a.percentage || 0), 0);
//   const remainingPercentage = 100 - basicPercentage - totalAllowancePercentage;

//   return (
//     <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm">
//       <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
//         <Settings size={14} /> Salary Calculation Explanation
//       </h4>
//       <div className="space-y-2 text-blue-700">
//         <p className="text-xs">
//           <strong>Formula:</strong> Total Salary = Basic Salary + All Allowances
//         </p>
//         <div className="bg-white rounded p-2 text-xs">
//           <p><strong>Example:</strong> Agar teacher ki total salary = 50,000 hai</p>
//           <ul className="list-disc list-inside ml-2 space-y-1 mt-1">
//             <li>Basic Salary ({basicPercentage}%) = 50,000 × {basicPercentage}% = {(50000 * basicPercentage / 100).toLocaleString()} Rs</li>
//             {allowances.map((a, i) => (
//               <li key={i}>{a.name} ({a.percentage}%) = 50,000 × {a.percentage}% = {(50000 * a.percentage / 100).toLocaleString()} Rs</li>
//             ))}
//             {remainingPercentage > 0 && (
//               <li>Other/Remaining ({remainingPercentage}%) = {(50000 * remainingPercentage / 100).toLocaleString()} Rs</li>
//             )}
//             <li className="font-bold mt-1">Total = {basicPercentage + totalAllowancePercentage}% = 50,000 Rs ✅</li>
//           </ul>
//         </div>
//         <p className="text-xs mt-1">
//           💡 <strong>Note:</strong> Teacher entry time pe sirf <strong>Total Salary</strong> dalni hai. Allowances automatically calculate ho jayengi policy ke mutabiq.
//         </p>
//       </div>
//     </div>
//   );
// };

// // ==================== POLICY TYPE OPTIONS ====================
// const POLICY_TYPE_OPTIONS = [
//   { value: POLICY_TYPES.ID_CARD, label: POLICY_TYPE_LABELS[POLICY_TYPES.ID_CARD] },
//   { value: POLICY_TYPES.PAYROLL, label: POLICY_TYPE_LABELS[POLICY_TYPES.PAYROLL] }
// ];

// const CARD_TYPE_OPTIONS = [
//   { value: 'staff', label: '👨‍🏫 Staff ID Card' },
//   { value: 'student', label: '👨‍🎓 Student ID Card' }
// ];

// const EMPTY_FORM = {
//   policy_type: '',
//   policy_name: '',
//   description: '',
//   config: {},
//   branch_id: null,
//   is_active: true
// };

// // ==================== MAIN COMPONENT ====================
// export default function PolicyManagement() {
//   const canDo = useAuthStore((s) => s.canDo);
//   const institute = useAuthStore((s) => s.getInstitute());
//   const queryClient = useQueryClient();

//   // State
//   const [search, setSearch] = useState('');
//   const [policyTypeFilter, setPolicyTypeFilter] = useState('');
//   const [statusFilter, setStatusFilter] = useState('');
//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);

//   // Modal states
//   const [formModalOpen, setFormModalOpen] = useState(false);
//   const [viewModalOpen, setViewModalOpen] = useState(false);
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [formStep, setFormStep] = useState(1);

//   // Selected items
//   const [editingPolicy, setEditingPolicy] = useState(null);
//   const [viewingPolicy, setViewingPolicy] = useState(null);
//   const [deletingPolicy, setDeletingPolicy] = useState(null);

//   // Form state
//   const [form, setForm] = useState(EMPTY_FORM);

//   // Fetch policies
//   const { data: policiesData, isLoading, refetch } = useQuery({
//     queryKey: ['policies', page, pageSize, search, policyTypeFilter, statusFilter],
//     queryFn: () => policyService.getAll({
//       page,
//       limit: pageSize,
//       search: search || undefined,
//       policy_type: policyTypeFilter || undefined,
//       is_active: statusFilter !== '' ? statusFilter === 'active' : undefined,
//       institute_id: institute?.id
//     }),
//     enabled: !!institute?.id
//   });

//   const policies = policiesData?.data || [];
//   const total = policiesData?.pagination?.total || 0;
//   const totalPages = policiesData?.pagination?.totalPages || 1;

//   // Mutations
//   const createMutation = useMutation({
//     mutationFn: policyService.create,
//     onSuccess: () => {
//       queryClient.invalidateQueries(['policies']);
//       toast.success('🎉 Policy created successfully!');
//       closeFormModal();
//     },
//     onError: (error) => {
//       toast.error(error?.response?.data?.message || 'Failed to create policy');
//     }
//   });

//   const updateMutation = useMutation({
//     mutationFn: ({ id, data }) => policyService.update(id, data),
//     onSuccess: () => {
//       queryClient.invalidateQueries(['policies']);
//       toast.success('✅ Policy updated successfully!');
//       closeFormModal();
//     },
//     onError: (error) => {
//       toast.error(error?.response?.data?.message || 'Failed to update policy');
//     }
//   });

//   const deleteMutation = useMutation({
//     mutationFn: policyService.delete,
//     onSuccess: () => {
//       queryClient.invalidateQueries(['policies']);
//       toast.success('🗑️ Policy deleted successfully');
//       setDeleteModalOpen(false);
//       setDeletingPolicy(null);
//     },
//     onError: (error) => {
//       toast.error(error?.response?.data?.message || 'Failed to delete policy');
//     }
//   });

//   const toggleStatusMutation = useMutation({
//     mutationFn: ({ id, isActive }) => policyService.toggleStatus(id, isActive),
//     onSuccess: (_, { isActive }) => {
//       queryClient.invalidateQueries(['policies']);
//       toast.success(`✅ Policy ${isActive ? 'activated' : 'deactivated'}`);
//     },
//     onError: (error) => {
//       toast.error(error?.response?.data?.message || 'Failed to toggle policy status');
//     }
//   });

//   // Form handlers
//   const resetForm = () => {
//     setForm(EMPTY_FORM);
//     setFormStep(1);
//     setEditingPolicy(null);
//   };

//   const openAdd = () => {
//     resetForm();
//     setFormModalOpen(true);
//   };

//   const openEdit = (policy) => {
//     setEditingPolicy(policy);
//     setFormStep(1);
//     setForm({
//       policy_type: policy.policy_type,
//       policy_name: policy.policy_name,
//       description: policy.description || '',
//       config: policy.config,
//       branch_id: policy.branch_id,
//       is_active: policy.is_active
//     });
//     setFormModalOpen(true);
//   };

//   const openView = (policy) => {
//     setViewingPolicy(policy);
//     setViewModalOpen(true);
//   };

//   const closeFormModal = () => {
//     setFormModalOpen(false);
//     resetForm();
//   };

//   const handleNextStep = () => {
//     if (!form.policy_type) {
//       toast.error('Please select a Policy Type');
//       return;
//     }
//     if (!form.policy_name || form.policy_name.trim() === '') {
//       toast.error('Please enter a Policy Name');
//       return;
//     }
//     setFormStep(2);
//   };

//   const handlePrevStep = () => {
//     setFormStep(1);
//   };

//   const onSave = (e) => {
//     e.preventDefault();

//     if (!form.policy_type || !form.policy_name) {
//       toast.error('Please fill all required fields');
//       return;
//     }

//     if (editingPolicy) {
//       const updatePayload = {
//         policy_name: form.policy_name,
//         description: form.description,
//         config: form.config,
//         branch_id: form.branch_id,
//         is_active: form.is_active
//       };
//       updateMutation.mutate({ id: editingPolicy.id, data: updatePayload });
//     } else {
//       const createPayload = {
//         ...form,
//         institute_id: institute?.id,
//         config: form.config || POLICY_CONFIG_TEMPLATES[form.policy_type] || {}
//       };
//       createMutation.mutate(createPayload);
//     }
//   };

//   const onDelete = () => {
//     if (deletingPolicy) {
//       deleteMutation.mutate(deletingPolicy.id);
//     }
//   };

//   const handleToggleStatus = (policy) => {
//     toggleStatusMutation.mutate({
//       id: policy.id,
//       isActive: !policy.is_active
//     });
//   };

//   // ==================== ID CARD CONFIG FORM ====================
//   const renderIDCardConfig = () => {
//     const config = form.config || POLICY_CONFIG_TEMPLATES[POLICY_TYPES.ID_CARD];
//     const currentCardType = config.card_type || 'staff';
//     const currentFields = currentCardType === 'staff' 
//       ? (config.staff_config?.fields || getFieldsByCardType('staff'))
//       : (config.student_config?.fields || getFieldsByCardType('student'));

//     return (
//       <div className="space-y-6">
//         <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
//           {/* Left Side - Settings */}
//           <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
//             {/* Card Type Selection */}
//             <div className="border-b pb-3">
//               <h3 className="font-semibold mb-3 flex items-center gap-2">
//                 <span className="text-lg">🎫</span> Card Type
//               </h3>
//               <SelectField
//                 label="Select Card Type"
//                 value={currentCardType}
//                 onChange={(v) => {
//                   const newConfig = { ...config, card_type: v };
//                   // Reset fields based on card type
//                   if (v === 'staff') {
//                     newConfig.staff_config = {
//                       ...config.staff_config,
//                       fields: getFieldsByCardType('staff')
//                     };
//                   } else {
//                     newConfig.student_config = {
//                       ...config.student_config,
//                       fields: getFieldsByCardType('student')
//                     };
//                   }
//                   setForm({ ...form, config: newConfig });
//                 }}
//                 options={CARD_TYPE_OPTIONS}
//               />
//             </div>

//             {/* Basic Settings */}
//             <div className="border-b pb-3">
//               <h3 className="font-semibold mb-3">Basic Settings</h3>
//               <SelectField
//                 label="Layout"
//                 value={config.layout || 'vertical'}
//                 onChange={(v) => setForm({ ...form, config: { ...config, layout: v } })}
//                 options={[
//                   { value: 'horizontal', label: 'Horizontal' },
//                   { value: 'vertical', label: 'Vertical' }
//                 ]}
//               />
//               <SelectField
//                 label="Card Size"
//                 value={config.size || 'CR80'}
//                 onChange={(v) => setForm({ ...form, config: { ...config, size: v } })}
//                 options={[
//                   { value: 'CR80', label: 'CR80 (Standard - 85.6mm x 54mm)' },
//                   { value: 'A4', label: 'A4 (Print Friendly)' }
//                 ]}
//               />
//             </div>

//             {/* School Info */}
//             <div className="border-b pb-3">
//               <h3 className="font-semibold mb-3">🏫 School Information</h3>
//               <div className="space-y-2">
//                 <input
//                   type="text"
//                   value={config.school_info?.name || 'Green Valley High School'}
//                   onChange={(e) => setForm({
//                     ...form,
//                     config: {
//                       ...config,
//                       school_info: { ...config.school_info, name: e.target.value }
//                     }
//                   })}
//                   className="input-base text-sm"
//                   placeholder="School Name"
//                 />
//                 <input
//                   type="text"
//                   value={config.school_info?.tagline || 'Excellence in Education'}
//                   onChange={(e) => setForm({
//                     ...form,
//                     config: {
//                       ...config,
//                       school_info: { ...config.school_info, tagline: e.target.value }
//                     }
//                   })}
//                   className="input-base text-sm"
//                   placeholder="Tagline / Motto"
//                 />
//               </div>
//             </div>

//             {/* Design Settings */}
//             <div className="border-b pb-3">
//               <h3 className="font-semibold mb-3">🎨 Design Settings</h3>
//               <div className="space-y-2">
//                 <label className="text-sm font-medium">Background Color</label>
//                 <input
//                   type="color"
//                   value={config.design?.background_color || '#1a1a2e'}
//                   onChange={(e) => setForm({
//                     ...form,
//                     config: { ...config, design: { ...config.design, background_color: e.target.value } }
//                   })}
//                   className="input-base h-10"
//                 />
//               </div>
//               <div className="space-y-2 mt-2">
//                 <label className="text-sm font-medium">Accent Color</label>
//                 <input
//                   type="color"
//                   value={config.design?.accent_color || '#e94560'}
//                   onChange={(e) => setForm({
//                     ...form,
//                     config: { ...config, design: { ...config.design, accent_color: e.target.value } }
//                   })}
//                   className="input-base h-10"
//                 />
//               </div>
//               <div className="space-y-2 mt-2">
//                 <label className="text-sm font-medium">Border Radius (px)</label>
//                 <input
//                   type="number"
//                   value={parseInt(config.design?.border_radius) || 16}
//                   onChange={(e) => setForm({
//                     ...form,
//                     config: { ...config, design: { ...config.design, border_radius: `${e.target.value}px` } }
//                   })}
//                   className="input-base text-sm"
//                 />
//               </div>
//               <div className="flex items-center gap-3 mt-2">
//                 <label className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     checked={config.design?.show_border !== false}
//                     onChange={(e) => setForm({
//                       ...form,
//                       config: { ...config, design: { ...config.design, show_border: e.target.checked } }
//                     })}
//                   />
//                   <span className="text-sm">Show Border</span>
//                 </label>
//                 <label className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     checked={config.design?.card_shadow !== false}
//                     onChange={(e) => setForm({
//                       ...form,
//                       config: { ...config, design: { ...config.design, card_shadow: e.target.checked } }
//                     })}
//                   />
//                   <span className="text-sm">Card Shadow</span>
//                 </label>
//                 <label className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     checked={config.show_watermark !== false}
//                     onChange={(e) => setForm({
//                       ...form,
//                       config: { ...config, show_watermark: e.target.checked }
//                     })}
//                   />
//                   <span className="text-sm">Watermark</span>
//                 </label>
//               </div>
//             </div>

//             {/* Fields Configuration - Dynamic based on card type */}
//             <div className="border-b pb-3">
//               <h3 className="font-semibold mb-3 flex items-center gap-2">
//                 <span>📋</span> Card Fields
//                 <span className="text-xs text-muted-foreground">
//                   ({currentCardType === 'staff' ? 'Staff Fields' : 'Student Fields'})
//                 </span>
//               </h3>
//               <div className="space-y-2">
//                 {currentFields.map((field, idx) => (
//                   <div key={idx} className="flex items-center justify-between">
//                     <label className="flex items-center gap-2 text-sm">
//                       <input
//                         type="checkbox"
//                         checked={field.visible}
//                         onChange={(e) => {
//                           const newFields = [...currentFields];
//                           newFields[idx] = { ...newFields[idx], visible: e.target.checked };
                          
//                           if (currentCardType === 'staff') {
//                             setForm({
//                               ...form,
//                               config: {
//                                 ...config,
//                                 staff_config: { ...config.staff_config, fields: newFields }
//                               }
//                             });
//                           } else {
//                             setForm({
//                               ...form,
//                               config: {
//                                 ...config,
//                                 student_config: { ...config.student_config, fields: newFields }
//                               }
//                             });
//                           }
//                         }}
//                       />
//                       <span>{field.label}</span>
//                     </label>
//                     {field.required && <span className="text-xs text-red-500">Required</span>}
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Terms & Conditions Section */}
// <div className="border-b pb-3">
//   <h3 className="font-semibold mb-3 flex items-center gap-2">
//     <span>📜</span> Terms & Conditions
//   </h3>
//   <p className="text-xs text-muted-foreground mb-2">
//     Add terms that will appear on the back of the ID card
//   </p>
//   <div className="space-y-2">
//     {(config.terms_list || []).map((term, idx) => (
//       <div key={idx} className="flex gap-2 items-start">
//         <textarea
//           value={term}
//           onChange={(e) => {
//             const newTerms = [...(config.terms_list || [])];
//             newTerms[idx] = e.target.value;
//             setForm({ ...form, config: { ...config, terms_list: newTerms } });
//           }}
//           className="input-base text-sm flex-1"
//           placeholder={`Term ${idx + 1}`}
//           rows={1}
//         />
//         <button
//           type="button"
//           onClick={() => {
//             const newTerms = (config.terms_list || []).filter((_, i) => i !== idx);
//             setForm({ ...form, config: { ...config, terms_list: newTerms } });
//           }}
//           className="text-destructive hover:bg-destructive/10 rounded p-1 mt-1"
//         >
//           ✕
//         </button>
//       </div>
//     ))}
//     <button
//       type="button"
//       onClick={() => {
//         const newTerms = [...(config.terms_list || []), ''];
//         setForm({ ...form, config: { ...config, terms_list: newTerms } });
//       }}
//       className="text-xs text-primary hover:underline"
//     >
//       + Add Term & Condition
//     </button>
//   </div>
// </div>

// {/* QR Code Settings - Update this section */}
// <div>
//   <h3 className="font-semibold mb-3 flex items-center gap-2">
//     <QrCode size={14} /> QR Code Settings
//   </h3>
//   <label className="flex items-center gap-2">
//     <input
//       type="checkbox"
//       checked={config.qr_enabled || false}
//       onChange={(e) => setForm({ ...form, config: { ...config, qr_enabled: e.target.checked } })}
//     />
//     <span>Show QR Code on Back Side</span>
//   </label>
//   <p className="text-xs text-muted-foreground mt-1">
//     QR code will appear on the back of the ID card
//   </p>
// </div>

// {/* Watermark Settings */}
// <div className="mt-3">
//   <label className="flex items-center gap-2">
//     <input
//       type="checkbox"
//       checked={config.show_watermark !== false}
//       onChange={(e) => setForm({ ...form, config: { ...config, show_watermark: e.target.checked } })}
//     />
//     <span>Show Watermark on Card</span>
//   </label>
//   <p className="text-xs text-muted-foreground mt-1">
//     Watermark (school name) will appear on front card
//   </p>
// </div>

//             {/* Custom Text Fields */}
//             <div className="border-b pb-3">
//               <h3 className="font-semibold mb-3">✏️ Custom Text/Notes</h3>
//               <div className="space-y-2">
//                 {(currentCardType === 'staff' 
//                   ? (config.staff_config?.custom_texts || [])
//                   : (config.student_config?.custom_texts || [])
//                 ).map((text, idx) => (
//                   <div key={idx} className="flex gap-2 items-start">
//                     <div className="flex-1">
//                       <input
//                         type="text"
//                         value={text.label}
//                         onChange={(e) => {
//                           const newTexts = [...(currentCardType === 'staff' 
//                             ? (config.staff_config?.custom_texts || [])
//                             : (config.student_config?.custom_texts || [])
//                           )];
//                           newTexts[idx] = { ...newTexts[idx], label: e.target.value };
                          
//                           if (currentCardType === 'staff') {
//                             setForm({
//                               ...form,
//                               config: {
//                                 ...config,
//                                 staff_config: { ...config.staff_config, custom_texts: newTexts }
//                               }
//                             });
//                           } else {
//                             setForm({
//                               ...form,
//                               config: {
//                                 ...config,
//                                 student_config: { ...config.student_config, custom_texts: newTexts }
//                               }
//                             });
//                           }
//                         }}
//                         placeholder="Label"
//                         className="input-base text-sm mb-1"
//                       />
//                       <input
//                         type="text"
//                         value={text.value}
//                         onChange={(e) => {
//                           const newTexts = [...(currentCardType === 'staff' 
//                             ? (config.staff_config?.custom_texts || [])
//                             : (config.student_config?.custom_texts || [])
//                           )];
//                           newTexts[idx] = { ...newTexts[idx], value: e.target.value };
                          
//                           if (currentCardType === 'staff') {
//                             setForm({
//                               ...form,
//                               config: {
//                                 ...config,
//                                 staff_config: { ...config.staff_config, custom_texts: newTexts }
//                               }
//                             });
//                           } else {
//                             setForm({
//                               ...form,
//                               config: {
//                                 ...config,
//                                 student_config: { ...config.student_config, custom_texts: newTexts }
//                               }
//                             });
//                           }
//                         }}
//                         placeholder="Value"
//                         className="input-base text-sm"
//                       />
//                     </div>
//                     <label className="flex items-center gap-1 mt-1">
//                       <input
//                         type="checkbox"
//                         checked={text.visible}
//                         onChange={(e) => {
//                           const newTexts = [...(currentCardType === 'staff' 
//                             ? (config.staff_config?.custom_texts || [])
//                             : (config.student_config?.custom_texts || [])
//                           )];
//                           newTexts[idx] = { ...newTexts[idx], visible: e.target.checked };
                          
//                           if (currentCardType === 'staff') {
//                             setForm({
//                               ...form,
//                               config: {
//                                 ...config,
//                                 staff_config: { ...config.staff_config, custom_texts: newTexts }
//                               }
//                             });
//                           } else {
//                             setForm({
//                               ...form,
//                               config: {
//                                 ...config,
//                                 student_config: { ...config.student_config, custom_texts: newTexts }
//                               }
//                             });
//                           }
//                         }}
//                       />
//                       <span className="text-xs">Show</span>
//                     </label>
//                     <button
//                       type="button"
//                       onClick={() => {
//                         const newTexts = (currentCardType === 'staff' 
//                           ? (config.staff_config?.custom_texts || [])
//                           : (config.student_config?.custom_texts || [])
//                         ).filter((_, i) => i !== idx);
                        
//                         if (currentCardType === 'staff') {
//                           setForm({
//                             ...form,
//                             config: {
//                               ...config,
//                               staff_config: { ...config.staff_config, custom_texts: newTexts }
//                             }
//                           });
//                         } else {
//                           setForm({
//                             ...form,
//                             config: {
//                               ...config,
//                               student_config: { ...config.student_config, custom_texts: newTexts }
//                             }
//                           });
//                         }
//                       }}
//                       className="text-destructive hover:bg-destructive/10 rounded p-1 mt-1"
//                     >
//                       ✕
//                     </button>
//                   </div>
//                 ))}
//                 <button
//                   type="button"
//                   onClick={() => {
//                     const newTexts = [...(currentCardType === 'staff' 
//                       ? (config.staff_config?.custom_texts || [])
//                       : (config.student_config?.custom_texts || [])
//                     ), { label: '', value: '', visible: true }];
                    
//                     if (currentCardType === 'staff') {
//                       setForm({
//                         ...form,
//                         config: {
//                           ...config,
//                           staff_config: { ...config.staff_config, custom_texts: newTexts }
//                         }
//                       });
//                     } else {
//                       setForm({
//                         ...form,
//                         config: {
//                           ...config,
//                           student_config: { ...config.student_config, custom_texts: newTexts }
//                         }
//                       });
//                     }
//                   }}
//                   className="text-xs text-primary hover:underline"
//                 >
//                   + Add Custom Text
//                 </button>
//               </div>
//             </div>

//             {/* Footer Text */}
//             <div className="border-b pb-3">
//               <h3 className="font-semibold mb-3">📱 Footer Text</h3>
//               <input
//                 type="text"
//                 value={currentCardType === 'staff' 
//                   ? (config.staff_config?.footer_text || "📞 (123) 456-7890  |  ✉ info@schoolname.com")
//                   : (config.student_config?.footer_text || "👨‍👩 Parent Helpline: (123) 456-7890")
//                 }
//                 onChange={(e) => {
//                   if (currentCardType === 'staff') {
//                     setForm({
//                       ...form,
//                       config: {
//                         ...config,
//                         staff_config: { ...config.staff_config, footer_text: e.target.value }
//                       }
//                     });
//                   } else {
//                     setForm({
//                       ...form,
//                       config: {
//                         ...config,
//                         student_config: { ...config.student_config, footer_text: e.target.value }
//                       }
//                     });
//                   }
//                 }}
//                 className="input-base text-sm"
//                 placeholder="Footer text (contact info, etc.)"
//               />
//             </div>

//             {/* Card Instructions */}
//             <div className="border-b pb-3">
//               <h3 className="font-semibold mb-3 flex items-center gap-2">
//                 <Info size={14} /> Card Instructions
//               </h3>
//               <label className="flex items-center gap-2 mb-2">
//                 <input
//                   type="checkbox"
//                   checked={config.card_instructions?.enabled !== false}
//                   onChange={(e) => setForm({
//                     ...form,
//                     config: { ...config, card_instructions: { ...config.card_instructions, enabled: e.target.checked } }
//                   })}
//                 />
//                 <span>Show Instructions on Card</span>
//               </label>
//               {config.card_instructions?.enabled !== false && (
//                 <>
//                   <textarea
//                     value={config.card_instructions?.text || ''}
//                     onChange={(e) => setForm({
//                       ...form,
//                       config: { ...config, card_instructions: { ...config.card_instructions, text: e.target.value } }
//                     })}
//                     className="input-base min-h-16 text-sm"
//                     placeholder="e.g., This card is the property of the school. Please return if found."
//                     rows={2}
//                   />
//                   <SelectField
//                     label="Instructions Position"
//                     value={config.card_instructions?.position || 'bottom'}
//                     onChange={(v) => setForm({
//                       ...form,
//                       config: { ...config, card_instructions: { ...config.card_instructions, position: v } }
//                     })}
//                     options={[
//                       { value: 'top', label: 'Top of Card' },
//                       { value: 'bottom', label: 'Bottom of Card' }
//                     ]}
//                   />
//                 </>
//               )}
//             </div>

//             {/* Barcode Settings */}
//             <div>
//               <h3 className="font-semibold mb-3 flex items-center gap-2">
//                 <Barcode size={14} /> Barcode
//               </h3>
//               <label className="flex items-center gap-2">
//                 <input
//                   type="checkbox"
//                   checked={config.show_barcode !== false}
//                   onChange={(e) => setForm({ ...form, config: { ...config, show_barcode: e.target.checked } })}
//                 />
//                 <span>Show Barcode on Card</span>
//               </label>
//               <label className="flex items-center gap-2 mt-2">
//                 <input
//                   type="checkbox"
//                   checked={config.show_photo !== false}
//                   onChange={(e) => setForm({ ...form, config: { ...config, show_photo: e.target.checked } })}
//                 />
//                 <span>Show Photo on Card</span>
//               </label>
//             </div>
//           </div>

//           {/* Right Side - Preview */}
//           <div>
//             <IDCardPreview config={config} />
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // ==================== PAYROLL CONFIG FORM ====================
//   const renderPayrollConfig = () => {
//     const config = form.config || POLICY_CONFIG_TEMPLATES[POLICY_TYPES.PAYROLL];

//     return (
//       <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
//         {/* Salary Calculation Method */}
//         <div className="border-b pb-4">
//           <h3 className="font-semibold mb-3">💰 Salary Structure</h3>
//           <p className="text-xs text-muted-foreground mb-4">
//             Configure how teacher's salary is calculated. Teacher entry time pe sirf total salary dalni hai.
//           </p>
          
//           <div className="space-y-4">
//             <div>
//               <label className="text-sm font-medium">Basic Salary Percentage (%)</label>
//               <input
//                 type="number"
//                 min="0"
//                 max="100"
//                 value={config.salary_calculation?.basic_percentage || 50}
//                 onChange={(e) => setForm({
//                   ...form,
//                   config: {
//                     ...config,
//                     salary_calculation: {
//                       ...config.salary_calculation,
//                       basic_percentage: parseInt(e.target.value) || 0
//                     }
//                   }
//                 })}
//                 className="input-base mt-1"
//               />
//               <p className="text-xs text-muted-foreground mt-1">
//                 Basic salary = Total Salary × {config.salary_calculation?.basic_percentage || 50}%
//               </p>
//             </div>

//             <div>
//               <label className="text-sm font-medium mb-2 block">Percentage-Based Allowances</label>
//               <div className="space-y-2 pl-2 border-l-2 border-muted">
//                 {(config.salary_calculation?.allowances || []).map((allowance, idx) => (
//                   <div key={idx} className="flex gap-2 items-center">
//                     <input
//                       type="text"
//                       value={allowance.name}
//                       onChange={(e) => {
//                         const newAllowances = [...(config.salary_calculation?.allowances || [])];
//                         newAllowances[idx] = { ...newAllowances[idx], name: e.target.value };
//                         setForm({
//                           ...form,
//                           config: {
//                             ...config,
//                             salary_calculation: { ...config.salary_calculation, allowances: newAllowances }
//                           }
//                         });
//                       }}
//                       placeholder="Allowance name"
//                       className="input-base text-sm flex-1"
//                     />
//                     <input
//                       type="number"
//                       value={allowance.percentage}
//                       onChange={(e) => {
//                         const newAllowances = [...(config.salary_calculation?.allowances || [])];
//                         newAllowances[idx] = { ...newAllowances[idx], percentage: parseInt(e.target.value) || 0 };
//                         setForm({
//                           ...form,
//                           config: {
//                             ...config,
//                             salary_calculation: { ...config.salary_calculation, allowances: newAllowances }
//                           }
//                         });
//                       }}
//                       placeholder="%"
//                       className="input-base text-sm w-24"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => {
//                         const newAllowances = (config.salary_calculation?.allowances || []).filter((_, i) => i !== idx);
//                         setForm({
//                           ...form,
//                           config: {
//                             ...config,
//                             salary_calculation: { ...config.salary_calculation, allowances: newAllowances }
//                           }
//                         });
//                       }}
//                       className="text-destructive hover:bg-destructive/10 rounded p-1"
//                     >
//                       ✕
//                     </button>
//                   </div>
//                 ))}
//                 <button
//                   type="button"
//                   onClick={() => {
//                     const newAllowances = [...(config.salary_calculation?.allowances || []), { name: '', percentage: 0, is_taxable: false }];
//                     setForm({
//                       ...form,
//                       config: {
//                         ...config,
//                         salary_calculation: { ...config.salary_calculation, allowances: newAllowances }
//                       }
//                     });
//                   }}
//                   className="text-xs text-primary hover:underline"
//                 >
//                   + Add Percentage Allowance
//                 </button>
//               </div>
//             </div>

//             <div>
//               <label className="text-sm font-medium mb-2 block">Fixed Allowances</label>
//               <div className="space-y-2 pl-2 border-l-2 border-muted">
//                 {(config.salary_calculation?.fixed_allowances || []).map((allowance, idx) => (
//                   <div key={idx} className="flex gap-2 items-center">
//                     <input
//                       type="text"
//                       value={allowance.name}
//                       onChange={(e) => {
//                         const newAllowances = [...(config.salary_calculation?.fixed_allowances || [])];
//                         newAllowances[idx] = { ...newAllowances[idx], name: e.target.value };
//                         setForm({
//                           ...form,
//                           config: {
//                             ...config,
//                             salary_calculation: { ...config.salary_calculation, fixed_allowances: newAllowances }
//                           }
//                         });
//                       }}
//                       placeholder="Allowance name"
//                       className="input-base text-sm flex-1"
//                     />
//                     <input
//                       type="number"
//                       value={allowance.amount}
//                       onChange={(e) => {
//                         const newAllowances = [...(config.salary_calculation?.fixed_allowances || [])];
//                         newAllowances[idx] = { ...newAllowances[idx], amount: parseInt(e.target.value) || 0 };
//                         setForm({
//                           ...form,
//                           config: {
//                             ...config,
//                             salary_calculation: { ...config.salary_calculation, fixed_allowances: newAllowances }
//                           }
//                         });
//                       }}
//                       placeholder="Amount"
//                       className="input-base text-sm w-24"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => {
//                         const newAllowances = (config.salary_calculation?.fixed_allowances || []).filter((_, i) => i !== idx);
//                         setForm({
//                           ...form,
//                           config: {
//                             ...config,
//                             salary_calculation: { ...config.salary_calculation, fixed_allowances: newAllowances }
//                           }
//                         });
//                       }}
//                       className="text-destructive hover:bg-destructive/10 rounded p-1"
//                     >
//                       ✕
//                     </button>
//                   </div>
//                 ))}
//                 <button
//                   type="button"
//                   onClick={() => {
//                     const newAllowances = [...(config.salary_calculation?.fixed_allowances || []), { name: '', amount: 0, is_taxable: false }];
//                     setForm({
//                       ...form,
//                       config: {
//                         ...config,
//                         salary_calculation: { ...config.salary_calculation, fixed_allowances: newAllowances }
//                       }
//                     });
//                   }}
//                   className="text-xs text-primary hover:underline"
//                 >
//                   + Add Fixed Allowance
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Salary Explanation */}
//           <SalaryStructureExplanation config={config} />
//         </div>

//         {/* Attendance & Deduction Rules */}
//         <div className="border-b pb-4">
//           <h3 className="font-semibold mb-3 flex items-center gap-2">
//             <span className="text-amber-600">⏱️</span> Attendance & Deduction Rules
//           </h3>
//           <p className="text-xs text-muted-foreground mb-4">
//             As per school policy: 3 late arrivals = 1 day salary deduction
//           </p>

//           {/* Late Arrival */}
//           <div className="mb-4 rounded-lg border p-3">
//             <label className="flex items-center gap-2 font-medium">
//               <input
//                 type="checkbox"
//                 checked={config.attendance_rules?.late_arrival?.enabled ?? true}
//                 onChange={(e) => setForm({
//                   ...form,
//                   config: {
//                     ...config,
//                     attendance_rules: {
//                       ...config.attendance_rules,
//                       late_arrival: { ...config.attendance_rules?.late_arrival, enabled: e.target.checked }
//                     }
//                   }
//                 })}
//               />
//               <span>Late Arrival Penalty</span>
//             </label>
//             {config.attendance_rules?.late_arrival?.enabled !== false && (
//               <div className="ml-6 mt-2 space-y-2">
//                 <div className="flex gap-2">
//                   <div>
//                     <label className="text-xs">Threshold (late arrivals/month)</label>
//                     <input
//                       type="number"
//                       value={config.attendance_rules?.late_arrival?.threshold_count ?? 3}
//                       onChange={(e) => setForm({
//                         ...form,
//                         config: {
//                           ...config,
//                           attendance_rules: {
//                             ...config.attendance_rules,
//                             late_arrival: { ...config.attendance_rules?.late_arrival, threshold_count: parseInt(e.target.value) || 1 }
//                           }
//                         }
//                       })}
//                       className="input-base text-sm w-24"
//                     />
//                   </div>
//                   <div>
//                     <label className="text-xs">Deduction</label>
//                     <select
//                       value={config.attendance_rules?.late_arrival?.deduction_type ?? 'daily_salary'}
//                       onChange={(e) => setForm({
//                         ...form,
//                         config: {
//                           ...config,
//                           attendance_rules: {
//                             ...config.attendance_rules,
//                             late_arrival: { ...config.attendance_rules?.late_arrival, deduction_type: e.target.value }
//                           }
//                         }
//                       })}
//                       className="input-base text-sm"
//                     >
//                       <option value="daily_salary">1 Day Salary</option>
//                       <option value="fixed_amount">Fixed Amount</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Full Day Absence */}
//           <div className="mb-4 rounded-lg border p-3">
//             <label className="flex items-center gap-2 font-medium">
//               <input
//                 type="checkbox"
//                 checked={config.attendance_rules?.full_day_absent?.enabled ?? true}
//                 onChange={(e) => setForm({
//                   ...form,
//                   config: {
//                     ...config,
//                     attendance_rules: {
//                       ...config.attendance_rules,
//                       full_day_absent: { ...config.attendance_rules?.full_day_absent, enabled: e.target.checked }
//                     }
//                   }
//                 })}
//               />
//               <span>Full Day Absence (Without Approved Leave)</span>
//             </label>
//           </div>

//           {/* Half Day Leave */}
//           <div className="rounded-lg border p-3">
//             <label className="flex items-center gap-2 font-medium">
//               <input
//                 type="checkbox"
//                 checked={config.attendance_rules?.half_day_absent?.enabled ?? true}
//                 onChange={(e) => setForm({
//                   ...form,
//                   config: {
//                     ...config,
//                     attendance_rules: {
//                       ...config.attendance_rules,
//                       half_day_absent: { ...config.attendance_rules?.half_day_absent, enabled: e.target.checked }
//                     }
//                   }
//                 })}
//               />
//               <span>Half Day Leave (Deduct Half Day Salary)</span>
//             </label>
//           </div>
//         </div>

//         {/* Other Deductions */}
//         <div className="border-b pb-4">
//           <h3 className="font-semibold mb-3">📉 Other Deductions (Tax, PF, etc.)</h3>
//           <div className="space-y-2">
//             {(config.other_deductions || []).map((deduction, idx) => (
//               <div key={idx} className="flex gap-2 items-center">
//                 <input
//                   type="text"
//                   value={deduction.name}
//                   onChange={(e) => {
//                     const newDeductions = [...(config.other_deductions || [])];
//                     newDeductions[idx] = { ...newDeductions[idx], name: e.target.value };
//                     setForm({ ...form, config: { ...config, other_deductions: newDeductions } });
//                   }}
//                   placeholder="Deduction name"
//                   className="input-base text-sm flex-1"
//                 />
//                 <input
//                   type="number"
//                   value={deduction.amount || deduction.percentage}
//                   onChange={(e) => {
//                     const newDeductions = [...(config.other_deductions || [])];
//                     if (deduction.percentage !== undefined) {
//                       newDeductions[idx] = { ...newDeductions[idx], percentage: parseInt(e.target.value) || 0 };
//                     } else {
//                       newDeductions[idx] = { ...newDeductions[idx], amount: parseInt(e.target.value) || 0 };
//                     }
//                     setForm({ ...form, config: { ...config, other_deductions: newDeductions } });
//                   }}
//                   placeholder={deduction.percentage !== undefined ? "Percentage %" : "Amount"}
//                   className="input-base text-sm w-24"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => {
//                     const newDeductions = (config.other_deductions || []).filter((_, i) => i !== idx);
//                     setForm({ ...form, config: { ...config, other_deductions: newDeductions } });
//                   }}
//                   className="text-destructive hover:bg-destructive/10 rounded p-1"
//                 >
//                   ✕
//                 </button>
//               </div>
//             ))}
//             <button
//               type="button"
//               onClick={() => {
//                 const newDeductions = [...(config.other_deductions || []), { name: '', amount: 0, is_mandatory: true }];
//                 setForm({ ...form, config: { ...config, other_deductions: newDeductions } });
//               }}
//               className="text-xs text-primary hover:underline"
//             >
//               + Add Deduction
//             </button>
//           </div>
//         </div>

//         {/* Overtime */}
//         <div>
//           <h3 className="font-semibold mb-3">⏰ Overtime Settings</h3>
//           <label className="flex items-center gap-2">
//             <input
//               type="checkbox"
//               checked={config.overtime?.enabled || false}
//               onChange={(e) => setForm({
//                 ...form,
//                 config: { ...config, overtime: { ...config.overtime, enabled: e.target.checked } }
//               })}
//             />
//             <span>Enable Overtime</span>
//           </label>
//           {config.overtime?.enabled && (
//             <div className="ml-6 mt-2 space-y-2">
//               <div>
//                 <label className="text-sm font-medium">Rate per Hour (₨)</label>
//                 <input
//                   type="number"
//                   value={config.overtime?.rate_per_hour || 200}
//                   onChange={(e) => setForm({
//                     ...form,
//                     config: { ...config, overtime: { ...config.overtime, rate_per_hour: parseInt(e.target.value) || 0 } }
//                   })}
//                   className="input-base mt-1 w-32"
//                 />
//               </div>
//               <div>
//                 <label className="text-sm font-medium">Multiplier (e.g., 1.5x for overtime)</label>
//                 <input
//                   type="number"
//                   step="0.1"
//                   value={config.overtime?.multiplier || 1.5}
//                   onChange={(e) => setForm({
//                     ...form,
//                     config: { ...config, overtime: { ...config.overtime, multiplier: parseFloat(e.target.value) || 1 } }
//                   })}
//                   className="input-base mt-1 w-32"
//                 />
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   // Config form renderers
//   const renderConfigForm = () => {
//     const policyType = form.policy_type;

//     switch (policyType) {
//       case POLICY_TYPES.ID_CARD:
//         return renderIDCardConfig();
//       case POLICY_TYPES.PAYROLL:
//         return renderPayrollConfig();
//       default:
//         return <p className="text-muted-foreground">Select a policy type to configure</p>;
//     }
//   };

//   // DataTable columns
//   const columns = useMemo(() => [
//     {
//       accessorKey: 'policy_name',
//       header: 'Policy Name',
//       cell: ({ getValue, row }) => (
//         <div className="flex items-center gap-2">
//           <span className="text-xl">{POLICY_TYPE_ICONS[row.original.policy_type]}</span>
//           <div>
//             <span className="font-medium">{getValue()}</span>
//             {row.original.description && (
//               <p className="text-xs text-muted-foreground line-clamp-1">{row.original.description}</p>
//             )}
//           </div>
//         </div>
//       )
//     },
//     {
//       accessorKey: 'policy_type',
//       header: 'Type',
//       cell: ({ getValue }) => (
//         <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
//           {POLICY_TYPE_LABELS[getValue()] || getValue()}
//         </span>
//       )
//     },
//     {
//       accessorKey: 'version',
//       header: 'Version',
//       cell: ({ getValue }) => <span className="text-sm">v{getValue()}</span>
//     },
//     {
//       accessorKey: 'is_active',
//       header: 'Status',
//       cell: ({ getValue, row }) => (
//         <div className="flex items-center gap-2">
//           <span className={cn(
//             'rounded-full px-2 py-0.5 text-xs font-medium',
//             getValue() ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
//           )}>
//             {getValue() ? 'Active' : 'Inactive'}
//           </span>
//           {canDo('policies.activate') && (
//             <button
//               onClick={() => handleToggleStatus(row.original)}
//               className="rounded p-1 hover:bg-accent"
//               title={getValue() ? 'Deactivate' : 'Activate'}
//             >
//               {getValue() ? <XCircle size={14} className="text-red-500" /> : <CheckCircle size={14} className="text-green-500" />}
//             </button>
//           )}
//         </div>
//       )
//     },
//     {
//       id: 'actions',
//       header: 'Actions',
//       enableHiding: false,
//       cell: ({ row }) => (
//         <div className="flex items-center gap-1">
//           {canDo('policies.read') && (
//             <button onClick={() => openView(row.original)} className="rounded p-1.5 hover:bg-accent" title="View">
//               <Eye size={14} />
//             </button>
//           )}
//           {canDo('policies.update') && (
//             <button onClick={() => openEdit(row.original)} className="rounded p-1.5 hover:bg-accent" title="Edit">
//               <Edit size={14} />
//             </button>
//           )}
//           {canDo('policies.delete') && (
//             <button
//               onClick={() => {
//                 setDeletingPolicy(row.original);
//                 setDeleteModalOpen(true);
//               }}
//               className="rounded p-1.5 text-destructive hover:bg-destructive/10"
//               title="Delete"
//             >
//               <Trash2 size={14} />
//             </button>
//           )}
//         </div>
//       )
//     }
//   ], [canDo]);

//   const canReadPolicies = canDo('policies.read');
//   const canCreatePolicies = canDo('policies.create');

//   if (!canReadPolicies) {
//     return <div className="py-20 text-center text-muted-foreground">You don't have permission to view policies.</div>;
//   }

//   return (
//     <div className="space-y-5">
//       <PageHeader
//         title="Policy Management"
//         description={`${total} policy records`}
//         action={
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => refetch()}
//               className="rounded-md border px-3 py-2 text-sm hover:bg-accent flex items-center gap-1"
//             >
//               <RefreshCw size={14} />
//               Refresh
//             </button>
//             {canCreatePolicies && (
//               <button
//                 onClick={openAdd}
//                 className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
//               >
//                 <Plus size={14} /> Add Policy
//               </button>
//             )}
//           </div>
//         }
//       />

//       <DataTable
//         columns={columns}
//         data={policies}
//         loading={isLoading}
//         emptyMessage="No policies found"
//         search={search}
//         onSearch={(v) => {
//           setSearch(v);
//           setPage(1);
//         }}
//         searchPlaceholder="Search policies..."
//         filters={[
//           {
//             name: 'policy_type',
//             label: 'Policy Type',
//             value: policyTypeFilter,
//             onChange: (v) => {
//               setPolicyTypeFilter(v);
//               setPage(1);
//             },
//             options: POLICY_TYPE_OPTIONS
//           },
//           {
//             name: 'status',
//             label: 'Status',
//             value: statusFilter,
//             onChange: (v) => {
//               setStatusFilter(v);
//               setPage(1);
//             },
//             options: [
//               { value: 'active', label: 'Active' },
//               { value: 'inactive', label: 'Inactive' }
//             ]
//           }
//         ]}
//         pagination={{
//           page,
//           totalPages,
//           onPageChange: setPage,
//           total,
//           pageSize,
//           onPageSizeChange: (s) => {
//             setPageSize(s);
//             setPage(1);
//           }
//         }}
//       />

//       {/* Add/Edit Modal */}
//       <AppModal
//         open={formModalOpen}
//         onClose={closeFormModal}
//         title={`${editingPolicy ? 'Edit' : 'Create'} ${form.policy_type ? POLICY_TYPE_LABELS[form.policy_type] : 'Policy'}`}
//         size="xl"
//         footer={
//           <div className="flex items-center justify-between w-full">
//             {formStep === 2 && (
//               <button type="button" onClick={handlePrevStep} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">
//                 ← Previous
//               </button>
//             )}
//             <div className="flex gap-2 ml-auto">
//               <button type="button" onClick={closeFormModal} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">
//                 Cancel
//               </button>
//               {formStep === 1 ? (
//                 <button
//                   type="button"
//                   onClick={handleNextStep}
//                   className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
//                 >
//                   Next →
//                 </button>
//               ) : (
//                 <button
//                   type="button"
//                   onClick={onSave}
//                   className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
//                   disabled={createMutation.isPending || updateMutation.isPending}
//                 >
//                   {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : (editingPolicy ? 'Update Policy' : 'Create Policy')}
//                 </button>
//               )}
//             </div>
//           </div>
//         }
//       >
//         {/* Step Indicator */}
//         <div className="mb-6 flex items-center justify-center gap-4">
//           <div className={cn(
//             'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold',
//             formStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
//           )}>
//             1
//           </div>
//           <div className={cn('h-1 w-12', formStep >= 2 ? 'bg-primary' : 'bg-muted')} />
//           <div className={cn(
//             'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold',
//             formStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
//           )}>
//             2
//           </div>
//         </div>

//         <div className="space-y-4">
//           {formStep === 1 && (
//             <div className="space-y-5 animate-in fade-in duration-300">
//               <h3 className="font-semibold text-base">Step 1: Basic Information</h3>
//               <SelectField
//                 label="Policy Type *"
//                 value={form.policy_type}
//                 onChange={(value) => {
//                   setForm({
//                     ...form,
//                     policy_type: value,
//                     config: POLICY_CONFIG_TEMPLATES[value] || {}
//                   });
//                 }}
//                 options={POLICY_TYPE_OPTIONS}
//                 required
//               />
//               <div className="space-y-1.5">
//                 <label className="text-sm font-medium">Policy Name *</label>
//                 <input
//                   value={form.policy_name}
//                   onChange={(e) => setForm({ ...form, policy_name: e.target.value })}
//                   className="input-base"
//                   placeholder={form.policy_type === POLICY_TYPES.ID_CARD ? "e.g., Staff ID Card Policy" : "e.g., School Payroll Policy"}
//                   onKeyDown={(e) => {
//                     if (e.key === 'Enter') {
//                       e.preventDefault();
//                       handleNextStep();
//                     }
//                   }}
//                 />
//               </div>
//               <div className="space-y-1.5">
//                 <label className="text-sm font-medium">Description</label>
//                 <textarea
//                   value={form.description}
//                   onChange={(e) => setForm({ ...form, description: e.target.value })}
//                   className="input-base min-h-20"
//                   placeholder="Brief description of the policy purpose and scope..."
//                   rows={3}
//                 />
//               </div>
//               <SelectField
//                 label="Status"
//                 value={form.is_active ? 'active' : 'inactive'}
//                 onChange={(value) => setForm({ ...form, is_active: value === 'active' })}
//                 options={[
//                   { value: 'active', label: '✅ Active' },
//                   { value: 'inactive', label: '⏸️ Inactive' }
//                 ]}
//               />
//               {form.policy_type && (
//                 <div className="rounded-lg border-l-4 border-primary bg-primary/5 p-4">
//                   <p className="text-sm text-foreground">
//                     <strong>📋 Next Step:</strong> Configure {POLICY_TYPE_LABELS[form.policy_type]} settings
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}

//           {formStep === 2 && (
//             <div className="space-y-5 animate-in fade-in duration-300">
//               <div>
//                 <h3 className="font-semibold text-base">Step 2: Configure {POLICY_TYPE_LABELS[form.policy_type]}</h3>
//                 <p className="text-xs text-muted-foreground">Set up the specific settings for this policy</p>
//               </div>
//               {renderConfigForm()}
//             </div>
//           )}
//         </div>
//       </AppModal>

//       {/* View Modal */}
//       <AppModal
//         open={viewModalOpen}
//         onClose={() => {
//           setViewModalOpen(false);
//           setViewingPolicy(null);
//         }}
//         title="Policy Details"
//         size="xl"
//         footer={
//           <button className="rounded-md border px-4 py-2 text-sm hover:bg-accent" onClick={() => setViewModalOpen(false)}>
//             Close
//           </button>
//         }
//       >
//         {viewingPolicy && (
//           <div className="space-y-4">
//             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//               <div>
//                 <p className="text-muted-foreground">Policy Name</p>
//                 <p className="font-medium">{viewingPolicy.policy_name}</p>
//               </div>
//               <div>
//                 <p className="text-muted-foreground">Policy Type</p>
//                 <p className="font-medium">{POLICY_TYPE_LABELS[viewingPolicy.policy_type]}</p>
//               </div>
//               <div>
//                 <p className="text-muted-foreground">Version</p>
//                 <p className="font-medium">v{viewingPolicy.version}</p>
//               </div>
//               <div>
//                 <p className="text-muted-foreground">Status</p>
//                 <span className={cn(
//                   'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
//                   viewingPolicy.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
//                 )}>
//                   {viewingPolicy.is_active ? 'Active' : 'Inactive'}
//                 </span>
//               </div>
//               <div className="sm:col-span-2">
//                 <p className="text-muted-foreground">Description</p>
//                 <p className="whitespace-pre-wrap">{viewingPolicy.description || '—'}</p>
//               </div>
//             </div>

//             {viewingPolicy.policy_type === POLICY_TYPES.ID_CARD && (
//               <div className="mt-4">
//                 <p className="text-muted-foreground mb-2">ID Card Preview</p>
//                 <IDCardPreview config={viewingPolicy.config} />
//               </div>
//             )}

//             {viewingPolicy.policy_type === POLICY_TYPES.PAYROLL && (
//               <div className="mt-4">
//                 <SalaryStructureExplanation config={viewingPolicy.config} />
//               </div>
//             )}

//             <div className="sm:col-span-2">
//               <p className="text-muted-foreground">Full Configuration (JSON)</p>
//               <pre className="mt-2 rounded-lg bg-muted p-3 text-xs overflow-auto max-h-96">
//                 {JSON.stringify(viewingPolicy.config, null, 2)}
//               </pre>
//             </div>
//           </div>
//         )}
//       </AppModal>

//       {/* Delete Confirmation Modal */}
//       <AppModal
//         open={deleteModalOpen}
//         onClose={() => {
//           setDeleteModalOpen(false);
//           setDeletingPolicy(null);
//         }}
//         title="Delete Policy"
//         size="sm"
//         footer={
//           <>
//             <button
//               onClick={() => {
//                 setDeleteModalOpen(false);
//                 setDeletingPolicy(null);
//               }}
//               className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={onDelete}
//               className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
//               disabled={deleteMutation.isPending}
//             >
//               {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
//             </button>
//           </>
//         }
//       >
//         <div className="space-y-2">
//           <p className="text-sm">Are you sure you want to delete this policy?</p>
//           {deletingPolicy && (
//             <p className="text-xs text-muted-foreground">
//               "{deletingPolicy.policy_name}" (v{deletingPolicy.version})
//             </p>
//           )}
//           <p className="text-xs text-destructive">This action cannot be undone.</p>
//         </div>
//       </AppModal>
//     </div>
//   );
// }







// src/components/settings/PolicyManagement.jsx
'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Eye, CheckCircle, XCircle, RefreshCw, QrCode, Settings, Info, User, Users, Palette, Layout, Type } from 'lucide-react';
import { toast } from 'sonner';

import { policyService } from '@/services/policyService';
import { POLICY_TYPES, POLICY_TYPE_LABELS, POLICY_TYPE_ICONS, POLICY_CONFIG_TEMPLATES, getFieldsByCardType } from '@/constants/policy.constants';
import useAuthStore from '@/store/authStore';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import { cn } from '@/lib/utils';
import IDCardViewer from '@/components/common/IDCard';

// ==================== ID CARD PREVIEW ====================
const IDCardPreview = ({ config }) => {
  const cardType = config?.card_type || 'student';
  const layout = config?.layout || 'vertical';
  
  const sampleStudent = {
    full_name: 'Marsha Williams',
    parent_name: 'James Williams',
    roll_number: 'SCH-1234-567',
    class: '10',
    section: 'A',
    blood_group: 'O+',
    valid_upto: '31 Dec 2025',
  };

  const sampleStaff = {
    full_name: 'John Doe',
    designation: 'Senior Teacher',
    employee_id: 'EMP-2024-001',
    department: 'Science Department',
    blood_group: 'O+',
    valid_upto: '31 Dec 2025',
  };

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          {cardType === 'staff' ? '👨‍🏫 Staff ID Card Preview' : '👨‍🎓 Student ID Card Preview'}
        </h4>
        <span className="text-xs text-muted-foreground">{config?.size || 'CR80'} • {layout}</span>
      </div>

      <IDCardViewer 
        studentData={sampleStudent}
        staffData={sampleStaff}
        policyOverride={{ config, policy_name: 'Preview', version: 1 }}
        hideControls={false}
      />

      {config?.terms_list?.length > 0 && (
        <div className="mt-3 text-center text-[9px] text-muted-foreground bg-amber-50 p-2 rounded-md">
          <Info size={12} className="inline mr-1 text-amber-600" />
          {config.terms_list.length} Terms & Conditions configured
        </div>
      )}
    </div>
  );
};

// ==================== SALARY STRUCTURE EXPLANATION ====================
const SalaryStructureExplanation = ({ config }) => {
  const basicPercentage = config.salary_calculation?.basic_percentage || 50;
  const allowances = config.salary_calculation?.allowances || [];
  const totalAllowancePercentage = allowances.reduce((sum, a) => sum + (a.percentage || 0), 0);

  return (
    <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm">
      <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2"><Settings size={14} /> Salary Calculation</h4>
      <div className="bg-white rounded p-2 text-xs">
        <p><strong>Example:</strong> Total Salary = 50,000</p>
        <ul className="list-disc list-inside ml-2 mt-1">
          <li>Basic ({basicPercentage}%) = {50000 * basicPercentage / 100} Rs</li>
          {allowances.map((a, i) => <li key={i}>{a.name} ({a.percentage}%) = {50000 * a.percentage / 100} Rs</li>)}
          <li className="font-bold mt-1">Total = {basicPercentage + totalAllowancePercentage}% = 50,000 Rs</li>
        </ul>
      </div>
      <p className="text-xs mt-2">💡 Teacher entry time pe sirf <strong>Total Salary</strong> dalni hai. Allowances auto calculate hongy.</p>
    </div>
  );
};

const POLICY_TYPE_OPTIONS = [
  { value: POLICY_TYPES.ID_CARD, label: POLICY_TYPE_LABELS[POLICY_TYPES.ID_CARD] },
  { value: POLICY_TYPES.PAYROLL, label: POLICY_TYPE_LABELS[POLICY_TYPES.PAYROLL] }
];

const CARD_TYPE_OPTIONS = [
  { value: 'staff', label: '👨‍🏫 Staff ID Card' },
  { value: 'student', label: '👨‍🎓 Student ID Card' }
];

const LAYOUT_OPTIONS = [
  { value: 'vertical', label: 'Vertical (Portrait)' },
  { value: 'horizontal', label: 'Horizontal (Landscape)' }
];

const EMPTY_FORM = {
  policy_type: '',
  policy_name: '',
  description: '',
  config: {},
  branch_id: null,
  is_active: true
};

export default function PolicyManagement() {
  const canDo = useAuthStore((s) => s.canDo);
  const institute = useAuthStore((s) => s.getInstitute());
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [policyTypeFilter, setPolicyTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [viewingPolicy, setViewingPolicy] = useState(null);
  const [deletingPolicy, setDeletingPolicy] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: policiesData, isLoading, refetch } = useQuery({
    queryKey: ['policies', page, pageSize, search, policyTypeFilter, statusFilter],
    queryFn: () => policyService.getAll({ page, limit: pageSize, search: search || undefined, policy_type: policyTypeFilter || undefined, is_active: statusFilter !== '' ? statusFilter === 'active' : undefined, institute_id: institute?.id }),
    enabled: !!institute?.id
  });

  const policies = policiesData?.data || [];
  const total = policiesData?.pagination?.total || 0;
  const totalPages = policiesData?.pagination?.totalPages || 1;

  const createMutation = useMutation({ mutationFn: policyService.create, onSuccess: () => { queryClient.invalidateQueries(['policies']); toast.success('Policy created!'); closeFormModal(); }, onError: (error) => toast.error(error?.response?.data?.message || 'Failed') });
  const updateMutation = useMutation({ mutationFn: ({ id, data }) => policyService.update(id, data), onSuccess: () => { queryClient.invalidateQueries(['policies']); toast.success('Policy updated!'); closeFormModal(); }, onError: (error) => toast.error(error?.response?.data?.message || 'Failed') });
  const deleteMutation = useMutation({ mutationFn: policyService.delete, onSuccess: () => { queryClient.invalidateQueries(['policies']); toast.success('Policy deleted'); setDeleteModalOpen(false); }, onError: (error) => toast.error(error?.response?.data?.message || 'Failed') });
  const toggleStatusMutation = useMutation({ mutationFn: ({ id, isActive }) => policyService.toggleStatus(id, isActive), onSuccess: (_, { isActive }) => { queryClient.invalidateQueries(['policies']); toast.success(`Policy ${isActive ? 'activated' : 'deactivated'}`); }, onError: (error) => toast.error(error?.response?.data?.message || 'Failed') });

  const resetForm = () => { setForm(EMPTY_FORM); setFormStep(1); setEditingPolicy(null); };
  const openAdd = () => { resetForm(); setFormModalOpen(true); };
  const openEdit = (policy) => { setEditingPolicy(policy); setFormStep(1); setForm({ policy_type: policy.policy_type, policy_name: policy.policy_name, description: policy.description || '', config: policy.config, branch_id: policy.branch_id, is_active: policy.is_active }); setFormModalOpen(true); };
  const openView = (policy) => { setViewingPolicy(policy); setViewModalOpen(true); };
  const closeFormModal = () => { setFormModalOpen(false); resetForm(); };
  const handleNextStep = () => { if (!form.policy_type) { toast.error('Select Policy Type'); return; } if (!form.policy_name?.trim()) { toast.error('Enter Policy Name'); return; } setFormStep(2); };
  const handlePrevStep = () => setFormStep(1);
  const onSave = (e) => { e.preventDefault(); if (!form.policy_type || !form.policy_name) { toast.error('Fill required fields'); return; } if (editingPolicy) { updateMutation.mutate({ id: editingPolicy.id, data: { policy_name: form.policy_name, description: form.description, config: form.config, branch_id: form.branch_id, is_active: form.is_active } }); } else { createMutation.mutate({ ...form, institute_id: institute?.id, config: form.config || POLICY_CONFIG_TEMPLATES[form.policy_type] || {} }); } };
  const onDelete = () => { if (deletingPolicy) deleteMutation.mutate(deletingPolicy.id); };
  const handleToggleStatus = (policy) => toggleStatusMutation.mutate({ id: policy.id, isActive: !policy.is_active });

  // ==================== ID CARD CONFIG FORM ====================
  const renderIDCardConfig = () => {
    const config = form.config || POLICY_CONFIG_TEMPLATES[POLICY_TYPES.ID_CARD];
    const currentCardType = config.card_type || 'student';
    const currentFields = getFieldsByCardType(currentCardType);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Side - Settings */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {/* Card Type */}
            <div className="border-b pb-3">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><span className="text-lg">🎫</span> Card Type</h3>
              <SelectField label="Select Card Type" value={currentCardType} onChange={(v) => setForm({ ...form, config: { ...config, card_type: v } })} options={CARD_TYPE_OPTIONS} />
            </div>

            {/* Layout */}
            <div className="border-b pb-3">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Layout size={16} /> Layout Settings</h3>
              <SelectField label="Card Layout" value={config.layout || 'vertical'} onChange={(v) => setForm({ ...form, config: { ...config, layout: v } })} options={LAYOUT_OPTIONS} />
              <SelectField label="Card Size" value={config.size || 'CR80'} onChange={(v) => setForm({ ...form, config: { ...config, size: v } })} options={[{ value: 'CR80', label: 'CR80 (Standard)' }, { value: 'A4', label: 'A4 (Print Friendly)' }]} />
            </div>

            {/* School Info */}
            <div className="border-b pb-3">
              <h3 className="font-semibold mb-3 flex items-center gap-2">🏫 School Information</h3>
              <input type="text" value={config.school_info?.name || institute?.name || ''} onChange={(e) => setForm({ ...form, config: { ...config, school_info: { ...config.school_info, name: e.target.value } } })} className="input-base text-sm mb-2" placeholder="School Name" />
              <input type="text" value={config.school_info?.tagline || ''} onChange={(e) => setForm({ ...form, config: { ...config, school_info: { ...config.school_info, tagline: e.target.value } } })} className="input-base text-sm mb-2" placeholder="Tagline" />
              <input type="text" value={config.school_info?.phone || institute?.phone || ''} onChange={(e) => setForm({ ...form, config: { ...config, school_info: { ...config.school_info, phone: e.target.value } } })} className="input-base text-sm" placeholder="Phone" />
            </div>

            {/* Design Settings */}
            <div className="border-b pb-3">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Palette size={16} /> Design Settings</h3>
              <div className="space-y-2"><label className="text-sm font-medium">Background Color</label><input type="color" value={config.design?.background_color || '#0f172a'} onChange={(e) => setForm({ ...form, config: { ...config, design: { ...config.design, background_color: e.target.value } } })} className="input-base h-10" /></div>
              <div className="space-y-2 mt-2"><label className="text-sm font-medium">Accent Color</label><input type="color" value={config.design?.accent_color || '#f97316'} onChange={(e) => setForm({ ...form, config: { ...config, design: { ...config.design, accent_color: e.target.value } } })} className="input-base h-10" /></div>
              <div className="space-y-2 mt-2"><label className="text-sm font-medium">Text Color</label><input type="color" value={config.design?.text_color || '#ffffff'} onChange={(e) => setForm({ ...form, config: { ...config, design: { ...config.design, text_color: e.target.value } } })} className="input-base h-10" /></div>
              <div className="flex items-center gap-3 mt-3">
                <label className="flex items-center gap-2"><input type="checkbox" checked={config.design?.show_border !== false} onChange={(e) => setForm({ ...form, config: { ...config, design: { ...config.design, show_border: e.target.checked } } })} /><span className="text-sm">Show Border</span></label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={config.design?.card_shadow !== false} onChange={(e) => setForm({ ...form, config: { ...config, design: { ...config.design, card_shadow: e.target.checked } } })} /><span className="text-sm">Card Shadow</span></label>
              </div>
            </div>

            {/* Fields Configuration */}
            <div className="border-b pb-3">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Type size={16} /> Card Fields</h3>
              <div className="space-y-2">
                {currentFields.map((field, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={field.visible !== false} onChange={(e) => { const newFields = [...currentFields]; newFields[idx] = { ...newFields[idx], visible: e.target.checked }; if (currentCardType === 'staff') { setForm({ ...form, config: { ...config, staff_config: { ...config.staff_config, fields: newFields } } }); } else { setForm({ ...form, config: { ...config, student_config: { ...config.student_config, fields: newFields } } }); } }} /><span>{field.label}</span></label>
                    {field.required && <span className="text-xs text-red-500">Required</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="border-b pb-3">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><span>📜</span> Terms & Conditions</h3>
              <div className="space-y-2">
                {(config.terms_list || []).map((term, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <textarea value={term} onChange={(e) => { const newTerms = [...(config.terms_list || [])]; newTerms[idx] = e.target.value; setForm({ ...form, config: { ...config, terms_list: newTerms } }); }} className="input-base text-sm flex-1" placeholder={`Term ${idx + 1}`} rows={1} />
                    <button type="button" onClick={() => { const newTerms = (config.terms_list || []).filter((_, i) => i !== idx); setForm({ ...form, config: { ...config, terms_list: newTerms } }); }} className="text-destructive hover:bg-destructive/10 rounded p-1">✕</button>
                  </div>
                ))}
                <button type="button" onClick={() => { const newTerms = [...(config.terms_list || []), '']; setForm({ ...form, config: { ...config, terms_list: newTerms } }); }} className="text-xs text-primary hover:underline">+ Add Term</button>
              </div>
            </div>

            {/* QR & Watermark */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2"><QrCode size={14} /> Extra Features</h3>
              <label className="flex items-center gap-2"><input type="checkbox" checked={config.qr_enabled || false} onChange={(e) => setForm({ ...form, config: { ...config, qr_enabled: e.target.checked } })} /><span>Show QR Code on Back Side</span></label>
              <label className="flex items-center gap-2 mt-2"><input type="checkbox" checked={config.show_watermark !== false} onChange={(e) => setForm({ ...form, config: { ...config, show_watermark: e.target.checked } })} /><span>Show Watermark on Card</span></label>
              <label className="flex items-center gap-2 mt-2"><input type="checkbox" checked={config.show_photo !== false} onChange={(e) => setForm({ ...form, config: { ...config, show_photo: e.target.checked } })} /><span>Show Photo on Card</span></label>
            </div>
          </div>

          {/* Right Side - Preview */}
          <div><IDCardPreview config={config} /></div>
        </div>
      </div>
    );
  };

  // ==================== PAYROLL CONFIG FORM ====================
  const renderPayrollConfig = () => {
    const config = form.config || POLICY_CONFIG_TEMPLATES[POLICY_TYPES.PAYROLL];
    return (
      <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
        <div className="border-b pb-4"><h3 className="font-semibold mb-3">💰 Salary Structure</h3>
          <div><label className="text-sm font-medium">Basic Salary Percentage (%)</label><input type="number" value={config.salary_calculation?.basic_percentage || 50} onChange={(e) => setForm({ ...form, config: { ...config, salary_calculation: { ...config.salary_calculation, basic_percentage: parseInt(e.target.value) || 0 } } })} className="input-base mt-1" /></div>
          <div className="mt-3"><label className="text-sm font-medium">Percentage Allowances</label>
            {(config.salary_calculation?.allowances || []).map((allowance, idx) => (<div key={idx} className="flex gap-2 mt-2"><input type="text" value={allowance.name} onChange={(e) => { const newAllowances = [...(config.salary_calculation?.allowances || [])]; newAllowances[idx] = { ...newAllowances[idx], name: e.target.value }; setForm({ ...form, config: { ...config, salary_calculation: { ...config.salary_calculation, allowances: newAllowances } } }); }} className="input-base text-sm flex-1" placeholder="Name" /><input type="number" value={allowance.percentage} onChange={(e) => { const newAllowances = [...(config.salary_calculation?.allowances || [])]; newAllowances[idx] = { ...newAllowances[idx], percentage: parseInt(e.target.value) || 0 }; setForm({ ...form, config: { ...config, salary_calculation: { ...config.salary_calculation, allowances: newAllowances } } }); }} className="input-base text-sm w-24" placeholder="%" /><button onClick={() => { const newAllowances = (config.salary_calculation?.allowances || []).filter((_, i) => i !== idx); setForm({ ...form, config: { ...config, salary_calculation: { ...config.salary_calculation, allowances: newAllowances } } }); }} className="text-destructive">✕</button></div>))}
            <button onClick={() => { const newAllowances = [...(config.salary_calculation?.allowances || []), { name: '', percentage: 0 }]; setForm({ ...form, config: { ...config, salary_calculation: { ...config.salary_calculation, allowances: newAllowances } } }); }} className="text-xs text-primary hover:underline mt-2">+ Add Allowance</button>
          </div>
          <SalaryStructureExplanation config={config} />
        </div>
        <div className="border-b pb-4"><h3 className="font-semibold mb-3">⏱️ Attendance Rules</h3>
          <label className="flex items-center gap-2"><input type="checkbox" checked={config.attendance_rules?.late_arrival?.enabled ?? true} onChange={(e) => setForm({ ...form, config: { ...config, attendance_rules: { ...config.attendance_rules, late_arrival: { ...config.attendance_rules?.late_arrival, enabled: e.target.checked } } } })} /><span>Late Arrival Penalty</span></label>
          {config.attendance_rules?.late_arrival?.enabled && <div className="ml-6 mt-2"><input type="number" value={config.attendance_rules?.late_arrival?.threshold_count ?? 3} onChange={(e) => setForm({ ...form, config: { ...config, attendance_rules: { ...config.attendance_rules, late_arrival: { ...config.attendance_rules?.late_arrival, threshold_count: parseInt(e.target.value) || 1 } } } })} className="input-base text-sm w-24" placeholder="Threshold" /></div>}
        </div>
        <div><h3 className="font-semibold mb-3">⏰ Overtime</h3>
          <label className="flex items-center gap-2"><input type="checkbox" checked={config.overtime?.enabled || false} onChange={(e) => setForm({ ...form, config: { ...config, overtime: { ...config.overtime, enabled: e.target.checked } } })} /><span>Enable Overtime</span></label>
          {config.overtime?.enabled && <div className="ml-6 mt-2"><input type="number" value={config.overtime?.rate_per_hour || 200} onChange={(e) => setForm({ ...form, config: { ...config, overtime: { ...config.overtime, rate_per_hour: parseInt(e.target.value) || 0 } } })} className="input-base w-32" placeholder="Rate per hour" /></div>}
        </div>
      </div>
    );
  };

  const renderConfigForm = () => {
    switch (form.policy_type) {
      case POLICY_TYPES.ID_CARD: return renderIDCardConfig();
      case POLICY_TYPES.PAYROLL: return renderPayrollConfig();
      default: return <p className="text-muted-foreground">Select a policy type to configure</p>;
    }
  };

  const columns = useMemo(() => [
    { accessorKey: 'policy_name', header: 'Policy Name', cell: ({ getValue, row }) => (<div className="flex items-center gap-2"><span className="text-xl">{POLICY_TYPE_ICONS[row.original.policy_type]}</span><div><span className="font-medium">{getValue()}</span>{row.original.description && <p className="text-xs text-muted-foreground line-clamp-1">{row.original.description}</p>}</div></div>) },
    { accessorKey: 'policy_type', header: 'Type', cell: ({ getValue }) => (<span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">{POLICY_TYPE_LABELS[getValue()]}</span>) },
    { accessorKey: 'version', header: 'Version', cell: ({ getValue }) => <span className="text-sm">v{getValue()}</span> },
    { accessorKey: 'is_active', header: 'Status', cell: ({ getValue, row }) => (<div className="flex items-center gap-2"><span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', getValue() ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>{getValue() ? 'Active' : 'Inactive'}</span>{canDo('policies.activate') && <button onClick={() => handleToggleStatus(row.original)} className="rounded p-1 hover:bg-accent">{getValue() ? <XCircle size={14} className="text-red-500" /> : <CheckCircle size={14} className="text-green-500" />}</button>}</div>) },
    { id: 'actions', header: 'Actions', cell: ({ row }) => (<div className="flex items-center gap-1">{canDo('policies.read') && <button onClick={() => openView(row.original)} className="rounded p-1.5 hover:bg-accent"><Eye size={14} /></button>}{canDo('policies.update') && <button onClick={() => openEdit(row.original)} className="rounded p-1.5 hover:bg-accent"><Edit size={14} /></button>}{canDo('policies.delete') && <button onClick={() => { setDeletingPolicy(row.original); setDeleteModalOpen(true); }} className="rounded p-1.5 text-destructive hover:bg-destructive/10"><Trash2 size={14} /></button>}</div>) }
  ], [canDo]);

  const canReadPolicies = canDo('policies.read');
  const canCreatePolicies = canDo('policies.create');

  if (!canReadPolicies) return <div className="py-20 text-center text-muted-foreground">No permission to view policies.</div>;

  return (
    <div className="space-y-5">
      <PageHeader title="Policy Management" description={`${total} policy records`} action={<div className="flex items-center gap-2"><button onClick={() => refetch()} className="rounded-md border px-3 py-2 text-sm hover:bg-accent flex items-center gap-1"><RefreshCw size={14} /> Refresh</button>{canCreatePolicies && <button onClick={openAdd} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"><Plus size={14} /> Add Policy</button>}</div>} />

      <DataTable columns={columns} data={policies} loading={isLoading} emptyMessage="No policies found" search={search} onSearch={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Search policies..." filters={[{ name: 'policy_type', label: 'Policy Type', value: policyTypeFilter, onChange: (v) => { setPolicyTypeFilter(v); setPage(1); }, options: POLICY_TYPE_OPTIONS }, { name: 'status', label: 'Status', value: statusFilter, onChange: (v) => { setStatusFilter(v); setPage(1); }, options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] }]} pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }} />

      {/* Add/Edit Modal */}
      <AppModal open={formModalOpen} onClose={closeFormModal} title={`${editingPolicy ? 'Edit' : 'Create'} ${form.policy_type ? POLICY_TYPE_LABELS[form.policy_type] : 'Policy'}`} size="xl" footer={<div className="flex items-center justify-between w-full">{formStep === 2 && <button onClick={handlePrevStep} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">← Previous</button>}<div className="flex gap-2 ml-auto"><button onClick={closeFormModal} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button>{formStep === 1 ? <button onClick={handleNextStep} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">Next →</button> : <button onClick={onSave} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90" disabled={createMutation.isPending || updateMutation.isPending}>{(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : (editingPolicy ? 'Update' : 'Create')}</button>}</div></div>}>
        <div className="mb-6 flex items-center justify-center gap-4"><div className={cn('flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold', formStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>1</div><div className={cn('h-1 w-12', formStep >= 2 ? 'bg-primary' : 'bg-muted')} /><div className={cn('flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold', formStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>2</div></div>
        <div className="space-y-4">
          {formStep === 1 && (<div className="space-y-5"><h3 className="font-semibold text-base">Step 1: Basic Information</h3><SelectField label="Policy Type *" value={form.policy_type} onChange={(value) => { setForm({ ...form, policy_type: value, config: POLICY_CONFIG_TEMPLATES[value] || {} }); }} options={POLICY_TYPE_OPTIONS} required /><div className="space-y-1.5"><label className="text-sm font-medium">Policy Name *</label><input value={form.policy_name} onChange={(e) => setForm({ ...form, policy_name: e.target.value })} className="input-base" placeholder="e.g., Student ID Card Policy" /></div><div className="space-y-1.5"><label className="text-sm font-medium">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-base min-h-20" placeholder="Brief description..." rows={3} /></div><SelectField label="Status" value={form.is_active ? 'active' : 'inactive'} onChange={(value) => setForm({ ...form, is_active: value === 'active' })} options={[{ value: 'active', label: '✅ Active' }, { value: 'inactive', label: '⏸️ Inactive' }]} /></div>)}
          {formStep === 2 && (<div className="space-y-5"><div><h3 className="font-semibold text-base">Step 2: Configure {POLICY_TYPE_LABELS[form.policy_type]}</h3><p className="text-xs text-muted-foreground">Set up the specific settings for this policy</p></div>{renderConfigForm()}</div>)}
        </div>
      </AppModal>

      {/* View Modal */}
      <AppModal open={viewModalOpen} onClose={() => { setViewModalOpen(false); setViewingPolicy(null); }} title="Policy Details" size="xl" footer={<button className="rounded-md border px-4 py-2 text-sm hover:bg-accent" onClick={() => setViewModalOpen(false)}>Close</button>}>
        {viewingPolicy && (<div className="space-y-4"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><p className="text-muted-foreground">Policy Name</p><p className="font-medium">{viewingPolicy.policy_name}</p></div><div><p className="text-muted-foreground">Policy Type</p><p className="font-medium">{POLICY_TYPE_LABELS[viewingPolicy.policy_type]}</p></div><div><p className="text-muted-foreground">Version</p><p className="font-medium">v{viewingPolicy.version}</p></div><div><p className="text-muted-foreground">Status</p><span className={cn('inline-block rounded-full px-2 py-0.5 text-xs font-medium', viewingPolicy.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>{viewingPolicy.is_active ? 'Active' : 'Inactive'}</span></div><div className="sm:col-span-2"><p className="text-muted-foreground">Description</p><p className="whitespace-pre-wrap">{viewingPolicy.description || '—'}</p></div></div>{viewingPolicy.policy_type === POLICY_TYPES.ID_CARD && <div><p className="text-muted-foreground mb-2">ID Card Preview</p><IDCardPreview config={viewingPolicy.config} /></div>}{viewingPolicy.policy_type === POLICY_TYPES.PAYROLL && <SalaryStructureExplanation config={viewingPolicy.config} />}<div><p className="text-muted-foreground">Full Configuration (JSON)</p><pre className="mt-2 rounded-lg bg-muted p-3 text-xs overflow-auto max-h-96">{JSON.stringify(viewingPolicy.config, null, 2)}</pre></div></div>)}
      </AppModal>

      {/* Delete Modal */}
      <AppModal open={deleteModalOpen} onClose={() => { setDeleteModalOpen(false); setDeletingPolicy(null); }} title="Delete Policy" size="sm" footer={<><button onClick={() => { setDeleteModalOpen(false); setDeletingPolicy(null); }} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button><button onClick={onDelete} className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-white hover:opacity-90" disabled={deleteMutation.isPending}>{deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}</button></>}>
        <div className="space-y-2"><p className="text-sm">Are you sure you want to delete this policy?</p>{deletingPolicy && <p className="text-xs text-muted-foreground">"{deletingPolicy.policy_name}" (v{deletingPolicy.version})</p>}<p className="text-xs text-destructive">This action cannot be undone.</p></div>
      </AppModal>
    </div>
  );
}