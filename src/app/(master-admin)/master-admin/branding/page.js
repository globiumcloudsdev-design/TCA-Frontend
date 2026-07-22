'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Palette, Save, RefreshCw, Upload, Layout, 
  Monitor, Smartphone, Laptop, CheckCircle2,
  Trash2, Plus, Image as ImageIcon, Sparkles,
  Type, Settings2, Database, Loader2, Award, CloudLightning
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputField, AppModal, FormSubmitButton, SelectField, ColorPickerField, GlobalFileUploader } from '@/components/common';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { masterAdminService } from '@/services';

export default function BrandingPage() {
  const [mounted, setMounted] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#4F46E5');
  const [secondaryColor, setSecondaryColor] = useState('#0F172A');
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Asset states synced with database
  const [logoUrl, setLogoUrl] = useState('');
  const [logoPublicId, setLogoPublicId] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [faviconPublicId, setFaviconPublicId] = useState('');
  const [customAssets, setCustomAssets] = useState([]);

  // File upload state loaders
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingCustomAsset, setUploadingCustomAsset] = useState(false);

  // Pre-curated premium brand theme presets
  const colorPresets = [
    { name: 'Classic Indigo', primary: '#4F46E5', secondary: '#0F172A', description: 'TCA default sleek tech design system', badge: 'Default' },
    { name: 'Royal Emerald', primary: '#059669', secondary: '#064E3B', description: 'Elegant, premium academic branding', badge: 'Professional' },
    { name: 'Ocean Cyan', primary: '#0891B2', secondary: '#0F172A', description: 'Fresh, vibrant, modern cloud aesthetic', badge: 'Modern' },
    { name: 'Midnight Violet', primary: '#7C3AED', secondary: '#030712', description: 'Deep tech, sleek purple futuristic vibe', badge: 'Futuristic' },
    { name: 'Sunset Amber', primary: '#D97706', secondary: '#1E1B4B', description: 'Warm amber tones with dark indigo base', badge: 'Vibrant' },
    { name: 'Crimson Rose', primary: '#E11D48', secondary: '#111827', description: 'Bold, passionate, high-contrast style', badge: 'Bold' },
    { name: 'Steel Minimalist', primary: '#475569', secondary: '#0F172A', description: 'Clean slate monochromatic look', badge: 'Minimalist' },
    { name: 'Teal Forest', primary: '#0D9488', secondary: '#022C22', description: 'Organic, peaceful, trustworthy color tone', badge: 'Natural' }
  ];

  // Form handling for Add Custom Asset modal using react-hook-form
  const { register, control: assetControl, handleSubmit: handleAssetSubmit, reset: resetAssetForm, setValue: setAssetVal, watch } = useForm({
    defaultValues: {
      label: '',
      type: 'logo',
      url: '',
      publicId: ''
    }
  });

  const watchUrl = watch('url');

  // Load from Postgres on mount
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        setLoading(true);
        const data = await masterAdminService.getWebsiteCms();
        if (data && data.branding) {
          setPrimaryColor(data.branding.primaryColor || '#4F46E5');
          setSecondaryColor(data.branding.secondaryColor || '#0F172A');
          setLogoUrl(data.branding.logoUrl || '');
          setLogoPublicId(data.branding.logoPublicId || '');
          setFaviconUrl(data.branding.faviconUrl || '');
          setFaviconPublicId(data.branding.faviconPublicId || '');
          setCustomAssets(data.branding.customAssets || []);
          toast.success('Successfully loaded custom branding settings from Neon Postgres!');
        }
      } catch (err) {
        console.error('Failed to load branding from database:', err);
        toast.error('Offline mode: Could not fetch branding settings from database.');
      } finally {
        setLoading(false);
        setInitialLoaded(true);
        setMounted(true);
      }
    };
    fetchBranding();
  }, []);

  // ⚡ HIGH-TECH REALTIME AUTO-SAVE DEBOUNCE ENGINE for Colors
  useEffect(() => {
    if (!mounted || !initialLoaded) return;

    const delayDebounceFn = setTimeout(async () => {
      try {
        setIsSyncing(true);
        await masterAdminService.updateWebsiteCms('branding', {
          primaryColor,
          secondaryColor,
          logoUrl,
          logoPublicId,
          faviconUrl,
          faviconPublicId,
          customAssets
        });
        console.log('✅ Real-time branding settings successfully auto-saved to PostgreSQL!');
      } catch (err) {
        console.error('Failed to auto-save branding colors to database:', err);
      } finally {
        setIsSyncing(false);
      }
    }, 700);

    return () => clearTimeout(delayDebounceFn);
  }, [primaryColor, secondaryColor, logoUrl, logoPublicId, faviconUrl, faviconPublicId, customAssets, mounted, initialLoaded]);

  // General fallback save
  const handleSaveBranding = async () => {
    try {
      setLoading(true);
      await masterAdminService.updateWebsiteCms('branding', {
        primaryColor,
        secondaryColor,
        logoUrl,
        logoPublicId,
        faviconUrl,
        faviconPublicId,
        customAssets
      });
      toast.success('Platform Branding themes saved and deployed to PostgreSQL successfully!');
    } catch (err) {
      console.error('Failed to save branding to Postgres:', err);
      toast.error('Failed to persist custom branding theme. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (preset) => {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
    toast.success(`Applied & Deployed "${preset.name}" preset colors live in real-time!`);
  };

  // 🟢 LOGO FILE UPLOAD AND SAVE
  const handleLogoUpload = async (file) => {
    if (!file) return;

    try {
      setUploadingLogo(true);
      toast.info('Uploading main logo to Cloudinary under the-clouds-academy/branding...');
      const uploadRes = await masterAdminService.uploadCmsImage(file, 'branding', logoPublicId);
      
      setLogoUrl(uploadRes.url);
      setLogoPublicId(uploadRes.publicId);

      // Save directly to database
      await masterAdminService.updateWebsiteCms('branding', {
        primaryColor,
        secondaryColor,
        logoUrl: uploadRes.url,
        logoPublicId: uploadRes.publicId,
        faviconUrl,
        faviconPublicId,
        customAssets
      });

      toast.success('Main Header Logo successfully uploaded and saved to PostgreSQL!');
    } catch (err) {
      console.error('Failed to upload logo:', err);
      toast.error('Logo upload failed.');
    } finally {
      setUploadingLogo(false);
    }
  };

  // 🟢 FAVICON FILE UPLOAD AND SAVE
  const handleFaviconUpload = async (file) => {
    if (!file) return;

    try {
      setUploadingFavicon(true);
      toast.info('Uploading browser favicon to Cloudinary...');
      const uploadRes = await masterAdminService.uploadCmsImage(file, 'branding', faviconPublicId);
      
      setFaviconUrl(uploadRes.url);
      setFaviconPublicId(uploadRes.publicId);

      // Save directly to database
      await masterAdminService.updateWebsiteCms('branding', {
        primaryColor,
        secondaryColor,
        logoUrl,
        logoPublicId,
        faviconUrl: uploadRes.url,
        faviconPublicId: uploadRes.publicId,
        customAssets
      });

      toast.success('Favicon successfully uploaded and saved to PostgreSQL!');
    } catch (err) {
      console.error('Failed to upload favicon:', err);
      toast.error('Favicon upload failed.');
    } finally {
      setUploadingFavicon(false);
    }
  };

  // 🟢 CUSTOM ASSETS MODAL UPLOAD
  const handleCustomAssetFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingCustomAsset(true);
      toast.info('Uploading branding asset file to Cloudinary...');
      const uploadRes = await masterAdminService.uploadCmsImage(file, 'branding');
      
      setAssetVal('url', uploadRes.url);
      setAssetVal('publicId', uploadRes.publicId);

      toast.success('Asset file uploaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Asset file upload failed.');
    } finally {
      setUploadingCustomAsset(false);
    }
  };

  // onSubmit for custom assets form
  const onAssetFormSubmit = async (data) => {
    if (!data.url) {
      toast.warning('Please upload a file first!');
      return;
    }

    const newAsset = {
      id: Date.now(),
      label: data.label,
      type: data.type,
      url: data.url,
      publicId: data.publicId
    };

    const updatedList = [...customAssets, newAsset];
    setCustomAssets(updatedList);
    setShowAssetModal(false);
    resetAssetForm();

    try {
      setLoading(true);
      await masterAdminService.updateWebsiteCms('branding', {
        primaryColor,
        secondaryColor,
        logoUrl,
        logoPublicId,
        faviconUrl,
        faviconPublicId,
        customAssets: updatedList
      });
      toast.success('Custom brand asset saved successfully to database!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to sync new asset with database.');
    } finally {
      setLoading(false);
    }
  };

  // Delete dynamic brand asset
  const handleDeleteCustomAsset = async (assetId, publicId) => {
    const updatedList = customAssets.filter(item => item.id !== assetId);
    setCustomAssets(updatedList);
    toast.info('Asset removed from list. Syncing database...');

    try {
      await masterAdminService.updateWebsiteCms('branding', {
        primaryColor,
        secondaryColor,
        logoUrl,
        logoPublicId,
        faviconUrl,
        faviconPublicId,
        customAssets: updatedList
      });
      toast.success('Asset removed successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to sync changes with database.');
    }
  };

  if (!mounted) return null;

  return (
    <div className="p-6 space-y-6">
      
      {/* DATABASE SYNC INDICATOR HEADER */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl border border-white/5 relative overflow-hidden">
        <Database className="absolute -left-12 -bottom-12 w-40 h-40 text-white/5 rotate-12" />
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">PostgreSQL Identity Synced</p>
          </div>
          <h2 className="text-base font-black tracking-tight flex items-center gap-1.5">
            Realtime Platform Themes & Branding
          </h2>
          <p className="text-[11px] text-white/50">Your configured theme colors will instantly apply to the live landing page and anonymous preview components!</p>
        </div>

        <div className="flex items-center gap-2 shrink-0 relative z-10">
          
          {/* Real-time autosave status indicator */}
          <div className="bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-[10px] text-white/75">{isSyncing ? 'Deploying...' : 'Auto-Sync Active'}</span>
          </div>

          <Button 
            variant="outline" 
            className="rounded-xl border-white/10 text-white hover:bg-white/5 h-10" 
            onClick={async () => {
              setPrimaryColor('#4F46E5');
              setSecondaryColor('#0F172A');
              toast.info('Default values restored.');
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Reset
          </Button>
          <Button 
            variant="default" 
            onClick={handleSaveBranding} 
            disabled={loading}
            className="shadow-lg shadow-primary/20 px-5 rounded-xl bg-primary text-white hover:bg-primary/90 flex items-center gap-2 h-10 font-bold"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Force Sync
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
        {/* Settings Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Theme Color Picker Section */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
            <h3 className="font-bold text-lg flex items-center justify-between border-b pb-4">
              <span className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary animate-pulse" />
                Colors Hub & Visual Palette Picker
              </span>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full">
                <CloudLightning className="w-3.5 h-3.5 animate-bounce" /> Live Realtime Auto-Save
              </div>
            </h3>
            
            {/* PREMIUM COLOR PICKERS using ColorPickerField */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Primary Brand Identity</p>
                <ColorPickerField
                  value={primaryColor}
                  onChange={(hex) => { setPrimaryColor(hex); }}
                />
                <p className="text-[9px] text-slate-400 italic">Auto-syncs to database 700ms after you stop picking!</p>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Navigation & Dark Surfaces</p>
                <ColorPickerField
                  value={secondaryColor}
                  onChange={(hex) => { setSecondaryColor(hex); }}
                />
                <p className="text-[9px] text-slate-400 italic">Updates header background and sidebar panels instantly.</p>
              </div>
            </div>

            {/* PRESETS DIVIDER */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full">
                <Award className="w-3.5 h-3.5 text-primary animate-pulse" /> Or Select From Premium Pre-curated Presets Hub
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* 🌈 COLOR PALETTE HUB GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {colorPresets.map((preset) => {
                const isActive = primaryColor.toLowerCase() === preset.primary.toLowerCase() && secondaryColor.toLowerCase() === preset.secondary.toLowerCase();
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-4 rounded-2xl text-left border-2 transition-all flex items-center justify-between group hover:shadow-md ${
                      isActive ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800">{preset.name}</span>
                        <Badge className={`text-[8px] font-bold px-1.5 py-0 border-none ${
                          isActive ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
                        }`}>{preset.badge}</Badge>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{preset.description}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Dual Color Swatches */}
                      <div className="flex -space-x-2.5">
                        <div 
                          className="w-7 h-7 rounded-full border-2 border-white shadow group-hover:scale-110 transition-transform duration-300"
                          style={{ backgroundColor: preset.primary }} 
                        />
                        <div 
                          className="w-7 h-7 rounded-full border-2 border-white shadow group-hover:scale-110 transition-transform duration-300"
                          style={{ backgroundColor: preset.secondary }} 
                        />
                      </div>
                      
                      {isActive && (
                        <CheckCircle2 className="w-5 h-5 text-primary animate-in zoom-in duration-300 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Typography & Brand Assets */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
             <div className="flex justify-between items-center border-b pb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Dynamic Brand Assets
                </h3>
                <Button size="sm" variant="default" className="rounded-xl font-bold" onClick={() => setShowAssetModal(true)}>
                   <Plus className="w-4 h-4 mr-1" /> Add Custom Asset
                </Button>
             </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Logo Asset Card via GlobalFileUploader */}
              <div className="p-4 bg-white border border-slate-200 rounded-3xl space-y-2">
                <GlobalFileUploader
                  label="Main Header Logo"
                  value={logoUrl}
                  resize={true}
                  resizeWidth={400}
                  resizeHeight={null}
                  resizeQuality={0.9}
                  onFile={handleLogoUpload}
                  onClear={async () => {
                    setLogoUrl('');
                    setLogoPublicId('');
                    await masterAdminService.updateWebsiteCms('branding', {
                      primaryColor,
                      secondaryColor,
                      logoUrl: '',
                      logoPublicId: '',
                      faviconUrl,
                      faviconPublicId,
                      customAssets
                    });
                    toast.success('Header Logo removed!');
                  }}
                  compact={true}
                  hint="Best size: landscape image. Auto-resizes to 400px wide."
                />
              </div>

              {/* Favicon Asset Card via GlobalFileUploader */}
              <div className="p-4 bg-white border border-slate-200 rounded-3xl space-y-2">
                <GlobalFileUploader
                  label="Browser Favicon"
                  value={faviconUrl}
                  resize={true}
                  resizeWidth={64}
                  resizeHeight={64}
                  resizeQuality={0.9}
                  onFile={handleFaviconUpload}
                  onClear={async () => {
                    setFaviconUrl('');
                    setFaviconPublicId('');
                    await masterAdminService.updateWebsiteCms('branding', {
                      primaryColor,
                      secondaryColor,
                      logoUrl,
                      logoPublicId,
                      faviconUrl: '',
                      faviconPublicId: '',
                      customAssets
                    });
                    toast.success('Favicon removed!');
                  }}
                  compact={true}
                  hint="Best size: square icon. Auto-resizes to 64x64px."
                />
              </div>
            </div>

            {/* Render dynamic Custom Assets */}
            {customAssets.length > 0 && (
              <div className="pt-4 border-t space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Custom Uploaded Assets ({customAssets.length})</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customAssets.map(asset => (
                    <div key={asset.id} className="p-4 border rounded-2xl bg-slate-50 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white border flex items-center justify-center overflow-hidden p-1 shrink-0 shadow-sm">
                          <img src={asset.url} className="max-h-full max-w-full object-contain" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-800 line-clamp-1">{asset.label}</p>
                          <Badge className="bg-slate-200 text-slate-600 border-none text-[8px] font-bold px-1.5 uppercase">{asset.type}</Badge>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteCustomAsset(asset.id, asset.publicId)} 
                        className="text-red-500 hover:bg-red-50 shrink-0 w-8 h-8 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Preview Area */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-6 shadow-2xl border border-white/10 sticky top-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h5 className="text-white font-bold text-sm tracking-tight">Theme Real-time Preview</h5>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-[1.5rem] overflow-hidden min-h-[450px] flex flex-col shadow-2xl relative group">
              {/* Fake Nav */}
              <div className="h-12 border-b border-slate-100 px-4 flex items-center gap-2 transition-colors duration-500" style={{ backgroundColor: secondaryColor }}>
                {logoUrl ? (
                  <img src={logoUrl} className="h-6 max-w-[80px] object-contain invert brightness-200" />
                ) : (
                  <div className="w-6 h-6 rounded-lg bg-white/20" />
                )}
                <div className="w-20 h-2 bg-white/10 rounded-full" />
                <div className="ml-auto flex gap-2">
                  <div className="w-4 h-4 rounded-full bg-white/10" />
                  <div className="w-4 h-4 rounded-full bg-white/10" />
                </div>
              </div>
              
              {/* Fake Sidebar & Content */}
              <div className="flex flex-1">
                 <div className="w-14 border-r border-slate-100 flex flex-col items-center py-4 gap-4 transition-colors duration-500" style={{ backgroundColor: secondaryColor, opacity: 0.95 }}>
                    {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-xl bg-white/10" />)}
                 </div>
                 <div className="flex-1 p-6 space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="w-32 h-6 rounded-lg bg-slate-100" />
                      <div className="w-16 h-8 rounded-xl transition-colors duration-500" style={{ backgroundColor: primaryColor }} />
                    </div>
                    <div className="space-y-2 pt-2">
                      <div className="w-full h-2 rounded-full bg-slate-50" />
                      <div className="w-5/6 h-2 rounded-full bg-slate-50" />
                      <div className="w-4/6 h-2 rounded-full bg-slate-50" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-4">
                      <div className="h-20 rounded-2xl bg-white border border-slate-100 shadow-sm p-3 space-y-2">
                        <div className="w-1/2 h-2 rounded-full bg-slate-100" />
                        <div className="w-full h-1 rounded-full bg-slate-50" />
                        <div className="w-full h-1 rounded-full bg-slate-50" />
                        <div className="w-8 h-8 rounded-full ml-auto mt-2 transition-colors duration-500" style={{ backgroundColor: primaryColor, opacity: 0.1 }} />
                      </div>
                      <div className="h-20 rounded-2xl bg-white border border-slate-100 shadow-sm p-3 space-y-2">
                        <div className="w-1/2 h-2 rounded-full bg-slate-100" />
                        <div className="w-full h-1 rounded-full bg-slate-50" />
                        <div className="w-full h-1 rounded-full bg-slate-50" />
                        <div className="w-8 h-8 rounded-full ml-auto mt-2 transition-colors duration-500" style={{ backgroundColor: primaryColor, opacity: 0.1 }} />
                      </div>
                    </div>
                 </div>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-all flex items-center justify-center pointer-events-none">
                 <Badge className="opacity-0 group-hover:opacity-100 transition-all bg-white text-slate-900 border-none shadow-xl scale-90 group-hover:scale-100">Live Preview</Badge>
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-6 text-white/30">
              <div className="flex flex-col items-center gap-2 group cursor-pointer hover:text-white transition-all">
                <Monitor className="w-6 h-6 text-white" />
                <span className="text-[10px] font-bold">Desktop</span>
              </div>
              <div className="flex flex-col items-center gap-2 group cursor-pointer hover:text-white transition-all">
                <Laptop className="w-6 h-6" />
                <span className="text-[10px] font-bold">Laptop</span>
              </div>
              <div className="flex flex-col items-center gap-2 group cursor-pointer hover:text-white transition-all">
                <Smartphone className="w-6 h-6" />
                <span className="text-[10px] font-bold">Mobile</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- ASSET MODAL --- */}
      <AppModal
        open={showAssetModal}
        onClose={() => setShowAssetModal(false)}
        title="Manage Brand Asset"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowAssetModal(false)}>Cancel</Button>
            <FormSubmitButton form="branding-asset-form" label="Upload & Save" disabled={uploadingCustomAsset} className="flex-1 rounded-xl" />
          </div>
        }
      >
        <form id="branding-asset-form" onSubmit={handleAssetSubmit(onAssetFormSubmit)} className="space-y-4">
           <InputField label="Asset Label" required register={register} name="label" placeholder="e.g. Email Signature Logo" />
           <SelectField 
            label="Asset Type" 
            name="type"
            control={assetControl}
            options={[
              { label: 'Header Logo', value: 'logo' },
              { label: 'Favicon', value: 'icon' },
              { label: 'Watermark', value: 'watermark' },
              { label: 'Social Banner', value: 'banner' }
            ]} 
            placeholder="Select asset type..."
           />
           <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl text-center bg-slate-50 space-y-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Upload className="w-8 h-8 text-primary animate-bounce" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Click to upload asset file</p>
                <p className="text-[10px] text-slate-400 mt-1">Maximum file size: 2MB (PNG, SVG, JPG)</p>
              </div>
              <label className="inline-flex items-center justify-center h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer font-bold text-xs shadow-sm">
                {uploadingCustomAsset ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                Browse & Upload File
                <input type="file" accept="image/*" className="hidden" onChange={handleCustomAssetFileChange} disabled={uploadingCustomAsset} />
              </label>
              
              {watchUrl && (
                <div className="mt-4 w-28 h-12 bg-white rounded border flex items-center justify-center p-1.5 mx-auto overflow-hidden">
                  <img src={watchUrl} className="max-h-full max-w-full object-contain" />
                </div>
              )}
           </div>
        </form>
      </AppModal>
    </div>
  );
}
