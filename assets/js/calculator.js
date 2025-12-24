window.onload = function() {
  ["income","rent","pension","insurance"].forEach(id => {
    const v = localStorage.getItem(id);
    if (v) document.getElementById(id).value = v;
  });
};

let taxBrackets = [];

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

function formatNaira(n){return "₦"+n.toLocaleString("en-NG",{minimumFractionDigits:2,maximumFractionDigits:2});}

function calculateOldTax2025(income){
  if(income<=300000) return 0;
  return (income-300000)*0.07;
}

function calculateNewTax2026(income, rent, pension, insurance) {
  if (income <= 800000) return 0;

  // Reliefs
  const rentRelief = Math.min(500000, rent * 0.2);
  const pensionRelief = Math.min(200000, pension); // cap ₦200k
  const insuranceRelief = Math.min(100000, insurance); // cap ₦100k

  let taxable = income - rentRelief - pensionRelief - insuranceRelief;
  taxable = Math.max(800000, taxable); // ensure minimum taxable floor

  let tax = 0;
  taxBrackets.forEach(b => {
    if (taxable > b.min) {
      tax += (Math.min(taxable, b.max) - b.min) * b.rate;
    }
  });

  return { tax, rentRelief, pensionRelief, insuranceRelief, taxable };
}

function calculateTax(){
  const income = Number(income.value);
  const rent = Number(rent.value);
  const pension = Number(pension.value);
  const insurance = Number(insurance.value);

  if(!income) return result.innerHTML="⚠ Enter income";

  localStorage.setItem("income",income);
  localStorage.setItem("rent",rent);
  localStorage.setItem("pension",pension);
  localStorage.setItem("insurance",insurance);

  const oldTax = calculateOldTax2025(income);
  const n = calculateNewTax2026(income, rent, pension, insurance);

  result.innerHTML = `
    <h3>New 2026 Tax Result</h3>
    <p>Income: <strong>${formatNaira(income)}</strong></p>
    <p>Rent Relief: <strong>${formatNaira(n.rentRelief)}</strong></p>
    <p>Pension Relief: <strong>${formatNaira(n.pensionRelief)}</strong></p>
    <p>Insurance Relief: <strong>${formatNaira(n.insuranceRelief)}</strong></p>
    <p>Taxable Income: <strong>${formatNaira(n.taxable)}</strong></p><hr>
    <p>Total Tax: <strong>${formatNaira(n.tax)}</strong></p>
  `;

  comparison.innerHTML = `
    <h3>Old vs New Tax Comparison</h3>
    <p>2025 Estimated Tax: <strong>${formatNaira(oldTax)}</strong></p>
    <p>2026 Calculated Tax: <strong>${formatNaira(n.tax)}</strong></p>
    <p>You Save: <strong>${formatNaira(Math.max(0, oldTax - n.tax))}</strong></p>
    <p>You Pay More: <strong>${formatNaira(Math.max(0, n.tax - oldTax))}</strong></p>
  `;
}
