export default function printSalarySlip(salary) {
    const printWindow = window.open('', '', 'width=900,height=700');
    const paymentDate = new Date(salary.payment_date || salary.created_at);
    const paymentMonth = new Date(salary.payment_month);
    
    // Format currency (PKR - Pakistani Rupees)
    const formatCurrency = (amount) => {
        return `PKR ${parseFloat(amount || 0).toFixed(2)}`;
    };
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Salary Slip - ${salary.employee_name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 40px; 
              color: #333;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .slip-container {
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
            .slip-title {
              position: absolute;
              right: 40px;
              top: 40px;
              text-align: right;
            }
            .slip-title h1 {
              font-size: 48px;
              font-weight: 300;
              letter-spacing: 2px;
            }
            .slip-number {
              font-size: 18px;
              opacity: 0.9;
              margin-top: 5px;
            }
            .content { 
              padding: 40px;
            }
            .employee-details { 
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
            .info-badge {
              display: inline-block;
              padding: 6px 16px;
              border-radius: 20px;
              font-size: 13px;
              font-weight: 600;
              margin-top: 8px;
              background: #dbeafe;
              color: #1e40af;
            }
            .salary-breakdown {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin: 30px 0;
            }
            .earnings-section, .deductions-section {
              background: #f9fafb;
              padding: 24px;
              border-radius: 12px;
            }
            .section-title {
              color: #667eea;
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 20px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .salary-row {
              display: flex;
              justify-content: space-between;
              padding: 12px 0;
              border-bottom: 1px solid #e5e7eb;
              font-size: 15px;
            }
            .salary-row:last-child {
              border-bottom: none;
            }
            .salary-row .label {
              color: #6b7280;
            }
            .salary-row .amount {
              font-weight: 600;
              color: #111827;
            }
            .salary-row.earnings .amount {
              color: #10b981;
            }
            .salary-row.deductions .amount {
              color: #ef4444;
            }
            .totals-section {
              margin-top: 40px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 30px;
              border-radius: 12px;
              color: white;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 16px 0;
              font-size: 18px;
            }
            .total-row.gross {
              border-bottom: 2px solid rgba(255,255,255,0.3);
              padding-bottom: 16px;
              margin-bottom: 20px;
            }
            .total-row.net {
              font-size: 28px;
              font-weight: bold;
              border-top: 2px solid rgba(255,255,255,0.3);
              padding-top: 20px;
              margin-top: 20px;
            }
            .proration-info {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 16px;
              margin: 20px 0;
              border-radius: 8px;
            }
            .proration-info p {
              margin: 4px 0;
              font-size: 14px;
              color: #92400e;
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
              .slip-container {
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="slip-container">
            <div class="header">
              <div>
                <div class="company-name">Vision Nexera</div>
                <div class="company-address">
                  Plaza 18, Usman Block<br>
                  Alkabir Town, Phase 2
                </div>
              </div>
              <div class="slip-title">
                <h1>SALARY SLIP</h1>
                <div class="slip-number">#${salary.id}</div>
              </div>
            </div>
            
            <div class="content">
              <div class="employee-details">
                <div class="details-section">
                  <h3>Employee Information</h3>
                  <p><strong>${salary.employee_name || 'N/A'}</strong></p>
                  ${salary.employee_code ? `<p>Employee Code: ${salary.employee_code}</p>` : ''}
                  ${salary.position ? `<p>Position: ${salary.position}</p>` : ''}
                </div>
                <div class="details-section">
                  <h3>Payment Details</h3>
                  <p><strong>Payment Month:</strong> ${paymentMonth.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
                  <p><strong>Payment Date:</strong> ${paymentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p><strong>Payment Method:</strong> ${(salary.payment_method || 'Bank Transfer').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                  ${salary.is_prorated ? '<span class="info-badge">Prorated Salary</span>' : ''}
                </div>
              </div>
              
              ${salary.is_prorated && salary.working_days && salary.total_days_in_month ? `
              <div class="proration-info">
                <p><strong>Proration Details:</strong></p>
                <p>Working Days: ${salary.working_days} out of ${salary.total_days_in_month} days</p>
                ${salary.leave_days > 0 ? `<p>Leave Days: ${salary.leave_days}</p>` : ''}
              </div>
              ` : ''}
              
              <div class="salary-breakdown">
                <div class="earnings-section">
                  <div class="section-title">Earnings</div>
                  <div class="salary-row earnings">
                    <span class="label">Base Salary</span>
                    <span class="amount">${formatCurrency(salary.base_salary)}</span>
                  </div>
                  ${parseFloat(salary.allowances || 0) > 0 ? `
                  <div class="salary-row earnings">
                    <span class="label">Allowances</span>
                    <span class="amount">${formatCurrency(salary.allowances)}</span>
                  </div>
                  ` : ''}
                  ${parseFloat(salary.overtime_pay || 0) > 0 ? `
                  <div class="salary-row earnings">
                    <span class="label">Overtime Pay</span>
                    <span class="amount">${formatCurrency(salary.overtime_pay)}</span>
                  </div>
                  ${salary.overtime_hours ? `
                  <div class="salary-row" style="font-size: 12px; color: #6b7280; padding-top: 0;">
                    <span class="label">(${parseFloat(salary.overtime_hours).toFixed(2)} hours)</span>
                    <span></span>
                  </div>
                  ` : ''}
                  ` : ''}
                  ${parseFloat(salary.bonus || 0) > 0 ? `
                  <div class="salary-row earnings">
                    <span class="label">Bonus</span>
                    <span class="amount">${formatCurrency(salary.bonus)}</span>
                  </div>
                  ` : ''}
                </div>
                
                <div class="deductions-section">
                  <div class="section-title">Deductions</div>
                  ${parseFloat(salary.tax_deduction || 0) > 0 ? `
                  <div class="salary-row deductions">
                    <span class="label">Tax Deduction</span>
                    <span class="amount">-${formatCurrency(salary.tax_deduction)}</span>
                  </div>
                  ` : ''}
                  ${parseFloat(salary.insurance_deduction || 0) > 0 ? `
                  <div class="salary-row deductions">
                    <span class="label">Insurance Deduction</span>
                    <span class="amount">-${formatCurrency(salary.insurance_deduction)}</span>
                  </div>
                  ` : ''}
                  ${parseFloat(salary.loan_deduction || 0) > 0 ? `
                  <div class="salary-row deductions">
                    <span class="label">Loan Deduction</span>
                    <span class="amount">-${formatCurrency(salary.loan_deduction)}</span>
                  </div>
                  ` : ''}
                  ${parseFloat(salary.advance_deduction || 0) > 0 ? `
                  <div class="salary-row deductions">
                    <span class="label">Advance Deduction</span>
                    <span class="amount">-${formatCurrency(salary.advance_deduction)}</span>
                  </div>
                  ` : ''}
                  ${parseFloat(salary.other_deductions || 0) > 0 ? `
                  <div class="salary-row deductions">
                    <span class="label">Other Deductions</span>
                    <span class="amount">-${formatCurrency(salary.other_deductions)}</span>
                  </div>
                  ` : ''}
                  ${parseFloat(salary.total_deductions || 0) === 0 ? `
                  <div class="salary-row" style="color: #6b7280; font-style: italic;">
                    <span class="label">No deductions</span>
                    <span></span>
                  </div>
                  ` : ''}
                </div>
              </div>
              
              <div class="totals-section">
                <div class="total-row gross">
                  <span>Gross Salary:</span>
                  <span>${formatCurrency(salary.gross_salary)}</span>
                </div>
                <div class="total-row">
                  <span>Total Deductions:</span>
                  <span>-${formatCurrency(salary.total_deductions)}</span>
                </div>
                <div class="total-row net">
                  <span>Net Salary:</span>
                  <span>${formatCurrency(salary.net_salary)}</span>
                </div>
              </div>
              
              ${salary.notes ? `
              <div style="margin-top: 30px; padding: 16px; background: #f9fafb; border-radius: 8px;">
                <p style="font-weight: 600; margin-bottom: 8px; color: #667eea;">Notes:</p>
                <p style="color: #6b7280; font-size: 14px;">${salary.notes}</p>
              </div>
              ` : ''}
              
              <div class="footer">
                <p class="thank-you">This is a computer-generated document.</p>
                <p>For any queries, please contact the HR department.</p>
                <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
                  Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

