import * as vscode from 'vscode';
import * as myExtension from './extension';

describe('Extension', () => {
  it('exports activate/deactivate', () => {
    expect(typeof myExtension.activate).toBe('function');
    expect(typeof myExtension.deactivate).toBe('function');
  });

  it('registers todo view on activate', async () => {
    await myExtension.activate({ subscriptions: [] } as any);
    expect(vscode.window.createTreeView).toHaveBeenCalled();
  });

  it('deactivate is a no-op', () => {
    expect(() => myExtension.deactivate()).not.toThrow();
  });
});
