// 山河游记 - AI 对手（确定性滚动推演 + 终局估值）

class AI {
  constructor(game) {
    this.game = game;
    AI.initCache();
  }

  pickAction(actions) {
    if (!actions || actions.length === 0) return null;
    if (actions.length === 1) return actions[0];

    const playerId = this.game.currentPlayer;
    const baseScore = this.quickEvaluate(this.game, playerId);
    let best = actions[0];
    let bestScore = -Infinity;

    for (const action of actions) {
      const firstMoveScore = this.actionScore(action, this.game, playerId);
      const sim = this.cloneGame(this.game);
      sim.executeAction(this.copyAction(action));
      if (action.type === 'food' && sim.phase !== 'end' && sim.currentPlayer === playerId) {
        this.finishFoodFollowup(sim, playerId);
      }

      let score = this.quickEvaluate(sim, playerId);

      // Keep the projection grounded in the real first move. This helps avoid
      // over-valuing a good later route after throwing away a premium local card.
      score += firstMoveScore * 0.72;
      score += (score - baseScore) * 0.04;

      if (score > bestScore + 0.0001 || (Math.abs(score - bestScore) <= 0.0001 && this.tieRank(action) > this.tieRank(best))) {
        bestScore = score;
        best = action;
      }
    }

    return best;
  }

  quickEvaluate(game, playerId) {
    const me = game.players[playerId];
    const opp = game.players[1 - playerId];
    return this.playerScore(me, game) - this.playerScore(opp, game)
      + this.cityFastValue(game, me.city, me) * 0.08
      - this.cityFastValue(game, opp.city, opp) * 0.05;
  }

  finishTurnGreedy(game, playerId, limit) {
    let steps = 0;
    while (game.phase !== 'end' && game.currentPlayer === playerId && steps++ < limit) {
      const actions = game.getAvailableActions();
      if (!actions || actions.length === 0) break;
      const choice = this.greedyAction(game, actions);
      if (!choice) break;
      game.executeAction(this.copyAction(choice));
    }
  }

  finishFoodFollowup(game, playerId) {
    if (game.phase === 'end' || game.currentPlayer !== playerId) return;
    const actions = game.getAvailableActions();
    if (!actions || actions.length === 0) return;
    const followups = actions.filter(a => a.type !== 'food' && a.type !== 'rest');
    if (followups.length === 0) return;
    const choice = this.greedyAction(game, followups);
    if (choice) game.executeAction(this.copyAction(choice));
  }

  search(game, rootPlayer, depth) {
    if (game.phase === 'end' || depth <= 0) return this.evaluateGame(game, rootPlayer);
    const actions = game.getAvailableActions();
    if (!actions || actions.length === 0) return this.evaluateGame(game, rootPlayer);

    const ranked = [];
    for (const action of actions) {
      ranked.push({ action, score: this.actionScore(action, game, game.currentPlayer) });
    }
    ranked.sort((a, b) => b.score - a.score);

    const beam = [];
    const maxBeam = game.currentPlayer === rootPlayer ? 7 : 5;
    for (const item of ranked) {
      if (beam.length < maxBeam || item.action.type === 'rest') beam.push(item.action);
      if (beam.length >= maxBeam && beam.some(a => a.type === 'rest')) break;
    }

    const maximize = game.currentPlayer === rootPlayer;
    let best = maximize ? -Infinity : Infinity;
    for (const action of beam) {
      const sim = this.cloneGame(game);
      sim.executeAction(this.copyAction(action));
      const val = this.search(sim, rootPlayer, depth - 1);
      if (maximize) {
        if (val > best) best = val;
      } else if (val < best) {
        best = val;
      }
    }
    return best;
  }

  rollout(game, limit) {
    let safety = 0;
    while (game.phase !== 'end' && safety++ < limit) {
      const actions = game.getAvailableActions();
      if (!actions || actions.length === 0) break;
      const choice = this.greedyAction(game, actions);
      if (!choice) break;
      game.executeAction(this.copyAction(choice));
    }
    if (game.phase !== 'end') game.calculateFinalScores();
  }

