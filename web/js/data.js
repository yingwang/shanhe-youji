// 山河游记 - 游戏数据
// Cities, rail connections, cards

const CITIES = {
  // 东北
  hulunbuir: { name: '呼伦贝尔', x: 680, y: 42 },
  harbin: { name: '哈尔滨', x: 740, y: 78 },
  changbaishan: { name: '长白山', x: 790, y: 115 },
  // 华北
  beijing: { name: '北京', x: 620, y: 165 },
  pingyao: { name: '平遥', x: 540, y: 220 },
  jinan: { name: '济南', x: 630, y: 235 },
  qingdao: { name: '青岛', x: 700, y: 230 },
  kaifeng: { name: '开封', x: 560, y: 275 },
  luoyang: { name: '洛阳', x: 510, y: 300 },
  // 西北
  lanzhou: { name: '兰州', x: 390, y: 250 },
  dunhuang: { name: '敦煌', x: 280, y: 180 },
  kashi: { name: '喀什', x: 150, y: 200 },
  xian: { name: '西安', x: 470, y: 305 },
  // 华东 — 江苏
  yangzhou: { name: '扬州', x: 660, y: 310 },
  nanjing: { name: '南京', x: 640, y: 340 },
  yixing: { name: '宜兴', x: 680, y: 360 },
  suzhou: { name: '苏州', x: 720, y: 365 },
  shanghai: { name: '上海', x: 750, y: 340 },
  // 华东 — 浙江
  hangzhou: { name: '杭州', x: 710, y: 400 },
  shaoxing: { name: '绍兴', x: 740, y: 420 },
  // 华东 — 安徽/江西
  huangshan: { name: '黄山', x: 660, y: 395 },
  jingdezhen: { name: '景德镇', x: 620, y: 425 },
  // 华中
  wuhan: { name: '武汉', x: 560, y: 375 },
  changsha: { name: '长沙', x: 540, y: 430 },
  zhangjiajie: { name: '张家界', x: 490, y: 440 },
  // 闽南 — 拉开间距
  fuzhou: { name: '福州', x: 700, y: 455 },
  quanzhou: { name: '泉州', x: 680, y: 490 },
  xiamen: { name: '厦门', x: 660, y: 520 },
  chaozhou: { name: '潮州', x: 630, y: 540 },
  // 岭南
  guangzhou: { name: '广州', x: 560, y: 530 },
  foshan: { name: '佛山', x: 530, y: 555 },
  // 西南
  chengdu: { name: '成都', x: 390, y: 380 },
  jiuzhaigou: { name: '九寨沟', x: 360, y: 340 },
  leshan: { name: '乐山', x: 380, y: 420 },
  chongqing: { name: '重庆', x: 430, y: 410 },
  guiyang: { name: '贵阳', x: 440, y: 475 },
  guilin: { name: '桂林', x: 490, y: 505 },
  nanning: { name: '南宁', x: 450, y: 540 },
  // 云南
  kunming: { name: '昆明', x: 370, y: 490 },
  dali: { name: '大理', x: 320, y: 475 },
  lijiang: { name: '丽江', x: 300, y: 445 },
  xishuangbanna: { name: '西双版纳', x: 340, y: 545 },
  // 青藏
  lasa: { name: '拉萨', x: 240, y: 380 },
  // 海南
  sanya: { name: '三亚', x: 500, y: 600 },
};

// Rail connections: [cityA, cityB, distance in rounds]
const RAIL_CONNECTIONS = [
  // 京沪线
  ['beijing', 'jinan', 1],
  ['jinan', 'nanjing', 1],
  ['nanjing', 'shanghai', 1],
  // 京广线
  ['beijing', 'kaifeng', 1],
  ['kaifeng', 'wuhan', 1],
  ['wuhan', 'changsha', 1],
  ['changsha', 'guangzhou', 1],
  // 沪昆线
  ['shanghai', 'hangzhou', 1],
  ['hangzhou', 'changsha', 2],
  ['changsha', 'guiyang', 1],
  ['guiyang', 'kunming', 1],
  // 京西线
  ['beijing', 'pingyao', 1],
  ['pingyao', 'xian', 1],
  ['xian', 'chengdu', 1],
  // 东南沿海线
  ['shanghai', 'shaoxing', 1],
  ['shaoxing', 'hangzhou', 1],
  ['hangzhou', 'fuzhou', 2],
  ['fuzhou', 'quanzhou', 1],
  ['quanzhou', 'xiamen', 1],
  // 赣闽线
  ['nanjing', 'jingdezhen', 1],
  ['jingdezhen', 'fuzhou', 1],
  // 西南线
  ['chengdu', 'chongqing', 1],
  ['chongqing', 'guiyang', 1],
  ['guiyang', 'guilin', 1],
  ['guilin', 'guangzhou', 1],
  // 兰新线
  ['xian', 'lanzhou', 1],
  ['lanzhou', 'dunhuang', 2],
  ['dunhuang', 'kashi', 2],
  // 青藏线
  ['xian', 'lasa', 3],
  // 东北线
  ['beijing', 'harbin', 1],
  ['harbin', 'changbaishan', 1],
  // 苏南支线
  ['nanjing', 'yangzhou', 1],
  ['nanjing', 'yixing', 1],
  ['yixing', 'suzhou', 1],
  ['suzhou', 'shanghai', 1],
  // 山东线
  ['jinan', 'qingdao', 1],
  // 洛阳线
  ['kaifeng', 'luoyang', 1],
  ['luoyang', 'xian', 1],
  // 云南线
  ['kunming', 'dali', 1],
  ['dali', 'lijiang', 1],
  ['kunming', 'xishuangbanna', 2],
  // 潮汕线
  ['xiamen', 'chaozhou', 1],
  ['chaozhou', 'guangzhou', 1],
  // 南广线
  ['guangzhou', 'foshan', 1],
  ['guangzhou', 'nanning', 1],
  ['nanning', 'guilin', 1],
  // 川西线
  ['chengdu', 'leshan', 1],
  ['chengdu', 'jiuzhaigou', 2],
  // 张家界线
  ['changsha', 'zhangjiajie', 1],
  // 海南线
  ['guangzhou', 'sanya', 2],
  // 黄山线
  ['jingdezhen', 'huangshan', 1],
  ['huangshan', 'hangzhou', 1],
  // 呼伦贝尔线
  ['harbin', 'hulunbuir', 2],
];

