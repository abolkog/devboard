import * as vscode from 'vscode';
import { NotesProvider } from './notesProvider';
import { VIEW_IDS } from '../../constants';
import { NotesManager } from './notesManager';

export function registerNotesView(context: vscode.ExtensionContext) {
  const provider = new NotesProvider();

  const treeView = vscode.window.createTreeView(VIEW_IDS.NOTES, {
    treeDataProvider: provider,
  });

  context.subscriptions.push(
    treeView,
    treeView.onDidChangeVisibility(async e => {
      if (e.visible) {
        await provider.refresh(true);
      }
    }),
    vscode.commands.registerCommand('devboard.notes.refresh', async () => {
      await provider.refresh(true);
    }),
    vscode.commands.registerCommand('devboard.notes.add', async () => {
      handleAddNewNoteCommand(provider);
    }),
  );
}

async function handleAddNewNoteCommand(provider: NotesProvider) {
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
