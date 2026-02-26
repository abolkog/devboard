import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class TodoScanner {
  private readonly defaultIgnoredFolders = ['node_modules', 'dist', 'out'];

  async scanWorkspace(): Promise<CodeTodo[]> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      return [];
    }

    const todos: CodeTodo[] = [];

    for (const folder of workspaceFolders) {
      const folderTodos = await this.scanFolder(folder.uri.fsPath);
      todos.push(...folderTodos);
    }

    return todos;
  }

  private async scanFolder(folderPath: string): Promise<CodeTodo[]> {
    const todos: CodeTodo[] = [];
    const ignoredFolders = new Set(this.getIgnoredFolders());
    const ignoredExtensions = new Set(this.getIgnoredExtensions());

    const walkDir = (dir: string) => {
      try {
        const files = fs.readdirSync(dir);

        for (const file of files) {
          if (file.startsWith('.') || ignoredFolders.has(file)) {
            continue;
          }

          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);

          if (stat.isDirectory()) {
            walkDir(filePath);
          } else if (this.isCodeFile(filePath, ignoredExtensions)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.split('\n');

            lines.forEach((line, index) => {
              let match;
              const regex = /(TODO|FIXME):\s*(.*?)(?=(?:TODO|FIXME):|$)/g;
              while ((match = regex.exec(line)) !== null) {
                todos.push({
                  id: `${filePath}:${index}:${match.index}`,
                  type: match[1] as 'TODO' | 'FIXME',
                  text: match[2].trim(),
                  file: filePath,
                  line: index,
                  relativePath: path.relative(folderPath, filePath),
                });
              }
            });
          }
        }
      } catch {
        // Skip directories we can't read
      }
    };

    walkDir(folderPath);
    return todos;
  }

  private isCodeFile(filePath: string, ignoredExtensions: Set<string>): boolean {
    const extension = path.extname(filePath).toLowerCase();
    if (ignoredExtensions.has(extension)) {
      return false;
    }

    const codeExtensions = [
      '.ts',
      '.tsx',
      '.js',
      '.jsx',
      '.py',
      '.java',
      '.cpp',
      '.c',
      '.cs',
      '.go',
      '.rs',
      '.php',
      '.rb',
      '.swift',
    ];

    return codeExtensions.includes(extension);
  }

  private getIgnoredFolders(): string[] {
    const configured = vscode.workspace.getConfiguration('devhq.todo').get<string[]>('excludeFolders', []);

    return [...new Set([...this.defaultIgnoredFolders, ...configured])];
  }

  private getIgnoredExtensions(): string[] {
    const configured = vscode.workspace.getConfiguration('devhq.todo').get<string[]>('excludeExtensions', []);

    return configured.map(ext => (ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`));
  }
}
