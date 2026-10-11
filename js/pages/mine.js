/* =========================================================================
   页面：我的
   内容：用户头像区域 / 数据统计 / 我的发布 / 收藏信息 / 清空演示数据
   ========================================================================= */
(function (global) {
  'use strict';

  var Pages = global.Pages || (global.Pages = {});
  var currentTab = 'posts';

  Pages.mine = {
    name: 'mine',
    tab: true,
    navbar: false,

    render: function () {
      var stats = Store.stats();

      return '' +
        /* ---- 头像区域 ---- */
        '<div class="top-light">' +
          Components.statusbar('light') +
          '<div class="profile">' +
          '<div class="profile__row">' +
            '<div class="avatar avatar--lg">😃</div>' +
            '<div>' +
              '<div class="profile__name">校集用户 8823 <span class="profile__badge">校园认证</span></div>' +
              '<p class="profile__sub">XX大学 · 计算机学院 · 2024 级</p>' +
            '</div>' +
          '</div>' +
          '</div>' +
        '</div>' +

        /* ---- 数据统计 ---- */
        '<div class="stat-card">' +
          '<div class="stat"><div class="stat__num">' + stats.posts + '</div><div class="stat__label">我的发布</div></div>' +
          '<div class="stat"><div class="stat__num">' + stats.favorites + '</div><div class="stat__label">收藏信息</div></div>' +
          '<div class="stat"><div class="stat__num">' + stats.views + '</div><div class="stat__label">累计浏览</div></div>' +
        '</div>' +

        /* ---- 分段切换 ---- */
        '<div class="seg-tabs" id="segTabs">' +
          '<button class="seg-tab' + (currentTab === 'posts' ? ' is-active' : '') + '" type="button" data-tab="posts">我的发布</button>' +
          '<button class="seg-tab' + (currentTab === 'favorites' ? ' is-active' : '') + '" type="button" data-tab="favorites">收藏信息</button>' +
        '</div>' +

        '<div class="mine-list"><div class="card-list" id="mineList">' + listHtml() + '</div></div>' +

        /* ---- 设置区 ---- */
        '<div class="settings-row">' +
          '<div class="settings-item"><span>账号与安全</span><span class="settings-item__value">Demo 暂未开放 ›</span></div>' +
          '<div class="settings-item"><span>数据存储方式</span><span class="settings-item__value">浏览器本地模拟数据 ›</span></div>' +
          '<button class="settings-item settings-item--danger" type="button" data-act="reset">' +
            '<span>清空本地数据，恢复初始演示</span><span class="settings-item__value">›</span>' +
          '</button>' +
        '</div>' +

        '<div class="safe-space"></div>';
    },

    mounted: function (params, root) {
      root.addEventListener('click', function (event) {

        /* 切换“我的发布 / 收藏信息” */
        var tab = event.target.closest('[data-tab]');
        if (tab) {
          currentTab = tab.dataset.tab;
          root.querySelectorAll('.seg-tab').forEach(function (el) {
            el.classList.toggle('is-active', el === tab);
          });
          root.querySelector('#mineList').innerHTML = listHtml();
          return;
        }

        /* 删除我发布的信息 */
        var del = event.target.closest('[data-del]');
        if (del) {
          event.stopPropagation();
          var id = del.dataset.del;
          Utils.modal({
            title: '删除这条信息？',
            text: '删除后将从首页和“我的发布”中移除。',
            confirmText: '删除',
            onConfirm: function () {
              Store.remove(id);
              Utils.toast('已删除');
              App.rerender();
            }
          });
          return;
        }

        /* 重置演示数据 */
        var reset = event.target.closest('[data-act="reset"]');
        if (reset) {
          Utils.modal({
            title: '清空本地数据？',
            text: '将删除你发布的全部信息和收藏，恢复成初始的模拟数据。',
            confirmText: '清空',
            onConfirm: function () {
              Store.reset();
              currentTab = 'posts';
              Utils.toast('已恢复初始演示数据');
              App.rerender();
            }
          });
          return;
        }

        /* 打开详情 */
        var card = event.target.closest('.card');
        if (card) App.navigate('detail', { id: card.dataset.id });
      });
    }
  };

  function listHtml() {
    if (currentTab === 'favorites') {
      return Components.itemList(Store.favorites(), {
        icon: '⭐',
        title: '还没有收藏的信息',
        desc: '在详情页点击左下角的“收藏”，就会出现在这里'
      });
    }
    return Components.itemList(Store.mine(), {
      icon: '📝',
      title: '还没有发布过信息',
      desc: '点击底部中间的“发布”，试试发一条二手闲置'
    }, { deletable: true });
  }
})(window);
