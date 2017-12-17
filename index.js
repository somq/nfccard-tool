let ndef = require('./lib/ndef-parser');

/**
 * Header parsing
 */

// Here is a buffer of the first 4 blocks of a nfc tag (ntag216) containg 2 ndef text records:
//         - <Buffer 04 6e 38 da 5a 21 52 80 a9 48 00 00 e1 10 6d 00 03 85 91 01>
 
// Let's mock it by creating a new buffer:


// var tagBufferBlocks0to4 = await reader.read(0, 20);
let tagBufferBlocks0to4 = new Buffer('046e38da5a215280a9480000e1106d0003859101');
console.log('tagBufferBlocks0to4', tagBufferBlocks0to4); // <Buffer 04 6e 38 da 5a 21 52 80 a9 48 00 00 e1 10 6d 00 03 85 91 01>


let tagHeaderValues = ndef.parseHeader(tagBufferBlocks0to4);

console.log(tagHeaderValues);
  // { isTagFormatedAsNdef: true,
  //   type2TagSpecification: '6e',
  //   maxNdefMessageSize: 128,
  //   hasTagReadPermissions: true,
  //   hasTagANdefMessage: true,
  //   ndefMessageLength: 133,
  //   tagLengthToReadFromBlock4: 135 }

/**
 * ndef buffer extraction
 */
// check if tag is readable and has a ndef message
if(tagHeaderValues.hasTagReadPermissions && tagHeaderValues.isTagFormatedAsNdef && tagHeaderValues.hasTagANdefMessage) {
  // var tagBufferFromBlock4 = await reader.read(4, tagHeaderValues.tagLengthToReadFromBlock4);
  console.log(tagBufferFromBlock4); // ndefMessageBuffer <Buffer 91 01 28 54 02 65 6e 49 27 6d 20 74 68 65 20 66 69 72 73 74 20 6e 64 65 66 20 72 65 63 6f 72 64 20 6f 66 20 74 68 69 73 20 74 61 67 51 01 55 54 02 65 ... >
  
  // ndef parsing
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