/* =========================================================================
   页面：首页
   - 顶部：产品名称 + 搜索框
   - 分类入口：二手闲置 / 校园跑腿 / 校园互助
   - 下方：最新信息卡片列表（支持搜索过滤）
   ========================================================================= */
(function (global) {
  'use strict';

  var Pages = global.Pages || (global.Pages = {});

  Pages.home = {
    name: 'home',
    title: '校园集市',
    tab: true,      /* 属于底部标签页 */
    navbar: false,  /* 使用自有通栏页头 */

    render: function () {
      var categories = Store.CATEGORIES;
      var items = Store.list();

      return '' +
        /* ---- 顶部：产品名 + 搜索框 ---- */
        '<div class="top-light">' +
          Components.statusbar('light') +
          '<div class="hero">' +
          '<div class="hero__row">' +
            '<div>' +
              '<p class="hero__greet">' + Utils.greeting() + '，同学 👋</p>' +
              '<h1 class="hero__title">校园集市</h1>' +
            '</div>' +
            '<button class="hero__campus" type="button" data-act="campus">XX大学</button>' +
          '</div>' +
          '<p class="hero__sub">二手闲置 · 校园跑腿 · 同学互助</p>' +
          '<div class="searchbar">' +
            '<span class="searchbar__icon">' + Components.icon('search') + '</span>' +
            '<input id="homeSearch" type="search" placeholder="搜索二手、跑腿、互助信息" autocomplete="off" />' +
            '<button class="searchbar__clear" type="button" id="homeSearchClear" hidden>✕</button>' +
          '</div>' +
          '</div>' +
        '</div>' +

        /* ---- 分类入口 ---- */
        '<div class="cat-grid">' +
          categories.map(function (category) {
            return '' +
              '<button class="cat" type="button" data-cat="' + category.id + '">' +
                '<span class="cat__icon cat__icon--' + category.theme + '">' + category.icon + '</span>' +
                '<span class="cat__name">' + category.name + '</span>' +
                '<span class="cat__desc">' + category.desc + '</span>' +
              '</button>';
          }).join('') +
        '</div>' +

        /* ---- 最新信息 ---- */
        '<section class="section">' +
          '<div class="section__head">' +
            '<h2 id="feedTitle">最新信息</h2>' +
            '<button class="section__more" type="button" data-act="all">全部<span>›</span></button>' +
          '</div>' +
          '<div class="card-list" id="feedList">' + feedHtml(items) + '</div>' +
        '</section>' +

        '<div class="safe-space"></div>';
    },

    mounted: function (params, root) {
      var input = root.querySelector('#homeSearch');
      var clearBtn = root.querySelector('#homeSearchClear');
      var feedList = root.querySelector('#feedList');
      var feedTitle = root.querySelector('#feedTitle');

      function applyKeyword() {
        var keyword = input.value.trim();
        var items = Store.list({ keyword: keyword });
        feedTitle.textContent = keyword ? '搜索结果（' + items.length + '）' : '最新信息';
        feedList.innerHTML = feedHtml(items);
        clearBtn.hidden = !keyword;
      }

      input.addEventListener('input', applyKeyword);
      clearBtn.addEventListener('click', function () {
        input.value = '';
        applyKeyword();
        input.focus();
      });

      /* 统一事件委托：分类入口 / 卡片 / 全部 */
      root.addEventListener('click', function (event) {
        var categoryBtn = event.target.closest('[data-cat]');
        if (categoryBtn) {
          App.navigate('category', { category: categoryBtn.dataset.cat });
          return;
        }

        var card = event.target.closest('.card');
        if (card) {
          App.navigate('detail', { id: card.dataset.id });
          return;
        }

        var action = event.target.closest('[data-act]');
        if (!action) return;
        if (action.dataset.act === 'all') App.navigate('category', { category: 'all' });
        if (action.dataset.act === 'campus') Utils.toast('Demo 中固定为 XX大学');
      });
    }
  };

  function feedHtml(items) {
    return Components.itemList(items, {
      icon: '🔍',
      title: '没有找到相关信息',
      desc: '换个关键词试试，或者点击右下角发布一条'
    });
  }
})(window);
