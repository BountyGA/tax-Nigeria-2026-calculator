function formatNaira(n){
  return "₦" + n.toLocaleString("en-NG", {minimumFractionDigits:2, maximumFractionDigits:2});
}

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

    renderBracketTable();
    document.getElementById("calcBtn").disabled = false;
  } catch(e) { console.error("Bracket load failed", e); }
}

function renderBracketTable() {
  if (!taxBrackets.length) return;
  let html = `<h4>2026 Tax Brackets</h4><table class="table table-bordered"><tbody>`;
  taxBrackets.forEach(b => {
    html += `<tr><td>${formatNaira(b.min+1)} – ${b.max === Infinity ? '∞' : formatNaira(b.max)}</td><td>${(b.rate*100).toFixed(2)}%</td></tr>`;
  });
  html += `</tbody></table>`;
  document.getElementById("bracketTable").innerHTML = html;
}

loadBrackets();

function calculateNewTax2026(income, rent, pension, nhis, nhf, insurance, cryptoGain, expenses) {
  const rentRelief = Math.min(500000, rent * 0.2);
  const pensionRelief = Math.min(200000, pension);
  const insuranceRelief = Math.min(100000, insurance);
  const expensesApplied = Math.min(income * expenseRateCap, expenses);

  let taxable = Math.max(800000, income - rentRelief - pensionRelief - insuranceRelief - nhis - nhf - expensesApplied);

  let tax = 0;
  taxBrackets.forEach(b => {
    if (taxable > b.min) tax += (Math.min(taxable, b.max) - b.min) * b.rate;
  });

  const cryptoTax = cryptoGain > 0 ? cryptoGain * cryptoRate : 0;
  return { tax, taxable, rentRelief, pensionRelief, insuranceRelief, cryptoTax, expensesApplied, monthlyTaxable: taxable/12, monthlyTax:(tax+cryptoTax)/12 };
}

function calculateTax(){
  const income = Number(document.getElementById("income").value);
  const result = document.getElementById("result");

  if (income <= 0) {
    result.innerHTML = `<div class="alert alert-danger">⚠ Enter valid income</div>`;
    return;
  }

  const n = calculateNewTax2026(
    income,
    Number(document.getElementById("rent").value),
    Number(document.getElementById("pension").value),
    Number(document.getElementById("nhis").value),
    Number(document.getElementById("nhf").value),
    Number(document.getElementById("insurance").value),
    Number(document.getElementById("crypto").value),
    Number(document.getElementById("expenses").value)
  );

  const totalTax = n.tax + n.cryptoTax;

  result.innerHTML = `
    <div class="card shadow p-3">
      <h3 class="text-center text-primary">2026 Tax Report</h3>
      <p><strong>Income:</strong> ${formatNaira(income)}</p>
      <p><strong>Taxable:</strong> ${formatNaira(n.taxable)}</p>
      <p><strong>Expenses Relief:</strong> ${formatNaira(n.expensesApplied)}</p>
      <p><strong>Rent Relief:</strong> ${formatNaira(n.rentRelief)}</p>
      <p><strong>Pension Relief:</strong> ${formatNaira(n.pensionRelief)}</p>
      <p><strong>Insurance Relief:</strong> ${formatNaira(n.insuranceRelief)}</p>
      <p><strong>Crypto Tax:</strong> ${formatNaira(n.cryptoTax)}</p>
      <hr>
      <h4 class="text-center text-success">Total Tax: ${formatNaira(totalTax)}</h4>
    </div>
  `;

  document.getElementById("monthly").innerHTML = `
    <div class="card shadow p-3 mt-3">
      <h3 class="text-center">Monthly Estimate</h3>
      <p><strong>Taxable/Month:</strong> ${formatNaira(n.monthlyTaxable)}</p>
      <p><strong>Tax/Month:</strong> ${formatNaira(n.monthlyTax)}</p>
      <p><strong>Take-Home:</strong> ${formatNaira((income/12) - n.monthlyTax)}</p>
      <div class="text-center">
        <button class="btn btn-success mt-2"
          onclick="downloadPDF(${income},${n.taxable},${n.rentRelief},${n.pensionRelief},${n.insuranceRelief},${n.cryptoTax},${n.expensesApplied},${totalTax})">
          Download PDF Report
        </button>
      </div>
    </div>
  `;

  ["income","rent","pension","nhis","nhf","insurance","crypto","expenses"].forEach(id =>
    localStorage.setItem(id, document.getElementById(id).value)
  );
}

function downloadPDF(...args){
  const doc = new window.jspdf.jsPDF();
  doc.text("Nigeria 2026 Tax Report Ready", 10, 10);
  doc.save("Nigeria_Tax_2026_Report.pdf");
}
