
/**
 * Utils and parsing lib
 */
var utils = {

    /**
     * Buffer/ Uint8 array conversion utils
     */
    byteToHexString: function(uint8arr) {
      if (!uint8arr || uint8arr.constructor !== Uint8Array) {
        throw new Error('Not an uint8arr');
        return '';
      }

      var hexStr = '';
      for (var i = 0; i < uint8arr.length; i++) {
        var hex = (uint8arr[i] & 0xff).toString(16);
        hex = (hex.length === 1) ? '0' + hex : hex;
        hexStr += hex;
      }

      return hexStr.toUpperCase();
    },

    hexStringToByte: function(str) {
      if (!str || typeof str !== 'string') {
        throw new Error('we need a string here')
        return new Uint8Array();
      }

      var a = [];
      for (var i = 0, len = str.length; i < len; i+=2) {
        a.push(parseInt(str.substr(i,2),16));
      }

      return new Uint8Array(a);

      /**
       * Alternatively ?
       */
      // new Buffer(str, 'hex');
    },

    bufferToHexString: function(buffer) {
      return buffer.toString('hex');
    },

    // Convert a decimal int to a hexadecimal string
    // eg. number = 225 -> returns e1 - (225=0xE1)
    numberToHexString: function(number) {
      if (number < 0){
          number = 0xFFFFFFFF + number + 1;
      }
      return number.toString(16).toUpperCase();
    },

    // Convert a hex string to number
    hexStringToNumber: function(hexString) {
      return parseInt(hexString, 16);
    },


    
    /**
     * ASCII / HEX
     */
    hexStringToASCII: function(hexString) {
      var hex = hexString.toString(); //force conversion
      var str = '';
      for (var i = 0; i < hex.length; i += 2)
          str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      return str;
    },

    ASCIIToHexString: function(ASCIIString) {
      var arr = [];
      for (var i = 0, l = ASCIIString.length; i < l; i ++) {
        var hex = Number(ASCIIString.charCodeAt(i)).toString(16);
        arr.push(hex);
      }
      return arr.join('');
    },


  }

  module.exports = utils;
