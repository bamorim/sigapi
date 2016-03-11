var fetch = require('node-fetch');
var cheerio = require('cheerio');

// Helper for matching all occurrences of a regex
function matchAll(str, regex){
  var match = str.match(regex);

  if(!match)
    return [];

  return [match].concat(matchAll(str.slice(match.index+1), regex));
}

function getLevels(){
  var url = 'https://siga.ufrj.br/sira/repositorio-curriculo/comboListaCursos.html';
  var regex = /value="([A-Z0-9-]+)\.html">([^<]*)</;

  return fetch(url)
    .then( (resp) => resp.text() )
    .then( (body) => (
      matchAll(body,regex)
      .map( (match) => ({title: match[2], id: match[1]}) )
    ) );
}

function getCourses(id){
  function parseCourse(tr, $, specializing){
    var nameClass = specializing ? ".identacao2" : ".identacao1";
    var nameEl = $(`${nameClass} b`, tr);
    var name;

    var versions = $("td", tr).not(nameClass).children(".linkNormal").toArray()
      .map( (a) => {
        return {
          period: $(a).text(),
          id: $(a).attr('href').match(/repositorio\-curriculo\/([A-Z0-9-]+)\.html/)[1]
        };
      } );

    if(nameEl.children("a").length == 0){
      name = nameEl.text();
    } else {
      name = nameEl.children("a").text();
    }

    if(specializing) return {name, versions};

    var specializations = $(`tbody#p${nameEl.attr("title")} .tableBodyBlue2`)
        .toArray()
        .map( (tr) => parseCourse(tr, $, true) )

    return { name, specializations, versions }
  }

  function parseBody(body) {
    var $ = cheerio.load(body);
    return $("tr.tableTitleBlue")
      .toArray()
      .slice(1)
      .map( (tr) => parseCourse(tr, $) )
  }

  return fetch(`https://siga.ufrj.br/sira/repositorio-curriculo/${id}.html`)
    .then( (resp) => resp.text() )
    .then( parseBody );
}

function getAllCourses(){
  return getLevels().then( (levels) => Promise.all(
    levels
    .map( ({id,name}) => (
      getCourses(id)
        .then((courses) => courses.map( (props) => Object.assign({levelId: id, levelName: name}, props)) )
    ) )
    .reduce((acc, arr) => acc.concat(arr), [])
  ) );
}

function getCourse(id){
  console.log("GETTING COURSE", id);
  var periodRegex = /(\d+)º Período/
  
  function parsePeriod($, table){
    return $("[class^=tableBodyBlue]",table)
      .toArray()
      .map(function(d){
        return {
          code: $("td", d).eq(0).text(),
          name: $("td", d).eq(1).text(),
          credits: $("td", d).eq(2).text(),
          theory_hours: $("td", d).eq(3).text(),
          practice_hours: $("td", d).eq(4).text(),
          requirements: $("td", d).eq(5).text()
        }
      })
  }

  function parseBody(body){
    var $ = cheerio.load(body);

    var tableTitle = (table) => {
      return $(".tableTitle b",table).text()
    };
    var tables = $("table.lineBorder");

    var periods = tables
      .toArray()
      .filter( (table) => {
        return tableTitle(table).match(periodRegex)
      })
      .map((table) => parsePeriod($,table))

    return {
      title: $("title").text(),
      localization: $("td", tables[0]).eq(4).text(),
      code: $("td", tables[0]).eq(6).text(),
      coordinator: $("td", tables[0]).eq(33).text(),
      periods
    }
  }

  return fetch(`https://siga.ufrj.br/sira/repositorio-curriculo/combo${id}.html`)
  .then( (resp) => resp.text() )
  .then( (body) => {
    var $ = cheerio.load(body);
    var uri = $("option").val();
    var url = `https://siga.ufrj.br/sira/repositorio-curriculo/${uri}`;
    return fetch(url);
  })
  .then( (resp) => resp.text() )
  .then( parseBody )
}

module.exports = {
  getLevels,
  getCourses,
  getAllCourses,
  getCourse
}
