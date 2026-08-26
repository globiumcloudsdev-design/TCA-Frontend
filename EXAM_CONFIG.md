# Exam Constants Configuration

## Overview
All exam types, categories, and configurations are centralized in `/constants/index.js` to ensure consistency across the entire application.

## Exam Types
Located in `EXAM_TYPES` constant:
- `mid_term` - Mid Term Exam
- `final` - Final Exam
- `unit_test` - Unit Test
- `monthly` - Monthly Test
- `weekly` - Weekly Test
- `quarterly` - Quarterly Exam
- `half_yearly` - Half Yearly Exam
- `annual` - Annual Exam
- `entrance` - Entrance Exam
- `practice` - Practice Test
- `quiz` - Quiz
- `assignment` - Assignment Test
- `other` - Other Type

## Exam Categories
Located in `EXAM_CATEGORIES` constant:
- `theory` - Theory Exam
- `practical` - Practical Exam
- `viva` - Viva Exam
- `assignment` - Assignment Based
- `project` - Project Based
- `combined` - Combined Exam

## Usage Examples

### Import Constants
```javascript
import { EXAM_TYPES, EXAM_CATEGORIES } from '@/constants';
```

### Using in Components
```jsx
// In SelectField
<SelectField
  label="Exam Type"
  options={EXAM_TYPES}
  value={formData.type}
  onChange={(v) => setFormData({...formData, type: v})}
/>
```

### Adding Display Mappings (when needed)
If you need to add display colors or extended info:

```javascript
// Create local mapping that references constants
const EXAM_TYPE_DISPLAY = {
  mid_term: { label: 'Mid Term', color: 'bg-blue-100 text-blue-800' },
  final: { label: 'Final', color: 'bg-emerald-100 text-emerald-800' },
  // ... other types
};

// Use in templates
const typeInfo = EXAM_TYPE_DISPLAY[exam.type] || EXAM_TYPE_DISPLAY.other;
```

## Key Files Using Constants
1. **Frontend/src/constants/index.js** - Main constants definition
2. **Frontend/src/app/teacher/exams/create/page.jsx** - Teacher exam creation
3. **Frontend/src/components/forms/ExamForm.jsx** - Exam form component
4. **Frontend/src/components/pages/ExamsPage.jsx** - Admin exam list
5. **Frontend/src/app/teacher/exams/page.jsx** - Teacher exam list

## Benefits
✅ **Single Source of Truth** - All exam types defined in one place
✅ **Easy Maintenance** - Update types in one location affects entire app
✅ **Type Safety** - Ensure consistent enum values across frontend & backend
✅ **Reusability** - Components can import and use directly without duplication
✅ **Consistency** - No duplicate definitions or mismatches

## Backend Alignment
Backend Exam model in `backend/src/models/postgres/Exam.model.js` uses same enum values:
```javascript
type: {
  type: DataTypes.ENUM(
    'mid_term', 'final', 'unit_test', 'monthly', 'weekly',
    'quarterly', 'half_yearly', 'annual', 'entrance', 
    'practice', 'quiz', 'assignment', 'other'
  ),
  defaultValue: 'other'
},
category: {
  type: DataTypes.ENUM('theory', 'practical', 'viva', 'assignment', 'project', 'combined'),
  defaultValue: 'theory'
}
```

## Important: Subject Loading
When creating an exam, subjects are automatically loaded from:
1. Teacher's assigned timetable slots
2. Class subject_details returned by backend
3. Backend's `getMyClasses` endpoint populates `subject_details` with:
   - Subject ID
   - Subject Name
   - Subject Code
   - Syllabus
   - Materials

The frontend should use `subject_details` array (not just subject names) to properly filter subjects by class and section.
