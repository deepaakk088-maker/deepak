import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';

console.log("Initializing WhatsApp Client...");

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
    }
});

let isReady = false;

client.on('qr', (qr) => {
    console.log('QR RECEIVED! Scan this with your WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp Client is ready!');
    isReady = true;
});

client.on('disconnected', (reason) => {
    console.log('WhatsApp Client was disconnected', reason);
    isReady = false;
});

client.initialize();

export const sendMessage = async (phoneNumber, message) => {
    if (!isReady) {
        console.log("WhatsApp client is not ready yet. Cannot send message.");
        return false;
    }
    try {
        // WhatsApp ID format: 1234567890@c.us
        const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
        const chatId = phoneNumber.includes('@c.us') ? phoneNumber : `${cleanNumber}@c.us`;
        await client.sendMessage(chatId, message);
        console.log(`Alert sent to ${phoneNumber}`);
        return true;
    } catch (error) {
        console.error(`Failed to send message to ${phoneNumber}:`, error.message);
        return false;
    }
};

export const getClientStatus = () => isReady;
