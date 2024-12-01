const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { convertBuffer, extToContentType } = require('../../model/conversions');

/**
 * Get a fragment for the user by the given id
 */
module.exports = async (req, res, next) => {
  logger.debug(
    {
      user: req.user,
      params: {
        id: req.params.id,
      },
    },
    `incoming request: GET /v1/fragments/:id`
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
    logger.warn({ error }, `error getting fragment by id`);
    return next(error);
  }

  logger.info(
    { userId: foundFragment.ownerId, fragmentId: foundFragment.id },
    `retrieved fragment by id`
  );
  logger.debug(
    { foundFragment, type: typeof foundFragment, mimeType: foundFragment.mimeType },
    'retrieved fragment by id: debug info'
  );

  let foundFragmentData;
  try {
    foundFragmentData = await foundFragment.getData();
  } catch (error) {
    logger.warn({ error }, `error getting data for requested fragment`);
    return next(error);
  }

  logger.info(
    { userId: foundFragment.ownerId, fragmentId: foundFragment.id },
    `retrieved fragment data by id`
  );
  logger.debug(
    { foundFragmentData, type: typeof foundFragmentData },
    'retrieved fragment data by id: debug info'
  );

  if (targetExtension) {
    logger.info({ targetExtension }, 'fragment type conversion requested');
  }

  let result;
  try {
    result = convertBuffer(foundFragmentData, foundFragment.mimeType, targetExtension);
  } catch (error) {
    logger.warn({ error }, `error converting fragment data to requested type`);
    return next(error);
  }

  res.set('Content-Type', targetExtension ? extToContentType[targetExtension] : foundFragment.type);
  return res.status(200).send(result);
};
