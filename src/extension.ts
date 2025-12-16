import * as vscode from 'vscode';
import { registerTodoView } from './views/todos';
import { registerNotesView } from './notes';
import { registerTasksView } from './views/tasks';

export function activate(context: vscode.ExtensionContext) {
  registerTodoView(context);
  registerNotesView(context);
  registerTasksView(context);
}

export function deactivate() {}
