const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');

/**
 * Get a fragment for the user by the given id
 */
module.exports = async (req, res) => {
  logger.debug({ req }, `Incoming request: GET /v1/fragments/:id`);
  try {
    const resultFragment = await Fragment.byId(req.user, req.params.id);
    logger.info(
      { userId: resultFragment.ownerId, fragmentId: resultFragment.id },
      `Retreived fragment by id`
    );
    const resultFragmentData = await resultFragment.getData();
    logger.info(
      { userId: resultFragment.ownerId, fragmentId: resultFragment.id },
      `Retreived fragment data by id`
    );
    return res.status(200).send(resultFragmentData);
  } catch (error) {
    logger.error({ error }, `Error getting fragment by id`);
    // Since input is verified, any error can only be a server error
    return res.status(500).json(createErrorResponse(500, 'Error getting fragments for user'));
  }
};
