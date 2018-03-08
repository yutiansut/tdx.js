# tdx js 接口

> 此接口在node v8.5.0 环境下开发测试


## 安装

```
npm install tdx.js
```

## 交易相关 `trade` 模块

`trade` 模块需要配合 `TdxTradeServer` ([连接](https://github.com/rainx/TdxTradeServer)) 使用

```javascript

const { TradeApi } = require('tdx.js')
const process = require("process")
const TEST_ENDPOINT = "http://10.11.5.215:10092/api"
const TEST_ENC_KEY  = "4f1cf3fec4c84c84"
const TEST_ENC_IV   = "0c78abc083b011e7"

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
```

## 接口列表

* ping ping()
* 登录 logon(ip, port, version, yybId, accountId, tradeAccount, jyPasswrod, txPassword)
* 登出 logoff(clientId) 
* 查询信息 queryData(clientId, category)
* 查询历史信息 queryHistoryData(clientId, category)
* 下单 sendOrder(clientId, category, priceType, gddm, zqdm, price, quantity) 
* 撤单 cancelOrder(clientId, exchangeId, hth)
* 行情查询 getQuote(clientId, code)
* 融资融券账户直接还款 repay(clientId, amount)



## TODO

- [ ] 完善行情部分的接口
    - [ ] 标注行情
    - [ ] 扩展行情
- [ ] trade部分支持从浏览器直接访问（需要TdxTradeServer增加CROS)支持
- [ ] 测试集编写
