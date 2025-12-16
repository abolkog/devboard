import * as vscode from 'vscode';
import { TodoTreeProvider } from './TodoTreeProvider';
import { VIEW_IDS } from '../constants';

export function registerTodoView(context: vscode.ExtensionContext) {
  const provider = new TodoTreeProvider();

  const treeView = vscode.window.createTreeView(VIEW_IDS.TODO, {
    treeDataProvider: provider,
  });

  context.subscriptions.push(
    treeView,
    treeView.onDidChangeVisibility(async e => {
      if (e.visible) {
        await provider.refresh(true);
      }
    }),

    vscode.commands.registerCommand('devboard.todo.refresh', async () => {
      await provider.refresh(true);
    }),
  );
}
