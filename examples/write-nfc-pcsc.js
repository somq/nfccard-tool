
const nfcCard = require('../lib/nfccard-tool');

const { NFC } = require('nfc-pcsc');

const nfc = new NFC(); // optionally you can pass logger

nfc.on('reader', reader => {

	console.log(`${reader.reader.name}  device attached`);


  reader.on('card', async card => {

    console.log(`card detected`, card);

    try {

      /**
       *  1 - READ HEADER
       *  Read block 0 to 6 in order to parse tag information
       */
      const blocks0to6 = await reader.read(0, 23); // starts reading in block 0 until 6

      const tag = nfcCard.parseInfo(blocks0to6);
      console.log('tag info:', tag);


      /**
       * 2 - WRITE MESSAGE AND ITS RECORDS
       */
      const message = [
        { type: 'text', text: 'I\'m a text message', language: 'en' },
        { type: 'uri', uri: 'https://github.com/somq' },
        { type: 'aar', packageName: 'https://github.com/somq' },
      ]

      const rawDataToWrite = nfcCard.prepareBytesToWrite(message);
      const preparationWrite = await reader.write(4, rawDataToWrite.preparedData);
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
