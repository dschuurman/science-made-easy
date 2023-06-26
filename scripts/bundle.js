(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * lunr - http://lunrjs.com - A bit like Solr, but much smaller and not as bright - 2.3.6
 * Copyright (C) 2019 Oliver Nightingale
 * @license MIT
 */

;(function(){

/**
 * A convenience function for configuring and constructing
 * a new lunr Index.
 *
 * A lunr.Builder instance is created and the pipeline setup
 * with a trimmer, stop word filter and stemmer.
 *
 * This builder object is yielded to the configuration function
 * that is passed as a parameter, allowing the list of fields
 * and other builder parameters to be customised.
 *
 * All documents _must_ be added within the passed config function.
 *
 * @example
 * var idx = lunr(function () {
 *   this.field('title')
 *   this.field('body')
 *   this.ref('id')
 *
 *   documents.forEach(function (doc) {
 *     this.add(doc)
 *   }, this)
 * })
 *
 * @see {@link lunr.Builder}
 * @see {@link lunr.Pipeline}
 * @see {@link lunr.trimmer}
 * @see {@link lunr.stopWordFilter}
 * @see {@link lunr.stemmer}
 * @namespace {function} lunr
 */
var lunr = function (config) {
  var builder = new lunr.Builder

  builder.pipeline.add(
    lunr.trimmer,
    lunr.stopWordFilter,
    lunr.stemmer
  )

  builder.searchPipeline.add(
    lunr.stemmer
  )

  config.call(builder, builder)
  return builder.build()
}

lunr.version = "2.3.6"
/*!
 * lunr.utils
 * Copyright (C) 2019 Oliver Nightingale
 */

/**
 * A namespace containing utils for the rest of the lunr library
 * @namespace lunr.utils
 */
lunr.utils = {}

/**
 * Print a warning message to the console.
 *
 * @param {String} message The message to be printed.
 * @memberOf lunr.utils
 * @function
 */
lunr.utils.warn = (function (global) {
  /* eslint-disable no-console */
  return function (message) {
    if (global.console && console.warn) {
      console.warn(message)
    }
  }
  /* eslint-enable no-console */
})(this)

/**
 * Convert an object to a string.
 *
 * In the case of `null` and `undefined` the function returns
 * the empty string, in all other cases the result of calling
 * `toString` on the passed object is returned.
 *
 * @param {Any} obj The object to convert to a string.
 * @return {String} string representation of the passed object.
 * @memberOf lunr.utils
 */
lunr.utils.asString = function (obj) {
  if (obj === void 0 || obj === null) {
    return ""
  } else {
    return obj.toString()
  }
}

/**
 * Clones an object.
 *
 * Will create a copy of an existing object such that any mutations
 * on the copy cannot affect the original.
 *
 * Only shallow objects are supported, passing a nested object to this
 * function will cause a TypeError.
 *
 * Objects with primitives, and arrays of primitives are supported.
 *
 * @param {Object} obj The object to clone.
 * @return {Object} a clone of the passed object.
 * @throws {TypeError} when a nested object is passed.
 * @memberOf Utils
 */
lunr.utils.clone = function (obj) {
  if (obj === null || obj === undefined) {
    return obj
  }

  var clone = Object.create(null),
      keys = Object.keys(obj)

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i],
        val = obj[key]

    if (Array.isArray(val)) {
      clone[key] = val.slice()
      continue
    }

    if (typeof val === 'string' ||
        typeof val === 'number' ||
        typeof val === 'boolean') {
      clone[key] = val
      continue
    }

    throw new TypeError("clone is not deep and does not support nested objects")
  }

  return clone
}
lunr.FieldRef = function (docRef, fieldName, stringValue) {
  this.docRef = docRef
  this.fieldName = fieldName
  this._stringValue = stringValue
}

lunr.FieldRef.joiner = "/"

lunr.FieldRef.fromString = function (s) {
  var n = s.indexOf(lunr.FieldRef.joiner)

  if (n === -1) {
    throw "malformed field ref string"
  }

  var fieldRef = s.slice(0, n),
      docRef = s.slice(n + 1)

  return new lunr.FieldRef (docRef, fieldRef, s)
}

lunr.FieldRef.prototype.toString = function () {
  if (this._stringValue == undefined) {
    this._stringValue = this.fieldName + lunr.FieldRef.joiner + this.docRef
  }

  return this._stringValue
}
/*!
 * lunr.Set
 * Copyright (C) 2019 Oliver Nightingale
 */

/**
 * A lunr set.
 *
 * @constructor
 */
lunr.Set = function (elements) {
  this.elements = Object.create(null)

  if (elements) {
    this.length = elements.length

    for (var i = 0; i < this.length; i++) {
      this.elements[elements[i]] = true
    }
  } else {
    this.length = 0
  }
}

/**
 * A complete set that contains all elements.
 *
 * @static
 * @readonly
 * @type {lunr.Set}
 */
lunr.Set.complete = {
  intersect: function (other) {
    return other
  },

  union: function (other) {
    return other
  },

  contains: function () {
    return true
  }
}

/**
 * An empty set that contains no elements.
 *
 * @static
 * @readonly
 * @type {lunr.Set}
 */
lunr.Set.empty = {
  intersect: function () {
    return this
  },

  union: function (other) {
    return other
  },

  contains: function () {
    return false
  }
}

/**
 * Returns true if this set contains the specified object.
 *
 * @param {object} object - Object whose presence in this set is to be tested.
 * @returns {boolean} - True if this set contains the specified object.
 */
lunr.Set.prototype.contains = function (object) {
  return !!this.elements[object]
}

/**
 * Returns a new set containing only the elements that are present in both
 * this set and the specified set.
 *
 * @param {lunr.Set} other - set to intersect with this set.
 * @returns {lunr.Set} a new set that is the intersection of this and the specified set.
 */

lunr.Set.prototype.intersect = function (other) {
  var a, b, elements, intersection = []

  if (other === lunr.Set.complete) {
    return this
  }

  if (other === lunr.Set.empty) {
    return other
  }

  if (this.length < other.length) {
    a = this
    b = other
  } else {
    a = other
    b = this
  }

  elements = Object.keys(a.elements)

  for (var i = 0; i < elements.length; i++) {
    var element = elements[i]
    if (element in b.elements) {
      intersection.push(element)
    }
  }

  return new lunr.Set (intersection)
}

/**
 * Returns a new set combining the elements of this and the specified set.
 *
 * @param {lunr.Set} other - set to union with this set.
 * @return {lunr.Set} a new set that is the union of this and the specified set.
 */

lunr.Set.prototype.union = function (other) {
  if (other === lunr.Set.complete) {
    return lunr.Set.complete
  }

  if (other === lunr.Set.empty) {
    return this
  }

  return new lunr.Set(Object.keys(this.elements).concat(Object.keys(other.elements)))
}
/**
 * A function to calculate the inverse document frequency for
 * a posting. This is shared between the builder and the index
 *
 * @private
 * @param {object} posting - The posting for a given term
 * @param {number} documentCount - The total number of documents.
 */
lunr.idf = function (posting, documentCount) {
  var documentsWithTerm = 0

  for (var fieldName in posting) {
    if (fieldName == '_index') continue // Ignore the term index, its not a field
    documentsWithTerm += Object.keys(posting[fieldName]).length
  }

  var x = (documentCount - documentsWithTerm + 0.5) / (documentsWithTerm + 0.5)

  return Math.log(1 + Math.abs(x))
}

/**
 * A token wraps a string representation of a token
 * as it is passed through the text processing pipeline.
 *
 * @constructor
 * @param {string} [str=''] - The string token being wrapped.
 * @param {object} [metadata={}] - Metadata associated with this token.
 */
lunr.Token = function (str, metadata) {
  this.str = str || ""
  this.metadata = metadata || {}
}

/**
 * Returns the token string that is being wrapped by this object.
 *
 * @returns {string}
 */
lunr.Token.prototype.toString = function () {
  return this.str
}

/**
 * A token update function is used when updating or optionally
 * when cloning a token.
 *
 * @callback lunr.Token~updateFunction
 * @param {string} str - The string representation of the token.
 * @param {Object} metadata - All metadata associated with this token.
 */

/**
 * Applies the given function to the wrapped string token.
 *
 * @example
 * token.update(function (str, metadata) {
 *   return str.toUpperCase()
 * })
 *
 * @param {lunr.Token~updateFunction} fn - A function to apply to the token string.
 * @returns {lunr.Token}
 */
lunr.Token.prototype.update = function (fn) {
  this.str = fn(this.str, this.metadata)
  return this
}

/**
 * Creates a clone of this token. Optionally a function can be
 * applied to the cloned token.
 *
 * @param {lunr.Token~updateFunction} [fn] - An optional function to apply to the cloned token.
 * @returns {lunr.Token}
 */
lunr.Token.prototype.clone = function (fn) {
  fn = fn || function (s) { return s }
  return new lunr.Token (fn(this.str, this.metadata), this.metadata)
}
/*!
 * lunr.tokenizer
 * Copyright (C) 2019 Oliver Nightingale
 */

/**
 * A function for splitting a string into tokens ready to be inserted into
 * the search index. Uses `lunr.tokenizer.separator` to split strings, change
 * the value of this property to change how strings are split into tokens.
 *
 * This tokenizer will convert its parameter to a string by calling `toString` and
 * then will split this string on the character in `lunr.tokenizer.separator`.
 * Arrays will have their elements converted to strings and wrapped in a lunr.Token.
 *
 * Optional metadata can be passed to the tokenizer, this metadata will be cloned and
 * added as metadata to every token that is created from the object to be tokenized.
 *
 * @static
 * @param {?(string|object|object[])} obj - The object to convert into tokens
 * @param {?object} metadata - Optional metadata to associate with every token
 * @returns {lunr.Token[]}
 * @see {@link lunr.Pipeline}
 */
lunr.tokenizer = function (obj, metadata) {
  if (obj == null || obj == undefined) {
    return []
  }

  if (Array.isArray(obj)) {
    return obj.map(function (t) {
      return new lunr.Token(
        lunr.utils.asString(t).toLowerCase(),
        lunr.utils.clone(metadata)
      )
    })
  }

  var str = obj.toString().trim().toLowerCase(),
      len = str.length,
      tokens = []

  for (var sliceEnd = 0, sliceStart = 0; sliceEnd <= len; sliceEnd++) {
    var char = str.charAt(sliceEnd),
        sliceLength = sliceEnd - sliceStart

    if ((char.match(lunr.tokenizer.separator) || sliceEnd == len)) {

      if (sliceLength > 0) {
        var tokenMetadata = lunr.utils.clone(metadata) || {}
        tokenMetadata["position"] = [sliceStart, sliceLength]
        tokenMetadata["index"] = tokens.length

        tokens.push(
          new lunr.Token (
            str.slice(sliceStart, sliceEnd),
            tokenMetadata
          )
        )
      }

      sliceStart = sliceEnd + 1
    }

  }

  return tokens
}

/**
 * The separator used to split a string into tokens. Override this property to change the behaviour of
 * `lunr.tokenizer` behaviour when tokenizing strings. By default this splits on whitespace and hyphens.
 *
 * @static
 * @see lunr.tokenizer
 */
lunr.tokenizer.separator = /[\s\-]+/
/*!
 * lunr.Pipeline
 * Copyright (C) 2019 Oliver Nightingale
 */

/**
 * lunr.Pipelines maintain an ordered list of functions to be applied to all
 * tokens in documents entering the search index and queries being ran against
 * the index.
 *
 * An instance of lunr.Index created with the lunr shortcut will contain a
 * pipeline with a stop word filter and an English language stemmer. Extra
 * functions can be added before or after either of these functions or these
 * default functions can be removed.
 *
 * When run the pipeline will call each function in turn, passing a token, the
 * index of that token in the original list of all tokens and finally a list of
 * all the original tokens.
 *
 * The output of functions in the pipeline will be passed to the next function
 * in the pipeline. To exclude a token from entering the index the function
 * should return undefined, the rest of the pipeline will not be called with
 * this token.
 *
 * For serialisation of pipelines to work, all functions used in an instance of
 * a pipeline should be registered with lunr.Pipeline. Registered functions can
 * then be loaded. If trying to load a serialised pipeline that uses functions
 * that are not registered an error will be thrown.
 *
 * If not planning on serialising the pipeline then registering pipeline functions
 * is not necessary.
 *
 * @constructor
 */
lunr.Pipeline = function () {
  this._stack = []
}

lunr.Pipeline.registeredFunctions = Object.create(null)

/**
 * A pipeline function maps lunr.Token to lunr.Token. A lunr.Token contains the token
 * string as well as all known metadata. A pipeline function can mutate the token string
 * or mutate (or add) metadata for a given token.
 *
 * A pipeline function can indicate that the passed token should be discarded by returning
 * null. This token will not be passed to any downstream pipeline functions and will not be
 * added to the index.
 *
 * Multiple tokens can be returned by returning an array of tokens. Each token will be passed
 * to any downstream pipeline functions and all will returned tokens will be added to the index.
 *
 * Any number of pipeline functions may be chained together using a lunr.Pipeline.
 *
 * @interface lunr.PipelineFunction
 * @param {lunr.Token} token - A token from the document being processed.
 * @param {number} i - The index of this token in the complete list of tokens for this document/field.
 * @param {lunr.Token[]} tokens - All tokens for this document/field.
 * @returns {(?lunr.Token|lunr.Token[])}
 */

/**
 * Register a function with the pipeline.
 *
 * Functions that are used in the pipeline should be registered if the pipeline
 * needs to be serialised, or a serialised pipeline needs to be loaded.
 *
 * Registering a function does not add it to a pipeline, functions must still be
 * added to instances of the pipeline for them to be used when running a pipeline.
 *
 * @param {lunr.PipelineFunction} fn - The function to check for.
 * @param {String} label - The label to register this function with
 */
lunr.Pipeline.registerFunction = function (fn, label) {
  if (label in this.registeredFunctions) {
    lunr.utils.warn('Overwriting existing registered function: ' + label)
  }

  fn.label = label
  lunr.Pipeline.registeredFunctions[fn.label] = fn
}

/**
 * Warns if the function is not registered as a Pipeline function.
 *
 * @param {lunr.PipelineFunction} fn - The function to check for.
 * @private
 */
lunr.Pipeline.warnIfFunctionNotRegistered = function (fn) {
  var isRegistered = fn.label && (fn.label in this.registeredFunctions)

  if (!isRegistered) {
    lunr.utils.warn('Function is not registered with pipeline. This may cause problems when serialising the index.\n', fn)
  }
}

/**
 * Loads a previously serialised pipeline.
 *
 * All functions to be loaded must already be registered with lunr.Pipeline.
 * If any function from the serialised data has not been registered then an
 * error will be thrown.
 *
 * @param {Object} serialised - The serialised pipeline to load.
 * @returns {lunr.Pipeline}
 */
lunr.Pipeline.load = function (serialised) {
  var pipeline = new lunr.Pipeline

  serialised.forEach(function (fnName) {
    var fn = lunr.Pipeline.registeredFunctions[fnName]

    if (fn) {
      pipeline.add(fn)
    } else {
      throw new Error('Cannot load unregistered function: ' + fnName)
    }
  })

  return pipeline
}

/**
 * Adds new functions to the end of the pipeline.
 *
 * Logs a warning if the function has not been registered.
 *
 * @param {lunr.PipelineFunction[]} functions - Any number of functions to add to the pipeline.
 */
lunr.Pipeline.prototype.add = function () {
  var fns = Array.prototype.slice.call(arguments)

  fns.forEach(function (fn) {
    lunr.Pipeline.warnIfFunctionNotRegistered(fn)
    this._stack.push(fn)
  }, this)
}

/**
 * Adds a single function after a function that already exists in the
 * pipeline.
 *
 * Logs a warning if the function has not been registered.
 *
 * @param {lunr.PipelineFunction} existingFn - A function that already exists in the pipeline.
 * @param {lunr.PipelineFunction} newFn - The new function to add to the pipeline.
 */
lunr.Pipeline.prototype.after = function (existingFn, newFn) {
  lunr.Pipeline.warnIfFunctionNotRegistered(newFn)

  var pos = this._stack.indexOf(existingFn)
  if (pos == -1) {
    throw new Error('Cannot find existingFn')
  }

  pos = pos + 1
  this._stack.splice(pos, 0, newFn)
}

/**
 * Adds a single function before a function that already exists in the
 * pipeline.
 *
 * Logs a warning if the function has not been registered.
 *
 * @param {lunr.PipelineFunction} existingFn - A function that already exists in the pipeline.
 * @param {lunr.PipelineFunction} newFn - The new function to add to the pipeline.
 */
lunr.Pipeline.prototype.before = function (existingFn, newFn) {
  lunr.Pipeline.warnIfFunctionNotRegistered(newFn)

  var pos = this._stack.indexOf(existingFn)
  if (pos == -1) {
    throw new Error('Cannot find existingFn')
  }

  this._stack.splice(pos, 0, newFn)
}

/**
 * Removes a function from the pipeline.
 *
 * @param {lunr.PipelineFunction} fn The function to remove from the pipeline.
 */
lunr.Pipeline.prototype.remove = function (fn) {
  var pos = this._stack.indexOf(fn)
  if (pos == -1) {
    return
  }

  this._stack.splice(pos, 1)
}

/**
 * Runs the current list of functions that make up the pipeline against the
 * passed tokens.
 *
 * @param {Array} tokens The tokens to run through the pipeline.
 * @returns {Array}
 */
lunr.Pipeline.prototype.run = function (tokens) {
  var stackLength = this._stack.length

  for (var i = 0; i < stackLength; i++) {
    var fn = this._stack[i]
    var memo = []

    for (var j = 0; j < tokens.length; j++) {
      var result = fn(tokens[j], j, tokens)

      if (result === void 0 || result === '') continue

      if (Array.isArray(result)) {
        for (var k = 0; k < result.length; k++) {
          memo.push(result[k])
        }
      } else {
        memo.push(result)
      }
    }

    tokens = memo
  }

  return tokens
}

/**
 * Convenience method for passing a string through a pipeline and getting
 * strings out. This method takes care of wrapping the passed string in a
 * token and mapping the resulting tokens back to strings.
 *
 * @param {string} str - The string to pass through the pipeline.
 * @param {?object} metadata - Optional metadata to associate with the token
 * passed to the pipeline.
 * @returns {string[]}
 */
lunr.Pipeline.prototype.runString = function (str, metadata) {
  var token = new lunr.Token (str, metadata)

  return this.run([token]).map(function (t) {
    return t.toString()
  })
}

/**
 * Resets the pipeline by removing any existing processors.
 *
 */
lunr.Pipeline.prototype.reset = function () {
  this._stack = []
}

/**
 * Returns a representation of the pipeline ready for serialisation.
 *
 * Logs a warning if the function has not been registered.
 *
 * @returns {Array}
 */
lunr.Pipeline.prototype.toJSON = function () {
  return this._stack.map(function (fn) {
    lunr.Pipeline.warnIfFunctionNotRegistered(fn)

    return fn.label
  })
}
/*!
 * lunr.Vector
 * Copyright (C) 2019 Oliver Nightingale
 */

/**
 * A vector is used to construct the vector space of documents and queries. These
 * vectors support operations to determine the similarity between two documents or
 * a document and a query.
 *
 * Normally no parameters are required for initializing a vector, but in the case of
 * loading a previously dumped vector the raw elements can be provided to the constructor.
 *
 * For performance reasons vectors are implemented with a flat array, where an elements
 * index is immediately followed by its value. E.g. [index, value, index, value]. This
 * allows the underlying array to be as sparse as possible and still offer decent
 * performance when being used for vector calculations.
 *
 * @constructor
 * @param {Number[]} [elements] - The flat list of element index and element value pairs.
 */
lunr.Vector = function (elements) {
  this._magnitude = 0
  this.elements = elements || []
}


/**
 * Calculates the position within the vector to insert a given index.
 *
 * This is used internally by insert and upsert. If there are duplicate indexes then
 * the position is returned as if the value for that index were to be updated, but it
 * is the callers responsibility to check whether there is a duplicate at that index
 *
 * @param {Number} insertIdx - The index at which the element should be inserted.
 * @returns {Number}
 */
lunr.Vector.prototype.positionForIndex = function (index) {
  // For an empty vector the tuple can be inserted at the beginning
  if (this.elements.length == 0) {
    return 0
  }

  var start = 0,
      end = this.elements.length / 2,
      sliceLength = end - start,
      pivotPoint = Math.floor(sliceLength / 2),
      pivotIndex = this.elements[pivotPoint * 2]

  while (sliceLength > 1) {
    if (pivotIndex < index) {
      start = pivotPoint
    }

    if (pivotIndex > index) {
      end = pivotPoint
    }

    if (pivotIndex == index) {
      break
    }

    sliceLength = end - start
    pivotPoint = start + Math.floor(sliceLength / 2)
    pivotIndex = this.elements[pivotPoint * 2]
  }

  if (pivotIndex == index) {
    return pivotPoint * 2
  }

  if (pivotIndex > index) {
    return pivotPoint * 2
  }

  if (pivotIndex < index) {
    return (pivotPoint + 1) * 2
  }
}

/**
 * Inserts an element at an index within the vector.
 *
 * Does not allow duplicates, will throw an error if there is already an entry
 * for this index.
 *
 * @param {Number} insertIdx - The index at which the element should be inserted.
 * @param {Number} val - The value to be inserted into the vector.
 */
lunr.Vector.prototype.insert = function (insertIdx, val) {
  this.upsert(insertIdx, val, function () {
    throw "duplicate index"
  })
}

/**
 * Inserts or updates an existing index within the vector.
 *
 * @param {Number} insertIdx - The index at which the element should be inserted.
 * @param {Number} val - The value to be inserted into the vector.
 * @param {function} fn - A function that is called for updates, the existing value and the
 * requested value are passed as arguments
 */
lunr.Vector.prototype.upsert = function (insertIdx, val, fn) {
  this._magnitude = 0
  var position = this.positionForIndex(insertIdx)

  if (this.elements[position] == insertIdx) {
    this.elements[position + 1] = fn(this.elements[position + 1], val)
  } else {
    this.elements.splice(position, 0, insertIdx, val)
  }
}

/**
 * Calculates the magnitude of this vector.
 *
 * @returns {Number}
 */
lunr.Vector.prototype.magnitude = function () {
  if (this._magnitude) return this._magnitude

  var sumOfSquares = 0,
      elementsLength = this.elements.length

  for (var i = 1; i < elementsLength; i += 2) {
    var val = this.elements[i]
    sumOfSquares += val * val
  }

  return this._magnitude = Math.sqrt(sumOfSquares)
}

/**
 * Calculates the dot product of this vector and another vector.
 *
 * @param {lunr.Vector} otherVector - The vector to compute the dot product with.
 * @returns {Number}
 */
lunr.Vector.prototype.dot = function (otherVector) {
  var dotProduct = 0,
      a = this.elements, b = otherVector.elements,
      aLen = a.length, bLen = b.length,
      aVal = 0, bVal = 0,
      i = 0, j = 0

  while (i < aLen && j < bLen) {
    aVal = a[i], bVal = b[j]
    if (aVal < bVal) {
      i += 2
    } else if (aVal > bVal) {
      j += 2
    } else if (aVal == bVal) {
      dotProduct += a[i + 1] * b[j + 1]
      i += 2
      j += 2
    }
  }

  return dotProduct
}

/**
 * Calculates the similarity between this vector and another vector.
 *
 * @param {lunr.Vector} otherVector - The other vector to calculate the
 * similarity with.
 * @returns {Number}
 */
lunr.Vector.prototype.similarity = function (otherVector) {
  return this.dot(otherVector) / this.magnitude() || 0
}

/**
 * Converts the vector to an array of the elements within the vector.
 *
 * @returns {Number[]}
 */
lunr.Vector.prototype.toArray = function () {
  var output = new Array (this.elements.length / 2)

  for (var i = 1, j = 0; i < this.elements.length; i += 2, j++) {
    output[j] = this.elements[i]
  }

  return output
}

/**
 * A JSON serializable representation of the vector.
 *
 * @returns {Number[]}
 */
lunr.Vector.prototype.toJSON = function () {
  return this.elements
}
/* eslint-disable */
/*!
 * lunr.stemmer
 * Copyright (C) 2019 Oliver Nightingale
 * Includes code from - http://tartarus.org/~martin/PorterStemmer/js.txt
 */

/**
 * lunr.stemmer is an english language stemmer, this is a JavaScript
 * implementation of the PorterStemmer taken from http://tartarus.org/~martin
 *
 * @static
 * @implements {lunr.PipelineFunction}
 * @param {lunr.Token} token - The string to stem
 * @returns {lunr.Token}
 * @see {@link lunr.Pipeline}
 * @function
 */
lunr.stemmer = (function(){
  var step2list = {
      "ational" : "ate",
      "tional" : "tion",
      "enci" : "ence",
      "anci" : "ance",
      "izer" : "ize",
      "bli" : "ble",
      "alli" : "al",
      "entli" : "ent",
      "eli" : "e",
      "ousli" : "ous",
      "ization" : "ize",
      "ation" : "ate",
      "ator" : "ate",
      "alism" : "al",
      "iveness" : "ive",
      "fulness" : "ful",
      "ousness" : "ous",
      "aliti" : "al",
      "iviti" : "ive",
      "biliti" : "ble",
      "logi" : "log"
    },

    step3list = {
      "icate" : "ic",
      "ative" : "",
      "alize" : "al",
      "iciti" : "ic",
      "ical" : "ic",
      "ful" : "",
      "ness" : ""
    },

    c = "[^aeiou]",          // consonant
    v = "[aeiouy]",          // vowel
    C = c + "[^aeiouy]*",    // consonant sequence
    V = v + "[aeiou]*",      // vowel sequence

    mgr0 = "^(" + C + ")?" + V + C,               // [C]VC... is m>0
    meq1 = "^(" + C + ")?" + V + C + "(" + V + ")?$",  // [C]VC[V] is m=1
    mgr1 = "^(" + C + ")?" + V + C + V + C,       // [C]VCVC... is m>1
    s_v = "^(" + C + ")?" + v;                   // vowel in stem

  var re_mgr0 = new RegExp(mgr0);
  var re_mgr1 = new RegExp(mgr1);
  var re_meq1 = new RegExp(meq1);
  var re_s_v = new RegExp(s_v);

  var re_1a = /^(.+?)(ss|i)es$/;
  var re2_1a = /^(.+?)([^s])s$/;
  var re_1b = /^(.+?)eed$/;
  var re2_1b = /^(.+?)(ed|ing)$/;
  var re_1b_2 = /.$/;
  var re2_1b_2 = /(at|bl|iz)$/;
  var re3_1b_2 = new RegExp("([^aeiouylsz])\\1$");
  var re4_1b_2 = new RegExp("^" + C + v + "[^aeiouwxy]$");

  var re_1c = /^(.+?[^aeiou])y$/;
  var re_2 = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;

  var re_3 = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;

  var re_4 = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
  var re2_4 = /^(.+?)(s|t)(ion)$/;

  var re_5 = /^(.+?)e$/;
  var re_5_1 = /ll$/;
  var re3_5 = new RegExp("^" + C + v + "[^aeiouwxy]$");

  var porterStemmer = function porterStemmer(w) {
    var stem,
      suffix,
      firstch,
      re,
      re2,
      re3,
      re4;

    if (w.length < 3) { return w; }

    firstch = w.substr(0,1);
    if (firstch == "y") {
      w = firstch.toUpperCase() + w.substr(1);
    }

    // Step 1a
    re = re_1a
    re2 = re2_1a;

    if (re.test(w)) { w = w.replace(re,"$1$2"); }
    else if (re2.test(w)) { w = w.replace(re2,"$1$2"); }

    // Step 1b
    re = re_1b;
    re2 = re2_1b;
    if (re.test(w)) {
      var fp = re.exec(w);
      re = re_mgr0;
      if (re.test(fp[1])) {
        re = re_1b_2;
        w = w.replace(re,"");
      }
    } else if (re2.test(w)) {
      var fp = re2.exec(w);
      stem = fp[1];
      re2 = re_s_v;
      if (re2.test(stem)) {
        w = stem;
        re2 = re2_1b_2;
        re3 = re3_1b_2;
        re4 = re4_1b_2;
        if (re2.test(w)) { w = w + "e"; }
        else if (re3.test(w)) { re = re_1b_2; w = w.replace(re,""); }
        else if (re4.test(w)) { w = w + "e"; }
      }
    }

    // Step 1c - replace suffix y or Y by i if preceded by a non-vowel which is not the first letter of the word (so cry -> cri, by -> by, say -> say)
    re = re_1c;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      w = stem + "i";
    }

    // Step 2
    re = re_2;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      suffix = fp[2];
      re = re_mgr0;
      if (re.test(stem)) {
        w = stem + step2list[suffix];
      }
    }

    // Step 3
    re = re_3;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      suffix = fp[2];
      re = re_mgr0;
      if (re.test(stem)) {
        w = stem + step3list[suffix];
      }
    }

    // Step 4
    re = re_4;
    re2 = re2_4;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      re = re_mgr1;
      if (re.test(stem)) {
        w = stem;
      }
    } else if (re2.test(w)) {
      var fp = re2.exec(w);
      stem = fp[1] + fp[2];
      re2 = re_mgr1;
      if (re2.test(stem)) {
        w = stem;
      }
    }

    // Step 5
    re = re_5;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      re = re_mgr1;
      re2 = re_meq1;
      re3 = re3_5;
      if (re.test(stem) || (re2.test(stem) && !(re3.test(stem)))) {
        w = stem;
      }
    }

    re = re_5_1;
    re2 = re_mgr1;
    if (re.test(w) && re2.test(w)) {
      re = re_1b_2;
      w = w.replace(re,"");
    }

    // and turn initial Y back to y

    if (firstch == "y") {
      w = firstch.toLowerCase() + w.substr(1);
    }

    return w;
  };

  return function (token) {
    return token.update(porterStemmer);
  }
})();

lunr.Pipeline.registerFunction(lunr.stemmer, 'stemmer')
/*!
 * lunr.stopWordFilter
 * Copyright (C) 2019 Oliver Nightingale
 */

/**
 * lunr.generateStopWordFilter builds a stopWordFilter function from the provided
 * list of stop words.
 *
 * The built in lunr.stopWordFilter is built using this generator and can be used
 * to generate custom stopWordFilters for applications or non English languages.
 *
 * @function
 * @param {Array} token The token to pass through the filter
 * @returns {lunr.PipelineFunction}
 * @see lunr.Pipeline
 * @see lunr.stopWordFilter
 */
lunr.generateStopWordFilter = function (stopWords) {
  var words = stopWords.reduce(function (memo, stopWord) {
    memo[stopWord] = stopWord
    return memo
  }, {})

  return function (token) {
    if (token && words[token.toString()] !== token.toString()) return token
  }
}

/**
 * lunr.stopWordFilter is an English language stop word list filter, any words
 * contained in the list will not be passed through the filter.
 *
 * This is intended to be used in the Pipeline. If the token does not pass the
 * filter then undefined will be returned.
 *
 * @function
 * @implements {lunr.PipelineFunction}
 * @params {lunr.Token} token - A token to check for being a stop word.
 * @returns {lunr.Token}
 * @see {@link lunr.Pipeline}
 */
lunr.stopWordFilter = lunr.generateStopWordFilter([
  'a',
  'able',
  'about',
  'across',
  'after',
  'all',
  'almost',
  'also',
  'am',
  'among',
  'an',
  'and',
  'any',
  'are',
  'as',
  'at',
  'be',
  'because',
  'been',
  'but',
  'by',
  'can',
  'cannot',
  'could',
  'dear',
  'did',
  'do',
  'does',
  'either',
  'else',
  'ever',
  'every',
  'for',
  'from',
  'get',
  'got',
  'had',
  'has',
  'have',
  'he',
  'her',
  'hers',
  'him',
  'his',
  'how',
  'however',
  'i',
  'if',
  'in',
  'into',
  'is',
  'it',
  'its',
  'just',
  'least',
  'let',
  'like',
  'likely',
  'may',
  'me',
  'might',
  'most',
  'must',
  'my',
  'neither',
  'no',
  'nor',
  'not',
  'of',
  'off',
  'often',
  'on',
  'only',
  'or',
  'other',
  'our',
  'own',
  'rather',
  'said',
  'say',
  'says',
  'she',
  'should',
  'since',
  'so',
  'some',
  'than',
  'that',
  'the',
  'their',
  'them',
  'then',
  'there',
  'these',
  'they',
  'this',
  'tis',
  'to',
  'too',
  'twas',
  'us',
  'wants',
  'was',
  'we',
  'were',
  'what',
  'when',
  'where',
  'which',
  'while',
  'who',
  'whom',
  'why',
  'will',
  'with',
  'would',
  'yet',
  'you',
  'your'
])

lunr.Pipeline.registerFunction(lunr.stopWordFilter, 'stopWordFilter')
/*!
 * lunr.trimmer
 * Copyright (C) 2019 Oliver Nightingale
 */

/**
 * lunr.trimmer is a pipeline function for trimming non word
 * characters from the beginning and end of tokens before they
 * enter the index.
 *
 * This implementation may not work correctly for non latin
 * characters and should either be removed or adapted for use
 * with languages with non-latin characters.
 *
 * @static
 * @implements {lunr.PipelineFunction}
 * @param {lunr.Token} token The token to pass through the filter
 * @returns {lunr.Token}
 * @see lunr.Pipeline
 */
lunr.trimmer = function (token) {
  return token.update(function (s) {
    return s.replace(/^\W+/, '').replace(/\W+$/, '')
  })
}

lunr.Pipeline.registerFunction(lunr.trimmer, 'trimmer')
/*!
 * lunr.TokenSet
 * Copyright (C) 2019 Oliver Nightingale
 */

/**
 * A token set is used to store the unique list of all tokens
 * within an index. Token sets are also used to represent an
 * incoming query to the index, this query token set and index
 * token set are then intersected to find which tokens to look
 * up in the inverted index.
 *
 * A token set can hold multiple tokens, as in the case of the
 * index token set, or it can hold a single token as in the
 * case of a simple query token set.
 *
 * Additionally token sets are used to perform wildcard matching.
 * Leading, contained and trailing wildcards are supported, and
 * from this edit distance matching can also be provided.
 *
 * Token sets are implemented as a minimal finite state automata,
 * where both common prefixes and suffixes are shared between tokens.
 * This helps to reduce the space used for storing the token set.
 *
 * @constructor
 */
lunr.TokenSet = function () {
  this.final = false
  this.edges = {}
  this.id = lunr.TokenSet._nextId
  lunr.TokenSet._nextId += 1
}

/**
 * Keeps track of the next, auto increment, identifier to assign
 * to a new tokenSet.
 *
 * TokenSets require a unique identifier to be correctly minimised.
 *
 * @private
 */
lunr.TokenSet._nextId = 1

/**
 * Creates a TokenSet instance from the given sorted array of words.
 *
 * @param {String[]} arr - A sorted array of strings to create the set from.
 * @returns {lunr.TokenSet}
 * @throws Will throw an error if the input array is not sorted.
 */
lunr.TokenSet.fromArray = function (arr) {
  var builder = new lunr.TokenSet.Builder

  for (var i = 0, len = arr.length; i < len; i++) {
    builder.insert(arr[i])
  }

  builder.finish()
  return builder.root
}

/**
 * Creates a token set from a query clause.
 *
 * @private
 * @param {Object} clause - A single clause from lunr.Query.
 * @param {string} clause.term - The query clause term.
 * @param {number} [clause.editDistance] - The optional edit distance for the term.
 * @returns {lunr.TokenSet}
 */
lunr.TokenSet.fromClause = function (clause) {
  if ('editDistance' in clause) {
    return lunr.TokenSet.fromFuzzyString(clause.term, clause.editDistance)
  } else {
    return lunr.TokenSet.fromString(clause.term)
  }
}

