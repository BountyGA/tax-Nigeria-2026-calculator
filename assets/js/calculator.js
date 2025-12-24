let taxBrackets = [];
let cryptoRate = 0.10;
let expenseRateCap = 0.30;

window.onload = function() {
 ["income","rent","pension","nhis","nhf","insurance","crypto","expenses"].forEach(id => {
    const v = localStorage.getItem(id);
    if (v) document.getElementById(id).value = v;
  });
};

async function loadBrackets() {
  try {
    const res = await fetch("docs/tax_brackets_reference.json");
    taxBrackets = (await res.json()).map(b => ({
      min: b.min,
      max: b.max === null ? Infinity : (b.max ?? Infinity),
      rate: b.rate
    }));
    document.getElementById("calcBtn").disabled = false;
  } catch(e) { console.error(e); }
}
loadBrackets();

function renderBracketTable() {
  if (!taxBrackets.length) return;
  
  let html = `<h4>2026 Tax Brackets</h4>
    <div class="table-responsive">
      <table class="table table-bordered table-striped">
        <thead class="table-dark">
          <tr>
            <th>Income Range (₦)</th>
            <th>Rate (%)</th>
          </tr>
        </thead>
        <tbody>`;

  taxBrackets.forEach(b => {
    const maxDisplay = b.max === Infinity ? '∞' : formatNaira(b.max);
    html += `<tr>
      <td>${formatNaira(b.min + 1)} – ${maxDisplay}</td>
      <td>${(b.rate * 100).toFixed(2)}%</td>
    </tr>`;
  });

  html += `</tbody></table></div>`;

  document.getElementById('bracketTable').innerHTML = html;
}

loadBrackets().then(renderBracketTable);


function calculateNewTax2026(income, rent, pension, nhis, nhf, insurance, cryptoGain, expenses) {
  const rentRelief = Math.min(500000, rent * 0.2);
  const pensionRelief = Math.min(200000, pension);
  const insuranceRelief = Math.min(100000, insurance);
  const nhisRelief = nhis;
  const nhfRelief  = nhf;

  const maxExpenses = income * expenseRateCap;
  const expensesApplied = Math.min(maxExpenses, expenses);

  let taxable = income - rentRelief - pensionRelief - insuranceRelief - nhisRelief - nhfRelief - expensesApplied;
  taxable = Math.max(800000, taxable);

  let tax = 0;
  taxBrackets.forEach(b => {
    if (taxable > b.min) tax += (Math.min(taxable, b.max) - b.min) * b.rate;
  });

  const cryptoTax = cryptoGain > 0 ? cryptoGain * cryptoRate : 0;
  const monthlyTaxable = taxable / 12;
  const monthlyTax = (tax + cryptoTax) / 12;

  return { tax, taxable, rentRelief, pensionRelief, insuranceRelief, nhisRelief, nhfRelief, cryptoTax, expensesApplied, monthlyTaxable, monthlyTax };
}


function calculateTax(){
  const income = Number(document.getElementById("income").value);
  const rent = Number(document.getElementById("rent").value);
  const pension = Number(document.getElementById("pension").value);
  const nhis = Number(document.getElementById("nhis").value);
  const nhf  = Number(document.getElementById("nhf").value);
  const insurance = Number(document.getElementById("insurance").value);
  const cryptoGain = Number(document.getElementById("crypto").value);
  const expenses = Number(document.getElementById("expenses").value);

  if (!income) return result.innerHTML="⚠ Enter income";

  ["income","rent","pension","nhis","nhf","insurance","crypto","expenses"].forEach(id => {
    localStorage.setItem(id, Number(document.getElementById(id).value));
  });

  const n = calculateNewTax2026(income, rent, pension, nhis, nhf, insurance, cryptoGain, expenses);
  const totalTax = n.tax + n.cryptoTax;

  result.innerHTML = `
    <h3>2026 Tax Summary</h3>
    <p>Income: <strong>${formatNaira(income)}</strong></p>
    <p>Taxable: <strong>${formatNaira(n.taxable)}</strong></p>
    <p>Business Expense Relief: <strong>${formatNaira(n.expensesApplied)}</strong></p>
    <p>Rent Relief: <strong>${formatNaira(n.rentRelief)}</strong></p>
    <p>Pension Relief: <strong>${formatNaira(n.pensionRelief)}</strong></p>
    <p>Insurance Relief: <strong>${formatNaira(n.insuranceRelief)}</strong></p>
    <p>NHIS Relief: <strong>${formatNaira(n.nhisRelief)}</strong></p>
    <p>NHF Relief: <strong>${formatNaira(n.nhfRelief)}</strong></p>
    <p>Crypto Tax: <strong>${formatNaira(n.cryptoTax)}</strong></p>
    <p><strong>Total Tax (2026): ${formatNaira(totalTax)}</strong></p><hr>
  `;

  // Monthly breakdown mode
  document.getElementById("monthly").innerHTML = `
    <h3>Monthly Salary Tax Estimate (2026)</h3>
    <p>Monthly Taxable Income: <strong>${formatNaira(n.monthlyTaxable)}</strong></p>
    <p>Monthly Tax Payable: <strong>${formatNaira(n.monthlyTax)}</strong></p>
    <p>Take-Home After Monthly Tax: <strong>${formatNaira((income/12) - n.monthlyTax)}</strong></p>
    <button onclick="downloadPDF(${income},${n.taxable},${n.rentRelief},${n.pensionRelief},${n.insuranceRelief},${n.nhisRelief},${n.nhfRelief},${n.cryptoTax},${n.expensesApplied},${totalTax})">Download PDF Report</button>
  `;
}

// PDF Export Function
async function downloadPDF(income, taxable, rentRelief, pensionRelief, insuranceRelief, nhisRelief, nhfRelief, cryptoTax, expensesApplied, totalTax)
 {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Nigeria Tax Reform 2026 — Tax Report", 15, 15);

  doc.setFontSize(12);
  doc.text(`Annual Income: ${formatNaira(income)}`, 15, 30);
  doc.text(`Taxable Income After Reliefs: ${formatNaira(taxable)}`, 15, 38);
  doc.text(`Rent Relief Applied: ${formatNaira(rentRelief)}`, 15, 46);
  doc.text(`Pension Relief Applied: ${formatNaira(pensionRelief)}`, 15, 54);
  doc.text(`Insurance Relief Applied: ${formatNaira(insuranceRelief)}`, 15, 62);
  doc.text(`NHIS Relief Applied: ${formatNaira(nhisRelief)}`, 15, 70);
  doc.text(`NHF Relief Applied: ${formatNaira(nhfRelief)}`, 15, 78);
  doc.text(`Business Expense Deduction: ${formatNaira(expensesApplied)}`, 15, 86);
  doc.text(`Crypto Gains Tax: ${formatNaira(cryptoTax)}`, 15, 94);

  doc.setFontSize(14);
  doc.text(`TOTAL TAX PAYABLE: ${formatNaira(totalTax)}`, 15, 103);

  doc.save("Nigeria_Tax_2026_Report.pdf");
}
