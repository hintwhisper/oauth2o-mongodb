
/**
 * Define which and the order in which
 * initializers should be loaded.
 */

module.exports = [
  'database',
  'filters',
  'sendgrid',
  'monq',
  'load_partials',
  'oauth2o',
  'uploadcron'
];
