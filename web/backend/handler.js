const handler = (event) => {
  console.log(event)

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: json.dumps({ received: event }),
  }
}

module.exports = { handler };
