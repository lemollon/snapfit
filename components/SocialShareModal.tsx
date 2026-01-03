'use client';

import { useState } from 'react';
import {
  X, Share2, Instagram, Twitter, Facebook, Link2, Download,
  Check, Copy, Sparkles, Trophy, Flame, Zap, Heart
} from 'lucide-react';

interface ShareContent {
  type: 'achievement' | 'workout' | 'pr' | 'transformation' | 'challenge' | 'streak';
  title: string;
  subtitle?: string;
  value?: string;
  imageUrl?: string;
}

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: ShareContent;
}

const SHARE_PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram Stories',
    icon: Instagram,
    color: 'from-pink-500 via-purple-500 to-orange-500',
    action: 'Share to Stories',
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    icon: Twitter,
    color: 'from-gray-700 to-gray-900',
    action: 'Tweet',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: 'from-blue-600 to-blue-700',
    action: 'Share',
  },
  {
    id: 'copy',
    name: 'Copy Link',
    icon: Link2,
    color: 'from-violet-500 to-purple-600',
    action: 'Copy',
  },
  {
    id: 'download',
    name: 'Save Image',
    icon: Download,
    color: 'from-green-500 to-emerald-600',
    action: 'Download',
  },
];

const TYPE_ICONS = {
  achievement: Trophy,
  workout: Zap,
  pr: Flame,
  transformation: Heart,
  challenge: Trophy,
  streak: Flame,
};

const TYPE_COLORS = {
  achievement: 'from-amber-500 to-yellow-600',
  workout: 'from-violet-500 to-purple-600',
  pr: 'from-orange-500 to-red-600',
  transformation: 'from-pink-500 to-rose-600',
  challenge: 'from-green-500 to-emerald-600',
  streak: 'from-orange-500 to-amber-600',
};

const SHARE_CAPTIONS = {
  achievement: [
    "Just unlocked a new achievement on SnapFit! 🏆",
    "Another milestone crushed! 💪",
    "Badge earned! Who's next? 🔥",
  ],
  workout: [
    "Workout complete! 💪 #SnapFit",
    "Another day, another workout done! 🏋️",
    "Consistency is key! Just finished my workout 🔥",
  ],
  pr: [
    "NEW PR! 🎉 Breaking records and breaking limits!",
    "Personal record smashed! 💥",
    "PR alert! 🚨 New personal best!",
  ],
  transformation: [
    "Progress takes time, but it's worth it! 📈",
    "The journey continues! 💪",
    "Transformation in progress! 🔄",
  ],
  challenge: [
    "Challenge accepted and conquered! 🏆",
    "Another challenge in the books! ✅",
    "Challenge complete! Who's joining me? 🤝",
  ],
  streak: [
    "Streak extended! 🔥 Consistency is everything!",
    "On fire! 🔥 Day after day!",
    "The streak continues! 💪",
  ],
};

export default function SocialShareModal({ isOpen, onClose, content }: SocialShareModalProps) {
  const [selectedCaption, setSelectedCaption] = useState(0);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState<string | null>(null);

  if (!isOpen) return null;

  const TypeIcon = TYPE_ICONS[content.type];
  const typeColor = TYPE_COLORS[content.type];
  const captions = SHARE_CAPTIONS[content.type];

  const handleShare = async (platformId: string) => {
    setSharing(platformId);

    // Simulate share action
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (platformId === 'copy') {
      await navigator.clipboard.writeText(`${captions[selectedCaption]} https://snapfit.app/share/xyz`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }

    if (platformId === 'download') {
      // Would trigger image download
      console.log('Downloading share image...');
    }

    if (platformId === 'twitter') {
      const text = encodeURIComponent(captions[selectedCaption]);
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=https://snapfit.app`, '_blank');
    }

    if (platformId === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=https://snapfit.app`, '_blank');
    }

    setSharing(null);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-3xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-violet-400" />
            Share Your Win
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-all"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Preview Card */}
        <div className="p-4">
          <div className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl p-6 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl" />

            {/* Content */}
            <div className="relative text-center">
              <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${typeColor} flex items-center justify-center mb-4`}>
                <TypeIcon className="w-8 h-8 text-white" />
              </div>

              <h4 className="text-xl font-bold text-white mb-1">{content.title}</h4>
              {content.subtitle && (
                <p className="text-white/60 mb-3">{content.subtitle}</p>
              )}
              {content.value && (
                <p className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 text-transparent bg-clip-text">
                  {content.value}
                </p>
              )}

              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-white/40 text-sm flex items-center justify-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  SnapFit
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Caption Selector */}
        <div className="px-4 pb-4">
          <p className="text-sm text-white/60 mb-2">Choose a caption:</p>
          <div className="space-y-2">
            {captions.map((caption, index) => (
              <button
                key={index}
                onClick={() => setSelectedCaption(index)}
                className={`w-full p-3 rounded-xl text-left text-sm transition-all ${
                  selectedCaption === index
                    ? 'bg-violet-500/20 border border-violet-500/50 text-white'
                    : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                {caption}
              </button>
            ))}
          </div>
        </div>

        {/* Share Platforms */}
        <div className="p-4 border-t border-white/10">
          <p className="text-sm text-white/60 mb-3">Share to:</p>
          <div className="grid grid-cols-5 gap-2">
            {SHARE_PLATFORMS.map((platform) => {
              const Icon = platform.icon;
              const isSharing = sharing === platform.id;
              const isCopied = platform.id === 'copy' && copied;

              return (
                <button
                  key={platform.id}
                  onClick={() => handleShare(platform.id)}
                  disabled={isSharing}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${platform.color} flex items-center justify-center`}>
                    {isSharing ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : isCopied ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <Icon className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <span className="text-xs text-white/60">{platform.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Share Stats */}
        <div className="p-4 bg-white/5 text-center">
          <p className="text-white/40 text-sm">
            Sharing earns you <span className="text-violet-400 font-semibold">+50 XP</span>
          </p>
        </div>
      </div>
    </div>
  );
}
