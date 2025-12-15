import * as vscode from 'vscode';

export class NoteItem extends vscode.TreeItem {
  constructor(note: Note) {
    super(note.name, vscode.TreeItemCollapsibleState.None);

    this.label = note.name;
    this.iconPath = vscode.ThemeIcon.File;

    this.command = {
      command: 'vscode.open',
      title: 'Open file',
      arguments: [vscode.Uri.file(note.path)],
    };
  }
}
