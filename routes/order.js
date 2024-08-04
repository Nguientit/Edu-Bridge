const express = require('express');
const path = require('path');
const router = express.Router();
const moment = require('moment');
const config = require('config');
const crypto = require('crypto');
const querystring = require('qs');
const axios = require('axios');

function sortObject(obj) {
  let sorted = {};
  let str = [];
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (let i = 0; i < str.length; i++) {
    sorted[str[i]] = encodeURIComponent(obj[str[i]]).replace(/%20/g, "+");
  }
  return sorted;
}

router.post('/create_payment_url', async (req, res) => {
  try {
    const exchangeRateResponse = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
    const exchangeRate = exchangeRateResponse.data.rates.VND;
    console.log('Exchange Rate (USD to VND):', exchangeRate);

    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');

    let ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    let tmnCode = config.get('vnp_TmnCode');
    let secretKey = config.get('vnp_HashSecret');
    let vnpUrl = config.get('vnp_Url');
    let returnUrl = 'http://localhost:3000/success'; // Frontend URL for handling return
    let orderId = moment(date).format('DDHHmmss');
    let amountUSD = req.body.amount;
    let amountVND = amountUSD * exchangeRate;
    console.log('Amount in USD:', amountUSD);
    console.log('Converted Amount in VND:', amountVND);

    let bankCode = req.body.bankCode;
    let locale = req.body.language || 'vn';
    let currCode = 'VND';

    let vnp_Params = {
      'vnp_Version': '2.1.0',
      'vnp_Command': 'pay',
      'vnp_TmnCode': tmnCode,
      'vnp_Locale': locale,
      'vnp_CurrCode': currCode,
      'vnp_TxnRef': orderId,
      'vnp_OrderInfo': 'Thanh toan cho ma GD:' + orderId,
      'vnp_OrderType': 'other',
      'vnp_Amount': Math.round(amountVND * 100),
      'vnp_ReturnUrl': returnUrl,
      'vnp_IpAddr': ipAddr,
      'vnp_CreateDate': createDate
    };

    if (bankCode) {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

    res.json({ paymentUrl: vnpUrl });
  } catch (error) {
    console.error('Error creating payment URL:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Handle VNPay return URL
router.get('/vnpay_return', (req, res) => {
  let vnp_Params = req.query;
  let secureHash = vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);
  let secretKey = config.get('vnp_HashSecret');
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

  let status = (secureHash === signed) ? 'success' : 'failure';
  let redirectUrl = `http://localhost:3000/success?status=${status}&amount=${vnp_Params['vnp_Amount']}&orderInfo=${vnp_Params['vnp_OrderInfo']}&bankCode=${vnp_Params['vnp_BankCode']}&transactionNo=${vnp_Params['vnp_TransactionNo']}`;
  res.redirect(redirectUrl);
});

module.exports = router;
