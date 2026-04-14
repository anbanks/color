const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Color — New Tab Preview</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; overflow: hidden; font-family: 'Inter', system-ui, sans-serif; }

    .palette {
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 100vw;
      cursor: pointer;
      transition: opacity 0.3s;
    }

    .strip {
      width: 100%;
      transition: background-color 0.6s cubic-bezier(0.22, 1, 0.36, 1);
      clip-path: inset(0 100% 0 0);
      animation: revealStrip 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      will-change: clip-path;
    }
    .strip:nth-child(1) { flex: 41; animation-delay: 0.05s; }
    .strip:nth-child(2) { flex: 26; animation-delay: 0.15s; }
    .strip:nth-child(3) { flex: 18; animation-delay: 0.25s; }
    .strip:nth-child(4) { flex: 15; animation-delay: 0.35s; }

    @keyframes revealStrip {
      0%   { clip-path: inset(0 100% 0 0); }
      100% { clip-path: inset(0 0 0 0); }
    }

    .palette.switching .strip {
      animation: none;
      clip-path: inset(0 0 0 0);
    }
    .palette.switching .strip {
      animation: switchStrip 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
    .palette.switching .strip:nth-child(1) { animation-delay: 0s; }
    .palette.switching .strip:nth-child(2) { animation-delay: 0.06s; }
    .palette.switching .strip:nth-child(3) { animation-delay: 0.12s; }
    .palette.switching .strip:nth-child(4) { animation-delay: 0.18s; }

    @keyframes switchStrip {
      0%   { transform: translateX(0); opacity: 1; }
      40%  { transform: translateX(-6%); opacity: 0.55; }
      100% { transform: translateX(0); opacity: 1; }
    }


    .logo {
      position: fixed;
      top: 16px;
      right: 16px;
      width: 32px;
      height: 32px;
      opacity: 0.6;
      transition: opacity 0.2s, transform 0.2s;
      cursor: pointer;
      z-index: 10;
    }
    .logo:hover {
      opacity: 1;
      transform: scale(1.1);
    }

    .hex-codes {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 12px;
      opacity: 0;
      transition: opacity 0.3s;
      z-index: 10;
    }
    .palette:hover .hex-codes {
      opacity: 1;
    }
    .hex-code {
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-weight: 500;
      letter-spacing: 0.5px;
      background: rgba(0,0,0,0.15);
      color: white;
      cursor: pointer;
      transition: background 0.2s;
      backdrop-filter: blur(8px);
    }
    .hex-code:hover {
      background: rgba(0,0,0,0.3);
    }

    .copied {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 10px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      backdrop-filter: blur(8px);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s;
      z-index: 20;
    }
    .copied.show {
      opacity: 1;
    }

    .refresh {
      position: fixed;
      top: 16px;
      right: 56px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      opacity: 0;
      transition: opacity 0.2s;
      cursor: pointer;
      color: white;
      z-index: 10;
    }
    .palette:hover .refresh {
      opacity: 0.5;
    }
    .refresh:hover {
      opacity: 1 !important;
      background: rgba(255,255,255,0.1);
    }
  </style>
</head>
<body>
  <div class="palette" id="palette">
    <div class="strip" id="s0"></div>
    <div class="strip" id="s1"></div>
    <div class="strip" id="s2"></div>
    <div class="strip" id="s3"></div>

    <div class="hex-codes" id="hexCodes"></div>
  </div>

  <div class="refresh" id="refresh" title="New palette">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
      <path d="M16 21h5v-5"/>
    </svg>
  </div>

  <a href="/" class="logo" title="Color">
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="8" width="28" height="24" rx="12" fill="#FEED30"/>
      <circle cx="14" cy="20" r="2.5" fill="#111"/>
      <circle cx="24" cy="20" r="2.5" fill="#111"/>
      <path d="M12 26 Q18 32 24 26" stroke="#111" stroke-width="2" fill="none" stroke-linecap="round"/>
      <ellipse cx="18" cy="29" rx="3.5" ry="3" fill="#FF6B6B"/>
      <circle cx="10" cy="7" r="4" fill="#FF6B6B"/>
      <circle cx="18" cy="4" r="4" fill="#4ECDC4"/>
      <circle cx="26" cy="7" r="4" fill="#667EEA"/>
    </svg>
  </a>

  <div class="copied" id="copied">Copied!</div>

  <script>
    const API_URL = '/api/palettes?sort=random';

    const FALLBACK = [
      ["#FF6B6B","#4ECDC4","#45B7D1","#96CEB4"],
      ["#2C3E50","#E74C3C","#ECF0F1","#3498DB"],
      ["#F8B500","#FF6F61","#5B5EA6","#9B2335"],
      ["#FAD0C4","#FFD1FF","#A1C4FD","#C2E9FB"],
      ["#0F0C29","#302B63","#24243E","#1A1A2E"],
      ["#56AB2F","#A8E063","#F7DC6F","#F0B27A"],
      ["#FF9A9E","#FECFEF","#FFDDE1","#FFF1EB"],
      ["#667EEA","#764BA2","#F093FB","#F5576C"],
      ["#264653","#2A9D8F","#E9C46A","#F4A261"],
      ["#E63946","#F1FAEE","#A8DADC","#457B9D"],
    ];

    let allPalettes = [];
    let currentIndex = 0;

    function applyPalette(colors) {
      for (let i = 0; i < 4; i++) {
        document.getElementById('s' + i).style.backgroundColor = colors[i];
      }
      const container = document.getElementById('hexCodes');
      container.innerHTML = '';
      colors.forEach(c => {
        const el = document.createElement('span');
        el.className = 'hex-code';
        el.textContent = c.toUpperCase();
        el.onclick = (e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(c.toUpperCase());
          showCopied();
        };
        container.appendChild(el);
      });
    }

    function showCopied() {
      const el = document.getElementById('copied');
      el.classList.add('show');
      setTimeout(() => el.classList.remove('show'), 1200);
    }

    function nextPalette() {
      currentIndex = (currentIndex + 1) % allPalettes.length;
      const el = document.getElementById('palette');
      el.classList.remove('switching');
      void el.offsetWidth;
      el.classList.add('switching');
      applyPalette(allPalettes[currentIndex]);
    }

    document.getElementById('palette').addEventListener('click', () => {
      window.location.href = '/';
    });

    document.getElementById('refresh').addEventListener('click', (e) => {
      e.stopPropagation();
      nextPalette();
    });

    async function init() {
      const randomFallback = FALLBACK[Math.floor(Math.random() * FALLBACK.length)];
      applyPalette(randomFallback);
      allPalettes = [...FALLBACK];

      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        if (data.palettes && data.palettes.length > 0) {
          allPalettes = data.palettes.map(p => p.colors);
          const random = allPalettes[Math.floor(Math.random() * allPalettes.length)];
          applyPalette(random);
        }
      } catch (e) {}
    }

    init();
  </script>
</body>
</html>`;

export function GET() {
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
