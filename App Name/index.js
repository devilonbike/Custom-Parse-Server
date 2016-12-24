// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');
var path = require('path');
var S3Adapter = require('parse-server').S3Adapter;
var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;
var allowInsecureHTTP = true;
if (!databaseUri) {
    console.log('DATABASE_URI not specified, falling back to localhost.');
}

/**
 * Parse Configuration: Obtain them from www.parse.com >
 * Your App > Settings > Keys
 */
var appName = "Parse App Name";
var masterKey = "Parse Master Key";
var appId = "Parse App Id";
var fileKey = "Parse File Key";

/*
 Server url specify where Api will make requests:
 It will be wherever you host your server + '/parse'
 in case of heroku it would something like:
 'https://<Your App Name>.herokuapp.com/parse'
 */

var serverUrl = "Server Base Url" + "/parse";
/**
 * Your own Parse Dash board configurations
 */
var userName = "Any User Name";
var password = "Any Password";

/**
 * File System Configuration
 */
var accessKey = "Amazon Access Key";
var secretKey = "Amazon Secret Key";
var bucketName = "Amazon Bucket Name";

/**
 * MongoDB Database URI
 */

var databaseUri = "Your MongoDB URL";

var api = new ParseServer({
    databaseURI: databaseUri || databaseUri,
    cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
    appId: process.env.APP_ID || appId,
    masterKey: process.env.MASTER_KEY || masterKey, //Add your master key here. Keep it secret!
    fileKey: process.env.FILE_KEY || fileKey,
    serverURL: process.env.SERVER_URL || serverUrl,  // Don't forget to change to https if needed
    liveQuery: {
        classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
    },
    filesAdapter: new S3Adapter(
        accessKey,
        secretKey,
        bucketName,
        {directAccess: true}
    )
});

var dashboard = new ParseDashboard({
    "apps": [
        {
            "serverURL": serverUrl,
            "appId": appId,
            "masterKey": masterKey,
            "appName": appName,
            "production": true
        }
    ],
    "users": [
        {
            "user": userName,
            "pass": password
        }
    ],
    "useEncryptedPasswords": false
}, allowInsecureHTTP);

// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use(express.static(__dirname + '/public'));


// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});


app.use('/dashboard', dashboard);

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function () {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
