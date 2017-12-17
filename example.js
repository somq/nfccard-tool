let ndef = require('ndef-parser');

// Let's mock it by creating a new buffer:
let tagBufferBlocks0to4 = new Buffer('046e38da5a215280a9480000e1106d00032ad101', 'hex');

// We want to parse this header
let tagHeaderValues = ndef.parseHeader(tagBufferBlocks0to4);

// ndef.parseHeader will return an obj containing headers statements:
console.log(tagHeaderValues);
  // logs:
  // { isTagFormatedAsNdef: true,
  //   type2TagSpecification: '6e',
  //   maxNdefMessageSize: 128,
  //   hasTagReadPermissions: true,
  //   hasTagANdefMessage: true,
  //   ndefMessageLength: 133,
  //   tagLengthToReadFromBlock4: 135 }

  // Check if our tag is readable and has a ndef message
if(tagHeaderValues.hasTagReadPermissions && tagHeaderValues.isTagFormatedAsNdef && tagHeaderValues.hasTagANdefMessage) {

  // And here is our isolated ndef message !
  let tagBufferFromBlock4 = new Buffer('032ad101265402656e4865792074686572652c2069276d2061206e6465662074657874207265636f72642021', 'hex');


  // ndef.parseNdef uses @taptrack/ndef which supports text and uri parsing, but you obviously can use anything to parse the ndef message
  let parsedRecords = ndef.parseNdef(tagBufferFromBlock4);

  console.log(parsedRecords)
  // [{
  //   language: 'en',
  //   content: 'I\'m the first ndef record of this tag'
  // },
  // { language: 'en',
  //   content: 'Looks like I\'m the second record of this tag, and a plaintext type one by the way.'
  // }]
}