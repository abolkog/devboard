import { NotesProvider } from './notesProvider';

import { NoteItem } from './noteItem';

const mockGetNotes = jest.fn();

jest.mock('./notesManager', () => {
  return {
    NotesManager: {
      getInstance: jest.fn(() => ({
        getNotes: mockGetNotes,
      })),
    },
  };
});

describe('NotesProvider', () => {
  let provider: NotesProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new NotesProvider();
  });

  it('loads notes on first getChildren call', async () => {
    mockGetNotes.mockResolvedValue([
      { name: 'Note 1', path: '/note1.md' },
      { name: 'Note 2', path: '/note2.md' },
    ]);

    const children = await provider.getChildren();

    expect(mockGetNotes).toHaveBeenCalledTimes(1);
    expect(children).toHaveLength(2);
    expect(children[0]).toBeInstanceOf(NoteItem);
  });

  it('does not reload notes if already initialised', async () => {
    mockGetNotes.mockResolvedValue([]);

    await provider.getChildren();
    await provider.getChildren();

    expect(mockGetNotes).toHaveBeenCalledTimes(1);
  });

  it('forces refresh when force=true', async () => {
    mockGetNotes.mockResolvedValueOnce([{ name: 'Note 1', path: '/note1.md' }]);

    await provider.getChildren();

    mockGetNotes.mockResolvedValueOnce([{ name: 'Note 2', path: '/note2.md' }]);

    await provider.refresh(true);
    const children = await provider.getChildren();

    expect(mockGetNotes).toHaveBeenCalledTimes(2);
    expect(children[0].label).toBe('Note 2');
  });

  it('does nothing if refresh is called while loading', async () => {
    mockGetNotes.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve([]), 50)));

    const refresh1 = provider.refresh();
    const refresh2 = provider.refresh();

    await Promise.all([refresh1, refresh2]);

    expect(mockGetNotes).toHaveBeenCalledTimes(1);
  });
});
