import * as vscode from 'vscode';
import { registerTodoView } from './todos';
import { registerNotesView } from './notes';
import { registerTasksView } from './tasks';

export function activate(context: vscode.ExtensionContext) {
  registerTodoView(context);
  registerNotesView(context);
  registerTasksView(context);
}

export function deactivate() {}
