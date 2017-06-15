/**
 *
 * This file should contain all the environment variables specific to the
 * environment as denoted by the name of the file. All environment variables
 * must be retrieved from process.env. In case you need to mention and hardcode one,
 * please pass it on as OR parameter, just as the database URI
 *
 */

module.exports = {
  MONGO_DB: {
    URI: process.env.MONGO_URI || 'mongodb://localhost:27017/gmail_app',
  },
  'client_id': '192750956997-7bi9bqpd18907r7uffreg7p8l56s4ije.apps.googleusercontent.com',
  'project_id': 'symbolic-datum-170601',
  'auth_uri': 'https://accounts.google.com/o/oauth2/auth',
  'token_uri': 'https://accounts.google.com/o/oauth2/token',
  'auth_provider_x509_cert_url': 'https://www.googleapis.com/oauth2/v1/certs',
  'client_secret': 'Yb8yRPySnwOMu1LWngnKty8k',
  'redirect_uris': ['urn:ietf:wg:oauth:2.0:oob', 'http://localhost:2000/api/v1/auth/oAuth2/callback'],
  'host': 'https://accounts.google.com',
  'api_base': 'https://www.googleapis.com',

};
