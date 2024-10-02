const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

/**
 * Creates a new fragment for the current user (i.e., authenticated user)
 */
module.exports = async (req, res) => {
  logger.debug({ req, reqBody: req.body }, `Incoming request: POST /v1/fragments`);
  // handle incorrect content-type or malformed request body
  if (!Buffer.isBuffer(req.body)) {
    return res.status(415).json(createErrorResponse(415, 'Unsupported media type'));
  }
  const newFragmentOwnerId = req.user;
  const newFragmentType = req.headers['content-type'];
  const newFragmentSize = Buffer.byteLength(req.body);
  const newFragment = new Fragment({
    ownerId: newFragmentOwnerId,
    type: newFragmentType,
    size: newFragmentSize,
  });
  try {
    await newFragment.save();
  } catch (error) {
    logger.error({ error }, `Error saving fragment`);
    // Since input is verified any error can only be a server error
    return res.status(500).json(createErrorResponse(500, `Error saving fragment`));
  }
  try {
    await newFragment.setData(req.body);
  } catch (error) {
    logger.error({ error }), `Error saving fragment data`;
    return res.status(500).json(createErrorResponse(500, `Error saving fragment data`));
  }
  logger.debug(
    `Constructing URL: ${process.env?.API_URL || req.headers?.host}/v1/fragments/${newFragment.id}`
  );
  const locationURL = new URL(
    `/v1/fragments/${newFragment.id}`,
    `https://${process.env?.API_URL || req.headers?.host}`
  );
  return res
    .status(201)
    .set('location', locationURL)
    .json(createSuccessResponse({ fragment: newFragment }));
};
