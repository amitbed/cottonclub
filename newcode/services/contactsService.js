const api = require("../api");

module.exports = {
    createOrGetContact: async function(customerId, fullName, email, phone) {
        let contactId = await api.getContactId(fullName, email);
        if (contactId) {
            return contactId;
        }
        console.log('contact ID is null. creating a new contact');
        //create contact
        const body = {
            "CUSTNAME": customerId, 
            "NAME": fullName, 
            "EMAIL": email,
            "FIRM": email,
            "CELLPHONE": phone
        }
        contactId = await api.createContact(body);
        return contactId;
    }
}