import Dexie, { type EntityTable } from 'dexie';
import type { Task } from '@/domain/task';
import type { Category } from '@/domain/category';

const db = new Dexie('TodoDB') as Dexie & {
  tasks: EntityTable<Task, 'id'>;
  categories: EntityTable<Category, 'id'>;
};

db.version(1).stores({
  tasks: 'id, status, dueAt, categoryId, createdAt',
  categories: 'id, name',
});

export default db;
