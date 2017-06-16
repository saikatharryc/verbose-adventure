/**
 *
 * This file should export all the subroutes under the entity to which
 * this folder belongs to. It must be ensured that the folder name matches
 * the entity name and the subroute to which it is related to.
 *
 * For example: this file is only going to export all the sub-routes under
 * /cashpositive/api/v1/admin
 *
 */
const express = require('express');

const authRoutes = require('./authenticate');
const msgRoutes = require('./messages');
const searchRoutes = require('./search');

const router = express.Router();
/**
 *
 * Admin authenticator, which ensures that all the following routes
 * are purely for the admin, if the admin role is not found in the
 * metadata of the auth0 user object, all the endpoints won't work
 * @param  {Object}   req  Request Object
 * @param  {Object}   res  Response Object
 * @param  {Function} next Function to pass control to the next middleware
 */
function authenticator(req, res, next) {
  if (
    req.user &&
    req.user.metadata &&
    req.user.metadata.admin
  ) {
    next();
  } else {
    res.status(403).json({
      info: 'Unauthorised',
    });
  }
}

//router.use(authenticator);
router.use('/oAuth2', authRoutes);
router.use('/', msgRoutes);
router.use('/', searchRoutes);
module.exports = router;
