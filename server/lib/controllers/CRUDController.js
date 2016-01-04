'use strict';

var _               = require('lodash'),
    mongoose        = require('mongoose'),
    urlParser       = require('url'),
    defaultOptions  = {};

defaultOptions.omitted = ['_id', '__v'].concat(Object.keys(mongoose.Schema.reserved));

defaultOptions.fields = ['id','name','createdAt', 'updatedAt','href'];

function getFields (req) {
  // make a copy instead of a reference to avoid side effects
  var defaultFields = JSON.parse(JSON.stringify(defaultOptions.fields));
  return req.restQuery.fields || defaultFields;
}

function isValidMongooseId (id) {
  return mongoose.Types.ObjectId.isValid(id) && /^[a-fA-F0-9]{24}$/.test(id);
}

function removeReserved (keys) {
  return keys.filter(function (key) {
    return !_.includes(defaultOptions.omitted, key);
  });
}

function cleanUpData (model, data) {
  var expectedProperties = removeReserved(Object.keys(model.schema.paths));
  return _.pick(data, expectedProperties);
}

function getErrorMessage (error) {

  var errorMessage = {
    code: 400 | error.code,
    name: error.name,
    message: error.message
  };

  delete error.stack;

  var fields = Object.keys(error.errors);

  if (!fields) {
    return errorMessage;
  }

  var parseError = function (field) {
    var errors = error.errors;
    var fieldError = errors[field];
    var devMsg = fieldError.message + '. Current values is ' + fieldError.value;
    var customMessage = {
      field: fieldError.path,
      value: fieldError.value,
      type: fieldError.name,
      message: fieldError.message,
      developerMessage: devMsg
    };

    return customMessage;
  };

  var customMessages = fields.map(parseError);

  errorMessage.errors = customMessages;

  return errorMessage;
}

function defaultEmbed (queryParams) {

  if (queryParams && queryParams.embed) {
    var tobeEmbeded = queryParams.embed;
    tobeEmbeded.forEach(function (el) {
      var field = el.split('.')[0];
      if (queryParams.fields.indexOf(field) === -1) {
        queryParams.fields.push(field);
      }
    });

    tobeEmbeded = queryParams.embed.sort();
    // TODO make sure this works for multiple documents to embed
    tobeEmbeded = tobeEmbeded.map(function (el) {
      if (el.indexOf('.') === -1) {
        el = defaultOptions.fields.map(function (field) {
          return el.trim() + '.' + field.trim();
        });
      } else {
        el.trim();
      }
      return el;
    });
    tobeEmbeded = _.flatten(tobeEmbeded);
    queryParams.embed = tobeEmbeded;
  }

  return queryParams;
}

function countAll (model, restQuery) {
  var query = Object.create(restQuery);
  if (query.pagination) {
    delete query.pagination;
  }
  return model.count(query);
}

function builPaginationUrl (pageNumber, originalUrl) {
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
    var restQuery = defaultEmbed(req.restQuery);
    var docsPromise = model.filter(restQuery);
    var countsPromis = countAll(model, restQuery);
    Promise.all([docsPromise, countsPromis]).then(function (promises) {
      var docs = promises[0];
      var allCounts = promises[1];
      var links = formatLinks(allCounts, restQuery.pagination, req.originalUrl);
      res.ok(docs, { links: links });
    })
    .catch(function (err) {
      res.handleError(err);
    });
  };
}

function read (model, options, callback) {
  return function (req, res, next) {
    var id = req.params.id;
    if (!isValidMongooseId(id)) {
      var message = {
        code: 400,
        name: 'ValidationError',
        message: id + ' is not a valid Id',
        errors: [
          {
            field: 'id',
            value: id,
            type: 'ValidatorError',
            message: 'Invalid id',
            developerMessage: 'A valid id is 12 Character long and must follow the following pattern ^[a-fA-F0-9]{24}$'
          }
        ]
      };
      return res.badRequest(message);
    }

    model.findOne({ _id: req.params.id }, function (err, doc) {
      if (err) {
        res.handleError(err);
      } else {
        if (!doc) {
          res.notFound(doc);
        } else {
          res.ok(doc);
        }
      }
    });
  };
}

function create (Model, options, callback) {
  return function (req, res, next)  {
    var data = cleanUpData(Model, req.body);
    var model = new Model(data);
    model.save(function (err, doc) {
      if (err) {
        var errorMessage = getErrorMessage(err);
        res.handleError(errorMessage);
      } else {
        if (!doc) {
          res.noContent(doc);
        } else {
          res.ok(doc);
        }
      }
    });
  };
}

function update (model, options, callback) {
  return function (req, res, next) {
    var updatedDoc = cleanUpData(model, req.body);
    model.findOneAndUpdate({ _id: req.params.id }, updatedDoc, { new: true }, function (err, doc) {
      if (err) {
        var errorMessage = getErrorMessage(err);
        res.handleError(errorMessage);
      } else {
        if (!doc) {
          res.noContent(doc);
        } else {
          res.ok(doc);
        }
      }
    });
  };
}

function destroy (model, options, callback) {
  return function (req, res, next) {
    model.remove({ _id: req.params.id }, function (err, doc) {
      if (err) {
        var errorMessage = getErrorMessage(err);
        res.handleError(errorMessage);
      } else {
        if (!doc.result.n) {
          res.notFound();
        } else {
          res.noContent();
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
