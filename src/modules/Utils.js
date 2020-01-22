'use strict';

 const Utils = () => {

    //Remove duplicates from an array
    let arrayUnique = function (array) {
        let newArray = array.filter(function (item, pos) {
            return array.indexOf(item) === pos;
        });

        return newArray;
    };

    let arrayUniqueIDs = function (array) {
        let newArray = array.filter(function (item, pos) {
            return array.indexOf(item.toString()) === pos;
        });

        return newArray;
    };

    let checkPropertiesInObject = function (object, propertiesToCheck) {
        propertiesToCheck.forEach(function (key) {
          if (!object.hasOwnProperty(key) || object[key] === null || object[key] === undefined) {
              throw new Error(key + ' is mandatory');
          }
        });
    };

    let _getID = function (item) {

        if (item.constructor.name === 'Object') {

            let id = item._id || item.id || null;

            if (id && id.constructor.name === 'ObjectID') {
                return id.toString();
            } else {
                return item;
            }
        } else {
            return item;
        }
    };

    let arrayOfEntitiesToObject = function (array) {
        array = array || null;

        let object = {};

        if (array) {
            object = array.reduce(function (acc, value) {
                acc[_getID(value)] = value;

                return acc;
            }, {});
        }

        return object;
    };

    let _toString = function (o) {
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


module.exports = Utils;
