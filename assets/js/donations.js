console.log('✅ donations.js loaded successfully!');
console.log('showDonationOptions function exists:', typeof showDonationOptions === 'function');

let selectedAmount = 1000; // Default amount

function showDonationOptions() {
    console.log('Opening donation modal...');
    
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
    // Reset selected amount when choosing custom
    document.querySelectorAll('.donation-amount').forEach(btn => {
        btn.classList.remove('active', 'btn-success');
        btn.classList.add('btn-outline-success');
    });
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
            
            // Store selected amount
            selectedAmount = this.getAttribute('data-amount');
            
            // Hide custom amount section
            document.getElementById('customAmountSection').style.display = 'none';
        });
    });
});

function processDonation() {
    let amount = selectedAmount;
    
    // Check if custom amount is being used
    const customAmount = document.getElementById('customAmount').value;
    if (customAmount && document.getElementById('customAmountSection').style.display === 'block') {
        amount = customAmount;
        if (amount < 100) {
            alert('Minimum donation amount is ₦100');
            return;
        }
    }
    
    // Initialize Flutterwave payment
    makeFlutterwavePayment(amount);
}

// Flutterwave Payment Integration
function makeFlutterwavePayment(amount) {
    console.log('Starting Flutterwave payment for amount:', amount);
    
    // Check if Flutterwave is loaded
    if (typeof FlutterwaveCheckout === 'undefined') {
        alert('Payment service not available. Please refresh the page.');
        return;
    }
    
    const FLW_PUBLIC_KEY = 'FLWPUBK_TEST-8fba06d0c4afaadbc8b0a0764e93994a-X';
    
    FlutterwaveCheckout({
        public_key: FLW_PUBLIC_KEY,
        tx_ref: 'NGTAX-CALCULATOR-' + Date.now(),
        amount: amount,
        currency: 'NGN',
        payment_options: 'card, banktransfer, ussd',
        customer: {
            email: 'user@example.com', // You can collect this from user
            name: 'Donor'
        },
        customizations: {
            title: 'NGTaxCalculator Donation',
            description: 'Support for Free Web Tools',
            logo: 'https://ngtaxcalculator.online/assets/img/webmasLogo.png' // FIXED: Use your actual logo
        },
        callback: function(response) {
            console.log('Flutterwave callback:', response);
            
            // Handle successful payment
            if (response.status === 'successful') {
                // Close modal using Bootstrap 5 (FIXED: Removed jQuery)
                const modalElement = document.getElementById('donationModal');
                if (modalElement) {
                    const modal = bootstrap.Modal.getInstance(modalElement);
                    if (modal) {
                        modal.hide();
                    }
                }
                
                showThankYouMessage(response.transaction_id, amount);
                
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

function showThankYouMessage(transactionId, amount) {
    alert(`Thank you for your donation of ₦${amount}!\nTransaction ID: ${transactionId}\n\nA receipt has been sent to your email.`);
}

// Remove jQuery dependency - this is no longer needed
// Remove any $ signs from the code