  greedyAction(game, actions) {
    if (actions.length === 1) return actions[0];
    const playerId = game.currentPlayer;
    let best = actions[0];
    let bestScore = -Infinity;
    for (const action of actions) {
      const s = this.actionScore(action, game, playerId);
      if (s > bestScore + 0.0001 || (Math.abs(s - bestScore) <= 0.0001 && this.tieRank(action) > this.tieRank(best))) {
        bestScore = s;
        best = action;
      }
    }
    return best;
  }

  actionScore(action, game, playerId) {
    const p = game.players[playerId];
    const opp = game.players[1 - playerId];
    const roundsLeft = game.maxRounds - game.round + 1;
    const base = this.playerScore(p, game);

    if (action.type === 'rest') {
      if (p.inTransit > 0) return 1000;
      const local = this.bestPackAtCity(game, p.city, p, p.stamina, p.money, roundsLeft);
      const future = this.nearbyValue(game, p.city, p, Math.min(3, Math.max(1, roundsLeft)), p.money + 2, roundsLeft);
      let rest = p.staminaBonus > 0 ? -0.6 : 0.35;
      if (p.stamina <= 1 && future > 5) rest += 0.75;
      if (local > 1.2) rest -= local * 0.9;
      if (roundsLeft <= 1) rest -= 2;
      return rest;
    }

    const q = this.copyPlayer(p);
    q.stamina -= action.cost.stamina;
    q.money -= action.cost.money;
    let score = -action.cost.stamina * 0.08;

    if (action.type === 'move') {
      q.city = action.target;
      q.visitedCities.add(action.target);
      if (action.distance > 1) q.inTransit = action.distance - 1;
      if (q.freeMove) q.freeMove = false;

      score += this.playerScore(q, game) - base;
      const sameTurn = action.distance > 1 ? 0 : this.bestPackAtCity(game, action.target, q, q.stamina, q.money, roundsLeft) * 0.92;
      const futureTurns = Math.max(0, roundsLeft - (action.distance > 1 ? action.distance - 1 : 0));
      const route = this.nearbyValue(game, action.target, q, Math.min(4, futureTurns), q.money + futureTurns * 2, roundsLeft) * 0.32;
      const contest = this.cityContestValue(game, action.target, p, opp) * (game.currentPlayer === 0 ? 0.45 : 0.25);
      score += sameTurn + route + contest;
      score -= Math.max(0, action.distance - 1) * (roundsLeft <= 4 ? 2.2 : 1.25);
      score -= action.cost.money * 0.18;
      if (roundsLeft <= 2 && sameTurn < 3) score -= 2.5;
      return score;
    }

    if (action.type === 'scenic') {
      q.scenics.add(action.target);
    } else if (action.type === 'food') {
      q.foods.add(action.target);
      q.stamina += 1;                                                                  // food restores stamina
    } else if (action.type === 'treasure') {
      q.treasures.add(action.target);
      if (action.target === 't22') q.freeMove = true;
    }

    score += this.playerScore(q, game) - base;
    score += this.cardFutureValue(action.type, action.target, q, game, roundsLeft);
    score += this.denyValue(action, game, p, opp);
    score -= action.cost.money * 0.16;

    if (q.stamina > 0) score += this.bestSingleAtCity(game, p.city, q, roundsLeft) * 0.16;

    // Food-as-stamina: value the extra stamina by the marginal local pack it unlocks.
    // This captures cases where +1 stamina enables a treasure or another scenic,
    // instead of applying a fixed multiplier to the single best card.
    if (action.type === 'food' && q.stamina >= 1) {
      score += this.marginalStaminaValue(game, p.city, q, roundsLeft) * 0.82;
    }

    if (roundsLeft <= 2 && action.type !== 'food') score += 0.35;

    return score;
  }

  cardFutureValue(type, id, p, game, roundsLeft) {
    if (type === 'food') {
      const food = AI.foodById[id];
      return this.foodProgressValue(food, p, game);
    }
    if (type === 'scenic') {
      return this.scenicSynergyValue(id, p, game);
    }
    if (type === 'treasure') {
      const t = AI.treasureById[id];
      let v = this.treasureProgressValue(t, p, game);
      if (id === 't4') v += Math.max(0, roundsLeft - 1) * 0.55;
      if (id === 't22') v += 1.0;
      if (id === 't3' && game.round < 10) v += 0.8;
      return v;
    }
    return 0;
  }

