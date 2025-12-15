import * as vscode from 'vscode';
import { TodoItem } from './todoItem';

describe('TodoItem', () => {
  const base: CodeTodo = {
    id: '1',
    type: 'TODO',
    text: 'implement feature',
    file: '/path/to/file.ts',
    line: 10,
    relativePath: 'src/file.ts',
  };

  it('sets label and description', () => {
    const item = new TodoItem(base);
    expect(item.label).toBe('implement feature');
    expect(item.description).toBe('TODO — line 11');
  });

  it('uses warning icon for FIXME', () => {
    const item = new TodoItem({ ...base, type: 'FIXME' });
    const icon = item.iconPath as vscode.ThemeIcon;
    expect(icon.id).toBe('warning');
  });

  it('uses checklist icon for TODO', () => {
    const item = new TodoItem(base);
    const icon = item.iconPath as vscode.ThemeIcon;
    expect(icon.id).toBe('checklist');
  });

  it('builds tooltip with path and line', () => {
    const item = new TodoItem(base);
    const tooltip = item.tooltip as vscode.MarkdownString;
    expect(tooltip.value).toContain('**TODO**');
    expect(tooltip.value).toContain('src/file.ts:11');
  });

  it('opens the file at the todo line', () => {
    const item = new TodoItem(base);
    const [uriArg, options] = item.command?.arguments ?? [];
    expect(uriArg.fsPath).toBe(base.file);
    expect(options.selection.start.line).toBe(10);
    expect(options.selection.end.line).toBe(10);
  });
});
