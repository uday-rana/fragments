const md = require('markdown-it')();

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
};

const extToContentType = {
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.html': 'text/html',
  '.csv': 'text/csv',
  '.json': 'application/json',
  '.yaml': 'application/yaml',
  '.yml': 'application/yaml',
};

function convertBuffer(sourceBuffer, sourceType, targetExtension) {
  if (targetExtension && !validConversionTargets[sourceType].extensions.includes(targetExtension)) {
    let err = new Error(`Invalid target extension ${targetExtension} for ${sourceType}`);
    err.status = 415;
    throw err;
  }

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
      if (targetExtension == '.html') {
        return md.render(sourceBuffer.toString());
      }
      break;

    default:
      break;
  }
}

module.exports.validConversionTargets = validConversionTargets;
module.exports.extToContentType = extToContentType;
module.exports.convertBuffer = convertBuffer;
