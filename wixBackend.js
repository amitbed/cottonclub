import wixPay from 'wix-pay-backend';
import wixStores from 'wix-stores-backend';
import { fetch } from 'wix-fetch';

// import wixData from 'wix-data';
// import moment from 'moment';
// import tz from 'moment-timezone';
const DISCOUNT_SKU = "59998";
const SHIPMENT_SKU = "59999";
const REFUND_SKU = "59996";
const PICKUP_SKU = "59994";

function getPrice(itemName, prodVars, sku){
    const variant = prodVars.filter(singleVar => singleVar.variant.sku === sku);
    if (variant.length === 0) {
        return Promise.reject('No variant found for sku '+ sku + ' item: '+ itemName);
    }
    if (variant.length > 1) {
        return Promise.reject('Too many variants found for sku '+ sku + ' item: '+ itemName);
    }
    return variant[0].variant.discountedPrice == null ? variant[0].variant.price: variant[0].variant.discountedPrice;    
}

async function getProductVariants(itemName, productId){
    try {
        return  await wixStores.getProductVariants(productId);
    } catch (err){
        console.log('Failed to get product variants for item: '+ itemName + ' prodId: '+ productId);
        console.log(err);
        return Promise.reject('Failed to get product variants for item: '+ itemName + ' prodId: '+ productId);
    }
}

async function toPriorityItemsArr(item){
    if (item.sku.indexOf(',') < 0){ // item has single SKU
        return [{
            "PARTNAME": item.sku,
            "TQUANT": item.quantity,
            "VPRICE": item.price,
            "TOTPRICE": item.totalPrice
        }];
    }
    //item has multiple SKUs
    const prodVars = await getProductVariants(item.name, item.productId);
    console.log('product variants for: '+ item.name);
    console.log(prodVars);
    const skuArr = item.sku.split(',');
    const resArr = [];
    for(let sku of skuArr){
        if (sku.length === 0){
            continue;
        }
        sku = sku.trim();
        const price = getPrice(item.name, prodVars, sku);
        resArr.push({
            "PARTNAME": sku,
            "TQUANT": item.quantity,
            "VPRICE": price,
            "TOTPRICE": price * item.quantity
        });
    }
    return resArr;
}
async function addItemsSubForm(items, totals, isPickup) {
    if (!items || items.length === 0) {
        return [];
    }
    let items_subform = [];
    for (let item of items){
        items_subform = items_subform.concat(await toPriorityItemsArr(item));
    }
    // const items_subform = await items.reduce(async (agg, item) => {
    //     return agg.concat(await toPriorityItemsArr(item));
    // },[]);
    if (totals.discount){
        items_subform.push({
            "PARTNAME": DISCOUNT_SKU,
            "TQUANT": -1,
            "VPRICE": totals.discount,
            "TOTPRICE": totals.discount * (-1)
        });
    }
    if (totals.shipping){
        items_subform.push({
            "PARTNAME": SHIPMENT_SKU,
            "TQUANT": 1,
            "VPRICE": totals.shipping,
            "TOTPRICE": totals.shipping
        });
    } else if (isPickup) {
        items_subform.push({
            "PARTNAME": PICKUP_SKU,
            "TQUANT": 1,
            "VPRICE": 0,
            "TOTPRICE": 0
        });
    }
    return {"EINVOICEITEMS_SUBFORM": items_subform};
}

function getPriorityPaymentCode(paymentType){
    switch (paymentType.toLowerCase()){
        case 'paypal':
            return "15"
        case 'visa':
        case 'isracard':
        case 'mastercard':
        default:
            return "16";
    }
}

function sendEmail(subject, body) {
    const url = "https://api.sendgrid.com/api/mail.send.json";
    const mailAuthKey = 'XXX';
    
    const headers = {
        "Authorization": "Bearer " + mailAuthKey,
        "Content-Type": "application/x-www-form-urlencoded"
    };

    body = body.replace(/&/g, "AND");
    const data = `from=amitbedarshi@gmail.com&to=amitbedarshi@gmail.com&subject=${subject}&text=${body}`;

    const request = {
        "method": "post",
        "headers": headers,
        "body": data
    };

    return fetch(url, request)
        .then(response => response.json());
}

function changeStatus(orderNumber){
    const body = {
        "IVNUM": orderNumber,
        "IVTYPE": "E",
        "CUSTNAME": "11111",
        "STATDES": "מאושרת"
    };
    return fetch("https://cottonclub.medatech-cloud.com//odata/Priority/tabula.ini/cotton/EINVOICES", {
            "method": "patch",
            "headers": {
                "Content-Type": "application/json;odata.metadata=minimal",
                "Accept": "application/json",
                "Authorization": "Basic Y290dG9uY2x1YjpBUEkxMjM0"
            },
            "body": JSON.stringify(body)
        });
}

export function wixPay_onPaymentUpdate(event) {
    let paymentId = event.payment.id;
    let newStatus = event.status;
    console.log('Updated payment status: '+ newStatus);
    sendEmail('Payment status update', JSON.stringify({"paymentId": paymentId, "newStatus": newStatus}));
}
// TODO: implement logs in db using wixData
// wixData.insert('Logs', {'title': 'EVENTS.JS IS LOADED'});
export function wixStores_onCartCreated(event) {
    let total = event.totals.total;
    console.log('Got on cart created event');
    // wixData.insert('Logs', {'title': total})
}