  foodProgressValue(food, p, game) {
    const cuisines = this.cuisineSet(p);
    const counts = this.cuisineCounts(p);
    const beforeKinds = cuisines.size;
    const count = counts[food.cuisine] || 0;
    let v = 0.18;

    if (count === 0) {
      const afterKinds = beforeKinds + 1;
      if (afterKinds <= 3) v += game.milestones.foodie === null ? 1.65 : 0.95;
      else if (afterKinds <= 5) v += 1.85;
      else if (afterKinds <= 8) v += 2.25;
      else v += 0.35;

      if ((food.cuisine === '东北菜' && cuisines.has('粤菜')) || (food.cuisine === '粤菜' && cuisines.has('东北菜'))) v += 1.7;
      const spicy = ['川菜', '湘菜', '黔菜'];
      if (spicy.includes(food.cuisine)) {
        const have = spicy.filter(c => cuisines.has(c)).length;
        if (have === 2) v += 2.4;
        else if (have === 1) v += 0.85;
      }
    } else {
      if (count === 1) v += 0.65;
      else if (count === 2) v += 3.2;
      else v -= 0.15;
    }
    return v;
  }

  scenicSynergyValue(id, p, game) {
    let v = 0;
    const s = AI.scenicById[id];
    const city = s ? s.city : p.city;
    if (['beijing', 'xian', 'nanjing', 'suzhou', 'hangzhou', 'jingdezhen', 'dunhuang', 'lasa', 'chengdu', 'chongqing'].includes(city)) v += 0.45;

    for (const other of SCENIC_CARDS) {
      if (p.scenics.has(other.id) || game.takenScenics.has(other.id)) continue;
      const before = other.bonusCheck(this.playerWithout(p, 'scenics', id), game);
      const after = other.bonusCheck(p, game);
      if (after > before) v += Math.min(1.4, (after - before) * 0.55);
    }
    return v;
  }

  treasureProgressValue(t, p, game) {
    let v = 0;
    const before = this.playerWithout(p, 'treasures', t.id);
    const embBefore = this.embroideryCount(before);
    const embAfter = this.embroideryCount(p);
    if (p.treasures.size === 3 && game.milestones.collector === null) v += 2.4;
    if (before.treasures.size < 6 && p.treasures.size >= 6) v += 4.3;
    if (embBefore < 3 && embAfter >= 3) v += 4.1;
    else if (embAfter > embBefore && embAfter < 3) v += 0.85;

    const partners = AI.treasurePartners[t.id] || [];
    for (const pid of partners) {
      if (p.treasures.has(pid)) v += 0.8;
      else if (!game.takenTreasures.has(pid)) v += 0.75;
    }

    for (const sc of SCENIC_CARDS) {
      if (!p.scenics.has(sc.id)) continue;
      const beforeBonus = sc.bonusCheck(before, game);
      const afterBonus = sc.bonusCheck(p, game);
      if (afterBonus > beforeBonus) v += (afterBonus - beforeBonus) * 0.85;
    }
    return v;
  }

  treasureComboGain(tid, p) {
    let bonus = 0;
    if (tid !== 't1' && p.treasures.has('t1')) bonus += 1;
    if (tid === 't1' && p.treasures.size > 0) bonus += 1;
    for (const combo of AI.treasureCombos) {
      if (tid === combo[0] && p.treasures.has(combo[1])) bonus += combo[2];
      else if (tid === combo[1] && p.treasures.has(combo[0])) bonus += combo[2];
    }
    return bonus;
  }

  bestPackAtCity(game, city, p, stamina, money, roundsLeft) {
    if (stamina <= 0 || money < 0) return 0;
    const opts = this.cityOptions(game, city, p, roundsLeft);
    let total = 0;
    let sLeft = stamina;
    let mLeft = money;
    for (const o of opts) {
      if (o.stamina <= sLeft && o.money <= mLeft) {
        total += o.value;
        sLeft -= o.stamina;
        mLeft -= o.money;
      }
    }
    return total;
  }

  bestSingleAtCity(game, city, p, roundsLeft) {
    let best = p.visitedCities.has(city) ? 0 : 1;
    const opts = this.cityOptions(game, city, p, roundsLeft);
    for (const o of opts) if (o.value > best) best = o.value;
    return best;
  }

