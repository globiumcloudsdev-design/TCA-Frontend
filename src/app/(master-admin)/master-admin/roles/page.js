'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Shield, Pencil, Trash2, Search, RefreshCw,
  Building2, GraduationCap, BookOpen, UserCheck,
  Check, X, Copy, AlertCircle, ChevronRight,
  ChevronDown, Lock, Unlock, Sparkles,
  Loader2, Minus, LayoutGrid, List, Key
} from 'lucide-react';
import { toast } from 'sonner';

import { roleService } from '@/services';
import {
  PERM,
  ADMIN_PERMISSION_GROUPS,
  TEACHER_PERMISSION_GROUPS,
  STUDENT_PERMISSION_GROUPS,
  PARENT_PERMISSION_GROUPS,
  ALL_ADMIN_PERMISSIONS,
  ALL_TEACHER_PERMISSIONS,
  ALL_STUDENT_PERMISSIONS,
  ALL_PARENT_PERMISSIONS,
  permLabel,
  parsePermissions,
  isFullAccess,
} from '@/constants/permissions';

import { INSTITUTE_ROLE_TEMPLATES } from '@/config/roleTemplates';

// ✅ Reusable Components
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import StatsCard from '@/components/common/StatsCard';
import StatusBadge from '@/components/common/StatusBadge';
import TableRowActions from '@/components/common/TableRowActions';
import AppModal from '@/components/common/AppModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import InputField from '@/components/common/InputField';
import SelectField from '@/components/common/SelectField';
import TextareaField from '@/components/common/TextareaField';
import PageLoader from '@/components/common/PageLoader';
import ErrorAlert from '@/components/common/ErrorAlert';
import AvatarWithInitials from '@/components/common/AvatarWithInitials';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription , CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// PERMISSION BADGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const PermissionBadge = ({ count, type, isFull }) => {
  if (isFull) {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0">
        <Sparkles className="w-3 h-3 mr-1" />
        Full Access
      </Badge>
    );
  }
  
  if (count === 0) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        No Access
      </Badge>
    );
  }
  
  return (
    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
      {count} Permission{count !== 1 ? 's' : ''}
    </Badge>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// USER TYPE ICON
// ─────────────────────────────────────────────────────────────────────────────
const UserTypeIcon = ({ type, className }) => {
  const icons = {
    instituteAdmin: <Building2 className={className} />,
    teacher: <BookOpen className={className} />,
    student: <GraduationCap className={className} />,
    parent: <UserCheck className={className} />,
  };
  return icons[type] || <Shield className={className} />;
};

// ─────────────────────────────────────────────────────────────────────────────
// PERMISSION PICKER COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const PermissionPicker = ({ 
  userType, 
  groups, 
  allPerms, 
  selected, 
  onChange, 
  isFull, 
  onToggleFull 
}) => {
  const [search, setSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});
  
  const userColors = {
    instituteAdmin: 'purple',
    teacher: 'blue',
    student: 'green',
    parent: 'amber',
  };
  
  const color = userColors[userType] || 'gray';
  
  const toggleGroup = (groupLabel) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupLabel]: !prev[groupLabel]
    }));
  };
  
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groups;
    const q = search.toLowerCase();
    return groups
      .map(g => ({
        ...g,
        perms: g.perms.filter(p => 
          p.toLowerCase().includes(q) || 
          permLabel(p).toLowerCase().includes(q)
        )
      }))
      .filter(g => g.perms.length > 0 || g.label.toLowerCase().includes(q));
  }, [search, groups]);
  
  const handleTogglePermission = (perm) => {
    if (selected.includes(perm)) {
      onChange(selected.filter(p => p !== perm));
    } else {
      onChange([...selected, perm]);
    }
  };
  
  const handleToggleGroup = (groupPerms) => {
    const allSelected = groupPerms.every(p => selected.includes(p));
    if (allSelected) {
      onChange(selected.filter(p => !groupPerms.includes(p)));
    } else {
      const newSelected = [...selected];
      groupPerms.forEach(p => {
        if (!newSelected.includes(p)) newSelected.push(p);
      });
      onChange(newSelected);
    }
  };
  
  const selectedCount = isFull ? allPerms.length : selected.length;
  const progressPercentage = (selectedCount / allPerms.length) * 100;
  
  return (
    <div className="space-y-4">
      {/* Full Access Toggle */}
      <div className={cn(
        "rounded-lg border-2 p-4 transition-colors",
        isFull 
          ? `border-${color}-200 bg-${color}-50` 
          : "border-gray-200 bg-white"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center",
              isFull ? `bg-${color}-200 text-${color}-700` : "bg-gray-100 text-gray-500"
            )}>
              {isFull ? <Sparkles className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
            </div>
            <div>
              <h4 className="font-semibold flex items-center gap-2">
                Full Access Mode
                {isFull && (
                  <Badge className={cn(`bg-${color}-200 text-${color}-700 border-0`)}>
                    Enabled
                  </Badge>
                )}
              </h4>
              <p className="text-xs text-muted-foreground">
                {isFull 
                  ? "User has ALL permissions. Individual selection disabled."
                  : "Toggle ON to grant all permissions at once."}
              </p>
            </div>
          </div>
          <Switch
            checked={isFull}
            onCheckedChange={onToggleFull}
            className={cn(
              isFull && `data-[state=checked]:bg-${color}-600`
            )}
          />
        </div>
      </div>
      
      {/* Selection Progress (when not full) */}
      {!isFull && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white">
                {selectedCount} / {allPerms.length} Selected
              </Badge>
              <Badge variant="outline" className="bg-white">
                {Math.round(progressPercentage)}%
              </Badge>
            </div>
            
            <div className="flex gap-1">
              <Button 
                type="button" 
                size="sm" 
                variant="outline" 
                className="h-7 text-xs"
                onClick={() => onChange([...allPerms])}
              >
                <Check className="h-3 w-3 mr-1" /> All
              </Button>
              <Button 
                type="button" 
                size="sm" 
                variant="outline" 
                className="h-7 text-xs"
                onClick={() => onChange([])}
              >
                <X className="h-3 w-3 mr-1" /> None
              </Button>
            </div>
          </div>
          
          <Progress value={progressPercentage} className="h-1" />
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search permissions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {/* Groups */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {filteredGroups.map((group) => {
                const groupSelectedCount = group.perms.filter(p => selected.includes(p)).length;
                const groupTotal = group.perms.length;
                const allSelected = groupSelectedCount === groupTotal;
                const someSelected = groupSelectedCount > 0 && !allSelected;
                const expanded = expandedGroups[group.label] ?? true;
                
                return (
                  <Card key={group.label} className="overflow-hidden">
                    {/* Group Header */}
                    <div 
                      className={cn(
                        "p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50",
                        allSelected && "bg-green-50",
                        someSelected && "bg-blue-50"
                      )}
                      onClick={() => toggleGroup(group.label)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-5 h-5 rounded border-2 flex items-center justify-center",
                          allSelected && "bg-green-500 border-green-500",
                          someSelected && "bg-blue-200 border-blue-400",
                          !allSelected && !someSelected && "border-gray-300"
                        )}>
                          {allSelected && <Check className="h-3 w-3 text-white" />}
                          {someSelected && <Minus className="h-3 w-3 text-blue-600" />}
                        </div>
                        <span className="text-base">{group.icon}</span>
                        <span className="font-medium">{group.label}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-white">
                          {groupSelectedCount}/{groupTotal}
                        </Badge>
                        {expanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                    
                    {/* Group Permissions */}
                    {expanded && (
                      <div className="p-3 border-t bg-gray-50">
                        {/* Group Actions */}
                        <div className="mb-2 flex justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-6 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleGroup(group.perms);
                            }}
                          >
                            {allSelected ? (
                              <>Deselect All</>
                            ) : (
                              <>Select All</>
                            )}
                          </Button>
                        </div>
                        
                        {/* Permissions Grid */}
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {group.perms.map((perm) => (
                            <label
                              key={perm}
                              className={cn(
                                "flex items-start gap-2 p-2 rounded cursor-pointer transition-colors",
                                selected.includes(perm) 
                                  ? `bg-${color}-50 border border-${color}-200` 
                                  : "hover:bg-gray-100"
                              )}
                            >
                              <input
                                type="checkbox"
                                className="mt-0.5"
                                checked={selected.includes(perm)}
                                onChange={() => handleTogglePermission(perm)}
                              />
                              <div className="flex-1">
                                <p className="text-xs font-medium">
                                  {permLabel(perm)}
                                </p>
                                <p className="text-[10px] text-muted-foreground break-all">
                                  {perm}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
              
              {filteredGroups.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No permissions found</p>
                  <p className="text-sm">Try different search terms</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ROLE CARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const RoleCard = ({ role, onEdit, onDelete, onToggle, onClone, index }) => {
  const [expanded, setExpanded] = useState(false);
  const permissions = parsePermissions(role.permissions);
  
  const userTypes = [
    { key: 'instituteAdmin', label: 'Admin', icon: Building2, color: 'bg-purple-100 text-purple-600' },
    { key: 'teacher', label: 'Teacher', icon: BookOpen, color: 'bg-blue-100 text-blue-600' },
    { key: 'student', label: 'Student', icon: GraduationCap, color: 'bg-green-100 text-green-600' },
    { key: 'parent', label: 'Parent', icon: UserCheck, color: 'bg-amber-100 text-amber-600' },
  ];

  const totalPermissions = Object.values(permissions).flat().length;
  const isActive = role.is_active !== false;

  // Build extra actions for TableRowActions
  const extraActions = [
    {
      label: 'Clone',
      icon: <Copy className="h-4 w-4" />,
      onClick: () => onClone(role)
    },
    {
      label: isActive ? 'Deactivate' : 'Activate',
      icon: isActive ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />,
      onClick: () => onToggle(role),
      variant: isActive ? 'destructive' : 'default'
    }
  ];

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-200 hover:shadow-lg",
      !isActive && "opacity-75 bg-gray-50"
    )}>
      {/* Header with gradient */}
      <div className={cn(
        "h-2 w-full",
        isActive ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gray-300"
      )} />
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {/* ✅ Using AvatarWithInitials */}
            <AvatarWithInitials
              firstName={role.name}
              size="lg"
              className={cn(
                "rounded-xl",
                isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"
              )}
            />
            
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {role.name}
                {role.is_template && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Template
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <code className="px-2 py-0.5 bg-muted rounded text-xs">
                  {role.code}
                </code>
                {/* ✅ Using StatusBadge */}
                <StatusBadge status={isActive ? 'active' : 'inactive'} />
              </CardDescription>
            </div>
          </div>
          
          {/* ✅ Using TableRowActions */}
          <TableRowActions
            onEdit={() => onEdit(role)}
            onDelete={() => onDelete(role)}
            extra={extraActions}
          />
        </div>
        
        {role.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {role.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent>
        {/* User Type Summary */}
        <div className="space-y-2">
          {userTypes.map(({ key, label, icon: Icon, color }) => {
            const perms = permissions[key];
            const full = isFullAccess(perms);
            const count = full ? '∞' : perms.length;
            
            return (
              <div key={key} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={cn("p-1 rounded", color)}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <span>{label}</span>
                </div>
                <PermissionBadge 
                  count={perms.length} 
                  type={key} 
                  isFull={full}
                />
              </div>
            );
          })}
        </div>
        
        {/* Total Stats */}
        <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-muted-foreground">Total Permissions:</span>
              <span className="ml-1 font-bold">{totalPermissions}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Created:</span>
              <span className="ml-1">
                {new Date(role.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-xs"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Show Less' : 'Details'}
            <ChevronRight className={cn(
              "ml-1 h-3 w-3 transition-transform",
              expanded && "rotate-90"
            )} />
          </Button>
        </div>
        
        {/* Expanded Details */}
        {expanded && (
          <div className="mt-3 space-y-2 text-xs border-t pt-3">
            {userTypes.map(({ key, label }) => {
              const perms = permissions[key];
              if (isFullAccess(perms)) {
                return (
                  <div key={key} className="flex items-start gap-2">
                    <span className="font-medium min-w-[80px]">{label}:</span>
                    <span className="text-emerald-600">Full Access (All permissions)</span>
                  </div>
                );
              }
              if (perms.length === 0) {
                return (
                  <div key={key} className="flex items-start gap-2">
                    <span className="font-medium min-w-[80px]">{label}:</span>
                    <span className="text-gray-400">No permissions</span>
                  </div>
                );
              }
              return (
                <div key={key} className="flex items-start gap-2">
                  <span className="font-medium min-w-[80px]">{label}:</span>
                  <div className="flex-1 flex flex-wrap gap-1">
                    {perms.slice(0, 3).map(p => (
                      <Badge key={p} variant="outline" className="text-[10px]">
                        {permLabel(p)}
                      </Badge>
                    ))}
                    {perms.length > 3 && (
                      <Badge variant="outline" className="text-[10px]">
                        +{perms.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t bg-muted/20 p-2">
        <div className="flex w-full gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 h-8 text-xs"
            onClick={() => onEdit(role)}
          >
            <Pencil className="mr-1 h-3 w-3" /> Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 h-8 text-xs"
            onClick={() => onToggle(role)}
          >
            {isActive ? (
              <>
                <Lock className="mr-1 h-3 w-3" /> Deactivate
              </>
            ) : (
              <>
                <Unlock className="mr-1 h-3 w-3" /> Activate
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ROLE FORM MODAL
// ─────────────────────────────────────────────────────────────────────────────
const RoleFormModal = ({ open, onClose, role, onSubmit, loading }) => {
  const isEdit = !!role?.id;
  const [activeTab, setActiveTab] = useState('basic');
  
  // Permission States
  const [adminPerms, setAdminPerms] = useState([]);
  const [teacherPerms, setTeacherPerms] = useState([]);
  const [studentPerms, setStudentPerms] = useState([]);
  const [parentPerms, setParentPerms] = useState([]);
  
  const [adminFull, setAdminFull] = useState(false);
  const [teacherFull, setTeacherFull] = useState(false);
  const [studentFull, setStudentFull] = useState(false);
  const [parentFull, setParentFull] = useState(false);
  
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      code: '',
      description: '',
    }
  });
  
  // Initialize from role data
  useMemo(() => {
    if (open && role) {
      reset({
        name: role.name || '',
        code: role.code || '',
        description: role.description || '',
      });
      
      const perms = parsePermissions(role.permissions);
      
      setAdminPerms(isFullAccess(perms.instituteAdmin) ? [] : perms.instituteAdmin);
      setTeacherPerms(isFullAccess(perms.teacher) ? [] : perms.teacher);
      setStudentPerms(isFullAccess(perms.student) ? [] : perms.student);
      setParentPerms(isFullAccess(perms.parent) ? [] : perms.parent);
      
      setAdminFull(isFullAccess(perms.instituteAdmin));
      setTeacherFull(isFullAccess(perms.teacher));
      setStudentFull(isFullAccess(perms.student));
      setParentFull(isFullAccess(perms.parent));
    } else if (open) {
      reset({ name: '', code: '', description: '' });
      setAdminPerms([]);
      setTeacherPerms([]);
      setStudentPerms([]);
      setParentPerms([]);
      setAdminFull(false);
      setTeacherFull(false);
      setStudentFull(false);
      setParentFull(false);
    }
  }, [open, role, reset]);
  
  const handleFormSubmit = (data) => {
    // Generate code if empty
    const code = data.code || data.name.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
    
    const permissions = {
      instituteAdmin: adminFull ? ALL_ADMIN_PERMISSIONS : adminPerms,
      teacher: teacherFull ? ALL_TEACHER_PERMISSIONS : teacherPerms,
      student: studentFull ? ALL_STUDENT_PERMISSIONS : studentPerms,
      parent: parentFull ? ALL_PARENT_PERMISSIONS : parentPerms,
    };
    
    onSubmit({
      ...data,
      code,
      permissions,
    });
  };
  
  const applyTemplate = (templateKey) => {
    const template = INSTITUTE_ROLE_TEMPLATES[templateKey];
    if (!template) return;
    
    setValue('name', template.name);
    setValue('description', template.description);
    
    const perms = parsePermissions(template.permissions);
    
    setAdminPerms(perms.instituteAdmin);
    setTeacherPerms(perms.teacher);
    setStudentPerms(perms.student);
    setParentPerms(perms.parent);
    
    setAdminFull(false);
    setTeacherFull(false);
    setStudentFull(false);
    setParentFull(false);
    
    toast.success('Template applied!');
  };
  
  const templates = [
    { key: 'school', label: 'School', icon: '🏫', desc: 'Standard school setup' },
    { key: 'coaching', label: 'Coaching', icon: '📚', desc: 'Tuition center / coaching' },
    { key: 'academy', label: 'Academy', icon: '🎓', desc: 'Professional academy' },
    { key: 'college', label: 'College', icon: '🏛️', desc: 'Degree college' },
    { key: 'university', label: 'University', icon: '🏛️', desc: 'University setup' },
  ];
  
  const watchedName = watch('name');
  
  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {isEdit ? (
            <>
              <Pencil className="h-5 w-5" /> Edit Role: {role?.name}
            </>
          ) : (
            <>
              <Plus className="h-5 w-5" /> Create New Role
            </>
          )}
        </div>
      }
      description={isEdit 
        ? 'Update role details and permissions' 
        : 'Define a new platform role with custom permissions'}
      size="xl"
      className="max-h-[90vh] overflow-hidden p-0"
    >
      {/* Template Bar (for new roles) */}
      {!isEdit && (
        <div className="px-6 py-3 bg-blue-50 border-b flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Sparkles className="h-4 w-4" />
            <span>Quick start with templates:</span>
          </div>
          <div className="flex gap-2">
            {templates.map(t => (
              <Button
                key={t.key}
                type="button"
                size="sm"
                variant="outline"
                className="bg-white text-xs h-7"
                onClick={() => applyTemplate(t.key)}
              >
                <span className="mr-1">{t.icon}</span>
                {t.label}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
        <div className="px-6 border-b">
          <TabsList>
            <TabsTrigger value="basic" className="gap-2">
              <Shield className="h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="admin" className="gap-2">
              <Building2 className="h-4 w-4" />
              Admin
            </TabsTrigger>
            <TabsTrigger value="teacher" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Teacher
            </TabsTrigger>
            <TabsTrigger value="student" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              Student
            </TabsTrigger>
            <TabsTrigger value="parent" className="gap-2">
              <UserCheck className="h-4 w-4" />
              Parent
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex-1 overflow-auto p-6">
          {/* Basic Info Tab */}
          <TabsContent value="basic" className="mt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* ✅ Using InputField */}
              <InputField
                label="Role Name"
                name="name"
                register={register}
                error={errors.name}
                required
                placeholder="e.g., School Principal, Head Master"
              />
              
              <InputField
                label="Role Code"
                name="code"
                register={register}
                placeholder={watchedName ? watchedName.toUpperCase().replace(/\s+/g, '_') : 'SCHOOL_PRINCIPAL'}
                hint="Auto-generated from name if empty"
              />
            </div>
            
            {/* ✅ Using TextareaField */}
            <TextareaField
              label="Description"
              name="description"
              register={register}
              placeholder="Describe what this role is for..."
              rows={4}
            />
            
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-3 pt-4">
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-purple-600" />
                    <span className="text-xs text-purple-600">Admin</span>
                  </div>
                  <p className="text-lg font-bold text-purple-700 mt-1">
                    {adminFull ? '∞' : adminPerms.length}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span className="text-xs text-blue-600">Teacher</span>
                  </div>
                  <p className="text-lg font-bold text-blue-700 mt-1">
                    {teacherFull ? '∞' : teacherPerms.length}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-600">Student</span>
                  </div>
                  <p className="text-lg font-bold text-green-700 mt-1">
                    {studentFull ? '∞' : studentPerms.length}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-amber-600" />
                    <span className="text-xs text-amber-600">Parent</span>
                  </div>
                  <p className="text-lg font-bold text-amber-700 mt-1">
                    {parentFull ? '∞' : parentPerms.length}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Permission Tabs */}
          <TabsContent value="admin" className="mt-0">
            <PermissionPicker
              userType="instituteAdmin"
              groups={ADMIN_PERMISSION_GROUPS}
              allPerms={ALL_ADMIN_PERMISSIONS}
              selected={adminPerms}
              onChange={setAdminPerms}
              isFull={adminFull}
              onToggleFull={() => setAdminFull(!adminFull)}
            />
          </TabsContent>
          
          <TabsContent value="teacher" className="mt-0">
            <PermissionPicker
              userType="teacher"
              groups={TEACHER_PERMISSION_GROUPS}
              allPerms={ALL_TEACHER_PERMISSIONS}
              selected={teacherPerms}
              onChange={setTeacherPerms}
              isFull={teacherFull}
              onToggleFull={() => setTeacherFull(!teacherFull)}
            />
          </TabsContent>
          
          <TabsContent value="student" className="mt-0">
            <PermissionPicker
              userType="student"
              groups={STUDENT_PERMISSION_GROUPS}
              allPerms={ALL_STUDENT_PERMISSIONS}
              selected={studentPerms}
              onChange={setStudentPerms}
              isFull={studentFull}
              onToggleFull={() => setStudentFull(!studentFull)}
            />
          </TabsContent>
          
          <TabsContent value="parent" className="mt-0">
            <PermissionPicker
              userType="parent"
              groups={PARENT_PERMISSION_GROUPS}
              allPerms={ALL_PARENT_PERMISSIONS}
              selected={parentPerms}
              onChange={setParentPerms}
              isFull={parentFull}
              onToggleFull={() => setParentFull(!parentFull)}
            />
          </TabsContent>
        </div>
      </Tabs>
      
      <div className="px-6 py-4 border-t bg-muted/20 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {activeTab !== 'basic' && (
            <>
              {activeTab === 'admin' && `Admin: ${adminFull ? 'Full Access' : adminPerms.length + ' permissions'}`}
              {activeTab === 'teacher' && `Teacher: ${teacherFull ? 'Full Access' : teacherPerms.length + ' permissions'}`}
              {activeTab === 'student' && `Student: ${studentFull ? 'Full Access' : studentPerms.length + ' permissions'}`}
              {activeTab === 'parent' && `Parent: ${parentFull ? 'Full Access' : parentPerms.length + ' permissions'}`}
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit(handleFormSubmit)} 
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Role'}
          </Button>
        </div>
      </div>
    </AppModal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function MasterRolesPage() {
  const queryClient = useQueryClient();
  
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toggleTarget, setToggleTarget] = useState(null);
  const [cloneTarget, setCloneTarget] = useState(null);
  
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['master-roles', search],
    queryFn: () => roleService.getAll({ search: search || undefined, limit: 100 }),
  });
  
  const roles = data?.data?.rows ?? data?.data ?? [];
  const totalCount = data?.data?.total ?? roles.length;
  const activeCount = roles.filter(r => r.is_active !== false).length;
  
  const createMutation = useMutation({
    mutationFn: (body) => roleService.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-roles'] });
      toast.success('Role created successfully!');
      setCreateOpen(false);
      setCloneTarget(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to create role');
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => roleService.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-roles'] });
      toast.success('Role updated successfully!');
      setEditTarget(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update role');
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id) => roleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-roles'] });
      toast.success('Role deleted successfully!');
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete role');
    }
  });
  
  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => roleService.update(id, { is_active }),
    onSuccess: (_, { is_active }) => {
      queryClient.invalidateQueries({ queryKey: ['master-roles'] });
      toast.success(is_active ? 'Role activated' : 'Role deactivated');
      setToggleTarget(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to toggle role');
    }
  });
  
  const filteredRoles = useMemo(() => {
    if (!search) return roles;
    return roles.filter(r => 
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.code?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase())
    );
  }, [roles, search]);
  
  const handleFormSubmit = (data) => {
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, body: data });
    } else {
      createMutation.mutate(data);
    }
  };
  
  const handleClone = (role) => {
    setCloneTarget({
      ...role,
      name: `${role.name} (Copy)`,
      code: `${role.code}_COPY`,
    });
    setCreateOpen(true);
  };
  
  // ✅ Table columns for DataTable view
  const column = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Role',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <AvatarWithInitials
            firstName={row.original.name}
            size="sm"
            className={cn(
              "rounded-md",
              row.original.is_active !== false ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"
            )}
          />
          <div>
            <p className="font-medium">{row.original.name}</p>
            {row.original.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">{row.original.description}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <code className="px-2 py-1 bg-muted rounded text-xs">{row.original.code}</code>
      ),
    },
    {
      id: 'permissions',
      header: 'Permissions',
      cell: ({ row }) => {
        const perms = parsePermissions(row.original.permissions);
        return (
          <div className="flex gap-1">
            <Badge variant="outline" className="bg-purple-50">
              A: {isFullAccess(perms.instituteAdmin) ? '∞' : perms.instituteAdmin.length}
            </Badge>
            <Badge variant="outline" className="bg-blue-50">
              T: {isFullAccess(perms.teacher) ? '∞' : perms.teacher.length}
            </Badge>
            <Badge variant="outline" className="bg-green-50">
              S: {isFullAccess(perms.student) ? '∞' : perms.student.length}
            </Badge>
            <Badge variant="outline" className="bg-amber-50">
              P: {isFullAccess(perms.parent) ? '∞' : perms.parent.length}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.is_active !== false ? 'active' : 'inactive'} />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const role = row.original;
        const isActive = role.is_active !== false;
        
        const extraActions = [
          {
            label: 'Clone',
            icon: <Copy className="h-4 w-4" />,
            onClick: () => handleClone(role)
          },
          {
            label: isActive ? 'Deactivate' : 'Activate',
            icon: isActive ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />,
            onClick: () => setToggleTarget(role),
            variant: isActive ? 'destructive' : 'default'
          }
        ];
        
        return (
          <TableRowActions
            onEdit={() => setEditTarget(role)}
            onDelete={() => setDeleteTarget(role)}
            extra={extraActions}
          />
        );
      },
    },
  ], []);
  
  // Loading state
  if (isLoading && !data) {
    return <PageLoader message="Loading roles..." />;
  }
  
  return (
    <div className="container space-y-6">
      {/* ✅ Using PageHeader */}
      <PageHeader
        title="Roles & Permissions"
        description="Manage platform roles and their permissions"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={cn("h-4 w-4 mr-2", isFetching && "animate-spin")} />
              Refresh
            </Button>
            <Button onClick={() => setCreateOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Role
            </Button>
          </div>
        }
      />
      
      {/* ✅ Error Alert */}
      <ErrorAlert message={error?.message} onRetry={refetch} />
      
      {/* ✅ Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          label="Total Roles"
          value={totalCount}
          icon={<Shield className="h-5 w-5" />}
          loading={isLoading}
        />
        <StatsCard
          label="Active Roles"
          value={activeCount}
          icon={<Unlock className="h-5 w-5" />}
          description={`${Math.round((activeCount / totalCount) * 100)}% of total`}
          loading={isLoading}
        />
        <StatsCard
          label="Inactive Roles"
          value={totalCount - activeCount}
          icon={<Lock className="h-5 w-5" />}
          loading={isLoading}
        />
        <StatsCard
          label="Total Permissions"
          value={Object.keys(PERM).length}
          icon={<Key className="h-5 w-5" />}
          loading={isLoading}
        />
      </div>
      
      {/* Search and View Toggle */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search roles by name, code, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex items-center gap-2 border rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Empty State */}
      {!isLoading && filteredRoles.length === 0 && (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center text-center">
            <Shield className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-semibold">No roles found</h3>
            <p className="text-muted-foreground mt-1">
              {search ? 'Try different search terms' : 'Create your first role to get started'}
            </p>
            {!search && (
              <Button className="mt-4" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Roles Grid/List */}
      {!isLoading && filteredRoles.length > 0 && (
        viewMode === 'grid' ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRoles.map((role, index) => (
              <RoleCard
                key={role.id}
                role={role}
                index={index}
                onEdit={setEditTarget}
                onDelete={setDeleteTarget}
                onToggle={setToggleTarget}
                onClone={handleClone}
              />
            ))}
          </div>
        ) : (
          <DataTable
            columns={column}
            data={filteredRoles}
            loading={isLoading}
            search={search}
            onSearch={setSearch}
            searchPlaceholder="Search roles..."
            enableColumnVisibility
            exportConfig={{
              fileName: 'roles',
              dateField: 'created_at'
            }}
            emptyMessage="No roles found"
          />
        )
      )}
      
      {/* Modals */}
      <RoleFormModal
        key={editTarget?.id || cloneTarget?.id || 'create'}
        open={createOpen || !!editTarget}
        onClose={() => {
          setCreateOpen(false);
          setEditTarget(null);
          setCloneTarget(null);
        }}
        role={editTarget || cloneTarget}
        onSubmit={handleFormSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />
      
      {/* ✅ Using ConfirmDialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
        title="Delete Role"
        description={
          <>
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
            <br />
            <span className="text-xs text-muted-foreground">
              This action cannot be undone. Institutes using this role may be affected.
            </span>
          </>
        }
        confirmLabel="Delete"
        variant="destructive"
      />
      
      <ConfirmDialog
        open={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={() => toggleMutation.mutate({ 
          id: toggleTarget.id, 
          is_active: !toggleTarget.is_active 
        })}
        loading={toggleMutation.isPending}
        title={toggleTarget?.is_active ? 'Deactivate Role' : 'Activate Role'}
        description={
          <>
            {toggleTarget?.is_active ? 'Deactivate' : 'Activate'} <strong>{toggleTarget?.name}</strong>?
            <br />
            <span className="text-xs text-muted-foreground">
              {toggleTarget?.is_active 
                ? 'Deactivated roles cannot be used by institutes.' 
                : 'Activated roles will be available for institutes.'}
            </span>
          </>
        }
        confirmLabel={toggleTarget?.is_active ? 'Deactivate' : 'Activate'}
        variant={toggleTarget?.is_active ? 'destructive' : 'default'}
      />
    </div>
  );
}