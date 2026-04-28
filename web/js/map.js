// 山河游记 - 地图渲染 (SVG)

class GameMap {
  constructor(svgElement) {
    this.svg = svgElement;
    this.cityElements = {};
    this.onCityClick = null;
  }

  render() {
    this.svg.innerHTML = '';
    const ns = 'http://www.w3.org/2000/svg';

    // 水墨画风格 — 宣纸底，无国境线，山远水流
    const defs = document.createElementNS(ns, 'defs');
    defs.innerHTML = `
      <filter id="ink-soft" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3"/>
      </filter>
      <filter id="ink-mist" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="10"/>
      </filter>
      <filter id="paper-noise" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3"/>
        <feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.42  0 0 0 0 0.25  0 0 0 0.06 0"/>
      </filter>
      <radialGradient id="paper-tone" cx="50%" cy="45%" r="75%">
        <stop offset="0%" stop-color="#f8f0dc"/>
        <stop offset="100%" stop-color="#ecdfbf"/>
      </radialGradient>
    `;
    this.svg.appendChild(defs);

    // 宣纸底
    const bg = document.createElementNS(ns, 'rect');
    bg.setAttribute('x', '100');
    bg.setAttribute('y', '10');
    bg.setAttribute('width', '750');
    bg.setAttribute('height', '630');
    bg.setAttribute('fill', 'url(#paper-tone)');
    bg.setAttribute('rx', '12');
    this.svg.appendChild(bg);

    // 纸纹颗粒
    const noise = document.createElementNS(ns, 'rect');
    noise.setAttribute('x', '100');
    noise.setAttribute('y', '10');
    noise.setAttribute('width', '750');
    noise.setAttribute('height', '630');
    noise.setAttribute('filter', 'url(#paper-noise)');
    noise.setAttribute('rx', '12');
    noise.setAttribute('opacity', '0.5');
    this.svg.appendChild(noise);

    // 远山（晕染层）— 西部高原与雪山
    const farMtns = [
      { d: 'M 110,260 Q 180,230 250,255 Q 310,270 360,260 Q 400,255 410,290 Q 380,310 320,305 Q 240,300 170,310 Q 130,310 110,295 Z', op: 0.13 },
      { d: 'M 130,380 Q 200,360 270,375 Q 320,385 350,395 Q 320,420 250,415 Q 180,410 130,400 Z', op: 0.12 },
      { d: 'M 280,500 Q 340,480 400,495 Q 440,510 420,530 Q 360,540 300,530 Q 270,520 280,500 Z', op: 0.10 },
    ];
    for (const m of farMtns) {
      const p = document.createElementNS(ns, 'path');
      p.setAttribute('d', m.d);
      p.setAttribute('fill', '#3a3a42');
      p.setAttribute('opacity', m.op);
      p.setAttribute('filter', 'url(#ink-mist)');
      this.svg.appendChild(p);
    }

    // 近山（笔锋）— 几座有形的山峰
    const peaks = [
      'M 180,275 L 200,250 L 220,275 M 215,278 L 235,255 L 255,280',
      'M 285,395 L 305,365 L 325,395 M 320,400 L 340,375 L 360,400',
      'M 305,510 L 320,490 L 340,510',
    ];
    for (const d of peaks) {
      const p = document.createElementNS(ns, 'path');
      p.setAttribute('d', d);
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke', '#2c2c30');
      p.setAttribute('stroke-width', '1.6');
      p.setAttribute('stroke-linecap', 'round');
      p.setAttribute('stroke-linejoin', 'round');
      p.setAttribute('opacity', '0.32');
      this.svg.appendChild(p);
    }

    // 黄河 — 浓淡变化的笔触（多层叠加）
    const yellowD = 'M 195,225 Q 280,205 360,235 Q 410,260 432,210 Q 455,178 502,205 Q 545,228 582,262 Q 622,278 672,254 Q 720,238 760,232';
    const yellowBlur = document.createElementNS(ns, 'path');
    yellowBlur.setAttribute('d', yellowD);
    yellowBlur.setAttribute('fill', 'none');
    yellowBlur.setAttribute('stroke', '#7a5a30');
    yellowBlur.setAttribute('stroke-width', '6');
    yellowBlur.setAttribute('stroke-linecap', 'round');
    yellowBlur.setAttribute('opacity', '0.18');
    yellowBlur.setAttribute('filter', 'url(#ink-soft)');
    this.svg.appendChild(yellowBlur);
    const yellowLine = document.createElementNS(ns, 'path');
    yellowLine.setAttribute('d', yellowD);
    yellowLine.setAttribute('fill', 'none');
    yellowLine.setAttribute('stroke', '#3c2c18');
    yellowLine.setAttribute('stroke-width', '1.4');
    yellowLine.setAttribute('stroke-linecap', 'round');
    yellowLine.setAttribute('opacity', '0.45');
    this.svg.appendChild(yellowLine);

    // 长江
    const yangtzeD = 'M 210,395 Q 290,400 355,392 Q 408,392 442,415 Q 482,422 532,395 Q 578,378 618,372 Q 672,362 722,352 Q 750,346 778,342';
    const yangtzeBlur = document.createElementNS(ns, 'path');
    yangtzeBlur.setAttribute('d', yangtzeD);
    yangtzeBlur.setAttribute('fill', 'none');
    yangtzeBlur.setAttribute('stroke', '#1e2a38');
    yangtzeBlur.setAttribute('stroke-width', '7');
    yangtzeBlur.setAttribute('stroke-linecap', 'round');
    yangtzeBlur.setAttribute('opacity', '0.16');
    yangtzeBlur.setAttribute('filter', 'url(#ink-soft)');
    this.svg.appendChild(yangtzeBlur);
    const yangtzeLine = document.createElementNS(ns, 'path');
    yangtzeLine.setAttribute('d', yangtzeD);
    yangtzeLine.setAttribute('fill', 'none');
    yangtzeLine.setAttribute('stroke', '#202024');
    yangtzeLine.setAttribute('stroke-width', '1.6');
    yangtzeLine.setAttribute('stroke-linecap', 'round');
    yangtzeLine.setAttribute('opacity', '0.5');
    this.svg.appendChild(yangtzeLine);

    // 飞鸟（点缀）
    const birds = [
      { x: 320, y: 130 }, { x: 350, y: 138 }, { x: 380, y: 125 },
      { x: 720, y: 180 }, { x: 745, y: 188 },
    ];
    for (const b of birds) {
      const bp = document.createElementNS(ns, 'path');
      bp.setAttribute('d', `M ${b.x - 5},${b.y} q 2.5,-3 5,0 q 2.5,-3 5,0`);
      bp.setAttribute('fill', 'none');
      bp.setAttribute('stroke', '#1a1a1e');
      bp.setAttribute('stroke-width', '0.8');
      bp.setAttribute('stroke-linecap', 'round');
      bp.setAttribute('opacity', '0.55');
      this.svg.appendChild(bp);
    }

    // 题字 — 山河
    const shan = document.createElementNS(ns, 'text');
    shan.setAttribute('x', 175);
    shan.setAttribute('y', 95);
    shan.setAttribute('class', 'ink-title');
    shan.textContent = '山';
    this.svg.appendChild(shan);
    const he = document.createElementNS(ns, 'text');
    he.setAttribute('x', 800);
    he.setAttribute('y', 600);
    he.setAttribute('class', 'ink-title');
    he.textContent = '河';
    this.svg.appendChild(he);

    // Draw rail connections first (below cities)
    for (const [a, b, dist] of RAIL_CONNECTIONS) {
      const cityA = CITIES[a];
      const cityB = CITIES[b];
      if (!cityA || !cityB) continue;

      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', cityA.x);
      line.setAttribute('y1', cityA.y);
      line.setAttribute('x2', cityB.x);
      line.setAttribute('y2', cityB.y);
      line.setAttribute('stroke', dist > 1 ? '#b8a88a' : '#8a9ab8');
      line.setAttribute('stroke-width', dist > 1 ? '1.5' : '2');
      line.setAttribute('stroke-dasharray', dist > 1 ? '6,4' : 'none');
      line.setAttribute('opacity', '0.6');
      this.svg.appendChild(line);

      // Distance label for long routes
      if (dist > 1) {
        const mx = (cityA.x + cityB.x) / 2;
        const my = (cityA.y + cityB.y) / 2;
        const label = document.createElementNS(ns, 'text');
        label.setAttribute('x', mx);
        label.setAttribute('y', my - 6);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('class', 'dist-label');
        label.textContent = `${dist}回合`;
        this.svg.appendChild(label);
      }
    }

    // Draw cities
    for (const [id, city] of Object.entries(CITIES)) {
      const g = document.createElementNS(ns, 'g');
      g.setAttribute('class', 'city-node');
      g.setAttribute('data-city', id);
      g.style.cursor = 'pointer';

      const circle = document.createElementNS(ns, 'circle');
      circle.setAttribute('cx', city.x);
      circle.setAttribute('cy', city.y);
      circle.setAttribute('r', '9');
      circle.setAttribute('fill', '#fff');
      circle.setAttribute('stroke', '#5a6b8a');
      circle.setAttribute('stroke-width', '1.5');
      g.appendChild(circle);

      const text = document.createElementNS(ns, 'text');
      text.setAttribute('x', city.x);
      text.setAttribute('y', city.y + 18);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('class', 'city-label');
      text.textContent = city.name;
      g.appendChild(text);

      g.addEventListener('click', () => {
        if (this.onCityClick) this.onCityClick(id);
      });

      this.svg.appendChild(g);
      this.cityElements[id] = { group: g, circle };
    }
  }

