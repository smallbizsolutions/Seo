const nodemailer = require('nodemailer');

async function sendAuditEmail(email, auditData) {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const findingsHTML = auditData.findings.map(f => {
        const color = f.severity === 'critical' ? '#f56565' : 
                     f.severity === 'warning' ? '#ed8936' : '#48bb78';
        return `
            <div style="margin: 15px 0; padding: 15px; background: #f7fafc; border-left: 4px solid ${color};">
                <strong>${f.title}</strong>
                <p style="margin: 5px 0 0 0; color: #666;">${f.description}</p>
            </div>
        `;
    }).join('');

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Your Local SEO Audit Results - Score: ${auditData.overallScore}/100`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #1a202c; text-align: center;">Your Local SEO Audit Results</h1>
                
                <div style="text-align: center; margin: 30px 0;">
                    <div style="display: inline-block; width: 150px; height: 150px; border-radius: 50%; background: #f7fafc; 
                                line-height: 150px; font-size: 48px; font-weight: bold;">
                        ${auditData.overallScore}
                    </div>
                    <p style="font-size: 18px; margin-top: 10px;">out of 100</p>
                </div>

                <h2 style="color: #2d3748;">Business: ${auditData.businessName}</h2>
                <p style="color: #666;">Location: ${auditData.location}</p>

                <h3 style="color: #2d3748; margin-top: 30px;">What We Found:</h3>
                ${findingsHTML}

                <div style="margin: 40px 0; padding: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                            border-radius: 10px; text-align: center; color: white;">
                    <h3 style="color: white; margin-top: 0;">Ready to Fix These Issues?</h3>
                    <p>Get ongoing monitoring and weekly reports for just $29/month</p>
                    <a href="${process.env.APP_URL || 'https://your-app.railway.app'}" 
                       style="display: inline-block; margin-top: 15px; padding: 12px 30px; background: white; 
                              color: #667eea; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        Start Monitoring Now
                    </a>
                </div>

                <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
                    You received this email because you requested a free SEO audit.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Audit email sent to:', email);
    } catch (error) {
        console.error('Email error:', error);
        throw error;
    }
}

module.exports = { sendAuditEmail };
