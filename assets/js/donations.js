console.log('✅ donations.js loaded successfully!');
console.log('showDonationOptions function exists:', typeof showDonationOptions === 'function');

let selectedAmount = 1000; // Default amount
let selectedButton = null; // Track selected button

function showDonationOptions() {
    console.log('Opening donation modal...');
    
    // Reset selections
    selectedAmount = 1000;
    selectedButton = null;
    document.getElementById('customAmountSection').style.display = 'none';
    document.getElementById('donateButton').style.display = 'none';
    
    // Reset all buttons
    document.querySelectorAll('.donation-amount').forEach(btn => {
        btn.classList.remove('active', 'btn-success');
        btn.classList.add('btn-outline-success');
    });
    
    // Use Bootstrap 5 native modal
    const donationModal = document.getElementById('donationModal');
    if (donationModal) {
        const modal = new bootstrap.Modal(donationModal);
        modal.show();
        console.log('Modal shown using Bootstrap 5');
    } else {
        console.error('Donation modal element not found!');
        alert('Error: Could not open donation modal.');
    }
}

function showCustomAmount() {
    document.getElementById('customAmountSection').style.display = 'block';
    document.getElementById('donateButton').style.display = 'block';
    
    // Reset selected amount when choosing custom
    document.querySelectorAll('.donation-amount').forEach(btn => {
        btn.classList.remove('active', 'btn-success');
        btn.classList.add('btn-outline-success');
    });
    
    selectedButton = null;
    selectedAmount = null;
}

// Handle amount selection
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.donation-amount').forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('.donation-amount').forEach(btn => {
                btn.classList.remove('active', 'btn-success');
                btn.classList.add('btn-outline-success');
            });
            
            // Add active class to clicked button
            this.classList.remove('btn-outline-success');
            this.classList.add('btn-success', 'active');
            
            // Store selected amount and button
            selectedAmount = this.getAttribute('data-amount');
            selectedButton = this;
            
            // Hide custom amount section
            document.getElementById('customAmountSection').style.display = 'none';
            
            // Show donate button
            document.getElementById('donateButton').style.display = 'block';
        });
    });
});

function processDonation() {
    let amount = selectedAmount;
    let userEmail = document.getElementById('donorEmail').value;
    
    // Check if custom amount is being used
    const customAmount = document.getElementById('customAmount').value;
    if (customAmount && document.getElementById('customAmountSection').style.display === 'block') {
        amount = customAmount;
        if (amount < 100) {
            alert('Minimum donation amount is ₦100');
            return;
        }
    }
    
    // Validate email if provided
    if (userEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userEmail)) {
            alert('Please enter a valid email address');
            return;
        }
    } else {
        userEmail = 'user@example.com'; // Fallback email
    }
    
    // Initialize Flutterwave payment
    makeFlutterwavePayment(amount, userEmail);
}

// Flutterwave Payment Integration
function makeFlutterwavePayment(amount, userEmail) {
    console.log('Starting Flutterwave payment for amount:', amount, 'Email:', userEmail);
    
    // Check if Flutterwave is loaded
    if (typeof FlutterwaveCheckout === 'undefined') {
        alert('Payment service not available. Please refresh the page.');
        return;
    }
    
    const FLW_PUBLIC_KEY = 'FLWPUBK_TEST-8fba06d0c4afaadbc8b0a0764e93994a-X';
    
    FlutterwaveCheckout({
        public_key: FLW_PUBLIC_KEY,
        tx_ref: 'NGTAX-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        amount: amount,
        currency: 'NGN',
        payment_options: 'card, banktransfer, ussd',
        customer: {
            email: userEmail,
            name: 'Donor'
        },
        customizations: {
            title: 'NGTaxCalculator Donation',
            description: 'Support for Free Tax Calculator Tool',
            logo: 'https://ngtaxcalculator.online/assets/img/webmasLogo.png'
        },
        callback: function(response) {
            console.log('Flutterwave callback:', response);
            
            // Handle successful payment
            if (response.status === 'successful') {
                // Close donation modal
                const donationModal = document.getElementById('donationModal');
                if (donationModal) {
                    const modal = bootstrap.Modal.getInstance(donationModal);
                    if (modal) modal.hide();
                }
                
                // Show thank you modal
                showThankYouModal(response.transaction_id, amount, userEmail);
                
                // You can send payment data to your server here
                // sendPaymentDataToServer(response);
            } else {
                alert('Payment not completed. Status: ' + response.status);
            }
        },
        onclose: function() {
            console.log('Payment modal closed by user');
        }
    });
}

function showThankYouModal(transactionId, amount, email) {
    // Update modal content
    document.getElementById('thankYouAmount').textContent = amount;
    document.getElementById('thankYouTransactionId').textContent = transactionId;
    document.getElementById('thankYouEmail').textContent = email;
    
    // Show the thank you modal
    const thankyouModal = new bootstrap.Modal(document.getElementById('thankyouModal'));
    thankyouModal.show();
}

// Helper function to copy transaction ID
function copyTransactionId() {
    const transactionId = document.getElementById('thankYouTransactionId').textContent;
    navigator.clipboard.writeText(transactionId).then(() => {
        alert('Transaction ID copied to clipboard!');
    });
}

// Test function
window.testDonation = function() {
    console.log('=== Testing Donation System ===');
    showDonationOptions();
};
