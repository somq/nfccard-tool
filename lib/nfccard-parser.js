var ndef = require('@taptrack/ndef');

/**
 * Utils and parsing lib
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

  isTagFormatedAsNdef: function(tagBlocks0to4) {
    return tagBlocks0to4[12] === 0xE1;
  },
  getType2TagSpecification: function(tagBlocks0to4) {
    return utils.numberToHexString(tagBlocks0to4[1]);
  },
  getMaxNdefMessageSize: function(tagBlocks0to4) {
    return tagBlocks0to4[13] * 8; // @UNSURE: +16 ?
  },
  hasTagReadPermissions: function(tagBlocks0to4) {
    return (tagBlocks0to4[15] & 0xf0) == 0x00 ? true : false;
  },
  hasTagANdefMessage: function(tagBlocks0to4) {
    return (tagBlocks0to4[16] === 0x03);
  },
  getNdefMessageLength: function(tagBlocks0to4) {
    return tagBlocks0to4[17];
  },

  getParsingType: function(type) {
    switch (type) {
      case 'text': {
        return 'resolveTextRecord';
      }
      case 'uri': {
        return 'resolveUriRecordToString';
      }
      default:
        return 'resolveTextRecord';
    }
  }

 }



/**
 * Tag parser
 * verify it's a parsable tag with a ndef message
 * retrieve and return the ndef message
 */

// STATIC SAMPLE
// ntag216 888b, 1 message, 2 text: I'm the first ndef record of this tag - en
// let exampleTagAsHexString = '046e38da5a215280a9480000e1106d00032cd101';
// let exampletagBlocks0to4 = utils.hexStringToByte(exampleTagAsHexString)
// console.log(Buffer.from(exampletagBlocks0to4))
// let tagBlocks0to4 = exampletagBlocks0to4;
/**
 * Types: 
 * Type 1 = ISO 14443 A
 * Type 2 = ISO 14443 A
 * Type 3 = FeliCa
 * Type 4 = ISO 14443 A / ISO 7816 security
 * Type 5 = ISO/IEC 15693 
 * Further read: http://www.dummies.com/consumer-electronics/the-nfc-forum-tag-types/
 */
/**
 * Read page (block) 3
 * 
 * #### Capability Container (CC area)
 * - NFCForum-TS-Type-2-Tag_1.1.pdf (p20 & 21)
 * 
 * index 0 - E1 = ndef format - magic byte =  NFC Forum defined data is stored in the data area 
 * index 1 - 10 = Type 2 TAG spec version eg. 1h0h = v1.0
 * index 2 - 6D = Max ndef message size - 6D(hex) = 109(dec) -> 109 * 8(1 byte) = 872bytes -> 872 + 16(tag header) = 888bytes
 * index 3 - 00 = Read permission - read and write access capability of the data area and CC area of the Type 2 Tag Platform.
 *                -  1st Byte => Read access : 0h = read ok, no security - 1h to 7h & Fh= RFU - 8h to Eh = proprietary
 *                -  2nd Byte => Write access: 0h = write ok, no security - 1h to 7h = RFU - 8h to Eh = proprietary - Fh no write access at all
 *                - (cc3 & 0xf0) == 0x00 ? true : false; - see: https://github.com/googlearchive/chrome-nfc/blob/812f1d01e495b44ef609a59d489cc0850b3a09ad/src/tt2.js#L78
 *  ----------
 * Read page (block) 4
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

  // Block 3
  // index 12 - not a NDEF formated tag
  let isTagFormatedAsNdef = utils.isTagFormatedAsNdef(tagBlocks0to4);

  // index 13 - Type 2 Tag Specification
  let type2TagSpecification = utils.getType2TagSpecification(tagBlocks0to4);

  // index 14 - get Max ndef message size
  let maxNdefMessageSize = utils.getMaxNdefMessageSize(tagBlocks0to4);

  // index 15 - has read permissions
  let hasTagReadPermissions = utils.hasTagReadPermissions(tagBlocks0to4);

  // Block 4
  // index 16 - has a ndef message
  let hasTagANdefMessage = utils.hasTagANdefMessage(tagBlocks0to4);

  // index 17 - get ndef message length
  let ndefMessageLength = utils.getNdefMessageLength(tagBlocks0to4);

  // How many bytes to read from block for to get the ndef message
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

// STATIC SAMPLE
// let tagBlocks0to4Fromblock4 = new Buffer('d101285402656e49276d20746865206669727374206e646566207265636f7264206f66207468697320746167', 'hex');
// console.log(tagBlocks0to4Fromblock4)
// logs: <Buffer d1 01 28 54 02 65 6e 49 27 6d 20 74 68 65 20 66 69 72 73 74 20 6e 64 65 66 20 72 65 63 6f 72 64 20 6f 66 20 74 68 69 73 20 74 61 67>

let parseNdef = function(tagBlocks0to4Fromblock4, type='text') { // default to text

  let parsingType = utils.getParsingType(type);


  // we slice the first 2 bytes
  // we need a buffer starting at ndef header (D1, 91...)
  let ndefMessageBuffer = tagBlocks0to4Fromblock4.slice(2)

  // @taptrack/ndefjs will parse the message for us
  var ndefMessage = ndef.Message.fromBytes(ndefMessageBuffer);

  // let's get the records
  var records = ndefMessage.getRecords();
  var parsedRecords = [];

  // loop over the records to resolve them as text
  for(var i=0; i<records.length; i++) {
    var recordContents = ndef.Utils[parsingType](records[i]);
    if(type === 'text') {
      parsedRecords.push({
        language: recordContents.language,
        content: recordContents.content
      });
    }
    if(type === 'uri') {
      parsedRecords.push({
        uri: recordContents
      });
    }

  }

  return parsedRecords;
}

buildHeader = function() {

}
buildNdef = function() {

}

const ndefParser = {
  parseHeader: parseHeader,
  parseNdef: parseNdef,
  buildHeader: buildHeader,
  buildNdef: buildNdef,
  utils: utils
}

module.exports = ndefParser;
