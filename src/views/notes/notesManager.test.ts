import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { NotesManager } from './notesManager';

jest.mock('fs');
jest.mock('path');
jest.mock('os');

const mockHomeDir = '/mock/home';
const mockNotesDir = '/mock/home/Documents/DevBoard-Notes';

describe('NotesManager', () => {
  let notesManager: NotesManager;

  beforeEach(() => {
    (NotesManager as any).instance = undefined;

    require('os').homedir = jest.fn(() => mockHomeDir);
    (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
    (fs.existsSync as jest.Mock).mockReturnValue(true);

    notesManager = NotesManager.getInstance();
  });

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const instance1 = NotesManager.getInstance();
      const instance2 = NotesManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('constructor', () => {
    it('should create notes directory if it does not exist', () => {
      (NotesManager as any).instance = undefined;
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      NotesManager.getInstance();

      expect(fs.mkdirSync).toHaveBeenCalledWith(mockNotesDir, { recursive: true });
    });

    it('should not create notes directory if it exists', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });
  });

  describe('getNotes', () => {
    it('should return list of markdown notes', () => {
      (fs.readdirSync as jest.Mock).mockReturnValue(['note1.md', 'note2.md', 'file.txt']);

      const notes = notesManager.getNotes();

      expect(notes).toEqual([
        { name: 'note1', path: `${mockNotesDir}/note1.md` },
        { name: 'note2', path: `${mockNotesDir}/note2.md` },
      ]);
    });

    it('should return empty array if directory read fails', () => {
      (fs.readdirSync as jest.Mock).mockImplementation(() => {
        throw new Error('Read error');
      });

      const notes = notesManager.getNotes();

      expect(notes).toEqual([]);
    });
  });

  describe('openNote', () => {
    it('should open note in vscode', async () => {
      const mockDoc = {};

      (vscode.workspace.openTextDocument as jest.Mock).mockResolvedValue(mockDoc);

      await notesManager.openNote('/path/to/note.md');

      expect(vscode.workspace.openTextDocument).toHaveBeenCalledWith('/path/to/note.md');
      expect(vscode.window.showTextDocument).toHaveBeenCalledWith(mockDoc);
    });
  });

  describe('createNote', () => {
    it('should create and open new note', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await notesManager.createNote('My Note');

      expect(fs.writeFileSync).toHaveBeenCalledWith(`${mockNotesDir}/My Note.md`, '# My Note\n\n');
    });

    it('should sanitize note title', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await notesManager.createNote('My/Note:Title*');

      expect(fs.writeFileSync).toHaveBeenCalledWith(`${mockNotesDir}/MyNoteTitle.md`, '# My/Note:Title*\n\n');
    });

    it('should not overwrite existing note', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      await notesManager.createNote('Existing Note');

      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe('getNotesDir', () => {
    it('should return notes directory path', () => {
      expect(notesManager.getNotesDir()).toBe(mockNotesDir);
    });
  });
});
