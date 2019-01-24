search_concept_mapping = function(concept1, concept2){
    var cui1=concept1, cui2=concept2;
    //  cui1="C0004096", cui2="C0020523";
    var definitions={};
    var conceptsL1={}; 
    var conceptsL2={};
    var mapPath = [cui1];
    var graph={};

    var margin = { top: 30, right: 30, bottom: 40, left:50 };
    var width = 600-margin.top-margin.bottom,
        height = 400-margin.left-margin.right;
    var color = d3.scaleOrdinal(d3.schemeCategory20);
    d3.select(".visual_window_mapping svg").remove();  
    var svg = d3.select(".visual_window_mapping")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
    
    d3.queue()
        .defer(d3.csv, "./data/relations.csv")
        .defer(d3.csv, "./data/level2_relations.csv")
        .defer(d3.csv, "./data/definitions.csv")
        .await(ready);


    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("charge", d3.forceManyBody().strength(-1000).distanceMax(450).distanceMin(85))
        .force("center", d3.forceCenter(width / 2, height / 2));      


    function drawNetwork(){
        var link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(graph.links)
            .enter().append("line")
            .attr("stroke","black")
            .attr("stroke-width", "0.5");
        //.attr("stroke-width", function(d) { return Math.sqrt(d.value); });

        var node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(graph.nodes)
            .enter().append("g");

        var circles = node.append("circle")
            .attr("r", 5)
            .attr("fill", function(d) { return color(d.group); })
            .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));  
        
          var lables = node.append("text")
            .text(function(d) {
                return d.name;
            })
            .attr('x', 6)
            .attr('y', 3);
        
        node.append("title")
          .text(function(d) { return d.name; });
    
        simulation
          .nodes(graph.nodes)
          .on("tick", ticked);
    
        simulation.force("link")
          .links(graph.links);

          function ticked() {
            link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });
        
            node
                .attr("transform", function(d) {
                  return "translate(" + d.x + "," + d.y + ")";
                })
        }
    }



    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      
    function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
    }
      
    function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
    }

    function findPath(){
        var l2links=[];         //possible connector links to level 2
        var linkFound=false;
        for(var i=0; i< conceptsL1.length; i++){
            if(conceptsL1[i].CUI1 === cui1){
                if(conceptsL1[i].CUI2 === cui2){
                    mapPath.push(cui2);
                    linkFound=true;
                    break;
                }
                else{
                    l2links.push(conceptsL1[i].CUI2);
                }
            }
        }
        if(!linkFound){
            for(var i=0; i< conceptsL2.length; i++){
                if(l2links.includes(conceptsL2[i].CUI1)){
                    if(conceptsL2[i].CUI2 === cui2){
                        mapPath.push(conceptsL2[i].CUI1);
                        mapPath.push(cui2);
                        linkFound=true;
                        break;
                    }
                }
            }            
        }
        console.log(mapPath);
        graph = 
        {
            "nodes":
            [
                {"name": mapPath[0], "id":0},
                {"name": mapPath[1], "id":1},
                {"name": mapPath[2], "id":2}
            ],
            "links":
            [
                {"source": 0, "target": 1},
                {"source": 1, "target": 2}
            ]
        };
        if(mapPath.length>1){
            drawNetwork();
        }
        else{
            t= svg.append("text")
                .attr("x", (width / 2))             
                .attr("y", 50)
                .attr("text-anchor", "middle")  
                .style("font-size", "14px") 
                .text("No link found between searched concepts within two levels of depth");
        }
    }


    function ready(error, level1Rel, level2Rel, def){
        if (error) return console.log(error);

        conceptsL1 = level1Rel;
        conceptsL2 = level2Rel;
        definitions= def;
        // console.log(conceptsL1[0]);
        // console.log(conceptsL2[0]);
        findPath();
    }
}

search_mapping_by_str = function(concept1, concept2){
    // d3.select(".visual_window").select("h1").remove();
    // header = d3.select(".visual_window").append("h1").text("Search Relations by String")

    d3.queue()
    .defer(d3.csv, "./data/concept_info.csv")
    .defer(d3.csv,"./data/definitions.csv")
    .defer(d3.csv, "./data/relations.csv")
    .await(ready);
    function ready(error, concept_info, concept_defn, concept_reln){
        if (error) return console.log(error);
    
        dataDefnMap = d3.nest()
                        .key(function(d){return d.CNAME})
                        .map(concept_defn, d3.map);
        if (dataDefnMap.has(concept)){
        var cui1 = dataDefnMap.get(concept1)[0].CUI
        var cui2 = dataDefnMap.get(concept2)[0].CUI
        
        search_concept_mapping(cui1, cui2);
        }
        else alert("No such string or CUI exists")
    }
}