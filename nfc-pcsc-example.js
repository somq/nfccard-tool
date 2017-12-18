
const ndef = require('nfccard-parser');

// without Babel in ES2015
const { NFC } = require('nfc-pcsc');

const nfc = new NFC(); // optionally you can pass logger

nfc.on('reader', reader => {

	// disable auto processing
	reader.autoProcessing = false;

	console.log(`${reader.reader.name}  device attached`);

	// needed for reading tags emulated with Android HCE
	// custom AID, change according to your Android for tag emulation
	// see https://developer.android.com/guide/topics/connectivity/nfc/hce.html
	// reader.aid = 'F222222222';



  reader.on('card', async card => {

      console.log();
      console.log(`card detected`, card);

      // example reading 12 bytes assuming containing text in utf8
      try {

        // reader.read(blockNumber, length, blockSize = 4, packetSize = 16)
        const data = await reader.read(0, 20); // starts reading in block 4, continues to 5 and 6 in order to read 12 bytes
        console.log(`data read`, data);


        /**
         * Here starts nfccard-parser job
         */

        let tagBufferBlocks0to4 = data;

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
          let tagBufferFromBlock4 = await reader.read(4, tagHeaderValues.tagLengthToReadFromBlock4);;


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






      } catch (err) {
        console.error(`error when reading data`, err);
      }


    });

	reader.on('card.off', card => {
		console.log(`${reader.reader.name}  card removed`, card);
	});

	reader.on('error', err => {
		console.log(`${reader.reader.name}  an error occurred`, err);
	});

	reader.on('end', () => {
		console.log(`${reader.reader.name}  device removed`);
	});

});

nfc.on('error', err => {
	console.log('an error occurred', err);
});
