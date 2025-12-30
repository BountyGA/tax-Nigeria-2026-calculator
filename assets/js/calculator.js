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

// ==============================================
// FEATURE 1: AUTO SCROLL FUNCTIONALITY
// ==============================================
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        setTimeout(() => {
            section.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 100);
    }
}

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
    
    // Load tax brackets ONLY ONCE
    setTimeout(() => {
        loadBrackets();
        // After brackets load, scroll to form
        setTimeout(() => {
            scrollToFormAfterBrackets();
        }, 300);
    }, 500);
    
    // Add scroll-to functionality to key buttons
    addScrollToFunctionality();

    // Update the donation button to prevent scrolling back
    updateDonationButton();
};

// NEW FUNCTION: Scroll to form after brackets load
function scrollToFormAfterBrackets() {
    // Wait a bit for brackets to render
    setTimeout(() => {
        // Find the form section (calculator card)
        const calculatorForm = document.getElementById('calculatorForm');
        if (calculatorForm) {
            calculatorForm.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start'  // Changed from 'center' to 'start'
            });
            
            // Focus on the income field
            const incomeField = document.getElementById('income');
            if (incomeField) {
                incomeField.focus();
            }
        }
    }, 500);
}

// NEW FUNCTION: Update donation button behavior
function updateDonationButton() {
    setTimeout(() => {
        // Find all "View your free Tax report" buttons in donation section
        const donationButtons = document.querySelectorAll('.btn[data-scroll-to="result"]');
        donationButtons.forEach(button => {
            // Remove any existing onclick handlers
            button.removeAttribute('onclick');
            
            // Add new click handler that doesn't scroll to donation
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // First calculate tax if not already done
                const resultDiv = document.getElementById('result');
                if (!resultDiv || !resultDiv.innerHTML.trim()) {
                    // We need to calculate tax first
                    calculateTax();
                } else {
                    // Results already exist, just scroll to them
                    resultDiv.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start'
                    });
                }
            });
        });
    }, 1000); // Wait a bit longer to ensure DOM is ready
} 

// Add scroll-to functionality to key buttons
function addScrollToFunctionality() {
    // Add scroll to form from "Start Calculating" button in HTML
    setTimeout(() => {
        const startCalcBtn = document.querySelector('[data-scroll-to="form"]');
        if (startCalcBtn) {
            startCalcBtn.addEventListener('click', function(e) {
                e.preventDefault();
                // Scroll to income field specifically
                const incomeField = document.getElementById('income');
                if (incomeField) {
                    incomeField.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                    incomeField.focus();
                } else {
                    scrollToSection('calculatorForm');
                }
            });
        }
        
        // Add scroll to brackets from "View Tax Brackets" button
        const viewBracketsBtn = document.querySelector('[data-scroll-to="brackets"]');
        if (viewBracketsBtn) {
            viewBracketsBtn.addEventListener('click', function(e) {
                e.preventDefault();
                scrollToSection('bracketTable');
            });
        }
        
        // Make sample data button scroll to income field
        const sampleBtn = document.querySelector('button[onclick*="fillSampleData"]');
        if (sampleBtn) {
            sampleBtn.addEventListener('click', function() {
                setTimeout(() => {
                    const incomeField = document.getElementById('income');
                    if (incomeField) {
                        incomeField.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                        });
                        incomeField.focus();
                    }
                }, 300);
            });
        }
        
        // Add scroll from navbar links
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                if (this.getAttribute('href') === '#') {
                    e.preventDefault();
                    if (this.textContent.includes('Calculator')) {
                        // Scroll to income field specifically
                        const incomeField = document.getElementById('income');
                        if (incomeField) {
                            incomeField.scrollIntoView({ 
                                behavior: 'smooth', 
                                block: 'center' 
                            });
                            incomeField.focus();
                        } else {
                            scrollToSection('calculatorForm');
                        }
                    }
                }
            });
        });
    }, 500);
}

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
    
    // Update the displayed brackets only if container is empty
    const container = document.getElementById("bracketTable");
    if (container && (!container.innerHTML || container.innerHTML.includes("Loading"))) {
        renderBracketTable();
    }
}

