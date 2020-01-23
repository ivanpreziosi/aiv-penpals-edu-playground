var AppConfig = require('../app_config');

exports.getUnixTimestampNow = function () {
  var moment = require('moment');
  return moment().format('X');
};

exports.getMysqlDateNow = function () {
  var moment = require('moment');
  return moment().format(AppConfig.dbDateFormat);
};

exports.getRequestExpirationDate = function () {
  var moment = require('moment');
  return moment().subtract(1, 'day').format(AppConfig.dbDateFormat);
};

exports.getTokenExpirationDate = function () {
  var moment = require('moment');
  return moment().subtract(AppConfig.appTokenLifespan, 'minutes').format(AppConfig.dbDateFormat);
};