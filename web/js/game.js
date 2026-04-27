// 山河游记 - 游戏引擎

class Game {
  constructor() {
    this.reset();
  }

  reset() {
    this.round = 1;
    this.maxRounds = 12;
    this.phase = 'setup'; // setup, event, income, action, end
    this.currentPlayer = 0; // 0 or 1
    this.actionsRemaining = 0;
    this.currentEvent = null;
    this.eventDeck = [];
    this.log = [];

    // Track which cards are taken (first come first served)
    this.takenScenics = new Set();
    this.takenFoods = new Set();
    this.takenTreasures = new Set();

    // Milestones
    this.milestones = {
      explorer: null,  // first to visit 5 cities
      foodie: null,    // first to collect 3 cuisines
      collector: null, // first to collect 3 treasures
    };

    this.players = [
      this.createPlayer(0, '旅行者一'),
      this.createPlayer(1, '旅行者二'),
    ];

    this.setupEventDeck();
  }

  createPlayer(id, name) {
    return {
      id,
      name,
      city: null,
      stamina: 3,
      money: id === 0 ? 8 : 9, // second player gets +1
      visitedCities: new Set(),
      scenics: new Set(),
      foods: new Set(),
      treasures: new Set(),
      score: 0,
      inTransit: 0, // rounds remaining in transit
      freeMove: false, // from 秦腔皮影
      extraMoveAllowed: false, // from events
      moveCostModifier: 0,
      foodCostModifier: 0,
      treasureCostModifier: 0,
      scenicScoreModifier: 0,
      staminaBonus: 0, // from rest
    };
  }

