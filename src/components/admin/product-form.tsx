'use client';

import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { ThumbnailUpload } from '@/components/admin/ui/thumbnail-upload';
import { GalleryUpload } from '@/components/admin/ui/gallery-upload';
import { SearchableSelect } from '@/components/admin/ui/searchable-select';
import { Modal } from '@/components/admin/ui/modal';
import { Field, TextInput, Textarea, Select, PrimaryButton, SecondaryButton } from '@/components/admin/ui/form';
import type { Product, ProductType, DosageForm, PackUnit, RouteOfAdministration, ScheduleType, StorageCondition, Composition, ProductVariant } from '@/types';

interface ProductFormProps {
  initial?: Product | null;
  brands: { id: string; name: string; logo?: string; imageUrl?: string; manufacturer?: string; marketer?: string }[];
  categories: { id: string; name: string; icon: string; tint: string }[];
  onSave: (data: Partial<Product>) => Promise<boolean>;
  onCancel: () => void;
}

const PRODUCT_TYPES: ProductType[] = [
  'Medicine', 'OTC Medicine', 'Vitamins & Supplements', 'Ayurveda', 'Homeopathy',
  'Healthcare Device', 'Personal Care', 'Skin Care', 'Hair Care', 'Sexual Wellness',
  'Diabetes Care', 'Elderly Care', 'Baby Care', 'Health Food', 'Other',
];

const DOSAGE_FORMS: DosageForm[] = [
  'Tablet', 'Capsule', 'Syrup', 'Suspension', 'Injection', 'Drops',
  'Eye Drops', 'Ear Drops', 'Nasal Drops', 'Cream', 'Ointment', 'Gel',
  'Lotion', 'Powder', 'Sachet', 'Spray', 'Inhaler', 'Mouthwash',
  'Solution', 'Oil', 'Shampoo', 'Soap', 'Patch', 'Suppository', 'Granules', 'Other',
];

const PACK_UNITS: PackUnit[] = [
  'Tablet', 'Capsule', 'ml', 'mg', 'g', 'kg', 'Piece', 'Bottle',
  'Strip', 'Tube', 'Box', 'Vial', 'Ampoule', 'Sachet', 'Pack',
];

const ROUTES: RouteOfAdministration[] = ['Oral', 'Topical', 'Injection', 'Ophthalmic', 'Otic', 'Nasal', 'Inhalation', 'Rectal', 'Other'];
const SCHEDULES: ScheduleType[] = ['Not Applicable', 'Schedule H', 'Schedule H1', 'Schedule X', 'Other'];
const STORAGE_CONDITIONS: StorageCondition[] = ['Room Temperature', 'Refrigerated', 'Frozen', 'Protect from Light', 'Protect from Moisture', 'Other'];

