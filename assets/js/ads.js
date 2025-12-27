// assets/js/ads.js - Smart Ad Loading System

let adsLoaded = false;
let userCalculated = false;

// Ad configurations with YOUR actual codes
const AD_CONFIG = {
    banners: {
        leaderboard: {
            id: 'ad-banner-1',
            size: '728x90',
            code: `
                <!-- Adsterra 728x90 Leaderboard -->
                <script>
                    atOptions = {
                        'key' : '0cd6bb701cac56f0b48f551f9e4d6e96',
                        'format' : 'iframe',
                        'height' : 90,
                        'width' : 728,
                        'params' : {}
                    };
                </script>
                <script src="https://www.highperformanceformat.com/0cd6bb701cac56f0b48f551f9e4d6e96/invoke.js"></script>
            `
        },
        native: {
            id: 'ad-native',
            size: 'responsive',
            code: `
                <!-- Adsterra Native Banner -->
                <script async="async" data-cfasync="false" src="https://pl28347960.effectivegatecpm.com/fae8171233a5b4abb7632af78c65d028/invoke.js"></script>
                <div id="container-fae8171233a5b4abb7632af78c65d028"></div>
            `
        },
        rectangle: {
            id: 'ad-banner-2',
            size: '300x250',
            code: `
                <!-- Adsterra 300x250 Rectangle -->
                <script>
                    atOptions = {
                        'key' : '0b243d13a2f3cae304512edc8e163052',
                        'format' : 'iframe',
                        'height' : 250,
                        'width' : 300,
                        'params' : {}
                    };
                </script>
                <script src="https://www.highperformanceformat.com/0b243d13a2f3cae304512edc8e163052/invoke.js"></script>
            `
        }
    }
};

// Initialize ads after page load
function initAds() {
    // Wait for page to be fully interactive
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadInitialAds);
    } else {
        setTimeout(loadInitialAds, 1000);
    }
    
    // Track when user calculates tax
    setupAdTriggers();
}

// Load initial non-intrusive ads
function loadInitialAds() {
    if (adsLoaded) return;
    
    // Load native ad immediately (blends better)
    loadAd('native');
    
    // Load leaderboard after 3 seconds
    setTimeout(() => {
        loadAd('leaderboard');
    }, 3000);
    
    adsLoaded = true;
}

// Load specific ad
function loadAd(adType) {
    const adConfig = AD_CONFIG.banners[adType];
    if (!adConfig) return;
    
    const container = document.getElementById(adConfig.id);
    if (!container) return;
    
    // Check if ad blocker might be active
    if (isAdBlockerActive()) {
        container.innerHTML = `
            <div class="alert alert-info">
                <small>❤️ Support this free tool by <a href="#" onclick="window.open('https://flutterwave.com/donate/olhhohnh1vat', '_blank')">making a donation</a> or whitelisting ads.</small>
            </div>
        `;
        return;
    }
    
    // Clear container and load the ad
    container.innerHTML = adConfig.code;
    
    // Track ad load
    console.log(`✅ Ad loaded: ${adType} (${adConfig.size})`);
}

// Load ads after user calculates tax
function loadAdsAfterCalculation() {
    if (!userCalculated) {
        userCalculated = true;
        
        // Load rectangle ad after calculation
        setTimeout(() => {
            loadAd('rectangle');
            
            // Show donation section after ad
            setTimeout(() => {
                const donationSection = document.querySelector('.container.mt-5');
                if (donationSection) {
                    donationSection.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                }
            }, 1000);
        }, 1500);
    }
}

// Check for ad blockers
function isAdBlockerActive() {
    const testAd = document.createElement('div');
    testAd.innerHTML = '&nbsp;';
    testAd.className = 'adsbox';
    testAd.style.cssText = 'position:absolute;top:-999px;left:-999px;width:1px;height:1px;overflow:hidden;visibility:hidden;';
    document.body.appendChild(testAd);
    
    let isBlocked = false;
    setTimeout(() => {
        if (testAd.offsetHeight === 0 || testAd.clientHeight === 0 || testAd.style.display === 'none') {
            isBlocked = true;
        }
        document.body.removeChild(testAd);
    }, 200);
    
    return isBlocked;
}

// Setup triggers for ads
function setupAdTriggers() {
    // When calculate button is clicked
    const calcBtn = document.getElementById('calcBtn');
    if (calcBtn) {
        calcBtn.addEventListener('click', function() {
            setTimeout(loadAdsAfterCalculation, 1000);
        });
    }
    
    // When sample data is loaded
    const sampleBtn = document.querySelector('button[onclick*="fillSampleData"]');
    if (sampleBtn) {
        sampleBtn.addEventListener('click', function() {
            setTimeout(loadAdsAfterCalculation, 1000);
        });
    }
    
    // When guide is downloaded
    const guideLink = document.querySelector('a[onclick*="downloadPDF"]');
    if (guideLink) {
        guideLink.addEventListener('click', function() {
            setTimeout(() => loadAd('rectangle'), 2000);
        });
    }
}

// Make functions available globally
window.initAds = initAds;
window.loadAdsAfterCalculation = loadAdsAfterCalculation;

// Start ad system
initAds();
