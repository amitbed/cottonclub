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
        const invoicesBody = await invoicesService.createBodyForInvoices(event, custId, contactId);
        console.log('Created new invoice');
        console.log(invoicesBody);
        // both requests will run simultanously
        const orderId = await api.addOrder(ordersBody);
        console.log('New order sent to priority');
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
        "firstName": "אביחי",
        "lastName": "כוכבי",
        "phone": "0544476583",
        "email": "avichai@gmail.com"
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
            // "sku": "50256,50239",
            "sku": "50256",
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
