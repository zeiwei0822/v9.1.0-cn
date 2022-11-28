import { getBackendSrv } from 'app/core/services/backend_srv';
import store from 'app/core/store';
import { getDatasourceSrv } from 'app/features/plugins/datasource_srv';

import { SetupStep } from './types';

const step1TutorialTitle = 'Grafana fundamentals';
const step2TutorialTitle = 'Create users and teams';
const keyPrefix = 'getting.started.';
const step1Key = `${keyPrefix}${step1TutorialTitle.replace(' ', '-').trim().toLowerCase()}`;
const step2Key = `${keyPrefix}${step2TutorialTitle.replace(' ', '-').trim().toLowerCase()}`;

export const getSteps = (): SetupStep[] => [
  {
    heading: '歡迎來到 Grafana',
    subheading: '以下步驟將指導您快速完成 Grafana 安裝設置。',
    title: '基礎',
    info: '以下步驟將指導您快速完成 Grafana 安裝設置',
    done: false,
    cards: [
      {
        type: 'tutorial',
        heading: '數據源和儀表板',
        title: step1TutorialTitle,
        info: '如果您之前沒有經驗，請設置並了解 Grafana。本教程將指導您完成整個過程，並包含右側的“數據源”和“儀表板”步驟。',
        href: 'https://grafana.com/tutorials/grafana-fundamentals',
        icon: 'grafana',
        check: () => Promise.resolve(store.get(step1Key)),
        key: step1Key,
        done: false,
      },
      {
        type: 'docs',
        title: '添加您的第一個數據源',
        heading: '數據源',
        icon: 'database',
        learnHref: 'https://grafana.com/docs/grafana/latest/features/datasources/add-a-data-source',
        href: 'datasources/new',
        check: () => {
          return new Promise((resolve) => {
            resolve(
              getDatasourceSrv()
                .getMetricSources()
                .filter((item) => {
                  return item.meta.builtIn !== true;
                }).length > 0
            );
          });
        },
        done: false,
      },
      {
        type: 'docs',
        heading: '儀錶盤',
        title: '創建您的第一個儀表板',
        icon: 'apps',
        href: 'dashboard/new',
        learnHref: 'https://grafana.com/docs/grafana/latest/guides/getting_started/#create-a-dashboard',
        check: async () => {
          const result = await getBackendSrv().search({ limit: 1 });
          return result.length > 0;
        },
        done: false,
      },
    ],
  },
  {
    heading: '設置完成！',
    subheading:
      '使用 Grafana 的所有必要步驟都已完成。現在處理高級步驟或充分利用此主頁儀表板並刪除此面板。',
    title: 'Advanced',
    info: ' 管理您的用戶和團隊並添加插件。',
    done: false,
    cards: [
      {
        type: 'tutorial',
        heading: '用戶',
        title: '創建用戶和團隊',
        info: '學習將您的用戶組織成團隊並管理資源訪問和角色。',
        href: 'https://grafana.com/tutorials/create-users-and-teams',
        icon: 'users-alt',
        key: step2Key,
        check: () => Promise.resolve(store.get(step2Key)),
        done: false,
      },
      {
        type: 'docs',
        heading: '插件',
        title: '查找並安裝插件',
        learnHref: 'https://grafana.com/docs/grafana/latest/plugins/installation',
        href: 'plugins',
        icon: 'plug',
        check: async () => {
          const plugins = await getBackendSrv().get('/api/plugins', { embedded: 0, core: 0 });
          return Promise.resolve(plugins.length > 0);
        },
        done: false,
      },
    ],
  },
];
