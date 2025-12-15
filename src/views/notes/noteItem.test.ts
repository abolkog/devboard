import * as vscode from 'vscode';
import { NoteItem } from './noteItem';

describe('NoteItem', () => {
  const base: Note = {
    name: 'meeting notes',
    path: '/path/to/file.ts',
  };

  it('sets label', () => {
    const item = new NoteItem(base);
    expect(item.label).toBe('meeting notes');
  });

  it('uses file icon for the note', () => {
    const item = new NoteItem(base);
    const icon = item.iconPath as vscode.ThemeIcon;
    expect(icon.id).toBe('file');
  });

  it('opens the file using the path', () => {
    const item = new NoteItem(base);
    const [uriArg] = item.command?.arguments ?? [];
    expect(uriArg.fsPath).toBe(base.path);
  });
});
