const koa = require('koa');
const koaRouter = require('koa-router');
const koaBodyParser = require('koa-bodyparser');
const OpenApiValidator = require('koa-openapi-validator');
const http = require('http');

const app = new koa();
const router = new koaRouter();

// 1. install body parser for multipart
app.use(koaBodyParser({}))

// 2. define your routes
router.get('/customer/:id/device-metadata', (ctx) => {
  ctx.body = {
    message: 'Getting device metadata from customer!',
  };
});

// 3. define error middleware and an error response
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.log(err)
    ctx.status = err.statusCode || err.status || 500;
    ctx.body = {
      message: err.message,
      errors: err.errors ?? [],
    };
  }
});

// 4. configure the koa-openapi-validator
app.use(
  OpenApiValidator.middleware({
    apiSpec: './secureRoutes.json',
    validateRequests: true,
    validateFormats: 'fast',
    formats: [{
      name: 'my-custom-format',
      type: 'string' | 'number',
      validate: (value) => boolean,
    }],
    ignorePaths: /.*\/customer$/,
    $refParser: {
      mode: 'bundle'
    },
    
  }),
);

app.use(router.routes()).use(router.allowedMethods());

app.listen(3002, () => console.log('backend running successfully'));

