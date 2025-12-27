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
    // Replace with your actual Flutterwave public key
    const FLW_PUBLIC_KEY = 'FLWPUBK_TEST-8fba06d0c4afaadbc8b0a0764e93994a-X';
    
    FlutterwaveCheckout({
        public_key: FLW_PUBLIC_KEY,
        tx_ref: 'NGTAX-CALCULATOR' + Date.now(),
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
            logo: 'https://your-logo-url.com/logo.png'
        },
        callback: function(response) {
            // Handle successful payment
            if (response.status === 'successful') {
                $('#donationModal').modal('hide');
                showThankYouMessage(response.transaction_id, amount);
                
                // You can send payment data to your server here
                // sendPaymentDataToServer(response);
            }
        },
        onclose: function() {
            // Handle modal close
            console.log('Payment modal closed');
        }
    });
}

function showThankYouMessage(transactionId, amount) {
    alert(`Thank you for your donation of ₦${amount}! Transaction ID: ${transactionId}`);
    
    // Or show a more beautiful modal:
    /*
    const thankyouModal = new bootstrap.Modal(document.getElementById('thankyouModal'));
    document.getElementById('donationAmount').textContent = amount;
    document.getElementById('transactionId').textContent = transactionId;
    thankyouModal.show();
    */
}
