// This module is responsible for business logic
import wixStores from 'wix-stores-backend';
import { getOrderStatus } from 'backend/api.js';

export async function createBodyForOrders(event, customerId, contactId) {
    const fullName = `${event.buyerInfo.firstName} ${event.buyerInfo.lastName}`;
    const shipmentDetails = event.shippingInfo.shipmentDetails;
    const city = shipmentDetails ? shipmentDetails.address.city : '';
    const streetName = shipmentDetails ? (shipmentDetails.address.streetAddress ? shipmentDetails.address.streetAddress.name : shipmentDetails.address.addressLine) : '';
    const streetNumber = shipmentDetails ? (shipmentDetails.address.streetAddress ? shipmentDetails.address.streetAddress.number : '') : '';
    const appartmentNumber = shipmentDetails ? shipmentDetails.address.addressLine2 : '';
    const body = {
        "CUSTNAME": customerId,
        "CDES": fullName,
        "DETAILS": event.number.toString(),
        // "ORDSTATUSDES": await getOrderStatus(),
        "PHONE": contactId,
    };
    if (city){ //Orders can be pickup from the store - in this case there will be no shipTo values
        body["SHIPTO2_SUBFORM"] = {
            "STATE": city,
            "ADDRESS": streetName,
            "ADDRESS2": streetNumber,
            "ADDRESS3": appartmentNumber
        };
    }
    const orderItems = await addOrderItems(event.lineItems, event.totals, (shipmentDetails == null), event._updatedDate);
    return { ...body, ...orderItems };
}

const DISCOUNT_SKU = "59998";
const SHIPMENT_SKU = "59999";
const REFUND_SKU = "59996";
const PICKUP_SKU = "59994";

async function addOrderItems(items, totals, isPickup, duedate) {
    if (!items || items.length === 0) {
        return {};
    }
    let items_subform = [];
    for (let item of items){
        items_subform = items_subform.concat(await toPriorityItemsArr(item, duedate));
    }
    if (totals.discount){
        items_subform.push({
            "PARTNAME": DISCOUNT_SKU,
            "TQUANT": -1,
            "VPRICE": totals.discount,
            "DUEDATE": duedate
        });
    }
    if (totals.shipping){
        items_subform.push({
            "PARTNAME": SHIPMENT_SKU,
            "TQUANT": 1,
            "VPRICE": totals.shipping,
            "DUEDATE": duedate
        });
    } else if (isPickup) {
        items_subform.push({
            "PARTNAME": PICKUP_SKU,
            "TQUANT": 1,
            "VPRICE": 0,
            "DUEDATE": duedate
        });
    }
    return {"ORDERITEMS_SUBFORM": items_subform};
}

async function toPriorityItemsArr(item, duedate){
    if (item.sku.indexOf(',') < 0){ // item has single SKU
        return [{
            "PARTNAME": item.sku,
            "TQUANT": item.quantity,
            "VPRICE": item.price,
            "DUEDATE": duedate
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
            "DUEDATE": duedate
        });
    }
    return resArr;
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