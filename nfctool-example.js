const nfcCardTool = require('./lib/nfccard-tool');

var blocks0to6 = new Buffer('04c124695a215280a9480000e1106d00037b9', 'hex');


const tagHeader = nfcCardTool.parseInfo(blocks0to6);
console.log(tagHeader)
console.log(nfcCardTool.isFormatedAsNDEF())

