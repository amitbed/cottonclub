// This module initiate process and holds all wix events
const api = require('./api');
const ordersService = require('./services/ordersService');
const contactsService = require('./services/contactsService');
const invoicesService = require('./services/invoicesService.js');
const utils = require('./utils');

async function onOrderPaid(event) {
    console.log('Got new Order');
    try {
        const custId = await api.getCustomerId();
        console.log('Got customer ID: '+ custId);
        const fullName = `${event.buyerInfo.firstName} ${event.buyerInfo.lastName}`;
        console.log('contact name is: ' + fullName);
        const contactId = await contactsService.createOrGetContact(custId, fullName, event.buyerInfo.email, event.buyerInfo.phone);
        console.log('Got contact ID: ' + contactId);
        const ordersBody = await ordersService.createBodyForOrders(event, custId, contactId);
        console.log('Created new order');
        console.log(ordersBody);
        const invoicesBody = await invoicesService.createBodyForInvoices(event, custId, contactId);
        console.log('Created new invoice');
        // both requests will run simultanously
        const orderId = await api.addOrder(ordersBody);
        console.log('New order sent to priority. order ID: '+ orderId);
        api.updateOrderId(orderId, ordersBody.ORDSTATUSDES);
        console.log('Order status updated');
        const invoiceId = await api.addInvoice(invoicesBody);
        console.log('New invoice sent to priority: '+ invoiceId);
        api.updateInvoice(invoiceId);
        console.log('Invoice updated');
        console.log('Done.');
        console.log(JSON.stringify({
            "customerId": custId, 
            "name": fullName,
            "wixOrderNum": event.number.toString(),
            "orderId": orderId,
            "invoiceId": invoiceId,
            "ordersBody": ordersBody,
            "invoiceBody": invoicesBody
        }));
    } catch (e) {
        console.log(e);
    }
}
onOrderPaid({
    "_id": "ee0ef297-b334-416b-8297-363334e68a08",
    "_updatedDate": "2021-05-29T12:34:29.983Z",
    "cartId": "a2b1a8e6-3c13-4300-b0cd-b5849b98fd9e",
    "channelInfo": {
        "type": "WEB"
    },
    "enteredBy": {
        "id": "ff4cf4fe-efaa-48be-a5b5-310d6c5ab782",
        "identityType": "CONTACT"
    },
    "refunds": [],
    "billingInfo": {
        "address": {
            "formatted": "ספלאש\nטבנקין 22, דירה 12 קומה 4\nבת ים,  5967417\nIsrael\n 972508642654",
            "city": "בת ים",
            "country": "ISR",
            "addressLine": "טבנקין 22",
            "addressLine2": "דירה 12 קומה 4",
            "postalCode": "5967417",
            "streetAddress": {
                "number": "22",
                "name": "טבנקין"
            }
        },
        "firstName": "אנה",
        "lastName": "שנידמו",
        "email": "Shnaidman@gmail.com",
        "phone": " 972508642654",
        "company": "ספלאש",
        "externalTransactionId": "TRAN1622-2916679S-LRRRX5R2-VSQ7PX8L",
        "paidDate": "2021-05-29T12:34:29.794Z",
        "paymentMethod": "Isracard",
        "paymentGatewayTransactionId": "72ec010b-1cbe-476f-884e-b0957a0429d4",
        "paymentProviderTransactionId": "TRAN1622-2916679S-LRRRX5R2-VSQ7PX8L"
    },
    "buyerInfo": {
        "id": "ff4cf4fe-efaa-48be-a5b5-310d6c5ab782",
        "type": "CONTACT",
        "identityType": "CONTACT",
        "firstName": "אנה",
        "lastName": "שנידמו",
        "phone": " 972508642654",
        "email": "Shnaidman@gmail.com"
    },
    "_dateCreated": "2021-05-29T12:34:25.100Z",
    "currency": "ILS",
    "fulfillmentStatus": "NOT_FULFILLED",
    "archived": false,
    "activities": [
        {
            "type": "ORDER_PLACED",
            "timestamp": "2021-05-29T12:34:25.100Z"
        },
        {
            "type": "ORDER_PAID",
            "timestamp": "2021-05-29T12:34:29.794Z"
        }
    ],
    "number": 15927,
    "paymentStatus": "PAID",
    "shippingInfo": {
        "deliveryOption": "שליח עד הבית",
        "estimatedDeliveryTime": "עד 7 ימי עסקים",
        "shippingRegion": "Domestic",
        "shipmentDetails": {
            "address": {
                "formatted": "ספלאש\nטבנקין 22, דירה 12 קומה 4\nבת ים,  5967417\nIsrael\n 972508642654",
                "city": "בת ים",
                "country": "ISR",
                "addressLine": "טבנקין 22",
                "addressLine2": "דירה 12 קומה 4",
                "postalCode": "5967417",
                "streetAddress": {
                    "number": "22",
                    "name": "טבנקין"
                }
            },
            "firstName": "אנה",
            "lastName": "שנידמו",
            "email": "Shnaidman@gmail.com",
            "phone": " 972508642654",
            "company": "ספלאש",
            "tax": 0,
            "discount": 0,
            "priceData": {
                "price": 30,
                "taxIncludedInPrice": true
            }
        },
        "pickupDetails": null
    },
    "lineItems": [
        {
            "index": 1,
            "quantity": 1,
            "price": 168,
            "name": "מגבת פיור -  White",
            "translatedName": "מגבת פיור - White",
            "productId": "f9501a5d-0d40-6a72-8c31-d12b7453c7d9",
            "totalPrice": 168,
            "lineItemType": "PHYSICAL",
            "options": [
                {
                    "option": "מגבת ידיים",
                    "selection": "ללא"
                },
                {
                    "option": "מגבת גוף",
                    "selection": "70X130"
                },
                {
                    "option": "מגבת ענק",
                    "selection": "100X150"
                }
            ],
            "customTextFields": [],
            "mediaItem": {
                "id": "5b5cb3_042e87ec041148bfaf675ddf4e2e673f~mv2.jpg",
                "src": "wix:image://v1/5b5cb3_042e87ec041148bfaf675ddf4e2e673f~mv2.jpg/file.jpg#originWidth=1000ANDoriginHeight=1000",
                "type": "IMAGE"
            },
            "sku": "92202",
            "variantId": "5050e060-be1e-4aca-bc30-9838a8b4111b",
            "discount": 0,
            "tax": 0,
            "taxIncludedInPrice": true,
            "priceData": {
                "price": 168,
                "totalPrice": 168,
                "taxIncludedInPrice": true
            },
            "refundedQuantity": 0,
            "weight": 0
        }
    ],
    "totals": {
        "discount": 0,
        "quantity": 1,
        "shipping": 30,
        "subtotal": 168,
        "tax": 0,
        "total": 198,
        "weight": 0
    },
    "weightUnit": "KG",
    "customField": {
        "value": "304242126",
        "title": "תעודת זהות",
        "translatedTitle": "תעודת זהות"
    },
    "fulfillments": [],
    "discount": null
});
// onOrderPaid({
//     "_id": "18dd9bdf-e923-4eee-8d72-01027574251e",
//     "_updatedDate": "2021-01-15T18:35:40.879Z",
//     "cartId": "39dc34c9-1142-447a-806b-3a7bc5505a5f",
//     "channelInfo": {
//         "type": "WEB"
//     },
//     "enteredBy": {
//         "id": "702ad56a-72ea-4fd2-a232-ade26cd008e6",
//         "identityType": "CONTACT"
//     },
//     "refunds": [],
//     "billingInfo": {
//         "address": {
//             "formatted": "שושנה דמארי 4, 30/7\nעפולה, 1804343\nIsrael\n0524533360",
//             "city": "עפולה",
//             "country": "ISR",
//             "addressLine": "שושנה דמארי 4",
//             "addressLine2": "30/7",
//             "postalCode": "1804343",
//             "streetAddress": {
//                 "number": "4",
//                 "name": "שושנה דמארי"
//             }
//         },
//         "firstName": "טלי",
//         "lastName": "זילבר ",
//         "email": "talizilber2@gmail.com",
//         "phone": "0524533360",
//         "externalTransactionId": "TRAN1610-7357384D-YUTJTNXO-MMXK3Y0Y",
//         "paidDate": "2021-01-15T18:35:40.714Z",
//         "paymentMethod": "Isracard",
//         "paymentGatewayTransactionId": "c69e7a42-e817-4b4c-964e-d073ca25b4f7",
//         "paymentProviderTransactionId": "TRAN1610-7357384D-YUTJTNXO-MMXK3Y0Y"
//     },
//     "buyerInfo": {
//         "id": "702ad56a-72ea-4fd2-a232-ade26cd008e6",
//         "type": "CONTACT",
//         "identityType": "CONTACT",
//         "firstName": "אביחי",
//         "lastName": "כוכבי",
//         "phone": "0544476583",
//         "email": "avichai@gmail.com"
//     },
//     "_dateCreated": "2021-01-15T18:35:36.487Z",
//     "currency": "ILS",
//     "fulfillmentStatus": "NOT_FULFILLED",
//     "archived": false,
//     "activities": [
//         {
//             "type": "ORDER_PLACED",
//             "timestamp": "2021-01-15T18:35:36.487Z"
//         },
//         {
//             "type": "ORDER_PAID",
//             "timestamp": "2021-01-15T18:35:40.714Z"
//         }
//     ],
//     "number": 12456,
//     "paymentStatus": "PAID",
//     "shippingInfo": {
//         "deliveryOption": "שליח עד הבית",
//         "estimatedDeliveryTime": "עד 7 ימי עסקים",
//         "shippingRegion": "Domestic",
//         "shipmentDetails": {
//             "address": {
//                 "formatted": "שושנה דמארי 4, 30/7\nעפולה, 1804343\nIsrael\n0524533360",
//                 "city": "עפולה",
//                 "country": "ISR",
//                 "addressLine": "שושנה דמארי 4",
//                 "addressLine2": "30/7",
//                 "postalCode": "1804343",
//                 "streetAddress": {
//                     "number": "4",
//                     "name": "שושנה דמארי"
//                 }
//             },
//             "firstName": "טלי",
//             "lastName": "זילבר ",
//             "email": "talizilber2@gmail.com",
//             "phone": "0524533360",
//             "tax": 0,
//             "discount": 0,
//             "priceData": {
//                 "price": 0,
//                 "taxIncludedInPrice": true
//             }
//         },
//         "pickupDetails": null
//     },
//     "lineItems": [
//         {
//             "index": 1,
//             "quantity": 1,
//             "price": 397.2,
//             "name": "מצעי פארטו - זהב",
//             "translatedName": "מצעי פארטו - זהב",
//             "productId": "942a292a-e520-1e02-b103-c09af1c80535",
//             "totalPrice": 397.2,
//             "lineItemType": "PHYSICAL",
//             "options": [
//                 {
//                     "option": "סדין",
//                     "selection": "180X200"
//                 },
//                 {
//                     "option": "מארז",
//                     "selection": "200X220-זוגי"
//                 }
//             ],
//             "customTextFields": [],
//             "mediaItem": {
//                 "id": "5b5cb3_0cadff43f0f94382bc6c8ec13e997ace~mv2.jpg",
//                 "src": "wix:image://v1/5b5cb3_0cadff43f0f94382bc6c8ec13e997ace~mv2.jpg/file.jpg#originWidth=5507ANDoriginHeight=3671",
//                 "type": "IMAGE"
//             },
//             // "sku": "50256,50239",
//             "sku": "50256",
//             "variantId": "c90c9bfd-3586-4b9c-9b63-abe3762dbdb5",
//             "discount": 39.72,
//             "tax": 0,
//             "taxIncludedInPrice": true,
//             "priceData": {
//                 "price": 397.2,
//                 "totalPrice": 397.2,
//                 "taxIncludedInPrice": true
//             },
//             "refundedQuantity": 0,
//             "weight": 0
//         }
//     ],
//     "totals": {
//         "discount": 39.72,
//         "quantity": 1,
//         "shipping": 0,
//         "subtotal": 397.2,
//         "tax": 0,
//         "total": 357.48,
//         "weight": 0
//     },
//     "weightUnit": "KG",
//     "customField": {
//         "value": "201311263",
//         "title": "ת\"ז",
//         "translatedTitle": "ת\"ז"
//     },
//     "fulfillments": [],
//     "discount": {
//         "appliedCoupon": {
//             "couponId": "389fe856-496f-4603-b0e0-b8c73fc3fc43",
//             "name": "קנייה ראשונה 10%",
//             "code": "Welcomehome"
//         }
//     }
// });
