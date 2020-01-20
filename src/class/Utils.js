'use strict';


module.exports = function () {

    //Remove duplicates from an array
    var arrayUnique = function (array) {
        var newArray = array.filter(function (item, pos) {
            return array.indexOf(item) === pos;
        });

        return newArray;
    };

    var arrayUniqueIDs = function (array) {
        var newArray = array.filter(function (item, pos) {
            return array.indexOf(item.toString()) === pos;
        });

        return newArray;
    };

    var checkPropertiesInObject = function (object, propertiesToCheck) {
        propertiesToCheck.forEach(function (key) {
          if (!object.hasOwnProperty(key) || object[key] === null || object[key] === undefined) {
              throw new Error(key + ' is mandatory');
          }
        });
    };

    var _getID = function (item) {

        if (item.constructor.name === 'Object') {

            var id = item._id || item.id || null;

            if (id && id.constructor.name === 'ObjectID') {
                return id.toString();
            } else {
                return item;
            }
        } else {
            return item;
        }
    };

    var arrayOfEntitiesToObject = function (array) {
        array = array || null;

        var object = {};

        if (array) {
            object = array.reduce(function (acc, value) {
                acc[_getID(value)] = value;

                return acc;
            }, {});
        }

        return object;
    };

    var _toString = function (o) {
        if (typeof o.toString === 'function') {
            return o.toString();
        } else {
            return o;
        }
    };

    return {
        arrayUnique: arrayUnique,
        arrayUniqueIDs: arrayUniqueIDs,
        checkPropertiesInObject: checkPropertiesInObject,
        arrayOfEntitiesToObject: arrayOfEntitiesToObject,
        toString: _toString
    };
};
