// This module initiate process and holds all wix events
const api = require('./api');
const ordersService = require('./services/ordersService');
const contactsService = require('./services/contactsService');
const invoicesService = require('./services/invoicesService.js');
const utils = require('./utils');

/**
 * Emits when payment is updated.
 * Should be able to catch  and handle 'Refunded' payment status. 
 * Not working at the moment
 * @param {} event 
 */
//TODO: fix
export function wixPay_onPaymentUpdate(event) {
    let paymentId = event.payment.id;
    let newStatus = event.status;
    console.log('Updated payment status: '+ newStatus);
    sendEmail('Payment status update', JSON.stringify({"paymentId": paymentId, "newStatus": newStatus}));
}
/**
 * Emits when cart is created
 * @param {*} event 
 */
// TODO: implement logs in db using wixData
export function wixStores_onCartCreated(event) {
    let total = event.totals.total;
    console.log('Got on cart created event');
    // wixData.insert('Logs', {'title': total})
}

/**
 * Emits when order is complete.
 * Should send order to priority (ORDERS and TINVOICES)
 * @param {} event 
 */
export async function wixStores_onOrderPaid(event) {
    const paidOrderId = event._id;
    console.log('NEW ORDER!!!');
    console.log(event);
    onOrderPaidAction(event);
}

async function onOrderPaidAction(event) {
    const fullName = `${event.buyerInfo.firstName} ${event.buyerInfo.lastName}`;
    let contactId, orderId, invoiceId, ordersBody, invoicesBody = '';
    try {
        const custId = await api.getCustomerId();
        contactId = await contactsService.createOrGetContact(custId, fullName, event.buyerInfo.email, event.buyerInfo.phone);
        ordersBody = await ordersService.createBodyForOrders(event, custId, contactId);
        invoicesBody = await invoicesService.createBodyForInvoices(event, custId, contactId);
        // both requests will run simultanously
        orderId = await api.addOrder(ordersBody);
        invoiceId = await api.addInvoice(invoicesBody);
        api.updateInvoice(invoiceId);
        sendEmail('New process succeeded', JSON.stringify({
            "contactId": contactId, 
            "name": fullName,
            "wixOrderNum": event.number.toString(),
            "orderId": orderId,
            "invoiceId": invoiceId,
            "ordersBody": ordersBody,
            "invoiceBody": invoicesBody
        }));
    } catch (err) {
        sendEmail('New process Failed', JSON.stringify({
            "errorMessage": err.message || err,
            "contactId": contactId, 
            "name": fullName,
            "wixOrderNum": event.number.toString(),
            "orderId": orderId,
            "invoiceId": invoiceId,
            "ordersBody": ordersBody,
            "invoiceBody": invoicesBody,
            "wixEvent": event
        }));
    }
}