// Scenic spot cards
const SCENIC_CARDS = [
  { id: 's1', name: '故宫', city: 'beijing', baseScore: 4, bonus: '同时拥有兵马俑 +2', bonusCheck: (p) => p.scenics.has('s35') ? 2 : 0 },
  { id: 's2', name: '长城·八达岭', city: 'beijing', baseScore: 3, bonus: '到访≥8城 +2', bonusCheck: (p) => p.visitedCities.size >= 8 ? 2 : 0 },
  { id: 's3', name: '颐和园', city: 'beijing', baseScore: 2, bonus: '拥有拙政园 +2', bonusCheck: (p) => p.scenics.has('s10') ? 2 : 0 },
  { id: 's4', name: '冰雪大世界', city: 'harbin', baseScore: 3, bonus: '最后3回合到达 +2', bonusCheck: (p, g) => g.round >= 10 ? 2 : 0 },
  { id: 's5', name: '圣索菲亚教堂', city: 'harbin', baseScore: 2, bonus: '', bonusCheck: () => 0 },
  { id: 's6', name: '外滩·豫园', city: 'shanghai', baseScore: 3, bonus: '拥有海派旗袍 +1', bonusCheck: (p) => p.treasures.has('t4') ? 1 : 0 },
  { id: 's7', name: '朱家角古镇', city: 'shanghai', baseScore: 2, bonus: '2张江南美食 +1', bonusCheck: (p) => countCuisineRegion(p, 'jiangnan') >= 2 ? 1 : 0 },
  { id: 's8', name: '中山陵', city: 'nanjing', baseScore: 3, bonus: '到访北京+西安 +2', bonusCheck: (p) => p.visitedCities.has('beijing') && p.visitedCities.has('xian') ? 2 : 0 },
  { id: 's9', name: '夫子庙·秦淮河', city: 'nanjing', baseScore: 2, bonus: '2道南京美食 +1', bonusCheck: (p) => countFoodByCity(p, 'nanjing') >= 2 ? 1 : 0 },
  { id: 's10', name: '拙政园', city: 'suzhou', baseScore: 3, bonus: '拥有苏绣 +2', bonusCheck: (p) => p.treasures.has('t6') ? 2 : 0 },
  { id: 's11', name: '虎丘', city: 'suzhou', baseScore: 2, bonus: '2张江南景区 +1', bonusCheck: (p) => countJiangnanScenics(p) >= 2 ? 1 : 0 },
  { id: 's12', name: '平江路', city: 'suzhou', baseScore: 1, bonus: '苏州美食 +1', bonusCheck: (p) => countFoodByCity(p, 'suzhou') >= 1 ? 1 : 0 },
  { id: 's13', name: '西湖', city: 'hangzhou', baseScore: 3, bonus: '龙井虾仁+1; 2江南景区+2', bonusCheck: (p) => (p.foods.has('f21') ? 1 : 0) + (countJiangnanScenics(p) >= 2 ? 2 : 0) },
  { id: 's14', name: '灵隐寺', city: 'hangzhou', baseScore: 2, bonus: '拥有唐卡 +2', bonusCheck: (p) => p.treasures.has('t29') ? 2 : 0 },
  { id: 's15', name: '竹海', city: 'yixing', baseScore: 2, bonus: '拥有紫砂 +2', bonusCheck: (p) => p.treasures.has('t9') ? 2 : 0 },
  { id: 's16', name: '古窑民俗博览区', city: 'jingdezhen', baseScore: 3, bonus: '拥有景德镇瓷器 +3', bonusCheck: (p) => p.treasures.has('t10') ? 3 : 0 },
  { id: 's17', name: '御窑厂遗址', city: 'jingdezhen', baseScore: 2, bonus: '2件瓷器瑰宝 +2', bonusCheck: (p) => countCeramicTreasures(p) >= 2 ? 2 : 0 },
  { id: 's18', name: '黄山风景区', city: 'huangshan', baseScore: 4, bonus: '到访≥6城 +1', bonusCheck: (p) => p.visitedCities.size >= 6 ? 1 : 0 },
  { id: 's19', name: '宏村', city: 'huangshan', baseScore: 2, bonus: '拥有徽墨 +2', bonusCheck: (p) => p.treasures.has('t11') ? 2 : 0 },
  { id: 's20', name: '黄鹤楼', city: 'wuhan', baseScore: 3, bonus: '名楼 +2', bonusCheck: () => 0 }, // simplified
  { id: 's21', name: '东湖', city: 'wuhan', baseScore: 2, bonus: '2道武汉美食 +1', bonusCheck: (p) => countFoodByCity(p, 'wuhan') >= 2 ? 1 : 0 },
  { id: 's22', name: '岳麓山·橘子洲', city: 'changsha', baseScore: 3, bonus: '2道湘菜 +1', bonusCheck: (p) => countFoodByCuisine(p, '湘菜') >= 2 ? 1 : 0 },
  { id: 's23', name: '马王堆', city: 'changsha', baseScore: 2, bonus: '拥有湘绣 +1', bonusCheck: (p) => p.treasures.has('t13') ? 1 : 0 },
  { id: 's24', name: '陈家祠', city: 'guangzhou', baseScore: 3, bonus: '拥有广彩瓷 +2', bonusCheck: (p) => p.treasures.has('t14') ? 2 : 0 },
  { id: 's25', name: '白云山', city: 'guangzhou', baseScore: 2, bonus: '', bonusCheck: () => 0 },
  { id: 's26', name: '广济桥', city: 'chaozhou', baseScore: 2, bonus: '拥有潮绣 +1', bonusCheck: (p) => p.treasures.has('t16') ? 1 : 0 },
  { id: 's27', name: '牌坊街', city: 'chaozhou', baseScore: 1, bonus: '2道潮州美食 +1', bonusCheck: (p) => countFoodByCity(p, 'chaozhou') >= 2 ? 1 : 0 },
  { id: 's28', name: '鼓浪屿', city: 'xiamen', baseScore: 3, bonus: '闽菜美食 +1', bonusCheck: (p) => countFoodByCuisine(p, '闽菜') >= 1 ? 1 : 0 },
  { id: 's29', name: '南普陀寺', city: 'xiamen', baseScore: 1, bonus: '拥有灵隐寺 +2', bonusCheck: (p) => p.scenics.has('s14') ? 2 : 0 },
  { id: 's30', name: '三坊七巷', city: 'fuzhou', baseScore: 2, bonus: '拥有寿山石 +2', bonusCheck: (p) => p.treasures.has('t18') ? 2 : 0 },
  { id: 's31', name: '开元寺', city: 'quanzhou', baseScore: 2, bonus: '2件闽地瑰宝 +2', bonusCheck: (p) => countFujianTreasures(p) >= 2 ? 2 : 0 },
  { id: 's32', name: '清源山', city: 'quanzhou', baseScore: 2, bonus: '', bonusCheck: () => 0 },
  { id: 's33', name: '漓江', city: 'guilin', baseScore: 4, bonus: '桂林米粉 +1', bonusCheck: (p) => p.foods.has('f58') ? 1 : 0 },
  { id: 's34', name: '阳朔西街', city: 'guilin', baseScore: 1, bonus: '拥有壮锦 +1', bonusCheck: (p) => p.treasures.has('t21') ? 1 : 0 },
  { id: 's35', name: '兵马俑', city: 'xian', baseScore: 4, bonus: '拥有故宫 +2', bonusCheck: (p) => p.scenics.has('s1') ? 2 : 0 },
  { id: 's36', name: '大雁塔', city: 'xian', baseScore: 2, bonus: '唐卡/壁画 +1', bonusCheck: (p) => (p.treasures.has('t29') || p.treasures.has('t23')) ? 1 : 0 },
  { id: 's37', name: '回民街', city: 'xian', baseScore: 1, bonus: '2道西安美食 +1', bonusCheck: (p) => countFoodByCity(p, 'xian') >= 2 ? 1 : 0 },
  { id: 's38', name: '莫高窟', city: 'dunhuang', baseScore: 5, bonus: '拥有敦煌壁画 +3', bonusCheck: (p) => p.treasures.has('t23') ? 3 : 0 },
  { id: 's39', name: '鸣沙山·月牙泉', city: 'dunhuang', baseScore: 3, bonus: '', bonusCheck: () => 0 },
  { id: 's40', name: '龙门石窟', city: 'luoyang', baseScore: 4, bonus: '大足石刻 +2', bonusCheck: (p) => p.scenics.has('s45') ? 2 : 0 },
  { id: 's41', name: '白马寺', city: 'luoyang', baseScore: 2, bonus: '灵隐寺/开元寺 +1', bonusCheck: (p) => (p.scenics.has('s14') || p.scenics.has('s31')) ? 1 : 0 },
  { id: 's42', name: '青城山·都江堰', city: 'chengdu', baseScore: 3, bonus: '蜀锦蜀绣 +1', bonusCheck: (p) => p.treasures.has('t25') ? 1 : 0 },
  { id: 's43', name: '宽窄巷子', city: 'chengdu', baseScore: 1, bonus: '2道成都美食 +1', bonusCheck: (p) => countFoodByCity(p, 'chengdu') >= 2 ? 1 : 0 },
  { id: 's44', name: '武侯祠', city: 'chengdu', baseScore: 2, bonus: '到访西安 +1', bonusCheck: (p) => p.visitedCities.has('xian') ? 1 : 0 },
  { id: 's45', name: '大足石刻', city: 'chongqing', baseScore: 3, bonus: '龙门石窟 +2', bonusCheck: (p) => p.scenics.has('s40') ? 2 : 0 },
  { id: 's46', name: '洪崖洞', city: 'chongqing', baseScore: 2, bonus: '2道重庆美食 +1', bonusCheck: (p) => countFoodByCity(p, 'chongqing') >= 2 ? 1 : 0 },
  { id: 's47', name: '石林', city: 'kunming', baseScore: 3, bonus: '', bonusCheck: () => 0 },
  { id: 's48', name: '滇池', city: 'kunming', baseScore: 2, bonus: '建水紫陶 +1', bonusCheck: (p) => p.treasures.has('t27') ? 1 : 0 },
  { id: 's49', name: '崇圣寺三塔', city: 'dali', baseScore: 3, bonus: '白族扎染 +2', bonusCheck: (p) => p.treasures.has('t28') ? 2 : 0 },
  { id: 's50', name: '洱海', city: 'dali', baseScore: 2, bonus: '大理美食 +1', bonusCheck: (p) => countFoodByCity(p, 'dali') >= 1 ? 1 : 0 },
  { id: 's51', name: '布达拉宫', city: 'lasa', baseScore: 5, bonus: '无条件高分', bonusCheck: () => 0 },
  { id: 's52', name: '大昭寺', city: 'lasa', baseScore: 3, bonus: '唐卡 +2', bonusCheck: (p) => p.treasures.has('t29') ? 2 : 0 },
  { id: 's53', name: '清明上河园', city: 'kaifeng', baseScore: 3, bonus: '汴绣 +2', bonusCheck: (p) => p.treasures.has('t30') ? 2 : 0 },
  { id: 's54', name: '铁塔', city: 'kaifeng', baseScore: 1, bonus: '大雁塔 +1', bonusCheck: (p) => p.scenics.has('s36') ? 1 : 0 },
  { id: 's55', name: '趵突泉', city: 'jinan', baseScore: 2, bonus: '鲁菜 +1', bonusCheck: (p) => countFoodByCuisine(p, '鲁菜') >= 1 ? 1 : 0 },
  { id: 's56', name: '大明湖', city: 'jinan', baseScore: 2, bonus: '', bonusCheck: () => 0 },
  { id: 's57', name: '栈桥·八大关', city: 'qingdao', baseScore: 2, bonus: '2道青岛美食 +1', bonusCheck: (p) => countFoodByCity(p, 'qingdao') >= 2 ? 1 : 0 },
  { id: 's58', name: '崂山', city: 'qingdao', baseScore: 2, bonus: '崂山绿茶 +1', bonusCheck: (p) => p.foods.has('f100') ? 1 : 0 },
  { id: 's59', name: '瘦西湖', city: 'yangzhou', baseScore: 3, bonus: '西湖 +2', bonusCheck: (p) => p.scenics.has('s13') ? 2 : 0 },
  { id: 's60', name: '个园', city: 'yangzhou', baseScore: 2, bonus: '拙政园 +1', bonusCheck: (p) => p.scenics.has('s10') ? 1 : 0 },
  { id: 's61', name: '鲁迅故里', city: 'shaoxing', baseScore: 2, bonus: '绍兴黄酒 +1', bonusCheck: (p) => p.foods.has('f105') ? 1 : 0 },
  { id: 's62', name: '兰亭', city: 'shaoxing', baseScore: 2, bonus: '徽墨 +1', bonusCheck: (p) => p.treasures.has('t11') ? 1 : 0 },
  { id: 's63', name: '黄果树瀑布', city: 'guiyang', baseScore: 4, bonus: '无条件高分', bonusCheck: () => 0 },
  { id: 's64', name: '青岩古镇', city: 'guiyang', baseScore: 1, bonus: '贵州美食 +1', bonusCheck: (p) => countFoodByCity(p, 'guiyang') >= 1 ? 1 : 0 },
  { id: 's65', name: '丽江古城', city: 'lijiang', baseScore: 3, bonus: '东巴文 +2', bonusCheck: (p) => p.treasures.has('t37') ? 2 : 0 },
  { id: 's66', name: '玉龙雪山', city: 'lijiang', baseScore: 3, bonus: '布达拉宫 +1', bonusCheck: (p) => p.scenics.has('s51') ? 1 : 0 },
  { id: 's67', name: '热带植物园', city: 'xishuangbanna', baseScore: 2, bonus: '傣族织锦 +1', bonusCheck: (p) => p.treasures.has('t38') ? 1 : 0 },
  { id: 's68', name: '野象谷', city: 'xishuangbanna', baseScore: 2, bonus: '版纳美食 +1', bonusCheck: (p) => countFoodByCity(p, 'xishuangbanna') >= 1 ? 1 : 0 },
  { id: 's69', name: '张家界国家森林公园', city: 'zhangjiajie', baseScore: 4, bonus: '无条件高分', bonusCheck: () => 0 },
  { id: 's70', name: '天门山玻璃栈道', city: 'zhangjiajie', baseScore: 2, bonus: '黄山 +1', bonusCheck: (p) => p.scenics.has('s18') ? 1 : 0 },
  { id: 's71', name: '九寨沟', city: 'jiuzhaigou', baseScore: 5, bonus: '无条件高分', bonusCheck: () => 0 },
  { id: 's72', name: '乐山大佛', city: 'leshan', baseScore: 3, bonus: '石窟+2', bonusCheck: (p) => (p.scenics.has('s40') || p.scenics.has('s45')) ? 2 : 0 },
  { id: 's73', name: '峨眉山', city: 'leshan', baseScore: 3, bonus: '茶饮+1', bonusCheck: (p) => hasTeaCard(p) ? 1 : 0 },
  { id: 's74', name: '天涯海角', city: 'sanya', baseScore: 2, bonus: '到访≥10城 +2', bonusCheck: (p) => p.visitedCities.size >= 10 ? 2 : 0 },
  { id: 's75', name: '南山寺', city: 'sanya', baseScore: 2, bonus: '佛寺 +1', bonusCheck: (p) => (p.scenics.has('s14') || p.scenics.has('s31') || p.scenics.has('s41')) ? 1 : 0 },
  { id: 's76', name: '蜈支洲岛', city: 'sanya', baseScore: 2, bonus: '鼓浪屿 +1', bonusCheck: (p) => p.scenics.has('s28') ? 1 : 0 },
  { id: 's77', name: '黄河铁桥', city: 'lanzhou', baseScore: 2, bonus: '', bonusCheck: () => 0 },
  { id: 's78', name: '甘肃省博物馆', city: 'lanzhou', baseScore: 2, bonus: '铜奔马 +2', bonusCheck: (p) => p.treasures.has('t43') ? 2 : 0 },
  { id: 's79', name: '青秀山', city: 'nanning', baseScore: 2, bonus: '南宁美食 +1', bonusCheck: (p) => countFoodByCity(p, 'nanning') >= 1 ? 1 : 0 },
  { id: 's80', name: '德天瀑布', city: 'nanning', baseScore: 3, bonus: '黄果树瀑布 +2', bonusCheck: (p) => p.scenics.has('s63') ? 2 : 0 },
  { id: 's81', name: '长白山天池', city: 'changbaishan', baseScore: 4, bonus: '无条件高分', bonusCheck: () => 0 },
  { id: 's82', name: '呼伦贝尔大草原', city: 'hulunbuir', baseScore: 3, bonus: '到访≥8城 +2', bonusCheck: (p) => p.visitedCities.size >= 8 ? 2 : 0 },
  { id: 's83', name: '满洲里国门', city: 'hulunbuir', baseScore: 1, bonus: '', bonusCheck: () => 0 },
  { id: 's84', name: '喀什古城', city: 'kashi', baseScore: 3, bonus: '敦煌壁画 +2', bonusCheck: (p) => p.treasures.has('t23') ? 2 : 0 },
  { id: 's85', name: '艾提尕尔清真寺', city: 'kashi', baseScore: 2, bonus: '', bonusCheck: () => 0 },
  { id: 's86', name: '祖庙', city: 'foshan', baseScore: 2, bonus: '佛山剪纸 +1', bonusCheck: (p) => p.treasures.has('t49') ? 1 : 0 },
  { id: 's87', name: '南风古灶', city: 'foshan', baseScore: 2, bonus: '陶瓷瑰宝 +1', bonusCheck: (p) => countCeramicTreasures(p) >= 1 ? 1 : 0 },
  { id: 's88', name: '平遥古城', city: 'pingyao', baseScore: 3, bonus: '丽江/喀什古城 +1', bonusCheck: (p) => (p.scenics.has('s65') || p.scenics.has('s84')) ? 1 : 0 },
  { id: 's89', name: '日升昌票号', city: 'pingyao', baseScore: 2, bonus: '3件瑰宝 +1', bonusCheck: (p) => p.treasures.size >= 3 ? 1 : 0 },
];

