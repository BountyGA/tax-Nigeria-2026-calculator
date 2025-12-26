// Donation Functions
function showDonationOptions() {
    const modal = new bootstrap.Modal(document.getElementById('donationModal'));
    modal.show();
    
    // Add click handlers for donation amounts
    document.querySelectorAll('.donation-amount').forEach(button => {
        button.addEventListener('click', function() {
            const amount = this.getAttribute('data-amount');
            processDonation(amount);
        });
    });
}

function showCustomAmount() {
    document.getElementById('customAmountSection').style.display = 'block';
}

function processDonation(amount) {
    let donationAmount = amount;
    
    if (!donationAmount) {
        donationAmount = document.getElementById('customAmount').value;
        if (!donationAmount || donationAmount < 100) {
            showNotification('Please enter a valid amount (minimum ₦100)', 'warning');
            return;
        }
    }
    
    // Here you would integrate with Flutterwave or other payment gateway
    // For now, show a message
    showNotification(`Thank you! Redirecting to secure payment for ₦${donationAmount}...`, 'success');
    
    // Simulate payment processing
    setTimeout(() => {
        showNotification('Payment processed successfully! Thank you for your support.', 'success');
        const modal = bootstrap.Modal.getInstance(document.getElementById('donationModal'));
        modal.hide();
    }, 2000);
}
