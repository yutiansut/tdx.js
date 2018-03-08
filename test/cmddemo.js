const { TradeApi } = require('../')
const process = require("process")

const TEST_ENDPOINT = "http://10.11.5.215:10092/api"
const TEST_ENC_KEY  = "4f1cf3fec4c84c84"
const TEST_ENC_IV   = "0c78abc083b011e7"


const tradeapi = new TradeApi(TEST_ENDPOINT, "utf-8", TEST_ENC_KEY, TEST_ENC_IV)
const encoded = tradeapi.encrypt("hello")
console.log(encoded)
const decoded = tradeapi.decrypt(encoded)
console.log(decoded)
const api = new TradeApi(TEST_ENDPOINT, "utf-8", null, null)

async function testApis() {

    console.log(await api.ping())

    acc = process.env.TDX_ACCOUNT
    password = process.env.TDX_PASS
    let response
    response = await api.logon("202.108.253.186", 7708,
              "8.23", 32,
              acc, acc, password, "")
    console.log(response)
    // 登入
    const clientId = response["data"]["client_id"]
    console.log(`client id is ${clientId}`)

    // 查询
    for (let i of [0,1,2,3,4,5,6,7,8,12,13,14,15]) {
        console.log(`---查询信息 cate=${i}--`)
        response = await api.queryData(clientId, i)
        console.log(response)
    }

    console.log("---查询报价---")
    console.log(await api.getQuote(clientId, '600315'))

    // 登出
    response = await(api.logoff(clientId))
    console.log(response)
}

testApis()
