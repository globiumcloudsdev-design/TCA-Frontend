'use client';
import { useState, useMemo, useEffect } from 'react';
import { 
  Globe, Layout, HelpCircle, Star, Save, Plus, Trash2, Edit2, 
  Image as ImageIcon, Type, Sparkles, Video, Calculator, Map,
  CheckCircle2, Play, DollarSign, ArrowRight, Settings2, Edit,
  Facebook, Instagram, Twitter, Linkedin, Link2, Share2, Info,
  Youtube, Monitor, Megaphone, Building2, Eye, EyeOff, Clock, Timer
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { 
  AppModal, InputField, TextareaField, FormSubmitButton, DataTable, SelectField, ConfirmDialog, PageHeader
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SimpleTooltip } from '@/components/ui/SimpleTooltip';
import { toast } from 'sonner';

export default function WebsiteCMSPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [modalType, setModalType] = useState('faq'); 
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Calculator Real-time State
  const [studentCount, setStudentCount] = useState(1500);
  const [pricingConfig, setPricingConfig] = useState({
    basePrice: 5000,
    perStudentRate: 15,
    discountThreshold: 500,
    discountPercentage: 10
  });

  const estimatedTotal = useMemo(() => {
    const studentCost = studentCount * pricingConfig.perStudentRate;
    let total = pricingConfig.basePrice + studentCost;
    if (studentCount >= pricingConfig.discountThreshold) {
      total -= total * (pricingConfig.discountPercentage / 100);
    }
    return Math.round(total);
  }, [studentCount, pricingConfig]);

  const { register, control, handleSubmit, reset, setValue } = useForm();

  useEffect(() => { setMounted(true); }, []);

  // --- DUMMY DATA STATES ---
  const [faqs, setFaqs] = useState([{ id: 1, question: 'How to register?', answer: 'Go to login page.' }]);
  const [testimonials, setTestimonials] = useState([{ id: 1, name: 'Dr. Ahmad', school: 'Beaconhouse School', role: 'Principal', content: 'TCA is the best!', videoUrl: 'https://youtube.com/watch?v=123' }]);
  const [roadmap, setRoadmap] = useState([{ id: 1, title: 'AI Attendance', status: 'In Development', eta: 'Q3 2026' }]);
  const [socialLinks, setSocialLinks] = useState([{ id: 1, platform: 'Facebook', url: 'https://fb.com/tca' }]);
  const [videos, setVideos] = useState([{ id: 1, title: 'TCA Demo 2026', url: 'https://youtube.com/watch?v=demo', desc: 'Full walkthrough.', category: 'Demo' }]);
  const [banners, setBanners] = useState([{ id: 1, title: 'Summer Admission 20% Off', imageUrl: 'https://placehold.co/1200x400', link: '/admissions', active: true }]);
  const [partners, setPartners] = useState([{ id: 1, name: 'The City School', logoUrl: 'https://placehold.co/200x100' }]);
  const [announcements, setAnnouncements] = useState([{ id: 1, text: 'New AI Features are now live!', active: true, color: '#2563eb' }]);

  const [countdown, setCountdown] = useState({
    title: 'Flash Sale: 50% Off for 1st Month!',
    endDate: '2026-06-01T00:00',
    description: 'Register your institute before the timer ends.',
    active: true,
    buttonText: 'Claim Offer',
    buttonLink: '/register'
  });

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
        desc: '', category: 'General', imageUrl: '', link: '', active: 'true', text: '', color: '#2563eb'
      });
    }
    setShowModal(true);
  };

  const onSubmit = (data) => {
    if (modalType === 'countdown') {
      setCountdown({ ...data, active: data.active === 'true' });
      toast.success('Countdown Updated!');
      return;
    }
    toast.success(`${modalType.toUpperCase()} Saved!`);
    setShowModal(false);
  };

  const confirmDelete = (type, id) => {
    setModalType(type);
    setDeletingId(id);
    setShowDeleteDialog(true);
  };

  const handleDelete = () => {
    toast.error(`${modalType.toUpperCase()} has been deleted from Website CMS.`);
    setShowDeleteDialog(false);
  };

  const handleConfigChange = (field, value) => {
    setPricingConfig(prev => ({ ...prev, [field]: Number(value) }));
  };

  const tabs = [
    { id: 'hero', label: 'Hero', icon: Layout },
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
  ];

  // --- COLUMNS ---
  const faqColumns = useMemo(() => [
    { header: 'Question', accessorKey: 'question', cell: ({ row }) => <span className="font-bold text-slate-900">{row.original.question}</span> },
    { header: 'Actions', id: 'actions', cell: ({ row }) => (
      <div className="flex gap-1 justify-center">
        <Button variant="ghost" size="icon" onClick={() => handleOpenModal('faq', row.original)}><Edit className="w-4 h-4" /></Button>
        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => confirmDelete('faq', row.original.id)}><Trash2 className="w-4 h-4" /></Button>
      </div>
    )}
  ], []);

  const testimonialColumns = useMemo(() => [
    { header: 'Client Info', cell: ({ row }) => <div className="flex items-center gap-2"><div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-bold text-xs">{row.original.name?.[0]}</div><div><p className="font-bold text-xs">{row.original.name}</p><p className="text-[10px] text-slate-400">{row.original.school}</p></div></div> },
    { header: 'Video URL', accessorKey: 'videoUrl', cell: ({ row }) => <span className="text-[10px] font-mono">{row.original.videoUrl}</span> },
    { header: 'Actions', id: 'actions', cell: ({ row }) => (
      <div className="flex gap-1 justify-center">
        <Button variant="ghost" size="icon" onClick={() => handleOpenModal('testimonial', row.original)}><Edit className="w-4 h-4" /></Button>
        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => confirmDelete('testimonial', row.original.id)}><Trash2 className="w-4 h-4" /></Button>
      </div>
    )}
  ], []);

  const roadmapColumns = useMemo(() => [
    { header: 'Feature', accessorKey: 'title', cell: ({ row }) => <span className="font-bold">{row.original.title}</span> },
    { header: 'Status', cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{row.original.status}</Badge> },
    { header: 'Actions', id: 'actions', cell: ({ row }) => (
      <div className="flex gap-1 justify-center">
        <Button variant="ghost" size="icon" onClick={() => handleOpenModal('roadmap', row.original)}><Edit className="w-4 h-4" /></Button>
        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => confirmDelete('roadmap', row.original.id)}><Trash2 className="w-4 h-4" /></Button>
      </div>
    )}
  ], []);

  const socialColumns = useMemo(() => [
    { header: 'Platform', accessorKey: 'platform', cell: ({ row }) => <span className="font-bold">{row.original.platform}</span> },
    { header: 'URL', accessorKey: 'url', cell: ({ row }) => <span className="text-[10px]">{row.original.url}</span> },
    { header: 'Actions', id: 'actions', cell: ({ row }) => (
      <div className="flex gap-1 justify-center">
        <Button variant="ghost" size="icon" onClick={() => handleOpenModal('social', row.original)}><Edit className="w-4 h-4" /></Button>
        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => confirmDelete('social', row.original.id)}><Trash2 className="w-4 h-4" /></Button>
      </div>
    )}
  ], []);

  const videoColumns = useMemo(() => [
    { header: 'Title', accessorKey: 'title', cell: ({ row }) => <span className="font-bold">{row.original.title}</span> },
    { header: 'Category', cell: ({ row }) => <Badge className="bg-slate-100 text-slate-600 border-none">{row.original.category}</Badge> },
    { header: 'Actions', id: 'actions', cell: ({ row }) => (
      <div className="flex gap-1 justify-center">
        <Button variant="ghost" size="icon" onClick={() => handleOpenModal('video', row.original)}><Edit className="w-4 h-4" /></Button>
        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => confirmDelete('video', row.original.id)}><Trash2 className="w-4 h-4" /></Button>
      </div>
    )}
  ], []);

  const bannerColumns = useMemo(() => [
    { header: 'Banner Title', accessorKey: 'title', cell: ({ row }) => <span className="font-bold">{row.original.title}</span> },
    { header: 'Status', cell: ({ row }) => <Badge className={row.original.active ? 'bg-emerald-500 text-white border-none' : 'bg-slate-200'}>{row.original.active ? 'Active' : 'Inactive'}</Badge> },
    { header: 'Actions', id: 'actions', cell: ({ row }) => (
      <div className="flex gap-1 justify-center">
        <Button variant="ghost" size="icon" onClick={() => handleOpenModal('banner', row.original)}><Edit className="w-4 h-4" /></Button>
        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => confirmDelete('banner', row.original.id)}><Trash2 className="w-4 h-4" /></Button>
      </div>
    )}
  ], []);

  const partnerColumns = useMemo(() => [
    { header: 'Institute', accessorKey: 'name', cell: ({ row }) => <span className="font-bold">{row.original.name}</span> },
    { header: 'Actions', id: 'actions', cell: ({ row }) => (
      <div className="flex gap-1 justify-center">
        <Button variant="ghost" size="icon" onClick={() => handleOpenModal('partner', row.original)}><Edit className="w-4 h-4" /></Button>
        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => confirmDelete('partner', row.original.id)}><Trash2 className="w-4 h-4" /></Button>
      </div>
    )}
  ], []);

  const announcementColumns = useMemo(() => [
    { header: 'Message', accessorKey: 'text', cell: ({ row }) => <span className="font-bold">{row.original.text}</span> },
    { header: 'Actions', id: 'actions', cell: ({ row }) => (
      <div className="flex gap-1 justify-center">
        <Button variant="ghost" size="icon" onClick={() => handleOpenModal('announcement', row.original)}><Edit className="w-4 h-4" /></Button>
        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => confirmDelete('announcement', row.original.id)}><Trash2 className="w-4 h-4" /></Button>
      </div>
    )}
  ], []);

  if (!mounted) return null;

  return (
    <div className="p-6 space-y-6 pb-20">
      <PageHeader 
        title="Website Global CMS" 
        description="Full control over landing page branding, pricing tools, and marketing assets." 
        icon={Globe}
      />

      <div className="bg-white p-1 border border-slate-200 flex overflow-x-auto custom-scrollbar shadow-sm">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 flex items-center gap-2 font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. HERO SECTION */}
      {activeTab === 'hero' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-8 border border-slate-200 space-y-6">
            <h3 className="font-bold text-lg flex items-center gap-2"><Type className="w-5 h-5 text-primary" /> Main Headings</h3>
            <div className="space-y-4">
               <InputField label="Hero Title" defaultValue="Empowering Schools with Smart Management" placeholder="e.g. Smart Schooling" />
               <TextareaField label="Hero Subtitle" defaultValue="The most comprehensive and easy-to-use school management system." placeholder="Describe your platform..." rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Primary Button" defaultValue="Get Started" />
              <InputField label="Secondary Button" defaultValue="Watch Demo" />
            </div>
            <Button variant="default" className="w-full h-11 rounded-lg font-bold shadow-lg shadow-primary/20"><Save className="w-4 h-4 mr-2" /> Save Hero Section</Button>
          </div>
          <div className="bg-white p-8 border border-slate-200 flex flex-col justify-center text-center space-y-6">
            <h3 className="font-bold text-lg flex items-center gap-2 justify-center"><ImageIcon className="w-5 h-5 text-primary" /> Visual Media</h3>
            <div className="aspect-video bg-slate-50 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-200 hover:border-primary/50 transition-colors group relative overflow-hidden">
               <div className="relative z-10">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-xl border border-slate-100 group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-7 h-7 text-primary" />
                </div>
                <p className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Dashboard Mockup</p>
                <Button variant="outline" size="sm" className="mt-6 rounded-lg font-bold border-slate-200">Change Asset</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PRICING CALCULATOR */}
      {activeTab === 'pricing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="lg:col-span-5 bg-white p-8 border border-slate-200 space-y-6">
              <h3 className="font-bold text-lg flex items-center gap-2"><Settings2 className="w-5 h-5 text-primary" /> Pricing Algorithm</h3>
              <InputField label="Base Platform Fee" type="number" value={pricingConfig.basePrice} onChange={(e) => handleConfigChange('basePrice', e.target.value)} prefix="PKR" />
              <InputField label="Rate Per Student" type="number" value={pricingConfig.perStudentRate} onChange={(e) => handleConfigChange('perStudentRate', e.target.value)} prefix="PKR" />
              <div className="pt-4 border-t border-slate-100 space-y-4">
                 <InputField label="Bulk Discount Threshold" type="number" value={pricingConfig.discountThreshold} onChange={(e) => handleConfigChange('discountThreshold', e.target.value)} />
                 <InputField label="Discount Percentage (%)" type="number" value={pricingConfig.discountPercentage} onChange={(e) => handleConfigChange('discountPercentage', e.target.value)} suffix="%" />
              </div>
              <Button variant="default" className="w-full h-11 font-bold shadow-lg shadow-primary/20"><Save className="w-4 h-4 mr-2" /> Save Calculator Logic</Button>
           </div>
           <div className="lg:col-span-7 bg-slate-950 p-10 rounded-xl shadow-2xl relative overflow-hidden flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
              <div className="relative z-10 space-y-8">
                 <h4 className="text-white font-bold text-xl">Live Preview</h4>
                 <div className="p-8 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-8">
                    <div className="flex justify-between items-end">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Select Student Strength</label>
                       <span className="text-2xl font-black text-white leading-none">{studentCount.toLocaleString()} <span className="text-xs text-slate-500">Students</span></span>
                    </div>
                    <input type="range" min="100" max="5000" step="50" value={studentCount} onChange={(e) => setStudentCount(Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary" />
                    <div className="p-6 bg-primary rounded-xl flex justify-between items-center shadow-2xl shadow-primary/40">
                       <div>
                          <p className="text-[10px] font-black text-white/60 uppercase">Monthly Total</p>
                          <h5 className="text-3xl font-black text-white tracking-tighter">PKR {estimatedTotal.toLocaleString()}</h5>
                       </div>
                       <ArrowRight className="w-6 h-6 text-white" />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* 3. COUNTDOWN TIMER */}
      {activeTab === 'countdown' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-white p-8 border border-slate-200 space-y-6">
              <h3 className="font-bold text-lg flex items-center gap-2"><Timer className="w-5 h-5 text-primary" /> Countdown Settings</h3>
              <div className="space-y-4">
                 <InputField label="Campaign Title" value={countdown.title} onChange={(e) => setCountdown({...countdown, title: e.target.value})} />
                 <InputField label="End Date & Time" type="datetime-local" value={countdown.endDate} onChange={(e) => setCountdown({...countdown, endDate: e.target.value})} />
                 <TextareaField label="Description" value={countdown.description} onChange={(e) => setCountdown({...countdown, description: e.target.value})} rows={3} />
                 <div className="grid grid-cols-2 gap-4">
                    <InputField label="Button Text" value={countdown.buttonText} onChange={(e) => setCountdown({...countdown, buttonText: e.target.value})} />
                    <InputField label="Button Link" value={countdown.buttonLink} onChange={(e) => setCountdown({...countdown, buttonLink: e.target.value})} />
                 </div>
                 <SelectField label="Countdown Status" value={String(countdown.active)} onChange={(val) => setCountdown({...countdown, active: val === 'true'})} options={[{label:'Active',value:'true'},{label:'Inactive',value:'false'}]} />
              </div>
              <Button variant="default" className="w-full h-11 font-bold shadow-lg shadow-primary/20" onClick={() => toast.success('Countdown Saved!')}>
                 <Save className="w-4 h-4 mr-2" /> Save Countdown
              </Button>
           </div>
           <div className="bg-slate-900 p-10 rounded-xl shadow-2xl flex flex-col justify-center items-center text-center space-y-8 relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                 {countdown.active ? (
                   <>
                    <Badge className="bg-primary text-white font-black px-4 py-1.5 rounded-full animate-pulse">LIVE CAMPAIGN</Badge>
                    <h4 className="text-white text-3xl font-black tracking-tighter leading-tight">{countdown.title}</h4>
                    <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
                       {[ {l:'Days',v:'02'}, {l:'Hours',v:'14'}, {l:'Min',v:'45'}, {l:'Sec',v:'09'} ].map((t,i) => (
                         <div key={i} className="p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
                            <p className="text-2xl font-black text-white">{t.v}</p>
                            <p className="text-[9px] font-bold text-slate-500 uppercase">{t.l}</p>
                         </div>
                       ))}
                    </div>
                    <Button variant="default" className="rounded-full px-10 h-12 font-black shadow-xl shadow-primary/40">{countdown.buttonText}</Button>
                   </>
                 ) : <div className="text-slate-500 font-bold uppercase tracking-widest opacity-20">Timer Inactive</div>}
              </div>
           </div>
        </div>
      )}

      {/* DYNAMIC TABS */}
      {['banners', 'videos', 'announcements', 'partners', 'testimonials', 'roadmap', 'social', 'faq'].includes(activeTab) && (
        <div className="bg-white border border-slate-200 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 className="font-bold text-lg text-slate-900 uppercase tracking-tight">{activeTab} Management</h3>
              <Button variant="default" size="sm" onClick={() => {
                const map = { banners:'banner', videos:'video', announcements:'announcement', partners:'partner', testimonials:'testimonial', roadmap:'roadmap', social:'social', faq:'faq' };
                handleOpenModal(map[activeTab]);
              }} className="rounded-lg font-bold h-10 px-5 shadow-lg shadow-primary/10">
                 <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
           </div>
           <DataTable 
              columns={ activeTab === 'banners' ? bannerColumns : activeTab === 'videos' ? videoColumns : activeTab === 'announcements' ? announcementColumns : activeTab === 'partners' ? partnerColumns : activeTab === 'testimonials' ? testimonialColumns : activeTab === 'roadmap' ? roadmapColumns : activeTab === 'social' ? socialColumns : faqColumns } 
              data={ activeTab === 'banners' ? banners : activeTab === 'videos' ? videos : activeTab === 'announcements' ? announcements : activeTab === 'partners' ? partners : activeTab === 'testimonials' ? testimonials : activeTab === 'roadmap' ? roadmap : activeTab === 'social' ? socialLinks : faqs } 
           />
        </div>
      )}

      {/* UNIVERSAL MODAL */}
      <AppModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? `Edit ${modalType.toUpperCase()}` : `Add New ${modalType.toUpperCase()}`}
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1 rounded-lg" onClick={() => setShowModal(false)}>Cancel</Button>
            <FormSubmitButton form="cms-form" label="Save to Website" className="flex-1 rounded-lg shadow-lg shadow-primary/10" />
          </div>
        }
      >
        <form id="cms-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {modalType === 'video' && (
            <div className="space-y-4">
              <InputField label="Video Title" required register={register} name="title" />
              <InputField label="YouTube URL" required register={register} name="url" />
              <SelectField label="Category" name="category" control={control} options={[{label:'Demo',value:'Demo'},{label:'Tutorial',value:'Tutorial'}]} />
              <TextareaField label="Description" register={register} name="desc" rows={3} />
            </div>
          )}
          {modalType === 'banner' && (
            <div className="space-y-4">
              <InputField label="Banner Title" required register={register} name="title" />
              <InputField label="Image URL" required register={register} name="imageUrl" />
              <InputField label="Link Action" register={register} name="link" />
              <SelectField label="Status" name="active" control={control} options={[{label:'Active',value:'true'},{label:'Inactive',value:'false'}]} />
            </div>
          )}
          {modalType === 'announcement' && (
            <div className="space-y-4">
              <TextareaField label="News Text" required register={register} name="text" rows={2} />
              <InputField label="Bar Color (Hex)" register={register} name="color" />
              <SelectField label="Visibility" name="active" control={control} options={[{label:'Show',value:'true'},{label:'Hide',value:'false'}]} />
            </div>
          )}
          {modalType === 'partner' && (
            <div className="space-y-4">
              <InputField label="Institute Name" required register={register} name="name" />
              <InputField label="Logo URL" required register={register} name="logoUrl" />
            </div>
          )}
          {modalType === 'faq' && (
            <div className="space-y-4">
              <InputField label="Question" required register={register} name="question" />
              <TextareaField label="Answer" required register={register} name="answer" rows={4} />
            </div>
          )}
          {modalType === 'social' && (
            <div className="space-y-4">
               <SelectField label="Platform" name="platform" control={control} options={[{label:'Facebook',value:'Facebook'},{label:'Instagram',value:'Instagram'},{label:'LinkedIn',value:'LinkedIn'}]} />
               <InputField label="URL" required register={register} name="url" />
            </div>
          )}
          {modalType === 'roadmap' && (
            <div className="space-y-4">
               <InputField label="Title" required register={register} name="title" />
               <div className="grid grid-cols-2 gap-4">
                  <SelectField label="Status" name="status" control={control} options={[{label:'Planning',value:'Planning'},{label:'Development',value:'In Development'}]} />
                  <InputField label="ETA" required register={register} name="eta" />
               </div>
            </div>
          )}
          {modalType === 'testimonial' && (
            <div className="space-y-4">
              <InputField label="Client Name" required register={register} name="name" />
              <InputField label="School Name" required register={register} name="school" />
              <InputField label="Video Link" register={register} name="videoUrl" />
              <TextareaField label="Content Quote" required register={register} name="content" rows={3} />
            </div>
          )}
        </form>
      </AppModal>

      <ConfirmDialog 
        open={showDeleteDialog} 
        onClose={() => setShowDeleteDialog(false)} 
        onConfirm={handleDelete} 
        title={`Delete ${modalType.toUpperCase()}`} 
        description={`Are you sure you want to permanently delete this ${modalType} from the Website CMS? This action will remove it from the public landing page and cannot be undone.`} 
      />
    </div>
  );
}
