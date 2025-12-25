// Simple Nigeria Tax Calculator 2026 - WORKING VERSION

// Global variables
let taxBrackets = [];
let currencySymbol = "₦";
let currentMode = "advanced";

// Currency formatting
function formatCurrency(amount) {
    if (!amount && amount !== 0) return `${currencySymbol} 0.00`;
    
    return `${currencySymbol} ${parseFloat(amount).toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

// Simple initialization
window.onload = function() {
    console.log("Tax Calculator Loading...");
    
    // Set currency from localStorage or default
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency) {
        currencySymbol = savedCurrency;
        const currencySelect = document.getElementById('currency');
        if (currencySelect) currencySelect.value = savedCurrency;
    }
    
    // Set mode from localStorage
    const savedMode = localStorage.getItem('taxMode') || 'advanced';
    setMode(savedMode);
    
    // Load saved values
    loadSavedValues();
    
    // Load tax brackets
    loadBrackets();
};

// Simple value loader
function loadSavedValues() {
    const fields = ["income", "rent", "pension", "nhis", "nhf", "insurance", "crypto", "expenses"];
    fields.forEach(id => {
        const saved = localStorage.getItem(id);
        if (saved !== null && saved !== '') {
            const field = document.getElementById(id);
            if (field) field.value = saved;
        }
    });
}

// Simple input setup - NO AGGRESSIVE VALIDATION
function setupSimpleInputs() {
    // Just add a simple save on blur
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value) {
                localStorage.setItem(this.id, this.value);
            }
        });
    });
}

// Load tax brackets
async function loadBrackets() {
    try {
        const response = await fetch("docs/tax_brackets_reference.json");
        const data = await response.json();
        
        taxBrackets = data.map(b => ({
            min: Number(b.min),
            max: b.max === null ? Infinity : Number(b.max),
            rate: Number(b.rate)
        })).sort((a, b) => a.min - b.min);
        
        renderBracketTable();
        enableCalculateButton();
        
    } catch (error) {
        console.error("Error loading brackets:", error);
        // Use default brackets
        taxBrackets = [
            { min: 0, max: 800000, rate: 0.00 },
            { min: 800000, max: 1600000, rate: 0.07 },
            { min: 1600000, max: 3200000, rate: 0.11 },
            { min: 3200000, max: 6400000, rate: 0.15 },
            { min: 6400000, max: Infinity, rate: 0.24 }
        ];
        renderBracketTable();
        enableCalculateButton();
    }
}

function renderBracketTable() {
    const container = document.getElementById("bracketTable");
    if (!container || !taxBrackets.length) return;
    
    let html = `
        <div class="card border-0 shadow-sm">
            <div class="card-header bg-gradient-primary text-white">
                <h5 class="mb-0"><i class="bi bi-table me-2"></i>2026 Tax Brackets</h5>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead class="table-light">
                            <tr>
                                <th class="ps-4">Income Range</th>
                                <th class="text-center">Tax Rate</th>
                            </tr>
                        </thead>
                        <tbody>`;
    
    taxBrackets.forEach(bracket => {
        const maxDisplay = bracket.max === Infinity ? 
            'and above' : 
            formatCurrency(bracket.max);
        
        html += `
            <tr>
                <td class="ps-4">
                    ${formatCurrency(bracket.min)} – ${maxDisplay}
                </td>
                <td class="text-center">
                    <span class="badge bg-primary bg-opacity-10 text-primary">
                        ${(bracket.rate * 100).toFixed(1)}%
                    </span>
                </td>
            </tr>`;
    });
    
    html += `
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`;
    
    container.innerHTML = html;
}

function enableCalculateButton() {
    const btn = document.getElementById("calcBtn");
    if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-lightning-charge me-2"></i>Calculate Tax';
    }
}

// Main calculation function
function calculateTax() {
    console.log("Calculate button clicked");
    
    // Get all input values
    const income = parseFloat(document.getElementById("income").value) || 0;
    
    // Validate income
    if (income <= 0) {
        document.getElementById("result").innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Please enter a valid annual income amount.
            </div>
        `;
        document.getElementById("income").focus();
        return;
    }
    
    // Get other values
    const rent = parseFloat(document.getElementById("rent").value) || 0;
    const pension = parseFloat(document.getElementById("pension").value) || 0;
    const nhis = parseFloat(document.getElementById("nhis").value) || 0;
    const nhf = parseFloat(document.getElementById("nhf").value) || 0;
    const insurance = parseFloat(document.getElementById("insurance").value) || 0;
    const crypto = parseFloat(document.getElementById("crypto").value) || 0;
    const expenses = parseFloat(document.getElementById("expenses").value) || 0;
    
    // Calculate using the new tax law
    const result = calculateNewTax2026(income, rent, pension, nhis, nhf, insurance, crypto, expenses);
    
    // Display results
    displayResults(result);
    
    // Save current values
    saveCurrentValues();
}

