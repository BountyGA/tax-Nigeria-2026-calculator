// Simple Nigeria Tax Calculator 2026 - FIXED VERSION

// Global variables
let taxBrackets = [
    { min: 0, max: 800000, rate: 0.00 },
    { min: 800000, max: 3000000, rate: 0.15 },
    { min: 3000000, max: 12000000, rate: 0.18 },
    { min: 12000000, max: 25000000, rate: 0.21 },
    { min: 25000000, max: 50000000, rate: 0.23 },
    { min: 50000000, max: Infinity, rate: 0.25 }
];
let currencySymbol = "₦";
let currentMode = "advanced";

// Currency formatting
function formatCurrency(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return `${currencySymbol} 0.00`;
    }
    
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
    
    // Load tax brackets in background (non-blocking)
    loadBrackets();
    
    // Render initial bracket table with defaults
    renderBracketTable();
};

// Simple value loader
function loadSavedValues() {
    const fields = ["income", "rent", "pension", "nhis", "nhf", "insurance", "crypto", "expenses"];
    fields.forEach(id => {
        const saved = localStorage.getItem(id);
        if (saved !== null && saved !== '' && !isNaN(saved)) {
            const field = document.getElementById(id);
            if (field) {
                field.value = parseFloat(saved).toLocaleString('en-NG');
            }
        }
    });
}

// Load tax brackets (non-blocking, with timeout)
async function loadBrackets() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch("docs/tax_brackets_reference.json", {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const data = await response.json();
            
            if (Array.isArray(data) && data.length > 0) {
                taxBrackets = data.map(b => ({
                    min: Number(b.min) || 0,
                    max: (b.max === null || b.max === undefined) ? Infinity : Number(b.max),
                    rate: Number(b.rate) || 0
                })).sort((a, b) => a.min - b.min);
                
                console.log("Loaded tax brackets:", taxBrackets);
            }
        }
    } catch (error) {
        console.warn("Error loading brackets, using defaults:", error);
        // Keep using default brackets
    }
    
    // Update the displayed brackets
    renderBracketTable();
}

function renderBracketTable() {
    const container = document.getElementById("bracketTable");
    if (!container) return;
    
    let html = `
        <div class="card border-0 shadow-sm">
            <div class="card-header bg-gradient-primary text-white">
                <h5 class="mb-0"><i class="bi bi-table me-2"></i>2026 Proposed Tax Brackets</h5>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead class="table-light">
                            <tr>
                                <th class="ps-4">Income Range</th>
                                <th class="text-center">Tax Rate</th>
                                <th class="text-center pe-4">Example Tax</th>
                            </tr>
                        </thead>
                        <tbody>`;
    
    taxBrackets.forEach(bracket => {
        const maxDisplay = bracket.max === Infinity ? 
            'and above' : 
            formatCurrency(bracket.max);
        
        // Calculate example tax
        const exampleIncome = bracket.max === Infinity ? 
            Math.max(bracket.min * 2, 10000000) : 
            Math.floor((bracket.min + bracket.max) / 2);
        
        const exampleTax = calculateExampleTax(exampleIncome);
        
        html += `
            <tr>
                <td class="ps-4">
                    ${formatCurrency(bracket.min)} – ${maxDisplay}
                </td>
                <td class="text-center">
                    <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                        ${(bracket.rate * 100).toFixed(1)}%
                    </span>
                </td>
                <td class="text-center pe-4">
                    <div class="text-success fw-medium">${formatCurrency(exampleTax)}</div>
                    <small class="text-muted">on ${formatCurrency(exampleIncome)}</small>
                </td>
            </tr>`;
    });
    
    html += `
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="card-footer bg-light">
                <small class="text-muted">
                    <i class="bi bi-info-circle me-1"></i>
                    Example tax calculated for midpoint of each bracket
                </small>
            </div>
        </div>`;
    
    container.innerHTML = html;
}

function calculateExampleTax(income) {
    let tax = 0;
    let remaining = income;
    
    for (const bracket of taxBrackets) {
        if (remaining > bracket.min) {
            const amountInBracket = Math.min(remaining, bracket.max) - bracket.min;
            if (amountInBracket > 0) {
                tax += amountInBracket * bracket.rate;
            }
        }
    }
    
    return tax;
}

