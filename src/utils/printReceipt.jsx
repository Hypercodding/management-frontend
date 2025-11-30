export default function printReceipt(transaction) {
    const printWindow = window.open('', '', 'width=600,height=400');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; }
            .header { text-align: center; margin-bottom: 20px; }
            .receipt-details { margin: 20px 0; }
            .amount { font-size: 24px; font-weight: bold; color: #10b981; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>RECEIPT</h2>
            <p>Vision Nexera</p>
          </div>
          <div class="receipt-details">
            <p><strong>Receipt #:</strong> ${transaction.id}</p>
            <p><strong>Date:</strong> ${new Date(transaction.date).toLocaleDateString()}</p>
            <p><strong>Description:</strong> ${transaction.description}</p>
            <div class="amount">Amount: PKR ${parseFloat(transaction.amount || 0).toFixed(2)}</div>
            <p><strong>Category:</strong> ${transaction.category}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
  