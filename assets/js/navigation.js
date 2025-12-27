// Navigation and Page Router
function showInfo(pageType) {
    hideAllPages();
    
    switch(pageType) {
        case 'tax-law':
            showTaxLawPage();
            break;
        case 'faq':
            showFAQPage();
            break;
        case 'guide':
            downloadPDF();
            return; // Don't scroll for PDF download
        case 'privacy':
            showPrivacyPage();
            break;
    }
    
    // Auto-scroll to the loaded content
    autoScrollToContent();
}

function showTaxLawPage() {
    const resultDiv = document.getElementById("result");
    const monthlyDiv = document.getElementById("monthly");
    
    if (!resultDiv || !monthlyDiv) return;
    
    resultDiv.innerHTML = `
        <div class="result-card fade-in">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h3 class="text-primary mb-0">
                    <i class="bi bi-file-earmark-text me-2"></i>2026 Tax Reform Summary
                </h3>
                <button class="btn btn-outline-primary" onclick="showInfo('faq')">
                    <i class="bi bi-question-circle me-2"></i>View FAQ
                </button>
            </div>
            
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0"><i class="bi bi-info-circle me-2"></i>Key Changes in 2026 Tax Reform</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="feature-card mb-3">
                                <h6><i class="bi bi-plus-circle text-success me-2"></i>New Progressive Tax Brackets</h6>
                                <p class="text-muted small">Higher earners pay higher rates with new brackets up to 25%.</p>
                            </div>
                            <div class="feature-card mb-3">
                                <h6><i class="bi bi-house text-primary me-2"></i>Rent Relief (20% up to ₦500k)</h6>
                                <p class="text-muted small">Deduction for rent payments to support urban workers.</p>
                            </div>
                            <div class="feature-card mb-3">
                                <h6><i class="bi bi-shield text-info me-2"></i>Insurance Premium Relief</h6>
                                <p class="text-muted small">Up to ₦100,000 deduction for health/life insurance.</p>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="feature-card mb-3">
                                <h6><i class="bi bi-currency-bitcoin text-warning me-2"></i>Crypto Tax (10%)</h6>
                                <p class="text-muted small">Capital gains tax on cryptocurrency profits.</p>
                            </div>
                            <div class="feature-card mb-3">
                                <h6><i class="bi bi-briefcase text-secondary me-2"></i>Business Expense Cap (30%)</h6>
                                <p class="text-muted small">Maximum deductible business expenses at 30% of income.</p>
                            </div>
                            <div class="feature-card mb-3">
                                <h6><i class="bi bi-person-check text-success me-2"></i>Pension Relief (up to ₦200k)</h6>
                                <p class="text-muted small">Encouraging retirement savings with tax incentives.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-secondary text-white">
                    <h5 class="mb-0"><i class="bi bi-calendar me-2"></i>Implementation Timeline</h5>
                </div>
                <div class="card-body">
                    <div class="timeline">
                        <div class="timeline-item">
                            <div class="timeline-date">Jan 2025</div>
                            <div class="timeline-content">
                                <h6>Proposal Announcement</h6>
                                <p>Tax reform proposal presented to National Assembly</p>
                            </div>
                        </div>
                        <div class="timeline-item">
                            <div class="timeline-date">Jun 2025</div>
                            <div class="timeline-content">
                                <h6>Public Hearings</h6>
                                <p>Stakeholder consultations and public feedback collection</p>
                            </div>
                        </div>
                        <div class="timeline-item">
                            <div class="timeline-date">Dec 2025</div>
                            <div class="timeline-content">
                                <h6>Final Approval</h6>
                                <p>Expected approval by both legislative houses</p>
                            </div>
                        </div>
                        <div class="timeline-item">
                            <div class="timeline-date">Jan 2026</div>
                            <div class="timeline-content">
                                <h6>Implementation Begins</h6>
                                <p>New tax rates and deductions take effect</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="text-center mt-4">
                <button class="btn btn-primary me-2" onclick="scrollToSection('calculatorForm')">
                    <i class="bi bi-calculator me-2"></i>Try Calculator
                </button>
                <button class="btn btn-outline-secondary" onclick="downloadPDF()">
                    <i class="bi bi-download me-2"></i>Download Full Guide
                </button>
            </div>
        </div>
    `;
    
    monthlyDiv.innerHTML = '';
}

