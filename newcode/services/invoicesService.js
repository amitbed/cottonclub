// This module is responsible for business logic
const api = require("../api");

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

module.exports = {
    createBodyForInvoices: async function(event, customerId, contactId) {
        const fullName = `${event.buyerInfo.firstName} ${event.buyerInfo.lastName}`;
    
        const body = {
            "CUSTNAME": customerId,
            "CDES": fullName,
            "DETAILS": event.number.toString(),
            "PHONE": contactId,
            "TPAYMENT2_SUBFORM": [{
                "PAYMENTCODE": getPriorityPaymentCode(event.billingInfo.paymentMethod),
                "PAYDATE": event._updatedDate,
                "ZTAD_APP_CC_PP": event.billingInfo.externalTransactionId,
                "IDNUM": event.customField ? event.customField.value : "",
                "QPRICE": event.totals.total
            }]
        };
        return body;
    }
};