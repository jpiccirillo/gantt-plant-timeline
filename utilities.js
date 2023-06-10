function toTitleCase(str) {
  return `${str[0].toUpperCase()}${str.substr(1)}`;
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .split(/[^a-z0-9]/)
    .filter((d) => d)
    .join("-");
}

function getClassName(suffix) {
  return `gantt__group-${suffix}`;
}

function createBarGroup(svg) {
  return svg.append("g").attr("class", getClassName("bars"));
}

function createEventGroup(svg) {
  return svg.append("g").attr("class", getClassName("events"));
}

function createLanesGroup(svg) {
  return svg.append("g").attr("class", getClassName("lanes"));
}

function createAxisGroup(svg, topMargin) {
  return svg
    .append("g")
    .attr("class", getClassName("axis"))
    .attr("transform", `translate(0, ${topMargin})`);
}

function createRefLinesGroup(svg) {
  return svg.append("g").attr("class", getClassName("reference-lines"));
}

function yLabelTranslation(d, y) {
  return y(d[1]) + y.step() - y.paddingInner() * y.step() * 0.5;
}

function generateD3Line({ top, bottom }, height) {
  return d3.line()([
    [0, top],
    [0, height - bottom],
  ]);
}

const barGroupUtils = {
  enter: function () {
    const {
      enter,
      x,
      y,
      duration,
      title,
      label,
      width,
      start,
      color,
      barLength,
      key,
      roundRadius,
      labelMinWidth,
    } = this;

    const g = enter.append("g");
    g
      // It looks nice if we start in the correct y position and scale out
      .attr("transform", (d) => `translate(${width / 2}, ${y(d.rowNo)})`)
      .transition()
      .ease(d3.easeExpOut)
      .duration(duration)
      .attr("transform", (d) => `translate(${x(start(d))}, ${y(d.rowNo)})`);

    const rect = g
      .attr("class", (d) => d.species)
      .append("rect")
      .attr("height", y.bandwidth())
      .attr("fill", (d) => color(d))
      .attr("class", (d) => d.type)
      .attr("width", (d) => barLength(d));

    if (title !== undefined) {
      rect.attr("data-tippy-content", title);
      tippy(rect.nodes());
    }
    if (label !== undefined) {
      // Add a clipping path for text

      const clip = g
        .append("clipPath")
        .attr("id", (d, i) => `barclip-${slugify(key(d, i))}`)
        .append("rect")
        .attr("width", (d, i) => barLength(d, i, 4))
        .attr("height", y.bandwidth());

      g.append("text")
        .attr("x", Math.max(roundRadius * 0.35, 5))
        .attr("y", y.bandwidth() / 2)
        .attr("font-size", d3.min([y.bandwidth() * 0.6, 16]))
        .attr("visibility", (d) =>
          barLength(d) >= labelMinWidth ? "visible" : "hidden"
        ) // Hide labels on short bars
        .attr("clip-path", (d, i) => `url(#barclip-${slugify(key(d, i))}`)
        .text(label);
    }
    rect.transition().duration(duration);
    return g;
  },
  update: function () {
    const {
      update,
      start,
      duration,
      x,
      y,
      color,
      barLength,
      labelMinWidth,
      label,
    } = this;

    update
      .transition()
      .duration(duration)
      .attr("transform", (d) => `translate(${x(start(d))}, ${y(d.rowNo)})`);
    update
      .select("rect")
      .transition()
      .duration(duration)
      .attr("fill", color)
      .attr("width", (d) => barLength(d))
      .attr("height", y.bandwidth());

    if (label !== undefined) {
      update
        .select("clipPath")
        .select("rect")
        .transition()
        .duration(duration)
        .attr("width", (d, i) => barLength(d, i, 4))
        .attr("height", y.bandwidth());
      update
        .select("text")
        .attr("y", y.bandwidth() / 2)
        .attr("font-size", d3.min([y.bandwidth() * 0.6, 16]))
        .attr("visibility", (d) =>
          barLength(d) >= labelMinWidth ? "visible" : "hidden"
        ); // Hide labels on short bars
    }
    return update;
  },
  exit: function () {
    const { exit } = this;

    exit.remove();
  },
};

