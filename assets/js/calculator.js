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
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ 
            format: "a4", 
            unit: "mm",
            orientation: "portrait"
        });
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pageWidth - 2 * margin;
        let y = 25;
        
        // Color scheme - Fintech professional colors
        const colors = {
            primary: '#2D3748',
            secondary: '#4A5568',
            accent: '#3182CE',
            success: '#38A169',
            warning: '#D69E2E',
            danger: '#E53E3E',
            light: '#718096',
            background: '#F7FAFC'
        };
        
        // ========== NEW SOLUTION: Manual Text Width Calculation ==========
        
        // Helper to get exact text width in mm
        const getTextWidth = (text, fontSize = 11, fontStyle = 'normal') => {
            const currentFont = doc.internal.getFont();
            const fontName = currentFont.fontName;
            const fontWeight = fontStyle === 'bold' ? 'bold' : 'normal';
            
            // Approximate widths for helvetica (these are in PDF units, not mm)
            const charWidths = {
                'normal': {
                    '0': 0.5, '1': 0.5, '2': 0.5, '3': 0.5, '4': 0.5,
                    '5': 0.5, '6': 0.5, '7': 0.5, '8': 0.5, '9': 0.5,
                    '.': 0.25, ',': 0.25,
                    '₦': 0.6, '$': 0.5, '€': 0.6, '£': 0.6,
                    ' ': 0.25, '%': 0.8
                },
                'bold': {
                    '0': 0.55, '1': 0.55, '2': 0.55, '3': 0.55, '4': 0.55,
                    '5': 0.55, '6': 0.55, '7': 0.55, '8': 0.55, '9': 0.55,
                    '.': 0.3, ',': 0.3,
                    '₦': 0.65, '$': 0.55, '€': 0.65, '£': 0.65,
                    ' ': 0.3, '%': 0.85
                }
            };
            
            // Calculate total width
            let totalWidth = 0;
            for (let char of text) {
                totalWidth += charWidths[fontWeight][char] || 0.5;
            }
            
            // Convert to mm (approximate)
            return (totalWidth * fontSize) / 2;
        };
        
        // NEW: Format currency with tabular numbers
        const formatCurrency = (value) => {
            return new Intl.NumberFormat('en-NG', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                useGrouping: true
            }).format(value);
        };
        
        // NEW: Add right-aligned row with perfect alignment
        const addRightAlignedRow = (label, value, options = {}) => {
            checkPageBreak(10);
            
            const {
                labelColor = colors.primary,
                valueColor = colors.primary,
                labelFontSize = 11,
                valueFontSize = 11,
                isBold = false,
                isValueBold = false,
                hasBackground = false,
                index = 0,
                type = 'normal'
            } = options;
            
            // Alternating row background
            if (hasBackground && index % 2 === 0) {
                doc.setFillColor(249, 250, 251);
                doc.rect(margin, y - 4, contentWidth, 10, 'F');
            }
            
            // Draw label
            doc.setFont("helvetica", isBold ? "bold" : "normal");
            doc.setTextColor(labelColor);
            doc.setFontSize(labelFontSize);
            doc.text(label, margin + 5, y);
            
            // Calculate value text
            let valueText = '';
            if (type === 'percentage') {
                valueText = `${value.toFixed(2)}%`;
            } else {
                valueText = `${currency} ${formatCurrency(value)}`;
            }
            
            // MANUAL RIGHT ALIGNMENT - Calculate exact position
            const valueWidth = getTextWidth(valueText, valueFontSize, isValueBold ? 'bold' : 'normal');
            const rightEdge = pageWidth - margin - 5; // 5mm from right margin
            
            // Draw value at calculated position
            doc.setFont("helvetica", isValueBold ? "bold" : "normal");
            doc.setTextColor(valueColor);
            doc.setFontSize(valueFontSize);
            doc.text(valueText, rightEdge - valueWidth, y);
            
            y += isBold ? 9 : 8;
            return y;
        };
        
        // Helper functions
        const checkPageBreak = (spaceNeeded = 10) => {
            if (y + spaceNeeded > pageHeight - 30) {
                doc.addPage();
                y = 25;
                return true;
            }
            return false;
        };
        
        const drawSectionLine = () => {
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.5);
            doc.line(margin, y, pageWidth - margin, y);
            y += 10;
        };
        
        // Fetch values from the actual calculation results, NOT from inputs
        // Get the results that were already calculated
        const resultDiv = document.getElementById('result');
        if (!resultDiv || !resultDiv.innerHTML.trim()) {
            showNotification('Please calculate your tax first before downloading PDF.', 'warning');
            return false;
        }
        
        // Extract values from the displayed results or calculate them
        const income = parseFloat(document.getElementById('income')?.value.replace(/,/g, '')) || 0;
        const rent = parseFloat(document.getElementById('rent')?.value.replace(/,/g, '')) || 0;
        const pension = parseFloat(document.getElementById('pension')?.value.replace(/,/g, '')) || 0;
        const nhis = parseFloat(document.getElementById('nhis')?.value.replace(/,/g, '')) || 0;
        const nhf = parseFloat(document.getElementById('nhf')?.value.replace(/,/g, '')) || 0;
        const insurance = parseFloat(document.getElementById('insurance')?.value.replace(/,/g, '')) || 0;
        const crypto = parseFloat(document.getElementById('crypto')?.value.replace(/,/g, '')) || 0;
        const expenses = parseFloat(document.getElementById('expenses')?.value.replace(/,/g, '')) || 0;
        const currency = document.getElementById('currency')?.value || '₦';
        
        // Recalculate to get consistent values
        const result = calculateNewTax2026(income, rent, pension, nhis, nhf, insurance, crypto, expenses);
        
        // === HEADER SECTION ===
        doc.setFillColor(247, 250, 252);
        doc.roundedRect(margin - 5, 10, contentWidth + 10, 45, 3, 3, 'F');
        
        doc.setFont("helvetica", "bold");
        doc.setTextColor(colors.primary);
        doc.setFontSize(24);
        doc.text("NG TAX CALCULATOR", pageWidth / 2, 25, { align: "center" });
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(colors.secondary);
        doc.setFontSize(12);
        doc.text("Professional Tax Estimation Report - 2026", pageWidth / 2, 35, { align: "center" });
        
        doc.setFontSize(10);
        doc.setTextColor(colors.light);
        const reportDate = new Date().toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        doc.text(`Generated on: ${reportDate}`, margin, 45);
        doc.text(`Report ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`, pageWidth - margin, 45, { align: "right" });
        
        y = 55;
        drawSectionLine();
        
        // === INCOME & CONTRIBUTIONS SECTION ===
        checkPageBreak(100);
        
        doc.setFillColor(colors.accent);
        doc.setDrawColor(colors.accent);
        doc.roundedRect(margin, y, contentWidth, 10, 2, 2, 'F');
        
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(13);
        doc.text("INCOME & CONTRIBUTIONS", margin + 8, y + 6.5);
        
        y += 15;
        
        // Add all entries with PERFECT right alignment
        const entries = [
            { label: "ANNUAL INCOME", value: income, color: colors.success, isValueBold: true },
            { label: "RENT PAID", value: rent, color: colors.accent },
            { label: "PENSION CONTRIBUTION", value: pension, color: colors.accent },
            { label: "NHIS CONTRIBUTION", value: nhis, color: colors.accent },
            { label: "NHF CONTRIBUTION", value: nhf, color: colors.accent },
            { label: "INSURANCE PREMIUM", value: insurance, color: colors.accent },
            { label: "CRYPTO GAINS", value: crypto, color: colors.accent },
            { label: "BUSINESS EXPENSES", value: expenses, color: colors.accent }
        ];
        
        entries.forEach((entry, index) => {
            addRightAlignedRow(entry.label, entry.value, {
                labelColor: colors.primary,
                valueColor: entry.color,
                labelFontSize: 11,
                valueFontSize: 11,
                isValueBold: entry.isValueBold || false,
                hasBackground: true,
                index: index
            });
        });
        
        y += 3;
        drawSectionLine();
        
        // === TAX CALCULATION SUMMARY ===
        checkPageBreak(80);
        
        doc.setFillColor(colors.success);
        doc.roundedRect(margin, y, contentWidth, 10, 2, 2, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(13);
        doc.text("TAX CALCULATION SUMMARY", margin + 8, y + 6.5);
        
        y += 15;
        
        // Add summary with PERFECT alignment
        const summaryItems = [
            { label: "TAXABLE INCOME", value: result.taxable, color: colors.primary },
            { label: "TOTAL DEDUCTIONS", value: result.totalReliefs, color: colors.secondary },
            { label: "INCOME TAX", value: result.tax, color: colors.accent },
            { label: "CRYPTO TAX", value: result.cryptoTax, color: colors.warning }
        ];
        
        summaryItems.forEach((item, index) => {
            addRightAlignedRow(item.label, item.value, {
                labelColor: item.color,
                valueColor: item.color,
                labelFontSize: 11,
                valueFontSize: 11,
                isValueBold: false,
                hasBackground: false,
                index: index
            });
        });
        
        // TOTAL TAX PAYABLE with special styling
        checkPageBreak(12);
        
        // Background for total tax
        doc.setFillColor(254, 242, 242);
        doc.rect(margin, y - 6, contentWidth, 13, 'F');
        doc.setDrawColor(252, 165, 165);
        doc.setLineWidth(0.3);
        doc.rect(margin, y - 6, contentWidth, 13);
        
        // Add total tax row
        addRightAlignedRow("TOTAL TAX PAYABLE", result.totalTax, {
            labelColor: colors.danger,
            valueColor: colors.danger,
            labelFontSize: 13,
            valueFontSize: 13,
            isBold: true,
            isValueBold: true,
            hasBackground: false
        });
        
        y += 2;
        
        // MONTHLY ESTIMATE
        checkPageBreak(10);
        addRightAlignedRow("MONTHLY ESTIMATE", result.monthlyTax, {
            labelColor: colors.success,
            valueColor: colors.success,
            labelFontSize: 11,
            valueFontSize: 11,
            isValueBold: true,
            hasBackground: false
        });
        
        // EFFECTIVE TAX RATE (as percentage)
        checkPageBreak(10);
        addRightAlignedRow("EFFECTIVE TAX RATE", result.effectiveRate, {
            labelColor: colors.light,
            valueColor: colors.light,
            labelFontSize: 11,
            valueFontSize: 11,
            isValueBold: true,
            hasBackground: false,
            type: 'percentage'
        });
        
        y += 5;
        drawSectionLine();
        
        // === DEDUCTIONS BREAKDOWN ===
        checkPageBreak(60);
        
        doc.setFont("helvetica", "bold");
        doc.setTextColor(colors.primary);
        doc.setFontSize(13);
        doc.text("DEDUCTIONS BREAKDOWN", margin, y);
        y += 10;
        
        const deductions = [
            { label: "Rent Relief", value: result.rentRelief, color: colors.accent },
            { label: "Pension Relief", value: result.pensionRelief, color: colors.accent },
            { label: "Insurance Relief", value: result.insuranceRelief, color: colors.accent },
            { label: "NHIS Contribution", value: result.nhis, color: colors.accent },
            { label: "NHF Contribution", value: result.nhf, color: colors.accent },
            { label: "Business Expenses", value: result.expensesApplied, color: colors.accent }
        ];
        
        deductions.forEach((deduction, index) => {
            addRightAlignedRow(deduction.label, deduction.value, {
                labelColor: colors.secondary,
                valueColor: deduction.color,
                labelFontSize: 10,
                valueFontSize: 10,
                isValueBold: false,
                hasBackground: true,
                index: index
            });
        });
        
        y += 5;
        drawSectionLine();
        
        // === MONTHLY SUMMARY ===
        checkPageBreak(40);
        
        doc.setFont("helvetica", "bold");
        doc.setTextColor(colors.primary);
        doc.setFontSize(13);
        doc.text("MONTHLY SUMMARY", margin, y);
        y += 10;
        
        const monthlyItems = [
            { label: "Gross Monthly Income", value: income / 12 },
            { label: "Monthly Taxable", value: result.monthlyTaxable },
            { label: "Monthly Tax", value: result.monthlyTax },
            { label: "Net Monthly Income", value: result.monthlyTakeHome, color: colors.success, isBold: true }
        ];
        
        monthlyItems.forEach((item, index) => {
            addRightAlignedRow(item.label, item.value, {
                labelColor: colors.secondary,
                valueColor: item.color || colors.primary,
                labelFontSize: 10,
                valueFontSize: 10,
                isValueBold: item.isBold || false,
                hasBackground: index % 2 === 0,
                index: index
            });
        });
        
        y += 5;
        drawSectionLine();
        
        // === DISCLAIMER SECTION ===
        checkPageBreak(50);
        
        doc.setFont("helvetica", "bold");
        doc.setTextColor(colors.primary);
        doc.setFontSize(11);
        doc.text("IMPORTANT DISCLAIMER", margin, y);
        y += 7;
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(colors.secondary);
        doc.setFontSize(9);
        
        const disclaimerText = "This tax estimation report is generated for informational and planning purposes only. The calculations are based on current Nigerian tax laws as of 2026 and common assumptions. Actual tax liabilities may vary based on individual circumstances, additional deductions, exemptions, and specific tax regulations applicable to your situation.";
        
        const disclaimerLines = doc.splitTextToSize(disclaimerText, contentWidth);
        disclaimerLines.forEach(line => {
            checkPageBreak(6);
            doc.text(line, margin, y);
            y += 5;
        });
        
        y += 3;
        
        const bulletPoints = [
            "Federal Inland Revenue Service (FIRS)",
            "A licensed tax professional or accountant",
            "Your financial advisor"
        ];
        
        doc.text("For official tax calculations and filing, please consult with:", margin, y);
        y += 7;
        
        bulletPoints.forEach(point => {
            checkPageBreak(6);
            doc.text(`• ${point}`, margin + 5, y);
            y += 5;
        });
        
        // === FOOTER ===
        doc.setFont("helvetica", "normal");
        doc.setTextColor(colors.light);
        doc.setFontSize(8);
        
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: "right" });
            doc.text("Confidential - For Client Use Only", margin, pageHeight - 10);
        }
        
        // Subtle watermark
        doc.setPage(1);
        doc.setTextColor(248, 250, 252);
        doc.setFontSize(40);
        doc.setFont("helvetica", "bold");
        doc.text("ESTIMATE", pageWidth / 2, pageHeight / 2, { 
            align: "center",
            angle: 45 
        });
        
        // Final footer
        doc.setTextColor(colors.light);
        doc.setFontSize(9);
        doc.text(`Generated by NG Tax Calculator • ${reportDate}`, pageWidth / 2, pageHeight - 18, { align: "center" });
        doc.setFontSize(8);
        doc.text("https://ngtaxcalculator.online", pageWidth / 2, pageHeight - 12, { align: "center" });
        
        // Save PDF
        const fileName = `NG_Tax_Report_${new Date().toISOString().slice(0,10)}.pdf`;
        doc.save(fileName);
        
        showNotification('PDF report downloaded successfully!', 'success');
        return true;
        
    } catch (err) {
        console.error("PDF generation failed:", err);
        showNotification('Failed to generate PDF. Please try again.', 'error');
        return false;
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
