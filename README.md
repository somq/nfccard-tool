# ndef-parser


> Feed me with a raw nfc card output and I will drop you tjhe ndef message if I can find one.


## Table of Contents

* [Install](#install)
* [Usage](#usage)
* [Third party](#thirdparty)
* [Contributors](#contributors)
* [License](#license)


## Install

[npm][]:

```sh
npm install ndef-parser
```

[yarn][]:

```sh
yarn add ndef-parser
```


## Usage
### Complete example:
#### Copy/pasta example:
```js
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

```

---

### Detailed explanations

#### Require the lib:
```js
let ndef = require('ndef-parser');

```

Parse the tag header `ndef.parseHeader(buffer)`
In order to know where the ndef message is we parse the header:

Here is a buffer of the first 4 blocks of a nfc tag (ntag216) containg 2 ndef text records:

    <Buffer 04 6e 38 da 5a 21 52 80 a9 48 00 00 e1 10 6d 00 03 85 91 01>

```js
// Let's mock it by creating a new buffer:
let tagBufferBlocks0to4 = new Buffer('046e38da5a215280a9480000e1106d0003859101', 'hex');

console.log('tagBufferBlocks0to4', tagBufferBlocks0to4);
// logs: <Buffer 04 6e 38 da 5a 21 52 80 a9 48 00 00 e1 10 6d 00 03 85 91 01> (here we go!)


// We want to parse this header
// ndef.parseHeader will return an obj containing headers statements
let tagHeaderValues = ndef.parseHeader(tagBufferBlocks0to4);

console.log(tagHeaderValues);
  // logs:
  // { isTagFormatedAsNdef: true,
  //   type2TagSpecification: '6e',
  //   maxNdefMessageSize: 128,
  //   hasTagReadPermissions: true,
  //   hasTagANdefMessage: true,
  //   ndefMessageLength: 133,
  //   tagLengthToReadFromBlock4: 135 }

```
ndef.parseHeader(buffer) returns:
`isTagFormatedAsNdef` *boolean* - is tag formated as ndef ?
`type2TagSpecification` *string* - hex string of the type2 tag spec
`maxNdefMessageSize` *int* - max ndef message size provided by the tag
`hasTagReadPermissions` *boolean* - is tag read locked ?
`hasTagANdefMessage` *boolean* - tag has a ndef message ?
`ndefMessageLength` *int* - ndef message length
`tagLengthToReadFromBlock4` *int* - bytes to read starting at block 4 to get the full ndef message


Parse the ndef message and it's record(s)  `ndef.parseNdef(buffer)`:
Now that we know if our tag contains a valid ndef message we can read one more time the tag where it's located.
Just then we will be able to use a third party library to parse the ndef message.
```js

// Check if our tag is readable and has a ndef message
if(tagHeaderValues.hasTagReadPermissions && tagHeaderValues.isTagFormatedAsNdef && tagHeaderValues.hasTagANdefMessage) {
  // Ok, looks like what we've seen in the header tells us we can find a ndef message
  // Here's an example using nfc-pcsc library:
  // var tagBufferFromBlock4 = await reader.read(4, tagHeaderValues.tagLengthToReadFromBlock4);
  // And here is our isolated ndef message !
  console.log(tagBufferFromBlock4);
  // logs: <Buffer 91 01 28 54 02 65 6e 49 27 6d 20 74 68 65 20 66 69 72 73 74 20 6e 64 65 66 20 72 65 63 6f 72 64 20 6f 66 20 74 68 69 73 20 74 61 67 51 01 55 54 02 65 ... >




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
```

## Third party
We are natively using https://github.com/TapTrack/NdefJS but you could give a try at https://github.com/andijakl/ndef-nfc or have a deep look at https://github.com/googlearchive/chrome-nfc

If you are looking for a nfc tag reading library take a look at https://github.com/pokusew/nfc-pcsc



## License

[MIT](LICENSE) © somq


##

[npm]: https://www.npmjs.com/

[yarn]: https://yarnpkg.com/


