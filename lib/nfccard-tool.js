const utils = require('./utils');
const ndeflib = require('ndef-lib');

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
      capabilityContainer: {
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
      capabilityContainer: {
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
  return this.tagHeaderValues.raw.capabilityContainer.MAX_NDEF_SIZE  * 8;
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
             readType === 0x0F){
    return 'RFU';

  } else if (readType === 0x08 ||
             readType === 0x09 ||
             readType === 0x0A ||
             readType === 0x0B ||
             readType === 0x0C ||
             readType === 0x0D ||
             readType === 0x0E){
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
             writeType === 0x07){
    return 'RFU';

  } else if (writeType === 0x08 ||
             writeType === 0x09 ||
             writeType === 0x0A ||
             writeType === 0x0B ||
             writeType === 0x0C ||
             writeType === 0x0D ||
             writeType === 0x0E){
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


nfcCardTool.prototype.parseHeader = function (){

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

  // console.log(this.tagHeader)
  return this.tagHeader;
}

nfcCardTool.prototype.parseInfo = function (blocks0to6){
  this.blocks0to6 = blocks0to6;

  const headerRawValues = this.getHeaderRawValues(blocks0to6);
  // console.log(headerRawValues)

  const parsedHeader = this.parseHeader(headerRawValues);
  // console.log(parsedHeader)

  return {
    headerValues: headerRawValues,
    parsedHeader: this.parseHeader(parsedHeader)
  }
}

/**
 * @description converts a record as a specific type record instance of NDEF-lib
 * 
 * @param {any} record - a NDEF-lib parsed ndefRecord
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
        
      console.log(recordType)
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
          NDEFlibAarRecord.setPayload(record.getPayload());
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
 */
nfcCardTool.prototype.prepareBytesToWrite = function(message) {
  /**
   * NDEF MESSAGE
   */
  const NDEFMessage = this.prepareNDEFMessage(message);
  console.log(NDEFMessage._records[0].getText());
  console.log(NDEFMessage.toByteArray().length);
  console.log(Buffer.from(NDEFMessage.toByteArray()));

  /**
   * NDEF MESSAGE HEADER 
   * Block 4
   */
  
  // index 16
  let isNDEFMessage = 0x03;
  // index 17
  let NDEFMessageLength = NDEFMessage.toByteArray().length; // @TODO: Verify if it's OK.
  // last index
  let terminator = 0xFE;


  /**
   * 0 -First read to get tag state
   */

  // Checks
  // if(NDEFMessageLength > this.getMaxNDEFMessageLength()) {
  //   throw new Error('The message length is too long to be written on this tag.')
  // }
  // if(!this.hasReadPermissions()) {
  //   throw new Error('Could not write the tag because it has no read permissions.');
  // }
  // if(!this.hasWritePermissions()) {
  //   throw new Error('Could not write the tag because it has no write permissions.');
  // }

  // @TODO: page 25... tbc...
}



// module.exports = function() {
//   return new nfcCardTool();
// };

module.exports = new nfcCardTool();
