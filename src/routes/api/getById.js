const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');

/**
 * Get a fragment for the user by the given id
 */
module.exports = async (req, res) => {
  logger.debug(
    {
      user: req.user,
      params: {
        id: req.params.id,
      },
    },
    `Incoming request: GET /v1/fragments/:id`
  );
  let foundFragment;
  let foundFragmentData;
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
  try {
    foundFragmentData = await foundFragment.getData();
  } catch (error) {
    logger.error({ error }, `Error getting data for requested fragment`);
    // Since the fragment was found, any error getting it's data must be a server error
    return res
      .status(500)
      .json(createErrorResponse(500, `Error getting data for requested fragment`));
  }
  logger.info(
    { userId: foundFragment.ownerId, fragmentId: foundFragment.id },
    `Retrieved fragment data by id`
  );
  return res.status(200).send(foundFragmentData);
};
