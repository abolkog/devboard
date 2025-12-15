import * as vscode from 'vscode';
import { handleAddNewNoteCommand, handleDeleteNoteCommand } from './notesCommandsHandler';
import { NotesProvider } from './notesProvider';

const mockCreateNote = jest.fn();
const mockDeleteNote = jest.fn();

jest.mock('./notesProvider');
jest.mock('./notesManager', () => {
  return {
    NotesManager: {
      getInstance: jest.fn(() => ({
        getNotes: jest.fn(),
        createNote: mockCreateNote,
        deleteNote: mockDeleteNote,
      })),
    },
  };
});

describe('notesCommandsHandler', () => {
  let mockProvider: jest.Mocked<NotesProvider>;

  beforeEach(() => {
    mockProvider = {
      refresh: jest.fn().mockResolvedValue(undefined),
    } as any;
  });

  describe('handleAddNewNoteCommand', () => {
    it('should create a note when user provides valid title', async () => {
      (vscode.window.showInputBox as jest.Mock).mockResolvedValue('meeting notes');
      await handleAddNewNoteCommand(mockProvider);

      expect(mockCreateNote).toHaveBeenCalledWith('meeting notes');
      expect(mockProvider.refresh).toHaveBeenCalledWith(true);
    });

    it('should not create a note when user cancels input', async () => {
      (vscode.window.showInputBox as jest.Mock).mockResolvedValue(undefined);

      await handleAddNewNoteCommand(mockProvider);

      expect(mockCreateNote).not.toHaveBeenCalled();
      expect(mockProvider.refresh).not.toHaveBeenCalled();
    });

    it('should reject empty title input', async () => {
      (vscode.window.showInputBox as jest.Mock).mockImplementation(({ validateInput }) => {
        return Promise.resolve(validateInput('') === undefined ? 'Valid' : undefined);
      });

      await handleAddNewNoteCommand(mockProvider);

      expect(mockCreateNote).not.toHaveBeenCalled();
    });
  });

  describe('handleDeleteNoteCommand', () => {
    it('should delete note when user confirms', async () => {
      const mockItem = {
        label: 'Test Note',
        command: { arguments: [{ fsPath: '/path/to/note.md' }] },
      } as any;
      (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue('Delete');

      await handleDeleteNoteCommand(mockProvider, mockItem);

      expect(mockDeleteNote).toHaveBeenCalledWith('/path/to/note.md');
      expect(mockProvider.refresh).toHaveBeenCalledWith(true);
    });

    it('should not delete note when user cancels', async () => {
      const mockItem = {
        label: 'Test Note',
        command: { arguments: [{ fsPath: '/path/to/note.md' }] },
      } as any;
      (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue(undefined);

      await handleDeleteNoteCommand(mockProvider, mockItem);

      expect(mockDeleteNote).not.toHaveBeenCalled();
    });

    it('should return early if item has no file path', async () => {
      const mockItem = { label: 'Test Note', command: {} } as any;

      await handleDeleteNoteCommand(mockProvider, mockItem);

      expect(mockDeleteNote).not.toHaveBeenCalled();
      expect(mockProvider.refresh).not.toHaveBeenCalled();
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

      await handleDeleteNoteCommand(mockProvider, mockItem);

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('Failed to delete note');
    });
  });
});
