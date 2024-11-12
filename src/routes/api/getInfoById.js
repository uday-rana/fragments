const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse, createSuccessResponse } = require('../../response');

/**
 * Get the metadata for a fragment for the user by the given id
 */
module.exports = async (req, res) => {
  logger.debug(
    {
      user: req.user,
      params: {
        id: req.params.id,
      },
    },
    `Incoming request: GET /v1/fragments/:id/info`
  );
  let foundFragment;
  try {
    foundFragment = await Fragment.byId(req.user, req.params.id);
  } catch (error) {
    logger.error({ error }, `Error getting fragment by id`);
    const statusCode = error.name == 'NotFoundError' ? 404 : 500;
    return res
      .status(statusCode)
      .json(
        createErrorResponse(
          statusCode,
          statusCode == 404 ? error.message : `Error getting fragment by id`
        )
      );
  }
  logger.info(
    { userId: foundFragment.ownerId, fragmentId: foundFragment.id },
    `Retrieved fragment by id`
  );
  return res.status(200).send(createSuccessResponse({ fragment: foundFragment }));
};
