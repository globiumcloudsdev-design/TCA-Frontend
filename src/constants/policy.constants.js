// // src/constants/policy.constants.js
// export const POLICY_TYPES = {
//   ID_CARD: 'id_card',
//   PAYROLL: 'payroll'
// };

// export const POLICY_TYPE_LABELS = {
//   [POLICY_TYPES.ID_CARD]: 'ID Card',
//   [POLICY_TYPES.PAYROLL]: 'Payroll'
// };

// export const POLICY_TYPE_ICONS = {
//   [POLICY_TYPES.ID_CARD]: '🪪',
//   [POLICY_TYPES.PAYROLL]: '💰'
// };

// // Staff specific fields
// export const STAFF_ID_FIELDS = [
//   { key: 'full_name', label: 'Full Name', visible: true, required: true, staff: true, student: false },
//   { key: 'designation', label: 'Designation', visible: true, required: true, staff: true, student: false },
//   { key: 'employee_id', label: 'Employee ID', visible: true, required: true, staff: true, student: false },
//   { key: 'department', label: 'Department', visible: true, required: false, staff: true, student: false },
//   { key: 'blood_group', label: 'Blood Group', visible: true, required: false, staff: true, student: true },
//   { key: 'valid_upto', label: 'Valid Upto', visible: true, required: false, staff: true, student: false },
//   { key: 'phone', label: 'Phone', visible: true, required: false, staff: true, student: false },
//   { key: 'email', label: 'Email', visible: false, required: false, staff: true, student: false }
// ];

// // Student specific fields
// export const STUDENT_ID_FIELDS = [
//   { key: 'full_name', label: 'Student Name', visible: true, required: true, staff: false, student: true },
//   { key: 'class', label: 'Class', visible: true, required: true, staff: false, student: true },
//   { key: 'section', label: 'Section', visible: true, required: true, staff: false, student: true },
//   { key: 'roll_number', label: 'Roll Number', visible: true, required: true, staff: false, student: true },
//   { key: 'blood_group', label: 'Blood Group', visible: true, required: false, staff: true, student: true },
//   { key: 'dob', label: 'Date of Birth', visible: true, required: false, staff: false, student: true },
//   { key: 'parent_name', label: "Parent's Name", visible: true, required: false, staff: false, student: true },
//   { key: 'parent_contact', label: "Parent's Contact", visible: true, required: false, staff: false, student: true },
//   { key: 'emergency_contact', label: 'Emergency No.', visible: true, required: false, staff: false, student: true },
//   { key: 'address', label: 'Address', visible: false, required: false, staff: false, student: true }
// ];

