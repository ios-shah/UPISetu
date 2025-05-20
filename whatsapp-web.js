const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MessageMedia } = require('whatsapp-web.js');

const app = express();
const port = 5000; // Your server will run on http://localhost:5000

app.use(cors());
app.use(bodyParser.json());

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

// Endpoint to send message
app.post('/send-whatsapp', async (req, res) => {
    const { phone, message } = req.body;

    if (!phone || !message) {
        return res.status(400).json({ message: 'Missing phone or message' });
    }

    try {
        const formattedPhone = phone + '@c.us'; // for India
        const media = await MessageMedia.fromUrl(req.body.qrcode, { unsafeMime: true });
        await client.sendMessage(formattedPhone, media, { caption: req.body.message });
        res.json({ message: 'WhatsApp message sent successfully' });
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
});

client.initialize();

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
