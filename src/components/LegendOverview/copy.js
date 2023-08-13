import { dataViewNames } from '../../dataViews'

let copy = {
  [dataViewNames[0]]: {
    mobile: [
      "Below is a timeline chart of plants I've grown from seed over the last year. Each species is its own color - horizontal bars represent long statuses in a plant's life, while black dots represent specific day-level events.",
      'This sample below is the timeline of Plant 1: Germinating for a month, sprouted and alive for another month or two, then dormant and died.',
    ],
    desktop: [
      "The below chart is an interactive timeline, in the form of a Gantt Chart, showing the lifespan of all plants I've grown from seed.  Some are still going strong, while others were with me for just a short time before rotting, withering in the sun, getting stolen, or meeting another fate.",
      "In this timeline, each species has a specific color, and bars represent long statuses of the plant's life - germinating, being-sprouted, dormant, or recovered. Black dots represent specific events, like day of planting, or certain overvations. Below is an example timeline: germinating (roots but no shoot yet) from Sept - Oct. Sprouting, and actively growing, from Oct - Dec. Dormant (not dead but no growth) from Dec - Jan.",
    ],
  },
  [dataViewNames[1]]: {
    mobile: [
      "The below chart is an interactive line chart, showing the growth of all plants I've grown from seed.  Some are still growing tall, while others have fallen dormant and no longer show rising lines.",
      'In this timeline, each species has its own color, and dots represent days on which I measured them.',
    ],
    desktop: [
      "The below chart is an interactive line chart, showing the growth of all plants I've grown from seed.  Some are still growing tall, while others have fallen dormant and no longer show rising lines.",
      'In this timeline, each species has its own color, and dots represent days on which I measured them.',
    ],
  },
}

export default copy
