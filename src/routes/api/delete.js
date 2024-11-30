const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse } = require('../../response');

/**
 * Delete a fragment for the user by the given id
 */
module.exports = async (req, res, next) => {
  logger.debug(
    {
      user: req.user,
      params: {
        id: req.params.id,
      },
    },
    `incoming request: DELETE /v1/fragments/:id`
  );

  try {
    await Fragment.delete(req.user, req.params.id);
  } catch (error) {
    if (error.name == 'NoSuchKey') {
      error.status = 404;
    }
    logger.warn({ error }, 'error deleting fragment');
    return next(error);
  }

  logger.info({ fragmentId: req.params.id }, `deleted fragment`);

  return res.status(200).send(createSuccessResponse());
};
