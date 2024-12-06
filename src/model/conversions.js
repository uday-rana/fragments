// https://github.com/markdown-it/markdown-it
const md = require('markdown-it')();
// https://csv.js.org/parse/api/sync/
const csvParseSync = require('csv-parse/sync');
// https://github.com/nodeca/js-yaml
const yaml = require('js-yaml');
// https://sharp.pixelplumbing.com/
const sharp = require('sharp');

/**
 * Type 	Valid Conversion Extensions
 * text/plain 	.txt
 * text/markdown 	.md, .html, .txt
 * text/html 	.html, .txt
 * text/csv 	.csv, .txt, .json
 * application/json 	.json, .yaml, .yml, .txt
 * application/yaml 	.yaml, .txt
 * image/png 	.png, .jpg, .webp, .gif, .avif
 * image/jpeg 	.png, .jpg, .webp, .gif, .avif
 * image/webp 	.png, .jpg, .webp, .gif, .avif
 * image/avif 	.png, .jpg, .webp, .gif, .avif
 * image/gif 	.png, .jpg, .webp, .gif, .avif
 */

const validConversionTargets = {
  'text/plain': {
    extensions: ['.txt'],
    contentTypes: ['text/plain'],
  },
  'text/markdown': {
    extensions: ['.md', '.html', '.txt'],
    contentTypes: ['text/markdown', 'text/html', 'text/plain'],
  },
  'text/html': {
    extensions: ['.html', '.txt'],
    contentTypes: ['text/html', 'text/plain'],
  },
  'text/csv': {
    extensions: ['.csv', '.txt', '.json'],
    contentTypes: ['text/csv', 'text/plain', 'application/json'],
  },
  'application/json': {
    extensions: ['.json', '.yaml', '.yml', '.txt'],
    contentTypes: ['application/json', 'application/yaml', 'text/plain'],
  },
  'application/yaml': {
    extensions: ['.yaml', '.txt'],
    contentTypes: ['application/yaml', 'text/plain'],
  },
  // Don't need to store valid conversion targets for images
  // since they all support conversion to each other
  // we just check if the target extension is in extToContentType
  'image/png': null,
  'image/jpeg': null,
  'image/webp': null,
  'image/avif': null,
  'image/gif': null,
};

const extToContentType = {
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.html': 'text/html',
  '.csv': 'text/csv',
  '.json': 'application/json',
  '.yaml': 'application/yaml',
  '.yml': 'application/yaml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
};

async function convertBuffer(sourceBuffer, sourceType, targetExtension) {
  if (sourceType.startsWith('image/')) {
    if (targetExtension && !(targetExtension in extToContentType)) {
      let err = new Error(`Invalid target extension ${targetExtension} for ${sourceType}`);
      err.status = 415;
      throw err;
    }

    return await convertImageBuffer(sourceBuffer, sourceType, targetExtension);
  }

  if (sourceType.startsWith('text/') || sourceType.startsWith('application/')) {
    if (
      targetExtension &&
      !validConversionTargets[sourceType].extensions.includes(targetExtension)
    ) {
      let err = new Error(`Invalid target extension ${targetExtension} for ${sourceType}`);
      err.status = 415;
      throw err;
    }

    return convertTextBuffer(sourceBuffer, sourceType, targetExtension);
  }
}

async function convertImageBuffer(sourceBuffer, sourceType, targetExtension) {
  if (!targetExtension || sourceType == extToContentType?.targetExtension) {
    return sourceBuffer;
  }

  switch (targetExtension) {
    case '.png':
      return await sharp(sourceBuffer).png().toBuffer();
    case '.jpg':
      return await sharp(sourceBuffer).jpeg().toBuffer();
    case '.webp':
      return await sharp(sourceBuffer).webp().toBuffer();
    case '.avif':
      return await sharp(sourceBuffer).avif().toBuffer();
    case '.gif':
      return await sharp(sourceBuffer).gif().toBuffer();
  }
}

function convertTextBuffer(sourceBuffer, sourceType, targetExtension) {
  // Handle cases where no conversion is required
  if (
    !targetExtension ||
    targetExtension == '.txt' ||
    sourceType == extToContentType[targetExtension]
  ) {
    return sourceBuffer.toString();
  }

  // Handle conversions
  switch (sourceType) {
    case 'text/markdown':
      if (targetExtension === '.html') {
        return md.render(sourceBuffer.toString());
      }
      break;

    case 'text/csv':
      if (targetExtension === '.json') {
        return JSON.stringify(csvParseSync.parse(sourceBuffer, { skip_empty_lines: true }));
      }
      break;

    case 'application/json':
      if (targetExtension === '.yaml' || targetExtension === '.yml') {
        return yaml.dump(JSON.parse(sourceBuffer.toString()));
      }
      break;
  }
}

module.exports.validConversionTargets = validConversionTargets;
module.exports.extToContentType = extToContentType;
module.exports.convertBuffer = convertBuffer;
