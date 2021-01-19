const originalFetch = require("node-fetch");
global.Headers = originalFetch.Headers;
const fetch = require('fetch-retry')(originalFetch, {
  retries: 155,
  retryDelay: 1500
});

let { PythonShell } = require('python-shell')

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const webhook = require("discord-webhook-node");
const hook = new webhook.Webhook(
  "hookUrl"
);

const ProxyAgent = require("proxy-agent");

const fs = require('fs')

//Создание таска
function createTask(url, profileName, proxyText) {
  const jsonProxy = require("./proxies.json");
  let proxy = jsonProxy[proxyText]['value']

  const jsonSb = require("./sb-profiles.json");
  const jsonTsum = require("./tsum-profiles.json");
  const jsonNike = require("./nike-profiles.json");

  const sbProfilesArr = Array.from(Object.keys(jsonSb));
  const nikeProfilesArr = Array.from(Object.keys(jsonNike));
  const tsumProfilesArr = Array.from(Object.keys(jsonTsum))

  const tab = document.getElementById("tab")
  const tabLength = tab.children.length;

  const elem = tab.children[tabLength - 1]

  // Create a copy of it
  const clone = elem.cloneNode(true);

  // Update the ID and add a class
  clone.id = "elem" + (parseInt(elem.id.substr(4)) + 1);
  clone.classList.add("text-large");

  // Inject it into the DOM
  elem.after(clone);

  document.getElementById(clone.id).children[0].children[0].innerHTML = url;

  document.getElementById(clone.id).children[2].children[0].innerHTML = profileName.substr(0, 15);

  document.getElementById(clone.id).children[3].children[0].innerHTML = proxyText;

  if (tsumProfilesArr.includes(profileName)) {
    document.getElementById(clone.id).children[0].children[0].innerHTML = url;
  } else if (nikeProfilesArr.includes(profileName)) {
    document.getElementById(clone.id).children[0].children[0].innerHTML = 'NIKE RU ' + url;
  }

  let status = clone.children[4].children[0];

  status.innerHTML = 'none'
  status.style.color = '#8a8a8a'

  if (proxy != 'no proxy') {
    proxy = `http://${proxy}`;
  }

  // let controller = new AbortController();

  clone.children[5].children[0].onclick = function () {
    if (tsumProfilesArr.includes(profileName)) {
      getAvailableSizesTsum(url, status, jsonTsum[profileName], proxy, clone)
    } else if (sbProfilesArr.includes(profileName)) {
      getSizesSb(jsonSb[profileName], url, status, proxy, clone); //старт бота
    } else if (nikeProfilesArr.includes(profileName)) {
      startSecond = parseInt((document.getElementById(clone.id).children[0].children[0].innerHTML = 'NIKE RU ' + url).substr(8));
      nike(jsonNike[profileName], status, startSecond, proxy)
    }
  };

  // clone.children[5].children[1].onclick = function () {
  //   controller.abort()
  // };

  //удалить таск
  clone.children[5].children[2].onclick = function () {
    tab.removeChild(clone);
  };
}

