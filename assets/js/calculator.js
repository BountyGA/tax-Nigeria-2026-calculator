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
        
        // Get current tax results
        const resultDiv = document.getElementById('result');
        if (!resultDiv || !resultDiv.innerHTML.trim()) {
            alert("Please calculate your tax first before downloading the report.");
            return;
        }
        
        // Get all input values
        const getValue = (id) => {
            const el = document.getElementById(id);
            return el ? parseFloat(el.value) || 0 : 0;
        };
        
        const income = getValue('income');
        const rent = getValue('rent');
        const pension = getValue('pension');
        const nhis = getValue('nhis');
        const nhf = getValue('nhf');
        const insurance = getValue('insurance');
        const crypto = getValue('crypto');
        const expenses = getValue('expenses');
        
        // Recalculate to get all data (or use stored results if available)
        const result = calculateNewTax2026(income, rent, pension, nhis, nhf, insurance, crypto, expenses);
        
        // PDF Styling
        const primaryColor = [42, 92, 154]; // #2a5c9a
        const secondaryColor = [30, 132, 73]; // #1e8449
        const textColor = [50, 50, 50];
        const lightColor = [240, 240, 240];
        
        // Add header with logo placeholder
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 210, 30, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('NTAX 2026', 105, 20, { align: 'center' });
        
        doc.setFontSize(10);
        doc.text('Nigeria Tax Reform Calculator', 105, 27, { align: 'center' });
        
        // Add date
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(9);
        doc.text(`Generated: ${new Date().toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}`, 105, 35, { align: 'center' });
        
        // Personal Information
        doc.setTextColor(...textColor);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('TAX CALCULATION REPORT', 105, 50, { align: 'center' });
        
        // Income Section
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('ANNUAL INCOME', 20, 65);
        
        doc.setFont('helvetica', 'normal');
        doc.text(`${currencySymbol} ${income.toLocaleString('en-NG', {minimumFractionDigits: 2})}`, 180, 65, { align: 'right' });
        
        // Tax Summary
        doc.setFillColor(...lightColor);
        doc.rect(20, 75, 170, 60, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(...primaryColor);
        doc.text('TAX SUMMARY', 25, 85);
        
        // Taxable Income
        doc.setFontSize(10);
        doc.setTextColor(...textColor);
        doc.setFont('helvetica', 'normal');
        doc.text('Taxable Income:', 25, 95);
        doc.text(`${currencySymbol} ${result.taxable.toLocaleString('en-NG', {minimumFractionDigits: 2})}`, 180, 95, { align: 'right' });
        
        // Total Tax Due
        doc.setFont('helvetica', 'bold');
        doc.text('Total Tax Due:', 25, 105);
        doc.setTextColor(...secondaryColor);
        doc.text(`${currencySymbol} ${result.totalTax.toLocaleString('en-NG', {minimumFractionDigits: 2})}`, 180, 105, { align: 'right' });
        
        // Effective Tax Rate
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textColor);
        doc.text('Effective Tax Rate:', 25, 115);
        doc.text(`${result.effectiveRate.toFixed(2)}%`, 180, 115, { align: 'right' });
        
        // Monthly Breakdown
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('MONTHLY BREAKDOWN', 25, 125);
        
        // Monthly values
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textColor);
        doc.text('Monthly Taxable:', 25, 135);
        doc.text(`${currencySymbol} ${result.monthlyTaxable.toLocaleString('en-NG', {minimumFractionDigits: 2})}`, 180, 135, { align: 'right' });
        
        doc.text('Monthly Tax:', 25, 142);
        doc.text(`${currencySymbol} ${result.monthlyTax.toLocaleString('en-NG', {minimumFractionDigits: 2})}`, 180, 142, { align: 'right' });
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...secondaryColor);
        doc.text('Monthly Take Home:', 25, 149);
        doc.text(`${currencySymbol} ${result.monthlyTakeHome.toLocaleString('en-NG', {minimumFractionDigits: 2})}`, 180, 149, { align: 'right' });
        
        // Deductions Section (Page 2)
        doc.addPage();
        
        // Deductions Header
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 210, 30, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('DEDUCTIONS BREAKDOWN', 105, 20, { align: 'center' });
        
        // Deductions Table
        doc.setTextColor(...textColor);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('DEDUCTION TYPE', 25, 45);
        doc.text('AMOUNT', 180, 45, { align: 'right' });
        
        // Line
        doc.setDrawColor(200, 200, 200);
        doc.line(25, 48, 185, 48);
        
        let yPos = 55;
        
        // Rent Relief
        doc.setFont('helvetica', 'normal');
        doc.text('Rent Relief (20%):', 25, yPos);
        doc.text(`${currencySymbol} ${result.rentRelief.toLocaleString('en-NG', {minimumFractionDigits: 2})}`, 180, yPos, { align: 'right' });
        yPos += 8;
        
        // Pension Relief
        doc.text('Pension Contribution:', 25, yPos);
        doc.text(`${currencySymbol} ${result.pensionRelief.toLocaleString('en-NG', {minimumFractionDigits: 2})}`, 180, yPos, { align: 'right' });
        yPos += 8;
        
        // Insurance Relief
        doc.text('Insurance Premium:', 25, yPos);
        doc.text(`${currencySymbol} ${result.insuranceRelief.toLocaleString('en-NG', {minimumFractionDigits: 2})}`, 180, yPos, { align: 'right' });
        yPos += 8;
        
        // NHIS
        doc.text('NHIS Contribution:', 25, yPos);
        doc.text(`${currencySymbol} ${result.nhis.toLocaleString('en-NG', {minimumFractionDigits: 2})}`, 180, yPos, { align: 'right' });
        yPos += 8;
        
        // NHF
        doc.text('NHF Contribution:', 25, yPos);
        doc.text(`${currencySymbol} ${result.nhf.toLocaleString('en-NG', {minimumFractionDigits: 2})}`, 180, yPos, { align: 'right' });
        yPos += 8;
        
        // Business Expenses
        doc.text('Business Expenses:', 25, yPos);
        doc.text(`${currencySymbol} ${result.expensesApplied.toLocaleString('en-NG', {minimumFractionDigits: 2})}`, 180, yPos, { align: 'right' });
        yPos += 8;
        
        // Crypto Tax
        if (result.cryptoTax > 0) {
            doc.text('Crypto Gains Tax (10%):', 25, yPos);
            doc.text(`${currencySymbol} ${result.cryptoTax.toLocaleString('en-NG', {minimumFractionDigits: 2})}`, 180, yPos, { align: 'right' });
            yPos += 8;
        }
        
        // Total Reliefs
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('TOTAL RELIEFS & DEDUCTIONS:', 25, yPos + 5);
        doc.text(`${currencySymbol} ${result.totalReliefs.toLocaleString('en-NG', {minimumFractionDigits: 2})}`, 180, yPos + 5, { align: 'right' });
        
        // Tax Brackets (Page 3)
        doc.addPage();
        
        // Brackets Header
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 210, 30, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('2026 TAX BRACKETS', 105, 20, { align: 'center' });
        
        // Brackets Table
        doc.setTextColor(...textColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        
        // Table Headers
        doc.text('INCOME RANGE', 25, 45);
        doc.text('RATE', 150, 45);
        doc.text('TAX', 180, 45, { align: 'right' });
        
        // Line
        doc.line(25, 48, 185, 48);
        
        yPos = 55;
        
        // Display brackets
        taxBrackets.forEach((bracket, index) => {
            const maxDisplay = bracket.max === Infinity ? 'and above' : 
                `${currencySymbol} ${bracket.max.toLocaleString('en-NG', {minimumFractionDigits: 2})}`;
            
            doc.setFont('helvetica', 'normal');
            doc.text(`${currencySymbol} ${bracket.min.toLocaleString('en-NG', {minimumFractionDigits: 2})} - ${maxDisplay}`, 25, yPos);
            doc.text(`${(bracket.rate * 100).toFixed(1)}%`, 150, yPos);
            
            // Calculate example tax for this bracket
            const exampleIncome = bracket.max === Infinity ? 
                Math.max(bracket.min * 2, 10000000) : 
                (bracket.min + bracket.max) / 2;
            
            let exampleTax = 0;
            let remaining = exampleIncome;
            
            for (const b of taxBrackets) {
                if (remaining > b.min) {
                    const amountInBracket = Math.min(remaining, b.max) - b.min;
                    if (amountInBracket > 0) {
                        exampleTax += amountInBracket * b.rate;
                    }
                }
            }
            
            doc.text(`${currencySymbol} ${exampleTax.toLocaleString('en-NG', {minimumFractionDigits: 2})}`, 180, yPos, { align: 'right' });
            
            yPos += 7;
        });
        
        // Disclaimer Section
        doc.addPage();
        
        doc.setFillColor(245, 245, 245);
        doc.rect(10, 10, 190, 277, 'F');
        
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('IMPORTANT DISCLAIMER', 105, 50, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        const disclaimer = [
            'This tax calculation report is provided for informational purposes only.',
            'It is based on the proposed Nigeria Tax Reform 2026 legislation and',
            'should not be considered as professional tax advice.',
            '',
            'Key Points to Note:',
            '• Minimum taxable income: ₦800,000',
            '• Rent relief: 20% of rent paid or ₦500,000 maximum',
            '• Pension relief: ₦200,000 maximum',
            '• Insurance relief: ₦100,000 maximum',
            '• Business expenses: Maximum of 30% of income',
            '• Crypto gains tax: 10% on profits only',
            '• NHIS & NHF contributions are fully deductible',
            '',
            'The actual tax liability may vary based on:',
            '• Final legislation passed by the National Assembly',
            '• Individual circumstances and documentation',
            '• FIRS guidelines and interpretations',
            '• State-level taxes and levies',
            '',
            'For official tax advice and filing, please consult:',
            '• A certified tax professional',
            '• Federal Inland Revenue Service (FIRS)',
            '• State Internal Revenue Service',
            '',
            'Generated by NTAX 2026 Calculator',
            'https://your-website-url.com'
        ];
        
        let disclaimerY = 80;
        disclaimer.forEach(line => {
            if (line.startsWith('•')) {
                doc.text('  ' + line, 30, disclaimerY);
            } else if (line.includes(':')) {
                doc.setFont('helvetica', 'bold');
                doc.text(line, 105, disclaimerY, { align: 'center' });
                doc.setFont('helvetica', 'normal');
            } else {
                doc.text(line, 105, disclaimerY, { align: 'center' });
            }
            disclaimerY += 7;
        });
        
        // Save PDF
        const fileName = `Nigeria_Tax_2026_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        showNotification('Comprehensive PDF report downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('PDF generation error:', error);
        showNotification('Unable to generate PDF. Please try again.', 'warning');
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

// ... [all your existing code above] ...

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
    
    // Use showNotification instead of alert
    showNotification('Sample data loaded. Click "Calculate Tax" to see results.', 'info');
}

// ============================================
// NOTIFICATION FUNCTION - ADD THIS AT THE BOTTOM
// ============================================

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    
    // Set styles based on type
    let bgColor, textColor, icon;
    
    switch(type) {
        case 'success':
            bgColor = 'bg-success';
            textColor = 'text-white';
            icon = 'check-circle-fill';
            break;
        case 'warning':
            bgColor = 'bg-warning';
            textColor = 'text-dark';
            icon = 'exclamation-triangle-fill';
            break;
        case 'error':
        case 'danger':
            bgColor = 'bg-danger';
            textColor = 'text-white';
            icon = 'exclamation-octagon-fill';
            break;
        default: // info
            bgColor = 'bg-info';
            textColor = 'text-white';
            icon = 'info-circle-fill';
    }
    
    notification.className = `toast ${bgColor} ${textColor} border-0`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border-radius: 8px;
        overflow: hidden;
    `;
    
    notification.innerHTML = `
        <div class="toast-header ${bgColor} ${textColor} border-0">
            <i class="bi bi-${icon} me-2"></i>
            <strong class="me-auto">${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body ${textColor}" style="background-color: inherit;">
            ${message}
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Initialize as Bootstrap toast
    const toast = new bootstrap.Toast(notification, {
        animation: true,
        autohide: true,
        delay: 5000
    });
    
    toast.show();
    
    // Remove from DOM after hiding
    notification.addEventListener('hidden.bs.toast', function() {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    });
}

// ============================================
// MAKE ALL FUNCTIONS GLOBALLY AVAILABLE
// ============================================

window.calculateTax = calculateTax;
window.clearInputs = clearInputs;
window.setMode = setMode;
window.updateCurrency = updateCurrency;
window.downloadPDF = downloadPDF;
window.shareWhatsApp = shareWhatsApp;
window.fillSampleData = fillSampleData;
window.showNotification = showNotification;
