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

// Default config templates for each policy type
export const POLICY_CONFIG_TEMPLATES = {
  [POLICY_TYPES.ID_CARD]: {
    layout: 'vertical',
    size: 'CR80',
    fields: [
      { key: 'student_name', label: 'Name', visible: true },
      { key: 'roll_number', label: 'Roll No', visible: true },
      { key: 'class', label: 'Class', visible: true },
      { key: 'photo', visible: true }
    ],
    design: {
      background_color: '#0f172a',
      text_color: '#ffffff',
      logo_position: 'top'
    },
    qr_enabled: true,
    barcode_enabled: false
  },
  [POLICY_TYPES.PAYROLL]: {
    salary_structure: {
      basic_percentage: 50,
      allowances: [
        { name: 'House Rent', percentage: 20 },
        { name: 'Medical', percentage: 10 }
      ]
    },
    deductions: [
      { name: 'Late Fine', type: 'per_day', amount: 100 },
      { name: 'Absence', type: 'per_day', amount: 500 }
    ],
    overtime: {
      enabled: true,
      rate_per_hour: 200
    }
  }
};