  updatePlayers(players) {
    // Reset all cities
    for (const [id, el] of Object.entries(this.cityElements)) {
      el.circle.setAttribute('fill', '#fff');
      el.circle.setAttribute('stroke', '#5a6b8a');
      el.circle.setAttribute('stroke-width', '2');
      el.circle.setAttribute('r', '9');
      // Remove old player markers
      const existing = el.group.querySelectorAll('.player-marker');
      existing.forEach(e => e.remove());
    }

    const ns = 'http://www.w3.org/2000/svg';
    const colors = ['#e74c3c', '#3498db'];
    // Person path scaled to fit r=9 circle (~14px tall, centered at 0,0)
    const personPath = 'M0,-0.5 L0,2.5 M-2.5,1.2 L0,0 L2.5,1.2 M-2,5 L0,2.5 L2,5';

    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      if (!p.city) continue;
      const el = this.cityElements[p.city];
      if (!el) continue;

      const city = CITIES[p.city];
      const otherPlayer = players[1 - i];
      const sameCity = otherPlayer.city === p.city;
      const offsetX = sameCity ? (i === 0 ? -4 : 4) : 0;

      const marker = document.createElementNS(ns, 'g');
      marker.setAttribute('class', 'player-marker');
      marker.setAttribute('transform', `translate(${city.x + offsetX}, ${city.y - 1})`);

      // Head
      const head = document.createElementNS(ns, 'circle');
      head.setAttribute('cx', '0');
      head.setAttribute('cy', '-3.5');
      head.setAttribute('r', '1.8');
      head.setAttribute('fill', colors[i]);
      marker.appendChild(head);

      // Body + arms + legs
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', personPath);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', colors[i]);
      path.setAttribute('stroke-width', '1.3');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      marker.appendChild(path);

      el.group.appendChild(marker);
    }

    // Highlight visited cities
    for (const p of players) {
      for (const cid of p.visitedCities) {
        const el = this.cityElements[cid];
        if (el) {
          el.circle.setAttribute('fill', '#e8f4e8');
        }
      }
    }
  }

  highlightCities(cityIds, color = '#f1c40f') {
    // Reset highlights
    for (const el of Object.values(this.cityElements)) {
      el.circle.removeAttribute('filter');
      el.group.classList.remove('highlight');
    }
    for (const id of cityIds) {
      const el = this.cityElements[id];
      if (el) {
        el.group.classList.add('highlight');
      }
    }
  }

  clearHighlights() {
    for (const el of Object.values(this.cityElements)) {
      el.group.classList.remove('highlight');
    }
  }
}