  bestNonFoodSingleAtCity(game, city, p, roundsLeft) {
    let best = 0;
    const opts = this.cityOptions(game, city, p, roundsLeft);
    for (const o of opts) if (o.kind !== 'food' && o.value > best) best = o.value;
    return best;
  }

  marginalStaminaValue(game, city, p, roundsLeft) {
    const withExtra = this.bestNonFoodPackAtCity(game, city, p, p.stamina, p.money, roundsLeft);
    const withoutExtra = this.bestNonFoodPackAtCity(game, city, p, Math.max(0, p.stamina - 1), p.money, roundsLeft);
    return Math.max(0, withExtra - withoutExtra);
  }

  bestNonFoodPackAtCity(game, city, p, stamina, money, roundsLeft) {
    if (stamina <= 0 || money < 0) return 0;
    const opts = this.nonFoodOptionsAtCity(game, city, p, roundsLeft);
    let total = 0;
    let sLeft = stamina;
    let mLeft = money;
    for (const o of opts) {
      if (o.stamina <= sLeft && o.money <= mLeft) {
        total += o.value;
        sLeft -= o.stamina;
        mLeft -= o.money;
      }
    }
    return total;
  }

  nonFoodOptionsAtCity(game, city, p, roundsLeft) {
    const out = [];
    const base = this.playerScore(p, game);
    const addOption = (kind, card, stamina, money) => {
      if (money > p.money) return;
      const q = this.copyPlayer(p);
      q.money -= money;
      q.stamina -= stamina;
      if (kind === 'scenic') q.scenics.add(card.id);
      else {
        q.treasures.add(card.id);
        if (card.id === 't22') q.freeMove = true;
      }
      const raw = this.playerScore(q, game) - base + this.cardFutureValue(kind, card.id, q, game, roundsLeft);
      out.push({ kind, stamina, money, value: Math.max(0.05, raw - money * 0.1) });
    };

    const cards = AI.cardsByCity[city] || { scenics: [], foods: [], treasures: [] };
    for (const s of cards.scenics) {
      const sCost = Math.max(0, s.baseScore - 2);
      if (!game.takenScenics.has(s.id) && !p.scenics.has(s.id) && p.money >= sCost) addOption('scenic', s, 1, sCost);
    }
    for (const t of cards.treasures) {
      const cost = Math.max(0, t.cost + p.treasureCostModifier);
      if (!game.takenTreasures.has(t.id) && !p.treasures.has(t.id) && p.money >= cost) addOption('treasure', t, 2, cost);
    }
    out.sort((a, b) => (b.value / b.stamina) - (a.value / a.stamina));
    return out;
  }

  cityOptions(game, city, p, roundsLeft) {
    const out = [];
    const base = this.playerScore(p, game);
    const addOption = (kind, card, stamina, money) => {
      if (money > p.money) return;
      const q = this.copyPlayer(p);
      q.money -= money;
      q.stamina -= stamina;
      if (kind === 'scenic') q.scenics.add(card.id);
      else if (kind === 'food') { q.foods.add(card.id); q.stamina += 1; } // food restores +1 stamina
      else q.treasures.add(card.id);
      const raw = this.playerScore(q, game) - base + this.cardFutureValue(kind, card.id, q, game, roundsLeft);
      out.push({ kind, stamina, money, value: Math.max(0.05, raw - money * 0.1) });
    };

    const cards = AI.cardsByCity[city] || { scenics: [], foods: [], treasures: [] };
    for (const s of cards.scenics) {
      const sCost = Math.max(0, s.baseScore - 2);
      if (!game.takenScenics.has(s.id) && !p.scenics.has(s.id) && p.money >= sCost) addOption('scenic', s, 1, sCost);
    }
    for (const f of cards.foods) {
      const cost = Math.max(0, f.cost + p.foodCostModifier);
      if (!game.takenFoods.has(f.id) && !p.foods.has(f.id) && p.money >= cost) addOption('food', f, 0, cost);
    }
    for (const t of cards.treasures) {
      const cost = Math.max(0, t.cost + p.treasureCostModifier);
      if (!game.takenTreasures.has(t.id) && !p.treasures.has(t.id) && p.money >= cost) addOption('treasure', t, 2, cost);
    }
    out.sort((a, b) => (b.value / b.stamina) - (a.value / a.stamina));
    return out.slice(0, 9);
  }