const eventGroupUtils = {
  enter: function () {
    const { enter, x, y, duration, width, start, eventTitle } = this;

    const g = enter.append("g");
    g
      // It looks nice if we start in the correct y position and scale out
      .attr("transform", (d) => `translate(${width / 2}, ${y(d.rowNo)})`)
      .transition()
      .ease(d3.easeExpOut)
      .duration(duration)
      .attr("transform", (d) => `translate(${x(start(d))}, ${y(d.rowNo)})`);

    const circle = g
      .attr("class", (d) => d.species)
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 6)
      .attr("r", 3)
      .attr("class", (d) => d.type);

    if (eventTitle !== undefined) {
      circle.attr("data-tippy-content", eventTitle);
      tippy(circle.nodes());
    }

    circle.transition().duration(duration);
    return g;
  },

  update: function () {
    const { update, start, duration, x, y } = this;

    update
      .transition()
      .duration(duration)
      .attr("transform", (d) => `translate(${x(start(d))}, ${y(d.rowNo)})`);

    update.select("circle").transition().duration(duration);

    return update;
  },
  exit: function () {
    const { exit } = this;

    exit.remove();
  },
};

const laneGroupUtils = {
  enter: function () {
    const { enter, y, width, margin } = this;

    const g = enter
      .append("g")
      .attr("transform", (d) => `translate(0, ${yLabelTranslation(d, y)})`);

    g.append("path")
      .attr(
        "d",
        d3.line()([
          [margin.left, 0],
          [width - margin.right, 0],
        ])
      )
      .attr("stroke", "grey");

    g.append("text")
      .text((d) => d[0])
      .attr("x", margin.left + 5)
      .attr("y", -2);

    return g;
  },
  update: function () {
    const { update, duration, y, width, margin } = this;

    update
      .transition()
      .duration(duration)
      .attr("transform", (d) => `translate(0, ${yLabelTranslation(d, y)})`);

    update.select("path").attr(
      "d",
      d3.line()([
        [margin.left, 0],
        [width - margin.right, 0],
      ])
    );

    update.select("text").text((d) => d[0]);

    return update;
  },
};

const refLineGroupUtils = {
  enter: function () {
    const { enter, x, margin, height } = this;

    const g = enter
      .append("g")
      .attr("transform", (d) => `translate(${x(d.start)}, 0)`);

    g.append("path")
      .attr("d", generateD3Line(margin, height))
      .attr("stroke", (d) => d.color || "darkgrey");

    g.append("text")
      .text((d) => d.label || "")
      .attr("x", 5)
      .attr("y", height - margin.bottom + 10)
      .attr("fill", (d) => d.color || "darkgrey");

    return g;
  },
  update: function () {
    const { update, margin, height, x } = this;

    update.attr("transform", (d) => `translate(${x(d.start)}, 0)`);
    update
      .select("path")
      .attr("d", generateD3Line(margin, height))
      .attr("stroke", (d) => d.color || "darkgrey");

    update
      .select("text")
      .text((d) => d.label || "")
      .attr("y", height - margin.bottom + 10)
      .attr("fill", (d) => d.color || "darkgrey");

    return update;
  },
};

function cm(species) {
  let colorMap = {
    mango: "#37031A",
    avocado: "#6E260E",
    jackfruit: "#0a481e",
    pomegranate: "#f2003c",
    pineapple: "#FEEA63",
    guava: "#69b562",
    blueberry: "#464196",
    medjooldate: "#351E10",
    serranopepper: "#507002",
    poblanopepper: "#074304",
    habanero: "#ff8100",
    papaya: "#FFB90C",
    lemon: "#FAFA33",
    keylime: "#11b502",
    turmeric: "#8FC128",
    ginger: "#E5E3A8",
    tomato: "#EA0001",
    grapefruit: "#075900",
    pinklemon: "#F2B4C0",
    honeytangerine: "#FBBD66",
    persimmon: "#9FC47F",
    anaheimpepper: "#72A60A",
    etrog: "#FFD507",
    jalapeno: "#629e07",
  };
  return colorMap[species];
}

function isMobile() {
  return window.innerWidth < 500;
}

function registerResize(callback) {
  window.addEventListener("resize", debounce(callback));
}

// Debounce
function debounce(func, time) {
  var time = time || 100; // 100 by default if no param
  var timer;
  return function (event) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(func, time, event);
  };
}
