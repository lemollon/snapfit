'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  ArrowLeft, Search, Filter, Clock, Users, Flame, ChefHat,
  Heart, Bookmark, BookmarkCheck, Star, Plus, X, ChevronDown,
  Utensils, Leaf, Wheat, Drumstick, Apple, Coffee, Loader2, Check
} from 'lucide-react';
import { useToast } from '@/components/Toast';

// Hero image
const HERO_IMAGE = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&auto=format&fit=crop&q=80';

interface Recipe {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  cuisine?: string;
  tags: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  rating: number;
  ratingCount: number;
  isSaved: boolean;
  isFeatured?: boolean;
}

const CATEGORIES = [
  { id: 'all', name: 'All', icon: Utensils },
  { id: 'breakfast', name: 'Breakfast', icon: Coffee },
  { id: 'lunch', name: 'Lunch', icon: Apple },
  { id: 'dinner', name: 'Dinner', icon: Drumstick },
  { id: 'snack', name: 'Snacks', icon: Leaf },
  { id: 'smoothie', name: 'Smoothies', icon: Wheat },
];

const DIET_FILTERS = ['All', 'High-Protein', 'Keto', 'Vegan', 'Vegetarian', 'Gluten-Free', 'Low-Carb', 'Meal Prep'];

export default function RecipesPage() {
  const { data: session } = useSession();
  const toast = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDiet, setSelectedDiet] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loggingMeal, setLoggingMeal] = useState(false);
  const [mealLogged, setMealLogged] = useState(false);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Fetch recipes from API
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== 'all') params.append('category', selectedCategory);
        if (selectedDiet !== 'All') params.append('tag', selectedDiet.toLowerCase().replace('-', ''));
        if (searchQuery) params.append('search', searchQuery);

        const response = await fetch(`/api/recipes?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch recipes');
        }
        const data = await response.json();
        const transformedRecipes = (data.recipes || []).map((r: any) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          imageUrl: r.imageUrl,
          category: r.category,
          cuisine: r.cuisine,
          tags: r.tags || [],
          prepTime: r.prepTime,
          cookTime: r.cookTime,
          servings: r.servings,
          difficulty: r.difficulty || 'medium',
          calories: r.calories,
          protein: r.protein,
          carbs: r.carbs,
          fat: r.fat,
          rating: r.rating || 4.5,
          ratingCount: r.ratingCount || 0,
          isSaved: data.savedRecipeIds?.includes(r.id) || false,
          isFeatured: r.isFeatured,
        }));
        setRecipes(transformedRecipes);
      } catch (error) {
        console.error('Error fetching recipes:', error);
        toast.error('Failed to load recipes', 'Please try refreshing the page.');
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [selectedCategory, selectedDiet, searchQuery]);

  const toggleSave = async (recipeId: string) => {
    // Optimistic update
    setRecipes(recipes.map(r =>
      r.id === recipeId ? { ...r, isSaved: !r.isSaved } : r
    ));

    // Save to API if logged in
    if (session?.user) {
      try {
        await fetch('/api/recipes/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipeId }),
        });
      } catch (error) {
        console.error('Error saving recipe:', error);
        toast.error('Failed to save recipe', 'Please try again.');
        // Revert on error
        setRecipes(recipes.map(r =>
          r.id === recipeId ? { ...r, isSaved: !r.isSaved } : r
        ));
      }
    }
  };

  const logMeal = async (recipe: Recipe) => {
    if (!session?.user) {
      toast.warning('Login required', 'Please log in to log meals');
      return;
    }

    setLoggingMeal(true);
    try {
      const response = await fetch('/api/food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodName: recipe.name,
          mealType: recipe.category === 'breakfast' ? 'breakfast' :
                    recipe.category === 'lunch' ? 'lunch' :
                    recipe.category === 'dinner' ? 'dinner' : 'snack',
          calories: recipe.calories,
          protein: recipe.protein,
          carbs: recipe.carbs,
          fat: recipe.fat,
          notes: `Recipe: ${recipe.name} - ${recipe.description}`,
        }),
      });

      if (response.ok) {
        setMealLogged(true);
        toast.success('Meal logged!', `${recipe.name} added to your food diary`);
        setTimeout(() => {
          setMealLogged(false);
          setSelectedRecipe(null);
        }, 1500);
      } else {
        throw new Error('Failed to log meal');
      }
    } catch (error) {
      console.error('Error logging meal:', error);
      toast.error('Failed to log meal', 'Please try again');
    } finally {
      setLoggingMeal(false);
    }
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
    const matchesDiet = selectedDiet === 'All' ||
      recipe.tags.some(tag => tag.toLowerCase().includes(selectedDiet.toLowerCase().replace('-', '')));
    const matchesSaved = !showSavedOnly || recipe.isSaved;
    return matchesSearch && matchesCategory && matchesDiet && matchesSaved;
  });

  const featuredRecipes = recipes.filter(r => r.isFeatured);
  const savedRecipes = recipes.filter(r => r.isSaved);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/20';
      case 'hard': return 'text-red-400 bg-red-500/20';
      default: return 'text-white/60 bg-white/10';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-500 animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Header */}
      <div className="relative">
        <div
          className="h-56 bg-cover bg-center"
          style={{ backgroundImage: `url("${HERO_IMAGE}")` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-slate-900" />
        </div>

        {/* Header Actions */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Link
            href="/"
            className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              className={`p-3 backdrop-blur-xl rounded-2xl transition-all relative ${
                showSavedOnly ? 'bg-violet-500' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${showSavedOnly ? 'text-white fill-white' : 'text-white'}`} />
              {savedRecipes.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-violet-500 rounded-full text-xs flex items-center justify-center text-white">
                  {savedRecipes.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-1">
            <ChefHat className="w-6 h-6 text-violet-400" />
            <span className="text-violet-400 font-semibold">Fuel Your Gains</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Recipe Library</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
              showFilters ? 'bg-violet-500 text-white' : 'bg-white/10 text-white/60'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 space-y-4">
            <div>
              <p className="text-sm text-white/60 mb-2">Dietary Preference</p>
              <div className="flex flex-wrap gap-2">
                {DIET_FILTERS.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedDiet(filter)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      selectedDiet === filter
                        ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap flex items-center gap-2 transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Featured Recipes */}
        {selectedCategory === 'all' && featuredRecipes.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              Featured
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {featuredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  onClick={() => setSelectedRecipe(recipe)}
                  className="flex-shrink-0 w-72 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden cursor-pointer hover:border-violet-500/50 transition-all"
                >
                  <div className="relative h-40">
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSave(recipe.id);
                      }}
                      className="absolute top-2 right-2 p-2 bg-black/40 backdrop-blur-sm rounded-full"
                    >
                      {recipe.isSaved ? (
                        <BookmarkCheck className="w-5 h-5 text-violet-400" />
                      ) : (
                        <Bookmark className="w-5 h-5 text-white" />
                      )}
                    </button>
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                        {recipe.difficulty}
                      </span>
                      <div className="flex items-center gap-1 text-white text-sm">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        {recipe.rating}
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-1">{recipe.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-white/50">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {recipe.prepTime + recipe.cookTime}m
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-4 h-4" />
                        {recipe.calories} cal
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recipe Grid */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">
            {filteredRecipes.length} Recipes
          </h2>

          {filteredRecipes.length === 0 ? (
            <div className="text-center py-12 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
              <ChefHat className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 mb-2">No recipes found</p>
              {searchQuery || selectedDiet !== 'All' || selectedCategory !== 'all' ? (
                <p className="text-white/40 text-sm">Try adjusting your filters or search</p>
              ) : (
                <p className="text-white/40 text-sm">Check back later for new recipes</p>
              )}
            </div>
          ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => setSelectedRecipe(recipe)}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden cursor-pointer hover:border-violet-500/50 transition-all"
              >
                <div className="relative h-28">
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSave(recipe.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/40 backdrop-blur-sm rounded-full"
                  >
                    {recipe.isSaved ? (
                      <BookmarkCheck className="w-4 h-4 text-violet-400" />
                    ) : (
                      <Bookmark className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-white text-sm mb-1 line-clamp-2">{recipe.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <span>{recipe.prepTime + recipe.cookTime}m</span>
                    <span>•</span>
                    <span>{recipe.protein}g protein</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Macro Summary Card */}
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 backdrop-blur-xl rounded-3xl border border-green-500/30 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Macros Reference</h3>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Flame className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-lg font-bold text-white">2000</p>
              <p className="text-xs text-white/50">Calories</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Drumstick className="w-6 h-6 text-violet-400" />
              </div>
              <p className="text-lg font-bold text-white">150g</p>
              <p className="text-xs text-white/50">Protein</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Wheat className="w-6 h-6 text-amber-400" />
              </div>
              <p className="text-lg font-bold text-white">200g</p>
              <p className="text-xs text-white/50">Carbs</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Leaf className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-lg font-bold text-white">65g</p>
              <p className="text-xs text-white/50">Fat</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-screen">
            {/* Recipe Image */}
            <div className="relative h-72">
              <img
                src={selectedRecipe.imageUrl}
                alt={selectedRecipe.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/50" />

              <button
                onClick={() => setSelectedRecipe(null)}
                className="absolute top-4 left-4 p-3 bg-black/40 backdrop-blur-sm rounded-full"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <button
                onClick={() => toggleSave(selectedRecipe.id)}
                className="absolute top-4 right-4 p-3 bg-black/40 backdrop-blur-sm rounded-full"
              >
                {selectedRecipe.isSaved ? (
                  <BookmarkCheck className="w-5 h-5 text-violet-400" />
                ) : (
                  <Bookmark className="w-5 h-5 text-white" />
                )}
              </button>

              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedRecipe.difficulty)}`}>
                    {selectedRecipe.difficulty}
                  </span>
                  <span className="flex items-center gap-1 text-white text-sm">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    {selectedRecipe.rating} ({selectedRecipe.ratingCount})
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white">{selectedRecipe.name}</h2>
              </div>
            </div>

            {/* Recipe Content */}
            <div className="px-4 py-6 space-y-6">
              {/* Quick Info */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center">
                  <Clock className="w-6 h-6 text-violet-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-white">{selectedRecipe.prepTime + selectedRecipe.cookTime}</p>
                  <p className="text-xs text-white/50">minutes</p>
                </div>
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center">
                  <Users className="w-6 h-6 text-green-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-white">{selectedRecipe.servings}</p>
                  <p className="text-xs text-white/50">servings</p>
                </div>
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center">
                  <Flame className="w-6 h-6 text-orange-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-white">{selectedRecipe.calories}</p>
                  <p className="text-xs text-white/50">calories</p>
                </div>
              </div>

              {/* Macros */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
                <h3 className="font-semibold text-white mb-4">Nutrition per serving</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-violet-500 w-3/4" />
                    </div>
                    <p className="text-lg font-bold text-white">{selectedRecipe.protein}g</p>
                    <p className="text-xs text-white/50">Protein</p>
                  </div>
                  <div className="text-center">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-amber-500 w-1/2" />
                    </div>
                    <p className="text-lg font-bold text-white">{selectedRecipe.carbs}g</p>
                    <p className="text-xs text-white/50">Carbs</p>
                  </div>
                  <div className="text-center">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-green-500 w-1/3" />
                    </div>
                    <p className="text-lg font-bold text-white">{selectedRecipe.fat}g</p>
                    <p className="text-xs text-white/50">Fat</p>
                  </div>
                  <div className="text-center">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-red-500 w-full" />
                    </div>
                    <p className="text-lg font-bold text-white">{selectedRecipe.calories}</p>
                    <p className="text-xs text-white/50">Calories</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {selectedRecipe.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-white/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-white mb-2">Description</h3>
                <p className="text-white/70">{selectedRecipe.description}</p>
              </div>

              {/* Placeholder for ingredients and instructions */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
                <h3 className="font-semibold text-white mb-3">Ingredients</h3>
                <ul className="space-y-2 text-white/70">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-violet-500 rounded-full" />
                    8 oz chicken breast
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-violet-500 rounded-full" />
                    1 cup quinoa
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-violet-500 rounded-full" />
                    Mixed vegetables
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-violet-500 rounded-full" />
                    Olive oil, salt, pepper
                  </li>
                </ul>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
                <h3 className="font-semibold text-white mb-3">Instructions</h3>
                <ol className="space-y-3 text-white/70">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</span>
                    <p>Season chicken with salt and pepper, grill until cooked through.</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</span>
                    <p>Cook quinoa according to package instructions.</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</span>
                    <p>Roast vegetables with olive oil at 400°F for 20 minutes.</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center text-white text-sm font-bold">4</span>
                    <p>Assemble bowl and serve!</p>
                  </li>
                </ol>
              </div>

              {/* Log this meal button */}
              <button
                onClick={() => selectedRecipe && logMeal(selectedRecipe)}
                disabled={loggingMeal || mealLogged}
                className={`w-full py-4 rounded-2xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                  mealLogged
                    ? 'bg-green-500'
                    : 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700'
                } ${loggingMeal ? 'opacity-75' : ''}`}
              >
                {loggingMeal ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Logging...
                  </>
                ) : mealLogged ? (
                  <>
                    <Check className="w-5 h-5" />
                    Meal Logged!
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Log This Meal
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
