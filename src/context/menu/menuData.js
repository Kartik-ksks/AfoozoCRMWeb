import React from 'react';

import mainPageData from '../../PageData';
import { ButtonIcon } from '../../components/ButtonIcon';

const getMenuDataForRole = (role) => {
  if (!role) return [];

  return mainPageData
    .filter(data => data.roles?.includes(role))
    .map((data) => ({
      title: data.name,
      Icon: <ButtonIcon icon={data.Icon} />,
      path: data.path,
      common: data.common,
      info: data.info,
      items: data.items?.filter(item => item.roles?.includes(role)),
    }));
};

export default getMenuDataForRole;
