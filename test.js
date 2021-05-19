const moment = require('moment');
const tz = require('moment-timezone');

let x = {"_updatedDate": "2021-01-09T20:13:34.563Z"};
let a = moment.utc(x._updatedDate).tz("Asia/Jerusalem").format().toString();
let b = {"date": a};
console.log(b);

// function toPriorityItemsArr(item){
//     const skuArr = item.sku.split(',');
//     const resArr = [];
//     for(let sku of skuArr){
//         resArr.push({
//             "PARTNAME": sku,
//             "TQUANT": item.quantity,
//             "VPRICE": item.price / skuArr.length,
//             "TOTPRICE": item.totalPrice / skuArr.length
//         });
//     }
//     return resArr;
// }
// function addItemsSubForm(items) {
//     if (!items || items.length === 0) {
//         return [];
//     }
//     const items_subform = items.reduce((agg, item) => {
//         return agg.concat(toPriorityItemsArr(item));
//     },[]);
//     return {"EINVOICEITEMS_SUBFORM": items_subform};
// }

// let x = [
//     {
//         "index": 1,
//         "quantity": 1,
//         "price": 318,
//         "name": "מצעי ג׳רסי - אפור כהה",
//         "translatedName": "מצעי ג׳רסי - אפור כהה",
//         "productId": "94277eed-95ae-96ff-3c15-733fd0ddcde5",
//         "totalPrice": 318,
//         "lineItemType": "PHYSICAL",
//         "options": [
//             {
//                 "option": "זוג ציפיות",
//                 "selection": "50X70"
//             },
//             {
//                 "option": "ציפה (יחיד/זוגי)",
//                 "selection": "200X220"
//             },
//             {
//                 "option": "סדין",
//                 "selection": "180X200"
//             }
//         ],
//         "customTextFields": [],
//         "mediaItem": {
//             "id": "ebff75_07a40d0bf8ee43c7b07c0ad09556ff2a~mv2.jpg",
//             "src": "wix:image://v1/ebff75_07a40d0bf8ee43c7b07c0ad09556ff2a~mv2.jpg/file.jpg#originWidth=1000&originHeight=1000",
//             "type": "IMAGE"
//         },
//         "sku": "50180,50186,50184",
//         "variantId": "00000000-0000-0b86-0005-ae6ad5142199",
//         "discount": 0,
//         "tax": 0,
//         "taxIncludedInPrice": true,
//         "priceData": {
//             "price": 318,
//             "totalPrice": 318,
//             "taxIncludedInPrice": true
//         },
//         "refundedQuantity": 0,
//         "weight": 0
//     },
//     {
//         "index": 2,
//         "quantity": 2,
//         "price": 318,
//         "name": "מצעי ג׳רסי - מנטה",
//         "translatedName": "מצעי ג׳רסי - מנטה",
//         "productId": "165607fb-5bd6-2aa7-4096-f8fb75aaf0b0",
//         "totalPrice": 636,
//         "lineItemType": "PHYSICAL",
//         "options": [
//             {
//                 "option": "זוג ציפיות",
//                 "selection": "50X70"
//             },
//             {
//                 "option": "ציפה (יחיד/זוגי)",
//                 "selection": "200X220"
//             },
//             {
//                 "option": "סדין",
//                 "selection": "180X200"
//             }
//         ],
//         "customTextFields": [],
//         "mediaItem": {
//             "id": "ebff75_1740f848c01445c0a169e2127fbc9730~mv2.jpg",
//             "src": "wix:image://v1/ebff75_1740f848c01445c0a169e2127fbc9730~mv2.jpg/file.jpg#originWidth=1000ANDoriginHeight=1000",
//             "type": "IMAGE"
//         },
//         "sku": "50159,50165,50163",
//         "variantId": "00000000-0000-0b86-0005-ae6acff0daa9",
//         "discount": 0,
//         "tax": 0,
//         "taxIncludedInPrice": true,
//         "priceData": {
//             "price": 318,
//             "totalPrice": 318,
//             "taxIncludedInPrice": true
//         },
//         "refundedQuantity": 0,
//         "weight": 0
//     }
// ];

// console.log(addItemsSubForm(x));