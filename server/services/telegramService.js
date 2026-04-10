export const sendMessage = async (chatId, message) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const targetChatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!botToken || !targetChatId) {
        console.error("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing in environment variables!");
        return false;
    }

    console.log(`Attempting to send Telegram message to ${targetChatId}...`);

    try {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        
        // Node 18+ has built-in fetch
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: targetChatId,
                text: message
            })
        });
        
        if (response.ok) {
            console.log(`Alert sent successfully via Telegram`);
            return true;
        } else {
            const errorText = await response.text();
            console.error(`Failed to send Telegram message: HTTP ${response.status} - ${errorText}`);
            return false;
        }
    } catch (error) {
        console.error(`Error connecting to Telegram API:`, error.message);
        return false;
    }
};

export const getClientStatus = () => true;
