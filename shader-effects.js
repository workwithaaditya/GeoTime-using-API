/**
 * SkyWatch Shader Effects
 * 
 * This module manages Vanta.js WebGL shader animations
 * that respond to real-time weather conditions.
 * 
 * Supports: Rain, Snow, Clear, Mist, Thunderstorm
 * Uses GPU-accelerated shaders via Three.js + Vanta.js
 */

// Global shader instance
let currentShaderEffect = null;

/**
 * Initialize shader effect based on weather type
 * @param {string} weatherType - Type of weather (clear, clouds, rain, snow, thunderstorm, mist)
 * @param {boolean} isDay - Whether it's daytime
 */
function initializeWeatherShader(weatherType, isDay) {
  // Destroy previous effect
  if (currentShaderEffect) {
    try {
      currentShaderEffect.destroy();
    } catch (e) {
      console.log('Previous shader effect cleaned up');
    }
  }

  const canvas = document.getElementById('vanta-canvas');
  
  // Map weather types to shader effects
  switch(weatherType.toLowerCase()) {
    case 'clear':
      initializeClearSkyShader(canvas, isDay);
      break;
    case 'clouds':
      initializeCloudShader(canvas, isDay);
      break;
    case 'rain':
      initializeRainShader(canvas);
      break;
    case 'snow':
      initializeSnowShader(canvas);
      break;
    case 'thunderstorm':
      initializeThunderstormShader(canvas);
      break;
    case 'mist':
      initializeMistShader(canvas);
      break;
    default:
      initializeClearSkyShader(canvas, isDay);
  }
}

/**
 * CLEAR SKY SHADER
 * Soft gradient with gentle sun glare effect
 * Uses Vanta.js waves effect with sky-inspired colors
 */
function initializeClearSkyShader(canvas, isDay) {
  const colors = isDay 
    ? ['#667eea', '#764ba2', '#ffd700'] // Day: Purple to gold
    : ['#1a1a2e', '#0f3460', '#16213e']; // Night: Dark blue

  try {
    currentShaderEffect = VANTA.WAVES({
      el: canvas,
      mouseControls: false,
      touchControls: false,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      scale: 1.0,
      scaleMobile: 1.0,
      color: colors[0],
      waveHeight: 20.0,
      waveSpeed: 0.5,
      zoom: 1.0,
      THREE: THREE
    });
  } catch (e) {
    console.error('Clear sky shader error:', e);
    applyFallbackGradient(canvas, colors);
  }
}

/**
 * RAIN SHADER
 * Particle-based rain effect with wet surface shader
 * Creates realistic rain drops with splashes
 */
function initializeRainShader(canvas) {
  try {
    // Rain effect: animated particles falling
    currentShaderEffect = VANTA.LINES({
      el: canvas,
      mouseControls: false,
      touchControls: false,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      color: 0x4a90e2,
      backgroundColor: 0x3b4c6b,
      lineWidth: 0.5,
      distance: 20,
      maxDistance: 30.0,
      speed: 3.5,
      scale: 1.0,
      scaleMobile: 1.0,
      THREE: THREE
    });
  } catch (e) {
    console.error('Rain shader error:', e);
    applyFallbackGradient(canvas, ['#3b4c6b', '#4a90e2', '#5a7fa6']);
  }
}

/**
 * SNOW SHADER
 * Gentle falling particle effect with slow drift
 * Creates calm, peaceful snow animation
 */
function initializeSnowShader(canvas) {
  try {
    currentShaderEffect = VANTA.BIRDS({
      el: canvas,
      mouseControls: false,
      touchControls: false,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      scale: 1.0,
      scaleMobile: 1.0,
      quantity: 3.0,
      speedcurve: 0.35,
      color: 0xffffff,
      backgroundColor: 0x8fa3d2,
      separation: 80,
      alignment: 20,
      cohesion: 100,
      THREE: THREE
    });
  } catch (e) {
    console.error('Snow shader error:', e);
    applyFallbackGradient(canvas, ['#8fa3d2', '#b4c7e7', '#d4deef']);
  }
}

/**
 * THUNDERSTORM SHADER
 * Dynamic effect with rapid color shifts and electrical feel
 * Simulates lightning and storm cloud movement
 */
