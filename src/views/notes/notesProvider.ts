import * as vscode from 'vscode';
import { NotesManager } from './notesManager';
import { NoteItem } from './noteItem';

export class NotesProvider implements vscode.TreeDataProvider<NoteItem> {
  private notes: Note[] = [];
  private notesManager = NotesManager.getInstance();
  private loading = false;
  private initialized = false;

  private _onDidChangeTreeData = new vscode.EventEmitter<NoteItem | undefined>();
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

  getTreeItem(element: NoteItem): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<Array<NoteItem>> {
    if (!this.initialized) {
      await this.refresh();
    }

    return this.notes.map(note => new NoteItem(note));
  }
}