//////////////////////============================================ МОДУЛЬ NIKE
function nike(profile, status, startSecond, proxy) {
  const jsonNikeLaunches = require("./nike-launches.json");


  const authToken = profile['token']
  const checkoutId = profile['checkoutId']
  const skuId = profile['sku']

  const mail = profile['mail']
  const card = profile['card']

  const launchId = jsonNikeLaunches['nike'][0]['launchId']
  const cvc = profile['cvc']
  const price = jsonNikeLaunches['nike'][0]['price']

  const log = profile['log']

  let options = {
    mode: 'text',
    args: [authToken, checkoutId, skuId, mail, card, launchId, cvc, price, startSecond]
  };

  startPythonTask(options)


  function startPythonTask(options) {
    status.style.color = "orange";
    status.innerHTML = "working"
    const path = require('path');
    const pathToNikeModule = require('electron').remote.app.getAppPath();
    const pathToPythonScript = path.join(pathToNikeModule, 'fullReq.py');
    PythonShell.run(pathToPythonScript, options, function (err, results) {
      if (err) throw err;
      console.log(results);

      const indent = '\n' + '\n'
      const text = indent.concat(results.join('\n'));
      fs.appendFile(`resources/app/logs/log-${log}.txt`, text, 'utf8', function (err) {
        if (err) throw err;
      });

      const messageSuccess = 'creationDate'
      const messageError = 'message'

      let resultSuccess = null
      let resultError = null

      for (let i = 0; i < results.length; i++) {
        if (results[i].split(messageSuccess)[1] != undefined) {
          resultSuccess = results[i].split(messageSuccess)[1]
        }
        if (results[i].split(messageError)[1] != undefined) {
          resultError = results[i].split(messageError)[1]
        }
      }
      if (resultSuccess != null) {
        status.style.color = "green";
        status.innerHTML = resultSuccess.substr(5, 24)
      } else {
        status.style.color = "red";
        status.innerHTML = resultError.substr(5, 24)
      }
    });
  }
}

//////////////////////============================================ Ф-ИИ ТОЛЬКО ДЛЯ КНОПОК

function startAllTasks() {
  const tab = document.getElementById("tab");
  for (let i = 1; i < tab.children.length; i++) {
    tab.children[i].children[5].children[0].click();
  }
}

function stopAllTasks() {
  const tab = document.getElementById("tab");
  for (let i = 1; i < tab.children.length; i++) {
    tab.children[i].children[5].children[1].click();
  }
}

function getSizesNike(productId) {  //получает skuIds с backend'а nike
  const myHeaders = new Headers();
  myHeaders.append("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36");
  myHeaders.append("Content-Type", "application/json; charset=UTF-8");

  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  const skusArr = [];

  fetch(`https://api.nike.com/merch/skus/v2/?filter=productId%28${productId}%29&filter=country%28RU%29`, requestOptions)
    .then((response) => response.json())
    .then((result) => {
      for (let i = 0; i < result['objects'].length; i++) {
        skusArr.push(result['objects'][i]['id'])
      }
      console.log(skusArr);
      fs.readFile('resources/app/nike-launches.json', 'utf8', (err, jsonString) => {
        if (err) {
          console.log("File read failed:", err)
          return
        }
        const obj = JSON.parse(jsonString);
        obj["nike"][0]["skuId"] = skusArr;
        json = JSON.stringify(obj)
        writeToJson(json)
      })
    })

  function writeToJson(json) {
    fs.writeFile('resources/app/nike-launches.json', json, function (err) {
      if (err) throw err;
      console.log('complete');
    });
  }
}




