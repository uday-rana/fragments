const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { convertBuffer, extToContentType } = require('../../model/conversions');
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

  let targetExtension;
  let id = req.params.id;

  if (/\.[a-zA-Z0-9]+$/.test(id)) {
    targetExtension = id.slice(id.lastIndexOf('.'));
    id = id.slice(0, id.lastIndexOf('.'));
  }

  let foundFragment;

  try {
    foundFragment = new Fragment(await Fragment.byId(req.user, id));
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

  logger.debug({ foundFragment, type: typeof foundFragment }, 'found fragment');

  let foundFragmentData;

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

  logger.debug({ foundFragmentData }, 'Found fragment data');

  let result;
  try {
    result = convertBuffer(foundFragmentData, foundFragment.mimeType, targetExtension);
  } catch (error) {
    logger.error({ message: error.message }, `Error converting fragment data to requested type`);

    const statusCode = error.name == 'UnsupportedMediaTypeError' ? 415 : 500;

    return res
      .status(statusCode)
      .json(
        createErrorResponse(
          statusCode,
          statusCode == 415 ? error.message : `Error getting fragment by id`
        )
      );
  }

  res.set(
    'Content-Type',
    targetExtension ? extToContentType[targetExtension] : foundFragment.mimeType
  );
  return res.status(200).send(result);
};
