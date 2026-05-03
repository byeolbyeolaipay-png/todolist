import db from '@/lib/db/dexie';
import { supabase } from '@/lib/db/supabase';

export async function migrateGuestData(userId: string): Promise<number> {
  const [tasks, categories] = await Promise.all([
    db.tasks.toArray(),
    db.categories.toArray(),
  ]);

  if (tasks.length === 0 && categories.length === 0) return 0;

  let migrated = 0;

  if (categories.length > 0) {
    const { error } = await supabase.from('categories').upsert(
      categories.map((c) => ({ id: c.id, user_id: userId, name: c.name, color: c.color, is_default: c.isDefault, created_at: c.createdAt })),
      { onConflict: 'id' }
    );
    if (error) throw error;
  }

  if (tasks.length > 0) {
    const { error } = await supabase.from('tasks').upsert(
      tasks.map((t) => ({
        id: t.id, user_id: userId, title: t.title,
        description: t.description ?? null, due_at: t.dueAt ?? null,
        priority: t.priority, category_id: t.categoryId ?? null,
        status: t.status, completed_at: t.completedAt ?? null,
        created_at: t.createdAt, updated_at: t.updatedAt,
      })),
      { onConflict: 'id' }
    );
    if (error) throw error;
    migrated = tasks.length;
  }

  await db.tasks.clear();
  await db.categories.clear();
  return migrated;
}
