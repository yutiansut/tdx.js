const axios = require('axios')
const crypto = require('crypto')
const fs = require("fs")

if (!Buffer) {
    const Buffer = require('buffer').Buffer
} 

/** 
 * Trade 模块需要配合TdxTradeServer使用...
*/
class TradeApi {
    constructor(endpoint, encoding='utf-8', encKey = null, encIv = null) {
        this._endpoint = endpoint
        this._encoding = encoding || 'utf-8'

        if (!encKey || !encIv) {
            this._transportEnc = false
            this._transportEncKey = null
            this._transportEncIv = null
        } else {
            this._transportEnc = true
            if (!Buffer.isBuffer(encKey)) {
                this._transportEncKey = Buffer.from(encKey, "utf-8")
                this._transportEncIv = Buffer.from(encIv, "utf-8")
            } else {
                this._transportEncKey = encKey
                this._transportEncIv = encIv
            }
        }
    }

    async callApi(func, params) {
        let response
        let jsonObj = {
            "func" : func
        }

        if (params) {
            jsonObj["params"] = params
        }

        try {
            if (this._transportEnc) {
                const dataToSend = this.encrypt(jsonObj)
                response = await axios.post(this._endpoint, dataToSend, {responseType: 'arraybuffer'})
            } else {
                response = await axios.post(this._endpoint, jsonObj, {responseType: 'arraybuffer'})
            }
        } catch (error){
            return {
                "success" : false,
                "error" : error.toString()
            }
        }
        
        if (response.status == 200) {
            if (this._transportEnc) {
                const responseData = response.data.toString(this._encoding)
                return JSON.parse(this.decrypt(responseData))
            } else{
                return JSON.parse(response.data.toString(this._encoding))
            }
        } else {
            return {
                "success": false,
                "error": response.toString()
            }
        }

    }

    encrypt(sourceObj) {
        const cipher = crypto.createCipheriv("aes-128-cbc", this._transportEncKey, this._transportEncIv)
        cipher.setAutoPadding(false)
        let source = JSON.stringify(sourceObj)
        source = Buffer.from(source, this._encoding)
        source = this.makeEmptyPaddingBinary(source)
        fs.writeFileSync("/tmp/jsdata.in", source)
        const start = cipher.update(source)
        const finaled = cipher.final()
        const encData = Buffer.concat([start, finaled])
        const b64EncData = encData.toString("base64")
        return encodeURIComponent(b64EncData)
    }

    decrypt(source) {
        const decipher = crypto.createDecipheriv("aes-128-cbc", this._transportEncKey, this._transportEncIv)
        decipher.setAutoPadding(false)
        source = decodeURIComponent(source)
        source = Buffer.from(source, "base64")
        let dataBytes = Buffer.concat([decipher.update(source), decipher.final()])
        dataBytes = this._trimBufferEnd(dataBytes)
        return dataBytes.toString(this._encoding)
    }

    _trimBufferEnd (buffer) {
        var pos = 0
        for (var i = buffer.length - 1; i >= 0; i--) {
            if (buffer[i] !== 0x00) {
                pos = i
                break
            }
        }
        return buffer.slice(0, pos + 1)
    }
    

    makeEmptyPaddingBinary(source) {
        const needToPadding = 16 - (source.length % 16)
        if (needToPadding > 0) {
            let newSource = Buffer.alloc(source.length + needToPadding, 0x0).fill(source, 0, source.length)
            return newSource
        } else {
            return source
        }
    }

    // #region Function Wrappers

    async ping() {
        return await this.callApi("ping", null)
    }

    async logon(ip, port, version, yybId, accountId, tradeAccount, jyPasswrod, txPassword) {
        return await this.callApi("logon", {
            "ip": ip,
            "port": port,
            "version": version,
            "yyb_id": yybId,
            "account_no": accountId,
            "trade_account": tradeAccount,
            "jy_password": jyPasswrod,
            "tx_password": txPassword
        })
    }

    async logoff(clientId) {
        return await this.callApi("logoff", {
            "client_id": clientId
        })
    }

    async queryData(clientId, category) {
        return await this.callApi("query_data", {
            "client_id": clientId,
            "category": category
        })
    }

    async sendOrder(clientId, category, priceType, gddm, zqdm, price, quantity) {
        return await this.callApi("send_order", {
            'client_id': clientId,
            'category': category,
            'price_type': priceType,
            'gddm': gddm,
            'zqdm': zqdm,
            'price': price,
            'quantity': quantity
        })
    }

    async cancelOrder(clientId, exchangeId, hth) {
        return await this.callApi("cancel_order", {
            'client_id': clientId,
            'exchange_id': exchangeId,
            'hth': hth
        })
    }

    async getQuote(clientId, code) {
        return await this.callApi("get_quote", {
            'client_id': clientId,
            'code': code,
        })
    }

    async repay(clientId, amount) {
        return await this.callApi("repay", {
            'client_id': clientId,
            'amount': amount
        })
    }

    async queryHistoryData(clientId, category, beginDate, endDate) {
        return await this.callApi.call('query_history_data', {
            'client_id': clientId,
            'category': category,
            'begin_date': beginDate,
            'end_date': endDate
        })
    }


    // #endregion 
}

module.exports = TradeApi