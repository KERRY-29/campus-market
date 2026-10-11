/* =========================================================================
   页面：分类列表页
   - 进入方式：首页点击分类入口（category = 'secondhand' / 'errand' / 'mutual'）
               首页点击“全部”（category = 'all'）
   - 支持按“最新 / 价格最低”排序
   ========================================================================= */
(function (global) {
  'use strict';

  var Pages = global.Pages || (global.Pages = {});
  var currentSort = 'new';

  Pages.category = {
    name: 'category',
    tab: false,

    navbar: function (params) {
      var category = resolveCategory(params);
      return {
        title: category ? category.name : '全部信息',
        back: true
      };
    },

    render: function (params) {
      var category = resolveCategory(params);
      var items = Store.list({ category: params.category, sort: currentSort });

      return '' +
        '<div class="page-inner">' +
          '<div class="cat-hero">' +
            '<div class="cat-hero__icon cat__icon--' + (category ? category.theme : 'blue') + '">' +
              (category ? category.icon : '🗂️') +
            '</div>' +
            '<div>' +
              '<h2 class="cat-hero__name">' + (category ? category.name : '全部信息') + '</h2>' +
              '<p class="cat-hero__desc">' + (category ? category.desc : '校园里的每一条新信息') + '</p>' +
            '</div>' +
            '<span class="cat-hero__count">共 ' + items.length + ' 条</span>' +
          '</div>' +

          '<div class="filter-bar" id="filterBar">' +
            filterChip('new', '最新发布') +
            filterChip('price', '价格最低') +
          '</div>' +

          '<div class="list-wrap">' +
            '<div class="card-list" id="categoryList">' + listHtml(items, category) + '</div>' +
          '</div>' +

          '<div class="safe-space"></div>' +
        '</div>';
    },

    mounted: function (params, root) {
      root.addEventListener('click', function (event) {
        var chip = event.target.closest('[data-sort]');
        if (chip) {
          currentSort = chip.dataset.sort;
          root.querySelectorAll('[data-sort]').forEach(function (el) {
            el.classList.toggle('is-active', el.dataset.sort === currentSort);
          });
          var items = Store.list({ category: params.category, sort: currentSort });
          root.querySelector('#categoryList').innerHTML = listHtml(items, resolveCategory(params));
          return;
        }

        var card = event.target.closest('.card');
        if (card) App.navigate('detail', { id: card.dataset.id });
      });

      /* 每次进入默认回到“最新发布” */
      currentSort = 'new';
    }
  };

  function resolveCategory(params) {
    if (!params || !params.category || params.category === 'all') return null;
    return Store.categoryById(params.category);
  }

  function filterChip(sort, label) {
    return '<button class="filter-chip' + (sort === currentSort ? ' is-active' : '') +
      '" type="button" data-sort="' + sort + '">' + label + '</button>';
  }

  function listHtml(items, category) {
    return Components.itemList(items, {
      icon: category ? category.icon : '📭',
      title: '这个分类下还没有信息',
      desc: '去“发布”页面发一条，马上出现在这里'
    });
  }
})(window);
