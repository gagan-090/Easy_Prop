import emailjs from '@emailjs/browser';

// ✅ EmailJS configuration (use .env variables if available)
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'EasyProp';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_axlcyjt';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'b4jpJFbQPiQ-giCdL';

// ✅ Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

// ✅ Test EmailJS Connection
export const testEmailJSConnection = async () => {
  try {
    console.log('🧪 Testing EmailJS connection...');
    console.log('Service ID:', EMAILJS_SERVICE_ID);
    console.log('Template ID:', EMAILJS_TEMPLATE_ID);
    console.log('Public Key:', EMAILJS_PUBLIC_KEY ? 'Present' : 'Missing');

    const testParams = {
      email: 'test@example.com',        // ✅ FIXED
      to_name: 'Test User',
      otp_code: '123456',
      from_name: 'EasyProp Test'
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      testParams
    );

    console.log('✅ EmailJS test successful:', response);
    return { success: true, response };
  } catch (error) {
    console.error('❌ EmailJS test failed:', error);
    return { success: false, error };
  }
};

// ✅ Send OTP Email Function
export const sendOTPEmail = async (email, otp, userName = 'User') => {
  try {
    console.log('🔍 EmailJS Configuration Check:');
    console.log('Service ID:', EMAILJS_SERVICE_ID);
    console.log('Template ID:', EMAILJS_TEMPLATE_ID);
    console.log('Public Key:', EMAILJS_PUBLIC_KEY ? 'Set' : 'Not set');
    console.log('Attempting to send OTP to:', email);

    // Development fallback check
    if (
      EMAILJS_SERVICE_ID === 'your_service_id' ||
      EMAILJS_TEMPLATE_ID === 'your_template_id' ||
      EMAILJS_PUBLIC_KEY === 'your_public_key'
    ) {
      console.warn('❌ EmailJS not configured. Using development mode.');
      console.log(`🔐 Development OTP for ${email}: ${otp}`);
      return {
        success: true,
        message: 'OTP sent successfully (Development mode - check console)',
        developmentOTP: otp
      };
    }

    // ✅ FIXED: Use "email" (not "to_email")
    const templateParams = {
      email: email,
      to_name: userName,
      otp_code: otp,
      from_name: 'EasyProp',
      message: `Your OTP for EasyProp registration is: ${otp}. This code will expire in 10 minutes.`
    };

    console.log('📧 Sending email with params:', templateParams);

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log('📬 EmailJS Response:', response);

    if (response.status === 200) {
      console.log('✅ Email sent successfully!');
      return { success: true, message: 'OTP sent successfully to your email' };
    } else {
      console.error('❌ Email sending failed with status:', response.status);
      throw new Error(`Failed to send email. Status: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Email sending error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    // Fallback for development - show OTP in console
    console.log(`🔐 Fallback Development OTP for ${email}: ${otp}`);
    return {
      success: true,
      message: 'OTP sent successfully (Development fallback - check console)',
      developmentOTP: otp
    };
  }
};

// ✅ (Optional) Send via your own backend
export const sendOTPEmailViaBackend = async (email, otp, userName = 'User') => {
  try {
    const response = await fetch('/api/send-otp-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, userName })
    });

    const result = await response.json();

    if (response.ok) {
      return { success: true, message: 'OTP sent successfully to your email' };
    } else {
      throw new Error(result.error || 'Failed to send email');
    }
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: 'Failed to send OTP email. Please try again.'
    };
  }
};
