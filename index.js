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

    module.d3config.barsContainer = module.vizContainer.append('g').selectAll("g")
      .data(data.data.data)
      .enter().append("g");

    module.d3config.bars = module.d3config.barsContainer.append('rect')
      .style('stroke','transparent')
      .attr('class', 'visFill')
      .style('opacity',1);

    module.d3config.barsText = module.d3config.barsContainer.append("text")
      .text(function(d) { return d.label })
      .attr('class', 'visText bold')
      .attr("text-anchor", "middle")
      .style('opacity',0);

    module.d3config.barsNumber = module.d3config.barsContainer.append("text")
      .text(function(d) { return d.data[0] })
      .attr('class', 'visText')
      .attr("text-anchor", "middle")
      .style('opacity',0);

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

  module.update = function(){
    module.d3config.barsContainer.data(data.data.data).enter();
    module.d3config.bars.datum(function(d){return d;});
    module.d3config.barsText.datum(function(d){return d;}).text(function(d) { return d.label });
    module.d3config.barsNumber.datum(function(d){return d;}).text(function(d) { return d.data[0] });
  };

  module.resize = function () {

    module.d3config.x = d3.scaleBand().padding(0.1).domain(data.data.data.map(function(d,i) {return i; }));
    module.d3config.y = d3.scaleLinear().domain([0, d3.max(data.data.data, function(d){return d.data[0];})]);
    
    var barsNumberHeigth = module.d3config.barsNumber._groups[0][0].getBBox().height;
    var barsTextHeigth = module.d3config.barsText._groups[0][0].getBBox().height;
    var textPadding = 6;
    var vizTranslate = barsNumberHeigth + textPadding;

    module.d3config.barsContainer 
      .attr('transform','translate(0,'+ vizTranslate  +')');

    var windowWidth = module.vizSize.width;
    var height = module.vizSize.height-vizTranslate;

    module.d3config.x.range([0,windowWidth]);
    module.d3config.y.range([height,0]);

    module.d3config.bars
      .attr('x', function(d,i){ return module.d3config.x(i) })
      .attr("width", module.d3config.x.bandwidth())
      .attr("opacity", 0);

    module.d3config.barsText
      .attr("x", function(d,i){ return module.d3config.x(i) + (module.d3config.x.bandwidth() / 2) })
      .attr("y",function(d){ return this.getBBox().height + height + textPadding})
      .attr("font-size", "1em")
      .attr("opacity", 0);

    module.d3config.barsNumber
      .attr("x", function(d,i){ return module.d3config.x(i) + (module.d3config.x.bandwidth() / 2) })
      .attr("y", function(d){ return module.d3config.y(d.data[0]) - textPadding }) 
      .attr("font-size", "1em")
      .attr("opacity", 0);


    data.data.data.forEach(function(d,i){
      module.d3config.yInterpolate[i] = d3.interpolate(height, module.d3config.y(d.data[0]));
      module.d3config.hInterpolate[i] = d3.interpolate(0, height-module.d3config.y(d.data[0]));
      module.d3config.oInterpolate[i] = d3.interpolate(0, 1);
    });

    if(module.playHead == module.playTime){
        module.goTo(1);
        module.pause();
    }

  };


  //One bar animation
  var barAnimation = function(index){  

    return function(t) { 

      d3.select(module.d3config.bars._groups[0][index])
        .attr('y',      function(){ return module.d3config.yInterpolate[index](module.d3config.ease(t)); })
        .attr('height', function(){ return module.d3config.hInterpolate[index](module.d3config.ease(t)); })
        .attr('opacity', function(){ return module.d3config.oInterpolate[index](module.d3config.ease(t)); });

    };

  };

  //Add bar animations
  for (var i = 0; i < module.d3config.steps; i++) {
    module["drawBar"+i] = barAnimation(i)
  }


  //One label animation
  var labelAnimation = function(index){  

    return function(t) { 

      d3.select(module.d3config.barsText._groups[0][index])
        .style('opacity', function(){ return module.d3config.oInterpolate[index](module.d3config.ease(t)); });

      d3.select(module.d3config.barsNumber._groups[0][index])
        .style('opacity', function(){ return module.d3config.oInterpolate[index](module.d3config.ease(t)); });

    };

  };

  //Add label animations
  for (var i = 0; i < module.d3config.steps; i++) {
    module["drawBarLable"+i] = labelAnimation(i)
  }


  return module;

});