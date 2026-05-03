import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import db from '@/lib/db/dexie';
import { createCategory, type Category } from '@/domain/category';

const QUERY_KEY = ['categories'];

export function useCategories() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => db.categories.toArray(),
  });
}

export function useAddCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Parameters<typeof createCategory>[0]) => {
      const cat = createCategory(input);
      await db.categories.add(cat);
      return cat;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await db.categories.delete(id);
      await db.tasks.where('categoryId').equals(id).modify({ categoryId: undefined });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDefaultCategory(): Category {
  return { id: '__default__', name: '전체', color: '#6b7280', isDefault: true, createdAt: 0 };
}
