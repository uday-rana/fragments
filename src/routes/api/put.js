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
      params: {
        id: req.params.id,
      },
      headers: {
        contentType: req.headers['content-type'],
        host: req.headers?.host,
      },
    },
    `incoming request: PUT /v1/fragments/:id`
  );

  // Handle invalid/unsupported content-type headers and/or malformed request body
  if (!Buffer.isBuffer(req.body)) {
    const err = new Error('Unsupported media type');
    err.status = 415;
    logger.warn(
      { error: err },
      'invalid/unsupported content-type headers and/or malformed request body'
    );
    return next(err);
  }

  let foundFragment;
  try {
    foundFragment = new Fragment(await Fragment.byId(req.user, req.params.id));
  } catch (error) {
    logger.warn({ error }, `error getting fragment by id`);
    return next(error);
  }

  logger.info(
    { userId: foundFragment.ownerId, fragmentId: foundFragment.id },
    `retrieved fragment by id`
  );
  logger.debug(
    { foundFragment, type: typeof foundFragment, mimeType: foundFragment.mimeType },
    'retrieved fragment by id: debug info'
  );

  // Check whether the request's content-type matches the existing fragment's type
  if (req.headers['content-type'] !== foundFragment.type) {
    const err = new Error(
      "Content-Type mismatch: Request Content-Type does not match the existing fragment's type"
    );
    err.status = 400;
    logger.debug(
      { error: err },
      "request content-type does not match the existing fragment's type"
    );
    return next(err);
  }

  try {
    await foundFragment.setData(req.body);
  } catch (error) {
    logger.warn({ error }), `error updating data for fragment`;
    return next(error);
  }

  logger.info(
    { userId: foundFragment.ownerId, fragmentId: foundFragment.id },
    `updated data for fragment`
  );

  return res.status(200).json(createSuccessResponse({ fragment: foundFragment }));
};
