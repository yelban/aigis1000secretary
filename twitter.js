

// ライブラリ読み込み
var Twitter = require('twitter');
const request = require("request");
const crypto = require('crypto');
const line = require("./line.js");
const dbox = require("./dbox.js");
const config = require("./config.js");

// oauth認証に使う値
const twitter_oauth = {
    consumer_key: config.twitterCfg.TWITTER_CONSUMER_KEY.trim(),
    consumer_secret: config.twitterCfg.TWITTER_CONSUMER_SECRET.trim(),
    token: config.twitterCfg.TWITTER_ACCESS_TOKEN.trim(),
    token_secret: config.twitterCfg.TWITTER_ACCESS_TOKEN_SECRET.trim()
}
const bot = new Twitter({ // Twitterオブジェクトの作成
    consumer_key: twitter_oauth.consumer_key,
    consumer_secret: twitter_oauth.consumer_secret,
    access_token_key: twitter_oauth.token,
    access_token_secret: twitter_oauth.token_secret
});
String.prototype.replaceAll = function (s1, s2) {
    var source = this;
    while ((temp = source.replace(s1, s2)) != source) {
        source = temp;
    }
    return source.toString();
}

const twitterCore = {
    // webhook crc
    crc: {
        // https://qiita.com/Fushihara/items/79913a5b933af15c5cf4
        // CRC API
        crcRegistWebhook() {
            console.log("crcRegist");
            // Registers a webhook URL / Generates a webhook_id
            request.post({
                url: `https://api.twitter.com/1.1/account_activity/all/${config.twitterCfg.devLabel}/webhooks.json`,
                oauth: twitter_oauth,
                headers: { "Content-type": "application/x-www-form-urlencoded" },
                form: { url: config.twitterCfg.webhookUrl }
            }, (error, response, body) => { console.log(body) });
        },



        crcPostSubscriptions() {
            console.log("crcPostSubscriptions");
            request.post({
                url: `https://api.twitter.com/1.1/account_activity/all/${config.twitterCfg.devLabel}/subscriptions.json`,
                oauth: twitter_oauth,
                headers: { "Content-type": "application/x-www-form-urlencoded" },
            }, (error, response, body) => { if (error) console.log(error); else if (body) console.log(body); else console.log(response); });
        },
        crcGetSubscriptions() {
            console.log("crcGetSubscriptions");
            request.get({
                url: `https://api.twitter.com/1.1/account_activity/all/${config.twitterCfg.devLabel}/subscriptions.json`,
                oauth: twitter_oauth,
                headers: { "Content-type": "application/x-www-form-urlencoded" },
            }, (error, response, body) => { if (error) console.log(error); else if (body) console.log(body); else console.log(response); });
        },
        crcDelSubscriptions() {
            console.log("crcDelSubscriptions");
            request.delete({
                url: `https://api.twitter.com/1.1/account_activity/all/${config.twitterCfg.devLabel}/subscriptions.json`,
                oauth: twitter_oauth,
                headers: { "Content-type": "application/x-www-form-urlencoded" },
            }, (error, response, body) => { if (error) console.log(error); else if (body) console.log(body); else console.log(response); });
        },



        crcSubsc() {
            console.log("crcSubsc");
            // Subscribes an application to an account"s events
            // これが登録らしいんだけど、来ないんだよなあ
            const request_options = {
                url: `https://api.twitter.com/1.1/account_activity/all/${config.twitterCfg.devLabel}/subscriptions.json`,
                oauth: twitter_oauth
            };
            request.post(request_options, (error, response, body) => { console.log(`${response.statusCode} ${response.statusMessage}`); console.log(body) });
        },

        crcGetList() {
            console.log("crcGetList");
            // Returns all webhook URLs and their statuses
            // アクティブなwebhookのURL一覧を取得
            // [{"id":"900000000000000000","url":"https://example.com/twitter-webhook-test/","valid":true,"created_timestamp":"2018-05-16 17:04:41 +0000"}]
            const request_options = {
                url: `https://api.twitter.com/1.1/account_activity/all/${config.twitterCfg.devLabel}/webhooks.json`,
                oauth: twitter_oauth,
                headers: { "Content-type": "application/x-www-form-urlencoded" }
            };
            request.get(request_options, (error, response, body) => { console.log(body) });
        },

        crcPutHook() {
            console.log("crcPutHook");
            // Manually triggers a challenge response check
            // Registers a webhook URL / Generates a webhook_id
            // 登録したurlに "GET /twitter-webhook-test/index?crc_token=xxxxxxxxxxxxxxxxxxx&nonce=yyyyyyyyyyyyyyyy HTTP/1.1" のリクエストを送る
            // webhookの定期的なリクエストのテスト？
            const request_options = {
                url: `https://api.twitter.com/1.1/account_activity/all/${config.twitterCfg.devLabel}/webhooks/${config.twitterCfg.hookId}.json`,
                oauth: twitter_oauth,
                headers: { "Content-type": "application/x-www-form-urlencoded" },
            };
            request.put(request_options, (error, response, body) => { console.log(body) });
        },

        crcGetSubsc() {
            console.log("crcGetSubsc");
            // Check to see if a webhook is subscribed to an account
            // よくわからん。204が返ってきているのでOKの事らしいが
            const request_options = {
                url: `https://api.twitter.com/1.1/account_activity/all/${config.twitterCfg.devLabel}/subscriptions.json`,
                oauth: twitter_oauth,
                headers: { "Content-type": "application/x-www-form-urlencoded" }
            };
            request.get(request_options, (error, response, body) => { console.log(`${response.statusCode} ${response.statusMessage} ( 204ならok)`); console.log(body) });
        },

        crcCount() {
            console.log("crcCount");
            // Returns a count of currently active subscriptions
            // {"errors":[{"message":"Your credentials do not allow access to this resource","code":220}]}
            // 無料だと取れないっぽい？
            const request_options = {
                url: `https://api.twitter.com/1.1/account_activity/subscriptions/count.json`,
                oauth: twitter_oauth,
                headers: { "Content-type": "application/x-www-form-urlencoded" }
            };
            request.get(request_options, (error, response, body) => { console.log(body) });
        },

        crcList() {
            console.log("crcList");
            // Returns a list of currently active subscriptions
            // {"errors":[{"message":"Your credentials do not allow access to this resource","code":220}]}
            // 無料では取れないっぽい？
            const request_options = {
                url: `https://api.twitter.com/1.1/account_activity/all/${config.twitterCfg.devLabel}/subscriptions/list.json`,
                oauth: twitter_oauth,
                headers: { "Content-type": "application/x-www-form-urlencoded" }
            };
            request.get(request_options, (error, response, body) => { console.log(`${response.statusCode} ${response.statusMessage}`); console.log(body) });
        },

        crcDel() {
            console.log("crcDel");
            // Deletes the webhook
            // これを実行すると、get-listの戻り値がカラになる。
            const request_options = {
                url: `https://api.twitter.com/1.1/account_activity/all/${config.twitterCfg.devLabel}/webhooks/${config.twitterCfg.hookId}.json`,
                oauth: twitter_oauth,
                headers: { "Content-type": "application/x-www-form-urlencoded" }
            };
            request.delete(request_options, (error, response, body) => { console.log(`${response.statusCode} ${response.statusMessage}`); console.log(body) });
        },

        crcDes() {
            console.log("crcDes");
            // Deactivates subscription
            // delを実行した後なのでわからん
            const request_options = {
                url: `https://api.twitter.com/1.1/account_activity/all/${config.twitterCfg.devLabel}/subscriptions.json`,
                oauth: twitter_oauth,
                headers: { "Content-type": "application/x-www-form-urlencoded" }
            };
            request.delete(request_options, (error, response, body) => { console.log(`${response.statusCode} ${response.statusMessage} (204ならOKかな？)`); console.log(body) });
        }
    },
    webhook: {
        crcFunctions: function (request, response) {
            for (let key in twitterCore.crc) {
                if (key == request.params.function) {
                    twitterCore.crc[key]();
                    response.send("twitterCore.crc." + key + "()");
                    return;
                }
            }
            //response.send("Unknown function");
        },
        get: function (request, response) {
            // getでchallenge response check (CRC)が来るのでその対応
            const crc_token = request.query.crc_token
            if (crc_token) {
                const hash = crypto.createHmac('sha256', token_secret.consumer_secret).update(crc_token).digest('base64')
                console.log(`receive crc check. token=${crc_token} responce=${hash}`);
                response.status(200);
                response.send({
                    response_token: 'sha256=' + hash
                })
            } else {
                response.status(400);
                response.send('Error: crc_token missing from request.')
            }
        },
        post: function (request, response) {
            //console.log(JSON.stringify(request.body, null, 4));
            if (request.body) {
                var binary = new Buffer.from(JSON.stringify(request.body, null, 4));
                dbox.fileUpload("webhook/" + new Date(Date.now()).toLocaleString().replaceAll(":", "_") + ".json", binary, "add").catch(function (error) { });
            }
            response.send("200 OK");
        }
    },

    stream: {
        getUserId: function (target) {
            return new Promise(function (resolve, reject) {
                // 監視するユーザのツイートを取得
                bot.get('statuses/user_timeline', { screen_name: target },
                    function (error, tweets, response) {
                        if (!error) {
                            // 取得したtweet情報よりユーザ固有IDを文字列形式で取得
                            var user_id = tweets[0].user.id_str;
                            // 取得したユーザIDよりストリーミングで使用するオプションを定義
                            resolve(user_id);
                        } else {
                            // console.log(error);
                            line.botPushError(error);
                            //reject(error);
                        }
                    });
            });
        },

        litsen: async function (target, user_id, callback) {
            if (user_id == "") {
                user_id = await twitterCore.stream.getUserId(target);
            }

            // console.log(target + 'のツイートを取得します。');
            line.botPushLog(target + 'のツイートを取得します。');

            // ストリーミングでユーザのタイムラインを監視
            bot.stream('statuses/filter', { follow: user_id }, function (stream) {
                // Streamingの開始と受取
                stream.on('data', function (tweet) {
                    console.log("stream.on = data")

                    // RTと自分のツイートは除外
                    if (tweet && tweet.user && !tweet.retweeted_status) {

                        // 送信する情報を定義
                        var tweet_data = twitterCore.stream.getTweetData(tweet);

                        // 送信
                        if (tweet_data.text && tweet_data.screen_name == target) {
                            callback(tweet_data);
                        }
                    }
                });

                // // 接続開始時にはフォロワー情報が流れます
                // stream.on('friends', function (tweet) { console.log(JSON.stringify(tweet)); });
                // // つい消しの場合                    
                // stream.on('delete', function (tweet) { console.log(JSON.stringify(tweet)); });
                // // 位置情報の削除やふぁぼられといったeventはここに流れます
                // stream.on('event', function (tweet) { console.log(JSON.stringify(tweet)); });

                // エラー時は再接続を試みた方がいいかもしれません(未検証)
                stream.on('error', function (rawData) {
                    line.botPushLog("stream.on = error\ngetTweetData: ");
                    line.botPushLog(JSON.stringify(rawData, null, 4));
                    var tweet = rawData.source;

                    // RTと自分のツイートは除外
                    if (tweet && tweet.user && !tweet.retweeted_status) {

                        // 送信する情報を定義
                        var tweet_data = twitterCore.stream.getTweetData(tweet);

                        // 送信
                        if (tweet_data.text && tweet_data.screen_name == target) {
                            callback(tweet_data);
                        }
                    }
                });

                stream.on('end', function (tweet) {  // 接続が切れた際の再接続
                    stream.destroy();
                    // console.log(target + 'のツイートを取得終了。');
                    line.botPushLog(target + 'のツイートを取得終了。');

                    setTimeout(function () {
                        twitterCore.stream.litsen(target, user_id, callback);
                    }, 10 * 1000);
                });
            });
        },

        getTweetData: function (tweet) {
            // console.log("@@getTweetData: " + JSON.stringify(tweet, null, 4))
            var tweet_data = {};

            if (tweet.user.name) tweet_data.name = tweet.user.name;
            if (tweet.user.screen_name) tweet_data.screen_name = tweet.user.screen_name;

            if (tweet.created_at) tweet_data.created_at = tweet.created_at;
            if (tweet.timestamp_ms) tweet_data.timestamp_ms = tweet.timestamp_ms;

            if (tweet.extended_tweet && tweet.extended_tweet.full_text)
                tweet_data.text = tweet.extended_tweet.full_text;
            else if (tweet.text)
                tweet_data.text = tweet.text;

            tweet_data.media = [];
            if (tweet.extended_entities && tweet.extended_entities.media) {
                for (let i in tweet.extended_entities.media) {
                    let media = tweet.extended_entities.media[i];
                    
                    if (media.type != "photo") continue;

                    tweet_data.media.push({
                        link: media.media_url_https,
                        url: media.url  // same with tweet text
                    });
                }
            }

            if (tweet.geo) tweet_data.geo = tweet.geo;

            return tweet_data;
        },
    }

}
//twitterCore.stream.litsen("Aigis1000", function () { });
module.exports = twitterCore;

