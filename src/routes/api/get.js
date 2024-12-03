const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse } = require('../../response');

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res, next) => {
  logger.debug(
    {
      user: req.user,
      query: {
        expand: req.query.expand,
      },
    },
    `incoming request: GET /v1/fragments`
  );

  let foundFragments;
  try {
    foundFragments = await Fragment.byUser(req.user, req.query.expand == 1);
  } catch (error) {
    logger.warn({ error }, `error getting fragments for user`);
    return next(error);
  }

  // Get IDs of all fragments for logging
  // If fragments are expanded, extract IDs
  const foundFragmentsIds =
    req.query.expand == 1 ? foundFragments.map((fragment) => fragment.id) : foundFragments;

  logger.info({ user: req.user, fragmentIds: foundFragmentsIds }, `retrieved fragments for user`);
  if (req.query.expand == 1) {
    logger.debug({ foundFragments }, 'retrieved fragments for user: debug info');
  }

  return res.status(200).json(createSuccessResponse({ fragments: foundFragments }));
};
