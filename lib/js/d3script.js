//victimID,date,name,gender,age,ageGroup,city,state,lat,lng,url
var victimIDarr=[],
    datearr=[],
    namearr=[],
    genderarr=[],
    agearr=[],
    ageGrouparr=[],
    cityarr=[],
    statearr=[],
    latarr=[],
    lngarr=[],
    urlarr=[];


d3.csv('sgDeaths.csv', function(data) {
    console.log(data[0]);

    for (key in data) {
        datearr.push(data[key].victimID);
        namearr.push(data[key].date);
        datearr.push(data[key].name);
        genderarr.push(data[key].gender);
        agearr.push(data[key].age);
        ageGrouparr.push(data[key].ageGroup);
        cityarr.push(data[key].city);
        statearr.push(data[key].state);
        latarr.push(data[key].lat);
        lngarr.push(data[key].lng);
        urlarr.push(data[key].url);
    }
    
    var myMap = d3.select('#Map').append('svg')
    .style('background', '#E7E0CB')
    .attr('width', 600)
    .attr('height', 350)


});