// Food cards - simplified for game engine
const FOOD_CARDS = [
  { id: 'f1', name: '北京烤鸭', city: 'beijing', cost: 2, cuisine: '京菜' },
  { id: 'f2', name: '炸酱面', city: 'beijing', cost: 1, cuisine: '京菜' },
  { id: 'f3', name: '豆汁焦圈', city: 'beijing', cost: 1, cuisine: '京菜' },
  { id: 'f4', name: '涮羊肉', city: 'beijing', cost: 2, cuisine: '京菜' },
  { id: 'f5', name: '锅包肉', city: 'harbin', cost: 1, cuisine: '东北菜' },
  { id: 'f6', name: '铁锅炖大鹅', city: 'harbin', cost: 2, cuisine: '东北菜' },
  { id: 'f7', name: '马迭尔冰棍', city: 'harbin', cost: 1, cuisine: '小吃' },
  { id: 'f8', name: '红肠', city: 'harbin', cost: 1, cuisine: '东北菜' },
  { id: 'f9', name: '生煎包', city: 'shanghai', cost: 1, cuisine: '沪菜' },
  { id: 'f10', name: '小笼包', city: 'shanghai', cost: 1, cuisine: '沪菜' },
  { id: 'f11', name: '红烧肉', city: 'shanghai', cost: 2, cuisine: '沪菜' },
  { id: 'f12', name: '蟹壳黄', city: 'shanghai', cost: 1, cuisine: '小吃' },
  { id: 'f13', name: '盐水鸭', city: 'nanjing', cost: 2, cuisine: '苏菜' },
  { id: 'f14', name: '鸭血粉丝汤', city: 'nanjing', cost: 1, cuisine: '小吃' },
  { id: 'f15', name: '小煮面', city: 'nanjing', cost: 1, cuisine: '小吃' },
  { id: 'f16', name: '糖芋苗', city: 'nanjing', cost: 1, cuisine: '甜品' },
  { id: 'f17', name: '松鼠桂鱼', city: 'suzhou', cost: 2, cuisine: '苏菜' },
  { id: 'f18', name: '苏式汤面', city: 'suzhou', cost: 1, cuisine: '苏菜' },
  { id: 'f19', name: '桂花鸡头米', city: 'suzhou', cost: 1, cuisine: '甜品' },
  { id: 'f20', name: '东坡肉', city: 'hangzhou', cost: 2, cuisine: '浙菜' },
  { id: 'f21', name: '龙井虾仁', city: 'hangzhou', cost: 2, cuisine: '浙菜' },
  { id: 'f22', name: '西湖醋鱼', city: 'hangzhou', cost: 2, cuisine: '浙菜' },
  { id: 'f23', name: '葱包桧', city: 'hangzhou', cost: 1, cuisine: '小吃' },
  { id: 'f24', name: '阳羡雪芽茶', city: 'yixing', cost: 1, cuisine: '茶饮' },
  { id: 'f25', name: '乌米饭', city: 'yixing', cost: 1, cuisine: '小吃' },
  { id: 'f26', name: '瓷泥煨鸡', city: 'jingdezhen', cost: 2, cuisine: '赣菜' },
  { id: 'f27', name: '碱水粑', city: 'jingdezhen', cost: 1, cuisine: '小吃' },
  { id: 'f28', name: '冷粉', city: 'jingdezhen', cost: 1, cuisine: '小吃' },
  { id: 'f29', name: '臭鳜鱼', city: 'huangshan', cost: 2, cuisine: '徽菜' },
  { id: 'f30', name: '毛豆腐', city: 'huangshan', cost: 1, cuisine: '徽菜' },
  { id: 'f31', name: '笋衣烧肉', city: 'huangshan', cost: 1, cuisine: '徽菜' },
  { id: 'f32', name: '热干面', city: 'wuhan', cost: 1, cuisine: '鄂菜' },
  { id: 'f33', name: '豆皮', city: 'wuhan', cost: 1, cuisine: '小吃' },
  { id: 'f34', name: '武昌鱼', city: 'wuhan', cost: 2, cuisine: '鄂菜' },
  { id: 'f35', name: '排骨藕汤', city: 'wuhan', cost: 2, cuisine: '鄂菜' },
  { id: 'f36', name: '剁椒鱼头', city: 'changsha', cost: 2, cuisine: '湘菜' },
  { id: 'f37', name: '臭豆腐', city: 'changsha', cost: 1, cuisine: '小吃' },
  { id: 'f38', name: '小炒黄牛肉', city: 'changsha', cost: 2, cuisine: '湘菜' },
  { id: 'f39', name: '糖油粑粑', city: 'changsha', cost: 1, cuisine: '小吃' },
  { id: 'f40', name: '白切鸡', city: 'guangzhou', cost: 2, cuisine: '粤菜' },
  { id: 'f41', name: '虾饺', city: 'guangzhou', cost: 1, cuisine: '粤菜' },
  { id: 'f42', name: '煲仔饭', city: 'guangzhou', cost: 1, cuisine: '粤菜' },
  { id: 'f43', name: '肠粉', city: 'guangzhou', cost: 1, cuisine: '粤菜' },
  { id: 'f44', name: '双皮奶', city: 'guangzhou', cost: 1, cuisine: '甜品' },
  { id: 'f45', name: '潮汕牛肉火锅', city: 'chaozhou', cost: 2, cuisine: '潮菜' },
  { id: 'f46', name: '潮汕肠粉', city: 'chaozhou', cost: 1, cuisine: '潮菜' },
  { id: 'f47', name: '工夫茶', city: 'chaozhou', cost: 1, cuisine: '茶饮' },
  { id: 'f48', name: '蚝烙', city: 'chaozhou', cost: 1, cuisine: '潮菜' },
  { id: 'f49', name: '沙茶面', city: 'xiamen', cost: 1, cuisine: '闽菜' },
  { id: 'f50', name: '土笋冻', city: 'xiamen', cost: 1, cuisine: '闽菜' },
  { id: 'f51', name: '海蛎煎', city: 'xiamen', cost: 1, cuisine: '闽菜' },
  { id: 'f52', name: '佛跳墙', city: 'fuzhou', cost: 3, cuisine: '闽菜' },
  { id: 'f53', name: '鱼丸', city: 'fuzhou', cost: 1, cuisine: '闽菜' },
  { id: 'f54', name: '锅边糊', city: 'fuzhou', cost: 1, cuisine: '小吃' },
  { id: 'f55', name: '面线糊', city: 'quanzhou', cost: 1, cuisine: '闽菜' },
  { id: 'f56', name: '姜母鸭', city: 'quanzhou', cost: 2, cuisine: '闽菜' },
  { id: 'f57', name: '润饼', city: 'quanzhou', cost: 1, cuisine: '小吃' },
  { id: 'f58', name: '桂林米粉', city: 'guilin', cost: 1, cuisine: '桂菜' },
  { id: 'f59', name: '啤酒鱼', city: 'guilin', cost: 2, cuisine: '桂菜' },
  { id: 'f60', name: '油茶', city: 'guilin', cost: 1, cuisine: '桂菜' },
  { id: 'f61', name: '肉夹馍', city: 'xian', cost: 1, cuisine: '陕菜' },
  { id: 'f62', name: '羊肉泡馍', city: 'xian', cost: 2, cuisine: '陕菜' },
  { id: 'f63', name: '凉皮', city: 'xian', cost: 1, cuisine: '陕菜' },
  { id: 'f64', name: 'biangbiang面', city: 'xian', cost: 1, cuisine: '陕菜' },
  { id: 'f65', name: '驴肉黄面', city: 'dunhuang', cost: 1, cuisine: '西北面食' },
  { id: 'f66', name: '杏皮水', city: 'dunhuang', cost: 1, cuisine: '饮品' },
  { id: 'f67', name: '胡羊焖饼', city: 'dunhuang', cost: 2, cuisine: '西北菜' },
  { id: 'f68', name: '洛阳水席', city: 'luoyang', cost: 2, cuisine: '豫菜' },
  { id: 'f69', name: '不翻汤', city: 'luoyang', cost: 1, cuisine: '小吃' },
  { id: 'f70', name: '浆面条', city: 'luoyang', cost: 1, cuisine: '小吃' },
  { id: 'f71', name: '麻婆豆腐', city: 'chengdu', cost: 1, cuisine: '川菜' },
  { id: 'f72', name: '担担面', city: 'chengdu', cost: 1, cuisine: '川菜' },
  { id: 'f73', name: '钟水饺', city: 'chengdu', cost: 1, cuisine: '川菜' },
  { id: 'f74', name: '兔头', city: 'chengdu', cost: 1, cuisine: '小吃' },
  { id: 'f75', name: '甜水面', city: 'chengdu', cost: 1, cuisine: '小吃' },
  { id: 'f76', name: '重庆火锅', city: 'chongqing', cost: 2, cuisine: '川菜' },
  { id: 'f77', name: '小面', city: 'chongqing', cost: 1, cuisine: '小吃' },
  { id: 'f78', name: '酸辣粉', city: 'chongqing', cost: 1, cuisine: '小吃' },
  { id: 'f79', name: '豆花饭', city: 'chongqing', cost: 1, cuisine: '小吃' },
  { id: 'f80', name: '过桥米线', city: 'kunming', cost: 2, cuisine: '滇菜' },
  { id: 'f81', name: '鲜花饼', city: 'kunming', cost: 1, cuisine: '小吃' },
  { id: 'f82', name: '汽锅鸡', city: 'kunming', cost: 2, cuisine: '滇菜' },
  { id: 'f83', name: '饵块', city: 'kunming', cost: 1, cuisine: '小吃' },
  { id: 'f84', name: '白族三道茶', city: 'dali', cost: 1, cuisine: '茶饮' },
  { id: 'f85', name: '乳扇', city: 'dali', cost: 1, cuisine: '小吃' },
  { id: 'f86', name: '饵丝', city: 'dali', cost: 1, cuisine: '小吃' },
  { id: 'f87', name: '酥油茶', city: 'lasa', cost: 1, cuisine: '藏餐' },
  { id: 'f88', name: '糌粑', city: 'lasa', cost: 1, cuisine: '藏餐' },
  { id: 'f89', name: '牦牛肉干', city: 'lasa', cost: 1, cuisine: '藏餐' },
  { id: 'f90', name: '灌汤包', city: 'kaifeng', cost: 1, cuisine: '豫菜' },
  { id: 'f91', name: '桶子鸡', city: 'kaifeng', cost: 2, cuisine: '豫菜' },
  { id: 'f92', name: '炒凉粉', city: 'kaifeng', cost: 1, cuisine: '小吃' },
  { id: 'f93', name: '糖醋鲤鱼', city: 'jinan', cost: 2, cuisine: '鲁菜' },
  { id: 'f94', name: '九转大肠', city: 'jinan', cost: 2, cuisine: '鲁菜' },
  { id: 'f95', name: '甜沫', city: 'jinan', cost: 1, cuisine: '小吃' },
  { id: 'f96', name: '把子肉', city: 'jinan', cost: 1, cuisine: '小吃' },
  { id: 'f97', name: '青岛大虾', city: 'qingdao', cost: 2, cuisine: '鲁菜' },
  { id: 'f98', name: '蛤蜊', city: 'qingdao', cost: 1, cuisine: '海鲜' },
  { id: 'f99', name: '鲅鱼水饺', city: 'qingdao', cost: 1, cuisine: '鲁菜' },
  { id: 'f100', name: '崂山绿茶', city: 'qingdao', cost: 1, cuisine: '茶饮' },
  { id: 'f101', name: '扬州炒饭', city: 'yangzhou', cost: 1, cuisine: '淮扬菜' },
  { id: 'f102', name: '大煮干丝', city: 'yangzhou', cost: 2, cuisine: '淮扬菜' },
  { id: 'f103', name: '蟹黄汤包', city: 'yangzhou', cost: 2, cuisine: '淮扬菜' },
  { id: 'f104', name: '三丁包', city: 'yangzhou', cost: 1, cuisine: '淮扬菜' },
  { id: 'f105', name: '绍兴黄酒', city: 'shaoxing', cost: 1, cuisine: '酒饮' },
  { id: 'f106', name: '茴香豆', city: 'shaoxing', cost: 1, cuisine: '小吃' },
  { id: 'f107', name: '醉鸡', city: 'shaoxing', cost: 2, cuisine: '浙菜' },
  { id: 'f108', name: '酸汤鱼', city: 'guiyang', cost: 2, cuisine: '黔菜' },
  { id: 'f109', name: '肠旺面', city: 'guiyang', cost: 1, cuisine: '黔菜' },
  { id: 'f110', name: '丝娃娃', city: 'guiyang', cost: 1, cuisine: '小吃' },
  { id: 'f111', name: '折耳根', city: 'guiyang', cost: 1, cuisine: '小吃' },
  { id: 'f112', name: '腊排骨火锅', city: 'lijiang', cost: 2, cuisine: '滇菜' },
  { id: 'f113', name: '鸡豆凉粉', city: 'lijiang', cost: 1, cuisine: '小吃' },
  { id: 'f114', name: '纳西烤鱼', city: 'lijiang', cost: 1, cuisine: '滇菜' },
  { id: 'f115', name: '傣味菠萝饭', city: 'xishuangbanna', cost: 1, cuisine: '傣菜' },
  { id: 'f116', name: '手抓饭（傣）', city: 'xishuangbanna', cost: 1, cuisine: '傣菜' },
  { id: 'f117', name: '烤竹筒饭', city: 'xishuangbanna', cost: 1, cuisine: '傣菜' },
  { id: 'f118', name: '三下锅', city: 'zhangjiajie', cost: 2, cuisine: '湘菜' },
  { id: 'f119', name: '葛根粉', city: 'zhangjiajie', cost: 1, cuisine: '小吃' },
  { id: 'f120', name: '牦牛肉汤锅', city: 'jiuzhaigou', cost: 2, cuisine: '藏羌菜' },
  { id: 'f121', name: '洋芋糍粑', city: 'jiuzhaigou', cost: 1, cuisine: '小吃' },
  { id: 'f122', name: '钵钵鸡', city: 'leshan', cost: 1, cuisine: '川菜' },
  { id: 'f123', name: '豆腐脑（麻辣）', city: 'leshan', cost: 1, cuisine: '小吃' },
  { id: 'f124', name: '翘脚牛肉', city: 'leshan', cost: 2, cuisine: '川菜' },
  { id: 'f125', name: '文昌鸡', city: 'sanya', cost: 2, cuisine: '琼菜' },
  { id: 'f126', name: '清补凉', city: 'sanya', cost: 1, cuisine: '甜品' },
  { id: 'f127', name: '椰子鸡', city: 'sanya', cost: 2, cuisine: '琼菜' },
  { id: 'f128', name: '抱罗粉', city: 'sanya', cost: 1, cuisine: '小吃' },
  { id: 'f129', name: '兰州牛肉面', city: 'lanzhou', cost: 1, cuisine: '西北面食' },
  { id: 'f130', name: '灰豆子', city: 'lanzhou', cost: 1, cuisine: '甜品' },
  { id: 'f131', name: '手抓羊肉', city: 'lanzhou', cost: 2, cuisine: '西北菜' },
  { id: 'f132', name: '老友粉', city: 'nanning', cost: 1, cuisine: '桂菜' },
  { id: 'f133', name: '柠檬鸭', city: 'nanning', cost: 2, cuisine: '桂菜' },
  { id: 'f134', name: '螺蛳粉', city: 'nanning', cost: 1, cuisine: '桂菜' },
  { id: 'f135', name: '延边冷面', city: 'changbaishan', cost: 1, cuisine: '朝鲜族菜' },
  { id: 'f136', name: '酱大骨', city: 'changbaishan', cost: 2, cuisine: '东北菜' },
  { id: 'f137', name: '人参鸡汤', city: 'changbaishan', cost: 2, cuisine: '滋补' },
  { id: 'f138', name: '烤全羊', city: 'hulunbuir', cost: 3, cuisine: '蒙餐' },
  { id: 'f139', name: '手把肉', city: 'hulunbuir', cost: 2, cuisine: '蒙餐' },
  { id: 'f140', name: '奶茶奶皮子', city: 'hulunbuir', cost: 1, cuisine: '蒙餐' },
  { id: 'f141', name: '烤馕', city: 'kashi', cost: 1, cuisine: '新疆菜' },
  { id: 'f142', name: '大盘鸡', city: 'kashi', cost: 2, cuisine: '新疆菜' },
  { id: 'f143', name: '手抓饭（新疆）', city: 'kashi', cost: 2, cuisine: '新疆菜' },
  { id: 'f144', name: '烤包子', city: 'kashi', cost: 1, cuisine: '新疆菜' },
  { id: 'f145', name: '顺德鱼生', city: 'foshan', cost: 2, cuisine: '粤菜' },
  { id: 'f146', name: '伦教糕', city: 'foshan', cost: 1, cuisine: '甜品' },
  { id: 'f147', name: '双皮奶（顺德）', city: 'foshan', cost: 1, cuisine: '甜品' },
  { id: 'f148', name: '平遥牛肉', city: 'pingyao', cost: 2, cuisine: '晋菜' },
  { id: 'f149', name: '刀削面', city: 'pingyao', cost: 1, cuisine: '晋菜' },
  { id: 'f150', name: '碗托', city: 'pingyao', cost: 1, cuisine: '小吃' },
];