/**
 * Creates a token set representing a single string with a specified
 * edit distance.
 *
 * Insertions, deletions, substitutions and transpositions are each
 * treated as an edit distance of 1.
 *
 * Increasing the allowed edit distance will have a dramatic impact
 * on the performance of both creating and intersecting these TokenSets.
 * It is advised to keep the edit distance less than 3.
 *
 * @param {string} str - The string to create the token set from.
 * @param {number} editDistance - The allowed edit distance to match.
 * @returns {lunr.Vector}
 */
lunr.TokenSet.fromFuzzyString = function (str, editDistance) {
  var root = new lunr.TokenSet

  var stack = [{
    node: root,
    editsRemaining: editDistance,
    str: str
  }]

  while (stack.length) {
    var frame = stack.pop()

    // no edit
    if (frame.str.length > 0) {
      var char = frame.str.charAt(0),
          noEditNode

      if (char in frame.node.edges) {
        noEditNode = frame.node.edges[char]
      } else {
        noEditNode = new lunr.TokenSet
        frame.node.edges[char] = noEditNode
      }

      if (frame.str.length == 1) {
        noEditNode.final = true
      }

      stack.push({
        node: noEditNode,
        editsRemaining: frame.editsRemaining,
        str: frame.str.slice(1)
      })
    }

    if (frame.editsRemaining == 0) {
      continue
    }

    // insertion
    if ("*" in frame.node.edges) {
      var insertionNode = frame.node.edges["*"]
    } else {
      var insertionNode = new lunr.TokenSet
      frame.node.edges["*"] = insertionNode
    }

    if (frame.str.length == 0) {
      insertionNode.final = true
    }

    stack.push({
      node: insertionNode,
      editsRemaining: frame.editsRemaining - 1,
      str: frame.str
    })

    // deletion
    // can only do a deletion if we have enough edits remaining
    // and if there are characters left to delete in the string
    if (frame.str.length > 1) {
      stack.push({
        node: frame.node,
        editsRemaining: frame.editsRemaining - 1,
        str: frame.str.slice(1)
      })
    }

    // deletion
    // just removing the last character from the str
    if (frame.str.length == 1) {
      frame.node.final = true
    }

    // substitution
    // can only do a substitution if we have enough edits remaining
    // and if there are characters left to substitute
    if (frame.str.length >= 1) {
      if ("*" in frame.node.edges) {
        var substitutionNode = frame.node.edges["*"]
      } else {
        var substitutionNode = new lunr.TokenSet
        frame.node.edges["*"] = substitutionNode
      }

      if (frame.str.length == 1) {
        substitutionNode.final = true
      }

      stack.push({
        node: substitutionNode,
        editsRemaining: frame.editsRemaining - 1,
        str: frame.str.slice(1)
      })
    }

    // transposition
    // can only do a transposition if there are edits remaining
    // and there are enough characters to transpose
    if (frame.str.length > 1) {
      var charA = frame.str.charAt(0),
          charB = frame.str.charAt(1),
          transposeNode

      if (charB in frame.node.edges) {
        transposeNode = frame.node.edges[charB]
      } else {
        transposeNode = new lunr.TokenSet
        frame.node.edges[charB] = transposeNode
      }

      if (frame.str.length == 1) {
        transposeNode.final = true
      }

      stack.push({
        node: transposeNode,
        editsRemaining: frame.editsRemaining - 1,
        str: charA + frame.str.slice(2)
      })
    }
  }

  return root
}

/**
 * Creates a TokenSet from a string.
 *
 * The string may contain one or more wildcard characters (*)
 * that will allow wildcard matching when intersecting with
 * another TokenSet.
 *
 * @param {string} str - The string to create a TokenSet from.
 * @returns {lunr.TokenSet}
 */
lunr.TokenSet.fromString = function (str) {
  var node = new lunr.TokenSet,
      root = node

  /*
   * Iterates through all characters within the passed string
   * appending a node for each character.
   *
   * When a wildcard character is found then a self
   * referencing edge is introduced to continually match
   * any number of any characters.
   */
  for (var i = 0, len = str.length; i < len; i++) {
    var char = str[i],
        final = (i == len - 1)

    if (char == "*") {
      node.edges[char] = node
      node.final = final

    } else {
      var next = new lunr.TokenSet
      next.final = final

      node.edges[char] = next
      node = next
    }
  }

  return root
}

/**
 * Converts this TokenSet into an array of strings
 * contained within the TokenSet.
 *
 * @returns {string[]}
 */
lunr.TokenSet.prototype.toArray = function () {
  var words = []

  var stack = [{
    prefix: "",
    node: this
  }]

  while (stack.length) {
    var frame = stack.pop(),
        edges = Object.keys(frame.node.edges),
        len = edges.length

    if (frame.node.final) {
      /* In Safari, at this point the prefix is sometimes corrupted, see:
       * https://github.com/olivernn/lunr.js/issues/279 Calling any
       * String.prototype method forces Safari to "cast" this string to what
       * it's supposed to be, fixing the bug. */
      frame.prefix.charAt(0)
      words.push(frame.prefix)
    }

    for (var i = 0; i < len; i++) {
      var edge = edges[i]

      stack.push({
        prefix: frame.prefix.concat(edge),
        node: frame.node.edges[edge]
      })
    }
  }

  return words
}

/**
 * Generates a string representation of a TokenSet.
 *
 * This is intended to allow TokenSets to be used as keys
 * in objects, largely to aid the construction and minimisation
 * of a TokenSet. As such it is not designed to be a human
 * friendly representation of the TokenSet.
 *
 * @returns {string}
 */
lunr.TokenSet.prototype.toString = function () {
  // NOTE: Using Object.keys here as this.edges is very likely
  // to enter 'hash-mode' with many keys being added
  //
  // avoiding a for-in loop here as it leads to the function
  // being de-optimised (at least in V8). From some simple
  // benchmarks the performance is comparable, but allowing
  // V8 to optimize may mean easy performance wins in the future.

  if (this._str) {
    return this._str
  }

  var str = this.final ? '1' : '0',
      labels = Object.keys(this.edges).sort(),
      len = labels.length

  for (var i = 0; i < len; i++) {
    var label = labels[i],
        node = this.edges[label]

    str = str + label + node.id
  }

  return str
}

/**
 * Returns a new TokenSet that is the intersection of
 * this TokenSet and the passed TokenSet.
 *
 * This intersection will take into account any wildcards
 * contained within the TokenSet.
 *
 * @param {lunr.TokenSet} b - An other TokenSet to intersect with.
 * @returns {lunr.TokenSet}
 */
lunr.TokenSet.prototype.intersect = function (b) {
  var output = new lunr.TokenSet,
      frame = undefined

  var stack = [{
    qNode: b,
    output: output,
    node: this
  }]

  while (stack.length) {
    frame = stack.pop()

    // NOTE: As with the #toString method, we are using
    // Object.keys and a for loop instead of a for-in loop
    // as both of these objects enter 'hash' mode, causing
    // the function to be de-optimised in V8
    var qEdges = Object.keys(frame.qNode.edges),
        qLen = qEdges.length,
        nEdges = Object.keys(frame.node.edges),
        nLen = nEdges.length

    for (var q = 0; q < qLen; q++) {
      var qEdge = qEdges[q]

      for (var n = 0; n < nLen; n++) {
        var nEdge = nEdges[n]

        if (nEdge == qEdge || qEdge == '*') {
          var node = frame.node.edges[nEdge],
              qNode = frame.qNode.edges[qEdge],
              final = node.final && qNode.final,
              next = undefined

          if (nEdge in frame.output.edges) {
            // an edge already exists for this character
            // no need to create a new node, just set the finality
            // bit unless this node is already final
            next = frame.output.edges[nEdge]
            next.final = next.final || final

          } else {
            // no edge exists yet, must create one
            // set the finality bit and insert it
            // into the output
            next = new lunr.TokenSet
            next.final = final
            frame.output.edges[nEdge] = next
          }

          stack.push({
            qNode: qNode,
            output: next,
            node: node
          })
        }
      }
    }
  }

  return output
}
lunr.TokenSet.Builder = function () {
  this.previousWord = ""
  this.root = new lunr.TokenSet
  this.uncheckedNodes = []
  this.minimizedNodes = {}
}

lunr.TokenSet.Builder.prototype.insert = function (word) {
  var node,
      commonPrefix = 0

  if (word < this.previousWord) {
    throw new Error ("Out of order word insertion")
  }

  for (var i = 0; i < word.length && i < this.previousWord.length; i++) {
    if (word[i] != this.previousWord[i]) break
    commonPrefix++
  }

  this.minimize(commonPrefix)

  if (this.uncheckedNodes.length == 0) {
    node = this.root
  } else {
    node = this.uncheckedNodes[this.uncheckedNodes.length - 1].child
  }

  for (var i = commonPrefix; i < word.length; i++) {
    var nextNode = new lunr.TokenSet,
        char = word[i]

    node.edges[char] = nextNode

    this.uncheckedNodes.push({
      parent: node,
      char: char,
      child: nextNode
    })

    node = nextNode
  }

  node.final = true
  this.previousWord = word
}

lunr.TokenSet.Builder.prototype.finish = function () {
  this.minimize(0)
}

lunr.TokenSet.Builder.prototype.minimize = function (downTo) {
  for (var i = this.uncheckedNodes.length - 1; i >= downTo; i--) {
    var node = this.uncheckedNodes[i],
        childKey = node.child.toString()

    if (childKey in this.minimizedNodes) {
      node.parent.edges[node.char] = this.minimizedNodes[childKey]
    } else {
      // Cache the key for this node since
      // we know it can't change anymore
      node.child._str = childKey

      this.minimizedNodes[childKey] = node.child
    }

    this.uncheckedNodes.pop()
  }
}
/*!
 * lunr.Index
 * Copyright (C) 2019 Oliver Nightingale
 */

/**
 * An index contains the built index of all documents and provides a query interface
 * to the index.
 *
 * Usually instances of lunr.Index will not be created using this constructor, instead
 * lunr.Builder should be used to construct new indexes, or lunr.Index.load should be
 * used to load previously built and serialized indexes.
 *
 * @constructor
 * @param {Object} attrs - The attributes of the built search index.
 * @param {Object} attrs.invertedIndex - An index of term/field to document reference.
 * @param {Object<string, lunr.Vector>} attrs.fieldVectors - Field vectors
 * @param {lunr.TokenSet} attrs.tokenSet - An set of all corpus tokens.
 * @param {string[]} attrs.fields - The names of indexed document fields.
 * @param {lunr.Pipeline} attrs.pipeline - The pipeline to use for search terms.
 */
lunr.Index = function (attrs) {
  this.invertedIndex = attrs.invertedIndex
  this.fieldVectors = attrs.fieldVectors
  this.tokenSet = attrs.tokenSet
  this.fields = attrs.fields
  this.pipeline = attrs.pipeline
}

/**
 * A result contains details of a document matching a search query.
 * @typedef {Object} lunr.Index~Result
 * @property {string} ref - The reference of the document this result represents.
 * @property {number} score - A number between 0 and 1 representing how similar this document is to the query.
 * @property {lunr.MatchData} matchData - Contains metadata about this match including which term(s) caused the match.
 */

/**
 * Although lunr provides the ability to create queries using lunr.Query, it also provides a simple
 * query language which itself is parsed into an instance of lunr.Query.
 *
 * For programmatically building queries it is advised to directly use lunr.Query, the query language
 * is best used for human entered text rather than program generated text.
 *
 * At its simplest queries can just be a single term, e.g. `hello`, multiple terms are also supported
 * and will be combined with OR, e.g `hello world` will match documents that contain either 'hello'
 * or 'world', though those that contain both will rank higher in the results.
 *
 * Wildcards can be included in terms to match one or more unspecified characters, these wildcards can
 * be inserted anywhere within the term, and more than one wildcard can exist in a single term. Adding
 * wildcards will increase the number of documents that will be found but can also have a negative
 * impact on query performance, especially with wildcards at the beginning of a term.
 *
 * Terms can be restricted to specific fields, e.g. `title:hello`, only documents with the term
 * hello in the title field will match this query. Using a field not present in the index will lead
 * to an error being thrown.
 *
 * Modifiers can also be added to terms, lunr supports edit distance and boost modifiers on terms. A term
 * boost will make documents matching that term score higher, e.g. `foo^5`. Edit distance is also supported
 * to provide fuzzy matching, e.g. 'hello~2' will match documents with hello with an edit distance of 2.
 * Avoid large values for edit distance to improve query performance.
 *
 * Each term also supports a presence modifier. By default a term's presence in document is optional, however
 * this can be changed to either required or prohibited. For a term's presence to be required in a document the
 * term should be prefixed with a '+', e.g. `+foo bar` is a search for documents that must contain 'foo' and
 * optionally contain 'bar'. Conversely a leading '-' sets the terms presence to prohibited, i.e. it must not
 * appear in a document, e.g. `-foo bar` is a search for documents that do not contain 'foo' but may contain 'bar'.
 *
 * To escape special characters the backslash character '\' can be used, this allows searches to include
 * characters that would normally be considered modifiers, e.g. `foo\~2` will search for a term "foo~2" instead
 * of attempting to apply a boost of 2 to the search term "foo".
 *
 * @typedef {string} lunr.Index~QueryString
 * @example <caption>Simple single term query</caption>
 * hello
 * @example <caption>Multiple term query</caption>
 * hello world
 * @example <caption>term scoped to a field</caption>
 * title:hello
 * @example <caption>term with a boost of 10</caption>
 * hello^10
 * @example <caption>term with an edit distance of 2</caption>
 * hello~2
 * @example <caption>terms with presence modifiers</caption>
 * -foo +bar baz
 */

/**
 * Performs a search against the index using lunr query syntax.
 *
 * Results will be returned sorted by their score, the most relevant results
 * will be returned first.  For details on how the score is calculated, please see
 * the {@link https://lunrjs.com/guides/searching.html#scoring|guide}.
 *
 * For more programmatic querying use lunr.Index#query.
 *
 * @param {lunr.Index~QueryString} queryString - A string containing a lunr query.
 * @throws {lunr.QueryParseError} If the passed query string cannot be parsed.
 * @returns {lunr.Index~Result[]}
 */
lunr.Index.prototype.search = function (queryString) {
  return this.query(function (query) {
    var parser = new lunr.QueryParser(queryString, query)
    parser.parse()
  })
}

/**
 * A query builder callback provides a query object to be used to express
 * the query to perform on the index.
 *
 * @callback lunr.Index~queryBuilder
 * @param {lunr.Query} query - The query object to build up.
 * @this lunr.Query
 */

/**
 * Performs a query against the index using the yielded lunr.Query object.
 *
 * If performing programmatic queries against the index, this method is preferred
 * over lunr.Index#search so as to avoid the additional query parsing overhead.
 *
 * A query object is yielded to the supplied function which should be used to
 * express the query to be run against the index.
 *
 * Note that although this function takes a callback parameter it is _not_ an
 * asynchronous operation, the callback is just yielded a query object to be
 * customized.
 *
 * @param {lunr.Index~queryBuilder} fn - A function that is used to build the query.
 * @returns {lunr.Index~Result[]}
 */
lunr.Index.prototype.query = function (fn) {
  // for each query clause
  // * process terms
  // * expand terms from token set
  // * find matching documents and metadata
  // * get document vectors
  // * score documents

  var query = new lunr.Query(this.fields),
      matchingFields = Object.create(null),
      queryVectors = Object.create(null),
      termFieldCache = Object.create(null),
      requiredMatches = Object.create(null),
      prohibitedMatches = Object.create(null)

  /*
   * To support field level boosts a query vector is created per
   * field. An empty vector is eagerly created to support negated
   * queries.
   */
  for (var i = 0; i < this.fields.length; i++) {
    queryVectors[this.fields[i]] = new lunr.Vector
  }

  fn.call(query, query)

  for (var i = 0; i < query.clauses.length; i++) {
    /*
     * Unless the pipeline has been disabled for this term, which is
     * the case for terms with wildcards, we need to pass the clause
     * term through the search pipeline. A pipeline returns an array
     * of processed terms. Pipeline functions may expand the passed
     * term, which means we may end up performing multiple index lookups
     * for a single query term.
     */
    var clause = query.clauses[i],
        terms = null,
        clauseMatches = lunr.Set.complete

    if (clause.usePipeline) {
      terms = this.pipeline.runString(clause.term, {
        fields: clause.fields
      })
    } else {
      terms = [clause.term]
    }

    for (var m = 0; m < terms.length; m++) {
      var term = terms[m]

      /*
       * Each term returned from the pipeline needs to use the same query
       * clause object, e.g. the same boost and or edit distance. The
       * simplest way to do this is to re-use the clause object but mutate
       * its term property.
       */
      clause.term = term

      /*
       * From the term in the clause we create a token set which will then
       * be used to intersect the indexes token set to get a list of terms
       * to lookup in the inverted index
       */
      var termTokenSet = lunr.TokenSet.fromClause(clause),
          expandedTerms = this.tokenSet.intersect(termTokenSet).toArray()

      /*
       * If a term marked as required does not exist in the tokenSet it is
       * impossible for the search to return any matches. We set all the field
       * scoped required matches set to empty and stop examining any further
       * clauses.
       */
      if (expandedTerms.length === 0 && clause.presence === lunr.Query.presence.REQUIRED) {
        for (var k = 0; k < clause.fields.length; k++) {
          var field = clause.fields[k]
          requiredMatches[field] = lunr.Set.empty
        }

        break
      }

      for (var j = 0; j < expandedTerms.length; j++) {
        /*
         * For each term get the posting and termIndex, this is required for
         * building the query vector.
         */
        var expandedTerm = expandedTerms[j],
            posting = this.invertedIndex[expandedTerm],
            termIndex = posting._index

        for (var k = 0; k < clause.fields.length; k++) {
          /*
           * For each field that this query term is scoped by (by default
           * all fields are in scope) we need to get all the document refs
           * that have this term in that field.
           *
           * The posting is the entry in the invertedIndex for the matching
           * term from above.
           */
          var field = clause.fields[k],
              fieldPosting = posting[field],
              matchingDocumentRefs = Object.keys(fieldPosting),
              termField = expandedTerm + "/" + field,
              matchingDocumentsSet = new lunr.Set(matchingDocumentRefs)

          /*
           * if the presence of this term is required ensure that the matching
           * documents are added to the set of required matches for this clause.
           *
           */
          if (clause.presence == lunr.Query.presence.REQUIRED) {
            clauseMatches = clauseMatches.union(matchingDocumentsSet)

            if (requiredMatches[field] === undefined) {
              requiredMatches[field] = lunr.Set.complete
            }
          }

          /*
           * if the presence of this term is prohibited ensure that the matching
           * documents are added to the set of prohibited matches for this field,
           * creating that set if it does not yet exist.
           */
          if (clause.presence == lunr.Query.presence.PROHIBITED) {
            if (prohibitedMatches[field] === undefined) {
              prohibitedMatches[field] = lunr.Set.empty
            }

            prohibitedMatches[field] = prohibitedMatches[field].union(matchingDocumentsSet)

            /*
             * Prohibited matches should not be part of the query vector used for
             * similarity scoring and no metadata should be extracted so we continue
             * to the next field
             */
            continue
          }

          /*
           * The query field vector is populated using the termIndex found for
           * the term and a unit value with the appropriate boost applied.
           * Using upsert because there could already be an entry in the vector
           * for the term we are working with. In that case we just add the scores
           * together.
           */
          queryVectors[field].upsert(termIndex, clause.boost, function (a, b) { return a + b })

          /**
           * If we've already seen this term, field combo then we've already collected
           * the matching documents and metadata, no need to go through all that again
           */
          if (termFieldCache[termField]) {
            continue
          }

          for (var l = 0; l < matchingDocumentRefs.length; l++) {
            /*
             * All metadata for this term/field/document triple
             * are then extracted and collected into an instance
             * of lunr.MatchData ready to be returned in the query
             * results
             */
            var matchingDocumentRef = matchingDocumentRefs[l],
                matchingFieldRef = new lunr.FieldRef (matchingDocumentRef, field),
                metadata = fieldPosting[matchingDocumentRef],
                fieldMatch

            if ((fieldMatch = matchingFields[matchingFieldRef]) === undefined) {
              matchingFields[matchingFieldRef] = new lunr.MatchData (expandedTerm, field, metadata)
            } else {
              fieldMatch.add(expandedTerm, field, metadata)
            }

          }

          termFieldCache[termField] = true
        }
      }
    }

    /**
     * If the presence was required we need to update the requiredMatches field sets.
     * We do this after all fields for the term have collected their matches because
     * the clause terms presence is required in _any_ of the fields not _all_ of the
     * fields.
     */
    if (clause.presence === lunr.Query.presence.REQUIRED) {
      for (var k = 0; k < clause.fields.length; k++) {
        var field = clause.fields[k]
        requiredMatches[field] = requiredMatches[field].intersect(clauseMatches)
      }
    }
  }

  /**
   * Need to combine the field scoped required and prohibited
   * matching documents into a global set of required and prohibited
   * matches
   */
  var allRequiredMatches = lunr.Set.complete,
      allProhibitedMatches = lunr.Set.empty

  for (var i = 0; i < this.fields.length; i++) {
    var field = this.fields[i]

    if (requiredMatches[field]) {
      allRequiredMatches = allRequiredMatches.intersect(requiredMatches[field])
    }

    if (prohibitedMatches[field]) {
      allProhibitedMatches = allProhibitedMatches.union(prohibitedMatches[field])
    }
  }

  var matchingFieldRefs = Object.keys(matchingFields),
      results = [],
      matches = Object.create(null)

  /*
   * If the query is negated (contains only prohibited terms)
   * we need to get _all_ fieldRefs currently existing in the
   * index. This is only done when we know that the query is
   * entirely prohibited terms to avoid any cost of getting all
   * fieldRefs unnecessarily.
   *
   * Additionally, blank MatchData must be created to correctly
   * populate the results.
   */
  if (query.isNegated()) {
    matchingFieldRefs = Object.keys(this.fieldVectors)

    for (var i = 0; i < matchingFieldRefs.length; i++) {
      var matchingFieldRef = matchingFieldRefs[i]
      var fieldRef = lunr.FieldRef.fromString(matchingFieldRef)
      matchingFields[matchingFieldRef] = new lunr.MatchData
    }
  }

  for (var i = 0; i < matchingFieldRefs.length; i++) {
    /*
     * Currently we have document fields that match the query, but we
     * need to return documents. The matchData and scores are combined
     * from multiple fields belonging to the same document.
     *
     * Scores are calculated by field, using the query vectors created
     * above, and combined into a final document score using addition.
     */
    var fieldRef = lunr.FieldRef.fromString(matchingFieldRefs[i]),
        docRef = fieldRef.docRef

    if (!allRequiredMatches.contains(docRef)) {
      continue
    }

    if (allProhibitedMatches.contains(docRef)) {
      continue
    }

    var fieldVector = this.fieldVectors[fieldRef],
        score = queryVectors[fieldRef.fieldName].similarity(fieldVector),
        docMatch

    if ((docMatch = matches[docRef]) !== undefined) {
      docMatch.score += score
      docMatch.matchData.combine(matchingFields[fieldRef])
    } else {
      var match = {
        ref: docRef,
        score: score,
        matchData: matchingFields[fieldRef]
      }
      matches[docRef] = match
      results.push(match)
    }
  }

  /*
   * Sort the results objects by score, highest first.
   */
  return results.sort(function (a, b) {
    return b.score - a.score
  })
}

/**
 * Prepares the index for JSON serialization.
 *
 * The schema for this JSON blob will be described in a
 * separate JSON schema file.
 *
 * @returns {Object}
 */
lunr.Index.prototype.toJSON = function () {
  var invertedIndex = Object.keys(this.invertedIndex)
    .sort()
    .map(function (term) {
      return [term, this.invertedIndex[term]]
    }, this)

  var fieldVectors = Object.keys(this.fieldVectors)
    .map(function (ref) {
      return [ref, this.fieldVectors[ref].toJSON()]
    }, this)

  return {
    version: lunr.version,
    fields: this.fields,
    fieldVectors: fieldVectors,
    invertedIndex: invertedIndex,
    pipeline: this.pipeline.toJSON()
  }
}

/**
 * Loads a previously serialized lunr.Index
 *
 * @param {Object} serializedIndex - A previously serialized lunr.Index
 * @returns {lunr.Index}
 */
lunr.Index.load = function (serializedIndex) {
  var attrs = {},
      fieldVectors = {},
      serializedVectors = serializedIndex.fieldVectors,
      invertedIndex = Object.create(null),
      serializedInvertedIndex = serializedIndex.invertedIndex,
      tokenSetBuilder = new lunr.TokenSet.Builder,
      pipeline = lunr.Pipeline.load(serializedIndex.pipeline)

  if (serializedIndex.version != lunr.version) {
    lunr.utils.warn("Version mismatch when loading serialised index. Current version of lunr '" + lunr.version + "' does not match serialized index '" + serializedIndex.version + "'")
  }

  for (var i = 0; i < serializedVectors.length; i++) {
    var tuple = serializedVectors[i],
        ref = tuple[0],
        elements = tuple[1]

    fieldVectors[ref] = new lunr.Vector(elements)
  }

  for (var i = 0; i < serializedInvertedIndex.length; i++) {
    var tuple = serializedInvertedIndex[i],
        term = tuple[0],
        posting = tuple[1]

    tokenSetBuilder.insert(term)
    invertedIndex[term] = posting
  }

  tokenSetBuilder.finish()

  attrs.fields = serializedIndex.fields

  attrs.fieldVectors = fieldVectors
  attrs.invertedIndex = invertedIndex
  attrs.tokenSet = tokenSetBuilder.root
  attrs.pipeline = pipeline

  return new lunr.Index(attrs)
}
/*!
 * lunr.Builder
 * Copyright (C) 2019 Oliver Nightingale
 */

/**
 * lunr.Builder performs indexing on a set of documents and
 * returns instances of lunr.Index ready for querying.
 *
 * All configuration of the index is done via the builder, the
 * fields to index, the document reference, the text processing
 * pipeline and document scoring parameters are all set on the
 * builder before indexing.
 *
 * @constructor
 * @property {string} _ref - Internal reference to the document reference field.
 * @property {string[]} _fields - Internal reference to the document fields to index.
 * @property {object} invertedIndex - The inverted index maps terms to document fields.
 * @property {object} documentTermFrequencies - Keeps track of document term frequencies.
 * @property {object} documentLengths - Keeps track of the length of documents added to the index.
 * @property {lunr.tokenizer} tokenizer - Function for splitting strings into tokens for indexing.
 * @property {lunr.Pipeline} pipeline - The pipeline performs text processing on tokens before indexing.
 * @property {lunr.Pipeline} searchPipeline - A pipeline for processing search terms before querying the index.
 * @property {number} documentCount - Keeps track of the total number of documents indexed.
 * @property {number} _b - A parameter to control field length normalization, setting this to 0 disabled normalization, 1 fully normalizes field lengths, the default value is 0.75.
 * @property {number} _k1 - A parameter to control how quickly an increase in term frequency results in term frequency saturation, the default value is 1.2.
 * @property {number} termIndex - A counter incremented for each unique term, used to identify a terms position in the vector space.
 * @property {array} metadataWhitelist - A list of metadata keys that have been whitelisted for entry in the index.
 */
lunr.Builder = function () {
  this._ref = "id"
  this._fields = Object.create(null)
  this._documents = Object.create(null)
  this.invertedIndex = Object.create(null)
  this.fieldTermFrequencies = {}
  this.fieldLengths = {}
  this.tokenizer = lunr.tokenizer
  this.pipeline = new lunr.Pipeline
  this.searchPipeline = new lunr.Pipeline
  this.documentCount = 0
  this._b = 0.75
  this._k1 = 1.2
  this.termIndex = 0
  this.metadataWhitelist = []
}

/**
 * Sets the document field used as the document reference. Every document must have this field.
 * The type of this field in the document should be a string, if it is not a string it will be
 * coerced into a string by calling toString.
 *
 * The default ref is 'id'.
 *
 * The ref should _not_ be changed during indexing, it should be set before any documents are
 * added to the index. Changing it during indexing can lead to inconsistent results.
 *
 * @param {string} ref - The name of the reference field in the document.
 */
lunr.Builder.prototype.ref = function (ref) {
  this._ref = ref
}

/**
 * A function that is used to extract a field from a document.
 *
 * Lunr expects a field to be at the top level of a document, if however the field
 * is deeply nested within a document an extractor function can be used to extract
 * the right field for indexing.
 *
 * @callback fieldExtractor
 * @param {object} doc - The document being added to the index.
 * @returns {?(string|object|object[])} obj - The object that will be indexed for this field.
 * @example <caption>Extracting a nested field</caption>
 * function (doc) { return doc.nested.field }
 */

/**
 * Adds a field to the list of document fields that will be indexed. Every document being
 * indexed should have this field. Null values for this field in indexed documents will
 * not cause errors but will limit the chance of that document being retrieved by searches.
 *
 * All fields should be added before adding documents to the index. Adding fields after
 * a document has been indexed will have no effect on already indexed documents.
 *
 * Fields can be boosted at build time. This allows terms within that field to have more
 * importance when ranking search results. Use a field boost to specify that matches within
 * one field are more important than other fields.
 *
 * @param {string} fieldName - The name of a field to index in all documents.
 * @param {object} attributes - Optional attributes associated with this field.
 * @param {number} [attributes.boost=1] - Boost applied to all terms within this field.
 * @param {fieldExtractor} [attributes.extractor] - Function to extract a field from a document.
 * @throws {RangeError} fieldName cannot contain unsupported characters '/'
 */
lunr.Builder.prototype.field = function (fieldName, attributes) {
  if (/\//.test(fieldName)) {
    throw new RangeError ("Field '" + fieldName + "' contains illegal character '/'")
  }

  this._fields[fieldName] = attributes || {}
}

/**
 * A parameter to tune the amount of field length normalisation that is applied when
 * calculating relevance scores. A value of 0 will completely disable any normalisation
 * and a value of 1 will fully normalise field lengths. The default is 0.75. Values of b
 * will be clamped to the range 0 - 1.
 *
 * @param {number} number - The value to set for this tuning parameter.
 */
lunr.Builder.prototype.b = function (number) {
  if (number < 0) {
    this._b = 0
  } else if (number > 1) {
    this._b = 1
  } else {
    this._b = number
  }
}

/**
 * A parameter that controls the speed at which a rise in term frequency results in term
 * frequency saturation. The default value is 1.2. Setting this to a higher value will give
 * slower saturation levels, a lower value will result in quicker saturation.
 *
 * @param {number} number - The value to set for this tuning parameter.
 */
lunr.Builder.prototype.k1 = function (number) {
  this._k1 = number
}

/**
 * Adds a document to the index.
 *
 * Before adding fields to the index the index should have been fully setup, with the document
 * ref and all fields to index already having been specified.
 *
 * The document must have a field name as specified by the ref (by default this is 'id') and
 * it should have all fields defined for indexing, though null or undefined values will not
 * cause errors.
 *
 * Entire documents can be boosted at build time. Applying a boost to a document indicates that
 * this document should rank higher in search results than other documents.
 *
 * @param {object} doc - The document to add to the index.
 * @param {object} attributes - Optional attributes associated with this document.
 * @param {number} [attributes.boost=1] - Boost applied to all terms within this document.
 */
lunr.Builder.prototype.add = function (doc, attributes) {
  var docRef = doc[this._ref],
      fields = Object.keys(this._fields)

  this._documents[docRef] = attributes || {}
  this.documentCount += 1

  for (var i = 0; i < fields.length; i++) {
    var fieldName = fields[i],
        extractor = this._fields[fieldName].extractor,
        field = extractor ? extractor(doc) : doc[fieldName],
        tokens = this.tokenizer(field, {
          fields: [fieldName]
        }),
        terms = this.pipeline.run(tokens),
        fieldRef = new lunr.FieldRef (docRef, fieldName),
        fieldTerms = Object.create(null)

    this.fieldTermFrequencies[fieldRef] = fieldTerms
    this.fieldLengths[fieldRef] = 0

    // store the length of this field for this document
    this.fieldLengths[fieldRef] += terms.length

    // calculate term frequencies for this field
    for (var j = 0; j < terms.length; j++) {
      var term = terms[j]

      if (fieldTerms[term] == undefined) {
        fieldTerms[term] = 0
      }

      fieldTerms[term] += 1

      // add to inverted index
      // create an initial posting if one doesn't exist
      if (this.invertedIndex[term] == undefined) {
        var posting = Object.create(null)
        posting["_index"] = this.termIndex
        this.termIndex += 1

        for (var k = 0; k < fields.length; k++) {
          posting[fields[k]] = Object.create(null)
        }

        this.invertedIndex[term] = posting
      }

      // add an entry for this term/fieldName/docRef to the invertedIndex
      if (this.invertedIndex[term][fieldName][docRef] == undefined) {
        this.invertedIndex[term][fieldName][docRef] = Object.create(null)
      }

      // store all whitelisted metadata about this token in the
      // inverted index
      for (var l = 0; l < this.metadataWhitelist.length; l++) {
        var metadataKey = this.metadataWhitelist[l],
            metadata = term.metadata[metadataKey]

        if (this.invertedIndex[term][fieldName][docRef][metadataKey] == undefined) {
          this.invertedIndex[term][fieldName][docRef][metadataKey] = []
        }

        this.invertedIndex[term][fieldName][docRef][metadataKey].push(metadata)
      }
    }

  }
}

/**
 * Calculates the average document length for this index
 *
 * @private
 */
lunr.Builder.prototype.calculateAverageFieldLengths = function () {

  var fieldRefs = Object.keys(this.fieldLengths),
      numberOfFields = fieldRefs.length,
      accumulator = {},
      documentsWithField = {}

  for (var i = 0; i < numberOfFields; i++) {
    var fieldRef = lunr.FieldRef.fromString(fieldRefs[i]),
        field = fieldRef.fieldName

    documentsWithField[field] || (documentsWithField[field] = 0)
    documentsWithField[field] += 1

    accumulator[field] || (accumulator[field] = 0)
    accumulator[field] += this.fieldLengths[fieldRef]
  }

  var fields = Object.keys(this._fields)

  for (var i = 0; i < fields.length; i++) {
    var fieldName = fields[i]
    accumulator[fieldName] = accumulator[fieldName] / documentsWithField[fieldName]
  }

  this.averageFieldLength = accumulator
}

/**
 * Builds a vector space model of every document using lunr.Vector
 *
 * @private
 */
lunr.Builder.prototype.createFieldVectors = function () {
  var fieldVectors = {},
      fieldRefs = Object.keys(this.fieldTermFrequencies),
      fieldRefsLength = fieldRefs.length,
      termIdfCache = Object.create(null)

  for (var i = 0; i < fieldRefsLength; i++) {
    var fieldRef = lunr.FieldRef.fromString(fieldRefs[i]),
        fieldName = fieldRef.fieldName,
        fieldLength = this.fieldLengths[fieldRef],
        fieldVector = new lunr.Vector,
        termFrequencies = this.fieldTermFrequencies[fieldRef],
        terms = Object.keys(termFrequencies),
        termsLength = terms.length


    var fieldBoost = this._fields[fieldName].boost || 1,
        docBoost = this._documents[fieldRef.docRef].boost || 1

    for (var j = 0; j < termsLength; j++) {
      var term = terms[j],
          tf = termFrequencies[term],
          termIndex = this.invertedIndex[term]._index,
          idf, score, scoreWithPrecision

      if (termIdfCache[term] === undefined) {
        idf = lunr.idf(this.invertedIndex[term], this.documentCount)
        termIdfCache[term] = idf
      } else {
        idf = termIdfCache[term]
      }

      score = idf * ((this._k1 + 1) * tf) / (this._k1 * (1 - this._b + this._b * (fieldLength / this.averageFieldLength[fieldName])) + tf)
      score *= fieldBoost
      score *= docBoost
      scoreWithPrecision = Math.round(score * 1000) / 1000
      // Converts 1.23456789 to 1.234.
      // Reducing the precision so that the vectors take up less
      // space when serialised. Doing it now so that they behave
      // the same before and after serialisation. Also, this is
      // the fastest approach to reducing a number's precision in
      // JavaScript.

      fieldVector.insert(termIndex, scoreWithPrecision)
    }

    fieldVectors[fieldRef] = fieldVector
  }

  this.fieldVectors = fieldVectors
}

