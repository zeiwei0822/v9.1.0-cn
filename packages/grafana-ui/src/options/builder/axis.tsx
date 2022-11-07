import React from 'react';

import {
  FieldConfigEditorBuilder,
  FieldType,
  identityOverrideProcessor,
  SelectableValue,
  StandardEditorProps,
} from '@grafana/data';
import { AxisColorMode, AxisConfig, AxisPlacement, ScaleDistribution, ScaleDistributionConfig } from '@grafana/schema';

import { graphFieldOptions, Select, HorizontalGroup, RadioButtonGroup } from '../../index';

/**
 * @alpha
 */
export function addAxisConfig(
  builder: FieldConfigEditorBuilder<AxisConfig>,
  defaultConfig: AxisConfig,
  hideScale?: boolean
) {
  const category = ['Axis'];

  // options for axis appearance
  builder
    .addRadio({
      path: 'axisPlacement',
      name: '置於',
      category,
      defaultValue: graphFieldOptions.axisPlacement[0].value,
      settings: {
        options: graphFieldOptions.axisPlacement,
      },
    })
    .addTextInput({
      path: 'axisLabel',
      name: '標籤',
      category,
      defaultValue: '',
      settings: {
        placeholder: '自選文字',
      },
      showIf: (c) => c.axisPlacement !== AxisPlacement.Hidden,
      // Do not apply default settings to time and string fields which are used as x-axis fields in Time series and Bar chart panels
      shouldApply: (f) => f.type !== FieldType.time && f.type !== FieldType.string,
    })
    .addNumberInput({
      path: 'axisWidth',
      name: '寬度',
      category,
      settings: {
        placeholder: '',
      },
      showIf: (c) => c.axisPlacement !== AxisPlacement.Hidden,
    })
    .addRadio({
      path: 'axisGridShow',
      name: '顯示網格線',
      category,
      defaultValue: undefined,
      settings: {
        options: [
          { value: undefined, label: '自動' },
          { value: true, label: '開' },
          { value: false, label: '關' },
        ],
      },
    })
    .addRadio({
      path: 'axisColorMode',
      name: '色彩',
      category,
      defaultValue: AxisColorMode.Text,
      settings: {
        options: [
          { value: AxisColorMode.Text, label: '文本Text' },
          { value: AxisColorMode.Series, label: '系列Series' },
        ],
      },
    });

  // options for scale range
  builder
    .addCustomEditor<void, ScaleDistributionConfig>({
      id: 'scaleDistribution',
      path: 'scaleDistribution',
      name: '規格',
      category,
      editor: ScaleDistributionEditor as any,
      override: ScaleDistributionEditor as any,
      defaultValue: { type: ScaleDistribution.Linear },
      shouldApply: (f) => f.type === FieldType.number,
      process: identityOverrideProcessor,
    })
    .addBooleanSwitch({
      path: 'axisCenteredZero',
      name: 'Centered zero',
      category,
      defaultValue: false,
      showIf: (c) => c.scaleDistribution?.type !== ScaleDistribution.Log,
    })
    .addNumberInput({
      path: 'axisSoftMin',
      name: 'Soft min',
      defaultValue: defaultConfig.axisSoftMin,
      category,
      settings: {
        placeholder: '請參閱：標準選項 > 最小值',
      },
    })
    .addNumberInput({
      path: 'axisSoftMax',
      name: 'Soft max',
      defaultValue: defaultConfig.axisSoftMax,
      category,
      settings: {
        placeholder: '請參閱：標準選項 > 最大值',
      },
    });
}

const DISTRIBUTION_OPTIONS: Array<SelectableValue<ScaleDistribution>> = [
  {
    label: 'Linear',
    value: ScaleDistribution.Linear,
  },
  {
    label: 'Logarithmic',
    value: ScaleDistribution.Log,
  },
];

const LOG_DISTRIBUTION_OPTIONS: Array<SelectableValue<number>> = [
  {
    label: '2',
    value: 2,
  },
  {
    label: '10',
    value: 10,
  },
];

/**
 * @internal
 */
export const ScaleDistributionEditor = ({ value, onChange }: StandardEditorProps<ScaleDistributionConfig>) => {
  const type = value?.type ?? ScaleDistribution.Linear;
  return (
    <HorizontalGroup>
      <RadioButtonGroup
        value={type}
        options={DISTRIBUTION_OPTIONS}
        onChange={(v) => {
          onChange({
            ...value,
            type: v!,
            log: v === ScaleDistribution.Linear ? undefined : 2,
          });
        }}
      />
      {type === ScaleDistribution.Log && (
        <Select
          options={LOG_DISTRIBUTION_OPTIONS}
          value={value.log || 2}
          prefix={'base'}
          width={12}
          onChange={(v) => {
            onChange({
              ...value,
              log: v.value!,
            });
          }}
        />
      )}
    </HorizontalGroup>
  );
};