export function wixStores_onOrderPaid(event) {
    const paidOrderId = event._id;
    console.log('NEW ORDER!!!');
    console.log(event);
    //first we need to check if the customer is already in Priority system
    const fullName = `${event.buyerInfo.firstName} ${event.buyerInfo.lastName}`;
    const email = event.buyerInfo.email;
    const url = `https://cottonclub.medatech-cloud.com//odata/priority/tabula.ini/cotton/PHONEBOOK?$filter=FIRM eq '${email}' and NAME eq '${fullName}'`;
    let body = '';
    fetch(encodeURI(url), {
        "method": "get",
        "headers": {
            "Authorization": "Basic Y290dG9uY2x1YjpBUEkxMjM0"
        }
    }).then((res) => {
        return res.json();
    }).then((res) => {
        const success = (res && Array.isArray(res.value));
        if (!success){
            console.log('ERROR in trying to get contact');
            return;
        }
        console.log('CUSTOMER EXISTS? '+ (res.value.length > 0 ? res.value[0].PHONE : 0));
        return Promise.resolve(res.value.length > 0 ? res.value[0].PHONE : 0);
    }).then((contactId) =>{
        return createBodyFromEvent(event, contactId);
    })
    .then(reqBody => {
        body = reqBody;
        console.log('request body');
        console.log(body);
        return fetch("https://cottonclub.medatech-cloud.com//odata/Priority/tabula.ini/cotton/EINVOICES", {
            "method": "post",
            "headers": {
                "Content-Type": "application/json;odata.metadata=minimal",
                "Accept": "application/json",
                "Authorization": "Basic Y290dG9uY2x1YjpBUEkxMjM0"
            },
            "body": JSON.stringify(body)
        })
    })
    .then((httpResponse) => {
        console.log('response from priority');
        console.log(httpResponse);
        if (httpResponse.ok) {
            return httpResponse.json();
        } else {
            return Promise.reject("Fetch did not succeed");
        }
    })
    .then((res) => {
        if (res.CUSTNAME) {
            console.log('SUCCESS! IVNUM IS'+ res.IVNUM + ' status is '+ res.STATDES);
            return changeStatus(res.IVNUM);
        }
        console.log('FAIL!');
        return Promise.reject('Response from priority returned with OK status but no CUSTNUM');
    })
    .then((httpResponse) =>{
        if (httpResponse.ok) {
            return httpResponse.json();
        } else {
            return Promise.reject("Status updated did not succeed");
        }
    })
    .then((res) =>{
        if (res.CUSTNAME) {

            console.log('UPDATE STATUS SUCCESS! IVNUM IS'+ res.IVNUM + ' status is '+ res.STATDES);
            sendEmail('Happy order sent to priority', JSON.stringify({"success": !!res.CUSTNAME, "event": event, "requestBody": body, "response": res}));
        }
    })
    .catch(err => {
        console.log('ERROR');
        console.log(err);
        sendEmail(err.message || err, JSON.stringify({"event": event, "requestBody": body}));
    }); 
}

async function createBodyFromEvent(event, contactId) {
    const fullName = `${event.buyerInfo.firstName} ${event.buyerInfo.lastName}`;
    const shipmentDetails = event.shippingInfo.shipmentDetails;
    const city = shipmentDetails ? shipmentDetails.address.city : '';
    const streetName = shipmentDetails ? (shipmentDetails.address.streetAddress ? shipmentDetails.address.streetAddress.name : shipmentDetails.address.addressLine) : '';
    const streetNumber = shipmentDetails ? (shipmentDetails.address.streetAddress ? shipmentDetails.address.streetAddress.number : '') : '';
    const appartmentNumber = shipmentDetails ? shipmentDetails.address.addressLine2 : '';
    let payTime = event._updatedDate;
    // try {
    //     payTime = moment.utc(event._updatedDate).tz("Asia/Jerusalem").format().toString();
    //     if (payTime.indexOf(' ') > 0){
    //         payTime = payTime.split(' ').join('+');
    //     }
    // } catch(e) {
    //     console.log('ERROR: Could not convert paytime: '+ payTime);
    //     console.log(e.message);
    // }
    const body = {
        "CUSTNAME": "11111",
        "CDES": fullName,
        // "PAYDATE": payTime,
        "DETAILS": event.number.toString(),  //TODO: insert order number
        "CUSTPERSONNEL_SUBFORM": [{
            "NAME": fullName,
            "CELLPHONE": event.buyerInfo.phone,
            "EMAIL": event.buyerInfo.email
        }],
        "EPAYMENT2_SUBFORM": [{
            "PAYMENTCODE": getPriorityPaymentCode(event.billingInfo.paymentMethod),
            "PAYDATE": event._updatedDate,
            // "PAYACCOUNT": "3426",
            // "VALIDMONTH": "12/20",
            "IDNUM": event.customField ? event.customField.value : "",
            "QPRICE": event.totals.total
        }]
    };
    if (city){
        body["SHIPTO2_SUBFORM"] = {
            "STATE": city,
            "ADDRESS": streetName,
            "ADDRESS2": streetNumber,
            "ADDRESS3": appartmentNumber
        };
    }
    if (contactId){
        body["PHONE"] = contactId;
    }
    const itemList = await addItemsSubForm(event.lineItems, event.totals, (shipmentDetails == null));
    return { ...body, ...itemList };
}