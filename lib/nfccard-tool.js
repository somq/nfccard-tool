const utils = require('./utils');
const ndeflib = require('ndef-lib');


function nfcCardTool() {
  // constructor
}

/**
 * @description Maps the values of the bytes and wrap them in an object to be returned to the user
 *              Allow the user to get mapped raw data
 * @param {*} blocks0to6
 * @returns an object containing mapped tag raw values
 */
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
      capabilityContainer: {
        MAGIC_NUMBER: tagHeader[12],
        SPEC_VERSION: tagHeader[13],
        MAX_NDEF_LENGTH: tagHeader[14],
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
        LOCK0: utils.decimalToHexString(tagHeader[10]),
        LOCK1: utils.decimalToHexString(tagHeader[11])
      },
      capabilityContainer: {
        MAGIC_NUMBER: utils.decimalToHexString(tagHeader[12]),
        SPEC_VERSION: utils.decimalToHexString(tagHeader[13]),
        MAX_NDEF_LENGTH: utils.decimalToHexString(tagHeader[14]),
        READ_ACCESS: utils.decimalToHexString(tagHeader[15]),
        WRITE_ACCESS: utils.decimalToHexString(tagHeader[15]),
      },
      NDEFMessageHeader: {
        HAS_NDEF: utils.decimalToHexString(tagHeader[16]),
        MESSAGE_LENGTH: utils.decimalToHexString(tagHeader[17])
      }
    }

  }
  this.tagHeaderValues = tagHeaderValues;
  return tagHeaderValues;
}

/**
 *
 * Header parsing methods, index by index of blocks0to4
 *
 */

// index 10 & 11 - CC area and the data area LOCK - 0x00 = free, 0x01 = locked
// NFCForum-TS-Type-2-Tag_1.1.pdf - Section 2.2.1 (page 5)
nfcCardTool.prototype.isStaticallyLocked = function() {
  return this.tagHeaderValues.raw.capabilityContainer.LOCK0 !== 0x00;
};

// index 12 - NDEF FORMAT
nfcCardTool.prototype.isFormatedAsNDEF = function() {
  return this.tagHeaderValues.raw.capabilityContainer.MAGIC_NUMBER === 0xE1;
};

// index 13 - SPEC VERSION
nfcCardTool.prototype.getType2SpecVersion = function() {
  const rawValue =  this.tagHeaderValues.raw.capabilityContainer.SPEC_VERSION;
  const major = (rawValue & 0xF0) >> 4;
  const minor = (rawValue & 0x0F);

  return major + '.' + minor;
};

// index 14 - MESSAGE
nfcCardTool.prototype.getMaxNDEFMessageLength = function() {
  return this.tagHeaderValues.raw.capabilityContainer.MAX_NDEF_LENGTH  * 8;
};


/**
 * READ/WRITE PERMISSIONS
 * NFCForum-TS-Type-2-Tag_1.1.pdf - Section 6.1 - page 20/21
 */

// index 15 - READ PERMISSIONS - read access granted without any security. boolean
// NFCForum-TS-Type-2-Tag_1.1.pdf - Section 6.1 - page 20/21
nfcCardTool.prototype.hasReadPermissions = function() {
  return ((this.tagHeaderValues.raw.capabilityContainer.READ_ACCESS & 0xF0) >> 4  === 0x00);
};

// index 15 - READ PERMISSIONS TYPES
// NFCForum-TS-Type-2-Tag_1.1.pdf - Section 6.1 - page 20/21
nfcCardTool.prototype.getReadPermissionsType = function() {
  const readType = (this.tagHeaderValues.raw.capabilityContainer.READ_ACCESS & 0xF0) >> 4;

  if(readType === 0x00) {
    return 'HAS_READ_ACCESS';

  } else if (readType === 0x01 ||
             readType === 0x02 ||
             readType === 0x03 ||
             readType === 0x04 ||
             readType === 0x05 ||
             readType === 0x06 ||
             readType === 0x07 ||
             readType === 0x0F) {
    return 'RFU';

  } else if (readType === 0x08 ||
             readType === 0x09 ||
             readType === 0x0A ||
             readType === 0x0B ||
             readType === 0x0C ||
             readType === 0x0D ||
             readType === 0x0E) {
    return 'PROPRIETARY';
  } else {
    return 'UNKNOWN';
  }

};


