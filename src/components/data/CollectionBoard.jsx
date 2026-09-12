import { useState } from 'react';
import { addDoc, collection, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { Plus, Trash2, Inbox } from 'lucide-react';
import { db } from '../../firebase';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import Panel from '../ui/Panel';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import EmptyState from '../ui/EmptyState';
import { Field, Input, Textarea } from '../ui/Field';
import { SkeletonGrid } from '../ui/Skeleton';
import { timeAgo } from '../../lib/format';

/**
 * A config-driven list + "add new" workflow backed directly by a Firestore
 * collection. Built for the console's lighter admin pages (requirements,
 * assets, memos, devices, calendar items) so each one stays a thin config
 * instead of a bespoke CRUD screen.
 */
export default function CollectionBoard({
  path,
  icon: Icon = Inbox,
  title,
  subtitle,
  ctaLabel = 'Add new',
  fields, // [{ name, label, type: 'text'|'textarea'|'number'|'date', required }]
  columns, // [{ key, label, render?: (row) => node }]
  canDelete = true,
  orderConstraint,
  extraOnCreate = () => ({}),
}) {
  const { data, loading } = useFirestoreCollection(path, ...(orderConstraint ? [orderConstraint] : []));
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await addDoc(collection(db, path), {
        ...form,
        ...extraOnCreate(),
        createdAt: serverTimestamp(),
      });
      toast.success('Added');
      setForm({});
      setOpen(false);
    } catch (err) {
      toast.error(err?.message || 'Could not save that');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteDoc(doc(db, path, id));
      toast.success('Removed');
    } catch (err) {
      toast.error('Could not remove that');
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-900 dark:text-white">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-brand-900/55 dark:text-white/50">{subtitle}</p>}
        </div>
        <Button icon={Plus} onClick={() => setOpen(true)}>
          {ctaLabel}
        </Button>
      </div>

      {loading ? (
        <SkeletonGrid count={3} />
      ) : data.length === 0 ? (
        <EmptyState icon={Icon} title="Nothing here yet" description={`${ctaLabel} to get the first entry on the board.`} action={<Button size="sm" icon={Plus} onClick={() => setOpen(true)}>{ctaLabel}</Button>} />
      ) : (
        <Panel padded={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-brand-900/[0.06] text-xs uppercase tracking-wide text-brand-900/40 dark:border-white/[0.06] dark:text-white/40">
                  {columns.map((c) => (
                    <th key={c.key} className="px-5 py-3 font-semibold">
                      {c.label}
                    </th>
                  ))}
                  <th className="px-5 py-3 font-semibold">Added</th>
                  {canDelete && <th className="px-5 py-3" />}
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id} className="border-b border-brand-900/[0.04] last:border-0 hover:bg-brand-900/[0.015] dark:border-white/[0.04] dark:hover:bg-white/[0.02]">
                    {columns.map((c) => (
                      <td key={c.key} className="px-5 py-3.5 text-brand-900 dark:text-white/85">
                        {c.render ? c.render(row) : row[c.key] ?? '—'}
                      </td>
                    ))}
                    <td className="px-5 py-3.5 text-xs text-brand-900/45 dark:text-white/40">{timeAgo(row.createdAt)}</td>
                    {canDelete && (
                      <td className="px-5 py-3.5 text-right">
                        <button onClick={() => handleDelete(row.id)} className="rounded-lg p-1.5 text-brand-900/30 hover:bg-danger-bg hover:text-danger">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={ctaLabel}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button form="collection-board-form" type="submit" loading={busy}>
              Save
            </Button>
          </>
        }
      >
        <form id="collection-board-form" onSubmit={handleCreate} className="space-y-4">
          {fields.map((f) => (
            <Field key={f.name} label={f.label}>
              {f.type === 'textarea' ? (
                <Textarea
                  required={f.required}
                  value={form[f.name] || ''}
                  onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                />
              ) : (
                <Input
                  required={f.required}
                  type={f.type || 'text'}
                  value={form[f.name] || ''}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      [f.name]:
                        f.type === 'number'
                          ? Number(e.target.value)
                          : f.type === 'date' && e.target.value
                          ? new Date(e.target.value)
                          : e.target.value,
                    }))
                  }
                />
              )}
            </Field>
          ))}
        </form>
      </Modal>
    </div>
  );
}
