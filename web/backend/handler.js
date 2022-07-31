const { formatResponse } = require('./helpers');

const handler = async (event) => {
  console.log(event)

  return formatResponse({ received: event });
}

module.exports = { handler };