// index 15 - WRITE PERMISSIONS - write access granted without any security. boolean
// NFCForum-TS-Type-2-Tag_1.1.pdf - Section 6.1 - page 20/21
nfcCardTool.prototype.hasWritePermissions = function() {
  return (this.tagHeaderValues.raw.capabilityContainer.WRITE_ACCESS & 0x0F) === 0x00;
};

// index 15 - WRITE PERMISSIONS TYPES
// NFCForum-TS-Type-2-Tag_1.1.pdf - Section 6.1 - page 20/21
nfcCardTool.prototype.getWritePermissionsType = function() {
  const writeType = (this.tagHeaderValues.raw.capabilityContainer.READ_ACCESS & 0x0F);

  if(writeType === 0x00) {
    return 'HAS_WRITE_ACCESS';
  } else if (writeType === 0x0F) {
    return 'NO_WRITE_ACCESS';
  } else if (writeType === 0x01 ||
             writeType === 0x02 ||
             writeType === 0x03 ||
             writeType === 0x04 ||
             writeType === 0x05 ||
             writeType === 0x06 ||
             writeType === 0x07) {
    return 'RFU';

  } else if (writeType === 0x08 ||
             writeType === 0x09 ||
             writeType === 0x0A ||
             writeType === 0x0B ||
             writeType === 0x0C ||
             writeType === 0x0D ||
             writeType === 0x0E) {
    return 'PROPRIETARY';
  } else {
    return 'UNKNOWN';
  }

};
// index 16 - tag contains a NDEF message
nfcCardTool.prototype.hasNDEFMessage = function() {
  return this.tagHeaderValues.raw.NDEFMessageHeader.HAS_NDEF === 0x03;
};

// index 17 - NDEF message length
nfcCardTool.prototype.getNDEFMessageLength = function() {
  return this.tagHeaderValues.raw.NDEFMessageHeader.MESSAGE_LENGTH;
};

// library custom util
nfcCardTool.prototype.getNDEFMessageLengthToRead = function() {
  return this.tagHeaderValues.raw.NDEFMessageHeader.MESSAGE_LENGTH + 2;
};
/**
 * STATES
 * NFCForum-TS-Type-2-Tag_1.1.pdf - Section 6.3.1/2/3 - page 23
 * @TODO: not fully implemented.
 */

// INITIALIZED State
nfcCardTool.prototype.isInitialized = function() {
  return (this.hasReadPermissions() && this.hasNDEFMessage() && this.NDEFMessageLength === 0);
};
// READ/WRITE State
nfcCardTool.prototype.isReadWrite = function() {
  return (this.hasReadPermissions() && this.hasNDEFMessage() && (this.NDEFMessageLength !== 0 /* && this.NDEFMessageLength === "V field of NDEF Message TLV" */)); // @TODO: needs ndef-lib
};
// READ-ONLY State
nfcCardTool.prototype.isReadOnly = function() {
  return (!this.hasReadPermissions() && this.hasNDEFMessage() && this.NDEFMessageLength !== 0 /* && this.NDEFMessageLength === "V field of NDEF Message TLV" */); // @TODO: needs ndef-lib
};


/**
 * @description header parsing object returner
 *              this method gets it's values using appropriates methods concerning the tag info
 * @return an object containing tag header information
 */

