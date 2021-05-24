let chart_style = document.querySelector('#chart');
let style = window.getComputedStyle(chart_style);

var widths = style.width;
width = 0.8 * widths.replace(/\D+$/g, "")

var height = width * 1.2;
console.log(width, height)
var radius = width / 2;

var b = {
  w: 125,
  h: 30,
  s: 3,
  t: 10
};

var colors = {
  "total": "#5687d1",
  "locked": "#de783b",
  "airdrop": "#6ab975",
  "liquidity": "#a173d1",
  "presale": "#fea82f",
  "marketing 2021": "#f55c47",
  "team resources": "#34656d",
  "2022": "#7b615c",
  "2023": "#f1ca89",
  "2024": "#f4a9a8",
  "q1": "#a204d3",
  "q2": "#fc92e3",
  "q3": "#005792",
  "q4": "#480032",
  "burn": "#ffcead",
  "end": "#bbbbbb"
};

var totalSize = 0;

var vis = d3.select("#chart").append("svg:svg")
  .attr("width", width)
  .attr("height", height)
  .append("svg:g")
  .attr("id", "container")
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var partition = d3.partition()
  .size([2 * Math.PI, radius * radius]);

var arc = d3.arc()
  .startAngle(function (d) {
    return d.x0;
  })
  .endAngle(function (d) {
    return d.x1;
  })
  .innerRadius(function (d) {
    return Math.sqrt(d.y0);
  })
  .outerRadius(function (d) {
    return Math.sqrt(d.y1);
  });

d3.text("visit-sequences.csv", function (text) {
  var csv = d3.csvParseRows(text);
  var json = buildHierarchy(csv);
  createVisualization(json);
});

function createVisualization(json) {

  // Basic setup of page elements.
  initializeBreadcrumbTrail();
  drawLegend();
  d3.select("#togglelegend").on("click", toggleLegend);

  vis.append("svg:circle")
    .attr("r", radius)
    .style("opacity", 0);

  var root = d3.hierarchy(json)
    .sum(function (d) {
      return d.size;
    })
    .sort(function (a, b) {
      return b.value - a.value;
    });

  var nodes = partition(root).descendants()
    .filter(function (d) {
      return (d.x1 - d.x0 > 0.005);
    });

  var path = vis.data([json]).selectAll("path")
    .data(nodes)
    .enter().append("svg:path")
    .attr("display", function (d) {
      return d.depth ? null : "none";
    })
    .attr("d", arc)
    .attr("fill-rule", "evenodd")
    .style("fill", function (d) {
      return colors[d.data.name];
    })
    .style("opacity", 1)
    .on("mouseover", mouseover);

  d3.select("#container").on("mouseleave", mouseleave);

  totalSize = path.datum().value;
};

function mouseover(d) {


  var percentage = (100 * d.value / totalSize).toPrecision(3);
  var amount = d.value;
  var percentageString = percentage + "%";
  if (percentage < 0.1) {
    percentageString = "< 0.1%";
  }

  var details = {
    "total": "Toatal minted tokens, 250,000,000",
    "locked": "70% of tokens are locked, and are released as per the following schedule, 175,000,000",
    "airdrop": "1% of tokens have been distributed to the followers through airdrop campain, 2,500,000",
    "liquidity": "30% of token are released as following, 75,000,000",
    "presale": "2% are offered in pre-sale to the public, 5,000,000",
    "marketing 2021": "15% tokens are allocated to marketing of the project, 37,500,000",
    "team resources": "2% are reserved as team resources, 5,000,000",
    "2022": "20% of tokens are scheduled to be released in 2022, 50,000,000",
    "2023": "20% of tokens are scheduled to be released in 2023, 50,000,000",
    "2024": "20% of tokens are scheduled to be released in 2024, 50,000,000",
    "q1": "5% tokens will be released in first quarter out of 20%, 12,500,000",
    "q2": "5% tokens will be released in second quarter out of 20%v",
    "q3": "5% tokens will be released in third quarter out of 20%, 12,500,000",
    "q4": "5% tokens will be released in fourth quarter out of 20%, 12,500,000",
    "burn": "10% of the tokens will be burned in stages unannounced, 25,000,000"
  };
  var dname = d.data.name;
  var amountString = details[dname];

  d3.select("#percentage")
    .text(percentageString);

  d3.select("#amount")
    .text(amountString);

  d3.select("#explanation")
    .style("top", height / 2 - radius / 4 + "px")
    .style("left", width / 2 + "px")
    .style("width", radius / 2 + "px")
    .style("height", radius / 2 + "px")
    .style("text-align", "center")
    .style("visibility", "");

  var sequenceArray = d.ancestors().reverse();
  sequenceArray.shift();
  updateBreadcrumbs(sequenceArray, percentageString);

  d3.selectAll("path")
    .style("opacity", 0.3);

  vis.selectAll("path")
    .filter(function (node) {
      return (sequenceArray.indexOf(node) >= 0);
    })
    .style("opacity", 1);
}

