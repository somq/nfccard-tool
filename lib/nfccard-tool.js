const utils = require('./utils');

function nfcCardTool(blocks0To6) {
  this.blocks0To6 = blocks0To6;
  this.getTagHeaderRawValues();
}

nfcCardTool.prototype.getTagHeaderRawValues = function() {
  const tagHeader = blocks0To6;

  // Block 0
    // RFU
  // Block 1
    // RFU
  // Block 2

  // http://apps4android.org/nfc-specifications/NFCForum-TS-Type-2-Tag_1.1.pdf - page 20
  const tagHeaderRawValues = {
    Lock: {
      LOCK0: utils.numberToHexString(tagHeader[10]),
      LOCK1: utils.numberToHexString(tagHeader[11])
    },
    CapabilityContainer: {
      MAGIC_NUMBER: utils.numberToHexString(tagHeader[12]),
      SPEC_VERSION: utils.numberToHexString(tagHeader[13]),
      MAX_NDEF_SIZE: utils.numberToHexString(tagHeader[14]),
      READ_ACCESS: utils.numberToHexString(tagHeader[15]),
      WRITE_ACCESS: utils.numberToHexString(tagHeader[16]),
    },
    NdefMessageHeader: {
      HAS_NDEF: utils.numberToHexString(tagHeader[16]),
      MESSAGE_LENGTH: utils.numberToHexString(tagHeader[17])
    }
  }
  this.tagHeaderRawValues = tagHeaderRawValues;
  return tagHeaderRawValues;
}
nfcCardTool.prototype.isTagFormatedAsNdef = function() {
  console.log('a', new Buffer(this.tagHeaderRawValues.CapabilityContainer.MAGIC_NUMBER, 'hex'))
  return utils.hexStringToByte(this.tagHeaderRawValues.CapabilityContainer.MAGIC_NUMBER, 'hex')[0] === 0xE1;
};
nfcCardTool.prototype.getTagHeader = function (tagHeaderRawValues){


  // getType2TagSpecVersion: function(tagBlocks0to4) {
  //   return utils.numberToHexString(tagBlocks0to4[1]);
  // },
  // getMaxNdefMessageSize: function(tagBlocks0to4) {
  //   return tagBlocks0to4[13] * 8; // @UNSURE: +16 ?
  // },
  // hasTagReadPermissions: function(tagBlocks0to4) {
  //   return (tagBlocks0to4[15] & 0xf0) == 0x00 ? true : false;
  // },
  // hasTagANdefMessage: function(tagBlocks0to4) {
  //   return (tagBlocks0to4[16] === 0x03);
  // },
  // getNdefMessageLength: function(tagBlocks0to4) {
  //   return tagBlocks0to4[17];
  // },
}
nfcCardTool.prototype.parseTagHeader = function (){

  this.tagHeader = {
    // Block 3

    // index 12 - Magic number - not a NDEF formated tag
    isTagFormatedAsNdef : this.isTagFormatedAsNdef(),

    // index 13 - Type 2 Tag Specification version, eg. 1.0 - Refers to the NFC Forum spec
    type2TagSpecVersion: this.getType2TagSpecVersion(),

    // index 14 - get Max ndef message size
    maxNdefMessageSize: this.getMaxNdefMessageSize(),

    // index 15 - has read permissions
    hasTagReadPermissions: this.hasTagReadPermissions(),

    // index 15 - has read permissions
    hasTagWritePermissions: this.hasTagReadPermissions(),

    // Block 4
    // index 16 - has a ndef message
    hasTagANdefMessage: this.hasTagANdefMessage(),

    // index 17 - get ndef message length
    ndefMessageLength: this.getNdefMessageLength(),

    // library custom - How many bytes to read from block for to get the ndef message
    tagLengthToReadFromBlock4: this.getNdefMessageLength() + 2
  }

  return this.tagHeader;
}

var blocks0To6 = new Buffer('04c124695a215280a9480000e1106d00037b9', 'hex');

let nfcCardToolx = new nfcCardTool(blocks0To6);
// const tagHeader = nfcCardToolx.parseTagHeader(blocks0To6).isTagFormatedAsNdef();
const tagHeader = nfcCardToolx.isTagFormatedAsNdef();

console.log(tagHeader)

// const tagHeaderRawValues = getTagHeaderRawValues(blocks0To6);
