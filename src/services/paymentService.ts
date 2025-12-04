import axios from 'axios';

// REAL API CONFIGURATION
// NOTE: In a real deployment, you should use a backend proxy to hide this key.
// For this MVP, we are calling it client-side (not secure for high volume, but works for testing).
const NOWPAYMENTS_API_KEY = 'A6DNZYD-CF24ZB5-QV0062K-92BHKGQ'; 
const API_URL = 'https://api.nowpayments.io/v1';

export interface PaymentRequest {
  amount: number;
  description: string; // "Energy Recharge", "System Patch", "Deep Scan"
}

export const paymentService = {
  /**
   * Generates a REAL payment intent via NowPayments.
   */
  createPayment: async (request: PaymentRequest) => {
    console.log("💸 INITIATING REAL CRYPTO PAYMENT:", request);

    try {
        const response = await axios.post(
            `${API_URL}/payment`,
            {
                price_amount: request.amount,
                price_currency: 'usd',
                pay_currency: 'usdttrc20', // Force USDT on Tron (Fast/Cheap)
                order_description: request.description,
                ipn_callback_url: 'https://google.com', // Placeholder for now
            },
            {
                headers: {
                    'x-api-key': NOWPAYMENTS_API_KEY,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log("✅ PAYMENT CREATED:", response.data);
        
        // Return the formatted data our UI expects
        return {
            status: 'success',
            payment_id: response.data.payment_id,
            pay_address: response.data.pay_address,
            pay_currency: 'usdttrc20',
            amount: response.data.pay_amount,
            // NowPayments doesn't always send a QR url, so we generate one using the address
            qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${response.data.pay_address}`
        };

    } catch (error: any) {
        console.error("🔴 PAYMENT ERROR:", error.response?.data || error.message);
        throw new Error("Payment Gateway Error");
    }
  },

  /**
   * Checks payment status.
   */
  checkPaymentStatus: async (paymentId: string) => {
    try {
        const response = await axios.get(
            `${API_URL}/payment/${paymentId}`,
            {
                headers: { 'x-api-key': NOWPAYMENTS_API_KEY }
            }
        );
        return response.data; // returns { payment_status: 'waiting' | 'confirming' | 'finished' }
    } catch (error) {
        console.error("Check Status Error", error);
        return { payment_status: 'error' };
    }
  }
};