//////////////////////============================================ МОДУЛЬ STREET-BEAT
function getSizesSb(profile, url, status, proxy, clone) { //получаем доступные размеры продукта
  const sizes =
    "body > main > section.product-section.product-section--top.product-section_offset.product-section-detail-top > div.js_product-slider-with-nav > div.grid-container.product-item > div > div.product-col__aside.product-col__aside--right > div.product-col__block.product-col__block-props.js-delivery-delivery.button-parent > div.sizes > div.sizes__bottom > ul.sizes__table.current";
  const randomSizeArr = [];
  status.style.color = 'black'
  status.innerHTML = "getting sizes";

  let requestOptions = null;

  let controller = new AbortController();
  const signal = controller.signal;

  clone.children[5].children[1].onclick = function () {
    controller.abort()
  };

  requestOptions = {
    method: 'GET',
    redirect: 'follow',
    signal: controller.signal,
    retryOn: function (attempt, error, response) {
      // retry on any network error, or 4xx or 5xx status codes
      if (error !== null || response.status >= 400) {
        console.log(`retrying, attempt number ${attempt + 1}`);
        status.innerHTML = `retrying getting sizes ${attempt + 1}`;
        if (signal.aborted == true) {
          status.style.color = "red";
          status.innerHTML = 'stopped'
          throw new Error(error)
        }
        return true;
      }
    }
  };

  if (proxy != 'no proxy') {
    requestOptions.agent = new ProxyAgent(proxy)
  }

  fetch(url, requestOptions)
    .then((response) => response.text())
    .then((result) => {
      const dom = new JSDOM(result);
      console.log(
        dom.window.document.querySelector(sizes).children[0].children[0].dataset
          .prodId + " = data-prod-id"
      );
      for (
        let i = 0;
        i < dom.window.document.querySelector(sizes).childElementCount;
        i++
      ) {
        if (
          dom.window.document.querySelector(sizes).children[i].className !=
          "missing"
        ) {
          console.log(
            dom.window.document.querySelector(sizes).children[i].children[0]
              .dataset.size + " = size"
          );
          console.log(
            dom.window.document.querySelector(sizes).children[i].children[0]
              .dataset.skuId + " = data-sku-id"
          );
          randomSizeArr.push(
            dom.window.document.querySelector(sizes).children[i].children[0]
              .dataset.skuId
          );
        }
      }

      const productId = dom.window.document.querySelector(sizes).children[0]
        .children[0].dataset.prodId;
      console.log("\n");


      const myHeaders = new Headers();
      myHeaders.append(
        "Accept",
        "application/json, text/javascript, */*; q=0.01"
      );
      myHeaders.append("X-Requested-With", "XMLHttpRequest");
      myHeaders.append(
        "User-Agent",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Safari/537.36"
      );
      myHeaders.append(
        "Content-Type",
        "application/x-www-form-urlencoded; charset=UTF-8"
      );
      myHeaders.append("Sec-Fetch-Site", "same-origin");
      myHeaders.append("Sec-Fetch-Mode", "cors");
      myHeaders.append("Sec-Fetch-Dest", "empty");

      fetchCookies(randomSizeArr, myHeaders, url, status, productId, proxy, clone, profile);
    })
    .catch((error) => console.log("error", error));
}

function fetchCookies(randomSizeArr, myHeaders, url, status, productId, proxy, clone, profile) {  //получаем куки и PHPSESSIONID
  status.innerHTML = "fetch cookies";

  let requestOptions = null;

  let controller = new AbortController();
  const signal = controller.signal;

  clone.children[5].children[1].onclick = function () {
    controller.abort()
  };

  requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow',
    signal: controller.signal,
    retryOn: function (attempt, error, response) {
      // retry on any network error, or 4xx or 5xx status codes
      if (error !== null || response.status >= 400) {
        console.log(`retrying, attempt number ${attempt + 1}`);
        status.innerHTML = `retrying fetch cookies ${attempt + 1}`;
        if (signal.aborted == true) {
          status.style.color = "red";
          status.innerHTML = 'stopped'
          throw new Error(error)
        }
        return true;
      }
    }
  };

  if (proxy != 'no proxy') {
    requestOptions.agent = new ProxyAgent(proxy)
  }

  const productSku =
    randomSizeArr[Math.floor(Math.random() * randomSizeArr.length)];

  fetch(url, requestOptions)
    .then((response) => response.headers.get("set-cookie"))
    .then((result) => {
      let PHPSESSID = result.split(";")[0];
      let BITRIX_SM_SALE_UID = result.split(";")[7].split(",")[1];
      let cookie = PHPSESSID.concat(`;${BITRIX_SM_SALE_UID};`);
      console.log(cookie);
      myHeaders.append("Cookie", cookie);
      addToCartSb(productSku, myHeaders, status, productId, proxy, clone, profile)
    })
    .catch((error) => console.log("error", error));
}

