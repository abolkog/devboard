import * as vscode from 'vscode';
import * as myExtension from './extension';
import { VIEW_IDS } from './constants';

describe('Extension', () => {
  it('exports activate/deactivate', () => {
    expect(typeof myExtension.activate).toBe('function');
    expect(typeof myExtension.deactivate).toBe('function');
  });

  it('registers todo view on activate', async () => {
    await myExtension.activate({ subscriptions: [] } as any);
    expect(vscode.window.createTreeView).toHaveBeenCalledWith(
      VIEW_IDS.TODO,
      expect.objectContaining({ treeDataProvider: expect.anything() }),
    );
  });

  it('registers notes view on activate', async () => {
    await myExtension.activate({ subscriptions: [] } as any);
    expect(vscode.window.createTreeView).toHaveBeenCalledWith(
      VIEW_IDS.NOTES,
      expect.objectContaining({ treeDataProvider: expect.anything() }),
    );
  });

  it('deactivate is a no-op', () => {
    expect(() => myExtension.deactivate()).not.toThrow();
  });
});
