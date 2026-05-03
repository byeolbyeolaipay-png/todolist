import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/db/supabase';
import { createTask, type Task } from '@/domain/task';

const QUERY_KEY = ['remote-tasks'];

function toTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string | undefined,
    dueAt: row.due_at as number | undefined,
    priority: row.priority as Task['priority'],
    categoryId: row.category_id as string | undefined,
    status: row.status as Task['status'],
    completedAt: row.completed_at as number | undefined,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

function toRow(task: Task, userId: string) {
  return {
    id: task.id,
    user_id: userId,
    title: task.title,
    description: task.description ?? null,
    due_at: task.dueAt ?? null,
    priority: task.priority,
    category_id: task.categoryId ?? null,
    status: task.status,
    completed_at: task.completedAt ?? null,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
  };
}

export function useRemoteTasks(userId: string, filter?: { status?: Task['status']; categoryId?: string }) {
  return useQuery({
    queryKey: [...QUERY_KEY, userId, filter],
    queryFn: async () => {
      let q = supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (filter?.status) q = q.eq('status', filter.status);
      if (filter?.categoryId) q = q.eq('category_id', filter.categoryId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map(toTask);
    },
  });
}

export function useAddRemoteTask(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Parameters<typeof createTask>[0]) => {
      const task = createTask(input);
      const { error } = await supabase.from('tasks').insert(toRow(task, userId));
      if (error) throw error;
      return task;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdateRemoteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Task> }) => {
      const updatedAt = Date.now();
      const { error } = await supabase.from('tasks').update({
        title: patch.title,
        description: patch.description,
        due_at: patch.dueAt,
        priority: patch.priority,
        category_id: patch.categoryId,
        status: patch.status,
        completed_at: patch.completedAt,
        updated_at: updatedAt,
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDeleteRemoteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