// // Default config templates for each policy type
// export const POLICY_CONFIG_TEMPLATES = {
//   [POLICY_TYPES.ID_CARD]: {
//     layout: 'vertical',
//     size: 'CR80',
//     card_type: 'staff', // staff, student
//     show_photo: true,
//     show_watermark: true,
//     show_barcode: true,
//     // School Info
//     school_info: {
//       name: 'Green Valley High School',
//       tagline: 'Excellence in Education',
//       logo_url: null,
//       address: '123 Elm Street, Springfield, USA'
//     },
//     // Staff specific config
//     staff_config: {
//       fields: STAFF_ID_FIELDS.filter(f => f.staff).map(({ staff, student, ...rest }) => rest),
//       custom_texts: [
//         { label: "Emergency Contact", value: "School Office: (123) 456-7890", visible: true },
//         { label: "Note", value: "Keep card safe & secure", visible: true }
//       ],
//       footer_text: "📞 (123) 456-7890  |  ✉ info@schoolname.com"
//     },
//     // Student specific config
//     student_config: {
//       fields: STUDENT_ID_FIELDS.filter(f => f.student).map(({ staff, student, ...rest }) => rest),
//       custom_texts: [
//         { label: "School Contact", value: "(123) 456-7890", visible: true },
//         { label: "Note", value: "This card must be worn at all times", visible: true }
//       ],
//       footer_text: "👨‍👩 Parent Helpline: (123) 456-7890  |  🚨 Emergency: 911"
//     },
//     card_instructions: {
//       enabled: true,
//       text: "⚠️ This card is property of Green Valley High School. If found, please return to the main office.",
//       position: "bottom",
//       font_size: "8px"
//     },
//     design: {
//       background_color: '#1a1a2e',
//       text_color: '#ffffff',
//       accent_color: '#e94560',
//       logo_position: 'top',
//       border_radius: '12px',
//       show_border: true,
//       border_color: '#e2e8f0',
//       photo_border_radius: '12px',
//       card_shadow: true
//     },
//     qr_config: {
//       enabled: false,
//       data_fields: ['employee_id', 'full_name'],
//       size: 60,
//       position: 'bottom-right'
//     },
//     barcode_config: {
//       enabled: true,
//       format: 'CODE128',
//       width: 2,
//       height: 30,
//       text_visible: true
//     }
//   },
//   [POLICY_TYPES.PAYROLL]: {
//     // Salary Calculation Method
//     salary_calculation: {
//       method: 'percentage_based',
//       basic_percentage: 50,
//       allowances: [
//         { name: 'House Rent Allowance', percentage: 20, is_taxable: true },
//         { name: 'Medical Allowance', percentage: 10, is_taxable: false },
//         { name: 'Conveyance Allowance', percentage: 5, is_taxable: false }
//       ],
//       fixed_allowances: [
//         { name: 'Dearness Allowance', amount: 2000, is_taxable: true }
//       ]
//     },
//     // Attendance & Deduction Rules
//     attendance_rules: {
//       late_arrival: {
//         enabled: true,
//         threshold_count: 3,
//         deduction_type: 'daily_salary',
//         deduction_value: 1
//       },
//       full_day_absent: {
//         enabled: true,
//         deduction_type: 'daily_salary',
//         deduction_value: 1,
//         require_approval: false
//       },
//       half_day_absent: {
//         enabled: true,
//         deduction_type: 'half_daily_salary',
//         deduction_value: 0.5,
//         require_approval: false
//       }
//     },
//     // Other deductions
//     other_deductions: [
//       { name: 'Professional Tax', amount: 200, is_mandatory: true },
//       { name: 'Provident Fund', percentage: 12, is_mandatory: true }
//     ],
//     overtime: {
//       enabled: true,
//       rate_per_hour: 200,
//       multiplier: 1.5
//     },
//     payroll_settings: {
//       salary_day: 30,
//       advance_salary_allowed: false,
//       advance_percentage_limit: 50,
//       loan_deduction_allowed: true
//     }
//   }
// };

// // Helper function to get fields based on card type
// export const getFieldsByCardType = (cardType) => {
//   if (cardType === 'staff') {
//     return STAFF_ID_FIELDS.filter(f => f.staff).map(({ staff, student, ...rest }) => rest);
//   }
//   return STUDENT_ID_FIELDS.filter(f => f.student).map(({ staff, student, ...rest }) => rest);
// };

// // Helper function to get config by card type
// export const getCardConfigByType = (config, cardType) => {
//   if (cardType === 'staff') {
//     return {
//       ...config,
//       fields: config.staff_config?.fields || getFieldsByCardType('staff'),
//       custom_texts: config.staff_config?.custom_texts || [],
//       footer_text: config.staff_config?.footer_text || ''
//     };
//   }
//   return {
//     ...config,
//     fields: config.student_config?.fields || getFieldsByCardType('student'),
//     custom_texts: config.student_config?.custom_texts || [],
//     footer_text: config.student_config?.footer_text || ''
//   };
// };




// src/constants/policy.constants.js
export const POLICY_TYPES = {
  ID_CARD: 'id_card',
  PAYROLL: 'payroll'
};

export const POLICY_TYPE_LABELS = {
  [POLICY_TYPES.ID_CARD]: 'ID Card',
  [POLICY_TYPES.PAYROLL]: 'Payroll'
};

export const POLICY_TYPE_ICONS = {
  [POLICY_TYPES.ID_CARD]: '🪪',
  [POLICY_TYPES.PAYROLL]: '💰'
};

// Staff specific fields
export const STAFF_ID_FIELDS = [
  { key: 'full_name', label: 'Full Name', visible: true, required: true },
  { key: 'designation', label: 'Designation', visible: true, required: true },
  { key: 'employee_id', label: 'Employee ID', visible: true, required: true },
  { key: 'department', label: 'Department', visible: true, required: false },
  { key: 'blood_group', label: 'Blood Group', visible: true, required: false },
  { key: 'valid_upto', label: 'Valid Upto', visible: true, required: false },
  { key: 'phone', label: 'Phone', visible: true, required: false },
  { key: 'email', label: 'Email', visible: false, required: false }
];