function addToCartSb(productSku, myHeaders, status, productId, proxy, clone, profile) { //Добавляем продукт в карту
  status.innerHTML = "adding to cart";

  const urlencoded = new URLSearchParams();
  urlencoded.append("action", "add");
  urlencoded.append("code", productId);
  urlencoded.append("count", "1");
  urlencoded.append("id", productSku);
  urlencoded.append("properties[SIZE_TYPE]", "tab_rus");
  urlencoded.append("skuCode", productSku);

  let requestOptions = null;

  let controller = new AbortController();
  const signal = controller.signal;

  clone.children[5].children[1].onclick = function () {
    controller.abort()
  };

  requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: urlencoded,
    redirect: 'follow',
    signal: controller.signal,
    retryOn: function (attempt, error, response) {
      // retry on any network error, or 4xx or 5xx status codes
      if (error !== null || response.status >= 400) {
        console.log(`retrying, attempt number ${attempt + 1}`);
        status.innerHTML = `retrying adding to cart ${attempt + 1}`;
        if (signal.aborted == true) {
          status.style.color = "red";
          status.innerHTML = 'stopped'
          throw new Error(error)
        }
        return true;
      }
    }
  };

  if (proxy != 'no proxy') {
    requestOptions.agent = new ProxyAgent(proxy)
  }

  fetch(
    "https://street-beat.ru/local/components/multisite/order/ajax.php",
    requestOptions
  )
    .then((response) => response.json())
    .then((result) => {
      console.log(
        result["basket"]["ddlCart"]["lineItems"][0]["product"]["name"]
      );
      console.log(
        result["basket"]["ddlCart"]["lineItems"][0]["product"]["size"]
      );
      console.log(result["basket"]["ddlCart"]["subtotal"]);
      console.log("\n");
      const size = result["basket"]["ddlCart"]["lineItems"][0]["product"]["size"]
      loginAcc(myHeaders, status, size, proxy, clone, profile);
    })
    .catch((error) => console.log("error", error));
}

function loginAcc(myHeaders, status, size, proxy, clone, profile) { //уже зареганный акк(надо войти в него)
  status.innerHTML = "logining account";
  const urlencoded = new URLSearchParams();
  urlencoded.append("EMAIL", profile['mail']);
  urlencoded.append("NAME", profile['firstname']);
  urlencoded.append("PERSONAL_PHONE", profile['phone']);
  urlencoded.append("REG_TYPE", "ORDER_REGISTERED");
  urlencoded.append("TYPE", "MEDIUM");

  let controller = new AbortController();
  const signal = controller.signal;

  clone.children[5].children[1].onclick = function () {
    controller.abort()
  };


  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: urlencoded,
    redirect: 'follow',
    signal: controller.signal,
    retryOn: function (attempt, error, response) {
      // retry on any network error, or 4xx or 5xx status codes
      if (error !== null || response.status >= 400) {
        console.log(`retrying, attempt number ${attempt + 1}`);
        status.innerHTML = `retrying login acc ${attempt + 1}`;
        if (signal.aborted == true) {
          status.style.color = "red";
          status.innerHTML = 'stopped'
          throw new Error(error)
        }
        return true;
      }
    }
  };

  if (proxy != 'no proxy') {
    requestOptions.agent = new ProxyAgent(proxy)
  }

  fetch("https://street-beat.ru/order/auth/", requestOptions)
    .then(() => {
      console.log("account logined" + "\n" + profile['mail'] + "\n");
      setTimeout(() => completeOrder(myHeaders, status, size, proxy, clone, profile), 2000);
    })
    .catch((error) => console.log("error", error));
}

