import * as vscode from 'vscode';
import { NotesTreeProvider } from './NotesTreeProvider';
import { NoteTreeItem } from './NoteTreeItem';

const mockGetNotes = jest.fn();
const mockCreateNote = jest.fn();
const mockDeleteNote = jest.fn();

jest.mock('./NotesManager', () => {
  return {
    NotesManager: {
      getInstance: jest.fn(() => ({
        getNotes: mockGetNotes,
        createNote: mockCreateNote,
        deleteNote: mockDeleteNote,
      })),
    },
  };
});

describe('NotesProvider', () => {
  let provider: NotesTreeProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new NotesTreeProvider();
  });

  it('loads notes on first getChildren call', async () => {
    mockGetNotes.mockResolvedValue([
      { name: 'Note 1', path: '/note1.md' },
      { name: 'Note 2', path: '/note2.md' },
    ]);

    const children = await provider.getChildren();

    expect(mockGetNotes).toHaveBeenCalledTimes(1);
    expect(children).toHaveLength(2);
    expect(children[0]).toBeInstanceOf(NoteTreeItem);
  });

  it('does not reload notes if already initialised', async () => {
    mockGetNotes.mockResolvedValue([]);

    await provider.getChildren();
    await provider.getChildren();

    expect(mockGetNotes).toHaveBeenCalledTimes(1);
  });

  it('forces refresh when force=true', async () => {
    mockGetNotes.mockResolvedValueOnce([{ name: 'Note 1', path: '/note1.md' }]);

    await provider.getChildren();

    mockGetNotes.mockResolvedValueOnce([{ name: 'Note 2', path: '/note2.md' }]);

    await provider.refresh(true);
    const children = await provider.getChildren();

    expect(mockGetNotes).toHaveBeenCalledTimes(2);
    expect(children[0].label).toBe('Note 2');
  });

  it('does nothing if refresh is called while loading', async () => {
    mockGetNotes.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve([]), 50)));

    const refresh1 = provider.refresh();
    const refresh2 = provider.refresh();

    await Promise.all([refresh1, refresh2]);

    expect(mockGetNotes).toHaveBeenCalledTimes(1);
  });

  describe('create note', () => {
    it('should reject empty title input', async () => {
      (vscode.window.showInputBox as jest.Mock).mockImplementation(({ validateInput }) => {
        return Promise.resolve(validateInput('') === undefined ? 'Valid' : undefined);
      });

      await provider.createNewNote();

      expect(mockCreateNote).not.toHaveBeenCalled();
    });

    it('should create a note when user provides valid title', async () => {
      (vscode.window.showInputBox as jest.Mock).mockResolvedValue('meeting notes');

      await provider.createNewNote();

      expect(mockGetNotes).toHaveBeenCalledTimes(1);
      expect(mockCreateNote).toHaveBeenCalledTimes(1);
    });

    it('should not create a note when user cancels input', async () => {
      (vscode.window.showInputBox as jest.Mock).mockResolvedValue(undefined);

      await provider.createNewNote();

      expect(mockCreateNote).not.toHaveBeenCalled();
    });

    it('should show error message on create failure', async () => {
      (vscode.window.showInputBox as jest.Mock).mockResolvedValue('meeting notes');

      (mockCreateNote as jest.Mock).mockImplementation(() => {
        throw new Error('Create failed');
      });

      await provider.createNewNote();

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('Failed to create note');
    });
  });

  describe('delete note', () => {
    it('should delete note when user confirms', async () => {
      const mockItem = {
        label: 'Test Note',
        command: { arguments: [{ fsPath: '/path/to/note.md' }] },
      } as any;
      (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue('Delete');

      await provider.deleteNote(mockItem);

      expect(mockDeleteNote).toHaveBeenCalledWith('/path/to/note.md');
    });

    it('should not delete note when user cancels', async () => {
      const mockItem = {
        label: 'Test Note',
        command: { arguments: [{ fsPath: '/path/to/note.md' }] },
      } as any;
      (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue(undefined);

      await provider.deleteNote(mockItem);

      expect(mockDeleteNote).not.toHaveBeenCalled();
    });

    it('should return early if item has no file path', async () => {
      const mockItem = { label: 'Test Note', command: {} } as any;

      await provider.deleteNote(mockItem);

      expect(mockDeleteNote).not.toHaveBeenCalled();
    });

    it('should show error message on delete failure', async () => {
      const mockItem = {
        label: 'Test Note',
        command: { arguments: [{ fsPath: '/path/to/note.md' }] },
      } as any;
      (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue('Delete');
      (mockDeleteNote as jest.Mock).mockImplementation(() => {
        throw new Error('Delete failed');
      });

      await provider.deleteNote(mockItem);

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('Failed to delete note');
    });
  });
});