// Student specific fields
export const STUDENT_ID_FIELDS = [
  { key: 'full_name', label: 'Student Name', visible: true, required: true },
  { key: 'class', label: 'Class', visible: true, required: true },
  { key: 'section', label: 'Section', visible: true, required: true },
  { key: 'roll_number', label: 'Roll Number', visible: true, required: true },
  { key: 'blood_group', label: 'Blood Group', visible: true, required: false },
  { key: 'dob', label: 'Date of Birth', visible: true, required: false },
  { key: 'parent_name', label: "Parent's Name", visible: true, required: false },
  { key: 'parent_contact', label: "Parent's Contact", visible: true, required: false },
  { key: 'emergency_contact', label: 'Emergency No.', visible: true, required: false },
  { key: 'address', label: 'Address', visible: false, required: false }
];

// Default config templates for each policy type
export const POLICY_CONFIG_TEMPLATES = {
  [POLICY_TYPES.ID_CARD]: {
    layout: 'vertical',
    size: 'CR80',
    card_type: 'staff',
    show_photo: true,
    show_watermark: true,
    qr_enabled: false,
    school_info: {
      name: 'Green Valley High School',
      tagline: 'Excellence in Education',
      logo_url: null,
      address: '123 Elm Street, Springfield, USA',
      phone: '(123) 456-7890',
      email: 'info@schoolname.com'
    },
    staff_config: {
      fields: STAFF_ID_FIELDS,
      footer_text: "📞 (123) 456-7890  |  ✉ info@schoolname.com"
    },
    student_config: {
      fields: STUDENT_ID_FIELDS,
      footer_text: "👨‍👩 Parent Helpline: (123) 456-7890  |  🚨 Emergency: 911"
    },
    terms_list: [
      "This card is the property of the institution.",
      "Loss of card must be reported immediately.",
      "This card is non-transferable.",
      "Misuse may result in disciplinary action."
    ],
    design: {
      background_color: '#0f172a',
      accent_color: '#f97316',
      text_color: '#ffffff',
      border_radius: '16px',
      show_border: true,
      border_color: '#e2e8f0',
      card_shadow: true,
      photo_border_radius: '50%'
    }
  },
  [POLICY_TYPES.PAYROLL]: {
    salary_calculation: {
      method: 'percentage_based',
      basic_percentage: 50,
      allowances: [
        { name: 'House Rent Allowance', percentage: 20, is_taxable: true },
        { name: 'Medical Allowance', percentage: 10, is_taxable: false },
        { name: 'Conveyance Allowance', percentage: 5, is_taxable: false }
      ],
      fixed_allowances: [
        { name: 'Dearness Allowance', amount: 2000, is_taxable: true }
      ]
    },
    attendance_rules: {
      late_arrival: {
        enabled: true,
        threshold_count: 3,
        deduction_type: 'daily_salary',
        deduction_value: 1
      },
      full_day_absent: {
        enabled: true,
        deduction_type: 'daily_salary',
        deduction_value: 1,
        require_approval: false
      },
      half_day_absent: {
        enabled: true,
        deduction_type: 'half_daily_salary',
        deduction_value: 0.5,
        require_approval: false
      }
    },
    other_deductions: [
      { name: 'Professional Tax', amount: 200, is_mandatory: true },
      { name: 'Provident Fund', percentage: 12, is_mandatory: true }
    ],
    overtime: {
      enabled: true,
      rate_per_hour: 200,
      multiplier: 1.5
    },
    payroll_settings: {
      salary_day: 30,
      advance_salary_allowed: false,
      advance_percentage_limit: 50,
      loan_deduction_allowed: true
    }
  }
};

export const getFieldsByCardType = (cardType) => {
  if (cardType === 'staff') {
    return STAFF_ID_FIELDS;
  }
  return STUDENT_ID_FIELDS;
};

export const getCardConfigByType = (config, cardType) => {
  if (cardType === 'staff') {
    return {
      ...config,
      fields: config.staff_config?.fields || STAFF_ID_FIELDS,
      footer_text: config.staff_config?.footer_text || "📞 (123) 456-7890  |  ✉ info@schoolname.com"
    };
  }
  return {
    ...config,
    fields: config.student_config?.fields || STUDENT_ID_FIELDS,
    footer_text: config.student_config?.footer_text || "👨‍👩 Parent Helpline: (123) 456-7890"
  };
};