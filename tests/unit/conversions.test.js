const path = require('node:path');
const sharp = require('sharp');
const { convertBuffer } = require('../../src/model/conversions');

describe('Type Conversion', () => {
  describe('text conversions', () => {
    describe('conversions from plain text', () => {
      const input = 'hello';
      const sourceBuffer = Buffer.from(input);

      test('should convert buffer to plain text for .txt target', async () => {
        expect(await convertBuffer(sourceBuffer, 'text/plain', '.txt')).toBe(input);
      });
    });

    describe('conversions from markdown', () => {
      const input = '# hello';
      const sourceBuffer = Buffer.from(input);
      const expectedHtmlOutput = '<h1>hello</h1>\n';

      test('should convert buffer to markdown for .md target', async () => {
        expect(await convertBuffer(sourceBuffer, 'text/markdown', '.md')).toBe(input);
      });
      test('should convert buffer to plain text for .txt target', async () => {
        expect(await convertBuffer(sourceBuffer, 'text/markdown', '.txt')).toBe(input);
      });
      test('should convert buffer to html for .html target', async () => {
        expect(await convertBuffer(sourceBuffer, 'text/markdown', '.html')).toBe(
          expectedHtmlOutput
        );
      });
    });

    describe('conversions from html', () => {
      const input = '<h1>hello</h1>';
      const sourceBuffer = Buffer.from(input);

      test('should convert buffer to html for .html target', async () => {
        expect(await convertBuffer(sourceBuffer, 'text/html', '.html')).toBe(input);
      });
      test('should convert buffer to plain text for .txt target', async () => {
        expect(await convertBuffer(sourceBuffer, 'text/html', '.txt')).toBe(input);
      });
    });

    describe('conversions from csv', () => {
      const input = `
"key_1","key_2"
"value 1","value 2"
`;
      const sourceBuffer = Buffer.from(input);
      const expectedJsonOutput = '[["key_1","key_2"],["value 1","value 2"]]';

      test('should convert buffer to csv for .csv target', async () => {
        expect(await convertBuffer(sourceBuffer, 'text/csv', '.csv')).toBe(input);
      });
      test('should convert buffer to plain text for .txt target', async () => {
        expect(await convertBuffer(sourceBuffer, 'text/csv', '.txt')).toBe(input);
      });
      test('should convert buffer to json for .json target', async () => {
        expect(await convertBuffer(sourceBuffer, 'text/csv', '.json')).toBe(expectedJsonOutput);
      });
    });

    describe('conversions from json', () => {
      const input = '{"value":"hello"}\n';
      const sourceBuffer = Buffer.from(input);
      const expectedYamlOutput = 'value: hello\n';

      test('should convert buffer to json for .json target', async () => {
        expect(await convertBuffer(sourceBuffer, 'application/json', '.json')).toBe(input);
      });
      test('should convert buffer to plain text for .txt target', async () => {
        expect(await convertBuffer(sourceBuffer, 'application/json', '.txt')).toBe(input);
      });
      test('should convert buffer to yaml for .yaml target', async () => {
        expect(await convertBuffer(sourceBuffer, 'application/json', '.yaml')).toBe(
          expectedYamlOutput
        );
      });
      test('should convert buffer to yaml for .yml target', async () => {
        expect(await convertBuffer(sourceBuffer, 'application/json', '.yml')).toBe(
          expectedYamlOutput
        );
      });
    });

    describe('conversions from yaml', () => {
      const input = 'value: hello\n';
      const sourceBuffer = Buffer.from(input);

      test('should convert buffer to yaml for .yaml target', async () => {
        expect(await convertBuffer(sourceBuffer, 'application/yaml', '.yaml')).toBe(input);
      });
      test('should convert buffer to plain text for .txt target', async () => {
        expect(await convertBuffer(sourceBuffer, 'application/yaml', '.txt')).toBe(input);
      });
    });

    describe('target extension edge cases', () => {
      const input = 'hello';
      const sourceBuffer = Buffer.from(input);

      test('should throw when unsupported target extension is passed', async () => {
        expect(async () => {
          await convertBuffer(sourceBuffer, 'text/plain', '.rb');
        }).rejects.toThrow();
      });
      test('should return the input as a string when target extension is not passed', async () => {
        expect(await convertBuffer(sourceBuffer, 'text/plain')).toBe(input);
      });
    });
  });

  describe('image conversions', () => {
    const avifTestFilePath = path.resolve(__dirname, '../images/cute-kitten.avif');
    const webpTestFilePath = path.resolve(__dirname, '../images/cute-kitten.webp');

    test('should convert buffer to png for .png target', async () => {
      const sourceBuffer = await sharp(avifTestFilePath).toBuffer();
      const expectedPngOutput = await sharp(sourceBuffer).png().toBuffer();
      expect(await convertBuffer(sourceBuffer, 'image/avif', '.png')).toEqual(expectedPngOutput);
    });

    test('should convert buffer to jpeg for .jpg target', async () => {
      const sourceBuffer = await sharp(avifTestFilePath).toBuffer();
      const expectedJpegOutput = await sharp(sourceBuffer).jpeg().toBuffer();
      expect(await convertBuffer(sourceBuffer, 'image/avif', '.jpg')).toEqual(expectedJpegOutput);
    });

    test('should convert buffer to webp for .webp target', async () => {
      const sourceBuffer = await sharp(avifTestFilePath).toBuffer();
      const expectedWebpOutput = await sharp(sourceBuffer).webp().toBuffer();
      expect(await convertBuffer(sourceBuffer, 'image/avif', '.webp')).toEqual(expectedWebpOutput);
    });

    test('should convert buffer to avif for .avif target', async () => {
      const sourceBuffer = await sharp(webpTestFilePath).toBuffer();
      const expectedAvifOutput = await sharp(sourceBuffer).avif().toBuffer();
      expect(await convertBuffer(sourceBuffer, 'image/webp', '.avif')).toEqual(expectedAvifOutput);
    });

    test('should convert buffer to gif for .gif target', async () => {
      const sourceBuffer = await sharp(avifTestFilePath).toBuffer();
      const expectedGifOutput = await sharp(sourceBuffer).gif().toBuffer();
      expect(await convertBuffer(sourceBuffer, 'image/avif', '.gif')).toEqual(expectedGifOutput);
    });

    describe('target extension edge cases', () => {
      test('should return the unprocessed input when target extension is not passed', async () => {
        const sourceBuffer = await sharp(avifTestFilePath).toBuffer();
        expect(await convertBuffer(sourceBuffer, 'image/avif')).toEqual(sourceBuffer);
      });

      test('should throw when unsupported target extension is passed', async () => {
        const sourceBuffer = await sharp(avifTestFilePath).toBuffer();
        expect(async () => {
          await convertBuffer(sourceBuffer, 'image/avif', '.bpg');
        }).rejects.toThrow();
      });
    });
  });
});