nfcCardTool.prototype.parseHeader = function () {

  this.tagHeader = {

  // Block 3

    // index 12 - Magic number - not a NDEF formated tag
    isFormatedAsNDEF : this.isFormatedAsNDEF(),

    // index 13 - Type 2 Tag Specification version, eg. 1.0 - Refers to the NFC Forum spec
    type2SpecVersion: this.getType2SpecVersion(),

    // index 14 - get Max NDEF message size
    maxNDEFMessageSize: this.getMaxNDEFMessageLength(),


    // index 15 - has read permissions
    hasReadPermissions: this.hasReadPermissions(),

    // index 15 - types: HAS_READ_ACCESS, RFU, PROPRIETARY, UNKNOWN
    getReadPermissionsType: this.getReadPermissionsType(),

    // index 15 - has write permissions
    hasWritePermissions: this.hasWritePermissions(),

    // index 15 - types: HAS_WRITE_ACCESS, NO_WRITE_ACCESS, RFU, PROPRIETARY, UNKNOWN
    writePermissionsType: this.getWritePermissionsType(),

  // Block 4
    // index 16 - has a NDEF message
    hasNDEFMessage: this.hasNDEFMessage(),

    // index 17 - get NDEF message length
    NDEFMessageLength: this.getNDEFMessageLength(),

    // library custom - How many bytes to read from block for to get the NDEF message
    lengthToReadFromBlock4: this.getNDEFMessageLength() + 2,

  }

  // Block 6
    // @TODO: Manage Dynamic Memory Structure:
    // see: NFCForum-TS-Type-2-Tag_1.1.pdf - Section B.2
    // useful for first read of tag writing: NFCForum-TS-Type-2-Tag_1.1.pdf - Section C.10 "Write of an NDEF message in the Data Area"

  // console.log(this.tagHeader)
  return this.tagHeader;
}
/**
 * @description entry point for the user wanting to parse any parsable tag information
 * @param {Buffer} blocks0to6
 */
nfcCardTool.prototype.parseInfo = function (blocks0to6) {

  const headerRawValues = this.getHeaderRawValues(blocks0to6);

  return {
    headerValues: headerRawValues,
    parsedHeader: this.parseHeader(headerRawValues)
  }
}

/**
 * @description converts a record as a specific type record instance of NDEF-lib
 *
 * @param {any} NDEFRawMessage - a NDEF-lib parsed ndefRecord
 * @returns a specific type record instance of NDEF-lib including a "type" property as a string: T/U/android.com:pkg
 */
nfcCardTool.prototype.parseNDEF = function(NDEFRawMessage) {
    // console.log(NDEFRawMessage.toString('hex'))

    let NDEFRawMessageCleaned = this.cleanNDEFMessage(NDEFRawMessage);

    const NDEFlibMessage = new ndeflib.NdefMessage.fromByteArray(NDEFRawMessageCleaned);

    const NDEFlibRecords = NDEFlibMessage._records;
    const NDEFlibRecordsParsed = [];

    for(var i=0; i < NDEFlibRecords.length; i++) {
      const NDEFlibRecord = NDEFlibRecords[i];

      // converts buffer to ascii - eg. ascii:T, arrayBuffer: [54], Buffer: 0x54
      const recordType = Buffer.from(NDEFlibRecord.getType()).toString('ascii');

      switch (recordType) {
        case "T": {
          let NDEFlibTextRecord = new ndeflib.NdefTextRecord();
          NDEFlibTextRecord.setPayload(NDEFlibRecord.getPayload())
          NDEFlibRecordsParsed.push({
            NDEFLibRecord: NDEFlibTextRecord,
            type: 'text',
            text: NDEFlibTextRecord.getText(),
            language: NDEFlibTextRecord.getLanguageCode()
          });
          break;
        }

        case "U": {
          /**
           * There are several sub-types of Uri records but we only parse as standard Uri record
           * Types supported by NDEF-lib:
           *    NdefTelRecord (tel:PhoneNumber)
           *    NdefGeoRecord (geo:Long,Lat)
           *    NdefSocialRecord (http://SocialWebsite/Username)
           */

          let NDEFlibUriRecord = new ndeflib.NdefUriRecord();
          NDEFlibUriRecord.setPayload(NDEFlibRecord.getPayload())
          NDEFlibUriRecord.type = 'U';
          NDEFlibRecordsParsed.push({
            NDEFLibRecord: NDEFlibUriRecord,
            type: 'uri',
            uri: NDEFlibUriRecord.getUri(),
          });
          break;
        }

        case "android.com:pkg": {
          // There are several sub-type of Uri records but we only parse as standard Uri record
          let NDEFlibAarRecord = new ndeflib.NdefAndroidAppRecord();
          NDEFlibAarRecord.setPayload(NDEFlibRecord.getPayload());
          NDEFlibAarRecord.type = 'android.com:pkg';
          NDEFlibRecordsParsed.push({
            NDEFLibRecord: NDEFlibAarRecord,
            type: 'aar',
            packageName: NDEFlibAarRecord.getPackageName(),
          });
          break;
        }

        default:
        NDEFlibRecordsParsed.push({
          NDEFlibRecord: NDEFlibRecord,
          type: 'unsupported'
        })
          break;
      }
    }
    return NDEFlibRecordsParsed;
}


