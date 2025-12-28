# 🧪 OTP SYSTEM TESTING CHECKLIST

## ✅ BACKEND API TESTING

### Send OTP Tests
- [ ] Valid email + RESET_PASSWORD purpose → Success
- [ ] Valid email + LOGIN purpose → Success  
- [ ] Invalid email → "Email not found" error
- [ ] Malformed email → Validation error
- [ ] Rate limit (2 requests within 60s) → "Please wait" error
- [ ] Missing purpose → Validation error

### Verify OTP Tests
- [ ] Valid OTP + correct purpose → Success
- [ ] Invalid OTP → "Invalid OTP" error
- [ ] Expired OTP (after 5 minutes) → "Invalid or expired OTP"
- [ ] Reused OTP → "Invalid or expired OTP"
- [ ] 4th attempt on same OTP → "Too many attempts"
- [ ] Wrong purpose → "Invalid OTP"

### Login with OTP Tests
- [ ] Valid LOGIN OTP → JWT token returned
- [ ] Invalid LOGIN OTP → Error
- [ ] RESET_PASSWORD OTP for login → Error

### Reset Password Tests
- [ ] Valid RESET_PASSWORD OTP + new password → Success
- [ ] Invalid OTP → Error
- [ ] LOGIN OTP for reset → Error
- [ ] Weak password → Validation error

## ✅ FRONTEND TESTING

### Forgot Password Flow
- [ ] Email input validation
- [ ] Success message on OTP sent
- [ ] Navigation to OTP verification
- [ ] Error handling for invalid email

### OTP Verification
- [ ] 6-digit input auto-focus
- [ ] Backspace navigation
- [ ] Timer countdown (60 seconds)
- [ ] Resend OTP after timer
- [ ] Success navigation to reset password
- [ ] Error messages display correctly

### Reset Password
- [ ] Password validation (min 6 chars)
- [ ] Confirm password matching
- [ ] Success navigation to login
- [ ] Error handling

### Login with OTP
- [ ] Email step validation
- [ ] OTP step functionality
- [ ] Auto-login on success
- [ ] Step navigation

## ✅ SECURITY TESTING

### Rate Limiting
- [ ] 1 OTP per 60 seconds per email enforced
- [ ] 5 API requests per minute per IP enforced
- [ ] Rate limit messages clear

### OTP Security
- [ ] OTP is 6 digits
- [ ] OTP expires in 5 minutes
- [ ] OTP can only be used once
- [ ] Max 3 verification attempts
- [ ] OTP is hashed in database

### Email Security
- [ ] No OTP visible in logs
- [ ] Email credentials from environment variables
- [ ] Professional email template
- [ ] No sensitive data in email

## ✅ INTEGRATION TESTING

### Existing Authentication
- [ ] Regular login still works
- [ ] JWT tokens still valid
- [ ] Refresh token flow unaffected
- [ ] Role-based access unchanged

### Database
- [ ] EmailOtp table created
- [ ] OTP records saved correctly
- [ ] Cleanup of expired OTPs
- [ ] No impact on existing tables

### Email Delivery
- [ ] Gmail SMTP connection works
- [ ] Emails delivered to inbox
- [ ] Email template renders correctly
- [ ] Delivery time < 30 seconds

## ✅ ERROR SCENARIOS

### Network Issues
- [ ] SMTP server down → Graceful error
- [ ] Database connection lost → Error handling
- [ ] API timeout → Proper response

### Edge Cases
- [ ] Concurrent OTP requests
- [ ] Browser refresh during OTP flow
- [ ] Multiple tabs with same email
- [ ] System clock changes

## ✅ PERFORMANCE TESTING

### Load Testing
- [ ] 100 concurrent OTP requests
- [ ] Email delivery under load
- [ ] Database performance with many OTPs
- [ ] Memory usage acceptable

## 🔧 SETUP REQUIREMENTS

### Environment Variables
```bash
EMAIL_FROM=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

### Gmail Setup
1. Enable 2-Factor Authentication
2. Generate App Password for Mail
3. Use app password (not regular password)

### Database Migration
- EmailOtp table will be created automatically
- No manual migration needed

## 📊 SUCCESS CRITERIA

- [ ] All API tests pass
- [ ] All frontend flows work
- [ ] Security measures effective
- [ ] Existing functionality unaffected
- [ ] Email delivery reliable
- [ ] Performance acceptable
- [ ] Error handling comprehensive

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Environment variables configured
- [ ] Gmail SMTP credentials valid
- [ ] Rate limiting policies active
- [ ] Monitoring alerts configured
- [ ] Backup email service ready (optional)

---

**Note**: Run tests in this order:
1. Backend API tests (Postman)
2. Frontend flow tests (Manual)
3. Security tests (Manual + Tools)
4. Integration tests (Full system)
5. Performance tests (Load testing tools)