const TABS = [
  { id: 'basic', label: 'Basic Info', icon: 'info' },
  { id: 'images', label: 'Images', icon: 'image' },
  { id: 'medicine', label: 'Medicine Info', icon: 'medication' },
  { id: 'variants', label: 'Variants', icon: 'category' },
  { id: 'description', label: 'Description', icon: 'description' },
  { id: 'customer', label: 'Customer Info', icon: 'support_agent' },
  { id: 'seo', label: 'SEO', icon: 'search' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

// Medicine-like types that should show medicine info section
const MEDICINE_TYPES: ProductType[] = ['Medicine', 'OTC Medicine', 'Ayurveda', 'Homeopathy', 'Vitamins & Supplements', 'Diabetes Care'];

function generateSKU(brand: string, name: string): string {
  const b = (brand || 'PRD').slice(0, 3).toUpperCase().replace(/\s/g, '');
  const n = (name || 'XXX').slice(0, 3).toUpperCase().replace(/\s/g, '');
  const r = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `${b}-${n}-${r}`;
}

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

export function ProductForm({ initial, brands, categories, onSave, onCancel }: ProductFormProps) {
  const [tab, setTab] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandManufacturer, setNewBrandManufacturer] = useState('');

  const [form, setForm] = useState<Partial<Product>>(() => ({
    name: '',
    shortName: '',
    brand: '',
    brandId: '',
    price: 0,
    oldPrice: undefined,
    note: '',
    badge: '',
    categoryId: '',
    productType: 'Medicine',
    manufacturer: '',
    marketer: '',
    composition: [],
    dosageForm: undefined,
    strengthValue: '',
    strengthUnit: 'mg',
    routeOfAdministration: 'Oral',
    therapeuticCategory: '',
    drugClass: '',
    schedule: 'Not Applicable',
    shortDescription: '',
    fullDescription: '',
    highlights: [],
    variants: [],
    searchKeywords: [],
    tags: [],
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    slug: '',
    productStatus: 'Active',
    featured: false,
    bestseller: false,
    newArrival: false,
    stock: 0,
    reorderLevel: 10,
    sku: '',
    storageCondition: 'Room Temperature',
    storageInstructions: '',
    uses: '',
    benefits: '',
    howToUse: '',
    dosageInfo: '',
    precautions: '',
    warnings: '',
    sideEffects: '',
    thumbnail: '',
    gallery: [],
    status: 'active',
    ...initial,
  }));

  // Update slug when name changes (only if slug is empty or matches old name slug)
  useEffect(() => {
    if (form.name && !form.slug) {
      setForm((p) => ({ ...p, slug: slugify(form.name!) }));
    }
  }, [form.name, form.slug]);

  // Auto-fill manufacturer/marketer from selected brand
  useEffect(() => {
    if (form.brandId) {
      const brand = brands.find((b) => b.id === form.brandId);
      if (brand) {
        setForm((p) => ({
          ...p,
          brand: brand.name,
          manufacturer: p.manufacturer || brand.manufacturer || brand.name,
          marketer: p.marketer || brand.marketer || brand.name,
        }));
      }
    }
  }, [form.brandId, brands]);

  const isMedicineType = form.productType ? MEDICINE_TYPES.includes(form.productType) : false;

  const set = (field: string, val: any) => setForm((p) => ({ ...p, [field]: val }));

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name?.trim()) errs.name = 'Product name is required';
    if (!form.brandId) errs.brandId = 'Brand is required';
    if (!form.categoryId) errs.categoryId = 'Category is required';
    if (!form.thumbnail) errs.thumbnail = 'Thumbnail image is required';
    if (!form.sku?.trim()) errs.sku = 'SKU is required';
    if (form.price === undefined || form.price <= 0) errs.price = 'Valid price is required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      // Switch to the first tab that has an error
      if (errs.name || errs.brandId || errs.categoryId || errs.sku || errs.price) setTab('basic');
      else if (errs.thumbnail) setTab('images');
    }
    return Object.keys(errs).length === 0;
  };

  const submit = async (status?: 'Active' | 'Draft') => {
    if (status === 'Draft') {
      form.productStatus = 'Draft';
    } else {
      if (!validate()) return;
      form.productStatus = 'Active';
    }
    setSaving(true);
    // Sync old fields for backward compat
    const payload: Partial<Product> = {
      ...form,
      imageUrl: form.thumbnail, // legacy
      images: form.gallery, // legacy
      description: form.shortDescription || form.fullDescription, // legacy
      status: form.productStatus === 'Active' ? 'active' : 'hidden',
    };
    const ok = await onSave(payload);
    setSaving(false);
    if (ok) onCancel();
  };

  const addBrand = async () => {
    if (!newBrandName.trim()) return;
    try {
      const res = await fetch('/api/admin/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newBrandName.trim(),
          manufacturer: newBrandManufacturer || newBrandName.trim(),
          marketer: newBrandManufacturer || newBrandName.trim(),
          visibility: 'active',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Select the new brand
      set('brandId', data.item.id);
      set('brand', data.item.name);
      set('manufacturer', data.item.manufacturer || data.item.name);
      set('marketer', data.item.marketer || data.item.name);
      setShowAddBrand(false);
      setNewBrandName('');
      setNewBrandManufacturer('');
      // Reload brands list (parent will pick it up on next render via refetch)
      window.location.reload();
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Composition handlers
  const addComposition = () => {
    const arr = [...(form.composition ?? []), { salt: '', strength: '' }];
    set('composition', arr);
  };
  const updateComposition = (idx: number, field: keyof Composition, val: string) => {
    const arr = [...(form.composition ?? [])];
    arr[idx] = { ...arr[idx], [field]: val };
    set('composition', arr);
  };
  const removeComposition = (idx: number) => {
    set('composition', (form.composition ?? []).filter((_, i) => i !== idx));
  };

  // Highlights handlers
  const addHighlight = () => set('highlights', [...(form.highlights ?? []), '']);
  const updateHighlight = (idx: number, val: string) => {
    const arr = [...(form.highlights ?? [])];
    arr[idx] = val;
    set('highlights', arr);
  };
  const removeHighlight = (idx: number) => {
    set('highlights', (form.highlights ?? []).filter((_, i) => i !== idx));
  };

  // Variants
  const addVariant = () => {
    const v: ProductVariant = {
      id: 'v-' + Date.now(),
      name: '',
      dosageForm: 'Tablet',
      packSize: 1,
      packUnit: 'Tablet',
      sku: generateSKU(form.brand || 'PRD', form.name || 'XXX'),
      mrp: form.price ?? 0,
      sellingPrice: form.price ?? 0,
      stock: 0,
    };
    set('variants', [...(form.variants ?? []), v]);
  };
  const updateVariant = (idx: number, field: keyof ProductVariant, val: any) => {
    const arr = [...(form.variants ?? [])];
    arr[idx] = { ...arr[idx], [field]: val };
    set('variants', arr);
  };
  const removeVariant = (idx: number) => {
    set('variants', (form.variants ?? []).filter((_, i) => i !== idx));
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#001f23]/40 p-4 md:p-8">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e4e2e1] bg-white px-6 py-4">
          <div>
            <h2 className="text-[20px] font-bold tracking-tight">
              {initial ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-[12px] text-[#6e797b]">
              {initial ? `Editing: ${initial.name}` : 'Professional pharmacy product form'}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-2 text-[#6e797b] hover:bg-[#f0eded]"
          >
            <Icon name="close" />
          </button>
        </div>

        {/* Tabs */}
        <div className="sticky top-[72px] z-10 border-b border-[#e4e2e1] bg-[#fbf9f8] px-4 py-2">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {TABS.map((t) => {
              const showTab = t.id === 'medicine' ? isMedicineType : true;
              if (!showTab) return null;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-bold transition ${tab === t.id
                    ? 'bg-[#006872] text-white'
                    : 'text-[#3e494a] hover:bg-[#f0eded]'
                    }`}
                >
                  <Icon name={t.icon} className="text-[16px]" />
                  {t.label}
                  {t.id === 'variants' && (form.variants?.length ?? 0) > 0 && (
                    <span className="ml-1 rounded-full bg-white/20 px-1.5 text-[10px]">
                      {form.variants!.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[calc(100vh-220px)] overflow-y-auto p-6 fancy-scroll">
          {tab === 'basic' && (
            <div className="space-y-5">
              <h3 className="text-[14px] font-bold text-[#006872]">Basic Information</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Product Name" error={errors.name}>
                  <TextInput
                    value={form.name ?? ''}
                    onChange={(e) => set('name', e.target.value)}
                    placeholder="Dolo 650 Tablet"
                  />
                </Field>
                <Field label="Short Name" hint="Used in compact lists">
                  <TextInput
                    value={form.shortName ?? ''}
                    onChange={(e) => set('shortName', e.target.value)}
                    placeholder="Dolo 650"
                  />
                </Field>

                <Field label="Brand" error={errors.brandId}>
                  <SearchableSelect
                    value={form.brandId}
                    onChange={(v) => set('brandId', v)}
                    options={brands.map((b) => ({ value: b.id, label: b.name, imageUrl: b.logo || b.imageUrl }))}
                    placeholder="Select Brand"
                    onAddNew={() => setShowAddBrand(true)}
                  />
                </Field>

                <Field label="Product Type">
                  <Select
                    options={PRODUCT_TYPES.map((t) => ({ value: t, label: t }))}
                    value={form.productType ?? 'Medicine'}
                    onChange={(e) => set('productType', e.target.value)}
                  />
                </Field>

                <Field label="Category" error={errors.categoryId}>
                  <SearchableSelect
                    value={form.categoryId}
                    onChange={(v) => set('categoryId', v)}
                    options={categories.map((c) => ({ value: c.id, label: c.name }))}
                    placeholder="Select Category"
                  />
                </Field>

                <Field label="Manufacturer" hint="Auto-filled from brand">
                  <TextInput
                    value={form.manufacturer ?? ''}
                    onChange={(e) => set('manufacturer', e.target.value)}
                    placeholder="Micro Labs Ltd"
                  />
                </Field>

                <Field label="Marketer">
                  <TextInput
                    value={form.marketer ?? ''}
                    onChange={(e) => set('marketer', e.target.value)}
                    placeholder="Micro Labs Ltd"
                  />
                </Field>

                <Field label="SKU" error={errors.sku} hint="Unique stock keeping unit">
                  <TextInput
                    value={form.sku ?? ''}
                    onChange={(e) => set('sku', e.target.value)}
                    placeholder="MED-001"
                  />
                </Field>

                <Field label="Selling Price (₹)" error={errors.price}>
                  <TextInput
                    type="number"
                    value={form.price ?? 0}
                    onChange={(e) => set('price', Number(e.target.value))}
                    placeholder="9.99"
                  />
                </Field>

                <Field label="MRP / Old Price (₹)" hint="Optional — shows strikethrough">
                  <TextInput
                    type="number"
                    value={form.oldPrice ?? 0}
                    onChange={(e) => set('oldPrice', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="14.99"
                  />
                </Field>

                <Field label="Stock Quantity">
                  <TextInput
                    type="number"
                    value={form.stock ?? 0}
                    onChange={(e) => set('stock', Number(e.target.value))}
                    placeholder="100"
                  />
                </Field>

                <Field label="Reorder Level">
                  <TextInput
                    type="number"
                    value={form.reorderLevel ?? 10}
                    onChange={(e) => set('reorderLevel', Number(e.target.value))}
                    placeholder="30"
                  />
                </Field>

                <Field label="Pack Note" hint="e.g. '15 Tablets' or '100 ml'">
                  <TextInput
                    value={form.note ?? ''}
                    onChange={(e) => set('note', e.target.value)}
                    placeholder="15 Tablets"
                  />
                </Field>

                <Field label="Badge" hint="Optional — e.g. 'BESTSELLER', '15% OFF'">
                  <TextInput
                    value={form.badge ?? ''}
                    onChange={(e) => set('badge', e.target.value)}
                    placeholder="BESTSELLER"
                  />
                </Field>
              </div>
            </div>
          )}

          {tab === 'images' && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-3 text-[14px] font-bold text-[#006872]">Thumbnail Image</h3>
                <ThumbnailUpload
                  value={form.thumbnail}
                  onChange={(url) => set('thumbnail', url)}
                />
                {errors.thumbnail && (
                  <p className="mt-2 text-[11px] font-semibold text-[#910816]">{errors.thumbnail}</p>
                )}
              </div>
              <div>
                <h3 className="mb-3 text-[14px] font-bold text-[#006872]">Product Gallery</h3>
                <GalleryUpload
                  value={form.gallery}
                  onChange={(urls) => set('gallery', urls)}
                />
              </div>
            </div>
          )}

          {tab === 'medicine' && isMedicineType && (
            <div className="space-y-5">
              <h3 className="text-[14px] font-bold text-[#006872]">Medicine Information</h3>

              {/* Composition */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#3e494a]">Generic Name / Salt / Composition</span>
                  <button
                    type="button"
                    onClick={addComposition}
                    className="rounded-lg border border-[#bdc9ca] bg-white px-2 py-1 text-[11px] font-bold text-[#006872] hover:bg-[#d9eeee]"
                  >
                    <Icon name="add" className="text-[14px]" /> Add Salt
                  </button>
                </div>
                {(form.composition ?? []).length === 0 ? (
                  <p className="rounded-lg bg-[#f5f3f3] p-3 text-center text-[11px] text-[#6e797b]">
                    No salts added. Click "Add Salt" to add composition.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {form.composition!.map((c, i) => (
                      <div key={i} className="flex gap-2">
                        <TextInput
                          value={c.salt}
                          onChange={(e) => updateComposition(i, 'salt', e.target.value)}
                          placeholder="Salt name (e.g. Paracetamol)"
                          className="flex-1"
                        />
                        <TextInput
                          value={c.strength}
                          onChange={(e) => updateComposition(i, 'strength', e.target.value)}
                          placeholder="Strength (e.g. 650 mg)"
                          className="flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => removeComposition(i)}
                          className="rounded-lg border border-[#bdc9ca] bg-white px-3 text-[#910816] hover:bg-[#ffdad7]"
                        >
                          <Icon name="delete" className="text-[16px]" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Dosage Form">
                  <Select
                    options={DOSAGE_FORMS.map((d) => ({ value: d, label: d }))}
                    value={form.dosageForm ?? 'Tablet'}
                    onChange={(e) => set('dosageForm', e.target.value)}
                  />
                </Field>
                <Field label="Route of Administration">
                  <Select
                    options={ROUTES.map((r) => ({ value: r, label: r }))}
                    value={form.routeOfAdministration ?? 'Oral'}
                    onChange={(e) => set('routeOfAdministration', e.target.value)}
                  />
                </Field>
                <Field label="Strength Value">
                  <TextInput
                    value={form.strengthValue ?? ''}
                    onChange={(e) => set('strengthValue', e.target.value)}
                    placeholder="650"
                  />
                </Field>
                <Field label="Strength Unit">
                  <TextInput
                    value={form.strengthUnit ?? 'mg'}
                    onChange={(e) => set('strengthUnit', e.target.value)}
                    placeholder="mg"
                  />
                </Field>
                <Field label="Therapeutic Category">
                  <TextInput
                    value={form.therapeuticCategory ?? ''}
                    onChange={(e) => set('therapeuticCategory', e.target.value)}
                    placeholder="Analgesic"
                  />
                </Field>
                <Field label="Drug Class">
                  <TextInput
                    value={form.drugClass ?? ''}
                    onChange={(e) => set('drugClass', e.target.value)}
                    placeholder="NSAID"
                  />
                </Field>
                <Field label="Schedule">
                  <Select
                    options={SCHEDULES.map((s) => ({ value: s, label: s }))}
                    value={form.schedule ?? 'Not Applicable'}
                    onChange={(e) => set('schedule', e.target.value)}
                  />
                </Field>
                <Field label="Storage Condition">
                  <Select
                    options={STORAGE_CONDITIONS.map((s) => ({ value: s, label: s }))}
                    value={form.storageCondition ?? 'Room Temperature'}
                    onChange={(e) => set('storageCondition', e.target.value)}
                  />
                </Field>
                <Field label="Storage Instructions" wide>
                  <TextInput
                    value={form.storageInstructions ?? ''}
                    onChange={(e) => set('storageInstructions', e.target.value)}
                    placeholder="Store below 25°C in a dry place."
                  />
                </Field>
              </div>
            </div>
          )}

          {tab === 'variants' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[14px] font-bold text-[#006872]">Product Variants</h3>
                  <p className="text-[11px] text-[#6e797b]">
                    Don't create separate products for different strengths/packs. Use variants instead.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addVariant}
                  className="rounded-lg bg-[#006872] px-3 py-2 text-[11px] font-bold text-white hover:bg-[#00535b]"
                >
                  <Icon name="add" className="text-[14px]" /> Add Variant
                </button>
              </div>
              {(form.variants ?? []).length === 0 ? (
                <p className="rounded-lg bg-[#f5f3f3] p-6 text-center text-[12px] text-[#6e797b]">
                  No variants added. The main product's price/stock will be used by default.
                </p>
              ) : (
                <div className="space-y-3">
                  {form.variants!.map((v, i) => (
                    <div key={v.id} className="rounded-xl border border-[#e4e2e1] bg-[#fbf9f8] p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-[12px] font-bold">Variant #{i + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeVariant(i)}
                          className="rounded p-1 text-[#910816] hover:bg-[#ffdad7]"
                        >
                          <Icon name="delete" className="text-[18px]" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <Field label="Variant Name">
                          <TextInput
                            value={v.name}
                            onChange={(e) => updateVariant(i, 'name', e.target.value)}
                            placeholder="Dolo 650 - 15 Tablets"
                          />
                        </Field>
                        <Field label="Dosage Form">
                          <Select
                            options={DOSAGE_FORMS.map((d) => ({ value: d, label: d }))}
                            value={v.dosageForm ?? 'Tablet'}
                            onChange={(e) => updateVariant(i, 'dosageForm', e.target.value)}
                          />
                        </Field>
                        <Field label="Strength Value">
                          <TextInput
                            value={v.strengthValue ?? ''}
                            onChange={(e) => updateVariant(i, 'strengthValue', e.target.value)}
                            placeholder="650"
                          />
                        </Field>
                        <Field label="Pack Size">
                          <TextInput
                            type="number"
                            value={v.packSize}
                            onChange={(e) => updateVariant(i, 'packSize', Number(e.target.value))}
                            placeholder="15"
                          />
                        </Field>
                        <Field label="Pack Unit">
                          <Select
                            options={PACK_UNITS.map((p) => ({ value: p, label: p }))}
                            value={v.packUnit}
                            onChange={(e) => updateVariant(i, 'packUnit', e.target.value)}
                          />
                        </Field>
                        <Field label="SKU">
                          <TextInput
                            value={v.sku}
                            onChange={(e) => updateVariant(i, 'sku', e.target.value)}
                            placeholder="MED-001-V1"
                          />
                        </Field>
                        <Field label="MRP ($)">
                          <TextInput
                            type="number"
                            value={v.mrp}
                            onChange={(e) => updateVariant(i, 'mrp', Number(e.target.value))}
                            placeholder="14.99"
                          />
                        </Field>
                        <Field label="Selling Price (₹)">
                          <TextInput
                            type="number"
                            value={v.sellingPrice}
                            onChange={(e) => updateVariant(i, 'sellingPrice', Number(e.target.value))}
                            placeholder="9.99"
                          />
                        </Field>
                        <Field label="Stock">
                          <TextInput
                            type="number"
                            value={v.stock}
                            onChange={(e) => updateVariant(i, 'stock', Number(e.target.value))}
                            placeholder="100"
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'description' && (
            <div className="space-y-5">
              <h3 className="text-[14px] font-bold text-[#006872]">Product Description</h3>
              <Field label="Short Description" hint="One-line customer-facing summary">
                <TextInput
                  value={form.shortDescription ?? ''}
                  onChange={(e) => set('shortDescription', e.target.value)}
                  placeholder="Complete daily multivitamin with 23 essential vitamins."
                />
              </Field>
              <Field label="Full Description" hint="Detailed description (supports line breaks)">
                <Textarea
                  value={form.fullDescription ?? ''}
                  onChange={(e) => set('fullDescription', e.target.value)}
                  placeholder="A complete daily multivitamin complex with 23 essential vitamins and minerals..."
                  className="min-h-32"
                />
              </Field>

              {/* Highlights */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#3e494a]">Product Highlights</span>
                  <button
                    type="button"
                    onClick={addHighlight}
                    className="rounded-lg border border-[#bdc9ca] bg-white px-2 py-1 text-[11px] font-bold text-[#006872] hover:bg-[#d9eeee]"
                  >
                    <Icon name="add" className="text-[14px]" /> Add Highlight
                  </button>
                </div>
                {(form.highlights ?? []).length === 0 ? (
                  <p className="rounded-lg bg-[#f5f3f3] p-3 text-center text-[11px] text-[#6e797b]">
                    No highlights added.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {form.highlights!.map((h, i) => (
                      <div key={i} className="flex gap-2">
                        <TextInput
                          value={h}
                          onChange={(e) => updateHighlight(i, e.target.value)}
                          placeholder="Helps relieve fever"
                          className="flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => removeHighlight(i)}
                          className="rounded-lg border border-[#bdc9ca] bg-white px-3 text-[#910816] hover:bg-[#ffdad7]"
                        >
                          <Icon name="delete" className="text-[16px]" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Field label="Search Keywords" hint="Comma-separated keywords for search">
                <TextInput
                  value={(form.searchKeywords ?? []).join(', ')}
                  onChange={(e) => set('searchKeywords', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                  placeholder="paracetamol, fever, pain, 650"
                />
              </Field>
              <Field label="Tags" hint="Comma-separated tags">
                <TextInput
                  value={(form.tags ?? []).join(', ')}
                  onChange={(e) => set('tags', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                  placeholder="Bestseller, OTC, Popular"
                />
              </Field>
            </div>
          )}

          {tab === 'customer' && (
            <div className="space-y-4">
              <h3 className="text-[14px] font-bold text-[#006872]">Customer Information</h3>
              <Field label="Uses">
                <Textarea
                  value={form.uses ?? ''}
                  onChange={(e) => set('uses', e.target.value)}
                  placeholder="What is this product used for?"
                />
              </Field>
              <Field label="Benefits">
                <Textarea
                  value={form.benefits ?? ''}
                  onChange={(e) => set('benefits', e.target.value)}
                  placeholder="Key benefits of this product"
                />
              </Field>
              <Field label="How to Use">
                <Textarea
                  value={form.howToUse ?? ''}
                  onChange={(e) => set('howToUse', e.target.value)}
                  placeholder="Usage instructions"
                />
              </Field>
              <Field label="Dosage Information">
                <Textarea
                  value={form.dosageInfo ?? ''}
                  onChange={(e) => set('dosageInfo', e.target.value)}
                  placeholder="Recommended dosage"
                />
              </Field>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Precautions">
                  <Textarea
                    value={form.precautions ?? ''}
                    onChange={(e) => set('precautions', e.target.value)}
                    placeholder="Precautions to take"
                  />
                </Field>
                <Field label="Warnings">
                  <Textarea
                    value={form.warnings ?? ''}
                    onChange={(e) => set('warnings', e.target.value)}
                    placeholder="Warnings"
                  />
                </Field>
              </div>
              <Field label="Side Effects">
                <Textarea
                  value={form.sideEffects ?? ''}
                  onChange={(e) => set('sideEffects', e.target.value)}
                  placeholder="Possible side effects"
                />
              </Field>
            </div>
          )}

          {tab === 'seo' && (
            <div className="space-y-4">
              <h3 className="text-[14px] font-bold text-[#006872]">SEO Settings</h3>
              <Field label="URL Slug" hint="Auto-generated from name">
                <TextInput
                  value={form.slug ?? ''}
                  onChange={(e) => set('slug', slugify(e.target.value))}
                  placeholder="dolo-650-tablet"
                />
              </Field>
              <Field label="SEO Title">
                <TextInput
                  value={form.seoTitle ?? ''}
                  onChange={(e) => set('seoTitle', e.target.value)}
                  placeholder="Dolo 650 Tablet - Buy Online | Balaji Medical Store"
                />
              </Field>
              <Field label="SEO Description">
                <Textarea
                  value={form.seoDescription ?? ''}
                  onChange={(e) => set('seoDescription', e.target.value)}
                  placeholder="Buy Dolo 650 Tablet online at best price..."
                />
              </Field>
              <Field label="SEO Keywords" hint="Comma-separated">
                <TextInput
                  value={form.seoKeywords ?? ''}
                  onChange={(e) => set('seoKeywords', e.target.value)}
                  placeholder="dolo 650, paracetamol, fever medicine"
                />
              </Field>
            </div>
          )}

          {tab === 'settings' && (
            <div className="space-y-5">
              <h3 className="text-[14px] font-bold text-[#006872]">Status & Visibility</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Product Status">
                  <Select
                    options={[
                      { value: 'Active', label: 'Active' },
                      { value: 'Draft', label: 'Draft' },
                      { value: 'Inactive', label: 'Inactive' },
                    ]}
                    value={form.productStatus ?? 'Active'}
                    onChange={(e) => set('productStatus', e.target.value)}
                  />
                </Field>
                <Field label="Visibility">
                  <Select
                    options={[
                      { value: 'active', label: 'Visible' },
                      { value: 'hidden', label: 'Hidden' },
                    ]}
                    value={form.status ?? 'active'}
                    onChange={(e) => set('status', e.target.value)}
                  />
                </Field>
              </div>

              <div className="space-y-2 rounded-xl border border-[#e4e2e1] bg-[#fbf9f8] p-4">
                <h4 className="mb-2 text-[12px] font-bold text-[#3e494a]">Quick Flags</h4>
                {[
                  { field: 'featured', label: 'Featured Product', icon: 'star' },
                  { field: 'bestseller', label: 'Bestseller', icon: 'trending_up' },
                  { field: 'newArrival', label: 'New Arrival', icon: 'new_releases' },
                ].map((f) => (
                  <label key={f.field} className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-white">
                    <input
                      type="checkbox"
                      checked={(form as any)[f.field] ?? false}
                      onChange={(e) => set(f.field, e.target.checked)}
                      className="h-4 w-4 rounded border-[#bdc9ca] text-[#006872]"
                    />
                    <Icon name={f.icon} className="text-[18px] text-[#006872]" />
                    <span className="text-[12px] font-semibold">{f.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between gap-2 border-t border-[#e4e2e1] bg-white px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#bdc9ca] bg-white px-4 py-2.5 text-[12px] font-bold text-[#3e494a] hover:bg-[#f5f3f3]"
          >
            Cancel
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => submit('Draft')}
              disabled={saving}
              className="rounded-lg border border-[#bdc9ca] bg-white px-4 py-2.5 text-[12px] font-bold text-[#3e494a] hover:bg-[#f5f3f3] disabled:opacity-60"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => submit('Active')}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-[#006872] px-5 py-2.5 text-[12px] font-bold text-white hover:bg-[#00535b] disabled:opacity-60"
            >
              {saving && <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
              {initial ? 'Save Changes' : 'Save Product'}
            </button>
          </div>
        </div>
      </div>

      {/* Add Brand Modal */}
      <Modal
        open={showAddBrand}
        onClose={() => setShowAddBrand(false)}
        title="Add New Brand"
        size="sm"
        footer={
          <>
            <SecondaryButton onClick={() => setShowAddBrand(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={addBrand}>Add Brand</PrimaryButton>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Brand Name">
            <TextInput
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              placeholder="Micro Labs"
            />
          </Field>
          <Field label="Manufacturer" hint="Optional — defaults to brand name">
            <TextInput
              value={newBrandManufacturer}
              onChange={(e) => setNewBrandManufacturer(e.target.value)}
              placeholder="Micro Labs Ltd"
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
