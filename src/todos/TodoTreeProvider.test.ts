import { TodoTreeProvider } from './TodoTreeProvider';

import { TodoFileItem, TodoTreeItem } from './TodoTreeItem';

const mockScanner = {
  scanWorkspace: jest.fn(),
};

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

describe('TodoProvider', () => {
  let provider: TodoTreeProvider;

  beforeEach(() => {
    jest.clearAllMocks();

    provider = new TodoTreeProvider();
    (provider as any).scanner = mockScanner;
  });

  describe('refresh', () => {
    beforeEach(mockScanner.scanWorkspace.mockResolvedValue(mockTodos));
    it('should load todos on first refresh', async () => {
      await provider.refresh();
      expect(mockScanner.scanWorkspace).toHaveBeenCalled();
      expect((provider as any).initialized).toBe(true);
    });

    it('should not reload todos if already initialized without force', async () => {
      await provider.refresh();
      mockScanner.scanWorkspace.mockClear();
      await provider.refresh();
      expect(mockScanner.scanWorkspace).not.toHaveBeenCalled();
    });

    it('should reload todos with force flag', async () => {
      await provider.refresh();
      mockScanner.scanWorkspace.mockClear();
      await provider.refresh(true);
      expect(mockScanner.scanWorkspace).toHaveBeenCalled();
    });
  });

  describe('getChildren', () => {
    it('should return root todos', async () => {
      mockScanner.scanWorkspace.mockResolvedValue(mockTodos);

      const children = await provider.getChildren();

      expect(children).toHaveLength(2);
    });

    it('returns todos under a file item', async () => {
      await provider.refresh(true);
      const roots = (await provider.getChildren()) as TodoFileItem[];
      const firstFile = roots[0];
      const leaves = await provider.getChildren(firstFile);

      expect(leaves[0]).toBeInstanceOf(TodoTreeItem);
      expect((leaves[0] as TodoTreeItem).label).toBeDefined();
    });
  });

  describe('getTreeItem', () => {
    it('should return the same tree item', () => {
      const taskItem = new TodoTreeItem(mockTodos[0]);

      const result = provider.getTreeItem(taskItem);

      expect(result).toBe(taskItem);
    });
  });
});
