var docs = require('../docs'),
    mdToHtml = require('marked');

var docsmid = require('../middleware/docsmiddleware');

module.exports = function (app, socketServer) {

  app.get('/new', app.requireAuthentication, function (req, res) {
    docs.createNew(req.user, function (err, docId) {
      if(err) return res.send(500, err);
      res.redirect('/edit/' + docId.toString());
    });
  });

  app.get('/my-docs', app.requireAuthentication, function (req, res) {
    docs.getAll(req.user, function (err, docs) {

      if(err) return res.send(500, err);

      res.render('my-docs', {
        title:  'My docs',
        user:   req.user,
        docs:   docs,
        moment: require('moment')
      });

    });
  });

  app.get('/tag/:tag', app.requireAuthentication, function (req, res) {
    docs.getAll(req.user, {inTag: req.params.tag}, function (err, docs) {

      if(err) return res.send(500, err);

      res.render('my-docs', {
        title:  'My docs',
        user:   req.user,
        docs:   docs,
        moment: require('moment')
      });

    });
  });

  app.get('/doc/:docId',
    docsmid.requireMinimunPermissions('can view'),
    function (req, res) {

    if(docs.getMaxPermission(req.user, req.doc) === 'can edit'){
      res.redirect('/edit/' + req.params.docId);
    } else {
      res.redirect('/view/' + req.params.docId);
    }
  });

  app.get('/doc/:docId/reduce',
    docsmid.requireMinimunPermissions('can edit'),
    function (req, res) {

    docs.reduceOperations(req.params.docId, function (err) {
      if(err) res.send(500, err);
      res.redirect('/doc/' + req.params.docId);
    });

  });

  app.get('/edit/:docId',
    function (req, res, next) {
      if (!req.params.docId) return res.send(404);
      return next();
    },
    docsmid.requireMinimunPermissions('can edit'),
    docsmid.loadSnapshot(app),
    function (req, res) {

      res.render('edit', {
        title:    'Edit',
        user:     req.user,
        doc:      req.doc,
        snapshot: req.docSnapshot,
        baseUrl : process.env.BASE_URL || 'http://localhost:8080/'
      });

      //set last access
      docs.update(req.doc, { lastAccess: new Date() });
    });

  app.get('/view/:docId',
    docsmid.requireMinimunPermissions('can view'),
    docsmid.loadSnapshot(app),
    function (req, res) {

      res.render('view', {
        user:  req.user,
        name:  req.doc.name,
        title: req.doc.name || 'untitled',
        html:  mdToHtml(req.docSnapshot)
      });

    });


  app.post('/doc/:docId/title',
    docsmid.requireMinimunPermissions('can edit'),
    function (req, res) {
      var change = { name: req.body.value };
      docs.update(req.doc, change, function (err) {
        if (err) return res.send(500, err);
        res.send(200, req.body.value);
        socketServer
          .sockets.in(req.params.docId)
          .emit('new title', { title: req.body.value });
      });
    });

  app.post('/doc/:docId/tags',
    docsmid.requireMinimunPermissions('can edit'),
    function (req, res) {
      var change = { tags: req.body, indexMe: true };
      docs.update(req.doc, change, function (err) {
        if (err) return res.send(500, err);
        res.send(200, req.body.value);
      });
    });

  app.get('/doc/:docId/collaborators',
    docsmid.requireMinimunPermissions('can edit'),
    function (req, res) {
      res.json(req.doc.collaborators);
    });

  app.post('/doc/:docId/collaborators',
    docsmid.requireMinimunPermissions('can edit'),
    function (req, res) {
      var collab = {
        type:  req.body.type
      };

      ['user_id',
       'email',
       'nickname',
       'name',
       'picture'].forEach(function(field){
        if(field in req.body){
          collab[field] = req.body[field];
        }
       });

      docs.changeCollaborator(req.doc, collab, function (err) {
        if (err) return res.send(500, err);
        res.send(200, req.body.value);
      });
    });

  app.post('/doc/:docId/visibility',
    docsmid.requireMinimunPermissions('can edit'),
    function (req, res) {
      var options = {
        level: req.body.level,
        type:  req.body.type
      };

      if(req.body.level === 'company'){
        if(req.user.identities[0].isSocial){
          return res.send(401);
        } else {
          options.company = req.user.companyId;
        }
      }

      docs.changeVisibility(req.doc, options, function (err) {
        if (err) return res.send(500, err);
        res.json(options);
      });
    });

  app.del('/doc/:docId/collaborators/:email',
    docsmid.requireMinimunPermissions('can edit'),
    function (req, res) {
      docs.removeCollaborator(req.doc, req.params.email, function (err) {
        if (err) return res.send(500, err);
        res.send(200);
      });
    });

  app.del('/doc/:docId',
    docsmid.requireMinimunPermissions('can edit'),
    function (req, res) {
      if(req.doc.owner !== req.user._id){
        return res.send(401);
      }
      docs.del(req.params.docId, function (err){
        if(err) return res.send(400); // :)
        res.send(200);
        socketServer
          .sockets.in(req.params.docId)
          .emit('document deleted');
      });
    });

};
