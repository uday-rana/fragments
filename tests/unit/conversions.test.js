const md = require('markdown-it')();
const { convertBuffer } = require('../../src/model/conversions');

describe('Type Conversion', () => {
  describe('conversions from plain text', () => {
    const input = 'hello';
    const sourceBuffer = Buffer.from(input);

    test('should convert buffer to plain text for .txt target', () => {
      expect(convertBuffer(sourceBuffer, 'text/plain', '.txt')).toBe(input);
    });
  });

  describe('conversions from markdown', () => {
    const input = '# hello';
    const sourceBuffer = Buffer.from(input);

    test('should convert buffer to markdown for .md target', () => {
      expect(convertBuffer(sourceBuffer, 'text/markdown', '.md')).toBe(input);
    });
    test('should convert buffer to plain text for .txt target', () => {
      expect(convertBuffer(sourceBuffer, 'text/markdown', '.txt')).toBe(input);
    });
    test('should convert buffer to html for .html target', () => {
      expect(convertBuffer(sourceBuffer, 'text/markdown', '.html')).toBe(md.render(input));
    });
  });

  describe('conversions from html', () => {
    const input = '<h1>hello</h1>';
    const sourceBuffer = Buffer.from(input);

    test('should convert buffer to html for .html target', () => {
      expect(convertBuffer(sourceBuffer, 'text/html', '.html')).toBe(input);
    });
    test('should convert buffer to plain text for .txt target', () => {
      expect(convertBuffer(sourceBuffer, 'text/html', '.txt')).toBe(input);
    });
  });

  describe('conversions from csv', () => {
    const input = 'hello, world';
    const sourceBuffer = Buffer.from(input);

    test('should convert buffer to csv for .csv target', () => {
      expect(convertBuffer(sourceBuffer, 'text/csv', '.csv')).toBe(input);
    });
    test('should convert buffer to plain text for .txt target', () => {
      expect(convertBuffer(sourceBuffer, 'text/csv', '.txt')).toBe(input);
    });
  });

  describe('conversions from json', () => {
    const input = JSON.stringify({ value: 'hello' });
    const sourceBuffer = Buffer.from(input);

    test('should convert buffer to json for .json target', () => {
      expect(convertBuffer(sourceBuffer, 'application/json', '.json')).toBe(input);
    });
    test('should convert buffer to plain text for .txt target', () => {
      expect(convertBuffer(sourceBuffer, 'application/json', '.txt')).toBe(input);
    });
  });

  describe('target extension edge cases', () => {
    const input = 'hello';
    const sourceBuffer = Buffer.from(input);

    test('should throw when unsupported target extension is passed', () => {
      expect(() => {
        convertBuffer(sourceBuffer, 'text/plain', '.rb');
      }).toThrow();
    });
    test('should return the input as a string when target extension is not passed', () => {
      expect(convertBuffer(sourceBuffer, 'text/plain')).toBe(input);
    });
  });
});
