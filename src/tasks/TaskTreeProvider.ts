import * as vscode from 'vscode';
import { TaskManager } from './TaskManager';
import { TaskTreeItem } from './TaskTreeItem';

export class TaskTreeProvider implements vscode.TreeDataProvider<TaskTreeItem> {
  private tasks: Task[] = [];
  private taskManager: TaskManager;

  private loading = false;
  private initialized = false;

  private _onDidChangeTreeData = new vscode.EventEmitter<TaskTreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(context: vscode.ExtensionContext) {
    this.taskManager = new TaskManager(context);
  }

  async refresh(force = false): Promise<void> {
    if (this.loading) {
      return;
    }
    if (this.initialized && !force) {
      return;
    }

    this.loading = true;
    try {
      this.tasks = await this.taskManager.getTasks();
      this.initialized = true;
      this._onDidChangeTreeData.fire(undefined);
    } finally {
      this.loading = false;
    }
  }

  getTreeItem(element: TaskTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: TaskTreeItem): Promise<Array<TaskTreeItem>> {
    if (!this.initialized) {
      await this.refresh();
    }

    // If element is provided, return its subtasks
    if (element && element.task.subtasks) {
      return element.task.subtasks.map(subtask => new TaskTreeItem(subtask));
    }

    // Otherwise, return root-level tasks (tasks without parentId)
    const rootTasks = this.tasks.filter(task => !task.parentId);
    return rootTasks.map(task => new TaskTreeItem(task));
  }

  async addTask(item?: TaskTreeItem): Promise<void> {
    const parentId = item?.task.id;
    const promptMessage = parentId ? `Add subtask to "${item?.task.title}"` : 'Enter task name';

    const taskName = await vscode.window.showInputBox({
      prompt: promptMessage,
      placeHolder: 'Task name...',
      validateInput: value => {
        if (!value || value.trim().length === 0) {
          return 'Task name cannot be empty';
        }
        return null;
      },
    });

    if (!taskName) {
      return;
    }
    await this.taskManager.addTask(taskName, parentId);
    await this.refresh(true);
  }

  async deleteTask(item: TaskTreeItem): Promise<void> {
    try {
      const confirm = await vscode.window.showWarningMessage(
        `Are you sure you want to delete "${item.task.title}"?`,
        'Delete',
        'Cancel',
      );

      if (confirm === 'Delete') {
        await this.taskManager.deleteTask(item.task.id);
        await this.refresh(true);
      }
    } catch {
      vscode.window.showErrorMessage('Failed to delete task');
    }
  }

  async toggleTask(id: string): Promise<void> {
    await this.taskManager.toggleTask(id);
    await this.refresh(true);
  }
}
