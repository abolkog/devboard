import * as vscode from 'vscode';
import { NotesTreeProvider } from './NotesTreeProvider';
import { VIEW_IDS } from '../constants';
import { NoteTreeItem } from './NoteTreeItem';

export function registerNotesView(context: vscode.ExtensionContext) {
  const provider = new NotesTreeProvider();

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
    vscode.commands.registerCommand('devhq.notes.refresh', async () => {
      await provider.refresh(true);
    }),
    vscode.commands.registerCommand('devhq.notes.add', async () => {
      await provider.createNewNote();
    }),
    vscode.commands.registerCommand('devhq.notes.openFolder', async () => {
      await provider.openNotesFolder();
    }),
    vscode.commands.registerCommand('devhq.notes.rename', async (item: NoteTreeItem) => {
      await provider.renameNote(item);
    }),
    vscode.commands.registerCommand('devhq.notes.delete', async (item: NoteTreeItem) => {
      await provider.deleteNote(item);
    }),
  );
}
