const { Plugin, Setting, getAllEditor, openTab, showMessage } = require('siyuan');
const css = "/* Scoped to the central workspace: sidebars, popovers and note content stay native. */\nhtml[data-theme-mode=\"dark\"] .layout__center {\n  --nn-tab: #202020;\n  --nn-active: #191919;\n  --nn-line: #303030;\n  --nn-text: #ebebeb;\n  --nn-muted: #9b9b9b;\n  --nn-separator: #555555;\n  --nn-hover: #292929;\n}\nhtml[data-theme-mode=\"light\"] .layout__center {\n  --nn-tab: #f7f7f5;\n  --nn-active: #ffffff;\n  --nn-line: #e9e9e7;\n  --nn-text: #37352f;\n  --nn-muted: #787774;\n  --nn-separator: #c4c4c0;\n  --nn-hover: #efefed;\n}\n.layout__center [data-type=\"wnd\"] > .fn__flex:has(> .layout-tab-bar) {\n  min-width: 0;\n  background: var(--nn-tab) !important;\n  border-radius: 0 !important;\n  box-shadow: inset 0 -1px var(--nn-line) !important;\n}\n.layout__center,\n.layout__center > .fn__flex:has([data-type=\"wnd\"]) {\n  border-top-left-radius: 0 !important;\n  border-top-right-radius: 0 !important;\n}\n.layout__center .layout-tab-bar {\n  margin-top: 0 !important;\n  margin-bottom: 0 !important;\n  margin-left: 0 !important;\n  /* SiYuan sets inline margin-right to reserve toolbar/window controls in merged mode. */\n  margin-right: 0;\n  height: 38px !important;\n  min-height: 38px !important;\n  padding: 0 !important;\n  gap: 0 !important;\n  border-radius: 0 !important;\n  background: transparent !important;\n  box-shadow: none !important;\n  border: 0 !important;\n}\nbody:not(.body--toolbar-hide) .layout__center .layout-tab-bar {\n  margin-right: 0 !important;\n}\n.layout__center .layout-tab-bar > .item:not(.item--readonly) {\n  box-sizing: border-box !important;\n  height: 38px !important;\n  min-height: 38px !important;\n  flex: 0 0 220px !important;\n  width: 220px !important;\n  max-width: 220px !important;\n  justify-content: flex-start !important;\n  margin: 0 !important;\n  padding: 0 12px 0 16px !important;\n  border: 0 !important;\n  border-right: 1px solid var(--nn-line) !important;\n  border-radius: 0 !important;\n  background: transparent !important;\n  box-shadow: none !important;\n  color: var(--nn-text) !important;\n  transition: none !important;\n}\n.layout__center .layout-tab-bar > .item:not(.item--readonly)::before,\n.layout__center .layout-tab-bar > .item:not(.item--readonly)::after {\n  display: none !important;\n}\n.layout__center .layout-tab-bar > .item:not(.item--readonly):hover {\n  background: var(--nn-hover) !important;\n  color: var(--nn-text) !important;\n}\n.layout__center .layout-tab-bar > .item.item--focus {\n  background: var(--nn-active) !important;\n  color: var(--nn-text) !important;\n}\n.layout__center .layout-tab-bar .item__text {\n  padding: 0 !important;\n  margin: 0 !important;\n  flex: 1 1 auto !important;\n  min-width: 0;\n  text-align: left !important;\n  font-family: var(--b3-font-family) !important;\n  font-size: 14px !important;\n  line-height: 20px !important;\n  color: inherit !important;\n  font-weight: 400 !important;\n  text-shadow: none !important;\n  transition: none !important;\n}\n.layout__center .layout-tab-bar .item--focus .item__text {\n  font-weight: 600 !important;\n}\n.layout__center .layout-tab-bar .item__icon {\n  margin-right: 6px !important;\n}\n.layout__center .layout-tab-bar .item__close {\n  opacity: 0;\n  border-radius: 4px !important;\n  color: var(--nn-muted) !important;\n  background: transparent !important;\n}\n.layout__center .layout-tab-bar .item:hover .item__close,\n.layout__center .layout-tab-bar .item:focus-within .item__close { opacity: 1; }\n.layout__center .layout-tab-bar > .item.item--pin { flex: 0 0 auto !important; width: auto !important; min-width: 38px; }\n.layout__center .layout-tab-bar:not(.layout-tab-bar--readonly) { flex: 0 1 auto !important; min-width: 0; overflow-x: auto !important; scrollbar-width: none; }\n.layout__center .layout-tab-bar--readonly { min-width: 64px; }\n.layout__center .layout-tab-bar .item__close:hover {\n  color: var(--nn-text) !important;\n  background: var(--nn-line) !important;\n}\n.layout__center .layout-tab-bar .item--readonly {\n  height: 38px !important;\n  min-height: 38px !important;\n  margin: 0 !important;\n  padding: 0 6px !important;\n  border: 0 !important;\n  border-radius: 0 !important;\n  background: transparent !important;\n  box-shadow: none !important;\n}\n.layout__center .layout-tab-bar .block__icon {\n  color: var(--nn-muted) !important;\n  border-radius: 4px !important;\n}\n.layout__center .layout-tab-bar .block__icon:hover {\n  color: var(--nn-text) !important;\n  background: var(--nn-hover) !important;\n}\n/* Native breadcrumb nodes, icons, arrows and hit areas remain intact. */\n.layout__center .protyle > .protyle-breadcrumb {\n  background: var(--nn-active) !important;\n  box-shadow: none !important;\n  border-radius: 0 !important;\n  color: var(--nn-text) !important;\n}\n.layout__center .protyle > .protyle-breadcrumb .protyle-breadcrumb__item {\n  border-radius: 4px !important;\n}\n.layout__center .protyle > .protyle-breadcrumb .protyle-breadcrumb__item:hover {\n  background: var(--nn-hover) !important;\n}\nbody.body--toolbar-hide .layout__center .layout__wnd--center > .fn__flex > .layout-tab-bar {\n  height: 42px !important;\n  min-height: 42px !important;\n}\n";
const treeCSS = "html[data-theme-mode=\"dark\"] .sy__file {\n  --ni-surface: #202020; --ni-hover: #292929; --ni-selected: #303030;\n  --ni-text: #ddddda; --ni-muted: #999995; --ni-line: #303030;\n}\nhtml[data-theme-mode=\"light\"] .sy__file {\n  --ni-surface: #f7f7f5; --ni-hover: #efefed; --ni-selected: #e7e7e4;\n  --ni-text: #37352f; --ni-muted: #787774; --ni-line: #e5e5e2;\n}\n#layouts .sy__file.file-tree.dockPanel {\n  background: var(--ni-surface) !important;\n  color: var(--ni-text) !important;\n  border-radius: 0 !important;\n}\n#layouts .sy__file.file-tree.dockPanel > .block__icons {\n  background: transparent !important;\n  min-height: 36px;\n  padding: 4px 12px;\n  box-shadow: none !important;\n  border: 0 !important;\n}\n#layouts .sy__file.file-tree.dockPanel .block__logo {\n  font-size: 12px !important;\n  font-weight: 500 !important;\n  color: var(--ni-muted) !important;\n}\n#layouts .sy__file.file-tree.dockPanel .b3-list--background {\n  background: transparent !important;\n  box-shadow: none !important;\n}\n#layouts .sy__file.file-tree.dockPanel .b3-list-item {\n  min-height: 28px !important;\n  margin: 1px 6px !important;\n  padding-top: 0 !important;\n  padding-bottom: 0 !important;\n  border: 0 !important;\n  border-radius: 4px !important;\n  background: transparent !important;\n  box-shadow: none !important;\n  color: var(--ni-text) !important;\n  transition: none !important;\n}\n#layouts .sy__file.file-tree.dockPanel [data-type=\"navigation-root\"] {\n  margin-top: 6px !important;\n  margin-bottom: 3px !important;\n}\n#layouts .sy__file.file-tree.dockPanel .b3-list-item:hover {\n  background: var(--ni-hover) !important;\n}\n#layouts .sy__file.file-tree.dockPanel .b3-list-item--focus {\n  background: var(--ni-selected) !important;\n  color: var(--ni-text) !important;\n}\n#layouts .sy__file.file-tree.dockPanel .b3-list-item__text {\n  font-size: 14px !important;\n  line-height: 28px !important;\n  font-weight: 400 !important;\n  color: inherit !important;\n  text-shadow: none !important;\n}\n#layouts .sy__file.file-tree.dockPanel .b3-list-item--focus > .b3-list-item__text {\n  font-weight: 600 !important;\n}\n#layouts .sy__file.file-tree.dockPanel :is(.b3-list-item__toggle, .b3-list-item__arrow, .b3-list-item__graphic, .b3-list-item__action, .block__icon) {\n  color: var(--ni-muted) !important;\n}\n#layouts .sy__file.file-tree.dockPanel .b3-list-item__action {\n  opacity: 0 !important;\n  border-radius: 3px !important;\n}\n#layouts .sy__file.file-tree.dockPanel .b3-list-item:is(:hover, :focus-within) > .b3-list-item__action {\n  opacity: 1 !important;\n}\n#layouts .sy__file.file-tree.dockPanel .b3-list-item__action:hover {\n  background: var(--ni-selected) !important;\n  color: var(--ni-text) !important;\n}\n#layouts .sy__file.file-tree.dockPanel .counter {\n  background: transparent !important;\n  color: var(--ni-muted) !important;\n  box-shadow: none !important;\n  font-size: 11px !important;\n}\n#layouts .sy__file.file-tree.dockPanel :focus-visible {\n  outline: 2px solid var(--b3-theme-primary) !important;\n  outline-offset: -2px;\n}\n";
const searchCSS = "html[data-theme-mode=\"dark\"] [data-key=\"dialog-globalsearch\"] {\n  --ni-surface: #252525; --ni-input: #252525; --ni-results: #252525; --ni-preview: #191919;\n  --ni-hover: #303030; --ni-selected: #383838; --ni-line: #3b3b3b;\n  --ni-text: #dededc; --ni-muted: #999994; --ni-mark: transparent; --ni-mark-text: #dededc;\n}\nhtml[data-theme-mode=\"light\"] [data-key=\"dialog-globalsearch\"] {\n  --ni-surface: #ffffff; --ni-input: #ffffff; --ni-results: #ffffff; --ni-preview: #fafaf9;\n  --ni-hover: #f7f7f5; --ni-selected: #efefed; --ni-line: #e9e9e7;\n  --ni-text: #37352f; --ni-muted: #787774; --ni-mark: #f4e8c4; --ni-mark-text: #655029;\n}\n[data-key=\"dialog-globalsearch\"] .b3-dialog__container {\n  width: min(1008px, calc(100vw - 32px)) !important;\n  height: min(700px, calc(100vh - 48px)) !important;\n  max-width: calc(100vw - 32px);\n  max-height: calc(100vh - 48px);\n  border: 1px solid var(--ni-line) !important;\n  border-radius: 18px !important;\n  background: var(--ni-surface) !important;\n  box-shadow: 0 16px 64px #00000030 !important;\n  color: var(--ni-text);\n}\n[data-key=\"dialog-globalsearch\"] .b3-dialog__body > .fn__flex-column {\n  background: var(--ni-surface) !important;\n  border-radius: 18px !important;\n}\n/* Put the query first without moving or replacing native controls. */\n[data-key=\"dialog-globalsearch\"] .b3-dialog__body > .fn__flex-column > .block__icons { order: 3; }\n[data-key=\"dialog-globalsearch\"] .b3-dialog__body > .fn__flex-column > .search__header { order: 4; }\n[data-key=\"dialog-globalsearch\"] .b3-dialog__body > .fn__flex-column > .search__header:has(#searchInput) { order: 1; }\n[data-key=\"dialog-globalsearch\"] #criteria { order: 5; }\n[data-key=\"dialog-globalsearch\"] .ni-search-controls { order: 2; }\n[data-key=\"dialog-globalsearch\"] .ni-search-label { order: 6; }\n[data-key=\"dialog-globalsearch\"] .search__layout { order: 7; flex-direction: row !important; min-height: 0; padding: 0 12px 12px; gap: 14px; }\n[data-key=\"dialog-globalsearch\"] .search__tip { order: 8; }\n[data-key=\"dialog-globalsearch\"] .search__drag { display: none !important; }\n[data-key=\"dialog-globalsearch\"] .search__header {\n  background: var(--ni-input) !important;\n  border-radius: 0 !important;\n  box-shadow: none !important;\n  border: 0 !important;\n}\n[data-key=\"dialog-globalsearch\"] .search__header:has(#searchInput) {\n  min-height: 54px;\n  padding: 0 14px !important;\n}\n[data-key=\"dialog-globalsearch\"] #searchInput {\n  font-family: var(--b3-font-family) !important;\n  font-size: 17px !important;\n  line-height: 26px !important;\n  min-height: 54px !important;\n  padding: 14px 32px 14px 36px !important;\n  background: transparent !important;\n  color: var(--ni-text) !important;\n  border-radius: 0 !important;\n  box-shadow: none !important;\n}\n[data-key=\"dialog-globalsearch\"] #searchInput::placeholder { color: var(--ni-muted); font-size: 17px; }\n[data-key=\"dialog-globalsearch\"] #searchHistoryBtn .search__arrowdown { display: none; }\n[data-key=\"dialog-globalsearch\"].ni-search-ready:not(.ni-search-advanced) .search__header:has(#searchInput) > .block__icons,\n[data-key=\"dialog-globalsearch\"].ni-search-ready:not(.ni-search-advanced) .b3-dialog__body > .fn__flex-column > .block__icons,\n[data-key=\"dialog-globalsearch\"].ni-search-ready:not(.ni-search-advanced) #criteria { display: none !important; }\n[data-key=\"dialog-globalsearch\"] .ni-search-controls { display: flex; align-items: center; gap: 6px; padding: 0 17px 7px; min-height: 31px; }\n[data-key=\"dialog-globalsearch\"] .ni-search-controls button { display: inline-flex; align-items: center; gap: 6px; min-width: 0; padding: 5px 7px; font: 13px/20px var(--b3-font-family); color: var(--ni-muted); background: transparent; border: 0; border-radius: 5px; cursor: pointer; white-space: nowrap; }\n[data-key=\"dialog-globalsearch\"] .ni-search-controls button:hover { background: var(--ni-hover); color: var(--ni-text); }\n[data-key=\"dialog-globalsearch\"] .ni-search-controls button[aria-pressed=\"true\"] { color: var(--ni-text); }\n[data-key=\"dialog-globalsearch\"] .ni-search-controls button:disabled { opacity: .45; cursor: default; }\n[data-key=\"dialog-globalsearch\"] .ni-search-controls svg { width: 15px; height: 15px; flex: none; }\n[data-key=\"dialog-globalsearch\"] .ni-search-controls [data-ni-action=\"path\"] span { max-width: 220px; overflow: hidden; text-overflow: ellipsis; }\n[data-key=\"dialog-globalsearch\"] .ni-search-spacer { flex: 1; }\n[data-key=\"dialog-globalsearch\"] .ni-search-label { padding: 7px 24px 5px; font-size: 12px; color: var(--ni-muted); }\n[data-key=\"dialog-globalsearch\"] .search__header .block__icons,\n[data-key=\"dialog-globalsearch\"] .b3-dialog__body > .fn__flex-column > .block__icons {\n  background: transparent !important;\n  box-shadow: none !important;\n  border: 0 !important;\n  color: var(--ni-muted) !important;\n}\n[data-key=\"dialog-globalsearch\"] .b3-dialog__body > .fn__flex-column > .block__icons {\n  padding: 4px 14px;\n  min-height: 32px;\n  font-size: 12px;\n}\n[data-key=\"dialog-globalsearch\"] .block__icon { color: var(--ni-muted) !important; border-radius: 4px !important; }\n[data-key=\"dialog-globalsearch\"] .block__icon:not([disabled]):hover { background: var(--ni-hover) !important; color: var(--ni-text) !important; }\n[data-key=\"dialog-globalsearch\"] #criteria { padding: 2px 14px 8px; }\n[data-key=\"dialog-globalsearch\"] #criteria .b3-button {\n  color: var(--ni-muted) !important;\n  background: transparent !important;\n  border: 1px solid var(--ni-line) !important;\n  box-shadow: none !important;\n  border-radius: 4px !important;\n  font-size: 12px;\n}\n[data-key=\"dialog-globalsearch\"] #searchList {\n  flex: 1 1 60% !important;\n  width: 0 !important;\n  height: auto !important;\n  min-width: 0;\n  margin: 0 !important;\n  padding: 0 4px 0 0 !important;\n  border-radius: 0 !important;\n  background: var(--ni-results) !important;\n}\n[data-key=\"dialog-globalsearch\"] #searchList [data-type=\"search-item\"] {\n  display: flex !important;\n  flex-wrap: nowrap !important;\n  align-items: center !important;\n  min-height: 36px !important;\n  height: 36px !important;\n  margin: 1px 0 !important;\n  padding: 0 10px !important;\n  border: 0 !important;\n  border-radius: 10px !important;\n  background: transparent !important;\n  box-shadow: none !important;\n  color: var(--ni-text) !important;\n}\n[data-key=\"dialog-globalsearch\"] #searchList > .b3-list-item[data-type=\"search-item\"]:hover { background: var(--ni-hover) !important; }\n[data-key=\"dialog-globalsearch\"] #searchList > .b3-list-item[data-type=\"search-item\"].b3-list-item--focus { background: var(--ni-selected) !important; }\n[data-key=\"dialog-globalsearch\"] #searchList .b3-list-item__graphic {\n  color: var(--ni-muted) !important;\n  position: static !important;\n  flex: none !important;\n  width: 16px; height: 16px;\n  margin: 0 10px 0 0 !important;\n  padding: 0 !important;\n}\n[data-key=\"dialog-globalsearch\"] #searchList .b3-list-item__text {\n  display: block !important;\n  flex: 0 1 auto !important;\n  max-width: 68%;\n  white-space: nowrap !important;\n  overflow: hidden !important;\n  text-overflow: ellipsis !important;\n  -webkit-line-clamp: 1 !important;\n  min-width: 0;\n  padding: 0 !important;\n  margin: 0 !important;\n  font-size: 14px !important;\n  line-height: 22px !important;\n  color: var(--ni-text) !important;\n  font-weight: 400 !important;\n}\n[data-key=\"dialog-globalsearch\"] #searchList .b3-list-item__meta {\n  position: static !important;\n  order: 0 !important;\n  flex: 1 1 40% !important;\n  min-width: 0;\n  max-width: none !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  font-size: 12px !important;\n  line-height: 22px !important;\n  text-align: left !important;\n  color: var(--ni-muted) !important;\n  opacity: 1 !important;\n  background: transparent !important;\n}\n[data-key=\"dialog-globalsearch\"] #searchList .b3-list-item__meta::before { display: inline !important; content: ' — ' !important; white-space: pre; }\n[data-key=\"dialog-globalsearch\"] #searchList mark {\n  color: var(--ni-mark-text) !important;\n  background: var(--ni-mark) !important;\n  border-radius: 2px;\n  padding: 0 1px;\n}\n[data-key=\"dialog-globalsearch\"] #searchList .counter { display: none !important; }\n[data-key=\"dialog-globalsearch\"] #searchPreview {\n  flex: 1 1 40% !important;\n  width: 0 !important; min-width: 0; height: auto !important;\n  border: 1px solid var(--ni-line) !important;\n  border-radius: 13px !important;\n  margin: 0 !important;\n  background: var(--ni-preview) !important;\n  overflow: hidden;\n}\n[data-key=\"dialog-globalsearch\"] #searchPreview > .protyle-content { background: transparent !important; }\n[data-key=\"dialog-globalsearch\"] #searchPreview > .protyle-breadcrumb { padding: 9px 12px; border-bottom: 1px solid var(--ni-line); background: transparent !important; }\n[data-key=\"dialog-globalsearch\"] #searchPreview .protyle-title { margin: 30px 22px 12px !important; font-size: 24px !important; }\n[data-key=\"dialog-globalsearch\"] #searchPreview .protyle-title__input { font-size: 24px !important; line-height: 1.4 !important; padding: 0 !important; }\n[data-key=\"dialog-globalsearch\"].ni-search-recent #searchPreview .protyle-title__input.protyle-wysiwyg--hl::after { background: transparent !important; }\n[data-key=\"dialog-globalsearch\"] #searchPreview .protyle-wysiwyg { padding: 0 22px 60px !important; font-size: 14px !important; }\n[data-key=\"dialog-globalsearch\"].ni-search-no-preview #searchPreview { display: none !important; }\n[data-key=\"dialog-globalsearch\"] .search__tip {\n  padding: 8px 12px;\n  background: var(--ni-surface) !important;\n  border-top: 1px solid var(--ni-line);\n  font-size: 11px;\n  color: var(--ni-muted) !important;\n}\n[data-key=\"dialog-globalsearch\"] .search__tip kbd { background: transparent !important; box-shadow: none !important; color: var(--ni-muted) !important; }\n[data-key=\"dialog-globalsearch\"] :focus-visible { outline: 2px solid var(--b3-theme-primary); outline-offset: -2px; }\n[data-key=\"dialog-globalsearch\"] #searchInput:focus-visible { outline: none; }\n@media (max-width: 760px) {\n  [data-key=\"dialog-globalsearch\"] .b3-dialog__container { max-width: calc(100vw - 24px); }\n  [data-key=\"dialog-globalsearch\"] .search__header:has(#searchInput) { flex-wrap: wrap; }\n  [data-key=\"dialog-globalsearch\"] .search__header:has(#searchInput) > .fn__flex-1 { min-width: 160px; }\n  [data-key=\"dialog-globalsearch\"] #searchPreview { display: none !important; }\n  [data-key=\"dialog-globalsearch\"] .ni-search-controls { gap: 0; padding: 0 10px 7px; }\n  [data-key=\"dialog-globalsearch\"] .ni-search-controls [data-ni-action=\"preview\"] { display: none; }\n  [data-key=\"dialog-globalsearch\"] .ni-search-controls [data-ni-action=\"path\"] span { max-width: 90px; }\n}\n";
const findCSS = "html[data-theme-mode=\"dark\"] .ni-find { --nf-bg:#202020; --nf-line:#41464c; --nf-focus:#485761; --nf-text:#dededb; --nf-muted:#979792; --nf-hover:#303030; }\nhtml[data-theme-mode=\"light\"] .ni-find { --nf-bg:#fff; --nf-line:#d7d7d4; --nf-focus:#b2c2ce; --nf-text:#37352f; --nf-muted:#787774; --nf-hover:#f2f2ef; }\n.ni-find:not(.ni-find-expanded), .ni-find:not(.ni-find-expanded) > .b3-dialog { pointer-events:none; }\n.ni-find:not(.ni-find-expanded) .b3-dialog__scrim { background:transparent!important; pointer-events:none; backdrop-filter:none!important; }\n.ni-find:not(.ni-find-expanded) .b3-dialog__container {\n  position:fixed!important; top:var(--ni-find-top)!important; right:var(--ni-find-right)!important; left:auto!important; bottom:auto!important;\n  transform:none!important; width:min(284px, var(--ni-find-width), calc(100vw - 32px))!important; height:auto!important; min-height:42px!important; max-height:calc(100vh - 32px);\n  margin:0!important; padding:0!important; border:1px solid var(--nf-line)!important; border-radius:13px!important; background:var(--nf-bg)!important;\n  box-shadow:0 3px 12px #00000018!important; pointer-events:auto; overflow:hidden;\n}\n.ni-find:not(.ni-find-expanded) .b3-dialog__container:focus-within { border-color:var(--nf-focus)!important; box-shadow:0 0 0 1px var(--nf-focus)!important; }\n.ni-find:not(.ni-find-expanded) .b3-dialog__body > .fn__flex-column { background:transparent!important; height:auto!important; border-radius:0!important; }\n.ni-find:not(.ni-find-expanded) .b3-dialog__body > .fn__flex-column > :not(.search__header:has(#searchInput)):not(.ni-find-tools) { display:none!important; }\n.ni-find:not(.ni-find-expanded) .search__header:has(#searchInput) { display:flex!important; align-items:center; order:1; padding:0 8px 0 10px!important; margin:0!important; min-height:42px; background:transparent!important; border:0!important; border-radius:0!important; box-shadow:none!important; }\n.ni-find:not(.ni-find-expanded) .search__header:has(#searchInput) > .fn__flex-1 { min-width:0; }\n.ni-find:not(.ni-find-expanded) #searchInput { display:block; box-sizing:border-box; width:100%; min-height:40px!important; height:40px!important; max-height:40px!important; padding:10px 0!important; margin:0!important; resize:none; font:13px/20px var(--b3-font-family)!important; border:0!important; border-radius:0!important; outline:none!important; box-shadow:none!important; background:transparent!important; color:var(--nf-text)!important; }\n.ni-find:not(.ni-find-expanded) #searchInput::placeholder { color:var(--nf-muted); text-align:left!important; opacity:1; font-size:13px!important; }\n.ni-find:not(.ni-find-expanded) #searchInput { text-align:left!important; }\n/* Savor reserves 60 px for its search icon; the compact panel has no icon. */\n.ni-find.b3-dialog--open[data-key=\"dialog-search\"]:not(.ni-find-expanded) .b3-dialog__container .fn__flex-column .b3-form__icon.search__header #searchInput { padding:10px 0!important; }\n.ni-find:not(.ni-find-expanded) .search__header:has(#searchInput) > .block__icons,\n.ni-find:not(.ni-find-expanded) #searchHistoryBtn,\n.ni-find:not(.ni-find-expanded) .search__header:has(#searchInput) .b3-form__icon-clear { display:none!important; }\n.ni-find .ni-find-close { flex:none; width:28px; height:28px; padding:0; border:0; border-radius:4px; font:20px/28px var(--b3-font-family); color:var(--nf-muted); background:transparent; cursor:pointer; }\n.ni-find .ni-find-close:hover { background:var(--nf-hover); color:var(--nf-text); }\n.ni-find .ni-find-tools { display:flex; flex-wrap:wrap; order:2; gap:3px; align-items:center; padding:3px 8px 8px 10px; color:var(--nf-muted); font:12px/22px var(--b3-font-family); }\n.ni-find:not(.ni-find-has-query):not(.ni-find-expanded) .ni-find-tools { display:none; }\n.ni-find .ni-find-tools [role=\"status\"] { flex:1; min-width:65px; }\n.ni-find .ni-find-tools button { border:0; border-radius:4px; padding:2px 6px; background:transparent; color:var(--nf-muted); font:12px/22px var(--b3-font-family); cursor:pointer; white-space:nowrap; }\n.ni-find .ni-find-tools button:hover:not(:disabled) { background:var(--nf-hover); color:var(--nf-text); }\n.ni-find .ni-find-tools button:disabled { opacity:.35; cursor:default; }\n.ni-find button:focus-visible { outline:2px solid var(--nf-focus); outline-offset:-2px; }\n.layout__center .ni-find-current { outline:1px solid #b59b55; outline-offset:2px; background-color:#b59b551c!important; }\n";

module.exports = class NotionNavigation extends Plugin {
  async onload() {
    this.alive = true;
    this.styles = new Map();
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
    if (this.preferences.search) this.startSearch();
    else this.stopSearch();
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
    this.setting?.close();
    for (const style of this.styles.values()) style.remove();
    this.styles.clear();
  }
};