// Keep these functions OUTSIDE loadBrackets():
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

// Main calculation function - UPDATED WITH SCROLLING TO DONATION
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
    
    // MONETIZATION: Trigger ads after successful calculation
    if (window.loadAdsAfterCalculation) {
        window.loadAdsAfterCalculation();
    }
    
    // FEATURE: First show results, then auto scroll to donation section
    setTimeout(() => {
        // First ensure results are visible
        const resultSection = document.getElementById('result');
        if (resultSection && resultSection.innerHTML.trim()) {
            resultSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
            
            // Then after a short delay, scroll to donation section
            setTimeout(() => {
                const donationSection = document.querySelector('.container.mt-5 .card.border-success');
                if (donationSection) {
                    donationSection.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                    
                    // Highlight the donation section
                    donationSection.classList.add('highlight-pulse');
                    setTimeout(() => {
                        donationSection.classList.remove('highlight-pulse');
                    }, 2000);
                } else {
                    // Fallback to just showing results if donation section not found
                    console.log("Donation section not found");
                }
            }, 800); // 0.8 second delay between showing results and scrolling to donation
        }
    }, 100);
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
                <button class="btn btn-info me-2" onclick="openShareModal()">
                    <i class="bi bi-share me-2"></i>Share
                </button>
            </div>
        </div>
    `;

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
        
        // Scroll to form when switching modes
        scrollToSection('calculatorForm');
    } else {
        if (advancedFields) advancedFields.style.display = 'block';
        if (simpleCard) simpleCard.classList.remove('active');
        if (advancedCard) advancedCard.classList.add('active');
        localStorage.setItem('taxMode', 'advanced');
        showNotification('Advanced mode activated. All fields are available.', 'info');
        
        // Scroll to form when switching modes
        scrollToSection('calculatorForm');
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

// ============================================
// HELPER FUNCTIONS FOR PDF (ADD THESE FIRST!)
// ============================================

// Helper function to determine tax bracket
function getTaxBracket(taxableIncome) {
    // Ensure taxBrackets is accessible
    if (!window.taxBrackets || !Array.isArray(window.taxBrackets)) {
        return "Standard Bracket";
    }
    
    const brackets = window.taxBrackets;
    for (let i = brackets.length - 1; i >= 0; i--) {
        if (taxableIncome > brackets[i].min) {
            const rate = (brackets[i].rate * 100).toFixed(1);
            return `${rate}% Bracket`;
        }
    }
    return "0% Bracket";
}

// Helper function to calculate tax efficiency score
function calculateTaxEfficiency(result) {
    const maxPossibleRelief = 500000 + 200000 + 100000; // Rent + Pension + Insurance caps
    const actualRelief = result.rentRelief + result.pensionRelief + result.insuranceRelief;
    
    // Avoid division by zero
    if (maxPossibleRelief <= 0) return "0.0";
    
    let efficiency = (actualRelief / maxPossibleRelief) * 100;
    efficiency = Math.min(efficiency, 100); // Cap at 100%
    
    return efficiency.toFixed(1);
}

// ============================================
// HELPER FUNCTIONS (MUST BE DEFINED FIRST)
// ============================================

// Helper function to determine tax bracket
function getTaxBracket(taxableIncome) {
    // Ensure taxBrackets is accessible
    if (!window.taxBrackets || !Array.isArray(window.taxBrackets)) {
        return "Standard Bracket";
    }
    
    const brackets = window.taxBrackets;
    for (let i = brackets.length - 1; i >= 0; i--) {
        if (taxableIncome > brackets[i].min) {
            const rate = (brackets[i].rate * 100).toFixed(1);
            return `${rate}% Bracket`;
        }
    }
    return "0% Bracket";
}

// Helper function to calculate tax efficiency score
function calculateTaxEfficiency(result) {
    const maxPossibleRelief = 500000 + 200000 + 100000; // Rent + Pension + Insurance caps
    const actualRelief = result.rentRelief + result.pensionRelief + result.insuranceRelief;
    
    // Avoid division by zero
    if (maxPossibleRelief <= 0) return "0.0";
    
    let efficiency = (actualRelief / maxPossibleRelief) * 100;
    efficiency = Math.min(efficiency, 100); // Cap at 100%
    
    return efficiency.toFixed(1);
}

// ============================================
// MAIN PDF FUNCTION
// ============================================

function downloadPDF() {
    const resultDiv = document.getElementById('result');
    if (!resultDiv || !resultDiv.innerHTML.trim()) {
        showNotification("Please calculate your tax first before downloading the report.", "warning");
        scrollToSection('calculatorForm');
        return;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            throw new Error("jsPDF library not loaded");
        }
        
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Track pages
        let currentPage = 1;
        const totalPages = 2;
        
        // Get calculation data
        const getNumberValue = (id) => {
            const element = document.getElementById(id);
            if (!element || !element.value) return 0;
            const value = element.value.replace(/,/g, '');
            const num = parseFloat(value);
            return isNaN(num) ? 0 : num;
        };
        
        const income = getNumberValue("income");
        const rent = getNumberValue("rent");
        const pension = getNumberValue("pension");
        const nhis = getNumberValue("nhis");
        const nhf = getNumberValue("nhf");
        const insurance = getNumberValue("insurance");
        const crypto = getNumberValue("crypto");
        const expenses = getNumberValue("expenses");
        
        // Recalculate for PDF
        const result = calculateNewTax2026(income, rent, pension, nhis, nhf, insurance, crypto, expenses);
        if (!result) {
            throw new Error("Could not calculate tax");
        }
        
        // Calculate net income
        const netIncome = result.income - result.totalTax;
        
        const today = new Date();
        const dateStr = today.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        const timeStr = today.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Use GLOBAL currencySymbol, not DOM element
        const currentCurrency = window.currencySymbol || '₦';
        
        // PERFECT currency formatting
        const formatCurrencyPDF = (amount) => {
            const symbol = currentCurrency;
            
            // Handle very large numbers properly
            let number = Math.abs(amount);
            if (number === 0) return `${symbol}0.00`;
            
            // Format with commas and 2 decimal places
            const formatter = new Intl.NumberFormat('en-NG', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                useGrouping: true
            });
            
            const formatted = formatter.format(number);
            return `${symbol}${formatted}`;
        };
        
        // Helper to draw section headers
        const drawSectionHeader = (text, x, y) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.setTextColor(42, 92, 154);
            doc.text(text, x, y);
            
            // Underline
            doc.setDrawColor(42, 92, 154);
            doc.setLineWidth(0.3);
            doc.line(x, y + 1, x + 45, y + 1);
        };
        
        // PERFECT table drawing
        const drawTable = (data, x, y, width, hasHeader = true) => {
            const rowHeight = 7;
            let currentY = y;
            
            if (hasHeader) {
                // Table header
                doc.setFillColor(42, 92, 154);
                doc.rect(x, currentY, width, rowHeight, 'F');
                
                doc.setFont("helvetica", "bold");
                doc.setFontSize(10);
                doc.setTextColor(255, 255, 255);
                
                const col1Width = width * 0.65;
                const col2Width = width * 0.35;
                
                doc.text('Description', x + 5, currentY + 5);
                doc.text('Amount', x + col1Width - 5, currentY + 5, { align: 'right' });
                
                currentY += rowHeight;
                doc.setTextColor(0, 0, 0);
            }
            
            // Table rows
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            
            const col1Width = width * 0.65;
            
            data.forEach((row, index) => {
                // Skip empty rows
                if (!row[0] && !row[1]) {
                    currentY += 3; // Smaller space for empty rows
                    return;
                }
                
                // Alternate row colors
                if (index % 2 === 0) {
                    doc.setFillColor(250, 250, 250);
                    doc.rect(x, currentY, width, rowHeight, 'F');
                }
                
                // Column 1 (Description)
                if (row[0]) {
                    doc.text(row[0], x + 5, currentY + 5);
                }
                
                // Column 2 (Amount) - RIGHT ALIGNED
                if (row[1]) {
                    const textWidth = doc.getTextWidth(row[1]);
                    const amountX = x + width - 5 - textWidth;
                    doc.text(row[1], amountX, currentY + 5);
                }
                
                currentY += rowHeight;
            });
            
            return currentY;
        };
        
        // PERFECT watermark
        const addWatermark = () => {
            doc.saveGraphicsState();
            doc.setGState(new doc.GState({ opacity: 0.03 }));
            doc.setFont("helvetica", "normal");
            doc.setFontSize(36);
            doc.setTextColor(180, 180, 180);
            
            const centerX = pageWidth / 2;
            const centerY = pageHeight / 2;
            
            doc.text("ngtaxcalculator.online", centerX, centerY, {
                align: 'center',
                angle: 45,
                baseline: 'middle'
            });
            doc.restoreGraphicsState();
        };
        
        // Header for each page
        const addHeader = (pageNum) => {
            // Blue header bar
            doc.setFillColor(42, 92, 154);
            doc.rect(0, 0, pageWidth, 30, 'F');
            
            // Logo/Title
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(255, 255, 255);
            doc.text('NG TAX', 20, 18);
            doc.setFontSize(7);
            doc.text('CALCULATOR 2026', 20, 24);
            
            // Right side info
            doc.setFontSize(8);
            doc.setTextColor(255, 255, 255, 0.9);
            doc.text(`Page ${pageNum}/${totalPages}`, pageWidth - 20, 12, { align: 'right' });
            doc.text(dateStr, pageWidth - 20, 18, { align: 'right' });
            doc.text(timeStr, pageWidth - 20, 24, { align: 'right' });
            
            doc.setTextColor(0, 0, 0);
        };
        
        // Footer for each page
        const addFooter = (pageNum) => {
            const footerY = pageHeight - 10;
            
            // Footer line
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.2);
            doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);
            
            doc.setFontSize(7);
            doc.setTextColor(100, 100, 100);
            
            const reportId = `NTAX-${Date.now().toString().slice(-8)}`;
            doc.text('www.ngtaxcalculator.online', 25, footerY);
            doc.text(`Report ID: ${reportId}`, pageWidth/2, footerY, { align: 'center' });
            doc.text(`Page ${pageNum}/${totalPages}`, pageWidth - 25, footerY, { align: 'right' });
        };
        
        // Smart page break checking - IMPROVED
        const checkPageBreak = (currentY, spaceNeeded = 15) => {
            return (currentY + spaceNeeded > pageHeight - 20);
        };
        
        // Function to handle page breaks properly
        const handlePageBreak = (neededSpace) => {
            if (checkPageBreak(y, neededSpace)) {
                addFooter(currentPage);
                doc.addPage();
                currentPage++;
                addWatermark();
                addHeader(currentPage);
                y = 45;
                return true;
            }
            return false;
        };
        
        // ============================================
        // PAGE 1: FINANCIAL CALCULATIONS
        // ============================================
        addWatermark();
        addHeader(1);
        let y = 45;
        
        // 1. INCOME SUMMARY
        drawSectionHeader('1. INCOME SUMMARY', 20, y);
        y += 12;
        
        const incomeData = [
            ['Annual Gross Income', formatCurrencyPDF(result.income)],
            ['Currency', currentCurrency === '₦' ? 'Naira (NGN)' : 
                      currentCurrency === '$' ? 'USD' :
                      currentCurrency === '€' ? 'EUR' : 'GBP'],
            ['Calculation Mode', window.currentMode === 'simple' ? 'Simple' : 'Advanced'],
            ['Report Date', `${dateStr} • ${timeStr}`]
        ];
        
        y = drawTable(incomeData, 25, y, pageWidth - 40);
        y += 15;
        
        // 2. TAX CALCULATION BREAKDOWN
        drawSectionHeader('2. TAX CALCULATION', 20, y);
        y += 12;
        
        // Handle page break before large table
        handlePageBreak(120);
        
        // Tax calculation table
        const taxTableData = [
            ['Gross Annual Income', formatCurrencyPDF(result.income)],
            ['Rent Relief (20% max ₦500k)', `-${formatCurrencyPDF(result.rentRelief)}`],
            ['Pension Relief (max ₦200k)', `-${formatCurrencyPDF(result.pensionRelief)}`],
            ['Insurance Relief (max ₦100k)', `-${formatCurrencyPDF(result.insuranceRelief)}`],
            ['NHIS Contribution', `-${formatCurrencyPDF(result.nhis)}`],
            ['NHF Contribution', `-${formatCurrencyPDF(result.nhf)}`],
            ['Business Expenses (30% max)', `-${formatCurrencyPDF(result.expensesApplied)}`],
            ['', ''], // Spacer row
            ['TOTAL DEDUCTIONS', `-${formatCurrencyPDF(result.totalReliefs)}`],
            ['TAXABLE INCOME', formatCurrencyPDF(result.taxable)],
            ['', ''], // Spacer row
            ['Income Tax (Progressive)', formatCurrencyPDF(result.tax)],
            ['Crypto Tax @ 10%', formatCurrencyPDF(result.cryptoTax)],
        ];
        
        y = drawTable(taxTableData, 25, y, pageWidth - 40);
        y += 10;
        
        // TOTAL TAX BOX - Highlighted
        doc.setFillColor(30, 130, 76);
        doc.rect(25, y, pageWidth - 50, 12, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        
        const totalTaxText = 'TOTAL TAX DUE';
        const totalTaxAmount = formatCurrencyPDF(result.totalTax);
        
        doc.text(totalTaxText, 35, y + 8);
        
        const amountWidth = doc.getTextWidth(totalTaxAmount);
        doc.text(totalTaxAmount, pageWidth - 35 - amountWidth, y + 8);
        
        y += 18;
        
        // Effective Rate and Net Income
        doc.setFillColor(248, 249, 250);
        doc.rect(25, y, pageWidth - 50, 10, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        
        const effectiveRateText = `Effective Tax Rate: ${result.effectiveRate.toFixed(2)}%`;
        const netIncomeText = `Net Annual Income: ${formatCurrencyPDF(netIncome)}`;
        
        doc.text(effectiveRateText, 30, y + 7);
        
        const netIncomeWidth = doc.getTextWidth(netIncomeText);
        doc.text(netIncomeText, pageWidth - 30 - netIncomeWidth, y + 7);
        
        y += 15;
        
        // 3. MONTHLY BREAKDOWN
        handlePageBreak(50);
        
        drawSectionHeader('3. MONTHLY BREAKDOWN', 20, y);
        y += 12;
        
        const monthlyData = [
            ['Gross Monthly Income', formatCurrencyPDF(result.income / 12)],
            ['Monthly Taxable Income', formatCurrencyPDF(result.monthlyTaxable)],
            ['Monthly Tax Payment', formatCurrencyPDF(result.monthlyTax)],
            ['Monthly Take Home Pay', formatCurrencyPDF(result.monthlyTakeHome)]
        ];
        
        const tableEndY = drawTable(monthlyData, 25, y, pageWidth - 40);
        
        // Highlight the monthly take-home - FIXED POSITION
        const highlightY = tableEndY - 28; // Correct calculation
        doc.setFillColor(242, 252, 245);
        doc.rect(25, highlightY, pageWidth - 50, 8, 'F');
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 130, 76);
        doc.setFontSize(10);
        
        const takeHomeLabel = 'MONTHLY TAKE HOME PAY';
        const takeHomeAmount = formatCurrencyPDF(result.monthlyTakeHome);
        
        doc.text(takeHomeLabel, 30, highlightY + 5);
        
        const takeHomeAmountWidth = doc.getTextWidth(takeHomeAmount);
        doc.text(takeHomeAmount, pageWidth - 30 - takeHomeAmountWidth, highlightY + 5);
        
        y = tableEndY + 5;
        
        // Quick Financial Tip
        if (!handlePageBreak(30)) {
            doc.setFillColor(255, 253, 240);
            doc.setDrawColor(255, 193, 7);
            doc.setLineWidth(0.5);
            doc.rect(20, y, pageWidth - 40, 25, 'FD');
            
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(133, 100, 4);
            doc.text('FINANCIAL TIP 💡', 25, y + 8);
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(0, 0, 0);
            doc.text('Consider increasing pension contributions to maximize', 30, y + 16);
            doc.text('tax relief and retirement savings simultaneously.', 30, y + 21);
            
            y += 30;
        }
        
        // Add footer to page 1
        addFooter(1);
        
        // ============================================
        // PAGE 2: FINANCIAL INSIGHTS & RECOMMENDATIONS
        // ============================================
        doc.addPage();
        currentPage = 2;
        addWatermark();
        addHeader(currentPage);
        y = 45;
        
        drawSectionHeader('4. FINANCIAL INSIGHTS & STRATEGIES', 20, y);
        y += 15;
        
        // Section 1: Your Tax Profile
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(42, 92, 154);
        doc.text('YOUR TAX PROFILE SUMMARY:', 25, y);
        y += 8;
        
        // Get helper function results
        const taxBracket = getTaxBracket(result.taxable);
        const taxEfficiency = calculateTaxEfficiency(result);
        
        const profileItems = [
            `• Effective Tax Rate: ${result.effectiveRate.toFixed(2)}%`,
            `• Tax Bracket: ${taxBracket}`,
            `• Monthly Cash Flow: ${formatCurrencyPDF(result.monthlyTakeHome)}`,
            `• Annual Tax Savings: ${formatCurrencyPDF(result.totalReliefs)}`,
            `• Tax Efficiency Score: ${taxEfficiency}%`
        ];
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        
        profileItems.forEach(item => {
            handlePageBreak(6);
            doc.text(item, 30, y);
            y += 6;
        });
        
        y += 10;
        
        // Section 2: Optimization Strategies
        handlePageBreak(20);
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(42, 92, 154);
        doc.text('TAX OPTIMIZATION STRATEGIES:', 25, y);
        y += 8;
        
        const strategies = [
            '✓ Maximize ₦200,000 pension relief for retirement planning',
            '✓ Utilize ₦500,000 rent relief if you pay annual rent',
            '✓ Claim ₦100,000 insurance relief for life/health policies',
            '✓ Document all business expenses (30% of income limit)',
            '✓ Consider tax-efficient investment vehicles',
            '✓ Plan major purchases/deductions before December',
            '✓ Keep digital records of all deductible expenses',
            '✓ Consult tax professional for complex situations'
        ];
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        
        strategies.forEach(strategy => {
            handlePageBreak(6);
            doc.text(strategy, 30, y);
            y += 5.5;
        });
        
        y += 10;
        
        // Section 3: Compliance Timeline
        handlePageBreak(20);
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(42, 92, 154);
        doc.text('COMPLIANCE TIMELINE:', 25, y);
        y += 8;
        
        const timeline = [
            'Jan 1: Start tracking expenses for new tax year',
            'Quarterly: Pay estimated taxes (if self-employed)',
            'Dec 31: Finalize all deductible expenses',
            'Mar 31: File annual tax returns deadline',
            'Apr 30: Pay any balance due on tax liability'
        ];
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        
        timeline.forEach(item => {
            handlePageBreak(6);
            doc.text(`• ${item}`, 30, y);
            y += 6;
        });
        
        y += 15;
        
        // ==================== IMPORTANT DISCLAIMER ====================
        handlePageBreak(45);
        
        doc.setFillColor(255, 245, 245);
        doc.setDrawColor(220, 53, 69);
        doc.setLineWidth(0.5);
        doc.rect(20, y, pageWidth - 40, 35, 'FD');
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(220, 53, 69);
        doc.text('⚠ IMPORTANT DISCLAIMER', pageWidth/2, y + 8, { align: 'center' });
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(0, 0, 0);
        
        const disclaimer = [
            'This report is generated by NG Tax Calculator 2026 for educational and',
            'estimation purposes only. It does not constitute professional tax,',
            'legal, or financial advice. Tax laws are complex and subject to change.',
            'Always consult with a qualified tax professional or certified public',
            'accountant for personalized advice. Refer to official FIRS guidelines.',
            '',
            'Official Resources: FIRS (www.firs.gov.ng) | CITN (www.citn.org)'
        ];
        
        disclaimer.forEach((line, i) => {
            const lineY = y + 16 + (i * 3.5);
            doc.text(line, pageWidth/2, lineY, { align: 'center' });
        });
        
        y += 40;
        
        // ==================== REPORT FOOTER ====================
        doc.setDrawColor(220, 220, 220);
        doc.line(20, y, pageWidth - 20, y);
        y += 5;
        
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        
        // Left column
        doc.text('Generated by NG Tax Calculator 2026', 25, y);
        doc.text('www.ngtaxcalculator.online', 25, y + 3.5);
        
        // Center column
        const reportId = `TAX-${Date.now().toString().slice(-8)}`;
        doc.text(`Report ID: ${reportId}`, pageWidth/2, y, { align: 'center' });
        doc.text(`Valid until: 31 Dec ${new Date().getFullYear() + 1}`, pageWidth/2, y + 3.5, { align: 'center' });
        
        // Right column
        doc.text(`Total Pages: ${totalPages}`, pageWidth - 25, y, { align: 'right' });
        doc.text(`Version: 2026.1`, pageWidth - 25, y + 3.5, { align: 'right' });
        
        // Add final footer
        addFooter(2);
        
        // ==================== SAVE PDF ====================
        const fileName = `NG_TAX_REPORT_${dateStr.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        doc.save(fileName);
        
        showNotification(`✅ Financial Tax Report (${totalPages} pages) downloaded successfully!`, 'success');
        
    } catch (error) {
        console.error('PDF generation error:', error);
        showNotification('❌ Unable to generate PDF. Please try again.', 'warning');
    }
}

