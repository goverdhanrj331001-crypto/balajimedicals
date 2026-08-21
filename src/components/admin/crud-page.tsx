'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/admin-layout';
import { StatCard, SectionCard, AdminTable, Toolbar, StatusPill } from '@/components/admin/admin-ui';
import { Modal } from '@/components/admin/ui/modal';
import { ConfirmDialog } from '@/components/admin/ui/confirm-dialog';
import { PrimaryButton, SecondaryButton, DangerButton } from '@/components/admin/ui/form';
import { Icon } from '@/components/ui/icon';
import { useCrud } from '@/hooks/use-crud';

export interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

export interface FieldDef {
  name: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'toggle' | 'image';
  options?: { value: string; label: string }[];
  wide?: boolean;
  placeholder?: string;
  hint?: string;
}

export interface CrudPageConfig<T> {
  title: string;
  description: string;
  endpoint: string; // e.g. /api/admin/products
  columns: Column<T>[];
  fields: FieldDef[];
  makeDefault: () => Partial<T>;
  stats?: (items: T[]) => { label: string; value: string | number; icon: string; tone?: 'teal' | 'gold' | 'red' | 'blue' }[];
  searchKeys?: (keyof T)[];
}

export function CrudPage<T extends { id: string }>({
  config,
  initialItems,
}: {
  config: CrudPageConfig<T>;
  initialItems?: T[];
}) {
  const { items, loading, create, update, remove } = useCrud<T>({
    endpoint: config.endpoint,
    initialFetch: !initialItems,
  });

  // Seed with SSR data if provided.
  const allItems = useMemo(() => {
    if (initialItems && items.length === 0) return initialItems;
    return items;
  }, [initialItems, items]);

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim() || !config.searchKeys) return allItems;
    const q = search.toLowerCase();
    return allItems.filter((it) =>
      config.searchKeys!.some((k) =>
        String((it as any)[k] ?? '').toLowerCase().includes(q),
      ),
    );
  }, [allItems, search, config.searchKeys]);

  const openCreate = () => {
    setEditing(null);
    setFormData(config.makeDefault());
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (row: T) => {
    setEditing(row);
    setFormData({ ...row });
    setFormErrors({});
    setModalOpen(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    let result: any = null;
    if (editing) {
      result = await update(editing.id, formData as any);
    } else {
      result = await create(formData as any);
    }
    setSaving(false);
    if (result) setModalOpen(false);
  };

  const onDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const ok = await remove(deleteTarget.id);
    setDeleting(false);
    if (ok) setDeleteTarget(null);
  };

  const stats = config.stats ? config.stats(allItems) : [];

  return (
    <AdminLayout title={config.title}>
      {/* Heading */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[24px] font-extrabold tracking-tight">{config.title}</h2>
          <p className="mt-1 max-w-2xl text-[13px] text-[#3e494a]">{config.description}</p>
        </div>
        <PrimaryButton onClick={openCreate}>
          <Icon name="add" className="text-[18px]" /> Add New
        </PrimaryButton>
      </div>

      {/* Stats */}
      {stats.length > 0 && (
        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s, i) => (
            <StatCard key={i} label={s.label} value={s.value} icon={s.icon} tone={s.tone ?? 'teal'} />
          ))}
        </div>
      )}

      {/* Table */}
      <SectionCard
        title={config.title}
        action={<Toolbar placeholder={`Search ${config.title.toLowerCase()}...`} value={search} onChange={setSearch} />}
      >
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
          </div>
        ) : (
          <AdminTable
            headers={config.columns.map((c) => c.label)}
            rows={filtered.map((it) => config.columns.map((c) => ''))} // dummy, renderRow is used
            showAction
            onAction={(i) => openEdit(filtered[i])}
            renderRow={(_row, ri) => {
              const it = filtered[ri];
              return (
                <>
                  {config.columns.map((c) => (
                    <td key={c.key} className={`px-3 py-3 text-[12px] text-[#3e494a] ${c.className ?? ''}`}>
                      {c.render(it)}
                    </td>
                  ))}
                  <td className="px-3 py-3">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        className="rounded p-1 text-[#006872] hover:bg-[#d9eeee]"
                        onClick={() => openEdit(it)}
                        aria-label="Edit"
                        title="Edit"
                      >
                        <Icon name="edit" className="text-[18px]" />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1 text-[#910816] hover:bg-[#ffdad7]"
                        onClick={() => setDeleteTarget(it)}
                        aria-label="Delete"
                        title="Delete"
                      >
                        <Icon name="delete" className="text-[18px]" />
                      </button>
                    </div>
                  </td>
                </>
              );
            }}
          />
        )}

        {/* Pagination hint */}
        <div className="mt-4 flex items-center justify-between text-[11px] text-[#6e797b]">
          <span>Showing {filtered.length} of {allItems.length} records</span>
        </div>
      </SectionCard>

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit — ${config.title}` : `Add — ${config.title}`}
        description={editing ? 'Update the selected record.' : 'Create a new record.'}
        size="lg"
        footer={
          <>
            <SecondaryButton onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={() => onSubmit(new Event('submit') as any)} loading={saving}>
              <Icon name="save" className="text-[18px]" /> {editing ? 'Save Changes' : 'Create'}
            </PrimaryButton>
          </>
        }
      >
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {config.fields.map((f) => (
            <FormField
              key={f.name}
              def={f}
              value={formData[f.name]}
              onChange={(v) => setFormData((prev) => ({ ...prev, [f.name]: v }))}
              error={formErrors[f.name]}
            />
          ))}
          {/* hidden submit button to allow Enter-key submit */}
          <button type="submit" className="hidden" />
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete record?"
        message="This action cannot be undone. The record will be permanently removed."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={onDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  );
}

// ─── Field renderer ──────────────────────────────────────────────
import { Field, TextInput, Textarea, Select } from '@/components/admin/ui/form';
import { ImageUpload } from '@/components/admin/ui/image-upload';
import { ToggleSwitch } from '@/components/admin/ui/toggle-switch';

function FieldDefImpl({ def, value, onChange, error }: { def: FieldDef; value: any; onChange: (v: any) => void; error?: string }) {
  if (def.type === 'image') {
    return (
      <div className={def.wide ? 'md:col-span-2' : ''}>
        <ImageUpload value={value ?? ''} onChange={onChange} label={def.label} />
      </div>
    );
  }
  if (def.type === 'toggle') {
    const isChecked = value === 'active' || value === true;
    return (
      <div className={def.wide ? 'md:col-span-2' : ''}>
        <span className="mb-1.5 block text-[11px] font-bold text-[#3e494a]">{def.label}</span>
        <div className="rounded-lg border border-[#e4e2e1] bg-white p-3">
          <ToggleSwitch
            checked={isChecked}
            onChange={(checked) => onChange(checked ? 'active' : 'hidden')}
            label={isChecked ? 'Active' : 'Hidden'}
            description={def.hint}
          />
        </div>
      </div>
    );
  }
  return (
    <Field label={def.label} error={error} hint={def.hint} wide={def.wide}>
      {def.type === 'textarea' ? (
        <Textarea
          placeholder={def.placeholder}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : def.type === 'select' ? (
        <Select
          options={def.options ?? []}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : def.type === 'number' ? (
        <TextInput
          type="number"
          placeholder={def.placeholder}
          value={value ?? 0}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      ) : (
        <TextInput
          type="text"
          placeholder={def.placeholder}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </Field>
  );
}

// alias to avoid naming collision
const FormField = FieldDefImpl;

// Re-export StatusPill for use in column render functions.
export { StatusPill };
