const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generateAuditPDF(auditData, outputPath) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const writeStream = fs.createWriteStream(outputPath);

            doc.pipe(writeStream);

            // Header
            doc.fontSize(24).text('Local SEO Audit Report', { align: 'center' });
            doc.moveDown();
            doc.fontSize(16).text(auditData.businessName, { align: 'center' });
            doc.fontSize(12).text(auditData.location, { align: 'center' });
            doc.moveDown(2);

            // Score
            doc.fontSize(18).text(`Overall Score: ${auditData.overallScore}/100`);
            doc.moveDown();

            // Findings
            doc.fontSize(16).text('Findings:', { underline: true });
            doc.moveDown();

            auditData.findings.forEach((finding, index) => {
                const icon = finding.severity === 'critical' ? '🔴' : 
                            finding.severity === 'warning' ? '🟡' : '🟢';
                
                doc.fontSize(12).text(`${icon} ${finding.title}`, { bold: true });
                doc.fontSize(10).text(finding.description, { indent: 20 });
                doc.moveDown();
            });

            // Footer
            doc.moveDown(2);
            doc.fontSize(10).text('Want to fix these issues? Visit our website to get started.', { align: 'center' });

            doc.end();

            writeStream.on('finish', () => resolve(outputPath));
            writeStream.on('error', reject);
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { generateAuditPDF };
