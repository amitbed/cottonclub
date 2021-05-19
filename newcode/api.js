// This module only handles calls to Proirity API and sends back the responses
// import { fetch } from 'wix-fetch';
const fetch = require('node-fetch');
const utils = require('./utils');

const env = 'pilot7';

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
        utils.sendEmail(e.message || e, JSON.stringify({"url": url, "requestBody": body}));
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
        utils.sendEmail(err.message || err, JSON.stringify({"url": url, "requestBody": body}));
    }
}

module.exports = {
    getCustomerId: async function() {
        // const url = `https://cottonclub.medatech-cloud.com//odata/priority/tabula.ini/${env}/CUSTOMERS?$filter=ZTAD_WS_CUST eq 'Y'`;
        const url = `https://cottonclub.medatech-cloud.com//odata/priority/tabula.ini/${env}/CUSTOMERS?$filter=ZTAD_WS_CUST eq 'Y'`;
        const res = await getFromPriority(url);
        return res.value[0].CUSTNAME;
    },

    getContactId: async function (fullName, email) {
        const url = `https://cottonclub.medatech-cloud.com//odata/priority/tabula.ini/${env}/PHONEBOOK?$filter=FIRM eq '${email}' and NAME eq '${fullName}'`;
        const res = await getFromPriority(url);
        if (!res.value || typeof(res.value) !== 'object'){
            return Promise.reject('Error trying to get contact ID');
        }
        return res.value.length > 0 ? res.value[0]["PHONE"] : null;
    },
    
    getOrderStatus: async function() {
        const url = `https://cottonclub.medatech-cloud.com//odata/priority/tabula.ini/${env}/ORDSTATUS?$filter=ZTAD_ORDSTATUS_WS eq 'Y'`;
        const res = await getFromPriority(url);
        return res.value[0].ORDSTATUSDES;
    },

    addInvoice: async function(body) {
        const url = `https://cottonclub.medatech-cloud.com//odata/Priority/tabula.ini/${env}/TINVOICES`;
        const response = await postToPriority(url, body);
        console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
        console.log(response);
        return response["IVNUM"];

    },

    addOrder: async function(body) {
        const url = `https://cottonclub.medatech-cloud.com//odata/Priority/tabula.ini/${env}/ORDERS`;
        const response = await postToPriority(url, body);
        return response["ORDNAME"];
    },

    createContact: async function(body) {
        const url = `https://cottonclub.medatech-cloud.com//odata/priority/tabula.ini/${env}/PHONEBOOK`;
        const response = await postToPriority(url, body);
        return response["PHONE"];
    },

    updateInvoice: async function(invoiceId) {
        const url = `https://cottonclub.medatech-cloud.com//odata/Priority/tabula.ini/${env}/TINVOICES`;
        await patchToProirity(url, 
        {
            "IVNUM": invoiceId,
            "IVTYPE": "T",
            "DEBIT": "D",
            "ZTAD_CLOSE_AND_SEND": "Y"
        });
        return;
    }

    
};