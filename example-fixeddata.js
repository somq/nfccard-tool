const nfcCard = require('./lib/nfccard-tool');
const ndefLibrary = require('ndef-lib');
const ndeflib = require('ndef-lib');
var ndefTT = require('@taptrack/ndef');

var blocks0to6 = new Buffer('04c124695a215280a9480000e1106d00037b9', 'hex');


const tag = nfcCard.parseInfo(blocks0to6);

console.log(tag);
console.log(tag.headerValues.raw.capabilityContainer.SPEC_VERSION);

console.log(nfcCard.getType2SpecVersion());
console.log(nfcCard.isFormatedAsNDEF());
console.log(nfcCard.getReadPermissionsType());


// let ndefRecordx = new Buffer('d101265402656e4865792074686572652c2069276d2061206e6465662074657874207265636f72642021fe', 'hex');
let msg = '9101,1154,0265,6e54,6573,7420,7265,636f,7264,2023,3111,0111,5504,6769,7468,7562,2e63,6f6d,2f73,6f6d,712f,5210,3e61,7070,6c69,6361,7469,6f6e,2f6a,736f,6e7b,2022,7072,6f70,6572,7479,4e61,6d65,223a,2022,7661,6c75,6522,2c20,2272,6563,6f72,644e,756d,6265,7222,3a20,2249,276d,2074,6865,2072,6563,6f72,6420,2333,7dfe,0000,6865,2053,6175,6469,2042,7269,7469,7368,2042,616e,6b5c,222c,205c,2261,7070,5665,7273,696f,6e5c,223a,205c,2231,2e30,2e30,5c22,7dfe,6469,2042,7269,7469,7368,2042,616e,6b22,2c61,7070,5665,7273,696f,6e3a,2022,312e,302e,3022,7d0a,fe00,0a20,2020,2020,2061,7070,5665,7273,696f,6e3a,2022,312e,302e,3022,0a20,2020,207d,fe'.split(',').join('')
console.log(msg);
let NDEFRawMessage = new Buffer(msg, 'hex');

console.log('getRecordValues(record0): ', nfcCard.parseNDEF(NDEFRawMessage)); // text

// // NDEF-lib
// let ndefMessageNdeflib = new ndeflib.NdefMessage.fromByteArray(ndefRawMsg);

// const record0 = ndefMessageNdeflib._records[0];
// const record1 = ndefMessageNdeflib._records[1];
// const record2 = ndefMessageNdeflib._records[2];

// console.log('getRecordValues(record0): ', nfcCard.getNDEFRecordsValues(record0)); // text
// console.log('getRecordValues(record1): ', nfcCard.getNDEFRecordsValues(record1)); // uri
// console.log('getRecordValues(record2): ', nfcCard.getNDEFRecordsValues(record2)); // mime - return { type: 'unsupported' }



//   // taptrack ndef
//   let ndefMessageNdefTT = ndefTT.Message.fromBytes(ndefRawMsg);

//   // let's get the records
//   var records = ndefMessageNdefTT.getRecords();
//   console.log(ndefTT.Utils.resolveTextRecord(records[0])); // text
//   console.log(ndefTT.Utils.resolveTextRecord(records[1])); // uri - Throw an error
//   console.log(ndefTT.Utils.resolveTextRecord(records[2])); // mime - Throw an error
    