function mouseleave(d) {

  d3.select("#trail")
    .style("visibility", "hidden");

  d3.selectAll("path").on("mouseover", null);

  d3.selectAll("path")
    .transition()
    .duration(100)
    .style("opacity", 1)
    .on("end", function () {
      d3.select(this).on("mouseover", mouseover);
    });

  d3.select("#explanation")
    .style("visibility", "hidden");
}

function initializeBreadcrumbTrail() {
  var trail = d3.select("#sequence").append("svg:svg")
    .attr("width", width)
    .attr("height", 50)
    .attr("id", "trail");
  trail.append("svg:text")
    .attr("id", "endlabel")
    .style("fill", "#fff");
}

function breadcrumbPoints(d, i) {
  var points = [];
  points.push("0,0");
  points.push(b.w + ",0");
  points.push(b.w + b.t + "," + (b.h / 2));
  points.push(b.w + "," + b.h);
  points.push("0," + b.h);
  if (i > 0) {
    points.push(b.t + "," + (b.h / 2));
  }
  return points.join(" ");
}

function updateBreadcrumbs(nodeArray, percentageString) {
  var trail = d3.select("#trail")
    .selectAll("g")
    .data(nodeArray, function (d) {
      return d.data.name + d.depth;
    });

  trail.exit().remove();

  var entering = trail.enter().append("svg:g");

  entering.append("svg:polygon")
    .attr("points", breadcrumbPoints)
    .style("fill", function (d) {
      return colors[d.data.name];
    });

  entering.append("svg:text")
    .attr("x", (b.w + b.t) / 2)
    .attr("y", b.h / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .text(function (d) {
      return d.data.name;
    });

  entering.merge(trail).attr("transform", function (d, i) {
    return "translate(" + i * (b.w + b.s) + ", 0)";
  });

  d3.select("#trail").select("#endlabel")
    .attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
    .attr("y", b.h / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .text(percentageString);

  d3.select("#trail")
    .style("visibility", "");

}

function drawLegend() {

  var li = {
    w: 150,
    h: 30,
    s: 3,
    r: 3
  };

  var legend = d3.select("#legend").append("svg:svg")
    .attr("width", li.w)
    .attr("height", d3.keys(colors).length * (li.h + li.s));

  var g = legend.selectAll("g")
    .data(d3.entries(colors))
    .enter().append("svg:g")
    .attr("transform", function (d, i) {
      return "translate(0," + i * (li.h + li.s) + ")";
    });

  g.append("svg:rect")
    .attr("rx", li.r)
    .attr("ry", li.r)
    .attr("width", li.w)
    .attr("height", li.h)
    .style("fill", function (d) {
      return d.value;
    });

  g.append("svg:text")
    .attr("x", li.w / 2)
    .attr("y", li.h / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .text(function (d) {
      return d.key;
    });
}

function toggleLegend() {
  var legend = d3.select("#legend");
  if (legend.style("visibility") == "hidden") {
    legend.style("visibility", "");
  } else {
    legend.style("visibility", "hidden");
  }
}

function buildHierarchy(csv) {
  var root = {
    "name": "root",
    "children": []
  };
  for (var i = 0; i < csv.length; i++) {
    var sequence = csv[i][0];
    var size = +csv[i][1];
    if (isNaN(size)) {}
    var parts = sequence.split("-");
    var currentNode = root;
    for (var j = 0; j < parts.length; j++) {
      var children = currentNode["children"];
      var nodeName = parts[j];
      var childNode;
      if (j + 1 < parts.length) {
        var foundChild = false;
        for (var k = 0; k < children.length; k++) {
          if (children[k]["name"] == nodeName) {
            childNode = children[k];
            foundChild = true;
            break;
          }
        }
        if (!foundChild) {
          childNode = {
            "name": nodeName,
            "children": []
          };
          children.push(childNode);
        }
        currentNode = childNode;
      } else {
        childNode = {
          "name": nodeName,
          "size": size
        };
        children.push(childNode);
      }
    }
  }
  return root;
};