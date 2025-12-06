export const paymentService = {
  processPayment: async () => ({ success: true }),
  createPayment: async (params: { amount: number, description: string }) => ({
    amount: params.amount,
    pay_currency: 'USD',
    pay_address: '0xMOCK_ADDRESS_FOR_DEV',
    qr_code_url: 'https://via.placeholder.com/150'
  })
};
