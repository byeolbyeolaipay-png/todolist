export type Priority = 'low' | 'normal' | 'high';
export type TaskStatus = 'active' | 'completed' | 'trashed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueAt?: number;
  priority: Priority;
  categoryId?: string;
  status: TaskStatus;
  completedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export function createTask(
  input: {
    title: string;
    description?: string;
    dueAt?: number;
    priority?: Priority;
    categoryId?: string;
  },
  now = Date.now,
  genId = () => crypto.randomUUID()
): Task {
  const ts = now();
  return {
    id: genId(),
    title: input.title,
    description: input.description,
    dueAt: input.dueAt,
    priority: input.priority ?? 'normal',
    categoryId: input.categoryId,
    status: 'active',
    createdAt: ts,
    updatedAt: ts,
  };
}
