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

function downloadPDF() {
    const resultDiv = document.getElementById('result');
    if (!resultDiv || !resultDiv.innerHTML.trim()) {
        showNotification("Please calculate your tax first before downloading the report.", "warning");
        scrollToSection('calculatorForm');
        return;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let currentPage = 1;
        let totalPages = 1; // Will be updated
        
        // Get calculation data
        const getNumberValue = (id) => {
            const element = document.getElementById(id);
            if (!element || !element.value) return 0;
            const value = element.value.replace(/,/g, '');
            return isNaN(parseFloat(value)) ? 0 : parseFloat(value);
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
        
        // Helper function to format currency - FIXED: Add useGrouping for commas
        const formatCurrencyPDF = (amount) => {
            const symbol = document.getElementById('currency')?.value || '₦';
            const formatter = new Intl.NumberFormat('en-NG', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                useGrouping: true // THIS ADDS COMMAS
            });
            const formatted = formatter.format(Math.abs(amount));
            return `${symbol}${formatted}`;
        };
        
        // Helper function to draw section headers
        const drawSectionHeader = (text, x, y) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.setTextColor(42, 92, 154);
            doc.text(text, x, y);
            
            // Underline
            doc.setDrawColor(42, 92, 154);
            doc.setLineWidth(0.5);
            doc.line(x, y + 1, x + 50, y + 1);
        };
        
        // FIXED: Improved table drawing with proper right alignment
        const drawTable = (data, x, y, width) => {
            const rowHeight = 7;
            let currentY = y;
            
            // Table header
            doc.setFillColor(240, 240, 240);
            doc.rect(x, currentY, width, rowHeight, 'F');
            
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text('Description', x + 5, currentY + 5);
            // Right align the "Amount" header
            doc.text('Amount', x + width - 5, currentY + 5, { align: 'right' });
            
            currentY += rowHeight;
            
            // Table rows
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            
            data.forEach((row, index) => {
                if (index % 2 === 0) {
                    doc.setFillColor(250, 250, 250);
                    doc.rect(x, currentY, width, rowHeight, 'F');
                }
                
                doc.text(row[0], x + 5, currentY + 5);
                
                // FIX: RIGHT ALIGN with proper positioning
                // Calculate text width and position it exactly at the right edge
                const amountText = row[1];
                if (amountText) {
                    const textWidth = doc.getTextWidth(amountText);
                    const rightEdge = x + width - 5;
                    doc.text(amountText, rightEdge - textWidth, currentY + 5);
                }
                
                currentY += rowHeight;
            });
            
            return currentY;
        };
        
        // Function to add watermark to every page
        const addWatermark = () => {
            doc.saveGraphicsState();
            doc.setGState(new doc.GState({ opacity: 0.03 })); // Very subtle
            doc.setFont("helvetica", "bold");
            doc.setFontSize(40); // Smaller than before
            doc.setTextColor(180, 180, 180);
            doc.text("ngtaxcalculator.online", pageWidth/2, pageHeight/2, {
                align: 'center',
                angle: 45
            });
            doc.restoreGraphicsState();
        };
        
        // Function to add header to every page
        const addHeader = (pageNum) => {
            // Header background (thinner)
            doc.setFillColor(42, 92, 154);
            doc.rect(0, 0, pageWidth, 30, 'F');
            
            // Logo text
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(255, 255, 255);
            doc.text('NG TAX', 20, 18);
            doc.setFontSize(8);
            doc.text('CALCULATOR 2026', 20, 24);
            
            // Page info
            doc.setFontSize(7);
            doc.text(`Page ${pageNum}`, pageWidth - 20, 12, { align: 'right' });
            doc.text(dateStr, pageWidth - 20, 18, { align: 'right' });
            
            doc.setTextColor(0, 0, 0);
        };
        
        // Function to add footer to every page
        const addFooter = (pageNum) => {
            const footerY = pageHeight - 10;
            
            doc.setDrawColor(220, 220, 220);
            doc.line(20, footerY - 8, pageWidth - 20, footerY - 8);
            
            doc.setFontSize(7);
            doc.setTextColor(100, 100, 100);
            
            if (pageNum === 1) {
                doc.text('www.ngtaxcalculator.online', 25, footerY);
                doc.text('Educational Estimate Only', pageWidth/2, footerY, { align: 'center' });
            } else {
                doc.text('Confidential - Client Copy', 25, footerY);
                doc.text('Page ' + pageNum, pageWidth/2, footerY, { align: 'center' });
            }
            
            doc.text(`Report ID: NTAX-${Date.now().toString().slice(-6)}`, pageWidth - 25, footerY, { align: 'right' });
        };
        
        // Function to check if we need new page
        const checkNewPage = (currentY, neededSpace = 20) => {
            if (currentY + neededSpace > pageHeight - 20) {
                // Add footer to current page
                addFooter(currentPage);
                
                // Add new page
                currentPage++;
                totalPages = currentPage;
                doc.addPage();
                
                // Setup new page
                addWatermark();
                addHeader(currentPage);
                
                return 40; // Reset Y position for new page (lower because smaller header)
            }
            return currentY;
        };
        
        // ==================== PAGE 1 ====================
        addWatermark();
        addHeader(1);
        let y = 45; // Start lower because smaller header
        
        // ==================== INCOME SUMMARY ====================
        drawSectionHeader('1. INCOME SUMMARY', 20, y);
        y += 10;
        
        const incomeData = [
            ['Annual Gross Income', formatCurrencyPDF(result.income)],
            ['Currency', currencySymbol === '₦' ? 'Naira (NGN)' : 
                      currencySymbol === '$' ? 'USD' :
                      currencySymbol === '€' ? 'EUR' : 'GBP'],
            ['Calculation Mode', currentMode === 'simple' ? 'Simple' : 'Advanced'],
            ['Date Generated', dateStr]
        ];
        
        y = drawTable(incomeData, 25, y, pageWidth - 40);
        y += 10;
        
        // ==================== TAX BREAKDOWN ====================
        drawSectionHeader('2. TAX CALCULATION', 20, y);
        y += 10;
        
        // Check if we have space for tax breakdown
        y = checkNewPage(y, 120);
        
        const taxData = [
            { desc: 'Gross Income', amount: result.income, style: 'normal' },
            { desc: 'Rent Relief (20% max ₦500k)', amount: -result.rentRelief, style: 'deduction' },
            { desc: 'Pension Relief (max ₦200k)', amount: -result.pensionRelief, style: 'deduction' },
            { desc: 'Insurance Relief (max ₦100k)', amount: -result.insuranceRelief, style: 'deduction' },
            { desc: 'NHIS Contribution', amount: -result.nhis, style: 'deduction' },
            { desc: 'NHF Contribution', amount: -result.nhf, style: 'deduction' },
            { desc: 'Business Expenses (30% max)', amount: -result.expensesApplied, style: 'deduction' },
            { desc: 'TOTAL DEDUCTIONS', amount: -result.totalReliefs, style: 'total' },
            { desc: 'TAXABLE INCOME', amount: result.taxable, style: 'highlight' },
            { desc: 'Income Tax (Progressive)', amount: result.tax, style: 'tax' },
            { desc: 'Crypto Tax @ 10%', amount: result.cryptoTax, style: 'tax' },
        ];
        
        taxData.forEach(item => {
            // Check if we need new page for each row
            y = checkNewPage(y, 8);
            
            doc.setFont("helvetica", 
                item.style === 'total' || item.style === 'highlight' ? "bold" : "normal");
            doc.setFontSize(10);
            
            // Apply styling based on item type
            switch(item.style) {
                case 'highlight':
                    doc.setFillColor(240, 249, 255);
                    doc.rect(25, y - 6, pageWidth - 50, 8, 'F');
                    doc.setTextColor(42, 92, 154);
                    break;
                case 'total':
                    doc.setFillColor(248, 249, 250);
                    doc.rect(25, y - 6, pageWidth - 50, 8, 'F');
                    break;
                case 'deduction':
                    doc.setTextColor(100, 100, 100);
                    break;
                case 'tax':
                    doc.setTextColor(30, 130, 76);
                    break;
            }
            
            doc.text(item.desc, 30, y);
            
            if (item.amount !== undefined) {
                const amountStr = item.amount < 0 ? 
                    `-${formatCurrencyPDF(Math.abs(item.amount))}` : 
                    formatCurrencyPDF(item.amount);
                
                // FIXED: Right align with exact positioning
                const textWidth = doc.getTextWidth(amountStr);
                const rightEdge = pageWidth - 30;
                doc.text(amountStr, rightEdge - textWidth, y);
            }
            
            y += 8;
            doc.setTextColor(0, 0, 0);
        });
        
        // Total Tax box
        y = checkNewPage(y, 15);
        y += 5;
        
        doc.setFillColor(30, 130, 76);
        doc.rect(25, y, pageWidth - 50, 10, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        
        const totalTaxText = 'TOTAL TAX DUE';
        const totalTaxAmount = formatCurrencyPDF(result.totalTax);
        
        doc.text(totalTaxText, 35, y + 7);
        
        // FIXED: Right align the total tax amount
        const totalTaxWidth = doc.getTextWidth(totalTaxAmount);
        const totalTaxRightEdge = pageWidth - 35;
        doc.text(totalTaxAmount, totalTaxRightEdge - totalTaxWidth, y + 7);
        
        y += 15;
        
        // Effective rate and net income
        y = checkNewPage(y, 10);
        doc.setFillColor(248, 249, 250);
        doc.rect(25, y, pageWidth - 50, 8, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        
        const effectiveRateText = `Effective Rate: ${result.effectiveRate.toFixed(2)}%`;
        doc.text(effectiveRateText, 30, y + 6);
        
        const netIncomeText = `Net Income: ${formatCurrencyPDF(result.netIncome)}`;
        // FIXED: Right align the net income
        const netIncomeWidth = doc.getTextWidth(netIncomeText);
        const netIncomeRightEdge = pageWidth - 30;
        doc.text(netIncomeText, netIncomeRightEdge - netIncomeWidth, y + 6);
        
        y += 15;
        
        // ==================== MONTHLY BREAKDOWN ====================
        y = checkNewPage(y, 40);
        drawSectionHeader('3. MONTHLY BREAKDOWN', 20, y);
        y += 10;
        
        const monthlyData = [
            ['Gross Monthly Income', formatCurrencyPDF(result.income / 12)],
            ['Monthly Taxable Income', formatCurrencyPDF(result.monthlyTaxable)],
            ['Monthly Tax Payment', formatCurrencyPDF(result.monthlyTax)],
            ['Monthly Take Home Pay', formatCurrencyPDF(result.monthlyTakeHome)]
        ];
        
        y = drawTable(monthlyData, 25, y, pageWidth - 40);
        
        // Highlight monthly take-home - FIXED alignment
        const highlightY = y - 28;
        doc.setFillColor(242, 252, 245);
        doc.rect(25, highlightY, pageWidth - 50, 7, 'F');
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 130, 76);
        doc.setFontSize(10);
        
        const takeHomeLabel = 'MONTHLY TAKE HOME';
        doc.text(takeHomeLabel, 30, highlightY + 5);
        
        const takeHomeAmount = formatCurrencyPDF(result.monthlyTakeHome);
        // FIXED: Right align the take home amount
        const takeHomeWidth = doc.getTextWidth(takeHomeAmount);
        const takeHomeRightEdge = pageWidth - 30;
        doc.text(takeHomeAmount, takeHomeRightEdge - takeHomeWidth, highlightY + 5);
        
        y += 10;
        
        // Add footer to page 1
        addFooter(1);
        
        // ==================== PAGE 2 (KEY TAKEAWAYS) ====================
        // Always create page 2 for key takeaways
        currentPage++;
        totalPages = currentPage;
        doc.addPage();
        addWatermark();
        addHeader(currentPage);
        y = 45;
        
        drawSectionHeader('4. KEY TAKEAWAYS & RECOMMENDATIONS', 20, y);
        y += 15;
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        
        const sections = [
            {
                title: 'IMPORTANT NOTES:',
                items: [
                    '• This is an ESTIMATE based on proposed 2026 tax reforms',
                    '• Keep digital/physical receipts for all deductions',
                    '• File tax returns by March 31st each year',
                    '• Consult a certified tax advisor for official planning'
                ]
            },
            {
                title: 'TAX PLANNING TIPS:',
                items: [
                    '✓ Consider tax-efficient investments',
                    '✓ Maximize pension contributions',
                    '✓ Track all business expenses',
                    '✓ Plan major purchases before year-end',
                    '✓ Stay informed about tax law changes'
                ]
            },
            {
                title: 'NEXT STEPS:',
                items: [
                    '1. Save this report for your records',
                    '2. Schedule tax professional consultation',
                    '3. Set aside funds for tax payment',
                    '4. Organize financial documentation',
                    '5. Mark tax deadlines on calendar'
                ]
            }
        ];
        
        sections.forEach((section, sectionIndex) => {
            // Check space for section
            y = checkNewPage(y, 30);
            if (sectionIndex > 0) y += 5;
            
            // Section title
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(42, 92, 154);
            doc.text(section.title, 25, y);
            y += 8;
            
            // Section items
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            
            section.items.forEach(item => {
                y = checkNewPage(y, 6);
                doc.text(item, 30, y);
                y += 6;
            });
        });
        
        y += 10;
        
        // ==================== DISCLAIMER BOX ====================
        y = checkNewPage(y, 40);
        
        doc.setFillColor(255, 250, 240);
        doc.setDrawColor(255, 193, 7);
        doc.setLineWidth(0.5);
        doc.rect(20, y, pageWidth - 40, 35, 'FD'); // Filled with border
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(133, 100, 4);
        doc.text('DISCLAIMER', 25, y + 8);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        
        const disclaimerLines = [
            'This report is for educational purposes only and does not constitute',
            'professional tax, legal, or financial advice. The calculations are',
            'estimates based on publicly available information about proposed',
            '2026 tax reforms. Always verify with official sources and consult',
            'qualified professionals before making financial decisions.',
            '',
            'Official Resources: FIRS.gov.ng | CITN.org'
        ];
        
        disclaimerLines.forEach((line, i) => {
            doc.text(line, 25, y + 16 + (i * 4));
        });
        
        y += 45;
        
        // ==================== CONTACT INFO ====================
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(42, 92, 154);
        doc.text('Generated by:', 25, y);
        doc.text('NG Tax Calculator 2026', 60, y);
        doc.text('www.ngtaxcalculator.online', 60, y + 4);
        doc.text('Report valid until:', pageWidth/2, y);
        
        const validUntilText = `${new Date().getFullYear() + 1}`;
        // FIXED: Right align the year
        const yearWidth = doc.getTextWidth(validUntilText);
        const yearRightEdge = pageWidth/2 + 30 + yearWidth;
        doc.text(validUntilText, yearRightEdge - yearWidth, y);
        
        // Add final footer
        addFooter(currentPage);
        
        // Update total pages in all headers (if needed, though jsPDF doesn't easily support this)
        
        // ==================== SAVE PDF ====================
        const fileName = `NGTAX_Report_${dateStr.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        doc.save(fileName);
        
        showNotification(`Professional ${currentPage}-page PDF report downloaded!`, 'success');
        
    } catch (error) {
        console.error('PDF generation error:', error);
        showNotification('Unable to generate PDF. Please try again.', 'warning');
    }
}

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
