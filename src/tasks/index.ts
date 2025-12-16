import * as vscode from 'vscode';
import { TaskTreeProvider } from './TaskTreeProvider';
import { VIEW_IDS } from '../constants';
import { TaskTreeItem } from './TaskTreeItem';

export function registerTasksView(context: vscode.ExtensionContext) {
  const provider = new TaskTreeProvider(context);

  const treeView = vscode.window.createTreeView(VIEW_IDS.TASKS, {
    treeDataProvider: provider,
  });

  context.subscriptions.push(
    treeView,
    treeView.onDidChangeVisibility(async e => {
      if (e.visible) {
        await provider.refresh(true);
      }
    }),

    treeView.onDidChangeCheckboxState(async e => {
      for (const [item] of e.items) {
        if (item instanceof TaskTreeItem) {
          await provider.toggleTask(item.task.id);
        }
      }
    }),

    vscode.commands.registerCommand('devboard.tasks.refresh', async () => {
      await provider.refresh(true);
    }),

    vscode.commands.registerCommand('devboard.tasks.add', async (item?: TaskTreeItem) => {
      await provider.addTask(item);
    }),

    vscode.commands.registerCommand('devboard.tasks.delete', async (item: TaskTreeItem) => {
      await provider.deleteTask(item);
    }),
  );
}