// Make helper functions globally available
window.getTaxBracket = getTaxBracket;
window.calculateTaxEfficiency = calculateTaxEfficiency;
window.downloadPDF = downloadPDF;

// Missing functions that need to be added
function shareWhatsApp() {
    const resultDiv = document.getElementById('result');
    if (!resultDiv || !resultDiv.innerHTML.trim()) {
        showNotification("Please calculate your tax first before sharing.", "warning");
        return;
    }
    
    // Use the new function for WhatsApp
    shareOnSocial('whatsapp');
}

function shareOnSocial(platform) {
    // Check if results exist (for all platforms)
    const resultDiv = document.getElementById('result');
    if (!resultDiv || !resultDiv.innerHTML.trim()) {
        showNotification("Please calculate your tax first before sharing.", "warning");
        return;
    }
    
    const text = `Check out this free Nigeria 2026 Tax Calculator! I just projected my taxes under the new reforms. Try it for yourself: ${window.location.href}`;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(window.location.href);
    
    let url = '';
    
    switch(platform) {
        case 'whatsapp':
            url = `https://wa.me/?text=${encodedText}`;
            break;
        case 'facebook':
            url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
            break;
        case 'twitter':
            url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
            break;
        case 'linkedin':
            url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
            break;
        case 'telegram':
            url = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
            break;
    }
    
    if (url) {
        window.open(url, '_blank', 'width=600,height=400,noopener,noreferrer');
    }
}

function copyShareLink() {
    const shareLink = document.getElementById('shareLink');
    shareLink.select();
    shareLink.setSelectionRange(0, 99999); // For mobile
    
    navigator.clipboard.writeText(shareLink.value)
        .then(() => {
            showNotification('Link copied to clipboard!', 'success');
        })
        .catch(err => {
            // Fallback for older browsers
            document.execCommand('copy');
            showNotification('Link copied!', 'success');
        });
}

function openShareModal() {
    const resultDiv = document.getElementById('result');
    if (!resultDiv || !resultDiv.innerHTML.trim()) {
        showNotification("Please calculate your tax first before sharing.", "warning");
        return;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('shareModal'));
    modal.show();
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
    
    // Scroll to calculate button
    setTimeout(() => {
        const calcBtn = document.querySelector('button[onclick*="calculateTax"]');
        if (calcBtn) {
            calcBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 300);
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
window.shareOnSocial = shareOnSocial;
window.copyShareLink = copyShareLink;
window.openShareModal = openShareModal;
window.fillSampleData = fillSampleData;
window.showNotification = showNotification;
window.toggleMonthlyDetails = toggleMonthlyDetails;
