d3.breadcrumb = function (params) {

  // exposed variables
  var attrs = {
    container: 'body',
    padding: 5,
    width: 130,
    height: 28,
    top: 10,
    fontSize: 14,
    marginLeft: 0,
    marginTop: 10,
    leftDirection: false,
    wrapWidth: 0,
    data: null
  };


  //this colors are taken from metronic's color library
  var defaultColors = [ "#93c9ed", "#bcdcf2", "#8de5ef", "#ccebc5", "#a8ddb5", "#7bccc4", "#4eb3d3", "#2b8cbe", "#2b8cbe"]
  
  /*############### IF EXISTS OVERWRITE ATTRIBUTES FROM PASSED PARAM  #######  */
  var attrKeys = Object.keys(attrs);
  attrKeys.forEach(function (key) {
    if (params && params[key]) {
      attrs[key] = params[key];
    }
  })

  //innerFunctions which will update visuals
  var updateData;
  var showBreadcrumbs;
  var hideBreadcrumbs;

  //main chart object
  var main = function (selection) {
    selection.each(function scope() {
      var breadcrumbTrail;
      // #################################   BREADCRUMB SHOW   ##############################
      function breadcrumbShow(array, d) {

        //our sequences
        var sequenceArray = attrs.data;

        //each arrows wrapper
        var g = breadcrumbTrail.selectAll('g')
          .data(sequenceArray, d => d.id)
        g.exit().remove();
        var entering = g.enter().append('svg:g').style('pointer-events', 'none');

        //arrow polygons
        entering.append("svg:polygon")
          .style('fill', (d, i) => {
            if (d.fill) return d.fill;
            return defaultColors[i % defaultColors.length];
          })

        //arrow texts
        var enteredText = entering.append('svg:text')
          .attr("x", 20).attr("y", attrs.height / 2).attr("dy", "0.4em")
          .attr("text-anchor", "start").attr('fill', 'black')
          .attr('font-weight', 100)
          .attr('font-size', d => {
            return d.fontSize ? d.fontSize : attrs.fontSize;
          })
          .text(function (d) { return d.text; });

        //change anchor based on arrow direction  
        if (attrs.leftDirection) {
          enteredText.attr('x',10)
        }

        // merged selection
        var all = entering.merge(g)
          .attr('class', 'breadcrumbs')
          .attr('transform', function (d, i) {
            return 'translate(0,0)'
          });

        //recalculate merged selection positions
        var startX = attrs.marginLeft;
        var lastYDiv = 0;
        all.each(function (d, i, arr) {
          var wrapper = d3.select(this);
          var text = wrapper.select('text');
          var bbox = text.node().getBBox();
          var yDiv;

          // wrap or not wrap, that is the question
          if (attrs.wrapWidth == 0) {
            yDiv = 0;
          } else {
            yDiv = Math.floor(startX / attrs.wrapWidth);
            if (yDiv > lastYDiv) {
              startX = yDiv * attrs.wrapWidth;
              lastYDiv = yDiv;
            }
          }

          //reposition groups based on new calculated positions
          wrapper.attr('transform', 'translate(' + (startX - yDiv * attrs.wrapWidth) + ',' + yDiv * (attrs.height + attrs.marginTop) + ')');
          var poligons = wrapper.select('polygon')

          // arrows direction based on params
          if (attrs.leftDirection) {
            poligons.attr('points', rotatedBreadcrumbPoints(d, i, arr, bbox.width + 35));
          } else {
            poligons.attr('points', breadcrumbPoints(d, i, arr, bbox.width + 35));
          }
          startX += bbox.width + 35 + attrs.padding;
        })

        //remove exited groups
        g.exit().remove();

        // show breadcrumbs
        breadcrumbTrail.selectAll('.breadcrumbs').attr('visibility', '')
      }

      // build right directioned arrow from points
      function breadcrumbPoints(d, i, arr, width) {
        var points = [];
        if (width) {
          attrs.width = width;
        }
        points.push("0,0");
        points.push(attrs.width + ",0");
        if (i < (arr.length - 1)) {
          points.push(attrs.width + attrs.top + "," + (attrs.height / 2));
        }
        points.push(attrs.width + "," + attrs.height);
        points.push("0," + attrs.height);
        if (i > 0) {
          points.push(attrs.top + "," + (attrs.height / 2));
        }
        return points.join(" ");
      }

      // build left directioned arrow from points
      function rotatedBreadcrumbPoints(d, i, arr, width) {
        var points = [];
        if (width) {
          attrs.width = width;
        }
        points.push("0,0");

        points.push(attrs.width + ",0");
        if (i < (arr.length - 1)) {
          points.push(attrs.width - attrs.top + "," + (attrs.height / 2));
        }
        points.push(attrs.width + "," + attrs.height);
        points.push("0," + attrs.height);
        if (i > 0) {
          points.push(-attrs.top + "," + (attrs.height / 2));
        }
        return points.join(" ");
      }


      // smoothly handle data updating
      updateData = function () {
        // we don't using that yet
      };

      // show breadcrumbs
      showBreadcrumbs = function () {

        //check container type first and transform if necessary
        if (!(attrs.container instanceof d3.selection)) {
          attrs.container = d3.select(attrs.container);
        }

        // create breadcrumb trail component and show breadcrumbs in it
        breadcrumbTrail = attrs.container.patternify({ tag: 'g', selector: "breadcrumb-trail" });
        breadcrumbShow(breadcrumbTrail);
      }

      // title says it all
      hideBreadcrumbs = function () {
        attrs.data = [];
        breadcrumbTrail.selectAll('g').remove();
      }

      //#########################################  UTIL FUNCS ##################################

      function debug() {
        if (attrs.isDebug) {
          //stringify func
          var stringified = scope + "";

          // parse variable names
          var groupVariables = stringified
            //match var x-xx= {};
            .match(/var\s+([\w])+\s*=\s*{\s*}/gi)
            //match xxx
            .map(d => d.match(/\s+\w*/gi).filter(s => s.trim()))
            //get xxx
            .map(v => v[0].trim())

          //assign local variables to the scope
          groupVariables.forEach(v => {
            main['P_' + v] = eval(v)
          })
        }
      }
      debug();
    });
  };

  //----------- PROTOTYEPE FUNCTIONS  ----------------------
  d3.selection.prototype.patternify = function (params) {
    var container = this;
    var selector = params.selector;
    var elementTag = params.tag;
    var data = params.data || [selector];

    // pattern in action
    var selection = container.selectAll('.' + selector).data(data)
    selection.exit().remove();
    selection = selection.enter().append(elementTag).merge(selection)
    selection.attr('class', selector);
    return selection;
  }

  //dinamic keys functions
  Object.keys(attrs).forEach(key => {
    // Attach variables to main function
    return main[key] = function (_) {
      var string = `attrs['${key}'] = _`;
      if (!arguments.length) { return eval(` attrs['${key}'];`); }
      eval(string);
      return main;
    };
  });

  //set attrs as property
  main.attrs = attrs;

  //debugging visuals
  main.debug = function (isDebug) {
    attrs.isDebug = isDebug;
    if (isDebug) {
      if (!window.charts) window.charts = [];
      window.charts.push(main);
    }
    return main;
  }

  //exposed update functions
  main.data = function (value) {
    if (!arguments.length) return attrs.data;
    attrs.data = value;
    if (typeof updateData === 'function') {
      updateData();
    }
    return main;
  }

  // run  visual
  main.run = function () {
    d3.selectAll(attrs.container).call(main);
    return main;
  }

  //breadcrumbs show
  main.show = function (data) {
    console.log(data);
    console.log(data.length);
    attrs.data = data;
    attrs.data.forEach(d => d.id = d.text);
    var i =0;
    for(i = 0; i < data.length; i++) {
      showBreadcrumbs();
    }
    
  }

  // breadcrumbs hide
  main.hide = function () {
    hideBreadcrumbs();
  }

  return main.run();

}