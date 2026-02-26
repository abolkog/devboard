import * as vscode from 'vscode';
import { NotesTreeProvider } from './NotesTreeProvider';
import { NoteTreeItem } from './NoteTreeItem';

jest.mock('vscode');

const mockNotesManager = {
  getNotes: jest.fn(),
  createNote: jest.fn(),
  deleteNote: jest.fn(),
  renameNote: jest.fn(),
  openNote: jest.fn(),
  getNotesDir: jest.fn(),
};

const mockNotes = [
  { name: 'note 1', path: '/path/to/note1.md' },
  { name: 'note 2', path: '/path/to/note2.md' },
  { name: 'note 3', path: '/path/to/note3.md' },
];

describe('NotesProvider', () => {
  let provider: NotesTreeProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    (vscode.workspace as any).getConfiguration = jest.fn(() => ({
      get: jest.fn((_key: string, defaultValue: unknown) => defaultValue),
    }));
    (vscode.commands as any).executeCommand = jest.fn();
    provider = new NotesTreeProvider();
    (provider as any).notesManager = mockNotesManager;
  });

  describe('refresh', () => {
    it('should load notes on first refresh', async () => {
      await provider.refresh();
      expect(mockNotesManager.getNotes).toHaveBeenCalled();
      expect((provider as any).initialized).toBe(true);
    });

    it('should not reload notes if already initialized without force', async () => {
      await provider.refresh();
      mockNotesManager.getNotes.mockClear();
      await provider.refresh();
      expect(mockNotesManager.getNotes).not.toHaveBeenCalled();
    });

    it('should reload notes with force flag', async () => {
      await provider.refresh();
      mockNotesManager.getNotes.mockClear();
      await provider.refresh(true);
      expect(mockNotesManager.getNotes).toHaveBeenCalled();
    });

    it('should not reload if already loading', async () => {
      mockNotesManager.getNotes.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      provider.refresh();
      await provider.refresh();

      expect(mockNotesManager.getNotes).toHaveBeenCalledTimes(1);
    });
  });

  describe('getChildren', () => {
    it('should return notes', async () => {
      mockNotesManager.getNotes.mockResolvedValue(mockNotes);

      const children = await provider.getChildren();

      expect(children).toHaveLength(3);
      expect(children[0].label).toBe('note 1');
    });
  });

  describe('getTreeItem', () => {
    it('should return the same tree item', () => {
      const taskItem = new NoteTreeItem(mockNotes[0]);

      const result = provider.getTreeItem(taskItem);

      expect(result).toBe(taskItem);
    });
  });

  describe('createNewNote', () => {
    it('should reject empty title input', async () => {
      (vscode.window.showInputBox as jest.Mock).mockImplementation(({ validateInput }) => {
        return Promise.resolve(validateInput('') === undefined ? 'Valid' : undefined);
      });

      await provider.createNewNote();

      expect(mockNotesManager.createNote).not.toHaveBeenCalled();
    });

    it('should create a note when user provides valid title', async () => {
      (vscode.window.showInputBox as jest.Mock).mockResolvedValue('meeting notes');

      await provider.createNewNote();

      expect(mockNotesManager.getNotes).toHaveBeenCalledTimes(1);
      expect(mockNotesManager.createNote).toHaveBeenCalledTimes(1);
    });

    it('should not create a note when user cancels input', async () => {
      (vscode.window.showInputBox as jest.Mock).mockResolvedValue(undefined);

      await provider.createNewNote();

      expect(mockNotesManager.createNote).not.toHaveBeenCalled();
    });

    it('should show error message on create failure', async () => {
      (vscode.window.showInputBox as jest.Mock).mockResolvedValue('meeting notes');

      mockNotesManager.createNote.mockImplementation(() => {
        throw new Error('Create failed');
      });

      await provider.createNewNote();

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('Failed to create note');
    });
  });

  describe('deleteNote', () => {
    it('should delete note when user confirms', async () => {
      const mockItem = {
        label: 'Test Note',
        command: { arguments: [{ fsPath: '/path/to/note.md' }] },
      } as any;
      (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue('Delete');

      await provider.deleteNote(mockItem);

      expect(mockNotesManager.deleteNote).toHaveBeenCalledWith('/path/to/note.md');
    });

    it('should not delete note when user cancels', async () => {
      const mockItem = {
        label: 'Test Note',
        command: { arguments: [{ fsPath: '/path/to/note.md' }] },
      } as any;
      (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue(undefined);

      await provider.deleteNote(mockItem);

      expect(mockNotesManager.deleteNote).not.toHaveBeenCalled();
    });

    it('should return early if item has no file path', async () => {
      const mockItem = { label: 'Test Note', command: {} } as any;

      await provider.deleteNote(mockItem);

      expect(mockNotesManager.deleteNote).not.toHaveBeenCalled();
    });

    it('should show error message on delete failure', async () => {
      const mockItem = {
        label: 'Test Note',
        command: { arguments: [{ fsPath: '/path/to/note.md' }] },
      } as any;
      (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue('Delete');
      mockNotesManager.deleteNote.mockImplementation(() => {
        throw new Error('Delete failed');
      });

      await provider.deleteNote(mockItem);

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('Failed to delete note');
    });
  });

  describe('renameNote', () => {
    it('should rename and open note when user provides a new title', async () => {
      const mockItem = {
        label: 'Old Name',
        command: { arguments: [{ fsPath: '/path/to/old.md' }] },
      } as any;

      (vscode.window.showInputBox as jest.Mock).mockResolvedValue('New Name');
      mockNotesManager.renameNote.mockReturnValue('/path/to/New Name.md');

      await provider.renameNote(mockItem);

      expect(mockNotesManager.renameNote).toHaveBeenCalledWith('/path/to/old.md', 'New Name');
      expect(mockNotesManager.openNote).toHaveBeenCalledWith('/path/to/New Name.md');
    });

    it('returns early when selected item has no path', async () => {
      const mockItem = {
        label: 'Old Name',
        command: {},
      } as any;

      await provider.renameNote(mockItem);

      expect(mockNotesManager.renameNote).not.toHaveBeenCalled();
    });
  });

  describe('openNotesFolder', () => {
    it('opens notes folder in OS', async () => {
      mockNotesManager.getNotesDir.mockReturnValue('/notes/path');

      await provider.openNotesFolder();

      expect(vscode.commands.executeCommand).toHaveBeenCalledWith('revealFileInOS', { fsPath: '/notes/path' });
    });
  });
});