function calculateNewTax2026(income, rent, pension, nhis, nhf, insurance, crypto, expenses) {
    // Tax configuration
    const cryptoRate = 0.10;
    const expenseRateCap = 0.30;
    const minTaxableIncome = 800000;
    
    // Calculate reliefs with caps
    const rentRelief = Math.min(500000, rent * 0.20);
    const pensionRelief = Math.min(200000, pension);
    const insuranceRelief = Math.min(100000, insurance);
    const expensesApplied = Math.min(income * expenseRateCap, expenses);
    
    // Calculate taxable income
    let taxable = income - rentRelief - pensionRelief - insuranceRelief - nhis - nhf - expensesApplied;
    taxable = Math.max(minTaxableIncome, taxable);
    
    // Calculate progressive tax
    let tax = 0;
    let remaining = taxable;
    
    for (const bracket of taxBrackets) {
        if (remaining > bracket.min) {
            const amountInBracket = Math.min(remaining, bracket.max) - bracket.min;
            if (amountInBracket > 0) {
                tax += amountInBracket * bracket.rate;
            }
        }
    }
    
    // Calculate crypto tax
    const cryptoTax = crypto > 0 ? crypto * cryptoRate : 0;
    
    // Monthly calculations
    const monthlyTaxable = taxable / 12;
    const monthlyTax = (tax + cryptoTax) / 12;
    const monthlyTakeHome = (income / 12) - monthlyTax;
    const totalTax = tax + cryptoTax;
    const effectiveRate = income > 0 ? (totalTax / income) * 100 : 0;
    
    return {
        income,
        taxable,
        tax,
        cryptoTax,
        totalTax,
        rentRelief,
        pensionRelief,
        insuranceRelief,
        expensesApplied,
        nhis,
        nhf,
        monthlyTaxable,
        monthlyTax,
        monthlyTakeHome,
        effectiveRate,
        totalReliefs: rentRelief + pensionRelief + insuranceRelief + nhis + nhf + expensesApplied
    };
}

