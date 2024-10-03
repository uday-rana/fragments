const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

/**
 * Creates a new fragment for the current user (i.e., authenticated user)
 */
module.exports = async (req, res) => {
  logger.debug({ req }, `Incoming request: POST /v1/fragments`);
  // Handle invalid/unsupported content-type headers and/or malformed request body
  if (!Buffer.isBuffer(req.body)) {
    return res.status(415).json(createErrorResponse(415, 'Unsupported media type'));
  }
  const newFragment = new Fragment({
    ownerId: req.user,
    type: req.headers['content-type'],
    size: Buffer.byteLength(req.body),
  });
  try {
    // Save the fragment's metadata to the database
    await newFragment.save();
    logger.info(
      { userId: newFragment.ownerId, fragmentId: newFragment.id },
      `Created new fragment`
    );
  } catch (error) {
    logger.error({ error }, `Error creating new fragment`);
    // Since input errors are handled above, any error at this point can only be a server error
    return res.status(500).json(createErrorResponse(500, `Error creating new fragment`));
  }
  try {
    // Save the fragment's data to the database
    await newFragment.setData(req.body);
    logger.info(
      { userId: newFragment.ownerId, fragmentId: newFragment.id },
      `Saved data for new fragment`
    );
  } catch (error) {
    logger.error({ error }), `Error saving data for new fragment`;
    return res.status(500).json(createErrorResponse(500, `Error saving data for new fragment`));
  }
  logger.debug(
    `${process.env?.API_URL || req.headers?.host}/v1/fragments/${newFragment.id}`,
    `Constructing URL`
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
