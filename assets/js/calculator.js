// Global variables
let taxBrackets = [];
let cryptoRate = 0.10;
let expenseRateCap = 0.30;
let currencySymbol = "₦";

// Format currency based on selected symbol
function formatCurrency(n) {
  if (currencySymbol === "₦") {
    return currencySymbol + n.toLocaleString("en-NG", {minimumFractionDigits: 2, maximumFractionDigits: 2});
  } else {
    return currencySymbol + n.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
  }
}

// Single window.onload function
window.onload = function() {
  // Load currency preference
  const c = localStorage.getItem("currency");
  if (c) {
    currencySymbol = c;
    document.getElementById("currency").value = c;
  }
  
  // Load mode preference
  const m = localStorage.getItem("mode") || "advanced";
  setMode(m);
  
  // Load saved form values
  ["income", "rent", "pension", "nhis", "nhf", "insurance", "crypto", "expenses"].forEach(id => {
    const v = localStorage.getItem(id);
    if (v) document.getElementById(id).value = v;
  });
  
  // Load tax brackets
  loadBrackets();
};

async function loadBrackets() {
  try {
    const res = await fetch("docs/tax_brackets_reference.json");
    const data = await res.json();
    
    // Ensure brackets are properly formatted
    taxBrackets = data.map(b => ({
      min: Number(b.min) || 0,
      max: b.max === null || b.max === undefined ? Infinity : Number(b.max),
      rate: Number(b.rate)
    }));
    
    // Sort brackets by min value
    taxBrackets.sort((a, b) => a.min - b.min);
    
    renderBracketTable();
    
    // Enable calculate button
    const calcBtn = document.getElementById("calcBtn");
    if (calcBtn) {
      calcBtn.disabled = false;
      calcBtn.textContent = "Calculate Tax";
    }
  } catch(e) { 
    console.error("Bracket load failed", e);
    document.getElementById("bracketTable").innerHTML = 
      `<div class="alert alert-warning">⚠ Failed to load tax brackets. Using default rates.</div>`;
    
    // Fallback to default brackets
    taxBrackets = [
      { min: 0, max: 800000, rate: 0.00 },
      { min: 800000, max: 1600000, rate: 0.07 },
      { min: 1600000, max: 3200000, rate: 0.11 },
      { min: 3200000, max: 6400000, rate: 0.15 },
      { min: 6400000, max: Infinity, rate: 0.24 }
    ];
    
    renderBracketTable();
    
    const calcBtn = document.getElementById("calcBtn");
    if (calcBtn) {
      calcBtn.disabled = false;
      calcBtn.textContent = "Calculate Tax (Using Default Rates)";
    }
  }
}