function displayResults(result) {
    const resultDiv = document.getElementById("result");
    const monthlyDiv = document.getElementById("monthly");
    
    if (!resultDiv || !monthlyDiv) return;
    
    // Main results
    resultDiv.innerHTML = `
        <div class="result-card fade-in">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h3 class="text-primary mb-0">
                    <i class="bi bi-file-earmark-text me-2"></i>2026 Tax Report
                </h3>
                <span class="badge bg-primary bg-opacity-10 text-primary">
                    Effective Rate: ${result.effectiveRate.toFixed(2)}%
                </span>
            </div>
            
            <div class="row">
                <div class="col-md-6">
                    <div class="card border-0 bg-light h-100">
                        <div class="card-body">
                            <h6 class="text-muted mb-3">INCOME SUMMARY</h6>
                            <div class="d-flex justify-content-between mb-3">
                                <span>Annual Income:</span>
                                <span class="fw-bold">${formatCurrency(result.income)}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-3">
                                <span>Taxable Income:</span>
                                <span class="fw-bold text-primary">${formatCurrency(result.taxable)}</span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span>Total Reliefs:</span>
                                <span class="fw-bold text-success">${formatCurrency(result.totalReliefs)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6 mt-3 mt-md-0">
                    <div class="card border-0 bg-light h-100">
                        <div class="card-body">
                            <h6 class="text-muted mb-3">TAX DUE</h6>
                            <div class="d-flex justify-content-between mb-3">
                                <span>Income Tax:</span>
                                <span>${formatCurrency(result.tax)}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-3">
                                <span>Crypto Tax:</span>
                                <span>${formatCurrency(result.cryptoTax)}</span>
                            </div>
                            <hr>
                            <div class="d-flex justify-content-between">
                                <span class="fw-bold">Total Tax:</span>
                                <span class="fw-bold fs-5 text-success">${formatCurrency(result.totalTax)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="tax-breakdown mt-4">
                <h5><i class="bi bi-pie-chart me-2"></i>Deductions Breakdown</h5>
                <div class="row mt-3">
                    <div class="col-md-6">
                        <div class="breakdown-item">
                            <span>Rent Relief:</span>
                            <span>${formatCurrency(result.rentRelief)}</span>
                        </div>
                        <div class="breakdown-item">
                            <span>Pension Relief:</span>
                            <span>${formatCurrency(result.pensionRelief)}</span>
                        </div>
                        <div class="breakdown-item">
                            <span>Insurance Relief:</span>
                            <span>${formatCurrency(result.insuranceRelief)}</span>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="breakdown-item">
                            <span>NHIS Contribution:</span>
                            <span>${formatCurrency(result.nhis)}</span>
                        </div>
                        <div class="breakdown-item">
                            <span>NHF Contribution:</span>
                            <span>${formatCurrency(result.nhf)}</span>
                        </div>
                        <div class="breakdown-item">
                            <span>Business Expenses:</span>
                            <span>${formatCurrency(result.expensesApplied)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Monthly summary
    monthlyDiv.innerHTML = `
        <div class="monthly-summary fade-in">
            <h4 class="mb-4"><i class="bi bi-calendar-month me-2"></i>Monthly Summary</h4>
            
            <div class="row text-center">
                <div class="col-md-4 mb-3">
                    <div class="card border-primary">
                        <div class="card-body">
                            <h6 class="text-muted">Taxable/Month</h6>
                            <h3 class="text-primary">${formatCurrency(result.monthlyTaxable)}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card border-warning">
                        <div class="card-body">
                            <h6 class="text-muted">Tax/Month</h6>
                            <h3 class="text-warning">${formatCurrency(result.monthlyTax)}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card border-success">
                        <div class="card-body">
                            <h6 class="text-muted">Take Home/Month</h6>
                            <h3 class="text-success">${formatCurrency(result.monthlyTakeHome)}</h3>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="text-center mt-4">
                <button class="btn btn-success me-2" onclick="downloadPDF()">
                    <i class="bi bi-download me-2"></i>Download PDF
                </button>
                <button class="btn btn-info me-2" onclick="shareWhatsApp()">
                    <i class="bi bi-whatsapp me-2"></i>Share
                </button>
            </div>
        </div>
    `;
    
    // Scroll to results
    setTimeout(() => {
        resultDiv.scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

function saveCurrentValues() {
    const fields = ["income", "rent", "pension", "nhis", "nhf", "insurance", "crypto", "expenses"];
    fields.forEach(id => {
        const field = document.getElementById(id);
        if (field && field.value) {
            localStorage.setItem(id, field.value);
        }
    });
}

function clearInputs() {
    // Clear all fields
    const fields = ["income", "rent", "pension", "nhis", "nhf", "insurance", "crypto", "expenses"];
    fields.forEach(id => {
        const field = document.getElementById(id);
        if (field) {
            field.value = '';
            localStorage.removeItem(id);
        }
    });
    
    // Clear results
    document.getElementById("result").innerHTML = '';
    document.getElementById("monthly").innerHTML = '';
    
    // Focus on income
    document.getElementById("income").focus();
}

function setMode(mode) {
    currentMode = mode;
    const advancedFields = document.getElementById('advancedFields');
    const simpleCard = document.getElementById('simpleModeCard');
    const advancedCard = document.getElementById('advancedModeCard');
    
    if (mode === 'simple') {
        if (advancedFields) advancedFields.style.display = 'none';
        if (simpleCard) simpleCard.classList.add('active');
        if (advancedCard) advancedCard.classList.remove('active');
        localStorage.setItem('taxMode', 'simple');
    } else {
        if (advancedFields) advancedFields.style.display = 'block';
        if (simpleCard) simpleCard.classList.remove('active');
        if (advancedCard) advancedCard.classList.add('active');
        localStorage.setItem('taxMode', 'advanced');
    }
}

function updateCurrency() {
    const select = document.getElementById('currency');
    if (select) {
        currencySymbol = select.value;
        localStorage.setItem('currency', currencySymbol);
        
        // Re-render bracket table with new currency
        renderBracketTable();
        
        // Recalculate if we have results
        const income = document.getElementById('income')?.value;
        if (income && parseFloat(income) > 0) {
            calculateTax();
        }
    }
}

function downloadPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text("Nigeria 2026 Tax Report", 20, 20);
        doc.setFontSize(12);
        doc.text("Generated on: " + new Date().toLocaleDateString(), 20, 30);
        
        // Get income value
        const income = document.getElementById('income')?.value || '0';
        doc.text(`Annual Income: ${currencySymbol} ${parseFloat(income).toLocaleString()}`, 20, 50);
        
        doc.save("Nigeria_Tax_2026_Report.pdf");
        
        alert("PDF downloaded successfully!");
        
    } catch (error) {
        alert("Could not generate PDF. Please try again.");
        console.error("PDF error:", error);
    }
}

function shareWhatsApp() {
    const income = document.getElementById('income')?.value;
    if (!income || parseFloat(income) <= 0) {
        alert("Please calculate your tax first before sharing.");
        return;
    }
    
    const text = "Check out this Nigeria 2026 Tax Calculator! " + window.location.href;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

function fillSampleData() {
    // Clear first
    clearInputs();
    
    // Set sample values
    document.getElementById('income').value = '5000000';
    document.getElementById('rent').value = '1200000';
    document.getElementById('pension').value = '200000';
    document.getElementById('nhis').value = '50000';
    document.getElementById('nhf').value = '30000';
    document.getElementById('insurance').value = '80000';
    document.getElementById('crypto').value = '100000';
    document.getElementById('expenses').value = '600000';
    
    alert("Sample data loaded. Click 'Calculate Tax' to see results.");
}

// Make functions globally available
window.calculateTax = calculateTax;
window.clearInputs = clearInputs;
window.setMode = setMode;
window.updateCurrency = updateCurrency;
window.downloadPDF = downloadPDF;
window.shareWhatsApp = shareWhatsApp;
window.fillSampleData = fillSampleData;
