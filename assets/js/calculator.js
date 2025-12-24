const brackets = [
  { min: 800000, max: 2000000, rate: 0.07 },
  { min: 2000000, max: 5000000, rate: 0.15 },
  { min: 5000000, max: 10000000, rate: 0.19 },
  { min: 10000000, max: 50000000, rate: 0.21 },
  { min: 50000000, max: Infinity, rate: 0.25 }
];

function formatNaira(num) {
  return "₦" + num.toLocaleString("en-NG", {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

function calculateTax() {
  const income = Number(document.getElementById("income").value);
  const rent = Number(document.getElementById("rent").value);

  if (income <= 800000) {
    document.getElementById("result").innerHTML = `
      <h3>Income is tax-exempt under the 2026 law.</h3>
      <p>Total Tax: <strong>₦0.00</strong></p>`;
    return;
  }

  let taxable = income;
  const rentRelief = Math.min(500000, rent * 0.2);
  taxable -= rentRelief;

  let tax = 0;
  let breakdownHTML = `<h3>Tax Breakdown</h3>`;
  breakdownHTML += `<p>Annual Income: <strong>${formatNaira(income)}</strong></p>`;
  breakdownHTML += `<p>Rent Paid: <strong>${formatNaira(rent)}</strong></p>`;
  breakdownHTML += `<p>Rent Relief Applied: <strong>${formatNaira(rentRelief)}</strong></p>`;
  breakdownHTML += `<p>Taxable Income After Relief: <strong>${formatNaira(Math.max(800000, taxable))}</strong></p><hr>`;

  brackets.forEach(b => {
    if (taxable > b.min) {
      const taxedAmount = Math.min(taxable, b.max) - b.min;
      const bracketTax = taxedAmount * b.rate;
      tax += bracketTax;
      breakdownHTML += `<p>${formatNaira(b.min+1)} – ${b.max === Infinity ? "∞" : formatNaira(b.max)} @ ${(b.rate*100)}% → <strong>${formatNaira(bracketTax)}</strong></p>`;
    }
  });

  breakdownHTML += `<hr><p>Total Tax Payable: <strong>${formatNaira(tax)}</strong></p>`;

  document.getElementById("result").innerHTML = breakdownHTML;
}

