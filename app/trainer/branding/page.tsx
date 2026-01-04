'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  ArrowLeft, Palette, Type, Globe, Image, Upload, Eye, Save,
  Crown, Sparkles, Check, X, ExternalLink, Instagram, Youtube,
  Twitter, Smartphone, Monitor, Sun, Moon, Loader2
} from 'lucide-react';

// Hero image
const HERO_IMAGE = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&auto=format&fit=crop&q=80';

interface BrandingSettings {
  businessName: string;
  tagline: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  fontFamily: string;
  customDomain: string;
  instagramHandle: string;
  youtubeHandle: string;
  twitterHandle: string;
  hideSnapfitBranding: boolean;
}

const COLOR_PRESETS = [
  { name: 'Violet', primary: '#8B5CF6', secondary: '#EC4899', accent: '#06B6D4' },
  { name: 'Ocean', primary: '#0EA5E9', secondary: '#6366F1', accent: '#22D3EE' },
  { name: 'Forest', primary: '#10B981', secondary: '#059669', accent: '#34D399' },
  { name: 'Sunset', primary: '#F59E0B', secondary: '#EF4444', accent: '#FBBF24' },
  { name: 'Rose', primary: '#EC4899', secondary: '#F43F5E', accent: '#FB7185' },
  { name: 'Monochrome', primary: '#6B7280', secondary: '#374151', accent: '#9CA3AF' },
];

const FONT_OPTIONS = [
  'Inter',
  'Poppins',
  'Roboto',
  'Open Sans',
  'Montserrat',
  'Lato',
  'Oswald',
  'Raleway',
];

