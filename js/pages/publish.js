/* =========================================================================
   页面：发布信息
   内容：选择分类 / 输入标题 / 上传图片（支持占位图）/ 填写描述 / 填写价格 / 填写联系方式
   交互：点击发布 → 校验 → 生成一条新的模拟信息并跳转到详情页
   ========================================================================= */
(function (global) {
  'use strict';

  var Pages = global.Pages || (global.Pages = {});

  /* 可选的占位图（没有真实图片时使用） */
  var PRESETS = [
    { icon: '⌨️', theme: 'blue',   label: '数码' },
    { icon: '📦', theme: 'blue',   label: '快递' },
    { icon: '📚', theme: 'purple', label: '书籍' },
    { icon: '🍱', theme: 'green',  label: '餐饮' },
    { icon: '🛵', theme: 'green',  label: '跑腿' },
    { icon: '🧋', theme: 'orange', label: '拼单' }
  ];

  /* 页面内表单状态（切换 tab 后仍然保留，避免误丢草稿） */
  var draft = {
    category: 'secondhand',
    title: '',
    desc: '',
    price: '',
    contact: '',
    location: '',
    image: null,   /* 用户上传的图片 dataURL */
    icon: null     /* 选中的占位图 icon */
  };

  Pages.publish = {
    name: 'publish',
    tab: true,
    navbar: false,

    render: function () {
      return '' +
        '<div class="top-white">' +
          Components.statusbar('dark') +
          '<div class="page-head">' +
          '<div class="page-head__row">' +
            '<div>' +
              '<h1 class="page-head__title">发布信息</h1>' +
              '<p class="page-head__sub">描述清楚一点，更容易被同学看到</p>' +
            '</div>' +
            '<button class="page-head__link" type="button" data-act="sample">填充示例</button>' +
          '</div>' +
          '</div>' +
        '</div>' +

        '<form class="form" id="publishForm" novalidate>' +

          /* ---- 分类 ---- */
          '<div class="field">' +
            '<div class="field__label"><span>选择分类<i class="req">*</i></span></div>' +
            '<div class="chip-row" id="categoryRow">' +
              Store.CATEGORIES.map(function (category) {
                return '<button type="button" class="pick' + (draft.category === category.id ? ' is-active' : '') +
                  '" data-pick="' + category.id + '">' + category.icon + ' ' + category.name + '</button>';
              }).join('') +
            '</div>' +
            '<p class="field__error" id="err-category" hidden></p>' +
          '</div>' +

          /* ---- 标题 ---- */
          '<div class="field">' +
            '<div class="field__label">' +
              '<span>标题<i class="req">*</i></span>' +
              '<span class="field__counter" id="count-title">0/30</span>' +
            '</div>' +
            '<input class="input" id="f-title" type="text" maxlength="30" placeholder="例如：九成新机械键盘" value="' + Utils.escape(draft.title) + '" />' +
            '<p class="field__error" id="err-title" hidden></p>' +
          '</div>' +

          /* ---- 图片 ---- */
          '<div class="field">' +
            '<div class="field__label"><span>图片</span><span class="field__counter">可上传 1 张</span></div>' +
            '<div class="uploader">' +
              '<button class="upload-box" type="button" id="uploadBox">' +
                '<span class="upload-box__plus">＋</span>' +
                '<span>上传图片</span>' +
                (draft.image ? '<img src="' + draft.image + '" alt="已上传的图片" /><span class="upload-box__remove" id="removeImage">✕</span>' : '') +
              '</button>' +
              '<div class="uploader__tips">' +
                '<p>点击左侧方框，从本机选择图片</p>' +
                '<p>图片仅保存在浏览器本地，不会上传</p>' +
              '</div>' +
            '</div>' +
            '<input id="f-file" type="file" accept="image/*" hidden />' +
            '<p class="field__hint">没有图片？直接选一张占位图 👇</p>' +
            '<div class="preset-row" id="presetRow">' +
              PRESETS.map(function (preset) {
                return '<button type="button" class="preset" data-preset="' + preset.icon +
                  '" data-theme="' + preset.theme + '" title="' + preset.label + '">' + preset.icon + '</button>';
              }).join('') +
            '</div>' +
          '</div>' +

          /* ---- 描述 ---- */
          '<div class="field">' +
            '<div class="field__label">' +
              '<span>详细描述<i class="req">*</i></span>' +
              '<span class="field__counter" id="count-desc">0/200</span>' +
            '</div>' +
            '<textarea class="textarea" id="f-desc" maxlength="200" placeholder="写清楚成色、时间、地点等，方便同学判断">' + Utils.escape(draft.desc) + '</textarea>' +
            '<p class="field__error" id="err-desc" hidden></p>' +
          '</div>' +

          /* ---- 价格 ---- */
          '<div class="field">' +
            '<div class="field__label"><span>价格</span><span class="field__counter">留空表示面议</span></div>' +
            '<div class="input-affix">' +
              '<input class="input" id="f-price" type="number" min="0" step="1" placeholder="0" value="' + Utils.escape(draft.price) + '" />' +
              '<span class="input-affix__unit">元</span>' +
            '</div>' +
            '<p class="field__error" id="err-price" hidden></p>' +
          '</div>' +

          /* ---- 地点 ---- */
          '<div class="field">' +
            '<div class="field__label"><span>交易 / 服务地点</span></div>' +
            '<input class="input" id="f-location" type="text" maxlength="20" placeholder="例如：XX大学东区" value="' + Utils.escape(draft.location) + '" />' +
          '</div>' +

          /* ---- 联系方式 ---- */
          '<div class="field">' +
            '<div class="field__label"><span>联系方式<i class="req">*</i></span><span class="field__counter">微信号 / 手机号</span></div>' +
            '<input class="input" id="f-contact" type="text" maxlength="30" placeholder="例如：微信：keyboard_0806" value="' + Utils.escape(draft.contact) + '" />' +
            '<p class="field__error" id="err-contact" hidden></p>' +
          '</div>' +

          /* ---- 提交 ---- */
          '<div class="form-actions">' +
            '<button class="btn-ghost" type="button" data-act="clear">清空</button>' +
            '<button class="btn-primary" type="submit" id="submitBtn">立即发布</button>' +
          '</div>' +
        '</form>' +

        '<div class="safe-space"></div>';
    },

    mounted: function (params, root) {
      var form = root.querySelector('#publishForm');
      var titleInput = root.querySelector('#f-title');
      var descInput = root.querySelector('#f-desc');
      var priceInput = root.querySelector('#f-price');
      var contactInput = root.querySelector('#f-contact');
      var locationInput = root.querySelector('#f-location');
      var fileInput = root.querySelector('#f-file');
      var uploadBox = root.querySelector('#uploadBox');
      var presetRow = root.querySelector('#presetRow');
      var categoryRow = root.querySelector('#categoryRow');

      var titleCount = root.querySelector('#count-title');
      var descCount = root.querySelector('#count-desc');

      titleCount.textContent = titleInput.value.length + '/30';
      descCount.textContent = descInput.value.length + '/200';

      /* ---- 分类选择 ---- */
      categoryRow.addEventListener('click', function (event) {
        var pick = event.target.closest('[data-pick]');
        if (!pick) return;
        draft.category = pick.dataset.pick;
        categoryRow.querySelectorAll('.pick').forEach(function (el) {
          el.classList.toggle('is-active', el === pick);
        });
        hideError('category');
      });

      /* ---- 字数统计 ---- */
      titleInput.addEventListener('input', function () {
        draft.title = titleInput.value;
        titleCount.textContent = titleInput.value.length + '/30';
        hideError('title');
      });
      descInput.addEventListener('input', function () {
        draft.desc = descInput.value;
        descCount.textContent = descInput.value.length + '/200';
        hideError('desc');
      });
      priceInput.addEventListener('input', function () { draft.price = priceInput.value; hideError('price'); });
      contactInput.addEventListener('input', function () { draft.contact = contactInput.value; hideError('contact'); });
      locationInput.addEventListener('input', function () { draft.location = locationInput.value; });

      /* ---- 上传图片 ---- */
      uploadBox.addEventListener('click', function (event) {
        if (event.target.id === 'removeImage') {
          draft.image = null;
          refreshImage();
          return;
        }
        fileInput.click();
      });

      fileInput.addEventListener('change', function () {
        var file = fileInput.files && fileInput.files[0];
        if (!file) return;
        Utils.readImage(file, 1024).then(function (dataUrl) {
          draft.image = dataUrl;
          draft.icon = null;
          refreshImage();
          presetRow.querySelectorAll('.preset').forEach(function (el) { el.classList.remove('is-active'); });
          Utils.toast('图片已就绪');
        }).catch(function (error) {
          Utils.toast(error.message || '图片处理失败');
        });
        fileInput.value = '';
      });

      /* ---- 占位图选择 ---- */
      presetRow.addEventListener('click', function (event) {
        var preset = event.target.closest('[data-preset]');
        if (!preset) return;
        var sameOne = preset.classList.contains('is-active');
        presetRow.querySelectorAll('.preset').forEach(function (el) { el.classList.remove('is-active'); });
        if (sameOne) {
          draft.icon = null;
        } else {
          draft.icon = preset.dataset.preset;
          preset.classList.add('is-active');
          draft.image = null;
        }
        refreshImage();
      });

      function refreshImage() {
        var old = uploadBox.querySelector('img');
        if (old) old.remove();
        var oldRemove = uploadBox.querySelector('.upload-box__remove');
        if (oldRemove) oldRemove.remove();
        var preview = draft.image || (draft.icon ? Utils.placeholder(draft.icon, categoryTheme()) : null);
        if (!preview) return;
        uploadBox.insertAdjacentHTML('beforeend',
          '<img src="' + preview + '" alt="预览图" />' +
          '<span class="upload-box__remove" id="removeImage">✕</span>');
      }

      function categoryTheme() {
        var category = Store.categoryById(draft.category);
        return category ? category.theme : 'blue';
      }

      /* ---- 一键填充示例 ---- */
      root.addEventListener('click', function (event) {
        var action = event.target.closest('[data-act]');
        if (!action) return;

        if (action.dataset.act === 'sample') {
          draft.category = 'secondhand';
          draft.title = '九成新蓝牙耳机';
          draft.desc = '用了两个月，音质很好，续航 5 小时左右，附送充电仓和耳塞。在东区宿舍楼下自提。';
          draft.price = '120';
          draft.location = 'XX大学东区';
          draft.contact = '微信：earbud_120';
          draft.icon = '🎧';
          draft.image = null;
          fillForm();
          Utils.toast('已填充示例内容');
        }

        if (action.dataset.act === 'clear') {
          draft = { category: 'secondhand', title: '', desc: '', price: '', contact: '', location: '', image: null, icon: null };
          fillForm();
          Utils.toast('已清空');
        }
      });

      function fillForm() {
        titleInput.value = draft.title;
        descInput.value = draft.desc;
        priceInput.value = draft.price;
        contactInput.value = draft.contact;
        locationInput.value = draft.location;
        titleCount.textContent = draft.title.length + '/30';
        descCount.textContent = draft.desc.length + '/200';

        categoryRow.querySelectorAll('.pick').forEach(function (el) {
          el.classList.toggle('is-active', el.dataset.pick === draft.category);
        });
        presetRow.querySelectorAll('.preset').forEach(function (el) {
          el.classList.toggle('is-active', el.dataset.preset === draft.icon);
        });
        refreshImage();
        ['title', 'desc', 'contact'].forEach(hideError);
      }

      /* ---- 错误提示 ---- */
      function showError(field, message) {
        var el = root.querySelector('#err-' + field);
        if (!el) return;
        el.textContent = message;
        el.hidden = false;
      }
      function hideError(field) {
        var el = root.querySelector('#err-' + field);
        if (el) el.hidden = true;
      }
      function markInvalid(input, invalid) {
        if (input) input.classList.toggle('is-invalid', invalid);
      }

      /* ---- 提交发布 ---- */
      form.addEventListener('submit', function (event) {
        event.preventDefault();

        var title = titleInput.value.trim();
        var desc = descInput.value.trim();
        var contact = contactInput.value.trim();
        var priceRaw = priceInput.value.trim();
        var valid = true;

        if (!draft.category) { showError('category', '请选择一个分类'); valid = false; }
        if (title.length < 2) { showError('title', '标题至少 2 个字'); markInvalid(titleInput, true); valid = false; }
        else markInvalid(titleInput, false);
        if (desc.length < 5) { showError('desc', '描述至少 5 个字，方便同学了解详情'); markInvalid(descInput, true); valid = false; }
        else markInvalid(descInput, false);
        if (!contact) { showError('contact', '请填写联系方式，否则同学找不到你'); markInvalid(contactInput, true); valid = false; }
        else markInvalid(contactInput, false);
        if (priceRaw !== '' && (isNaN(Number(priceRaw)) || Number(priceRaw) < 0)) {
          showError('price', '价格需要是不小于 0 的数字'); markInvalid(priceInput, true); valid = false;
        } else markInvalid(priceInput, false);

        if (!valid) {
          Utils.toast('还有几项没填好，请检查一下');
          return;
        }

        var item = Store.add({
          category: draft.category,
          title: title,
          desc: desc,
          price: priceRaw,
          location: locationInput.value.trim() || 'XX大学',
          contact: contact,
          images: draft.image ? [draft.image] : [],
          icon: draft.icon || (Store.categoryById(draft.category) || {}).icon
        });

        /* 发布成功后清空表单，并直接跳到详情页看效果 */
        draft = { category: draft.category, title: '', desc: '', price: '', contact: '', location: '', image: null, icon: null };
        fillForm();

        Utils.toast('发布成功！已展示在首页和“我的发布”');
        App.navigate('detail', { id: item.id }, { root: true });
      });
    }
  };
})(window);
