// Analytics Tracking
function trackEvent(category, action, label) {
    // For Google Analytics (when you set it up)
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
    
    // Track in console for now
    console.log(`Event: ${category} - ${action} - ${label}`);
}

// Track page views
trackEvent('page', 'view', window.location.pathname);

// Track calculator usage
function trackTaxCalculation(income, taxAmount) {
    const incomeRange = income < 1000000 ? 'Under 1M' :
                       income < 5000000 ? '1M-5M' :
                       income < 10000000 ? '5M-10M' :
                       income < 50000000 ? '10M-50M' : 'Over 50M';
    
    trackEvent('calculator', 'calculate', incomeRange);
    trackEvent('calculator', 'tax_amount', `₦${Math.round(taxAmount/1000)}k`);
}

// Update calculateTax function to include tracking
function trackCalculateTax(result) {
    trackTaxCalculation(result.income, result.totalTax);
}
