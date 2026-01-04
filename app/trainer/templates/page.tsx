'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  FileText,
  Loader2,
  Copy,
  Edit3,
  Trash2,
  X,
  Check,
  Dumbbell,
  Clock,
  Target,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useToast } from '@/components/Toast';
import { ConfirmModal } from '@/components/ConfirmModal';

interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  difficulty: string;
  duration?: number;
  category: string;
  exercises: TemplateExercise[];
  isPublic: boolean;
  usageCount: number;
  createdAt: string;
}

interface TemplateExercise {
  id: string;
  name: string;
  sets?: number;
  reps?: string;
  restSeconds?: number;
  notes?: string;
}

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced', 'elite'];
const CATEGORIES = ['strength', 'cardio', 'hiit', 'flexibility', 'full-body', 'upper-body', 'lower-body', 'core'];

export default function TrainerTemplatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; templateId: string | null }>({
    isOpen: false,
    templateId: null,
  });

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    difficulty: 'intermediate',
    duration: '',
    category: 'strength',
    exercises: [] as TemplateExercise[],
  });

  const [newExercise, setNewExercise] = useState({
    name: '',
    sets: '',
    reps: '',
    restSeconds: '',
    notes: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchTemplates();
    }
  }, [status, router]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/trainer/templates');
      if (!res.ok) throw new Error('Failed to fetch templates');
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      toast.error('Failed to load templates', 'Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExercise = () => {
    if (!newExercise.name) return;
    const exercise: TemplateExercise = {
      id: Date.now().toString(),
      name: newExercise.name,
      sets: newExercise.sets ? parseInt(newExercise.sets) : undefined,
      reps: newExercise.reps || undefined,
      restSeconds: newExercise.restSeconds ? parseInt(newExercise.restSeconds) : undefined,
      notes: newExercise.notes || undefined,
    };
    setNewTemplate({
      ...newTemplate,
      exercises: [...newTemplate.exercises, exercise],
    });
    setNewExercise({ name: '', sets: '', reps: '', restSeconds: '', notes: '' });
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setNewTemplate({
      ...newTemplate,
      exercises: newTemplate.exercises.filter(e => e.id !== exerciseId),
    });
  };

  const handleAddTemplate = async () => {
    if (!newTemplate.name) {
      toast.error('Name required', 'Please enter a template name.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/trainer/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTemplate.name,
          description: newTemplate.description || undefined,
          difficulty: newTemplate.difficulty,
          duration: newTemplate.duration ? parseInt(newTemplate.duration) : undefined,
          category: newTemplate.category,
          exercises: newTemplate.exercises,
        }),
      });
      if (!res.ok) throw new Error('Failed to create template');
      const data = await res.json();
      if (data.template) {
        setTemplates([data.template, ...templates]);
        setNewTemplate({
          name: '',
          description: '',
          difficulty: 'intermediate',
          duration: '',
          category: 'strength',
          exercises: [],
        });
        setShowAddModal(false);
        toast.success('Template created', 'Your workout template is ready to use.');
      }
    } catch (error) {
      console.error('Failed to add template:', error);
      toast.error('Failed to create template', 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await fetch(`/api/trainer/templates?id=${templateId}`, {
        method: 'DELETE',
      });
      setTemplates(templates.filter(t => t.id !== templateId));
      setDeleteConfirm({ isOpen: false, templateId: null });
      toast.success('Template deleted', 'The workout template has been removed.');
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast.error('Delete failed', 'Could not delete the template. Please try again.');
    }
  };

  const confirmDeleteTemplate = (templateId: string) => {
    setDeleteConfirm({ isOpen: true, templateId });
  };

  const handleDuplicateTemplate = async (template: WorkoutTemplate) => {
    setSaving(true);
    try {
      const res = await fetch('/api/trainer/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${template.name} (Copy)`,
          description: template.description,
          difficulty: template.difficulty,
          duration: template.duration,
          category: template.category,
          exercises: template.exercises,
        }),
      });
      if (!res.ok) throw new Error('Failed to duplicate template');
      const data = await res.json();
      if (data.template) {
        setTemplates([data.template, ...templates]);
        toast.success('Template duplicated', 'A copy has been created.');
      }
    } catch (error) {
      console.error('Failed to duplicate template:', error);
      toast.error('Failed to duplicate', 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/trainer" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold">Workout Templates</h1>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              New Template
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Templates List */}
        {templates.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No templates yet</h2>
            <p className="text-white/60 mb-6">Create workout templates to quickly assign to clients</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Create Your First Template
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="p-5 bg-white/10 border border-white/10 rounded-2xl hover:bg-white/15 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center shrink-0">
                      <Dumbbell className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{template.name}</h3>
                      {template.description && (
                        <p className="text-sm text-white/60 mt-1 line-clamp-2">{template.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className={`text-xs px-2 py-0.5 rounded capitalize ${
                          template.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                          template.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                          template.difficulty === 'advanced' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {template.difficulty}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-white/10 rounded capitalize">
                          {template.category}
                        </span>
                        {template.duration && (
                          <span className="text-xs text-white/60 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {template.duration} min
                          </span>
                        )}
                        <span className="text-xs text-white/60 flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {template.exercises.length} exercises
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedTemplate(expandedTemplate === template.id ? null : template.id)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {expandedTemplate === template.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Expanded Exercises */}
                {expandedTemplate === template.id && template.exercises.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <h4 className="text-sm font-medium text-white/60 mb-3">Exercises</h4>
                    <div className="space-y-2">
                      {template.exercises.map((exercise, index) => (
                        <div
                          key={exercise.id}
                          className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                        >
                          <span className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-xs">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{exercise.name}</p>
                            <div className="flex items-center gap-3 text-xs text-white/60 mt-0.5">
                              {exercise.sets && <span>{exercise.sets} sets</span>}
                              {exercise.reps && <span>{exercise.reps} reps</span>}
                              {exercise.restSeconds && <span>{exercise.restSeconds}s rest</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
                  <button
                    onClick={() => handleDuplicateTemplate(template)}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </button>
                  <button
                    onClick={() => confirmDeleteTemplate(template.id)}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Template Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-gray-900 rounded-2xl border border-white/10 p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Create Workout Template</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Template Name */}
              <div>
                <label className="block text-sm text-white/60 mb-1">Template Name *</label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="w-full p-3 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500"
                  placeholder="e.g., Upper Body Strength"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-white/60 mb-1">Description</label>
                <textarea
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  className="w-full p-3 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 resize-none"
                  rows={2}
                  placeholder="Brief description..."
                />
              </div>

              {/* Difficulty & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Difficulty</label>
                  <select
                    value={newTemplate.difficulty}
                    onChange={(e) => setNewTemplate({ ...newTemplate, difficulty: e.target.value })}
                    className="w-full p-3 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500"
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d} className="bg-gray-900">
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={newTemplate.duration}
                    onChange={(e) => setNewTemplate({ ...newTemplate, duration: e.target.value })}
                    className="w-full p-3 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500"
                    placeholder="45"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm text-white/60 mb-1">Category</label>
                <select
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                  className="w-full p-3 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-gray-900">
                      {c.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Exercises */}
              <div>
                <label className="block text-sm text-white/60 mb-2">Exercises</label>

                {/* Exercise List */}
                {newTemplate.exercises.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {newTemplate.exercises.map((exercise, index) => (
                      <div
                        key={exercise.id}
                        className="flex items-center gap-2 p-2 bg-white/5 rounded-lg"
                      >
                        <span className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-xs">
                          {index + 1}
                        </span>
                        <span className="flex-1 text-sm">{exercise.name}</span>
                        {exercise.sets && <span className="text-xs text-white/60">{exercise.sets}x{exercise.reps || '?'}</span>}
                        <button
                          onClick={() => handleRemoveExercise(exercise.id)}
                          className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Exercise Form */}
                <div className="p-3 bg-white/5 rounded-lg space-y-2">
                  <input
                    type="text"
                    value={newExercise.name}
                    onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                    className="w-full p-2 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-sm"
                    placeholder="Exercise name"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      value={newExercise.sets}
                      onChange={(e) => setNewExercise({ ...newExercise, sets: e.target.value })}
                      className="p-2 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-sm"
                      placeholder="Sets"
                    />
                    <input
                      type="text"
                      value={newExercise.reps}
                      onChange={(e) => setNewExercise({ ...newExercise, reps: e.target.value })}
                      className="p-2 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-sm"
                      placeholder="Reps"
                    />
                    <input
                      type="number"
                      value={newExercise.restSeconds}
                      onChange={(e) => setNewExercise({ ...newExercise, restSeconds: e.target.value })}
                      className="p-2 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-sm"
                      placeholder="Rest (s)"
                    />
                  </div>
                  <button
                    onClick={handleAddExercise}
                    disabled={!newExercise.name}
                    className="w-full p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    Add Exercise
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleAddTemplate}
                disabled={!newTemplate.name || saving}
                className="w-full p-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                Create Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, templateId: null })}
        onConfirm={() => deleteConfirm.templateId && handleDeleteTemplate(deleteConfirm.templateId)}
        title="Delete Template?"
        message="This workout template will be permanently removed. This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
