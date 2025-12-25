function formatNaira(n){
  return currencySymbol + " " + n.toLocaleString("en-NG", {minimumFractionDigits:2, maximumFractionDigits:2});
}

let taxBrackets = [];
let cryptoRate = 0.10;
let expenseRateCap = 0.30;
let currencySymbol = "₦";

window.onload = async function() {
  const c = localStorage.getItem("currency");
  if (c) {
    currencySymbol = c;
    document.getElementById("currency").value = c;
  }

  ["income","rent","pension","nhis","nhf","insurance","crypto","expenses"].forEach(id => {
    const v = localStorage.getItem(id);
    if (v) document.getElementById(id).value = v;
  });

  await loadBrackets();
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
  let html = `<h4 class="text-center">2026 Tax Brackets</h4><table class="table table-bordered"><tbody>`;
  taxBrackets.forEach(b => {
    html += `<tr><td>${formatNaira(b.min+1)} – ${b.max === Infinity ? '∞' : formatNaira(b.max)}</td><td>${(b.rate*100).toFixed(2)}%</td></tr>`;
  });
  html += `</tbody></table>`;
  document.getElementById("bracketTable").innerHTML = html;
}

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
  const rent = Number(document.getElementById("rent").value);
  const pension = Number(document.getElementById("pension").value);
  const nhis = Number(document.getElementById("nhis").value);
  const nhf  = Number(document.getElementById("nhf").value);
  const insurance = Number(document.getElementById("insurance").value);
  const cryptoGain = Number(document.getElementById("crypto").value);
  const expenses = Number(document.getElementById("expenses").value);

  const result = document.getElementById("result");

  if (income <= 0) {
    result.innerHTML = `<div class="alert alert-danger text-center">⚠ Please enter a valid income</div>`;
    return;
  }

  const n = calculateNewTax2026(income, rent, pension, nhis, nhf, insurance, cryptoGain, expenses);
  const totalTax = n.tax + n.cryptoTax;

  readOutLoud(n, income, totalTax);

  result.innerHTML = `<div class="alert alert-success text-center"><h4>Total Tax Payable: ${formatNaira(totalTax)}</h4></div>`;
}

function setMode(mode){
  const box = document.getElementById("advancedFields");
  if (mode === "simple") {
    box.style.display = "none";
  } else {
    box.style.display = "block";
  }
  localStorage.setItem("mode", mode);
}
