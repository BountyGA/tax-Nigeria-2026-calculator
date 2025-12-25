// Professional Nigeria Tax Calculator 2026
// Enhanced for all age groups with senior-friendly features

// Global variables with better organization
const TaxConfig = {
    cryptoRate: 0.10,
    expenseRateCap: 0.30,
    minTaxableIncome: 800000,
    maxRentRelief: 500000,
    maxPensionRelief: 200000,
    maxInsuranceRelief: 100000,
    rentReliefRate: 0.20
};

let taxBrackets = [];
let currencySymbol = "₦";
let currentMode = "advanced";

// Enhanced currency formatting with accessibility
function formatCurrency(amount) {
    const formatted = currencySymbol === "₦" 
        ? amount.toLocaleString("en-NG", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
        : amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    
    return `<span class="currency-amount" aria-label="${amount} ${currencySymbol === '₦' ? 'Naira' : currencySymbol}">${currencySymbol} ${formatted}</span>`;
}

// Format for speech output (no HTML)
function formatCurrencyForSpeech(amount) {
    const formatted = amount.toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return `${currencySymbol} ${formatted}`;
}

// Initialize with enhanced features
window.onload = function() {
    console.log("NTAX 2026 Calculator Initializing...");
    
    // Load preferences
    loadPreferences();
    
    // Set initial mode
    const savedMode = localStorage.getItem('taxMode') || 'advanced';
    setMode(savedMode);
    
    // Load tax brackets
    loadBrackets();
    
    // Focus on income field
    setTimeout(() => {
        const incomeField = document.getElementById('income');
        if (incomeField) {
            incomeField.focus();
        }
    }, 500);
    
    // Add input validation
    setupInputValidation();
    
    console.log("NTAX Calculator Ready");
};

function loadPreferences() {
    // Currency
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency) {
        currencySymbol = savedCurrency;
        const currencySelect = document.getElementById('currency');
        if (currencySelect) {
            currencySelect.value = savedCurrency;
        }
    }
    
    // Load form values with better error handling
    const fields = ["income", "rent", "pension", "nhis", "nhf", "insurance", "crypto", "expenses"];
    fields.forEach(id => {
        try {
            const savedValue = localStorage.getItem(id);
            if (savedValue !== null && savedValue !== undefined) {
                const field = document.getElementById(id);
                if (field) {
                    field.value = savedValue;
                }
            }
        } catch (e) {
            console.warn(`Failed to load ${id}:`, e);
        }
    });
}

function setupInputValidation() {
    // Add input event listeners for real-time validation
    const numberFields = document.querySelectorAll('input[type="number"]');
    numberFields.forEach(field => {
        field.addEventListener('input', function(e) {
            // Remove any non-numeric characters except decimal point
            this.value = this.value.replace(/[^\d.]/g, '');
            
            // Ensure only one decimal point
            const parts = this.value.split('.');
            if (parts.length > 2) {
                this.value = parts[0] + '.' + parts.slice(1).join('');
            }
            
            // Limit to 2 decimal places
            if (parts.length === 2 && parts[1].length > 2) {
                this.value = parts[0] + '.' + parts[1].substring(0, 2);
            }
            
            // Highlight required field
            if (this.id === 'income' && this.value) {
                this.classList.add('is-valid');
            }
        });
        
        field.addEventListener('blur', function() {
            if (this.value && !isNaN(this.value)) {
                // Format with commas for readability
                const num = parseFloat(this.value);
                if (!isNaN(num)) {
                    this.value = num.toLocaleString('en-US', {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 0
                    });
                }
            }
        });
        
        field.addEventListener('focus', function() {
            // Remove commas for editing
            this.value = this.value.replace(/,/g, '');
        });
    });
}

