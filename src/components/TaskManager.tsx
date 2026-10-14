import React, { useState, useEffect } from 'react';
import { Plus, Check, Circle, Trash2, ChevronDown, ChevronUp, Target, Archive, ArrowRight, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StorageService, getTodayDateStr } from '../utils/storage';
import { TaskItem } from '../types/logs';

interface TaskManagerProps {
  onTaskUpdated?: () => void;
  onOpenHistory?: () => void;
}

export default function TaskManager({ onTaskUpdated, onOpenHistory }: TaskManagerProps) {
  const [allTasks, setAllTasks] = useState<TaskItem[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const todayStr = getTodayDateStr();

  useEffect(() => {
    setAllTasks(StorageService.getTasks());
  }, []);

  // Filter tasks belonging to today:
  // Either created today, OR incomplete rollover tasks
  const todayTasks = allTasks.filter((t) => {
    const taskDate = t.date || (t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : todayStr);
    // If it was completed on a previous day, it belongs to that past day's archive!
    if (t.completed && taskDate !== todayStr) {
      return false;
    }
    return true;
  });

  // Past archived completed tasks count
  const pastArchivedCount = allTasks.filter((t) => {
    const taskDate = t.date || (t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : todayStr);
    return t.completed && taskDate !== todayStr;
  }).length;

  const updateAllTasks = (updated: TaskItem[]) => {
    setAllTasks(updated);
    StorageService.saveTasks(updated);
    if (onTaskUpdated) onTaskUpdated();
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || todayTasks.length >= 3) return;

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      completed: false,
      date: todayStr,
      createdAt: Date.now(),
      steps: [],
      isExpanded: true,
    };

    updateAllTasks([...allTasks, newTask]);
    setNewTaskTitle('');
  };

  const toggleTask = (id: string) => {
    const updated = allTasks.map((t) => {
      if (t.id === id) {
        const nextState = !t.completed;
        return {
          ...t,
          completed: nextState,
          completedAt: nextState ? Date.now() : undefined,
          date: t.date || todayStr,
        };
      }
      return t;
    });
    updateAllTasks(updated);
  };

  const deleteTask = (id: string) => {
    updateAllTasks(allTasks.filter((t) => t.id !== id));
  };

  const toggleExpand = (id: string) => {
    updateAllTasks(allTasks.map((t) => (t.id === id ? { ...t, isExpanded: !t.isExpanded } : t)));
  };

  const addStep = (taskId: string, stepText: string) => {
    if (!stepText.trim()) return;
    const updated = allTasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          steps: [...t.steps, { id: `step-${Date.now()}`, text: stepText.trim(), completed: false }],
        };
      }
      return t;
    });
    updateAllTasks(updated);
  };

  const toggleStep = (taskId: string, stepId: string) => {
    const updated = allTasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          steps: t.steps.map((s) => (s.id === stepId ? { ...s, completed: !s.completed } : s)),
        };
      }
      return t;
    });
    updateAllTasks(updated);
  };

  const deleteStep = (taskId: string, stepId: string) => {
    const updated = allTasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          steps: t.steps.filter((s) => s.id !== stepId),
        };
      }
      return t;
    });
    updateAllTasks(updated);
  };

  const completedTodayCount = todayTasks.filter((t) => t.completed).length;

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-sm border border-emerald-100/80 hover:border-emerald-200 transition-all h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-sand-200/80">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
              <Target size={14} className="text-emerald-600" />
              Today's 3 Priorities
            </span>
          </div>

          <span className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
            todayTasks.length >= 3 
              ? 'bg-amber-100 text-amber-800 border-amber-200' 
              : 'bg-emerald-100 text-emerald-800 border-emerald-200'
          }`}>
            {completedTodayCount}/{todayTasks.length} Done ({todayTasks.length}/3 Cap)
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-ink-600 mb-4">
          <p className="font-light">
            Each day starts fresh with 3 focus spots. Previous days' tasks are preserved in history.
          </p>
          {pastArchivedCount > 0 && onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="text-[11px] text-emerald-700 hover:text-emerald-900 font-medium flex items-center gap-1 underline underline-offset-2 shrink-0 ml-2"
            >
              <span>{pastArchivedCount} archived</span>
              <ArrowRight size={10} />
            </button>
          )}
        </div>

        <div className="max-h-72 overflow-y-auto pr-1 space-y-3">
          <AnimatePresence>
            {todayTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`border rounded-2xl overflow-hidden transition-all shadow-2xs ${
                  task.completed
                    ? 'bg-gradient-to-r from-emerald-50/50 to-sand-50/50 border-emerald-200/80'
                    : 'bg-white hover:border-emerald-300 border-sand-200'
                }`}
              >
                <div className="p-3.5 flex items-center gap-3">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`w-5.5 h-5.5 rounded-full flex items-center justify-center transition-all shrink-0 ${
                      task.completed
                        ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-xs scale-105'
                        : 'border-2 border-emerald-300 text-transparent hover:border-emerald-500'
                    }`}
                  >
                    <Check size={13} className="stroke-[3]" />
                  </button>
                  <span
                    className={`flex-1 text-xs md:text-sm font-medium transition-all ${
                      task.completed ? 'text-ink-400 line-through' : 'text-ink-900'
                    }`}
                  >
                    {task.title}
                  </span>
                  <button
                    onClick={() => toggleExpand(task.id)}
                    className="p-1 text-ink-400 hover:text-ink-800 hover:bg-sand-100 rounded-md transition-colors"
                  >
                    {task.isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 text-ink-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <AnimatePresence>
                  {task.isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-sand-50/70 border-t border-sand-200 px-4 py-3 text-xs"
                    >
                      <div className="space-y-1.5 mb-2.5">
                        {task.steps.map((step) => (
                          <div key={step.id} className="flex items-center gap-2 group">
                            <button
                              onClick={() => toggleStep(task.id, step.id)}
                              className={`shrink-0 transition-colors ${
                                step.completed ? 'text-emerald-600' : 'text-ink-400 hover:text-emerald-500'
                              }`}
                            >
                              {step.completed ? <Check size={14} className="stroke-[3]" /> : <Circle size={14} />}
                            </button>
                            <span
                              className={`flex-1 text-xs ${
                                step.completed ? 'text-ink-400 line-through' : 'text-ink-800'
                              }`}
                            >
                              {step.text}
                            </span>
                            <button
                              onClick={() => deleteStep(task.id, step.id)}
                              className="opacity-0 group-hover:opacity-100 p-0.5 text-ink-400 hover:text-rose-500 transition-all"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const input = e.currentTarget.elements.namedItem('stepInput') as HTMLInputElement;
                          addStep(task.id, input.value);
                          input.value = '';
                        }}
                        className="flex gap-2"
                      >
                        <input
                          name="stepInput"
                          type="text"
                          placeholder="Add actionable micro-step..."
                          className="flex-1 bg-white border border-sand-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-400 shadow-2xs"
                        />
                        <button
                          type="submit"
                          className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl transition-colors text-xs font-semibold"
                        >
                          Add
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>

          {todayTasks.length === 0 && (
            <div className="text-center py-8 text-ink-500 flex flex-col items-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-2 border border-emerald-200">
                <Check size={20} className="text-emerald-600" />
              </div>
              <p className="text-xs font-semibold text-ink-700">Clean slate for today.</p>
              <p className="text-[11px] text-ink-500 mt-0.5">Choose up to 3 essential tasks to accomplish today.</p>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={addTask} className="mt-4 pt-3 border-t border-sand-200/80 flex gap-2">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder={todayTasks.length >= 3 ? 'Cap reached: 3 tasks focus limit' : 'What is your core priority today?'}
          disabled={todayTasks.length >= 3}
          className="flex-1 text-xs bg-sand-50/70 border border-sand-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-400 focus:bg-white disabled:opacity-50 shadow-inner"
        />
        <button
          type="submit"
          disabled={todayTasks.length >= 3 || !newTaskTitle.trim()}
          className="bg-gradient-to-tr from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-xs"
        >
          <Plus size={18} />
        </button>
      </form>
    </div>
  );
}
