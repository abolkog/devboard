import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { TodoScanner } from './todoScanner';

describe('TodoScanner', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-scanner-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('finds TODO comments in TypeScript files', async () => {
    const testFile = path.join(testDir, 'test.ts');
    fs.writeFileSync(testFile, 'const x = 1; // TODO: fix this\nconst y = 2;');

    const scanner = new TodoScanner();
    const todos = await (scanner as any).scanFolder(testDir);

    expect(todos).toHaveLength(1);
    expect(todos[0].type).toBe('TODO');
    expect(todos[0].text).toBe('fix this');
    expect(todos[0].line).toBe(0);
  });

  it('finds FIXME comments in JavaScript files', async () => {
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
});