function renderBracketTable() {
  if (!taxBrackets.length) return;
  
  let html = `
    <div class="card mb-4">
      <div class="card-header bg-primary text-white">
        <h4 class="mb-0">2026 Proposed Tax Brackets</h4>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-bordered table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Income Range</th>
                <th>Tax Rate</th>
              </tr>
            </thead>
            <tbody>`;
  
  taxBrackets.forEach(b => {
    const maxDisplay = b.max === Infinity ? 'and above' : formatCurrency(b.max);
    html += `
      <tr>
        <td>${formatCurrency(b.min)} – ${maxDisplay}</td>
        <td>${(b.rate * 100).toFixed(2)}%</td>
      </tr>`;
  });
  
  html += `
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  
  const bracketTable = document.getElementById("bracketTable");
  if (bracketTable) {
    bracketTable.innerHTML = html;
  }
}

function calculateNewTax2026(income, rent, pension, nhis, nhf, insurance, cryptoGain, expenses) {
  // Calculate reliefs with caps
  const rentRelief = Math.min(500000, rent * 0.2);
  const pensionRelief = Math.min(200000, pension);
  const insuranceRelief = Math.min(100000, insurance);
  const expensesApplied = Math.min(income * expenseRateCap, expenses);
  
  // Calculate taxable income (minimum of 800,000)
  let taxable = Math.max(800000, 
    income - rentRelief - pensionRelief - insuranceRelief - nhis - nhf - expensesApplied
  );
  
  // Calculate progressive tax
  let tax = 0;
  let remainingIncome = taxable;
  
  for (let i = 0; i < taxBrackets.length; i++) {
    const bracket = taxBrackets[i];
    
    if (remainingIncome > bracket.min) {
      const bracketAmount = Math.min(remainingIncome, bracket.max) - bracket.min;
      if (bracketAmount > 0) {
        tax += bracketAmount * bracket.rate;
      }
    }
  }
  
  // Calculate crypto tax (only on gains)
  const cryptoTax = cryptoGain > 0 ? cryptoGain * cryptoRate : 0;
  
  // Monthly calculations
  const monthlyTaxable = taxable / 12;
  const monthlyTax = (tax + cryptoTax) / 12;
  
  return { 
    tax, 
    taxable, 
    rentRelief, 
    pensionRelief, 
    insuranceRelief, 
    cryptoTax, 
    expensesApplied, 
    monthlyTaxable, 
    monthlyTax 
  };
}

function calculateTax() {
  const income = Number(document.getElementById("income").value) || 0;
  const rent = Number(document.getElementById("rent").value) || 0;
  const pension = Number(document.getElementById("pension").value) || 0;
  const nhis = Number(document.getElementById("nhis").value) || 0;
  const nhf = Number(document.getElementById("nhf").value) || 0;
  const insurance = Number(document.getElementById("insurance").value) || 0;
  const crypto = Number(document.getElementById("crypto").value) || 0;
  const expenses = Number(document.getElementById("expenses").value) || 0;
  
  const result = document.getElementById("result");
  const monthly = document.getElementById("monthly");
  
  if (income <= 0) {
    result.innerHTML = `<div class="alert alert-danger">⚠ Please enter a valid income amount</div>`;
    monthly.innerHTML = '';
    return;
  }
  
  const n = calculateNewTax2026(income, rent, pension, nhis, nhf, insurance, crypto, expenses);
  const totalTax = n.tax + n.cryptoTax;
  
  // Update currency display
  const incomeDisplay = formatCurrency(income);
  const taxableDisplay = formatCurrency(n.taxable);
  const expensesReliefDisplay = formatCurrency(n.expensesApplied);
  const rentReliefDisplay = formatCurrency(n.rentRelief);
  const pensionReliefDisplay = formatCurrency(n.pensionRelief);
  const insuranceReliefDisplay = formatCurrency(n.insuranceRelief);
  const cryptoTaxDisplay = formatCurrency(n.cryptoTax);
  const totalTaxDisplay = formatCurrency(totalTax);
  const monthlyTaxableDisplay = formatCurrency(n.monthlyTaxable);
  const monthlyTaxDisplay = formatCurrency(n.monthlyTax);
  const takeHomeDisplay = formatCurrency((income / 12) - n.monthlyTax);
  
  // Display results
  result.innerHTML = `
    <div class="card shadow p-3 mt-4">
      <h3 class="text-center text-primary mb-4">2026 Tax Report</h3>
      <div class="row">
        <div class="col-md-6">
          <p><strong>Annual Income:</strong> ${incomeDisplay}</p>
          <p><strong>Taxable Income:</strong> ${taxableDisplay}</p>
          <p><strong>Expenses Relief:</strong> ${expensesReliefDisplay}</p>
          <p><strong>Rent Relief:</strong> ${rentReliefDisplay}</p>
        </div>
        <div class="col-md-6">
          <p><strong>Pension Relief:</strong> ${pensionReliefDisplay}</p>
          <p><strong>Insurance Relief:</strong> ${insuranceReliefDisplay}</p>
          <p><strong>Crypto Tax:</strong> ${cryptoTaxDisplay}</p>
          <hr>
          <h5 class="text-success">Total Annual Tax: ${totalTaxDisplay}</h5>
        </div>
      </div>
    </div>
  `;
  
  monthly.innerHTML = `
    <div class="card shadow p-3 mt-3">
      <h4 class="text-center mb-3">Monthly Estimate</h4>
      <div class="row">
        <div class="col-md-4 text-center">
          <p><strong>Taxable/Month:</strong><br>${monthlyTaxableDisplay}</p>
        </div>
        <div class="col-md-4 text-center">
          <p><strong>Tax/Month:</strong><br>${monthlyTaxDisplay}</p>
        </div>
        <div class="col-md-4 text-center">
          <p><strong>Take-Home/Month:</strong><br>${takeHomeDisplay}</p>
        </div>
      </div>
      <div class="text-center mt-3">
        <button class="btn btn-success me-2" onclick="downloadPDF()">
          Download PDF Report
        </button>
        <button class="btn btn-info" onclick="readOutLoud()">
          <i class="bi bi-volume-up"></i> Listen to Summary
        </button>
      </div>
    </div>
  `;
  
  // Save inputs to localStorage
  ["income", "rent", "pension", "nhis", "nhf", "insurance", "crypto", "expenses"].forEach(id => {
    localStorage.setItem(id, document.getElementById(id).value);
  });
}

function downloadPDF() {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("Nigeria 2026 Tax Reform Report", 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text("This is a sample PDF report. For full implementation,", 20, 40);
    doc.text("integrate with a proper PDF generation library.", 20, 50);
    
    doc.save("Nigeria_Tax_2026_Report.pdf");
    
    // Show success message
    alert("PDF report downloaded successfully!");
  } catch (error) {
    console.error("PDF generation error:", error);
    alert("Unable to generate PDF. Please try again.");
  }
}

function clearInputs() {
  ["income", "rent", "pension", "nhis", "nhf", "insurance", "crypto", "expenses"].forEach(id => {
    document.getElementById(id).value = "";
    localStorage.removeItem(id);
  });
  
  document.getElementById("result").innerHTML = "";
  document.getElementById("monthly").innerHTML = "";
  
  // Focus on income field
  document.getElementById("income").focus();
}

function readOutLoud() {
  const income = Number(document.getElementById("income").value) || 0;
  const resultDiv = document.getElementById("result");
  
  if (income <= 0 || !resultDiv.textContent.trim()) {
    alert("Please calculate your tax first before using text-to-speech.");
    return;
  }
  
  const msg = `Your Nigeria 2026 tax calculation is complete. Check the detailed results on screen.`;
  
  if ('speechSynthesis' in window) {
    const speech = new SpeechSynthesisUtterance(msg);
    speech.rate = 0.9;
    speech.pitch = 1;
    speech.volume = 1;
    window.speechSynthesis.speak(speech);
  } else {
    alert("Text-to-speech is not supported in your browser.");
  }
}

function updateCurrency() {
  currencySymbol = document.getElementById("currency").value;
  localStorage.setItem("currency", currencySymbol);
  
  // Refresh the bracket table with new currency
  renderBracketTable();
  
  // Recalculate if there are existing results
  const income = Number(document.getElementById("income").value) || 0;
  if (income > 0) {
    calculateTax();
  }
}

function setMode(mode) {
  const advancedFields = document.getElementById("advancedFields");
  if (!advancedFields) return;
  
  if (mode === "simple") {
    advancedFields.style.display = "none";
    localStorage.setItem("mode", "simple");
  } else {
    advancedFields.style.display = "block";
    localStorage.setItem("mode", "advanced");
  }
}

function shareWhatsApp() {
  const income = Number(document.getElementById("income").value) || 0;
  const resultDiv = document.getElementById("result");
  
  if (income <= 0 || !resultDiv.textContent.trim()) {
    alert("Please calculate your tax first before sharing.");
    return;
  }
  
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent("Check out this Nigeria 2026 Tax Calculator! I just calculated my projected taxes. Try it out: ");
  const whatsappUrl = `https://wa.me/?text=${text}${url}`;
  
  window.open(whatsappUrl, '_blank', 'width=600,height=600');
}
