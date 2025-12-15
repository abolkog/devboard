import * as vscode from 'vscode';
import { registerTodoView } from './views/todos';

export function activate(context: vscode.ExtensionContext) {
  registerTodoView(context);
}

export function deactivate() {}
