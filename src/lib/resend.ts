export interface ResendEmail {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(email: ResendEmail): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error(
      'Missing RESEND_API_KEY environment variable. Please set this in your .env file.'
    );
  }
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(email),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Resend API call failed: ${err || response.statusText}`);
  }
}
