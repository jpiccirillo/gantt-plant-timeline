import c3 from 'c3'
import tippy from 'tippy.js'
import { mergeDeep, cm, formatDate, formatValue } from '../../utils/'
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
      onmouseover: function (a) {
        if (document.getElementById(getTippyId(a))) {
          document.getElementById(getTippyId(a))._tippy.show()
        }
      },
      onmouseout: function (a) {
        if (document.getElementById(getTippyId(a))) {
          document.getElementById(getTippyId(a))._tippy.hide()
        }
      },
    },

    tooltip: {
      show: false,
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

export function getTippyId(data) {
  let { id, index } = data
  return `${id.replace(/[\ ]/g, '')}-${index}`
}

export function setUpTooltips() {
  // First step - get selector on all dots on the page
  // Then augment these dots with a specified ID, data-tippy-content string
  for (let dot of document.getElementsByClassName('c3-circle')) {
    let { id, value, x: date } = dot.__data__
    if (value !== null) {
      let label = `${id}: ${formatValue(value)}in tall on ${formatDate(date)}`
      let uid = getTippyId(dot.__data__)
      dot.setAttribute('data-tippy-content', label)
      dot.setAttribute('id', uid)
    }
  }
  tippy('svg circle')
}