  nearbyValue(game, city, p, turns, money, roundsLeft) {
    if (turns <= 0) return 0;
    let v = 0;
    for (const dest in CITIES) {
      const d = AI.dist[city] && AI.dist[city][dest];
      if (d === undefined || d === 0 || d > turns + 1) continue;
      const travelCost = d * Math.max(0, 1 + p.moveCostModifier);
      if (money < travelCost) continue;
      const pack = this.cityFastValue(game, dest, p);
      const visit = p.visitedCities.has(dest) ? 0 : 1.1;
      const val = (pack + visit) / (1 + d * 0.75);
      if (val > v) v = val;
    }
    return v;
  }

  cityFastValue(game, city, p) {
    if (!city) return 0;
    const cards = AI.cardsByCity[city] || { scenics: [], foods: [], treasures: [] };
    const vals = [];
    for (const s of cards.scenics) {
      if (!game.takenScenics.has(s.id) && !p.scenics.has(s.id)) vals.push(s.baseScore + s.bonusCheck(p, game));
    }
    for (const f of cards.foods) {
      const cost = Math.max(0, f.cost + p.foodCostModifier);
      if (!game.takenFoods.has(f.id) && !p.foods.has(f.id) && p.money >= cost) vals.push(this.foodProgressValue(f, p, game) - cost * 0.15);
    }
    for (const t of cards.treasures) {
      const cost = Math.max(0, t.cost + p.treasureCostModifier);
      if (!game.takenTreasures.has(t.id) && !p.treasures.has(t.id) && p.money >= cost) vals.push(t.score + this.treasureComboGain(t.id, p) - cost * 0.1);
    }
    vals.sort((a, b) => b - a);
    return (vals[0] || 0) + (vals[1] || 0) * 0.65 + (vals[2] || 0) * 0.35;
  }

  cityContestValue(game, city, p, opp) {
    if (!opp || !opp.city) return 0;
    const myDist = AI.dist[p.city] && AI.dist[p.city][city];
    const oppDist = AI.dist[opp.city] && AI.dist[opp.city][city];
    if (oppDist === undefined || myDist === undefined || oppDist > myDist + 1) return 0;
    let v = 0;
    const cards = AI.cardsByCity[city] || { scenics: [], foods: [], treasures: [] };
    for (const s of cards.scenics) if (!game.takenScenics.has(s.id)) v += Math.max(0, s.baseScore - 2) * 0.22;
    for (const t of cards.treasures) if (!game.takenTreasures.has(t.id) && t.score >= 4) v += 0.85;
    return Math.min(2.5, v);
  }

  denyValue(action, game, p, opp) {
    if (!opp || !opp.city) return 0;
    let city = p.city;
    let raw = 0;
    if (action.type === 'scenic') {
      const s = AI.scenicById[action.target];
      raw = s ? s.baseScore + s.bonusCheck(opp, game) : 0;
      city = s ? s.city : city;
    } else if (action.type === 'treasure') {
      const t = AI.treasureById[action.target];
      raw = t ? t.score + this.cardFutureValue('treasure', t.id, this.copyPlayer(opp), game, game.maxRounds - game.round + 1) : 0;
      city = t ? t.city : city;
    } else if (action.type === 'food') {
      const f = AI.foodById[action.target];
      raw = f ? this.foodProgressValue(f, opp, game) : 0;
      city = f ? f.city : city;
    }
    const d = AI.dist[opp.city] && AI.dist[opp.city][city];
    if (d === 0) return raw * 0.22;
    if (d === 1) return raw * 0.10;
    return 0;
  }

  evaluateGame(game, playerId) {
    if (game.phase === 'end' && typeof game.players[0].score === 'number') {
      return game.players[playerId].score - game.players[1 - playerId].score;
    }
    const me = game.players[playerId];
    const opp = game.players[1 - playerId];
    const roundsLeft = Math.max(0, game.maxRounds - game.round + 1);
    return (this.playerScore(me, game) - this.playerScore(opp, game))
      + this.futurePotential(game, me, roundsLeft) * 0.32
      - this.futurePotential(game, opp, roundsLeft) * 0.24;
  }

