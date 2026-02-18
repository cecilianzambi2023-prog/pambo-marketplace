/**
 * whatsappService.ts
 * ===================
 * 
 * WhatsApp Direct Message Integration
 * Sellers keep 100% commission - Direct-Connect Model
 * 
 * Usage:
 * const link = generateWhatsAppLink('254712345678', 'I\'m interested in your plumbing services');
 * window.open(link, '_blank');
 */

/**
 * Generate WhatsApp Direct Message Link
 * @param phoneNumber - Phone number in format: 254712345678 (with country code, no +)
 * @param message - Pre-filled message text
 * @returns WhatsApp link
 */
export const generateWhatsAppLink = (phoneNumber: string, message: string): string => {
  // Ensure phone number starts with country code (Kenya = 254)
  const cleanPhone = phoneNumber
    .replace(/\D/g, '') // Remove non-digits
    .replace(/^0/, '254'); // Replace leading 0 with 254

  // Encode message
  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

/**
 * Open WhatsApp Chat with Seller
 */
export const openWhatsAppChat = (
  sellerPhone: string,
  productName: string = '',
  productPrice: number = 0
) => {
  const message = generateSellerMessage(productName, productPrice);
  const link = generateWhatsAppLink(sellerPhone, message);
  window.open(link, '_blank');
};

/**
 * Generate contextual message based on action
 */
const generateSellerMessage = (productName: string, price: number): string => {
  if (productName && price > 0) {
    return `Hi! I'm interested in "${productName}" (KES ${price}). Can you provide more details? Commission: 0% - you keep everything!`;
  }
  if (productName) {
    return `Hi! I'm interested in "${productName}". Can you help me?`;
  }
  return `Hi! I saw your listing on Pambo. Can we discuss further? (Commission: 0% - you keep everything!)`;
};

/**
 * WhatsApp Share Message
 * For sharing listings/services on WhatsApp
 */
export const shareViaWhatsApp = (
  title: string,
  url: string,
  description: string = ''
): void => {
  const message = `Check this out on Pambo! 🔥\n\n${title}\n${description}\n\nLink: ${url}`;
  const link = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(link, '_blank');
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone: string): string => {
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 12) {
    // 254712345678 format
    return `+${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6, 9)} ${clean.slice(9)}`;
  }
  return phone;
};

/**
 * Check if phone number is valid for WhatsApp
 */
export const isValidWhatsAppNumber = (phone: string): boolean => {
  const clean = phone.replace(/\D/g, '');
  // Kenya numbers: 12 digits (254XXXXXXXXX)
  return clean.length === 12 && clean.startsWith('254');
};