// twitterCore.stream.litsen("z1022001", "", function (tweet_data) {
//     console.log(JSON.stringify(tweet_data, null, 4));
// });

/*
const httpTwitterAPI = function () {

    let srcUrl = "https://mobile.twitter.com/aigis1000";

    // callback
    let requestCallBack = function (error, response, body) {
        if (error || !body) {
            console.log(error);
            return null;
        }

        var html = iconv.decode(new Buffer(body, "binary"), "UTF-8"); // EUC-JP to utf8 // Shift_JIS EUC-JP
        let $ = cheerio.load(html, { decodeEntities: false }); // 載入 body

        // remove all hashtag
        $(".dir-ltr").each(async function (i, iElem) {
            if ($(this).attr("class") != "twitter_external_link dir-ltr tco-link has-expanded-path") {
                if ($(this).attr("class") != "dir-ltr") {
                    $(this).remove();
                } else if (!($(this).parent().parent().parent().parent().parent(".tweet  ").attr("href"))) {
                    $(this).remove();
                }
            }
        });


        $(".dir-ltr").each(async function (i, iElem) {
            if ($(this).attr("class") == "twitter_external_link dir-ltr tco-link has-expanded-path") {
                return;
            }
            console.log("");

            let postId = $(this).parent().parent().parent().parent().parent(".tweet  ").attr("href");
            postId = postId.substring(postId.lastIndexOf("\/") + 1, postId.lastIndexOf("?"));
            console.log("@@@@" + postId + "");

            let postText = $(this).text().toString().trim()
            console.log(">>" + postText + "<<");

            if (postText.indexOf("pic.twitter.com") != -1) {
                // botPush(postText);
            }
        });


        //;
    }
    //request.get(srcUrl, { encoding: "binary" }, requestCallBack);
}//*/



