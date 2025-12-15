import * as vscode from 'vscode';
import { NotesProvider } from './notesProvider';
import { VIEW_IDS } from '../../constants';
import { NoteItem } from './noteItem';
import { handleAddNewNoteCommand, handleDeleteNoteCommand } from './notesCommandsHandler';

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
      await handleAddNewNoteCommand(provider);
    }),
    vscode.commands.registerCommand('devboard.notes.delete', async (item: NoteItem) => {
      await handleDeleteNoteCommand(provider, item);
    }),
  );
}
