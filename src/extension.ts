import * as vscode from 'vscode';
import { registerTodoView } from './views/todos';
import { registerNotesView } from './views/notes';

export function activate(context: vscode.ExtensionContext) {
  registerTodoView(context);
  registerNotesView(context);
}

export function deactivate() {}