function showFAQPage() {
    const resultDiv = document.getElementById("result");
    const monthlyDiv = document.getElementById("monthly");
    
    if (!resultDiv || !monthlyDiv) return;
    
    resultDiv.innerHTML = `
        <div class="result-card fade-in">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h3 class="text-primary mb-0">
                    <i class="bi bi-question-circle me-2"></i>Frequently Asked Questions
                </h3>
                <button class="btn btn-outline-primary" onclick="showInfo('tax-law')">
                    <i class="bi bi-file-text me-2"></i>Tax Law Summary
                </button>
            </div>
            
            <div class="accordion" id="faqAccordion">
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                            Q1: Is this calculator accurate for 2026 taxes?
                        </button>
                    </h2>
                    <div id="faq1" class="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
                        <div class="accordion-body">
                            <p>This calculator is based on the <strong>proposed</strong> 2026 tax reforms. While we use the latest available information, final tax rates may change based on legislative approval. We recommend consulting with a tax professional for official tax planning.</p>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                            Q2: What's the minimum taxable income?
                        </button>
                    </h2>
                    <div id="faq2" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                        <div class="accordion-body">
                            <p>Under the proposed reforms, the minimum taxable income is <strong>₦800,000 annually</strong>. Income below this threshold is not subject to personal income tax.</p>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                            Q3: How is rent relief calculated?
                        </button>
                    </h2>
                    <div id="faq3" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                        <div class="accordion-body">
                            <p>Rent relief allows you to deduct <strong>20% of your annual rent</strong>, up to a maximum of <strong>₦500,000</strong>. You must provide rent receipts as proof of payment.</p>
                            <p class="mb-0"><small><i class="bi bi-info-circle text-primary me-1"></i>Example: If you pay ₦2,000,000 in rent, your relief would be ₦400,000 (20% of ₦2M).</small></p>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq4">
                            Q4: Are crypto gains really taxed at 10%?
                        </button>
                    </h2>
                    <div id="faq4" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                        <div class="accordion-body">
                            <p>Yes, the proposed reform includes a <strong>10% capital gains tax</strong> on cryptocurrency profits. This applies only to gains (profit), not the total transaction amount. Losses can be carried forward to offset future gains.</p>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq5">
                            Q5: What business expenses are deductible?
                        </button>
                    </h2>
                    <div id="faq5" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                        <div class="accordion-body">
                            <p>Business expenses are deductible up to <strong>30% of your annual income</strong>. This includes:</p>
                            <ul>
                                <li>Office rent and utilities</li>
                                <li>Business travel expenses</li>
                                <li>Professional development costs</li>
                                <li>Equipment and supplies</li>
                                <li>Marketing and advertising</li>
                            </ul>
                            <p class="mb-0"><small><i class="bi bi-exclamation-triangle text-warning me-1"></i>Proper documentation (receipts, invoices) is required for all deductions.</small></p>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq6">
                            Q6: How do I contact a tax advisor?
                        </button>
                    </h2>
                    <div id="faq6" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                        <div class="accordion-body">
                            <p>You can contact certified tax professionals through:</p>
                            <ul>
                                <li><strong>FIRS (Federal Inland Revenue Service)</strong>: Visit <a href="https://www.firs.gov.ng" target="_blank">www.firs.gov.ng</a></li>
                                <li><strong>Chartered Institute of Taxation of Nigeria</strong>: Visit <a href="https://www.citn.org" target="_blank">www.citn.org</a></li>
                                <li><strong>Association of National Accountants of Nigeria</strong></li>
                            </ul>
                         <p class="mb-0">For official tax advice, consult certified tax professionals or FIRS directly.</p>       </div>
                    </div>
                </div>
            </div>
            
            <div class="alert alert-info mt-4">
                <h6><i class="bi bi-chat-left-text me-2"></i>Still have questions?</h6>
                <p class="mb-0">Email us at <strong>gabrielbounty19@gmail.com</strong> for website support questions only.</p>    
            </div>
        </div>
    `;
    
    monthlyDiv.innerHTML = '';
}

