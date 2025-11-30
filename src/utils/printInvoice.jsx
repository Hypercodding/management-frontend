export default function printInvoice(invoice) {
    const printWindow = window.open('', '', 'width=900,height=700');
    const totalCommission = invoice.items.reduce((sum, item) => sum + parseFloat(item.commission || 0), 0);
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${invoice.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 40px; 
              color: #333;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .invoice-container {
              background: white;
              border-radius: 16px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              overflow: hidden;
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px;
              position: relative;
            }
            .company-name { 
              font-size: 36px; 
              font-weight: bold; 
              margin-bottom: 8px;
              letter-spacing: 1px;
            }
            .company-address {
              font-size: 14px;
              opacity: 0.95;
              line-height: 1.6;
            }
            .invoice-title {
              position: absolute;
              right: 40px;
              top: 40px;
              text-align: right;
            }
            .invoice-title h1 {
              font-size: 48px;
              font-weight: 300;
              letter-spacing: 2px;
            }
            .invoice-number {
              font-size: 18px;
              opacity: 0.9;
              margin-top: 5px;
            }
            .content { 
              padding: 40px;
            }
            .invoice-details { 
              display: flex;
              justify-content: space-between;
              margin-bottom: 40px;
              padding-bottom: 30px;
              border-bottom: 2px solid #e5e7eb;
            }
            .details-section h3 {
              color: #667eea;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 12px;
              font-weight: 600;
            }
            .details-section p {
              margin: 6px 0;
              font-size: 15px;
            }
            .status-badge {
              display: inline-block;
              padding: 6px 16px;
              border-radius: 20px;
              font-size: 13px;
              font-weight: 600;
              margin-top: 8px;
              ${invoice.status === 'paid' 
                ? 'background: #d1fae5; color: #065f46;' 
                : 'background: #fed7aa; color: #9a3412;'
              }
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 30px 0;
            }
            thead {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            th { 
              padding: 16px; 
              text-align: left; 
              font-weight: 600;
              text-transform: uppercase;
              font-size: 12px;
              letter-spacing: 1px;
            }
            td { 
              padding: 16px; 
              border-bottom: 1px solid #e5e7eb;
            }
            tbody tr:hover {
              background-color: #f9fafb;
            }
            .commission-cell {
              color: #10b981;
              font-weight: 600;
            }
            .totals-section {
              margin-top: 40px;
              display: flex;
              justify-content: flex-end;
            }
            .totals-box {
              width: 350px;
              background: #f9fafb;
              padding: 24px;
              border-radius: 12px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 12px 0;
              font-size: 15px;
            }
            .total-row.grand-total {
              border-top: 2px solid #667eea;
              padding-top: 16px;
              margin-top: 16px;
              font-size: 24px;
              font-weight: bold;
              color: #667eea;
            }
            .footer { 
              margin-top: 60px; 
              text-align: center; 
              color: #6b7280;
              padding-top: 30px;
              border-top: 2px solid #e5e7eb;
            }
            .footer p {
              margin: 8px 0;
              font-size: 14px;
            }
            .thank-you {
              font-size: 18px;
              font-weight: 600;
              color: #667eea;
              margin-bottom: 12px;
            }
            @media print {
              body { 
                background: white; 
                padding: 0; 
              }
              .invoice-container {
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div>
                <div class="company-name">Vision Nexera</div>
                <div class="company-address">
                  Plaza 18, Usman Block<br>
                  Alkabir Town, Phase 2
                </div>
              </div>
              <div class="invoice-title">
                <h1>INVOICE</h1>
                <div class="invoice-number">#${invoice.id}</div>
              </div>
            </div>
            
            <div class="content">
              <div class="invoice-details">
                <div class="details-section">
                  <h3>Billed To</h3>
                  <p><strong>${invoice.clientName || invoice.client_name}</strong></p>
                </div>
                <div class="details-section">
                  <h3>Invoice Details</h3>
                  <p><strong>Date:</strong> ${new Date(invoice.date || invoice.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p><strong>Status:</strong> <span class="status-badge">${invoice.status.toUpperCase()}</span></p>
                </div>
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Rate</th>
                    <th style="text-align: right;">Commission</th>
                    <th style="text-align: right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoice.items.map(item => `
                    <tr>
                      <td>${item.description}</td>
                      <td style="text-align: center;">${item.quantity}</td>
                      <td style="text-align: right;">PKR ${parseFloat(item.rate).toFixed(2)}</td>
                      <td style="text-align: right;" class="commission-cell">PKR ${parseFloat(item.commission || 0).toFixed(2)}</td>
                      <td style="text-align: right; font-weight: 600;">PKR ${(item.quantity * parseFloat(item.rate)).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <div class="totals-section">
                <div class="totals-box">
                  <div class="total-row">
                    <span>Subtotal:</span>
                    <span>PKR ${parseFloat(invoice.total).toFixed(2)}</span>
                  </div>
                  ${totalCommission > 0 ? `
                  <div class="total-row">
                    <span>Total Commission:</span>
                    <span class="commission-cell">PKR ${totalCommission.toFixed(2)}</span>
                  </div>
                  ` : ''}
                  <div class="total-row grand-total">
                    <span>Total:</span>
                    <span>PKR ${parseFloat(invoice.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div class="footer">
                <p class="thank-you">Thank you for your business!</p>
                <p>Payment terms: Net 30 days</p>
                <p>If you have any questions, please contact us.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };