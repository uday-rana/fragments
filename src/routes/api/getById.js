const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  logger.debug({ req, reqBody: req.body }, `Incoming request: GET /v1/fragments/:id`);
  try {
    const resultFragment = await Fragment.byId(req.user, req.params.id);
    logger.debug({ resultFragment }, `Retreived fragment by id`);
    const resultData = await resultFragment.getData();
    logger.debug({ resultData }, `Retreived fragment data by id`);
    return res.status(200).send(resultData);
  } catch (error) {
    logger.error({ error }, `Error getting fragment by id`);
    // We verify input so any error can only be a server error
    return res.status(500).json(createErrorResponse(500, 'Error getting fragments for user'));
  }
};
