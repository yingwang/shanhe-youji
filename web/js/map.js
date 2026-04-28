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

    // 背景 — 青绿山水 + 高铁底图
    const defs = document.createElementNS(ns, 'defs');
    defs.innerHTML = `
      <clipPath id="map-clip">
        <rect x="100" y="10" width="750" height="630" rx="12"/>
      </clipPath>
    `;
    this.svg.appendChild(defs);

    // 米黄底打底，万一图载不出来或透出来不至于露黑底
    const paper = document.createElementNS(ns, 'rect');
    paper.setAttribute('x', '100');
    paper.setAttribute('y', '10');
    paper.setAttribute('width', '750');
    paper.setAttribute('height', '630');
    paper.setAttribute('fill', '#f7eed5');
    paper.setAttribute('rx', '12');
    this.svg.appendChild(paper);

    // 手动定位放大 — 让 China 中心（图 px≈400, 250）落到地图中心 svg(475, 325)
    // 图原始 1024×532。以高度铺满 630 为基准，scale=1.184，宽度=1213
    // 但还要把"偏左的 China"挪到中央，所以再放大并左移
    const bgImg = document.createElementNS(ns, 'image');
    bgImg.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'img/map-bg.jpg');
    bgImg.setAttribute('href', 'img/map-bg.jpg');
    bgImg.setAttribute('x', '-60');
    bgImg.setAttribute('y', '-50');
    bgImg.setAttribute('width', '1400');
    bgImg.setAttribute('height', '730');
    bgImg.setAttribute('preserveAspectRatio', 'none');
    bgImg.setAttribute('clip-path', 'url(#map-clip)');
    bgImg.setAttribute('opacity', '0.55');
    this.svg.appendChild(bgImg);

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
      line.setAttribute('stroke', dist > 1 ? '#5a4830' : '#1f2937');
      line.setAttribute('stroke-width', dist > 1 ? '1.8' : '2.2');
      line.setAttribute('stroke-dasharray', dist > 1 ? '6,4' : 'none');
      line.setAttribute('opacity', '0.85');
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
