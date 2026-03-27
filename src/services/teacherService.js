// src/services/teacherService.js

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';

export const teacherService = {
  /**
   * Get all teachers
   */
  getAll: async (params = {}) => {
    try {
      const queryString = buildQuery(params);
      const response = await api.get(`/teachers${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teachers:', error);
      throw error;
    }
  },

  /**
   * Get teacher by ID
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/teachers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher:', error);
      throw error;
    }
  },

  /**
   * Get teacher roles for dropdown
   */
  getRoles: async () => {
    try {
      const response = await api.get('/teachers/roles');
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher roles:', error);
      return { data: [] };
    }
  },

  /**
   * Create teacher
   */
  create: async (data) => {
    try {
      const formData = new FormData();
      
      // Basic info
      formData.append('first_name', data.first_name);
      formData.append('last_name', data.last_name);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('alternate_phone', data.alternate_phone || '');
      
      // Identity
      formData.append('employee_id', data.employee_id || '');
      formData.append('cnic', data.cnic || '');
      formData.append('dob', data.dob || '');
      formData.append('gender', data.gender || '');
      formData.append('blood_group', data.blood_group || '');
      formData.append('religion', data.religion || '');
      formData.append('nationality', data.nationality || 'Pakistani');
      
      // Address
      formData.append('present_address', data.present_address || '');
      formData.append('permanent_address', data.permanent_address || '');
      formData.append('city', data.city || '');
      
      // Professional
      formData.append('qualification', data.qualification || '');
      formData.append('specialization', data.specialization || '');
      formData.append('experience_years', data.experience_years || '');
      formData.append('previous_institution', data.previous_institution || '');
      formData.append('subjects', JSON.stringify(data.subjects || []));
      
      // Employment
      formData.append('designation', data.designation || '');
      formData.append('department', data.department || '');
      formData.append('employment_type', data.employment_type || '');
      formData.append('joining_date', data.joining_date || '');
      formData.append('contract_start_date', data.contract_start_date || '');
      formData.append('contract_end_date', data.contract_end_date || '');
      formData.append('salary', data.salary || '');
      
      // Bank
      formData.append('bank_name', data.bank_name || '');
      formData.append('bank_account_no', data.bank_account_no || '');
      formData.append('bank_branch', data.bank_branch || '');
      
      // Emergency
      formData.append('emergency_contact_name', data.emergency_contact_name || '');
      formData.append('emergency_contact_relation', data.emergency_contact_relation || '');
      formData.append('emergency_contact_phone', data.emergency_contact_phone || '');
      
      // Status
      formData.append('status', data.status || 'active');
      
      // Password (for new accounts)
      if (data.password) {
        formData.append('password', data.password);
      }
      formData.append('send_email', data.send_email ? 'true' : 'false');
      
      // Documents
      if (data.documents && data.documents.length > 0) {
        // Filter documents with files
        const docsWithFiles = data.documents.filter(doc => doc.file instanceof File);
        const docsWithoutFiles = data.documents.filter(doc => !(doc.file instanceof File));
        
        // Add document metadata as JSON
        formData.append('documents', JSON.stringify(docsWithoutFiles));
        
        // Append files
        docsWithFiles.forEach((doc, index) => {
          const fileName = `doc_${index}_${doc.file.name}`;
          formData.append('documents', doc.file, fileName);
        });
      } else {
        formData.append('documents', JSON.stringify([]));
      }

      const response = await api.post('/teachers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      return response.data;
      
    } catch (error) {
      console.error('Error creating teacher:', error);
      throw error;
    }
  },

  /**
   * Update teacher
   */
  update: async (id, data) => {
    try {
      const formData = new FormData();
      
      // Same as create but without password fields
      formData.append('first_name', data.first_name);
      formData.append('last_name', data.last_name);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('alternate_phone', data.alternate_phone || '');
      formData.append('employee_id', data.employee_id || '');
      formData.append('cnic', data.cnic || '');
      formData.append('dob', data.dob || '');
      formData.append('gender', data.gender || '');
      formData.append('blood_group', data.blood_group || '');
      formData.append('religion', data.religion || '');
      formData.append('nationality', data.nationality || 'Pakistani');
      formData.append('present_address', data.present_address || '');
      formData.append('permanent_address', data.permanent_address || '');
      formData.append('city', data.city || '');
      formData.append('qualification', data.qualification || '');
      formData.append('specialization', data.specialization || '');
      formData.append('experience_years', data.experience_years || '');
      formData.append('previous_institution', data.previous_institution || '');
      formData.append('subjects', JSON.stringify(data.subjects || []));
      formData.append('designation', data.designation || '');
      formData.append('department', data.department || '');
      formData.append('employment_type', data.employment_type || '');
      formData.append('joining_date', data.joining_date || '');
      formData.append('contract_start_date', data.contract_start_date || '');
      formData.append('contract_end_date', data.contract_end_date || '');
      formData.append('salary', data.salary || '');
      formData.append('bank_name', data.bank_name || '');
      formData.append('bank_account_no', data.bank_account_no || '');
      formData.append('bank_branch', data.bank_branch || '');
      formData.append('emergency_contact_name', data.emergency_contact_name || '');
      formData.append('emergency_contact_relation', data.emergency_contact_relation || '');
      formData.append('emergency_contact_phone', data.emergency_contact_phone || '');
      formData.append('status', data.status || 'active');
      
      // Handle documents same as create
      if (data.documents && data.documents.length > 0) {
        const docsWithFiles = data.documents.filter(doc => doc.file instanceof File);
        const docsWithoutFiles = data.documents.filter(doc => !(doc.file instanceof File));
        
        formData.append('documents', JSON.stringify(docsWithoutFiles));
        
        docsWithFiles.forEach((doc, index) => {
          const fileName = `doc_${index}_${doc.file.name}`;
          formData.append('documents', doc.file, fileName);
        });
      } else {
        formData.append('documents', JSON.stringify([]));
      }

      const response = await api.put(`/teachers/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      return response.data;
      
    } catch (error) {
      console.error('Error updating teacher:', error);
      throw error;
    }
  },

  
  /**
   * ✅ Toggle teacher status (active/inactive)
   */
  toggleStatus: async (id, isActive) => {
    try {
      const response = await api.patch(`/teachers/${id}/toggle-status`, { is_active: isActive });
      return response.data;
    } catch (error) {
      console.error('Error toggling teacher status:', error);
      throw error;
    }
  },

  /**
   * Delete teacher
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/teachers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting teacher:', error);
      throw error;
    }
  },

  /**
   * Regenerate QR code
   */
  regenerateQR: async (id) => {
    try {
      const response = await api.post(`/teachers/${id}/regenerate-qr`);
      return response.data;
    } catch (error) {
      console.error('Error regenerating QR code:', error);
      throw error;
    }
  },

  /**
   * Get teacher options for dropdown
   */
  getOptions: async (params = {}) => {
    try {
      const queryString = buildQuery({ limit: 200, is_active: true, ...params });
      const response = await api.get(`/teachers${queryString}`);
      const list = response.data?.data || [];
      return {
        data: list.map(t => ({
          value: t.id,
          label: `${t.first_name} ${t.last_name}`.trim(),
          email: t.email,
          employee_id: t.registration_no
        }))
      };
    } catch (error) {
      console.error('Error fetching teacher options:', error);
      return { data: [] };
    }
  }
};