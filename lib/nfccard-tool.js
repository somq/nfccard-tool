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
  const TagHeaderRawValues = {
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
  this.TagHeaderRawValues = TagHeaderRawValues;
  return TagHeaderRawValues;
}
nfcCardTool.prototype.isTagFormatedAsNdef = function() {
  console.log('a', new Buffer(this.TagHeaderRawValues.CapabilityContainer.MAGIC_NUMBER, 'hex'))
  return utils.hexStringToByte(this.TagHeaderRawValues.CapabilityContainer.MAGIC_NUMBER, 'hex')[0] === 0xE1;
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


  // Block 3
  // index 12 - Magic number - not a NDEF formated tag
  let isTagFormatedAsNdef = this.isTagFormatedAsNdef();

  // index 13 - Type 2 Tag Specification
  let type2TagSpecification = this.getType2TagSpecVersion();

  // index 14 - get Max ndef message size
  let maxNdefMessageSize = this.getMaxNdefMessageSize();

  // index 15 - has read permissions
  let hasTagReadPermissions = this.hasTagReadPermissions();

  // Block 4
  // index 16 - has a ndef message
  let hasTagANdefMessage = this.hasTagANdefMessage();

  // index 17 - get ndef message length
  let ndefMessageLength = this.getNdefMessageLength();

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

var blocks0To6 = new Buffer('04c124695a215280a9480000e1106d00037b9', 'hex');

let nfcCardToolx = new nfcCardTool(blocks0To6);
// const tagHeader = nfcCardToolx.parseTagHeader(blocks0To6).isTagFormatedAsNdef();
const tagHeader = nfcCardToolx.isTagFormatedAsNdef();

console.log(tagHeader)

// const TagHeaderRawValues = getTagHeaderRawValues(blocks0To6);