function completeOrder(myHeaders, status, size, proxy, clone, profile) {  //отправляем заказ
  status.innerHTML = "completing order";

  const STREET = profile['street'];
  const HOUSE = profile['house'];
  const ZIP = profile['zip'];
  const FIRSTNAME = profile['firstname'];
  const LASTNAME = profile['lastname']
  const OT4ESTVO = profile['ot4estvo'];

  const deliveryDateEN = new Date(
    Date.now() + 86400 * 4 * 1000
  ).toLocaleDateString("en-GB");

  const deliveryDateRU = deliveryDateEN;

  const urlencoded = new URLSearchParams();
  urlencoded.append("COMMENT", "");
  urlencoded.append("DELIVERY_DATE", deliveryDateRU);
  urlencoded.append("DELIVERY_ID", "2");
  urlencoded.append("DELIVERY_TIME", "1");
  urlencoded.append("FLAT", "");
  urlencoded.append("FULL_ADDRESS", `${ZIP}, г Москва, ${STREET}, д ${HOUSE}`);
  urlencoded.append("HOUSE", HOUSE);
  urlencoded.append("IS_EXPRESS", "N");
  urlencoded.append("MKAD", "Y");
  urlencoded.append("NAME", FIRSTNAME);
  urlencoded.append("LAST_NAME", LASTNAME);
  urlencoded.append("SECOND_NAME", OT4ESTVO);
  urlencoded.append("ORDER_METHOD", "desktop-version");
  urlencoded.append("PAY_SYSTEM_ID", "8"); // 4 ето налик типа 8 ето карта
  urlencoded.append("REGION_DADATA", "Москва");
  urlencoded.append("SETTLEMENT", "Москва");
  urlencoded.append("SETTLEMENT_CITY", "Москва");
  urlencoded.append("STREET", STREET);
  urlencoded.append("action", "order-create");
  urlencoded.append("mode", "");

  let controller = new AbortController();
  const signal = controller.signal;

  clone.children[5].children[1].onclick = function () {
    controller.abort()
  };

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: urlencoded,
    redirect: 'follow',
    signal: controller.signal,
    retryOn: function (attempt, error, response) {
      // retry on any network error, or 4xx or 5xx status codes
      if (error !== null || response.status >= 400) {
        console.log(`retrying, attempt number ${attempt + 1} `);
        status.innerHTML = `retrying mkging order ${attempt + 1} `;
        if (signal.aborted == true) {
          status.style.color = "red";
          status.innerHTML = 'stopped'
          throw new Error(error)
        }
        return true;
      }
    }
  };

  if (proxy != 'no proxy') {
    requestOptions.agent = new ProxyAgent(proxy)
  }

  fetch(
    "https://street-beat.ru/local/components/multisite/order/ajax.php",
    requestOptions
  )
    .then((response) => response.json())
    .then((result) => {
      console.log(result["prop"]["ORDER_USER_IP"]);
      status.style.color = "green";
      status.innerHTML = "Success! Check your discord webhook!";
      if (typeof result["errors"] === "undefined") {
        console.log("Order number: " + result["orderNumber"]);
        console.log(
          "https://street-beat.ru/pay-ym.php?order=" + result["orderNumber"]
        );
        hook.send(
          "https://street-beat.ru/pay-ym.php?order=" +
          result["orderNumber"] +
          "\n" +
          profile['mail'] + ' ' + size
        );
      } else {
        console.log(result["errors"]);
        status.style.color = "red";
        status.innerHTML = result["errors"];
      }
    })
    .catch((error) => console.log("error", error));
}


//////////////////////============================================ МОДУЛЬ TSUM.RU
function getAvailableSizesTsum(url, status, profile, proxy, clone) { //получаем доступные размеры 
  status.style.color = 'black'
  status.innerHTML = "getting sizes";

  const token = profile['token']

  const myHeaders = new Headers();

  myHeaders.append("X-Auth-Token", "token");
  myHeaders.append(
    "User-Agent",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36"
  );
  myHeaders.append("Content-Type", "application/json");

  let controller = new AbortController();
  const signal = controller.signal;

  clone.children[5].children[1].onclick = function () {
    controller.abort()
  };

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
    signal: controller.signal,
    retryOn: function (attempt, error, response) {
      // retry on any network error, or 4xx or 5xx status codes
      if (error !== null || response.status >= 400) {
        console.log(`retrying, attempt number ${attempt + 1}`);
        status.innerHTML = `retrying getting sizes ${attempt + 1}`;
        if (signal.aborted == true) {
          status.style.color = "red";
          status.innerHTML = 'stopped'
          throw new Error(error)
        }
        return true;
      }
    }
  };

  if (proxy != 'no proxy') {
    requestOptions.agent = new ProxyAgent(proxy)
  }

  url = url.split('product/');

  fetch(
    `https://api.tsum.ru/v2/catalog/item/${url[1]}`,
    requestOptions
  )
    .then((response) => response.json())
    .then((result) => {
      const skusArr = [];
      for (let i = 0; i < result["skuList"].length; i++) {
        if (result["skuList"][i]['availabilityInStock'] === true) {
          skusArr.push(result["skuList"][i]['id'])
        }
      }
      console.log(skusArr);
      const sku = skusArr[Math.floor(Math.random() * skusArr.length)];
      addToCartTsum(sku, myHeaders, status, profile, proxy, clone);
    })
    .catch((error) => console.log("error", error));
}

