import React, { FC } from 'react';

import { Menu, Dropdown, Button, Icon } from '@grafana/ui';

export interface Props {
  folderId?: number;
  canCreateFolders?: boolean;
  canCreateDashboards?: boolean;
}

export const DashboardActions: FC<Props> = ({ folderId, canCreateFolders = false, canCreateDashboards = false }) => {
  const actionUrl = (type: string) => {
    let url = `dashboard/${type}`;

    if (folderId) {
      url += `?folderId=${folderId}`;
    }

    return url;
  };

  const MenuActions = () => {
    return (
      <Menu>
        {canCreateDashboards && <Menu.Item url={actionUrl('new')} label="新儀表板" />}
        {!folderId && canCreateFolders && <Menu.Item url="dashboards/folder/new" label="新建文件夾" />}
        {canCreateDashboards && <Menu.Item url={actionUrl('import')} label="輸入" />}
      </Menu>
    );
  };

  return (
    <div>
      <Dropdown overlay={MenuActions} placement="bottom-start">
        <Button variant="primary">
          New
          <Icon name="angle-down" />
        </Button>
      </Dropdown>
    </div>
  );
};
