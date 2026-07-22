'use client';
import { useState, useMemo, useEffect } from 'react';
import { 
  Globe, Layout, HelpCircle, Star, Save, Plus, Trash2, Edit2, 
  Image as ImageIcon, Type, Sparkles, Video, Calculator, Map,
  CheckCircle2, Play, DollarSign, ArrowRight, Settings2, Edit,
  Facebook, Instagram, Twitter, Linkedin, Link2, Share2, Info,
  Youtube, Monitor, Megaphone, Building2, Eye, EyeOff, Clock, Timer,
  Search, ShieldCheck, Database, RefreshCw, Send, Smartphone, Mail, Fingerprint, GraduationCap, Calendar, Users
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { 
  AppModal, InputField, TextareaField, FormSubmitButton, DataTable, SelectField, 
  ConfirmDialog, PageHeader, TableRowActions, ColorPickerField, CmsImageUploader
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { masterAdminService } from '@/services';

export default function WebsiteCMSPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('preview'); // Set Landing Preview as default tab
  const [showModal, setShowModal] = useState(false);
  
  // Delete Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Status Toggle Dialog states
  const [showToggleDialog, setShowToggleDialog] = useState(false);
  const [togglingItem, setTogglingItem] = useState(null);

  const [modalType, setModalType] = useState('faq'); 
  const [editingItem, setEditingItem] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sync state loader
  const [isSyncing, setIsSyncing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState('Not Synced Yet');

  // Preview modals for policy simulation
  const [previewPolicyModal, setPreviewPolicyModal] = useState(null); // 'privacy' or 'delete'

  // --- STATE DEFINITIONS (REAL-TIME CLOUD-SYNCED STATES) ---
  const [branding, setBranding] = useState({
    primaryColor: '#4F46E5',
    secondaryColor: '#0F172A'
  });

  const [heroConfig, setHeroConfig] = useState({
    title: '',
    subtitle: '',
    primaryBtn: '',
    secondaryBtn: '',
    mockupAsset: '',
    mockupPublicId: ''
  });

  const [studentCount, setStudentCount] = useState(500);
  const [pricingConfig, setPricingConfig] = useState({
    basePrice: 0,
    perStudentRate: 0,
    discountThreshold: 0,
    discountPercentage: 0
  });

  const [countdown, setCountdown] = useState({
    title: '',
    endDate: '',
    description: '',
    active: false,
    buttonText: '',
    buttonLink: ''
  });

  const [faqs, setFaqs] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [roadmap, setRoadmap] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);
  const [videos, setVideos] = useState([]);
  const [banners, setBanners] = useState([]);
  const [partners, setPartners] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [features, setFeatures] = useState([]);
  
  // Flexible About Sections Array state
  const [aboutSections, setAboutSections] = useState([]);

  const [seoConfig, setSeoConfig] = useState({
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    googleAnalyticsId: '',
    facebookPixelId: '',
    activeFavicon: '',
    activeOgImage: ''
  });
  const [leads, setLeads] = useState([]);

  // Privacy Policy and Account Deletion Policy states
  const [privacyPolicy, setPrivacyPolicy] = useState({
    title: '',
    lastUpdated: '',
    aboutPlatform: '',
    content: ''
  });

  const [accountDeletePolicy, setAccountDeletePolicy] = useState({
    title: '',
    lastUpdated: '',
    content: ''
  });

  // Helper function to fetch CMS data from Postgres
  const fetchCmsData = async (silent = false) => {
    try {
      if (!silent) setIsSyncing(true);
      const data = await masterAdminService.getWebsiteCms();
      if (data) {
        if (data.branding) setBranding(data.branding);
        if (data.hero) setHeroConfig(data.hero);
        if (data.pricing) setPricingConfig(data.pricing);
        if (data.countdown) setCountdown(data.countdown);
        if (data.faq) setFaqs(data.faq);
        if (data.testimonials) setTestimonials(data.testimonials);
        if (data.roadmap) setRoadmap(data.roadmap);
        if (data.social) setSocialLinks(data.social);
        if (data.videos) setVideos(data.videos);
        if (data.banners) setBanners(data.banners);
        if (data.partners) setPartners(data.partners);
        if (data.announcements) setAnnouncements(data.announcements);
        if (data.features) setFeatures(data.features);
        if (data.about_sections) setAboutSections(data.about_sections);
        if (data.seo) setSeoConfig(data.seo);
        if (data.leads) setLeads(data.leads);
        if (data.privacy_policy) setPrivacyPolicy(data.privacy_policy);
        if (data.account_delete_policy) setAccountDeletePolicy(data.account_delete_policy);
        
        const now = new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSyncedTime(`at ${now}`);
        if (!silent) {
          toast.success('Successfully loaded live settings from PostgreSQL!');
        }
      }
    } catch (err) {
      console.error('Failed to load CMS configurations from Postgres:', err);
      if (!silent) {
        toast.error('Offline mode: Could not fetch configurations from database.');
      }
    } finally {
      if (!silent) setIsSyncing(false);
    }
  };

  // Load from Postgres on mount & on activeTab changes
  useEffect(() => {
    setMounted(true);
    fetchCmsData(false);
  }, [activeTab]);

  // Buttery-smooth automatic background sync when window is refocused!
  useEffect(() => {
    const handleFocus = () => {
      // Sync silently in the background
      fetchCmsData(true);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Reset page when switching tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const estimatedTotal = useMemo(() => {
    const studentCost = studentCount * (pricingConfig.perStudentRate || 0);
    let total = (pricingConfig.basePrice || 0) + studentCost;
    if (pricingConfig.discountThreshold && studentCount >= pricingConfig.discountThreshold) {
      total -= total * ((pricingConfig.discountPercentage || 0) / 100);
    }
    return Math.round(total);
  }, [studentCount, pricingConfig]);

  const { register, control, handleSubmit, reset } = useForm();

  // --- LOCAL LIST PAGINATOR HELPERS ---
  const paginateList = (list) => {
    const startIndex = (currentPage - 1) * pageSize;
    return list.slice(startIndex, startIndex + pageSize);
  };

  const getPaginationProps = (list) => {
    const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
    return {
      page: currentPage,
      totalPages: totalPages,
      total: list.length,
      pageSize: pageSize,
      onPageChange: (newPage) => setCurrentPage(newPage),
      onPageSizeChange: (newPageSize) => {
        setPageSize(newPageSize);
        setCurrentPage(1); 
      }
    };
  };

  // --- INDIVIDUAL SECTION PERSISTENCE ENGINE ---
  const saveKeyToDb = async (key, value) => {
    try {
      setIsSyncing(true);
      await masterAdminService.updateWebsiteCms(key, value);
      const now = new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSyncedTime(`at ${now}`);
      toast.success(`Successfully saved ${key.toUpperCase()} section directly to PostgreSQL!`);
    } catch (err) {
      console.error(`Failed to save CMS config [${key}] in Postgres:`, err);
      toast.error(`Database connection issue: could not save ${key} section.`);
    } finally {
      setIsSyncing(false);
    }
  };

  // --- INTERACTIVE HERO IMAGE UPLOAD HANDLER ---
  const handleHeroImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      toast.info('Uploading mockup image to Cloudinary under the-clouds-academy/website-cms/hero...');
      const uploadRes = await masterAdminService.uploadCmsImage(file, 'hero', heroConfig.mockupPublicId);
      
      const newConfig = {
        ...heroConfig,
        mockupAsset: uploadRes.url,
        mockupPublicId: uploadRes.publicId
      };
      setHeroConfig(newConfig);
      await saveKeyToDb('hero', newConfig);
      toast.success('Mockup image successfully uploaded and saved to PostgreSQL!');
    } catch (err) {
      console.error('Failed to upload hero image:', err);
      toast.error('Mockup image upload failed. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  // --- GLOBAL FORCE SYNC DEPLOY ENGINE ---
  const handleCloudSync = async () => {
    try {
      setIsSyncing(true);
      const bulkPayload = {
        branding,
        hero: heroConfig,
        pricing: pricingConfig,
        countdown,
        faq: faqs,
        testimonials,
        roadmap,
        social: socialLinks,
        videos,
        banners,
        partners,
        announcements,
        features,
        about_sections: aboutSections,
        seo: seoConfig,
        leads,
        privacy_policy: privacyPolicy,
        account_delete_policy: accountDeletePolicy
      };

      await masterAdminService.bulkUpdateWebsiteCms(bulkPayload);

      const now = new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSyncedTime(`at ${now}`);
      toast.success('Successfully synchronized and deployed all CMS changes to Neon PostgreSQL database!');
    } catch (err) {
      console.error('Failed to perform global sync:', err);
      toast.error('Global synchronization failed. Please check network/database credentials.');
    } finally {
      setIsSyncing(false);
    }
  };

  // --- HANDLERS ---
  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    if (item) {
      const formattedItem = { ...item };
      if (formattedItem.active !== undefined) formattedItem.active = String(formattedItem.active);
      reset(formattedItem);
    } else {
      reset({ 
        question: '', answer: '', name: '', role: '', school: '', content: '', videoUrl: '', 
        title: '', status: 'Planning', eta: '', platform: 'Facebook', url: '', 
        desc: '', category: 'General', imageUrl: '', imageUrlPublicId: '', link: '', active: 'true', text: '', color: '#2563eb',
        badge: 'Default', icon: 'Fingerprint', schoolName: '', phone: '', email: '', logoUrl: '', logoUrlPublicId: ''
      });
    }
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    if (modalType === 'countdown') {
      const update = { ...data, active: data.active === 'true' };
      setCountdown(update);
      await saveKeyToDb('countdown', update);
      return;
    }
    if (modalType === 'hero') {
      setHeroConfig(data);
      await saveKeyToDb('hero', data);
      return;
    }
    if (modalType === 'seo') {
      setSeoConfig(data);
      await saveKeyToDb('seo', data);
      return;
    }

    const stateMap = {
      faq: [faqs, setFaqs, 'faq'],
      testimonial: [testimonials, setTestimonials, 'testimonials'],
      roadmap: [roadmap, setRoadmap, 'roadmap'],
      social: [socialLinks, setSocialLinks, 'social'],
      video: [videos, setVideos, 'videos'],
      banner: [banners, setBanners, 'banners'],
      partner: [partners, setPartners, 'partners'],
      announcement: [announcements, setAnnouncements, 'announcements'],
      feature: [features, setFeatures, 'features'],
      about: [aboutSections, setAboutSections, 'about_sections'],
      lead: [leads, setLeads, 'leads']
    };

    const [currentList, setListSetter, dbKey] = stateMap[modalType] || [];
    if (currentList && setListSetter && dbKey) {
      let updatedList = [];
      const formattedData = {
        ...data,
        ...(data.active !== undefined ? { active: data.active === 'true' } : {})
      };

      if (editingItem) {
        updatedList = currentList.map(item => item.id === editingItem.id ? { ...item, ...formattedData } : item);
      } else {
        const newItem = {
          ...formattedData,
          id: Date.now(),
          ...(modalType === 'lead' ? { date: new Date().toISOString(), status: 'New' } : {})
        };
        updatedList = [...currentList, newItem];
      }
      
      setListSetter(updatedList);
      setShowModal(false);
      await saveKeyToDb(dbKey, updatedList);
    }
  };

  // --- TRIGGER TOGGLE ACTIVE CONFIRMATION ---
  const triggerToggleActive = (type, item) => {
    setModalType(type);
    setTogglingItem(item);
    setShowToggleDialog(true);
  };

  const handleToggleActiveConfirm = async () => {
    const stateMap = {
      banner: [banners, setBanners, 'banners'],
      announcement: [announcements, setAnnouncements, 'announcements'],
      about: [aboutSections, setAboutSections, 'about_sections'],
      feature: [features, setFeatures, 'features'],
      faq: [faqs, setFaqs, 'faq'],
      testimonial: [testimonials, setTestimonials, 'testimonials'],
      roadmap: [roadmap, setRoadmap, 'roadmap'],
      social: [socialLinks, setSocialLinks, 'social'],
      partner: [partners, setPartners, 'partners'],
      video: [videos, setVideos, 'videos']
    };

    const [currentList, setListSetter, dbKey] = stateMap[modalType] || [];
    if (currentList && setListSetter && dbKey && togglingItem) {
      const updatedList = currentList.map(item => 
        item.id === togglingItem.id ? { ...item, active: !item.active } : item
      );
      setListSetter(updatedList);
      setShowToggleDialog(false);
      await saveKeyToDb(dbKey, updatedList);
      toast.success(`Successfully ${!togglingItem.active ? 'Activated' : 'Deactivated'} item in real-time!`);
    }
  };

  const confirmDelete = (type, id) => {
    setModalType(type);
    setDeletingId(id);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    const stateMap = {
      faq: [faqs, setFaqs, 'faq'],
      testimonial: [testimonials, setTestimonials, 'testimonials'],
      roadmap: [roadmap, setRoadmap, 'roadmap'],
      social: [socialLinks, setSocialLinks, 'social'],
      video: [videos, setVideos, 'videos'],
      banner: [banners, setBanners, 'banners'],
      partner: [partners, setPartners, 'partners'],
      announcement: [announcements, setAnnouncements, 'announcements'],
      feature: [features, setFeatures, 'features'],
      about: [aboutSections, setAboutSections, 'about_sections'],
      lead: [leads, setLeads, 'leads']
    };

    const [currentList, setListSetter, dbKey] = stateMap[modalType] || [];
    if (currentList && setListSetter && dbKey) {
      const updatedList = currentList.filter(item => item.id !== deletingId);
      setListSetter(updatedList);
      setShowDeleteDialog(false);
      await saveKeyToDb(dbKey, updatedList);
    }
  };

  const handleConfigChange = (field, value) => {
    setPricingConfig(prev => ({ ...prev, [field]: Number(value) }));
  };

  const handleLeadStatusChange = async (leadId, newStatus) => {
    const updated = leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l);
    setLeads(updated);
    await saveKeyToDb('leads', updated);
    toast.success(`Lead status updated to ${newStatus}`);
  };

  const tabs = [
    { id: 'preview', label: '👁️ Live Landing Preview', icon: Eye },
    { id: 'hero', label: 'Hero', icon: Layout },
    { id: 'about', label: 'About Us Sections', icon: Info },
    { id: 'features', label: 'Features Editor', icon: Sparkles },
    { id: 'pricing', label: 'Calculator', icon: Calculator },
    { id: 'countdown', label: 'Countdown', icon: Timer },
    { id: 'banners', label: 'Banners', icon: Monitor },
    { id: 'videos', label: 'Video Gallery', icon: Youtube },
    { id: 'announcements', label: 'News Bar', icon: Megaphone },
    { id: 'partners', label: 'Partners', icon: Building2 },
    { id: 'testimonials', label: 'Success Stories', icon: Video },
    { id: 'roadmap', label: 'Roadmap', icon: Map },
    { id: 'social', label: 'Social Links', icon: Share2 },
    { id: 'faq', label: 'FAQs', icon: HelpCircle },
    { id: 'seo', label: 'SEO & Analytics', icon: Search },
    { id: 'policies', label: 'Privacy & Policies', icon: ShieldCheck },
    { id: 'leads', label: 'Inquiries & Leads', icon: Users }
  ];

  // Helper to map and render Lucide Icons dynamically inside features grid mockup
  const renderFeatureIcon = (iconName) => {
    const map = {
      Fingerprint: <Fingerprint className="w-8 h-8" style={{ color: branding.primaryColor }} />,
      GraduationCap: <GraduationCap className="w-8 h-8" style={{ color: branding.primaryColor }} />,
      DollarSign: <DollarSign className="w-8 h-8" style={{ color: branding.primaryColor }} />,
      Calendar: <Calendar className="w-8 h-8" style={{ color: branding.primaryColor }} />,
      ShieldCheck: <ShieldCheck className="w-8 h-8" style={{ color: branding.primaryColor }} />,
      Smartphone: <Smartphone className="w-8 h-8" style={{ color: branding.primaryColor }} />
    };
    return map[iconName] || <Sparkles className="w-8 h-8" style={{ color: branding.primaryColor }} />;
  };

  // --- COLUMNS (REWRITTEN USING TableRowActions COMPONENT) ---
  const faqColumns = useMemo(() => [
    { header: 'Question', accessorKey: 'question', cell: ({ row }) => <span className="font-bold text-slate-900 line-clamp-1 text-[11px]">{row.original.question}</span> },
    { header: 'Answer', accessorKey: 'answer', cell: ({ row }) => <span className="text-[10px] text-slate-500 line-clamp-2">{row.original.answer}</span> },
    { header: 'Status', cell: ({ row }) => <Badge className={row.original.active === false ? 'bg-slate-200 text-slate-700 text-[9px] px-1.5 py-0.5' : 'bg-emerald-500 text-white border-none text-[9px] px-1.5 py-0.5'}>{row.original.active === false ? 'Inactive' : 'Active'}</Badge> },
    { header: 'Actions', id: 'actions', cell: ({ row }) => (
      <TableRowActions 
        onEdit={() => handleOpenModal('faq', row.original)}
        onDelete={() => confirmDelete('faq', row.original.id)}
        extra={[{
          label: row.original.active === false ? 'Activate' : 'Deactivate',
          icon: row.original.active === false ? Eye : EyeOff,
          onClick: () => triggerToggleActive('faq', row.original)
        }]}
      />
    )}
  ], []);

  const testimonialColumns = useMemo(() => [
    { header: 'Client Info', cell: ({ row }) => <div className="flex items-center gap-2"><div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-bold text-xs">{row.original.name?.[0]}</div><div><p className="font-bold text-[11px]">{row.original.name}</p><p className="text-[9px] text-slate-400">{row.original.school} — {row.original.role}</p></div></div> },
    { header: 'Quote', accessorKey: 'content', cell: ({ row }) => <span className="text-[10px] italic text-slate-600 line-clamp-2">"{row.original.content}"</span> },
    { header: 'Status', cell: ({ row }) => <Badge className={row.original.active === false ? 'bg-slate-200 text-slate-700 text-[9px] px-1.5 py-0.5' : 'bg-emerald-500 text-white border-none text-[9px] px-1.5 py-0.5'}>{row.original.active === false ? 'Inactive' : 'Active'}</Badge> },
    { header: 'Actions', id: 'actions', cell: ({ row }) => (
      <TableRowActions 
        onEdit={() => handleOpenModal('testimonial', row.original)}
        onDelete={() => confirmDelete('testimonial', row.original.id)}
        extra={[{
          label: row.original.active === false ? 'Activate' : 'Deactivate',
          icon: row.original.active === false ? Eye : EyeOff,
          onClick: () => triggerToggleActive('testimonial', row.original)
        }]}
      />
    )}
  ], []);

  const roadmapColumns = useMemo(() => [
    { header: 'Feature', accessorKey: 'title', cell: ({ row }) => <span className="font-bold text-[11px]">{row.original.title}</span> },
    { header: 'Dev Status', cell: ({ row }) => <Badge variant={row.original.status === 'In Development' ? 'default' : 'outline'} className="text-[9px] px-1.5 py-0.5">{row.original.status}</Badge> },
    { header: 'ETA', accessorKey: 'eta', cell: ({ row }) => <span className="text-[10px] font-semibold text-slate-500">{row.original.eta}</span> },
    { header: 'Visible', cell: ({ row }) => <Badge className={row.original.active === false ? 'bg-slate-200 text-slate-700 text-[9px] px-1.5 py-0.5' : 'bg-emerald-500 text-white border-none text-[9px] px-1.5 py-0.5'}>{row.original.active === false ? 'Hidden' : 'Visible'}</Badge> },
    { header: 'Actions', id: 'actions', cell: ({ row }) => (
      <TableRowActions 
        onEdit={() => handleOpenModal('roadmap', row.original)}
        onDelete={() => confirmDelete('roadmap', row.original.id)}
        extra={[{
          label: row.original.active === false ? 'Show' : 'Hide',
          icon: row.original.active === false ? Eye : EyeOff,
          onClick: () => triggerToggleActive('roadmap', row.original)
        }]}
      />
    )}
  ], []);

  const socialColumns = useMemo(() => [
    { header: 'Platform', accessorKey: 'platform', cell: ({ row }) => <span className="font-bold text-[11px]">{row.original.platform}</span> },
    { header: 'URL', accessorKey: 'url', cell: ({ row }) => <span className="text-[10px] text-primary underline line-clamp-1 max-w-[200px] block">{row.original.url}</span> },
    { header: 'Status', cell: ({ row }) => <Badge className={row.original.active === false ? 'bg-slate-200 text-slate-700 text-[9px] px-1.5 py-0.5' : 'bg-emerald-500 text-white border-none text-[9px] px-1.5 py-0.5'}>{row.original.active === false ? 'Hidden' : 'Active'}</Badge> },
    { header: 'Actions', id: 'actions', cell: ({ row }) => (
      <TableRowActions 
        onEdit={() => handleOpenModal('social', row.original)}
        onDelete={() => confirmDelete('social', row.original.id)}
        extra={[{
          label: row.original.active === false ? 'Activate' : 'Deactivate',
          icon: row.original.active === false ? Eye : EyeOff,
          onClick: () => triggerToggleActive('social', row.original)
        }]}
      />
    )}
  ], []);

  const videoColumns = useMemo(() => [
    { header: 'Title', accessorKey: 'title', cell: ({ row }) => <span className="font-bold text-[11px]">{row.original.title}</span> },
    { header: 'Category', cell: ({ row }) => <Badge className="bg-slate-100 text-slate-600 border-none text-[9px] px-1.5 py-0.5">{row.original.category}</Badge> },
    { header: 'YouTube link', accessorKey: 'url', cell: ({ row }) => <span className="text-[10px] text-slate-500 font-mono line-clamp-1 max-w-[180px] block">{row.original.url}</span> },
    { header: 'Status', cell: ({ row }) => <Badge className={row.original.active === false ? 'bg-slate-200 text-slate-700 text-[9px] px-1.5 py-0.5' : 'bg-emerald-500 text-white border-none text-[9px] px-1.5 py-0.5'}>{row.original.active === false ? 'Hidden' : 'Visible'}</Badge> },
    { header: 'Actions', id: 'actions', cell: ({ row }) => (
      <TableRowActions 
        onEdit={() => handleOpenModal('video', row.original)}
        onDelete={() => confirmDelete('video', row.original.id)}
        extra={[{
          label: row.original.active === false ? 'Show' : 'Hide',
          icon: row.original.active === false ? Eye : EyeOff,
          onClick: () => triggerToggleActive('video', row.original)
        }]}
      />
    )}
  ], []);

  const bannerColumns = useMemo(() => [
    { header: 'Banner Title', accessorKey: 'title', cell: ({ row }) => <span className="font-bold line-clamp-1 text-[11px]">{row.original.title}</span> },
    { header: 'Status', cell: ({ row }) => <Badge className={row.original.active ? 'bg-emerald-500 text-white border-none text-[9px] px-1.5 py-0.5' : 'bg-slate-200 text-slate-700 text-[9px] px-1.5 py-0.5'}>{row.original.active ? 'Active' : 'Inactive'}</Badge> },
    { header: 'Actions', id: 'actions', cell: ({ row }) => (
      <TableRowActions 
        onEdit={() => handleOpenModal('banner', row.original)}
        onDelete={() => confirmDelete('banner', row.original.id)}
        extra={[
          {
            label: row.original.active ? 'Deactivate' : 'Activate',
            icon: row.original.active ? EyeOff : Eye,
            onClick: () => triggerToggleActive('banner', row.original)
          }
        ]}
      />
    )}
  ], []);

  const partnerColumns = useMemo(() => [
    { header: 'Institute', cell: ({ row }) => <div className="flex items-center gap-2">{row.original.logoUrl && <img src={row.original.logoUrl} className="w-10 h-6 object-contain rounded" />}<span className="font-bold text-[11px]">{row.original.name}</span></div> },
    { header: 'Status', cell: ({ row }) => <Badge className={row.original.active === false ? 'bg-slate-200 text-slate-700 text-[9px] px-1.5 py-0.5' : 'bg-emerald-500 text-white border-none text-[9px] px-1.5 py-0.5'}>{row.original.active === false ? 'Hidden' : 'Visible'}</Badge> },
    { header: 'Actions', id: 'actions', cell: ({ row }) => (
      <TableRowActions 
        onEdit={() => handleOpenModal('partner', row.original)}
        onDelete={() => confirmDelete('partner', row.original.id)}
        extra={[{
          label: row.original.active === false ? 'Show' : 'Hide',
          icon: row.original.active === false ? Eye : EyeOff,
          onClick: () => triggerToggleActive('partner', row.original)
        }]}
      />
    )}
  ], []);

  const announcementColumns = useMemo(() => [
    { header: 'Message', accessorKey: 'text', cell: ({ row }) => <span className="font-bold line-clamp-1 text-[11px]">{row.original.text}</span> },
    { header: 'Bar Color', cell: ({ row }) => <span className="flex items-center gap-2 text-[10px] font-mono"><div className="w-3.5 h-3.5 border rounded" style={{ backgroundColor: row.original.color }} /> {row.original.color}</span> },
    { header: 'Actions', id: 'actions', cell: ({ row }) => (
      <TableRowActions 
        onEdit={() => handleOpenModal('announcement', row.original)}
        onDelete={() => confirmDelete('announcement', row.original.id)}
        extra={[
          {
            label: row.original.active ? 'Deactivate' : 'Activate',
            icon: row.original.active ? EyeOff : Eye,
            onClick: () => triggerToggleActive('announcement', row.original)
          }
        ]}
      />
    )}
  ], []);

  const featureColumns = useMemo(() => [
    { header: 'Feature Name', accessorKey: 'title', cell: ({ row }) => <span className="font-black text-slate-900 text-[11px]">{row.original.title}</span> },
    { header: 'Icon Code', accessorKey: 'icon', cell: ({ row }) => <span className="text-[10px] bg-slate-100 px-2 py-1 rounded font-mono text-slate-600">{row.original.icon}</span> },
    { header: 'Brief Info', accessorKey: 'desc', cell: ({ row }) => <span className="text-[10px] text-slate-500 line-clamp-1">{row.original.desc}</span> },
    { header: 'Badge Type', cell: ({ row }) => <Badge variant={row.original.badge === 'Popular' ? 'default' : row.original.badge === 'New' ? 'secondary' : 'outline'} className="text-[9px] px-1.5 py-0.5">{row.original.badge}</Badge> },
    { header: 'Actions', id: 'actions', cell: ({ row }) => (
      <TableRowActions 
        onEdit={() => handleOpenModal('feature', row.original)}
        onDelete={() => confirmDelete('feature', row.original.id)}
        extra={[
          {
            label: row.original.active ? 'Deactivate' : 'Activate',
            icon: row.original.active ? EyeOff : Eye,
            onClick: () => triggerToggleActive('feature', row.original)
          }
        ]}
      />
    )}
  ], []);

  // Columns definition for Flexible About Sections
  const aboutColumns = useMemo(() => [
    { header: 'Section Title', accessorKey: 'title', cell: ({ row }) => <span className="font-bold text-[11px]">{row.original.title}</span> },
    { header: 'Description', accessorKey: 'desc', cell: ({ row }) => <span className="text-[10px] text-slate-500 line-clamp-2">{row.original.desc}</span> },
    { header: 'Status', cell: ({ row }) => <Badge className={row.original.active ? 'bg-emerald-500 text-white border-none text-[9px] px-1.5 py-0.5' : 'bg-slate-200 text-slate-700 text-[9px] px-1.5 py-0.5'}>{row.original.active ? 'Active' : 'Inactive'}</Badge> },
    { header: 'Actions', id: 'actions', cell: ({ row }) => (
      <TableRowActions 
        onEdit={() => handleOpenModal('about', row.original)}
        onDelete={() => confirmDelete('about', row.original.id)}
        extra={[
          {
            label: row.original.active ? 'Deactivate' : 'Activate',
            icon: row.original.active ? EyeOff : Eye,
            onClick: () => triggerToggleActive('about', row.original)
          }
        ]}
      />
    )}
  ], []);

  const leadColumns = useMemo(() => [
    { header: 'Sender', cell: ({ row }) => <div className="font-bold text-slate-900 text-[11px]">{row.original.name}<p className="text-[9px] text-slate-400 font-mono">{row.original.email}</p></div> },
    { header: 'School Campus', accessorKey: 'schoolName', cell: ({ row }) => <span className="text-[11px] font-semibold text-slate-700">{row.original.schoolName}</span> },
    { header: 'Contact Mobile', accessorKey: 'phone', cell: ({ row }) => <span className="text-[10px] font-mono text-slate-600">{row.original.phone}</span> },
    { header: 'Inquiry Date', cell: ({ row }) => <span className="text-[10px] text-slate-500">{new Date(row.original.date).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}</span> },
    { header: 'Status', cell: ({ row }) => {
      const colors = { 
        'New': 'bg-blue-100 text-blue-800', 
        'Contacted': 'bg-amber-100 text-amber-800', 
        'Demo Scheduled': 'bg-purple-100 text-purple-800', 
        'Closed-Won': 'bg-emerald-100 text-emerald-800' 
      };
      return <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${colors[row.original.status] || 'bg-slate-100 text-slate-800'}`}>{row.original.status}</span>;
    }},
    { header: 'Quick Triggers', id: 'actions', cell: ({ row }) => (
      <TableRowActions 
        onDelete={() => confirmDelete('lead', row.original.id)}
        extra={[
          {
            label: 'Set Contacted',
            icon: Smartphone,
            onClick: () => handleLeadStatusChange(row.original.id, 'Contacted')
          },
          {
            label: 'Schedule Demo',
            icon: Calendar,
            onClick: () => handleLeadStatusChange(row.original.id, 'Demo Scheduled')
          },
          {
            label: 'Convert (Closed-Won)',
            icon: CheckCircle2,
            onClick: () => handleLeadStatusChange(row.original.id, 'Closed-Won')
          }
        ]}
      />
    )}
  ], [leads]);

  if (!mounted) return null;

  return (
    <div className="p-6 space-y-6 pb-20">
      
      {/* 🟢 TOP PERSISTENCE & SYNC STATUS STRIP */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl border border-white/5 relative overflow-hidden">
        <Database className="absolute -left-12 -bottom-12 w-48 h-48 text-white/5 rotate-12" />
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Neon PostgreSQL Cloud Persistent Active</p>
          </div>
          <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" style={{ color: branding.primaryColor }} /> Cloud Database CMS Sync
          </h2>
          <p className="text-xs text-white/50">All website updates physically sync to a dedicated database table. Sync to push changes live globally.</p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] uppercase font-bold text-white/40">Last Cloud Sync</p>
            <p className="text-xs font-bold text-white/90">{lastSyncedTime}</p>
          </div>
          <Button 
            onClick={handleCloudSync} 
            disabled={isSyncing}
            style={{ backgroundColor: branding.primaryColor }}
            className="rounded-xl px-5 h-11 text-white font-bold hover:opacity-90 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing Server...' : 'Force Live Deploy'}
          </Button>
        </div>
      </div>

      <PageHeader 
        title="Website Global CMS" 
        description="Full control over landing page branding, pricing tools, custom showcase grids, legal policies and SEO indexing." 
        icon={Globe}
      />

      {/* Tabs navigation bar */}
      <div className="bg-white p-1 border border-slate-200 flex overflow-x-auto custom-scrollbar shadow-sm rounded-xl">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={activeTab === tab.id ? { backgroundColor: branding.primaryColor } : {}}
            className={`px-5 py-2.5 flex items-center gap-2 font-bold text-xs transition-all whitespace-nowrap rounded-lg ${
              activeTab === tab.id ? 'text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 🔴 100% REAL LIVE LANDING PAGE PREVIEW & MOCKUP SIMULATOR */}
      {activeTab === 'preview' && (
        <div className="bg-slate-100 rounded-3xl border border-slate-200 overflow-hidden shadow-2xl animate-in fade-in duration-500">
          
          {/* Mock Browser Title Bar */}
          <div className="bg-slate-900 px-6 py-3 flex items-center justify-between border-b border-slate-800 text-white/60">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              {branding.faviconUrl ? (
                <img src={branding.faviconUrl} alt="Favicon" className="w-3.5 h-3.5 ml-3 object-contain rounded" />
              ) : null}
              <span className={`text-[10px] font-mono bg-white/5 px-4 py-1 rounded-md text-white/40 ${branding.faviconUrl ? 'ml-1.5' : 'ml-4'}`}>https://thecloudsacademy.pk</span>
            </div>
            <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Mockup Simulator
            </div>
          </div>

          {/* 1. TOP NEWS BAR / ANNOUNCEMENTS MOCKUP */}
          {announcements.filter(a => a.active).map(ann => (
            <div 
              key={ann.id} 
              style={{ backgroundColor: ann.color || branding.primaryColor }} 
              className="py-2.5 px-4 text-center text-white text-xs font-bold relative overflow-hidden flex items-center justify-center gap-2"
            >
              <Megaphone className="w-3.5 h-3.5 shrink-0" />
              <marquee className="text-xs font-semibold max-w-4xl">{ann.text}</marquee>
            </div>
          ))}

          {/* 2. NAVBAR MOCKUP */}
          <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt="Logo" className="h-8 max-w-[150px] object-contain" />
              ) : (
                <>
                  <div className="w-8 h-8 rounded flex items-center justify-center font-black text-white text-base" style={{ backgroundColor: branding.primaryColor }}>C</div>
                  <span className="font-black text-slate-800 tracking-tight text-base">The Clouds Academy</span>
                </>
              )}
            </div>
            <div className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
              <a href="#about" className="hover:opacity-80 transition-opacity">About</a>
              <a href="#features" className="hover:opacity-80 transition-opacity">Features</a>
              <a href="#pricing" className="hover:opacity-80 transition-opacity">Pricing</a>
              <a href="#testimonials" className="hover:opacity-80 transition-opacity">Testimonials</a>
              <a href="#faq" className="hover:opacity-80 transition-opacity">FAQs</a>
            </div>
            <Button style={{ backgroundColor: branding.primaryColor }} className="rounded-xl font-bold h-9 text-xs px-4 text-white hover:opacity-90">Get Started</Button>
          </div>

          {/* 3. HERO SECTION MOCKUP */}
          <div className="bg-white px-8 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center border-b border-slate-100">
            <div className="space-y-6">
              <Badge style={{ color: branding.primaryColor, backgroundColor: `${branding.primaryColor}10`, borderColor: `${branding.primaryColor}30` }} className="font-black px-4 py-1 rounded-full text-[10px] uppercase tracking-widest border">Next-Gen Educational ERP</Badge>
              <h1 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {heroConfig.title || 'Empowering Schools with Smart Management'}
              </h1>
              <p className="text-sm lg:text-base text-slate-500 leading-relaxed max-w-lg">
                {heroConfig.subtitle || 'The most comprehensive and easy-to-use school management system.'}
              </p>
              <div className="flex items-center gap-3">
                <Button style={{ backgroundColor: branding.primaryColor }} className="rounded-xl h-12 px-6 font-bold text-white hover:opacity-90">{heroConfig.primaryBtn || 'Get Started'}</Button>
                <Button variant="outline" className="rounded-xl h-12 px-6 font-bold border-slate-200 text-slate-700 bg-slate-50">{heroConfig.secondaryBtn || 'Watch Demo'}</Button>
              </div>
            </div>
            <div className="flex justify-center">
              {heroConfig.mockupAsset ? (
                <div className="w-full max-w-lg aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-100 relative group">
                  <img src={heroConfig.mockupAsset} alt="Mockup" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full max-w-lg aspect-video bg-slate-50 rounded-3xl border-2 border-dashed flex items-center justify-center text-slate-400 text-xs font-bold">
                  No Hero Visual Mockup Asset Uploaded
                </div>
              )}
            </div>
          </div>

          {/* 4. FLEXIBLE CUSTOM ABOUT SECTIONS MOCKUP */}
          {aboutSections.length === 0 ? null : (
            <div id="about" className="bg-white py-16 px-8 border-b border-slate-100">
              <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
                <Badge style={{ color: branding.primaryColor, backgroundColor: `${branding.primaryColor}10`, borderColor: `${branding.primaryColor}30` }} className="font-black px-4 py-1 rounded-full text-[9px] uppercase tracking-widest border">ABOUT PLATFORM</Badge>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Our Identity & Mission</h2>
                <p className="text-xs text-slate-400">Only Active sections appear below.</p>
              </div>
              {aboutSections.filter(s => s.active).length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <EyeOff className="w-10 h-10 mx-auto text-slate-200" />
                  <p className="text-xs font-bold text-slate-400">All About sections are currently Inactive — activate at least one in the editor tab to display here.</p>
                </div>
              ) : (
                <div className="max-w-6xl mx-auto space-y-20">
                  {aboutSections.filter(s => s.active).map((sec, index) => {
                    const isEven = index % 2 === 0;
                    return (
                      <div key={sec.id} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                        <div className={`lg:col-span-7 space-y-5 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border" style={{ color: branding.primaryColor, backgroundColor: `${branding.primaryColor}08`, borderColor: `${branding.primaryColor}25` }}>
                            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: branding.primaryColor }}></span>
                            Section {index + 1} of {aboutSections.filter(s => s.active).length}
                          </div>
                          <h4 className="font-black text-slate-900 text-xl md:text-2xl tracking-tight leading-snug">{sec.title}</h4>
                          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: branding.primaryColor }}></div>
                          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{sec.desc}</p>
                        </div>
                        <div className={`lg:col-span-5 flex justify-center ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                          {sec.imageUrl ? (
                            <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
                              <img src={sec.imageUrl} alt={sec.title} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-full aspect-[4/3] rounded-3xl flex flex-col items-center justify-center gap-3 border-2 border-dashed" style={{ backgroundColor: `${branding.primaryColor}05`, borderColor: `${branding.primaryColor}20` }}>
                              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${branding.primaryColor}15` }}>
                                <Info className="w-8 h-8" style={{ color: branding.primaryColor }} />
                              </div>
                              <span className="text-[10px] font-bold text-slate-400">No Illustration Uploaded</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 5. PROMOTIONAL BANNERS MOCKUP */}
          {banners.filter(b => b.active).map(b => (
            <div key={b.id} className="bg-slate-950 p-1">
              <div className="w-full aspect-[4/1] md:aspect-[5/1] relative overflow-hidden flex items-center justify-center text-center p-6">
                {b.imageUrl ? (
                  <img src={b.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-45" />
                ) : null}
                <div className="relative z-10 max-w-2xl space-y-2">
                  <h3 className="text-white text-base md:text-2xl font-black tracking-tight">{b.title}</h3>
                  {b.link && (
                    <a href={b.link} style={{ color: branding.primaryColor }} className="inline-flex items-center gap-1 text-[10px] md:text-xs font-black uppercase tracking-widest hover:underline">
                      Claim This Offer <ArrowRight className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* 6. COUNTDOWN TIMER MOCKUP */}
          {countdown.active && (
            <div className="border-y py-8 px-8 flex flex-col md:flex-row items-center justify-between gap-6" style={{ backgroundColor: `${branding.primaryColor}10`, borderColor: `${branding.primaryColor}20` }}>
              <div className="space-y-1 text-center md:text-left">
                <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: branding.primaryColor }}>Limited Time Campaign Offer</span>
                <h3 className="text-slate-900 text-lg md:text-2xl font-black tracking-tight">{countdown.title}</h3>
                <p className="text-xs text-slate-500">{countdown.description}</p>
              </div>
              <div className="flex items-center gap-4">
                {[ {l:'Days',v:'02'}, {l:'Hours',v:'12'}, {l:'Mins',v:'34'}, {l:'Secs',v:'58'} ].map((time, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl text-center shadow-sm w-14 shrink-0">
                    <p className="text-slate-900 font-black text-base leading-none">{time.v}</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase mt-1">{time.l}</p>
                  </div>
                ))}
                {countdown.buttonText && (
                  <Button style={{ backgroundColor: branding.primaryColor }} className="rounded-xl h-11 text-white font-bold ml-2 hover:opacity-90">{countdown.buttonText}</Button>
                )}
              </div>
            </div>
          )}

          {/* 7. TRUSTED PARTNERS LIST MOCKUP */}
          {partners.length > 0 && (
            <div className="bg-slate-50 py-8 px-8 border-b border-slate-200">
              <p className="text-center text-[10px] uppercase font-black tracking-widest text-slate-400 mb-6">Trusted by Reputable Educational Brands</p>
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
                {partners.map(p => (
                  <div key={p.id} className="h-10 opacity-60 hover:opacity-100 transition-opacity flex items-center justify-center bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
                    {p.logoUrl ? (
                      <img src={p.logoUrl} alt={p.name} className="max-h-full max-w-full object-contain" />
                    ) : <span className="text-xs font-bold text-slate-500">{p.name}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. FEATURES SHOWCASE GRID MOCKUP */}
          <div id="features" className="bg-white py-16 px-8 border-b border-slate-100">
            <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
              <Badge style={{ color: branding.primaryColor, backgroundColor: `${branding.primaryColor}10`, borderColor: `${branding.primaryColor}30` }} className="font-black px-4 py-1 rounded-full text-[9px] uppercase tracking-widest border">PRODUCT GRID</Badge>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Everything required to run a smart school campus</h2>
              <p className="text-xs text-slate-500">Simplify staff workflows, automate parents announcements, and secure finance tracking.</p>
            </div>
            
            {features.length === 0 ? (
              <p className="text-center text-slate-400 text-xs italic">No features highlight cards configured.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {features.map(f => (
                  <div key={f.id} className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 hover:shadow-lg transition-shadow relative overflow-hidden group">
                    <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center shadow-sm">
                      {renderFeatureIcon(f.icon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <h4 className="font-black text-slate-900 text-sm">{f.title}</h4>
                        {f.badge && f.badge !== 'Default' && (
                          <Badge style={{ color: branding.primaryColor, backgroundColor: `${branding.primaryColor}20` }} className="text-[8px] px-1.5 py-0 font-black border-none">{f.badge}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 9. INTERACTIVE PRICE ESTIMATOR CALCULATOR MOCKUP */}
          <div id="pricing" className="bg-slate-900 py-16 px-8 text-white relative overflow-hidden" style={{ backgroundColor: branding.secondaryColor }}>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-40 -mr-32 -mt-32" style={{ backgroundColor: `${branding.primaryColor}20` }} />
            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
              <div className="space-y-4">
                <Badge className="bg-white/10 text-white font-black px-4 py-1 rounded-full text-[9px] uppercase tracking-widest">TRANSPARENT PRICING</Badge>
                <h2 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">Scale your subscription dynamically</h2>
                <p className="text-xs text-slate-400 leading-relaxed">Adjust the student strength slider to instantly view your calculated branch subscription tier based on active discount rules.</p>
                <div className="pt-4 grid grid-cols-2 gap-4 text-xs font-mono text-slate-400">
                  <div>• Base License: <span className="text-white font-bold">PKR {pricingConfig.basePrice}</span></div>
                  <div>• Per Student: <span className="text-white font-bold">PKR {pricingConfig.perStudentRate}</span></div>
                  {pricingConfig.discountThreshold && (
                    <div className="col-span-2">• Bulk discount (&gt;={pricingConfig.discountThreshold} students): <span className="text-emerald-400 font-bold">{pricingConfig.discountPercentage}% Off</span></div>
                  )}
                </div>
              </div>
              <div className="p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Branch Strength</span>
                  <span className="text-xl font-black text-white">{studentCount} Students</span>
                </div>
                <input 
                  type="range" 
                  min="100" 
                  max="3000" 
                  step="50" 
                  value={studentCount} 
                  onChange={(e) => setStudentCount(Number(e.target.value))} 
                  style={{ accentColor: branding.primaryColor }}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer" 
                />
                <div className="p-5 rounded-2xl flex items-center justify-between shadow-2xl" style={{ backgroundColor: branding.primaryColor }}>
                  <div>
                    <p className="text-[9px] font-bold text-white/60 uppercase">Calculated Cost / Month</p>
                    <p className="text-2xl font-black text-white">PKR {estimatedTotal.toLocaleString()}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* 10. SUCCESS STORIES / TESTIMONIALS MOCKUP */}
          <div id="testimonials" className="bg-white py-16 px-8 border-b border-slate-100">
            <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
              <Badge style={{ color: branding.primaryColor, backgroundColor: `${branding.primaryColor}10`, borderColor: `${branding.primaryColor}30` }} className="font-black px-4 py-1 rounded-full text-[9px] uppercase tracking-widest border">CLIENT REVIEWS</Badge>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Loved by regional school heads</h2>
            </div>
            
            {testimonials.length === 0 ? (
              <p className="text-center text-slate-400 text-xs italic">No testimonials configured.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                {testimonials.map(t => (
                  <div key={t.id} className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 hover:shadow-sm">
                    <p className="text-slate-600 text-xs italic leading-relaxed">"{t.content}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center" style={{ color: branding.primaryColor, backgroundColor: `${branding.primaryColor}15` }}>{t.name?.[0]}</div>
                      <div>
                        <h5 className="font-bold text-xs text-slate-900">{t.name}</h5>
                        <p className="text-[9px] text-slate-400 font-medium">{t.school} — {t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 11. FAQS SECTION MOCKUP */}
          <div id="faq" className="bg-slate-50 py-16 px-8 border-b border-slate-200">
            <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
              <Badge style={{ color: branding.primaryColor, backgroundColor: `${branding.primaryColor}10`, borderColor: `${branding.primaryColor}30` }} className="font-black px-4 py-1 rounded-full text-[9px] uppercase tracking-widest border">HELP ACCORDION</Badge>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h2>
            </div>
            
            {faqs.length === 0 ? (
              <p className="text-center text-slate-400 text-xs italic">No FAQ items configured.</p>
            ) : (
              <div className="max-w-3xl mx-auto space-y-3">
                {faqs.map(faq => (
                  <div key={faq.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs md:text-sm flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 shrink-0" style={{ color: branding.primaryColor }} /> {faq.question}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed pl-6">{faq.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 12. FOOTER MOCKUP */}
          <div className="py-12 px-8 text-center md:text-left text-white/60" style={{ backgroundColor: branding.secondaryColor }}>
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center border-b border-white/5 pb-8 mb-8">
              <div className="space-y-2">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  {branding.logoUrl ? (
                    <img src={branding.logoUrl} alt="Logo" className="h-8 max-w-[150px] object-contain invert brightness-200" />
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded flex items-center justify-center font-black text-white text-base" style={{ backgroundColor: branding.primaryColor }}>C</div>
                      <span className="font-black text-white tracking-tight text-base">The Clouds Academy</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-white/40">The next-generation smart school cloud system compiler.</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-white/80">
                {socialLinks.map(s => (
                  <a key={s.id} href={s.url} target="_blank" className="hover:text-primary transition-colors flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                    {s.platform === 'Facebook' ? <Facebook className="w-3.5 h-3.5" /> : s.platform === 'LinkedIn' ? <Linkedin className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
                    {s.platform}
                  </a>
                ))}
              </div>
              <div className="flex items-center justify-center md:justify-end gap-4 text-xs font-bold">
                <button onClick={() => setPreviewPolicyModal('privacy')} className="text-white hover:opacity-85 transition-opacity hover:underline">Privacy Policy</button>
                <span className="text-white/10">|</span>
                <button onClick={() => setPreviewPolicyModal('delete')} className="text-white hover:opacity-85 transition-opacity hover:underline">Account Delete Policy</button>
              </div>
            </div>
            <p className="text-center text-[10px] text-white/30">© {new Date().getFullYear()} The Clouds Academy. All rights reserved. Powered by Postgres Neon Database Cloud.</p>
          </div>
        </div>
      )}

      {/* 1. HERO SECTION */}
      {activeTab === 'hero' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-8 border border-slate-200 space-y-6 rounded-3xl shadow-sm">
            <h3 className="font-bold text-lg flex items-center gap-2"><Type className="w-5 h-5 text-primary" /> Main Headings</h3>
            
            {(!heroConfig.title && !isSyncing) ? (
              <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-500 font-bold border-2 border-dashed border-slate-200">
                No active Hero Config found in database. Configure details below to initialize.
              </div>
            ) : null}

            <div className="space-y-4">
               <InputField label="Hero Title" value={heroConfig.title} onChange={(e) => setHeroConfig({...heroConfig, title: e.target.value})} placeholder="e.g. Empowering Schools with Smart Management" />
               <TextareaField label="Hero Subtitle" value={heroConfig.subtitle} onChange={(e) => setHeroConfig({...heroConfig, subtitle: e.target.value})} placeholder="e.g. The most comprehensive and easy-to-use school management system." rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Primary Button" value={heroConfig.primaryBtn} onChange={(e) => setHeroConfig({...heroConfig, primaryBtn: e.target.value})} placeholder="e.g. Get Started" />
              <InputField label="Secondary Button" value={heroConfig.secondaryBtn} onChange={(e) => setHeroConfig({...heroConfig, secondaryBtn: e.target.value})} placeholder="e.g. Watch Demo" />
            </div>

            {/* Image Upload Center for Hero Section */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <label className="text-xs font-black text-slate-800 uppercase tracking-widest block">Upload Mockup Image (Cloudinary)</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleHeroImageUpload} 
                disabled={uploadingImage}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer disabled:opacity-50" 
              />
              <p className="text-[10px] text-slate-400">Selected image will be securely saved into `the-clouds-academy/website-cms/hero` folder on Cloudinary. Old image is auto deleted.</p>
              {uploadingImage && (
                <div className="flex items-center gap-2 text-xs font-bold text-primary animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading image to Cloudinary...
                </div>
              )}
            </div>

            <Button variant="default" onClick={() => saveKeyToDb('hero', heroConfig)} className="w-full h-11 rounded-xl font-bold shadow-lg shadow-primary/20"><Save className="w-4 h-4 mr-2" /> Save Hero Section</Button>
          </div>

          <div className="bg-white p-8 border border-slate-200 flex flex-col justify-center text-center space-y-6 rounded-3xl shadow-sm">
            <h3 className="font-bold text-lg flex items-center gap-2 justify-center"><ImageIcon className="w-5 h-5 text-primary" /> Visual Media Asset Preview</h3>
            <div className="aspect-video bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200 hover:border-primary/50 transition-colors group relative overflow-hidden">
               {heroConfig.mockupAsset ? (
                 <>
                   <img src={heroConfig.mockupAsset} alt="Visual Mockup" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <p className="text-white text-xs font-black uppercase tracking-wider">Mockup Live Preview</p>
                   </div>
                 </>
               ) : (
                 <div className="text-center p-6 text-slate-400">
                   <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                   <p className="text-xs font-bold">No Image Mockup Uploaded Yet</p>
                 </div>
               )}
            </div>
            {heroConfig.mockupAsset && (
              <div className="text-left p-4 bg-slate-50 rounded-xl border border-slate-100 font-mono text-[9px] text-slate-500 break-all space-y-1">
                <p><span className="font-bold text-slate-700">Cloudinary URL:</span> {heroConfig.mockupAsset}</p>
                <p><span className="font-bold text-slate-700">Public ID:</span> {heroConfig.mockupPublicId || 'N/A'}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. ABOUT SECTIONS CARD EDITOR */}
      {activeTab === 'about' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header bar */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" /> About Us Sections Manager
                </h3>
                <p className="text-xs text-slate-500 mt-1">Only <span className="text-emerald-600 font-bold">Active</span> sections appear in the Live Landing Preview. Inactive sections are hidden from the public page.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-[11px] font-bold text-slate-600">{aboutSections.filter(s => s.active).length} Active</span>
                  <span className="text-slate-300">|</span>
                  <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                  <span className="text-[11px] font-bold text-slate-400">{aboutSections.filter(s => !s.active).length} Inactive</span>
                </div>
                <Button variant="default" size="sm" onClick={() => handleOpenModal('about')} className="rounded-xl font-bold h-10 px-5 shadow-lg shadow-primary/10">
                  <Plus className="w-4 h-4 mr-2" /> Add Section
                </Button>
              </div>
            </div>

            {aboutSections.length === 0 && !isSyncing ? (
              <div className="p-20 text-center space-y-4 bg-slate-50/50 rounded-b-3xl">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
                  <Info className="w-8 h-8 text-slate-300" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500">No About sections in database.</p>
                  <p className="text-xs text-slate-400 mt-1">The data will auto-seed on first backend startup.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleOpenModal('about')} className="rounded-xl">Add Your First Section</Button>
              </div>
            ) : (
              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                {aboutSections.map((sec, index) => (
                  <div
                    key={sec.id}
                    className={`relative rounded-2xl border-2 transition-all hover:shadow-md group ${
                      sec.active
                        ? 'border-emerald-200 bg-emerald-50/30 shadow-sm'
                        : 'border-slate-200 bg-slate-50/60 opacity-70'
                    }`}
                  >
                    {/* Status ribbon */}
                    <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      sec.active ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sec.active ? 'bg-white/60 animate-pulse' : 'bg-slate-500'}`}></span>
                      {sec.active ? 'Live' : 'Hidden'}
                    </div>

                    {/* Card body */}
                    <div className="p-5 pb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-sm" style={{ backgroundColor: `${branding.primaryColor}15`, color: branding.primaryColor }}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0 pr-12">
                          <h4 className="font-black text-slate-900 text-sm leading-snug line-clamp-2">{sec.title}</h4>
                        </div>
                      </div>

                      {/* Illustration if any */}
                      {sec.imageUrl && (
                        <div className="mt-3 w-full h-28 rounded-xl overflow-hidden border border-slate-100">
                          <img src={sec.imageUrl} alt={sec.title} className="w-full h-full object-cover" />
                        </div>
                      )}

                      <p className="mt-3 text-[11px] text-slate-500 leading-relaxed line-clamp-3">{sec.desc}</p>
                    </div>

                    {/* Footer actions */}
                    <div className="px-5 pb-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => triggerToggleActive('about', sec)}
                        className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all ${
                          sec.active
                            ? 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {sec.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {sec.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleOpenModal('about', sec)}
                          className="w-8 h-8 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => confirmDelete('about', sec.id)}
                          className="w-8 h-8 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. FEATURES EDITOR SHOWCASE */}
      {activeTab === 'features' && (
        <div className="bg-white shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div>
                <h3 className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> Feature Cards Configuration</h3>
                <p className="text-xs text-slate-500 mt-0.5">Customize the product highlight cards displayed inside the core Features section of the landing page.</p>
              </div>
              <Button variant="default" size="sm" onClick={() => handleOpenModal('feature')} className="rounded-xl font-bold h-10 px-5 shadow-lg shadow-primary/10">
                 <Plus className="w-4 h-4 mr-2" /> Add Highlight Card
              </Button>
           </div>
           
           {features.length === 0 && !isSyncing ? (
             <div className="p-20 text-center space-y-3 bg-slate-50/50">
               <Sparkles className="w-12 h-12 mx-auto text-slate-300 animate-pulse" />
               <p className="text-sm font-bold text-slate-500">No Features Live in Database.</p>
               <Button variant="outline" size="sm" onClick={() => handleOpenModal('feature')} className="rounded-xl">Add Your First Feature</Button>
             </div>
           ) : (
             <DataTable 
               columns={featureColumns} 
               data={paginateList(features)} 
               pagination={getPaginationProps(features)}
             />
           )}
        </div>
      )}

      {/* 4. PRICING CALCULATOR */}
      {activeTab === 'pricing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="lg:col-span-5 bg-white p-8 border border-slate-200 space-y-6 rounded-3xl shadow-sm">
              <h3 className="font-bold text-lg flex items-center gap-2"><Settings2 className="w-5 h-5 text-primary" /> Pricing Algorithm</h3>
              <InputField label="Base Platform Fee" type="number" value={pricingConfig.basePrice} onChange={(e) => handleConfigChange('basePrice', e.target.value)} prefix="PKR" placeholder="e.g. 5000" />
              <InputField label="Rate Per Student" type="number" value={pricingConfig.perStudentRate} onChange={(e) => handleConfigChange('perStudentRate', e.target.value)} prefix="PKR" placeholder="e.g. 15" />
              <div className="pt-4 border-t border-slate-100 space-y-4">
                 <InputField label="Bulk Discount Threshold" type="number" value={pricingConfig.discountThreshold} onChange={(e) => handleConfigChange('discountThreshold', e.target.value)} placeholder="e.g. 500" />
                 <InputField label="Discount Percentage (%)" type="number" value={pricingConfig.discountPercentage} onChange={(e) => handleConfigChange('discountPercentage', e.target.value)} suffix="%" placeholder="e.g. 10" />
              </div>
              <Button variant="default" onClick={() => saveKeyToDb('pricing', pricingConfig)} className="w-full h-11 font-bold shadow-lg shadow-primary/20"><Save className="w-4 h-4 mr-2" /> Save Calculator Logic</Button>
           </div>
           
           <div className="lg:col-span-7 p-10 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col justify-center" style={{ backgroundColor: branding.secondaryColor }}>
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" style={{ backgroundColor: `${branding.primaryColor}20` }} />
              <div className="relative z-10 space-y-8">
                 <h4 className="text-white font-bold text-xl">Calculator Live Mockup</h4>
                 <div className="p-8 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-8">
                    <div className="flex justify-between items-end">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Select Student Strength</label>
                       <span className="text-2xl font-black text-white leading-none">{studentCount.toLocaleString()} <span className="text-xs text-slate-500">Students</span></span>
                    </div>
                    <input type="range" min="100" max="5000" step="50" value={studentCount} onChange={(e) => setStudentCount(Number(e.target.value))} style={{ accentColor: branding.primaryColor }} className="w-full h-2 rounded-full appearance-none cursor-pointer" />
                    <div className="p-6 rounded-xl flex justify-between items-center shadow-2xl" style={{ backgroundColor: branding.primaryColor }}>
                       <div>
                          <p className="text-[10px] font-black text-white/60 uppercase">Monthly Subscription Cost</p>
                          <h5 className="text-3xl font-black text-white tracking-tighter">PKR {estimatedTotal.toLocaleString()}</h5>
                       </div>
                       <ArrowRight className="w-6 h-6 text-white" />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* 5. COUNTDOWN TIMER */}
      {activeTab === 'countdown' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-white p-8 border border-slate-200 space-y-6 rounded-3xl shadow-sm">
              <h3 className="font-bold text-lg flex items-center gap-2"><Timer className="w-5 h-5 text-primary" /> Countdown Settings</h3>
              <div className="space-y-4">
                 <InputField label="Campaign Title" value={countdown.title} onChange={(e) => setCountdown({...countdown, title: e.target.value})} placeholder="e.g. Flash Sale: 50% Off for 1st Month!" />
                 <InputField label="End Date & Time" type="datetime-local" value={countdown.endDate} onChange={(e) => setCountdown({...countdown, endDate: e.target.value})} placeholder="Select date and time..." />
                 <TextareaField label="Description" value={countdown.description} onChange={(e) => setCountdown({...countdown, description: e.target.value})} placeholder="e.g. Register your institute before the timer ends." rows={3} />
                 <div className="grid grid-cols-2 gap-4">
                    <InputField label="Button Text" value={countdown.buttonText} onChange={(e) => setCountdown({...countdown, buttonText: e.target.value})} placeholder="e.g. Claim Offer" />
                    <InputField label="Button Link" value={countdown.buttonLink} onChange={(e) => setCountdown({...countdown, buttonLink: e.target.value})} placeholder="e.g. /register" />
                 </div>
                 <SelectField label="Countdown Status" value={String(countdown.active)} onChange={(val) => setCountdown({...countdown, active: val === 'true'})} options={[{label:'Active',value:'true'},{label:'Inactive',value:'false'}]} />
              </div>
              <Button variant="default" className="w-full h-11 font-bold shadow-lg shadow-primary/20" onClick={() => saveKeyToDb('countdown', countdown)}>
                 <Save className="w-4 h-4 mr-2" /> Save Countdown Settings
              </Button>
           </div>
           
           <div className="p-10 rounded-3xl shadow-2xl flex flex-col justify-center items-center text-center space-y-8 relative overflow-hidden group" style={{ backgroundColor: branding.secondaryColor }}>
              <div className="relative z-10 space-y-6">
                 {countdown.active ? (
                    <>
                     <Badge style={{ backgroundColor: branding.primaryColor }} className="text-white font-black px-4 py-1.5 rounded-full animate-pulse text-[10px]">LIVE CAMPAIGN</Badge>
                     <h4 className="text-white text-3xl font-black tracking-tighter leading-tight">{countdown.title}</h4>
                     <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
                        {[ {l:'Days',v:'02'}, {l:'Hours',v:'14'}, {l:'Min',v:'45'}, {l:'Sec',v:'09'} ].map((t,i) => (
                           <div key={i} className="p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
                              <p className="text-2xl font-black text-white">{t.v}</p>
                              <p className="text-[9px] font-bold text-slate-500 uppercase">{t.l}</p>
                           </div>
                        ))}
                     </div>
                     <Button style={{ backgroundColor: branding.primaryColor }} className="rounded-full px-10 h-12 font-black shadow-xl hover:opacity-90">{countdown.buttonText}</Button>
                    </>
                 ) : <div className="text-slate-500 font-bold uppercase tracking-widest opacity-20">Timer Inactive</div>}
              </div>
           </div>
        </div>
      )}

      {/* 6. SEO & SEARCH ENGINE SNIPPETS */}
      {activeTab === 'seo' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-white p-8 border border-slate-200 space-y-6 rounded-3xl shadow-sm">
              <h3 className="font-bold text-lg flex items-center gap-2"><Search className="w-5 h-5 text-primary" /> SEO & Analytics Configurator</h3>
              <div className="space-y-4">
                 <InputField label="Meta Title" value={seoConfig.metaTitle} onChange={(e) => setSeoConfig({...seoConfig, metaTitle: e.target.value})} placeholder="e.g. The Clouds Academy | Smart School & College Management System ERP" />
                 <TextareaField label="Meta Description" value={seoConfig.metaDescription} onChange={(e) => setSeoConfig({...seoConfig, metaDescription: e.target.value})} placeholder="e.g. Manage attendance, fee collections, online exams, staff timetables, and automated payroll systems in a secure, unified cloud environment..." rows={3} />
                 <InputField label="Focus Keywords (comma separated)" value={seoConfig.metaKeywords} onChange={(e) => setSeoConfig({...seoConfig, metaKeywords: e.target.value})} placeholder="e.g. school erp, clouds academy, student portal, fee management system" />
                 <div className="grid grid-cols-2 gap-4">
                    <InputField label="Google Analytics ID" value={seoConfig.googleAnalyticsId} onChange={(e) => setSeoConfig({...seoConfig, googleAnalyticsId: e.target.value})} placeholder="e.g. G-74X9Y8Z1A2" />
                    <InputField label="Facebook Pixel ID" value={seoConfig.facebookPixelId} onChange={(e) => setSeoConfig({...seoConfig, facebookPixelId: e.target.value})} placeholder="e.g. FB-987654321" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <InputField label="Favicon Asset Link" value={seoConfig.activeFavicon} onChange={(e) => setSeoConfig({...seoConfig, activeFavicon: e.target.value})} placeholder="e.g. https://placehold.co/32x32" />
                    <InputField label="OG Social Share Image Link" value={seoConfig.activeOgImage} onChange={(e) => setSeoConfig({...seoConfig, activeOgImage: e.target.value})} placeholder="e.g. https://placehold.co/1200x630" />
                 </div>
              </div>
              <Button variant="default" onClick={() => saveKeyToDb('seo', seoConfig)} className="w-full h-11 font-bold shadow-lg shadow-primary/20"><Save className="w-4 h-4 mr-2" /> Save SEO Config</Button>
           </div>

           <div className="space-y-6">
              {/* Google Search engine preview simulator */}
              <div className="bg-white p-8 border border-slate-200 rounded-3xl shadow-sm space-y-4">
                 <h4 className="text-slate-800 font-bold text-sm flex items-center gap-2"><Globe className="w-4 h-4 text-emerald-600" /> Google Search Preview</h4>
                 <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                    <p className="text-[11px] text-slate-400 font-mono">https://cloudsacademy.pk <span className="text-slate-300">▼</span></p>
                    <h5 className="text-lg text-blue-800 font-medium hover:underline cursor-pointer leading-tight line-clamp-1">{seoConfig.metaTitle || 'The Clouds Academy'}</h5>
                    <p className="text-[12px] text-slate-600 leading-relaxed line-clamp-3">{seoConfig.metaDescription || 'No description provided yet...'}</p>
                 </div>
              </div>

              {/* Social share preview Card */}
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                 <div className="p-6 border-b border-slate-50">
                    <h4 className="text-slate-800 font-bold text-sm flex items-center gap-2"><Share2 className="w-4 h-4 text-primary" /> Social Share Rich Preview (Facebook / LinkedIn)</h4>
                 </div>
                 <div className="bg-slate-50 border-t border-slate-100 p-2">
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm max-w-sm mx-auto">
                       {seoConfig.activeOgImage ? (
                         <img src={seoConfig.activeOgImage} alt="Social Share Card" className="w-full h-40 object-cover" />
                       ) : (
                         <div className="w-full h-40 bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">No OG Image Set</div>
                       )}
                       <div className="p-4 space-y-1">
                          <p className="text-[9px] uppercase font-bold text-slate-400 font-mono">CLOUDSACADEMY.PK</p>
                          <h6 className="text-xs font-black text-slate-800 line-clamp-1">{seoConfig.metaTitle}</h6>
                          <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{seoConfig.metaDescription}</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* 7. PRIVACY & DELETION POLICIES */}
      {activeTab === 'policies' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Privacy Policy Card */}
          <div className="bg-white p-8 border border-slate-200 space-y-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-lg text-slate-900">Privacy Policy Document</h3>
            </div>
            <InputField 
              label="Policy Document Title" 
              value={privacyPolicy.title} 
              onChange={(e) => setPrivacyPolicy({...privacyPolicy, title: e.target.value})} 
              placeholder="e.g. Privacy Policy for The Clouds Academy ERP" 
            />
            <InputField 
              label="Last Updated" 
              value={privacyPolicy.lastUpdated} 
              onChange={(e) => setPrivacyPolicy({...privacyPolicy, lastUpdated: e.target.value})} 
              placeholder="YYYY-MM-DD" 
            />
            {/* About Section description in Policies tab */}
            <TextareaField 
              label="About Section Overview" 
              value={privacyPolicy.aboutPlatform} 
              onChange={(e) => setPrivacyPolicy({...privacyPolicy, aboutPlatform: e.target.value})} 
              placeholder="About our educational ERP brand, core branches, mission..." 
              rows={4} 
            />
            <TextareaField 
              label="Comprehensive Legal Policy Content" 
              value={privacyPolicy.content} 
              onChange={(e) => setPrivacyPolicy({...privacyPolicy, content: e.target.value})} 
              placeholder="Provide the complete legal privacy agreement details..." 
              rows={12} 
            />
            <Button 
              onClick={() => saveKeyToDb('privacy_policy', privacyPolicy)} 
              className="w-full h-11 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Privacy Policy
            </Button>
          </div>

          {/* Account Delete Policy Card */}
          <div className="bg-white p-8 border border-slate-200 space-y-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Trash2 className="w-5 h-5 text-rose-500" />
              <h3 className="font-bold text-lg text-slate-900">Account Deactivation & Deletion Policy</h3>
            </div>
            <InputField 
              label="Policy Document Title" 
              value={accountDeletePolicy.title} 
              onChange={(e) => setAccountDeletePolicy({...accountDeletePolicy, title: e.target.value})} 
              placeholder="e.g. Account Deactivation & Deletion Policy" 
            />
            <InputField 
              label="Last Updated" 
              value={accountDeletePolicy.lastUpdated} 
              onChange={(e) => setAccountDeletePolicy({...accountDeletePolicy, lastUpdated: e.target.value})} 
              placeholder="YYYY-MM-DD" 
            />
            <TextareaField 
              label="Legal Policy Content" 
              value={accountDeletePolicy.content} 
              onChange={(e) => setAccountDeletePolicy({...accountDeletePolicy, content: e.target.value})} 
              placeholder="Provide the user account cancellation guidelines..." 
              rows={16} 
            />
            <Button 
              onClick={() => saveKeyToDb('account_delete_policy', accountDeletePolicy)} 
              className="w-full h-11 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/10 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Account Delete Policy
            </Button>
          </div>
        </div>
      )}

      {/* 8. PUBLIC WEBSITES LEADS & INQUIRIES */}
      {activeTab === 'leads' && (
        <div className="bg-white shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div>
                <h3 className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Demo Requests & Leads Log</h3>
                <p className="text-xs text-slate-500 mt-0.5">View and manage schools registering inquiries or requesting feature demos on the public homepage.</p>
              </div>
              <Button variant="default" size="sm" onClick={() => handleOpenModal('lead')} className="rounded-xl font-bold h-10 px-5 shadow-lg shadow-primary/10">
                 <Plus className="w-4 h-4 mr-2" /> Log Manual Inquiry
              </Button>
           </div>
           
           {leads.length === 0 && !isSyncing ? (
             <div className="p-20 text-center space-y-3 bg-slate-50/50">
               <Users className="w-12 h-12 mx-auto text-slate-300" />
               <p className="text-sm font-bold text-slate-500">No leads or inquiries available yet.</p>
             </div>
           ) : (
             <DataTable 
               columns={leadColumns} 
               data={paginateList(leads)} 
               pagination={getPaginationProps(leads)}
             />
           )}
        </div>
      )}

      {/* OTHER TABS */}
      {['banners', 'videos', 'announcements', 'partners', 'testimonials', 'roadmap', 'social', 'faq'].includes(activeTab) && (
        <div className="bg-white shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 className="font-bold text-lg text-slate-900 uppercase tracking-tight">{activeTab} Management</h3>
              <Button variant="default" size="sm" onClick={() => {
                const map = { banners:'banner', videos:'video', announcements:'announcement', partners:'partner', testimonials:'testimonial', roadmap:'roadmap', social:'social', faq:'faq' };
                handleOpenModal(map[activeTab]);
              }} className="rounded-xl font-bold h-10 px-5 shadow-lg shadow-primary/10">
                 <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
           </div>
           
           {(() => {
             const listData = activeTab === 'banners' ? banners : activeTab === 'videos' ? videos : activeTab === 'announcements' ? announcements : activeTab === 'partners' ? partners : activeTab === 'testimonials' ? testimonials : activeTab === 'roadmap' ? roadmap : activeTab === 'social' ? socialLinks : faqs;
             if (listData.length === 0 && !isSyncing) {
               return (
                 <div className="p-20 text-center space-y-3 bg-slate-50/50">
                   <Settings2 className="w-12 h-12 mx-auto text-slate-300" />
                   <p className="text-sm font-bold text-slate-500">No {activeTab} configured in the database.</p>
                   <Button variant="outline" size="sm" onClick={() => {
                     const map = { banners:'banner', videos:'video', announcements:'announcement', partners:'partner', testimonials:'testimonial', roadmap:'roadmap', social:'social', faq:'faq' };
                     handleOpenModal(map[activeTab]);
                   }} className="rounded-xl">Add Item</Button>
                 </div>
               );
             }
             
             return (
               <DataTable 
                  columns={ activeTab === 'banners' ? bannerColumns : activeTab === 'videos' ? videoColumns : activeTab === 'announcements' ? announcementColumns : activeTab === 'partners' ? partnerColumns : activeTab === 'testimonials' ? testimonialColumns : activeTab === 'roadmap' ? roadmapColumns : activeTab === 'social' ? socialColumns : faqColumns } 
                  data={paginateList(listData)} 
                  pagination={getPaginationProps(listData)}
               />
             );
           })()}
        </div>
      )}

      {/* UNIVERSAL MODAL */}
      <AppModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? `Edit ${modalType.toUpperCase()}` : `Add New ${modalType.toUpperCase()}`}
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowModal(false)}>Cancel</Button>
            <FormSubmitButton form="cms-form" label="Save to Website" disabled={uploadingImage} className="flex-1 rounded-xl shadow-lg shadow-primary/10" />
          </div>
        }
      >
        <form id="cms-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {modalType === 'about' && (
            <div className="space-y-4">
              <InputField label="Section Title" required register={register} name="title" placeholder="e.g. Empowering Education" />
              <TextareaField label="Section Details / Description" required register={register} name="desc" rows={6} placeholder="Describe the mission, focus area, or branch statistics..." />
              
              {/* About Section Illustration — Premium CmsImageUploader */}
              <CmsImageUploader
                label="Section Illustration (Optional)"
                folder="about"
                oldPublicId={editingItem?.imageUrlPublicId}
                value={control._formValues?.imageUrl}
                aspectRatio="aspect-video"
                hint="Recommended: 800×500px or wider. Appears alongside the section text in the landing page."
                onUpload={({ url, publicId }) => reset({ ...control._formValues, imageUrl: url, imageUrlPublicId: publicId })}
                onClear={() => reset({ ...control._formValues, imageUrl: '', imageUrlPublicId: '' })}
              />
              <input type="hidden" {...register('imageUrl')} />
              <input type="hidden" {...register('imageUrlPublicId')} />
              <SelectField label="Visibility Status" name="active" control={control} options={[{label:'Active',value:'true'},{label:'Inactive',value:'false'}]} />
            </div>
          )}
          {modalType === 'feature' && (
            <div className="space-y-4">
              <InputField label="Feature Title" required register={register} name="title" placeholder="e.g. Automated Payroll Engine" />
              <SelectField label="Feature Icon" name="icon" control={control} options={[
                {label:'Fingerprint / Bio',value:'Fingerprint'},
                {label:'GraduationCap / Academic',value:'GraduationCap'},
                {label:'DollarSign / Fee',value:'DollarSign'},
                {label:'Calendar / Timetable',value:'Calendar'},
                {label:'ShieldCheck / Security',value:'ShieldCheck'},
                {label:'Smartphone / Portals',value:'Smartphone'}
              ]} />
              <TextareaField label="Short Description" register={register} name="desc" rows={3} required placeholder="e.g. Generate and disburse staff salaries, bonuses and increments with automated print payslips." />
              <SelectField label="Highlight Badge" name="badge" control={control} options={[{label:'Default',value:'Default'},{label:'Popular',value:'Popular'},{label:'New',value:'New'}]} />
              <SelectField label="Visibility Status" name="active" control={control} options={[{label:'Active',value:'true'},{label:'Inactive',value:'false'}]} />
            </div>
          )}
          {modalType === 'lead' && (
            <div className="space-y-4">
              <InputField label="Lead/Sender Name" required register={register} name="name" placeholder="e.g. Sajid Iqbal Chaudhry" />
              <InputField label="School Campus Name" required register={register} name="schoolName" placeholder="e.g. City Grammar High School" />
              <InputField label="Mobile Phone No." required register={register} name="phone" placeholder="e.g. 0300-1234567" />
              <InputField label="Email Address" required register={register} name="email" placeholder="e.g. sajid@citygrammar.edu.pk" />
            </div>
          )}
          {modalType === 'video' && (
            <div className="space-y-4">
              <InputField label="Video Title" required register={register} name="title" placeholder="e.g. Complete Student Panel Walkthrough" />
              <InputField label="YouTube URL" required register={register} name="url" placeholder="e.g. https://youtube.com/watch?v=XXXXXX" />
              <SelectField label="Category" name="category" control={control} options={[{label:'Demo',value:'Demo'},{label:'Tutorial',value:'Tutorial'}]} />
              <TextareaField label="Description" register={register} name="desc" rows={3} placeholder="Describe the video content and focus..." />
            </div>
          )}
          {modalType === 'banner' && (
            <div className="space-y-4">
              <InputField label="Banner Title" required register={register} name="title" placeholder="e.g. Summer promotion offer - 20% discount" />
              
              {/* Banner Image — Premium CmsImageUploader */}
              <CmsImageUploader
                label="Banner Image (Cloudinary)"
                folder="banners"
                oldPublicId={editingItem?.imageUrlPublicId}
                value={control._formValues?.imageUrl}
                aspectRatio="aspect-[4/1]"
                hint="Recommended wide banner: 1200×300px"
                onUpload={({ url, publicId }) => reset({ ...control._formValues, imageUrl: url, imageUrlPublicId: publicId })}
                onClear={() => reset({ ...control._formValues, imageUrl: '', imageUrlPublicId: '' })}
              />
              <input type="hidden" {...register('imageUrl')} />
              <input type="hidden" {...register('imageUrlPublicId')} />

              <InputField label="Link Action" register={register} name="link" placeholder="e.g. /pricing" />
              <SelectField label="Status" name="active" control={control} options={[{label:'Active',value:'true'},{label:'Inactive',value:'false'}]} />
            </div>
          )}
          {modalType === 'announcement' && (
            <div className="space-y-4">
              <TextareaField label="News Text" required register={register} name="text" rows={2} placeholder="e.g. New AI features and WhatsApp alerts integration is now live!" />
              {/* 🎨 PREMIUM COLOR PICKER HUB */}
              <ColorPickerField
                label="Announcement Bar Color"
                value={control._formValues?.color || '#2563EB'}
                onChange={(hex) => reset({ ...control._formValues, color: hex })}
              />
              {/* Hidden field keeps value in react-hook-form */}
              <input type="hidden" {...register('color')} />
              <SelectField label="Visibility" name="active" control={control} options={[{label:'Show (Live on site)',value:'true'},{label:'Hide (Draft)',value:'false'}]} />
            </div>
          )}
          {modalType === 'partner' && (
            <div className="space-y-4">
              <InputField label="Institute Name" required register={register} name="name" placeholder="e.g. Army Public School" />
              
              {/* Image Upload Center for Partner */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="text-xs font-bold text-slate-800 block">Partner Logo Image (Cloudinary)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      setUploadingImage(true);
                      toast.info('Uploading partner logo to Cloudinary under the-clouds-academy/website-cms/partners...');
                      const uploadRes = await masterAdminService.uploadCmsImage(file, 'partners', editingItem?.logoUrlPublicId);
                      reset({
                        ...control._formValues,
                        logoUrl: uploadRes.url,
                        logoUrlPublicId: uploadRes.publicId
                      });
                      toast.success('Logo uploaded successfully!');
                    } catch (err) {
                      console.error(err);
                      toast.error('Logo upload failed.');
                    } finally {
                      setUploadingImage(false);
                    }
                  }}
                  className="w-full text-xs text-slate-500 cursor-pointer" 
                />
                <input type="hidden" {...register('logoUrl')} />
                <input type="hidden" {...register('logoUrlPublicId')} />
                {control._formValues?.logoUrl && (
                  <div className="mt-2 w-28 h-12 bg-white rounded border flex items-center justify-center p-1 overflow-hidden">
                    <img src={control._formValues.logoUrl} className="max-h-full max-w-full object-contain" />
                  </div>
                )}
                {uploadingImage && (
                  <div className="flex items-center gap-1.5 text-xs text-primary font-bold animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading image to Cloudinary...
                  </div>
                )}
              </div>
            </div>
          )}
          {modalType === 'faq' && (
            <div className="space-y-4">
              <InputField label="Question" required register={register} name="question" placeholder="e.g. How long does the data migration take?" />
              <TextareaField label="Answer" required register={register} name="answer" rows={4} placeholder="Write the precise, detailed answer here..." />
            </div>
          )}
          {modalType === 'social' && (
            <div className="space-y-4">
               <SelectField label="Platform" name="platform" control={control} options={[
                 {label:'Facebook',value:'Facebook'},
                 {label:'Instagram',value:'Instagram'},
                 {label:'LinkedIn',value:'LinkedIn'},
                 {label:'Twitter / X',value:'Twitter'},
                 {label:'Youtube',value:'Youtube'}
               ]} />
               <InputField label="URL" required register={register} name="url" placeholder="e.g. https://facebook.com/username" />
            </div>
          )}
          {modalType === 'roadmap' && (
            <div className="space-y-4">
               <InputField label="Title" required register={register} name="title" placeholder="e.g. WhatsApp Auto Fee Invoicing" />
               <div className="grid grid-cols-2 gap-4">
                  <SelectField label="Status" name="status" control={control} options={[{label:'Planning',value:'Planning'},{label:'Development',value:'In Development'}]} />
                  <InputField label="ETA" required register={register} name="eta" placeholder="e.g. Q3 2026" />
               </div>
            </div>
          )}
          {modalType === 'testimonial' && (
            <div className="space-y-4">
              <InputField label="Client Name" required register={register} name="name" placeholder="e.g. Prof. Tariq Mahmood" />
              <InputField label="School Name" required register={register} name="school" placeholder="e.g. Army Public School System" />
              <InputField label="Role/Designation" required register={register} name="role" placeholder="e.g. Managing Director" />
              <InputField label="Video Link" register={register} name="videoUrl" placeholder="e.g. https://youtube.com/watch?v=XXXXXX" />
              <TextareaField label="Content Quote" required register={register} name="content" rows={3} placeholder="Write the success story or testimonial text..." />
            </div>
          )}
        </form>
      </AppModal>

      {/* DELETE CONFIRM DIALOG */}
      <ConfirmDialog 
        open={showDeleteDialog} 
        onClose={() => setShowDeleteDialog(false)} 
        onConfirm={handleDelete} 
        title={`Delete ${modalType.toUpperCase()}`} 
        description={`Are you sure you want to permanently delete this ${modalType} from the database? This action cannot be undone.`} 
      />

      {/* REAL-TIME ACTIVATION/DEACTIVATION CONFIRM DIALOG */}
      <ConfirmDialog
        open={showToggleDialog}
        onClose={() => setShowToggleDialog(false)}
        onConfirm={handleToggleActiveConfirm}
        title={togglingItem?.active ? 'Deactivate Item' : 'Activate Item'}
        description={`Are you sure you want to ${togglingItem?.active ? 'deactivate' : 'activate'} this ${modalType} item? It will immediately reflect in the landing page simulator.`}
        confirmLabel={togglingItem?.active ? 'Deactivate' : 'Activate'}
        variant={togglingItem?.active ? 'destructive' : 'default'}
      />

      {/* MOCK LANDING POLICY MODALS OVERLAY */}
      <AppModal
        open={previewPolicyModal !== null}
        onClose={() => setPreviewPolicyModal(null)}
        title={previewPolicyModal === 'privacy' ? privacyPolicy.title : accountDeletePolicy.title}
        footer={<Button variant="outline" className="w-full rounded-xl" onClick={() => setPreviewPolicyModal(null)}>Close Document</Button>}
      >
        <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          {previewPolicyModal === 'privacy' ? (
            <>
              {privacyPolicy.aboutPlatform && (
                <div className="p-5 border rounded-2xl space-y-2" style={{ backgroundColor: `${branding.primaryColor}05`, borderColor: `${branding.primaryColor}15` }}>
                  <h4 className="font-black text-xs uppercase tracking-wider flex items-center gap-1.5" style={{ color: branding.primaryColor }}><Info className="w-4 h-4" /> About The Clouds Academy</h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{privacyPolicy.aboutPlatform}</p>
                </div>
              )}
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-400 font-mono">LAST UPDATED: {privacyPolicy.lastUpdated}</p>
                <div className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed space-y-3 font-mono bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {privacyPolicy.content}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-400 font-mono">LAST UPDATED: {accountDeletePolicy.lastUpdated}</p>
              <div className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed space-y-3 font-mono bg-slate-50 p-4 rounded-xl border border-slate-100">
                {accountDeletePolicy.content}
              </div>
            </div>
          )}
        </div>
      </AppModal>
    </div>
  );
}
