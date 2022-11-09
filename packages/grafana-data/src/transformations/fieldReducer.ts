// Libraries
import { isNumber } from 'lodash';

import { NullValueMode, Field, FieldState, FieldCalcs, FieldType } from '../types/index';
import { Registry, RegistryItem } from '../utils/Registry';

export enum ReducerID {
  sum = 'sum',
  max = 'max',
  min = 'min',
  logmin = 'logmin',
  mean = 'mean',
  variance = 'variance',
  stdDev = 'stdDev',
  last = 'last',
  first = 'first',
  count = 'count',
  range = 'range',
  diff = 'diff',
  diffperc = 'diffperc',
  delta = 'delta',
  step = 'step',
  firstNotNull = 'firstNotNull',
  lastNotNull = 'lastNotNull',
  changeCount = 'changeCount',
  distinctCount = 'distinctCount',
  allIsZero = 'allIsZero',
  allIsNull = 'allIsNull',
  allValues = 'allValues',
  uniqueValues = 'uniqueValues',
}

// Internal function
type FieldReducer = (field: Field, ignoreNulls: boolean, nullAsZero: boolean) => FieldCalcs;

export interface FieldReducerInfo extends RegistryItem {
  // Internal details
  emptyInputResult?: any; // typically null, but some things like 'count' & 'sum' should be zero
  standard: boolean; // The most common stats can all be calculated in a single pass
  reduce?: FieldReducer;
}

interface ReduceFieldOptions {
  field: Field;
  reducers: string[]; // The stats to calculate
}

/**
 * @returns an object with a key for each selected stat
 * NOTE: This will also modify the 'field.state' object,
 * leaving values in a cache until cleared.
 */
export function reduceField(options: ReduceFieldOptions): FieldCalcs {
  const { field, reducers } = options;

  if (!field || !reducers || reducers.length < 1) {
    return {};
  }

  if (field.state?.calcs) {
    // Find the values we need to calculate
    const missing: string[] = [];
    for (const s of reducers) {
      if (!field.state.calcs.hasOwnProperty(s)) {
        missing.push(s);
      }
    }
    if (missing.length < 1) {
      return {
        ...field.state.calcs,
      };
    }
  }
  if (!field.state) {
    field.state = {} as FieldState;
  }

  const queue = fieldReducers.list(reducers);

  // Return early for empty series
  // This lets the concrete implementations assume at least one row
  const data = field.values;
  if (data.length < 1) {
    const calcs = { ...field.state.calcs } as FieldCalcs;
    for (const reducer of queue) {
      calcs[reducer.id] = reducer.emptyInputResult !== null ? reducer.emptyInputResult : null;
    }
    return (field.state.calcs = calcs);
  }

  const { nullValueMode } = field.config;
  const ignoreNulls = nullValueMode === NullValueMode.Ignore;
  const nullAsZero = nullValueMode === NullValueMode.AsZero;

  // Avoid calculating all the standard stats if possible
  if (queue.length === 1 && queue[0].reduce) {
    const values = queue[0].reduce(field, ignoreNulls, nullAsZero);
    field.state.calcs = {
      ...field.state.calcs,
      ...values,
    };
    return values;
  }

  // For now everything can use the standard stats
  let values = doStandardCalcs(field, ignoreNulls, nullAsZero);

  for (const reducer of queue) {
    if (!values.hasOwnProperty(reducer.id) && reducer.reduce) {
      values = {
        ...values,
        ...reducer.reduce(field, ignoreNulls, nullAsZero),
      };
    }
  }

  field.state.calcs = {
    ...field.state.calcs,
    ...values,
  };
  return values;
}

// ------------------------------------------------------------------------------
//
//  No Exported symbols below here.
//
// ------------------------------------------------------------------------------

