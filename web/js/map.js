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

    // Background — gradient sea + paper-tone land
    const defs = document.createElementNS(ns, 'defs');
    defs.innerHTML = `
      <radialGradient id="sea-grad" cx="100%" cy="50%" r="80%">
        <stop offset="0%" stop-color="#cfe1ee"/>
        <stop offset="100%" stop-color="#e6efe2"/>
      </radialGradient>
      <linearGradient id="land-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f6efd9"/>
        <stop offset="100%" stop-color="#ecdfb8"/>
      </linearGradient>
    `;
    this.svg.appendChild(defs);

    const bg = document.createElementNS(ns, 'rect');
    bg.setAttribute('x', '100');
    bg.setAttribute('y', '10');
    bg.setAttribute('width', '750');
    bg.setAttribute('height', '630');
    bg.setAttribute('fill', 'url(#sea-grad)');
    bg.setAttribute('rx', '12');
    this.svg.appendChild(bg);

    // Stylized China outline — clockwise from NW Xinjiang
    const chinaOutline =
      'M 130,150 L 195,128 L 260,100 L 330,75 L 400,55 L 480,42 L 560,38 L 640,40 L 720,55 L 780,80 ' +
      'L 815,115 L 825,150 L 800,180 L 770,195 L 760,225 L 780,240 L 775,265 L 745,275 L 725,300 ' +
      'L 720,325 L 765,340 L 775,365 L 760,395 L 745,425 L 730,455 L 720,485 L 705,515 L 680,545 ' +
      'L 640,560 L 590,565 L 540,570 L 490,575 L 450,580 L 425,560 L 405,545 L 365,560 L 325,555 ' +
      'L 295,535 L 270,505 L 240,475 L 200,455 L 165,440 L 130,420 L 110,390 L 105,355 L 115,320 ' +
      'L 110,280 L 105,240 L 115,205 L 105,175 L 130,150 Z';

    const land = document.createElementNS(ns, 'path');
    land.setAttribute('d', chinaOutline);
    land.setAttribute('fill', 'url(#land-grad)');
    land.setAttribute('stroke', '#a89066');
    land.setAttribute('stroke-width', '1.5');
    land.setAttribute('stroke-linejoin', 'round');
    land.setAttribute('opacity', '0.95');
    this.svg.appendChild(land);

    // 黄河 — wavy line from Lanzhou bend to Bohai
    const yellowRiver = document.createElementNS(ns, 'path');
    yellowRiver.setAttribute('d',
      'M 200,225 Q 280,210 360,235 Q 410,255 430,210 Q 450,180 500,205 Q 540,225 580,260 Q 620,275 670,255 Q 715,240 755,235');
    yellowRiver.setAttribute('fill', 'none');
    yellowRiver.setAttribute('stroke', '#c89860');
    yellowRiver.setAttribute('stroke-width', '1.6');
    yellowRiver.setAttribute('stroke-linecap', 'round');
    yellowRiver.setAttribute('opacity', '0.55');
    this.svg.appendChild(yellowRiver);

    // 长江 — west to Shanghai delta
    const yangtze = document.createElementNS(ns, 'path');
    yangtze.setAttribute('d',
      'M 215,395 Q 290,400 355,395 Q 405,395 440,415 Q 480,420 530,395 Q 575,380 615,375 Q 670,365 720,355 Q 745,348 770,345');
    yangtze.setAttribute('fill', 'none');
    yangtze.setAttribute('stroke', '#7aa8c8');
    yangtze.setAttribute('stroke-width', '2');
    yangtze.setAttribute('stroke-linecap', 'round');
    yangtze.setAttribute('opacity', '0.6');
    this.svg.appendChild(yangtze);

    // Region labels — faint
    const regions = [
      { x: 200, y: 165, t: '西域' },
      { x: 250, y: 350, t: '青藏' },
      { x: 410, y: 130, t: '蒙古' },
      { x: 410, y: 470, t: '西南' },
      { x: 590, y: 130, t: '华北' },
      { x: 600, y: 480, t: '岭南' },
      { x: 720, y: 280, t: '华东' },
    ];
    for (const r of regions) {
      const t = document.createElementNS(ns, 'text');
      t.setAttribute('x', r.x);
      t.setAttribute('y', r.y);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('class', 'region-label');
      t.textContent = r.t;
      this.svg.appendChild(t);
    }

    // 海洋 标注
    const sea = document.createElementNS(ns, 'text');
    sea.setAttribute('x', 820);
    sea.setAttribute('y', 420);
    sea.setAttribute('text-anchor', 'middle');
    sea.setAttribute('class', 'sea-label');
    sea.textContent = '东\n海';
    sea.innerHTML = '<tspan x="820" dy="0">东</tspan><tspan x="820" dy="22">海</tspan>';
    this.svg.appendChild(sea);

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
