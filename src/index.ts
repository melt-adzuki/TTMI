import dotenv from "dotenv"
import { TweetV1, TwitterApi } from "twitter-api-v2"
import { api as misskeyApi } from "misskey-js"
import fetch from "node-fetch"
import sleep from "./sleep"

const { parsed } = dotenv.config()

if (typeof parsed === "undefined") throw new Error("設定ファイルの読み込みに失敗しました。")

const twitterClient = new TwitterApi({
    appKey: parsed.APP_KEY,
    appSecret: parsed.APP_SECRET,
    accessToken: parsed.ACCESS_TOKEN,
    accessSecret: parsed.ACCESS_SECRET,
})

const misskeyClient = new misskeyApi.APIClient({
    origin: parsed.ORIGIN,
    credential: parsed.CREDENTIAL,
    fetch,
})


let previousReversedTweets: TweetV1[] = []

setInterval(async () => {
    const homeTimeline = await twitterClient.v1.homeTimeline()
    const reversedTweets = homeTimeline.tweets.reverse()

    if (reversedTweets === previousReversedTweets) return
    previousReversedTweets = reversedTweets

    for (const tweet of reversedTweets) {
        const body = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
        await misskeyClient.request("notes/create", { text: body })

        await sleep(5000)
    }
}, 1000 * 60 * 60)
