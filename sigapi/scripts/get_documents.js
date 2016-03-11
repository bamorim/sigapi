var casper = require('casper').create({
  verbose: true,
  logLevel: "debug",
  pageSettings: {
    loadImages:  false
  }
});

var documents = {
  crid: 'j_id95',
  comprovante: 'j_id78:0:j_id79',
  historico: 'botaoHistorico',
  boletim: 'botaoBoletim',
  boa: 'j_id91'
}

phantom.cookiesEnabled = true

casper.start('https://gnosys.ufrj.br/Portal/home.seam');

casper.waitForSelector("#gnosys-login-form",function(){
  this.echo("Logging in");

  var username = casper.cli.raw.get(1);
  var password = casper.cli.raw.get(2);
  this.echo("Logging in as "+username+" / "+password);

  this.fill("#gnosys-login-form", {
    inputUsername: username,
    inputPassword: password
  }, true)
})

casper.waitForSelector(".gnosys-login-informacoes", function(){
  this.echo("successfully logged in");
});

casper.thenOpen('https://gnosys.ufrj.br/Documentos/');

casper.waitForSelector(".documento.crid", function(){
  this.echo("On documents page");
  var document_name = casper.cli.raw.get(0);
  this.echo("Document name: "+document_name);
  var document_action = documents[document_name];
  this.echo("Document action: " + documents[document_name]);

  var resp = this.evaluate(function(doc_action){
    var form = jQuery("#gnosys-decor-vis-seletor-matricula-form");
    var reqData = form.serialize()+"&"+doc_action+"="+doc_action;
    jQuery.post(form.attr('action'),reqData,function(){
      window.myFinished = true;
    });
    return reqData;
  },document_action);

  this.echo("Req data: "+resp);
});

casper.waitFor(function check(){
  return this.evaluate(function(){
    return window.myFinished === true;
  });
},function then(){
  var cid = this.getCurrentUrl().split("cid=").reverse()[0].split("&")[0];
  var fname = casper.cli.args[3];
  var url = "https://gnosys.ufrj.br/Documentos/seam/docstore/document.seam?docId=1&cid="+cid;
  this.echo("CURRENT CID IS: "+cid);
  this.echo("Saving file to: "+fname);
  this.download(url, fname);
}, function timeout(){
  this.echo("Taking too long");
}, 10000)

casper.run();