//////==================================================

function addToCartTsum(sku, myHeaders, status, profile, proxy, clone) { //добавляем продукт в карту
  status.innerHTML = "adding to cart";

  const raw = { "type": "sku", "id": sku };

  let controller = new AbortController();
  const signal = controller.signal;

  clone.children[5].children[1].onclick = function () {
    controller.abort()
  };

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(raw),
    redirect: "follow",
    signal: controller.signal,
    retryOn: function (attempt, error, response) {
      // retry on any network error, or 4xx or 5xx status codes
      if (error !== null || response.status >= 400) {
        console.log(`retrying, attempt number ${attempt + 1}`);
        status.innerHTML = `retrying adding to cart ${attempt + 1}`;
        if (signal.aborted == true) {
          status.style.color = "red";
          status.innerHTML = 'stopped'
          throw new Error(error)
        }
        return true;
      }
    }
  };

  if (proxy != 'no proxy') {
    requestOptions.agent = new ProxyAgent(proxy)
  }


  fetch("https://api.tsum.ru/cart/item", requestOptions)
    .then((response) => response.json())
    .then((result) =>
      console.log({
        item: result["items"][0]["title"],
        price: result["items"][0]["price"],
      })
    )
    .then(() => getPickupRates(myHeaders, status, profile, proxy, clone))
    .catch((error) => console.log("error", error));
}

function getPickupRates(myHeaders, status, profile, proxy, clone) { //получаем даты самовывоза
  status.innerHTML = 'getting pickup rates'

  let controller = new AbortController();
  const signal = controller.signal;

  clone.children[5].children[1].onclick = function () {
    controller.abort()
  };

  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow',
    signal: controller.signal,
    retryOn: function (attempt, error, response) {
      // retry on any network error, or 4xx or 5xx status codes
      if (error !== null || response.status >= 400) {
        console.log(`retrying, attempt number ${attempt + 1}`);
        status.innerHTML = `retrying getting rates ${attempt + 1}`;
        if (signal.aborted == true) {
          status.style.color = "red";
          status.innerHTML = 'stopped'
          throw new Error(error)
        }
        return true;
      }
    }
  };

  if (proxy != 'no proxy') {
    requestOptions.agent = new ProxyAgent(proxy)
  }

  fetch("https://api.tsum.ru/checkout/delivery/plans/pickup/1", requestOptions)
    .then(response => response.json())
    .then(result => putPickupDate(myHeaders, status, result, profile, proxy, clone))
    .catch(error => console.log('error', error));
}

