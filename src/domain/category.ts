export const CATEGORY_COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899','#6b7280'] as const;
export type CategoryColor = typeof CATEGORY_COLORS[number];

export interface Category {
  id: string;
  name: string;
  color: CategoryColor;
  isDefault: boolean;
  createdAt: number;
}

export function createCategory(
  input: { name: string; color?: CategoryColor },
  now = Date.now,
  genId = () => crypto.randomUUID()
): Category {
  return {
    id: genId(),
    name: input.name,
    color: input.color ?? '#3b82f6',
    isDefault: false,
    createdAt: now(),
  };
}