/**
 * Creates a token set of all tokens in the index using lunr.TokenSet
 *
 * @private
 */
lunr.Builder.prototype.createTokenSet = function () {
  this.tokenSet = lunr.TokenSet.fromArray(
    Object.keys(this.invertedIndex).sort()
  )
}

/**
 * Builds the index, creating an instance of lunr.Index.
 *
 * This completes the indexing process and should only be called
 * once all documents have been added to the index.
 *
 * @returns {lunr.Index}
 */
lunr.Builder.prototype.build = function () {
  this.calculateAverageFieldLengths()
  this.createFieldVectors()
  this.createTokenSet()

  return new lunr.Index({
    invertedIndex: this.invertedIndex,
    fieldVectors: this.fieldVectors,
    tokenSet: this.tokenSet,
    fields: Object.keys(this._fields),
    pipeline: this.searchPipeline
  })
}

/**
 * Applies a plugin to the index builder.
 *
 * A plugin is a function that is called with the index builder as its context.
 * Plugins can be used to customise or extend the behaviour of the index
 * in some way. A plugin is just a function, that encapsulated the custom
 * behaviour that should be applied when building the index.
 *
 * The plugin function will be called with the index builder as its argument, additional
 * arguments can also be passed when calling use. The function will be called
 * with the index builder as its context.
 *
 * @param {Function} plugin The plugin to apply.
 */
lunr.Builder.prototype.use = function (fn) {
  var args = Array.prototype.slice.call(arguments, 1)
  args.unshift(this)
  fn.apply(this, args)
}
/**
 * Contains and collects metadata about a matching document.
 * A single instance of lunr.MatchData is returned as part of every
 * lunr.Index~Result.
 *
 * @constructor
 * @param {string} term - The term this match data is associated with
 * @param {string} field - The field in which the term was found
 * @param {object} metadata - The metadata recorded about this term in this field
 * @property {object} metadata - A cloned collection of metadata associated with this document.
 * @see {@link lunr.Index~Result}
 */
lunr.MatchData = function (term, field, metadata) {
  var clonedMetadata = Object.create(null),
      metadataKeys = Object.keys(metadata || {})

  // Cloning the metadata to prevent the original
  // being mutated during match data combination.
  // Metadata is kept in an array within the inverted
  // index so cloning the data can be done with
  // Array#slice
  for (var i = 0; i < metadataKeys.length; i++) {
    var key = metadataKeys[i]
    clonedMetadata[key] = metadata[key].slice()
  }

  this.metadata = Object.create(null)

  if (term !== undefined) {
    this.metadata[term] = Object.create(null)
    this.metadata[term][field] = clonedMetadata
  }
}

/**
 * An instance of lunr.MatchData will be created for every term that matches a
 * document. However only one instance is required in a lunr.Index~Result. This
 * method combines metadata from another instance of lunr.MatchData with this
 * objects metadata.
 *
 * @param {lunr.MatchData} otherMatchData - Another instance of match data to merge with this one.
 * @see {@link lunr.Index~Result}
 */
lunr.MatchData.prototype.combine = function (otherMatchData) {
  var terms = Object.keys(otherMatchData.metadata)

  for (var i = 0; i < terms.length; i++) {
    var term = terms[i],
        fields = Object.keys(otherMatchData.metadata[term])

    if (this.metadata[term] == undefined) {
      this.metadata[term] = Object.create(null)
    }

    for (var j = 0; j < fields.length; j++) {
      var field = fields[j],
          keys = Object.keys(otherMatchData.metadata[term][field])

      if (this.metadata[term][field] == undefined) {
        this.metadata[term][field] = Object.create(null)
      }

      for (var k = 0; k < keys.length; k++) {
        var key = keys[k]

        if (this.metadata[term][field][key] == undefined) {
          this.metadata[term][field][key] = otherMatchData.metadata[term][field][key]
        } else {
          this.metadata[term][field][key] = this.metadata[term][field][key].concat(otherMatchData.metadata[term][field][key])
        }

      }
    }
  }
}

/**
 * Add metadata for a term/field pair to this instance of match data.
 *
 * @param {string} term - The term this match data is associated with
 * @param {string} field - The field in which the term was found
 * @param {object} metadata - The metadata recorded about this term in this field
 */
lunr.MatchData.prototype.add = function (term, field, metadata) {
  if (!(term in this.metadata)) {
    this.metadata[term] = Object.create(null)
    this.metadata[term][field] = metadata
    return
  }

  if (!(field in this.metadata[term])) {
    this.metadata[term][field] = metadata
    return
  }

  var metadataKeys = Object.keys(metadata)

  for (var i = 0; i < metadataKeys.length; i++) {
    var key = metadataKeys[i]

    if (key in this.metadata[term][field]) {
      this.metadata[term][field][key] = this.metadata[term][field][key].concat(metadata[key])
    } else {
      this.metadata[term][field][key] = metadata[key]
    }
  }
}
/**
 * A lunr.Query provides a programmatic way of defining queries to be performed
 * against a {@link lunr.Index}.
 *
 * Prefer constructing a lunr.Query using the {@link lunr.Index#query} method
 * so the query object is pre-initialized with the right index fields.
 *
 * @constructor
 * @property {lunr.Query~Clause[]} clauses - An array of query clauses.
 * @property {string[]} allFields - An array of all available fields in a lunr.Index.
 */
lunr.Query = function (allFields) {
  this.clauses = []
  this.allFields = allFields
}

/**
 * Constants for indicating what kind of automatic wildcard insertion will be used when constructing a query clause.
 *
 * This allows wildcards to be added to the beginning and end of a term without having to manually do any string
 * concatenation.
 *
 * The wildcard constants can be bitwise combined to select both leading and trailing wildcards.
 *
 * @constant
 * @default
 * @property {number} wildcard.NONE - The term will have no wildcards inserted, this is the default behaviour
 * @property {number} wildcard.LEADING - Prepend the term with a wildcard, unless a leading wildcard already exists
 * @property {number} wildcard.TRAILING - Append a wildcard to the term, unless a trailing wildcard already exists
 * @see lunr.Query~Clause
 * @see lunr.Query#clause
 * @see lunr.Query#term
 * @example <caption>query term with trailing wildcard</caption>
 * query.term('foo', { wildcard: lunr.Query.wildcard.TRAILING })
 * @example <caption>query term with leading and trailing wildcard</caption>
 * query.term('foo', {
 *   wildcard: lunr.Query.wildcard.LEADING | lunr.Query.wildcard.TRAILING
 * })
 */

lunr.Query.wildcard = new String ("*")
lunr.Query.wildcard.NONE = 0
lunr.Query.wildcard.LEADING = 1
lunr.Query.wildcard.TRAILING = 2

/**
 * Constants for indicating what kind of presence a term must have in matching documents.
 *
 * @constant
 * @enum {number}
 * @see lunr.Query~Clause
 * @see lunr.Query#clause
 * @see lunr.Query#term
 * @example <caption>query term with required presence</caption>
 * query.term('foo', { presence: lunr.Query.presence.REQUIRED })
 */
lunr.Query.presence = {
  /**
   * Term's presence in a document is optional, this is the default value.
   */
  OPTIONAL: 1,

  /**
   * Term's presence in a document is required, documents that do not contain
   * this term will not be returned.
   */
  REQUIRED: 2,

  /**
   * Term's presence in a document is prohibited, documents that do contain
   * this term will not be returned.
   */
  PROHIBITED: 3
}

/**
 * A single clause in a {@link lunr.Query} contains a term and details on how to
 * match that term against a {@link lunr.Index}.
 *
 * @typedef {Object} lunr.Query~Clause
 * @property {string[]} fields - The fields in an index this clause should be matched against.
 * @property {number} [boost=1] - Any boost that should be applied when matching this clause.
 * @property {number} [editDistance] - Whether the term should have fuzzy matching applied, and how fuzzy the match should be.
 * @property {boolean} [usePipeline] - Whether the term should be passed through the search pipeline.
 * @property {number} [wildcard=lunr.Query.wildcard.NONE] - Whether the term should have wildcards appended or prepended.
 * @property {number} [presence=lunr.Query.presence.OPTIONAL] - The terms presence in any matching documents.
 */

/**
 * Adds a {@link lunr.Query~Clause} to this query.
 *
 * Unless the clause contains the fields to be matched all fields will be matched. In addition
 * a default boost of 1 is applied to the clause.
 *
 * @param {lunr.Query~Clause} clause - The clause to add to this query.
 * @see lunr.Query~Clause
 * @returns {lunr.Query}
 */
lunr.Query.prototype.clause = function (clause) {
  if (!('fields' in clause)) {
    clause.fields = this.allFields
  }

  if (!('boost' in clause)) {
    clause.boost = 1
  }

  if (!('usePipeline' in clause)) {
    clause.usePipeline = true
  }

  if (!('wildcard' in clause)) {
    clause.wildcard = lunr.Query.wildcard.NONE
  }

  if ((clause.wildcard & lunr.Query.wildcard.LEADING) && (clause.term.charAt(0) != lunr.Query.wildcard)) {
    clause.term = "*" + clause.term
  }

  if ((clause.wildcard & lunr.Query.wildcard.TRAILING) && (clause.term.slice(-1) != lunr.Query.wildcard)) {
    clause.term = "" + clause.term + "*"
  }

  if (!('presence' in clause)) {
    clause.presence = lunr.Query.presence.OPTIONAL
  }

  this.clauses.push(clause)

  return this
}

/**
 * A negated query is one in which every clause has a presence of
 * prohibited. These queries require some special processing to return
 * the expected results.
 *
 * @returns boolean
 */
lunr.Query.prototype.isNegated = function () {
  for (var i = 0; i < this.clauses.length; i++) {
    if (this.clauses[i].presence != lunr.Query.presence.PROHIBITED) {
      return false
    }
  }

  return true
}

/**
 * Adds a term to the current query, under the covers this will create a {@link lunr.Query~Clause}
 * to the list of clauses that make up this query.
 *
 * The term is used as is, i.e. no tokenization will be performed by this method. Instead conversion
 * to a token or token-like string should be done before calling this method.
 *
 * The term will be converted to a string by calling `toString`. Multiple terms can be passed as an
 * array, each term in the array will share the same options.
 *
 * @param {object|object[]} term - The term(s) to add to the query.
 * @param {object} [options] - Any additional properties to add to the query clause.
 * @returns {lunr.Query}
 * @see lunr.Query#clause
 * @see lunr.Query~Clause
 * @example <caption>adding a single term to a query</caption>
 * query.term("foo")
 * @example <caption>adding a single term to a query and specifying search fields, term boost and automatic trailing wildcard</caption>
 * query.term("foo", {
 *   fields: ["title"],
 *   boost: 10,
 *   wildcard: lunr.Query.wildcard.TRAILING
 * })
 * @example <caption>using lunr.tokenizer to convert a string to tokens before using them as terms</caption>
 * query.term(lunr.tokenizer("foo bar"))
 */
lunr.Query.prototype.term = function (term, options) {
  if (Array.isArray(term)) {
    term.forEach(function (t) { this.term(t, lunr.utils.clone(options)) }, this)
    return this
  }

  var clause = options || {}
  clause.term = term.toString()

  this.clause(clause)

  return this
}
lunr.QueryParseError = function (message, start, end) {
  this.name = "QueryParseError"
  this.message = message
  this.start = start
  this.end = end
}

lunr.QueryParseError.prototype = new Error
lunr.QueryLexer = function (str) {
  this.lexemes = []
  this.str = str
  this.length = str.length
  this.pos = 0
  this.start = 0
  this.escapeCharPositions = []
}

lunr.QueryLexer.prototype.run = function () {
  var state = lunr.QueryLexer.lexText

  while (state) {
    state = state(this)
  }
}

lunr.QueryLexer.prototype.sliceString = function () {
  var subSlices = [],
      sliceStart = this.start,
      sliceEnd = this.pos

  for (var i = 0; i < this.escapeCharPositions.length; i++) {
    sliceEnd = this.escapeCharPositions[i]
    subSlices.push(this.str.slice(sliceStart, sliceEnd))
    sliceStart = sliceEnd + 1
  }

  subSlices.push(this.str.slice(sliceStart, this.pos))
  this.escapeCharPositions.length = 0

  return subSlices.join('')
}

lunr.QueryLexer.prototype.emit = function (type) {
  this.lexemes.push({
    type: type,
    str: this.sliceString(),
    start: this.start,
    end: this.pos
  })

  this.start = this.pos
}

lunr.QueryLexer.prototype.escapeCharacter = function () {
  this.escapeCharPositions.push(this.pos - 1)
  this.pos += 1
}

lunr.QueryLexer.prototype.next = function () {
  if (this.pos >= this.length) {
    return lunr.QueryLexer.EOS
  }

  var char = this.str.charAt(this.pos)
  this.pos += 1
  return char
}

lunr.QueryLexer.prototype.width = function () {
  return this.pos - this.start
}

lunr.QueryLexer.prototype.ignore = function () {
  if (this.start == this.pos) {
    this.pos += 1
  }

  this.start = this.pos
}

lunr.QueryLexer.prototype.backup = function () {
  this.pos -= 1
}

lunr.QueryLexer.prototype.acceptDigitRun = function () {
  var char, charCode

  do {
    char = this.next()
    charCode = char.charCodeAt(0)
  } while (charCode > 47 && charCode < 58)

  if (char != lunr.QueryLexer.EOS) {
    this.backup()
  }
}

lunr.QueryLexer.prototype.more = function () {
  return this.pos < this.length
}

lunr.QueryLexer.EOS = 'EOS'
lunr.QueryLexer.FIELD = 'FIELD'
lunr.QueryLexer.TERM = 'TERM'
lunr.QueryLexer.EDIT_DISTANCE = 'EDIT_DISTANCE'
lunr.QueryLexer.BOOST = 'BOOST'
lunr.QueryLexer.PRESENCE = 'PRESENCE'

lunr.QueryLexer.lexField = function (lexer) {
  lexer.backup()
  lexer.emit(lunr.QueryLexer.FIELD)
  lexer.ignore()
  return lunr.QueryLexer.lexText
}

lunr.QueryLexer.lexTerm = function (lexer) {
  if (lexer.width() > 1) {
    lexer.backup()
    lexer.emit(lunr.QueryLexer.TERM)
  }

  lexer.ignore()

  if (lexer.more()) {
    return lunr.QueryLexer.lexText
  }
}

lunr.QueryLexer.lexEditDistance = function (lexer) {
  lexer.ignore()
  lexer.acceptDigitRun()
  lexer.emit(lunr.QueryLexer.EDIT_DISTANCE)
  return lunr.QueryLexer.lexText
}

lunr.QueryLexer.lexBoost = function (lexer) {
  lexer.ignore()
  lexer.acceptDigitRun()
  lexer.emit(lunr.QueryLexer.BOOST)
  return lunr.QueryLexer.lexText
}

lunr.QueryLexer.lexEOS = function (lexer) {
  if (lexer.width() > 0) {
    lexer.emit(lunr.QueryLexer.TERM)
  }
}

// This matches the separator used when tokenising fields
// within a document. These should match otherwise it is
// not possible to search for some tokens within a document.
//
// It is possible for the user to change the separator on the
// tokenizer so it _might_ clash with any other of the special
// characters already used within the search string, e.g. :.
//
// This means that it is possible to change the separator in
// such a way that makes some words unsearchable using a search
// string.
lunr.QueryLexer.termSeparator = lunr.tokenizer.separator

lunr.QueryLexer.lexText = function (lexer) {
  while (true) {
    var char = lexer.next()

    if (char == lunr.QueryLexer.EOS) {
      return lunr.QueryLexer.lexEOS
    }

    // Escape character is '\'
    if (char.charCodeAt(0) == 92) {
      lexer.escapeCharacter()
      continue
    }

    if (char == ":") {
      return lunr.QueryLexer.lexField
    }

    if (char == "~") {
      lexer.backup()
      if (lexer.width() > 0) {
        lexer.emit(lunr.QueryLexer.TERM)
      }
      return lunr.QueryLexer.lexEditDistance
    }

    if (char == "^") {
      lexer.backup()
      if (lexer.width() > 0) {
        lexer.emit(lunr.QueryLexer.TERM)
      }
      return lunr.QueryLexer.lexBoost
    }

    // "+" indicates term presence is required
    // checking for length to ensure that only
    // leading "+" are considered
    if (char == "+" && lexer.width() === 1) {
      lexer.emit(lunr.QueryLexer.PRESENCE)
      return lunr.QueryLexer.lexText
    }

    // "-" indicates term presence is prohibited
    // checking for length to ensure that only
    // leading "-" are considered
    if (char == "-" && lexer.width() === 1) {
      lexer.emit(lunr.QueryLexer.PRESENCE)
      return lunr.QueryLexer.lexText
    }

    if (char.match(lunr.QueryLexer.termSeparator)) {
      return lunr.QueryLexer.lexTerm
    }
  }
}

lunr.QueryParser = function (str, query) {
  this.lexer = new lunr.QueryLexer (str)
  this.query = query
  this.currentClause = {}
  this.lexemeIdx = 0
}

lunr.QueryParser.prototype.parse = function () {
  this.lexer.run()
  this.lexemes = this.lexer.lexemes

  var state = lunr.QueryParser.parseClause

  while (state) {
    state = state(this)
  }

  return this.query
}

lunr.QueryParser.prototype.peekLexeme = function () {
  return this.lexemes[this.lexemeIdx]
}

lunr.QueryParser.prototype.consumeLexeme = function () {
  var lexeme = this.peekLexeme()
  this.lexemeIdx += 1
  return lexeme
}

lunr.QueryParser.prototype.nextClause = function () {
  var completedClause = this.currentClause
  this.query.clause(completedClause)
  this.currentClause = {}
}

lunr.QueryParser.parseClause = function (parser) {
  var lexeme = parser.peekLexeme()

  if (lexeme == undefined) {
    return
  }

  switch (lexeme.type) {
    case lunr.QueryLexer.PRESENCE:
      return lunr.QueryParser.parsePresence
    case lunr.QueryLexer.FIELD:
      return lunr.QueryParser.parseField
    case lunr.QueryLexer.TERM:
      return lunr.QueryParser.parseTerm
    default:
      var errorMessage = "expected either a field or a term, found " + lexeme.type

      if (lexeme.str.length >= 1) {
        errorMessage += " with value '" + lexeme.str + "'"
      }

      throw new lunr.QueryParseError (errorMessage, lexeme.start, lexeme.end)
  }
}

lunr.QueryParser.parsePresence = function (parser) {
  var lexeme = parser.consumeLexeme()

  if (lexeme == undefined) {
    return
  }

  switch (lexeme.str) {
    case "-":
      parser.currentClause.presence = lunr.Query.presence.PROHIBITED
      break
    case "+":
      parser.currentClause.presence = lunr.Query.presence.REQUIRED
      break
    default:
      var errorMessage = "unrecognised presence operator'" + lexeme.str + "'"
      throw new lunr.QueryParseError (errorMessage, lexeme.start, lexeme.end)
  }

  var nextLexeme = parser.peekLexeme()

  if (nextLexeme == undefined) {
    var errorMessage = "expecting term or field, found nothing"
    throw new lunr.QueryParseError (errorMessage, lexeme.start, lexeme.end)
  }

  switch (nextLexeme.type) {
    case lunr.QueryLexer.FIELD:
      return lunr.QueryParser.parseField
    case lunr.QueryLexer.TERM:
      return lunr.QueryParser.parseTerm
    default:
      var errorMessage = "expecting term or field, found '" + nextLexeme.type + "'"
      throw new lunr.QueryParseError (errorMessage, nextLexeme.start, nextLexeme.end)
  }
}

lunr.QueryParser.parseField = function (parser) {
  var lexeme = parser.consumeLexeme()

  if (lexeme == undefined) {
    return
  }

  if (parser.query.allFields.indexOf(lexeme.str) == -1) {
    var possibleFields = parser.query.allFields.map(function (f) { return "'" + f + "'" }).join(', '),
        errorMessage = "unrecognised field '" + lexeme.str + "', possible fields: " + possibleFields

    throw new lunr.QueryParseError (errorMessage, lexeme.start, lexeme.end)
  }

  parser.currentClause.fields = [lexeme.str]

  var nextLexeme = parser.peekLexeme()

  if (nextLexeme == undefined) {
    var errorMessage = "expecting term, found nothing"
    throw new lunr.QueryParseError (errorMessage, lexeme.start, lexeme.end)
  }

  switch (nextLexeme.type) {
    case lunr.QueryLexer.TERM:
      return lunr.QueryParser.parseTerm
    default:
      var errorMessage = "expecting term, found '" + nextLexeme.type + "'"
      throw new lunr.QueryParseError (errorMessage, nextLexeme.start, nextLexeme.end)
  }
}

lunr.QueryParser.parseTerm = function (parser) {
  var lexeme = parser.consumeLexeme()

  if (lexeme == undefined) {
    return
  }

  parser.currentClause.term = lexeme.str.toLowerCase()

  if (lexeme.str.indexOf("*") != -1) {
    parser.currentClause.usePipeline = false
  }

  var nextLexeme = parser.peekLexeme()

  if (nextLexeme == undefined) {
    parser.nextClause()
    return
  }

  switch (nextLexeme.type) {
    case lunr.QueryLexer.TERM:
      parser.nextClause()
      return lunr.QueryParser.parseTerm
    case lunr.QueryLexer.FIELD:
      parser.nextClause()
      return lunr.QueryParser.parseField
    case lunr.QueryLexer.EDIT_DISTANCE:
      return lunr.QueryParser.parseEditDistance
    case lunr.QueryLexer.BOOST:
      return lunr.QueryParser.parseBoost
    case lunr.QueryLexer.PRESENCE:
      parser.nextClause()
      return lunr.QueryParser.parsePresence
    default:
      var errorMessage = "Unexpected lexeme type '" + nextLexeme.type + "'"
      throw new lunr.QueryParseError (errorMessage, nextLexeme.start, nextLexeme.end)
  }
}

lunr.QueryParser.parseEditDistance = function (parser) {
  var lexeme = parser.consumeLexeme()

  if (lexeme == undefined) {
    return
  }

  var editDistance = parseInt(lexeme.str, 10)

  if (isNaN(editDistance)) {
    var errorMessage = "edit distance must be numeric"
    throw new lunr.QueryParseError (errorMessage, lexeme.start, lexeme.end)
  }

  parser.currentClause.editDistance = editDistance

  var nextLexeme = parser.peekLexeme()

  if (nextLexeme == undefined) {
    parser.nextClause()
    return
  }

  switch (nextLexeme.type) {
    case lunr.QueryLexer.TERM:
      parser.nextClause()
      return lunr.QueryParser.parseTerm
    case lunr.QueryLexer.FIELD:
      parser.nextClause()
      return lunr.QueryParser.parseField
    case lunr.QueryLexer.EDIT_DISTANCE:
      return lunr.QueryParser.parseEditDistance
    case lunr.QueryLexer.BOOST:
      return lunr.QueryParser.parseBoost
    case lunr.QueryLexer.PRESENCE:
      parser.nextClause()
      return lunr.QueryParser.parsePresence
    default:
      var errorMessage = "Unexpected lexeme type '" + nextLexeme.type + "'"
      throw new lunr.QueryParseError (errorMessage, nextLexeme.start, nextLexeme.end)
  }
}

