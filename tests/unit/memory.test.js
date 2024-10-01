const {
  writeFragment,
  writeFragmentData,
  readFragment,
  readFragmentData,
  listFragments,
  deleteFragment,
} = require('../../src/model/data/memory/index');

describe('fragment memory-db functions', () => {
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
      const fragment = { ownerId: 'a', id: 'b', someMetadata: true };
      await writeFragment(fragment);
      const result = await readFragment('a', 'b');
      expect(result).toBe(fragment);
    });

    test('readFragmentData() returns fragment data passed to writeFragmentData()', async () => {
      const fragmentData = { someData: true };
      await writeFragmentData('a', 'b', fragmentData);
      const result = await readFragmentData('a', 'b');
      expect(result).toBe(fragmentData);
    });

    test('writeFragmentData() and readFragmentData() work with Buffers', async () => {
      const fragmentDataBuffer = Buffer.from('fragmentData');
      await writeFragmentData('a', 'c', fragmentDataBuffer);
      const result = await readFragmentData('a', 'c');
      expect(result).toBe(fragmentDataBuffer);
    });

    test('listFragments() lists all fragments for an ownerId', async () => {
      const fragments = [
        { ownerId: 'b', id: 'a', someMetadata: true },
        { ownerId: 'b', id: 'b', someMetadata: false },
        { ownerId: 'b', id: 'c', someMetadata: false },
      ];
      for (const fragment of fragments) {
        await writeFragment(fragment);
      }
      expect(await listFragments('b')).toStrictEqual(['a', 'b', 'c']);
      expect(await listFragments('b', true)).toStrictEqual(fragments);
    });

    test('deleteFragment() returns [undefined, undefined]', async () => {
      const fragment = { ownerId: 'a', id: 'c', someMetadata: true };
      await writeFragment(fragment);
      expect(await deleteFragment('a', 'c')).toStrictEqual([undefined, undefined]);
    });

    test('readFragment() and readFragmentData() return undefined for deleted fragments', async () => {
      const fragment = { ownerId: 'a', id: 'd', someMetadata: true };
      const fragmentData = { someData: true };
      await writeFragment(fragment);
      await writeFragmentData('a', 'd', fragmentData);
      await deleteFragment('a', 'd');
      expect(await readFragment('a', 'd')).toBeUndefined();
      expect(await readFragmentData('a', 'd')).toBeUndefined();
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
      const result = await readFragment('z', 'a');
      expect(result).toBeUndefined();
    });

    test('readFragmentData() returns undefined if primary key not in db', async () => {
      const result = await readFragmentData('z', 'a');
      expect(result).toBeUndefined();
    });

    test('listFragments() returns empty array if primary key not in db', async () => {
      const result = await listFragments('z');
      expect(result).toStrictEqual([]);
    });

    test('deleteFragment() throws if primary key not in db', async () => {
      expect(async () => {
        await deleteFragment('z', 'a');
      }).rejects.toThrow();
    });
  });

  describe('primary key in db but not secondary key', () => {
    test('readFragment() returns undefined if secondary key not in db', async () => {
      const result = await readFragment('a', 'e');
      expect(result).toBeUndefined();
    });

    test('readFragmentData() returns undefined if secondary key not in db', async () => {
      const result = await readFragmentData('a', 'e');
      expect(result).toBeUndefined();
    });

    test('deleteFragment() throws if secondary key not in db', async () => {
      expect(async () => {
        await deleteFragment('a', 'e');
      }).rejects.toThrow();
    });
  });

  describe('passing same keys to write functions twice', () => {
    test('writeFragment() overwrites previous values given same keys', async () => {
      const fragment1 = { ownerId: 'a', id: 'f', someMetadata: true };
      const fragment2 = { ownerId: 'a', id: 'f', someMetadata: false };
      await writeFragment(fragment1);
      await writeFragment(fragment2);
      const result = await readFragment('a', 'f');
      expect(result).not.toStrictEqual(fragment1);
      expect(result).toStrictEqual(fragment2);
    });

    test('writeFragmentData() overwrites previous values given same keys', async () => {
      const fragmentData1 = { someData: true };
      const fragmentData2 = { someData: false };
      await writeFragmentData('a', 'f', fragmentData1);
      await writeFragmentData('a', 'f', fragmentData2);
      const result = await readFragmentData('a', 'f');
      expect(result).not.toStrictEqual(fragmentData1);
      expect(result).toStrictEqual(fragmentData2);
    });
  });
});
