const utils = require('./utils');


function nfcCardTool() {
  //
}

nfcCardTool.prototype.getHeaderRawValues = function(blocks0to6) {
  const tagHeader = blocks0to6;

  // Block 0
    // RFU
  // Block 1
    // RFU
  // Block 2

  // http://apps4android.org/nfc-specifications/NFCForum-TS-Type-2-Tag_1.1.pdf - page 20
  const tagHeaderValues = {
    raw: {
      Lock: {
        LOCK0: tagHeader[10],
        LOCK1: tagHeader[11]
      },
      CapabilityContainer: {
        MAGIC_NUMBER: tagHeader[12],
        SPEC_VERSION: tagHeader[13],
        MAX_NDEF_SIZE: tagHeader[14],
        READ_ACCESS: tagHeader[15],
        WRITE_ACCESS: tagHeader[15],
      },
      NDEFMessageHeader: {
        HAS_NDEF: tagHeader[16],
        MESSAGE_LENGTH: tagHeader[17]
      }
    },

    string: {
      Lock: {
        LOCK0: utils.numberToHexString(tagHeader[10]),
        LOCK1: utils.numberToHexString(tagHeader[11])
      },
      CapabilityContainer: {
        MAGIC_NUMBER: utils.numberToHexString(tagHeader[12]),
        SPEC_VERSION: utils.numberToHexString(tagHeader[13]),
        MAX_NDEF_SIZE: utils.numberToHexString(tagHeader[14]),
        READ_ACCESS: utils.numberToHexString(tagHeader[15]),
        WRITE_ACCESS: utils.numberToHexString(tagHeader[15]),
      },
      NDEFMessageHeader: {
        HAS_NDEF: utils.numberToHexString(tagHeader[16]),
        MESSAGE_LENGTH: utils.numberToHexString(tagHeader[17])
      }
    }

  }
  this.tagHeaderValues = tagHeaderValues;
  return tagHeaderValues;
}


// index 10 & 11 - LOCK
nfcCardTool.prototype.isTagLocked = function() {
  return this.tagHeaderValues.raw.CapabilityContainer.LOCK0; // TODO:
};

// index 12 - NDEF FORMAT
nfcCardTool.prototype.isFormatedAsNDEF = function() {
  return this.tagHeaderValues.raw.CapabilityContainer.MAGIC_NUMBER === 0xE1;
};

// index 13 - SPEC VERSION
nfcCardTool.prototype.getType2TagSpecVersion = function() {
  return this.tagHeaderValues.raw.CapabilityContainer.SPEC_VERSION; // TODO: parse version 1.0
};

// index 14 - MESSAGE
nfcCardTool.prototype.getMaxNDEFMessageLength = function() {
  return this.tagHeaderValues.raw.CapabilityContainer.MAX_NDEF_SIZE  * 8;
};

// index 15 - READ PERMISSIONS
nfcCardTool.prototype.hasReadPermissions = function() {
  return this.tagHeaderValues.raw.CapabilityContainer.READ_ACCESS; // TODO: mask = 0xF0
  //   return (tagBlocks0to4[15] & 0xf0) == 0x00 ? true : false;
};

// index 15 - WRITE PERMISSIONS
nfcCardTool.prototype.hasWritePermissions = function() {
  return this.tagHeaderValues.raw.CapabilityContainer.WRITE_ACCESS; // TODO:
};

// index 16
nfcCardTool.prototype.hasNDEFMessage = function() {
  return this.tagHeaderValues.raw.NDEFMessageHeader.HAS_NDEF === 0x03;
};

// index 17
nfcCardTool.prototype.getNDEFMessageLength = function() {

  return this.tagHeaderValues.raw.NDEFMessageHeader.MESSAGE_LENGTH;
};


nfcCardTool.prototype.parseHeader = function (){

  this.tagHeader = {
  // Block 3

    // index 12 - Magic number - not a NDEF formated tag
    isFormatedAsNDEF : this.isFormatedAsNDEF(),

    // index 13 - Type 2 Tag Specification version, eg. 1.0 - Refers to the NFC Forum spec
    type2TagSpecVersion: this.getType2TagSpecVersion(),

    // index 14 - get Max NDEF message size
    maxNDEFMessageSize: this.getMaxNDEFMessageLength(),

    // index 15 - has read permissions
    hasReadPermissions: this.hasReadPermissions(),

    // index 15 - has read permissions
    hasWritePermissions: this.hasWritePermissions(),

  // Block 4
    // index 16 - has a NDEF message
    hasNDEFMessage: this.hasNDEFMessage(),

    // index 17 - get NDEF message length
    NDEFMessageLength: this.getNDEFMessageLength(),

    // library custom - How many bytes to read from block for to get the NDEF message
    tagLengthToReadFromBlock4: this.getNDEFMessageLength() + 2
  }

  // console.log(this.tagHeader)
  return this.tagHeader;
}

nfcCardTool.prototype.parseInfo = function (blocks0to6){
  this.blocks0to6 = blocks0to6;

  const headerRawValues = this.getHeaderRawValues(blocks0to6);
  // console.log(headerRawValues)

  const parsedHeader = this.parseHeader(headerRawValues);
  // console.log(parsedHeader)

  return this.parseHeader(parsedHeader);
}


// module.exports = function() {
//   return new nfcCardTool();
// };

module.exports = new nfcCardTool();
