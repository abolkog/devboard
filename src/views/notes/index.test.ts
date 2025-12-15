import * as vscode from 'vscode';
import { registerNotesView } from './index';

describe('registerNotesView', () => {
  it('registers view and commands without error', () => {
    const mockContext: Partial<vscode.ExtensionContext> = { subscriptions: [] };
    expect(() => registerNotesView(mockContext as vscode.ExtensionContext)).not.toThrow();
    expect(mockContext.subscriptions?.length).toBeGreaterThan(0);
  });

  it('creates a tree view with the notes id', () => {
    const mockContext: Partial<vscode.ExtensionContext> = { subscriptions: [] };
    registerNotesView(mockContext as vscode.ExtensionContext);
    expect(vscode.window.createTreeView).toHaveBeenCalledWith('notesView', expect.anything());
  });

  it('registers devboard.notes.refresh command', () => {
    const mockContext: Partial<vscode.ExtensionContext> = { subscriptions: [] };
    registerNotesView(mockContext as vscode.ExtensionContext);
    expect(vscode.commands.registerCommand).toHaveBeenCalledWith('devboard.notes.refresh', expect.any(Function));
  });

  it('registers devboard.notes.add command', () => {
    const mockContext: Partial<vscode.ExtensionContext> = { subscriptions: [] };
    registerNotesView(mockContext as vscode.ExtensionContext);
    expect(vscode.commands.registerCommand).toHaveBeenCalledWith('devboard.notes.add', expect.any(Function));
  });
});
