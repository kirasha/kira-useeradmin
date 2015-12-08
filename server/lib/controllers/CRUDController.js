'use strict';

var _               = require('lodash'),
    defaultOptions  = {};

defaultOptions.omitted = ['_id', '__v'].concat(Object.keys(require('mongoose').Schema.reserved));

defaultOptions.fields = ['id','name','createdAt', 'updatedAt','href'];

function removeReservedKeys (entity, callback) {
  var obj = entity.toJSON();
  obj = _.omit(obj, defaultOptions.omitted);
  return obj;
}

function getFields (req) {
  var fields = req.restQuery.fields || defaultOptions.fields;
  return fields;
}

function list (model, options, callback) {

  return function (req, res, next) {
    req.restQuery.fields = getFields(req);
    model.filter(req.restQuery)
      .then(function (docs) {
        if (!docs) {
          res.noContent(docs);
        } else {
          docs = docs.map(removeReservedKeys);
          res.ok(docs);
        }
      })
      .catch(function (err) {
        res.handleError(err);
      });
  };
}

function read (model, options, callback) {
  return function (req, res, next) {
    model.findOne({ _id: req.params.id }, function (err, doc) {
      if (err) {
        res.handleError(err);
      } else {
        if (!doc) {
          res.noContent(doc);
        } else {
          res.ok(removeReservedKeys(doc));
        }
      }
    });
  };
}

function create (Model, options, callback) {
  return function (req, res, next)  {
    var model = new Model(req.body);
    model.save(function (err, doc) {
      if (err) {
        res.handleError(err);
      } else {
        if (!doc) {
          res.noContent(doc);
        } else {
          res.ok(removeReservedKeys(doc));
        }
      }
    });
  };
}

function update (model, options, callback) {
  return function (req, res, next) {
    var updatedDoc = req.body;
    model.findOneAndUpdate({ _id: req.params.id }, updatedDoc, function (err, doc) {
      if (err) {
        res.handleError(err);
      } else {
        if (!doc) {
          res.notContent(doc);
        } else {
          res.ok(removeReservedKeys(doc));
        }
      }
    });
  };
}

function destroy (model, options, callback) {
  return function (req, res, next) {
    model.remove({ _id: req.params.id }, function (err, doc) {
      if (err) {
        res.handleError(err);
      } else {
        if (!doc) {
          res.noContent(doc);
        } else {
          res.ok(removeReservedKeys(doc));
        }
      }
    });
  };
}

function parseOptions (options) {
  return options;
}

module.exports = function (model, defaultOptions) {
  defaultOptions = parseOptions(defaultOptions);
  return {
    list: function (options, callback) {
      return list(model, options, callback);
    },
    read: function (options, callback) {
      return read(model, options, callback);
    },
    create: function (options, callback) {
      return create(model, options, callback);
    },
    update:  function (options, callback) {
      return update(model, options, callback);
    },
    destroy: function (options, callback) {
      return destroy(model, options, callback);
    }
  };
};
