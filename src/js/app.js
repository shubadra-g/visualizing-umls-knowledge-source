search_relations_by_cui = function(concept){
    // d3.select(".visual_window").select("h1").remove();
    // header = d3.select(".visual_window").append("h1").text("Search Relations by String")
    var height = 750;
    var width = 1100;

    d3.queue()
    .defer(d3.csv, "./data/concept_info.csv")
    .defer(d3.csv,"./data/definitions.csv")
    .defer(d3.csv, "./data/relations.csv")
    .defer(d3.csv, "./data/level2 details.csv")
    .defer(d3.csv, "./data/level2 definitions.csv")
    .defer(d3.csv, "./data/level2 Relations.csv")
    .await(ready);
    
    d3.select(".concept_relations").selectAll(".concept_relations_box").remove();
    
    var svg = d3.select(".concept_relations").append("div").attr("class", "concept_relations_box")
                .append("svg").attr("height",height).attr("width",width)
                .attr("style", "outline: thin solid black;");

    svg.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#F8F8F8")
        .on("click", reset);

    var simulation = d3.forceSimulation()
        .force("charge", d3.forceManyBody().strength(-1000))
        .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(150))
        .force("center_force", d3.forceCenter(width / 2, height / 2))
        // .force("x", d3.forceX(width / 2))
        // .force("y", d3.forceY(height / 2))
        .on("tick", ticked);
    var g = svg.append("g");

    var link = g.selectAll(".link"),
        node = g.selectAll(".node"),
        textElements = g.selectAll(".texts");

    var tooltip = d3.select("#tool_tip")
                    .append("div")
                    .attr("class", "tooltip hidden");

    var offsetL = document.getElementById('map').offsetLeft +210;
    var offsetT = document.getElementById('map').offsetTop + 180;
                    
    
    var graph_node = [{"id":concept}];
    var graph_link = [];
    var dataMap, dataDefnMap;
    var level2CRelation, level2CInfo, cInfo;
    var scaleRadius, scaleColor;
    var cDefn, level2Defn, strDefn;
    // var color = ['#deebf7','#c6dbef','#9ecae1','#6baed6','#4292c6','#2171b5','#08519c','#08306b']
    var color = ['#efedf5','#dadaeb','#bcbddc','#9e9ac8','#807dba','#6a51a3','#54278f','#3f007d']

    function ready(error, concept_info, concept_defn, concept_reln, level2_info, level2_defn, level2_relations){
        if (error) return console.log(error);
    
        dataMap = d3.nest()
                    .key(function(d){return d.CUI1})
                    .map(concept_reln, d3.map);
        
        level2CRelation = d3.nest()
                    .key(function(d){return d.CUI1})
                    .map(level2_relations, d3.map)
        
        level2CInfo = d3.nest()
                        .key(function(d){return d.CUI})
                        .map(level2_info,d3.map);
            
        cInfo = d3.nest()
                    .key(function(d){return d.CUI})
                    .map(concept_info,d3.map);

        cDefn = d3.nest()
                    .key(function(d){return d.CUI})
                    .map(concept_defn,d3.map);
        
        level2Defn = d3.nest()
                        .key(function(d){return d.CUI})
                        .map(level2_defn,d3.map);

        strDefn = Object.assign({},cDefn,level2Defn);

        if (dataMap.has(concept))
        {   
            dataMap = dataMap.get(concept);

            dataDefnMap = d3.nest()
                            .key(function(d){return d.CUI})
                            .map(concept_defn, d3.map);
            

            dataMap.forEach(function(value) {
                graph_node.push({'id':value.CUI2});
                graph_link.push({'source':value.CUI1, 'target': value.CUI2,});
            });
            //get_all_number_relations()
            restart(graph_node, graph_link);
        }
        else alert("No such String or CUI exists");
    }

    var radius_dict = {}
    function get_all_number_relations(){
        var arr = []
        arr.push(dataMap.length)
        radius_dict[concept]=dataMap.length
        dataMap.forEach(function(val){
            arr.push(level2CRelation.get(val.CUI2).length)
            radius_dict[val.CUI2]=level2CRelation.get(val.CUI2).length
        });
        // console.log(Math.min.apply(null, arr))
        // console.log(Math.max.apply(null, arr))
        return ([Math.min.apply(null, arr), Math.max.apply(null, arr)])
    }

    function get_relation_length(selectedNode){
        if (selectedNode in radius_dict)
        return radius_dict[selectedNode]
        else return 1;
    }


    function drag_start(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
           d.fx = d.x;
           d.fy = d.y;
       }
       
    function drag_drag(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }
    
    function drag_end(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    var counter = 0;
    var flag = false;

    function ticked() {
       
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
        
        textElements
            .attr('x', function (nod) { return nod.x; })
            .attr('y', function (nod) { return nod.y - 5; });

        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; }); 
      }

    function getNeighbours(nod,graph_links){
        return graph_links.reduce(function(neighbours, link){
            if(link.target.id === nod.id){
                neighbours.push(link.source.id)
            }
            else if(link.source.id === nod.id){
                neighbours.push(link.target.id)
            }

            return neighbours;
        }, [nod.id])  
    }
      
    function isNeighborLink(nod, lin) {
        return lin.target.id === nod.id || lin.source.id === nod.id
    }

    function getNodeColor(nod, neighbors) {

        var res = neighbors.indexOf(nod.id) === -1 ? false:true;
        if (!res) {
            return '#E5E5E5';
        }
        return function(d){ return color[scaleColor(get_relation_length(d.id))]};
      }
    
    function getLinkColor(nod, lin) {
        return isNeighborLink(nod, lin) ? 'black' : '#E5E5E5'
    }
    
    function getTextColor(nod, neighbors) {
        return neighbors.indexOf(nod.id) != -1 ? 'green' : 'black'
    }
    
    function update(graph_nodes, graph_links,selectedNode)
    {
        var gl = [], gn = [];
       
        if(selectedNode &&  selectedNode.id !== concept)
        { 
           level2_relations = level2CRelation.get(selectedNode.id)
            // console.log(level2_relations);
            level2_relations.forEach(function(value){
                if (value.CUI1 !== concept && value.CUI2 !== concept)
                {
                gn.push({'id':value.CUI2})
                gl.push({'source':value.CUI1, 'target':value.CUI2})
                }
            });
            // console.log("New Nodes: ",gn.length,gl.length)
        }
       let updated_nodes = graph_nodes.concat(gn);
       let updated_links = graph_links.concat(gl);
    //    console.log("Updation",updated_nodes.length, updated_links.length)
        return [updated_nodes, updated_links];
    }

    function restart(graph_nodes, graph_links, selectedNode)
    {   
        updated = update(graph_nodes, graph_links,selectedNode)
        let updated_nodes = updated[0];
        let updated_links = updated[1];

        // console.log("Restarting", updated_nodes.length, updated_links.length);
        scaleRadius = d3.scaleLinear()
                        .domain(get_all_number_relations())
                        .range([8, 45]);
        scaleColor = d3.scaleLinear().domain(get_all_number_relations()).rangeRound([0,7])
        link = link.data(updated_links);
        link.exit().remove();
        link = link.enter().append("line").attr("class","link")
                    .attr("stroke","black").attr('stroke-width', 1).merge(link);

        // Apply the general update pattern to the nodes.
        node =node.data(updated_nodes);
        node.exit().remove();
        node = node.enter().append("circle").attr("class","node")
                    .style("fill", function(d){ return color[scaleColor(get_relation_length(d.id))]})
                    .attr("r", function(d){ return scaleRadius(get_relation_length(d.id))})
                    .attr("stroke","black")
                    .attr('stroke-width', 1)
                    .on("click",function(d){selectNode(d, graph_nodes, graph_links)})
                    .on("mousemove",function(d){ showTooltip(d)})
                    .on("mouseout",  function(d,i) {
                        tooltip.classed("hidden", true);
                    }).merge(node);

        textElements = textElements.data(updated_nodes)
        textElements.exit().remove();
        textElements = textElements.enter().append("text").attr("class","texts")
        .text(function (d) { return get_concept_name(d); })
        .attr("font-size", 10)
        .attr("dx", 15)
        .attr("dy", 4).merge(textElements);

        // Update and restart the simulation.
        simulation.nodes(updated_nodes).on("tick", ticked)
        simulation.force("link").links(updated_links);
        simulation.restart();

        if(selectedNode)    
        {        
            const neighbors = getNeighbours(selectedNode, updated_links)
            node.style('fill', nod => getNodeColor(nod, neighbors)); 
            textElements.attr('fill', nod => getTextColor(nod, neighbors))
            link.attr('stroke', lin => getLinkColor(selectedNode, lin));
        }        
        else
        {
            node.style('fill', function(d){ return color[scaleColor(get_relation_length(d.id))]}); 
            link.attr("stroke","black")
                .attr('stroke-width', 1);
            textElements.attr("fill","black");
        }     
        
        var drag_handler = d3.drag()
            .on("start", drag_start)
            .on("drag", drag_drag)
            .on("end", drag_end);

        drag_handler(node);
    }

    function selectNode(selectedNode, graph_nodes, graph_links ) {
        restart(graph_nodes, graph_links, selectedNode);
    }

    function get_concept_name(selectedNode){
        if(level2CInfo.has(selectedNode.id))
            var details = level2CInfo.get(selectedNode.id)

        else if (cInfo.has(selectedNode.id) )
            var details = cInfo.get(selectedNode.id)
        
        if(details){         
        details = details.map(d => d.STR)
        return ( details[0])
        }

        return selectedNode.id
        // return Math.min.apply(null, details)
    }
    
    function reset(){
        restart(graph_node, graph_link)
        node.style('fill', function(d){ return color[scaleColor(get_relation_length(d.id))]}); 
        link.attr("stroke","black")
            .attr('stroke-width', 1);
        textElements.attr("fill","black");  
    }
    function get_definition(selectedNode){

        if (level2Defn.has(selectedNode)){
            definition = level2Defn.get(selectedNode)
            definition = definition.map(d => d.DEF)
            // console.log("Definition:", definition )
            return definition[0];
        }
        return ("No information")
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
}

search_relations_by_str = function(concept){
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
        var cui = dataDefnMap.get(concept)[0].CUI
        search_relations_by_cui(cui);
        search_atoms_by_cui(cui);}
        else alert("No such string or CUI exists")
    }
}

