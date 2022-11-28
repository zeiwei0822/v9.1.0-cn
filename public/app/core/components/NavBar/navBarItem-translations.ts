import { MessageDescriptor } from '@lingui/core';
import { defineMessage } from '@lingui/macro';

// Maps the ID of the nav item to a translated phrase to later pass to <Trans />
// Because the navigation content is dynamic (defined in the backend), we can not use
// the normal inline message definition method.

// The keys of the TRANSLATED_MENU_ITEMS object (NOT the id inside the defineMessage function)
// must match the ID of the navigation item, as defined in the backend nav model

// see pkg/api/index.go
const TRANSLATED_MENU_ITEMS: Record<string, MessageDescriptor> = {
  home: defineMessage({ id: 'nav.home', message: '首頁' }),

  create: defineMessage({ id: 'nav.create', message: '創建' }),
  'create-dashboard': defineMessage({ id: 'nav.create-dashboard', message: '儀表板' }),
  folder: defineMessage({ id: 'nav.create-folder', message: '文件夾r' }),
  import: defineMessage({ id: 'nav.create-import', message: '輸入' }),
  alert: defineMessage({ id: 'nav.create-alert', message: '新警報規則' }),

  starred: defineMessage({ id: 'nav.starred', message: '星標' }),
  'starred-empty': defineMessage({ id: 'nav.starred-empty', message: '有星標的儀表板將顯示在此處' }),
  dashboards: defineMessage({ id: 'nav.dashboards', message: '儀表板' }),
  'dashboards/browse': defineMessage({ id: 'nav.manage-dashboards', message: '瀏覽' }),
  'dashboards/playlists': defineMessage({ id: 'nav.playlists', message: '播放列表' }),
  'dashboards/snapshots': defineMessage({ id: 'nav.snapshots', message: '快照' }),
  'dashboards/library-panels': defineMessage({ id: 'nav.library-panels', message: '面板庫' }),
  'dashboards/new': defineMessage({ id: 'nav.new-dashboard', message: '新儀表板' }),
  'dashboards/folder/new': defineMessage({ id: 'nav.new-folder', message: '新文件夾' }),

  explore: defineMessage({ id: 'nav.explore', message: '探索' }),

  alerting: defineMessage({ id: 'nav.alerting', message: '警報' }),
  'alerting-legacy': defineMessage({ id: 'nav.alerting-legacy', message: '警報 (legacy)' }),
  'alert-list': defineMessage({ id: 'nav.alerting-list', message: '警報規則' }),
  receivers: defineMessage({ id: 'nav.alerting-receivers', message: '聯絡點' }),
  'am-routes': defineMessage({ id: 'nav.alerting-am-routes', message: '通知政策' }),
  channels: defineMessage({ id: 'nav.alerting-channels', message: '通知渠道' }),

  silences: defineMessage({ id: 'nav.alerting-silences', message: '靜音' }),
  groups: defineMessage({ id: 'nav.alerting-groups', message: '團體' }),
  'alerting-admin': defineMessage({ id: 'nav.alerting-admin', message: '帳號' }),

  cfg: defineMessage({ id: 'nav.config', message: '配置' }),
  datasources: defineMessage({ id: 'nav.datasources', message: '數據源' }),
  users: defineMessage({ id: 'nav.users', message: '使用者' }),
  teams: defineMessage({ id: 'nav.teams', message: '團隊' }),
  plugins: defineMessage({ id: 'nav.plugins', message: '插件' }),
  'org-settings': defineMessage({ id: 'nav.org-settings', message: '喜好' }),
  apikeys: defineMessage({ id: 'nav.api-keys', message: 'API密鑰' }),
  serviceaccounts: defineMessage({ id: 'nav.service-accounts', message: '服務帳號' }),

  live: defineMessage({ id: 'nav.live', message: '事件流' }),
  'live-status': defineMessage({ id: 'nav.live-status', message: '身分' }),
  'live-pipeline': defineMessage({ id: 'nav.live-pipeline', message: '管道' }),
  'live-cloud': defineMessage({ id: 'nav.live-cloud', message: '雲端' }),

  help: defineMessage({ id: 'nav.help', message: '幫助' }),

  'profile-settings': defineMessage({ id: 'nav.profile/settings', message: '喜好' }),
  'change-password': defineMessage({ id: 'nav.profile/password', message: '更改密碼' }),
  'sign-out': defineMessage({ id: 'nav.sign-out', message: '登出' }),
};

export default TRANSLATED_MENU_ITEMS;
