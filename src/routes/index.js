const { hostname } = require('node:os');

const express = require('express');

// version and author from package.json
const { version, author } = require('../../package.json');

// Create a router that we can use to mount our API
const router = express.Router();

// Our authentication middleware
const auth = require('../auth');

// Success response generator
const { createSuccessResponse } = require('../response');

/**
 * Expose all of our API routes on /v1/* to include an API version.
 */
router.use(`/v1`, auth.authenticate(), require('./api'));

/**
 * Define a simple health check route. If the server is running
 * we'll respond with a 200 OK.  If not, the server isn't healthy.
 */
router.get('/', (req, res) => {
  // Clients shouldn't cache this response (always request it fresh)
  res.setHeader('Cache-Control', 'no-cache');
  // Send a 200 'OK' response
  return res.status(200).json(
    createSuccessResponse({
      author,
      githubUrl: 'https://github.com/uday-rana/fragments',
      version,
      hostname: hostname(),
    })
  );
});

module.exports = router;
