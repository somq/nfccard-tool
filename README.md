# nfccard-tool


> The toolbox for reading and writing nfc cards.
> Parse card header, ndef message and records, prepare ndef records for writing...

## Table of Contents

* [Install](#install)
* [Features](#features)
* [Quick start examples](#examples)
* [Usage](#usage)
  * [1 - Require the lib:](#0---require-the-lib)
  * [2 - Parse a card header:](#1---parse-a-card-header)
  * [3 - Parse a NDEF message:](#2---parse-a-ndef-message)
  * [4 - Prepare a NDEF message:](#3---prepare-a-ndef-message)
* [API](#api)
  * [Methods](#methods)
  * [tag object](#tag-object)
* [Third party](#thirdparty)
* [License](#license)


## Install

[npm][]:

```sh
npm install nfccard-tool --save
```

[yarn][]:

```sh
yarn add nfccard-tool --save
```

## Features

* Parse a card header and wrap raw and human readable data in a object:
  * Locks states
  * Capability Container
    * Magic number
    * Spec version
    * Max NDEF length
    * Read and write accesses
  * NDEF message detection and length
* Parse and prepare a NDEF message of types:
  * Text
  * Uri
  * Android App Record


## Quick start examples (with the help of [nfc-pcsc](https://github.com/pokusew/nfc-pcsc))
### Read a card header and parse a NDEF message

```
npm run read-nfcpcsc
```
### Write a NDEF message

```
npm run read-nfcpcsc
```

## Usage
### 1 - Require the lib:

```js
const ndef = require('nfccard-tool');
```

### 2 - Parse a card header:

With the card reader of your choice, read from block 0 until end of block 4. Which means a 20 bytes long read.

> Note: before any NDEF parsing or preparing we need to parse the card header first using a **read** command.

```js
// Starts reading in block 0 for 20 bytes long
const cardHeader = await reader.read(0, 20);

const tag = nfcCard.parseInfo(cardHeader);
console.log('tag info:', JSON.stringify(tag));
```
Which logs:
```json
tag info:
{
    "headerValues":{
        "raw":{
            "Lock":{
                "LOCK0":0,
                "LOCK1":0
            },
            "capabilityContainer":{
                "MAGIC_NUMBER":225,
                "SPEC_VERSION":16,
                "MAX_NDEF_LENGTH":109,
                "READ_ACCESS":0,
                "WRITE_ACCESS":0
            },
            "NDEFMessageHeader":{
                "HAS_NDEF":3,
                "MESSAGE_LENGTH":86
            }
        },
        "string":{
            "Lock":{
                "LOCK0":"0",
                "LOCK1":"0"
            },
            "capabilityContainer":{
                "MAGIC_NUMBER":"E1",
                "SPEC_VERSION":"10",
                "MAX_NDEF_LENGTH":"6D",
                "READ_ACCESS":"0",
                "WRITE_ACCESS":"0"
            },
            "NDEFMessageHeader":{
                "HAS_NDEF":"3",
                "MESSAGE_LENGTH":"56"
            }
        }
    },
    "parsedHeader":{
        "isFormatedAsNDEF":true,
        "type2SpecVersion":"1.0",
        "maxNDEFMessageSize":872,
        "hasReadPermissions":true,
        "getReadPermissionsType":"HAS_READ_ACCESS",
        "hasWritePermissions":true,
        "writePermissionsType":"HAS_WRITE_ACCESS",
        "hasNDEFMessage":true,
        "NDEFMessageLength":86,
        "lengthToReadFromBlock4":88
    }

}
```

### 3 - Parse a NDEF message:
> If card header parsing let us know *there might be* a NDEF message we can try to parse it:

```js
// There might be a NDEF message and we are able to read the tag
if(nfcCard.isFormatedAsNDEF() && nfcCard.hasReadPermissions() && nfcCard.hasNDEFMessage()) {

  // Read the appropriate length to get the NDEF message as buffer
  const NDEFRawMessage = await reader.read(4, nfcCard.getNDEFMessageLengthToRead()); // starts reading in block 0 until 6

  // Parse the buffer as a NDEF raw message
  const NDEFMessage = nfcCard.parseNDEF(NDEFRawMessage);

  console.log('NDEFMessage:', NDEFMessage);

} else {
  console.log('Could not parse anything from this tag: \n The tag is either empty, locked, has a wrong NDEF format or is unreadable.')
}
```

### 4 - Prepare a NDEF message:
> We can use the convenient method *prepareBytesToWrite* to get the appropriate Buffer we need to write a ndef message.
```js
// 1 - READ HEADER

// Starts reading in block 0 until end of block 4
const cardHeader = await reader.read(0, 20);

const tag = nfcCard.parseInfo(cardHeader);
console.log('tag info:', JSON.stringify(tag));


// 2 - WRITE A NDEF MESSAGE AND ITS RECORDS

const message = [
  { type: 'text', text: 'I\'m a text message', language: 'en' },
  { type: 'uri', uri: 'https://github.com/somq' },
  { type: 'aar', packageName: 'https://github.com/somq' },
]

// Prepare the buffer to write on the card
const rawDataToWrite = nfcCard.prepareBytesToWrite(message);

// Write the buffer on the card starting at block 4
const preparationWrite = await reader.write(4, rawDataToWrite.preparedData);

// Success !
if (preparationWrite) {
  console.log('Data have been written successfully.')
}
```

---

## API

#### Methods
```js
// Magic number
nfcCard.isFormatedAsNDEF();

// Type 2 Tag Specification version, eg. 1.0
nfcCard.getType2SpecVersion();

// Max NDEF size for the current tag
nfcCard.getMaxNDEFMessageLength();

// Read locked ?
nfcCard.hasReadPermissions();

// Read types: HAS_READ_ACCESS, RFU, PROPRIETARY, UNKNOWN
nfcCard.getReadPermissionsType();

// Write locked ?
nfcCard.hasWritePermissions();

// Write types: HAS_READ_ACCESS, RFU, PROPRIETARY, UNKNOWN
nfcCard.getWritePermissionsType();

// NDEF message flag is present ?
nfcCard.hasNDEFMessage();

// NDEF message length on exists on the tag
nfcCard.getNDEFMessageLength();

```
#### tag *object*

```js
{
    "headerValues":{
        "raw":{ // Raw buffer values
            "Lock":{
                "LOCK0":0, // Lock 0 status - block 2, byte 2
                "LOCK1":0 // Lock 1 status - block 2, byte 3
            },
            "capabilityContainer":{
                "MAGIC_NUMBER":225, // magic number - block 3, byte 0 (CC0)
                "SPEC_VERSION":16, // type 2 spec version - block 3, byte 1 (CC1)
                "MAX_NDEF_LENGTH":109, // max ndef message length - block 3, byte 2 (CC2)
                "READ_ACCESS":0, // read access - block 3, byte 3 (CC3)
                "WRITE_ACCESS":0 // write access - block 3, byte 3 (CC3)
            },
            "NDEFMessageHeader":{
                "HAS_NDEF":3, // NDEF header 0 - block 4, byte 0
                "MESSAGE_LENGTH":86 // NDEF header 1 - block 4, byte 1
            }
        },
        "string":{ // Hex string values
            "Lock":{
                "LOCK0":"0",
                "LOCK1":"0"
            },
            "capabilityContainer":{
                "MAGIC_NUMBER":"E1",
                "SPEC_VERSION":"10",
                "MAX_NDEF_LENGTH":"6D",
                "READ_ACCESS":"0",
                "WRITE_ACCESS":"0"
            },
            "NDEFMessageHeader":{
                "HAS_NDEF":"3",
                "MESSAGE_LENGTH":"56"
            }
        }
    },
    "parsedHeader":{
        "isFormatedAsNDEF":true, // magic number - block 3, byte 0 (CC0)
        "type2SpecVersion":"1.0", // type 2 spec version - block 3, byte 1 (CC1)
        "maxNDEFMessageSize":872, // max ndef message length - block 3, byte 2
        "hasReadPermissions":true, // read access - block 3, byte 3 (CC3)
        "getReadPermissionsType":"HAS_READ_ACCESS",
        "hasWritePermissions":true, // write access - block 3, byte 3 (CC3)
        "writePermissionsType":"HAS_WRITE_ACCESS",
        "hasNDEFMessage":true, // NDEF header 0 - block 4, byte 0
        "NDEFMessageLength":86, // NDEF header 1 - block 4, byte 1
        "lengthToReadFromBlock4":88 // NDEFMessageLength + 2
    }

}
```

## Compatibility

Only a part of [Type 2 tag specification](docs/NFCForum-TS-Type-2-Tag_1.1.pdf) is implemented.

This lib does not support yet:
* Dynamical memory structure
* Lock preparing
* *... some are probably missing*


## Third party
We are natively using [ndef-lib](https://github.com/somq/ndef-lib) for parsing but you could give a try at https://github.com/TapTrack/NdefJS or have a deep look at https://github.com/googlearchive/chrome-nfc

If you are looking for a nfc tag reading library take a look at https://github.com/pokusew/nfc-pcsc



## License

[MIT](LICENSE) © somq

