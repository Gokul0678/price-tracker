const { Resend } = require('resend')
const resend = new Resend(process.env.RESEND_API_KEY)

async function sendPriceAlert({ productName, currentPrice, targetPrice, productUrl, toEmail }) {
  try {
    await resend.emails.send({
      from: 'Price Tracker <onboarding@resend.dev>',
      to: toEmail,
      subject: `Price Drop Alert: ${productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2563eb; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">💰 Price Drop Alert!</h1>
          </div>
          <div style="padding: 24px; background: #f8fafc;">
            <h2 style="color: #1e293b;">${productName}</h2>
            <div style="display: flex; gap: 16px; margin: 20px 0;">
              <div style="background: white; border-radius: 8px; padding: 16px; flex: 1; text-align: center;">
                <div style="color: #6b7280; font-size: 12px;">Current Price</div>
                <div style="color: #16a34a; font-size: 24px; font-weight: bold;">Rs.${currentPrice}</div>
              </div>
              <div style="background: white; border-radius: 8px; padding: 16px; flex: 1; text-align: center;">
                <div style="color: #6b7280; font-size: 12px;">Your Target</div>
                <div style="color: #2563eb; font-size: 24px; font-weight: bold;">Rs.${targetPrice}</div>
              </div>
            </div>
            <a href="${productUrl}" 
               style="display: block; background: #2563eb; color: white; text-align: center; 
                      padding: 14px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Buy Now →
            </a>
            <p style="color: #6b7280; font-size: 12px; margin-top: 16px; text-align: center;">
              Sent by Price Tracker App
            </p>
          </div>
        </div>
      `
    })
    console.log(`📧 Email sent to ${toEmail} for ${productName}`)
    return true
  } catch (error) {
    console.log('Email error:', error.message)
    return false
  }
}

module.exports = { sendPriceAlert }