async function loadBrackets() {
    try {
        const response = await fetch("docs/tax_brackets_reference.json");
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Process brackets with validation
        taxBrackets = data
            .filter(bracket => bracket && typeof bracket.min === 'number')
            .map(bracket => ({
                min: Number(bracket.min),
                max: bracket.max === null || bracket.max === undefined ? Infinity : Number(bracket.max),
                rate: Number(bracket.rate)
            }))
            .sort((a, b) => a.min - b.min);
        
        // Render brackets table
        renderBracketTable();
        
        // Update UI state
        updateCalculatorState();
        
        console.log(`Loaded ${taxBrackets.length} tax brackets`);
        
    } catch (error) {
        console.error("Failed to load tax brackets:", error);
        showErrorToUser("tax-brackets", "Unable to load current tax rates. Using standard 2026 rates.");
        
        // Fallback to default 2026 brackets
        taxBrackets = getDefaultBrackets();
        renderBracketTable();
        updateCalculatorState();
    }
}

function getDefaultBrackets() {
    return [
        { min: 0, max: 800000, rate: 0.00 },
        { min: 800000, max: 1600000, rate: 0.07 },
        { min: 1600000, max: 3200000, rate: 0.11 },
        { min: 3200000, max: 6400000, rate: 0.15 },
        { min: 6400000, max: Infinity, rate: 0.24 }
    ];
}