  futurePotential(game, p, roundsLeft) {
    if (roundsLeft <= 0 || !p.city) return 0;
    let v = 0;
    const budget = p.money + roundsLeft * 2 + (p.treasures.has('t4') ? roundsLeft : 0);
    v += this.bestPackAtCity(game, p.city, p, Math.max(1, p.stamina), budget, roundsLeft) * 0.55;
    v += this.nearbyValue(game, p.city, p, Math.min(5, roundsLeft), budget, roundsLeft) * 0.85;
    if (p.visitedCities.size < 5 && game.milestones.explorer === null) v += (5 - p.visitedCities.size) * 0.28;
    if (this.cuisineSet(p).size < 3 && game.milestones.foodie === null) v += (3 - this.cuisineSet(p).size) * 0.45;
    if (p.treasures.size < 3 && game.milestones.collector === null) v += (3 - p.treasures.size) * 0.42;
    return v;
  }

  playerScore(p, game) {
    let score = 0;

    for (const sid of p.scenics) {
      const s = AI.scenicById[sid];
      if (s) score += s.baseScore + s.bonusCheck(p, game);
    }

    const cuisines = new Set();
    const cuisineCounts = {};
    for (const fid of p.foods) {
      const f = AI.foodById[fid];
      if (!f) continue;
      cuisines.add(f.cuisine);
      cuisineCounts[f.cuisine] = (cuisineCounts[f.cuisine] || 0) + 1;
    }
    if (cuisines.size >= 8) score += 10;
    else if (cuisines.size >= 5) score += 5;
    else if (cuisines.size >= 3) score += 2;
    for (const c in cuisineCounts) if (cuisineCounts[c] >= 3) score += 4;
    if (cuisines.has('东北菜') && cuisines.has('粤菜')) score += 2;
    if (cuisines.has('川菜') && cuisines.has('湘菜') && cuisines.has('黔菜')) score += 3;

    for (const tid of p.treasures) {
      const t = AI.treasureById[tid];
      if (t) score += t.score;
    }
    if (p.treasures.has('t1') && p.treasures.size > 1) score += 1;
    for (const combo of AI.treasureCombos) {
      if (p.treasures.has(combo[0]) && p.treasures.has(combo[1])) score += combo[2];
    }
    if (p.treasures.has('t3') && game.round >= 10) score += 2;
    if (p.treasures.size >= 6) score += 5;
    if (this.embroideryCount(p) >= 3) score += 5;

    score += p.visitedCities.size;
    score += Math.floor(Math.max(0, p.money) / 3);
    if (game.milestones.explorer === p.id) score += 3;
    if (game.milestones.foodie === p.id) score += 3;
    if (game.milestones.collector === p.id) score += 3;
    return score;
  }

  cuisineSet(p) {
    const set = new Set();
    for (const fid of p.foods) {
      const f = AI.foodById[fid];
      if (f) set.add(f.cuisine);
    }
    return set;
  }

  cuisineCounts(p) {
    const counts = {};
    for (const fid of p.foods) {
      const f = AI.foodById[fid];
      if (f) counts[f.cuisine] = (counts[f.cuisine] || 0) + 1;
    }
    return counts;
  }

  embroideryCount(p) {
    let n = 0;
    for (const tid of p.treasures) if (AI.embroideries[tid]) n++;
    return n;
  }

  playerWithout(p, field, id) {
    const q = this.copyPlayer(p);
    q[field].delete(id);
    return q;
  }

  copyPlayer(p) {
    return {
      id: p.id,
      name: p.name,
      isAI: p.isAI,
      city: p.city,
      stamina: p.stamina,
      money: p.money,
      visitedCities: new Set(p.visitedCities),
      scenics: new Set(p.scenics),
      foods: new Set(p.foods),
      treasures: new Set(p.treasures),
      score: p.score,
      breakdown: p.breakdown,
      inTransit: p.inTransit,
      freeMove: p.freeMove,
      extraMoveAllowed: p.extraMoveAllowed,
      moveCostModifier: p.moveCostModifier,
      foodCostModifier: p.foodCostModifier,
      treasureCostModifier: p.treasureCostModifier,
      scenicScoreModifier: p.scenicScoreModifier,
      staminaBonus: p.staminaBonus,
    };
  }

