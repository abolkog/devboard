import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class TaskManager {
  private tasksFile: string;

  constructor(context: vscode.ExtensionContext) {
    const storageUri = context.globalStorageUri;
    this.tasksFile = path.join(storageUri.fsPath, 'tasks.json');
    this.ensureStorageExists(storageUri);
  }

  private ensureStorageExists(storageUri: vscode.Uri) {
    if (!fs.existsSync(storageUri.fsPath)) {
      fs.mkdirSync(storageUri.fsPath, { recursive: true });
    }
  }

  async getTasks(): Promise<Task[]> {
    try {
      if (!fs.existsSync(this.tasksFile)) {
        return [];
      }
      const data = fs.readFileSync(this.tasksFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async saveTasks(tasks: Task[]): Promise<void> {
    fs.writeFileSync(this.tasksFile, JSON.stringify(tasks, null, 2));
  }

  async addTask(title: string, parentId?: string): Promise<Task> {
    const tasks = await this.getTasks();
    const task: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      createdAt: Date.now(),
      parentId,
      subtasks: [],
    };

    if (parentId) {
      // If parentId is provided, add as subtask
      const parentTask = this.findTaskById(tasks, parentId);
      if (parentTask) {
        if (!parentTask.subtasks) {
          parentTask.subtasks = [];
        }
        parentTask.subtasks.push(task);
      }
    } else {
      // Add as root-level task
      tasks.push(task);
    }

    await this.saveTasks(tasks);
    return task;
  }

  private findTaskById(tasks: Task[], id: string): Task | undefined {
    for (const task of tasks) {
      if (task.id === id) {
        return task;
      }
      if (task.subtasks) {
        const found = this.findTaskById(task.subtasks, id);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  }

  async deleteTask(id: string): Promise<void> {
    const tasks = await this.getTasks();
    const filtered = this.removeTaskById(tasks, id);
    await this.saveTasks(filtered);
  }

  private removeTaskById(tasks: Task[], id: string): Task[] {
    return tasks
      .filter(t => t.id !== id)
      .map(t => ({
        ...t,
        subtasks: t.subtasks ? this.removeTaskById(t.subtasks, id) : [],
      }));
  }

  async toggleTask(id: string): Promise<void> {
    const tasks = await this.getTasks();
    const task = this.findTaskById(tasks, id);
    if (task) {
      task.completed = !task.completed;
      await this.saveTasks(tasks);
    }
  }
}
