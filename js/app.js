/* =========================================================================
   校园集市 Demo · 应用入口与路由
   - 页面注册在 Pages 命名空间下，每个页面提供 render / mounted
   - 路由：navigate（进入二级页面，压栈）、back（返回）、switchTab（切换标签页）
   - 迁移到微信小程序时，这一层可直接换成 app.json + pages 配置
   ========================================================================= */
(function (global) {
  'use strict';

  var navbarEl = document.getElementById('navbar');
  var pageEl = document.getElementById('page');
  var tabbarEl = document.getElementById('tabbar');

  /* 底部标签栏配置：与小程序 tabBar 的配置结构保持一致 */
  var TABS = [
    { id: 'home',    label: '首页', icon: 'home' },
    { id: 'publish', label: '发布', icon: 'plus', primary: true },
    { id: 'mine',    label: '我的', icon: 'user' }
  ];

  var current = null;  /* { name, params } */
  var stack = [];      /* 返回栈 */

  function renderTabbar(activeId) {
    tabbarEl.innerHTML = TABS.map(function (tab) {
      return '' +
        '<button class="tabbar__item' +
          (tab.primary ? ' tabbar__item--primary' : '') +
          (tab.id === activeId ? ' is-active' : '') +
          '" type="button" data-tab="' + tab.id + '">' +
          '<span class="tabbar__icon">' + Components.icon(tab.icon) + '</span>' +
          '<span class="tabbar__label">' + tab.label + '</span>' +
        '</button>';
    }).join('');
  }

  function render(name, params) {
    var page = Pages[name];
    if (!page) return;

    current = { name: name, params: params || {} };

    /* 顶部导航：二级页面由路由统一渲染，标签页使用页面自己的通栏页头 */
    var navConfig = typeof page.navbar === 'function' ? page.navbar(current.params) : page.navbar;
    if (navConfig) {
      navbarEl.hidden = false;
      navbarEl.innerHTML = Components.navbar(navConfig);
    } else {
      navbarEl.hidden = true;
      navbarEl.innerHTML = '';
    }

    /* 底部标签栏只在标签页显示 */
    tabbarEl.hidden = !page.tab;
    if (page.tab) renderTabbar(current.name);

    pageEl.innerHTML = page.render(current.params);
    pageEl.scrollTop = 0;

    if (typeof page.mounted === 'function') page.mounted(current.params, pageEl);
  }

  var App = {
    /* 进入某个页面；options.root = true 时把返回栈重置为首页 */
    navigate: function (name, params, options) {
      options = options || {};
      var page = Pages[name];
      if (!page) return;

      if (page.tab) {
        stack = [];
        render(name, params);
        return;
      }

      if (options.root) stack = [{ name: 'home', params: {} }];
      else if (current) stack.push(current);

      render(name, params);
    },

    /* 返回上一页；栈空时回到首页 */
    back: function () {
      if (!stack.length) {
        render('home', {});
        return;
      }
      var previous = stack.pop();
      render(previous.name, previous.params);
    },

    switchTab: function (name) {
      if (!Pages[name] || !Pages[name].tab) return;
      stack = [];
      render(name, {});
    },

    /* 数据变化后刷新当前页面 */
    rerender: function () {
      if (current) render(current.name, current.params);
    },

    page: function () { return pageEl; }
  };

  /* ---- 全局事件 ---- */
  navbarEl.addEventListener('click', function (event) {
    if (event.target.closest('[data-act="back"]')) App.back();
  });

  tabbarEl.addEventListener('click', function (event) {
    var item = event.target.closest('[data-tab]');
    if (item) App.switchTab(item.dataset.tab);
  });

  /* 桌面演示时用 Esc 返回 */
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && stack.length) App.back();
  });

  global.App = App;

  /* ---- 启动 ---- */
  render('home', {});
})(window);
