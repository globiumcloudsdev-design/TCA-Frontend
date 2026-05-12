'use client';
import { useState , useEffect} from 'react';
import { 
  Palette, Save, RefreshCw, Upload, Layout, 
  Monitor, Smartphone, Laptop, CheckCircle2,
  Trash2, Plus, Image as ImageIcon, Sparkles,
  Type, Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputField, AppModal, FormSubmitButton, SelectField } from '@/components/common';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function BrandingPage() {
  const [mounted, setMounted] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#4F46E5');
  const [secondaryColor, setSecondaryColor] = useState('#0F172A');
  const [showAssetModal, setShowAssetModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSaveBranding = () => {
    toast.success('Platform Branding Updated Successfully!');
  };

  if (!mounted) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Palette className="w-6 h-6 text-primary" />
            Branding & Theming
          </h1>
          <p className="text-slate-500 text-sm">Customize the visual identity of The Clouds Academy.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="rounded-xl" onClick={() => {
             setPrimaryColor('#4F46E5');
             setSecondaryColor('#0F172A');
             toast.info('Default theme restored');
           }}>
            <RefreshCw className="w-4 h-4 mr-2" /> Reset Defaults
          </Button>
          <Button variant="default" onClick={handleSaveBranding} className="shadow-lg shadow-primary/20 px-6">
            <Save className="w-4 h-4 mr-2" /> Save Branding
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Colors Section */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-left-4 duration-500">
            <h3 className="font-bold text-lg mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div className="w-2 h-6 bg-primary rounded-full" />
                Theme Colors
              </span>
              <Settings2 className="w-4 h-4 text-slate-400" />
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Identity</label>
                <div className="flex gap-4 items-center">
                  <div className="relative group">
                    <input 
                      type="color" 
                      value={primaryColor} 
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-white shadow-md"
                    />
                    <div className="absolute inset-0 rounded-2xl ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all" />
                  </div>
                  <div className="flex-1">
                    <InputField 
                      value={primaryColor} 
                      onChange={(e) => setPrimaryColor(e.target.value)} 
                      className="bg-white border-slate-200"
                      placeholder="#000000"
                    />
                    <p className="text-[10px] text-slate-400 mt-2 italic">Used for buttons, links, and primary brand assets.</p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Navigation & Surfaces</label>
                <div className="flex gap-4 items-center">
                  <div className="relative group">
                    <input 
                      type="color" 
                      value={secondaryColor} 
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-white shadow-md"
                    />
                    <div className="absolute inset-0 rounded-2xl ring-2 ring-slate-900/10 group-hover:ring-slate-900/30 transition-all" />
                  </div>
                  <div className="flex-1">
                    <InputField 
                      value={secondaryColor} 
                      onChange={(e) => setSecondaryColor(e.target.value)} 
                      className="bg-white border-slate-200"
                      placeholder="#000000"
                    />
                    <p className="text-[10px] text-slate-400 mt-2 italic">Used for sidebars, headers, and footer sections.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Typography & Assets */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-left-4 duration-700">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Brand Assets
                </h3>
                <Button size="sm" variant="default" onClick={() => setShowAssetModal(true)}>
                   <Plus className="w-4 h-4 mr-1" /> Add Custom Asset
                </Button>
             </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-3 hover:border-primary/50 transition-all bg-slate-50/30 cursor-pointer">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Layout className="w-8 h-8 text-primary/40" />
                </div>
                <h5 className="font-bold text-slate-800">Main Header Logo</h5>
                <p className="text-[10px] text-slate-400">Current: tca-logo-dark.png (500x150)</p>
                <div className="flex gap-2 justify-center pt-2">
                  <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg">Replace</Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 rounded-lg"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>

              <div className="group p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-3 hover:border-primary/50 transition-all bg-slate-50/30 cursor-pointer">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Monitor className="w-8 h-8 text-primary/40" />
                </div>
                <h5 className="font-bold text-slate-800">Browser Favicon</h5>
                <p className="text-[10px] text-slate-400">Current: favicon.ico (32x32)</p>
                <div className="flex gap-2 justify-center pt-2">
                  <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg">Replace</Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 rounded-lg"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Area */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-6 shadow-2xl border border-white/10 sticky top-6 animate-in fade-in zoom-in duration-500">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center">
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
                <div className="w-6 h-6 rounded-lg bg-white/20" />
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
            <FormSubmitButton form="branding-asset-form" label="Upload & Save" className="flex-1 rounded-xl" />
          </div>
        }
      >
        <form id="branding-asset-form" onSubmit={(e) => { e.preventDefault(); setShowAssetModal(false); toast.success('Asset uploaded!'); }} className="space-y-4">
           <InputField label="Asset Label" required placeholder="e.g. Email Signature Logo" />
           <SelectField 
            label="Asset Type" 
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
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Click to upload asset</p>
                <p className="text-[10px] text-slate-400 mt-1">Maximum file size: 2MB (PNG, SVG, JPG)</p>
              </div>
              <Button type="button" variant="outline" className="rounded-xl">Browse Files</Button>
           </div>
        </form>
      </AppModal>
    </div>
  );
}
