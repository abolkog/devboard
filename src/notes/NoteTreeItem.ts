import * as vscode from 'vscode';

export class NoteTreeItem extends vscode.TreeItem {
  constructor(note: Note) {
    super(note.name, vscode.TreeItemCollapsibleState.None);

    this.label = note.name;
    this.iconPath = vscode.ThemeIcon.File;
    this.contextValue = 'devboard.note';

    this.command = {
      command: 'vscode.open',
      title: 'Open file',
      arguments: [vscode.Uri.file(note.path)],
    };
  }
}
