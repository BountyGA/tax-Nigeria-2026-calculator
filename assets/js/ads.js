// assets/js/ads.js - Smart Ad Loading System (Hybrid Approach)
// Leaderboard loads immediately, other ads load when visible

let adsLoaded = {
    'leaderboard': false,
    'rectangle': false,
    'native': false
};

// Ad configurations with YOUR actual codes
const AD_CONFIG = {
    banners: {
        leaderboard: {
            id: 'ad-banner-1',
            size: '728x90',
            scriptUrl: 'https://www.highperformanceformat.com/0cd6bb701cac56f0b48f551f9e4d6e96/invoke.js',
            scriptConfig: `
                var atOptions = {
                    'key' : '0cd6bb701cac56f0b48f551f9e4d6e96',
                    'format' : 'iframe',
                    'height' : 90,
                    'width' : 728,
                    'params' : {}
                };
            `
        },
        rectangle: {
            id: 'ad-banner-2',
            size: '300x250',
            scriptUrl: 'https://www.highperformanceformat.com/0b243d13a2f3cae304512edc8e163052/invoke.js',
            scriptConfig: `
                var atOptions = {
                    'key' : '0b243d13a2f3cae304512edc8e163052',
                    'format' : 'iframe',
                    'height' : 250,
                    'width' : 300,
                    'params' : {}
                };
            `
        },
        native: {
            id: 'ad-native',
            size: 'responsive',
            scriptUrl: 'https://pl28347960.effectivegatecpm.com/fae8171233a5b4abb7632af78c65d028/invoke.js',
            scriptConfig: '',
            container: '<div id="container-fae8171233a5b4abb7632af78c65d028"></div>'
        }
    }
};

function loadAd(adType) {
    // Don't reload if already loaded
    if (adsLoaded[adType]) {
        console.log(`⚠️ ${adType} ad already loaded, skipping...`);
        return;
    }
    
    console.log(`Loading ad: ${adType}`);
    const adConfig = AD_CONFIG.banners[adType];
    
    if (!adConfig) {
        console.error(`No config found for ad type: ${adType}`);
        return;
    }
    
    const container = document.getElementById(adConfig.id);
    if (!container) {
        console.error(`Container not found: ${adConfig.id}`);
        return;
    }
    
    // Clear container
    container.innerHTML = '';
    
    // For native ad, add container first
    if (adConfig.container) {
        container.innerHTML = adConfig.container;
    }
    
    // Add the config script to global scope
    if (adConfig.scriptConfig) {
        const configScript = document.createElement('script');
        configScript.textContent = adConfig.scriptConfig;
        document.head.appendChild(configScript);
    }
    
    // Add the main script
    const mainScript = document.createElement('script');
    mainScript.src = adConfig.scriptUrl;
    mainScript.async = true;
    mainScript.onload = () => {
        console.log(`✅ ${adType} ad loaded successfully`);
        adsLoaded[adType] = true;
    };
    mainScript.onerror = (error) => {
        console.error(`❌ ${adType} ad failed to load:`, error);
        // Show fallback message
        container.innerHTML = `
            <div class="alert alert-info p-2">
                <small><i class="bi bi-heart me-1"></i> Support free tools like this by whitelisting ads.</small>
            </div>
        `;
    };
    container.appendChild(mainScript);
    
    console.log(`⏳ Ad loading initiated: ${adType} (${adConfig.size})`);
}

// HYBRID APPROACH: Leaderboard loads immediately, others load when visible
function initHybridAds() {
    console.log('Initializing hybrid ad loading...');
    
    // 1. LOAD LEADERBOARD IMMEDIATELY (after 0.5s delay)
    setTimeout(() => {
        loadAd('leaderboard');
    }, 500);
    
    // 2. SETUP LAZY LOADING FOR OTHER ADS
    const lazyAdObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const adId = entry.target.id;
                let adType = '';
                
                switch(adId) {
                    case 'ad-banner-2':
                        adType = 'rectangle';
                        break;
                    case 'ad-native':
                        adType = 'native';
                        break;
                }
                
                if (adType && !adsLoaded[adType]) {
                    console.log(`${adType} ad entered viewport, loading...`);
                    loadAd(adType);
                    lazyAdObserver.unobserve(entry.target); // Load only once
                }
            }
        });
    }, { 
        threshold: 0.1, // Load when 10% visible
        rootMargin: '50px' // Start loading 50px before entering viewport
    });
    
    // Observe lazy-load ads
    const lazyAdIds = ['ad-banner-2', 'ad-native'];
    lazyAdIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            lazyAdObserver.observe(element);
            console.log(`Observing ${id} for lazy loading`);
        }
    });
    
    // 3. REFRESH ADS ON USER INTERACTION
    setupAdRefreshOnInteraction();
}

// Setup ad refresh when user interacts with calculator
function setupAdRefreshOnInteraction() {
    // Refresh rectangle ad when user calculates tax
    const calcBtn = document.getElementById('calcBtn');
    if (calcBtn) {
        calcBtn.addEventListener('click', function() {
            console.log('User calculated tax - refreshing rectangle ad in 3s...');
            setTimeout(() => {
                // Only refresh if rectangle ad is loaded
                if (adsLoaded['rectangle']) {
                    console.log('Refreshing rectangle ad...');
                    adsLoaded['rectangle'] = false; // Reset flag
                    loadAd('rectangle');
                }
            }, 3000);
        });
    }
    
    // Also refresh on sample data click
    const sampleBtn = document.querySelector('button[onclick*="fillSampleData"]');
    if (sampleBtn) {
        sampleBtn.addEventListener('click', function() {
            setTimeout(() => {
                if (adsLoaded['rectangle']) {
                    adsLoaded['rectangle'] = false;
                    loadAd('rectangle');
                }
            }, 2000);
        });
    }
}

// Fallback: If IntersectionObserver is not supported, load all after delay
function loadAllAdsFallback() {
    console.log('Using fallback ad loading...');
    loadAd('leaderboard');
    setTimeout(() => loadAd('rectangle'), 2000);
    setTimeout(() => loadAd('native'), 3000);
}

// Initialize ads when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Check if IntersectionObserver is supported
        if ('IntersectionObserver' in window) {
            initHybridAds();
        } else {
            // Fallback for older browsers
            loadAllAdsFallback();
        }
    });
} else {
    // DOM already loaded
    if ('IntersectionObserver' in window) {
        initHybridAds();
    } else {
        loadAllAdsFallback();
    }
}

// Debug function to check ad status
window.checkAdStatus = function() {
    console.log('📊 Ad Loading Status:');
    console.log('- Leaderboard:', adsLoaded['leaderboard'] ? '✅ Loaded' : '❌ Not loaded');
    console.log('- Rectangle:', adsLoaded['rectangle'] ? '✅ Loaded' : '❌ Not loaded');
    console.log('- Native:', adsLoaded['native'] ? '✅ Loaded' : '❌ Not loaded');
};

// Make functions available globally
window.loadAd = loadAd;
window.refreshAds = function() {
    console.log('Refreshing all ads...');
    adsLoaded = { leaderboard: false, rectangle: false, native: false };
    loadAd('leaderboard');
    setTimeout(() => loadAd('rectangle'), 1000);
    setTimeout(() => loadAd('native'), 2000);
};
