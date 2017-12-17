var ndef = require('@taptrack/ndef');

/**
 * Utils lib
 */
var utils = {

  /**
   * Buffer utils
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
  },

  // Convert a decimal int to a hexadecimal string
  // eg. number = 225 -> returns e1 - (225=0xE1)
  numberToHexString: function(number) {
    return number.toString(16);
  },

  // Convert a hex string to number
  hexStringToNumber: function(hexString) {
    return parseInt(hexString, 16);
  },


  /**
   * Library
   */

  isTagFormatedAsNdef(tagBlocks0to4) {
    return tagBlocks0to4[12] === 0xE1;
  },
  getType2TagSpecification(tagBlocks0to4) {
    return utils.numberToHexString(tagBlocks0to4[1]);
  },
  getMaxNdefMessageSize(tagBlocks0to4) {
    return tagBlocks0to4[13] * 8; // @UNSURE: +16 ?
  },
  hasTagReadPermissions(tagBlocks0to4) {
    return (tagBlocks0to4[15] & 0xf0) == 0x00 ? true : false;
  },
  hasTagANdefMessage(tagBlocks0to4) {
    return (tagBlocks0to4[16] === 0x03);
  },
  getNdefMessageLength(tagBlocks0to4) {
    return tagBlocks0to4[17];
  }

 }



/**
 * Tag parser
 * verify it's a parsable tag with a ndef message
 * retrieve and return the ndef message
 */

// STATIC EXAMPLE
// ntag216 888b, 1 message, 2 text: sirop fr, orange en
// let exampleTagAsHexString = 'e1106d000319910108540266727369726f705101095402656e6f72616e6765fe0000000000000000000000000000000000';
// let exampletagBlocks0to4 = utils.hexStringToByte(exampleTagAsHexString)
// console.log(Buffer.from(exampletagBlocks0to4))
// let tagBlocks0to4 = exampletagBlocks0to4;

/**
 * Read block 3
 * index 0 - E1 = ndef format
 * index 1 - 10 = Type 2 TAG spec
 * index 2 - 6D = Max ndef message size - 6D(hex) = 109(dec) -> 109 * 8(1 byte) = 872bytes -> 872 + 16(tag header) = 888bytes
 * index 3 - 00 = Read permission - (cc3 & 0xf0) == 0x00 ? true : false; - see: https://github.com/googlearchive/chrome-nfc/blob/812f1d01e495b44ef609a59d489cc0850b3a09ad/src/tt2.js#L78
 *  ----------
 * Read block 4
 * index 0 - 03 = if 0x03 = is ndef message
 * index 1 - 19 = ndef message length -> 19(hex) = 25(dec) -> message length = 25 bytes.
 * index 2 - 91 = where ndef parser starts his work - MB/MR/CR/SR|IL/TNF/TNF/TNF
 *                                             - 91 = 1 / 0/ 0/ 1|0 / 0 / 0 / 1
 *                                             - D1 = 1 / 1/ 0/ 1|0 / 0 / 0 / 1
 *         - see doc: https://blog.zenika.com/2012/04/24/nfc-iv-les-types-de-messages-du-nfc-forum-wkt/
 * index 3 - 01 = Type length (record type field will be 1?)
 */


/**
 * @param {Buffer} tagBlock3and4 - a read of blocks 3 & 4 -> var data = await reader.read(0, 20);
 * @returns an object with parsed values of the ndef header
 */

let parseHeader = function(tagBlocks0to4) {
  console.log('tag parser is now parsing:', tagBlocks0to4, tagBlocks0to4.length, tagBlocks0to4[tagBlocks0to4.length-1]);

  // Block 3
  // 0 - not a NDEF formated tag
  let isTagFormatedAsNdef = utils.isTagFormatedAsNdef(tagBlocks0to4);
  // if(isTagFormatedAsNdef) {
  //   console.log('OK - Tag is formated as NDEF');
  // } else {
  //   throw new Error("Tag is not formatted as ndef");
  // }

  // 1 - Type 2 Tag Specification
  let type2TagSpecification = utils.getType2TagSpecification(tagBlocks0to4);
  console.log('type2TagSpecification (index 13):  0x' + type2TagSpecification);

  // 2 - get Max ndef message size
  let maxNdefMessageSize = utils.getMaxNdefMessageSize(tagBlocks0to4);
  console.log('maxNdefMessageSize (index 14): ' + maxNdefMessageSize);

  // 3 - has no read permissions
  let hasTagReadPermissions = utils.hasTagReadPermissions(tagBlocks0to4);
  // if(hasTagReadPermissions) {
  //   console.log('OK - Tag has read permissions');
  // } else {
  //   throw new Error("Tag is not formatted as ndef");
  // }
  // Block 4
  let hasTagANdefMessage = utils.hasTagANdefMessage(tagBlocks0to4);
  // if(hasTagANdefMessage) {
  //   console.log('OK - Tag has a ndef message');
  // } else {
  //   throw new Error("Tag has no ndef message");
  // }

  let ndefMessageLength = utils.getNdefMessageLength(tagBlocks0to4);
  console.log('ndefMessageLength (index 17): ' + ndefMessageLength);

  let tagLengthToReadFromBlock4 = ndefMessageLength + 2;

  return {
    isTagFormatedAsNdef : isTagFormatedAsNdef,
    type2TagSpecification: type2TagSpecification,
    maxNdefMessageSize: maxNdefMessageSize,
    hasTagReadPermissions: hasTagReadPermissions,
    hasTagANdefMessage: hasTagANdefMessage,
    ndefMessageLength: ndefMessageLength,
    tagLengthToReadFromBlock4: tagLengthToReadFromBlock4
  }
}

let parseNdef = function(tagBlocks0to4Fromblock4) {
  // we slice the first 2 bytes
  // we need a buffer starting at ndef header (D1, 91...)
  let ndefMessageBuffer = tagBlocks0to4Fromblock4.slice(2)
  console.log('ndefMessageBuffer', ndefMessageBuffer);

  var ndefMessage = ndef.Message.fromBytes(ndefMessageBuffer);
  console.log('ndefMessage:', ndefMessage);

  var records = ndefMessage.getRecords();
  console.log('records', records);
  var parsedRecords = [];

  for(var i=0; i<records.length; i++) {
    var recordContents = ndef.Utils.resolveTextRecord(records[i]);
    parsedRecords.push({
      language: recordContents.language,
      content: recordContents.content
    });
  }

  return parsedRecords;
}



const tag = {
  parseHeader: parseHeader,
  parseNdef: parseNdef,
  utils: utils
}

module.exports = tag;
