/* =========================================================================
   页面：信息详情页
   内容：图片区域 / 标题 / 详细描述 / 价格 / 发布时间 / 联系方式按钮
   交互：点击“联系方式”弹出“请通过微信联系发布者”
   ========================================================================= */
(function (global) {
  'use strict';

  var Pages = global.Pages || (global.Pages = {});

  Pages.detail = {
    name: 'detail',
    tab: false,
    navbar: { title: '信息详情', back: true },

    render: function (params) {
      var item = Store.get(params.id);
      if (!item) {
        return '<div class="page-inner">' +
          Components.empty({ icon: '🕳️', title: '信息不存在或已被删除', desc: '返回首页看看其他内容' }) +
        '</div>';
      }

      var category = Store.categoryById(item.category) || { name: '信息', theme: 'gray', icon: '📦' };
      var images = (item.images && item.images.length) ? item.images : [Utils.cover(item, category)];

      return '' +
        '<div class="page-inner">' +

          /* ---- 图片区域 ---- */
          '<div class="gallery">' +
            '<div class="gallery__track" id="galleryTrack">' +
              images.map(function (src) {
                return '<div class="gallery__item"><img src="' + src + '" alt="' + Utils.escape(item.title) + '" /></div>';
              }).join('') +
            '</div>' +
            (images.length > 1 ? '<span class="gallery__count" id="galleryCount">1/' + images.length + '</span>' : '') +
          '</div>' +

          /* ---- 价格 + 标题 ---- */
          '<div class="detail-block">' +
            '<div class="detail-price">' +
              Utils.price(item.price) +
              '<span class="detail-price__note">' + (item.price === null || item.price === '' ? '价格可协商' : '支持当面交易') + '</span>' +
            '</div>' +
            '<h2 class="detail-title">' + Utils.escape(item.title) + '</h2>' +
            '<div class="detail-tags">' +
              '<span class="chip chip--' + category.theme + '">' + category.icon + ' ' + category.name + '</span>' +
              '<span class="muted">浏览 ' + (item.views || 0) + ' 次</span>' +
              (item.isMine ? '<span class="chip chip--gray">我发布的</span>' : '') +
            '</div>' +
          '</div>' +

          /* ---- 基本信息 ---- */
          '<div class="detail-block">' +
            infoRow('发布时间', Utils.formatDateTime(item.createdAt)) +
            infoRow('地点', item.location || 'XX大学') +
            infoRow('分类', category.name) +
            infoRow('联系方式', maskContact(item.contact)) +
          '</div>' +

          /* ---- 详细描述 ---- */
          '<div class="detail-block">' +
            '<h3 class="block-title">详细描述</h3>' +
            '<p class="block-text">' + Utils.escape(item.desc || '发布者没有填写更多说明。') + '</p>' +
          '</div>' +

          /* ---- 发布者 ---- */
          '<div class="detail-block">' +
            '<div class="publisher">' +
              Components.avatar(item.author) +
              '<div>' +
                '<div class="publisher__name">' + Utils.escape((item.author && item.author.name) || '匿名同学') +
                  '<span class="verify">校园认证</span>' +
                '</div>' +
                '<div class="publisher__sub">' + Utils.escape((item.author && item.author.campus) || 'XX大学') + '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div class="safe-space"></div>' +
        '</div>' +

        /* ---- 底部操作条 ---- */
        '<div class="actionbar">' +
          '<button class="action-icon' + (item.isFavorite ? ' is-active' : '') + '" type="button" data-act="favorite">' +
            Components.icon('heart')(item.isFavorite) +
            '<span>' + (item.isFavorite ? '已收藏' : '收藏') + '</span>' +
          '</button>' +
          (item.isMine
            ? '<button class="action-icon" type="button" data-act="delete">' + Components.icon('trash') + '<span>删除</span></button>'
            : '') +
          '<button class="btn-primary" type="button" data-act="contact">' +
            Components.icon('chat') + '联系方式' +
          '</button>' +
        '</div>';
    },

    mounted: function (params, root) {
      Store.addView(params.id);
      var item = Store.get(params.id);
      if (!item) return;

      /* 图片轮播计数 */
      var track = root.querySelector('#galleryTrack');
      var counter = root.querySelector('#galleryCount');
      if (track && counter) {
        track.addEventListener('scroll', function () {
          var index = Math.round(track.scrollLeft / track.clientWidth) + 1;
          counter.textContent = Math.min(index, track.children.length) + '/' + track.children.length;
        });
      }

      root.addEventListener('click', function (event) {
        var btn = event.target.closest('[data-act]');
        if (!btn) return;
        var act = btn.dataset.act;

        if (act === 'back') { App.back(); return; }

        if (act === 'contact') {
          /* 需求：点击后弹出“请通过微信联系发布者” */
          Utils.modal({
            title: '联系方式',
            text: '请通过微信联系发布者',
            extra: item.contact || '暂未填写联系方式',
            cancelText: '知道了',
            confirmText: '复制联系方式',
            onConfirm: function () {
              Utils.copy(item.contact || '');
              Utils.toast('已复制：' + (item.contact || ''));
            }
          });
          return;
        }

        if (act === 'favorite') {
          var nowFavorite = Store.toggleFavorite(item.id);
          btn.classList.toggle('is-active', nowFavorite);
          btn.innerHTML = Components.icon('heart')(nowFavorite) +
            '<span>' + (nowFavorite ? '已收藏' : '收藏') + '</span>';
          Utils.toast(nowFavorite ? '已加入我的收藏' : '已取消收藏');
          return;
        }

        if (act === 'delete') {
          Utils.modal({
            title: '删除这条信息？',
            text: '删除后不会影响模拟数据，可随时重新发布。',
            confirmText: '删除',
            onConfirm: function () {
              Store.remove(item.id);
              Utils.toast('已删除');
              App.back();
            }
          });
        }
      });
    }
  };

  function infoRow(label, value) {
    return '<div class="info-row">' +
      '<span class="info-row__label">' + label + '</span>' +
      '<span class="info-row__value">' + Utils.escape(value) + '</span>' +
    '</div>';
  }

  /* 列表中不直接完整展示联系方式，点击按钮后再显示 */
  function maskContact(contact) {
    if (!contact) return '未填写';
    return contact.length > 4 ? contact.slice(0, 4) + '****' : '****';
  }
})(window);
