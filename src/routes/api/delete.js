const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

/**
 * Delete a fragment for the user by the given id
 */
module.exports = async (req, res) => {
  logger.debug(
    {
      user: req.user,
      params: {
        id: req.params.id,
      },
    },
    `Incoming request: DELETE /v1/fragments/:id`
  );

  try {
    await Fragment.delete(req.user, req.params.id);
  } catch (error) {
    const defaultMessage = `Error deleting fragment`;
    const statusCode = error.name == 'NoSuchKey' ? 404 : 500;

    logger.error({ error }, defaultMessage);

    return res.status(statusCode).json(createErrorResponse(statusCode, defaultMessage));
  }

  logger.info({ fragmentId: req.params.id }, `Deleted fragment`);

  return res.status(200).send(createSuccessResponse());
};
