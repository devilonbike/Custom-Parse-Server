/**
 * You Cloud Code goes here.
 *
 * Note: Parse has changed some ways cloud code used to be handled, to make it compatible with server.
 *
 * Full Details: [[https://github.com/ParsePlatform/parse-server/wiki/Compatibility-with-Hosted-Parse#cloud-code]]
 *
 */
Parse.Cloud.define('hello', function(req, res) {
    res.success('Hi');
});
