search_atoms_by_cui = function(concept){
    var atoms={} ;
    var definitions={};
    var CUI = concept;

    var margin = { top: 30, right: 30, bottom: 40, left:50 };
    var width = 1100-margin.top-margin.bottom,
        height = 550-margin.left-margin.right;

        var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden");   
    d3.select(".concept_atoms svg").remove();    

    var svg = d3.select(".concept_atoms")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("style", "outline: thin solid black;")
         .call(d3.zoom().on("zoom", function () {
            svg.attr("transform", d3.event.transform)
            }))
        .append("g")
        .attr("transform", "translate("+ margin.left +","+ margin.top +")");

    var border_color_scale = d3.scaleLinear().domain([0, 200]).range(['#d9d9d9', '#252525']);
    // var death_scale = d3.scaleSqrt().domain([0, 450]).range([0.2,40]);
    // var color_scale = d3.scaleLinear().domain([0, 450]).range(['#6baed6', '#08306b']);

    d3.queue()
      .defer(d3.csv, "./data/concept_info.csv")
      .defer(d3.csv, "./data/definitions.csv")
      .await(ready);

    function drawAtoms(){
        // d3.selectAll('circle').remove(); 
        // d3.selectAll('text').remove(); 

        rel1={};
        for(var i=0; i< atoms.length; i++){
            if(atoms[i].CUI === CUI){
                if(rel1[atoms[i].STR] === undefined){
                    rel1[atoms[i].STR] = 1;
                }
                else{
                    rel1[atoms[i].STR] += 1;
                }
            }
        }
        conceptName='';
        for(var i=0; i< definitions.length; i++){
            if(definitions[i].CUI === CUI){
                conceptName = definitions[i].CNAME;
                break;
            }
        }
        

        data = {};
        data["name"] = CUI;
        data["children"] = [];
        Object.keys(rel1).forEach(function(key,index) {
            data["children"].push({"name": key, "value": rel1[key]});
        });
        console.log(data);

        var packLayout = d3.pack()
                           .size([500, 500])
                           .padding(10);
        var rootNode = d3.hierarchy(data);
        console.log(rootNode);
        // console.log(rootNode.x);
        rootNode.sum(function(d) {
          return d.value;
        });
        packLayout(rootNode);
        // console.log(rootNode.descendants());
        svg.selectAll('circle')
          .data(rootNode.descendants())
          .enter()
          .append('circle')
          .attr('cx', function(d) { return d.x+150; })
          .attr('cy', function(d) { return d.y; })
          .attr('r', function(d) { return d.r; })
          .attr('opacity', '0.3')
          .attr('stroke', 'white')                      //TO-DO: stroke luminance proportional to #relations
          .style('fill', '#9ecae1')
          .attr('class', function(d, i) {
              return ('atomCircle_'+i);
          })
          .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
          .on("mouseover", function(d, i) {
            svg.selectAll('.atomCircle_'+i).style('fill', '#4377C4');console.log(d.value);
            return tooltip.text("No. of vocabularies: " + d.value).style("visibility", "visible");
            //showTooltip(d);
            })            
           .on("mouseout", function(d, i) {
            svg.selectAll('.atomCircle_'+i).style('fill', '#9ecae1');
            return tooltip.style("visibility", "hidden");
            // tooltip.classed("hidden", true);
           });

        d3.select("#atomVisHeader").text("");
        d3.select("#atomVisHeader").text(conceptName + " (" + CUI + ")");    
        // svg
        //     .append('text')
        //     .attr('dy', 0)
        //     .attr('dx', 0)
        //     //.style()
        //     .text(conceptName + ' (' + CUI + ')');

        var nodes = svg
          .selectAll('g')
          .data(rootNode.descendants())
          .enter()
          .append('g')
          .attr('transform', function(d) {
              x = d.x<rootNode.x ? d.x-50 : d.x; //console.log(x);
              return 'translate(' + [x+150, d.y + Math.random()*d.r/6] + ')';
            });

        // nodes
          // .append('circle')
          // .attr('r', function(d) { return d.r; })
          // .style('fill', '#4292c6')
          // .attr('opacity', '0.1');

        nodes
          .append('text')
          .attr('dy', Math.random() * 10)
          .attr('text-anchor', "middle")
          .text(function(d) {
              // console.log(d.data.name);
              // console.log(d.data.name.length);
            return d.children === undefined ? d.data.name : '';
            // return d.children === undefined ? d.data.name.length>12 ? d.data.name.substring(0,10)+'...' : d.data.name  : '';
          })
          .attr('fill', '#2E718D')
          .attr('font-size', '13pt')
          .attr('font-weight', 'bold')
          .attr('font-family', 'serif')
          .on('mouseover', function(d, i) {
              d3.select(this)
                .attr('font-size', '20pt')
                .attr('fill', '#36075F')
          })
          .on('mouseout', function(d, i) {
              d3.select(this)
                .attr('fill', '#2E718D')
                .attr('font-size', '13pt')
                .attr('font-weight', 'bold')
                .attr('font-family', 'serif')
          });

    }

    function showTooltip(selectedNode) {
        var mouse = d3.mouse(svg.node())
          .map( function(d) { return parseInt(d); } );
        tooltip.classed("hidden", false)
          .attr("style", "left:"+(mouse[0]+offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
          .html("CUI: " + selectedNode.id +"<br>Name:"+ get_concept_name(selectedNode)+"<br>Number of Concept Relations: " +get_relation_length(selectedNode.id)+"<br>Definition: " +get_definition(selectedNode.id));
        //   get_definition(d.id);

        //   console.log(selectedNode.id, get_concept_name(selectedNode), get_definition(selectedNode.id))
      }

    function ready(error, conceptInfo, defInfo){
        atoms = conceptInfo;
        definitions = defInfo;
        //console.log(atoms[1]);
        drawAtoms();
    }
}
