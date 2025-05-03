export async function POST(request) {
    const { recaptchaToken } = await request.json();
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
    if (!recaptchaToken) {
      return new Response(JSON.stringify({ success: false, message: 'Missing recaptcha token' }), { status: 400 });
    }
  
    try {
      const googleRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${secretKey}&response=${recaptchaToken}`,
      });
  
      const googleData = await googleRes.json();
  
      if (googleData.success) {
        return new Response(JSON.stringify({ success: true, message: 'reCAPTCHA verified' }), { status: 200 });
      } else {
        return new Response(JSON.stringify({ success: false, message: 'Failed reCAPTCHA verification' }), { status: 400 });
      }
    } catch (error) {
      console.error('reCAPTCHA error:', error);
      return new Response(JSON.stringify({ success: false, message: 'Server error during reCAPTCHA verification' }), { status: 500 });
    }
  }
  