# Email OTP Setup Guide

This guide will help you set up real email OTP functionality using EmailJS.

## Step 1: Create EmailJS Account

1. Go to [EmailJS](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

## Step 2: Create Email Service

1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions for your provider
5. Note down your **Service ID**

## Step 3: Create Email Template

1. Go to "Email Templates" in your dashboard
2. Click "Create New Template"
3. Use this template structure:

```
Subject: Your EasyProp OTP Code

Hello {{to_name}},

Your OTP code for EasyProp registration is: {{otp_code}}

This code will expire in 10 minutes. Please do not share this code with anyone.

If you didn't request this code, please ignore this email.

Best regards,
EasyProp Team
```

4. Note down your **Template ID**

## Step 4: Get Public Key

1. Go to "Account" > "General"
2. Find your **Public Key**
3. Copy it for configuration

## Step 5: Update Configuration

Update the file `src/services/emailService.js` with your credentials:

```javascript
// Replace these with your actual EmailJS credentials
const EMAILJS_SERVICE_ID = 'your_actual_service_id';
const EMAILJS_TEMPLATE_ID = 'your_actual_template_id'; 
const EMAILJS_PUBLIC_KEY = 'your_actual_public_key';
```

## Step 6: Test the Setup

1. Start your application
2. Go to the registration page
3. Enter a valid email address
4. Check if you receive the OTP email

## Template Variables

The email template uses these variables:
- `{{to_email}}` - Recipient's email address
- `{{to_name}}` - Recipient's name
- `{{otp_code}}` - The 6-digit OTP code
- `{{from_name}}` - Sender name (EasyProp)

## Troubleshooting

### Common Issues:

1. **Email not received**: Check spam folder, verify service configuration
2. **Template not found**: Ensure template ID is correct
3. **Service error**: Verify service ID and email provider settings
4. **Rate limiting**: EmailJS free plan has monthly limits

### Alternative Solutions:

If EmailJS doesn't work for you, consider these alternatives:

1. **Firebase Functions + Nodemailer**
2. **SendGrid API**
3. **AWS SES**
4. **Mailgun**

## Security Notes

- Never expose your private keys in client-side code
- Consider implementing rate limiting
- Use HTTPS in production
- Validate email addresses server-side
- Store OTPs securely (not in localStorage for production)

## Production Recommendations

For production use, consider:
1. Moving OTP generation and validation to a secure backend
2. Using a database to store OTPs instead of localStorage
3. Implementing proper rate limiting
4. Adding email verification before sending OTP
5. Using environment variables for configuration