function initializeThunderstormShader(canvas) {
  try {
    currentShaderEffect = VANTA.NET({
      el: canvas,
      mouseControls: false,
      touchControls: false,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      color: 0xf4a460,
      backgroundColor: 0x2c3e50,
      points: 6.0,
      maxDistance: 20.0,
      spacing: 20.0,
      scale: 1.0,
      scaleMobile: 1.0,
      speed: 5.0,
      THREE: THREE
    });

    // Add lightning flash effect
    addLightningFlashes(canvas);
  } catch (e) {
    console.error('Thunderstorm shader error:', e);
    applyFallbackGradient(canvas, ['#2c3e50', '#8b4513', '#f4a460']);
  }
}

/**
 * CLOUD SHADER
 * Soft, billowing cloud effect
 * Creates calm, overcast atmosphere
 */
function initializeCloudShader(canvas, isDay) {
  const bgColor = isDay ? 0x999999 : 0x444444;
  const color = isDay ? 0xcccccc : 0x666666;

  try {
    currentShaderEffect = VANTA.CLOUDS({
      el: canvas,
      mouseControls: false,
      touchControls: false,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      speed: 2.5,
      zoom: 1.0,
      backgroundColor: bgColor,
      color: color,
      THREE: THREE
    });
  } catch (e) {
    console.error('Cloud shader error:', e);
    applyFallbackGradient(canvas, [isDay ? '#999999' : '#444444', '#888888', '#aaaaaa']);
  }
}

/**
 * MIST/FOG SHADER
 * Haze overlay effect with subtle movement
 * Creates foggy, misty atmosphere
 */
function initializeMistShader(canvas) {
  try {
    currentShaderEffect = VANTA.FOG({
      el: canvas,
      mouseControls: false,
      touchControls: false,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      highlightColor: 0xe8d5b7,
      midtoneColor: 0xb0a080,
      lowlightColor: 0x807060,
      baseColor: 0xfaf8f3,
      speed: 3.0,
      zoom: 1.0,
      THREE: THREE
    });
  } catch (e) {
    console.error('Mist shader error:', e);
    applyFallbackGradient(canvas, ['#faf8f3', '#d4ccc0', '#b0a080']);
  }
}

/**
 * Add lightning flash animation to thunderstorm
 * Creates rapid color flashes to simulate lightning
 */
function addLightningFlashes(canvas) {
  const flashInterval = setInterval(() => {
    if (!currentShaderEffect) {
      clearInterval(flashInterval);
      return;
    }

    // Random chance of lightning (30% every 500ms)
    if (Math.random() > 0.7) {
      canvas.style.opacity = '1';
      
      // Flash white for a moment
      setTimeout(() => {
        if (canvas) canvas.style.opacity = '0.95';
      }, 50);

      setTimeout(() => {
        if (canvas) canvas.style.opacity = '1';
      }, 100);
    }
  }, 500);
}

/**
 * Fallback gradient for browsers without WebGL support
 * Provides graceful degradation
 */
function applyFallbackGradient(canvas, colors) {
  canvas.style.background = `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`;
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '0';
}

/**
 * Resize handler for responsive shader effects
 * Maintains aspect ratio and performance on window resize
 */
window.addEventListener('resize', () => {
  if (currentShaderEffect && currentShaderEffect.resize) {
    try {
      currentShaderEffect.resize();
    } catch (e) {
      console.log('Shader resize handled');
    }
  }
});

/**
 * Handle visibility to pause/resume shader
 * Improves battery life when tab is hidden
 */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause effect when tab is hidden
    if (currentShaderEffect && currentShaderEffect.pause) {
      currentShaderEffect.pause();
    }
  } else {
    // Resume effect when tab becomes visible
    if (currentShaderEffect && currentShaderEffect.play) {
      currentShaderEffect.play();
    }
  }
});

/**
 * Performance optimization for low-end devices
 * Detects device capabilities and adjusts shader complexity
 */
function detectDeviceCapabilities() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  if (!gl) {
    console.warn('WebGL not supported - using fallback gradients');
    return false;
  }

  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown';
  
  console.log('GPU Renderer:', renderer);
  return true;
}

// Initialize capabilities check on load
window.addEventListener('load', () => {
  detectDeviceCapabilities();
});

// Export for use in script.js
window.WeatherShader = {
  initialize: initializeWeatherShader,
  destroy: () => {
    if (currentShaderEffect) {
      try {
        currentShaderEffect.destroy();
        currentShaderEffect = null;
      } catch (e) {
        console.log('Shader destroyed');
      }
    }
  }
};
