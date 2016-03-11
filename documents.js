var denodeify = require('denodeify');
var exec = denodeify(require('child_process').exec, function(err, stdout, stderr) {
  return [err, stdout];
});

var cridRegex = /(\d+)\s+([A-Z0-9]+)\s+(([^ ]+ ?)+)\s+(\d+)\s+(\d+\.\d+)\s+(.*)/;

function getCrid(username, password){
  // Since siga changed, we can no longer use the old script
  // In a normal scenario we would use the following code:
  // return exec(`./scripts/get_documents crid ${username} ${password}`)
  
  return exec('pdftotext -layout ../crid.pdf -')
	.then(function(text){
    var lines = text.split("\n")
    while(!lines[0].match(/^Controle/)){lines.shift()}
    lines.shift();
    return lines
      .filter(function(line){return line.match(/^\d/)})
      .map(function(line){ return line.match(cridRegex)})
      .map(function(r){ 
        return {
          control: r[1],
          code: r[2],
          title: r[3],
          hours: r[5],
          credits: r[6],
          situation: r[7]
        }
      });
	});
}

module.exports = { getCrid };
