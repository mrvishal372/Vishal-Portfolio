import * as THREE from 'three';

const textureCache = new Map<string, THREE.Texture>();

export function generatePlanetTexture(name: string): THREE.Texture {
  if (textureCache.has(name)) {
    return textureCache.get(name)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  if (name === 'Earth') {
    canvas.width = 4096;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d')!;

    // 1. Ocean Base (Crisp Deep & Azure Waters as seen from Satellite)
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    oceanGrad.addColorStop(0.0, '#031934');
    oceanGrad.addColorStop(0.2, '#0284c7');
    oceanGrad.addColorStop(0.5, '#0369a1');
    oceanGrad.addColorStop(0.8, '#0284c7');
    oceanGrad.addColorStop(1.0, '#031934');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Coastal Shallow Water Shelf Glow (Satellite Blue Coral Reefs)
    const drawCoastalShelf = (cx: number, cy: number, rx: number, ry: number) => {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx * 1.06, ry * 1.06, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    // 2. Continents (4K High Precision Topography)
    const drawLandmass = (cx: number, cy: number, rx: number, ry: number, color: string, detail = 48) => {
      drawCoastalShelf(cx, cy, rx, ry);

      ctx.fillStyle = color;
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 2; a += Math.PI / detail) {
        const rNoise = 1 + (Math.sin(a * 8) * 0.10 + Math.cos(a * 14) * 0.06 + Math.sin(a * 22) * 0.03);
        const x = cx + Math.cos(a) * rx * rNoise;
        const y = cy + Math.sin(a) * ry * rNoise;
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    };

    // Asia & India
    drawLandmass(canvas.width * 0.72, canvas.height * 0.38, 540, 330, '#15803d', 60);
    // Indian Subcontinent Peninsula (Sharp High Detail)
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.70, canvas.height * 0.38);
    ctx.lineTo(canvas.width * 0.74, canvas.height * 0.38);
    ctx.lineTo(canvas.width * 0.72, canvas.height * 0.53);
    ctx.closePath();
    ctx.fill();
    // Thar & Middle East Deserts
    drawLandmass(canvas.width * 0.62, canvas.height * 0.42, 230, 160, '#d97706', 40);

    // Africa
    drawLandmass(canvas.width * 0.52, canvas.height * 0.52, 330, 370, '#166534', 50);
    // Sahara Desert
    drawLandmass(canvas.width * 0.52, canvas.height * 0.38, 310, 150, '#b45309', 40);

    // Europe
    drawLandmass(canvas.width * 0.52, canvas.height * 0.26, 230, 150, '#22c55e', 40);

    // North America
    drawLandmass(canvas.width * 0.25, canvas.height * 0.30, 430, 270, '#15803d', 50);

    // South America
    drawLandmass(canvas.width * 0.32, canvas.height * 0.62, 270, 350, '#166534', 45);

    // Australia
    drawLandmass(canvas.width * 0.84, canvas.height * 0.70, 200, 160, '#c2410c', 36);

    // Fine Island Chains (Greenland, Madagascar, Indonesia, UK, Japan)
    drawLandmass(canvas.width * 0.38, canvas.height * 0.16, 120, 160, '#e0f2fe', 30); // Greenland
    drawLandmass(canvas.width * 0.58, canvas.height * 0.66, 30, 80, '#15803d', 20); // Madagascar
    drawLandmass(canvas.width * 0.78, canvas.height * 0.56, 140, 50, '#15803d', 30); // Indonesia
    drawLandmass(canvas.width * 0.48, canvas.height * 0.24, 30, 50, '#22c55e', 20); // UK & Ireland
    drawLandmass(canvas.width * 0.84, canvas.height * 0.34, 25, 70, '#16a34a', 20); // Japan

    // 3. Polar Ice Caps (Pure 4K White Crisp Satellite Style)
    const northIce = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.12);
    northIce.addColorStop(0, '#ffffff');
    northIce.addColorStop(0.8, '#f0f9ff');
    northIce.addColorStop(1, 'rgba(240, 249, 255, 0)');
    ctx.fillStyle = northIce;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.12);

    const southIce = ctx.createLinearGradient(0, canvas.height * 0.88, 0, canvas.height);
    southIce.addColorStop(0, 'rgba(240, 249, 255, 0)');
    southIce.addColorStop(0.2, '#f0f9ff');
    southIce.addColorStop(1, '#ffffff');
    ctx.fillStyle = southIce;
    ctx.fillRect(0, canvas.height * 0.88, canvas.width, canvas.height * 0.12);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    textureCache.set(name, texture);
    return texture;
  } else if (name === 'Mars') {
    // HD Satellite Mars (Rusty Red, Dark Basaltic Canyons, Polar Caps)
    const marsGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    marsGrad.addColorStop(0.0, '#8c2e11');
    marsGrad.addColorStop(0.2, '#c1440e');
    marsGrad.addColorStop(0.5, '#d1531d');
    marsGrad.addColorStop(0.8, '#b83b14');
    marsGrad.addColorStop(1.0, '#7a250c');
    ctx.fillStyle = marsGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dark Basaltic Plains
    ctx.fillStyle = 'rgba(45, 18, 10, 0.45)';
    for (let i = 0; i < 40; i++) {
      const cx = Math.random() * canvas.width;
      const cy = canvas.height * 0.3 + Math.random() * (canvas.height * 0.4);
      const rx = Math.random() * 180 + 60;
      const ry = Math.random() * 100 + 40;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    // Valles Marineris Canyon Streaks
    ctx.strokeStyle = 'rgba(30, 10, 5, 0.7)';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.3, canvas.height * 0.55);
    ctx.bezierCurveTo(canvas.width * 0.4, canvas.height * 0.58, canvas.width * 0.5, canvas.height * 0.52, canvas.width * 0.6, canvas.height * 0.56);
    ctx.stroke();

    // Polar Ice Caps
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(canvas.width * 0.5, 20, 300, 35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(canvas.width * 0.5, canvas.height - 20, 250, 30, 0, 0, Math.PI * 2);
    ctx.fill();

  } else if (name === 'Jupiter') {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0.0, '#4a3224');
    gradient.addColorStop(0.1, '#9e7b64');
    gradient.addColorStop(0.2, '#d6c0a7');
    gradient.addColorStop(0.3, '#7c5a45');
    gradient.addColorStop(0.45, '#cba98b');
    gradient.addColorStop(0.55, '#f0ded0');
    gradient.addColorStop(0.65, '#997157');
    gradient.addColorStop(0.75, '#d9be9c');
    gradient.addColorStop(0.85, '#634431');
    gradient.addColorStop(1.0, '#3d2618');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 600; i++) {
      const y = Math.random() * canvas.height;
      const x = Math.random() * canvas.width;
      const w = Math.random() * 120 + 30;
      const h = Math.random() * 8 + 2;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.12)' : 'rgba(80, 40, 20, 0.15)';
      ctx.fillRect(x, y, w, h);
    }

    const grsX = canvas.width * 0.65;
    const grsY = canvas.height * 0.68;
    const grsGrad = ctx.createRadialGradient(grsX, grsY, 5, grsX, grsY, 60);
    grsGrad.addColorStop(0, '#bd391b');
    grsGrad.addColorStop(0.5, '#d4572c');
    grsGrad.addColorStop(0.8, '#aa4221');
    grsGrad.addColorStop(1, 'rgba(160, 90, 50, 0)');
    ctx.fillStyle = grsGrad;
    ctx.beginPath();
    ctx.ellipse(grsX, grsY, 65, 36, 0, 0, Math.PI * 2);
    ctx.fill();

  } else if (name === 'Moon') {
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // 1. Lunar Highland Anorthosite Base (Silvery-grey regolith with natural noise)
    ctx.fillStyle = '#9aa0a6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Multi-layer regolith noise
    for (let i = 0; i < 25000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const r = Math.random() * 2 + 0.5;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(50, 50, 54, 0.18)' : 'rgba(230, 230, 235, 0.22)';
      ctx.fillRect(x, y, r, r);
    }

    // 2. Iconic Dark Lunar Maria (Basaltic Volcanic Plains)
    const drawMare = (cx: number, cy: number, rx: number, ry: number, roughness = 0.25) => {
      ctx.fillStyle = '#44474f';
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 32) {
        const noise = 1 + (Math.sin(a * 7) * 0.15 + Math.cos(a * 13) * 0.1) * roughness;
        const x = cx + Math.cos(a) * rx * noise;
        const y = cy + Math.sin(a) * ry * noise;
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();

      // Inner darker basalt depth
      ctx.fillStyle = '#34373d';
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 24) {
        const noise = 1 + Math.sin(a * 5) * 0.12;
        const x = cx + Math.cos(a) * (rx * 0.65) * noise;
        const y = cy + Math.sin(a) * (ry * 0.65) * noise;
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    };

    // Oceanus Procellarum (Ocean of Storms)
    drawMare(canvas.width * 0.26, canvas.height * 0.46, 210, 250, 0.35);
    // Mare Imbrium (Sea of Rains)
    drawMare(canvas.width * 0.35, canvas.height * 0.30, 160, 130, 0.2);
    // Mare Serenitatis (Sea of Serenity)
    drawMare(canvas.width * 0.48, canvas.height * 0.34, 120, 110, 0.18);
    // Mare Tranquillitatis (Sea of Tranquility - Apollo 11)
    drawMare(canvas.width * 0.54, canvas.height * 0.44, 135, 115, 0.22);
    // Mare Crisium (Sea of Crises)
    drawMare(canvas.width * 0.68, canvas.height * 0.36, 85, 75, 0.15);
    // Mare Fecunditatis & Nectaris
    drawMare(canvas.width * 0.60, canvas.height * 0.56, 110, 100, 0.25);
    drawMare(canvas.width * 0.52, canvas.height * 0.64, 75, 70, 0.2);
    // Mare Nubium & Humorum
    drawMare(canvas.width * 0.32, canvas.height * 0.64, 110, 95, 0.22);
    drawMare(canvas.width * 0.22, canvas.height * 0.68, 65, 60, 0.15);

    // 3. Iconic High-Albedo Impact Craters with Ray Systems
    const drawCraterWithRays = (cx: number, cy: number, radius: number, rayCount = 12, rayLength = 220) => {
      ctx.strokeStyle = 'rgba(245, 245, 250, 0.32)';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
        const len = rayLength * (0.7 + Math.random() * 0.6);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
        ctx.stroke();
      }

      const grad = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius * 2.5);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      grad.addColorStop(0.5, 'rgba(230, 230, 240, 0.35)');
      grad.addColorStop(1, 'rgba(200, 200, 210, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(30, 32, 38, 0.75)';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.25, 0, Math.PI * 2);
      ctx.fill();
    };

    // Tycho Crater (Southern Moon, massive ray system)
    drawCraterWithRays(canvas.width * 0.38, canvas.height * 0.78, 18, 24, 450);
    // Copernicus Crater
    drawCraterWithRays(canvas.width * 0.32, canvas.height * 0.44, 15, 18, 300);
    // Kepler
    drawCraterWithRays(canvas.width * 0.24, canvas.height * 0.42, 10, 14, 200);
    // Aristarchus (Brightest spot on the Moon)
    drawCraterWithRays(canvas.width * 0.20, canvas.height * 0.34, 12, 12, 180);

    // Minor craters scattered across the highlands
    for (let i = 0; i < 280; i++) {
      const cx = Math.random() * canvas.width;
      const cy = Math.random() * canvas.height;
      const r = Math.random() * 7 + 2;
      ctx.fillStyle = 'rgba(35, 36, 40, 0.5)';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(cx - r * 0.2, cy - r * 0.2, r * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (name === 'Saturn') {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0.0, '#8c7a56');
    gradient.addColorStop(0.2, '#d4c296');
    gradient.addColorStop(0.4, '#f2e2be');
    gradient.addColorStop(0.6, '#bfa87a');
    gradient.addColorStop(0.8, '#e6d3a8');
    gradient.addColorStop(1.0, '#8c7a56');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

  } else if (name === 'Mercury') {
    ctx.fillStyle = '#6e6e6e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 20000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const r = Math.random() * 2.5 + 0.5;
      ctx.fillStyle = Math.random() > 0.6 ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (name === 'Venus') {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f5e4c4');
    gradient.addColorStop(0.5, '#e3be86');
    gradient.addColorStop(1, '#ab7c44');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

  } else if (name === 'Uranus') {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0.0, '#aee7f0');
    gradient.addColorStop(0.5, '#72c6d4');
    gradient.addColorStop(1.0, '#4eaab9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

  } else if (name === 'Neptune') {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0.0, '#3863e0');
    gradient.addColorStop(0.5, '#1e44b8');
    gradient.addColorStop(1.0, '#102d8c');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(10, 25, 80, 0.6)';
    ctx.beginPath();
    ctx.ellipse(canvas.width * 0.4, canvas.height * 0.5, 45, 25, 0, 0, Math.PI * 2);
    ctx.fill();

  } else {
    ctx.fillStyle = '#888888';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  textureCache.set(name, texture);
  return texture;
}

export function generateEarthCloudsTexture(): THREE.Texture {
  if (textureCache.has('EarthClouds')) {
    return textureCache.get('EarthClouds')!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  for (let i = 0; i < 800; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const rx = Math.random() * 90 + 20;
    const ry = Math.random() * 25 + 5;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, (Math.random() - 0.5) * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  textureCache.set('EarthClouds', texture);
  return texture;
}

export function generateRingTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1;
  const ctx = canvas.getContext('2d')!;
  
  for(let i = 0; i < canvas.width; i++) {
    const p = i / canvas.width;
    let opacity = 0;
    let color = '#d4c5a3';
    
    if (p > 0.1 && p < 0.4) {
      opacity = Math.random() * 0.8 + 0.2;
      color = '#a89c82';
    } else if (p > 0.45 && p < 0.9) {
      opacity = Math.random() * 0.9 + 0.1;
      color = '#e6dbaa';
    } else if (p > 0.92 && p < 0.98) {
      opacity = Math.random() * 0.5;
      color = '#ffffff';
    }
    
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;
    ctx.fillRect(i, 0, 1, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  return texture;
}

export function generateSunTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048; // High res for telescope look
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;
  
  // Base vibrant orange/yellow
  ctx.fillStyle = '#ff6600';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Create granular convective cells (granulation)
  ctx.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 400000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 2 + 1;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 200, 0, 0.4)' : 'rgba(255, 100, 0, 0.4)';
    ctx.fillRect(x, y, size, size);
  }
  
  // Add some dark sunspots
  ctx.globalCompositeOperation = 'multiply';
  for(let j = 0; j < 80; j++) {
    const cx = Math.random() * canvas.width;
    const cy = Math.random() * canvas.height;
    const spotSize = Math.random() * 20 + 5;
    
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, spotSize);
    grad.addColorStop(0, 'rgba(20, 5, 0, 0.95)');
    grad.addColorStop(0.3, 'rgba(60, 15, 0, 0.8)');
    grad.addColorStop(1, 'rgba(255, 136, 0, 0)');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, spotSize, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Add bright faculae (magnetic bright spots)
  ctx.globalCompositeOperation = 'screen';
  for(let j = 0; j < 250; j++) {
    const cx = Math.random() * canvas.width;
    const cy = Math.random() * canvas.height;
    const spotSize = Math.random() * 50 + 10;
    
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, spotSize);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
    grad.addColorStop(0.4, 'rgba(255, 255, 200, 0.2)');
    grad.addColorStop(1, 'rgba(255, 255, 0, 0)');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, spotSize, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  return texture;
}

export function generateSunGlowTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;
  
  const cx = 512;
  const cy = 512;
  const r = 512;
  
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.05, 'rgba(255, 230, 150, 0.9)');
  gradient.addColorStop(0.15, 'rgba(255, 150, 50, 0.6)');
  gradient.addColorStop(0.3, 'rgba(255, 50, 0, 0.3)');
  gradient.addColorStop(0.6, 'rgba(150, 20, 0, 0.1)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1024, 1024);
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function generateEarthNightTexture(): THREE.Texture {
  if (textureCache.has('EarthNight')) {
    return textureCache.get('EarthNight')!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Deep black ocean & space background
  ctx.fillStyle = '#010204';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const drawCityGlow = (cx: number, cy: number, radius: number, intensity = 1) => {
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, `rgba(255, 220, 130, ${0.95 * intensity})`);
    grad.addColorStop(0.3, `rgba(251, 146, 60, ${0.6 * intensity})`);
    grad.addColorStop(0.7, `rgba(217, 119, 6, ${0.25 * intensity})`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  };

  // 1. India (Dense Glowing Grid - Delhi, Mumbai, Kolkata, Chennai, Bengaluru, Hyderabad, etc.)
  const indiaX = canvas.width * 0.72;
  const indiaY = canvas.height * 0.44;
  drawCityGlow(indiaX, indiaY, 95, 1.2); // Central India Glow
  drawCityGlow(indiaX - 25, indiaY - 35, 30, 1.3); // Delhi NCR
  drawCityGlow(indiaX - 45, indiaY + 15, 28, 1.3); // Mumbai
  drawCityGlow(indiaX + 35, indiaY - 10, 25, 1.2); // Kolkata
  drawCityGlow(indiaX - 15, indiaY + 55, 25, 1.2); // Bengaluru
  drawCityGlow(indiaX + 5, indiaY + 48, 22, 1.2); // Chennai
  drawCityGlow(indiaX - 10, indiaY + 22, 22, 1.2); // Hyderabad

  // 2. East Asia (Tokyo, Beijing, Shanghai, Seoul, Pearl River Delta)
  const asiaX = canvas.width * 0.82;
  const asiaY = canvas.height * 0.36;
  drawCityGlow(asiaX + 50, asiaY + 10, 35, 1.4); // Tokyo
  drawCityGlow(asiaX, asiaY - 20, 32, 1.3); // Beijing
  drawCityGlow(asiaX + 15, asiaY + 20, 38, 1.4); // Shanghai
  drawCityGlow(asiaX + 30, asiaY - 10, 24, 1.3); // Seoul
  drawCityGlow(asiaX, asiaY + 50, 42, 1.4); // Guangzhou / HK

  // 3. Europe (London, Paris, Berlin, Madrid, Rome, Moscow)
  const eurX = canvas.width * 0.52;
  const eurY = canvas.height * 0.28;
  drawCityGlow(eurX, eurY, 110, 1.1); // European Megalopolis
  drawCityGlow(eurX - 30, eurY - 15, 28, 1.3); // London
  drawCityGlow(eurX - 20, eurY + 5, 26, 1.3); // Paris
  drawCityGlow(eurX + 60, eurY - 25, 32, 1.2); // Moscow

  // 4. North America (New York, Los Angeles, Chicago, Toronto, San Francisco)
  const naX = canvas.width * 0.25;
  const naY = canvas.height * 0.32;
  drawCityGlow(naX + 50, naY + 10, 40, 1.4); // NYC / East Coast
  drawCityGlow(naX - 60, naY + 25, 32, 1.3); // Los Angeles / West Coast
  drawCityGlow(naX + 10, naY - 10, 30, 1.2); // Chicago / Midwest

  // 5. South America (Sao Paulo, Rio, Buenos Aires)
  const saX = canvas.width * 0.35;
  const saY = canvas.height * 0.65;
  drawCityGlow(saX + 20, saY + 10, 32, 1.2); // Sao Paulo / Rio
  drawCityGlow(saX - 10, saY + 50, 25, 1.1); // Buenos Aires

  // 6. Middle East & Africa (Dubai, Cairo, Johannesburg)
  const meX = canvas.width * 0.60;
  const meY = canvas.height * 0.40;
  drawCityGlow(meX + 15, meY + 5, 28, 1.4); // Dubai / Gulf
  drawCityGlow(meX - 30, meY - 10, 26, 1.3); // Cairo / Nile
  drawCityGlow(meX - 10, meY + 90, 24, 1.1); // Johannesburg

  // 7. Australia (Sydney, Melbourne)
  const ausX = canvas.width * 0.88;
  const ausY = canvas.height * 0.72;
  drawCityGlow(ausX + 15, ausY + 15, 20, 1.1); // Sydney
  drawCityGlow(ausX + 5, ausY + 22, 18, 1.1); // Melbourne

  // 8. Add thousands of fine urban highway light specks along landmasses
  for (let i = 0; i < 4000; i++) {
    const rx = Math.random();
    const ry = Math.random();
    // Concentrate specks on land
    if (
      (rx > 0.68 && rx < 0.76 && ry > 0.35 && ry < 0.58) || // India
      (rx > 0.45 && rx < 0.60 && ry > 0.20 && ry < 0.38) || // Europe
      (rx > 0.18 && rx < 0.32 && ry > 0.22 && ry < 0.42) || // US
      (rx > 0.75 && rx < 0.88 && ry > 0.25 && ry < 0.50)    // China/Japan
    ) {
      const x = rx * canvas.width;
      const y = ry * canvas.height;
      const s = Math.random() * 2 + 0.5;
      ctx.fillStyle = Math.random() > 0.3 ? '#fef08a' : '#fdba74';
      ctx.fillRect(x, y, s, s);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  textureCache.set('EarthNight', texture);
  return texture;
}
