// Adsterra Ads Implementation
let adsInitialized = false;

function initializeAds() {
    if (adsInitialized) return;
    
    // Only show ads after user interaction or after calculation
    setTimeout(() => {
        loadBannerAds();
        loadNativeAds();
        adsInitialized = true;
    }, 3000);
}

function loadBannerAds() {
    // Adsterra Banner Ad - Top
    const bannerTop = document.createElement('div');
    bannerTop.id = 'container-9c1d5c56ebd5484b3e7c5b8e6e9c8d16';
    bannerTop.className = 'adsterra-banner mb-4';
    bannerTop.style.cssText = 'min-height: 250px; width: 100%; display: flex; justify-content: center; align-items: center; background: #f8f9fa; border-radius: 8px; border: 1px dashed #dee2e6;';
    
    const bannerTopParent = document.querySelector('.hero-section');
    if (bannerTopParent) {
        bannerTopParent.parentNode.insertBefore(bannerTop, bannerTopParent.nextSibling);
        
        // Adsterra script for banner
        const script1 = document.createElement('script');
        script1.textContent = `
            atOptions = {
                'key' : '9c1d5c56ebd5484b3e7c5b8e6e9c8d16',
                'format' : 'iframe',
                'height' : 250,
                'width' : 300,
                'params' : {}
            };
        `;
        document.head.appendChild(script1);
        
        const script2 = document.createElement('script');
        script2.src = '//www.highperformanceformat.com/9c1d5c56ebd5484b3e7c5b8e6e9c8d16/invoke.js';
        document.head.appendChild(script2);
    }
    
    // Adsterra Banner Ad - Bottom
    const bannerBottom = document.createElement('div');
    bannerBottom.id = 'container-a1b2c3d4e5f67890abcdef1234567890';
    bannerBottom.className = 'adsterra-banner mt-4';
    bannerBottom.style.cssText = 'min-height: 250px; width: 100%; display: flex; justify-content: center; align-items: center; background: #f8f9fa; border-radius: 8px; border: 1px dashed #dee2e6;';
    
    const footer = document.querySelector('.footer');
    if (footer) {
        footer.parentNode.insertBefore(bannerBottom, footer);
        
        // Second banner ad
        const script3 = document.createElement('script');
        script3.textContent = `
            atOptions = {
                'key' : 'a1b2c3d4e5f67890abcdef1234567890',
                'format' : 'iframe',
                'height' : 250,
                'width' : 300,
                'params' : {}
            };
        `;
        document.head.appendChild(script3);
        
        const script4 = document.createElement('script');
        script4.src = '//www.highperformanceformat.com/a1b2c3d4e5f67890abcdef1234567890/invoke.js';
        document.head.appendChild(script4);
    }
}

function loadNativeAds() {
    // Native ad in sidebar
    const quickGuide = document.querySelector('.card.border-primary.h-100 .card-body');
    if (quickGuide) {
        const nativeAd = document.createElement('div');
        nativeAd.id = 'container-native-ad';
        nativeAd.className = 'native-ad mt-4 p-3';
        nativeAd.style.cssText = 'background: #f8f9fa; border-radius: 8px; border: 1px dashed #dee2e6;';
        nativeAd.innerHTML = `
            <div class="text-center">
                <small class="text-muted">ADVERTISEMENT</small>
                <p class="mb-2">Looking for a Tax Consultant?</p>
                <a href="#" class="btn btn-sm btn-outline-primary">Find One Now</a>
            </div>
        `;
        
        quickGuide.appendChild(nativeAd);
        
        // Native ad script (replace with actual Adsterra native ad code)
        const nativeScript = document.createElement('script');
        nativeScript.textContent = `
            // Native ad code from Adsterra will go here
            // You'll get this from your Adsterra dashboard
        `;
        document.head.appendChild(nativeScript);
    }
}

// Show ads after user calculates tax (user engagement)
function showAdsOnEngagement() {
    if (!adsInitialized) {
        initializeAds();
    }
}

// Call this function after tax calculation
function showAdsAfterCalculation() {
    setTimeout(() => {
        showAdsOnEngagement();
    }, 1000);
}

// Initialize ads on page load (delayed)
setTimeout(() => {
    initializeAds();
}, 5000); // Show ads 5 seconds after page load

// Make functions available globally
window.showAdsAfterCalculation = showAdsAfterCalculation;
