
const nfcCard = require('../lib/nfccard-tool');

const { NFC } = require('nfc-pcsc');

const nfc = new NFC();

nfc.on('reader', reader => {

	console.log(`${reader.reader.name}  device attached`);


  reader.on('card', async card => {

    console.log(`card detected`, card);

    try {

      /**
       *  1 - READ HEADER
       *  Read header: we need to verify if we have read and write permissions
       *               and if prepared message length can fit onto the tag.
       */
      const cardHeader = await reader.read(0, 20);

      const tag = nfcCard.parseInfo(cardHeader);

        /**
         * 2 - WRITE A NDEF MESSAGE AND ITS RECORDS
         */
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
