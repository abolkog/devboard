import * as vscode from 'vscode';

export class TodoItem extends vscode.TreeItem {
  constructor(todo: CodeTodo) {
    super(todo.text, vscode.TreeItemCollapsibleState.None);

    this.label = todo.text;
    this.description = `${todo.type} — line ${todo.line + 1}`;
    this.tooltip = new vscode.MarkdownString(`**${todo.type}** ${todo.text}\n\n${todo.relativePath}:${todo.line + 1}`);
    this.tooltip.supportThemeIcons = true;
    this.contextValue = `${todo.relativePath}:${todo.line + 1}`;

    this.iconPath = new vscode.ThemeIcon(todo.type === 'FIXME' ? 'warning' : 'checklist');

    this.command = {
      command: 'vscode.open',
      title: 'Open file',
      arguments: [
        vscode.Uri.file(todo.file),
        {
          selection: new vscode.Range(todo.line, 0, todo.line, 0),
        },
      ],
    };
  }
}

export class TodoFileItem extends vscode.TreeItem {
  constructor(
    readonly filePath: string,
    readonly relativePath: string,
    todoCount: number,
  ) {
    super(relativePath, vscode.TreeItemCollapsibleState.Collapsed);

    this.resourceUri = vscode.Uri.file(filePath);
    this.description = `${todoCount} item${todoCount === 1 ? '' : 's'}`;
    this.iconPath = vscode.ThemeIcon.File;
    this.contextValue = 'todoFile';
  }
}