  cloneGame(game) {
    const g = new Game();
    g.round = game.round;
    g.maxRounds = game.maxRounds;
    g.phase = game.phase;
    g.currentPlayer = game.currentPlayer;
    g.actionsRemaining = game.actionsRemaining;
    g.currentEvent = game.currentEvent;
    g.eventDeck = game.eventDeck.slice();
    g.log = [];
    g.takenScenics = new Set(game.takenScenics);
    g.takenFoods = new Set(game.takenFoods);
    g.takenTreasures = new Set(game.takenTreasures);
    g.milestones = {
      explorer: game.milestones.explorer,
      foodie: game.milestones.foodie,
      collector: game.milestones.collector,
    };
    g.players = [this.copyPlayer(game.players[0]), this.copyPlayer(game.players[1])];
    return g;
  }

  copyAction(action) {
    return {
      type: action.type,
      target: action.target,
      distance: action.distance,
      label: action.label,
      cost: { stamina: action.cost.stamina, money: action.cost.money },
    };
  }

  tieRank(action) {
    if (!action) return -1;
    if (action.type === 'scenic') return 4;
    if (action.type === 'treasure') return 3;
    if (action.type === 'food') return 2;
    if (action.type === 'move') return 1;
    return 0;
  }

  static initCache() {
    if (AI._ready) return;
    AI.scenicById = {};
    AI.foodById = {};
    AI.treasureById = {};
    AI.cardsByCity = {};
    for (const city in CITIES) AI.cardsByCity[city] = { scenics: [], foods: [], treasures: [] };
    for (const s of SCENIC_CARDS) {
      AI.scenicById[s.id] = s;
      AI.cardsByCity[s.city].scenics.push(s);
    }
    for (const f of FOOD_CARDS) {
      AI.foodById[f.id] = f;
      AI.cardsByCity[f.city].foods.push(f);
    }
    for (const t of TREASURE_CARDS) {
      AI.treasureById[t.id] = t;
      AI.cardsByCity[t.city].treasures.push(t);
    }

    AI.treasureCombos = [
      ['t2', 't22', 2], ['t8', 't10', 3], ['t23', 't29', 4],
      ['t6', 't25', 2], ['t5', 't25', 2], ['t5', 't6', 2],
      ['t9', 't27', 2], ['t14', 't10', 2], ['t16', 't15', 2],
      ['t36', 't28', 2], ['t33', 't17', 2], ['t51', 't33', 2],
    ];
    AI.treasurePartners = {};
    for (const c of AI.treasureCombos) {
      if (!AI.treasurePartners[c[0]]) AI.treasurePartners[c[0]] = [];
      if (!AI.treasurePartners[c[1]]) AI.treasurePartners[c[1]] = [];
      AI.treasurePartners[c[0]].push(c[1]);
      AI.treasurePartners[c[1]].push(c[0]);
    }
    AI.embroideries = {};
    for (const id of ['t5','t6','t12','t13','t15','t16','t21','t25','t28','t30','t38','t39','t40','t42']) {
      AI.embroideries[id] = true;
    }

    AI.graph = {};
    for (const city in CITIES) AI.graph[city] = [];
    for (const e of RAIL_CONNECTIONS) {
      AI.graph[e[0]].push({ city: e[1], d: e[2] });
      AI.graph[e[1]].push({ city: e[0], d: e[2] });
    }
    AI.dist = {};
    for (const city in CITIES) AI.dist[city] = AI.shortestFrom(city);
    AI._ready = true;
  }

  static shortestFrom(start) {
    const dist = {};
    const open = [{ city: start, d: 0 }];
    dist[start] = 0;
    while (open.length) {
      open.sort((a, b) => a.d - b.d);
      const cur = open.shift();
      if (cur.d !== dist[cur.city]) continue;
      for (const edge of AI.graph[cur.city]) {
        const nd = cur.d + edge.d;
        if (dist[edge.city] === undefined || nd < dist[edge.city]) {
          dist[edge.city] = nd;
          open.push({ city: edge.city, d: nd });
        }
      }
    }
    return dist;
  }
}
