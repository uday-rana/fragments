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
  // Clear the in-memory databases before each test
  beforeEach(() => {
    clear();
  });

  describe('happy paths', () => {
    test('writeFragment() returns nothing', async () => {
      const fragment = { ownerId: 'a', id: 'a', someMetadata: true };
      const result = await writeFragment(fragment);
      expect(result).toBeUndefined();
    });

    test('writeFragmentData() returns nothing', async () => {
      const result = await writeFragmentData('a', 'a', { someData: true });
      expect(result).toBeUndefined();
    });

    test('readFragment() returns fragment passed to writeFragment()', async () => {
      const fragment = { ownerId: 'a', id: 'a', someMetadata: true };
      await writeFragment(fragment);
      const result = await readFragment('a', 'a');
      expect(result).toBe(fragment);
    });

    test('readFragmentData() returns fragment data passed to writeFragmentData()', async () => {
      const fragmentData = { someData: true };
      await writeFragmentData('a', 'a', fragmentData);
      const result = await readFragmentData('a', 'a');
      expect(result).toBe(fragmentData);
    });

    test('writeFragmentData() and readFragmentData() work with Buffers', async () => {
      const fragmentDataBuffer = Buffer.from('fragmentData');
      await writeFragmentData('a', 'a', fragmentDataBuffer);
      const result = await readFragmentData('a', 'a');
      expect(result).toBe(fragmentDataBuffer);
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
      const fragment = { ownerId: 'a', id: 'a', someMetadata: true };
      await writeFragment(fragment);
      await writeFragmentData(fragment.ownerId, fragment.id, 'hello');

      expect(await deleteFragment('a', 'a')).toStrictEqual([undefined, undefined]);
    });

    test('readFragment() and readFragmentData() return undefined for deleted fragments', async () => {
      const fragment = { ownerId: 'a', id: 'a', someMetadata: true };
      const fragmentData = { someData: true };
      await writeFragment(fragment);
      await writeFragmentData('a', 'a', fragmentData);
      await deleteFragment('a', 'a');
      expect(await readFragment('a', 'a')).toBeUndefined();
      expect(await readFragmentData('a', 'a')).toBeUndefined();
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
      const result = await readFragment('a', 'a');
      expect(result).toBeUndefined();
    });

    test('readFragmentData() returns undefined if primary key not in db', async () => {
      const result = await readFragmentData('a', 'a');
      expect(result).toBeUndefined();
    });

    test('listFragments() returns empty array if primary key not in db', async () => {
      const result = await listFragments('a');
      expect(result).toStrictEqual([]);
    });

    test('deleteFragment() throws if primary key not in db', async () => {
      expect(async () => {
        await deleteFragment('a', 'a');
      }).rejects.toThrow();
    });
  });

  describe('primary key in db but not secondary key', () => {
    test('readFragment() returns undefined if secondary key not in db', async () => {
      const result = await readFragment('a', 'a');
      expect(result).toBeUndefined();
    });

    test('readFragmentData() returns undefined if secondary key not in db', async () => {
      const result = await readFragmentData('a', 'a');
      expect(result).toBeUndefined();
    });

    test('deleteFragment() throws if secondary key not in db', async () => {
      expect(async () => {
        await deleteFragment('a', 'a');
      }).rejects.toThrow();
    });
  });

  describe('storing metadata but not data', () => {
    test('deleteFragment() should throw if no fragment data exists', async () => {
      const fragment = { ownerId: 'a', id: 'a', someMetadata: true };
      await writeFragment(fragment);

      await expect(async () => {
        await deleteFragment('a', 'a');
      }).rejects.toThrow();
    });
  });

  describe('passing same keys to write functions twice', () => {
    test('writeFragment() overwrites previous values given same keys', async () => {
      const fragment1 = { ownerId: 'a', id: 'a', someMetadata: true };
      const fragment2 = { ownerId: 'a', id: 'a', someMetadata: false };
      await writeFragment(fragment1);
      await writeFragment(fragment2);
      const result = await readFragment('a', 'a');
      expect(result).not.toStrictEqual(fragment1);
      expect(result).toStrictEqual(fragment2);
    });

    test('writeFragmentData() overwrites previous values given same keys', async () => {
      const fragmentData1 = { someData: true };
      const fragmentData2 = { someData: false };
      await writeFragmentData('a', 'a', fragmentData1);
      await writeFragmentData('a', 'a', fragmentData2);
      const result = await readFragmentData('a', 'a');
      expect(result).not.toStrictEqual(fragmentData1);
      expect(result).toStrictEqual(fragmentData2);
    });
  });
});
