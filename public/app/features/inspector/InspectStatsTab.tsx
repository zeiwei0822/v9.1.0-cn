import { t } from '@lingui/macro';
import React from 'react';

import { PanelData, QueryResultMetaStat, TimeZone } from '@grafana/data';
import { selectors } from '@grafana/e2e-selectors';

import { InspectStatsTable } from './InspectStatsTable';

interface InspectStatsTabProps {
  data: PanelData;
  timeZone: TimeZone;
}

export const InspectStatsTab: React.FC<InspectStatsTabProps> = ({ data, timeZone }) => {
  if (!data.request) {
    return null;
  }

  let stats: QueryResultMetaStat[] = [];

  const requestTime = data.request.endTime ? data.request.endTime - data.request.startTime : -1;
  const processingTime = data.timings?.dataProcessingTime || -1;
  let dataRows = 0;

  for (const frame of data.series) {
    dataRows += frame.length;
  }

  if (requestTime > 0) {
    stats.push({
      displayName: t({ id: 'dashboard.inspect-stats.request-time', message: '總請求時間' }),
      value: requestTime,
      unit: 'ms',
    });
  }
  if (processingTime > 0) {
    stats.push({
      displayName: t({ id: 'dashboard.inspect-stats.processing-time', message: '數據處理時間' }),
      value: processingTime,
      unit: 'ms',
    });
  }
  stats.push({
    displayName: t({ id: 'dashboard.inspect-stats.queries', message: '查詢次數' }),
    value: data.request.targets.length,
  });
  stats.push({
    displayName: t({ id: 'dashboard.inspect-stats.rows', message: '總行數' }),
    value: dataRows,
  });

  let dataStats: QueryResultMetaStat[] = [];

  for (const series of data.series) {
    if (series.meta && series.meta.stats) {
      dataStats = dataStats.concat(series.meta.stats);
    }
  }

  const statsTableName = t({ id: 'dashboard.inspect-stats.table-title', message: '數據統計' });
  const dataStatsTableName = t({ id: 'dashboard.inspect-stats.data-title', message: '統計數據源' });

  return (
    <div aria-label={selectors.components.PanelInspector.Stats.content}>
      <InspectStatsTable timeZone={timeZone} name={statsTableName} stats={stats} />
      <InspectStatsTable timeZone={timeZone} name={dataStatsTableName} stats={dataStats} />
    </div>
  );
};