export const fieldReducers = new Registry<FieldReducerInfo>(() => [
  {
    id: ReducerID.lastNotNull,
    name: '最後 *',
    description: '最後一個非空值',
    standard: true,
    aliasIds: ['current'],
    reduce: calculateLastNotNull,
  },
  {
    id: ReducerID.last,
    name: '最後',
    description: '最後一個值',
    standard: true,
    reduce: calculateLast,
  },
  {
    id: ReducerID.firstNotNull,
    name: '第一個 *',
    description: '第一個非空值',
    standard: true,
    reduce: calculateFirstNotNull,
  },
  { id: ReducerID.first, name: '第一', description: '第一個值', standard: true, reduce: calculateFirst },
  { id: ReducerID.min, name: '最小', description: '最小值', standard: true },
  { id: ReducerID.max, name: '最大', description: '最大值', standard: true },
  { id: ReducerID.mean, name: '平均', description: '平均值', standard: true, aliasIds: ['avg'] },
  {
    id: ReducerID.variance,
    name: '平方差',
    description: '值域中所有值的平方差',
    standard: false,
    reduce: calculateStdDev,
  },
  {
    id: ReducerID.stdDev,
    name: '標準差',
    description: '值域中所有值的標準差',
    standard: false,
    reduce: calculateStdDev,
  },
  {
    id: ReducerID.sum,
    name: '總和',
    description: '所有值的總和',
    emptyInputResult: 0,
    standard: true,
    aliasIds: ['total'],
  },
  {
    id: ReducerID.count,
    name: '計數',
    description: '值的數量',
    emptyInputResult: 0,
    standard: true,
  },
  {
    id: ReducerID.range,
    name: '範圍',
    description: '最小值和最大值之間的差異',
    standard: true,
  },
  {
    id: ReducerID.delta,
    name: 'Delta',
    description: '值的累積變化',
    standard: true,
  },
  {
    id: ReducerID.step,
    name: 'Step',
    description: '值之間的最小間隔',
    standard: true,
  },
  {
    id: ReducerID.diff,
    name: '差',
    description: '第一個值和最後一個值之間的差',
    standard: true,
  },
  {
    id: ReducerID.logmin,
    name: '最小值（大於零）',
    description: '用於對數最小刻度',
    standard: true,
  },
  {
    id: ReducerID.allIsZero,
    name: '為零',
    description: '所有值皆為零',
    emptyInputResult: false,
    standard: true,
  },
  {
    id: ReducerID.allIsNull,
    name: '全為空值',
    description: '所有值皆為空值',
    emptyInputResult: true,
    standard: true,
  },
  {
    id: ReducerID.changeCount,
    name: '更改次數',
    description: '值變化的次數',
    standard: false,
    reduce: calculateChangeCount,
  },
  {
    id: ReducerID.distinctCount,
    name: '相異計數',
    description: '不同值的數量',
    standard: false,
    reduce: calculateDistinctCount,
  },
  {
    id: ReducerID.diffperc,
    name: '差異百分比',
    description: '第一個值和最後一個值之間的百分比差異',
    standard: true,
  },
  {
    id: ReducerID.allValues,
    name: '所有值',
    description: '返回包含所有值的數組',
    standard: false,
    reduce: (field: Field) => ({ allValues: field.values.toArray() }),
  },
  {
    id: ReducerID.uniqueValues,
    name: '所有的唯一值',
    description: '返回具有所有唯一值的數組',
    standard: false,
    reduce: (field: Field) => ({
      uniqueValues: [...new Set(field.values.toArray())],
    }),
  },
]);

export function doStandardCalcs(field: Field, ignoreNulls: boolean, nullAsZero: boolean): FieldCalcs {
  const calcs = {
    sum: 0,
    max: -Number.MAX_VALUE,
    min: Number.MAX_VALUE,
    logmin: Number.MAX_VALUE,
    mean: null,
    last: null,
    first: null,
    lastNotNull: null,
    firstNotNull: null,
    count: 0,
    nonNullCount: 0,
    allIsNull: true,
    allIsZero: true,
    range: null,
    diff: null,
    delta: 0,
    step: Number.MAX_VALUE,
    diffperc: 0,

    // Just used for calculations -- not exposed as a stat
    previousDeltaUp: true,
  } as FieldCalcs;

  const data = field.values;
  calcs.count = data.length;

  const isNumberField = field.type === FieldType.number || FieldType.time;

  for (let i = 0; i < data.length; i++) {
    let currentValue = data.get(i);

    if (i === 0) {
      calcs.first = currentValue;
    }

    calcs.last = currentValue;

    if (currentValue === null) {
      if (ignoreNulls) {
        continue;
      }
      if (nullAsZero) {
        currentValue = 0;
      }
    }

    if (currentValue != null) {
      // null || undefined
      const isFirst = calcs.firstNotNull === null;
      if (isFirst) {
        calcs.firstNotNull = currentValue;
      }

      if (isNumberField) {
        calcs.sum += currentValue;
        calcs.allIsNull = false;
        calcs.nonNullCount++;

        if (!isFirst) {
          const step = currentValue - calcs.lastNotNull!;
          if (calcs.step > step) {
            calcs.step = step; // the minimum interval
          }

          if (calcs.lastNotNull! > currentValue) {
            // counter reset
            calcs.previousDeltaUp = false;
            if (i === data.length - 1) {
              // reset on last
              calcs.delta += currentValue;
            }
          } else {
            if (calcs.previousDeltaUp) {
              calcs.delta += step; // normal increment
            } else {
              calcs.delta += currentValue; // account for counter reset
            }
            calcs.previousDeltaUp = true;
          }
        }

        if (currentValue > calcs.max) {
          calcs.max = currentValue;
        }

        if (currentValue < calcs.min) {
          calcs.min = currentValue;
        }

        if (currentValue < calcs.logmin && currentValue > 0) {
          calcs.logmin = currentValue;
        }
      }

      if (currentValue !== 0) {
        calcs.allIsZero = false;
      }

      calcs.lastNotNull = currentValue;
    }
  }

  if (calcs.max === -Number.MAX_VALUE) {
    calcs.max = null;
  }

  if (calcs.min === Number.MAX_VALUE) {
    calcs.min = null;
  }

  if (calcs.step === Number.MAX_VALUE) {
    calcs.step = null;
  }

  if (calcs.nonNullCount > 0) {
    calcs.mean = calcs.sum! / calcs.nonNullCount;
  }

  if (calcs.allIsNull) {
    calcs.allIsZero = false;
  }

  if (calcs.max !== null && calcs.min !== null) {
    calcs.range = calcs.max - calcs.min;
  }

  if (isNumber(calcs.firstNotNull) && isNumber(calcs.lastNotNull)) {
    calcs.diff = calcs.lastNotNull - calcs.firstNotNull;
  }

  if (isNumber(calcs.firstNotNull) && isNumber(calcs.diff)) {
    calcs.diffperc = calcs.diff / calcs.firstNotNull;
  }
  return calcs;
}

