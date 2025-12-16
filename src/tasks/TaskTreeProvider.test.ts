import * as vscode from 'vscode';
import { createMockExtensionContext } from '../__mocks__/vscode';

import { TaskTreeProvider } from './TaskTreeProvider';
import { TaskTreeItem } from './TaskTreeItem';

const mockTaskManager = {
  getTasks: jest.fn(),
  addTask: jest.fn(),
  deleteTask: jest.fn(),
  toggleTask: jest.fn(),
};

const mockTasks = [
  { id: '1', title: 'Task 1', parentId: undefined, subtasks: [], completed: false, createdAt: 1 },
  { id: '2', title: 'Task 2', parentId: undefined, subtasks: [], completed: false, createdAt: 2 },
  { id: '3', title: 'Sub Task for 2', parentId: '2', subtasks: [], completed: false, createdAt: 2 },
];

describe('TaskProvider', () => {
  let provider: TaskTreeProvider;

  beforeEach(() => {
    jest.clearAllMocks();

    provider = new TaskTreeProvider(createMockExtensionContext());
    (provider as any).taskManager = mockTaskManager;
  });

  describe('refresh', () => {
    it('should load tasks on first refresh', async () => {
      await provider.refresh();
      expect(mockTaskManager.getTasks).toHaveBeenCalled();
      expect((provider as any).initialized).toBe(true);
    });

    it('should not reload tasks if already initialized without force', async () => {
      await provider.refresh();
      mockTaskManager.getTasks.mockClear();
      await provider.refresh();
      expect(mockTaskManager.getTasks).not.toHaveBeenCalled();
    });

    it('should reload tasks with force flag', async () => {
      await provider.refresh();
      mockTaskManager.getTasks.mockClear();
      await provider.refresh(true);
      expect(mockTaskManager.getTasks).toHaveBeenCalled();
    });

    it('should not reload if already loading', async () => {
      mockTaskManager.getTasks.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      provider.refresh();
      await provider.refresh();

      expect(mockTaskManager.getTasks).toHaveBeenCalledTimes(1);
    });
  });

  describe('getChildren', () => {
    it('should return root tasks without parentId', async () => {
      mockTaskManager.getTasks.mockResolvedValue(mockTasks);

      const children = await provider.getChildren();

      expect(children).toHaveLength(2);
      expect(children[0].task.id).toBe('1');
    });

    it('should return subtasks when element is provided', async () => {
      const subtask = { id: '2', title: 'Subtask', parentId: '1', completed: false, createdAt: 1 };
      const mockTask = { ...mockTasks[0], subtasks: [subtask] };
      const taskItem = new TaskTreeItem(mockTask);

      mockTaskManager.getTasks.mockResolvedValue([mockTask]);
      await provider.refresh();

      const children = await provider.getChildren(taskItem);

      expect(children).toHaveLength(1);
      expect(children[0].task.id).toBe('2');
    });
  });

  describe('addTask', () => {
    it('should add task and refresh', async () => {
      (vscode.window.showInputBox as jest.Mock).mockResolvedValue('New Task');

      await provider.addTask();

      expect(mockTaskManager.addTask).toHaveBeenCalledWith('New Task', undefined);
    });

    it('should add task with parent id', async () => {
      (vscode.window.showInputBox as jest.Mock).mockResolvedValue('New Task');

      await provider.addTask({ task: { ...mockTasks[1], id: 'parent-id' } });

      expect(mockTaskManager.addTask).toHaveBeenCalledWith('New Task', 'parent-id');
    });
  });

  describe('deleteTask', () => {
    it('should delete task and refresh', async () => {
      (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue('Delete');
      await provider.deleteTask({ task: { ...mockTasks[0] } });

      expect(mockTaskManager.deleteTask).toHaveBeenCalledWith('1');
    });

    it('should not delete task when user cancels', async () => {
      (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue(undefined);

      await provider.deleteTask({ task: { ...mockTasks[0] } });

      expect(mockTaskManager.deleteTask).not.toHaveBeenCalled();
    });
  });

  describe('toggleTask', () => {
    it('should toggle task and refresh', async () => {
      await provider.toggleTask('task-id');

      expect(mockTaskManager.toggleTask).toHaveBeenCalledWith('task-id');
    });
  });

  describe('getTreeItem', () => {
    it('should return the same tree item', () => {
      const taskItem = new TaskTreeItem(mockTasks[0]);

      const result = provider.getTreeItem(taskItem);

      expect(result).toBe(taskItem);
    });
  });
});
