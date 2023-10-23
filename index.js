const express = require('express');
const body_parser = require('body-parser');
const axios = require('axios');
require('dotenv').config()

const app = express().use(body_parser.json());
const VERSION = process.env.VERSION;
const TOKEN = process.env.TOKEN;
const accessToken = process.env.ACCESS_TOKEN;
const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`WEBHOOK LISTENING IN PORT ${PORT}`);
})

app.get("/", (req, res) => {
    res.status(200).send('Server is active')
})

app.get("/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const challenge = req.query["hub.challenge"];
    const token = req.query["hub.verify_token"];

    if (mode && token) {
        if (mode === 'subscribe' && token === accessToken) {
            res.status(200).send(challenge);
        } else {
            res.status(403);
        }
    }
});

app.post("/webhook", (req, res) => {
    const body = req.body;

    try {


        console.log(JSON.stringify(body, null, 2));

        if (body.object) {
            console.log('INSIDE BODY');
            if (body.entry &&
                body.entry[0].changes &&
                body.entry[0].changes[0].value.messages &&
                body.entry[0].changes[0].value.messages[0]) {
                console.log('INSIDE PROPERTIES');
                const phoneNumberId = body.entry[0].changes[0].value.metadata.phone_number_id;
                const from = body.entry[0].changes[0].value.messages[0].from;
                const messageBody = body.entry[0].changes[0].value.messages[0].text.body;

                console.log('phoneNumberId->', phoneNumberId);
                console.log('from->', from);
                console.log('messageBody->', messageBody);

                axios({
                    method: "POST",
                    url: `https://graph.facebook.com/v18.0/${phoneNumberId}/messages?access_token=${TOKEN}`,
                    data: {
                        messaging_product: "whatsapp",
                        to: "526182459409",
                        text: {
                            body: `Hola, tu mensaje es ${messageBody}`,
                        }
                    },
                    headers: {
                        "Content-Type": "application/json",
                    }
                });

                res.sendStatus(200);
            } else {
                res.sendStatus(404);
            }
        }
    } catch (error) {
        console.log('ERROR---------->', error);
    }

});
//OBJETO RECIBIDO DE UN MENSAJE DE CLIENTE
//{
//     "object": "whatsapp_business_account",
//     "entry": [{
//         "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
//         "changes": [{
//             "value": {
//                 "messaging_product": "whatsapp",
//                 "metadata": {
//                     "display_phone_number": PHONE_NUMBER,
//                     "phone_number_id": PHONE_NUMBER_ID
//                 },
//                 "contacts": [{
//                     "profile": {
//                       "name": "NAME"
//                     },
//                     "wa_id": PHONE_NUMBER
//                   }],
//                 "messages": [{
//                     "from": PHONE_NUMBER,
//                     "id": "wamid.ID",
//                     "timestamp": TIMESTAMP,
//                     "text": {
//                       "body": "MESSAGE_BODY"
//                     },
//                     "type": "text"
//                   }]
//             },
//             "field": "messages"
//           }]
//     }]
//   }