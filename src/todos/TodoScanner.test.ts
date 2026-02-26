import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as vscode from 'vscode';
import { TodoScanner } from './TodoScanner';

jest.mock('vscode');

describe('TodoScanner', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-scanner-test-'));
    (vscode.workspace as any).getConfiguration = jest.fn();
    (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({
      get: jest.fn((_key: string, defaultValue: unknown) => defaultValue),
    });
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('finds TODO comments in files', async () => {
    const testFile = path.join(testDir, 'test.ts');
    fs.writeFileSync(testFile, 'const x = 1; // TODO: fix this\nconst y = 2;');

    const scanner = new TodoScanner();
    const todos = await (scanner as any).scanFolder(testDir);

    expect(todos).toHaveLength(1);
    expect(todos[0].type).toBe('TODO');
    expect(todos[0].text).toBe('fix this');
    expect(todos[0].line).toBe(0);
  });

  it('finds FIXME comments in files', async () => {
    const testFile = path.join(testDir, 'test.js');
    fs.writeFileSync(testFile, 'const x = 1; // FIXME: broken code\nconst y = 2;');

    const scanner = new TodoScanner();
    const todos = await (scanner as any).scanFolder(testDir);

    expect(todos).toHaveLength(1);
    expect(todos[0].type).toBe('FIXME');
    expect(todos[0].text).toBe('broken code');
  });

  it('finds multiple todos in same file', async () => {
    const testFile = path.join(testDir, 'test.ts');
    fs.writeFileSync(
      testFile,
      'const x = 1; // TODO: first\nconst y = 2; // FIXME: second\nconst z = 3; // TODO: third',
    );

    const scanner = new TodoScanner();
    const todos = await (scanner as any).scanFolder(testDir);

    expect(todos).toHaveLength(3);
    expect(todos[0].type).toBe('TODO');
    expect(todos[1].type).toBe('FIXME');
    expect(todos[2].type).toBe('TODO');
  });

  it('creates unique IDs for multiple matches on the same line', async () => {
    const testFile = path.join(testDir, 'test.ts');
    fs.writeFileSync(testFile, '// TODO: first TODO: second');

    const scanner = new TodoScanner();
    const todos = await (scanner as any).scanFolder(testDir);

    expect(todos).toHaveLength(2);
    expect(todos[0].id).not.toBe(todos[1].id);
  });

  it('ignores configured folders and extensions', async () => {
    const ignoredFolder = path.join(testDir, 'generated');
    const includedFolder = path.join(testDir, 'src');
    fs.mkdirSync(ignoredFolder, { recursive: true });
    fs.mkdirSync(includedFolder, { recursive: true });

    fs.writeFileSync(path.join(ignoredFolder, 'ignore.ts'), '// TODO: skip me');
    fs.writeFileSync(path.join(includedFolder, 'include.ts'), '// TODO: keep me');
    fs.writeFileSync(path.join(includedFolder, 'skip.js'), '// TODO: skip extension');

    (vscode.workspace.getConfiguration as jest.Mock).mockImplementation((section: string) => {
      if (section === 'devhq.todo') {
        return {
          get: jest.fn((key: string, defaultValue: unknown) => {
            if (key === 'excludeFolders') {
              return ['generated'];
            }
            if (key === 'excludeExtensions') {
              return ['.js'];
            }

            return defaultValue;
          }),
        };
      }

      return {
        get: jest.fn((_key: string, defaultValue: unknown) => defaultValue),
      };
    });

    const scanner = new TodoScanner();
    const todos = await (scanner as any).scanFolder(testDir);

    expect(todos).toHaveLength(1);
    expect(todos[0].file.endsWith('include.ts')).toBe(true);
  });
});
