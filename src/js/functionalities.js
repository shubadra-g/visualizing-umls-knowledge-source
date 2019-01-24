search_type = function(){
    var relation_mapping = $('input[name = relation_mapping]:checked').val();
    if (relation_mapping === "concept_relation"){
        var search_method = $('input[name=search_type_radio]:checked').val();
        // console.log(search_method);

        if (search_method === "search_by_string"){

            // change the onsubmit version of the form here to this function name
            var concept = document.getElementById("search_text").value;
            console.log(concept);
            if (concept != "")
            search_relations_by_str(concept);
            else alert("Please enter your String or CUI")
        }
        else if(search_method === "search_by_cui"){
            // change the onsubmit version of the form here to this function name
            var concept_cui = document.getElementById("search_text").value;
            concept_cui=concept_cui.toUpperCase();
            // console.log(concept_cui);
            if (concept_cui != ""){
            search_relations_by_cui(concept_cui);
            search_atoms_by_cui(concept_cui);}
            else alert("Please enter your String or CUI")

        }
    }
    else if(relation_mapping === "concept_mapping"){
        var search_method = $('input[name=search_type_radio]:checked').val();
        // console.log(search_method);

        if (search_method === "search_by_string"){
            // change the onsubmit version of the form here to this function name
            var fromConcept = document.getElementById("search_text").value;
            var toConcept = document.getElementById("concept_to").value;
            // console.log(fromConcept, toConcept);
            search_mapping_by_str(fromConcept, toConcept);
        }
        else if(search_method === "search_by_cui"){
            // change the onsubmit version of the form here to this function name
            var from_concept_cui = document.getElementById("search_text").value;
            var to_concept_cui = document.getElementById("concept_to").value;
            from_concept_cui=from_concept_cui.toUpperCase();
            to_concept_cui=to_concept_cui.toUpperCase();
            // console.log(from_concept_cui, to_concept_cui);
            search_concept_mapping(from_concept_cui,to_concept_cui);
        }
    }
}

addToBox = function(){
    var elem = document.getElementById('search_to_div');
    elem.style.display = 'block';
    var box = document.getElementById('search_text');
    box.placeholder = "From.."
    var relation_atom_view = document.getElementById('visual_window');
    relation_atom_view.style.display = 'none'
    var concept_mapping_view = document.getElementById('visual_window_mapping')
    concept_mapping_view.style.display = 'block'

}

hideToBox = function(){
    var elem = document.getElementById('search_to_div');
    elem.style.display = 'none';
    var box = document.getElementById('search_text');
    box.placeholder = "Search.."
    var relation_atom_view = document.getElementById('visual_window');
    relation_atom_view.style.display = 'block'
    var concept_mapping_view = document.getElementById('visual_window_mapping')
    concept_mapping_view.style.display = 'none'

}

search_mapping_by_str = function(){

}
search_mappings_by_cui = function(){

}
// search_relations_by_str = function(concept){
//     d3.select(".visual_window").select("h1").remove();
//     header = d3.select(".visual_window").append("h1").text("Search Relations by String")

// }

// search_relations_by_cui = function(){
//     d3.select(".visual_window").select("h1").remove();
//     header = d3.select(".visual_window").append("h1").text("Search Relations by CUI")
// }
