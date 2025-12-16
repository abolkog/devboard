import * as vscode from 'vscode';

export class TaskTreeItem extends vscode.TreeItem {
  constructor(public readonly task: Task) {
    super(
      task.title,
      task.subtasks && task.subtasks.length > 0
        ? vscode.TreeItemCollapsibleState.Expanded
        : vscode.TreeItemCollapsibleState.None,
    );

    this.label = task.title;
    this.id = task.id;

    this.checkboxState = task.completed ? vscode.TreeItemCheckboxState.Checked : vscode.TreeItemCheckboxState.Unchecked;

    if (task.completed) {
      this.description = '✓';
    }

    if (task.subtasks && task.subtasks.length > 0) {
      const completed = task.subtasks.filter(st => st.completed).length;
      this.description = `${completed}/${task.subtasks.length}`;
    }

    this.contextValue = 'devboard.task';
    this.tooltip = `${task.title}\nCreated: ${new Date(task.createdAt).toLocaleString()}`;
  }
}
