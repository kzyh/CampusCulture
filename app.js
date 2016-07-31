var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var twitter = require('twitter')
var NodeCache = require( "node-cache" );
var pos = require('pos');
var request = require('request');

//var routes = require('./routes/index');
//var users = require('./routes/users');

var app = express();
var cache = new NodeCache({stdTTL: 900, checkperiod: 1800 })

var twitterClient = new twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', routes);
//app.use('/users', users);
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

var getData = function() {
    console.log('getdata');
    var tweetList = [];
    var url = 'search/tweets.json?q=&geocode=40.1020,-88.2272,1mi&result_type=recent&count=10';
    twitterClient.get(url, function(error, tweets, response) {
        for (var i in tweets['statuses']) {
            tweetList.push(tweets['statuses'][i]);
        }

        //var max;
        //for (var i = 0; i < 10; i++) {
        //    if (i==0) {
        //        twitterClient.get(url, function(error, tweets, response) {
        //            console.log(tweets);
        //            for (var i in tweets['statuses']) {
        //                tweetList.push(tweets['statuses'][i]);
        //            }
        //            max = tweets['max_id_str'];
        //        })
        //    } else {}
        //        twitterClient.get(url+max, function(error, tweets, response) {
        //            console.log(tweets);
        //            for (var i in tweets['statuses']) {
        //                tweetList.push(tweets['statuses'][i]);
        //            }
        //            max = tweets['max_id_str'];
        //        })
        //    }
        //}
        console.log('tweetlist');
        var nouns = {}
        var nouns2 = []
        for (var i in tweetList) {
            var words = new pos.Lexer().lex(tweetList[i]['text']);
            var taggedWords = new pos.Tagger().tag(words);
            for (i in taggedWords) {
                var taggedWord = taggedWords[i];
                var word = taggedWord[0];
                var tag = taggedWord[1];
                if (tag == 'NN') {
                    if (word in nouns) {
                        nouns[word] = nouns[word] + 1;
                    } else {
                        nouns[word] = 0;
                    }
                }
            }
        }
        for (key in nouns) {
            if (nouns[key] < 100) {
                delete nouns[key];
            }
        }
        for (key in nouns) {
            nouns2.push(key);
        }
        console.log('nouns');
        for (var i in tweetList) {
            for (var j in tweetList[i]['hashtags']) {
                nouns2.push(tweetList[j]['hashtags'][x]['text'])
            }
        }
        var body = {}
        var sentiment = []
        for (var i in tweetList) {
            for (var j in nouns2) {
                if (tweetList[i]['text'].indexOf(nouns2[j]) !== -1) {
                    sentiment.push({"text": tweetList[i]['text'], "id": i, "query": nouns2[j]})
                }
            }
        }
        console.log('sentimentsetup');
        body['data'] = sentiment
        responsebody = {}
        //request({url: 'http://www.sentiment140.com/api/bulkClassifyJson?appid=kevin.zy.hong@gmail.com', method: "POST", json: body}, function(err, response, body) {
        //    responsebody['classified'] = body['data'];
        //})
        console.log('sentiment compelte');
        responsebody['tweets'] = tweetList;
        console.log(JSON.stringify(responsebody));
        return JSON.stringify(responsebody);
    });
}


app.get('/', function(req, res, next) {
    res.render('index', {title:'Campus Culture'});
})

app.get('/ajax', function(req, res, next) {
    console.log('1');
    res.set('Content-Type', 'JSON');
    res.send(getData());
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
