import * as vscode from 'vscode';

import { NotesProvider } from './notesProvider';
import { NotesManager } from './notesManager';
import { NoteItem } from './noteItem';

export async function handleAddNewNoteCommand(provider: NotesProvider) {
  const title = await vscode.window.showInputBox({
    prompt: 'New note title',
    placeHolder: 'e.g. Release plan',
    validateInput: v => (!v || !v.trim() ? 'Title is required' : undefined),
  });

  if (!title) {
    return;
  }

  const mgr = NotesManager.getInstance();
  mgr.createNote(title);
  await provider.refresh(true);
}

export async function handleDeleteNoteCommand(provider: NotesProvider, item: NoteItem) {
  try {
    const filePath = item.command?.arguments?.[0]?.fsPath;
    if (!filePath) {
      return;
    }
    const message = `Delete note "${item.label}"?`;
    const pick = await vscode.window.showWarningMessage(message, { modal: true }, 'Delete');
    if (pick !== 'Delete') {
      return;
    }

    NotesManager.getInstance().deleteNote(filePath);
    await provider.refresh(true);
  } catch {
    vscode.window.showErrorMessage('Failed to delete note');
  }
}
