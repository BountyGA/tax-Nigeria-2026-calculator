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
                <script>
                    var atOptions = {
                        'key' : '0cd6bb701cac56f0b48f551f9e4d6e96',
                        'format' : 'iframe',
                        'height' : 90,
                        'width' : 728,
                        'params' : {}
                    };
                </script>
            `
        },
        rectangle: {
            id: 'ad-banner-2',
            size: '300x250',
            scriptUrl: 'https://www.highperformanceformat.com/0b243d13a2f3cae304512edc8e163052/invoke.js',
            scriptConfig: `
                <script>
                    var atOptions = {
                        'key' : '0b243d13a2f3cae304512edc8e163052',
                        'format' : 'iframe',
                        'height' : 250,
                        'width' : 300,
                        'params' : {}
                    };
                </script>
            `
        }
    }
};

function loadAd(adType) {
    console.log(`Loading ad: ${adType}`);
    const adConfig = AD_CONFIG.banners[adType];
    console.log('Ad config:', adConfig);
    
    const adConfig = AD_CONFIG.banners[adType];
    if (!adConfig) return;
    
    const container = document.getElementById(adConfig.id);
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    // Add the config script
    const configScript = document.createElement('script');
    configScript.innerHTML = adConfig.scriptConfig;
    container.appendChild(configScript);
    
    // Add the main script
    const mainScript = document.createElement('script');
    mainScript.src = adConfig.scriptUrl;
    mainScript.async = true;
    container.appendChild(mainScript);
    
    console.log(`✅ Ad loaded: ${adType}`);
}

// Initialize ads immediately
function initAds() {
    // Load native ad first (if you have one)
    // loadAd('native');
    
    // Load leaderboard immediately
    setTimeout(() => loadAd('leaderboard'), 1000);
    
    // Setup calculation trigger
    const calcBtn = document.getElementById('calcBtn');
    if (calcBtn) {
        calcBtn.addEventListener('click', function() {
            // Load rectangle ad after calculation
            setTimeout(() => loadAd('rectangle'), 500);
        });
    }
}

// Call initAds when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAds);
} else {
    initAds();
}
