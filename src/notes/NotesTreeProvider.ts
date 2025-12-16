import * as vscode from 'vscode';
import { NotesManager } from './NotesManager';
import { NoteTreeItem } from './NoteTreeItem';

export class NotesTreeProvider implements vscode.TreeDataProvider<NoteTreeItem> {
  private notes: Note[] = [];
  private notesManager = NotesManager.getInstance();
  private loading = false;
  private initialized = false;

  private _onDidChangeTreeData = new vscode.EventEmitter<NoteTreeItem | undefined>();
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
      this.notes = await this.notesManager.getNotes();
      this.initialized = true;
      this._onDidChangeTreeData.fire(undefined);
    } finally {
      this.loading = false;
    }
  }

  getTreeItem(element: NoteTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<Array<NoteTreeItem>> {
    if (!this.initialized) {
      await this.refresh();
    }

    return this.notes.map(note => new NoteTreeItem(note));
  }

  async createNewNote() {
    const title = await vscode.window.showInputBox({
      prompt: 'New note title',
      placeHolder: 'e.g. Release plan',
      validateInput: v => (!v || !v.trim() ? 'Title is required' : undefined),
    });

    if (!title) {
      return;
    }
    try {
      await this.notesManager.createNote(title);
      await this.refresh(true);
    } catch {
      vscode.window.showErrorMessage('Failed to create note');
    }
  }

  async deleteNote(item: NoteTreeItem) {
    try {
      const filePath = item.command?.arguments?.[0]?.fsPath;
      if (!filePath) {
        return;
      }

      const confirm = await vscode.window.showWarningMessage(
        `Are you sure you want to delete "${item.label}"?`,
        'Delete',
        'Cancel',
      );

      if (confirm !== 'Delete') {
        return;
      }

      await this.notesManager.deleteNote(filePath);
      await this.refresh(true);
    } catch {
      vscode.window.showErrorMessage('Failed to delete note');
    }
  }
}
