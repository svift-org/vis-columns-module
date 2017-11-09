SVIFT.vis.columns = (function (data, container) {
 
  var module = SVIFT.vis.base(data, container);
 
  module.d3config = {
    ease:d3.easeQuadOut, 
    yInterpolate:[], 
    hInterpolate:[],
    oInterpolate:[],
    steps:data.data.data.length,
    animation:{
      duration: 3000,
      barPartPercent: .8
    }
  };

  module.setup = function () {

    module.d3config.x = d3.scaleBand().padding(0.1).domain(data.data.data.map(function(d) {return d[0]; }));
    module.d3config.y = d3.scaleLinear().domain([0, d3.max(data.data.data, function(d){return d[1];})]);


    module.d3config.barsContainer = module.config.vizContainer.append('g').selectAll("g")
      .data(data.data.data)
      .enter().append("g")

    module.d3config.bars = module.d3config.barsContainer.append('rect')
      .style('stroke','transparent')
      .style('fill',data.style.color.main)

    module.d3config.barsText = module.d3config.barsContainer.append("text")
      .text(function(d) { return d[0] })
      .attr("font-family", data.style.fontLables)
      .attr("fill", data.style.color.second)
      .attr("text-anchor", "middle")

    module.d3config.barsNumber = module.d3config.barsContainer.append("text")
      .text(function(d) { return d[1] })
      .attr("font-family", data.style.fontLables)
      .attr("fill", data.style.color.second)
      .attr("text-anchor", "middle")


    //Add animations
    var barchartTime = module.d3config.animation.duration * module.d3config.animation.barPartPercent;
    var timeSteps = barchartTime/module.d3config.steps;
    var time = 0;
    for (var i = 0; i < module.d3config.steps; i++) {
      var startTime = (timeSteps * i) - (timeSteps/2);
      if(i==0){startTime=0};
      var endTime = timeSteps * (i+1);
      module.timeline['animationBar'+i] = {start:startTime, end:endTime, func:module["drawBar"+i]};
    }

    var lableTime = module.d3config.animation.duration - barchartTime;
    var timeStepsLable = lableTime/module.d3config.steps;
    for (var i = 0; i < module.d3config.steps; i++) {
      var startTime = ((timeStepsLable * i) - (timeStepsLable/2)) + barchartTime;
      if(i==0){startTime=barchartTime};
      var endTime = timeStepsLable * (i+1) + barchartTime;
      module.timeline['animationBarText'+i] = {start:startTime, end:endTime, func:module["drawBarLable"+i]};
    }

  };

  module.resize = function () {

    var barsNumberHeigth = module.d3config.barsNumber._groups[0][0].getBBox().height;
    var barsTextHeigth = module.d3config.barsText._groups[0][0].getBBox().height;
    var textPadding = 8;
    var vizTranslate = barsNumberHeigth + textPadding;

    module.d3config.barsContainer 
      .attr('transform','translate(0,'+ vizTranslate  +')')

    var windowWidth = module.container.node().offsetWidth - module.config.margin.left - module.config.margin.right;
    var height = module.container.node().offsetHeight - module.config.margin.top - module.config.margin.bottom - module.config.bottomTextHeight - module.config.topTextHeight -barsNumberHeigth - barsTextHeigth - vizTranslate;

    module.d3config.x.range([0,windowWidth]);
    module.d3config.y.range([height,0]);

    module.d3config.bars
      .attr('x', function(d){ return module.d3config.x(d[0]) })
      .attr("width", module.d3config.x.bandwidth())
      .attr("opacity", 0);

    module.d3config.barsText
      .attr("x", function(d){ return module.d3config.x(d[0]) + (module.d3config.x.bandwidth() / 2) })
      .attr("y",function(d){ return this.getBBox().height + height + textPadding})
      .attr("font-size", "1em")
      .attr("opacity", 0);

    module.d3config.barsNumber
      .attr("x", function(d){ return module.d3config.x(d[0]) + (module.d3config.x.bandwidth() / 2) })
      .attr("y", function(d){ return module.d3config.y(d[1]) - textPadding }) 
      .attr("font-size", "1em")
      .attr("opacity", 0);

    data.data.data.forEach(function(d,i){
      module.d3config.yInterpolate[i] = d3.interpolate(height, module.d3config.y(d[1]));
      module.d3config.hInterpolate[i] = d3.interpolate(0, height-module.d3config.y(d[1]));
      module.d3config.oInterpolate[i] = d3.interpolate(0, 1);
    });

  };



  var barAnimation = function(index){  

    //animate one bar
    return function(t) { 

      d3.select(module.d3config.bars._groups[0][index])
        .attr('y',      function(d,i){ return module.d3config.yInterpolate[index](module.d3config.ease(t)); })
        .attr('height', function(d,i){ return module.d3config.hInterpolate[index](module.d3config.ease(t)); })
        .attr('opacity', function(d,i){ return module.d3config.oInterpolate[index](module.d3config.ease(t)); });

    };

  };

  for (var i = 0; i < module.d3config.steps; i++) {
    module["drawBar"+i] = barAnimation(i)
  }


  //Add animations
  var lableAnimation = function(index){  

    return function(t) { 

      d3.select(module.d3config.barsText._groups[0][index])
        .attr('opacity', function(d,i){ return module.d3config.oInterpolate[index](module.d3config.ease(t)); });

      d3.select(module.d3config.barsNumber._groups[0][index])
        .attr('opacity', function(d,i){ return module.d3config.oInterpolate[index](module.d3config.ease(t)); });

    };

  };

  for (var i = 0; i < module.d3config.steps; i++) {
    module["drawBarLable"+i] = lableAnimation(i)
  }




return module;
 });