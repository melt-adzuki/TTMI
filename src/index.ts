import dotenv from "dotenv"
import { TwitterApi } from "twitter-api-v2"
import { api as misskeyApi } from "misskey-js"
import fetch from "node-fetch"
import sleep from "./sleep"

const { parsed } = dotenv.config()

if (typeof parsed === "undefined") throw new Error("設定ファイルの読み込みに失敗しました。")

const client = new TwitterApi({
    appKey: parsed.APP_KEY,
    appSecret: parsed.APP_SECRET,
    accessToken: parsed.ACCESS_TOKEN,
    accessSecret: parsed.ACCESS_SECRET,
})

const cli = new misskeyApi.APIClient({
    origin: parsed.ORIGIN,
    credential: parsed.CREDENTIAL,
    fetch,
})

;(async () => {
    const homeTimeline = await client.v1.homeTimeline()

    for await (const tweet of homeTimeline) {
        const body = `${tweet.user.name}\n\n${tweet.full_text}\nhttps://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
        await cli.request("notes/create", { text: body })

        await sleep(5000)
    }
})()
