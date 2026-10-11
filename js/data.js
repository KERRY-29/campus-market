/* =========================================================================
   校园集市 Demo · 数据层（Store）
   - 首页 / 分类页 / 详情页 / 发布页 / 我的 都只通过 Store 读写数据
   - 数据来源：本地模拟数据（SEED）+ 浏览器 localStorage（用户发布、收藏）
   - 迁移到后端 / 微信小程序时，只需替换 Store 内部实现，调用方无需改动
   ========================================================================= */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'campus_market_demo_v1';
  var MINUTE = 60 * 1000;
  var HOUR = 60 * MINUTE;
  var DAY = 24 * HOUR;

  function ago(ms) { return Date.now() - ms; }

  /* ------------------------------------------------------------------
     分类配置（分类入口 / 分类页 / 发布页选择分类共用）
     ------------------------------------------------------------------ */
  var CATEGORIES = [
    { id: 'secondhand', name: '二手闲置', icon: '📦', theme: 'blue',   desc: '闲置好物，低价转让' },
    { id: 'errand',     name: '校园跑腿', icon: '🛵', theme: 'green',  desc: '代取快递，代买代送' },
    { id: 'mutual',     name: '校园互助', icon: '🤝', theme: 'orange', desc: '求购求助，拼单组队' }
  ];

  /* ------------------------------------------------------------------
     模拟数据
     ------------------------------------------------------------------ */
  var SEED = [
    {
      id: 'seed-sh-1',
      category: 'secondhand',
      title: '九成新机械键盘',
      price: 80,
      location: 'XX大学东区',
      desc: '使用半年，无故障。\n青轴手感清脆，自带白色背光，箱说配件都在（原装键帽 + 拔键器）。\n东区宿舍楼下自提，也可以送到教学楼。',
      contact: '微信：keyboard_0806',
      icon: '⌨️',
      views: 128,
      createdAt: ago(2 * HOUR),
      author: { name: '李同学', emoji: '🧑‍💻', campus: 'XX大学 · 计算机学院' }
    },
    {
      id: 'seed-er-1',
      category: 'errand',
      title: '代取快递',
      price: 5,
      location: 'XX大学南门',
      desc: '南门菜鸟驿站代取快递，顺路带到宿舍楼下。\n每天 12:00 / 18:00 各跑一趟，小件优先，贵重物品请提前说明。',
      contact: '微信：paotui_nanmen',
      icon: '📦',
      views: 86,
      createdAt: ago(38 * MINUTE),
      author: { name: '王同学', emoji: '🧑‍🎓', campus: 'XX大学 · 经济管理学院' }
    },
    {
      id: 'seed-mu-1',
      category: 'mutual',
      title: '求购大一教材',
      price: null,
      location: 'XX大学东区',
      desc: '需要高等数学教材（同济第七版 上下册）。\n有闲置的同学请联系我，笔记齐全的话价格好商量，接受面交。',
      contact: '微信：bookhunter_2026',
      icon: '📖',
      views: 64,
      createdAt: ago(5 * HOUR),
      author: { name: '陈同学', emoji: '👩‍🎓', campus: 'XX大学 · 大一' }
    },
    {
      id: 'seed-sh-2',
      category: 'secondhand',
      title: '罗技无线鼠标 M系列',
      price: 35,
      location: 'XX大学图书馆三楼',
      desc: '用了一个学期，滚轮和按键都正常，附送一节新电池。\n平时在图书馆三楼自习，可约在图书馆门口面交。',
      contact: '微信：mouse_35',
      icon: '🖱️',
      views: 52,
      createdAt: ago(9 * HOUR),
      author: { name: '赵同学', emoji: '🧑‍🔬', campus: 'XX大学 · 物理学院' }
    },
    {
      id: 'seed-er-2',
      category: 'errand',
      title: '食堂代买午饭',
      price: 3,
      location: 'XX大学第一食堂',
      desc: '中午顺路去第一食堂，可以帮忙带饭（限一楼窗口）。\n需要带饭的同学把菜品和口味发我，12:20 前送到宿舍楼。',
      contact: '微信：lunch_bring',
      icon: '🍱',
      views: 73,
      createdAt: ago(20 * HOUR),
      author: { name: '孙同学', emoji: '🧑‍🍳', campus: 'XX大学 · 外国语学院' }
    },
    {
      id: 'seed-mu-2',
      category: 'mutual',
      title: '求借《线性代数》课堂笔记',
      price: null,
      location: 'XX大学宿舍楼B栋',
      desc: '下周期中考试，想借一份完整的线代课堂笔记，抄完当天归还。\n可以帮忙带一周的早餐作为感谢，也可以在宿舍楼下自取。',
      contact: '微信：linearnote',
      icon: '📒',
      views: 41,
      createdAt: ago(1 * DAY + 2 * HOUR),
      author: { name: '周同学', emoji: '🙋', campus: 'XX大学 · 大一' }
    },
    {
      id: 'seed-sh-3',
      category: 'secondhand',
      title: '考研英语全套资料',
      price: 45,
      location: 'XX大学西区',
      desc: '真题 + 词汇 + 作文模板全套，已上岸，笔记都写在书上了，希望能帮到学弟学妹。\n西区宿舍楼自提，可小刀。',
      contact: '微信：kaoyan_45',
      icon: '📚',
      views: 97,
      createdAt: ago(1 * DAY + 6 * HOUR),
      author: { name: '吴同学', emoji: '🎓', campus: 'XX大学 · 大四（已保研）' }
    },
    {
      id: 'seed-er-3',
      category: 'errand',
      title: '帮带打印资料',
      price: 4,
      location: 'XX大学东区',
      desc: '东区打印店速度快，帮忙带打 PDF / Word 资料，A4 双面黑白。\n急需的话可以先发文件给我，打印好直接送到教室。',
      contact: '微信：print_help',
      icon: '🖨️',
      views: 38,
      createdAt: ago(2 * DAY),
      author: { name: '郑同学', emoji: '🧑‍💼', campus: 'XX大学 · 机械工程学院' }
    },
    {
      id: 'seed-mu-3',
      category: 'mutual',
      title: '一起拼单奶茶',
      price: null,
      location: 'XX大学东区',
      desc: '外卖平台满 40 减 15，想凑单的同学一起下单，各付各的。\n目前已有 2 人，还差 1 人，今晚 8 点前下单。',
      contact: '微信：milktea_group',
      icon: '🧋',
      views: 29,
      createdAt: ago(2 * DAY + 4 * HOUR),
      author: { name: '林同学', emoji: '🧑‍🎤', campus: 'XX大学 · 艺术学院' }
    },
    {
      id: 'seed-sh-4',
      category: 'secondhand',
      title: '护眼小台灯',
      price: 25,
      location: 'XX大学北区',
      desc: '三档亮度可调，USB 供电，宿舍书桌很好用。\n搬宿舍带不走，便宜出，北区自提。',
      contact: '微信：lamp_25',
      icon: '💡',
      views: 33,
      createdAt: ago(3 * DAY),
      author: { name: '何同学', emoji: '🧑‍🎓', campus: 'XX大学 · 化学学院' }
    },
    {
      id: 'seed-mu-4',
      category: 'mutual',
      title: '求助：帮忙搬宿舍行李',
      price: 20,
      location: 'XX大学3号宿舍楼',
      desc: '周五下午搬宿舍，需要一位同学帮忙搬两个行李箱到 5 号楼（有电梯）。\n大约半小时，奶茶管够，谢谢！',
      contact: '微信：moving_help',
      icon: '🧳',
      views: 47,
      createdAt: ago(4 * DAY),
      author: { name: '马同学', emoji: '🧑‍🏫', campus: 'XX大学 · 数学学院' }
    }
  ];

  /* ------------------------------------------------------------------
     本地状态
     ------------------------------------------------------------------ */
  var state = {
    userItems: [],   /* 用户在本机发布的信息 */
    favorites: [],   /* 收藏的信息 id */
    myPosts: 0       /* 统计用：累计发布条数 */
  };

  var storageReady = (function () {
    try {
      var key = '__campus_market_probe__';
      global.localStorage.setItem(key, '1');
      global.localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false; /* 隐私模式等场景下退化为纯内存模式，Demo 依然可用 */
    }
  })();

  function load() {
    if (!storageReady) return;
    try {
      var raw = global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var saved = JSON.parse(raw);
      state.userItems = saved.userItems || [];
      state.favorites = saved.favorites || [];
      state.myPosts = saved.myPosts || state.userItems.length;
    } catch (e) {
      /* 本地数据损坏时忽略，继续使用模拟数据 */
    }
  }

  function save() {
    if (!storageReady) return;
    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* 超出容量时忽略，不影响当前会话使用 */
    }
  }

  function byNewest(a, b) { return Number(b.createdAt) - Number(a.createdAt); }

  function decorate(item) {
    var copy = {};
    for (var k in item) { if (Object.prototype.hasOwnProperty.call(item, k)) copy[k] = item[k]; }
    copy.isMine = !!item.isMine;
    copy.isFavorite = state.favorites.indexOf(item.id) > -1;
    return copy;
  }

  /* ------------------------------------------------------------------
     对外 API
     ------------------------------------------------------------------ */
  var Store = {
    CATEGORIES: CATEGORIES,

    init: function () { load(); return Store; },

    categoryById: function (id) {
      for (var i = 0; i < CATEGORIES.length; i++) {
        if (CATEGORIES[i].id === id) return CATEGORIES[i];
      }
      return null;
    },

    /* 全部信息：用户发布的排在前面，其余按时间倒序 */
    all: function () {
      var seeds = SEED.slice().sort(byNewest);
      var mine = state.userItems.slice().sort(byNewest);
      return mine.concat(seeds);
    },

    /**
     * 查询列表
     * list({ category: 'secondhand' | 'all', keyword: '键盘', sort: 'new' | 'price' })
     */
    list: function (options) {
      options = options || {};
      var items = Store.all();

      if (options.category && options.category !== 'all') {
        items = items.filter(function (item) { return item.category === options.category; });
      }

      var keyword = String(options.keyword || '').trim().toLowerCase();
      if (keyword) {
        items = items.filter(function (item) {
          var category = Store.categoryById(item.category);
          var haystack = [
            item.title, item.desc, item.location, item.contact,
            category ? category.name : ''
          ].join(' ').toLowerCase();
          return haystack.indexOf(keyword) > -1;
        });
      }

      if (options.sort === 'price') {
        items.sort(function (a, b) {
          var pa = a.price === null || a.price === undefined || a.price === '' ? Infinity : Number(a.price);
          var pb = b.price === null || b.price === undefined || b.price === '' ? Infinity : Number(b.price);
          if (pa === pb) return byNewest(a, b);
          return pa - pb;
        });
      } else {
        items.sort(byNewest);
      }

      return items.map(decorate);
    },

    get: function (id) {
      var items = Store.all();
      for (var i = 0; i < items.length; i++) {
        if (items[i].id === id) return decorate(items[i]);
      }
      return null;
    },

    /* 发布一条新信息 */
    add: function (draft) {
      var item = {
        id: Utils.uid('my'),
        category: draft.category,
        title: String(draft.title || '').trim(),
        price: draft.price === '' || draft.price === null || draft.price === undefined ? null : Number(draft.price),
        location: draft.location ? String(draft.location).trim() : 'XX大学',
        desc: String(draft.desc || '').trim(),
        contact: String(draft.contact || '').trim(),
        images: draft.images || [],
        icon: draft.icon || (Store.categoryById(draft.category) || {}).icon || '📦',
        views: 0,
        createdAt: Date.now(),
        isMine: true,
        author: { name: '我', emoji: '😃', campus: 'XX大学 · 我的主页' }
      };
      state.userItems.unshift(item);
      state.myPosts += 1;
      save();
      return decorate(item);
    },

    remove: function (id) {
      var before = state.userItems.length;
      state.userItems = state.userItems.filter(function (item) { return item.id !== id; });
      state.favorites = state.favorites.filter(function (favId) { return favId !== id; });
      save();
      return state.userItems.length !== before;
    },

    toggleFavorite: function (id) {
      var index = state.favorites.indexOf(id);
      if (index > -1) state.favorites.splice(index, 1);
      else state.favorites.unshift(id);
      save();
      return index === -1; /* 返回操作后是否已收藏 */
    },

    isFavorite: function (id) { return state.favorites.indexOf(id) > -1; },

    /* 我的收藏（保持收藏顺序） */
    favorites: function () {
      var map = {};
      Store.all().forEach(function (item) { map[item.id] = item; });
      return state.favorites
        .map(function (id) { return map[id]; })
        .filter(Boolean)
        .map(decorate);
    },

    /* 我的发布 */
    mine: function () { return state.userItems.slice().sort(byNewest).map(decorate); },

    /* 浏览：详情页每次打开 +1，仅演示用 */
    addView: function (id) {
      for (var i = 0; i < state.userItems.length; i++) {
        if (state.userItems[i].id === id) {
          state.userItems[i].views = (state.userItems[i].views || 0) + 1;
          save();
          return;
        }
      }
      for (var j = 0; j < SEED.length; j++) {
        if (SEED[j].id === id) {
          SEED[j].views = (SEED[j].views || 0) + 1;
          return;
        }
      }
    },

    stats: function () {
      var mine = Store.mine();
      var views = mine.reduce(function (sum, item) { return sum + (item.views || 0); }, 0);
      return {
        posts: mine.length,
        favorites: state.favorites.length,
        views: views
      };
    },

    /* 清空本机数据，恢复初始模拟数据 */
    reset: function () {
      state.userItems = [];
      state.favorites = [];
      state.myPosts = 0;
      if (storageReady) {
        try { global.localStorage.removeItem(STORAGE_KEY); } catch (e) { /* 忽略 */ }
      }
    }
  };

  global.Store = Store.init();
})(window);
