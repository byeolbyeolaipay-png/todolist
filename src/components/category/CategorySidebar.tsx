import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/db/supabase';
import db from '@/lib/db/dexie';
import type { Category } from '@/domain/category';

interface Props {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  userId?: string;
}

function useSidebarCategories(userId?: string) {
  return useQuery({
    queryKey: ['sidebar-categories', userId],
    queryFn: async () => {
      if (userId) {
        const { data } = await supabase.from('categories').select('*').eq('user_id', userId);
        return (data ?? []).map((r) => ({
          id: r.id as string, name: r.name as string, color: r.color as string,
          isDefault: r.is_default as boolean, createdAt: r.created_at as number,
        })) as Category[];
      }
      return db.categories.toArray();
    },
  });
}

export default function CategorySidebar({ selectedId, onSelect, userId }: Props) {
  const { data: cats = [] } = useSidebarCategories(userId);

  return (
    <aside className="w-48 shrink-0 p-3 space-y-0.5">
      <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">카테고리</p>
      <button onClick={() => onSelect(null)}
        className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-left transition-colors
          ${selectedId === null ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
        <span className="h-2.5 w-2.5 rounded-full flex-shrink-0 bg-gray-400" />전체
      </button>
      {cats.map((c) => (
        <button key={c.id} onClick={() => onSelect(c.id)}
          className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-left transition-colors
            ${selectedId === c.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
          <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
          {c.name}
        </button>
      ))}
    </aside>
  );
}
