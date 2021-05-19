import { getContactId, createContact } from 'backend/api.js';

export async function createOrGetContact(customerId, fullName, email, phone) {
    let contactId = await getContactId(fullName, email);
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
    contactId = await createContact(body);
    return contactId;
}