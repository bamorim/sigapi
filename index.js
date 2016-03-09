var app = require('koa')();
var router = require('koa-router')();
var {getLevels, getCourses, getAllCourses, getCourse} = require('./curriculum');
var {getCrid} = require('./documents.js');

router.get('/levels', function (ctx, next){
  return getLevels().then((resp) => {
    this.json = resp;
  });
});

router.get('/levels/:id/courses', function (ctx, next) {
  return getCourses(this.params.id)
    .then((resp) => this.json = resp);
});

router.get('/courses', function (ctx, next) {
  return getAllCourses()
    .then((resp) => this.json = resp);
});

router.get('/courses/:id', function(ctx, next) {
  return getCourse(this.params.id)
    .then((resp) => this.json = resp);
});

router.get('/documents/crid', function(ctx, next) {
  return getCrid(this.params.username, this.params.password)
    .then((resp) => this.json = resp);
});

app
  .use(function*(next){
    yield next;
    if(this.json){ 
      this.body = JSON.stringify(this.json);
      this.set("Content-Type", "text/json; charset=utf-8");
      this.set
    }
  })
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000);