export default function BrandingPage() {
  const { data: session } = useSession();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<BrandingSettings>({
    businessName: '',
    tagline: '',
    logoUrl: '',
    primaryColor: '#8B5CF6',
    secondaryColor: '#EC4899',
    accentColor: '#06B6D4',
    backgroundColor: '#0F172A',
    fontFamily: 'Inter',
    customDomain: '',
    instagramHandle: '',
    youtubeHandle: '',
    twitterHandle: '',
    hideSnapfitBranding: false,
  });

  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'domain' | 'social'>('colors');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Load existing branding settings
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await fetch('/api/trainer/branding');
        if (res.ok) {
          const data = await res.json();
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error('Failed to load branding:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (session?.user) {
      fetchBranding();
    } else {
      setIsLoading(false);
    }
  }, [session]);

  const updateSetting = <K extends keyof BrandingSettings>(
    key: K,
    value: BrandingSettings[K]
  ) => {
    setSettings({ ...settings, [key]: value });
  };

  const applyColorPreset = (preset: typeof COLOR_PRESETS[0]) => {
    setSettings({
      ...settings,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64Image = await base64Promise;

      // Upload to Cloudinary
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64Image,
          folder: 'avatars',
        }),
      });

      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        if (uploadData.data?.url) {
          setSettings(prev => ({ ...prev, logoUrl: uploadData.data.url }));
        }
      } else {
        alert('Failed to upload logo');
      }
    } catch (error) {
      console.error('Logo upload failed:', error);
      alert('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/trainer/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save branding');
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to save branding settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Header */}
      <div className="relative">
        <div
          className="h-48 bg-cover bg-center"
          style={{ backgroundImage: `url("${HERO_IMAGE}")` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-slate-900" />
        </div>

        {/* Header Actions */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Link
            href="/trainer"
            className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl font-medium text-white flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>

        {/* Title */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-1">
            <Palette className="w-6 h-6 text-violet-400" />
            <span className="text-violet-400 font-semibold">White Label</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Brand Settings</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Premium Banner */}
        <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 backdrop-blur-xl rounded-3xl border border-amber-500/30 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-2xl">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">Pro Branding Features</h3>
              <p className="text-white/60 text-sm mb-3">
                Unlock custom domain, remove SnapFit branding, and access premium fonts.
              </p>
              <button
                onClick={() => setShowUpgrade(true)}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-xl font-medium text-slate-900 text-sm hover:from-amber-500 hover:to-yellow-600 transition-all"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>

        {/* Business Info */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            Business Identity
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Business Name</label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => updateSetting('businessName', e.target.value)}
                placeholder="Your Business Name"
                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => updateSetting('tagline', e.target.value)}
                placeholder="Your motivational tagline"
                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white/5 border-2 border-dashed border-white/20 rounded-2xl flex items-center justify-center">
                  {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain rounded-xl" />
                  ) : (
                    <Image className="w-8 h-8 text-white/30" />
                  )}
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white flex items-center gap-2 hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  {uploadingLogo ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'colors', name: 'Colors', icon: Palette },
            { id: 'typography', name: 'Typography', icon: Type },
            { id: 'domain', name: 'Domain', icon: Globe },
            { id: 'social', name: 'Social', icon: Instagram },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-full whitespace-nowrap flex items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Colors Tab */}
        {activeTab === 'colors' && (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 space-y-6">
            <h3 className="font-semibold text-white">Color Presets</h3>
            <div className="grid grid-cols-3 gap-3">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyColorPreset(preset)}
                  className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-violet-500/50 transition-all"
                >
                  <div className="flex gap-1 mb-2">
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.primary }} />
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.secondary }} />
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.accent }} />
                  </div>
                  <p className="text-sm text-white/60">{preset.name}</p>
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-white">Custom Colors</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => updateSetting('primaryColor', e.target.value)}
                      className="w-12 h-12 rounded-xl cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={settings.primaryColor}
                      onChange={(e) => updateSetting('primaryColor', e.target.value)}
                      className="flex-1 p-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Secondary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                      className="w-12 h-12 rounded-xl cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={settings.secondaryColor}
                      onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                      className="flex-1 p-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Typography Tab */}
        {activeTab === 'typography' && (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 space-y-4">
            <h3 className="font-semibold text-white">Font Family</h3>
            <div className="grid grid-cols-2 gap-3">
              {FONT_OPTIONS.map((font) => (
                <button
                  key={font}
                  onClick={() => updateSetting('fontFamily', font)}
                  className={`p-4 rounded-2xl border transition-all text-left ${
                    settings.fontFamily === font
                      ? 'bg-violet-500/20 border-violet-500/50'
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                  style={{ fontFamily: font }}
                >
                  <p className="text-white font-semibold">{font}</p>
                  <p className="text-white/50 text-sm">Aa Bb Cc 123</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Domain Tab */}
        {activeTab === 'domain' && (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Custom Domain</h3>
              <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Pro
              </span>
            </div>

            <p className="text-white/60 text-sm">
              Use your own domain for a fully branded experience. Your clients will never see SnapFit branding.
            </p>

            <div>
              <label className="block text-sm text-white/60 mb-2">Your Domain</label>
              <div className="flex items-center gap-2">
                <span className="text-white/40">https://</span>
                <input
                  type="text"
                  value={settings.customDomain}
                  onChange={(e) => updateSetting('customDomain', e.target.value)}
                  placeholder="app.yourdomain.com"
                  className="flex-1 p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
              <div>
                <p className="text-white font-medium">Remove SnapFit Branding</p>
                <p className="text-white/50 text-sm">Hide &quot;Powered by SnapFit&quot; footer</p>
              </div>
              <button
                onClick={() => updateSetting('hideSnapfitBranding', !settings.hideSnapfitBranding)}
                className={`w-12 h-7 rounded-full transition-all ${
                  settings.hideSnapfitBranding ? 'bg-violet-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-all ${
                    settings.hideSnapfitBranding ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Social Tab */}
        {activeTab === 'social' && (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 space-y-4">
            <h3 className="font-semibold text-white">Social Links</h3>
            <p className="text-white/60 text-sm">
              Add your social media handles to display in your branded app.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2 flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  Instagram
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-white/40">@</span>
                  <input
                    type="text"
                    value={settings.instagramHandle}
                    onChange={(e) => updateSetting('instagramHandle', e.target.value)}
                    placeholder="yourusername"
                    className="flex-1 p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2 flex items-center gap-2">
                  <Youtube className="w-4 h-4" />
                  YouTube
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-white/40">@</span>
                  <input
                    type="text"
                    value={settings.youtubeHandle}
                    onChange={(e) => updateSetting('youtubeHandle', e.target.value)}
                    placeholder="yourchannel"
                    className="flex-1 p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2 flex items-center gap-2">
                  <Twitter className="w-4 h-4" />
                  Twitter / X
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-white/40">@</span>
                  <input
                    type="text"
                    value={settings.twitterHandle}
                    onChange={(e) => updateSetting('twitterHandle', e.target.value)}
                    placeholder="yourhandle"
                    className="flex-1 p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live Preview */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-violet-400" />
              Live Preview
            </h3>
            <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-2 rounded-lg transition-all ${
                  previewMode === 'mobile' ? 'bg-violet-500 text-white' : 'text-white/60'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-2 rounded-lg transition-all ${
                  previewMode === 'desktop' ? 'bg-violet-500 text-white' : 'text-white/60'
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Preview Container */}
          <div
            className={`mx-auto transition-all ${
              previewMode === 'mobile' ? 'max-w-[320px]' : 'max-w-full'
            }`}
          >
            <div
              className="rounded-3xl overflow-hidden border-4 border-slate-700"
              style={{ backgroundColor: settings.backgroundColor }}
            >
              {/* Preview Header */}
              <div
                className="p-4"
                style={{
                  background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    {settings.logoUrl ? (
                      <img src={settings.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {settings.businessName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-white font-bold" style={{ fontFamily: settings.fontFamily }}>
                      {settings.businessName}
                    </h4>
                    <p className="text-white/70 text-xs">{settings.tagline}</p>
                  </div>
                </div>
              </div>

              {/* Preview Content */}
              <div className="p-4 space-y-4">
                <div className="bg-white/5 rounded-2xl p-4">
                  <h5 className="text-white font-semibold mb-2" style={{ fontFamily: settings.fontFamily }}>
                    Today&apos;s Workout
                  </h5>
                  <div className="h-20 bg-white/5 rounded-xl flex items-center justify-center">
                    <span className="text-white/30 text-sm">Workout Preview</span>
                  </div>
                </div>

                <button
                  className="w-full py-3 rounded-2xl font-semibold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`,
                    fontFamily: settings.fontFamily,
                  }}
                >
                  Start Workout
                </button>
              </div>

              {/* Preview Footer */}
              {!settings.hideSnapfitBranding && (
                <div className="p-3 text-center border-t border-white/5">
                  <p className="text-white/30 text-xs">Powered by SnapFit</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
