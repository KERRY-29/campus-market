/* =========================================================================
   校园集市 Demo · 公共组件
   - 状态栏、信息卡片、空状态、图标
   - 迁移到微信小程序时，每个 render 方法对应一个自定义组件（Component）
   ========================================================================= */
(function (global) {
  'use strict';

  var Icons = {
    search:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">' +
        '<circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.6-3.6"></path>' +
      '</svg>',
    back:
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M15 5l-7 7 7 7"></path>' +
      '</svg>',
    heart: function (filled) {
      return '<svg width="22" height="22" viewBox="0 0 24 24" fill="' + (filled ? 'currentColor' : 'none') +
        '" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M12 20s-7-4.4-7-9.2A4 4 0 0 1 12 8a4 4 0 0 1 7 2.8C19 15.6 12 20 12 20z"></path>' +
      '</svg>';
    },
    trash:
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M4 7h16M9 7V5h6v2M6.5 7l1 12h9l1-12"></path>' +
      '</svg>',
    chat:
      '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M20 12a7.5 7.5 0 0 1-10.9 6.7L4 20l1.3-4.3A7.5 7.5 0 1 1 20 12z"></path>' +
      '</svg>',
    home:
      '<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M3.5 10.5 12 3.5l8.5 7"></path><path d="M5.8 9.5V20h12.4V9.5"></path><path d="M9.8 20v-5.4h4.4V20"></path>' +
      '</svg>',
    plus:
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">' +
        '<path d="M12 5.5v13M5.5 12h13"></path>' +
      '</svg>',
    user:
      '<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="12" cy="8.2" r="3.9"></circle><path d="M4.6 20.4c1.3-3.7 4-5.6 7.4-5.6s6.1 1.9 7.4 5.6"></path>' +
      '</svg>',
    signal:
      '<svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">' +
        '<rect x="0" y="7" width="3" height="4" rx="1"></rect><rect x="4.5" y="5" width="3" height="6" rx="1"></rect>' +
        '<rect x="9" y="2.5" width="3" height="8.5" rx="1"></rect><rect x="13.5" y="0" width="3" height="11" rx="1" opacity="0.45"></rect>' +
      '</svg>',
    wifi:
      '<svg width="15" height="11" viewBox="0 0 15 11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">' +
        '<path d="M1 3.6a8.8 8.8 0 0 1 13 0"></path><path d="M3.6 6.2a5.2 5.2 0 0 1 7.8 0"></path>' +
        '<circle cx="7.5" cy="9.2" r="1" fill="currentColor" stroke="none"></circle>' +
      '</svg>',
    battery:
      '<svg width="24" height="12" viewBox="0 0 24 12" fill="none">' +
        '<rect x="0.6" y="0.6" width="19" height="10.8" rx="3" stroke="currentColor" stroke-width="1.1" opacity="0.5"></rect>' +
        '<rect x="2.2" y="2.2" width="14" height="7.6" rx="2" fill="currentColor"></rect>' +
        '<path d="M21.2 4.2v3.6c1-.3 1.4-.9 1.4-1.8s-.4-1.5-1.4-1.8z" fill="currentColor" opacity="0.6"></path>' +
      '</svg>'
  };

  function icon(name) { return Icons[name] || ''; }

  var Components = {
    icons: Icons,
    icon: icon,

    /* 模拟状态栏：theme = 'light'（深色背景上）| 'dark'（白色背景上） */
    statusbar: function (theme) {
      return '' +
        '<div class="statusbar statusbar--' + (theme || 'dark') + '">' +
          '<span>' + Utils.clock() + '</span>' +
          '<span class="statusbar__icons">' + Icons.signal + Icons.wifi + Icons.battery + '</span>' +
        '</div>';
    },

    /* 二级页面顶部导航 */
    navbar: function (config) {
      config = config || {};
      return '' +
        Components.statusbar('dark') +
        '<div class="navbar__bar">' +
          (config.back === false
            ? '<span style="width:40px"></span>'
            : '<button class="navbar__back" type="button" data-act="back" aria-label="返回">' + Icons.back + '</button>') +
          '<h1 class="navbar__title">' + Utils.escape(config.title || '') + '</h1>' +
          '<div class="navbar__extra">' + (config.extra || '') + '</div>' +
        '</div>';
    },

    /**
     * 信息卡片
     * options: { deletable: true } —— 我的发布列表里显示删除按钮
     */
    itemCard: function (item, options) {
      options = options || {};
      var category = Store.categoryById(item.category) || { name: '信息', theme: 'gray', icon: '📦' };
      var cover = Utils.cover(item, category);

      return '' +
        '<article class="card' + (options.deletable ? ' card--deletable' : '') + '" data-id="' + item.id + '">' +
          '<div class="card__thumb">' +
            '<img src="' + cover + '" alt="' + Utils.escape(item.title) + '" loading="lazy" />' +
            (item.isMine ? '<span class="card__badge">我的</span>' : '') +
          '</div>' +
          '<div class="card__body">' +
            '<h3 class="card__title">' + Utils.escape(item.title) + '</h3>' +
            (item.desc ? '<p class="card__desc">' + Utils.escape(item.desc.split('\n')[0]) + '</p>' : '') +
            '<div class="card__meta">' +
              '<span class="chip chip--' + category.theme + '">' + category.name + '</span>' +
              '<span class="card__loc">' + Utils.escape(item.location || '校内') + '</span>' +
            '</div>' +
            '<div class="card__bottom">' +
              Utils.price(item.price) +
              '<span class="card__time">' + Utils.fromNow(item.createdAt) + '</span>' +
            '</div>' +
          '</div>' +
          (options.deletable ? '<button class="card__del" type="button" data-del="' + item.id + '">删除</button>' : '') +
        '</article>';
    },

    /* 列表为空时的占位 */
    empty: function (options) {
      options = options || {};
      return '' +
        '<div class="empty">' +
          '<div class="empty__icon">' + (options.icon || '📭') + '</div>' +
          '<p class="empty__title">' + Utils.escape(options.title || '这里还没有内容') + '</p>' +
          '<p class="empty__desc">' + Utils.escape(options.desc || '') + '</p>' +
        '</div>';
    },

    /* 卡片列表 + 空状态 */
    itemList: function (items, emptyOptions, cardOptions) {
      if (!items.length) return Components.empty(emptyOptions);
      return items.map(function (item) { return Components.itemCard(item, cardOptions); }).join('');
    },

    /* 用户头像 */
    avatar: function (user, large) {
      return '<div class="avatar' + (large ? ' avatar--lg' : '') + '">' +
        Utils.escape((user && user.emoji) || '😃') + '</div>';
    }
  };

  global.Components = Components;
})(window);
