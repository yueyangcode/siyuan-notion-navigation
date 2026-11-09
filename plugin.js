const { Plugin, Setting, getAllEditor, openTab, showMessage } = require('siyuan');
const css = /* NAVIGATION_CSS */ '';
const treeCSS = /* TREE_CSS */ '';
const searchCSS = /* SEARCH_CSS */ '';
const findCSS = /* FIND_CSS */ '';

module.exports = class NotionNavigation extends Plugin {
  async onload() {
    this.alive = true;
    this.styles = new Map();
    this.paths = new Map();
    this.onPathEditor = event => this.attachPath(event.detail.protyle);
    this.preferences = { navigation: true, tree: true, search: true };
    try {
      const saved = await this.loadData('settings.json');
      for (const key of Object.keys(this.preferences)) {
        if (typeof saved?.[key] === 'boolean') this.preferences[key] = saved[key];
      }
    } catch {
      showMessage('暂时无法读取外观设置，已使用默认外观。', 4000, 'error');
    }
    if (this.alive) this.applyPreferences();
  }

  applyPreferences() {
    for (const [key, content] of Object.entries({ navigation: css, tree: treeCSS, search: searchCSS + findCSS })) {
      if (this.preferences[key] && !this.styles.has(key)) {
        const style = document.createElement('style');
        style.dataset.notionInterface = key;
        if (key === 'navigation') style.dataset.notionNavigation = this.name;
        style.textContent = content;
        document.head.appendChild(style);
        this.styles.set(key, style);
      } else if (!this.preferences[key]) {
        this.styles.get(key)?.remove();
        this.styles.delete(key);
      }
    }
    if (this.preferences.navigation) this.startPaths();
    else this.stopPaths();
    if (this.preferences.search) this.startSearch();
    else this.stopSearch();
  }

  onLayoutReady() {
    if (this.preferences.navigation) for (const editor of getAllEditor()) this.attachPath(editor.protyle);
  }

  startPaths() {
    if (this.pathActive) return;
    this.pathActive = true;
    for (const name of ['loaded-protyle-static', 'loaded-protyle-dynamic', 'switch-protyle']) this.eventBus.on(name, this.onPathEditor);
    for (const editor of getAllEditor()) this.attachPath(editor.protyle);
  }

  stopPaths() {
    if (this.pathActive) {
      for (const name of ['loaded-protyle-static', 'loaded-protyle-dynamic', 'switch-protyle']) this.eventBus.off(name, this.onPathEditor);
      this.pathActive = false;
    }
    for (const state of this.paths.values()) { state.abort.abort(); state.observer.disconnect(); state.nav.remove(); }
    this.paths.clear();
  }

  async attachPath(protyle) {
    const bar = protyle?.element?.closest('.layout__center') && protyle.element.querySelector(':scope > .protyle-breadcrumb > .protyle-breadcrumb__bar');
    const id = protyle?.block?.rootID;
    if (!bar || !/^\d{14}-[a-z0-9]{7}$/.test(id || '')) return;
    const previous = this.paths.get(bar);
    if (previous?.id === id) return;
    if (previous) { previous.abort.abort(); previous.observer.disconnect(); previous.nav.remove(); this.paths.delete(bar); }
    const abort = new AbortController();
    const nav = document.createElement('nav'); nav.className = 'nn-document-path'; nav.setAttribute('aria-label', '文档层级');
    const state = { id, abort, nav, ready: false };
    state.observer = new MutationObserver(() => {
      if (!state.ready || !bar.isConnected || !this.pathActive) return;
      if (protyle.block?.rootID !== id) { this.attachPath(protyle); return; }
      if (!nav.isConnected) bar.prepend(nav);
    });
    state.observer.observe(bar, { childList: true });
    this.paths.set(bar, state);
    try {
      const info = await this.api('block/getBlockInfo', { id }, abort.signal);
      const ids = info.path.replace(/\.sy$/, '').split('/').filter(Boolean);
      if (ids.at(-1) !== id || ids.some(item => !/^\d{14}-[a-z0-9]{7}$/.test(item))) throw Error('无效文档路径');
      const docs = await Promise.all(ids.map(async item => ({ id: item, name: (await this.api('block/getDocInfo', { id: item }, abort.signal)).name || '未命名' })));
      if (abort.signal.aborted || !this.pathActive || this.paths.get(bar)?.id !== id || !bar.isConnected) return;
      const notebook = window.siyuan.notebooks.find(item => item.id === info.box);
      if (notebook) { const label = document.createElement('span'); label.className = 'nn-notebook'; label.textContent = notebook.name; nav.append(label); }
      docs.forEach((doc, index) => {
        if (index || notebook) { const slash = document.createElement('span'); slash.textContent = '/'; slash.className = 'nn-path-separator'; slash.setAttribute('aria-hidden', 'true'); nav.append(slash); }
        const button = document.createElement('button'); button.type = 'button'; button.textContent = doc.name; button.title = doc.name;
        if (index === docs.length - 1) button.setAttribute('aria-current', 'page');
        button.addEventListener('click', async event => { event.stopPropagation(); try { await openTab({ app: this.app, doc: { id: doc.id } }); } catch { showMessage('无法打开该页面，请确认文档仍然存在。', 4000, 'error'); } });
        nav.append(button);
      });
      state.ready = true;
      bar.prepend(nav);
    } catch (error) { if (error.name !== 'AbortError') { state.observer.disconnect(); this.paths.delete(bar); nav.remove(); } }
  }

  startSearch() {
    if (this.searchObserver) return;
    this.searchStates = new Map();
    this.findStates = new Map();
    this.onSearchInput = event => {
      this.scanSearch();
      const { config, searchElement } = event.detail;
      const find = this.findStates.get(searchElement?.closest('[data-key="dialog-search"]'));
      if (find) {
        const rootID = config.idPath?.[0]?.split('/').at(-1).replace(/\.sy$/, '');
        if (/^\d{14}-[a-z0-9]{7}$/.test(rootID || '') && rootID !== find.rootID) { find.rootID = rootID; find.position(); }
        find.version++;
        find.pending = !!find.input.value;
        find.matches = []; find.index = -1;
        find.mark?.classList.remove('ni-find-current');
        this.updateFind(find);
      }
      const state = this.searchStates.get(searchElement?.closest('[data-key="dialog-globalsearch"]'));
      if (!state) return;
      this.syncSearch(state, config);
      if (!state.titleOnly || config.method > 1) return;
      // Native search snapshots config immediately after this synchronous event.
      // Restore on the microtask so temporary page filtering never becomes a saved native filter.
      const previous = config.types;
      const types = Object.fromEntries(Object.keys(previous).map(key => [key, key === 'document']));
      config.types = types;
      queueMicrotask(() => { if (config.types === types) config.types = previous; });
    };
    this.onSearchResults = event => {
      const detail = event.detail;
      const find = this.findStates.get(detail.searchElement?.closest('[data-key="dialog-search"]'));
      if (find) {
        const flatten = blocks => blocks.flatMap(block => block.children ? flatten(block.children) : [block]);
        find.pending = false;
        find.page = detail.config.page || 1;
        find.matches = detail.config.query ? flatten(detail.blocks).filter(block => block.rootID === find.rootID && /^\d{14}-[a-z0-9]{7}$/.test(block.id)) : [];
        find.index = -1;
        this.updateFind(find);
        if (!find.expanded) {
          // Reuse native query/debounce, but don't render a second editor inside the small find panel.
          detail.blocks = [];
          if (find.matches.length) this.jumpFind(find, find.pageDirection || 1);
          find.pageDirection = 0;
        }
        queueMicrotask(() => { if (this.alive && find.root.isConnected) this.updateFind(find); });
        return;
      }
      const state = this.searchStates.get(detail.searchElement?.closest('[data-key="dialog-globalsearch"]'));
      if (!state || !state.titleOnly || detail.config.method > 1 || detail.config.query || detail.config.idPath?.length) return;
      // Native empty-query search ignores block types. Supply real recently updated
      // document records to its renderer; keyboard navigation and preview stay native.
      if (state.recent) detail.blocks = state.recent;
    };
    this.eventBus.on('input-search', this.onSearchInput);
    this.eventBus.on('before-search-results-render', this.onSearchResults);
    this.searchObserver = new MutationObserver(() => this.scanSearch());
    // Dialogs are direct body children. Never observe editor content or scroll events.
    this.searchObserver.observe(document.body, { childList: true });
    this.scanSearch();
  }

  scanSearch() {
    this.scanFind();
    for (const state of this.searchStates.values()) if (!state.root.isConnected || state.root.dataset.key !== 'dialog-globalsearch') this.disposeSearch(state);
    for (const root of document.querySelectorAll('body > [data-key="dialog-globalsearch"]')) {
      if (this.searchStates.has(root)) continue;
      const input = root.querySelector('#searchInput');
      const container = root.querySelector('.b3-dialog__body > .fn__flex-column');
      if (!input || !container) continue;
      const bar = document.createElement('div');
      bar.className = 'ni-search-controls';
      bar.innerHTML = `<button type="button" data-ni-action="titles" aria-pressed="true"><span aria-hidden="true">Aa</span> 仅搜索页面标题</button>
        <button type="button" data-ni-action="path"><svg aria-hidden="true"><use href="#iconFolder"></use></svg><span>在页面中</span></button>
        <button type="button" data-ni-action="advanced" aria-expanded="false">＋ 更多筛选</button>
        <span class="ni-search-spacer"></span><button type="button" data-ni-action="preview" aria-label="显示或隐藏预览" aria-pressed="true"><svg aria-hidden="true"><use href="#iconLayoutRight"></use></svg></button>`;
      const label = document.createElement('div');
      label.className = 'ni-search-label';
      const state = { root, input, bar, label, titleOnly: this.searchTitleOnly ?? true,
        placeholder: input.getAttribute('placeholder'), request: new AbortController() };
      state.click = event => {
        const button = event.target.closest('[data-ni-action]');
        if (!button) return;
        event.stopPropagation();
        switch (button.dataset.niAction) {
          case 'titles':
            this.searchTitleOnly = state.titleOnly = !state.titleOnly;
            this.syncSearch(state);
            root.querySelector('#searchRefresh')?.click();
            break;
          case 'path': root.querySelector('#searchPath')?.click(); break;
          case 'advanced':
            button.setAttribute('aria-expanded', String(root.classList.toggle('ni-search-advanced')));
            break;
          case 'preview':
            button.setAttribute('aria-pressed', String(!root.classList.toggle('ni-search-no-preview')));
            break;
        }
      };
      state.nativeClick = event => {
        if (event.target.closest('#searchFilter')) {
          this.searchTitleOnly = state.titleOnly = false;
          this.syncSearch(state);
          root.querySelector('#searchRefresh')?.click();
        }
      };
      bar.addEventListener('click', state.click);
      root.addEventListener('click', state.nativeClick, true);
      container.append(bar, label);
      root.classList.add('ni-search-ready');
      this.searchStates.set(root, state);
      this.syncSearch(state);
      // Fixed read-only, bounded query. One request per dialog, cancelled on close.
      this.api('query/sql', { stmt: "SELECT id, box, path, hpath, content FROM blocks WHERE type = 'd' ORDER BY updated DESC, id DESC LIMIT 40" }, state.request.signal).then(rows => {
        if (!this.alive || !root.isConnected || state.request.signal.aborted) return;
        const escape = text => String(text).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
        state.recent = rows.map(row => ({ id: row.id, rootID: row.id, box: row.box, path: row.path,
          hPath: row.hpath.slice(0, row.hpath.lastIndexOf('/')) || '/', content: escape(row.content), type: 'NodeDocument', ial: {}, refCount: 0 }));
        if (state.titleOnly) root.querySelector('#searchRefresh')?.click();
      }).catch(error => {
        if (error.name !== 'AbortError' && root.isConnected) {
          state.titleOnly = false;
          this.syncSearch(state);
        }
      });
    }
  }

  syncSearch(state, config) {
    config ||= window.siyuan.dialogs.find(dialog => dialog.element === state.root)?.data;
    const supported = !config || config.method <= 1;
    const titles = state.bar.querySelector('[data-ni-action="titles"]');
    titles.disabled = !supported;
    titles.setAttribute('aria-pressed', String(state.titleOnly && supported));
    titles.title = supported ? '切换页面标题与原生块搜索' : '页面标题筛选适用于关键字和查询语法搜索';
    state.input.placeholder = state.titleOnly && supported ? '搜索页面标题…' : state.placeholder;
    state.root.classList.toggle('ni-search-recent', !state.input.value);
    state.bar.querySelector('[data-ni-action="path"] span').textContent = config?.hPath || '在页面中';
    state.label.textContent = state.input.value || config?.idPath?.length ? '搜索结果' : state.titleOnly && supported ? '最近更新的页面' : '最近更新的块';
  }

  disposeSearch(state) {
    state.request.abort();
    state.bar.removeEventListener('click', state.click);
    state.root.removeEventListener('click', state.nativeClick, true);
    state.bar.remove(); state.label.remove();
    state.root.classList.remove('ni-search-ready', 'ni-search-advanced', 'ni-search-no-preview', 'ni-search-recent');
    state.input.setAttribute('placeholder', state.placeholder);
    this.searchStates.delete(state.root);
  }

  stopSearch() {
    if (!this.searchObserver) return;
    this.searchObserver.disconnect(); this.searchObserver = null;
    this.eventBus.off('input-search', this.onSearchInput);
    this.eventBus.off('before-search-results-render', this.onSearchResults);
    for (const state of this.searchStates.values()) this.disposeSearch(state);
    for (const state of this.findStates.values()) this.disposeFind(state);
  }

  scanFind() {
    for (const state of this.findStates.values()) if (!state.root.isConnected || state.root.dataset.key !== 'dialog-search') this.disposeFind(state);
    for (const root of document.querySelectorAll('body > [data-key="dialog-search"]')) {
      if (this.findStates.has(root)) continue;
      const dialog = window.siyuan.dialogs.find(item => item.element === root);
      const input = root.querySelector('#searchInput');
      const path = dialog?.data?.idPath?.[0];
      if (!input || !path) continue;
      const rootID = path.split('/').at(-1).replace(/\.sy$/, '');
      if (!/^\d{14}-[a-z0-9]{7}$/.test(rootID)) continue;
      const tools = document.createElement('div');
      tools.className = 'ni-find-tools';
      tools.innerHTML = `<span role="status" aria-live="polite"></span><button type="button" data-find="previous" aria-label="上一个匹配块" title="上一个匹配块 · Shift+Enter">↑</button><button type="button" data-find="next" aria-label="下一个匹配块" title="下一个匹配块 · Enter">↓</button><button type="button" data-find="expand">查找与替换</button>`;
      const close = document.createElement('button');
      close.type = 'button'; close.className = 'ni-find-close'; close.textContent = '×'; close.setAttribute('aria-label', '关闭页内查找');
      const container = root.querySelector('[role="dialog"]');
      const state = { root, rootID, input, dialog, tools, close, container, matches: [], index: -1, version: 0, expanded: false, placeholder: input.placeholder, modal: container.getAttribute('aria-modal') };
      state.position = () => {
        const editor = getAllEditor().find(item => item.protyle.block?.rootID === state.rootID && item.protyle.element.closest('.layout__center') && item.protyle.element.getBoundingClientRect().width)?.protyle.element;
        if (editor !== state.positionTarget) {
          state.resizeObserver?.disconnect();
          state.positionTarget = editor;
          if (editor) state.resizeObserver?.observe(editor);
        }
        const rect = editor?.getBoundingClientRect();
        const bar = editor?.querySelector('.protyle-breadcrumb')?.getBoundingClientRect();
        root.style.setProperty('--ni-find-top', `${Math.max(12, Math.min(bar?.bottom || 100, innerHeight - 160)) + 10}px`);
        root.style.setProperty('--ni-find-right', `${Math.max(16, innerWidth - (rect?.right || innerWidth) + 16)}px`);
        root.style.setProperty('--ni-find-width', `${Math.max(180, (rect?.width || innerWidth) - 32)}px`);
      };
      state.closeClick = () => dialog.destroy();
      state.click = event => {
        const action = event.target.closest('[data-find]')?.dataset.find;
        if (action === 'previous' || action === 'next') this.jumpFind(state, action === 'next' ? 1 : -1);
        if (action === 'expand') {
          state.expanded = !state.expanded;
          root.classList.toggle('ni-find-expanded', state.expanded);
          container.setAttribute('aria-modal', state.expanded ? state.modal : 'false');
          tools.querySelector('[data-find="expand"]').textContent = state.expanded ? '收起' : '查找与替换';
          root.querySelector('#searchRefresh')?.click();
        }
      };
      state.key = event => {
        if (state.expanded || event.isComposing || event.target !== input) return;
        if (['Enter', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
          event.preventDefault(); event.stopImmediatePropagation();
          this.jumpFind(state, event.key === 'ArrowUp' || event.shiftKey ? -1 : 1);
        }
      };
      close.addEventListener('click', state.closeClick);
      tools.addEventListener('click', state.click);
      root.addEventListener('keydown', state.key, true);
      window.addEventListener('resize', state.position);
      state.resizeObserver = new ResizeObserver(state.position);
      input.closest('.search__header').appendChild(close);
      root.querySelector('.b3-dialog__body > .fn__flex-column').appendChild(tools);
      root.classList.add('ni-find'); input.placeholder = '查找或替换…'; container.setAttribute('aria-modal', 'false');
      this.findStates.set(root, state);
      state.position(); this.updateFind(state);
      if (input.value) root.querySelector('#searchRefresh')?.click();
    }
  }

  updateFind(state) {
    state.root.classList.toggle('ni-find-has-query', !!state.input.value);
    const pagePrefix = Number(state.root.querySelector('#searchResult')?.dataset.pagecount) > 1 ? `${state.page || 1}页 · ` : '';
    state.tools.querySelector('[role="status"]').textContent = state.pending ? '查找中…' : state.matches.length ? `${pagePrefix}${Math.max(1, state.index + 1)} / ${state.matches.length} 块` : '无匹配';
    for (const button of state.tools.querySelectorAll('[data-find="previous"], [data-find="next"]')) button.disabled = !state.matches.length;
  }

  async jumpFind(state, step) {
    if (!state.matches.length || !state.root.isConnected) return;
    if ((step > 0 && state.index === state.matches.length - 1) || (step < 0 && state.index === 0)) {
      const page = state.root.querySelector(`[data-type="${step > 0 ? 'next' : 'previous'}"]`);
      if (page && !page.hasAttribute('disabled')) { state.pageDirection = step; page.click(); return; }
    }
    state.mark?.classList.remove('ni-find-current');
    state.index = state.index < 0 ? (step < 0 ? state.matches.length - 1 : 0) : (state.index + step + state.matches.length) % state.matches.length;
    const id = state.matches[state.index].id;
    const version = ++state.version;
    this.updateFind(state);
    const locate = () => [...document.querySelectorAll('.layout__center .protyle:not(.fn__none)')].map(editor => editor.querySelector(`.protyle-wysiwyg [data-node-id="${id}"], .protyle-title[data-node-id="${id}"]`)).find(Boolean);
    // Serialize unloaded-block navigation so rapid key presses cannot finish in reverse order.
    state.navigation = (state.navigation || Promise.resolve()).then(async () => {
      if (!this.alive || !state.root.isConnected || state.version !== version) return;
      try {
        let block = locate();
        if (!block) { await openTab({ app: this.app, doc: { id, action: ['cb-get-context', 'cb-get-hl'] } }); block = locate(); }
        if (!this.alive || !state.root.isConnected || state.version !== version) return;
        state.mark?.classList.remove('ni-find-current');
        if (block) { block.scrollIntoView({ block: 'center', behavior: 'instant' }); block.classList.add('ni-find-current'); state.mark = block; }
        state.input.focus({ preventScroll: true });
      } catch { if (state.root.isConnected && state.version === version) state.tools.querySelector('[role="status"]').textContent = '定位失败，请重试'; }
    });
    await state.navigation;
  }

  disposeFind(state) {
    state.version++;
    state.mark?.classList.remove('ni-find-current');
    window.removeEventListener('resize', state.position);
    state.resizeObserver?.disconnect();
    state.root.removeEventListener('keydown', state.key, true);
    state.close.removeEventListener('click', state.closeClick); state.close.remove();
    state.tools.removeEventListener('click', state.click); state.tools.remove();
    state.input.placeholder = state.placeholder;
    state.container.setAttribute('aria-modal', state.modal);
    state.root.classList.remove('ni-find', 'ni-find-expanded', 'ni-find-has-query');
    for (const name of ['top', 'right', 'width']) state.root.style.removeProperty(`--ni-find-${name}`);
    this.findStates.delete(state.root);
    if (state.root.isConnected && state.root.dataset.key === 'dialog-search') state.root.querySelector('#searchRefresh')?.click();
  }

  async updatePreference(key, value) {
    if (!Object.hasOwn(this.preferences, key) || typeof value !== 'boolean') throw new Error('Invalid preference');
    const next = { ...this.preferences, [key]: value };
    await this.saveData('settings.json', next);
    this.preferences = next;
    if (this.alive) this.applyPreferences();
  }

  openSetting() {
    this.setting?.close();
    const root = document.createElement('div');
    root.className = 'ni-settings';
    root.innerHTML = `<style>
      .ni-settings{width:100%;box-sizing:border-box;padding:12px 14px 18px;color:var(--b3-theme-on-background);font-family:var(--b3-font-family)}
      .ni-settings h2{font-size:22px;line-height:1.4;margin:0 0 8px;font-weight:650}
      .ni-settings p{font-size:13px;line-height:1.7;color:var(--b3-theme-on-surface);margin:0 0 22px}
      .ni-settings label{display:flex;align-items:center;gap:24px;padding:18px 0;border-top:1px solid var(--b3-border-color);cursor:pointer}
      .ni-settings label>span{flex:1;min-width:0}.ni-settings strong{display:block;font-size:14px;font-weight:500;margin-bottom:5px}
      .ni-settings small{display:block;font-size:12px;line-height:1.6;color:var(--b3-theme-on-surface)}
      .ni-settings input{appearance:none;flex:none;width:32px;height:18px;position:relative;margin:0;background:#a8a8a5;border:0;border-radius:20px;cursor:pointer}
      .ni-settings input::after{content:'';position:absolute;left:2px;top:2px;width:14px;height:14px;border-radius:50%;background:#fff}
      .ni-settings input:checked{background:#37352f}.ni-settings input:checked::after{left:16px}
      html[data-theme-mode="dark"] .ni-settings input:checked{background:#e6e6e3}html[data-theme-mode="dark"] .ni-settings input:checked::after{background:#292929}
      .ni-settings input:focus-visible{outline:2px solid var(--b3-theme-primary);outline-offset:3px}.ni-settings input:disabled{opacity:.5;cursor:wait}
      .ni-settings footer{font-size:12px;line-height:1.6;margin-top:12px;color:var(--b3-theme-on-surface)}
      .ni-settings [role="status"]{min-height:20px;margin-top:8px;font-size:12px;color:var(--b3-theme-on-surface)}
      .ni-settings-dialog{background:#fff!important;color:#37352f!important}.ni-settings-dialog .b3-dialog__header{background:transparent!important}
      html[data-theme-mode="dark"] .ni-settings-dialog{background:#202020!important;color:#ebebeb!important}
    </style>
    <h2>让常用界面更简洁</h2>
    <p>按区域独立开启。关闭某项后，会恢复当前主题和代码片段提供的外观。</p>
    <label><span><strong>导航栏与路径</strong><small>简洁标签页；保留原生历史按钮、文档路径和块级面包屑。</small></span><input type="checkbox" role="switch" data-option="navigation" aria-label="导航栏与路径"></label>
    <label><span><strong>左侧文档树</strong><small>柔和的选中底色，清楚的层级，悬停时显示操作按钮。</small></span><input type="checkbox" role="switch" data-option="tree" aria-label="左侧文档树"></label>
    <label><span><strong>搜索与页内查找</strong><small>全局搜索使用页面列表与卡片预览，页内查找使用右上角小浮层。</small></span><input type="checkbox" role="switch" data-option="search" aria-label="搜索与页内查找"></label>
    <footer>更改自动保存并立即生效。Ctrl+P 全局搜索；Ctrl+F 页内查找。</footer><div role="status" aria-live="polite"></div>`;
    const inputs = [...root.querySelectorAll('input')];
    for (const input of inputs) {
      input.checked = this.preferences[input.dataset.option];
      input.addEventListener('change', async () => {
        inputs.forEach(item => { item.disabled = true; });
        const status = root.querySelector('[role="status"]');
        status.textContent = '正在保存…';
        try {
          await this.updatePreference(input.dataset.option, input.checked);
          status.textContent = '已保存';
        } catch {
          input.checked = this.preferences[input.dataset.option];
          status.textContent = '保存失败，请重试。';
        } finally {
          inputs.forEach(item => { item.disabled = false; });
        }
      });
    }
    this.setting = new Setting({ width: '600px', height: 'auto' });
    this.setting.addItem({ title: '', direction: 'row', actionElement: root });
    this.setting.open('Notion 风格界面 / 设置');
    const dialog = root.closest('[role="dialog"]');
    if (dialog) { dialog.classList.add('ni-settings-dialog'); dialog.style.maxWidth = 'calc(100vw - 32px)'; dialog.style.maxHeight = 'calc(100vh - 48px)'; }
  }

  async api(path, data, signal) {
    const response = await fetch(`/api/${path}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data), signal
    });
    if (!response.ok) throw new Error('Path request failed');
    const result = await response.json();
    if (result.code !== 0) throw new Error('Path unavailable');
    return result.data;
  }

  onunload() {
    this.alive = false;
    this.stopSearch();
    this.stopPaths();
    this.setting?.close();
    for (const style of this.styles.values()) style.remove();
    this.styles.clear();
  }
};
