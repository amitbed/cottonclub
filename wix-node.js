const fetch = require('node-fetch');

const DISCOUNT_SKU = "59998";
const SHIPMENT_SKU = "59999";
const REFUND_SKU = "59996";
const PICKUP_SKU = "59994";

function toPriorityItemsArr(item){
    const skuArr = item.sku.split(',');
    const resArr = [];
    for(let sku of skuArr){
        if (sku.length === 0){
            continue;
        }
        resArr.push({
            "PARTNAME": sku,
            "TQUANT": item.quantity,
            "VPRICE": item.price / skuArr.length,
            "TOTPRICE": item.totalPrice / skuArr.length
        });
    }
    return resArr;
}
function addItemsSubForm(items, totals, isPickup) {
    if (!items || items.length === 0) {
        return [];
    }
    const items_subform = items.reduce((agg, item) => {
        return agg.concat(toPriorityItemsArr(item));
    },[]);
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
    paymentType = paymentType ? paymentType.toLowerCase() : '';
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
function changeStatus(orderNumber){
    const body = {
        "IVNUM": orderNumber,
        "IVTYPE": "E",
        "CUSTNAME": "11111",
        "STATDES": "מאושרת"
    };
    return fetch("https://cottonclub.medatech-cloud.com//odata/Priority/tabula.ini/pilot7/EINVOICES", {
            "method": "patch",
            "headers": {
                "Content-Type": "application/json;odata.metadata=minimal",
                "Accept": "application/json",
                "Authorization": "Basic Y290dG9uY2x1YjpBUEkxMjM0"
            },
            "body": JSON.stringify(body)
        });
}

function wixStores_onOrderPaid(event) {
    const paidOrderId = event._id;
    //first we need to check if the customer is already in Priority system
    const fullName = `${event.buyerInfo.firstName} ${event.buyerInfo.lastName}`;
    const email = event.buyerInfo.email;
    const url = `https://cottonclub.medatech-cloud.com//odata/priority/tabula.ini/pilot7/PHONEBOOK?$filter=FIRM eq '${email}' and NAME eq '${fullName}'`;
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
        body = createBodyFromEvent(event, contactId);
        console.log('request body');
        console.log(body);
        return fetch("https://cottonclub.medatech-cloud.com//odata/Priority/tabula.ini/pilot7/EINVOICES", {
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
            // sendEmail('Happy order sent to priority', JSON.stringify({"success": !!res.CUSTNAME, "event": event, "requestBody": body, "response": res}));
        }
    })
    .catch((err) => {
        console.log('ERROR');
        console.log(err.message || err);
    });
}

function createBodyFromEvent(event, contactId) {
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
    return { ...body, ...addItemsSubForm(event.lineItems, event.totals, (shipmentDetails == null)) };
}

