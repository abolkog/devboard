import * as vscode from 'vscode';
import { registerNotesView } from './index';
import { createMockExtensionContext } from '../__mocks__/vscode';
import { NotesTreeProvider } from './NotesTreeProvider';

jest.mock('./NotesTreeProvider');

describe('registerNotesView', () => {
  let mockProvider: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockProvider = {
      createNewNote: jest.fn().mockResolvedValue(undefined),
      deleteNote: jest.fn().mockResolvedValue(undefined),
      refresh: jest.fn().mockResolvedValue(undefined),
    };

    (NotesTreeProvider as jest.Mock).mockImplementation(() => mockProvider);
  });

  it('creates a tree view with the notes id', () => {
    registerNotesView(createMockExtensionContext());
    expect(vscode.window.createTreeView).toHaveBeenCalledWith('notesView', expect.anything());
  });

  describe('registering commands', () => {
    it('registers view and commands without error', () => {
      const mockContext = createMockExtensionContext();
      expect(() => registerNotesView(mockContext as vscode.ExtensionContext)).not.toThrow();
      expect(mockContext.subscriptions?.length).toBeGreaterThan(0);
    });

    it('registers devboard.notes.refresh command', () => {
      registerNotesView(createMockExtensionContext());
      expect(vscode.commands.registerCommand).toHaveBeenCalledWith('devboard.notes.refresh', expect.any(Function));
    });

    it('registers devboard.notes.add command', () => {
      registerNotesView(createMockExtensionContext());

      expect(vscode.commands.registerCommand).toHaveBeenCalledWith('devboard.notes.add', expect.any(Function));
    });
  });

  describe('invoking commands commands', () => {
    it('calls provider refresh when refresh command is invoked', async () => {
      const mockContext = createMockExtensionContext();
      registerNotesView(mockContext);

      const refreshCommandCall = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
        call => call[0] === 'devboard.notes.refresh',
      );
      expect(refreshCommandCall).toBeDefined();

      const refreshCallback = refreshCommandCall[1];

      await refreshCallback();

      expect(mockProvider.refresh).toHaveBeenCalledWith(true);
    });

    it('calls provider createNote when add command is invoked', async () => {
      const mockContext = createMockExtensionContext();
      registerNotesView(mockContext);

      const addCommandCall = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
        call => call[0] === 'devboard.notes.add',
      );
      expect(addCommandCall).toBeDefined();

      const addCallback = addCommandCall[1];

      await addCallback();

      expect(mockProvider.createNewNote).toHaveBeenCalled();
    });

    it('calls provider deleteNote when delete command is invoked', async () => {
      const mockContext = createMockExtensionContext();
      registerNotesView(mockContext);

      const deleteCommandCall = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
        call => call[0] === 'devboard.notes.delete',
      );
      expect(deleteCommandCall).toBeDefined();

      const deleteCallback = deleteCommandCall[1];

      await deleteCallback();

      expect(mockProvider.deleteNote).toHaveBeenCalled();
    });
  });
});
