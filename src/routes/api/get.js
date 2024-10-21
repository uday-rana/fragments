const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  logger.debug({ req }, `Incoming request: GET /v1/fragments`);
  try {
    const foundFragments = await Fragment.byUser(req.user, req.query.expand == 1);
    // Get IDs of all fragments for logging
    // If fragments are expanded, extract IDs
    const foundFragmentsIds =
      req.query.expand == 1 ? foundFragments.map((fragment) => fragment.id) : foundFragments;
    logger.info(
      { userId: req.user, fragmentIds: foundFragmentsIds },
      `Retrieved fragments for user`
    );
    return res.status(200).json(createSuccessResponse({ fragments: foundFragments }));
  } catch (error) {
    logger.error({ error }, `Error getting fragments for user`);
    // Since user is authenticated, any error can only be a server error
    return res.status(500).json(createErrorResponse(500, 'Error getting fragments for user'));
  }
};
