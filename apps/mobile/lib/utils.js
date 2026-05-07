import { Vibration } from "react-native";

    
export const getContrastTextColor = (bgColor) => {
        // Convert hex to RGB
        const r = parseInt(bgColor.slice(1, 3), 16);
        const g = parseInt(bgColor.slice(3, 5), 16);
        const b = parseInt(bgColor.slice(5, 7), 16);
        // Calculate luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        // Return black for light backgrounds, white for dark backgrounds
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    };

 export const formatCurrency = (num) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(num);
      };

export const hexToRgba = (hex, opacity = 1) => {
  const bigint = parseInt(hex.replace("#", ""), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export function formatDateToISO(date) {
  return date.toISOString().split("T")[0]; // yyyy-mm-dd
}

export function validateEmail(email){
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

export function failIf(condition, message, theme, action) {
  console.log('Trying');
      if (condition) {
        global.showSnackbar(message, 3000, theme.coral);
        Vibration.vibrate()
        action()
        return true;
      }
      return false;
    }