function showPrivacyPage() {
    const resultDiv = document.getElementById("result");
    const monthlyDiv = document.getElementById("monthly");
    
    if (!resultDiv || !monthlyDiv) return;
    
    resultDiv.innerHTML = `
        <div class="result-card fade-in">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h3 class="text-primary mb-0">
                    <i class="bi bi-shield-check me-2"></i>Privacy Policy
                </h3>
                <button class="btn btn-outline-primary" onclick="showCalculator()">
                    <i class="bi bi-calculator me-2"></i>Back to Calculator
                </button>
            </div>
            
            <div class="card border-0 shadow-sm">
                <div class="card-body">
                    <h5 class="mb-4">Your Privacy Matters to Us</h5>
                    
                    <h6><i class="bi bi-lock text-primary me-2"></i>Data Collection</h6>
                    <p>NTAX 2026 Calculator operates on a <strong>client-side only</strong> basis. This means:</p>
                    <ul>
                        <li>All calculations happen in your browser</li>
                        <li>We don't store your income or personal data on our servers</li>
                        <li>Your tax information never leaves your device</li>
                        <li>Local storage is used only to save your preferences (currency, mode)</li>
                    </ul>
                    
                    <h6 class="mt-4"><i class="bi bi-cookie text-primary me-2"></i>Cookies & Local Storage</h6>
                    <p>We use minimal local storage to:</p>
                    <ul>
                        <li>Remember your selected currency preference</li>
                        <li>Save your calculator mode (simple/advanced)</li>
                        <li>Remember your form inputs for convenience (optional)</li>
                    </ul>
                    <p>You can clear all stored data at any time using the "Clear All" button in the calculator.</p>
                    
                    <h6 class="mt-4"><i class="bi bi-shield text-primary me-2"></i>Third-Party Services</h6>
                    <p>We use these third-party services:</p>
                    <ul>
                        <li><strong>Bootstrap & Icons</strong>: For UI components (CDN)</li>
                        <li><strong>jsPDF</strong>: For PDF generation (client-side)</li>
                        <li><strong>Google Fonts</strong>: For typography</li>
                    </ul>
                    <p>No personal data is shared with these services.</p>
                    
                    <h6 class="mt-4"><i class="bi bi-chat-dots text-primary me-2"></i>Contact Information</h6>
                    <p>If you have privacy concerns or questions:</p>
                    <ul>
                       <li>Email: gabrielbounty19@gmail.com</li>
                       <li>For privacy questions only - not for tax advice</li>
                    </ul>
                    
                    <div class="alert alert-info mt-4">
                        <h6><i class="bi bi-info-circle me-2"></i>Disclaimer</h6>
                        <p class="mb-0">This tool provides estimates only. For official tax advice, consult certified professionals or FIRS directly.</p>
                    </div>
                    
                    <p class="text-muted small mt-4"><em>Last updated: December 2024</em></p>
                </div>
            </div>
        </div>
    `;
    
    monthlyDiv.innerHTML = '';
}

function showCalculator() {
    // Clear the info pages and show empty calculator
    const resultDiv = document.getElementById("result");
    const monthlyDiv = document.getElementById("monthly");
    
    if (resultDiv) resultDiv.innerHTML = '';
    if (monthlyDiv) monthlyDiv.innerHTML = '';
    
    // Scroll to calculator form
    setTimeout(() => {
        scrollToSection('calculatorForm');
    }, 100);
}

