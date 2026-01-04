'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Calendar, Camera, Scale, Moon, Brain, Clock,
  ChevronRight, Loader2, Check, X, Eye, User, MessageSquare
} from 'lucide-react';
import { useToast } from '@/components/Toast';

interface CheckInTemplate {
  id: string;
  name: string;
  description?: string;
  frequency: string;
  collectWeight: boolean;
  collectPhotos: boolean;
  collectMood: boolean;
  collectSleep: boolean;
  isActive: boolean;
}

interface PendingCheckIn {
  checkIn: any;
  response: any;
  client: any;
}

export default function CheckInsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<CheckInTemplate[]>([]);
  const [pending, setPending] = useState<PendingCheckIn[]>([]);
  const [tab, setTab] = useState<'pending' | 'templates'>('pending');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<any>(null);

  // Form state for new template
  const [templateName, setTemplateName] = useState('');
  const [templateFrequency, setTemplateFrequency] = useState('weekly');
  const [collectWeight, setCollectWeight] = useState(true);
  const [collectPhotos, setCollectPhotos] = useState(true);
  const [collectMood, setCollectMood] = useState(true);
  const [collectSleep, setCollectSleep] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user && !(session.user as any).isTrainer) {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      const [templatesRes, pendingRes] = await Promise.all([
        fetch('/api/trainer/check-ins?type=templates'),
        fetch('/api/trainer/check-ins?type=pending'),
      ]);

      const templatesData = await templatesRes.json();
      const pendingData = await pendingRes.json();

      setTemplates(templatesData.templates || []);
      setPending(pendingData.pending || []);
    } catch (error) {
      console.error('Failed to fetch check-in data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async () => {
    if (!templateName.trim()) return;

    try {
      const res = await fetch('/api/trainer/check-ins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'template',
          name: templateName,
          frequency: templateFrequency,
          collectWeight,
          collectPhotos,
          collectMood,
          collectSleep,
        }),
      });

      const data = await res.json();
      if (data.template) {
        setTemplates([data.template, ...templates]);
        setShowCreate(false);
        setTemplateName('');
      }
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  const reviewCheckIn = async (responseId: string, notes: string) => {
    try {
      await fetch('/api/trainer/check-ins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responseId, trainerNotes: notes }),
      });

      setSelectedResponse(null);
      fetchData();
    } catch (error) {
      console.error('Failed to review check-in:', error);
    }
  };

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'biweekly': return 'Every 2 Weeks';
      case 'monthly': return 'Monthly';
      default: return freq;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/trainer" className="p-2 hover:bg-zinc-800 rounded-xl transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold">Client Check-ins</h1>
                <p className="text-sm text-zinc-400">Automate progress tracking</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl font-semibold"
            >
              <Plus className="w-5 h-5" />
              New Template
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setTab('pending')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                tab === 'pending' ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              Pending Review
              {pending.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {pending.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('templates')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                tab === 'templates' ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              Templates
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {tab === 'pending' ? (
          pending.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/50 rounded-2xl border border-zinc-800">
              <Check className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p className="text-zinc-400">All caught up! No pending check-ins.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map((item) => (
                <div
                  key={item.response?.id}
                  className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-all"
                  onClick={() => setSelectedResponse(item)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold">
                      {item.client?.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.client?.name || 'Client'}</h3>
                      <p className="text-sm text-zinc-400">
                        Submitted {item.response?.submittedAt && new Date(item.response.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-zinc-400">
                      {item.response?.weight && (
                        <span className="flex items-center gap-1">
                          <Scale className="w-4 h-4" /> {item.response.weight} lbs
                        </span>
                      )}
                      {item.response?.photoUrls?.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Camera className="w-4 h-4" /> {item.response.photoUrls.length}
                        </span>
                      )}
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          templates.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/50 rounded-2xl border border-zinc-800">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
              <p className="text-zinc-400 mb-4">No check-in templates yet</p>
              <button
                onClick={() => setShowCreate(true)}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl font-semibold"
              >
                Create Your First Template
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold">{template.name}</h3>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs">
                      {getFrequencyLabel(template.frequency)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.collectWeight && (
                      <span className="px-2 py-1 bg-zinc-800 rounded-lg text-xs flex items-center gap-1">
                        <Scale className="w-3 h-3" /> Weight
                      </span>
                    )}
                    {template.collectPhotos && (
                      <span className="px-2 py-1 bg-zinc-800 rounded-lg text-xs flex items-center gap-1">
                        <Camera className="w-3 h-3" /> Photos
                      </span>
                    )}
                    {template.collectMood && (
                      <span className="px-2 py-1 bg-zinc-800 rounded-lg text-xs flex items-center gap-1">
                        <Brain className="w-3 h-3" /> Mood
                      </span>
                    )}
                    {template.collectSleep && (
                      <span className="px-2 py-1 bg-zinc-800 rounded-lg text-xs flex items-center gap-1">
                        <Moon className="w-3 h-3" /> Sleep
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${template.isActive ? 'text-green-400' : 'text-zinc-500'}`}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => toast.info('Schedule check-in', `To schedule "${template.name}", go to the Clients page and select a client.`)}
                      className="text-orange-400 text-sm font-medium hover:text-orange-300 transition-colors"
                    >
                      Schedule →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>

      {/* Create Template Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-3xl max-w-md w-full p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Create Check-in Template</h3>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-zinc-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Template Name</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Weekly Progress Check"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Frequency</label>
                <select
                  value={templateFrequency}
                  onChange={(e) => setTemplateFrequency(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:border-orange-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Every 2 Weeks</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Data to Collect</label>
                <div className="space-y-2">
                  {[
                    { id: 'weight', label: 'Weight', icon: Scale, value: collectWeight, setValue: setCollectWeight },
                    { id: 'photos', label: 'Progress Photos', icon: Camera, value: collectPhotos, setValue: setCollectPhotos },
                    { id: 'mood', label: 'Mood & Energy', icon: Brain, value: collectMood, setValue: setCollectMood },
                    { id: 'sleep', label: 'Sleep Quality', icon: Moon, value: collectSleep, setValue: setCollectSleep },
                  ].map((item) => (
                    <label key={item.id} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.value}
                        onChange={(e) => item.setValue(e.target.checked)}
                        className="w-5 h-5 rounded accent-orange-500"
                      />
                      <item.icon className="w-5 h-5 text-zinc-400" />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={createTemplate}
                disabled={!templateName.trim()}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl font-bold disabled:opacity-50"
              >
                Create Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Response Review Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold">
                  {selectedResponse.client?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="font-bold">{selectedResponse.client?.name}</h3>
                  <p className="text-sm text-zinc-400">Check-in Response</p>
                </div>
              </div>
              <button onClick={() => setSelectedResponse(null)} className="p-2 hover:bg-zinc-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {selectedResponse.response?.weight && (
                <div className="p-4 bg-zinc-800/50 rounded-xl">
                  <div className="flex items-center gap-2 text-zinc-400 mb-1">
                    <Scale className="w-4 h-4" /> Weight
                  </div>
                  <p className="text-2xl font-bold">{selectedResponse.response.weight} lbs</p>
                </div>
              )}

              {selectedResponse.response?.moodScore && (
                <div className="p-4 bg-zinc-800/50 rounded-xl">
                  <div className="flex items-center gap-2 text-zinc-400 mb-1">
                    <Brain className="w-4 h-4" /> Mood
                  </div>
                  <p className="text-2xl font-bold">{selectedResponse.response.moodScore}/10</p>
                </div>
              )}

              {selectedResponse.response?.sleepHours && (
                <div className="p-4 bg-zinc-800/50 rounded-xl">
                  <div className="flex items-center gap-2 text-zinc-400 mb-1">
                    <Moon className="w-4 h-4" /> Sleep
                  </div>
                  <p className="text-2xl font-bold">{selectedResponse.response.sleepHours}h</p>
                  {selectedResponse.response.sleepQuality && (
                    <p className="text-sm text-zinc-400">Quality: {selectedResponse.response.sleepQuality}/10</p>
                  )}
                </div>
              )}

              {selectedResponse.response?.clientNotes && (
                <div className="p-4 bg-zinc-800/50 rounded-xl">
                  <div className="flex items-center gap-2 text-zinc-400 mb-1">
                    <MessageSquare className="w-4 h-4" /> Notes
                  </div>
                  <p>{selectedResponse.response.clientNotes}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Your Feedback</label>
                <textarea
                  rows={3}
                  placeholder="Add notes for your client..."
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:border-orange-500"
                  id="trainerNotes"
                />
              </div>

              <button
                onClick={() => {
                  const notes = (document.getElementById('trainerNotes') as HTMLTextAreaElement)?.value;
                  reviewCheckIn(selectedResponse.response.id, notes);
                }}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl font-bold"
              >
                Mark as Reviewed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
