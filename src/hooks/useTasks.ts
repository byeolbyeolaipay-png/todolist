import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import db from '@/lib/db/dexie';
import { createTask, type Task } from '@/domain/task';

const QUERY_KEY = ['tasks'];

export function useTasks(filter?: { status?: Task['status']; categoryId?: string }) {
  return useQuery({
    queryKey: [...QUERY_KEY, filter],
    queryFn: async () => {
      let q = db.tasks.orderBy('createdAt').reverse();
      const all = await q.toArray();
      return all.filter((t) => {
        if (filter?.status && t.status !== filter.status) return false;
        if (filter?.categoryId && t.categoryId !== filter.categoryId) return false;
        return true;
      });
    },
  });
}

export function useAddTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Parameters<typeof createTask>[0]) => {
      const task = createTask(input);
      await db.tasks.add(task);
      return task;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Task> }) => {
      await db.tasks.update(id, { ...patch, updatedAt: Date.now() });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await db.tasks.delete(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