function calculateFirst(field: Field, ignoreNulls: boolean, nullAsZero: boolean): FieldCalcs {
  return { first: field.values.get(0) };
}

function calculateFirstNotNull(field: Field, ignoreNulls: boolean, nullAsZero: boolean): FieldCalcs {
  const data = field.values;
  for (let idx = 0; idx < data.length; idx++) {
    const v = data.get(idx);
    if (v != null && v !== undefined) {
      return { firstNotNull: v };
    }
  }
  return { firstNotNull: null };
}

function calculateLast(field: Field, ignoreNulls: boolean, nullAsZero: boolean): FieldCalcs {
  const data = field.values;
  return { last: data.get(data.length - 1) };
}

function calculateLastNotNull(field: Field, ignoreNulls: boolean, nullAsZero: boolean): FieldCalcs {
  const data = field.values;
  let idx = data.length - 1;
  while (idx >= 0) {
    const v = data.get(idx--);
    if (v != null && v !== undefined) {
      return { lastNotNull: v };
    }
  }
  return { lastNotNull: null };
}

/** Calculates standard deviation and variance */
function calculateStdDev(field: Field, ignoreNulls: boolean, nullAsZero: boolean): FieldCalcs {
  // Only support number fields
  if (!(field.type === FieldType.number || field.type === FieldType.time)) {
    return { variance: 0, stdDev: 0 };
  }

  let squareSum = 0;
  let runningMean = 0;
  let runningNonNullCount = 0;
  const data = field.values;
  for (let i = 0; i < data.length; i++) {
    const currentValue = data.get(i);
    if (currentValue != null) {
      runningNonNullCount++;
      let _oldMean = runningMean;
      runningMean += (currentValue - _oldMean) / runningNonNullCount;
      squareSum += (currentValue - _oldMean) * (currentValue - runningMean);
    }
  }
  if (runningNonNullCount > 0) {
    const variance = squareSum / runningNonNullCount;
    return { variance, stdDev: Math.sqrt(variance) };
  }
  return { variance: 0, stdDev: 0 };
}

function calculateChangeCount(field: Field, ignoreNulls: boolean, nullAsZero: boolean): FieldCalcs {
  const data = field.values;
  let count = 0;
  let first = true;
  let last: any = null;
  for (let i = 0; i < data.length; i++) {
    let currentValue = data.get(i);
    if (currentValue === null) {
      if (ignoreNulls) {
        continue;
      }
      if (nullAsZero) {
        currentValue = 0;
      }
    }
    if (!first && last !== currentValue) {
      count++;
    }
    first = false;
    last = currentValue;
  }

  return { changeCount: count };
}

function calculateDistinctCount(field: Field, ignoreNulls: boolean, nullAsZero: boolean): FieldCalcs {
  const data = field.values;
  const distinct = new Set<any>();
  for (let i = 0; i < data.length; i++) {
    let currentValue = data.get(i);
    if (currentValue === null) {
      if (ignoreNulls) {
        continue;
      }
      if (nullAsZero) {
        currentValue = 0;
      }
    }
    distinct.add(currentValue);
  }
  return { distinctCount: distinct.size };
}
