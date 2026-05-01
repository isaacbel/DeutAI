const nodemailer = require('nodemailer');

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: parseInt(process.env.EMAIL_PORT, 10) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

async function sendPasswordResetEmail(toEmail, resetToken) {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8"></head>
    <body style="margin:0;padding:0;background:#000000;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="520" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border:1px solid #2a2a2a;border-radius:8px;padding:40px;">
              <tr>
                <td align="center" style="padding-bottom:24px;border-bottom:1px solid #2a2a2a;">
                  <span style="font-size:22px;font-weight:bold;color:#D4AF37;letter-spacing:2px;">DeutAI</span>
                  <br>
                  <span style="font-size:10px;color:#444444;letter-spacing:4px;">SYSTÈME 404</span>
                </td>
              </tr>
              <tr>
                <td style="padding:28px 0 16px;">
                  <p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 16px;">
                    Vous avez demandé la réinitialisation de votre mot de passe DeutAI.
                  </p>
                  <p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 28px;">
                    Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien est valable <strong style="color:#D4AF37;">1 heure</strong>.
                  </p>
                  <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                    <tr>
                      <td align="center" style="border-radius:8px;background:#D4AF37;">
                        <a href="${resetLink}"
                           style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:bold;color:#000000;text-decoration:none;border-radius:8px;letter-spacing:1px;">
                          RÉINITIALISER MON MOT DE PASSE
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="color:#666666;font-size:12px;line-height:1.6;margin:28px 0 0;">
                    Si vous n'avez pas demandé cette réinitialisation, ignorez cet email — votre compte reste sécurisé.
                  </p>
                  <p style="color:#444444;font-size:11px;margin:12px 0 0;word-break:break-all;">
                    Lien : <a href="${resetLink}" style="color:#888888;">${resetLink}</a>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding-top:24px;border-top:1px solid #2a2a2a;">
                  <p style="color:#444444;font-size:11px;text-align:center;margin:0;">
                    DeutAI — Système 404 &nbsp;|&nbsp; Master 2 Didactique de l'Allemand
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const transporter = createTransporter();

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: toEmail,
      subject: 'DeutAI — Réinitialisation de votre mot de passe',
      html,
    });
  } catch (err) {
    console.error('[EmailService] Échec envoi email reset à', toEmail, ':', err.message);
    throw err;
  }
}

module.exports = { sendPasswordResetEmail };
