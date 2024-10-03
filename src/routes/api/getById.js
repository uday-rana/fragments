const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');

/**
 * Get a fragment for the user by the given id
 */
module.exports = async (req, res) => {
  logger.debug({ req }, `Incoming request: GET /v1/fragments/:id`);
  let foundFragment;
  let foundFragmentData;
  try {
    foundFragment = await Fragment.byId(req.user, req.params.id);
  } catch (error) {
    // If fragment not found, handle it here, else pass it up to the error handler
    if (error.name == 'NotFoundError') {
      logger.error({ error }, `Error getting fragment by id`);
      return res
        .status(404)
        .json(createErrorResponse(404, `fragment id ${req.params.id} not found`));
    } else {
      throw error;
    }
  }
  logger.info(
    { userId: foundFragment.ownerId, fragmentId: foundFragment.id },
    `Retreived fragment by id`
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
    `Retreived fragment data by id`
  );
  return res.status(200).send(foundFragmentData);
};
