// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  constructor({
    id = randomUUID(),
    ownerId,
    created = new Date().toISOString(),
    updated = new Date().toISOString(),
    type,
    size = 0,
  }) {
    if (type === undefined || ownerId === undefined) {
      throw new Error('class "Fragment" requires arguments "type", "ownerId"');
    }
    if (typeof size !== 'number') {
      throw new Error('in class "Fragment" argument "size" must be a number');
    }
    if (size < 0) {
      throw new Error('in class "Fragment" argument "size" cannot be a negative number');
    }
    if (!Fragment.isSupportedType(type)) {
      throw new Error('in class "Fragment" argument "type" must be a supported type');
    }
    this.id = id;
    this.ownerId = ownerId;
    this.created = created;
    this.updated = updated;
    this.type = type;
    this.size = size;
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    return listFragments(ownerId, expand);
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    // It'd be nice if this supported an expand parameter
    // for consistency with byUser...
    const fragment = await readFragment(ownerId, id);
    if (typeof fragment === 'undefined') {
      let err = new Error(`fragment id ${id} not found`);
      err.name = 'NotFoundError';
      throw err;
    }
    return Promise.resolve(fragment);
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise<void>
   */
  save() {
    this.updated = new Date().toISOString();
    return writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    if (!Buffer.isBuffer(data)) {
      throw new Error('in function setData, argument "data" must be of type Buffer');
    }
    this.size = Buffer.byteLength(data);
    this.save();
    return writeFragmentData(this.ownerId, this.id, data);
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return this.mimeType.startsWith('text/');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
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
    switch (this.mimeType) {
      case 'text/plain':
        return ['text/plain'];
      default:
        return [];
    }
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    const validTypes = ['text/plain'];
    const { type } = contentType.parse(value);
    return validTypes.includes(type);
  }
}

module.exports.Fragment = Fragment;