// Treasure cards
const TREASURE_CARDS = [
  { id: 't1', name: '景泰蓝', city: 'beijing', cost: 3, score: 3, ability: '百搭+1' },
  { id: 't2', name: '京剧脸谱', city: 'beijing', cost: 2, score: 2, ability: '秦腔皮影+2' },
  { id: 't3', name: '冰雕', city: 'harbin', cost: 2, score: 2, ability: '冬季限定+2' },
  { id: 't4', name: '海派旗袍', city: 'shanghai', cost: 2, score: 2, ability: '每回合+1金' },
  { id: 't5', name: '云锦', city: 'nanjing', cost: 3, score: 3, ability: '锦绣+2' },
  { id: 't6', name: '苏绣', city: 'suzhou', cost: 3, score: 3, ability: '拙政园+2; 蜀锦+2' },
  { id: 't7', name: '苏扇', city: 'suzhou', cost: 2, score: 2, ability: '2江南瑰宝+1' },
  { id: 't8', name: '龙泉青瓷', city: 'hangzhou', cost: 3, score: 3, ability: '景德镇瓷+3' },
  { id: 't9', name: '宜兴紫砂', city: 'yixing', cost: 3, score: 3, ability: '茶饮+1; 建水紫陶+2' },
  { id: 't10', name: '景德镇瓷器', city: 'jingdezhen', cost: 4, score: 5, ability: '古窑+3; 青瓷+3; 广彩+2' },
  { id: 't11', name: '徽墨', city: 'huangshan', cost: 2, score: 2, ability: '3文化瑰宝+2' },
  { id: 't12', name: '汉绣', city: 'wuhan', cost: 2, score: 2, ability: '3地域绣品+2' },
  { id: 't13', name: '湘绣', city: 'changsha', cost: 2, score: 2, ability: '3刺绣+3' },
  { id: 't14', name: '广彩瓷', city: 'guangzhou', cost: 2, score: 2, ability: '景德镇瓷+2' },
  { id: 't15', name: '广绣', city: 'guangzhou', cost: 2, score: 2, ability: '2绣品+1' },
  { id: 't16', name: '潮绣', city: 'chaozhou', cost: 2, score: 2, ability: '广绣+2' },
  { id: 't17', name: '漆线雕', city: 'xiamen', cost: 2, score: 2, ability: '2闽地+2' },
  { id: 't18', name: '寿山石', city: 'fuzhou', cost: 3, score: 3, ability: '孤品+2' },
  { id: 't19', name: '提线木偶', city: 'quanzhou', cost: 2, score: 2, ability: '皮影/脸谱+2' },
  { id: 't20', name: '南音', city: 'quanzhou', cost: 2, score: 2, ability: '古音+2' },
  { id: 't21', name: '壮锦', city: 'guilin', cost: 2, score: 2, ability: '漓江+2' },
  { id: 't22', name: '秦腔皮影', city: 'xian', cost: 2, score: 2, ability: '下次移动免费' },
  { id: 't23', name: '敦煌壁画', city: 'dunhuang', cost: 4, score: 5, ability: '莫高窟+3; 唐卡+4' },
  { id: 't24', name: '洛阳三彩', city: 'luoyang', cost: 3, score: 3, ability: '景德镇瓷+2' },
  { id: 't25', name: '蜀锦蜀绣', city: 'chengdu', cost: 3, score: 3, ability: '苏绣+2; 云锦+2' },
  { id: 't26', name: '荣昌陶', city: 'chongqing', cost: 2, score: 2, ability: '火锅+1' },
  { id: 't27', name: '建水紫陶', city: 'kunming', cost: 2, score: 2, ability: '紫砂+2' },
  { id: 't28', name: '白族扎染', city: 'dali', cost: 2, score: 2, ability: '壮锦+1' },
  { id: 't29', name: '唐卡', city: 'lasa', cost: 4, score: 5, ability: '敦煌壁画+4' },
  { id: 't30', name: '汴绣', city: 'kaifeng', cost: 2, score: 2, ability: '3绣品+2' },
  { id: 't31', name: '黑陶', city: 'jinan', cost: 2, score: 2, ability: '陶瓷+1' },
  { id: 't32', name: '贝雕', city: 'qingdao', cost: 2, score: 2, ability: '海边景区+1' },
  { id: 't33', name: '扬州漆器', city: 'yangzhou', cost: 3, score: 3, ability: '漆线雕+2' },
  { id: 't34', name: '越剧', city: 'shaoxing', cost: 2, score: 2, ability: '百戏+2' },
  { id: 't35', name: '苗族银饰', city: 'guiyang', cost: 3, score: 3, ability: '2少数民族+2' },
  { id: 't36', name: '蜡染', city: 'guiyang', cost: 2, score: 2, ability: '白族扎染+2' },
  { id: 't37', name: '东巴文', city: 'lijiang', cost: 3, score: 3, ability: '无条件高分' },
  { id: 't38', name: '傣族织锦', city: 'xishuangbanna', cost: 2, score: 2, ability: '壮锦/扎染+1' },
  { id: 't39', name: '西兰卡普', city: 'zhangjiajie', cost: 2, score: 2, ability: '3民族织品+3' },
  { id: 't40', name: '羌绣', city: 'jiuzhaigou', cost: 2, score: 2, ability: '唐卡+1' },
  { id: 't41', name: '夹江年画', city: 'leshan', cost: 2, score: 2, ability: '皮影+1' },
  { id: 't42', name: '黎锦', city: 'sanya', cost: 3, score: 3, ability: '3民族织品+3' },
  { id: 't43', name: '铜奔马', city: 'lanzhou', cost: 3, score: 4, ability: '3西北景区+3' },
  { id: 't44', name: '坭兴陶', city: 'nanning', cost: 2, score: 2, ability: '四大名陶+1' },
  { id: 't45', name: '朝鲜族长鼓舞', city: 'changbaishan', cost: 2, score: 2, ability: '2表演+2' },
  { id: 't46', name: '蒙古马头琴', city: 'hulunbuir', cost: 3, score: 3, ability: '2音乐+2' },
  { id: 't47', name: '和田玉', city: 'kashi', cost: 4, score: 5, ability: '无条件高分' },
  { id: 't48', name: '木卡姆', city: 'kashi', cost: 2, score: 2, ability: '2音乐+2' },
  { id: 't49', name: '佛山剪纸', city: 'foshan', cost: 2, score: 2, ability: '2岭南+1' },
  { id: 't50', name: '石湾陶', city: 'foshan', cost: 2, score: 2, ability: '景德镇瓷+1' },
  { id: 't51', name: '推光漆器', city: 'pingyao', cost: 3, score: 3, ability: '扬州漆器+2' },
];

