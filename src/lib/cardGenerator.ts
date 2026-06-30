import { CardBrand } from '../types';

export const generateCardNumber = (brand: CardBrand): string => {
  let prefix = '';
  let length = 16;

  switch (brand) {
    case 'Visa':
      prefix = '4';
      break;
    case 'Mastercard':
      // 51 to 55
      prefix = '5' + Math.floor(Math.random() * 5 + 1).toString();
      break;
    case 'Amex':
      // 34 or 37
      prefix = '3' + (Math.random() > 0.5 ? '4' : '7');
      length = 15;
      break;
    case 'Discover':
      prefix = '6011';
      break;
    default:
      prefix = '5';
      break;
  }

  let number = prefix;
  for (let i = prefix.length; i < length; i++) {
    number += Math.floor(Math.random() * 10).toString();
  }

  // Format with spaces
  if (length === 15) {
    return `${number.substring(0, 4)} ${number.substring(4, 10)} ${number.substring(10)}`;
  }
  return `${number.substring(0, 4)} ${number.substring(4, 8)} ${number.substring(8, 12)} ${number.substring(12)}`;
};

export const generateExpiry = (): string => {
  const currentYear = new Date().getFullYear();
  const year = currentYear + Math.floor(Math.random() * 4) + 1;
  const month = Math.floor(Math.random() * 12) + 1;
  return `${month.toString().padStart(2, '0')}/${year}`;
};

export const generateCVV = (brand: CardBrand): string => {
  if (brand === 'Amex') {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
  return Math.floor(100 + Math.random() * 900).toString();
};
