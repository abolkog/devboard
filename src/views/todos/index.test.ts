import * as vscode from 'vscode';
import { registerTodoView } from './index';

// jest.mock('vscode');

describe('registerTodoView', () => {
  it('registers view and commands without error', () => {
    const mockContext: Partial<vscode.ExtensionContext> = { subscriptions: [] };
    expect(() => registerTodoView(mockContext as vscode.ExtensionContext)).not.toThrow();
    expect(mockContext.subscriptions?.length).toBeGreaterThan(0);
  });

  it('creates a tree view with the todo id', () => {
    const mockContext: Partial<vscode.ExtensionContext> = { subscriptions: [] };
    registerTodoView(mockContext as vscode.ExtensionContext);
    expect(vscode.window.createTreeView).toHaveBeenCalledWith('todoView', expect.anything());
  });
});
