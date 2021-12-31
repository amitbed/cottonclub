// This module only handles calls to Proirity API and sends back the responses
import { fetch } from 'wix-fetch';
import { sendEmail } from 'backend/utils.js';

const env = 'pilot7';
const serverURL = 'https://cottonclub-test.medatech-cloud.com/';

async function getFromPriority(url) {
    const response = await fetch(encodeURI(url), {
        "method": "get",
        "headers": {
            "Authorization": "Basic Y290dG9uY2x1YjpBUEkxMjM0"
        }
    });
    if (response.ok) {
        return await response.json();
    }
    return Promise.reject("Get did not succeed");
}

async function postToPriority(url, body) {
    try{
        const response = await fetch(encodeURI(url), {
            "method": "post",
            "headers": {
                "Content-Type": "application/json;odata.metadata=minimal",
                "Accept": "application/json",
                "Authorization": "Basic Y290dG9uY2x1YjpBUEkxMjM0"
            },
            "body": JSON.stringify(body)
        });
        if (response.ok) {
            return await response.json();
        }
        const urlArr = url.split('/');
        const screen = urlArr[urlArr.length - 1];
        return Promise.reject({message:`Post to ${screen} did not succeed`, body: body});
    } catch (e){
        console.log('ERROR');
        console.log(e);
        sendEmail(e.message || e, JSON.stringify({"url": url, "requestBody": body}));
    }
}

async function patchToProirity(url, body) {
    try{
        const response = await fetch(encodeURI(url), {
            "method": "patch",
            "headers": {
                "Content-Type": "application/json;odata.metadata=minimal",
                "Accept": "application/json",
                "Authorization": "Basic Y290dG9uY2x1YjpBUEkxMjM0"
            },
            "body": JSON.stringify(body)
        });
        if (response.ok) {
            return await response.json();
        }
        return Promise.reject('Patch to priority did not succeed');
    } catch (err) {
        console.log('ERROR');
        console.log(err);
        sendEmail(err.message || err, JSON.stringify({"url": url, "requestBody": body}));
    }
}

export async function getCustomerId() {
    const url = `${serverURL}/odata/priority/tabula.ini/${env}/CUSTOMERS?$filter=ZTAD_WS_CUST eq 'Y'`;
    const res = await getFromPriority(url);
    return res.value[0].CUSTNAME;
}

export async function getContactId(fullName, email) {
    // const url = `https://cottonclub.medatech-cloud.com//odata/priority/tabula.ini/${env}/PHONEBOOK?$filter=FIRM eq '${email}' and NAME eq '${fullName}'`;
    const url = `${serverURL}/odata/priority/tabula.ini/${env}/PHONEBOOK?$filter=FIRM eq '${email}'`;
    const res = await getFromPriority(url);
    if (!res.value || typeof(res.value) !== 'object'){
        return Promise.reject('Error trying to get contact ID');
    }
    if (res.value.length  === 0){
        return null;
    }
    // Get the record with the field NAME that is equal to fullName.
    // workaround to a problem filtering names with " ' "
    res.value = res.value.filter(rec => rec["NAME"] === fullName); 
    return res.value.length > 0 ? res.value[0]["PHONE"] : null;
}

export async function getOrderStatus() {
    const url = `${serverURL}/odata/priority/tabula.ini/${env}/ORDSTATUS?$filter=ZTAD_ORDSTATUS_WS eq 'Y'`;
    const res = await getFromPriority(url);
    if (!res.value || res.value.length <= 0){
        return Promise.reject('No order status with flag ZTAD_ORDSTATUS_WS found');
    }
    return res.value[0].ORDSTATUSDES;
}
export async function getOrderType() {
    const url = `${serverURL}/odata/priority/tabula.ini/${env}/CPROFTYPES?$filter=ZTAD_WESITE eq 'Y'`;;
    const res = await getFromPriority(url);
    if (!res.value || res.value.length <= 0){
        return Promise.reject('No order type with flag ZTAD_WESITE found');
    }
    return res.value[0].TYPECODE;
}

export async function addInvoice(body) {
    const url = `${serverURL}/odata/Priority/tabula.ini/${env}/TINVOICES`;
    const response = await postToPriority(url, body);
    return response["IVNUM"];
}

export async function addOrder(body) {
    const url = `${serverURL}/odata/Priority/tabula.ini/${env}/ORDERS`;
    const response = await postToPriority(url, body);
    return response["ORDNAME"];
}

export async function createContact(body) {
    const url = `${serverURL}/odata/priority/tabula.ini/${env}/PHONEBOOK`;
    const response = await postToPriority(url, body);
    return response["PHONE"];
}

export async function updateInvoice(invoiceId) {
    const url = `${serverURL}/odata/Priority/tabula.ini/${env}/TINVOICES`;
    await patchToProirity(url, 
    {
        "IVNUM": invoiceId,
        "IVTYPE": "T",
        "DEBIT": "D",
        "ZTAD_CLOSE_AND_SEND": "Y"
    });
    return;
}


export async function updateOrderId(orderId, orderStatus) {
    const url = `${serverURL}/odata/Priority/tabula.ini/${env}/ORDERS`;
    await patchToProirity(url,
        {
            "ORDNAME": orderId,
            "ORDSTATUSDES": orderStatus
        });
    return;
}