function renderBracketTable() {
    const container = document.getElementById("bracketTable");
    if (!container) return;
    
    if (!taxBrackets.length) {
        container.innerHTML = `
            <div class="alert alert-warning">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Tax brackets not loaded. Please check your internet connection.
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="card border-0 shadow-sm">
            <div class="card-header bg-gradient-primary text-white">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="mb-0"><i class="bi bi-table me-2"></i>2026 Proposed Tax Brackets</h5>
                    <span class="badge bg-light text-primary">Progressive</span>
                </div>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover table-custom mb-0">
                        <thead>
                            <tr>
                                <th class="ps-4">Income Range</th>
                                <th class="text-center">Tax Rate</th>
                                <th class="text-center pe-4">Annual Tax</th>
                            </tr>
                        </thead>
                        <tbody>`;
    
    // Generate example calculations for each bracket
    taxBrackets.forEach((bracket, index) => {
        const maxDisplay = bracket.max === Infinity 
            ? 'and above' 
            : formatCurrency(bracket.max).replace(/<[^>]*>/g, '');
        
        // Calculate example tax for bracket midpoint
        const exampleIncome = bracket.max === Infinity 
            ? bracket.min * 3 
            : (bracket.min + bracket.max) / 2;
        
        const exampleTax = calculateTaxForBracket(exampleIncome);
        
        const rowClass = index % 2 === 0 ? '' : 'table-light';
        
        html += `
            <tr class="${rowClass}">
                <td class="ps-4">
                    <div class="fw-medium">${formatCurrency(bracket.min).replace(/<[^>]*>/g, '')} – ${maxDisplay}</div>
                    <small class="text-muted">${index === 0 ? 'Tax-free threshold' : 'Progressive bracket'}</small>
                </td>
                <td class="text-center align-middle">
                    <span class="badge bg-primary bg-opacity-10 text-primary fs-6 px-3 py-2">
                        ${(bracket.rate * 100).toFixed(1)}%
                    </span>
                </td>
                <td class="text-center align-middle pe-4">
                    <div class="text-success fw-medium">${formatCurrency(exampleTax).replace(/<[^>]*>/g, '')}</div>
                    <small class="text-muted">on ${formatCurrency(exampleIncome).replace(/<[^>]*>/g, '')}</small>
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
                    Example calculations shown for midpoint of each bracket
                </small>
            </div>
        </div>`;
    
    container.innerHTML = html;
}

function calculateTaxForBracket(income) {
    let tax = 0;
    let remaining = income;
    
    for (const bracket of taxBrackets) {
        if (remaining > bracket.min) {
            const taxableInBracket = Math.min(remaining, bracket.max) - bracket.min;
            if (taxableInBracket > 0) {
                tax += taxableInBracket * bracket.rate;
            }
        }
    }
    
    return Math.max(0, tax);
}

function updateCalculatorState() {
    const calcBtn = document.getElementById("calcBtn");
    if (calcBtn) {
        if (taxBrackets.length > 0) {
            calcBtn.disabled = false;
            calcBtn.innerHTML = '<i class="bi bi-lightning-charge me-2"></i>Calculate Tax';
            calcBtn.classList.remove('btn-secondary');
            calcBtn.classList.add('btn-primary-custom');
        } else {
            calcBtn.disabled = true;
            calcBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Loading Rates...';
            calcBtn.classList.remove('btn-primary-custom');
            calcBtn.classList.add('btn-secondary');
        }
    }
}

function showErrorToUser(context, message) {
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-warning alert-dismissible fade show';
    errorDiv.setAttribute('role', 'alert');
    errorDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 1060; max-width: 350px;';
    errorDiv.innerHTML = `
        <div class="d-flex">
            <div class="flex-shrink-0">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
            </div>
            <div>
                <strong>${context}</strong><br>
                ${message}
            </div>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 10000);
}

function calculateNewTax2026(income, rent, pension, nhis, nhf, insurance, cryptoGain, expenses) {
    // Validate inputs
    income = Math.max(0, Number(income) || 0);
    rent = Math.max(0, Number(rent) || 0);
    pension = Math.max(0, Number(pension) || 0);
    nhis = Math.max(0, Number(nhis) || 0);
    nhf = Math.max(0, Number(nhf) || 0);
    insurance = Math.max(0, Number(insurance) || 0);
    cryptoGain = Math.max(0, Number(cryptoGain) || 0);
    expenses = Math.max(0, Number(expenses) || 0);
    
    // Calculate reliefs with caps
    const rentRelief = Math.min(TaxConfig.maxRentRelief, rent * TaxConfig.rentReliefRate);
    const pensionRelief = Math.min(TaxConfig.maxPensionRelief, pension);
    const insuranceRelief = Math.min(TaxConfig.maxInsuranceRelief, insurance);
    const expensesApplied = Math.min(income * TaxConfig.expenseRateCap, expenses);
    
    // Calculate taxable income (minimum taxable amount)
    let taxable = income - rentRelief - pensionRelief - insuranceRelief - nhis - nhf - expensesApplied;
    taxable = Math.max(TaxConfig.minTaxableIncome, taxable);
    
    // Calculate progressive tax
    let tax = 0;
    let remaining = taxable;
    
    for (const bracket of taxBrackets) {
        if (remaining > bracket.min) {
            const taxableInBracket = Math.min(remaining, bracket.max) - bracket.min;
            if (taxableInBracket > 0) {
                tax += taxableInBracket * bracket.rate;
            }
        }
    }
    
    // Calculate crypto tax (only on gains)
    const cryptoTax = cryptoGain > 0 ? cryptoGain * TaxConfig.cryptoRate : 0;
    
    // Monthly calculations
    const monthlyTaxable = taxable / 12;
    const monthlyTax = (tax + cryptoTax) / 12;
    const monthlyTakeHome = (income / 12) - monthlyTax;
    
    // Calculate effective tax rate
    const effectiveTaxRate = ((tax + cryptoTax) / income) * 100;
    
    return {
        income,
        tax,
        taxable,
        rentRelief,
        pensionRelief,
        insuranceRelief,
        cryptoTax,
        expensesApplied,
        monthlyTaxable,
        monthlyTax,
        monthlyTakeHome,
        effectiveTaxRate,
        totalTax: tax + cryptoTax,
        totalReliefs: rentRelief + pensionRelief + insuranceRelief + nhis + nhf + expensesApplied
    };
}

function calculateTax() {
    // Get input values with better parsing
    const getValue = (id) => {
        const element = document.getElementById(id);
        if (!element) return 0;
        const value = element.value.replace(/,/g, '');
        return parseFloat(value) || 0;
    };
    
    const income = getValue('income');
    
    if (income <= 0) {
        const resultDiv = document.getElementById('result');
        if (resultDiv) {
            resultDiv.innerHTML = `
                <div class="alert alert-danger fade-in" role="alert">
                    <div class="d-flex align-items-center">
                        <i class="bi bi-exclamation-triangle-fill me-3 fs-4"></i>
                        <div>
                            <h5 class="alert-heading">Missing Information</h5>
                            <p class="mb-0">Please enter your annual income to calculate taxes.</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Focus on income field
        const incomeField = document.getElementById('income');
        if (incomeField) {
            incomeField.focus();
            incomeField.classList.add('is-invalid');
        }
        
        return;
    }
    
    // Remove any error states
    const incomeField = document.getElementById('income');
    if (incomeField) {
        incomeField.classList.remove('is-invalid');
        incomeField.classList.add('is-valid');
    }
    
    // Collect all inputs
    const inputs = {
        rent: getValue('rent'),
        pension: getValue('pension'),
        nhis: getValue('nhis'),
        nhf: getValue('nhf'),
        insurance: getValue('insurance'),
        crypto: getValue('crypto'),
        expenses: getValue('expenses')
    };
    
    // Calculate tax
    const result = calculateNewTax2026(
        income,
        inputs.rent,
        inputs.pension,
        inputs.nhis,
        inputs.nhf,
        inputs.insurance,
        inputs.crypto,
        inputs.expenses
    );
    
    // Display results
    displayResults(result);
    
    // Save inputs
    saveInputs();
    
    // Speak summary for accessibility
    if (currentMode === 'simple') {
        readOutLoud(result);
    }
}

function displayResults(result) {
    const resultDiv = document.getElementById('result');
    const monthlyDiv = document.getElementById('monthly');
    
    if (!resultDiv || !monthlyDiv) return;
    
    // Format currency display
    const incomeDisplay = formatCurrency(result.income);
    const taxableDisplay = formatCurrency(result.taxable);
    const totalTaxDisplay = formatCurrency(result.totalTax);
    const monthlyTakeHomeDisplay = formatCurrency(result.monthlyTakeHome);
    const effectiveRate = result.effectiveTaxRate.toFixed(2);
    
    // Create results with animation
    resultDiv.innerHTML = `
        <div class="result-card fade-in">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h3 class="text-primary mb-0">
                    <i class="bi bi-file-earmark-text me-2"></i>Your 2026 Tax Report
                </h3>
                <span class="badge bg-primary bg-opacity-10 text-primary fs-6">
                    Effective Rate: ${effectiveRate}%
                </span>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="card border-0 bg-light h-100">
                        <div class="card-body">
                            <h6 class="text-muted mb-3">INCOME SUMMARY</h6>
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span>Annual Income:</span>
                                <span class="fw-bold fs-5">${incomeDisplay}</span>
                            </div>
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span>Taxable Income:</span>
                                <span class="fw-bold text-primary">${taxableDisplay}</span>
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
                            <h6 class="text-muted mb-3">TAX BREAKDOWN</h6>
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
                                <span class="fw-bold">Total Tax Due:</span>
                                <span class="fw-bold fs-5 text-success">${totalTaxDisplay}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="tax-breakdown fade-in">
                <h5 class="mb-3"><i class="bi bi-pie-chart me-2"></i>Detailed Reliefs & Deductions</h5>
                <div class="row">
                    <div class="col-md-6">
                        <div class="breakdown-item">
                            <span>Rent Relief (20%):</span>
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
                            <span>${formatCurrency(getValue('nhis'))}</span>
                        </div>
                        <div class="breakdown-item">
                            <span>NHF Contribution:</span>
                            <span>${formatCurrency(getValue('nhf'))}</span>
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
                            <h6 class="text-muted">Monthly Taxable</h6>
                            <h3 class="text-primary">${formatCurrency(result.monthlyTaxable)}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card border-warning border-2">
                        <div class="card-body">
                            <h6 class="text-muted">Monthly Tax</h6>
                            <h3 class="text-warning">${formatCurrency(result.monthlyTax)}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card border-success border-2">
                        <div class="card-body">
                            <h6 class="text-muted">Take Home Pay</h6>
                            <h3 class="text-success">${monthlyTakeHomeDisplay}</h3>
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
                            <span class="fw-bold text-success">${monthlyTakeHomeDisplay}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="text-center mt-4">
                <button class="btn btn-success me-2" onclick="downloadPDF()">
                    <i class="bi bi-download me-2"></i>Download Full Report
                </button>
                <button class="btn btn-info me-2" onclick="shareWhatsApp()">
                    <i class="bi bi-whatsapp me-2"></i>Share via WhatsApp
                </button>
                <button class="btn btn-outline-primary" onclick="readOutLoud()">
                    <i class="bi bi-volume-up me-2"></i>Listen to Summary
                </button>
            </div>
        </div>
    `;
    
    // Scroll to results
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function toggleMonthlyDetails() {
    const details = document.getElementById('monthlyDetails');
    const button = event.currentTarget;
    
    if (details.style.display === 'none') {
        details.style.display = 'block';
        button.innerHTML = '<i class="bi bi-chevron-up"></i> Hide Details';
    } else {
        details.style.display = 'none';
        button.innerHTML = '<i class="bi bi-chevron-down"></i> Details';
    }
}

function saveInputs() {
    const fields = ["income", "rent", "pension", "nhis", "nhf", "insurance", "crypto", "expenses"];
    fields.forEach(id => {
        const field = document.getElementById(id);
        if (field && field.value) {
            localStorage.setItem(id, field.value);
        }
    });
    localStorage.setItem('currency', currencySymbol);
    localStorage.setItem('taxMode', currentMode);
}

function clearInputs() {
    // Clear all input fields
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
    const resultDiv = document.getElementById('result');
    const monthlyDiv = document.getElementById('monthly');
    if (resultDiv) resultDiv.innerHTML = '';
    if (monthlyDiv) monthlyDiv.innerHTML = '';
    
    // Focus on income field
    const incomeField = document.getElementById('income');
    if (incomeField) {
        incomeField.focus();
    }
    
    // Show notification
    showNotification('All inputs cleared. Ready for new calculation.', 'info');
}

function downloadPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add logo (if available)
        try {
            // You can add your logo here
            // doc.addImage(logoData, 'PNG', 10, 10, 30, 30);
        } catch (e) {
            console.log('Logo not available for PDF');
        }
        
        // Title
        doc.setFontSize(20);
        doc.setTextColor(42, 92, 154);
        doc.text('Nigeria 2026 Tax Reform Report', 105, 20, { align: 'center' });
        
        // Date
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
        
        // User details
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Tax Calculation Summary', 20, 50);
        
        // Add a simple table
        const income = document.getElementById('income')?.value || 'Not provided';
        doc.text(`Annual Income: ${currencySymbol} ${parseFloat(income.replace(/,/g, '')).toLocaleString()}`, 20, 70);
        
        // Add disclaimer
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text('Disclaimer: This is an estimate based on proposed 2026 tax reforms.', 20, 150);
        doc.text('Consult a tax professional for official advice.', 20, 155);
        
        // Save PDF
        doc.save(`Nigeria_Tax_2026_Report_${Date.now()}.pdf`);
        
        showNotification('PDF report downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('PDF generation failed:', error);
        showNotification('Unable to generate PDF. Please try again.', 'warning');
    }
}

function readOutLoud(result) {
    if (!result) {
        // Try to get result from display
        const resultDiv = document.getElementById('result');
        if (!resultDiv || !resultDiv.textContent.trim()) {
            alert("Please calculate your tax first before using text-to-speech.");
            return;
        }
        
        // In a real implementation, you would extract the data
        alert("Text-to-speech available after calculation.");
        return;
    }
    
    if ('speechSynthesis' in window) {
        const msg = new SpeechSynthesisUtterance();
        msg.text = `Your Nigeria 2026 tax calculation is complete. ` +
                   `Your annual income is ${formatCurrencyForSpeech(result.income)}. ` +
                   `Your total tax payable is ${formatCurrencyForSpeech(result.totalTax)}. ` +
                   `This represents an effective tax rate of ${result.effectiveTaxRate.toFixed(1)} percent. ` +
                   `Your monthly take home pay after tax is ${formatCurrencyForSpeech(result.monthlyTakeHome)}. ` +
                   `Thank you for using the Nigeria Tax Calculator.`;
        
        msg.rate = 0.9;
        msg.pitch = 1;
        msg.volume = 1;
        msg.lang = 'en-NG';
        
        // Stop any ongoing speech
        window.speechSynthesis.cancel();
        
        // Speak
        window.speechSynthesis.speak(msg);
        
        showNotification('Reading summary aloud...', 'info');
    } else {
        alert("Text-to-speech is not supported in your browser. Try Chrome or Edge.");
    }
}

function updateCurrency() {
    const select = document.getElementById('currency');
    if (select) {
        currencySymbol = select.value;
        localStorage.setItem('currency', currencySymbol);
        
        // Update bracket table
        renderBracketTable();
        
        // Recalculate if there are existing results
        const income = document.getElementById('income')?.value;
        if (income && parseFloat(income.replace(/,/g, '')) > 0) {
            calculateTax();
        }
        
        showNotification(`Currency updated to ${currencySymbol}`, 'info');
    }
}

function setMode(mode) {
    currentMode = mode;
    const advancedFields = document.getElementById('advancedFields');
    const simpleCard = document.getElementById('simpleModeCard');
    const advancedCard = document.getElementById('advancedModeCard');
    
    if (mode === 'simple') {
        if (advancedFields) {
            advancedFields.style.display = 'none';
            advancedFields.setAttribute('aria-hidden', 'true');
        }
        if (simpleCard) simpleCard.classList.add('active');
        if (advancedCard) advancedCard.classList.remove('active');
        localStorage.setItem('taxMode', 'simple');
        
        // Clear advanced fields for simplicity
        const advancedIds = ["rent", "pension", "nhis", "nhf", "insurance", "crypto", "expenses"];
        advancedIds.forEach(id => {
            const field = document.getElementById(id);
            if (field) field.value = '';
        });
        
        showNotification('Simple mode activated. Perfect for quick calculations!', 'info');
    } else {
        if (advancedFields) {
            advancedFields.style.display = 'block';
            advancedFields.removeAttribute('aria-hidden');
        }
        if (simpleCard) simpleCard.classList.remove('active');
        if (advancedCard) advancedCard.classList.add('active');
        localStorage.setItem('taxMode', 'advanced');
        
        showNotification('Advanced mode activated. All deduction fields available.', 'info');
    }
}

function shareWhatsApp() {
    const income = document.getElementById('income')?.value;
    if (!income || parseFloat(income.replace(/,/g, '')) <= 0) {
        alert("Please calculate your tax first before sharing.");
        return;
    }
    
    const text = `Check out the Nigeria 2026 Tax Calculator! I just projected my taxes under the new law. ` +
                 `Try it for yourself: ${window.location.href}`;
    
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
}

// Helper function to show notifications
function showNotification(message, type = 'info') {
    const types = {
        'info': { class: 'alert-info', icon: 'info-circle' },
        'success': { class: 'alert-success', icon: 'check-circle' },
        'warning': { class: 'alert-warning', icon: 'exclamation-triangle' },
        'danger': { class: 'alert-danger', icon: 'exclamation-octagon' }
    };
    
    const config = types[type] || types.info;
    
    const notification = document.createElement('div');
    notification.className = `alert ${config.class} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 350px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bi bi-${config.icon} me-3 fs-4"></i>
            <div class="flex-grow-1">${message}</div>
            <button type="button" class="btn-close ms-3" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl + Enter to calculate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        calculateTax();
    }
    
    // Escape to clear
    if (e.key === 'Escape') {
        clearInputs();
    }
});

// Print styles
window.addEventListener('beforeprint', () => {
    document.body.classList.add('printing');
});

window.addEventListener('afterprint', () => {
    document.body.classList.remove('printing');
});
