let taxBrackets = [];
let cryptoRate = 0.10; // 10% crypto gains tax assumption
let expenseRateCap = 0.30; // Max 30% of income can be deducted as business expenses

window.onload = function() {
  ["income","rent","pension","insurance","crypto","expenses"].forEach(id => {
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
  } catch(e) { console.error("Bracket load failed:", e); }
}
loadBrackets();

function formatNaira(n) {
  return "₦" + Number(n).toLocaleString("en-NG", {minimumFractionDigits:2, maximumFractionDigits:2});
}

function calculateOldTax2025(income) {
  if (income <= 300000) return 0;
  return (income - 300000) * 0.07;
}

function calculateNewTax2026(income, rent, pension, insurance, cryptoGain, expenses) {
  if (income <= 800000) {
    return { tax: 0, taxable: 0, rentRelief:0, pensionRelief:0, insuranceRelief:0, cryptoTax:0, expensesApplied:0 };
  }

  const rentRelief = Math.min(500000, rent * 0.2);
  const pensionRelief = Math.min(200000, pension);
  const insuranceRelief = Math.min(100000, insurance);

  // Business expense deduction (cap 30% of income)
  const maxExpenses = income * expenseRateCap;
  const expensesApplied = Math.min(maxExpenses, expenses);

  let taxable = income - rentRelief - pensionRelief - insuranceRelief - expensesApplied;
  taxable = Math.max(800000, taxable); // taxable floor

  let tax = 0;
  taxBrackets.forEach(b => {
    if (taxable > b.min) {
      tax += (Math.min(taxable, b.max) - b.min) * b.rate;
    }
  });

  // Crypto gains tax (only if positive gain)
  const cryptoTax = cryptoGain > 0 ? cryptoGain * cryptoRate : 0;

  return { tax, taxable, rentRelief, pensionRelief, insuranceRelief, cryptoTax, expensesApplied };
}

function calculateTax() {
  const income = Number(document.getElementById("income").value);
  const rent = Number(document.getElementById("rent").value);
  const pension = Number(document.getElementById("pension").value);
  const insurance = Number(document.getElementById("insurance").value);
  const cryptoGain = Number(document.getElementById("crypto").value);
  const expenses = Number(document.getElementById("expenses").value);

  if (!income) {
    document.getElementById("result").innerHTML = "⚠ Enter annual income";
    return;
  }

  // Save inputs
  localStorage.setItem("income",income);
  localStorage.setItem("rent",rent);
  localStorage.setItem("pension",pension);
  localStorage.setItem("insurance",insurance);
  localStorage.setItem("crypto",cryptoGain);
  localStorage.setItem("expenses",expenses);

  const oldTax = calculateOldTax2025(income);
  const n = calculateNewTax2026(income, rent, pension, insurance, cryptoGain, expenses);

  const totalTax = n.tax + n.cryptoTax;

  document.getElementById("result").innerHTML = `
    <h3>2026 Tax Summary</h3>
    <p>Annual Income: <strong>${formatNaira(income)}</strong></p>
    <p>Rent Relief: <strong>${formatNaira(n.rentRelief)}</strong></p>
    <p>Pension Relief: <strong>${formatNaira(n.pensionRelief)}</strong></p>
    <p>Insurance Relief: <strong>${formatNaira(n.insuranceRelief)}</strong></p>
    <p>Business Expenses Deducted: <strong>${formatNaira(n.expensesApplied)}</strong></p>
    <p>Taxable Income: <strong>${formatNaira(n.taxable)}</strong></p>
    <p>Crypto Gains Tax: <strong>${formatNaira(n.cryptoTax)}</strong></p><hr>
    <p><strong>Total Tax Payable (2026): ${formatNaira(totalTax)}</strong></p>
  `;

  document.getElementById("comparison").innerHTML = `
    <h3>Old vs New Comparison</h3>
    <p>2025 Estimated Tax: <strong>${formatNaira(oldTax)}</strong></p>
    <p>2026 Calculated Tax: <strong>${formatNaira(totalTax)}</strong></p>
    <p>You Save: <strong>${formatNaira(Math.max(0, oldTax - totalTax))}</strong></p>
    <p>You Pay More: <strong>${formatNaira(Math.max(0, totalTax - oldTax))}</strong></p>
  `;
}
