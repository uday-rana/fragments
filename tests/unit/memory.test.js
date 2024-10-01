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

    test('readFragment() returns what we pass to writeFragment()', async () => {
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

    test('listFragments()', async () => {
      expect('a').toBe('b');
    });

    test('deleteFragment()', async () => {
      expect('a').toBe('b');
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

    test('listFragments()', async () => {
      expect('a').toBe('b');
    });

    test('deleteFragment()', async () => {
      expect('a').toBe('b');
    });
  });

  describe('primary key not in db', () => {
    test('readFragment() returns undefined if primary key not in db', async () => {
      const result = await readFragment('b', 'a');
      expect(result).toBeUndefined();
    });

    test('readFragmentData() returns undefined if primary key not in db', async () => {
      const result = await readFragmentData('b', 'a');
      expect(result).toBeUndefined();
    });

    test('listFragments()', async () => {
      expect('a').toBe('b');
    });

    test('deleteFragment()', async () => {
      expect('a').toBe('b');
    });
  });

  describe('primary key in db but not secondary key', () => {
    test('readFragment() returns undefined if secondary key not in db', async () => {
      const result = await readFragment('a', 'd');
      expect(result).toBeUndefined();
    });

    test('readFragmentData() returns undefined if secondary key not in db', async () => {
      const result = await readFragmentData('a', 'd');
      expect(result).toBeUndefined();
    });

    test('deleteFragment()', async () => {
      expect('a').toBe('b');
    });
  });

  describe('passing same keys to write functions twice', () => {
    test('writeFragment() overwrites previous values given same keys', async () => {
      const fragment1 = { ownerId: 'a', id: 'd', someMetadata: true };
      const fragment2 = { ownerId: 'a', id: 'd', someMetadata: false };
      await writeFragment(fragment1);
      await writeFragment(fragment2);
      const result = await readFragment('a', 'd');
      expect(result).not.toEqual(fragment1);
      expect(result).toEqual(fragment2);
    });

    test('writeFragmentData() overwrites previous values given same keys', async () => {
      const fragmentData1 = { someData: true };
      const fragmentData2 = { someData: false };
      await writeFragmentData('a', 'e', fragmentData1);
      await writeFragmentData('a', 'e', fragmentData2);
      const result = await readFragmentData('a', 'e');
      expect(result).not.toEqual(fragmentData1);
      expect(result).toEqual(fragmentData2);
    });
  });
});