wixStores_onOrderPaid({
    "_id": "18dd9bdf-e923-4eee-8d72-01027574251e",
    "_updatedDate": "2021-01-15T18:35:40.879Z",
    "cartId": "39dc34c9-1142-447a-806b-3a7bc5505a5f",
    "channelInfo": {
        "type": "WEB"
    },
    "enteredBy": {
        "id": "702ad56a-72ea-4fd2-a232-ade26cd008e6",
        "identityType": "CONTACT"
    },
    "refunds": [],
    "billingInfo": {
        "address": {
            "formatted": "שושנה דמארי 4, 30/7\nעפולה, 1804343\nIsrael\n0524533360",
            "city": "עפולה",
            "country": "ISR",
            "addressLine": "שושנה דמארי 4",
            "addressLine2": "30/7",
            "postalCode": "1804343",
            "streetAddress": {
                "number": "4",
                "name": "שושנה דמארי"
            }
        },
        "firstName": "טלי",
        "lastName": "זילבר ",
        "email": "talizilber2@gmail.com",
        "phone": "0524533360",
        "externalTransactionId": "TRAN1610-7357384D-YUTJTNXO-MMXK3Y0Y",
        "paidDate": "2021-01-15T18:35:40.714Z",
        "paymentMethod": "Isracard",
        "paymentGatewayTransactionId": "c69e7a42-e817-4b4c-964e-d073ca25b4f7",
        "paymentProviderTransactionId": "TRAN1610-7357384D-YUTJTNXO-MMXK3Y0Y"
    },
    "buyerInfo": {
        "id": "702ad56a-72ea-4fd2-a232-ade26cd008e6",
        "type": "CONTACT",
        "identityType": "CONTACT",
        "firstName": "טלי",
        "lastName": "זילבר ",
        "phone": "0524533360",
        "email": "talizilber2@gmail.com"
    },
    "_dateCreated": "2021-01-15T18:35:36.487Z",
    "currency": "ILS",
    "fulfillmentStatus": "NOT_FULFILLED",
    "archived": false,
    "activities": [
        {
            "type": "ORDER_PLACED",
            "timestamp": "2021-01-15T18:35:36.487Z"
        },
        {
            "type": "ORDER_PAID",
            "timestamp": "2021-01-15T18:35:40.714Z"
        }
    ],
    "number": 12456,
    "paymentStatus": "PAID",
    "shippingInfo": {
        "deliveryOption": "שליח עד הבית",
        "estimatedDeliveryTime": "עד 7 ימי עסקים",
        "shippingRegion": "Domestic",
        "shipmentDetails": {
            "address": {
                "formatted": "שושנה דמארי 4, 30/7\nעפולה, 1804343\nIsrael\n0524533360",
                "city": "עפולה",
                "country": "ISR",
                "addressLine": "שושנה דמארי 4",
                "addressLine2": "30/7",
                "postalCode": "1804343",
                "streetAddress": {
                    "number": "4",
                    "name": "שושנה דמארי"
                }
            },
            "firstName": "טלי",
            "lastName": "זילבר ",
            "email": "talizilber2@gmail.com",
            "phone": "0524533360",
            "tax": 0,
            "discount": 0,
            "priceData": {
                "price": 0,
                "taxIncludedInPrice": true
            }
        },
        "pickupDetails": null
    },
    "lineItems": [
        {
            "index": 1,
            "quantity": 1,
            "price": 397.2,
            "name": "מצעי פארטו - זהב",
            "translatedName": "מצעי פארטו - זהב",
            "productId": "942a292a-e520-1e02-b103-c09af1c80535",
            "totalPrice": 397.2,
            "lineItemType": "PHYSICAL",
            "options": [
                {
                    "option": "סדין",
                    "selection": "180X200"
                },
                {
                    "option": "מארז",
                    "selection": "200X220-זוגי"
                }
            ],
            "customTextFields": [],
            "mediaItem": {
                "id": "5b5cb3_0cadff43f0f94382bc6c8ec13e997ace~mv2.jpg",
                "src": "wix:image://v1/5b5cb3_0cadff43f0f94382bc6c8ec13e997ace~mv2.jpg/file.jpg#originWidth=5507ANDoriginHeight=3671",
                "type": "IMAGE"
            },
            "sku": "50256,50239",
            "variantId": "c90c9bfd-3586-4b9c-9b63-abe3762dbdb5",
            "discount": 39.72,
            "tax": 0,
            "taxIncludedInPrice": true,
            "priceData": {
                "price": 397.2,
                "totalPrice": 397.2,
                "taxIncludedInPrice": true
            },
            "refundedQuantity": 0,
            "weight": 0
        }
    ],
    "totals": {
        "discount": 39.72,
        "quantity": 1,
        "shipping": 0,
        "subtotal": 397.2,
        "tax": 0,
        "total": 357.48,
        "weight": 0
    },
    "weightUnit": "KG",
    "customField": {
        "value": "201311263",
        "title": "ת\"ז",
        "translatedTitle": "ת\"ז"
    },
    "fulfillments": [],
    "discount": {
        "appliedCoupon": {
            "couponId": "389fe856-496f-4603-b0e0-b8c73fc3fc43",
            "name": "קנייה ראשונה 10%",
            "code": "Welcomehome"
        }
    }
});