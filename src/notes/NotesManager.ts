import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class NotesManager {
  private static instance: NotesManager;

  public static getInstance() {
    if (!this.instance) {
      this.instance = new NotesManager();
    }

    return this.instance;
  }

  private constructor() {
    this.ensureNotesDir();
  }

  private resolveNotesDir(): string {
    const configured = vscode.workspace.getConfiguration('devhq.notes').get<string>('folder', '').trim();

    if (configured) {
      return path.resolve(configured);
    }

    const homeDir = require('os').homedir();
    return path.join(homeDir, 'Documents', 'DevHQ-Notes');
  }

  private ensureNotesDir() {
    const notesDir = this.resolveNotesDir();
    if (!fs.existsSync(notesDir)) {
      fs.mkdirSync(notesDir, { recursive: true });
    }
  }

  getNotes(): Note[] {
    try {
      const notesDir = this.resolveNotesDir();
      const files = fs.readdirSync(notesDir);
      return files
        .filter(f => f.endsWith('.md'))
        .map(f => ({
          name: f.replace('.md', ''),
          path: path.join(notesDir, f),
        }));
    } catch {
      return [];
    }
  }

  async openNote(notePath: string): Promise<void> {
    const doc = await vscode.workspace.openTextDocument(notePath);
    await vscode.window.showTextDocument(doc);
  }

  async createNote(title: string): Promise<void> {
    const notesDir = this.resolveNotesDir();
    const cleanTitle = title
      .trim()
      .replace(/[\\/:"*?<>|]+/g, '')
      .replace(/\s+/g, ' ');

    const filePath = path.join(notesDir, `${cleanTitle}.md`);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, `# ${title}\n\n`);
    }
    await this.openNote(filePath);
  }

  deleteNote(filePath: string) {
    fs.unlinkSync(filePath);
  }

  renameNote(filePath: string, newTitle: string) {
    const cleanTitle = newTitle
      .trim()
      .replace(/[\\/:"*?<>|]+/g, '')
      .replace(/\s+/g, ' ');

    const targetPath = path.join(this.resolveNotesDir(), `${cleanTitle}.md`);
    fs.renameSync(filePath, targetPath);

    return targetPath;
  }

  getNotesDir(): string {
    return this.resolveNotesDir();
  }
}
