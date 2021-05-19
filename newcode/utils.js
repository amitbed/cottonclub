// This module contains helper functions

// import { fetch } from 'wix-fetch';
const fetch = require('node-fetch');
const config = require('config');

module.exports = {
    sendEmail: function(subject, body) {
        const url = "https://api.sendgrid.com/api/mail.send.json";
        const mailAuthKey = config.get('mailAuthKey')
        
        const headers = {
            "Authorization": "Bearer " + mailAuthKey,
            "Content-Type": "application/x-www-form-urlencoded"
        };
    
        body = body.replace(/&/g, "AND");
        const data = `from=amitbedarshi@gmail.com&to=amitbedarshi@gmail.com&subject=${subject}&text=${body}`;
    
        const request = {
            "method": "post",
            "headers": headers,
            "body": data
        };
    
        return fetch(url, request)
            .then(response => response.json());
    }
};