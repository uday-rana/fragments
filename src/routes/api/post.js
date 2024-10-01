const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

/**
 * Creates a new fragment for the current user (i.e., authenticated user)
 */
module.exports = (req, res) => {
  logger.debug({ req }, `Incoming request: POST /v1/fragments`);
  try {
    // handle incorrect content-type or malformed request body
    if (!Buffer.isBuffer(req.body)) {
      res.status(415).json(createErrorResponse(415, 'unsupported media type'));
    }
    const newFragmentOwnerId = req.user;
    const newFragmentType = req.headers['content-type'];
    const newFragmentSize = Buffer.byteLength(req.body);
    const newFragment = new Fragment({
      ownerId: newFragmentOwnerId,
      type: newFragmentType,
      size: newFragmentSize,
    });
    newFragment.save();
    newFragment.setData(req.body);
    logger.debug(
      `constructing URL: ${process.env?.API_URL || req.headers?.host}/v1/fragments/${newFragment.id}`
    );
    const locationURL = new URL(
      `/v1/fragments/${newFragment.id}`,
      `https://${process.env?.API_URL || req.headers?.host}`
    );
    res
      .status(201)
      .set('location', locationURL)
      .json(createSuccessResponse({ fragment: newFragment }));
  } catch (error) {
    logger.error(`error on POST /v1/fragments`, { error });
    res.status(500).json(createErrorResponse(500, 'server error'));
  }
};