/**
 * @description Verify if message contains NDEF headers & Terminator:
 *                - hasNDEFFormat (0x03) at index 0
 *                - NDEFMessageLength (0xXX) at index 1
 *                - Terminator 0xFE at the end of array
 *              remove them if present and return the cleaned NDEF Message
 * @param {*} NDEFRawMessage
 */
nfcCardTool.prototype.cleanNDEFMessage = function(NDEFRawMessage) {

  let NDEFRawMessageCleaned;

  // Assume it's not the message yet but a read starting at block 4
  // We slice the 2 first index
  if(NDEFRawMessage[0] === 0x03) {
    NDEFRawMessageCleaned = NDEFRawMessage.slice(2);
  }
  if(NDEFRawMessage[NDEFRawMessage.length-1] === 0xFE) {
    NDEFRawMessageCleaned = NDEFRawMessage.splice(-1,1)
  }
  return NDEFRawMessageCleaned;
}

nfcCardTool.prototype.prepareNDEF = function() {

}

/**
 * @description prepares a ndef-lib object containing message and records
 * @param {*} recordsToPrepare as nfcarcd-tool format
 */
nfcCardTool.prototype.prepareNDEFMessage = function(recordsToPrepare) {

  let NDEFMessage = new ndeflib.NdefMessage()

  for (let i = 0; i < recordsToPrepare.length; i++) {
    const recordToPrepare = recordsToPrepare[i];

    switch (recordToPrepare.type) {
      case 'text': {
          let ndefTextRecord = new ndeflib.NdefTextRecord();
          ndefTextRecord.setText(recordToPrepare.text);
          ndefTextRecord.setLanguageCode(recordToPrepare.language);
          NDEFMessage._records.push(ndefTextRecord);
        }
        break;
      case 'uri': {
          let ndefUriRecord = new ndeflib.NdefUriRecord();
          ndefUriRecord.setUri(recordToPrepare.uri);
          NDEFMessage._records.push(ndefUriRecord);
        }
        break;
      case 'aar': {
          let ndefAndroidAppRecord = new ndeflib.NdefAndroidAppRecord();
          ndefAndroidAppRecord.setPackageName(recordToPrepare.packageName);
          NDEFMessage._records.push(ndefAndroidAppRecord);
        }
        break;

      default:
        break;
    }
  }
  return NDEFMessage;
}
/**
 * @description prepare anything we need in order to write a NDEF message to the tag
 * @doc: NFCForum-TS-Type-2-Tag_1.1.pdf - Section 6.4.3 - page 25 (Write procedure) & Section C.4 - page 35 (example)
 * @param {*} message
 * @TODO: manage dynamic memory tags writing: see p39
 */
