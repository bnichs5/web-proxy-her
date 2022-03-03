/***************
 * node-unblocker: Web Proxy for evading firewalls and content filters,
 * similar to CGIProxy or PHProxy
 *
 *
 * This project is hosted on github:  https://github.com/nfriedly/node-unblocker
 *
 * By Nathan Friedly - http://nfriedly.com
 * Released under the terms of the GPL v3
 */

//var url = require('url');
var url = require('url');
var epochtime = Math.floor(new Date().getTime() / 1000); // plus or minus 2 mins
var epochtime2 = Math.floor(new Date().getTime()); // plus or minus 2 mins
alert(epochtime);
alert(url);
alert(epochtime2);

const myArray = url.split("qqqq");
var decode11 = myArray[0];
decode11 = decode11.slice(0, 5) + ',' + decode11.slice(6);
decode11 = decode11.slice(0, 17) + decode11.slice(18);
decode11 = decode11.slice(0, 17) + decode11.slice(18);
decode11 = decode11.slice(0, 24) + decode11.slice(25);
decode11 = decode11.slice(0, 24) + decode11.slice(25);
decode11 = decode11.slice(0, 27) + decode11.slice(28);
decode11 = decode11.slice(0, 27) + decode11.slice(28);
decode11 = decode11.slice(0, 30) + decode11.slice(31);
decode11 = decode11.slice(0, 30) + decode11.slice(31);
decode11 = decode11.slice(0, 30) + decode11.slice(31);
decode11 = decode11.slice(0, 30) + decode11.slice(31);
decode11 = decode11.toString();
decode11 = decode11.replaceAll(',', '');



var querystring = require('querystring');
var express = require('express');
var unblocker = require('./lib/unblocker.js');
var Transform = require('stream').Transform;

var app = express();

var google_analytics_id = process.env.GA_ID || null;

function addGa(html) {
    if (google_analytics_id) {
        var ga = [
            "<script type=\"text/javascript\">",
            "var _gaq = []; // overwrite the existing one, if any",
            "_gaq.push(['_setAccount', '" + google_analytics_id + "']);",
            "_gaq.push(['_trackPageview']);",
            "(function() {",
            "  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;",
            "  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';",
            "  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);",
            "})();",
            "</script>"
            ].join("\n");
        html = html.replace("</body>", ga + "\n\n</body>");
    }
    return html;
}

function googleAnalyticsMiddleware(data) {
    if (data.contentType == 'text/html') {

        // https://nodejs.org/api/stream.html#stream_transform
        data.stream = data.stream.pipe(new Transform({
            decodeStrings: false,
            transform: function(chunk, encoding, next) {
                this.push(addGa(chunk.toString()));
                next();
            }
        }));
    }
}

var unblockerConfig = {
    prefix: '/cdn/',
    responseMiddleware: [
        googleAnalyticsMiddleware
    ]
};



// this line must appear before any express.static calls (or anything else that sends responses)
app.use(unblocker(unblockerConfig));

// serve up static files *after* the proxy is run
app.use('/', express.static(__dirname + '/public'));

// this is for users who's form actually submitted due to JS being disabled or whatever
app.get("/no-js", function(req, res) {
    // grab the "url" parameter from the querystring
    var site = querystring.parse(url.parse(req.url).query).url;
    // and redirect the user to /proxy/url
    res.redirect(unblockerConfig.prefix + site);
});

// for compatibility with gatlin and other servers, export the app rather than passing it directly to http.createServer
module.exports = app;