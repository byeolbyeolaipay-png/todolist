import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useTasks, useAddTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useRemoteTasks, useAddRemoteTask, useUpdateRemoteTask, useDeleteRemoteTask } from '@/hooks/useRemoteTasks';
import TaskComposer from '@/components/task/TaskComposer';
import TaskItem from '@/components/task/TaskItem';
import CategorySidebar from '@/components/category/CategorySidebar';
import type { Task } from '@/domain/task';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [view, setView] = useState<'active' | 'completed'>('active');

  const filter = { status: view as Task['status'], categoryId: selectedCategory ?? undefined };

  // 게스트: 로컬, 회원: 원격
  const localTasks   = useTasks(user ? undefined : filter);
  const remoteTasks  = useRemoteTasks(user?.id ?? '', user ? filter : undefined);
  const tasks        = user ? (remoteTasks.data ?? []) : (localTasks.data ?? []);
  const isLoading    = user ? remoteTasks.isLoading : localTasks.isLoading;

  const addLocal     = useAddTask();
  const addRemote    = useAddRemoteTask(user?.id ?? '');
  const updateLocal  = useUpdateTask();
  const updateRemote = useUpdateRemoteTask();
  const deleteLocal  = useDeleteTask();
  const deleteRemote = useDeleteRemoteTask();

  const addTask    = user ? addRemote    : addLocal;
  const updateTask = user ? updateRemote : updateLocal;
  const deleteTask = user ? deleteRemote : deleteLocal;

  const handleToggle = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    updateTask.mutate({ id, patch: {
      status: task.status === 'completed' ? 'active' : 'completed',
      completedAt: task.status === 'active' ? Date.now() : undefined,
    }});
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <CategorySidebar selectedId={selectedCategory} onSelect={setSelectedCategory} userId={user?.id} />

      <main className="flex-1 flex flex-col min-w-0 border-l border-gray-200 bg-white">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <h1 className="text-lg font-semibold text-gray-800">📝 할 일</h1>
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{user.email}</span>
                <button onClick={() => signOut()} className="text-xs text-gray-400 hover:text-gray-600">로그아웃</button>
              </div>
            ) : (
              <Link to="/login" className="text-xs text-blue-500 hover:underline">로그인 / 회원가입</Link>
            )}
          </div>
        </div>

        {/* 탭 */}
        <div className="flex gap-1 px-6 pb-2">
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
            {(['active', 'completed'] as const).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors
                  ${view === v ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
                {v === 'active' ? '진행 중' : '완료'}
              </button>
            ))}
          </div>
        </div>

        <TaskComposer onSubmit={(title) =>
          addTask.mutate({ title, categoryId: selectedCategory ?? undefined })} />

        <ul className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {isLoading && <li className="p-8 text-center text-sm text-gray-400">로딩 중...</li>}
          {!isLoading && tasks.length === 0 && (
            <li className="p-12 text-center text-sm text-gray-400">
              {view === 'active' ? '할 일이 없어요. 위에서 추가해 보세요!' : '완료된 항목이 없어요.'}
            </li>
          )}
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task}
              onToggle={handleToggle}
              onTrash={(id) => deleteTask.mutate(id)} />
          ))}
        </ul>
      </main>
    </div>
  );
}
