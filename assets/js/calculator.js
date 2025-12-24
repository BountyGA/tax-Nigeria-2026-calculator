// Load saved inputs on page load
window.onload = function() {
  const savedIncome = localStorage.getItem("income");
  const savedRent = localStorage.getItem("rent");

  if (savedIncome) document.getElementById("income").value = savedIncome;
  if (savedRent) document.getElementById("rent").value = savedRent;
};

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

    document.getElementById("calcBtn").disabled = false;
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
  document.getElementById("bracketTable").innerHTML = `
    <h3>2026 Progressive Tax Brackets</h3>
    <table border="1" style="width:100%; border-collapse:collapse; margin:10px 0;">
      <tr><th>Income Range (₦)</th><th>Rate</th></tr>
      ${taxBrackets.map(b => `
        <tr>
          <td>${formatNaira(b.min)} – ${b.max === Infinity ? "∞" : formatNaira(b.max)}</td>
          <td>${b.rate * 100}%</td>
        </tr>`).join("")}
    </table><hr>`;
}

function calculateOldTax2025(income) {
  // ⚠ Simplified flat tax model for 2025 comparison demo
  if (income <= 300000) return 0;
  return (income - 300000) * 0.07; // 7% above 300k (not official, for comparison demo)
}

function calculateNewTax2026(income, rent) {
  if (income <= 800000) return 0;

  let taxable = income;
  const rentRelief = Math.min(500000, rent * 0.2);
  taxable -= rentRelief;

  let tax = 0;
  taxBrackets.forEach(b => {
    if (taxable > b.min) {
      const upper = Math.min(taxable, b.max);
      tax += (upper - b.min) * b.rate;
    }
  });

  return tax;
}

function calculateTax() {
  const income = Number(document.getElementById("income").value);
  const rent = Number(document.getElementById("rent").value);

  if (!income) {
    document.getElementById("result").innerHTML = "<p>⚠ Enter your income</p>";
    return;
  }

  // Save inputs to LocalStorage
  localStorage.setItem("income", income);
  localStorage.setItem("rent", rent);

  const oldTax = calculateOldTax2025(income);
  const newTax = calculateNewTax2026(income, rent);

  document.getElementById("result").innerHTML = `
    <h3>New 2026 Tax Result</h3>
    <p>Total Tax: <strong>${formatNaira(newTax)}</strong></p>
  `;

  document.getElementById("comparison").innerHTML = `
    <h3>Old vs New Tax Comparison</h3>
    <p>2025 Estimated Tax: <strong>${formatNaira(oldTax)}</strong></p>
    <p>2026 Calculated Tax: <strong>${formatNaira(newTax)}</strong></p>
    <p>You Save: <strong>${formatNaira(Math.max(0, oldTax - newTax))}</strong></p>
    <p>You Pay More: <strong>${formatNaira(Math.max(0, newTax - oldTax))}</strong></p>
  `;
}