lunr.QueryParser.parseBoost = function (parser) {
  var lexeme = parser.consumeLexeme()

  if (lexeme == undefined) {
    return
  }

  var boost = parseInt(lexeme.str, 10)

  if (isNaN(boost)) {
    var errorMessage = "boost must be numeric"
    throw new lunr.QueryParseError (errorMessage, lexeme.start, lexeme.end)
  }

  parser.currentClause.boost = boost

  var nextLexeme = parser.peekLexeme()

  if (nextLexeme == undefined) {
    parser.nextClause()
    return
  }

  switch (nextLexeme.type) {
    case lunr.QueryLexer.TERM:
      parser.nextClause()
      return lunr.QueryParser.parseTerm
    case lunr.QueryLexer.FIELD:
      parser.nextClause()
      return lunr.QueryParser.parseField
    case lunr.QueryLexer.EDIT_DISTANCE:
      return lunr.QueryParser.parseEditDistance
    case lunr.QueryLexer.BOOST:
      return lunr.QueryParser.parseBoost
    case lunr.QueryLexer.PRESENCE:
      parser.nextClause()
      return lunr.QueryParser.parsePresence
    default:
      var errorMessage = "Unexpected lexeme type '" + nextLexeme.type + "'"
      throw new lunr.QueryParseError (errorMessage, nextLexeme.start, nextLexeme.end)
  }
}

  /**
   * export the module via AMD, CommonJS or as a browser global
   * Export code from https://github.com/umdjs/umd/blob/master/returnExports.js
   */
  ;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
      define(factory)
    } else if (typeof exports === 'object') {
      /**
       * Node. Does not work with strict CommonJS, but
       * only CommonJS-like enviroments that support module.exports,
       * like Node.
       */
      module.exports = factory()
    } else {
      // Browser globals (root is window)
      root.lunr = factory()
    }
  }(this, function () {
    /**
     * Just return a value to define the module export.
     * This example returns an object, but the module
     * can return a function as the exported value.
     */
    return lunr
  }))
})();

},{}],2:[function(require,module,exports){
module.exports={"version":"2.3.6","fields":["title","author","abstract"],"fieldVectors":[["title/kuyers/content/what_if_learning/What If Learning - Connecting Faith with All of Life.pdf",[0,2.987,1,1.915,2,2.987]],["author/kuyers/content/what_if_learning/What If Learning - Connecting Faith with All of Life.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/kuyers/content/what_if_learning/What If Learning - Connecting Faith with All of Life.pdf",[0,3.662,1,2.348,2,3.662,7,3.367]],["title/content/what_if_learning/What If Learning - Honoring the wonder of God’s world.pdf",[8,2.916,9,2.424,10,2.524,11,2.335]],["author/content/what_if_learning/What If Learning - Honoring the wonder of God’s world.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Honoring the wonder of God’s world.pdf",[7,3.16,8,3.8,9,3.16,10,3.29,11,3.043]],["title/content/what_if_learning/What If Learning - Curiosity about life’s big questions.pdf",[12,3.322,13,3.624,14,3.096,15,2.637]],["author/content/what_if_learning/What If Learning - Curiosity about life’s big questions.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Curiosity about life’s big questions.pdf",[12,4.329,13,4.724,14,4.035,15,3.437,16,4.329]],["title/content/what_if_learning/What If Learning - Meaning, significance, and purpose.pdf",[7,2.746,17,4.106,18,3.763]],["author/content/what_if_learning/What If Learning - Meaning, significance, and purpose.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Meaning, significance, and purpose.pdf",[7,3.367,17,5.034,18,4.614,19,2.535]],["title/content/what_if_learning/What If Learning - Seeing people holistically.pdf",[20,2.987,21,2.645,22,4.106]],["author/content/what_if_learning/What If Learning - Seeing people holistically.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Seeing people holistically.pdf",[20,3.919,21,3.47,22,5.387]],["title/content/what_if_learning/What If Learning - Being challenged and changed.pdf",[23,3.133,24,3.763,25,2.86]],["author/content/what_if_learning/What If Learning - Being challenged and changed.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Being challenged and changed.pdf",[19,2.379,23,3.604,24,4.329,25,3.29,26,1.719]],["title/content/what_if_learning/What If Learning - Celebrating grace.pdf",[27,4.339,28,4.044]],["author/content/what_if_learning/What If Learning - Celebrating grace.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Celebrating grace.pdf",[27,4.937,28,4.602,29,3.039]],["title/content/what_if_learning/What If Learning - Appreciation and gratitude.pdf",[30,4.339,31,3.613]],["author/content/what_if_learning/What If Learning - Appreciation and gratitude.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Appreciation and gratitude.pdf",[2,2.901,30,3.655,31,3.042,32,3.987,33,3.987,34,3.406,35,3.655,36,3.987]],["title/content/what_if_learning/What If Learning - Delighting in God’s world.pdf",[10,2.86,11,2.645,37,2.86]],["author/content/what_if_learning/What If Learning - Delighting in God’s world.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Delighting in God’s world.pdf",[10,3.506,11,3.242,32,5.034,37,3.506]],["title/content/what_if_learning/What If Learning - Focused, loving attentiveness.pdf",[38,4.106,39,2.068,40,3.303]],["author/content/what_if_learning/What If Learning - Focused, loving attentiveness.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Focused, loving attentiveness.pdf",[38,4.45,39,2.241,40,3.58,41,3.099,42,5.013,43,2.766]],["title/content/what_if_learning/What If Learning - Respect and reverence.pdf",[43,2.943,44,4.734]],["author/content/what_if_learning/What If Learning - Respect and reverence.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Respect and reverence.pdf",[19,2.241,21,2.866,43,2.766,44,4.45,45,5.013,46,5.013]],["title/content/what_if_learning/What If Learning - Trust and affirming faith.pdf",[1,1.915,47,4.106,48,3.763]],["author/content/what_if_learning/What If Learning - Trust and affirming faith.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Trust and affirming faith.pdf",[1,2.203,47,4.724,48,4.329,49,5.322,50,4.035]],["title/content/what_if_learning/What If Learning - Humility and hospitality.pdf",[51,3.444,52,3.613]],["author/content/what_if_learning/What If Learning - Humility and hospitality.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Humility and hospitality.pdf",[16,4.614,50,4.3,51,3.662,52,3.841]],["title/content/what_if_learning/What If Learning - Seeking the good of others.pdf",[53,4.106,54,3.763,55,2.316]],["author/content/what_if_learning/What If Learning - Seeking the good of others.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Seeking the good of others.pdf",[20,2.303,26,1.152,39,1.594,41,2.204,55,1.785,56,2.546,57,1.476,58,3.566,59,3.165,60,3.165,61,2.901,62,3.566,63,3.566]],["title/content/what_if_learning/What If Learning - Finding worth through love.pdf",[39,1.825,64,4.084,65,3.624,66,2.637]],["author/content/what_if_learning/What If Learning - Finding worth through love.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Finding worth through love.pdf",[39,1.594,55,1.785,65,3.165,67,3.165,68,3.566,69,2.901,70,3.165,71,1.594,72,1.841,73,3.566,74,2.901,75,3.566,76,2.204]],["title/content/what_if_learning/What If Learning - Interdependence and community.pdf",[71,2.384,77,4.734]],["author/content/what_if_learning/What If Learning - Interdependence and community.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Interdependence and community.pdf",[19,2.008,71,2.008,78,4.492,79,2.901,80,2.667,81,1.956,82,3.042,83,2.901]],["title/content/what_if_learning/What If Learning - Love and forgiveness.pdf",[39,2.384,84,3.444]],["author/content/what_if_learning/What If Learning - Love and forgiveness.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Love and forgiveness.pdf",[39,2.379,84,3.437,85,3.604,86,4.724,87,4.724]],["title/content/what_if_learning/What If Learning - Hope and joy.pdf",[88,3.444,89,4.734]],["author/content/what_if_learning/What If Learning - Hope and joy.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Hope and joy.pdf",[26,1.474,41,1.828,88,1.909,89,2.624,90,2.956,91,2.624,92,2.956,93,2.956,94,2.624,95,2.956,96,2.956,97,2.624,98,2.956,99,2.956,100,1.909,101,2.624,102,2.956]],["title/content/what_if_learning/What If Learning - Self-control and peace.pdf",[103,3.303,104,4.106,105,3.303]],["author/content/what_if_learning/What If Learning - Self-control and peace.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Self-control and peace.pdf",[82,2.519,83,2.402,105,2.656,106,3.301,107,3.719,108,3.026,109,2.82,110,3.719,111,1.433,112,2.402,113,1.921,114,2.208]],["title/content/what_if_learning/What If Learning - Embracing responsibility.pdf",[34,4.044,115,5.334]],["author/content/what_if_learning/What If Learning - Embracing responsibility.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Embracing responsibility.pdf",[19,1.368,26,0.989,34,2.321,56,2.186,70,2.717,79,1.977,81,1.333,116,3.061,117,2.186,118,3.061,119,2.186,120,1.689,121,3.061,122,2.186,123,2.717,124,2.717,125,3.061]],["title/content/what_if_learning/What If Learning - Christian values and virtues.pdf",[72,2.389,126,3.303,127,3.303]],["author/content/what_if_learning/What If Learning - Christian values and virtues.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Christian values and virtues.pdf",[71,2.008,83,2.901,126,3.208,128,3.987,129,4.492,130,4.492,131,3.655,132,4.492]],["title/content/what_if_learning/What If Learning - Healing brokenness and seeking justice.pdf",[53,3.624,133,3.624,134,3.624,135,2.766]],["author/content/what_if_learning/What If Learning - Healing brokenness and seeking justice.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Healing brokenness and seeking justice.pdf",[83,2.51,87,3.449,119,2.775,133,3.449,134,3.449,135,2.632,136,3.449,137,2.775,138,2.632,139,2.947,140,3.886]],["title/content/what_if_learning/What If Learning - Encouragement and working for change.pdf",[25,2.86,41,2.86,141,3.763]],["author/content/what_if_learning/What If Learning - Encouragement and working for change.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Encouragement and working for change.pdf",[2,2.51,23,2.632,25,2.403,41,2.403,82,2.632,83,2.51,117,2.775,142,3.886,143,3.449,144,3.449,145,3.886]],["title/content/what_if_learning/What If Learning - Giving and serving others.pdf",[55,2.316,76,2.86,120,2.552]],["author/content/what_if_learning/What If Learning - Giving and serving others.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Giving and serving others.pdf",[26,1.064,79,2.127,80,2.942,83,2.127,103,2.352,120,3.286,146,2.127,147,2.924,148,3.294,149,2.68,150,2.127,151,3.294]],["title/content/what_if_learning/What If Learning - Theology.pdf",[72,2.389,152,4.106,153,2.316]],["author/content/what_if_learning/What If Learning - Theology.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Theology.pdf",[0,2.628,1,1.685,7,2.416,72,2.987,119,2.906,152,3.612,153,2.037,154,4.069,155,4.069]],["title/content/what_if_learning/What If Learning - Theology Faith.pdf",[1,1.915,72,2.389,153,2.316]],["author/content/what_if_learning/What If Learning - Theology Faith.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Theology Faith.pdf",[1,1.768,7,2.535,72,3.09,100,2.758,156,3.79,157,4.27,158,3.79,159,3.474]],["title/content/what_if_learning/What If Learning - Theology Hope.pdf",[72,2.389,88,2.987,153,2.316]],["author/content/what_if_learning/What If Learning - Theology Hope.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Theology Hope.pdf",[11,2.326,26,1.314,67,3.612,81,1.772,88,2.628,117,2.906,141,3.31,159,3.31,160,3.31,161,3.612]],["title/content/what_if_learning/What If Learning - Theology Love.pdf",[39,2.068,72,2.389,153,2.316]],["author/content/what_if_learning/What If Learning - Theology Love.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Theology Love.pdf",[11,2.126,19,1.663,36,3.301,40,2.656,55,1.862,74,3.026,81,1.62,103,2.656,162,3.719,163,3.719,164,3.026,165,3.301]],["title/content/what_if_learning/What If Learning - Christian Distinctives.pdf",[72,2.994,153,2.044,166,3.624]],["author/content/what_if_learning/What If Learning - Christian Distinctives.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Christian Distinctives.pdf",[19,2.535,72,2.928,146,3.662,166,5.034]],["title/content/what_if_learning/What If Learning - Background Research.pdf",[81,2.014,167,4.106,168,4.106]],["author/content/what_if_learning/What If Learning - Background Research.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Background Research.pdf",[81,2.643,167,5.387,168,5.387]],["title/content/what_if_learning/What If Learning - Christian Spirituality.pdf",[72,1.887,124,3.244,153,1.83,169,3.655,170,2.61]],["author/content/what_if_learning/What If Learning - Christian Spirituality.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Christian Spirituality.pdf",[7,2.667,19,2.008,26,1.451,72,2.32,100,2.901,156,3.987,170,3.208,171,4.492]],["title/content/what_if_learning/What If Learning - Spirituality and Teaching.pdf",[19,2.384,170,3.809]],["author/content/what_if_learning/What If Learning - Spirituality and Teaching.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Spirituality and Teaching.pdf",[2,3.237,19,2.241,26,1.619,119,3.58,131,4.078,161,4.45]],["title/content/what_if_learning/What If Learning - Virtues.pdf",[19,2.068,131,3.763,172,3.507]],["author/content/what_if_learning/What If Learning - Virtues.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Virtues.pdf",[1,1.768,26,1.379,39,1.909,41,2.64,88,2.758,127,3.049,172,3.238,173,3.474,174,4.27]],["title/content/what_if_learning/What If Learning - Art and Attentiveness.pdf",[40,3.303,175,4.283]],["author/content/what_if_learning/What If Learning - Art and Attentiveness.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Art and Attentiveness.pdf",[39,2.379,40,3.8,175,3.604,176,3.16,177,4.724]],["title/content/what_if_learning/What If Learning - Art and Hospitality.pdf",[52,3.133,175,4.283]],["author/content/what_if_learning/What If Learning - Art and Hospitality.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Art and Hospitality.pdf",[26,1.719,43,2.936,66,3.437,81,2.317,175,3.604]],["title/content/what_if_learning/What If Learning - Art & Beliefs.pdf",[175,4.283,178,4.106]],["author/content/what_if_learning/What If Learning - Art & Beliefs.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Art & Beliefs.pdf",[26,1.451,57,1.86,71,2.008,91,3.987,173,3.655,175,3.042,178,3.987,179,4.492]],["title/content/what_if_learning/What If Learning - Appreciation and Baking.pdf",[30,3.763,180,3.763,181,4.106]],["author/content/what_if_learning/What If Learning - Appreciation and Baking.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Appreciation and Baking.pdf",[8,3.58,26,1.619,57,2.075,181,4.45,182,4.078,183,4.45]],["title/content/what_if_learning/What If Learning - Cooking and Honoring.pdf",[8,3.303,180,5.145]],["author/content/what_if_learning/What If Learning - Cooking and Honoring.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Cooking and Honoring.pdf",[8,3.8,26,1.719,57,2.203,180,4.329,183,4.724]],["title/content/what_if_learning/What If Learning - Dance and Forgiveness.pdf",[84,2.987,184,5.613]],["author/content/what_if_learning/What If Learning - Dance and Forgiveness.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Dance and Forgiveness.pdf",[26,1.719,84,3.437,184,4.724,185,4.724,186,4.724]],["title/content/what_if_learning/What If Learning - Design and Humility.pdf",[51,2.987,114,2.746,187,3.133]],["author/content/what_if_learning/What If Learning - Design and Humility.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Design and Humility.pdf",[51,3.662,55,2.839,114,3.367,188,2.756]],["title/content/what_if_learning/What If Learning - Design and Communities.pdf",[71,2.068,114,2.746,187,3.133]],["author/content/what_if_learning/What If Learning - Design and Communities.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Design and Communities.pdf",[71,2.535,76,3.506,114,3.367,187,3.841]],["title/content/what_if_learning/What If Learning - Design and Contentment.pdf",[108,3.763,114,2.746,187,3.133]],["author/content/what_if_learning/What If Learning - Design and Contentment.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Design and Contentment.pdf",[26,1.619,57,2.075,108,4.078,176,2.977,188,2.436,189,5.013]],["title/content/what_if_learning/What If Learning - Design and Delight.pdf",[37,2.86,114,2.746,187,3.133]],["author/content/what_if_learning/What If Learning - Design and Delight.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Design and Delight.pdf",[37,3.29,55,2.664,114,3.16,187,3.604,190,4.724]],["title/content/what_if_learning/What If Learning - Drama and Others.pdf",[55,2.316,191,5.613]],["author/content/what_if_learning/What If Learning - Drama and Others.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Drama and Others.pdf",[55,3.039,103,4.334,191,5.387]],["title/content/what_if_learning/What If Learning - Literature and Grace.pdf",[28,3.507,192,2.316,193,3.507]],["author/content/what_if_learning/What If Learning - Literature and Grace.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Literature and Grace.pdf",[28,4.035,85,3.604,194,4.329,195,3.437,196,5.322]],["title/content/what_if_learning/What If Learning - Loving Texts.pdf",[39,2.068,192,2.316,194,3.763]],["author/content/what_if_learning/What If Learning - Loving Texts.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Loving Texts.pdf",[39,2.535,81,2.469,194,4.614,197,5.034]],["title/content/what_if_learning/What If Learning - Poetry and Revenge.pdf",[192,2.316,198,3.133,199,4.106]],["author/content/what_if_learning/What If Learning - Poetry and Revenge.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Poetry and Revenge.pdf",[26,1.619,106,4.45,188,2.436,198,3.395,199,4.45,200,3.801]],["title/content/what_if_learning/What If Learning - Literature and Choices.pdf",[122,3.303,192,2.316,193,3.507]],["author/content/what_if_learning/What If Learning - Literature and Choices.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Literature and Choices.pdf",[26,1.619,29,2.51,57,2.075,122,3.58,188,2.436,193,3.801]],["title/content/what_if_learning/What If Learning - Literature and Faith.pdf",[1,1.915,192,2.316,193,3.507]],["author/content/what_if_learning/What If Learning - Literature and Faith.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Literature and Faith.pdf",[1,2.075,146,3.237,176,2.977,201,5.013,202,4.078,203,5.013]],["title/content/what_if_learning/What If Learning - Poetry and Hope.pdf",[88,2.987,192,2.316,198,3.133]],["author/content/what_if_learning/What If Learning - Poetry and Hope.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Poetry and Hope.pdf",[25,3.29,26,1.719,57,2.203,188,2.586,204,4.724]],["title/content/what_if_learning/What If Learning - Writing About Others.pdf",[55,2.316,192,2.316,205,3.763]],["author/content/what_if_learning/What If Learning - Writing About Others.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Writing About Others.pdf",[26,1.531,39,2.118,66,3.06,81,2.063,103,3.383,104,4.206,205,3.855]],["title/content/what_if_learning/What If Learning - Grammar and Encouragement.pdf",[41,2.86,192,2.316,206,3.507]],["author/content/what_if_learning/What If Learning - Grammar and Encouragement.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Grammar and Encouragement.pdf",[48,4.614,206,4.3,207,2.605,208,5.034]],["title/content/what_if_learning/What If Learning - Poetry and Delight.pdf",[37,2.86,192,2.316,198,3.133]],["author/content/what_if_learning/What If Learning - Poetry and Delight.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Poetry and Delight.pdf",[37,3.752,198,4.11,209,6.069]],["title/content/what_if_learning/What If Learning - Words as Gifts.pdf",[35,3.763,192,2.316,210,2.86]],["author/content/what_if_learning/What If Learning - Words as Gifts.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Words as Gifts.pdf",[29,2.839,35,4.614,192,2.839,210,3.506]],["title/content/what_if_learning/What If Learning - Plot and Choices.pdf",[122,3.303,192,2.316,211,4.106]],["author/content/what_if_learning/What If Learning - Plot and Choices.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Plot and Choices.pdf",[85,3.604,128,4.724,176,3.16,211,4.724,212,5.322]],["title/content/what_if_learning/What If Learning - Faith and Poetry.pdf",[1,1.915,192,2.316,198,3.133]],["author/content/what_if_learning/What If Learning - Faith and Poetry.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Faith and Poetry.pdf",[0,3.437,10,3.29,204,4.724,213,5.322,214,4.329]],["title/content/what_if_learning/What If Learning - Book Week.pdf",[192,2.316,215,4.106,216,4.106]],["author/content/what_if_learning/What If Learning - Book Week.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Book Week.pdf",[31,3.841,120,3.129,215,5.034,216,5.034]],["title/content/what_if_learning/What If Learning - Music and Respect.pdf",[43,2.552,217,4.516]],["author/content/what_if_learning/What If Learning - Music and Respect.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Music and Respect.pdf",[43,2.936,57,2.203,217,3.8,218,4.035,219,5.322]],["title/content/what_if_learning/What If Learning - Music and Creativity.pdf",[214,3.763,217,4.516]],["author/content/what_if_learning/What If Learning - Music and Creativity.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Music and Creativity.pdf",[188,2.436,200,3.801,214,4.078,217,3.58,218,3.801,220,5.013]],["title/content/what_if_learning/What If Learning - Singing and Humility.pdf",[51,2.987,217,3.303,221,4.106]],["author/content/what_if_learning/What If Learning - Singing and Humility.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Singing and Humility.pdf",[51,3.662,77,5.034,221,5.034,222,5.671]],["title/content/what_if_learning/What If Learning - Guests in God’s World.pdf",[10,2.524,11,2.335,223,3.322,224,4.084]],["author/content/what_if_learning/What If Learning - Guests in God’s World.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Guests in God’s World.pdf",[225,4.724,226,3.8,227,4.724,228,4.724,229,5.322]],["title/content/what_if_learning/What If Learning - Gods World.pdf",[10,2.86,11,2.645,223,3.763]],["author/content/what_if_learning/What If Learning - Gods World.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Gods World.pdf",[10,3.099,11,3.817,225,4.45,226,3.58,227,4.45]],["title/content/what_if_learning/What If Learning - Maps and Values.pdf",[112,2.987,126,3.303,230,3.763]],["author/content/what_if_learning/What If Learning - Maps and Values.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Maps and Values.pdf",[26,1.719,57,2.203,126,3.8,188,2.586,230,4.329]],["title/content/what_if_learning/What If Learning - Geography and Faith.pdf",[1,1.915,112,4.084]],["author/content/what_if_learning/What If Learning - Geography and Faith.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Geography and Faith.pdf",[21,2.866,112,3.237,146,3.237,170,3.58,231,4.45,232,5.013]],["title/content/what_if_learning/What If Learning - Geography and Justice.pdf",[112,4.084,135,3.133]],["author/content/what_if_learning/What If Learning - Geography and Justice.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Geography and Justice.pdf",[233,4.614,234,4.614,235,5.034,236,4.614]],["title/content/what_if_learning/What If Learning - Migration Stories.pdf",[112,2.987,234,3.763,236,3.763]],["author/content/what_if_learning/What If Learning - Migration Stories.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Migration Stories.pdf",[233,4.614,234,4.614,235,5.034,236,4.614]],["title/content/what_if_learning/What If Learning - Maps and Local Needs.pdf",[112,2.637,230,3.322,237,3.624,238,4.084]],["author/content/what_if_learning/What If Learning - Maps and Local Needs.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Maps and Local Needs.pdf",[20,2.901,21,2.568,57,1.86,146,2.901,218,3.406,237,3.987,239,4.492,240,4.492]],["title/content/what_if_learning/What If Learning - Treaties and Virtues.pdf",[111,1.782,127,3.303,241,4.106]],["author/content/what_if_learning/What If Learning - Treaties and Virtues.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Treaties and Virtues.pdf",[66,3.06,84,3.06,85,3.209,105,3.383,111,1.825,135,3.209,241,4.206]],["title/content/what_if_learning/What If Learning - Flawed Reformers.pdf",[111,1.782,242,4.106,243,4.626]],["author/content/what_if_learning/What If Learning - Flawed Reformers.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Flawed Reformers.pdf",[21,3.242,79,3.662,80,3.367,242,5.034]],["title/content/what_if_learning/What If Learning - History and Wealth.pdf",[111,2.062,117,2.61,149,2.973,244,3.655]],["author/content/what_if_learning/What If Learning - History and Wealth.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - History and Wealth.pdf",[80,3.16,111,2.05,149,4.329,245,4.724,246,4.724]],["title/content/what_if_learning/What If Learning - History and Changes.pdf",[25,2.86,111,2.436]],["author/content/what_if_learning/What If Learning - History and Changes.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - History and Changes.pdf",[23,3.841,25,3.506,111,2.185,144,5.034]],["title/content/what_if_learning/What If Learning - History and Communities.pdf",[71,2.068,111,2.436]],["author/content/what_if_learning/What If Learning - History and Communities.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - History and Communities.pdf",[71,2.713,111,2.338,247,6.069]],["title/content/what_if_learning/What If Learning - History and Virtues.pdf",[111,2.436,127,3.303]],["author/content/what_if_learning/What If Learning - History and Virtues.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - History and Virtues.pdf",[51,3.06,86,4.206,111,1.825,123,4.206,135,3.209,226,3.383,248,4.739]],["title/content/what_if_learning/What If Learning - History and Faith.pdf",[1,1.915,111,2.436]],["author/content/what_if_learning/What If Learning - History and Faith.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - History and Faith.pdf",[19,2.241,111,1.931,170,3.58,202,4.078,249,4.45,250,5.013]],["title/content/what_if_learning/What If Learning - History and Poverty.pdf",[111,2.436,246,4.106]],["author/content/what_if_learning/What If Learning - History and Poverty.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - History and Poverty.pdf",[26,1.719,39,2.379,111,2.05,251,4.329,252,4.329]],["title/content/what_if_learning/What If Learning - Loving a City.pdf",[39,2.068,111,1.782,252,3.763]],["author/content/what_if_learning/What If Learning - Loving a City.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Loving a City.pdf",[26,1.719,39,2.379,111,2.05,251,4.329,252,4.329]],["title/content/what_if_learning/What If Learning - History and Change.pdf",[25,2.86,111,2.436]],["author/content/what_if_learning/What If Learning - History and Change.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - History and Change.pdf",[79,3.919,80,3.603,111,2.338]],["title/content/what_if_learning/What If Learning - Righting Historical Wrongs.pdf",[111,1.573,253,4.084,254,3.624,255,4.084]],["author/content/what_if_learning/What If Learning - Righting Historical Wrongs.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Righting Historical Wrongs.pdf",[7,2.667,29,2.249,111,1.73,137,3.208,256,4.492,257,6.199,258,3.987]],["title/content/what_if_learning/What If Learning - The Meaning of Time.pdf",[7,2.746,111,1.782,150,2.987]],["author/content/what_if_learning/What If Learning - The Meaning of Time.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - The Meaning of Time.pdf",[57,1.962,80,2.813,111,1.825,150,3.06,188,2.303,218,3.593,259,4.739]],["title/content/what_if_learning/What If Learning - Computers and Humans.pdf",[260,5.613,261,4.106]],["author/content/what_if_learning/What If Learning - Computers and Humans.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Computers and Humans.pdf",[23,3.395,57,2.075,188,2.436,207,2.302,260,4.45,261,4.45]],["title/content/what_if_learning/What If Learning - Pie Charts and Truth.pdf",[262,1.733,263,3.096,264,3.096,265,3.624]],["author/content/what_if_learning/What If Learning - Pie Charts and Truth.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Pie Charts and Truth.pdf",[263,4.3,264,4.3,265,5.034,266,5.671]],["title/content/what_if_learning/What If Learning - Math and Justice.pdf",[135,3.133,262,2.684]],["author/content/what_if_learning/What If Learning - Math and Justice.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Math and Justice.pdf",[19,2.535,100,3.662,249,5.034,267,4.614]],["title/content/what_if_learning/What If Learning - Community and Math.pdf",[71,2.068,262,2.684]],["author/content/what_if_learning/What If Learning - Community and Math.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Community and Math.pdf",[71,2.535,262,2.407,268,5.034,269,5.671]],["title/content/what_if_learning/What If Learning - Math and Forgiveness.pdf",[84,2.987,262,2.684]],["author/content/what_if_learning/What If Learning - Math and Forgiveness.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Math and Forgiveness.pdf",[84,3.662,262,2.407,270,5.671,271,5.671]],["title/content/what_if_learning/What If Learning - Pie Charts and Giving.pdf",[120,2.253,262,1.733,263,3.096,264,3.096]],["author/content/what_if_learning/What If Learning - Pie Charts and Giving.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Pie Charts and Giving.pdf",[0,3.437,79,3.437,120,2.936,263,4.035,264,4.035]],["title/content/what_if_learning/What If Learning - Math and Giving.pdf",[120,2.552,262,2.684]],["author/content/what_if_learning/What If Learning - Math and Giving.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Math and Giving.pdf",[26,1.619,57,2.075,120,2.766,188,2.436,207,2.302,262,2.128]],["title/content/what_if_learning/What If Learning - Math and Measuring.pdf",[262,2.684,272,4.106]],["author/content/what_if_learning/What If Learning - Math and Measuring.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Math and Measuring.pdf",[15,3.662,262,2.407,272,5.034,273,5.034]],["title/content/what_if_learning/What If Learning - Graphs and Delight.pdf",[37,2.86,262,1.963,274,4.106]],["author/content/what_if_learning/What If Learning - Graphs and Delight.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Graphs and Delight.pdf",[37,3.29,55,2.664,81,2.317,274,4.724,275,4.724]],["title/content/what_if_learning/What If Learning - Percentages and Injustice.pdf",[262,1.963,267,3.763,276,4.106]],["author/content/what_if_learning/What If Learning - Percentages and Injustice.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Percentages and Injustice.pdf",[19,2.241,26,1.619,200,3.801,267,4.078,276,4.45,277,5.013]],["title/content/what_if_learning/What If Learning - Math Questions.pdf",[15,2.987,262,2.684]],["author/content/what_if_learning/What If Learning - Math Questions.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Math Questions.pdf",[14,3.801,15,3.237,26,1.619,60,4.45,262,2.128,278,5.013]],["title/content/what_if_learning/What If Learning - Serving through Words.pdf",[66,2.36,76,2.26,210,2.26,279,2.17,280,1.83]],["author/content/what_if_learning/What If Learning - Serving through Words.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Serving through Words.pdf",[43,2.936,81,2.317,120,2.936,281,5.322,282,5.322]],["title/content/what_if_learning/What If Learning - Words and Care.pdf",[164,3.322,210,2.524,279,2.424,280,2.044]],["author/content/what_if_learning/What If Learning - Words and Care.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Words and Care.pdf",[29,2.372,55,2.372,122,3.383,137,3.383,164,3.855,210,2.929,280,2.372]],["title/content/what_if_learning/What If Learning - Languages and Hospitality.pdf",[52,2.766,279,2.424,280,2.903]],["author/content/what_if_learning/What If Learning - Languages and Hospitality.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Languages and Hospitality.pdf",[29,2.664,52,3.604,280,2.664,283,4.329,284,5.322]],["title/content/what_if_learning/What If Learning - Failure and Community.pdf",[71,1.825,279,2.424,280,2.044,285,3.624]],["author/content/what_if_learning/What If Learning - Failure and Community.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Failure and Community.pdf",[76,3.506,285,5.034,286,5.034,287,5.671]],["title/content/what_if_learning/What If Learning - What is Love.pdf",[39,2.068,279,2.746,280,2.316]],["author/content/what_if_learning/What If Learning - What is Love.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - What is Love.pdf",[39,2.241,185,4.45,207,2.302,280,2.51,283,4.078,288,3.58]],["title/content/what_if_learning/What If Learning - Grammar and Giving.pdf",[120,2.253,206,3.096,279,2.424,280,2.044]],["author/content/what_if_learning/What If Learning - Grammar and Giving.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Grammar and Giving.pdf",[24,4.614,59,5.034,206,4.3,207,2.605]],["title/content/what_if_learning/What If Learning - French and Hospitality.pdf",[52,2.766,279,2.424,280,2.044,289,3.624]],["author/content/what_if_learning/What If Learning - French and Hospitality.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - French and Hospitality.pdf",[29,2.51,94,4.45,182,4.078,289,4.45,290,5.013,291,5.013]],["title/content/what_if_learning/What If Learning - Language and Community.pdf",[71,1.825,279,2.424,280,2.903]],["author/content/what_if_learning/What If Learning - Language and Community.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Language and Community.pdf",[26,1.619,57,2.075,71,2.241,143,4.45,188,2.436,280,2.51]],["title/content/what_if_learning/What If Learning  - Languages and Relationships.pdf",[69,3.322,279,2.424,280,2.903]],["author/content/what_if_learning/What If Learning  - Languages and Relationships.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning  - Languages and Relationships.pdf",[41,2.929,54,3.855,69,3.855,182,3.855,207,2.176,280,2.372,283,3.855]],["title/content/what_if_learning/What If Learning - Bodies and People.pdf",[21,2.335,153,2.044,292,2.637,293,4.084]],["author/content/what_if_learning/What If Learning - Bodies and People.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Bodies and People.pdf",[26,1.619,57,2.075,153,2.51,200,3.801,288,3.58,292,3.237]],["title/content/what_if_learning/What If Learning - Addressing Fears.pdf",[153,2.044,292,2.637,294,3.624,295,3.624]],["author/content/what_if_learning/What If Learning - Addressing Fears.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Addressing Fears.pdf",[26,1.619,57,2.075,153,2.51,292,3.237,294,4.45,295,4.45]],["title/content/what_if_learning/What If Learning - Sport and Restraint.pdf",[153,2.044,292,2.637,296,3.322,297,3.624]],["author/content/what_if_learning/What If Learning - Sport and Restraint.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Sport and Restraint.pdf",[172,4.3,296,4.614,297,5.034,298,5.671]],["title/content/what_if_learning/What If Learning - Teams and Individuals.pdf",[153,2.044,292,2.637,299,4.084,300,4.084]],["author/content/what_if_learning/What If Learning - Teams and Individuals.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Teams and Individuals.pdf",[27,4.614,55,2.839,301,5.671,302,5.034]],["title/content/what_if_learning/What If Learning - Sport and Respect.pdf",[43,2.253,153,2.044,292,2.637,296,3.322]],["author/content/what_if_learning/What If Learning - Sport and Respect.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Sport and Respect.pdf",[43,2.766,117,3.58,137,3.58,303,5.013,304,5.013,305,5.013]],["title/content/what_if_learning/What If Learning - Words and Actions.pdf",[139,3.507,210,2.86,306,2.987]],["author/content/what_if_learning/What If Learning - Words and Actions.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Words and Actions.pdf",[139,3.593,190,4.206,210,2.929,307,4.206,308,3.855,309,4.206,310,4.739]],["title/content/what_if_learning/What If Learning - Blessings and religion class.pdf",[29,2.044,306,2.637,311,3.624,312,4.084]],["author/content/what_if_learning/What If Learning - Blessings and religion class.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Blessings and religion class.pdf",[23,3.395,55,2.51,81,2.183,311,5.927,313,4.45]],["title/content/what_if_learning/What If Learning - Strength and Weakness.pdf",[306,2.987,314,4.626,315,4.626]],["author/content/what_if_learning/What If Learning - Strength and Weakness.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Strength and Weakness.pdf",[20,3.06,57,1.962,138,3.209,316,4.739,317,4.739,318,4.739,319,4.739]],["title/content/what_if_learning/What If Learning - Anxiety and Peace.pdf",[105,3.303,306,2.987,320,4.106]],["author/content/what_if_learning/What If Learning - Anxiety and Peace.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Anxiety and Peace.pdf",[105,4.334,150,3.919,321,6.069]],["title/content/what_if_learning/What If Learning - Responsibility and Community.pdf",[34,3.507,71,2.068,306,2.987]],["author/content/what_if_learning/What If Learning - Responsibility and Community.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Responsibility and Community.pdf",[0,3.237,139,3.801,210,3.099,307,4.45,308,4.078,309,4.45]],["title/content/what_if_learning/What If Learning - Rules and Virtues.pdf",[127,3.303,306,2.987,322,3.507]],["author/content/what_if_learning/What If Learning - Rules and Virtues.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Rules and Virtues.pdf",[2,3.662,322,4.3,323,4.3,324,5.671]],["title/content/what_if_learning/What If Learning - Rules and Community.pdf",[71,2.068,306,2.987,322,3.507]],["author/content/what_if_learning/What If Learning - Rules and Community.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Rules and Community.pdf",[29,2.664,226,3.8,322,4.035,325,4.724,326,4.329]],["title/content/what_if_learning/What If Learning - Faith and Life.pdf",[1,1.69,2,2.637,29,2.044,327,2.916]],["author/content/what_if_learning/What If Learning - Faith and Life.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Faith and Life.pdf",[1,2.075,97,4.45,100,3.237,177,4.45,286,4.45,328,5.013]],["title/content/what_if_learning/What If Learning - Reason and Faith.pdf",[1,1.69,29,2.044,327,2.916,329,3.322]],["author/content/what_if_learning/What If Learning - Reason and Faith.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Reason and Faith.pdf",[1,2.075,29,2.51,141,4.078,326,4.078,327,3.58,329,4.078]],["title/content/what_if_learning/What If Learning - What Tests Teach.pdf",[19,1.825,29,2.044,327,2.916,330,2.916]],["author/content/what_if_learning/What If Learning - What Tests Teach.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - What Tests Teach.pdf",[18,3.855,56,3.383,57,1.962,81,2.063,188,2.303,331,4.739,332,4.739]],["title/content/what_if_learning/What If Learning - Patterns and Wonder.pdf",[9,2.746,113,2.389,333,4.626]],["author/content/what_if_learning/What If Learning - Patterns and Wonder.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Patterns and Wonder.pdf",[9,3.367,81,2.469,275,5.034,334,5.671]],["title/content/what_if_learning/What If Learning - Chemistry and Wonder.pdf",[9,2.746,113,2.389,335,4.106]],["author/content/what_if_learning/What If Learning - Chemistry and Wonder.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Chemistry and Wonder.pdf",[9,3.603,335,5.387,336,6.069]],["title/content/what_if_learning/What If Learning - Meeting Parents.pdf",[113,2.389,337,4.106,338,4.106]],["author/content/what_if_learning/What If Learning - Meeting Parents.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Meeting Parents.pdf",[16,4.329,88,3.437,337,4.724,338,4.724,339,5.322]],["title/content/what_if_learning/What If Learning - Faith and Science.pdf",[1,1.915,113,3.266]],["author/content/what_if_learning/What If Learning - Faith and Science.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Faith and Science.pdf",[1,2.075,14,3.801,109,3.801,113,2.589,126,3.58,273,4.45]],["title/content/what_if_learning/What If Learning - Nothing But Atoms.pdf",[113,2.389,340,4.626,341,4.106]],["author/content/what_if_learning/What If Learning - Nothing But Atoms.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Nothing But Atoms.pdf",[113,2.589,207,2.302,341,4.45,342,4.45,343,5.013,344,3.58]],["title/content/what_if_learning/What If Learning - Seeing Connections.pdf",[0,2.987,20,2.987,113,2.389]],["author/content/what_if_learning/What If Learning - Seeing Connections.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Seeing Connections.pdf",[11,2.709,20,3.06,26,1.531,57,1.962,325,4.206,345,4.739,346,4.206]],["title/content/what_if_learning/What If Learning - Plants and Wonder.pdf",[9,2.746,113,2.389,347,4.106]],["author/content/what_if_learning/What If Learning - Plants and Wonder.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Plants and Wonder.pdf",[136,4.724,226,3.8,346,4.724,347,4.724,348,4.724]],["title/content/what_if_learning/What If Learning - Magnets and Wonder.pdf",[9,2.746,113,2.389,349,4.106]],["author/content/what_if_learning/What If Learning - Magnets and Wonder.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Magnets and Wonder.pdf",[9,3.16,12,4.329,207,2.444,251,4.329,349,4.724]],["title/content/what_if_learning/What If Learning - Teaching and Gratitude.pdf",[19,2.068,31,3.133,56,3.303]],["author/content/what_if_learning/What If Learning - Teaching and Gratitude.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Teaching and Gratitude.pdf",[19,2.713,31,4.11,350,6.069]],["title/content/what_if_learning/What If Learning  - Posture and Respect.pdf",[43,2.552,56,3.303,351,4.106]],["author/content/what_if_learning/What If Learning  - Posture and Respect.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning  - Posture and Respect.pdf",[43,2.766,50,3.801,57,2.075,351,4.45,352,5.013,353,5.013]],["title/content/what_if_learning/What If Learning - Triumphs and Disasters.pdf",[330,3.303,354,4.626,355,4.626]],["author/content/what_if_learning/What If Learning - Triumphs and Disasters.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Triumphs and Disasters.pdf",[26,1.451,29,2.249,137,3.208,165,3.987,208,3.987,356,4.492,357,4.492,358,4.492]],["title/content/what_if_learning/What If Learning - Rewarding Perseverance.pdf",[330,3.303,359,4.626,360,4.106]],["author/content/what_if_learning/What If Learning - Rewarding Perseverance.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Rewarding Perseverance.pdf",[302,5.387,360,5.387,361,6.069]],["title/content/what_if_learning/What If Learning - Tests and Gratitude.pdf",[31,3.133,330,4.516]],["author/content/what_if_learning/What If Learning - Tests and Gratitude.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Tests and Gratitude.pdf",[33,5.034,74,4.614,320,5.034,330,4.049]],["title/content/what_if_learning/What If Learning - Transportation and Service.pdf",[138,3.133,362,4.106,363,4.626]],["author/content/what_if_learning/What If Learning - Transportation and Service.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Transportation and Service.pdf",[26,1.619,66,3.237,76,3.099,81,2.183,176,2.977,362,4.45]],["title/content/what_if_learning/What If Learning - Serving the Community.pdf",[71,2.068,76,2.86,138,3.133]],["author/content/what_if_learning/What If Learning - Serving the Community.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/what_if_learning/What If Learning - Serving the Community.pdf",[21,2.866,57,2.075,71,2.241,76,3.099,138,3.395,313,4.45]],["title/content/kuyers/psychfaithman2.pdf",[1,1.69,81,1.778,364,3.624,365,3.624]],["author/content/kuyers/psychfaithman2.pdf",[366,2.67,367,2.67,368,2.67,369,2.67,370,2.67,371,2.67,372,2.67,373,2.67,374,2.67,375,2.67,376,2.67]],["abstract/content/kuyers/psychfaithman2.pdf",[1,0.56,3,0.002,4,0.002,6,0.002,19,1.065,26,0.234,50,0.55,72,0.981,81,0.827,82,0.491,113,0.374,114,0.43,138,0.916,147,0.643,172,1.025,186,0.643,195,0.468,197,0.643,202,1.1,205,0.59,258,0.643,268,0.643,323,0.55,326,0.59,327,0.518,342,0.643,344,1.356,364,2.114,365,2.833,377,0.725,378,0.725,379,1.352,380,0.725,381,1.899,382,0.725,383,0.725,384,1.899,385,0.725,386,0.725,387,0.725,388,0.59,389,0.725,390,0.725,391,0.725,392,1.352,393,1.352,394,0.725,395,0.725,396,0.725,397,0.725,398,0.725,399,1.352,400,1.899,401,0.643,402,0.725,403,0.725,404,0.725,405,0.725,406,0.725,407,0.725,408,0.725,409,0.725,410,0.725,411,0.725,412,0.725,413,0.725,414,0.725,415,0.725,416,0.725,417,0.725,418,0.725,419,0.725,420,0.725,421,0.725,422,0.725,423,0.725,424,0.725]],["title/content/mathematics/kuyers/math-lesson1.pdf",[176,3.167,262,2.264]],["author/content/mathematics/kuyers/math-lesson1.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/mathematics/kuyers/math-lesson1.pdf",[21,1.364,54,1.94,82,1.615,100,1.54,146,1.54,173,1.94,176,2.876,188,1.159,195,1.54,207,1.095,228,2.117,254,2.117,262,2.59,329,1.94,344,1.703,425,3.851,426,2.385,427,2.117]],["title/content/mathematics/kuyers/math-lesson2.pdf",[344,2.916,428,2.916,429,3.624,430,4.084]],["author/content/mathematics/kuyers/math-lesson2.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/mathematics/kuyers/math-lesson2.pdf",[21,1.364,81,1.039,83,1.54,100,1.54,158,2.117,188,1.159,207,1.095,262,1.635,344,2.75,427,2.117,428,1.703,429,3.418,431,2.117,432,2.385,433,2.385,434,2.385,435,2.385,436,2.385,437,2.385,438,2.385,439,2.385,440,2.385]],["title/content/mathematics/kuyers/math-lesson3.pdf",[441,4.734,442,4.734]],["author/content/mathematics/kuyers/math-lesson3.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/mathematics/kuyers/math-lesson3.pdf",[85,1.761,207,1.194,308,2.116,348,2.308,441,3.663,442,4.554,443,2.6,444,2.6,445,2.6,446,2.6,447,2.6,448,2.6,449,2.308,450,2.6,451,2.6,452,2.6,453,2.6,454,2.6,455,2.6]],["title/content/mathematics/kuyers/math-lesson4.pdf",[456,4.734,457,4.339]],["author/content/mathematics/kuyers/math-lesson4.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/mathematics/kuyers/math-lesson4.pdf",[80,1.643,82,1.874,85,1.874,101,2.456,160,2.251,176,1.643,195,1.787,207,1.271,233,2.251,456,3.847,457,3.526,458,4.334,459,2.767,460,2.767,461,2.767,462,2.767,463,2.767]],["title/content/mathematics/kuyers/math-lesson5.pdf",[207,2.45,464,4.734]],["author/content/mathematics/kuyers/math-lesson5.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/mathematics/kuyers/math-lesson5.pdf",[66,1.499,119,1.657,176,1.378,188,1.128,231,4.22,288,1.657,401,3.344,464,3.344,465,2.321,466,2.321,467,2.321,468,2.321,469,1.76,470,2.06,471,2.321,472,2.321,473,2.321,474,2.321,475,2.321,476,2.321,477,2.321,478,2.321]],["title/content/mathematics/kuyers/math-lesson6.pdf",[428,3.809,479,5.334]],["author/content/mathematics/kuyers/math-lesson6.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/mathematics/kuyers/math-lesson6.pdf",[79,1.46,80,1.342,81,0.984,120,1.247,146,1.46,150,1.46,160,1.839,195,1.46,207,1.038,223,1.839,245,2.006,428,1.614,457,1.839,469,1.714,480,2.26,481,2.26,482,3.687,483,2.26,484,2.26,485,3.687,486,2.26,487,1.839,488,2.26,489,2.26,490,2.26]],["title/content/mathematics/kuyers/math-lesson7.pdf",[195,2.637,262,1.733,288,2.916,491,3.624]],["author/content/mathematics/kuyers/math-lesson7.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/mathematics/kuyers/math-lesson7.pdf",[80,1.643,113,1.429,159,2.251,195,2.799,207,1.271,262,1.174,288,1.976,428,1.976,431,2.456,449,2.456,470,2.456,491,2.456,492,2.767,493,2.767,494,2.767,495,2.767,496,2.767,497,2.767,498,2.767]],["title/content/mathematics/kuyers/math-lesson8.pdf",[499,4.339,500,5.334]],["author/content/mathematics/kuyers/math-lesson8.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/mathematics/kuyers/math-lesson8.pdf",[15,1.679,61,3.357,109,3.129,150,1.679,207,1.194,323,3.129,388,2.116,469,3.129,487,2.116,499,2.116,501,2.308,502,2.308,503,3.663,504,2.308,505,2.308,506,2.308,507,2.308]],["title/content/mathematics/kuyers/math-lesson9.pdf",[508,5.334,509,5.334]],["author/content/mathematics/kuyers/math-lesson9.pdf",[3,0.011,4,0.011,5,0.018,6,0.011]],["abstract/content/mathematics/kuyers/math-lesson9.pdf",[15,1.679,61,3.357,109,3.129,150,1.679,207,1.194,323,3.129,388,2.116,469,3.129,487,2.116,499,2.116,501,2.308,502,2.308,503,3.663,504,2.308,505,2.308,506,2.308,507,2.308]]],"invertedIndex":[["2004",{"_index":498,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson7.pdf":{}}}],["abil",{"_index":212,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Plot and Choices.pdf":{}}}],["achiev",{"_index":269,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Community and Math.pdf":{}}}],["acknowledg",{"_index":302,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Teams and Individuals.pdf":{},"content/what_if_learning/What If Learning - Rewarding Perseverance.pdf":{}}}],["action",{"_index":139,"title":{"content/what_if_learning/What If Learning - Words and Actions.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Healing brokenness and seeking justice.pdf":{},"content/what_if_learning/What If Learning - Words and Actions.pdf":{},"content/what_if_learning/What If Learning - Responsibility and Community.pdf":{}}}],["activ",{"_index":364,"title":{"content/kuyers/psychfaithman2.pdf":{}},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["address",{"_index":294,"title":{"content/what_if_learning/What If Learning - Addressing Fears.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Addressing Fears.pdf":{}}}],["advertis",{"_index":189,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Design and Contentment.pdf":{}}}],["affirm",{"_index":48,"title":{"content/what_if_learning/What If Learning - Trust and affirming faith.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Trust and affirming faith.pdf":{},"content/what_if_learning/What If Learning - Grammar and Encouragement.pdf":{}}}],["agent",{"_index":144,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Encouragement and working for change.pdf":{},"content/what_if_learning/What If Learning - History and Changes.pdf":{}}}],["allow",{"_index":121,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Embracing responsibility.pdf":{}}}],["alreadi",{"_index":392,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["ancillari",{"_index":380,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["anger",{"_index":106,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Self-control and peace.pdf":{},"content/what_if_learning/What If Learning - Poetry and Revenge.pdf":{}}}],["anim",{"_index":473,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson5.pdf":{}}}],["anxieti",{"_index":320,"title":{"content/what_if_learning/What If Learning - Anxiety and Peace.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Tests and Gratitude.pdf":{}}}],["appear",{"_index":454,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson3.pdf":{}}}],["appli",{"_index":389,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["appreci",{"_index":30,"title":{"content/what_if_learning/What If Learning - Appreciation and gratitude.pdf":{},"content/what_if_learning/What If Learning - Appreciation and Baking.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Appreciation and gratitude.pdf":{}}}],["area",{"_index":239,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Maps and Local Needs.pdf":{}}}],["aris",{"_index":110,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Self-control and peace.pdf":{}}}],["around",{"_index":248,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - History and Virtues.pdf":{}}}],["art",{"_index":175,"title":{"content/what_if_learning/What If Learning - Art and Attentiveness.pdf":{},"content/what_if_learning/What If Learning - Art and Hospitality.pdf":{},"content/what_if_learning/What If Learning - Art & Beliefs.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Art and Attentiveness.pdf":{},"content/what_if_learning/What If Learning - Art and Hospitality.pdf":{},"content/what_if_learning/What If Learning - Art & Beliefs.pdf":{}}}],["ask",{"_index":278,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Math Questions.pdf":{}}}],["assign",{"_index":420,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["assist",{"_index":382,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["atom",{"_index":341,"title":{"content/what_if_learning/What If Learning - Nothing But Atoms.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Nothing But Atoms.pdf":{}}}],["attent",{"_index":40,"title":{"content/what_if_learning/What If Learning - Focused, loving attentiveness.pdf":{},"content/what_if_learning/What If Learning - Art and Attentiveness.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Focused, loving attentiveness.pdf":{},"content/what_if_learning/What If Learning - Theology Love.pdf":{},"content/what_if_learning/What If Learning - Art and Attentiveness.pdf":{}}}],["author",{"_index":387,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["awar",{"_index":277,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Percentages and Injustice.pdf":{}}}],["background",{"_index":167,"title":{"content/what_if_learning/What If Learning - Background Research.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Background Research.pdf":{}}}],["bad",{"_index":93,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Hope and joy.pdf":{}}}],["bake",{"_index":181,"title":{"content/what_if_learning/What If Learning - Appreciation and Baking.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Appreciation and Baking.pdf":{}}}],["be",{"_index":23,"title":{"content/what_if_learning/What If Learning - Being challenged and changed.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Being challenged and changed.pdf":{},"content/what_if_learning/What If Learning - Encouragement and working for change.pdf":{},"content/what_if_learning/What If Learning - History and Changes.pdf":{},"content/what_if_learning/What If Learning - Computers and Humans.pdf":{},"content/what_if_learning/What If Learning - Blessings and religion class.pdf":{}}}],["bean",{"_index":345,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Seeing Connections.pdf":{}}}],["becam",{"_index":313,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Blessings and religion class.pdf":{},"content/what_if_learning/What If Learning - Serving the Community.pdf":{}}}],["befor",{"_index":446,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson3.pdf":{}}}],["behavior",{"_index":415,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["belief",{"_index":178,"title":{"content/what_if_learning/What If Learning - Art & Beliefs.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Art & Beliefs.pdf":{}}}],["believ",{"_index":328,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Faith and Life.pdf":{}}}],["better",{"_index":470,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson5.pdf":{},"content/mathematics/kuyers/math-lesson7.pdf":{}}}],["bibl",{"_index":327,"title":{"content/what_if_learning/What If Learning - Faith and Life.pdf":{},"content/what_if_learning/What If Learning - Reason and Faith.pdf":{},"content/what_if_learning/What If Learning - What Tests Teach.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Reason and Faith.pdf":{},"content/kuyers/psychfaithman2.pdf":{}}}],["biblic",{"_index":228,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Guests in God’s World.pdf":{},"content/mathematics/kuyers/math-lesson1.pdf":{}}}],["big",{"_index":14,"title":{"content/what_if_learning/What If Learning - Curiosity about life’s big questions.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Curiosity about life’s big questions.pdf":{},"content/what_if_learning/What If Learning - Math Questions.pdf":{},"content/what_if_learning/What If Learning - Faith and Science.pdf":{}}}],["bless",{"_index":311,"title":{"content/what_if_learning/What If Learning - Blessings and religion class.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Blessings and religion class.pdf":{}}}],["bodi",{"_index":293,"title":{"content/what_if_learning/What If Learning - Bodies and People.pdf":{}},"author":{},"abstract":{}}],["book",{"_index":215,"title":{"content/what_if_learning/What If Learning - Book Week.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Book Week.pdf":{}}}],["both",{"_index":437,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson2.pdf":{}}}],["brain",{"_index":414,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["breadth",{"_index":395,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["bring",{"_index":169,"title":{"content/what_if_learning/What If Learning - Christian Spirituality.pdf":{}},"author":{},"abstract":{}}],["broader",{"_index":343,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Nothing But Atoms.pdf":{}}}],["broken",{"_index":134,"title":{"content/what_if_learning/What If Learning - Healing brokenness and seeking justice.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Healing brokenness and seeking justice.pdf":{}}}],["brought",{"_index":190,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Design and Delight.pdf":{},"content/what_if_learning/What If Learning - Words and Actions.pdf":{}}}],["build",{"_index":353,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning  - Posture and Respect.pdf":{}}}],["burden",{"_index":358,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Triumphs and Disasters.pdf":{}}}],["calvin",{"_index":5,"title":{},"author":{"kuyers/content/what_if_learning/What If Learning - Connecting Faith with All of Life.pdf":{},"content/what_if_learning/What If Learning - Honoring the wonder of God’s world.pdf":{},"content/what_if_learning/What If Learning - Curiosity about life’s big questions.pdf":{},"content/what_if_learning/What If Learning - Meaning, significance, and purpose.pdf":{},"content/what_if_learning/What If Learning - Seeing people holistically.pdf":{},"content/what_if_learning/What If Learning - Being challenged and changed.pdf":{},"content/what_if_learning/What If Learning - Celebrating grace.pdf":{},"content/what_if_learning/What If Learning - Appreciation and gratitude.pdf":{},"content/what_if_learning/What If Learning - Delighting in God’s world.pdf":{},"content/what_if_learning/What If Learning - Focused, loving attentiveness.pdf":{},"content/what_if_learning/What If Learning - Respect and reverence.pdf":{},"content/what_if_learning/What If Learning - Trust and affirming faith.pdf":{},"content/what_if_learning/What If Learning - Humility and hospitality.pdf":{},"content/what_if_learning/What If Learning - Seeking the good of others.pdf":{},"content/what_if_learning/What If Learning - Finding worth through love.pdf":{},"content/what_if_learning/What If Learning - Interdependence and community.pdf":{},"content/what_if_learning/What If Learning - Love and forgiveness.pdf":{},"content/what_if_learning/What If Learning - Hope and joy.pdf":{},"content/what_if_learning/What If Learning - Self-control and peace.pdf":{},"content/what_if_learning/What If Learning - Embracing responsibility.pdf":{},"content/what_if_learning/What If Learning - Christian values and virtues.pdf":{},"content/what_if_learning/What If Learning - Healing brokenness and seeking justice.pdf":{},"content/what_if_learning/What If Learning - Encouragement and working for change.pdf":{},"content/what_if_learning/What If Learning - Giving and serving others.pdf":{},"content/what_if_learning/What If Learning - Theology.pdf":{},"content/what_if_learning/What If Learning - Theology Faith.pdf":{},"content/what_if_learning/What If Learning - Theology Hope.pdf":{},"content/what_if_learning/What If Learning - Theology Love.pdf":{},"content/what_if_learning/What If Learning - Christian Distinctives.pdf":{},"content/what_if_learning/What If Learning - Background Research.pdf":{},"content/what_if_learning/What If Learning - Christian Spirituality.pdf":{},"content/what_if_learning/What If Learning - Spirituality and Teaching.pdf":{},"content/what_if_learning/What If Learning - Virtues.pdf":{},"content/what_if_learning/What If Learning - Art and Attentiveness.pdf":{},"content/what_if_learning/What If Learning - Art and Hospitality.pdf":{},"content/what_if_learning/What If Learning - Art & Beliefs.pdf":{},"content/what_if_learning/What If Learning - Appreciation and Baking.pdf":{},"content/what_if_learning/What If Learning - Cooking and Honoring.pdf":{},"content/what_if_learning/What If Learning - Dance and Forgiveness.pdf":{},"content/what_if_learning/What If Learning - Design and Humility.pdf":{},"content/what_if_learning/What If Learning - Design and Communities.pdf":{},"content/what_if_learning/What If Learning - Design and Contentment.pdf":{},"content/what_if_learning/What If Learning - Design and Delight.pdf":{},"content/what_if_learning/What If Learning - Drama and Others.pdf":{},"content/what_if_learning/What If Learning - Literature and Grace.pdf":{},"content/what_if_learning/What If Learning - Loving Texts.pdf":{},"content/what_if_learning/What If Learning - Poetry and Revenge.pdf":{},"content/what_if_learning/What If Learning - Literature and Choices.pdf":{},"content/what_if_learning/What If Learning - Literature and Faith.pdf":{},"content/what_if_learning/What If Learning - Poetry and Hope.pdf":{},"content/what_if_learning/What If Learning - Writing About Others.pdf":{},"content/what_if_learning/What If Learning - Grammar and Encouragement.pdf":{},"content/what_if_learning/What If Learning - Poetry and Delight.pdf":{},"content/what_if_learning/What If Learning - Words as Gifts.pdf":{},"content/what_if_learning/What If Learning - Plot and Choices.pdf":{},"content/what_if_learning/What If Learning - Faith and Poetry.pdf":{},"content/what_if_learning/What If Learning - Book Week.pdf":{},"content/what_if_learning/What If Learning - Music and Respect.pdf":{},"content/what_if_learning/What If Learning - Music and Creativity.pdf":{},"content/what_if_learning/What If Learning - Singing and Humility.pdf":{},"content/what_if_learning/What If Learning - Guests in God’s World.pdf":{},"content/what_if_learning/What If Learning - Gods World.pdf":{},"content/what_if_learning/What If Learning - Maps and Values.pdf":{},"content/what_if_learning/What If Learning - Geography and Faith.pdf":{},"content/what_if_learning/What If Learning - Geography and Justice.pdf":{},"content/what_if_learning/What If Learning - Migration Stories.pdf":{},"content/what_if_learning/What If Learning - Maps and Local Needs.pdf":{},"content/what_if_learning/What If Learning - Treaties and Virtues.pdf":{},"content/what_if_learning/What If Learning - Flawed Reformers.pdf":{},"content/what_if_learning/What If Learning - History and Wealth.pdf":{},"content/what_if_learning/What If Learning - History and Changes.pdf":{},"content/what_if_learning/What If Learning - History and Communities.pdf":{},"content/what_if_learning/What If Learning - History and Virtues.pdf":{},"content/what_if_learning/What If Learning - History and Faith.pdf":{},"content/what_if_learning/What If Learning - History and Poverty.pdf":{},"content/what_if_learning/What If Learning - Loving a City.pdf":{},"content/what_if_learning/What If Learning - History and Change.pdf":{},"content/what_if_learning/What If Learning - Righting Historical Wrongs.pdf":{},"content/what_if_learning/What If Learning - The Meaning of Time.pdf":{},"content/what_if_learning/What If Learning - Computers and Humans.pdf":{},"content/what_if_learning/What If Learning - Pie Charts and Truth.pdf":{},"content/what_if_learning/What If Learning - Math and Justice.pdf":{},"content/what_if_learning/What If Learning - Community and Math.pdf":{},"content/what_if_learning/What If Learning - Math and Forgiveness.pdf":{},"content/what_if_learning/What If Learning - Pie Charts and Giving.pdf":{},"content/what_if_learning/What If Learning - Math and Giving.pdf":{},"content/what_if_learning/What If Learning - Math and Measuring.pdf":{},"content/what_if_learning/What If Learning - Graphs and Delight.pdf":{},"content/what_if_learning/What If Learning - Percentages and Injustice.pdf":{},"content/what_if_learning/What If Learning - Math Questions.pdf":{},"content/what_if_learning/What If Learning - Serving through Words.pdf":{},"content/what_if_learning/What If Learning - Words and Care.pdf":{},"content/what_if_learning/What If Learning - Languages and Hospitality.pdf":{},"content/what_if_learning/What If Learning - Failure and Community.pdf":{},"content/what_if_learning/What If Learning - What is Love.pdf":{},"content/what_if_learning/What If Learning - Grammar and Giving.pdf":{},"content/what_if_learning/What If Learning - French and Hospitality.pdf":{},"content/what_if_learning/What If Learning - Language and Community.pdf":{},"content/what_if_learning/What If Learning  - Languages and Relationships.pdf":{},"content/what_if_learning/What If Learning - Bodies and People.pdf":{},"content/what_if_learning/What If Learning - Addressing Fears.pdf":{},"content/what_if_learning/What If Learning - Sport and Restraint.pdf":{},"content/what_if_learning/What If Learning - Teams and Individuals.pdf":{},"content/what_if_learning/What If Learning - Sport and Respect.pdf":{},"content/what_if_learning/What If Learning - Words and Actions.pdf":{},"content/what_if_learning/What If Learning - Blessings and religion class.pdf":{},"content/what_if_learning/What If Learning - Strength and Weakness.pdf":{},"content/what_if_learning/What If Learning - Anxiety and Peace.pdf":{},"content/what_if_learning/What If Learning - Responsibility and Community.pdf":{},"content/what_if_learning/What If Learning - Rules and Virtues.pdf":{},"content/what_if_learning/What If Learning - Rules and Community.pdf":{},"content/what_if_learning/What If Learning - Faith and Life.pdf":{},"content/what_if_learning/What If Learning - Reason and Faith.pdf":{},"content/what_if_learning/What If Learning - What Tests Teach.pdf":{},"content/what_if_learning/What If Learning - Patterns and Wonder.pdf":{},"content/what_if_learning/What If Learning - Chemistry and Wonder.pdf":{},"content/what_if_learning/What If Learning - Meeting Parents.pdf":{},"content/what_if_learning/What If Learning - Faith and Science.pdf":{},"content/what_if_learning/What If Learning - Nothing But Atoms.pdf":{},"content/what_if_learning/What If Learning - Seeing Connections.pdf":{},"content/what_if_learning/What If Learning - Plants and Wonder.pdf":{},"content/what_if_learning/What If Learning - Magnets and Wonder.pdf":{},"content/what_if_learning/What If Learning - Teaching and Gratitude.pdf":{},"content/what_if_learning/What If Learning  - Posture and Respect.pdf":{},"content/what_if_learning/What If Learning - Triumphs and Disasters.pdf":{},"content/what_if_learning/What If Learning - Rewarding Perseverance.pdf":{},"content/what_if_learning/What If Learning - Tests and Gratitude.pdf":{},"content/what_if_learning/What If Learning - Transportation and Service.pdf":{},"content/what_if_learning/What If Learning - Serving the Community.pdf":{},"content/mathematics/kuyers/math-lesson1.pdf":{},"content/mathematics/kuyers/math-lesson2.pdf":{},"content/mathematics/kuyers/math-lesson3.pdf":{},"content/mathematics/kuyers/math-lesson4.pdf":{},"content/mathematics/kuyers/math-lesson5.pdf":{},"content/mathematics/kuyers/math-lesson6.pdf":{},"content/mathematics/kuyers/math-lesson7.pdf":{},"content/mathematics/kuyers/math-lesson8.pdf":{},"content/mathematics/kuyers/math-lesson9.pdf":{}},"abstract":{}}],["came",{"_index":220,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Music and Creativity.pdf":{}}}],["campaign",{"_index":247,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - History and Communities.pdf":{}}}],["care",{"_index":164,"title":{"content/what_if_learning/What If Learning - Words and Care.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Theology Love.pdf":{},"content/what_if_learning/What If Learning - Words and Care.pdf":{}}}],["caus",{"_index":60,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Seeking the good of others.pdf":{},"content/what_if_learning/What If Learning - Math Questions.pdf":{}}}],["celebr",{"_index":27,"title":{"content/what_if_learning/What If Learning - Celebrating grace.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Celebrating grace.pdf":{},"content/what_if_learning/What If Learning - Teams and Individuals.pdf":{}}}],["challeng",{"_index":24,"title":{"content/what_if_learning/What If Learning - Being challenged and changed.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Being challenged and changed.pdf":{},"content/what_if_learning/What If Learning - Grammar and Giving.pdf":{}}}],["chang",{"_index":25,"title":{"content/what_if_learning/What If Learning - Being challenged and changed.pdf":{},"content/what_if_learning/What If Learning - Encouragement and working for change.pdf":{},"content/what_if_learning/What If Learning - History and Changes.pdf":{},"content/what_if_learning/What If Learning - History and Change.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Being challenged and changed.pdf":{},"content/what_if_learning/What If Learning - Encouragement and working for change.pdf":{},"content/what_if_learning/What If Learning - Poetry and Hope.pdf":{},"content/what_if_learning/What If Learning - History and Changes.pdf":{}}}],["charact",{"_index":131,"title":{"content/what_if_learning/What If Learning - Virtues.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Christian values and virtues.pdf":{},"content/what_if_learning/What If Learning - Spirituality and Teaching.pdf":{}}}],["characterist",{"_index":435,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson2.pdf":{}}}],["chart",{"_index":264,"title":{"content/what_if_learning/What If Learning - Pie Charts and Truth.pdf":{},"content/what_if_learning/What If Learning - Pie Charts and Giving.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Pie Charts and Truth.pdf":{},"content/what_if_learning/What If Learning - Pie Charts and Giving.pdf":{}}}],["chemistri",{"_index":335,"title":{"content/what_if_learning/What If Learning - Chemistry and Wonder.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Chemistry and Wonder.pdf":{}}}],["children",{"_index":218,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Music and Respect.pdf":{},"content/what_if_learning/What If Learning - Music and Creativity.pdf":{},"content/what_if_learning/What If Learning - Maps and Local Needs.pdf":{},"content/what_if_learning/What If Learning - The Meaning of Time.pdf":{}}}],["choic",{"_index":122,"title":{"content/what_if_learning/What If Learning - Literature and Choices.pdf":{},"content/what_if_learning/What If Learning - Plot and Choices.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Embracing responsibility.pdf":{},"content/what_if_learning/What If Learning - Literature and Choices.pdf":{},"content/what_if_learning/What If Learning - Words and Care.pdf":{}}}],["choos",{"_index":128,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Christian values and virtues.pdf":{},"content/what_if_learning/What If Learning - Plot and Choices.pdf":{}}}],["chose",{"_index":411,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["chosen",{"_index":140,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Healing brokenness and seeking justice.pdf":{}}}],["christ",{"_index":102,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Hope and joy.pdf":{}}}],["christian",{"_index":72,"title":{"content/what_if_learning/What If Learning - Christian values and virtues.pdf":{},"content/what_if_learning/What If Learning - Theology.pdf":{},"content/what_if_learning/What If Learning - Theology Faith.pdf":{},"content/what_if_learning/What If Learning - Theology Hope.pdf":{},"content/what_if_learning/What If Learning - Theology Love.pdf":{},"content/what_if_learning/What If Learning - Christian Distinctives.pdf":{},"content/what_if_learning/What If Learning - Christian Spirituality.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Finding worth through love.pdf":{},"content/what_if_learning/What If Learning - Theology.pdf":{},"content/what_if_learning/What If Learning - Theology Faith.pdf":{},"content/what_if_learning/What If Learning - Christian Distinctives.pdf":{},"content/what_if_learning/What If Learning - Christian Spirituality.pdf":{},"content/kuyers/psychfaithman2.pdf":{}}}],["circl",{"_index":321,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Anxiety and Peace.pdf":{}}}],["citi",{"_index":252,"title":{"content/what_if_learning/What If Learning - Loving a City.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - History and Poverty.pdf":{},"content/what_if_learning/What If Learning - Loving a City.pdf":{}}}],["class",{"_index":29,"title":{"content/what_if_learning/What If Learning - Blessings and religion class.pdf":{},"content/what_if_learning/What If Learning - Faith and Life.pdf":{},"content/what_if_learning/What If Learning - Reason and Faith.pdf":{},"content/what_if_learning/What If Learning - What Tests Teach.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Celebrating grace.pdf":{},"content/what_if_learning/What If Learning - Literature and Choices.pdf":{},"content/what_if_learning/What If Learning - Words as Gifts.pdf":{},"content/what_if_learning/What If Learning - Righting Historical Wrongs.pdf":{},"content/what_if_learning/What If Learning - Words and Care.pdf":{},"content/what_if_learning/What If Learning - Languages and Hospitality.pdf":{},"content/what_if_learning/What If Learning - French and Hospitality.pdf":{},"content/what_if_learning/What If Learning - Rules and Community.pdf":{},"content/what_if_learning/What If Learning - Reason and Faith.pdf":{},"content/what_if_learning/What If Learning - Triumphs and Disasters.pdf":{}}}],["classroom",{"_index":50,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Trust and affirming faith.pdf":{},"content/what_if_learning/What If Learning - Humility and hospitality.pdf":{},"content/what_if_learning/What If Learning  - Posture and Respect.pdf":{},"content/kuyers/psychfaithman2.pdf":{}}}],["collect",{"_index":379,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["come",{"_index":449,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson3.pdf":{},"content/mathematics/kuyers/math-lesson7.pdf":{}}}],["commentari",{"_index":423,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["common",{"_index":462,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson4.pdf":{}}}],["commun",{"_index":71,"title":{"content/what_if_learning/What If Learning - Interdependence and community.pdf":{},"content/what_if_learning/What If Learning - Design and Communities.pdf":{},"content/what_if_learning/What If Learning - History and Communities.pdf":{},"content/what_if_learning/What If Learning - Community and Math.pdf":{},"content/what_if_learning/What If Learning - Failure and Community.pdf":{},"content/what_if_learning/What If Learning - Language and Community.pdf":{},"content/what_if_learning/What If Learning - Responsibility and Community.pdf":{},"content/what_if_learning/What If Learning - Rules and Community.pdf":{},"content/what_if_learning/What If Learning - Serving the Community.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Finding worth through love.pdf":{},"content/what_if_learning/What If Learning - Interdependence and community.pdf":{},"content/what_if_learning/What If Learning - Christian values and virtues.pdf":{},"content/what_if_learning/What If Learning - Art & Beliefs.pdf":{},"content/what_if_learning/What If Learning - Design and Communities.pdf":{},"content/what_if_learning/What If Learning - History and Communities.pdf":{},"content/what_if_learning/What If Learning - Community and Math.pdf":{},"content/what_if_learning/What If Learning - Language and Community.pdf":{},"content/what_if_learning/What If Learning - Serving the Community.pdf":{}}}],["competit",{"_index":298,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Sport and Restraint.pdf":{}}}],["compil",{"_index":410,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["comput",{"_index":260,"title":{"content/what_if_learning/What If Learning - Computers and Humans.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Computers and Humans.pdf":{}}}],["concept",{"_index":196,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Literature and Grace.pdf":{}}}],["conjunct",{"_index":451,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson3.pdf":{}}}],["connect",{"_index":0,"title":{"kuyers/content/what_if_learning/What If Learning - Connecting Faith with All of Life.pdf":{},"content/what_if_learning/What If Learning - Seeing Connections.pdf":{}},"author":{},"abstract":{"kuyers/content/what_if_learning/What If Learning - Connecting Faith with All of Life.pdf":{},"content/what_if_learning/What If Learning - Theology.pdf":{},"content/what_if_learning/What If Learning - Faith and Poetry.pdf":{},"content/what_if_learning/What If Learning - Pie Charts and Giving.pdf":{},"content/what_if_learning/What If Learning - Responsibility and Community.pdf":{}}}],["consid",{"_index":427,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson1.pdf":{},"content/mathematics/kuyers/math-lesson2.pdf":{}}}],["content",{"_index":108,"title":{"content/what_if_learning/What If Learning - Design and Contentment.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Self-control and peace.pdf":{},"content/what_if_learning/What If Learning - Design and Contentment.pdf":{}}}],["context",{"_index":101,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Hope and joy.pdf":{},"content/mathematics/kuyers/math-lesson4.pdf":{}}}],["continu",{"_index":448,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson3.pdf":{}}}],["control",{"_index":104,"title":{"content/what_if_learning/What If Learning - Self-control and peace.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Writing About Others.pdf":{}}}],["convict",{"_index":156,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Theology Faith.pdf":{},"content/what_if_learning/What If Learning - Christian Spirituality.pdf":{}}}],["cook",{"_index":180,"title":{"content/what_if_learning/What If Learning - Appreciation and Baking.pdf":{},"content/what_if_learning/What If Learning - Cooking and Honoring.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Cooking and Honoring.pdf":{}}}],["cours",{"_index":386,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["creat",{"_index":268,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Community and Math.pdf":{},"content/kuyers/psychfaithman2.pdf":{}}}],["creation",{"_index":348,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Plants and Wonder.pdf":{},"content/mathematics/kuyers/math-lesson3.pdf":{}}}],["creativ",{"_index":214,"title":{"content/what_if_learning/What If Learning - Music and Creativity.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Faith and Poetry.pdf":{},"content/what_if_learning/What If Learning - Music and Creativity.pdf":{}}}],["cultiv",{"_index":32,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Appreciation and gratitude.pdf":{},"content/what_if_learning/What If Learning - Delighting in God’s world.pdf":{}}}],["cultur",{"_index":440,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson2.pdf":{}}}],["curios",{"_index":12,"title":{"content/what_if_learning/What If Learning - Curiosity about life’s big questions.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Curiosity about life’s big questions.pdf":{},"content/what_if_learning/What If Learning - Magnets and Wonder.pdf":{}}}],["curriculum",{"_index":87,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Love and forgiveness.pdf":{},"content/what_if_learning/What If Learning - Healing brokenness and seeking justice.pdf":{}}}],["cynthia",{"_index":366,"title":{},"author":{"content/kuyers/psychfaithman2.pdf":{}},"abstract":{}}],["danc",{"_index":184,"title":{"content/what_if_learning/What If Learning - Dance and Forgiveness.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Dance and Forgiveness.pdf":{}}}],["data",{"_index":482,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson6.pdf":{}}}],["decid",{"_index":403,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["delight",{"_index":37,"title":{"content/what_if_learning/What If Learning - Delighting in God’s world.pdf":{},"content/what_if_learning/What If Learning - Design and Delight.pdf":{},"content/what_if_learning/What If Learning - Poetry and Delight.pdf":{},"content/what_if_learning/What If Learning - Graphs and Delight.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Delighting in God’s world.pdf":{},"content/what_if_learning/What If Learning - Design and Delight.pdf":{},"content/what_if_learning/What If Learning - Poetry and Delight.pdf":{},"content/what_if_learning/What If Learning - Graphs and Delight.pdf":{}}}],["depend",{"_index":271,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Math and Forgiveness.pdf":{}}}],["describ",{"_index":492,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson7.pdf":{}}}],["design",{"_index":114,"title":{"content/what_if_learning/What If Learning - Design and Humility.pdf":{},"content/what_if_learning/What If Learning - Design and Communities.pdf":{},"content/what_if_learning/What If Learning - Design and Contentment.pdf":{},"content/what_if_learning/What If Learning - Design and Delight.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Self-control and peace.pdf":{},"content/what_if_learning/What If Learning - Design and Humility.pdf":{},"content/what_if_learning/What If Learning - Design and Communities.pdf":{},"content/what_if_learning/What If Learning - Design and Delight.pdf":{},"content/kuyers/psychfaithman2.pdf":{}}}],["devast",{"_index":58,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Seeking the good of others.pdf":{}}}],["develop",{"_index":172,"title":{"content/what_if_learning/What If Learning - Virtues.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Virtues.pdf":{},"content/what_if_learning/What If Learning - Sport and Restraint.pdf":{},"content/kuyers/psychfaithman2.pdf":{}}}],["differ",{"_index":80,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Interdependence and community.pdf":{},"content/what_if_learning/What If Learning - Giving and serving others.pdf":{},"content/what_if_learning/What If Learning - Flawed Reformers.pdf":{},"content/what_if_learning/What If Learning - History and Wealth.pdf":{},"content/what_if_learning/What If Learning - History and Change.pdf":{},"content/what_if_learning/What If Learning - The Meaning of Time.pdf":{},"content/mathematics/kuyers/math-lesson4.pdf":{},"content/mathematics/kuyers/math-lesson6.pdf":{},"content/mathematics/kuyers/math-lesson7.pdf":{}}}],["difficult",{"_index":397,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["dimens",{"_index":231,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Geography and Faith.pdf":{},"content/mathematics/kuyers/math-lesson5.pdf":{}}}],["dimension",{"_index":475,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson5.pdf":{}}}],["disast",{"_index":355,"title":{"content/what_if_learning/What If Learning - Triumphs and Disasters.pdf":{}},"author":{},"abstract":{}}],["disciplin",{"_index":495,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson7.pdf":{}}}],["discov",{"_index":409,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["discuss",{"_index":323,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Rules and Virtues.pdf":{},"content/kuyers/psychfaithman2.pdf":{},"content/mathematics/kuyers/math-lesson8.pdf":{},"content/mathematics/kuyers/math-lesson9.pdf":{}}}],["distinct",{"_index":166,"title":{"content/what_if_learning/What If Learning - Christian Distinctives.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Christian Distinctives.pdf":{}}}],["do",{"_index":258,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Righting Historical Wrongs.pdf":{},"content/kuyers/psychfaithman2.pdf":{}}}],["don't",{"_index":425,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson1.pdf":{}}}],["drama",{"_index":191,"title":{"content/what_if_learning/What If Learning - Drama and Others.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Drama and Others.pdf":{}}}],["draw",{"_index":155,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Theology.pdf":{}}}],["duck",{"_index":213,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Faith and Poetry.pdf":{}}}],["each",{"_index":208,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Grammar and Encouragement.pdf":{},"content/what_if_learning/What If Learning - Triumphs and Disasters.pdf":{}}}],["easi",{"_index":90,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Hope and joy.pdf":{}}}],["educ",{"_index":153,"title":{"content/what_if_learning/What If Learning - Theology.pdf":{},"content/what_if_learning/What If Learning - Theology Faith.pdf":{},"content/what_if_learning/What If Learning - Theology Hope.pdf":{},"content/what_if_learning/What If Learning - Theology Love.pdf":{},"content/what_if_learning/What If Learning - Christian Distinctives.pdf":{},"content/what_if_learning/What If Learning - Christian Spirituality.pdf":{},"content/what_if_learning/What If Learning - Bodies and People.pdf":{},"content/what_if_learning/What If Learning - Addressing Fears.pdf":{},"content/what_if_learning/What If Learning - Sport and Restraint.pdf":{},"content/what_if_learning/What If Learning - Teams and Individuals.pdf":{},"content/what_if_learning/What If Learning - Sport and Respect.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Theology.pdf":{},"content/what_if_learning/What If Learning - Bodies and People.pdf":{},"content/what_if_learning/What If Learning - Addressing Fears.pdf":{}}}],["elderli",{"_index":183,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Appreciation and Baking.pdf":{},"content/what_if_learning/What If Learning - Cooking and Honoring.pdf":{}}}],["elementari",{"_index":182,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Appreciation and Baking.pdf":{},"content/what_if_learning/What If Learning - French and Hospitality.pdf":{},"content/what_if_learning/What If Learning  - Languages and Relationships.pdf":{}}}],["embrac",{"_index":115,"title":{"content/what_if_learning/What If Learning - Embracing responsibility.pdf":{}},"author":{},"abstract":{}}],["emphasi",{"_index":78,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Interdependence and community.pdf":{}}}],["encourag",{"_index":41,"title":{"content/what_if_learning/What If Learning - Encouragement and working for change.pdf":{},"content/what_if_learning/What If Learning - Grammar and Encouragement.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Focused, loving attentiveness.pdf":{},"content/what_if_learning/What If Learning - Seeking the good of others.pdf":{},"content/what_if_learning/What If Learning - Hope and joy.pdf":{},"content/what_if_learning/What If Learning - Encouragement and working for change.pdf":{},"content/what_if_learning/What If Learning - Virtues.pdf":{},"content/what_if_learning/What If Learning  - Languages and Relationships.pdf":{}}}],["english",{"_index":192,"title":{"content/what_if_learning/What If Learning - Literature and Grace.pdf":{},"content/what_if_learning/What If Learning - Loving Texts.pdf":{},"content/what_if_learning/What If Learning - Poetry and Revenge.pdf":{},"content/what_if_learning/What If Learning - Literature and Choices.pdf":{},"content/what_if_learning/What If Learning - Literature and Faith.pdf":{},"content/what_if_learning/What If Learning - Poetry and Hope.pdf":{},"content/what_if_learning/What If Learning - Writing About Others.pdf":{},"content/what_if_learning/What If Learning - Grammar and Encouragement.pdf":{},"content/what_if_learning/What If Learning - Poetry and Delight.pdf":{},"content/what_if_learning/What If Learning - Words as Gifts.pdf":{},"content/what_if_learning/What If Learning - Plot and Choices.pdf":{},"content/what_if_learning/What If Learning - Faith and Poetry.pdf":{},"content/what_if_learning/What If Learning - Book Week.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Words as Gifts.pdf":{}}}],["enhanc",{"_index":68,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Finding worth through love.pdf":{}}}],["enjoy",{"_index":426,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson1.pdf":{}}}],["environ",{"_index":223,"title":{"content/what_if_learning/What If Learning - Guests in God’s World.pdf":{},"content/what_if_learning/What If Learning - Gods World.pdf":{}},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson6.pdf":{}}}],["environment",{"_index":225,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Guests in God’s World.pdf":{},"content/what_if_learning/What If Learning - Gods World.pdf":{}}}],["equal",{"_index":501,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson8.pdf":{},"content/mathematics/kuyers/math-lesson9.pdf":{}}}],["especi",{"_index":494,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson7.pdf":{}}}],["event",{"_index":493,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson7.pdf":{}}}],["exercis",{"_index":419,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["expand",{"_index":185,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Dance and Forgiveness.pdf":{},"content/what_if_learning/What If Learning - What is Love.pdf":{}}}],["experi",{"_index":99,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Hope and joy.pdf":{}}}],["explor",{"_index":85,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Love and forgiveness.pdf":{},"content/what_if_learning/What If Learning - Literature and Grace.pdf":{},"content/what_if_learning/What If Learning - Plot and Choices.pdf":{},"content/what_if_learning/What If Learning - Treaties and Virtues.pdf":{},"content/mathematics/kuyers/math-lesson3.pdf":{},"content/mathematics/kuyers/math-lesson4.pdf":{}}}],["exponenti",{"_index":456,"title":{"content/mathematics/kuyers/math-lesson4.pdf":{}},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson4.pdf":{}}}],["express",{"_index":42,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Focused, loving attentiveness.pdf":{}}}],["face",{"_index":266,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Pie Charts and Truth.pdf":{}}}],["facilit",{"_index":383,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["fact",{"_index":486,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson6.pdf":{}}}],["factual",{"_index":433,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson2.pdf":{}}}],["failur",{"_index":285,"title":{"content/what_if_learning/What If Learning - Failure and Community.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Failure and Community.pdf":{}}}],["fair",{"_index":305,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Sport and Respect.pdf":{}}}],["fairli",{"_index":507,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson8.pdf":{},"content/mathematics/kuyers/math-lesson9.pdf":{}}}],["faith",{"_index":1,"title":{"kuyers/content/what_if_learning/What If Learning - Connecting Faith with All of Life.pdf":{},"content/what_if_learning/What If Learning - Trust and affirming faith.pdf":{},"content/what_if_learning/What If Learning - Theology Faith.pdf":{},"content/what_if_learning/What If Learning - Literature and Faith.pdf":{},"content/what_if_learning/What If Learning - Faith and Poetry.pdf":{},"content/what_if_learning/What If Learning - Geography and Faith.pdf":{},"content/what_if_learning/What If Learning - History and Faith.pdf":{},"content/what_if_learning/What If Learning - Faith and Life.pdf":{},"content/what_if_learning/What If Learning - Reason and Faith.pdf":{},"content/what_if_learning/What If Learning - Faith and Science.pdf":{},"content/kuyers/psychfaithman2.pdf":{}},"author":{},"abstract":{"kuyers/content/what_if_learning/What If Learning - Connecting Faith with All of Life.pdf":{},"content/what_if_learning/What If Learning - Trust and affirming faith.pdf":{},"content/what_if_learning/What If Learning - Theology.pdf":{},"content/what_if_learning/What If Learning - Theology Faith.pdf":{},"content/what_if_learning/What If Learning - Virtues.pdf":{},"content/what_if_learning/What If Learning - Literature and Faith.pdf":{},"content/what_if_learning/What If Learning - Faith and Life.pdf":{},"content/what_if_learning/What If Learning - Reason and Faith.pdf":{},"content/what_if_learning/What If Learning - Faith and Science.pdf":{},"content/kuyers/psychfaithman2.pdf":{}}}],["fear",{"_index":295,"title":{"content/what_if_learning/What If Learning - Addressing Fears.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Addressing Fears.pdf":{}}}],["feel",{"_index":91,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Hope and joy.pdf":{},"content/what_if_learning/What If Learning - Art & Beliefs.pdf":{}}}],["fibonacci",{"_index":441,"title":{"content/mathematics/kuyers/math-lesson3.pdf":{}},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson3.pdf":{}}}],["financi",{"_index":459,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson4.pdf":{}}}],["find",{"_index":64,"title":{"content/what_if_learning/What If Learning - Finding worth through love.pdf":{}},"author":{},"abstract":{}}],["fit",{"_index":490,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson6.pdf":{}}}],["five",{"_index":412,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["flaw",{"_index":242,"title":{"content/what_if_learning/What If Learning - Flawed Reformers.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Flawed Reformers.pdf":{}}}],["flower",{"_index":334,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Patterns and Wonder.pdf":{}}}],["focus",{"_index":38,"title":{"content/what_if_learning/What If Learning - Focused, loving attentiveness.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Focused, loving attentiveness.pdf":{}}}],["foreign",{"_index":283,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Languages and Hospitality.pdf":{},"content/what_if_learning/What If Learning - What is Love.pdf":{},"content/what_if_learning/What If Learning  - Languages and Relationships.pdf":{}}}],["foreign/second",{"_index":279,"title":{"content/what_if_learning/What If Learning - Serving through Words.pdf":{},"content/what_if_learning/What If Learning - Words and Care.pdf":{},"content/what_if_learning/What If Learning - Languages and Hospitality.pdf":{},"content/what_if_learning/What If Learning - Failure and Community.pdf":{},"content/what_if_learning/What If Learning - What is Love.pdf":{},"content/what_if_learning/What If Learning - Grammar and Giving.pdf":{},"content/what_if_learning/What If Learning - French and Hospitality.pdf":{},"content/what_if_learning/What If Learning - Language and Community.pdf":{},"content/what_if_learning/What If Learning  - Languages and Relationships.pdf":{}},"author":{},"abstract":{}}],["forgiv",{"_index":84,"title":{"content/what_if_learning/What If Learning - Love and forgiveness.pdf":{},"content/what_if_learning/What If Learning - Dance and Forgiveness.pdf":{},"content/what_if_learning/What If Learning - Math and Forgiveness.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Love and forgiveness.pdf":{},"content/what_if_learning/What If Learning - Dance and Forgiveness.pdf":{},"content/what_if_learning/What If Learning - Treaties and Virtues.pdf":{},"content/what_if_learning/What If Learning - Math and Forgiveness.pdf":{}}}],["form",{"_index":147,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Giving and serving others.pdf":{},"content/kuyers/psychfaithman2.pdf":{}}}],["formal",{"_index":434,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson2.pdf":{}}}],["format",{"_index":132,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Christian values and virtues.pdf":{}}}],["foster",{"_index":16,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Curiosity about life’s big questions.pdf":{},"content/what_if_learning/What If Learning - Humility and hospitality.pdf":{},"content/what_if_learning/What If Learning - Meeting Parents.pdf":{}}}],["four",{"_index":474,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson5.pdf":{}}}],["fourth",{"_index":477,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson5.pdf":{}}}],["framework",{"_index":124,"title":{"content/what_if_learning/What If Learning - Christian Spirituality.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Embracing responsibility.pdf":{}}}],["french",{"_index":289,"title":{"content/what_if_learning/What If Learning - French and Hospitality.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - French and Hospitality.pdf":{}}}],["fuel",{"_index":350,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Teaching and Gratitude.pdf":{}}}],["function",{"_index":457,"title":{"content/mathematics/kuyers/math-lesson4.pdf":{}},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson4.pdf":{},"content/mathematics/kuyers/math-lesson6.pdf":{}}}],["gap",{"_index":500,"title":{"content/mathematics/kuyers/math-lesson8.pdf":{}},"author":{},"abstract":{}}],["gender",{"_index":499,"title":{"content/mathematics/kuyers/math-lesson8.pdf":{}},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson8.pdf":{},"content/mathematics/kuyers/math-lesson9.pdf":{}}}],["geographi",{"_index":112,"title":{"content/what_if_learning/What If Learning - Maps and Values.pdf":{},"content/what_if_learning/What If Learning - Geography and Faith.pdf":{},"content/what_if_learning/What If Learning - Geography and Justice.pdf":{},"content/what_if_learning/What If Learning - Migration Stories.pdf":{},"content/what_if_learning/What If Learning - Maps and Local Needs.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Self-control and peace.pdf":{},"content/what_if_learning/What If Learning - Geography and Faith.pdf":{}}}],["gift",{"_index":35,"title":{"content/what_if_learning/What If Learning - Words as Gifts.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Appreciation and gratitude.pdf":{},"content/what_if_learning/What If Learning - Words as Gifts.pdf":{}}}],["give",{"_index":120,"title":{"content/what_if_learning/What If Learning - Giving and serving others.pdf":{},"content/what_if_learning/What If Learning - Pie Charts and Giving.pdf":{},"content/what_if_learning/What If Learning - Math and Giving.pdf":{},"content/what_if_learning/What If Learning - Grammar and Giving.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Embracing responsibility.pdf":{},"content/what_if_learning/What If Learning - Giving and serving others.pdf":{},"content/what_if_learning/What If Learning - Book Week.pdf":{},"content/what_if_learning/What If Learning - Pie Charts and Giving.pdf":{},"content/what_if_learning/What If Learning - Math and Giving.pdf":{},"content/what_if_learning/What If Learning - Serving through Words.pdf":{},"content/mathematics/kuyers/math-lesson6.pdf":{}}}],["goal",{"_index":301,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Teams and Individuals.pdf":{}}}],["god",{"_index":36,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Appreciation and gratitude.pdf":{},"content/what_if_learning/What If Learning - Theology Love.pdf":{}}}],["god'",{"_index":455,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson3.pdf":{}}}],["god’",{"_index":10,"title":{"content/what_if_learning/What If Learning - Honoring the wonder of God’s world.pdf":{},"content/what_if_learning/What If Learning - Delighting in God’s world.pdf":{},"content/what_if_learning/What If Learning - Guests in God’s World.pdf":{},"content/what_if_learning/What If Learning - Gods World.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Honoring the wonder of God’s world.pdf":{},"content/what_if_learning/What If Learning - Delighting in God’s world.pdf":{},"content/what_if_learning/What If Learning - Faith and Poetry.pdf":{},"content/what_if_learning/What If Learning - Gods World.pdf":{}}}],["golden",{"_index":452,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson3.pdf":{}}}],["good",{"_index":54,"title":{"content/what_if_learning/What If Learning - Seeking the good of others.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning  - Languages and Relationships.pdf":{},"content/mathematics/kuyers/math-lesson1.pdf":{}}}],["grace",{"_index":28,"title":{"content/what_if_learning/What If Learning - Celebrating grace.pdf":{},"content/what_if_learning/What If Learning - Literature and Grace.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Celebrating grace.pdf":{},"content/what_if_learning/What If Learning - Literature and Grace.pdf":{}}}],["grade",{"_index":303,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Sport and Respect.pdf":{}}}],["grammar",{"_index":206,"title":{"content/what_if_learning/What If Learning - Grammar and Encouragement.pdf":{},"content/what_if_learning/What If Learning - Grammar and Giving.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Grammar and Encouragement.pdf":{},"content/what_if_learning/What If Learning - Grammar and Giving.pdf":{}}}],["graph",{"_index":274,"title":{"content/what_if_learning/What If Learning - Graphs and Delight.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Graphs and Delight.pdf":{}}}],["gratitud",{"_index":31,"title":{"content/what_if_learning/What If Learning - Appreciation and gratitude.pdf":{},"content/what_if_learning/What If Learning - Teaching and Gratitude.pdf":{},"content/what_if_learning/What If Learning - Tests and Gratitude.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Appreciation and gratitude.pdf":{},"content/what_if_learning/What If Learning - Book Week.pdf":{},"content/what_if_learning/What If Learning - Teaching and Gratitude.pdf":{}}}],["grow",{"_index":325,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Rules and Community.pdf":{},"content/what_if_learning/What If Learning - Seeing Connections.pdf":{}}}],["growth",{"_index":461,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson4.pdf":{}}}],["guest",{"_index":224,"title":{"content/what_if_learning/What If Learning - Guests in God’s World.pdf":{}},"author":{},"abstract":{}}],["guid",{"_index":424,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["head",{"_index":467,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson5.pdf":{}}}],["heal",{"_index":133,"title":{"content/what_if_learning/What If Learning - Healing brokenness and seeking justice.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Healing brokenness and seeking justice.pdf":{}}}],["health",{"_index":306,"title":{"content/what_if_learning/What If Learning - Words and Actions.pdf":{},"content/what_if_learning/What If Learning - Blessings and religion class.pdf":{},"content/what_if_learning/What If Learning - Strength and Weakness.pdf":{},"content/what_if_learning/What If Learning - Anxiety and Peace.pdf":{},"content/what_if_learning/What If Learning - Responsibility and Community.pdf":{},"content/what_if_learning/What If Learning - Rules and Virtues.pdf":{},"content/what_if_learning/What If Learning - Rules and Community.pdf":{}},"author":{},"abstract":{}}],["hear",{"_index":95,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Hope and joy.pdf":{}}}],["heard",{"_index":445,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson3.pdf":{}}}],["help",{"_index":57,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Seeking the good of others.pdf":{},"content/what_if_learning/What If Learning - Art & Beliefs.pdf":{},"content/what_if_learning/What If Learning - Appreciation and Baking.pdf":{},"content/what_if_learning/What If Learning - Cooking and Honoring.pdf":{},"content/what_if_learning/What If Learning - Design and Contentment.pdf":{},"content/what_if_learning/What If Learning - Literature and Choices.pdf":{},"content/what_if_learning/What If Learning - Poetry and Hope.pdf":{},"content/what_if_learning/What If Learning - Music and Respect.pdf":{},"content/what_if_learning/What If Learning - Maps and Values.pdf":{},"content/what_if_learning/What If Learning - Maps and Local Needs.pdf":{},"content/what_if_learning/What If Learning - The Meaning of Time.pdf":{},"content/what_if_learning/What If Learning - Computers and Humans.pdf":{},"content/what_if_learning/What If Learning - Math and Giving.pdf":{},"content/what_if_learning/What If Learning - Language and Community.pdf":{},"content/what_if_learning/What If Learning - Bodies and People.pdf":{},"content/what_if_learning/What If Learning - Addressing Fears.pdf":{},"content/what_if_learning/What If Learning - Strength and Weakness.pdf":{},"content/what_if_learning/What If Learning - What Tests Teach.pdf":{},"content/what_if_learning/What If Learning - Seeing Connections.pdf":{},"content/what_if_learning/What If Learning  - Posture and Respect.pdf":{},"content/what_if_learning/What If Learning - Serving the Community.pdf":{}}}],["hero",{"_index":316,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Strength and Weakness.pdf":{}}}],["high",{"_index":244,"title":{"content/what_if_learning/What If Learning - History and Wealth.pdf":{}},"author":{},"abstract":{}}],["highlight",{"_index":136,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Healing brokenness and seeking justice.pdf":{},"content/what_if_learning/What If Learning - Plants and Wonder.pdf":{}}}],["histor",{"_index":254,"title":{"content/what_if_learning/What If Learning - Righting Historical Wrongs.pdf":{}},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson1.pdf":{}}}],["histori",{"_index":111,"title":{"content/what_if_learning/What If Learning - Treaties and Virtues.pdf":{},"content/what_if_learning/What If Learning - Flawed Reformers.pdf":{},"content/what_if_learning/What If Learning - History and Wealth.pdf":{},"content/what_if_learning/What If Learning - History and Changes.pdf":{},"content/what_if_learning/What If Learning - History and Communities.pdf":{},"content/what_if_learning/What If Learning - History and Virtues.pdf":{},"content/what_if_learning/What If Learning - History and Faith.pdf":{},"content/what_if_learning/What If Learning - History and Poverty.pdf":{},"content/what_if_learning/What If Learning - Loving a City.pdf":{},"content/what_if_learning/What If Learning - History and Change.pdf":{},"content/what_if_learning/What If Learning - Righting Historical Wrongs.pdf":{},"content/what_if_learning/What If Learning - The Meaning of Time.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Self-control and peace.pdf":{},"content/what_if_learning/What If Learning - Treaties and Virtues.pdf":{},"content/what_if_learning/What If Learning - History and Wealth.pdf":{},"content/what_if_learning/What If Learning - History and Changes.pdf":{},"content/what_if_learning/What If Learning - History and Communities.pdf":{},"content/what_if_learning/What If Learning - History and Virtues.pdf":{},"content/what_if_learning/What If Learning - History and Faith.pdf":{},"content/what_if_learning/What If Learning - History and Poverty.pdf":{},"content/what_if_learning/What If Learning - Loving a City.pdf":{},"content/what_if_learning/What If Learning - History and Change.pdf":{},"content/what_if_learning/What If Learning - Righting Historical Wrongs.pdf":{},"content/what_if_learning/What If Learning - The Meaning of Time.pdf":{}}}],["holist",{"_index":22,"title":{"content/what_if_learning/What If Learning - Seeing people holistically.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Seeing people holistically.pdf":{}}}],["honor",{"_index":8,"title":{"content/what_if_learning/What If Learning - Honoring the wonder of God’s world.pdf":{},"content/what_if_learning/What If Learning - Cooking and Honoring.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Honoring the wonder of God’s world.pdf":{},"content/what_if_learning/What If Learning - Appreciation and Baking.pdf":{},"content/what_if_learning/What If Learning - Cooking and Honoring.pdf":{}}}],["hope",{"_index":88,"title":{"content/what_if_learning/What If Learning - Hope and joy.pdf":{},"content/what_if_learning/What If Learning - Theology Hope.pdf":{},"content/what_if_learning/What If Learning - Poetry and Hope.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Hope and joy.pdf":{},"content/what_if_learning/What If Learning - Theology Hope.pdf":{},"content/what_if_learning/What If Learning - Virtues.pdf":{},"content/what_if_learning/What If Learning - Meeting Parents.pdf":{}}}],["hospit",{"_index":52,"title":{"content/what_if_learning/What If Learning - Humility and hospitality.pdf":{},"content/what_if_learning/What If Learning - Art and Hospitality.pdf":{},"content/what_if_learning/What If Learning - Languages and Hospitality.pdf":{},"content/what_if_learning/What If Learning - French and Hospitality.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Humility and hospitality.pdf":{},"content/what_if_learning/What If Learning - Languages and Hospitality.pdf":{}}}],["hossink",{"_index":371,"title":{},"author":{"content/kuyers/psychfaithman2.pdf":{}},"abstract":{}}],["human",{"_index":261,"title":{"content/what_if_learning/What If Learning - Computers and Humans.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Computers and Humans.pdf":{}}}],["humil",{"_index":51,"title":{"content/what_if_learning/What If Learning - Humility and hospitality.pdf":{},"content/what_if_learning/What If Learning - Design and Humility.pdf":{},"content/what_if_learning/What If Learning - Singing and Humility.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Humility and hospitality.pdf":{},"content/what_if_learning/What If Learning - Design and Humility.pdf":{},"content/what_if_learning/What If Learning - Singing and Humility.pdf":{},"content/what_if_learning/What If Learning - History and Virtues.pdf":{}}}],["hurt",{"_index":468,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson5.pdf":{}}}],["hypercub",{"_index":464,"title":{"content/mathematics/kuyers/math-lesson5.pdf":{}},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson5.pdf":{}}}],["id",{"_index":339,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Meeting Parents.pdf":{}}}],["idea",{"_index":186,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Dance and Forgiveness.pdf":{},"content/kuyers/psychfaithman2.pdf":{}}}],["imag",{"_index":471,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson5.pdf":{}}}],["imageri",{"_index":229,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Guests in God’s World.pdf":{}}}],["impact",{"_index":488,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson6.pdf":{}}}],["import",{"_index":173,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Virtues.pdf":{},"content/what_if_learning/What If Learning - Art & Beliefs.pdf":{},"content/mathematics/kuyers/math-lesson1.pdf":{}}}],["includ",{"_index":202,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Literature and Faith.pdf":{},"content/what_if_learning/What If Learning - History and Faith.pdf":{},"content/kuyers/psychfaithman2.pdf":{}}}],["indian",{"_index":496,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson7.pdf":{}}}],["individu",{"_index":300,"title":{"content/what_if_learning/What If Learning - Teams and Individuals.pdf":{}},"author":{},"abstract":{}}],["inform",{"_index":161,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Theology Hope.pdf":{},"content/what_if_learning/What If Learning - Spirituality and Teaching.pdf":{}}}],["injustic",{"_index":276,"title":{"content/what_if_learning/What If Learning - Percentages and Injustice.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Percentages and Injustice.pdf":{}}}],["inspir",{"_index":251,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - History and Poverty.pdf":{},"content/what_if_learning/What If Learning - Loving a City.pdf":{},"content/what_if_learning/What If Learning - Magnets and Wonder.pdf":{}}}],["institut",{"_index":4,"title":{},"author":{"kuyers/content/what_if_learning/What If Learning - Connecting Faith with All of Life.pdf":{},"content/what_if_learning/What If Learning - Honoring the wonder of God’s world.pdf":{},"content/what_if_learning/What If Learning - Curiosity about life’s big questions.pdf":{},"content/what_if_learning/What If Learning - Meaning, significance, and purpose.pdf":{},"content/what_if_learning/What If Learning - Seeing people holistically.pdf":{},"content/what_if_learning/What If Learning - Being challenged and changed.pdf":{},"content/what_if_learning/What If Learning - Celebrating grace.pdf":{},"content/what_if_learning/What If Learning - Appreciation and gratitude.pdf":{},"content/what_if_learning/What If Learning - Delighting in God’s world.pdf":{},"content/what_if_learning/What If Learning - Focused, loving attentiveness.pdf":{},"content/what_if_learning/What If Learning - Respect and reverence.pdf":{},"content/what_if_learning/What If Learning - Trust and affirming faith.pdf":{},"content/what_if_learning/What If Learning - Humility and hospitality.pdf":{},"content/what_if_learning/What If Learning - Seeking the good of others.pdf":{},"content/what_if_learning/What If Learning - Finding worth through love.pdf":{},"content/what_if_learning/What If Learning - Interdependence and community.pdf":{},"content/what_if_learning/What If Learning - Love and forgiveness.pdf":{},"content/what_if_learning/What If Learning - Hope and joy.pdf":{},"content/what_if_learning/What If Learning - Self-control and peace.pdf":{},"content/what_if_learning/What If Learning - Embracing responsibility.pdf":{},"content/what_if_learning/What If Learning - Christian values and virtues.pdf":{},"content/what_if_learning/What If Learning - Healing brokenness and seeking justice.pdf":{},"content/what_if_learning/What If Learning - Encouragement and working for change.pdf":{},"content/what_if_learning/What If Learning - Giving and serving others.pdf":{},"content/what_if_learning/What If Learning - Theology.pdf":{},"content/what_if_learning/What If Learning - Theology Faith.pdf":{},"content/what_if_learning/What If Learning - Theology Hope.pdf":{},"content/what_if_learning/What If Learning - Theology Love.pdf":{},"content/what_if_learning/What If Learning - Christian Distinctives.pdf":{},"content/what_if_learning/What If Learning - Background Research.pdf":{},"content/what_if_learning/What If Learning - Christian Spirituality.pdf":{},"content/what_if_learning/What If Learning - Spirituality and Teaching.pdf":{},"content/what_if_learning/What If Learning - Virtues.pdf":{},"content/what_if_learning/What If Learning - Art and Attentiveness.pdf":{},"content/what_if_learning/What If Learning - Art and Hospitality.pdf":{},"content/what_if_learning/What If Learning - Art & Beliefs.pdf":{},"content/what_if_learning/What If Learning - Appreciation and Baking.pdf":{},"content/what_if_learning/What If Learning - Cooking and Honoring.pdf":{},"content/what_if_learning/What If Learning - Dance and Forgiveness.pdf":{},"content/what_if_learning/What If Learning - Design and Humility.pdf":{},"content/what_if_learning/What If Learning - Design and Communities.pdf":{},"content/what_if_learning/What If Learning - Design and Contentment.pdf":{},"content/what_if_learning/What If Learning - Design and Delight.pdf":{},"content/what_if_learning/What If Learning - Drama and Others.pdf":{},"content/what_if_learning/What If Learning - Literature and Grace.pdf":{},"content/what_if_learning/What If Learning - Loving Texts.pdf":{},"content/what_if_learning/What If Learning - Poetry and Revenge.pdf":{},"content/what_if_learning/What If Learning - Literature and Choices.pdf":{},"content/what_if_learning/What If Learning - Literature and Faith.pdf":{},"content/what_if_learning/What If Learning - Poetry and Hope.pdf":{},"content/what_if_learning/What If Learning - Writing About Others.pdf":{},"content/what_if_learning/What If Learning - Grammar and Encouragement.pdf":{},"content/what_if_learning/What If Learning - Poetry and Delight.pdf":{},"content/what_if_learning/What If Learning - Words as Gifts.pdf":{},"content/what_if_learning/What If Learning - Plot and Choices.pdf":{},"content/what_if_learning/What If Learning - Faith and Poetry.pdf":{},"content/what_if_learning/What If Learning - Book Week.pdf":{},"content/what_if_learning/What If Learning - Music and Respect.pdf":{},"content/what_if_learning/What If Learning - Music and Creativity.pdf":{},"content/what_if_learning/What If Learning - Singing and Humility.pdf":{},"content/what_if_learning/What If Learning - Guests in God’s World.pdf":{},"content/what_if_learning/What If Learning - Gods World.pdf":{},"content/what_if_learning/What If Learning - Maps and Values.pdf":{},"content/what_if_learning/What If Learning - Geography and Faith.pdf":{},"content/what_if_learning/What If Learning - Geography and Justice.pdf":{},"content/what_if_learning/What If Learning - Migration Stories.pdf":{},"content/what_if_learning/What If Learning - Maps and Local Needs.pdf":{},"content/what_if_learning/What If Learning - Treaties and Virtues.pdf":{},"content/what_if_learning/What If Learning - Flawed Reformers.pdf":{},"content/what_if_learning/What If Learning - History and Wealth.pdf":{},"content/what_if_learning/What If Learning - History and Changes.pdf":{},"content/what_if_learning/What If Learning - History and Communities.pdf":{},"content/what_if_learning/What If Learning - History and Virtues.pdf":{},"content/what_if_learning/What If Learning - History and Faith.pdf":{},"content/what_if_learning/What If Learning - History and Poverty.pdf":{},"content/what_if_learning/What If Learning - Loving a City.pdf":{},"content/what_if_learning/What If Learning - History and Change.pdf":{},"content/what_if_learning/What If Learning - Righting Historical Wrongs.pdf":{},"content/what_if_learning/What If Learning - The Meaning of Time.pdf":{},"content/what_if_learning/What If Learning - Computers and Humans.pdf":{},"content/what_if_learning/What If Learning - Pie Charts and Truth.pdf":{},"content/what_if_learning/What If Learning - Math and Justice.pdf":{},"content/what_if_learning/What If Learning - Community and Math.pdf":{},"content/what_if_learning/What If Learning - Math and Forgiveness.pdf":{},"content/what_if_learning/What If Learning - Pie Charts and Giving.pdf":{},"content/what_if_learning/What If Learning - Math and Giving.pdf":{},"content/what_if_learning/What If Learning - Math and Measuring.pdf":{},"content/what_if_learning/What If Learning - Graphs and Delight.pdf":{},"content/what_if_learning/What If Learning - Percentages and Injustice.pdf":{},"content/what_if_learning/What If Learning - Math Questions.pdf":{},"content/what_if_learning/What If Learning - Serving through Words.pdf":{},"content/what_if_learning/What If Learning - Words and Care.pdf":{},"content/what_if_learning/What If Learning - Languages and Hospitality.pdf":{},"content/what_if_learning/What If Learning - Failure and Community.pdf":{},"content/what_if_learning/What If Learning - What is Love.pdf":{},"content/what_if_learning/What If Learning - Grammar and Giving.pdf":{},"content/what_if_learning/What If Learning - French and Hospitality.pdf":{},"content/what_if_learning/What If Learning - Language and Community.pdf":{},"content/what_if_learning/What If Learning  - Languages and Relationships.pdf":{},"content/what_if_learning/What If Learning - Bodies and People.pdf":{},"content/what_if_learning/What If Learning - Addressing Fears.pdf":{},"content/what_if_learning/What If Learning - Sport and Restraint.pdf":{},"content/what_if_learning/What If Learning - Teams and Individuals.pdf":{},"content/what_if_learning/What If Learning - Sport and Respect.pdf":{},"content/what_if_learning/What If Learning - Words and Actions.pdf":{},"content/what_if_learning/What If Learning - Blessings and religion class.pdf":{},"content/what_if_learning/What If Learning - Strength and Weakness.pdf":{},"content/what_if_learning/What If Learning - Anxiety and Peace.pdf":{},"content/what_if_learning/What If Learning - Responsibility and Community.pdf":{},"content/what_if_learning/What If Learning - Rules and Virtues.pdf":{},"content/what_if_learning/What If Learning - Rules and Community.pdf":{},"content/what_if_learning/What If Learning - Faith and Life.pdf":{},"content/what_if_learning/What If Learning - Reason and Faith.pdf":{},"content/what_if_learning/What If Learning - What Tests Teach.pdf":{},"content/what_if_learning/What If Learning - Patterns and Wonder.pdf":{},"content/what_if_learning/What If Learning - Chemistry and Wonder.pdf":{},"content/what_if_learning/What If Learning - Meeting Parents.pdf":{},"content/what_if_learning/What If Learning - Faith and Science.pdf":{},"content/what_if_learning/What If Learning - Nothing But Atoms.pdf":{},"content/what_if_learning/What If Learning - Seeing Connections.pdf":{},"content/what_if_learning/What If Learning - Plants and Wonder.pdf":{},"content/what_if_learning/What If Learning - Magnets and Wonder.pdf":{},"content/what_if_learning/What If Learning - Teaching and Gratitude.pdf":{},"content/what_if_learning/What If Learning  - Posture and Respect.pdf":{},"content/what_if_learning/What If Learning - Triumphs and Disasters.pdf":{},"content/what_if_learning/What If Learning - Rewarding Perseverance.pdf":{},"content/what_if_learning/What If Learning - Tests and Gratitude.pdf":{},"content/what_if_learning/What If Learning - Transportation and Service.pdf":{},"content/what_if_learning/What If Learning - Serving the Community.pdf":{},"content/mathematics/kuyers/math-lesson1.pdf":{},"content/mathematics/kuyers/math-lesson2.pdf":{},"content/mathematics/kuyers/math-lesson3.pdf":{},"content/mathematics/kuyers/math-lesson4.pdf":{},"content/mathematics/kuyers/math-lesson5.pdf":{},"content/mathematics/kuyers/math-lesson6.pdf":{},"content/mathematics/kuyers/math-lesson7.pdf":{},"content/mathematics/kuyers/math-lesson8.pdf":{},"content/mathematics/kuyers/math-lesson9.pdf":{}},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["integr",{"_index":400,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["interconnected",{"_index":346,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Seeing Connections.pdf":{},"content/what_if_learning/What If Learning - Plants and Wonder.pdf":{}}}],["interdepend",{"_index":77,"title":{"content/what_if_learning/What If Learning - Interdependence and community.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Singing and Humility.pdf":{}}}],["interest",{"_index":391,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["introductori",{"_index":384,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["invest",{"_index":460,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson4.pdf":{}}}],["involv",{"_index":177,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Art and Attentiveness.pdf":{},"content/what_if_learning/What If Learning - Faith and Life.pdf":{}}}],["issu",{"_index":109,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Self-control and peace.pdf":{},"content/what_if_learning/What If Learning - Faith and Science.pdf":{},"content/mathematics/kuyers/math-lesson8.pdf":{},"content/mathematics/kuyers/math-lesson9.pdf":{}}}],["it’",{"_index":396,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["jenni",{"_index":370,"title":{},"author":{"content/kuyers/psychfaithman2.pdf":{}},"abstract":{}}],["journey",{"_index":203,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Literature and Faith.pdf":{}}}],["joy",{"_index":89,"title":{"content/what_if_learning/What If Learning - Hope and joy.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Hope and joy.pdf":{}}}],["justic",{"_index":135,"title":{"content/what_if_learning/What If Learning - Healing brokenness and seeking justice.pdf":{},"content/what_if_learning/What If Learning - Geography and Justice.pdf":{},"content/what_if_learning/What If Learning - Math and Justice.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Healing brokenness and seeking justice.pdf":{},"content/what_if_learning/What If Learning - Treaties and Virtues.pdf":{},"content/what_if_learning/What If Learning - History and Virtues.pdf":{}}}],["kok",{"_index":367,"title":{},"author":{"content/kuyers/psychfaithman2.pdf":{}},"abstract":{}}],["kuyer",{"_index":3,"title":{},"author":{"kuyers/content/what_if_learning/What If Learning - Connecting Faith with All of Life.pdf":{},"content/what_if_learning/What If Learning - Honoring the wonder of God’s world.pdf":{},"content/what_if_learning/What If Learning - Curiosity about life’s big questions.pdf":{},"content/what_if_learning/What If Learning - Meaning, significance, and purpose.pdf":{},"content/what_if_learning/What If Learning - Seeing people holistically.pdf":{},"content/what_if_learning/What If Learning - Being challenged and changed.pdf":{},"content/what_if_learning/What If Learning - Celebrating grace.pdf":{},"content/what_if_learning/What If Learning - Appreciation and gratitude.pdf":{},"content/what_if_learning/What If Learning - Delighting in God’s world.pdf":{},"content/what_if_learning/What If Learning - Focused, loving attentiveness.pdf":{},"content/what_if_learning/What If Learning - Respect and reverence.pdf":{},"content/what_if_learning/What If Learning - Trust and affirming faith.pdf":{},"content/what_if_learning/What If Learning - Humility and hospitality.pdf":{},"content/what_if_learning/What If Learning - Seeking the good of others.pdf":{},"content/what_if_learning/What If Learning - Finding worth through love.pdf":{},"content/what_if_learning/What If Learning - Interdependence and community.pdf":{},"content/what_if_learning/What If Learning - Love and forgiveness.pdf":{},"content/what_if_learning/What If Learning - Hope and joy.pdf":{},"content/what_if_learning/What If Learning - Self-control and peace.pdf":{},"content/what_if_learning/What If Learning - Embracing responsibility.pdf":{},"content/what_if_learning/What If Learning - Christian values and virtues.pdf":{},"content/what_if_learning/What If Learning - Healing brokenness and seeking justice.pdf":{},"content/what_if_learning/What If Learning - Encouragement and working for change.pdf":{},"content/what_if_learning/What If Learning - Giving and serving others.pdf":{},"content/what_if_learning/What If Learning - Theology.pdf":{},"content/what_if_learning/What If Learning - Theology Faith.pdf":{},"content/what_if_learning/What If Learning - Theology Hope.pdf":{},"content/what_if_learning/What If Learning - Theology Love.pdf":{},"content/what_if_learning/What If Learning - Christian Distinctives.pdf":{},"content/what_if_learning/What If Learning - Background Research.pdf":{},"content/what_if_learning/What If Learning - Christian Spirituality.pdf":{},"content/what_if_learning/What If Learning - Spirituality and Teaching.pdf":{},"content/what_if_learning/What If Learning - Virtues.pdf":{},"content/what_if_learning/What If Learning - Art and Attentiveness.pdf":{},"content/what_if_learning/What If Learning - Art and Hospitality.pdf":{},"content/what_if_learning/What If Learning - Art & Beliefs.pdf":{},"content/what_if_learning/What If Learning - Appreciation and Baking.pdf":{},"content/what_if_learning/What If Learning - Cooking and Honoring.pdf":{},"content/what_if_learning/What If Learning - Dance and Forgiveness.pdf":{},"content/what_if_learning/What If Learning - Design and Humility.pdf":{},"content/what_if_learning/What If Learning - Design and Communities.pdf":{},"content/what_if_learning/What If Learning - Design and Contentment.pdf":{},"content/what_if_learning/What If Learning - Design and Delight.pdf":{},"content/what_if_learning/What If Learning - Drama and Others.pdf":{},"content/what_if_learning/What If Learning - Literature and Grace.pdf":{},"content/what_if_learning/What If Learning - Loving Texts.pdf":{},"content/what_if_learning/What If Learning - Poetry and Revenge.pdf":{},"content/what_if_learning/What If Learning - Literature and Choices.pdf":{},"content/what_if_learning/What If Learning - Literature and Faith.pdf":{},"content/what_if_learning/What If Learning - Poetry and Hope.pdf":{},"content/what_if_learning/What If Learning - Writing About Others.pdf":{},"content/what_if_learning/What If Learning - Grammar and Encouragement.pdf":{},"content/what_if_learning/What If Learning - Poetry and Delight.pdf":{},"content/what_if_learning/What If Learning - Words as Gifts.pdf":{},"content/what_if_learning/What If Learning - Plot and Choices.pdf":{},"content/what_if_learning/What If Learning - Faith and Poetry.pdf":{},"content/what_if_learning/What If Learning - Book Week.pdf":{},"content/what_if_learning/What If Learning - Music and Respect.pdf":{},"content/what_if_learning/What If Learning - Music and Creativity.pdf":{},"content/what_if_learning/What If Learning - Singing and Humility.pdf":{},"content/what_if_learning/What If Learning - Guests in God’s World.pdf":{},"content/what_if_learning/What If Learning - Gods World.pdf":{},"content/what_if_learning/What If Learning - Maps and Values.pdf":{},"content/what_if_learning/What If Learning - Geography and Faith.pdf":{},"content/what_if_learning/What If Learning - Geography and Justice.pdf":{},"content/what_if_learning/What If Learning - Migration Stories.pdf":{},"content/what_if_learning/What If Learning - Maps and Local Needs.pdf":{},"content/what_if_learning/What If Learning - Treaties and Virtues.pdf":{},"content/what_if_learning/What If Learning - Flawed Reformers.pdf":{},"content/what_if_learning/What If Learning - History and Wealth.pdf":{},"content/what_if_learning/What If Learning - History and Changes.pdf":{},"content/what_if_learning/What If Learning - History and Communities.pdf":{},"content/what_if_learning/What If Learning - History and Virtues.pdf":{},"content/what_if_learning/What If Learning - History and Faith.pdf":{},"content/what_if_learning/What If Learning - History and Poverty.pdf":{},"content/what_if_learning/What If Learning - Loving a City.pdf":{},"content/what_if_learning/What If Learning - History and Change.pdf":{},"content/what_if_learning/What If Learning - Righting Historical Wrongs.pdf":{},"content/what_if_learning/What If Learning - The Meaning of Time.pdf":{},"content/what_if_learning/What If Learning - Computers and Humans.pdf":{},"content/what_if_learning/What If Learning - Pie Charts and Truth.pdf":{},"content/what_if_learning/What If Learning - Math and Justice.pdf":{},"content/what_if_learning/What If Learning - Community and Math.pdf":{},"content/what_if_learning/What If Learning - Math and Forgiveness.pdf":{},"content/what_if_learning/What If Learning - Pie Charts and Giving.pdf":{},"content/what_if_learning/What If Learning - Math and Giving.pdf":{},"content/what_if_learning/What If Learning - Math and Measuring.pdf":{},"content/what_if_learning/What If Learning - Graphs and Delight.pdf":{},"content/what_if_learning/What If Learning - Percentages and Injustice.pdf":{},"content/what_if_learning/What If Learning - Math Questions.pdf":{},"content/what_if_learning/What If Learning - Serving through Words.pdf":{},"content/what_if_learning/What If Learning - Words and Care.pdf":{},"content/what_if_learning/What If Learning - Languages and Hospitality.pdf":{},"content/what_if_learning/What If Learning - Failure and Community.pdf":{},"content/what_if_learning/What If Learning - What is Love.pdf":{},"content/what_if_learning/What If Learning - Grammar and Giving.pdf":{},"content/what_if_learning/What If Learning - French and Hospitality.pdf":{},"content/what_if_learning/What If Learning - Language and Community.pdf":{},"content/what_if_learning/What If Learning  - Languages and Relationships.pdf":{},"content/what_if_learning/What If Learning - Bodies and People.pdf":{},"content/what_if_learning/What If Learning - Addressing Fears.pdf":{},"content/what_if_learning/What If Learning - Sport and Restraint.pdf":{},"content/what_if_learning/What If Learning - Teams and Individuals.pdf":{},"content/what_if_learning/What If Learning - Sport and Respect.pdf":{},"content/what_if_learning/What If Learning - Words and Actions.pdf":{},"content/what_if_learning/What If Learning - Blessings and religion class.pdf":{},"content/what_if_learning/What If Learning - Strength and Weakness.pdf":{},"content/what_if_learning/What If Learning - Anxiety and Peace.pdf":{},"content/what_if_learning/What If Learning - Responsibility and Community.pdf":{},"content/what_if_learning/What If Learning - Rules and Virtues.pdf":{},"content/what_if_learning/What If Learning - Rules and Community.pdf":{},"content/what_if_learning/What If Learning - Faith and Life.pdf":{},"content/what_if_learning/What If Learning - Reason and Faith.pdf":{},"content/what_if_learning/What If Learning - What Tests Teach.pdf":{},"content/what_if_learning/What If Learning - Patterns and Wonder.pdf":{},"content/what_if_learning/What If Learning - Chemistry and Wonder.pdf":{},"content/what_if_learning/What If Learning - Meeting Parents.pdf":{},"content/what_if_learning/What If Learning - Faith and Science.pdf":{},"content/what_if_learning/What If Learning - Nothing But Atoms.pdf":{},"content/what_if_learning/What If Learning - Seeing Connections.pdf":{},"content/what_if_learning/What If Learning - Plants and Wonder.pdf":{},"content/what_if_learning/What If Learning - Magnets and Wonder.pdf":{},"content/what_if_learning/What If Learning - Teaching and Gratitude.pdf":{},"content/what_if_learning/What If Learning  - Posture and Respect.pdf":{},"content/what_if_learning/What If Learning - Triumphs and Disasters.pdf":{},"content/what_if_learning/What If Learning - Rewarding Perseverance.pdf":{},"content/what_if_learning/What If Learning - Tests and Gratitude.pdf":{},"content/what_if_learning/What If Learning - Transportation and Service.pdf":{},"content/what_if_learning/What If Learning - Serving the Community.pdf":{},"content/mathematics/kuyers/math-lesson1.pdf":{},"content/mathematics/kuyers/math-lesson2.pdf":{},"content/mathematics/kuyers/math-lesson3.pdf":{},"content/mathematics/kuyers/math-lesson4.pdf":{},"content/mathematics/kuyers/math-lesson5.pdf":{},"content/mathematics/kuyers/math-lesson6.pdf":{},"content/mathematics/kuyers/math-lesson7.pdf":{},"content/mathematics/kuyers/math-lesson8.pdf":{},"content/mathematics/kuyers/math-lesson9.pdf":{}},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["languag",{"_index":280,"title":{"content/what_if_learning/What If Learning - Serving through Words.pdf":{},"content/what_if_learning/What If Learning - Words and Care.pdf":{},"content/what_if_learning/What If Learning - Languages and Hospitality.pdf":{},"content/what_if_learning/What If Learning - Failure and Community.pdf":{},"content/what_if_learning/What If Learning - What is Love.pdf":{},"content/what_if_learning/What If Learning - Grammar and Giving.pdf":{},"content/what_if_learning/What If Learning - French and Hospitality.pdf":{},"content/what_if_learning/What If Learning - Language and Community.pdf":{},"content/what_if_learning/What If Learning  - Languages and Relationships.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Words and Care.pdf":{},"content/what_if_learning/What If Learning - Languages and Hospitality.pdf":{},"content/what_if_learning/What If Learning - What is Love.pdf":{},"content/what_if_learning/What If Learning - Language and Community.pdf":{},"content/what_if_learning/What If Learning  - Languages and Relationships.pdf":{}}}],["lavonn",{"_index":368,"title":{},"author":{"content/kuyers/psychfaithman2.pdf":{}},"abstract":{}}],["lead",{"_index":45,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Respect and reverence.pdf":{}}}],["learn",{"_index":81,"title":{"content/what_if_learning/What If Learning - Background Research.pdf":{},"content/kuyers/psychfaithman2.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Interdependence and community.pdf":{},"content/what_if_learning/What If Learning - Embracing responsibility.pdf":{},"content/what_if_learning/What If Learning - Theology Hope.pdf":{},"content/what_if_learning/What If Learning - Theology Love.pdf":{},"content/what_if_learning/What If Learning - Background Research.pdf":{},"content/what_if_learning/What If Learning - Art and Hospitality.pdf":{},"content/what_if_learning/What If Learning - Loving Texts.pdf":{},"content/what_if_learning/What If Learning - Writing About Others.pdf":{},"content/what_if_learning/What If Learning - Graphs and Delight.pdf":{},"content/what_if_learning/What If Learning - Serving through Words.pdf":{},"content/what_if_learning/What If Learning - Blessings and religion class.pdf":{},"content/what_if_learning/What If Learning - What Tests Teach.pdf":{},"content/what_if_learning/What If Learning - Patterns and Wonder.pdf":{},"content/what_if_learning/What If Learning - Transportation and Service.pdf":{},"content/kuyers/psychfaithman2.pdf":{},"content/mathematics/kuyers/math-lesson2.pdf":{},"content/mathematics/kuyers/math-lesson6.pdf":{}}}],["learner",{"_index":317,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Strength and Weakness.pdf":{}}}],["lectur",{"_index":418,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["led",{"_index":275,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Graphs and Delight.pdf":{},"content/what_if_learning/What If Learning - Patterns and Wonder.pdf":{}}}],["left",{"_index":472,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson5.pdf":{}}}],["legaci",{"_index":250,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - History and Faith.pdf":{}}}],["lesson",{"_index":207,"title":{"content/mathematics/kuyers/math-lesson5.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Grammar and Encouragement.pdf":{},"content/what_if_learning/What If Learning - Computers and Humans.pdf":{},"content/what_if_learning/What If Learning - Math and Giving.pdf":{},"content/what_if_learning/What If Learning - What is Love.pdf":{},"content/what_if_learning/What If Learning - Grammar and Giving.pdf":{},"content/what_if_learning/What If Learning  - Languages and Relationships.pdf":{},"content/what_if_learning/What If Learning - Nothing But Atoms.pdf":{},"content/what_if_learning/What If Learning - Magnets and Wonder.pdf":{},"content/mathematics/kuyers/math-lesson1.pdf":{},"content/mathematics/kuyers/math-lesson2.pdf":{},"content/mathematics/kuyers/math-lesson3.pdf":{},"content/mathematics/kuyers/math-lesson4.pdf":{},"content/mathematics/kuyers/math-lesson6.pdf":{},"content/mathematics/kuyers/math-lesson7.pdf":{},"content/mathematics/kuyers/math-lesson8.pdf":{},"content/mathematics/kuyers/math-lesson9.pdf":{}}}],["level",{"_index":385,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["life",{"_index":2,"title":{"kuyers/content/what_if_learning/What If Learning - Connecting Faith with All of Life.pdf":{},"content/what_if_learning/What If Learning - Faith and Life.pdf":{}},"author":{},"abstract":{"kuyers/content/what_if_learning/What If Learning - Connecting Faith with All of Life.pdf":{},"content/what_if_learning/What If Learning - Appreciation and gratitude.pdf":{},"content/what_if_learning/What If Learning - Encouragement and working for change.pdf":{},"content/what_if_learning/What If Learning - Spirituality and Teaching.pdf":{},"content/what_if_learning/What If Learning - Rules and Virtues.pdf":{}}}],["life’",{"_index":13,"title":{"content/what_if_learning/What If Learning - Curiosity about life’s big questions.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Curiosity about life’s big questions.pdf":{}}}],["light",{"_index":171,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Christian Spirituality.pdf":{}}}],["line",{"_index":310,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Words and Actions.pdf":{}}}],["literatur",{"_index":193,"title":{"content/what_if_learning/What If Learning - Literature and Grace.pdf":{},"content/what_if_learning/What If Learning - Literature and Choices.pdf":{},"content/what_if_learning/What If Learning - Literature and Faith.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Literature and Choices.pdf":{}}}],["litter",{"_index":309,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Words and Actions.pdf":{},"content/what_if_learning/What If Learning - Responsibility and Community.pdf":{}}}],["live",{"_index":100,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Hope and joy.pdf":{},"content/what_if_learning/What If Learning - Theology Faith.pdf":{},"content/what_if_learning/What If Learning - Christian Spirituality.pdf":{},"content/what_if_learning/What If Learning - Math and Justice.pdf":{},"content/what_if_learning/What If Learning - Faith and Life.pdf":{},"content/mathematics/kuyers/math-lesson1.pdf":{},"content/mathematics/kuyers/math-lesson2.pdf":{}}}],["local",{"_index":237,"title":{"content/what_if_learning/What If Learning - Maps and Local Needs.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Maps and Local Needs.pdf":{}}}],["logic",{"_index":432,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson2.pdf":{}}}],["long",{"_index":502,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson8.pdf":{},"content/mathematics/kuyers/math-lesson9.pdf":{}}}],["look",{"_index":146,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Giving and serving others.pdf":{},"content/what_if_learning/What If Learning - Christian Distinctives.pdf":{},"content/what_if_learning/What If Learning - Literature and Faith.pdf":{},"content/what_if_learning/What If Learning - Geography and Faith.pdf":{},"content/what_if_learning/What If Learning - Maps and Local Needs.pdf":{},"content/mathematics/kuyers/math-lesson1.pdf":{},"content/mathematics/kuyers/math-lesson6.pdf":{}}}],["love",{"_index":39,"title":{"content/what_if_learning/What If Learning - Focused, loving attentiveness.pdf":{},"content/what_if_learning/What If Learning - Finding worth through love.pdf":{},"content/what_if_learning/What If Learning - Love and forgiveness.pdf":{},"content/what_if_learning/What If Learning - Theology Love.pdf":{},"content/what_if_learning/What If Learning - Loving Texts.pdf":{},"content/what_if_learning/What If Learning - Loving a City.pdf":{},"content/what_if_learning/What If Learning - What is Love.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Focused, loving attentiveness.pdf":{},"content/what_if_learning/What If Learning - Seeking the good of others.pdf":{},"content/what_if_learning/What If Learning - Finding worth through love.pdf":{},"content/what_if_learning/What If Learning - Love and forgiveness.pdf":{},"content/what_if_learning/What If Learning - Virtues.pdf":{},"content/what_if_learning/What If Learning - Art and Attentiveness.pdf":{},"content/what_if_learning/What If Learning - Loving Texts.pdf":{},"content/what_if_learning/What If Learning - Writing About Others.pdf":{},"content/what_if_learning/What If Learning - History and Poverty.pdf":{},"content/what_if_learning/What If Learning - Loving a City.pdf":{},"content/what_if_learning/What If Learning - What is Love.pdf":{}}}],["made",{"_index":200,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Poetry and Revenge.pdf":{},"content/what_if_learning/What If Learning - Music and Creativity.pdf":{},"content/what_if_learning/What If Learning - Percentages and Injustice.pdf":{},"content/what_if_learning/What If Learning - Bodies and People.pdf":{}}}],["madeiro",{"_index":373,"title":{},"author":{"content/kuyers/psychfaithman2.pdf":{}},"abstract":{}}],["magnet",{"_index":349,"title":{"content/what_if_learning/What If Learning - Magnets and Wonder.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Magnets and Wonder.pdf":{}}}],["make",{"_index":79,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Interdependence and community.pdf":{},"content/what_if_learning/What If Learning - Embracing responsibility.pdf":{},"content/what_if_learning/What If Learning - Giving and serving others.pdf":{},"content/what_if_learning/What If Learning - Flawed Reformers.pdf":{},"content/what_if_learning/What If Learning - History and Change.pdf":{},"content/what_if_learning/What If Learning - Pie Charts and Giving.pdf":{},"content/mathematics/kuyers/math-lesson6.pdf":{}}}],["mani",{"_index":82,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Interdependence and community.pdf":{},"content/what_if_learning/What If Learning - Self-control and peace.pdf":{},"content/what_if_learning/What If Learning - Encouragement and working for change.pdf":{},"content/kuyers/psychfaithman2.pdf":{},"content/mathematics/kuyers/math-lesson1.pdf":{},"content/mathematics/kuyers/math-lesson4.pdf":{}}}],["map",{"_index":230,"title":{"content/what_if_learning/What If Learning - Maps and Values.pdf":{},"content/what_if_learning/What If Learning - Maps and Local Needs.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Maps and Values.pdf":{}}}],["materi",{"_index":381,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["math",{"_index":262,"title":{"content/what_if_learning/What If Learning - Pie Charts and Truth.pdf":{},"content/what_if_learning/What If Learning - Math and Justice.pdf":{},"content/what_if_learning/What If Learning - Community and Math.pdf":{},"content/what_if_learning/What If Learning - Math and Forgiveness.pdf":{},"content/what_if_learning/What If Learning - Pie Charts and Giving.pdf":{},"content/what_if_learning/What If Learning - Math and Giving.pdf":{},"content/what_if_learning/What If Learning - Math and Measuring.pdf":{},"content/what_if_learning/What If Learning - Graphs and Delight.pdf":{},"content/what_if_learning/What If Learning - Percentages and Injustice.pdf":{},"content/what_if_learning/What If Learning - Math Questions.pdf":{},"content/mathematics/kuyers/math-lesson1.pdf":{},"content/mathematics/kuyers/math-lesson7.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Community and Math.pdf":{},"content/what_if_learning/What If Learning - Math and Forgiveness.pdf":{},"content/what_if_learning/What If Learning - Math and Giving.pdf":{},"content/what_if_learning/What If Learning - Math and Measuring.pdf":{},"content/what_if_learning/What If Learning - Math Questions.pdf":{},"content/mathematics/kuyers/math-lesson1.pdf":{},"content/mathematics/kuyers/math-lesson2.pdf":{},"content/mathematics/kuyers/math-lesson7.pdf":{}}}],["mathemat",{"_index":428,"title":{"content/mathematics/kuyers/math-lesson2.pdf":{},"content/mathematics/kuyers/math-lesson6.pdf":{}},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson2.pdf":{},"content/mathematics/kuyers/math-lesson6.pdf":{},"content/mathematics/kuyers/math-lesson7.pdf":{}}}],["mean",{"_index":7,"title":{"content/what_if_learning/What If Learning - Meaning, significance, and purpose.pdf":{},"content/what_if_learning/What If Learning - The Meaning of Time.pdf":{}},"author":{},"abstract":{"kuyers/content/what_if_learning/What If Learning - Connecting Faith with All of Life.pdf":{},"content/what_if_learning/What If Learning - Honoring the wonder of God’s world.pdf":{},"content/what_if_learning/What If Learning - Meaning, significance, and purpose.pdf":{},"content/what_if_learning/What If Learning - Theology.pdf":{},"content/what_if_learning/What If Learning - Theology Faith.pdf":{},"content/what_if_learning/What If Learning - Christian Spirituality.pdf":{},"content/what_if_learning/What If Learning - Righting Historical Wrongs.pdf":{}}}],["measur",{"_index":272,"title":{"content/what_if_learning/What If Learning - Math and Measuring.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Math and Measuring.pdf":{}}}],["media",{"_index":96,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Hope and joy.pdf":{}}}],["meet",{"_index":337,"title":{"content/what_if_learning/What If Learning - Meeting Parents.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Meeting Parents.pdf":{}}}],["member",{"_index":291,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - French and Hospitality.pdf":{}}}],["men",{"_index":505,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson8.pdf":{},"content/mathematics/kuyers/math-lesson9.pdf":{}}}],["merci",{"_index":86,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Love and forgiveness.pdf":{},"content/what_if_learning/What If Learning - History and Virtues.pdf":{}}}],["migrat",{"_index":234,"title":{"content/what_if_learning/What If Learning - Migration Stories.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Geography and Justice.pdf":{},"content/what_if_learning/What If Learning - Migration Stories.pdf":{}}}],["model",{"_index":483,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson6.pdf":{}}}],["modern",{"_index":429,"title":{"content/mathematics/kuyers/math-lesson2.pdf":{}},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson2.pdf":{}}}],["moment",{"_index":336,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Chemistry and Wonder.pdf":{}}}],["multipl",{"_index":401,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{},"content/mathematics/kuyers/math-lesson5.pdf":{}}}],["music",{"_index":217,"title":{"content/what_if_learning/What If Learning - Music and Respect.pdf":{},"content/what_if_learning/What If Learning - Music and Creativity.pdf":{},"content/what_if_learning/What If Learning - Singing and Humility.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Music and Respect.pdf":{},"content/what_if_learning/What If Learning - Music and Creativity.pdf":{}}}],["n",{"_index":116,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Embracing responsibility.pdf":{}}}],["nate",{"_index":372,"title":{},"author":{"content/kuyers/psychfaithman2.pdf":{}},"abstract":{}}],["natur",{"_index":450,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson3.pdf":{}}}],["necessarili",{"_index":154,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Theology.pdf":{}}}],["need",{"_index":238,"title":{"content/what_if_learning/What If Learning - Maps and Local Needs.pdf":{}},"author":{},"abstract":{}}],["neg",{"_index":98,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Hope and joy.pdf":{}}}],["new",{"_index":94,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Hope and joy.pdf":{},"content/what_if_learning/What If Learning - French and Hospitality.pdf":{}}}],["noth",{"_index":340,"title":{"content/what_if_learning/What If Learning - Nothing But Atoms.pdf":{}},"author":{},"abstract":{}}],["novel",{"_index":201,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Literature and Faith.pdf":{}}}],["number",{"_index":442,"title":{"content/mathematics/kuyers/math-lesson3.pdf":{}},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson3.pdf":{}}}],["nurtur",{"_index":49,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Trust and affirming faith.pdf":{}}}],["ocean",{"_index":497,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson7.pdf":{}}}],["on",{"_index":469,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson5.pdf":{},"content/mathematics/kuyers/math-lesson6.pdf":{},"content/mathematics/kuyers/math-lesson8.pdf":{},"content/mathematics/kuyers/math-lesson9.pdf":{}}}],["onlin",{"_index":331,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - What Tests Teach.pdf":{}}}],["open",{"_index":163,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Theology Love.pdf":{}}}],["opportun",{"_index":287,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Failure and Community.pdf":{}}}],["order",{"_index":73,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Finding worth through love.pdf":{}}}],["organ",{"_index":118,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Embracing responsibility.pdf":{}}}],["other",{"_index":55,"title":{"content/what_if_learning/What If Learning - Seeking the good of others.pdf":{},"content/what_if_learning/What If Learning - Giving and serving others.pdf":{},"content/what_if_learning/What If Learning - Drama and Others.pdf":{},"content/what_if_learning/What If Learning - Writing About Others.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Seeking the good of others.pdf":{},"content/what_if_learning/What If Learning - Finding worth through love.pdf":{},"content/what_if_learning/What If Learning - Theology Love.pdf":{},"content/what_if_learning/What If Learning - Design and Humility.pdf":{},"content/what_if_learning/What If Learning - Design and Delight.pdf":{},"content/what_if_learning/What If Learning - Drama and Others.pdf":{},"content/what_if_learning/What If Learning - Graphs and Delight.pdf":{},"content/what_if_learning/What If Learning - Words and Care.pdf":{},"content/what_if_learning/What If Learning - Teams and Individuals.pdf":{},"content/what_if_learning/What If Learning - Blessings and religion class.pdf":{}}}],["other’",{"_index":357,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Triumphs and Disasters.pdf":{}}}],["outward",{"_index":75,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Finding worth through love.pdf":{}}}],["overwhelm",{"_index":92,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Hope and joy.pdf":{}}}],["paid",{"_index":506,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson8.pdf":{},"content/mathematics/kuyers/math-lesson9.pdf":{}}}],["paradox",{"_index":509,"title":{"content/mathematics/kuyers/math-lesson9.pdf":{}},"author":{},"abstract":{}}],["parent",{"_index":338,"title":{"content/what_if_learning/What If Learning - Meeting Parents.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Meeting Parents.pdf":{}}}],["part",{"_index":130,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Christian values and virtues.pdf":{}}}],["past",{"_index":62,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Seeking the good of others.pdf":{}}}],["patienc",{"_index":107,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Self-control and peace.pdf":{}}}],["pattern",{"_index":333,"title":{"content/what_if_learning/What If Learning - Patterns and Wonder.pdf":{}},"author":{},"abstract":{}}],["peac",{"_index":105,"title":{"content/what_if_learning/What If Learning - Self-control and peace.pdf":{},"content/what_if_learning/What If Learning - Anxiety and Peace.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Self-control and peace.pdf":{},"content/what_if_learning/What If Learning - Treaties and Virtues.pdf":{},"content/what_if_learning/What If Learning - Anxiety and Peace.pdf":{}}}],["pedagogi",{"_index":129,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Christian values and virtues.pdf":{}}}],["peopl",{"_index":21,"title":{"content/what_if_learning/What If Learning - Seeing people holistically.pdf":{},"content/what_if_learning/What If Learning - Bodies and People.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Seeing people holistically.pdf":{},"content/what_if_learning/What If Learning - Respect and reverence.pdf":{},"content/what_if_learning/What If Learning - Geography and Faith.pdf":{},"content/what_if_learning/What If Learning - Maps and Local Needs.pdf":{},"content/what_if_learning/What If Learning - Flawed Reformers.pdf":{},"content/what_if_learning/What If Learning - Serving the Community.pdf":{},"content/mathematics/kuyers/math-lesson1.pdf":{},"content/mathematics/kuyers/math-lesson2.pdf":{}}}],["people'",{"_index":235,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Geography and Justice.pdf":{},"content/what_if_learning/What If Learning - Migration Stories.pdf":{}}}],["people’",{"_index":249,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - History and Faith.pdf":{},"content/what_if_learning/What If Learning - Math and Justice.pdf":{}}}],["percentag",{"_index":267,"title":{"content/what_if_learning/What If Learning - Percentages and Injustice.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Math and Justice.pdf":{},"content/what_if_learning/What If Learning - Percentages and Injustice.pdf":{}}}],["perfect",{"_index":361,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Rewarding Perseverance.pdf":{}}}],["persever",{"_index":360,"title":{"content/what_if_learning/What If Learning - Rewarding Perseverance.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Rewarding Perseverance.pdf":{}}}],["perspect",{"_index":344,"title":{"content/mathematics/kuyers/math-lesson2.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Nothing But Atoms.pdf":{},"content/kuyers/psychfaithman2.pdf":{},"content/mathematics/kuyers/math-lesson1.pdf":{},"content/mathematics/kuyers/math-lesson2.pdf":{}}}],["physic",{"_index":292,"title":{"content/what_if_learning/What If Learning - Bodies and People.pdf":{},"content/what_if_learning/What If Learning - Addressing Fears.pdf":{},"content/what_if_learning/What If Learning - Sport and Restraint.pdf":{},"content/what_if_learning/What If Learning - Teams and Individuals.pdf":{},"content/what_if_learning/What If Learning - Sport and Respect.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Bodies and People.pdf":{},"content/what_if_learning/What If Learning - Addressing Fears.pdf":{}}}],["pick",{"_index":307,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Words and Actions.pdf":{},"content/what_if_learning/What If Learning - Responsibility and Community.pdf":{}}}],["pie",{"_index":263,"title":{"content/what_if_learning/What If Learning - Pie Charts and Truth.pdf":{},"content/what_if_learning/What If Learning - Pie Charts and Giving.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Pie Charts and Truth.pdf":{},"content/what_if_learning/What If Learning - Pie Charts and Giving.pdf":{}}}],["place",{"_index":232,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Geography and Faith.pdf":{}}}],["plan",{"_index":123,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Embracing responsibility.pdf":{},"content/what_if_learning/What If Learning - History and Virtues.pdf":{}}}],["plant",{"_index":347,"title":{"content/what_if_learning/What If Learning - Plants and Wonder.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Plants and Wonder.pdf":{}}}],["playground",{"_index":324,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Rules and Virtues.pdf":{}}}],["plot",{"_index":211,"title":{"content/what_if_learning/What If Learning - Plot and Choices.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Plot and Choices.pdf":{}}}],["poem",{"_index":204,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Poetry and Hope.pdf":{},"content/what_if_learning/What If Learning - Faith and Poetry.pdf":{}}}],["poetri",{"_index":198,"title":{"content/what_if_learning/What If Learning - Poetry and Revenge.pdf":{},"content/what_if_learning/What If Learning - Poetry and Hope.pdf":{},"content/what_if_learning/What If Learning - Poetry and Delight.pdf":{},"content/what_if_learning/What If Learning - Faith and Poetry.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Poetry and Revenge.pdf":{},"content/what_if_learning/What If Learning - Poetry and Delight.pdf":{}}}],["popul",{"_index":233,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Geography and Justice.pdf":{},"content/what_if_learning/What If Learning - Migration Stories.pdf":{},"content/mathematics/kuyers/math-lesson4.pdf":{}}}],["popular",{"_index":413,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["postmodenr",{"_index":430,"title":{"content/mathematics/kuyers/math-lesson2.pdf":{}},"author":{},"abstract":{}}],["postmodern",{"_index":438,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson2.pdf":{}}}],["postur",{"_index":351,"title":{"content/what_if_learning/What If Learning  - Posture and Respect.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning  - Posture and Respect.pdf":{}}}],["poverti",{"_index":246,"title":{"content/what_if_learning/What If Learning - History and Poverty.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - History and Wealth.pdf":{}}}],["power",{"_index":480,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson6.pdf":{}}}],["practic",{"_index":143,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Encouragement and working for change.pdf":{},"content/what_if_learning/What If Learning - Language and Community.pdf":{}}}],["predict",{"_index":484,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson6.pdf":{}}}],["preoccup",{"_index":162,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Theology Love.pdf":{}}}],["present",{"_index":63,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Seeking the good of others.pdf":{}}}],["probabl",{"_index":444,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson3.pdf":{}}}],["process",{"_index":439,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson2.pdf":{}}}],["product",{"_index":378,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["professor",{"_index":399,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["promot",{"_index":174,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Virtues.pdf":{}}}],["psycholog",{"_index":365,"title":{"content/kuyers/psychfaithman2.pdf":{}},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["psychology’",{"_index":394,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["purpos",{"_index":18,"title":{"content/what_if_learning/What If Learning - Meaning, significance, and purpose.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Meaning, significance, and purpose.pdf":{},"content/what_if_learning/What If Learning - What Tests Teach.pdf":{}}}],["put",{"_index":342,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Nothing But Atoms.pdf":{},"content/kuyers/psychfaithman2.pdf":{}}}],["qualiti",{"_index":259,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - The Meaning of Time.pdf":{}}}],["question",{"_index":15,"title":{"content/what_if_learning/What If Learning - Curiosity about life’s big questions.pdf":{},"content/what_if_learning/What If Learning - Math Questions.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Curiosity about life’s big questions.pdf":{},"content/what_if_learning/What If Learning - Math and Measuring.pdf":{},"content/what_if_learning/What If Learning - Math Questions.pdf":{},"content/mathematics/kuyers/math-lesson8.pdf":{},"content/mathematics/kuyers/math-lesson9.pdf":{}}}],["quizz",{"_index":332,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - What Tests Teach.pdf":{}}}],["rais",{"_index":273,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Math and Measuring.pdf":{},"content/what_if_learning/What If Learning - Faith and Science.pdf":{}}}],["ratio",{"_index":453,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson3.pdf":{}}}],["read",{"_index":197,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Loving Texts.pdf":{},"content/kuyers/psychfaithman2.pdf":{}}}],["realist",{"_index":319,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Strength and Weakness.pdf":{}}}],["realli",{"_index":158,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Theology Faith.pdf":{},"content/mathematics/kuyers/math-lesson2.pdf":{}}}],["reason",{"_index":329,"title":{"content/what_if_learning/What If Learning - Reason and Faith.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Reason and Faith.pdf":{},"content/mathematics/kuyers/math-lesson1.pdf":{}}}],["receiv",{"_index":282,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Serving through Words.pdf":{}}}],["recommend",{"_index":408,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["reflect",{"_index":227,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Guests in God’s World.pdf":{},"content/what_if_learning/What If Learning - Gods World.pdf":{}}}],["reform",{"_index":243,"title":{"content/what_if_learning/What If Learning - Flawed Reformers.pdf":{}},"author":{},"abstract":{}}],["reinvent",{"_index":404,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["rel",{"_index":436,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson2.pdf":{}}}],["relat",{"_index":145,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Encouragement and working for change.pdf":{}}}],["relationship",{"_index":69,"title":{"content/what_if_learning/What If Learning  - Languages and Relationships.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Finding worth through love.pdf":{},"content/what_if_learning/What If Learning  - Languages and Relationships.pdf":{}}}],["religion",{"_index":312,"title":{"content/what_if_learning/What If Learning - Blessings and religion class.pdf":{}},"author":{},"abstract":{}}],["resourc",{"_index":168,"title":{"content/what_if_learning/What If Learning - Background Research.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Background Research.pdf":{}}}],["respect",{"_index":43,"title":{"content/what_if_learning/What If Learning - Respect and reverence.pdf":{},"content/what_if_learning/What If Learning - Music and Respect.pdf":{},"content/what_if_learning/What If Learning - Sport and Respect.pdf":{},"content/what_if_learning/What If Learning  - Posture and Respect.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Focused, loving attentiveness.pdf":{},"content/what_if_learning/What If Learning - Respect and reverence.pdf":{},"content/what_if_learning/What If Learning - Art and Hospitality.pdf":{},"content/what_if_learning/What If Learning - Music and Respect.pdf":{},"content/what_if_learning/What If Learning - Serving through Words.pdf":{},"content/what_if_learning/What If Learning - Sport and Respect.pdf":{},"content/what_if_learning/What If Learning  - Posture and Respect.pdf":{}}}],["respons",{"_index":34,"title":{"content/what_if_learning/What If Learning - Embracing responsibility.pdf":{},"content/what_if_learning/What If Learning - Responsibility and Community.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Appreciation and gratitude.pdf":{},"content/what_if_learning/What If Learning - Embracing responsibility.pdf":{}}}],["restraint",{"_index":297,"title":{"content/what_if_learning/What If Learning - Sport and Restraint.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Sport and Restraint.pdf":{}}}],["reveng",{"_index":199,"title":{"content/what_if_learning/What If Learning - Poetry and Revenge.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Poetry and Revenge.pdf":{}}}],["rever",{"_index":44,"title":{"content/what_if_learning/What If Learning - Respect and reverence.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Respect and reverence.pdf":{}}}],["review",{"_index":356,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Triumphs and Disasters.pdf":{}}}],["reward",{"_index":359,"title":{"content/what_if_learning/What If Learning - Rewarding Perseverance.pdf":{}},"author":{},"abstract":{}}],["right",{"_index":253,"title":{"content/what_if_learning/What If Learning - Righting Historical Wrongs.pdf":{}},"author":{},"abstract":{}}],["rotat",{"_index":476,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson5.pdf":{}}}],["rule",{"_index":322,"title":{"content/what_if_learning/What If Learning - Rules and Virtues.pdf":{},"content/what_if_learning/What If Learning - Rules and Community.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Rules and Virtues.pdf":{},"content/what_if_learning/What If Learning - Rules and Community.pdf":{}}}],["same",{"_index":489,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson6.pdf":{}}}],["say",{"_index":256,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Righting Historical Wrongs.pdf":{}}}],["school",{"_index":117,"title":{"content/what_if_learning/What If Learning - History and Wealth.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Embracing responsibility.pdf":{},"content/what_if_learning/What If Learning - Encouragement and working for change.pdf":{},"content/what_if_learning/What If Learning - Theology Hope.pdf":{},"content/what_if_learning/What If Learning - Sport and Respect.pdf":{}}}],["scienc",{"_index":113,"title":{"content/what_if_learning/What If Learning - Patterns and Wonder.pdf":{},"content/what_if_learning/What If Learning - Chemistry and Wonder.pdf":{},"content/what_if_learning/What If Learning - Meeting Parents.pdf":{},"content/what_if_learning/What If Learning - Faith and Science.pdf":{},"content/what_if_learning/What If Learning - Nothing But Atoms.pdf":{},"content/what_if_learning/What If Learning - Seeing Connections.pdf":{},"content/what_if_learning/What If Learning - Plants and Wonder.pdf":{},"content/what_if_learning/What If Learning - Magnets and Wonder.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Self-control and peace.pdf":{},"content/what_if_learning/What If Learning - Faith and Science.pdf":{},"content/what_if_learning/What If Learning - Nothing But Atoms.pdf":{},"content/kuyers/psychfaithman2.pdf":{},"content/mathematics/kuyers/math-lesson7.pdf":{}}}],["see",{"_index":20,"title":{"content/what_if_learning/What If Learning - Seeing people holistically.pdf":{},"content/what_if_learning/What If Learning - Seeing Connections.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Seeing people holistically.pdf":{},"content/what_if_learning/What If Learning - Seeking the good of others.pdf":{},"content/what_if_learning/What If Learning - Maps and Local Needs.pdf":{},"content/what_if_learning/What If Learning - Strength and Weakness.pdf":{},"content/what_if_learning/What If Learning - Seeing Connections.pdf":{}}}],["seek",{"_index":53,"title":{"content/what_if_learning/What If Learning - Seeking the good of others.pdf":{},"content/what_if_learning/What If Learning - Healing brokenness and seeking justice.pdf":{}},"author":{},"abstract":{}}],["seen",{"_index":286,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Failure and Community.pdf":{},"content/what_if_learning/What If Learning - Faith and Life.pdf":{}}}],["self",{"_index":103,"title":{"content/what_if_learning/What If Learning - Self-control and peace.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Giving and serving others.pdf":{},"content/what_if_learning/What If Learning - Theology Love.pdf":{},"content/what_if_learning/What If Learning - Drama and Others.pdf":{},"content/what_if_learning/What If Learning - Writing About Others.pdf":{}}}],["selfish",{"_index":59,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Seeking the good of others.pdf":{},"content/what_if_learning/What If Learning - Grammar and Giving.pdf":{}}}],["sens",{"_index":67,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Finding worth through love.pdf":{},"content/what_if_learning/What If Learning - Theology Hope.pdf":{}}}],["sequenc",{"_index":447,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson3.pdf":{}}}],["serv",{"_index":76,"title":{"content/what_if_learning/What If Learning - Giving and serving others.pdf":{},"content/what_if_learning/What If Learning - Serving through Words.pdf":{},"content/what_if_learning/What If Learning - Serving the Community.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Finding worth through love.pdf":{},"content/what_if_learning/What If Learning - Design and Communities.pdf":{},"content/what_if_learning/What If Learning - Failure and Community.pdf":{},"content/what_if_learning/What If Learning - Transportation and Service.pdf":{},"content/what_if_learning/What If Learning - Serving the Community.pdf":{}}}],["servic",{"_index":363,"title":{"content/what_if_learning/What If Learning - Transportation and Service.pdf":{}},"author":{},"abstract":{}}],["set",{"_index":125,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Embracing responsibility.pdf":{}}}],["share",{"_index":165,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Theology Love.pdf":{},"content/what_if_learning/What If Learning - Triumphs and Disasters.pdf":{}}}],["show",{"_index":219,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Music and Respect.pdf":{}}}],["signific",{"_index":17,"title":{"content/what_if_learning/What If Learning - Meaning, significance, and purpose.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Meaning, significance, and purpose.pdf":{}}}],["simpson'",{"_index":508,"title":{"content/mathematics/kuyers/math-lesson9.pdf":{}},"author":{},"abstract":{}}],["sing",{"_index":221,"title":{"content/what_if_learning/What If Learning - Singing and Humility.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Singing and Humility.pdf":{}}}],["singl",{"_index":398,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["situat",{"_index":463,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson4.pdf":{}}}],["skill",{"_index":151,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Giving and serving others.pdf":{}}}],["soccer",{"_index":304,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Sport and Respect.pdf":{}}}],["social",{"_index":416,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["societi",{"_index":61,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Seeking the good of others.pdf":{},"content/mathematics/kuyers/math-lesson8.pdf":{},"content/mathematics/kuyers/math-lesson9.pdf":{}}}],["solicit",{"_index":407,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["someth",{"_index":142,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Encouragement and working for change.pdf":{}}}],["sorri",{"_index":257,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Righting Historical Wrongs.pdf":{}}}],["sound",{"_index":209,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Poetry and Delight.pdf":{}}}],["spanish",{"_index":281,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Serving through Words.pdf":{}}}],["spatial",{"_index":478,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson5.pdf":{}}}],["speak",{"_index":406,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["spiritu",{"_index":170,"title":{"content/what_if_learning/What If Learning - Christian Spirituality.pdf":{},"content/what_if_learning/What If Learning - Spirituality and Teaching.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Christian Spirituality.pdf":{},"content/what_if_learning/What If Learning - Geography and Faith.pdf":{},"content/what_if_learning/What If Learning - History and Faith.pdf":{}}}],["sponsor",{"_index":377,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["sport",{"_index":296,"title":{"content/what_if_learning/What If Learning - Sport and Restraint.pdf":{},"content/what_if_learning/What If Learning - Sport and Respect.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Sport and Restraint.pdf":{}}}],["stephani",{"_index":375,"title":{},"author":{"content/kuyers/psychfaithman2.pdf":{}},"abstract":{}}],["stewardship",{"_index":479,"title":{"content/mathematics/kuyers/math-lesson6.pdf":{}},"author":{},"abstract":{}}],["stori",{"_index":236,"title":{"content/what_if_learning/What If Learning - Migration Stories.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Geography and Justice.pdf":{},"content/what_if_learning/What If Learning - Migration Stories.pdf":{}}}],["stranger",{"_index":284,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Languages and Hospitality.pdf":{}}}],["strategi",{"_index":393,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["strength",{"_index":314,"title":{"content/what_if_learning/What If Learning - Strength and Weakness.pdf":{}},"author":{},"abstract":{}}],["struggl",{"_index":388,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{},"content/mathematics/kuyers/math-lesson8.pdf":{},"content/mathematics/kuyers/math-lesson9.pdf":{}}}],["student",{"_index":26,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Being challenged and changed.pdf":{},"content/what_if_learning/What If Learning - Seeking the good of others.pdf":{},"content/what_if_learning/What If Learning - Hope and joy.pdf":{},"content/what_if_learning/What If Learning - Embracing responsibility.pdf":{},"content/what_if_learning/What If Learning - Giving and serving others.pdf":{},"content/what_if_learning/What If Learning - Theology Hope.pdf":{},"content/what_if_learning/What If Learning - Christian Spirituality.pdf":{},"content/what_if_learning/What If Learning - Spirituality and Teaching.pdf":{},"content/what_if_learning/What If Learning - Virtues.pdf":{},"content/what_if_learning/What If Learning - Art and Hospitality.pdf":{},"content/what_if_learning/What If Learning - Art & Beliefs.pdf":{},"content/what_if_learning/What If Learning - Appreciation and Baking.pdf":{},"content/what_if_learning/What If Learning - Cooking and Honoring.pdf":{},"content/what_if_learning/What If Learning - Dance and Forgiveness.pdf":{},"content/what_if_learning/What If Learning - Design and Contentment.pdf":{},"content/what_if_learning/What If Learning - Poetry and Revenge.pdf":{},"content/what_if_learning/What If Learning - Literature and Choices.pdf":{},"content/what_if_learning/What If Learning - Poetry and Hope.pdf":{},"content/what_if_learning/What If Learning - Writing About Others.pdf":{},"content/what_if_learning/What If Learning - Maps and Values.pdf":{},"content/what_if_learning/What If Learning - History and Poverty.pdf":{},"content/what_if_learning/What If Learning - Loving a City.pdf":{},"content/what_if_learning/What If Learning - Math and Giving.pdf":{},"content/what_if_learning/What If Learning - Percentages and Injustice.pdf":{},"content/what_if_learning/What If Learning - Math Questions.pdf":{},"content/what_if_learning/What If Learning - Language and Community.pdf":{},"content/what_if_learning/What If Learning - Bodies and People.pdf":{},"content/what_if_learning/What If Learning - Addressing Fears.pdf":{},"content/what_if_learning/What If Learning - Seeing Connections.pdf":{},"content/what_if_learning/What If Learning - Triumphs and Disasters.pdf":{},"content/what_if_learning/What If Learning - Transportation and Service.pdf":{},"content/kuyers/psychfaithman2.pdf":{}}}],["studi",{"_index":176,"title":{"content/mathematics/kuyers/math-lesson1.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Art and Attentiveness.pdf":{},"content/what_if_learning/What If Learning - Design and Contentment.pdf":{},"content/what_if_learning/What If Learning - Literature and Faith.pdf":{},"content/what_if_learning/What If Learning - Plot and Choices.pdf":{},"content/what_if_learning/What If Learning - Transportation and Service.pdf":{},"content/mathematics/kuyers/math-lesson1.pdf":{},"content/mathematics/kuyers/math-lesson4.pdf":{},"content/mathematics/kuyers/math-lesson5.pdf":{}}}],["subdisciplin",{"_index":402,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["subject",{"_index":83,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Interdependence and community.pdf":{},"content/what_if_learning/What If Learning - Self-control and peace.pdf":{},"content/what_if_learning/What If Learning - Christian values and virtues.pdf":{},"content/what_if_learning/What If Learning - Healing brokenness and seeking justice.pdf":{},"content/what_if_learning/What If Learning - Encouragement and working for change.pdf":{},"content/what_if_learning/What If Learning - Giving and serving others.pdf":{},"content/mathematics/kuyers/math-lesson2.pdf":{}}}],["success",{"_index":270,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Math and Forgiveness.pdf":{}}}],["such",{"_index":458,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson4.pdf":{}}}],["survey",{"_index":421,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["take",{"_index":481,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson6.pdf":{}}}],["taught",{"_index":137,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Healing brokenness and seeking justice.pdf":{},"content/what_if_learning/What If Learning - Righting Historical Wrongs.pdf":{},"content/what_if_learning/What If Learning - Words and Care.pdf":{},"content/what_if_learning/What If Learning - Sport and Respect.pdf":{},"content/what_if_learning/What If Learning - Triumphs and Disasters.pdf":{}}}],["teach",{"_index":19,"title":{"content/what_if_learning/What If Learning - Spirituality and Teaching.pdf":{},"content/what_if_learning/What If Learning - Virtues.pdf":{},"content/what_if_learning/What If Learning - What Tests Teach.pdf":{},"content/what_if_learning/What If Learning - Teaching and Gratitude.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Meaning, significance, and purpose.pdf":{},"content/what_if_learning/What If Learning - Being challenged and changed.pdf":{},"content/what_if_learning/What If Learning - Respect and reverence.pdf":{},"content/what_if_learning/What If Learning - Interdependence and community.pdf":{},"content/what_if_learning/What If Learning - Embracing responsibility.pdf":{},"content/what_if_learning/What If Learning - Theology Love.pdf":{},"content/what_if_learning/What If Learning - Christian Distinctives.pdf":{},"content/what_if_learning/What If Learning - Christian Spirituality.pdf":{},"content/what_if_learning/What If Learning - Spirituality and Teaching.pdf":{},"content/what_if_learning/What If Learning - History and Faith.pdf":{},"content/what_if_learning/What If Learning - Math and Justice.pdf":{},"content/what_if_learning/What If Learning - Percentages and Injustice.pdf":{},"content/what_if_learning/What If Learning - Teaching and Gratitude.pdf":{},"content/kuyers/psychfaithman2.pdf":{}}}],["teacher",{"_index":56,"title":{"content/what_if_learning/What If Learning - Teaching and Gratitude.pdf":{},"content/what_if_learning/What If Learning  - Posture and Respect.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Seeking the good of others.pdf":{},"content/what_if_learning/What If Learning - Embracing responsibility.pdf":{},"content/what_if_learning/What If Learning - What Tests Teach.pdf":{}}}],["teacher'",{"_index":352,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning  - Posture and Respect.pdf":{}}}],["team",{"_index":299,"title":{"content/what_if_learning/What If Learning - Teams and Individuals.pdf":{}},"author":{},"abstract":{}}],["technolog",{"_index":187,"title":{"content/what_if_learning/What If Learning - Design and Humility.pdf":{},"content/what_if_learning/What If Learning - Design and Communities.pdf":{},"content/what_if_learning/What If Learning - Design and Contentment.pdf":{},"content/what_if_learning/What If Learning - Design and Delight.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Design and Communities.pdf":{},"content/what_if_learning/What If Learning - Design and Delight.pdf":{}}}],["test",{"_index":330,"title":{"content/what_if_learning/What If Learning - What Tests Teach.pdf":{},"content/what_if_learning/What If Learning - Triumphs and Disasters.pdf":{},"content/what_if_learning/What If Learning - Rewarding Perseverance.pdf":{},"content/what_if_learning/What If Learning - Tests and Gratitude.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Tests and Gratitude.pdf":{}}}],["text",{"_index":194,"title":{"content/what_if_learning/What If Learning - Loving Texts.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Literature and Grace.pdf":{},"content/what_if_learning/What If Learning - Loving Texts.pdf":{}}}],["thank",{"_index":33,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Appreciation and gratitude.pdf":{},"content/what_if_learning/What If Learning - Tests and Gratitude.pdf":{}}}],["themselv",{"_index":318,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Strength and Weakness.pdf":{}}}],["theologi",{"_index":152,"title":{"content/what_if_learning/What If Learning - Theology.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Theology.pdf":{}}}],["therapi",{"_index":417,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["thing",{"_index":160,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Theology Hope.pdf":{},"content/mathematics/kuyers/math-lesson4.pdf":{},"content/mathematics/kuyers/math-lesson6.pdf":{}}}],["think",{"_index":188,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Design and Humility.pdf":{},"content/what_if_learning/What If Learning - Design and Contentment.pdf":{},"content/what_if_learning/What If Learning - Poetry and Revenge.pdf":{},"content/what_if_learning/What If Learning - Literature and Choices.pdf":{},"content/what_if_learning/What If Learning - Poetry and Hope.pdf":{},"content/what_if_learning/What If Learning - Music and Creativity.pdf":{},"content/what_if_learning/What If Learning - Maps and Values.pdf":{},"content/what_if_learning/What If Learning - The Meaning of Time.pdf":{},"content/what_if_learning/What If Learning - Computers and Humans.pdf":{},"content/what_if_learning/What If Learning - Math and Giving.pdf":{},"content/what_if_learning/What If Learning - Language and Community.pdf":{},"content/what_if_learning/What If Learning - What Tests Teach.pdf":{},"content/mathematics/kuyers/math-lesson1.pdf":{},"content/mathematics/kuyers/math-lesson2.pdf":{},"content/mathematics/kuyers/math-lesson5.pdf":{}}}],["thought",{"_index":179,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Art & Beliefs.pdf":{}}}],["through",{"_index":66,"title":{"content/what_if_learning/What If Learning - Finding worth through love.pdf":{},"content/what_if_learning/What If Learning - Serving through Words.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Art and Hospitality.pdf":{},"content/what_if_learning/What If Learning - Writing About Others.pdf":{},"content/what_if_learning/What If Learning - Treaties and Virtues.pdf":{},"content/what_if_learning/What If Learning - Transportation and Service.pdf":{},"content/mathematics/kuyers/math-lesson5.pdf":{}}}],["time",{"_index":150,"title":{"content/what_if_learning/What If Learning - The Meaning of Time.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Giving and serving others.pdf":{},"content/what_if_learning/What If Learning - The Meaning of Time.pdf":{},"content/what_if_learning/What If Learning - Anxiety and Peace.pdf":{},"content/mathematics/kuyers/math-lesson6.pdf":{},"content/mathematics/kuyers/math-lesson8.pdf":{},"content/mathematics/kuyers/math-lesson9.pdf":{}}}],["togeth",{"_index":326,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Rules and Community.pdf":{},"content/what_if_learning/What If Learning - Reason and Faith.pdf":{},"content/kuyers/psychfaithman2.pdf":{}}}],["topic",{"_index":138,"title":{"content/what_if_learning/What If Learning - Transportation and Service.pdf":{},"content/what_if_learning/What If Learning - Serving the Community.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Healing brokenness and seeking justice.pdf":{},"content/what_if_learning/What If Learning - Strength and Weakness.pdf":{},"content/what_if_learning/What If Learning - Serving the Community.pdf":{},"content/kuyers/psychfaithman2.pdf":{}}}],["toward",{"_index":46,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Respect and reverence.pdf":{}}}],["transport",{"_index":362,"title":{"content/what_if_learning/What If Learning - Transportation and Service.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Transportation and Service.pdf":{}}}],["treat",{"_index":487,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson6.pdf":{},"content/mathematics/kuyers/math-lesson8.pdf":{},"content/mathematics/kuyers/math-lesson9.pdf":{}}}],["treati",{"_index":241,"title":{"content/what_if_learning/What If Learning - Treaties and Virtues.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Treaties and Virtues.pdf":{}}}],["tri",{"_index":465,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson5.pdf":{}}}],["triumph",{"_index":354,"title":{"content/what_if_learning/What If Learning - Triumphs and Disasters.pdf":{}},"author":{},"abstract":{}}],["true",{"_index":159,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Theology Faith.pdf":{},"content/what_if_learning/What If Learning - Theology Hope.pdf":{},"content/mathematics/kuyers/math-lesson7.pdf":{}}}],["trust",{"_index":47,"title":{"content/what_if_learning/What If Learning - Trust and affirming faith.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Trust and affirming faith.pdf":{}}}],["truth",{"_index":265,"title":{"content/what_if_learning/What If Learning - Pie Charts and Truth.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Pie Charts and Truth.pdf":{}}}],["tsunami",{"_index":491,"title":{"content/mathematics/kuyers/math-lesson7.pdf":{}},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson7.pdf":{}}}],["turn",{"_index":74,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Finding worth through love.pdf":{},"content/what_if_learning/What If Learning - Theology Love.pdf":{},"content/what_if_learning/What If Learning - Tests and Gratitude.pdf":{}}}],["type",{"_index":245,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - History and Wealth.pdf":{},"content/mathematics/kuyers/math-lesson6.pdf":{}}}],["understand",{"_index":288,"title":{"content/mathematics/kuyers/math-lesson7.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - What is Love.pdf":{},"content/what_if_learning/What If Learning - Bodies and People.pdf":{},"content/mathematics/kuyers/math-lesson5.pdf":{},"content/mathematics/kuyers/math-lesson7.pdf":{}}}],["unison",{"_index":222,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Singing and Humility.pdf":{}}}],["unit",{"_index":226,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Guests in God’s World.pdf":{},"content/what_if_learning/What If Learning - Gods World.pdf":{},"content/what_if_learning/What If Learning - History and Virtues.pdf":{},"content/what_if_learning/What If Learning - Rules and Community.pdf":{},"content/what_if_learning/What If Learning - Plants and Wonder.pdf":{}}}],["univers",{"_index":6,"title":{},"author":{"kuyers/content/what_if_learning/What If Learning - Connecting Faith with All of Life.pdf":{},"content/what_if_learning/What If Learning - Honoring the wonder of God’s world.pdf":{},"content/what_if_learning/What If Learning - Curiosity about life’s big questions.pdf":{},"content/what_if_learning/What If Learning - Meaning, significance, and purpose.pdf":{},"content/what_if_learning/What If Learning - Seeing people holistically.pdf":{},"content/what_if_learning/What If Learning - Being challenged and changed.pdf":{},"content/what_if_learning/What If Learning - Celebrating grace.pdf":{},"content/what_if_learning/What If Learning - Appreciation and gratitude.pdf":{},"content/what_if_learning/What If Learning - Delighting in God’s world.pdf":{},"content/what_if_learning/What If Learning - Focused, loving attentiveness.pdf":{},"content/what_if_learning/What If Learning - Respect and reverence.pdf":{},"content/what_if_learning/What If Learning - Trust and affirming faith.pdf":{},"content/what_if_learning/What If Learning - Humility and hospitality.pdf":{},"content/what_if_learning/What If Learning - Seeking the good of others.pdf":{},"content/what_if_learning/What If Learning - Finding worth through love.pdf":{},"content/what_if_learning/What If Learning - Interdependence and community.pdf":{},"content/what_if_learning/What If Learning - Love and forgiveness.pdf":{},"content/what_if_learning/What If Learning - Hope and joy.pdf":{},"content/what_if_learning/What If Learning - Self-control and peace.pdf":{},"content/what_if_learning/What If Learning - Embracing responsibility.pdf":{},"content/what_if_learning/What If Learning - Christian values and virtues.pdf":{},"content/what_if_learning/What If Learning - Healing brokenness and seeking justice.pdf":{},"content/what_if_learning/What If Learning - Encouragement and working for change.pdf":{},"content/what_if_learning/What If Learning - Giving and serving others.pdf":{},"content/what_if_learning/What If Learning - Theology.pdf":{},"content/what_if_learning/What If Learning - Theology Faith.pdf":{},"content/what_if_learning/What If Learning - Theology Hope.pdf":{},"content/what_if_learning/What If Learning - Theology Love.pdf":{},"content/what_if_learning/What If Learning - Christian Distinctives.pdf":{},"content/what_if_learning/What If Learning - Background Research.pdf":{},"content/what_if_learning/What If Learning - Christian Spirituality.pdf":{},"content/what_if_learning/What If Learning - Spirituality and Teaching.pdf":{},"content/what_if_learning/What If Learning - Virtues.pdf":{},"content/what_if_learning/What If Learning - Art and Attentiveness.pdf":{},"content/what_if_learning/What If Learning - Art and Hospitality.pdf":{},"content/what_if_learning/What If Learning - Art & Beliefs.pdf":{},"content/what_if_learning/What If Learning - Appreciation and Baking.pdf":{},"content/what_if_learning/What If Learning - Cooking and Honoring.pdf":{},"content/what_if_learning/What If Learning - Dance and Forgiveness.pdf":{},"content/what_if_learning/What If Learning - Design and Humility.pdf":{},"content/what_if_learning/What If Learning - Design and Communities.pdf":{},"content/what_if_learning/What If Learning - Design and Contentment.pdf":{},"content/what_if_learning/What If Learning - Design and Delight.pdf":{},"content/what_if_learning/What If Learning - Drama and Others.pdf":{},"content/what_if_learning/What If Learning - Literature and Grace.pdf":{},"content/what_if_learning/What If Learning - Loving Texts.pdf":{},"content/what_if_learning/What If Learning - Poetry and Revenge.pdf":{},"content/what_if_learning/What If Learning - Literature and Choices.pdf":{},"content/what_if_learning/What If Learning - Literature and Faith.pdf":{},"content/what_if_learning/What If Learning - Poetry and Hope.pdf":{},"content/what_if_learning/What If Learning - Writing About Others.pdf":{},"content/what_if_learning/What If Learning - Grammar and Encouragement.pdf":{},"content/what_if_learning/What If Learning - Poetry and Delight.pdf":{},"content/what_if_learning/What If Learning - Words as Gifts.pdf":{},"content/what_if_learning/What If Learning - Plot and Choices.pdf":{},"content/what_if_learning/What If Learning - Faith and Poetry.pdf":{},"content/what_if_learning/What If Learning - Book Week.pdf":{},"content/what_if_learning/What If Learning - Music and Respect.pdf":{},"content/what_if_learning/What If Learning - Music and Creativity.pdf":{},"content/what_if_learning/What If Learning - Singing and Humility.pdf":{},"content/what_if_learning/What If Learning - Guests in God’s World.pdf":{},"content/what_if_learning/What If Learning - Gods World.pdf":{},"content/what_if_learning/What If Learning - Maps and Values.pdf":{},"content/what_if_learning/What If Learning - Geography and Faith.pdf":{},"content/what_if_learning/What If Learning - Geography and Justice.pdf":{},"content/what_if_learning/What If Learning - Migration Stories.pdf":{},"content/what_if_learning/What If Learning - Maps and Local Needs.pdf":{},"content/what_if_learning/What If Learning - Treaties and Virtues.pdf":{},"content/what_if_learning/What If Learning - Flawed Reformers.pdf":{},"content/what_if_learning/What If Learning - History and Wealth.pdf":{},"content/what_if_learning/What If Learning - History and Changes.pdf":{},"content/what_if_learning/What If Learning - History and Communities.pdf":{},"content/what_if_learning/What If Learning - History and Virtues.pdf":{},"content/what_if_learning/What If Learning - History and Faith.pdf":{},"content/what_if_learning/What If Learning - History and Poverty.pdf":{},"content/what_if_learning/What If Learning - Loving a City.pdf":{},"content/what_if_learning/What If Learning - History and Change.pdf":{},"content/what_if_learning/What If Learning - Righting Historical Wrongs.pdf":{},"content/what_if_learning/What If Learning - The Meaning of Time.pdf":{},"content/what_if_learning/What If Learning - Computers and Humans.pdf":{},"content/what_if_learning/What If Learning - Pie Charts and Truth.pdf":{},"content/what_if_learning/What If Learning - Math and Justice.pdf":{},"content/what_if_learning/What If Learning - Community and Math.pdf":{},"content/what_if_learning/What If Learning - Math and Forgiveness.pdf":{},"content/what_if_learning/What If Learning - Pie Charts and Giving.pdf":{},"content/what_if_learning/What If Learning - Math and Giving.pdf":{},"content/what_if_learning/What If Learning - Math and Measuring.pdf":{},"content/what_if_learning/What If Learning - Graphs and Delight.pdf":{},"content/what_if_learning/What If Learning - Percentages and Injustice.pdf":{},"content/what_if_learning/What If Learning - Math Questions.pdf":{},"content/what_if_learning/What If Learning - Serving through Words.pdf":{},"content/what_if_learning/What If Learning - Words and Care.pdf":{},"content/what_if_learning/What If Learning - Languages and Hospitality.pdf":{},"content/what_if_learning/What If Learning - Failure and Community.pdf":{},"content/what_if_learning/What If Learning - What is Love.pdf":{},"content/what_if_learning/What If Learning - Grammar and Giving.pdf":{},"content/what_if_learning/What If Learning - French and Hospitality.pdf":{},"content/what_if_learning/What If Learning - Language and Community.pdf":{},"content/what_if_learning/What If Learning  - Languages and Relationships.pdf":{},"content/what_if_learning/What If Learning - Bodies and People.pdf":{},"content/what_if_learning/What If Learning - Addressing Fears.pdf":{},"content/what_if_learning/What If Learning - Sport and Restraint.pdf":{},"content/what_if_learning/What If Learning - Teams and Individuals.pdf":{},"content/what_if_learning/What If Learning - Sport and Respect.pdf":{},"content/what_if_learning/What If Learning - Words and Actions.pdf":{},"content/what_if_learning/What If Learning - Blessings and religion class.pdf":{},"content/what_if_learning/What If Learning - Strength and Weakness.pdf":{},"content/what_if_learning/What If Learning - Anxiety and Peace.pdf":{},"content/what_if_learning/What If Learning - Responsibility and Community.pdf":{},"content/what_if_learning/What If Learning - Rules and Virtues.pdf":{},"content/what_if_learning/What If Learning - Rules and Community.pdf":{},"content/what_if_learning/What If Learning - Faith and Life.pdf":{},"content/what_if_learning/What If Learning - Reason and Faith.pdf":{},"content/what_if_learning/What If Learning - What Tests Teach.pdf":{},"content/what_if_learning/What If Learning - Patterns and Wonder.pdf":{},"content/what_if_learning/What If Learning - Chemistry and Wonder.pdf":{},"content/what_if_learning/What If Learning - Meeting Parents.pdf":{},"content/what_if_learning/What If Learning - Faith and Science.pdf":{},"content/what_if_learning/What If Learning - Nothing But Atoms.pdf":{},"content/what_if_learning/What If Learning - Seeing Connections.pdf":{},"content/what_if_learning/What If Learning - Plants and Wonder.pdf":{},"content/what_if_learning/What If Learning - Magnets and Wonder.pdf":{},"content/what_if_learning/What If Learning - Teaching and Gratitude.pdf":{},"content/what_if_learning/What If Learning  - Posture and Respect.pdf":{},"content/what_if_learning/What If Learning - Triumphs and Disasters.pdf":{},"content/what_if_learning/What If Learning - Rewarding Perseverance.pdf":{},"content/what_if_learning/What If Learning - Tests and Gratitude.pdf":{},"content/what_if_learning/What If Learning - Transportation and Service.pdf":{},"content/what_if_learning/What If Learning - Serving the Community.pdf":{},"content/mathematics/kuyers/math-lesson1.pdf":{},"content/mathematics/kuyers/math-lesson2.pdf":{},"content/mathematics/kuyers/math-lesson3.pdf":{},"content/mathematics/kuyers/math-lesson4.pdf":{},"content/mathematics/kuyers/math-lesson5.pdf":{},"content/mathematics/kuyers/math-lesson6.pdf":{},"content/mathematics/kuyers/math-lesson7.pdf":{},"content/mathematics/kuyers/math-lesson8.pdf":{},"content/mathematics/kuyers/math-lesson9.pdf":{}},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["until",{"_index":466,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson5.pdf":{}}}],["up",{"_index":308,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Words and Actions.pdf":{},"content/what_if_learning/What If Learning - Responsibility and Community.pdf":{},"content/mathematics/kuyers/math-lesson3.pdf":{}}}],["us",{"_index":195,"title":{"content/mathematics/kuyers/math-lesson7.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Literature and Grace.pdf":{},"content/kuyers/psychfaithman2.pdf":{},"content/mathematics/kuyers/math-lesson1.pdf":{},"content/mathematics/kuyers/math-lesson4.pdf":{},"content/mathematics/kuyers/math-lesson6.pdf":{},"content/mathematics/kuyers/math-lesson7.pdf":{}}}],["valu",{"_index":126,"title":{"content/what_if_learning/What If Learning - Christian values and virtues.pdf":{},"content/what_if_learning/What If Learning - Maps and Values.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Christian values and virtues.pdf":{},"content/what_if_learning/What If Learning - Maps and Values.pdf":{},"content/what_if_learning/What If Learning - Faith and Science.pdf":{}}}],["varieti",{"_index":148,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Giving and serving others.pdf":{}}}],["veri",{"_index":431,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson2.pdf":{},"content/mathematics/kuyers/math-lesson7.pdf":{}}}],["video",{"_index":422,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["virtu",{"_index":127,"title":{"content/what_if_learning/What If Learning - Christian values and virtues.pdf":{},"content/what_if_learning/What If Learning - Treaties and Virtues.pdf":{},"content/what_if_learning/What If Learning - History and Virtues.pdf":{},"content/what_if_learning/What If Learning - Rules and Virtues.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Virtues.pdf":{}}}],["ward",{"_index":374,"title":{},"author":{"content/kuyers/psychfaithman2.pdf":{}},"abstract":{}}],["way",{"_index":119,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Embracing responsibility.pdf":{},"content/what_if_learning/What If Learning - Healing brokenness and seeking justice.pdf":{},"content/what_if_learning/What If Learning - Theology.pdf":{},"content/what_if_learning/What If Learning - Spirituality and Teaching.pdf":{},"content/mathematics/kuyers/math-lesson5.pdf":{}}}],["we'll",{"_index":485,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson6.pdf":{}}}],["weak",{"_index":315,"title":{"content/what_if_learning/What If Learning - Strength and Weakness.pdf":{}},"author":{},"abstract":{}}],["wealth",{"_index":149,"title":{"content/what_if_learning/What If Learning - History and Wealth.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Giving and serving others.pdf":{},"content/what_if_learning/What If Learning - History and Wealth.pdf":{}}}],["week",{"_index":216,"title":{"content/what_if_learning/What If Learning - Book Week.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Book Week.pdf":{}}}],["welcom",{"_index":290,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - French and Hospitality.pdf":{}}}],["well",{"_index":97,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Hope and joy.pdf":{},"content/what_if_learning/What If Learning - Faith and Life.pdf":{}}}],["wheel",{"_index":405,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["whether",{"_index":504,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson8.pdf":{},"content/mathematics/kuyers/math-lesson9.pdf":{}}}],["whole",{"_index":240,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Maps and Local Needs.pdf":{}}}],["within",{"_index":70,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Finding worth through love.pdf":{},"content/what_if_learning/What If Learning - Embracing responsibility.pdf":{}}}],["witteveen",{"_index":376,"title":{},"author":{"content/kuyers/psychfaithman2.pdf":{}},"abstract":{}}],["women",{"_index":503,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson8.pdf":{},"content/mathematics/kuyers/math-lesson9.pdf":{}}}],["wonder",{"_index":9,"title":{"content/what_if_learning/What If Learning - Honoring the wonder of God’s world.pdf":{},"content/what_if_learning/What If Learning - Patterns and Wonder.pdf":{},"content/what_if_learning/What If Learning - Chemistry and Wonder.pdf":{},"content/what_if_learning/What If Learning - Plants and Wonder.pdf":{},"content/what_if_learning/What If Learning - Magnets and Wonder.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Honoring the wonder of God’s world.pdf":{},"content/what_if_learning/What If Learning - Patterns and Wonder.pdf":{},"content/what_if_learning/What If Learning - Chemistry and Wonder.pdf":{},"content/what_if_learning/What If Learning - Magnets and Wonder.pdf":{}}}],["word",{"_index":210,"title":{"content/what_if_learning/What If Learning - Words as Gifts.pdf":{},"content/what_if_learning/What If Learning - Serving through Words.pdf":{},"content/what_if_learning/What If Learning - Words and Care.pdf":{},"content/what_if_learning/What If Learning - Words and Actions.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Words as Gifts.pdf":{},"content/what_if_learning/What If Learning - Words and Care.pdf":{},"content/what_if_learning/What If Learning - Words and Actions.pdf":{},"content/what_if_learning/What If Learning - Responsibility and Community.pdf":{}}}],["work",{"_index":141,"title":{"content/what_if_learning/What If Learning - Encouragement and working for change.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Theology Hope.pdf":{},"content/what_if_learning/What If Learning - Reason and Faith.pdf":{}}}],["world",{"_index":11,"title":{"content/what_if_learning/What If Learning - Honoring the wonder of God’s world.pdf":{},"content/what_if_learning/What If Learning - Delighting in God’s world.pdf":{},"content/what_if_learning/What If Learning - Guests in God’s World.pdf":{},"content/what_if_learning/What If Learning - Gods World.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Honoring the wonder of God’s world.pdf":{},"content/what_if_learning/What If Learning - Delighting in God’s world.pdf":{},"content/what_if_learning/What If Learning - Theology Hope.pdf":{},"content/what_if_learning/What If Learning - Theology Love.pdf":{},"content/what_if_learning/What If Learning - Gods World.pdf":{},"content/what_if_learning/What If Learning - Seeing Connections.pdf":{}}}],["worldview",{"_index":157,"title":{},"author":{},"abstract":{"content/what_if_learning/What If Learning - Theology Faith.pdf":{}}}],["worth",{"_index":65,"title":{"content/what_if_learning/What If Learning - Finding worth through love.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Finding worth through love.pdf":{}}}],["write",{"_index":205,"title":{"content/what_if_learning/What If Learning - Writing About Others.pdf":{}},"author":{},"abstract":{"content/what_if_learning/What If Learning - Writing About Others.pdf":{},"content/kuyers/psychfaithman2.pdf":{}}}],["wrong",{"_index":255,"title":{"content/what_if_learning/What If Learning - Righting Historical Wrongs.pdf":{}},"author":{},"abstract":{}}],["you'v",{"_index":443,"title":{},"author":{},"abstract":{"content/mathematics/kuyers/math-lesson3.pdf":{}}}],["you’r",{"_index":390,"title":{},"author":{},"abstract":{"content/kuyers/psychfaithman2.pdf":{}}}],["zwart",{"_index":369,"title":{},"author":{"content/kuyers/psychfaithman2.pdf":{}},"abstract":{}}]],"pipeline":["stemmer"]}

},{}],3:[function(require,module,exports){
/*
* convert the prebuilt index into a lunr object to be used
* on the website for searching.
*/

var lunr = require('./lunr.min.js');

// https://stackoverflow.com/questions/23296094/browserify-how-to-call-function-bundled-in-a-file-generated-through-browserify
// Call loadPreBuiltIndex() on index.html using this notation.
window.loadPreBuiltIndex = function() {
  var json = require( "./pre-built-index.json" );
  var parsed = lunr.Index.load(json)
  return parsed
}

},{"./lunr.min.js":1,"./pre-built-index.json":2}]},{},[3]);