function putPickupDate(myHeaders, status, rates, profile, proxy, clone) { //устанавливаем дату самовывоза
  status.innerHTML = "setting pickup date";

  let controller = new AbortController();
  const signal = controller.signal;

  clone.children[5].children[1].onclick = function () {
    controller.abort()
  };

  const raw = {
    "agent_code": "14",
    "service": "«ЦУМ»",
    "planed_at": rates[3]['planed_at'],
    "time_from": rates[3]['times'][0]["time_from"],
    "time_to": rates[3]['times'][0]["time_to"],
    "interval_id": rates[3]['times'][0]["interval_id"],
    "pickup_point_id": 1,
    "date": rates[3]['date'],
    "to": rates[3]['times'][0]["to"],
    "from": rates[3]['times'][0]["from"],
    "amount": rates[3]['amount'],
    "payment_method": "online"
  }

  const requestOptions = {
    method: 'PUT',
    headers: myHeaders,
    body: JSON.stringify(raw),
    redirect: 'follow',
    signal: controller.signal,
    retryOn: function (attempt, error, response) {
      // retry on any network error, or 4xx or 5xx status codes
      if (error !== null || response.status >= 400) {
        console.log(`retrying, attempt number ${attempt + 1}`);
        status.innerHTML = `retrying putting rates ${attempt + 1}`;
        if (signal.aborted == true) {
          status.style.color = "red";
          status.innerHTML = 'stopped'
          throw new Error(error)
        }
        return true;
      }
    }
  };

  if (proxy != 'no proxy') {
    requestOptions.agent = new ProxyAgent(proxy)
  }

  fetch("https://api.tsum.ru/checkout/delivery/plan?return=checkout", requestOptions)
    .then(response => response.json())
    .then(result => console.log('date picked'))
    .then(() => putCheckoutInfo(myHeaders, status, profile, proxy, clone))
    .catch(error => console.log('error', error));
}

function putCheckoutInfo(myHeaders, status, profile, proxy, clone) { //вводим данные для создания заказа
  const gender = profile['gender']
  const name = profile['name']
  const surname = profile['surname']
  const email = profile['email']
  const phone = profile['phone']

  let controller = new AbortController();
  const signal = controller.signal;

  clone.children[5].children[1].onclick = function () {
    controller.abort()
  };

  status.innerHTML = "putting checkout info";
  const raw = {
    "delivery": {
      "method": "pickup",
      "pickup_point_id": 1,
      "address_id": null,
      "price": 0,
      "amount": 0,
      "loyalty_amount": 0
    },
    "customer": {
      "type": "individual",
      "gender": gender,
      "name": name,
      "surname": surname,
      "email": email,
      "phone": phone,
      "phone_confirmed": false,
      "company_name": null,
      "subscribe": false,
      "can_subscribe": true
    },
    "payment": {
      "method": "online",
      "all_methods": [
        "online",
        "apple_pay",
        "bank_transfer"
      ],
      "bank_account": null,
      "url": null,
      "amount": 17000,
      "card_id": null,
      "is_possible": false,
      "paid": false
    },
    "packing": {
      "id": 7,
      "title": "Стандартная",
      "description": "Мы упакуем ваш заказ в транспортную коробку подходящего размера",
      "price": 0,
      "amount": 0,
      "loyalty_amount": 0,
      "photo": {
        "x": "https://st2.tsum.com/sig/165eca553ec0189ffd0166d3311e7c44/width/70/photos/f/5/f5f9a94de9d95e43ebbbecf8e655d8fdd05479e0.png",
        "x2": "https://st2.tsum.com/sig/7fa151b132d29ba1a10889ea0b6192f2/width/140/photos/f/5/f5f9a94de9d95e43ebbbecf8e655d8fdd05479e0.png",
        "x3": "https://st2.tsum.com/sig/751d22b4454945f673dd7076eb9053af/width/210/photos/f/5/f5f9a94de9d95e43ebbbecf8e655d8fdd05479e0.png"
      },
      "photo_mobile": {
        "x": "https://st2.tsum.com/sig/86614ed8a918ef79a37da4b118f79111/width/375/photos/6/4/6463d693891ebd31019f4fd92cfc1986de4e857c.png",
        "x2": "https://st2.tsum.com/sig/83da70532f993c3e30730e62b129832a/width/750/photos/6/4/6463d693891ebd31019f4fd92cfc1986de4e857c.png",
        "x3": "https://st2.tsum.com/sig/f30a235fd2e0c37e18c24e7e83c879e5/width/1125/photos/6/4/6463d693891ebd31019f4fd92cfc1986de4e857c.png"
      }
    },
    "message": {
      "author": "customer",
      "message": null,
      "created_at": null
    },
    "present_card": null,
    "apple_pay_token": null,
    "advanced": {
      "confirm_method": "sms"
    }
  }

  const requestOptions = {
    method: 'PUT',
    headers: myHeaders,
    body: JSON.stringify(raw),
    redirect: 'follow',
    signal: controller.signal,
    retryOn: function (attempt, error, response) {
      // retry on any network error, or 4xx or 5xx status codes
      if (error !== null || response.status >= 400) {
        console.log(`retrying, attempt number ${attempt + 1}`);
        status.innerHTML = `retrying putting checkout info ${attempt + 1}`;
        if (signal.aborted == true) {
          status.style.color = "red";
          status.innerHTML = 'stopped'
          throw new Error(error)
        }
        return true;
      }
    }
  };

  if (proxy != 'no proxy') {
    requestOptions.agent = new ProxyAgent(proxy)
  }

  fetch("https://api.tsum.ru/checkout", requestOptions)
    .then(response => response.json())
    .then(result => console.log('order info put'))
    .then(() => makeOrderTSUM(myHeaders, status, proxy, clone))
    .catch(error => console.log('error', error));
}

