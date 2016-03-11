var fetch = require('node-fetch');
var cheerio = require('cheerio');

const URL = "http://sap.ufrj.br/";
const SEARCH_URL = `${URL}pesquisarCritR.asp`;
const RESULTS_URL = `${URL}pesquisarR.asp`;

function search(interessado){
  var cookies = {};

  return (
    fetch(URL)
    .then((resp) => {
      cookies = Object.assign(cookies, extractNewCookies(resp));

      var search_str = `op=P&numero=&interessado=${interessado}&unidade=&documento=&arquivo=&assunto=&assuntosel=&dataini=&datafim=`
      var headers = { Cookie: cookiesToString(cookies), "Content-Type": "application/x-www-form-urlencoded" };
      return fetch(SEARCH_URL, { method: 'POST', body: search_str, headers: headers});

    }).then((resp) => {

      cookies = Object.assign(cookies, extractNewCookies(resp));

      return resp.text();

    }).then(function(body){
      var headers = { Cookie: cookiesToString(cookies), "Content-Type": "application/x-www-form-urlencoded" };

      var body = "pagina=1&total=3&ordem=N";

      return fetch(RESULTS_URL, { method: 'POST', body, headers });
    })
    .then((resp) => resp.text())
    .then((body) => {
      var $ = cheerio.load(body);
      var table = $("table").get(1);
      var rows = $("tr", table).toArray();

      rows.shift();
      rows.shift();

      var results = [];
      for(var i = 0; i < rows.length/4; i++){
        var name = $("td[colspan=2]", rows[i*4]).text();
        var code = $("td a", rows[i*4]).text();
        var place = $($("td",rows[i*4+1]).get(1)).text();
        var subject = $($("td",rows[i*4+2]).get(1)).text();
        results.push({name, code, place, subject});
      }

      return results;
    })
  );

}

// Helper functions to work with cookies
function cookiesToString(cookies){
  return Object.
    getOwnPropertyNames(cookies).
    map((name) => `${name}=${cookies[name]}`).
    join("; ");
}

function extractNewCookies(resp){
  return resp.
    headers.
    getAll("set-cookie").
    join("; ").
    split(/; ?/).
    map((x) => x.split("=")).
    filter((x) => x[0] && x[0].length > 0 && x[1] && x[1].length > 0).
    reduce((dict,x) => { dict[x[0]] = x[1]; return dict; }, {});
}

module.exports = { search };
