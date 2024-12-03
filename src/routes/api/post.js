const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse } = require('../../response');

/**
 * Creates a new fragment for the current user (i.e., authenticated user)
 */
module.exports = async (req, res, next) => {
  logger.debug(
    {
      user: req.user,
      headers: {
        contentType: req.headers['content-type'],
        host: req.headers?.host,
      },
      body: req.body,
    },
    `incoming request: POST /v1/fragments`
  );

  // Handle invalid/unsupported content-type headers and/or malformed request body
  if (!Buffer.isBuffer(req.body)) {
    const err = new Error('Unsupported media type');
    err.status = 415;
    logger.debug(
      { error: err },
      'invalid/unsupported content-type headers and/or malformed request body'
    );
    return next(err);
  }

  const newFragment = new Fragment({
    ownerId: req.user,
    type: req.headers['content-type'],
    size: Buffer.byteLength(req.body),
  });

  try {
    // Save the fragment's metadata to the database
    await newFragment.save();
  } catch (error) {
    logger.warn({ error }, `error creating new fragment`);
    return next(error);
  }

  logger.info({ ownerId: newFragment.ownerId, fragmentId: newFragment.id }, `created new fragment`);

  try {
    // Save the fragment's data to the database
    await newFragment.setData(req.body);
  } catch (error) {
    logger.warn({ error }), `error saving data for new fragment`;
    return next(error);
  }

  logger.info(
    { userId: newFragment.ownerId, fragmentId: newFragment.id },
    `saved data for new fragment`
  );

  const locationURL = new URL(
    `/v1/fragments/${newFragment.id}`,
    process.env?.API_URL || `https://${req.headers?.host}`
  );

  logger.debug({ locationURL }, `constructed URL for new fragment`);

  return res
    .status(201)
    .set('Location', locationURL)
    .json(createSuccessResponse({ fragment: newFragment }));
};
