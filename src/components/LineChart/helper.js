import c3 from 'c3'
import { mergeDeep } from '../../utils/'
import staticProps from './staticProps.json'

export function ChartFactory(_data) {
  const mergedProps = mergeDeep(staticProps, {
    data: {
      x: 'x',
      xFormat: '%m/%d/%Y', // 'xFormat' can be used as custom format of 'x'
      columns: _data,
    },
    axis: {
      x: {
        type: 'timeseries',
        // tick: {
        //   format: '%Y-%m-%d',
        // },
      },
    },
  })
  return c3.generate(mergedProps)
}
