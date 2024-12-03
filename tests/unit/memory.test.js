const hash = require('../../src/hash');
const {
  writeFragment,
  writeFragmentData,
  readFragment,
  readFragmentData,
  listFragments,
  deleteFragment,
  clear,
} = require('../../src/model/data/memory/index');

describe('fragment memory-db functions', () => {
  const testFragmentData = Buffer.from('hello');
  const testFragment = {
    ownerId: hash('user1@email.com'),
    id: 'a',
    type: 'text/plain',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    size: 5,
  };

  // Clear the in-memory databases before each test
  beforeEach(() => {
    clear();
  });

  describe('happy paths', () => {
    test('writeFragment() returns nothing', async () => {
      const result = await writeFragment(testFragment);
      expect(result).toBeUndefined();
    });

    test('writeFragmentData() returns nothing', async () => {
      const result = await writeFragmentData(
        testFragment.ownerId,
        testFragment.id,
        testFragmentData
      );
      expect(result).toBeUndefined();
    });

    test('readFragment() returns fragment passed to writeFragment()', async () => {
      await writeFragment(testFragment);
      const result = await readFragment(testFragment.ownerId, testFragment.id);
      expect(result).toBe(testFragment);
    });

    test('readFragmentData() returns fragment data passed to writeFragmentData()', async () => {
      await writeFragmentData(testFragment.ownerId, testFragment.id, testFragmentData);
      const result = await readFragmentData(testFragment.ownerId, testFragment.id);
      expect(result).toBe(testFragmentData);
    });

    test('listFragments() lists all fragments for an ownerId', async () => {
      const fragments = [
        { ownerId: 'a', id: 'a', someMetadata: true },
        { ownerId: 'a', id: 'b', someMetadata: false },
        { ownerId: 'a', id: 'c', someMetadata: false },
      ];
      for (const fragment of fragments) {
        await writeFragment(fragment);
      }
      expect(await listFragments('a')).toStrictEqual(['a', 'b', 'c']);
      expect(await listFragments('a', true)).toStrictEqual(fragments);
    });

    test('deleteFragment() returns [undefined, undefined]', async () => {
      await writeFragment(testFragment);
      await writeFragmentData(testFragment.ownerId, testFragment.id, testFragmentData);

      expect(await deleteFragment(testFragment.ownerId, testFragment.id)).toStrictEqual([
        undefined,
        undefined,
      ]);
    });

    test('readFragment() and readFragmentData() return undefined for deleted fragments', async () => {
      await writeFragment(testFragment);
      await writeFragmentData(testFragment.ownerId, testFragment.id, testFragmentData);
      await deleteFragment(testFragment.ownerId, testFragment.id);
      expect(await readFragment(testFragment.ownerId, testFragment.id)).toBeUndefined();
      expect(await readFragmentData(testFragment.ownerId, testFragment.id)).toBeUndefined();
    });
  });

  describe('passing non-string keys', () => {
    test('writeFragment() throws on non-string keys', async () => {
      expect(async () => {
        await writeFragment();
      }).rejects.toThrow();

      expect(async () => {
        await writeFragment(1);
      }).rejects.toThrow();

      expect(async () => {
        await writeFragment(1, 1);
      }).rejects.toThrow();
    });

    test('writeFragmentData() throws on non-string keys', async () => {
      expect(async () => {
        await writeFragmentData();
      }).rejects.toThrow();

      expect(async () => {
        await writeFragmentData(1);
      }).rejects.toThrow();

      expect(async () => {
        await writeFragmentData(1, 1);
      }).rejects.toThrow();
    });

    test('readFragment() throws on non-string keys', async () => {
      expect(async () => {
        await readFragment();
      }).rejects.toThrow();

      expect(async () => {
        await readFragment(1);
      }).rejects.toThrow();

      expect(async () => {
        await readFragment(1, 1);
      }).rejects.toThrow();
    });

    test('readFragmentData() throws on non-string keys', async () => {
      expect(async () => {
        await readFragmentData();
      }).rejects.toThrow();

      expect(async () => {
        await readFragmentData(1);
      }).rejects.toThrow();

      expect(async () => {
        await readFragmentData(1, 1);
      }).rejects.toThrow();
    });

    test('listFragments() throws on non-string keys', async () => {
      expect(async () => {
        await listFragments(1);
      }).rejects.toThrow();
      expect(async () => {
        await listFragments(1, true);
      }).rejects.toThrow();
    });

    test('deleteFragment() throws on non-string keys', async () => {
      expect(async () => {
        await deleteFragment(1);
      }).rejects.toThrow();
      expect(async () => {
        await deleteFragment(1, 1);
      }).rejects.toThrow();
    });
  });

  describe('primary key not in db', () => {
    test('readFragment() returns undefined if primary key not in db', async () => {
      const result = await readFragment(testFragment.ownerId, testFragment.id);
      expect(result).toBeUndefined();
    });

    test('readFragmentData() returns undefined if primary key not in db', async () => {
      const result = await readFragmentData(testFragment.ownerId, testFragment.id);
      expect(result).toBeUndefined();
    });

    test('listFragments() returns empty array if primary key not in db', async () => {
      const result = await listFragments(testFragment.ownerId);
      expect(result).toStrictEqual([]);
    });

    test('deleteFragment() throws if primary key not in db', async () => {
      expect(async () => {
        await deleteFragment(testFragment.ownerId, testFragment.id);
      }).rejects.toThrow();
    });
  });

  describe('primary key in db but not secondary key', () => {
    test('readFragment() returns undefined if secondary key not in db', async () => {
      await writeFragment(testFragment);
      await writeFragmentData(testFragment.ownerId, testFragment.id, testFragmentData);
      const result = await readFragment(testFragment.ownerId, 'notARealFragment');
      expect(result).toBeUndefined();
    });

    test('readFragmentData() returns undefined if secondary key not in db', async () => {
      await writeFragment(testFragment);
      await writeFragmentData(testFragment.ownerId, testFragment.id, testFragmentData);
      const result = await readFragmentData(testFragment.ownerId, 'notARealFragment');
      expect(result).toBeUndefined();
    });

    test('deleteFragment() throws if secondary key not in db', async () => {
      await writeFragment(testFragment);
      await writeFragmentData(testFragment.ownerId, testFragment.id, testFragmentData);
      expect(async () => {
        await deleteFragment(testFragment.ownerId, 'notARealFragment');
      }).rejects.toThrow();
    });
  });

  describe('storing metadata but not data', () => {
    test('deleteFragment() should throw if no fragment data exists', async () => {
      await writeFragment(testFragment);

      await expect(async () => {
        await deleteFragment(testFragment.ownerId, 'a');
      }).rejects.toThrow();
    });
  });

  describe('passing same keys to write functions twice', () => {
    test('writeFragment() overwrites previous values given same keys', async () => {
      await writeFragment(testFragment);

      const newFragment = {
        ownerId: testFragment.ownerId,
        id: testFragment.id,
        updated: new Date().toISOString(),
      };
      await writeFragment(newFragment);

      const result = await readFragment(newFragment.ownerId, testFragment.id);

      expect(result).not.toStrictEqual(testFragment);
      expect(result).toStrictEqual(newFragment);
    });

    test('writeFragmentData() overwrites previous values given same keys', async () => {
      await writeFragment(testFragment);
      await writeFragmentData(testFragment.ownerId, testFragment.id, testFragmentData);

      const newFragmentData = Buffer.from('Goodbye');

      await writeFragmentData(testFragment.ownerId, testFragment.id, newFragmentData);

      const result = await readFragmentData(testFragment.ownerId, testFragment.id);

      expect(result).not.toStrictEqual(testFragmentData);
      expect(result).toStrictEqual(newFragmentData);
    });
  });
});
