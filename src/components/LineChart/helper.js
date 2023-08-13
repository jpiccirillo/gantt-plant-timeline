import c3 from 'c3'
import { mergeDeep, cm, formatDate } from '../../utils/'
import staticProps from './staticProps.json'

export function ChartFactory(_data) {
  const finalData = _data.map((a) => [a.title, ...a.data])
  const colors = _data
    .filter((a) => a.title !== 'x')
    .reduce((agg, plant) => {
      agg[plant.title] = cm(plant.species)
      return agg
    }, {})

  const mergedProps = mergeDeep(staticProps, {
    data: {
      x: 'x',
      xFormat: '%m/%d/%Y', // 'xFormat' can be used as custom format of 'x'
      columns: finalData,
      colors,
    },
    tooltip: {
      format: {
        title: formatDate,
        value: (value) => `${value.toFixed(2)}in`,
      },
    },
    axis: {
      x: {
        type: 'timeseries',
        tick: {
          format: formatDate,
        },
      },
    },
  })
  return c3.generate(mergedProps)
}