// Main calculation function
function calculateTax() {
    console.log("Calculate button clicked");
    
    // Get all input values
    const getNumberValue = (id) => {
        const element = document.getElementById(id);
        if (!element || !element.value) return 0;
        
        // Remove commas and parse
        const value = element.value.replace(/,/g, '');
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
    };
    
    const income = getNumberValue("income");
    
    // Validate income
    if (income <= 0) {
        const resultDiv = document.getElementById("result");
        if (resultDiv) {
            resultDiv.innerHTML = `
                <div class="alert alert-danger fade-in">
                    <div class="d-flex align-items-center">
                        <i class="bi bi-exclamation-triangle-fill me-3 fs-4"></i>
                        <div>
                            <h5 class="alert-heading">Missing Information</h5>
                            <p class="mb-0">Please enter a valid annual income amount to calculate taxes.</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        const incomeField = document.getElementById("income");
        if (incomeField) {
            incomeField.focus();
            incomeField.classList.add('is-invalid');
        }
        
        return;
    }
    
    // Get other values
    const rent = getNumberValue("rent");
    const pension = getNumberValue("pension");
    const nhis = getNumberValue("nhis");
    const nhf = getNumberValue("nhf");
    const insurance = getNumberValue("insurance");
    const crypto = getNumberValue("crypto");
    const expenses = getNumberValue("expenses");
    
    // Calculate using the new tax law
    const result = calculateNewTax2026(income, rent, pension, nhis, nhf, insurance, crypto, expenses);
    
    // Display results
    displayResults(result);
    
    // Save current values
    saveCurrentValues();
    
    // Show success notification
    showNotification('Tax calculation completed successfully!', 'success');
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
                <span class="badge bg-primary bg-opacity-10 text-primary fs-6">
                    Effective Rate: ${result.effectiveRate.toFixed(2)}%
                </span>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="card border-0 bg-light h-100">
                        <div class="card-body">
                            <h6 class="text-muted mb-3">INCOME SUMMARY</h6>
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span>Annual Income:</span>
                                <span class="fw-bold fs-5">${formatCurrency(result.income)}</span>
                            </div>
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span>Taxable Income:</span>
                                <span class="fw-bold text-primary">${formatCurrency(result.taxable)}</span>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
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
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span>Income Tax:</span>
                                <span>${formatCurrency(result.tax)}</span>
                            </div>
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span>Crypto Tax:</span>
                                <span>${formatCurrency(result.cryptoTax)}</span>
                            </div>
                            <hr>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="fw-bold">Total Tax:</span>
                                <span class="fw-bold fs-5 text-success">${formatCurrency(result.totalTax)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="tax-breakdown fade-in">
                <h5 class="mb-3"><i class="bi bi-pie-chart me-2"></i>Deductions Breakdown</h5>
                <div class="row">
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
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="mb-0"><i class="bi bi-calendar-month me-2"></i>Monthly Summary</h4>
                <button class="btn btn-sm btn-outline-primary" onclick="toggleMonthlyDetails()">
                    <i class="bi bi-chevron-down"></i> Details
                </button>
            </div>
            
            <div class="row text-center" id="monthlyOverview">
                <div class="col-md-4 mb-3">
                    <div class="card border-primary border-2">
                        <div class="card-body">
                            <h6 class="text-muted">Taxable/Month</h6>
                            <h3 class="text-primary">${formatCurrency(result.monthlyTaxable)}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card border-warning border-2">
                        <div class="card-body">
                            <h6 class="text-muted">Tax/Month</h6>
                            <h3 class="text-warning">${formatCurrency(result.monthlyTax)}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card border-success border-2">
                        <div class="card-body">
                            <h6 class="text-muted">Take Home/Month</h6>
                            <h3 class="text-success">${formatCurrency(result.monthlyTakeHome)}</h3>
                        </div>
                    </div>
                </div>
            </div>
            
            <div id="monthlyDetails" style="display: none;">
                <hr>
                <h6 class="mb-3">Monthly Breakdown</h6>
                <div class="row">
                    <div class="col-md-6">
                        <div class="breakdown-item">
                            <span>Gross Monthly Income:</span>
                            <span>${formatCurrency(result.income / 12)}</span>
                        </div>
                        <div class="breakdown-item">
                            <span>Monthly Reliefs:</span>
                            <span>${formatCurrency(result.totalReliefs / 12)}</span>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="breakdown-item">
                            <span>Monthly Taxable:</span>
                            <span>${formatCurrency(result.monthlyTaxable)}</span>
                        </div>
                        <div class="breakdown-item">
                            <span>Net Monthly Income:</span>
                            <span class="fw-bold text-success">${formatCurrency(result.monthlyTakeHome)}</span>
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
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function toggleMonthlyDetails() {
    const details = document.getElementById('monthlyDetails');
    const button = document.querySelector('#monthly button');
    
    if (!details || !button) return;
    
    if (details.style.display === 'none') {
        details.style.display = 'block';
        button.innerHTML = '<i class="bi bi-chevron-up"></i> Hide Details';
    } else {
        details.style.display = 'none';
        button.innerHTML = '<i class="bi bi-chevron-down"></i> Details';
    }
}

function saveCurrentValues() {
    const fields = ["income", "rent", "pension", "nhis", "nhf", "insurance", "crypto", "expenses"];
    fields.forEach(id => {
        const field = document.getElementById(id);
        if (field && field.value) {
            const value = field.value.replace(/,/g, '');
            if (!isNaN(parseFloat(value))) {
                localStorage.setItem(id, value);
            }
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
            field.classList.remove('is-valid', 'is-invalid');
            localStorage.removeItem(id);
        }
    });
    
    // Clear results
    document.getElementById("result").innerHTML = '';
    document.getElementById("monthly").innerHTML = '';
    
    // Focus on income
    const incomeField = document.getElementById("income");
    if (incomeField) {
        incomeField.focus();
    }
    
    // Show notification
    showNotification('All inputs cleared.', 'info');
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
        showNotification('Simple mode activated. Only income field is required.', 'info');
    } else {
        if (advancedFields) advancedFields.style.display = 'block';
        if (simpleCard) simpleCard.classList.remove('active');
        if (advancedCard) advancedCard.classList.add('active');
        localStorage.setItem('taxMode', 'advanced');
        showNotification('Advanced mode activated. All fields are available.', 'info');
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
        const resultDiv = document.getElementById('result');
        if (resultDiv && resultDiv.innerHTML.trim()) {
            calculateTax();
        }
        
        showNotification(`Currency updated to ${currencySymbol}`, 'info');
    }
}

// Simple PDF download (without logo for now)
function downloadPDF() {
    const resultDiv = document.getElementById('result');
    if (!resultDiv || !resultDiv.innerHTML.trim()) {
        showNotification("Please calculate your tax first before downloading the report.", "warning");
        return;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Simple PDF content
        doc.setFontSize(20);
        doc.setTextColor(42, 92, 154);
        doc.text('Nigeria 2026 Tax Report', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 40);
        
        // Get income
        const incomeField = document.getElementById('income');
        const income = incomeField ? parseFloat(incomeField.value.replace(/,/g, '')) || 0 : 0;
        
        doc.text(`Annual Income: ${formatCurrency(income)}`, 20, 60);
        
        // Save PDF
        const fileName = `Nigeria_Tax_2026_Report_${Date.now()}.pdf`;
        doc.save(fileName);
        
        showNotification('PDF report downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('PDF generation error:', error);
        showNotification('Unable to generate PDF. Please try again.', 'warning');
    }
}

function shareWhatsApp() {
    const resultDiv = document.getElementById('result');
    if (!resultDiv || !resultDiv.innerHTML.trim()) {
        showNotification("Please calculate your tax first before sharing.", "warning");
        return;
    }
    
    const text = `Check out the Nigeria 2026 Tax Calculator! I just projected my taxes under the new law. Try it for yourself: ${window.location.href}`;
    const encodedText = encodeURIComponent(text);
    const url = `https://wa.me/?text=${encodedText}`;
    
    window.open(url, '_blank', 'noopener,noreferrer');
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
    
    // Show notification
    showNotification('Sample data loaded. Click "Calculate Tax" to see results.', 'info');
}

// Notification function
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

// Make all functions globally available
window.calculateTax = calculateTax;
window.clearInputs = clearInputs;
window.setMode = setMode;
window.updateCurrency = updateCurrency;
window.downloadPDF = downloadPDF;
window.shareWhatsApp = shareWhatsApp;
window.fillSampleData = fillSampleData;
window.showNotification = showNotification;
window.toggleMonthlyDetails = toggleMonthlyDetails;
