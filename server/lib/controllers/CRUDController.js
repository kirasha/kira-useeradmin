'use strict';

var _               = require('lodash'),
    urlParser       = require('url'),
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

function countAll (model, restQuery) {
  var query = Object.create(restQuery);
  if (query.pagination) {
    delete query.pagination;
  }
  return model.count(query);
}

function builPaginationUrl (pageNumber, originalUrl) {
  // http://localhost:9000/users?filters=location=='MA'&page=2&size=5
  pageNumber = parseInt(pageNumber, 10) || 1;
  var parsedUrl = urlParser.parse(originalUrl, true);
  parsedUrl.query.page = pageNumber;
  parsedUrl.search = null;
  return urlParser.format(parsedUrl);
}

function formatLinks (all, pagination, originalUrl) {
  pagination.page = pagination.page || 1;
  pagination.size = pagination.size || 30;

  var lastPage = Math.ceil(all / pagination.size);
  var pagingMetaData = {};

  // can have first
  if (pagination.page > 1) {
    pagingMetaData.first = builPaginationUrl(1, originalUrl);
  }

  // can have previous
  if (pagination.page > 1) {
    pagingMetaData.previous = builPaginationUrl(pagination.page - 1, originalUrl);
  }

  // can have next
  if (pagination.page < lastPage) {
    pagingMetaData.next = builPaginationUrl(pagination.page + 1, originalUrl);
  }

  // can have last
  if (pagination.page  < lastPage) {
    pagingMetaData.last = builPaginationUrl(lastPage, originalUrl);
  }

  return pagingMetaData;
}

function list (model, options, callback) {
  return function (req, res, next) {
    req.restQuery.fields = getFields(req);
    var restQuery = req.restQuery;
    model.filter(restQuery)
      .then(function (docs) {
        if (!docs) {
          res.noContent(docs);
        } else {
          countAll(model, restQuery)
          .then(function (allCount) {
            docs = docs.map(removeReservedKeys);
            var links = formatLinks(allCount, restQuery.pagination, req.originalUrl);
            res.ok(docs, { links: links });
          })
          .catch(function (err) {
            res.handleError(err);
          });
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
