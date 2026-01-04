'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Camera,
  Plus,
  ArrowLeft,
  Calendar,
  Loader2,
  X,
  Trash2,
  LogOut,
  Image,
  Grid,
  ChevronLeft,
  ChevronRight,
  Download,
  ZoomIn,
} from 'lucide-react';
import { useToast } from '@/components/Toast';
import { ConfirmModal } from '@/components/ConfirmModal';

interface ProgressPhoto {
  id: string;
  photoUrl: string;
  thumbnailUrl?: string;
  type: 'front' | 'side' | 'back';
  weight?: number;
  notes?: string;
  takenAt: string;
}

export default function ProgressPhotosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'compare'>('grid');
  const [comparePhotos, setComparePhotos] = useState<{ before?: ProgressPhoto; after?: ProgressPhoto }>({});
  const [showUpload, setShowUpload] = useState(false);
  const [newPhoto, setNewPhoto] = useState({
    type: 'front' as 'front' | 'side' | 'back',
    notes: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; photoId: string | null }>({
    isOpen: false,
    photoId: null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchPhotos();
    }
  }, [status, router]);

  const fetchPhotos = async () => {
    try {
      const res = await fetch('/api/body/photos');
      if (res.ok) {
        const data = await res.json();
        setPhotos(data.photos || []);
      }
    } catch (error) {
      console.error('Failed to fetch photos:', error);
      toast.error('Failed to load photos', 'Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64Image = await base64Promise;

      // Upload to Cloudinary via our API
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64Image,
          folder: 'progress-photos',
          generateThumbnail: true,
        }),
      });

      if (!uploadRes.ok) {
        const error = await uploadRes.json();
        throw new Error(error.error || 'Failed to upload image');
      }

      const uploadData = await uploadRes.json();
      const photoUrl = uploadData.data?.url;
      const thumbnailUrl = uploadData.data?.thumbnailUrl;

      if (!photoUrl) {
        throw new Error('No URL returned from upload');
      }

      // Save photo record to database
      const res = await fetch('/api/body/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoUrl,
          thumbnailUrl,
          type: newPhoto.type,
          notes: newPhoto.notes,
        }),
      });

      if (res.ok) {
        await fetchPhotos();
        setShowUpload(false);
        setNewPhoto({ type: 'front', notes: '' });
        toast.success('Photo uploaded', 'Your progress photo has been saved.');
      } else {
        throw new Error('Failed to save photo record');
      }
    } catch (error) {
      console.error('Failed to upload photo:', error);
      toast.error('Upload failed', error instanceof Error ? error.message : 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      const res = await fetch(`/api/body/photos/${photoId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setPhotos(photos.filter(p => p.id !== photoId));
        setSelectedPhoto(null);
        setDeleteConfirm({ isOpen: false, photoId: null });
        toast.success('Photo deleted', 'Progress photo has been removed.');
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      console.error('Failed to delete photo:', error);
      toast.error('Delete failed', 'Could not delete the photo. Please try again.');
    }
  };

  const confirmDelete = (photoId: string) => {
    setDeleteConfirm({ isOpen: true, photoId });
  };

  const groupPhotosByMonth = () => {
    const grouped: Record<string, ProgressPhoto[]> = {};
    photos.forEach(photo => {
      const date = new Date(photo.takenAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(photo);
    });
    return grouped;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const groupedPhotos = groupPhotosByMonth();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 bg-black/90 backdrop-blur-lg border-b border-zinc-800 z-40">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/body" className="p-2 -ml-2 hover:bg-zinc-800 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">Progress Photos</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'compare' : 'grid')}
              className="p-2 hover:bg-zinc-800 rounded-lg"
            >
              {viewMode === 'grid' ? <Grid className="w-5 h-5" /> : <Image className="w-5 h-5" />}
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* View Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'grid'
                ? 'bg-orange-500 text-white'
                : 'bg-zinc-900 text-zinc-400'
            }`}
          >
            Gallery
          </button>
          <button
            onClick={() => setViewMode('compare')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'compare'
                ? 'bg-orange-500 text-white'
                : 'bg-zinc-900 text-zinc-400'
            }`}
          >
            Compare
          </button>
        </div>

        {viewMode === 'grid' ? (
          <>
            {/* Photo Grid by Month */}
            {Object.keys(groupedPhotos).length === 0 ? (
              <div className="text-center py-12">
                <Camera className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Progress Photos Yet</h3>
                <p className="text-zinc-500 mb-6">Start documenting your transformation journey</p>
                <button
                  onClick={() => setShowUpload(true)}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl font-medium"
                >
                  Add Your First Photo
                </button>
              </div>
            ) : (
              Object.entries(groupedPhotos)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([month, monthPhotos]) => (
                  <div key={month} className="mb-8">
                    <h3 className="text-sm font-medium text-zinc-400 mb-3">
                      {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {monthPhotos.map(photo => (
                        <button
                          key={photo.id}
                          onClick={() => setSelectedPhoto(photo)}
                          className="aspect-square rounded-lg overflow-hidden bg-zinc-900 relative group"
                        >
                          <img
                            src={photo.photoUrl}
                            alt={`Progress photo - ${photo.type}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ZoomIn className="w-6 h-6" />
                          </div>
                          <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/70 rounded text-xs capitalize">
                            {photo.type}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
            )}
          </>
        ) : (
          /* Compare Mode */
          <div className="space-y-6">
            <p className="text-zinc-400 text-center">Select two photos to compare your progress</p>

            <div className="grid grid-cols-2 gap-4">
              {/* Before Photo */}
              <div>
                <p className="text-sm text-zinc-400 mb-2 text-center">Before</p>
                <button
                  onClick={() => {
                    const photo = photos[photos.length - 1];
                    if (photo) setComparePhotos(prev => ({ ...prev, before: photo }));
                  }}
                  className="aspect-[3/4] w-full rounded-xl bg-zinc-900 border-2 border-dashed border-zinc-700 flex items-center justify-center overflow-hidden"
                >
                  {comparePhotos.before ? (
                    <img src={comparePhotos.before.photoUrl} alt="Before" className="w-full h-full object-cover" />
                  ) : (
                    <Plus className="w-8 h-8 text-zinc-600" />
                  )}
                </button>
                {comparePhotos.before && (
                  <p className="text-xs text-zinc-500 text-center mt-2">
                    {new Date(comparePhotos.before.takenAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* After Photo */}
              <div>
                <p className="text-sm text-zinc-400 mb-2 text-center">After</p>
                <button
                  onClick={() => {
                    const photo = photos[0];
                    if (photo) setComparePhotos(prev => ({ ...prev, after: photo }));
                  }}
                  className="aspect-[3/4] w-full rounded-xl bg-zinc-900 border-2 border-dashed border-zinc-700 flex items-center justify-center overflow-hidden"
                >
                  {comparePhotos.after ? (
                    <img src={comparePhotos.after.photoUrl} alt="After" className="w-full h-full object-cover" />
                  ) : (
                    <Plus className="w-8 h-8 text-zinc-600" />
                  )}
                </button>
                {comparePhotos.after && (
                  <p className="text-xs text-zinc-500 text-center mt-2">
                    {new Date(comparePhotos.after.takenAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* Photo Selector */}
            <div className="bg-zinc-900 rounded-xl p-4">
              <p className="text-sm font-medium mb-3">Select photos to compare:</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {photos.map(photo => (
                  <button
                    key={photo.id}
                    onClick={() => {
                      if (!comparePhotos.before) {
                        setComparePhotos({ before: photo });
                      } else if (!comparePhotos.after) {
                        setComparePhotos(prev => ({ ...prev, after: photo }));
                      } else {
                        setComparePhotos({ before: photo });
                      }
                    }}
                    className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                      comparePhotos.before?.id === photo.id || comparePhotos.after?.id === photo.id
                        ? 'border-orange-500'
                        : 'border-transparent'
                    }`}
                  >
                    <img src={photo.photoUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Photo FAB */}
      <button
        onClick={() => setShowUpload(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-orange-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-zinc-900 w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Add Progress Photo</h3>
              <button onClick={() => setShowUpload(false)} className="p-2 hover:bg-zinc-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Photo Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['front', 'side', 'back'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setNewPhoto(prev => ({ ...prev, type }))}
                      className={`py-2 rounded-lg font-medium capitalize transition-all ${
                        newPhoto.type === type
                          ? 'bg-orange-500 text-white'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Notes (optional)</label>
                <textarea
                  value={newPhoto.notes}
                  onChange={e => setNewPhoto(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any notes about this photo..."
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 resize-none"
                  rows={2}
                />
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    Take or Upload Photo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => setSelectedPhoto(null)} className="p-2 hover:bg-zinc-800 rounded-lg">
              <X className="w-6 h-6" />
            </button>
            <div className="text-center">
              <p className="text-sm text-zinc-400 capitalize">{selectedPhoto.type} View</p>
              <p className="text-xs text-zinc-500">
                {new Date(selectedPhoto.takenAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
            <button
              onClick={() => confirmDelete(selectedPhoto.id)}
              className="p-2 hover:bg-red-500/20 rounded-lg text-red-500"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-4">
            <img
              src={selectedPhoto.photoUrl}
              alt={`Progress photo - ${selectedPhoto.type}`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>

          {selectedPhoto.notes && (
            <div className="p-4 bg-zinc-900">
              <p className="text-sm text-zinc-400">{selectedPhoto.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, photoId: null })}
        onConfirm={() => deleteConfirm.photoId && handleDeletePhoto(deleteConfirm.photoId)}
        title="Delete Photo?"
        message="This progress photo will be permanently deleted. This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