// Event cards
const EVENT_CARDS = [
  { id: 'e1', name: '高铁提速', benefit: '本回合可走2段', cost: '票价翻倍', effect: 'speedBoost' },
  { id: 'e2', name: '黄金周', benefit: '景区+1分', cost: '美食+1金', effect: 'goldenWeek' },
  { id: 'e3', name: '暴雨延误', benefit: '退票返1金', cost: '不能移动', effect: 'rainDelay' },
  { id: 'e4', name: '限时特惠', benefit: '瑰宝-2金', cost: '本回合购买否则作废', effect: 'treasureSale' },
  { id: 'e5', name: '美食节', benefit: '免费1道菜', cost: '体力-1', effect: 'foodFest' },
  { id: 'e6', name: '旺季涨价', benefit: '景区+1分', cost: '移动+1金', effect: 'peakSeason' },
  { id: 'e7', name: '文化遗产日', benefit: '瑰宝+2分', cost: '瑰宝+1体力', effect: 'heritageDay' },
  { id: 'e8', name: '偶遇旅伴', benefit: '双方+1金', cost: '美食涨价+1', effect: 'encounter' },
  { id: 'e9', name: '摄影大赛', benefit: '景区+2分', cost: '+1体力', effect: 'photoContest' },
  { id: 'e10', name: '列车晚点', benefit: '+1金', cost: '移动+1体力', effect: 'trainDelay' },
  { id: 'e11', name: '跨年夜', benefit: '免体力', cost: '金钱翻倍', effect: 'newYear' },
  { id: 'e12', name: '淡季清闲', benefit: '费用-1金', cost: '景区-1分', effect: 'offSeason' },
  { id: 'e13', name: '地方庙会', benefit: '免费1美食', cost: '不能移动', effect: 'templeFair' },
  { id: 'e14', name: '老友重逢', benefit: '瑰宝-1金', cost: '-2体力', effect: 'oldFriend' },
  { id: 'e15', name: '深夜食堂', benefit: '免体力1美食', cost: '+2金', effect: 'lateNight' },
];