nfcCardTool.prototype.prepareBytesToWrite = function(message) {

  /**
   * Procedure used to write ndef data
   *
   * Write #1 - Write NDEF message length to 0
   *    - Write NDEF message
   *    - Write Terminator
   * Write #2 - Write real NDEF message length
   *
   *
  // Write #1
  // 2 - Write: Block 4 - index 1: 0x00 // TLV length 00
  // 2 - Write: Block 4 - index 2 to n: TLV value = NDEFMessage
  // 2 - Write: Block 4 - index n (end): 0xFE // Terminator

  // Write #2 - re-set the TLV
  // 3 - Write: Block 4 - index 1: 0xXX // TLV length = NDEFMessageLength
   *
   * Seems like it's not possible to write a tag starting at a specific block AND at a specific byte
   * docs:
   *    http://cardwerk.com/smart-card-standard-iso7816-4-section-6-basic-interindustry-commands/#chap6_3
   *    https://www.acs.com.hk/download-manual/419/API-ACR122U-2.04.pdf
   *    http://nfcpy.readthedocs.io/en/latest/modules/tag.html#nfc.tag.tt2.Type2Tag.read
   *
   * So for the convenience we will overwrite NDEF MESSAGE TLV T (0x03) and write all the data at once starting at block 4
   *
   *   // @TODO: Find out why the fuck we can't do what the spec tell us to do.
   */



  /**
   * NDEF MESSAGE
   */
  const NDEFMessage = this.prepareNDEFMessage(message);
  // console.log(NDEFMessage._records[0].getText());
  // console.log(NDEFMessage.toByteArray().length);
  // console.log(Buffer.from(NDEFMessage.toByteArray()));

  /**
   * NDEF MESSAGE HEADER
   * Block 4
   */

  // index 16
  let NDEF_MESSAGE_TLV_T = new Buffer('03', 'hex'); // 0x03
  // index 17
  let NDEF_MESSAGE_TLV_L_EMPTY = new Buffer('00', 'hex'); // 0x00 - first write
  let NDEFMessageLength = NDEFMessage.toByteArray().length; // second and final write
  let NDEF_MESSAGE_TLV_L_LENGTH = new Buffer(NDEFMessageLength.toString(16), 'hex'); // 0x00 - first write
  // index 18
  let NDEFMessageBuffer = Buffer.from(NDEFMessage.toByteArray())
  // last index
  let TERMINATOR = new Buffer('FE', 'hex'); // 0xFE


  /**
   * 0 - First read to get tag state
   *   - Page 25 & 35 - static writing
   */

  // 1 - Checks (skip read as we have already done them)
  if(NDEFMessageLength > this.tagHeader.maxNDEFMessageSize) {
    throw new Error('The message length is too long to be written on this tag.')
  }
  if(!this.tagHeader.hasReadPermissions) {
    throw new Error('Could not write the tag because it has no read permissions.');
  }
  if(!this.tagHeader.hasWritePermissions) {
    throw new Error('Could not write the tag because it has no write permissions.');
  }

  let preparedDataToFill = Buffer.concat([NDEF_MESSAGE_TLV_T, NDEF_MESSAGE_TLV_L_LENGTH, NDEFMessageBuffer, TERMINATOR], NDEFMessage.toByteArray().length + 3) // 3 = NDEF_MESSAGE_TLV_T + NDEF_MESSAGE_TLV_L_EMPTY + TERMINATOR

  // @TODO: Write should be done in two times
  // let preparationWriteToFill = Buffer.concat([NDEF_MESSAGE_TLV_T, NDEF_MESSAGE_TLV_L_EMPTY, NDEFMessageBuffer, TERMINATOR], NDEFMessage.toByteArray().length + 3) // 3 = NDEF_MESSAGE_TLV_T + NDEF_MESSAGE_TLV_L_EMPTY + TERMINATOR
  // let finalWriteToFill = Buffer.concat([NDEF_MESSAGE_TLV_T, NDEF_MESSAGE_TLV_L_LENGTH], 2);


  // fill buffer with zeros until preparationWriteToFill.length % 4 === 0 (is a multiple of 4)
  let preparedData = utils.bufferFiller(preparedDataToFill, 4, 0)


  // @TODO: Write should be done in two times
  // NDEFMessageBuffer.length = 2;
  // let finalWrite = Buffer.concat([NDEF_MESSAGE_TLV_T, NDEF_MESSAGE_TLV_L_EMPTY, NDEFMessageBuffer]);


  return {
    preparedData : preparedData
    // @TODO: Write should be done in two times
    // preparationWrite: preparationWrite,
    // finalWrite: finalWrite
  }
}


// module.exports = function() {
//   return new nfcCardTool();
// };

module.exports = new nfcCardTool();
