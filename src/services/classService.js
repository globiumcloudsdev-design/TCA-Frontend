
// src/services/classService.js

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';

export const classService = {
  /**
   * Get all classes (automatically resolves all pages for dropdowns/selectors)
   */
  getAll: async (params = {}) => {
    try {
      const { page: explicitPage, fetchAll, all, limit: customLimit, ...restParams } = params;
      const shouldFetchAll = fetchAll === true || all === true || (explicitPage === undefined && params.page === undefined);

      const limit = customLimit || (shouldFetchAll ? 500 : 10);
      const queryParams = shouldFetchAll 
        ? { limit, pageSize: limit, per_page: limit, page: 1, ...restParams }
        : { page: explicitPage || 1, limit, pageSize: limit, per_page: limit, ...restParams };

      const queryString = buildQuery(queryParams);
      const response = await api.get(`/classes${queryString}`);
      const resData = response.data;

      // If the caller requested an explicit page without fetchAll, return as is
      if (!shouldFetchAll) {
        return resData;
      }

      // Check if backend paginated the response
      const pagination = resData?.pagination || resData?.data?.pagination || resData?.meta?.pagination || resData?.meta || {};
      const totalPages = Number(pagination?.totalPages || pagination?.total_pages || resData?.totalPages || resData?.total_pages || 1);
      const currentPage = Number(pagination?.page || pagination?.current_page || resData?.page || 1);

      const initialRows = Array.isArray(resData) 
        ? resData 
        : (Array.isArray(resData?.data?.rows) 
          ? resData.data.rows 
          : (Array.isArray(resData?.data) 
            ? resData.data 
            : (Array.isArray(resData?.rows) ? resData.rows : [])));

      // If there are multiple pages, fetch remaining pages in parallel and combine all classes
      if (totalPages > 1 && currentPage === 1) {
        const remainingPagePromises = [];
        for (let p = 2; p <= totalPages; p++) {
          const nextQuery = buildQuery({ ...queryParams, page: p });
          remainingPagePromises.push(
            api.get(`/classes${nextQuery}`)
              .then(r => {
                const d = r.data;
                return Array.isArray(d)
                  ? d
                  : (Array.isArray(d?.data?.rows)
                    ? d.data.rows
                    : (Array.isArray(d?.data)
                      ? d.data
                      : (Array.isArray(d?.rows) ? d.rows : [])));
              })
              .catch(err => {
                console.warn(`Failed to fetch classes page ${p}:`, err);
                return [];
              })
          );
        }

        const additionalPages = await Promise.all(remainingPagePromises);
        const allRows = [initialRows, ...additionalPages].flat();

        console.log(`📚 [classService.getAll] Loaded all ${allRows.length} classes across ${totalPages} pages.`);

        const paginationPayload = {
          ...pagination,
          total: allRows.length,
          count: allRows.length,
          page: 1,
          limit: allRows.length,
          totalPages: 1,
          total_pages: 1,
        };

        if (Array.isArray(resData)) {
          return allRows;
        }

        if (Array.isArray(resData?.data)) {
          return {
            ...resData,
            data: allRows,
            rows: allRows,
            pagination: paginationPayload,
          };
        }

        if (resData?.data?.rows || resData?.rows) {
          return {
            ...resData,
            data: {
              ...(typeof resData.data === 'object' ? resData.data : {}),
              rows: allRows,
              count: allRows.length,
              total: allRows.length,
            },
            rows: allRows,
            pagination: paginationPayload,
          };
        }

        return {
          ...resData,
          data: allRows,
          rows: allRows,
          pagination: paginationPayload,
        };
      }

      return resData;
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw error;
    }
  },

  /**
   * Get class by ID
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/classes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching class:', error);
      throw error;
    }
  },

  /**
   * Create new class with sections and courses
   * IMPORTANT: Files ko sahi tarike se FormData mein append karna
   */
  create: async (data) => {
    try {
      const formData = new FormData();

      // Log karo kya bhej rahe ho
    console.log('📤 Sending data:', {
      name: data.name,
      description: data.description,
      academic_year_id: data.academic_year_id,
      active: data.active,
      sectionsCount: data.sections?.length,
      coursesCount: data.courses?.length,
      filesCount: data.courses?.reduce((acc, c) => 
        acc + (c.materials?.filter(m => m.file instanceof File).length || 0), 0
      )
    });
      
      // 1. Basic info
      formData.append('name', data.name);
      formData.append('description', data.description || '');
      formData.append('academic_year_id', data.academic_year_id);
      formData.append('active', data.active ? 'true' : 'false');
      
      // 2. Sections as JSON string
      if (data.sections && data.sections.length > 0) {
        // Remove any undefined values
        const cleanSections = data.sections.map(s => ({
          id: s.id,
          name: s.name,
          room_no: s.room_no || null,
          capacity: s.capacity ? Number(s.capacity) : null,
          active: s.active === true || s.active === 'true'
        }));
        formData.append('sections', JSON.stringify(cleanSections));
      } else {
        formData.append('sections', JSON.stringify([]));
      }
      
      // 3. Prepare courses WITHOUT files for JSON
      const coursesForJson = (data.courses || []).map(course => ({
        id: course.id,
        name: course.name,
        course_code: course.code || course.course_code || '',
        description: course.description || '',
        active: course.active === true || course.active === 'true',
        materials: (course.materials || [])
          .filter(m => m.name) // Only include materials with names
          .map(m => ({
            id: m.id,
            name: m.name,
            description: m.description || '',
            active: m.active === true || m.active === 'true',
            // Don't include file in JSON, only pdf_url if exists
            pdf_url: m.pdf_url || undefined
          }))
      }));
      
      formData.append('courses', JSON.stringify(coursesForJson));
      
      // 4. IMPORTANT: Append files with proper naming convention
      // Backend inhe parse karega: course_{index}_material_{index}_filename.pdf
      (data.courses || []).forEach((course, courseIndex) => {
        (course.materials || []).forEach((material, materialIndex) => {
          // Check if material has a new file (File object)
          if (material.file instanceof File) {
            // Create a special filename that backend can parse
            const fileName = `course_${courseIndex}_material_${materialIndex}_${material.file.name}`;
            
            // Append as 'materials' field - backend inhe array mein lega
            formData.append('syllabas', material.file, fileName);
            
            console.log(`📎 Appending file: ${fileName}`);
          }
        });
      });

      // Debug: Log FormData contents
      console.log('📦 FormData being sent:');
      for (let pair of formData.entries()) {
        if (pair[0] === 'materials') {
          console.log(`${pair[0]}: ${pair[1].name} (${pair[1].size} bytes)`);
        } else {
          console.log(`${pair[0]}: ${pair[1].substring?.(0, 100) || pair[1]}`);
        }
      }

      const response = await api.post('/classes', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  },

  /**
   * Update class
   */
  update: async (id, data) => {
    try {
      const formData = new FormData();
      
      // 1. Basic info
      formData.append('name', data.name);
      formData.append('description', data.description || '');
      formData.append('academic_year_id', data.academic_year_id);
      formData.append('active', data.active ? 'true' : 'false');
      
      // 2. Sections as JSON string
      if (data.sections && data.sections.length > 0) {
        const cleanSections = data.sections.map(s => ({
          id: s.id,
          name: s.name,
          room_no: s.room_no || null,
          capacity: s.capacity ? Number(s.capacity) : null,
          active: s.active === true || s.active === 'true'
        }));
        formData.append('sections', JSON.stringify(cleanSections));
      } else {
        formData.append('sections', JSON.stringify([]));
      }
      
      // 3. Prepare courses for JSON
      const coursesForJson = (data.courses || []).map(course => ({
        id: course.id,
        name: course.name,
        course_code: course.code || course.course_code || '',
        description: course.description || '',
        active: course.active === true || course.active === 'true',
        materials: (course.materials || [])
          .filter(m => m.name)
          .map(m => ({
            id: m.id,
            name: m.name,
            description: m.description || '',
            active: m.active === true || m.active === 'true',
            // Include pdf_url if exists (old file), but not the new file
            pdf_url: m.pdf_url || undefined
          }))
      }));
      
      formData.append('courses', JSON.stringify(coursesForJson));
      
      // 4. Append new files
      (data.courses || []).forEach((course, courseIndex) => {
        (course.materials || []).forEach((material, materialIndex) => {
          if (material.file instanceof File) {
            const fileName = `course_${courseIndex}_material_${materialIndex}_${material.file.name}`;
            formData.append('syllabas', material.file, fileName);
            console.log(`📎 Updating with file: ${fileName}`);
          }
        });
      });

      const response = await api.put(`/classes/${id}`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  },

  /**
   * Delete class
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/classes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  },

  /**
   * Toggle class status
   */
  toggleStatus: async (id, isActive) => {
    try {
      const response = await api.patch(`/classes/${id}/toggle-status`, { is_active: isActive });
      return response.data;
    } catch (error) {
      console.error('Error toggling class status:', error);
      throw error;
    }
  },

  /**
   * Get class options for dropdown
   */
  getOptions: async (instituteIdOrParams, academicYearId) => {
    try {
      let params = {};
      if (typeof instituteIdOrParams === 'object' && instituteIdOrParams !== null) {
        params = { ...instituteIdOrParams };
      } else {
        if (instituteIdOrParams) params.institute_id = instituteIdOrParams;
        if (academicYearId) params.academic_year_id = academicYearId;
      }

      // First try /classes/options endpoint
      try {
        const response = await api.get('/classes/options', { params });
        const resData = response?.data;
        const optionsList = Array.isArray(resData?.data)
          ? resData.data
          : (Array.isArray(resData?.data?.rows)
            ? resData.data.rows
            : (Array.isArray(resData) ? resData : []));

        if (optionsList.length > 0) {
          return {
            data: optionsList.map(c => ({
              value: String(c.value || c.id),
              label: c.label || c.name || `Class ${c.id}`,
              id: c.id || c.value,
              name: c.name || c.label,
              sections: c.sections || [],
              ...c,
            }))
          };
        }
      } catch (err) {
        console.warn('Backend /classes/options not available, falling back to getAll:', err?.message);
      }

      // Fallback: fetch all classes and transform into standard options format
      const response = await classService.getAll({
        ...params,
        is_active: true,
        limit: 500,
        fetchAll: true,
      });

      const list = Array.isArray(response)
        ? response
        : (Array.isArray(response?.data?.rows)
          ? response.data.rows
          : (Array.isArray(response?.data)
            ? response.data
            : (Array.isArray(response?.rows) ? response.rows : [])));

      return {
        data: list.map(c => ({
          value: String(c.id || c.value),
          label: c.name || c.label || `Class ${c.id}`,
          id: c.id || c.value,
          name: c.name || c.label,
          sections: c.sections || [],
          ...c,
        }))
      };
    } catch (error) {
      console.error('Error fetching class options:', error);
      return { data: [] };
    }
  }
};