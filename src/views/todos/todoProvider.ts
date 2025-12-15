import * as vscode from 'vscode';
import { TodoFileItem, TodoItem } from './todoItem';
import { TodoScanner } from './todoScanner';

export class TodoProvider implements vscode.TreeDataProvider<TodoFileItem | TodoItem> {
  private todos: CodeTodo[] = [];
  private grouped = new Map<string, { relativePath: string; todos: CodeTodo[] }>();
  private scanner = new TodoScanner();
  private loading = false;
  private initialized = false;

  private _onDidChangeTreeData = new vscode.EventEmitter<TodoFileItem | TodoItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  async refresh(force = false): Promise<void> {
    if (this.loading) {
      return;
    }
    if (this.initialized && !force) {
      return;
    }

    this.loading = true;
    try {
      this.todos = await this.scanner.scanWorkspace();
      this.groupByFile();
      this.initialized = true;
      this._onDidChangeTreeData.fire(undefined);
    } finally {
      this.loading = false;
    }
  }

  getTreeItem(element: TodoFileItem | TodoItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: TodoFileItem | TodoItem): Promise<Array<TodoFileItem | TodoItem>> {
    if (!this.initialized) {
      await this.refresh();
    }

    // Root level: files
    if (!element) {
      return Array.from(this.grouped.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([filePath, { relativePath, todos }]) => new TodoFileItem(filePath, relativePath, todos.length));
    }

    // File level: leaf todos
    if (element instanceof TodoFileItem) {
      const entry = this.grouped.get(element.filePath);
      if (!entry) {
        return [];
      }
      return entry.todos
        .slice()
        .sort((a, b) => a.line - b.line)
        .map(todo => new TodoItem(todo));
    }

    return [];
  }

  private groupByFile(): void {
    this.grouped.clear();
    for (const todo of this.todos) {
      const existing = this.grouped.get(todo.file);
      if (existing) {
        existing.todos.push(todo);
      } else {
        this.grouped.set(todo.file, { relativePath: todo.relativePath, todos: [todo] });
      }
    }
  }
}