function makeOrderTSUM(myHeaders, status, proxy, clone) { //делаем заказ
  status.innerHTML = "making order";
  const raw = JSON.stringify({});

  let controller = new AbortController();
  const signal = controller.signal;

  clone.children[5].children[1].onclick = function () {
    controller.abort()
  };

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
    signal: controller.signal,
    retryOn: function (attempt, error, response) {
      // retry on any network error, or 4xx or 5xx status codes
      if (error !== null || response.status >= 400) {
        console.log(`retrying, attempt number ${attempt + 1}`);
        status.innerHTML = `retrying making order ${attempt + 1}`;
        if (signal.aborted == true) {
          status.style.color = "red";
          status.innerHTML = 'stopped'
          throw new Error(error)
        }
        return true;
      }
    }
  };

  if (proxy != 'no proxy') {
    requestOptions.agent = new ProxyAgent(proxy)
  }

  fetch("https://api.tsum.ru/checkout", requestOptions)
    .then(response => response.json())
    .then(result => {
      const orderNumber = result['sid']
      console.log('order number ' + orderNumber);
      status.innerHTML = "Success";
      status.style.color = 'green'
      getPaymentUrl(orderNumber, myHeaders, status, proxy, clone)
    })
    .catch(error => console.log('error', error));
}

function getPaymentUrl(orderNumber, myHeaders, status, proxy, clone) { //получаем ссылку на оплату
  const raw = JSON.stringify({ "sid": orderNumber });

  let controller = new AbortController();
  const signal = controller.signal;

  clone.children[5].children[1].onclick = function () {
    controller.abort()
  };

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
    signal: controller.signal,
    retryOn: function (attempt, error, response) {
      // retry on any network error, or 4xx or 5xx status codes
      if (error !== null || response.status >= 400) {
        console.log(`retrying, attempt number ${attempt + 1}`);
        status.innerHTML = `retrying getting pay url ${attempt + 1}`;
        if (signal.aborted == true) {
          status.style.color = "red";
          status.innerHTML = 'stopped'
          throw new Error(error)
        }
        return true;
      }
    }
  };

  if (proxy != 'no proxy') {
    requestOptions.agent = new ProxyAgent(proxy)
  }

  fetch("https://api.tsum.ru/order/payment", requestOptions)
    .then(response => response.json())
    .then(result => {
      console.log(result['url']);
      status.innerHTML = "Succes! Check ur discord webhook";
      status.style.color = 'green'
      hook.send(
        result['url']
      )
    })
    .catch(error => console.log('error', error));
}