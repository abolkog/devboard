// Minimal Jest mock for vscode APIs used in tests
import { jest } from '@jest/globals';

export const TreeItemCollapsibleState = {
  None: 0,
  Collapsed: 1,
  Expanded: 2,
};

export class TreeItem {
  constructor(
    public label?: string,
    public collapsibleState: number = TreeItemCollapsibleState.None,
  ) {}
  description?: string;
  tooltip?: any;
  contextValue?: string;
  iconPath?: any;
  command?: any;
  resourceUri?: any;
}

export class ThemeIcon {
  static File = new ThemeIcon('file');
  constructor(public id: string) {}
}

export class MarkdownString {
  constructor(public value: string) {}
  supportThemeIcons = false;
}

export class Range {
  start: { line: number; character: number };
  end: { line: number; character: number };
  constructor(startLine: number, startChar: number, endLine: number, endChar: number) {
    this.start = { line: startLine, character: startChar };
    this.end = { line: endLine, character: endChar };
  }
}

export const Uri = {
  file: (fsPath: string) => ({ fsPath }),
};

class Emitter<T> {
  private listeners: Array<(e: T) => void> = [];
  event = (listener: (e: T) => void) => {
    this.listeners.push(listener);
    return { dispose: () => {} };
  };
  fire(data: T) {
    this.listeners.forEach(listener => listener(data));
  }
}

export class EventEmitter<T> extends Emitter<T> {}

export const window = {
  showInformationMessage: jest.fn(),
  createTreeView: jest.fn(() => ({
    onDidChangeVisibility: jest.fn(),
    dispose: jest.fn(),
  })),
};

export const workspace = {
  workspaceFolders: [],
  onDidSaveTextDocument: jest.fn(),
  createFileSystemWatcher: jest.fn(() => ({
    onDidChange: jest.fn(),
    onDidCreate: jest.fn(),
    onDidDelete: jest.fn(),
    dispose: jest.fn(),
  })),
};

export const commands = {
  registerCommand: jest.fn(),
};

export const extensions = {
  getExtension: jest.fn(() => ({
    isActive: false,
    activate: jest.fn(async () => undefined),
  })),
};

export const env = { uriScheme: 'file' };

export const ViewColumn = { One: 1 };

export default {
  window,
  workspace,
  commands,
  extensions,
  TreeItem,
  TreeItemCollapsibleState,
  ThemeIcon,
  EventEmitter,
  MarkdownString,
  Range,
  Uri,
};
