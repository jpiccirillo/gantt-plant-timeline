import * as d3 from 'd3'
import c3 from 'c3'
import tippy from 'tippy.js'
import {
  mergeDeep,
  createAxisGroup,
  formatDate,
  formatValue,
  longMonthNames,
} from '../../utils/'
import staticProps from './staticProps.json'

const getNode = (a) => document.getElementById(getTippyId(a))
let axisGroup

export function ChartFactory(_data, { colors, xScale, margin, svgID }) {
  const mergedProps = mergeDeep(staticProps, {
    oninit: function () {
      this.svg.attr('id', svgID)
      axisGroup = createAxisGroup(d3.select(`#${svgID}`), this.height)
    },
    onrendered: function () {
      let { height, width, orgXDomain } = this
      const x = xScale
        .domain(orgXDomain.map((a) => new Date(a)))
        .range([margin.left - margin.laneGutter, width - margin.right])

      axisGroup
        .transition()
        .duration(0)
        .attr('transform', `translate(0, ${height + 5})`)
        .call(
          d3.axisBottom(x).tickFormat((one) => {
            const label = x.tickFormat()(one)
            return longMonthNames.includes(label)
              ? d3.timeFormat('%b')(one)
              : label
          }),
        )
        .selectAll('text')
        .attr('y', 10)
        .attr('x', -8)
        .attr('dy', '0em')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end')
    },
    data: {
      x: 'x',
      xFormat: '%m/%d/%Y', // 'xFormat' can be used as custom format of 'x'
      columns: _data,
      colors,
      onmouseover: function (a) {
        if (getNode(a)) getNode(a)._tippy.show()
      },
      onmouseout: function (a) {
        if (getNode(a)) getNode(a)._tippy.hide()
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
