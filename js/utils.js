/* =========================================================================
   校园集市 Demo · 工具层（utils）
   - 纯前端、零依赖，负责：文本转义、时间格式化、占位图生成、Toast / 弹窗
   - 迁移到微信小程序时，本文件除 Toast / 弹窗（换成 wx.showToast / wx.showModal）
     与 readImage（换成 wx.chooseMedia）外，其余函数可直接复用
   ========================================================================= */
(function (global) {
  'use strict';

  var Utils = {};

  /* 占位图配色：与分类主题保持一致 */
  var PALETTE = {
    blue:   ['#EAF2FF', '#CBDDFF', '#2F7BFF'],
    green:  ['#E8F9F0', '#C7EEDA', '#12A150'],
    orange: ['#FFF3E8', '#FFDCBB', '#F97316'],
    purple: ['#F2EDFF', '#DACDFF', '#7C5CFF']
  };

  /* ------------------------------------------------------------------
     文本
     ------------------------------------------------------------------ */
  Utils.escape = function (value) {
    return String(value === null || value === undefined ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  /* ------------------------------------------------------------------
     时间
     ------------------------------------------------------------------ */
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  Utils.fromNow = function (timestamp) {
    var diff = Date.now() - Number(timestamp || 0);
    if (isNaN(diff) || diff < 0) diff = 0;
    var minutes = Math.floor(diff / 60000);
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return minutes + '分钟前';
    var hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + '小时前';
    var days = Math.floor(hours / 24);
    if (days < 7) return days + '天前';
    return Utils.formatDate(timestamp);
  };

  Utils.formatDate = function (timestamp) {
    var d = new Date(Number(timestamp));
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  };

  /* 详情页展示用：10月10日 19:20 */
  Utils.formatDateTime = function (timestamp) {
    var d = new Date(Number(timestamp));
    return pad(d.getMonth() + 1) + '月' + pad(d.getDate()) + '日 ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  };

  Utils.clock = function () {
    var d = new Date();
    return d.getHours() + ':' + pad(d.getMinutes());
  };

  Utils.greeting = function () {
    var h = new Date().getHours();
    if (h < 6) return '夜深了';
    if (h < 11) return '早上好';
    if (h < 14) return '中午好';
    if (h < 18) return '下午好';
    return '晚上好';
  };

  /* ------------------------------------------------------------------
     价格：空值统一显示“面议”
     ------------------------------------------------------------------ */
  Utils.price = function (value) {
    if (value === null || value === undefined || value === '') {
      return '<span class="price price--soft">面议</span>';
    }
    var num = Number(value);
    if (isNaN(num)) return '<span class="price price--soft">' + Utils.escape(value) + '</span>';
    var text = num % 1 === 0 ? num : num.toFixed(2);
    return '<span class="price">¥' + text + '</span>';
  };

  Utils.priceText = function (value) {
    if (value === null || value === undefined || value === '') return '面议';
    var num = Number(value);
    if (isNaN(num)) return String(value);
    return '¥' + (num % 1 === 0 ? num : num.toFixed(2));
  };

  /* ------------------------------------------------------------------
     占位图：用内联 SVG 生成，不依赖任何外部图片 / 网络
     ------------------------------------------------------------------ */
  Utils.placeholder = function (icon, theme, label) {
    var colors = PALETTE[theme] || PALETTE.blue;
    var safeLabel = String(label || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    if (safeLabel.length > 12) safeLabel = safeLabel.slice(0, 12) + '…';

    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="720" height="560" viewBox="0 0 720 560">' +
        '<defs>' +
          '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0" stop-color="' + colors[0] + '"/>' +
            '<stop offset="1" stop-color="' + colors[1] + '"/>' +
          '</linearGradient>' +
        '</defs>' +
        '<rect width="720" height="560" fill="url(#bg)"/>' +
        '<circle cx="612" cy="86" r="118" fill="#FFFFFF" opacity="0.45"/>' +
        '<circle cx="96" cy="486" r="132" fill="#FFFFFF" opacity="0.38"/>' +
        '<text x="360" y="268" font-size="176" text-anchor="middle" font-family="Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, sans-serif">' + (icon || '📦') + '</text>' +
        '<text x="360" y="392" font-size="34" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, sans-serif" fill="' + colors[2] + '" opacity="0.9">' + safeLabel + '</text>' +
        '<text x="360" y="514" font-size="20" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, sans-serif" fill="' + colors[2] + '" opacity="0.45">校园集市 · 示例图片</text>' +
      '</svg>';

    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  };

  /* 取一条信息的封面：优先用户上传的图片，否则生成占位图 */
  Utils.cover = function (item, category) {
    if (item && item.images && item.images.length) return item.images[0];
    var icon = (item && item.icon) || (category && category.icon) || '📦';
    var theme = (category && category.theme) || 'blue';
    return Utils.placeholder(icon, theme, item && item.title);
  };

  /* 把本地选择的图片压缩成 dataURL（避免 localStorage 超出容量） */
  Utils.readImage = function (file, maxSize) {
    maxSize = maxSize || 1024;
    return new Promise(function (resolve, reject) {
      if (!file) { reject(new Error('没有选择图片')); return; }
      if (!/^image\//.test(file.type)) { reject(new Error('请选择图片文件')); return; }

      var reader = new FileReader();
      reader.onerror = function () { reject(new Error('图片读取失败')); };
      reader.onload = function () {
        var img = new Image();
        img.onerror = function () { resolve(reader.result); };
        img.onload = function () {
          var scale = Math.min(1, maxSize / Math.max(img.width, img.height));
          var w = Math.max(1, Math.round(img.width * scale));
          var h = Math.max(1, Math.round(img.height * scale));
          var canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          try { resolve(canvas.toDataURL('image/jpeg', 0.82)); }
          catch (e) { resolve(reader.result); }
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  };

  /* ------------------------------------------------------------------
     交互反馈
     ------------------------------------------------------------------ */
  function appRoot() { return document.getElementById('app'); }

  var toastTimer = null;
  Utils.toast = function (message, duration) {
    var root = appRoot();
    if (!root) return;
    var el = root.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      root.appendChild(el);
    }
    el.innerHTML = Utils.escape(message);
    void el.offsetWidth; /* 触发重排，保证连续调用也有动画 */
    el.classList.add('is-show');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove('is-show');
    }, duration || 1800);
  };

  /**
   * 通用弹窗
   * Utils.modal({ title, text, extra, cancelText, confirmText, onConfirm })
   */
  Utils.modal = function (options) {
    options = options || {};
    var root = appRoot();
    if (!root) return;

    var overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML =
      '<div class="dialog" role="dialog">' +
        '<div class="dialog__body">' +
          (options.title ? '<h3 class="dialog__title">' + Utils.escape(options.title) + '</h3>' : '') +
          (options.text ? '<p class="dialog__text">' + Utils.escape(options.text) + '</p>' : '') +
          (options.extra ? '<div class="dialog__extra">' + Utils.escape(options.extra) + '</div>' : '') +
        '</div>' +
        '<div class="dialog__actions">' +
          '<button type="button" data-role="cancel">' + Utils.escape(options.cancelText || '取消') + '</button>' +
          '<button type="button" data-role="confirm">' + Utils.escape(options.confirmText || '确定') + '</button>' +
        '</div>' +
      '</div>';

    function close() {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }

    overlay.addEventListener('click', function (event) {
      var button = event.target.closest('button');
      if (!button) {
        if (event.target === overlay) close();
        return;
      }
      if (button.dataset.role === 'confirm' && typeof options.onConfirm === 'function') {
        options.onConfirm();
      }
      close();
    });

    root.appendChild(overlay);
  };

  /* 复制文本：优先用 Clipboard API，file:// 下自动降级 */
  Utils.copy = function (text) {
    text = String(text || '');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function () { fallbackCopy(text); });
      return;
    }
    fallbackCopy(text);
  };

  function fallbackCopy(text) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', 'readonly');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try { document.execCommand('copy'); } catch (e) { /* 忽略：仅用于演示 */ }
    document.body.removeChild(area);
  }

  /* ------------------------------------------------------------------
     其他
     ------------------------------------------------------------------ */
  Utils.uid = function (prefix) {
    return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  };

  Utils.escapeWithBr = function (text) {
    return Utils.escape(text).replace(/\n/g, '<br />');
  };

  global.Utils = Utils;
})(window);
