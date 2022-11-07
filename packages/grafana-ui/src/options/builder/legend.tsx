import { PanelOptionsEditorBuilder, standardEditorsRegistry, StatsPickerConfigSettings } from '@grafana/data';
import { LegendDisplayMode, OptionsWithLegend } from '@grafana/schema';

/**
 * @alpha
 */
export function addLegendOptions<T extends OptionsWithLegend>(
  builder: PanelOptionsEditorBuilder<T>,
  includeLegendCalcs = true
) {
  builder
    .addBooleanSwitch({
      path: 'legend.showLegend',
      name: '詳細',
      category: ['Legend'],
      description: '',
      defaultValue: true,
    })
    .addRadio({
      path: 'legend.displayMode',
      name: '模式',
      category: ['Legend'],
      description: '',
      defaultValue: LegendDisplayMode.List,
      settings: {
        options: [
          { value: LegendDisplayMode.List, label: '列表' },
          { value: LegendDisplayMode.Table, label: '表格' },
        ],
      },
      showIf: (c) => c.legend.showLegend,
    })
    .addRadio({
      path: 'legend.placement',
      name: '放置於',
      category: ['Legend'],
      description: '',
      defaultValue: 'bottom',
      settings: {
        options: [
          { value: 'bottom', label: '底部' },
          { value: 'right', label: '右側' },
        ],
      },
      showIf: (c) => c.legend.showLegend,
    })
    .addNumberInput({
      path: 'legend.width',
      name: '寬度',
      category: ['Legend'],
      settings: {
        placeholder: 'Auto',
      },
      showIf: (c) => c.legend.showLegend && c.legend.placement === 'right',
    });

  if (includeLegendCalcs) {
    builder.addCustomEditor<StatsPickerConfigSettings, string[]>({
      id: 'legend.calcs',
      path: 'legend.calcs',
      name: '值',
      category: ['Legend'],
      description: '在圖例中選擇要顯示的值或計算',
      editor: standardEditorsRegistry.get('stats-picker').editor as any,
      defaultValue: [],
      settings: {
        allowMultiple: true,
      },
      showIf: (currentConfig) => currentConfig.legend.showLegend !== false,
    });
  }
}
