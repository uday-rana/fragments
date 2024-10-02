const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  logger.debug({ req, reqBody: req.body }, `Incoming request: GET /v1/fragments`);
  try {
    const result = await Fragment.byUser(req.user);
    logger.debug({ result }, `Retreived fragments for user`);
    return res.status(200).json(createSuccessResponse({ fragments: result }));
  } catch (error) {
    logger.error({ error }, `Error getting fragments for user`);
    // We verify input so any error can only be a server error
    return res.status(500).json(createErrorResponse(500, 'Error getting fragments for user'));
  }
};
