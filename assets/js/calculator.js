let taxBrackets = [];

async function loadBrackets() {
  try {
    const res = await fetch("docs/tax_brackets_reference.json");
    taxBrackets = await res.json();

    taxBrackets = taxBrackets.map(b => ({
      min: b.min,
      max: b.max === null ? Infinity : (b.max ?? Infinity),
      rate: b.rate
    }));

    console.log("Brackets loaded:", taxBrackets);

    // Enable calculate button
    document.getElementById("calcBtn").disabled = false;

    // Render bracket table UI
    renderBracketTable();
  } catch (err) {
    console.error("Bracket load failed:", err);
  }
}

loadBrackets();

function formatNaira(num) {
  return "₦" + Number(num).toLocaleString("en-NG", {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

function renderBracketTable() {
  const table = document.getElementById("bracketTable");
  let html = `
    <h3>2026 Progressive Tax Brackets</h3>
    <table border="1" style="width:100%; border-collapse:collapse; margin:10px 0;">
      <tr>
        <th>Income Range (₦)</th>
        <th>Rate</th>
      </tr>
  `;

  taxBrackets.forEach(b => {
    html += `
      <tr>
        <td>${formatNaira(b.min)} – ${b.max === Infinity ? "∞" : formatNaira(b.max)}</td>
        <td>${b.rate * 100}%</td>
      </tr>
    `;
  });

  html += `</table><hr>`;
  table.innerHTML = html;
}

function calculateTax() {
  if (taxBrackets.length === 0) {
    document.getElementById("result").innerHTML = "<p>⚠ Tax brackets still loading...</p>";
    return;
  }

  const income = Number(document.getElementById("income").value);
  const rent = Number(document.getElementById("rent").value);

  if (income <= 800000) {
    document.getElementById("result").innerHTML = `
      <h3>Income is tax-exempt under 2026 law</h3>
      <p>Total Tax: <strong>₦0.00</strong></p>`;
    return;
  }

  let taxable = income;
  const rentRelief = Math.min(500000, rent * 0.2);
  taxable -= rentRelief;

  let tax = 0;
  let html = `<h3>Tax Breakdown</h3>`;
  html += `<p>Income: <strong>${formatNaira(income)}</strong></p>`;
  html += `<p>Rent: <strong>${formatNaira(rent)}</strong></p>`;
  html += `<p>Rent Relief: <strong>${formatNaira(rentRelief)}</strong></p>`;
  html += `<p>Taxable Income: <strong>${formatNaira(Math.max(800000, taxable))}</strong></p><hr>`;

  taxBrackets.forEach(b => {
    if (taxable > b.min) {
      const upper = Math.min(taxable, b.max);
      const amount = upper - b.min;
      const t = amount * b.rate;
      tax += t;
      html += `<p>${formatNaira(b.min+1)} – ${b.max === Infinity ? "∞" : formatNaira(b.max)} @ ${b.rate*100}% → <strong>${formatNaira(t)}</strong></p>`;
    }
  });

  html += `<hr><p>Total Tax: <strong>${formatNaira(tax)}</strong></p>`;
  document.getElementById("result").innerHTML = html;
}
