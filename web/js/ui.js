// 山河游记 - UI Controller

class GameUI {
  constructor() {
    this.game = new Game();
    this.map = null;
    this.selectedAction = null;
    this.init();
  }

  init() {
    // Wait for DOM
    document.addEventListener('DOMContentLoaded', () => {
      this.map = new GameMap(document.getElementById('game-map'));
      this.map.render();
      this.map.onCityClick = (cityId) => this.handleCityClick(cityId);
      this.showSetupScreen();
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.hideCardInfo();
      });
    });
  }

  // --- Setup Phase ---
  showSetupScreen() {
    document.getElementById('setup-screen').style.display = 'flex';
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('end-screen').style.display = 'none';

    const startCities = ['beijing', 'hangzhou', 'chengdu', 'guangzhou', 'xian', 'shanghai', 'harbin', 'kunming'];

    const p1Select = document.getElementById('p1-start');
    const p2Select = document.getElementById('p2-start');
    p1Select.innerHTML = '';
    p2Select.innerHTML = '';

    for (const cid of startCities) {
      const city = CITIES[cid];
      p1Select.innerHTML += `<option value="${cid}">${city.name}</option>`;
      p2Select.innerHTML += `<option value="${cid}">${city.name}</option>`;
    }
    p2Select.value = 'hangzhou';

    document.getElementById('start-game-btn').onclick = () => {
      const c1 = p1Select.value;
      const c2 = p2Select.value;
      if (c1 === c2) {
        alert('两位旅行者不能选择同一个起点城市！');
        return;
      }
      const n1 = (document.getElementById('p1-name').value || '').trim();
      const n2 = (document.getElementById('p2-name').value || '').trim();
      this.game.startGame(c1, c2, n1, n2);
      document.getElementById('setup-screen').style.display = 'none';
      document.getElementById('game-screen').style.display = 'grid';
      this.updateUI();
    };
  }

  // --- Main Game UI ---
  updateUI() {
    this.updateHeader();
    this.updatePlayerPanels();
    this.updateActions();
    this.updateCityInfo();
    this.updateLog();
    this.map.updatePlayers(this.game.players);

    if (this.game.phase === 'end') {
      this.showEndScreen();
    }
  }

  updateHeader() {
    const player = this.game.players[this.game.currentPlayer];
    const colors = ['var(--p1-color)', 'var(--p2-color)'];
    document.getElementById('round-display').textContent = `第 ${this.game.round} / ${this.game.maxRounds} 天`;

    const turnEl = document.getElementById('turn-display');
    turnEl.textContent = `${player.name} 的回合`;
    turnEl.style.color = colors[this.game.currentPlayer];

    const eventEl = document.getElementById('event-display');
    if (this.game.currentEvent) {
      eventEl.innerHTML = `<span class="event-name">${this.game.currentEvent.name}</span> ${this.game.currentEvent.benefit} / ${this.game.currentEvent.cost}`;
      eventEl.style.display = 'block';
    } else {
      eventEl.style.display = 'none';
    }
  }

  updatePlayerPanels() {
    for (let i = 0; i < 2; i++) {
      const p = this.game.players[i];
      const panel = document.getElementById(`player${i + 1}-panel`);
      const isActive = i === this.game.currentPlayer && this.game.phase === 'action';
      panel.classList.toggle('active', isActive);

      panel.querySelector('.p-name').textContent = p.name;
      panel.querySelector('.p-city').textContent = p.city ? CITIES[p.city].name : '—';
      panel.querySelector('.p-stamina').textContent = p.stamina;
      panel.querySelector('.p-money').textContent = p.money;
      panel.querySelector('.p-scenic-count').textContent = p.scenics.size;
      panel.querySelector('.p-food-count').textContent = p.foods.size;
      panel.querySelector('.p-treasure-count').textContent = p.treasures.size;
      panel.querySelector('.p-cities-count').textContent = p.visitedCities.size;

      // Collection details
      const foodList = panel.querySelector('.p-food-list');
      if (foodList) {
        const foodNames = [...p.foods].map(fid => {
          const f = FOOD_CARDS.find(fc => fc.id === fid);
          return f ? f.name : '';
        }).filter(Boolean);
        foodList.textContent = foodNames.length > 0 ? foodNames.join('、') : '—';
      }

      const treasureList = panel.querySelector('.p-treasure-list');
      if (treasureList) {
        const tNames = [...p.treasures].map(tid => {
          const t = TREASURE_CARDS.find(tc => tc.id === tid);
          return t ? t.name : '';
        }).filter(Boolean);
        treasureList.textContent = tNames.length > 0 ? tNames.join('、') : '—';
      }

      const scenicList = panel.querySelector('.p-scenic-list');
      if (scenicList) {
        const sNames = [...p.scenics].map(sid => {
          const s = SCENIC_CARDS.find(sc => sc.id === sid);
          return s ? s.name : '';
        }).filter(Boolean);
        scenicList.textContent = sNames.length > 0 ? sNames.join('、') : '—';
      }
    }
  }

  updateActions() {
    const panel = document.getElementById('actions-panel');
    if (this.game.phase !== 'action') {
      panel.innerHTML = '<div class="waiting">等待中...</div>';
      return;
    }

    const actions = this.game.getAvailableActions();
    this.currentActions = actions; // store for click handlers
    const categories = { move: [], scenic: [], food: [], treasure: [], other: [] };

    for (let i = 0; i < actions.length; i++) {
      const a = actions[i];
      const entry = { ...a, index: i };
      if (a.type === 'move') categories.move.push(entry);
      else if (a.type === 'scenic') categories.scenic.push(entry);
      else if (a.type === 'food') categories.food.push(entry);
      else if (a.type === 'treasure') categories.treasure.push(entry);
      else categories.other.push(entry);
    }

    let html = `<div class="actions-remaining">剩余行动: ${this.game.actionsRemaining}</div>`;

    if (categories.move.length > 0) {
      html += '<div class="action-group"><div class="action-group-title">🚄 移动</div>';
      for (const a of categories.move) {
        html += `<button class="action-btn move-btn" onclick="ui.doActionByIndex(${a.index})">${a.label}<span class="cost-tag">${a.cost.stamina}体 ${a.cost.money}金</span></button>`;
      }
      html += '</div>';
    }

    if (categories.scenic.length > 0) {
      html += '<div class="action-group"><div class="action-group-title">📸 打卡</div>';
      for (const a of categories.scenic) {
        const s = SCENIC_CARDS.find(sc => sc.id === a.target);
        const info = this.infoBtn('scenic', s.id);
        html += `<button class="action-btn scenic-btn" onclick="ui.doActionByIndex(${a.index})">${a.label}（${s.baseScore}分${s.bonus ? ' · ' + s.bonus : ''}）<span class="cost-tag">${a.cost.stamina}体</span>${info}</button>`;
      }
      html += '</div>';
    }

    if (categories.food.length > 0) {
      html += '<div class="action-group"><div class="action-group-title">🍜 美食</div>';
      for (const a of categories.food) {
        const f = FOOD_CARDS.find(fc => fc.id === a.target);
        const info = this.infoBtn('food', f.id);
        html += `<button class="action-btn food-btn" onclick="ui.doActionByIndex(${a.index})">${f.name}<span class="cuisine-tag">${f.cuisine}</span><span class="cost-tag">${a.cost.money}金</span>${info}</button>`;
      }
      html += '</div>';
    }

    if (categories.treasure.length > 0) {
      html += '<div class="action-group"><div class="action-group-title">💎 瑰宝</div>';
      for (const a of categories.treasure) {
        const t = TREASURE_CARDS.find(tc => tc.id === a.target);
        const info = this.infoBtn('treasure', t.id);
        html += `<button class="action-btn treasure-btn" onclick="ui.doActionByIndex(${a.index})">${t.name}（${t.score}分）<span class="ability-tag">${t.ability}</span><span class="cost-tag">${a.cost.stamina}体 ${a.cost.money}金</span>${info}</button>`;
      }
      html += '</div>';
    }

    for (const a of categories.other) {
      html += `<button class="action-btn other-btn" onclick="ui.doActionByIndex(${a.index})">${a.label}</button>`;
    }

    panel.innerHTML = html;

    // Highlight reachable cities
    const moveCities = categories.move.map(a => a.target);
    this.map.highlightCities(moveCities);
  }

  updateCityInfo() {
    const player = this.game.players[this.game.currentPlayer];
    const infoEl = document.getElementById('city-info');
    if (!player.city) {
      infoEl.innerHTML = '';
      return;
    }

    const city = CITIES[player.city];
    const scenics = SCENIC_CARDS.filter(s => s.city === player.city);
    const foods = FOOD_CARDS.filter(f => f.city === player.city);
    const treasures = TREASURE_CARDS.filter(t => t.city === player.city);

    const cityHasDesc = typeof CITY_DESCRIPTIONS !== 'undefined' && !!CITY_DESCRIPTIONS[player.city];
    const cityInfoBtn = cityHasDesc ? `<span class="info-btn" onclick="ui.showCityInfo('${player.city}')" title="城市介绍">i</span>` : '';
    let html = `<h3>${city.name}${cityInfoBtn}</h3>`;

    if (scenics.length > 0) {
      html += '<div class="info-section"><strong>景区：</strong>';
      for (const s of scenics) {
        const taken = this.game.takenScenics.has(s.id);
        const nameHtml = this.cardNameHtml('scenic', s.id, s.name);
        html += `<span class="${taken ? 'taken' : 'available'}">${nameHtml}(${s.baseScore}分)${taken ? ' ✓已打卡' : ''}</span> `;
      }
      html += '</div>';
    }

    if (foods.length > 0) {
      html += '<div class="info-section"><strong>美食：</strong>';
      for (const f of foods) {
        const taken = this.game.takenFoods.has(f.id);
        const nameHtml = this.cardNameHtml('food', f.id, f.name);
        html += `<span class="${taken ? 'taken' : 'available'}">${nameHtml}(${f.cost}金·${f.cuisine})${taken ? ' ✓' : ''}</span> `;
      }
      html += '</div>';
    }

    if (treasures.length > 0) {
      html += '<div class="info-section"><strong>瑰宝：</strong>';
      for (const t of treasures) {
        const taken = this.game.takenTreasures.has(t.id);
        const nameHtml = this.cardNameHtml('treasure', t.id, t.name);
        html += `<span class="${taken ? 'taken' : 'available'}">${nameHtml}(${t.cost}金·${t.score}分)${taken ? ' ✓' : ''}</span> `;
      }
      html += '</div>';
    }

    infoEl.innerHTML = html;
  }

  updateLog() {
    const logEl = document.getElementById('game-log');
    const recentLogs = this.game.log.slice(-15);
    logEl.innerHTML = recentLogs.map(l =>
      `<div class="log-entry"><span class="log-round">第${l.round}天</span> ${l.msg}</div>`
    ).join('');
    logEl.scrollTop = logEl.scrollHeight;
  }

  doAction(action) {
    this.game.executeAction(action);
    this.updateUI();
  }

  doActionByIndex(index) {
    if (this.currentActions && this.currentActions[index]) {
      this.game.executeAction(this.currentActions[index]);
      this.updateUI();
    }
  }

  // --- Card info modal ---
  hasDescription(id) {
    return typeof CARD_DESCRIPTIONS !== 'undefined' && !!CARD_DESCRIPTIONS[id];
  }

  infoBtn(kind, id) {
    if (!this.hasDescription(id)) return '';
    return `<span class="info-btn" onclick="event.stopPropagation(); ui.showCardInfo('${kind}', '${id}')" title="查看介绍">i</span>`;
  }

  cardNameHtml(kind, id, name) {
    if (!this.hasDescription(id)) return name;
    return `<span class="info-link" onclick="ui.showCardInfo('${kind}', '${id}')">${name}</span>`;
  }

  showCardInfo(kind, id) {
    let card, meta;
    if (kind === 'scenic') {
      card = SCENIC_CARDS.find(c => c.id === id);
      if (!card) return;
      const city = CITIES[card.city];
      meta = `${city ? city.name : ''} · 景区 · 基础 ${card.baseScore} 分${card.bonus ? '｜' + card.bonus : ''}`;
    } else if (kind === 'food') {
      card = FOOD_CARDS.find(c => c.id === id);
      if (!card) return;
      const city = CITIES[card.city];
      meta = `${city ? city.name : ''} · ${card.cuisine} · ${card.cost} 金`;
    } else if (kind === 'treasure') {
      card = TREASURE_CARDS.find(c => c.id === id);
      if (!card) return;
      const city = CITIES[card.city];
      meta = `${city ? city.name : ''} · 瑰宝 · ${card.cost} 金 · 终局 ${card.score} 分${card.ability ? '｜' + card.ability : ''}`;
    } else {
      return;
    }
    const desc = (typeof CARD_DESCRIPTIONS !== 'undefined' && CARD_DESCRIPTIONS[id]) || '';
    document.getElementById('modal-title').textContent = card.name;
    document.getElementById('modal-meta').textContent = meta;
    this.setModalBody(desc, null);
    document.getElementById('card-modal').classList.remove('modal-hidden');
  }

  showCityInfo(cityId) {
    const city = CITIES[cityId];
    if (!city) return;
    const desc = (typeof CITY_DESCRIPTIONS !== 'undefined' && CITY_DESCRIPTIONS[cityId]) || '';
    if (!desc) return;
    document.getElementById('modal-title').textContent = city.name;
    document.getElementById('modal-meta').textContent = '城市';
    this.setModalBody(desc, `img/cities/${cityId}.jpg`);
    document.getElementById('card-modal').classList.remove('modal-hidden');
  }

  setModalBody(text, imgPath) {
    const body = document.getElementById('modal-body');
    body.innerHTML = '';
    if (imgPath) {
      const img = document.createElement('img');
      img.className = 'modal-image';
      img.src = imgPath;
      img.alt = '';
      img.onerror = () => img.remove();
      body.appendChild(img);
    }
    const p = document.createElement('p');
    p.className = 'modal-text';
    p.textContent = text;
    body.appendChild(p);
  }

  hideCardInfo() {
    document.getElementById('card-modal').classList.add('modal-hidden');
  }

  handleCityClick(cityId) {
    if (this.game.phase !== 'action') return;
    const player = this.game.players[this.game.currentPlayer];

    // Check if this city is reachable
    const actions = this.game.getAvailableActions();
    const moveAction = actions.find(a => a.type === 'move' && a.target === cityId);
    if (moveAction) {
      this.game.executeAction(moveAction);
      this.updateUI();
    }
  }

  // --- End Screen ---
  showEndScreen() {
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('end-screen').style.display = 'flex';

    const p1 = this.game.players[0];
    const p2 = this.game.players[1];

    const winnerEl = document.getElementById('winner-display');
    if (p1.score > p2.score) {
      winnerEl.textContent = `${p1.name} 获胜！`;
      winnerEl.style.color = 'var(--p1-color)';
    } else if (p2.score > p1.score) {
      winnerEl.textContent = `${p2.name} 获胜！`;
      winnerEl.style.color = 'var(--p2-color)';
    } else {
      winnerEl.textContent = '平局！';
    }

    const scoreEl = document.getElementById('score-breakdown');
    let html = '<table class="score-table">';
    html += '<tr><th></th><th>' + p1.name + '</th><th>' + p2.name + '</th></tr>';

    const labels = p1.breakdown.map(b => b.label);
    for (let i = 0; i < labels.length; i++) {
      html += `<tr><td>${labels[i]}</td><td>${p1.breakdown[i].value}</td><td>${p2.breakdown[i].value}</td></tr>`;
    }
    html += `<tr class="total-row"><td><strong>总分</strong></td><td><strong>${p1.score}</strong></td><td><strong>${p2.score}</strong></td></tr>`;
    html += '</table>';

    // Journey summary
    html += '<div class="journey-summary">';
    for (const p of [p1, p2]) {
      html += `<div class="journey"><h4>${p.name}的旅程</h4>`;
      html += `<p>到访 ${p.visitedCities.size} 座城市，打卡 ${p.scenics.size} 个景区</p>`;
      html += `<p>品尝 ${p.foods.size} 道美食，收藏 ${p.treasures.size} 件瑰宝</p>`;

      // Milestones
      const milestones = [];
      if (this.game.milestones.explorer === p.id) milestones.push('先行者');
      if (this.game.milestones.foodie === p.id) milestones.push('美食家');
      if (this.game.milestones.collector === p.id) milestones.push('收藏家');
      if (milestones.length > 0) {
        html += `<p>里程碑：${milestones.join('、')}</p>`;
      }
      html += '</div>';
    }
    html += '</div>';

    scoreEl.innerHTML = html;

    document.getElementById('restart-btn').onclick = () => {
      this.game.reset();
      this.showSetupScreen();
    };
  }
}

const ui = new GameUI();
