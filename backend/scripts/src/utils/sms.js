// utils/sms.js
import twilio from "twilio";

// Configure Twilio using environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const twilioClient = accountSid && authToken ? twilio(accountSid, authToken) : null;

/**
 * Generic SMS sender utility using Twilio
 * @param {string} to - Recipient phone number in E.164 format (e.g., +919876543210)
 * @param {string} message - Text message content
 */
export async function sendSms(to, message) {
  if (!twilioClient) {
    console.warn("⚠️ Twilio client not configured. Skipping SMS.");
    return false;
  }
  
  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to,
    });
    console.log(`✅ SMS sent to ${to}, SID: ${result.sid}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send SMS to ${to}: ${error.message}`);
    return false;
  }
}