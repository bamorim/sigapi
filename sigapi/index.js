var app = require('koa')();
var router = require('koa-router')();
var {getLevels, getCourses, getAllCourses, getCourse} = require('./curriculum');
var {getCrid} = require('./documents.js');
var {search} = require("./sap.js");

// Helper function to create routes using JSON
function mount(route, promiseFactory){
  router.get(route, function(ctx, next){
    return promiseFactory(this).then((resp) => {
      this.body = JSON.stringify(resp);
      this.set("Content-Type", "text/json; charset=utf-8");
    });
  });
}

// Mount the curriculum-related actions
mount('/levels', getLevels);
mount('/levels/:id/courses', (ctx) => getCourses(ctx.params.id));
mount('/courses', getAllCourses);
mount('/courses/:id', (ctx) => getCourse(ctx.params.id));

// Sample endpoint for processing the CRID document
mount('/documents/crid', (ctx) => getCrid(ctx.params.username, ctx.params.password));

// Mount the SAP search action
mount('/processes/search', (ctx) => search(ctx.request.query.q));

// Setup middlewares
app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000);
