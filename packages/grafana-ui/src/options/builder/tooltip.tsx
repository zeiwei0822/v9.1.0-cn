import { PanelOptionsEditorBuilder } from '@grafana/data';
import { OptionsWithTooltip, TooltipDisplayMode, SortOrder } from '@grafana/schema';

export function addTooltipOptions<T extends OptionsWithTooltip>(
  builder: PanelOptionsEditorBuilder<T>,
  singleOnly = false
) {
  const category = ['Tooltip'];
  const modeOptions = singleOnly
    ? [
        { value: TooltipDisplayMode.Single, label: 'Single' },
        { value: TooltipDisplayMode.None, label: 'Hidden' },
      ]
    : [
        { value: TooltipDisplayMode.Single, label: '一個' },
        { value: TooltipDisplayMode.Multi, label: '全部' },
        { value: TooltipDisplayMode.None, label: '隱藏' },
      ];

  const sortOptions = [
    { value: SortOrder.None, label: '不變' },
    { value: SortOrder.Ascending, label: '上升' },
    { value: SortOrder.Descending, label: '下降' },
  ];

  builder
    .addRadio({
      path: 'tooltip.mode',
      name: '工具提示模式',
      category,
      defaultValue: 'single',
      settings: {
        options: modeOptions,
      },
    })
    .addRadio({
      path: 'tooltip.sort',
      name: 'Values sort order',
      category,
      defaultValue: SortOrder.None,
      showIf: (options: T) => options.tooltip.mode === TooltipDisplayMode.Multi,
      settings: {
        options: sortOptions,
      },
    });
}
