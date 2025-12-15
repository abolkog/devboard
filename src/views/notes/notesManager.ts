import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class NotesManager {
  private notesDir: string;

  private static instance: NotesManager;

  public static getInstance() {
    if (!this.instance) {
      this.instance = new NotesManager();
    }

    return this.instance;
  }

  private constructor() {
    const homeDir = require('os').homedir();
    this.notesDir = path.join(homeDir, 'Documents', 'DevBoard-Notes');
    this.ensureNotesDir();
  }

  private ensureNotesDir() {
    if (!fs.existsSync(this.notesDir)) {
      fs.mkdirSync(this.notesDir, { recursive: true });
    }
  }

  getNotes(): Note[] {
    try {
      const files = fs.readdirSync(this.notesDir);
      return files
        .filter(f => f.endsWith('.md'))
        .map(f => ({
          name: f.replace('.md', ''),
          path: path.join(this.notesDir, f),
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
    const cleanTitle = title
      .trim()
      .replace(/[\\/:"*?<>|]+/g, '')
      .replace(/\s+/g, ' ');

    const filePath = path.join(this.notesDir, `${cleanTitle}.md`);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, `# ${title}\n\n`);
    }
    await this.openNote(filePath);
  }

  getNotesDir(): string {
    return this.notesDir;
  }
}