function hideAllPages() {
    // This function ensures only one page is shown at a time
    // The actual hiding is done by clearing the result/monthly divs in each show function
}

// Auto-scroll function for all content pages
function autoScrollToContent() {
    setTimeout(() => {
        const resultDiv = document.getElementById("result");
        if (resultDiv && resultDiv.innerHTML.trim()) {
            resultDiv.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }, 100);
}

<!-- In your navigation.js, add showDisclaimer() function -->
function showDisclaimer() {
    const resultDiv = document.getElementById("result");
    const monthlyDiv = document.getElementById("monthly");
    
    if (!resultDiv || !monthlyDiv) return;
    
    resultDiv.innerHTML = `
        <div class="result-card fade-in">
            <h3 class="text-primary mb-4">
                <i class="bi bi-shield-exclamation me-2"></i>Legal Disclaimer
            </h3>
            
            <div class="card border-warning mb-4">
                <div class="card-header bg-warning text-dark">
                    <h5 class="mb-0"><i class="bi bi-exclamation-triangle-fill me-2"></i>Important Notice</h5>
                </div>
                <div class="card-body">
                    <h6 class="text-dark">Educational Purpose Only</h6>
                    <p>The NG Tax Calculator ("the Tool") is provided for <strong>educational and informational purposes only</strong>. It is designed to help users understand potential tax implications under proposed 2026 Nigerian tax reforms.</p>
                    
                    <h6 class="text-dark mt-4">Not Professional Tax Advice</h6>
                    <p>This Tool does <strong>not constitute professional tax advice, legal advice, or financial advice</strong>. The calculations are estimates based on publicly available information about proposed tax reforms and may not reflect final legislation.</p>
                    
                    <h6 class="text-dark mt-4">No Government Affiliation</h6>
                    <p>This Tool is <strong>not affiliated with, endorsed by, or connected to</strong>:</p>
                    <ul>
                        <li>Federal Inland Revenue Service (FIRS)</li>
                        <li>Lagos State Internal Revenue Service (LIRS)</li>
                        <li>Joint Tax Board (JTB)</li>
                        <li>Any state or federal government tax authority in Nigeria</li>
                    </ul>
                    
                    <h6 class="text-dark mt-4">Accuracy Limitation</h6>
                    <p>While we strive for accuracy, tax laws are complex and subject to change. We make <strong>no warranties or representations</strong> about the accuracy, completeness, or suitability of the information provided.</p>
                    
                    <h6 class="text-dark mt-4">Your Responsibility</h6>
                    <p>You are solely responsible for:</p>
                    <ul>
                        <li>Verifying tax calculations with qualified professionals</li>
                        <li>Complying with actual tax laws and regulations</li>
                        <li>Filing accurate tax returns with appropriate authorities</li>
                    </ul>
                    
                    <div class="alert alert-danger mt-4">
                        <h6><i class="bi bi-x-circle-fill me-2"></i>Limitation of Liability</h6>
                        <p class="mb-0">To the fullest extent permitted by law, Webmas and NG Tax Calculator disclaim all liability for any damages, losses, or consequences arising from the use of this Tool.</p>
                    </div>
                </div>
            </div>
            
            <div class="text-center">
                <button class="btn btn-primary" onclick="showCalculator()">
                    <i class="bi bi-calculator me-2"></i>Back to Calculator
                </button>
                <a href="mailto:gabrielbounty19@gmail.com" class="btn btn-outline-secondary ms-2">
                    <i class="bi bi-envelope me-2"></i>Legal Questions
                </a>
            </div>
        </div>
    `;
    
    monthlyDiv.innerHTML = '';
    scrollToSection('result');
}


// Make functions globally available
window.showInfo = showInfo;
window.showCalculator = showCalculator;
