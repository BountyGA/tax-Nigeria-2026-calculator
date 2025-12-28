// assets/js/ads.js - Smart Ad Loading System

let adsLoaded = false;
let userCalculated = false;

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
    mainScript.onload = () => console.log(`✅ ${adType} script loaded`);
    mainScript.onerror = () => console.error(`❌ ${adType} script failed to load`);
    container.appendChild(mainScript);
    
    console.log(`✅ Ad loading initiated: ${adType} (${adConfig.size})`);
}

// Load all ads immediately
function loadAllAds() {
    if (adsLoaded) return;
    
    console.log('Loading all ads...');
    
    // Load native ad first
    loadAd('native');
    
    // Load leaderboard after short delay
    setTimeout(() => loadAd('leaderboard'), 500);
    
    // Load rectangle after a bit longer
    setTimeout(() => loadAd('rectangle'), 1500);
    
    adsLoaded = true;
}

// Initialize ads - ALL LOAD IMMEDIATELY
function initAds() {
    // Wait for page to be fully interactive
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(loadAllAds, 1000);
        });
    } else {
        setTimeout(loadAllAds, 1000);
    }
    
    // Optional: Reload rectangle ad when user calculates tax
    const calcBtn = document.getElementById('calcBtn');
    if (calcBtn) {
        calcBtn.addEventListener('click', function() {
            console.log('User calculated tax - refreshing rectangle ad');
            // Refresh rectangle ad after calculation
            setTimeout(() => {
                loadAd('rectangle');
            }, 1000);
        });
    }
}

// Alternative: Load ads based on visibility
function loadAdsWhenVisible() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const adId = entry.target.id;
                let adType = '';
                
                switch(adId) {
                    case 'ad-banner-1':
                        adType = 'leaderboard';
                        break;
                    case 'ad-banner-2':
                        adType = 'rectangle';
                        break;
                    case 'ad-native':
                        adType = 'native';
                        break;
                }
                
                if (adType) {
                    loadAd(adType);
                    observer.unobserve(entry.target); // Load only once
                }
            }
        });
    }, { threshold: 0.1 });
    
    // Observe each ad container
    ['ad-banner-1', 'ad-banner-2', 'ad-native'].forEach(id => {
        const element = document.getElementById(id);
        if (element) observer.observe(element);
    });
}

// Initialize ads - choose one method
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Method 1: Load all immediately
        initAds();
        
        // OR Method 2: Load when visible (better for performance)
        // loadAdsWhenVisible();
    });
} else {
    initAds();
    // OR: loadAdsWhenVisible();
}

// Make functions available globally
window.loadAd = loadAd;
window.loadAllAds = loadAllAds;
