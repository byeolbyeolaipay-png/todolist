import type { Task } from '@/domain/task';

const PRIORITY_LABEL: Record<Task['priority'], string> = {
  low: '낮음', normal: '', high: '높음',
};
const PRIORITY_COLOR: Record<Task['priority'], string> = {
  low: 'text-gray-400', normal: '', high: 'text-red-500',
};

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onTrash: (id: string) => void;
}

export default function TaskItem({ task, onToggle, onTrash }: Props) {
  const done = task.status === 'completed';

  return (
    <li className="flex items-start gap-3 rounded-lg px-4 py-3 hover:bg-gray-50 group">
      <input
        type="checkbox"
        checked={done}
        onChange={() => onToggle(task.id)}
        className="mt-0.5 h-4 w-4 cursor-pointer accent-blue-500"
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {task.title}
        </p>
        {task.dueAt && (
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(task.dueAt).toLocaleDateString('ko-KR')}
          </p>
        )}
      </div>
      {task.priority !== 'normal' && (
        <span className={`text-xs font-medium ${PRIORITY_COLOR[task.priority]}`}>
          {PRIORITY_LABEL[task.priority]}
        </span>
      )}
      <button
        onClick={() => onTrash(task.id)}
        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 text-lg leading-none"
        aria-label="삭제"
      >
        ×
      </button>
    </li>
  );
}
