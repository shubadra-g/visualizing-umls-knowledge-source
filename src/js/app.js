var sliderValue = slider.setValue([1, 20], triggerSlideEvent='true', triggerChangeEvent='true');
var clickedID = 0;
sliderValue = slider.getValue();
slider.on("change", function(slideEvt) {
    sliderValue = slider.getValue();
    if(clickedID == 0) {
        search_relations_by_cui(cui);
    }
    else {
        search_relations_by_cui(clickedID);
    }    
})

var breadcrumbArray = [];
var rootTerm = '';
var childNodes = [];
search_relations_by_cui = function(concept) {
    childNodes.length = 0;
    console.log(concept);
    var height = 950;
    var width = 1800;
    var b = {
        w: 150, h:30, s: 3, t: 10
    };

    d3.queue()
    .defer(d3.csv, "./data/concept_info.csv")
    .defer(d3.csv,"./data/definitions.csv")
    .defer(d3.csv, "./data/combined-reln.csv")  
    .defer(d3.csv, "./data/deduped-all-concept-data.csv")
    .defer(d3.csv, "./data/all-level-defn.csv")
    .defer(d3.csv, "./data/deduped-l2-l3-reln.csv")
    .await(ready); 
    
    d3.select(".concept_relations").selectAll(".concept_relations_box").remove();
    var svg = d3.select(".concept_relations").append("div").attr("class", "concept_relations_box")
                .append("svg").attr("height",height).attr("width",width);

                svg.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "white")
        .on("click", reset);

    var breadcrumb = d3.breadcrumb()
                   .container('#breadcrumb')
                   .padding(15);
                   
    var idChecker = [];
    var simulation = d3.forceSimulation()
        .force("charge", d3.forceManyBody().strength(-1900))
        .force("link", 
            d3.forceLink()
              .id(function(d) { 
                    return d.id;
                })
              .distance(function(d) {
                    dID = d.target;
                    linkLen = radius_dict[dID.id.toString()];
                    // console.log(linkLen);
                    if (linkLen == 1) {
                        return linkLen * 300;
                    }
                    if (linkLen == 2) {
                        return linkLen * 200;
                    }
                    if (linkLen < 5) {
                        return linkLen * 100;
                    }
                    if (linkLen > 4 && linkLen < 10) {
                        return linkLen * 85;
                    }
                    if (linkLen > 10 && linkLen < 35) {
                        return linkLen * 10
                    }
                    if (linkLen > 35 && linkLen < 65) {
                        return linkLen * 5
                    }
                    if (linkLen > 65) {
                        return 100;
                    }
                    else { 
                        return 150;
                    }
                    
              }))
        .force("center_force", d3.forceCenter(width / 3, height / 2))
        .on("tick", ticked);
    
    var g = svg.append("g");

    var link = g.selectAll(".link"),
        node = g.selectAll(".node"),
        textElements = g.selectAll(".texts");

    var tooltip = d3.select("#tool_tip")
                    .append("div")
                    .attr("class", "tooltip hidden")
                    
                    ;

    var offsetL = document.getElementById('map').offsetLeft +210;
    var offsetT = document.getElementById('map').offsetTop + 180;
                    
    
    var graph_node = [{"id":concept}];
    var graph_link = [];
    var dataMap, dataDefnMap;
    var level2CRelation, level2CInfo, cInfo;
    var scaleRadius, scaleColor;
    var cDefn, level2Defn, strDefn;
    // var color = ['#e7eef4','#cfddea', '#b8cce0', '#a0bcd6', '#89abcc', '#719ac2', '#598ab8', '#4279ae', '#2a68a4', '#13589a'];
    var color = ['#D5E5F3', '#97BEE3', '#82B1DD', '#6EA4D7', '#5997D2', '#448ACC', '#307EC7', '#2B71B3', '#26649F', '#21588B', '#1C4B77'];
    function readData(concept_info, concept_defn, concept_reln, level2_info, level2_defn, level2_relations) {
        dataMap = d3.nest()
                    .key(function(d){
                        return d.CUI1})
                    .map(concept_reln, d3.map);
        
        level2CRelation = d3.nest()
                    .key(function(d){
                        return d.CUI1})
                    .map(level2_relations, d3.map);
        
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
    }
    
    function ready(error, concept_info, concept_defn, concept_reln, level2_info, level2_defn, level2_relations){
        if (error) return console.log(error);
        readData(concept_info, concept_defn, concept_reln, level2_info, level2_defn, level2_relations);
        if (dataMap.has(concept))
        {   
            dataMap = dataMap.get(concept);
            dataDefnMap = d3.nest()
                            .key(function(d){return d.CUI})
                            .map(concept_defn, d3.map);
            
            dataMap.forEach(function(value) {
                tempLen = level2CRelation.get(value.CUI2).length;
                if (tempLen >= sliderValue[0] && tempLen <= sliderValue[1]) {
                    if(idChecker.includes(value.CUI2)) {
                        // console.log('Not including ID...');
                    }
                    else {
                        graph_node.push({'id':value.CUI2});
                        graph_link.push({'source':value.CUI1, 'target': value.CUI2,});
                        idChecker.push(value.CUI2);
                    }
                }
            });
            restart(graph_node, graph_link);
        }
        else if (level2CRelation.has(concept)) {   
            dataMap = dataMap.get(cui);
            level2CRelation_concept = level2CRelation.get(concept);
            dataDefnMap = d3.nest()
                            .key(function(d){return d.CUI})
                            .map(concept_defn, d3.map);
            
            var cui2L = [];
            level2CRelation_concept.forEach(function(value) {
                tempLen = level2CRelation.get(value.CUI2).length;
                if (tempLen >= sliderValue[0] && tempLen <= sliderValue[1]) {
                    if(idChecker.includes(value.CUI2)) {
                        // console.log('Not including ID...');
                    }
                    else {
                        graph_node.push({'id':value.CUI2});
                        graph_link.push({'source':value.CUI1, 'target': value.CUI2,});
                        idChecker.push(value.CUI2);
                    }
                }
            });
            restart(graph_node, graph_link);
        }        
        else alert("No such String or CUI exists! String search terms are case-sensitive!");
    }
    
    var radius_dict = {}
    var tempLen = 0;
    function get_all_number_relations(){
        var arr = [];
        arr.push(dataMap.length)
        radius_dict[concept]=dataMap.length
        dataMap.forEach(function(val){
            tempLen = level2CRelation.get(val.CUI2).length
                arr.push(level2CRelation.get(val.CUI2).length)
                radius_dict[val.CUI2]=level2CRelation.get(val.CUI2).length
        });
        return ([Math.min.apply(null, arr), Math.max.apply(null, arr)])
    }

    function get_relation_length(selectedNode){
        if (selectedNode in radius_dict) {
            return radius_dict[selectedNode]
        }
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
            level2_relations.forEach(function(value) {
                if (value.CUI1 !== concept && value.CUI2 !== concept)
                {
                    gn.push({'id':value.CUI2})
                    gl.push({'source':value.CUI1, 'target':value.CUI2})
                }
            });
        }
       let updated_nodes = graph_nodes.concat(gn);
       let updated_links = graph_links.concat(gl);
       return [updated_nodes, updated_links];
    }
     
    function updateBreacrumb(nodeData) {
        breadcrumb = d3.breadcrumb()
            .container('svg')   
            .padding(5)
            .wrapWidth(0) 
            .height(28)
            .fontSize(20)
            .marginLeft(0)
            .marginTop(10)
            .leftDirection(false)
            ;
        breadcrumb.show(breadcrumbArray);
    }   
        
    function restart(graph_nodes, graph_links, selectedNode)
    {   
        updated = update(graph_nodes, graph_links,selectedNode)
        let updated_nodes = updated[0];
        let updated_links = updated[1];
        initializeBreadcrumb(get_concept_name(selectNode));
        updateBreacrumb(selectedNode);
        childNodes.length = 0;
        relationsList = [];
        scaleRadius = d3.scaleLinear()
                        .domain(get_all_number_relations())
                        .range([8, 45]);
        scaleColor = d3.scaleLinear().domain(get_all_number_relations()).rangeRound([0,7])
        link = link.data(updated_links);
        link.exit().remove();
        link = link.enter().append("line").attr("class","link")
                    .attr("stroke","black").attr('stroke-width', 1).merge(link);
        node = node.data(updated_nodes);
        // console.log(node);
        node.exit().remove();
        node = node.enter().append("circle").attr("class","node")
                    .style("fill", function(d){ return color[scaleColor(get_relation_length(d.id))]})
                    .attr("r", function(d){ 
                        return scaleRadius(get_relation_length(d.id));
                    })
                    .attr("stroke","black")
                    .attr('stroke-width', 1)
                    .on("click",function(d){
                        clickedID = d.id;
                        clickedName = get_concept_name(d);
                        if (!breadcrumbArray.includes(clickedName))
                        {
                            if(childNodes.includes(clickedName)) {
                                breadcrumbArray.push(clickedName);
                            }
                            else {
                                if(breadcrumbArray.length >= 2) 
                                    {
                                        breadcrumbArray = [];
                                        breadcrumbArray.push(rootTerm);
                                        updateBreacrumb(breadcrumbArray);
                                        
                                    }
                                breadcrumbArray.push(clickedName);
                            }
                        }
                        updateBreacrumb(breadcrumbArray);
                        selectNode(d, graph_nodes, graph_links)
                    })
                    .on("mouseover",function(d){ 
                        tooltip.transition()
                               .duration(700)
                               .style('opacity', 0.9)
                               .style('pointer-events', 'none')
                               .style('position', 'absolute')
                               .style('text-align', 'left')
                               .style('font-weight', '4px')
                               .style('background', 'gainsboro')
                               .style('border', '0px')
                               .style('border-radius', '18px')
                        showTooltip(d)})
                    .on("mouseleave",  function(d,i) {
                        tooltip.transition().duration(500)
                        tooltip.classed("hidden", true);
                    })
                    .merge(node);

        textElements = textElements.data(updated_nodes)
        textElements.exit().remove();
        textElements = textElements.enter().append("text").attr("class","texts")
        .text(function (d) { 
            childNodes.push(get_concept_name(d))
            return get_concept_name(d); })
        .attr("font-size", 24)
        .attr("font-family", "sans-serif")
        .attr("font-weight", '1.5px')
        .attr("dx", 20)
        .attr("dy", 20).merge(textElements);

        // Updating and restarting the simulation
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
        // console.log(childNodes);
    }
    
    function selectNode(selectedNode, graph_nodes, graph_links ) {
        restart(graph_nodes, graph_links, selectedNode);
    }

    function get_concept_name(selectedNode){
        if(level2CInfo.has(selectedNode.id)) {
            var details = level2CInfo.get(selectedNode.id)
        }

        else if (cInfo.has(selectedNode.id)) {
            var details = cInfo.get(selectedNode.id)
        }
        
        if (details) {         
            details = details.map(d => d.STR);
            return ( details[0])
        }
        
        return selectedNode.id;
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
          .html("<b>Concept CUI:</b> " + selectedNode.id +"<br><b>Concept Name:</b> "+ get_concept_name(selectedNode)+"<br><b>Number of Concept Relations:</b> " +get_relation_length(selectedNode.id)+"<br><b>Concept Definition:</b> " +get_definition(selectedNode.id));
    }
    
}
function initializeBreadcrumb(rootTerm) {
    var trailIn = d3.select("#breadcrumb").append("svg")
        .attr("width", 960)
        .attr("height", 50)
        .attr("id", "trailIn");
    trailIn.append("text")
        .append("text");
    d3.select("#trailIn").style("visibility", '');
    var breadcrumb = d3.breadcrumb()
        .container('breadcrumb')  
    breadcrumb = d3.breadcrumb()
        .container('svg')   
        .padding(5)
        .wrapWidth(0)  
        .height(28)
        .fontSize(14)
        .marginLeft(0)
        .marginTop(10)
        .leftDirection(false)
        ;

    }
var cui = 0;
search_relations_by_str = function(concept){
    childNodes.length = 0;
    if (breadcrumbArray.length >= 0) {
        for (var x = 0; x < breadcrumbArray.length; x++) {
            breadcrumbArray.pop();
        }
    }
    d3.queue()
    .defer(d3.csv, "./data/deduped-all-concept-data.csv")
    .defer(d3.csv,"./data/combined-all-level-defn.csv")
    .defer(d3.csv, "./data/relations.csv")  
    .await(ready);
    function ready(error, concept_info, concept_defn, concept_reln){
        if (error) return console.log(error);
    
        dataDefnMap = d3.nest()
                        .key(function(d){return d.STR})
                        .map(concept_defn, d3.map);
        if (dataDefnMap.has(concept)) {
            cui = dataDefnMap.get(concept)[0].CUI
            rootTerm = concept;
            breadcrumbArray.push(rootTerm);
            initializeBreadcrumb(rootTerm);
            search_relations_by_cui(cui);
        }
        else alert("No such string or CUI exists!")
    }    
}