// Helper functions for bonus checks
function countFoodByCity(player, city) {
  let count = 0;
  for (const fid of player.foods) {
    const food = FOOD_CARDS.find(f => f.id === fid);
    if (food && food.city === city) count++;
  }
  return count;
}

function countFoodByCuisine(player, cuisine) {
  let count = 0;
  for (const fid of player.foods) {
    const food = FOOD_CARDS.find(f => f.id === fid);
    if (food && food.cuisine === cuisine) count++;
  }
  return count;
}

function countJiangnanScenics(player) {
  const jiangnanCities = ['suzhou', 'nanjing', 'hangzhou', 'yixing', 'yangzhou', 'shaoxing'];
  let count = 0;
  for (const sid of player.scenics) {
    const s = SCENIC_CARDS.find(sc => sc.id === sid);
    if (s && jiangnanCities.includes(s.city)) count++;
  }
  return count;
}

function countCeramicTreasures(player) {
  const ceramics = ['t8', 't10', 't14', 't24', 't27', 't31', 't44', 't50'];
  let count = 0;
  for (const tid of player.treasures) {
    if (ceramics.includes(tid)) count++;
  }
  return count;
}

function countFujianTreasures(player) {
  const fujian = ['t17', 't18', 't19', 't20'];
  let count = 0;
  for (const tid of player.treasures) {
    if (fujian.includes(tid)) count++;
  }
  return count;
}

function countCuisineRegion(player, region) {
  const jiangnanCuisines = ['苏菜', '沪菜', '浙菜', '淮扬菜'];
  let count = 0;
  for (const fid of player.foods) {
    const food = FOOD_CARDS.find(f => f.id === fid);
    if (food && jiangnanCuisines.includes(food.cuisine)) count++;
  }
  return count;
}

function hasTeaCard(player) {
  for (const fid of player.foods) {
    const food = FOOD_CARDS.find(f => f.id === fid);
    if (food && food.cuisine === '茶饮') return true;
  }
  return false;
}
