const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  logger.debug({ req }, `Incoming request: GET /v1/fragments`);
  try {
    const resultFragments = await Fragment.byUser(req.user, req.query.expand == 1);
    // Log ids of all fragments in array
    // If expand parameter passed, need to extract ids
    const resultFragmentsIds =
      req.query.expand == 1 ? resultFragments.map((fragment) => fragment.id) : resultFragments;
    logger.info(
      { userId: req.user, fragmentIds: resultFragmentsIds },
      `Retreived fragments for user`
    );
    return res.status(200).json(createSuccessResponse({ fragments: resultFragments }));
  } catch (error) {
    logger.error({ error }, `Error getting fragments for user`);
    // Since input is verified, any error can only be a server error
    return res.status(500).json(createErrorResponse(500, 'Error getting fragments for user'));
  }
};
