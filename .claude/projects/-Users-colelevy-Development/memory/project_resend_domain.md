---
name: resend_domain_verification
description: Contact form emails route to colelevy08@gmail.com until domain is verified in Resend after site sale
type: project
---

Contact form uses Resend API (key: set in Vercel as RESEND_API_KEY). Free tier with onboarding@resend.dev can only deliver to account owner (colelevy08@gmail.com).

**Why:** Owners haven't bought the site yet, no domain access to verify.

**How to apply:** Once owners buy and give domain access:
1. Resend dashboard → Domains → verify standardfaresaratoga.com or surethinghospitality.com
2. In api/contact-form.js, remove the `resendAccountEmail` / `deliverTo` workaround and send directly to `recipient`
3. Update Resend "from" address from onboarding@resend.dev to a custom address like noreply@standardfaresaratoga.com
