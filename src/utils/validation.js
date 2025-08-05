// Validation utilities for forms
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  // Indian phone number validation
  const phoneRegex = /^\+91[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength: getPasswordStrength(password)
  };
};

const getPasswordStrength = (password) => {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  if (score <= 2) return 'weak';
  if (score <= 3) return 'medium';
  return 'strong';
};

export const validateCardNumber = (cardNumber) => {
  // Remove spaces and check if it's a valid card number
  const cleanNumber = cardNumber.replace(/\s/g, '');
  
  if (!/^\d{13,19}$/.test(cleanNumber)) {
    return { isValid: false, error: 'Invalid card number format' };
  }
  
  // Luhn algorithm for card validation
  let sum = 0;
  let isEven = false;
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return {
    isValid: sum % 10 === 0,
    error: sum % 10 === 0 ? null : 'Invalid card number'
  };
};

export const validateExpiryDate = (expiryDate) => {
  const [month, year] = expiryDate.split('/');
  
  if (!month || !year || month.length !== 2 || year.length !== 2) {
    return { isValid: false, error: 'Invalid expiry date format' };
  }
  
  const monthNum = parseInt(month);
  const yearNum = parseInt(`20${year}`);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  if (monthNum < 1 || monthNum > 12) {
    return { isValid: false, error: 'Invalid month' };
  }
  
  if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
    return { isValid: false, error: 'Card has expired' };
  }
  
  return { isValid: true, error: null };
};

export const validateCVV = (cvv) => {
  if (!/^\d{3,4}$/.test(cvv)) {
    return { isValid: false, error: 'CVV must be 3 or 4 digits' };
  }
  
  return { isValid: true, error: null };
};

export const formatPhoneNumber = (value) => {
  // Remove any non-digit characters except +
  value = value.replace(/[^\d+]/g, '');
  
  // If user enters 10 digits starting with 6-9, auto-add +91
  if (/^[6-9]\d{9}$/.test(value)) {
    value = `+91${value}`;
  }
  
  return value;
};

export const formatCardNumber = (value) => {
  // Remove all non-digit characters
  value = value.replace(/\D/g, '');
  
  // Add spaces every 4 digits
  value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
  
  // Limit to 19 characters (16 digits + 3 spaces)
  return value.length <= 19 ? value : value.substring(0, 19);
};

export const formatExpiryDate = (value) => {
  // Remove all non-digit characters
  value = value.replace(/\D/g, '');
  
  // Add slash after 2 digits
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4);
  }
  
  return value.length <= 5 ? value : value.substring(0, 5);
};

export const validateProfileData = (data) => {
  const errors = {};
  
  if (!data.firstName?.trim()) {
    errors.firstName = 'First name is required';
  }
  
  if (!data.lastName?.trim()) {
    errors.lastName = 'Last name is required';
  }
  
  if (!data.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Invalid email format';
  }
  
  if (data.phone && !validatePhone(data.phone)) {
    errors.phone = 'Invalid phone number format';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateBillingData = (data) => {
  const errors = {};
  
  if (data.plan !== 'free') {
    if (!data.paymentMethod) {
      errors.paymentMethod = 'Payment method is required';
    }
    
    if (data.paymentMethod === 'credit_card' || data.paymentMethod === 'debit_card') {
      if (!data.cardNumber) {
        errors.cardNumber = 'Card number is required';
      } else {
        const cardValidation = validateCardNumber(data.cardNumber);
        if (!cardValidation.isValid) {
          errors.cardNumber = cardValidation.error;
        }
      }
      
      if (!data.expiryDate) {
        errors.expiryDate = 'Expiry date is required';
      } else {
        const expiryValidation = validateExpiryDate(data.expiryDate);
        if (!expiryValidation.isValid) {
          errors.expiryDate = expiryValidation.error;
        }
      }
      
      if (!data.cvv) {
        errors.cvv = 'CVV is required';
      } else {
        const cvvValidation = validateCVV(data.cvv);
        if (!cvvValidation.isValid) {
          errors.cvv = cvvValidation.error;
        }
      }
    }
    
    if (!data.billingAddress?.trim()) {
      errors.billingAddress = 'Billing address is required';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};