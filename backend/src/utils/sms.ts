import axios from 'axios';
async function sendSMS(to: string, content: string): Promise<void> {
    const TWO_FACTOR_API_KEY = process.env.TWO_FACTOR_API_KEY;
    const BASE_URL = "https://2factor.in/API/V1";

    if (!TWO_FACTOR_API_KEY) {
        throw new Error("TWO_FACTOR_API_KEY is not defined in environment variables.");
    }

    const url = `${BASE_URL}/${TWO_FACTOR_API_KEY}/SMS/${to}/${content}`;

    try {
        const response = await axios.get(url);

        if (response.status === 200) {
            console.log(`Successfully sent SMS to ${to}`);
        } else {
            throw new Error(`Failed to send SMS: ${response.statusText}`);
        }
    } catch (error) {
        console.error(`Error sending SMS to ${to}:`, error);
        throw error;
    }
}
export { sendSMS };