  setupEventDeck() {
    this.eventDeck = [...EVENT_CARDS];
    // Shuffle
    for (let i = this.eventDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.eventDeck[i], this.eventDeck[j]] = [this.eventDeck[j], this.eventDeck[i]];
    }
  }

  // Get adjacent cities from current position
  getAdjacentCities(cityId) {
    const adjacent = [];
    for (const [a, b, dist] of RAIL_CONNECTIONS) {
      if (a === cityId) adjacent.push({ city: b, distance: dist });
      if (b === cityId) adjacent.push({ city: a, distance: dist });
    }
    return adjacent;
  }

  // Get available actions for current player
  getAvailableActions() {
    const player = this.players[this.currentPlayer];
    const actions = [];

    if (player.inTransit > 0) {
      actions.push({ type: 'rest', label: '结束回合（在路上）', cost: { stamina: 0, money: 0 } });
      return actions;
    }

    const city = player.city;

    // Move
    if (player.stamina >= 1) {
      const adjacent = this.getAdjacentCities(city);
      for (const dest of adjacent) {
        const moveCost = player.freeMove ? 0 : (1 + player.moveCostModifier);
        if (player.money >= moveCost || player.freeMove) {
          actions.push({
            type: 'move',
            target: dest.city,
            distance: dest.distance,
            label: `前往${CITIES[dest.city].name}${dest.distance > 1 ? `（${dest.distance}回合）` : ''}`,
            cost: { stamina: 1, money: player.freeMove ? 0 : moveCost },
          });
        }
      }
    }

    // Check-in scenic spots
    if (player.stamina >= 1) {
      const scenics = SCENIC_CARDS.filter(s => s.city === city && !this.takenScenics.has(s.id));
      for (const s of scenics) {
        actions.push({
          type: 'scenic',
          target: s.id,
          label: `打卡 ${s.name}`,
          cost: { stamina: 1, money: 0 },
        });
      }
    }

    // Buy food
    if (player.stamina >= 1) {
      const foods = FOOD_CARDS.filter(f => f.city === city && !this.takenFoods.has(f.id));
      for (const f of foods) {
        const cost = f.cost + player.foodCostModifier;
        if (player.money >= cost) {
          actions.push({
            type: 'food',
            target: f.id,
            label: `品尝 ${f.name}（${cost}金）`,
            cost: { stamina: 1, money: cost },
          });
        }
      }
    }

    // Collect treasure
    if (player.stamina >= 2) {
      const treasures = TREASURE_CARDS.filter(t => t.city === city && !this.takenTreasures.has(t.id));
      for (const t of treasures) {
        const cost = Math.max(0, t.cost + player.treasureCostModifier);
        if (player.money >= cost) {
          actions.push({
            type: 'treasure',
            target: t.id,
            label: `收藏 ${t.name}（${cost}金）`,
            cost: { stamina: 2, money: cost },
          });
        }
      }
    }

    // End turn (rests if not already rested this turn)
    const alreadyRested = player.staminaBonus > 0;
    actions.push({
      type: 'rest',
      label: alreadyRested ? '结束回合' : '结束回合（休整 · 下回合+1体力）',
      cost: { stamina: 0, money: 0 },
    });

    return actions;
  }

  // Execute an action
  executeAction(action) {
    const player = this.players[this.currentPlayer];

    // Deduct costs
    player.stamina -= action.cost.stamina;
    player.money -= action.cost.money;

    switch (action.type) {
      case 'move':
        if (action.distance > 1) {
          player.inTransit = action.distance - 1;
        }
        player.city = action.target;
        player.visitedCities.add(action.target);
        if (player.freeMove) player.freeMove = false;
        this.addLog(`${player.name} 前往 ${CITIES[action.target].name}`);
        this.checkEncounter();
        break;

      case 'scenic':
        player.scenics.add(action.target);
        this.takenScenics.add(action.target);
        const scenic = SCENIC_CARDS.find(s => s.id === action.target);
        this.addLog(`${player.name} 打卡 ${scenic.name}`);
        break;

      case 'food':
        player.foods.add(action.target);
        this.takenFoods.add(action.target);
        const food = FOOD_CARDS.find(f => f.id === action.target);
        this.addLog(`${player.name} 品尝 ${food.name}`);
        break;

      case 'treasure':
        player.treasures.add(action.target);
        this.takenTreasures.add(action.target);
        const treasure = TREASURE_CARDS.find(t => t.id === action.target);
        this.addLog(`${player.name} 收藏 ${treasure.name}`);
        // Special: 秦腔皮影 grants free move
        if (action.target === 't22') {
          player.freeMove = true;
        }
        break;

      case 'rest': {
        const gainBonus = player.staminaBonus === 0;
        if (gainBonus) {
          player.staminaBonus = 1;
          this.addLog(`${player.name} 休整，结束回合`);
        } else {
          this.addLog(`${player.name} 结束回合`);
        }
        this.actionsRemaining = 0;
        break;
      }
    }

    if (action.type !== 'rest') {
      this.actionsRemaining--;
    }

    // Check milestones
    this.checkMilestones(player);

    // Next player or next phase
    if (this.actionsRemaining <= 0) {
      this.endPlayerTurn();
    }
  }

  checkEncounter() {
    const p1 = this.players[0];
    const p2 = this.players[1];
    if (p1.city && p2.city && p1.city === p2.city) {
      p1.money += 1;
      p2.money += 1;
      this.addLog(`偶遇！双方各+1金`);
    }
  }

  checkMilestones(player) {
    if (!this.milestones.explorer && player.visitedCities.size >= 5) {
      this.milestones.explorer = player.id;
      this.addLog(`${player.name} 达成里程碑：先行者！`);
    }
    if (!this.milestones.foodie) {
      const cuisines = new Set();
      for (const fid of player.foods) {
        const f = FOOD_CARDS.find(food => food.id === fid);
        if (f) cuisines.add(f.cuisine);
      }
      if (cuisines.size >= 3) {
        this.milestones.foodie = player.id;
        this.addLog(`${player.name} 达成里程碑：美食家！`);
      }
    }
    if (!this.milestones.collector && player.treasures.size >= 3) {
      this.milestones.collector = player.id;
      this.addLog(`${player.name} 达成里程碑：收藏家！`);
    }
  }

  endPlayerTurn() {
    if (this.currentPlayer === 0) {
      this.currentPlayer = 1;
      this.actionsRemaining = this.players[1].stamina;
    } else {
      this.endRound();
    }
  }

  startRound() {
    // Reset per-round modifiers
    for (const p of this.players) {
      p.moveCostModifier = 0;
      p.foodCostModifier = 0;
      p.treasureCostModifier = 0;
      p.scenicScoreModifier = 0;
      p.extraMoveAllowed = false;
      if (p.inTransit > 0) p.inTransit--;
    }

    this.phase = 'event';
    this.drawEvent();
  }

  drawEvent() {
    if (this.eventDeck.length > 0) {
      this.currentEvent = this.eventDeck.pop();
      this.applyEvent(this.currentEvent);
      this.addLog(`事件：${this.currentEvent.name} — ${this.currentEvent.benefit}，但${this.currentEvent.cost}`);
    }
    this.phase = 'income';
    this.applyIncome();
  }

  applyEvent(event) {
    for (const p of this.players) {
      switch (event.effect) {
        case 'speedBoost':
          p.extraMoveAllowed = true;
          p.moveCostModifier = 1; // double cost
          break;
        case 'goldenWeek':
          p.scenicScoreModifier = 1;
          p.foodCostModifier = 1;
          break;
        case 'rainDelay':
          p.money += 1;
          // Movement blocked handled in getAvailableActions
          break;
        case 'treasureSale':
          p.treasureCostModifier = -2;
          break;
        case 'peakSeason':
          p.scenicScoreModifier = 1;
          p.moveCostModifier = 1;
          break;
        case 'offSeason':
          p.foodCostModifier = -1;
          p.treasureCostModifier = -1;
          p.scenicScoreModifier = -1;
          break;
        case 'encounter':
          p.money += 1;
          p.foodCostModifier = 1;
          break;
        case 'trainDelay':
          p.money += 1;
          break;
      }
    }
  }

  applyIncome() {
    for (const p of this.players) {
      p.money += 2;
      // 海派旗袍 bonus
      if (p.treasures.has('t4')) {
        p.money += 1;
      }
    }
    this.phase = 'action';
    this.currentPlayer = 0;
    // Reset stamina (include rest bonus)
    for (const p of this.players) {
      p.stamina = 3 + p.staminaBonus;
      p.staminaBonus = 0;
    }
    this.actionsRemaining = this.players[0].stamina;
  }

  endRound() {
    if (this.round >= this.maxRounds) {
      this.phase = 'end';
      this.calculateFinalScores();
    } else {
      this.round++;
      this.startRound();
    }
  }

  calculateFinalScores() {
    for (const p of this.players) {
      let score = 0;
      const breakdown = [];

      // 1. Scenic scores
      let scenicTotal = 0;
      for (const sid of p.scenics) {
        const s = SCENIC_CARDS.find(sc => sc.id === sid);
        if (s) {
          const base = s.baseScore;
          const bonus = s.bonusCheck(p, this);
          scenicTotal += base + bonus;
        }
      }
      breakdown.push({ label: '景区', value: scenicTotal });
      score += scenicTotal;

      // 2. Food achievements
      const cuisines = new Set();
      const cuisineCounts = {};
      for (const fid of p.foods) {
        const f = FOOD_CARDS.find(food => food.id === fid);
        if (f) {
          cuisines.add(f.cuisine);
          cuisineCounts[f.cuisine] = (cuisineCounts[f.cuisine] || 0) + 1;
        }
      }
      let foodAchievement = 0;
      if (cuisines.size >= 8) foodAchievement += 10;
      else if (cuisines.size >= 5) foodAchievement += 5;
      else if (cuisines.size >= 3) foodAchievement += 2;
      // Specialization
      for (const c in cuisineCounts) {
        if (cuisineCounts[c] >= 3) foodAchievement += 4;
      }
      // Special combos
      if (cuisines.has('东北菜') && cuisines.has('粤菜')) foodAchievement += 2;
      if (cuisines.has('川菜') && cuisines.has('湘菜') && cuisines.has('黔菜')) foodAchievement += 3;
      breakdown.push({ label: '美食成就', value: foodAchievement });
      score += foodAchievement;

      // 3. Treasure base scores
      let treasureTotal = 0;
      for (const tid of p.treasures) {
        const t = TREASURE_CARDS.find(tr => tr.id === tid);
        if (t) treasureTotal += t.score;
      }
      breakdown.push({ label: '瑰宝基础', value: treasureTotal });
      score += treasureTotal;

      // 4. Treasure combos (simplified)
      let treasureCombo = 0;
      // 景泰蓝 百搭
      if (p.treasures.has('t1') && p.treasures.size > 1) treasureCombo += 1;
      // 京剧脸谱 + 秦腔皮影
      if (p.treasures.has('t2') && p.treasures.has('t22')) treasureCombo += 2;
      // 冰雕 冬季
      if (p.treasures.has('t3') && this.round >= 10) treasureCombo += 2;
      // 龙泉青瓷 + 景德镇瓷器
      if (p.treasures.has('t8') && p.treasures.has('t10')) treasureCombo += 3;
      // 敦煌壁画 + 唐卡
      if (p.treasures.has('t23') && p.treasures.has('t29')) treasureCombo += 4;
      // 苏绣 + 蜀锦
      if (p.treasures.has('t6') && p.treasures.has('t25')) treasureCombo += 2;
      // 云锦 + 蜀锦/苏绣
      if (p.treasures.has('t5') && (p.treasures.has('t25') || p.treasures.has('t6'))) treasureCombo += 2;
      // 宜兴紫砂 + 建水紫陶
      if (p.treasures.has('t9') && p.treasures.has('t27')) treasureCombo += 2;
      // 广彩瓷 + 景德镇瓷器
      if (p.treasures.has('t14') && p.treasures.has('t10')) treasureCombo += 2;
      // 潮绣 + 广绣
      if (p.treasures.has('t16') && p.treasures.has('t15')) treasureCombo += 2;
      // 蜡染 + 白族扎染
      if (p.treasures.has('t36') && p.treasures.has('t28')) treasureCombo += 2;
      // 扬州漆器 + 漆线雕
      if (p.treasures.has('t33') && p.treasures.has('t17')) treasureCombo += 2;
      // 推光漆器 + 扬州漆器
      if (p.treasures.has('t51') && p.treasures.has('t33')) treasureCombo += 2;
      breakdown.push({ label: '瑰宝组合', value: treasureCombo });
      score += treasureCombo;

      // 5. Treasure collection achievements
      let treasureAchieve = 0;
      if (p.treasures.size >= 6) treasureAchieve += 5;
      // Embroidery collection
      const embroideries = ['t5', 't6', 't12', 't13', 't15', 't16', 't21', 't25', 't28', 't30', 't38', 't39', 't40', 't42'];
      let embCount = 0;
      for (const e of embroideries) { if (p.treasures.has(e)) embCount++; }
      if (embCount >= 3) treasureAchieve += 5;
      breakdown.push({ label: '收藏成就', value: treasureAchieve });
      score += treasureAchieve;

      // 6. Route score
      const routeScore = p.visitedCities.size;
      breakdown.push({ label: '路线（城市数）', value: routeScore });
      score += routeScore;

      // 7. Leftover money
      const moneyScore = Math.floor(p.money / 3);
      breakdown.push({ label: '余银', value: moneyScore });
      score += moneyScore;

      // 8. Milestones
      let milestoneScore = 0;
      if (this.milestones.explorer === p.id) milestoneScore += 3;
      if (this.milestones.foodie === p.id) milestoneScore += 3;
      if (this.milestones.collector === p.id) milestoneScore += 3;
      breakdown.push({ label: '里程碑', value: milestoneScore });
      score += milestoneScore;

      p.score = score;
      p.breakdown = breakdown;
    }
  }

  startGame(city1, city2, name1, name2) {
    if (name1) this.players[0].name = name1;
    if (name2) this.players[1].name = name2;
    this.players[0].city = city1;
    this.players[0].visitedCities.add(city1);
    this.players[1].city = city2;
    this.players[1].visitedCities.add(city2);
    this.phase = 'playing';
    this.startRound();
  }

  addLog(msg) {
    this.log.push({ round: this.round, msg });
  }
}
