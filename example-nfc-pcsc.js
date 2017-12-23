
const nfcCard = require('./lib/nfccard-tool');

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

      console.log(`card detected`, card);

      // example reading 12 bytes assuming containing text in utf8
      try {


        /**
         * READ MESSAGE AND ITS RECORDS
         */

        /**
         *  1 - READ HEADER
         *  Read block 0 to 6 in order to parse tag information
         */
        const blocks0to6 = await reader.read(0, 23); // starts reading in block 0 until 6

        const tag = nfcCard.parseInfo(blocks0to6);
        console.log('tag info:', tag);

        /**
         *  2 - Read the NDEF message and parse it if it's supposed there is one
         */
        if(nfcCard.isFormatedAsNDEF() && nfcCard.hasReadPermissions() && nfcCard.hasNDEFMessage()) {

          /**
           * Get NDEF MESSAGE as buffer
           */
          const NDEFRawMessage = await reader.read(4, nfcCard.getNDEFMessageLengthToRead()); // starts reading in block 0 until 6

          console.log('NDEFMessage:', nfcCard.parseNDEF(NDEFRawMessage));
        } else {
          console.log('Could not parse anything from this tag: \n The tag is either empty, locked, has a wrong NDEF format or is unreadable.')
        }


        /**
         * WRITE MESSAGE AND ITS RECORDS
         */
        const message = [
          { type: 'text', text: 'I\'m a text message', language: 'en' },
          { type: 'uri', uri: 'https://github.com/somq' },
          { type: 'aar', packageName: 'https://github.com/somq' },
        ]

        const rawDataToWrite = nfcCard.prepareBytesToWrite(message);
        // const preparationWrite = await reader.write(4, rawDataToWrite.preparedData);
        // if (preparationWrite) {
        //   console.log('Data have been written successfully.')
        // }

        // @TODO: Find a solution to write 1 byte to be able to respect the NFCForum-TS-Type-2-Tag_1.1.pdf spec.
        // if (preparationWrite) {
        //   const secondWrite = await reader.write(4, rawDataToWrite.finalWrite)
        // }  else {
        //   console.log('Something went wrong while trying to perform preparation write')
        // }


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
