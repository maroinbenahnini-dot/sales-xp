import sharp from 'sharp'
import { mkdirSync } from 'fs'

// SVG icon: dark background, gradient "SX" monogram + trophy accent
const svg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f0f0f"/>
      <stop offset="100%" style="stop-color:#1a1a2e"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c3aed"/>
      <stop offset="100%" style="stop-color:#a855f7"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#bg)"/>

  <!-- Accent circle -->
  <circle cx="${size * 0.5}" cy="${size * 0.5}" r="${size * 0.36}" fill="url(#accent)" opacity="0.15"/>

  <!-- Trophy shape -->
  <g transform="translate(${size * 0.5}, ${size * 0.48}) scale(${size / 512})">
    <!-- Cup body -->
    <path d="M-80,-120 Q-90,-120 -90,-60 Q-90,40 0,80 Q90,40 90,-60 Q90,-120 80,-120 Z"
          fill="url(#accent)" opacity="0.9"/>
    <!-- Handles -->
    <path d="M-90,-80 Q-140,-80 -140,-20 Q-140,20 -90,20" fill="none" stroke="url(#accent)" stroke-width="18" opacity="0.7"/>
    <path d="M90,-80 Q140,-80 140,-20 Q140,20 90,20" fill="none" stroke="url(#accent)" stroke-width="18" opacity="0.7"/>
    <!-- Stem -->
    <rect x="-18" y="80" width="36" height="60" fill="url(#accent)" opacity="0.8"/>
    <!-- Base -->
    <rect x="-60" y="140" width="120" height="22" rx="11" fill="url(#accent)" opacity="0.9"/>
    <!-- Star on cup -->
    <polygon points="0,-80 12,-50 44,-50 20,-30 30,0 0,-20 -30,0 -20,-30 -44,-50 -12,-50"
             fill="white" opacity="0.9"/>
  </g>

  <!-- "SX" text below trophy -->
  <text x="${size * 0.5}" y="${size * 0.88}"
        font-family="system-ui, -apple-system, sans-serif"
        font-weight="900"
        font-size="${size * 0.12}"
        fill="white"
        opacity="0.6"
        text-anchor="middle"
        letter-spacing="${size * 0.015}">SALESXP</text>
</svg>
`

async function generate(size, filename) {
  await sharp(Buffer.from(svg(size)))
    .resize(size, size)
    .png()
    .toFile(`public/${filename}`)
  console.log(`✓ public/${filename}`)
}

mkdirSync('public', { recursive: true })

await generate(192, 'icon-192.png')
await generate(512, 'icon-512.png')
await generate(180, 'apple-touch-icon.png')
await generate(32,  'favicon-32.png')

console.log('Icons generated!')
