import { TodoProvider } from './todoProvider';
import { TodoScanner } from './todoScanner';
import { TodoFileItem, TodoItem } from './todoItem';

class MockTodoScanner extends TodoScanner {
  constructor(private mockTodos: CodeTodo[]) {
    super();
  }

  async scanWorkspace(): Promise<CodeTodo[]> {
    return this.mockTodos;
  }
}

describe('TodoProvider', () => {
  const mockTodos: CodeTodo[] = [
    {
      id: '1',
      type: 'TODO',
      text: 'test todo',
      file: '/path/to/file.ts',
      line: 0,
      relativePath: 'file.ts',
    },
    {
      id: '2',
      type: 'FIXME',
      text: 'fix this',
      file: '/path/to/another.ts',
      line: 5,
      relativePath: 'another.ts',
    },
  ];

  it('refreshes and groups by file', async () => {
    const provider = new TodoProvider();
    (provider as any).scanner = new MockTodoScanner(mockTodos);

    await provider.refresh(true);
    const roots = await provider.getChildren();

    expect(roots.length).toBe(2);
    expect(roots[0]).toBeInstanceOf(TodoFileItem);
  });

  it('returns todos under a file item', async () => {
    const provider = new TodoProvider();
    (provider as any).scanner = new MockTodoScanner(mockTodos);

    await provider.refresh(true);
    const roots = (await provider.getChildren()) as TodoFileItem[];
    const firstFile = roots[0];
    const leaves = await provider.getChildren(firstFile);

    expect(leaves[0]).toBeInstanceOf(TodoItem);
    expect((leaves[0] as TodoItem).label).toBeDefined();
  });

  it('prevents concurrent refreshes', async () => {
    let scans = 0;
    class CountingScanner extends TodoScanner {
      async scanWorkspace(): Promise<CodeTodo[]> {
        scans += 1;
        return mockTodos;
      }
    }

    const provider = new TodoProvider();
    (provider as any).scanner = new CountingScanner();

    await Promise.all([provider.refresh(true), provider.refresh(true)]);
    expect(scans).toBe(1);
  });
});
