const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse } = require('../../response');

/**
 * Get the metadata for a fragment for the user by the given id
 */
module.exports = async (req, res, next) => {
  logger.debug(
    {
      user: req.user,
      params: {
        id: req.params.id,
      },
    },
    `incoming request: GET /v1/fragments/:id/info`
  );

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

  return res.status(200).send(createSuccessResponse({ fragment: foundFragment }));
};
