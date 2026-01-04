'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  ShoppingBag,
  Loader2,
  ExternalLink,
  Edit3,
  Trash2,
  X,
  Check,
  Package,
  Shirt,
  Pill,
  Dumbbell,
} from 'lucide-react';
import { useToast } from '@/components/Toast';
import { ConfirmModal } from '@/components/ConfirmModal';

interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  currency: string;
  category: string;
  productUrl?: string;
  imageUrl?: string;
  isActive: boolean;
}

const CATEGORIES = [
  { id: 'supplement', label: 'Supplements', icon: Pill },
  { id: 'apparel', label: 'Apparel', icon: Shirt },
  { id: 'equipment', label: 'Equipment', icon: Dumbbell },
  { id: 'program', label: 'Programs', icon: Package },
];

export default function TrainerProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; productId: string | null }>({
    isOpen: false,
    productId: null,
  });

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: 'supplement',
    productUrl: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchProducts();
    }
  }, [status, router]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/trainer/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products', 'Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name) {
      toast.error('Name required', 'Please enter a product name.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/trainer/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProduct.name,
          description: newProduct.description || undefined,
          price: newProduct.price ? parseFloat(newProduct.price) : undefined,
          category: newProduct.category,
          productUrl: newProduct.productUrl || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to add product');
      const data = await res.json();
      if (data.product) {
        setProducts([data.product, ...products]);
        setNewProduct({ name: '', description: '', price: '', category: 'supplement', productUrl: '' });
        setShowAddModal(false);
        toast.success('Product added', 'Your product has been created successfully.');
      }
    } catch (error) {
      console.error('Failed to add product:', error);
      toast.error('Failed to add product', 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await fetch(`/api/trainer/products?id=${productId}`, {
        method: 'DELETE',
      });
      setProducts(products.filter(p => p.id !== productId));
      setDeleteConfirm({ isOpen: false, productId: null });
      toast.success('Product deleted', 'The product has been removed.');
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Delete failed', 'Could not delete the product. Please try again.');
    }
  };

  const confirmDeleteProduct = (productId: string) => {
    setDeleteConfirm({ isOpen: true, productId });
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
              <h1 className="text-xl font-bold">My Products</h1>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No products yet</h2>
            <p className="text-white/60 mb-6">Add products to share with your clients</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {products.map((product) => {
              const CategoryIcon = CATEGORIES.find(c => c.id === product.category)?.icon || Package;
              return (
                <div
                  key={product.id}
                  className="p-5 bg-white/10 border border-white/10 rounded-2xl hover:bg-white/15 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center shrink-0">
                      <CategoryIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{product.name}</h3>
                      {product.description && (
                        <p className="text-sm text-white/60 mt-1 line-clamp-2">{product.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-3">
                        {product.price && (
                          <span className="text-sm font-medium text-green-400">
                            ${product.price.toFixed(2)}
                          </span>
                        )}
                        <span className="text-xs px-2 py-0.5 bg-white/10 rounded capitalize">
                          {product.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
                    {product.productUrl && (
                      <a
                        href={product.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View
                      </a>
                    )}
                    <button
                      onClick={() => confirmDeleteProduct(product.id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-gray-900 rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Add Product</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1">Product Name *</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full p-3 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500"
                  placeholder="e.g., Protein Powder"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setNewProduct({ ...newProduct, category: cat.id })}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                        newProduct.category === cat.id
                          ? 'border-orange-500 bg-orange-500/20'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <cat.icon className="w-4 h-4" />
                      <span className="text-sm">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full p-3 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 resize-none"
                  rows={2}
                  placeholder="Brief description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Price (optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full p-3 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500"
                    placeholder="29.99"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Product URL</label>
                  <input
                    type="url"
                    value={newProduct.productUrl}
                    onChange={(e) => setNewProduct({ ...newProduct, productUrl: e.target.value })}
                    className="w-full p-3 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <button
                onClick={handleAddProduct}
                disabled={!newProduct.name || saving}
                className="w-full p-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, productId: null })}
        onConfirm={() => deleteConfirm.productId && handleDeleteProduct(deleteConfirm.productId)}
        title="Delete Product?"
        message="This product will be permanently removed. This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
