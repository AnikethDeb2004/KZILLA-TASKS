const http = require('http');
const fs = require('fs');

const PORT = 3000;

//                                              Read contacts from the JSON file
function readContacts(response) {
  try {
    const data = fs.readFileSync('contacts.json', 'utf8');
    const contacts = JSON.parse(data);
    sendResponse(response, 200, contacts);
  } catch (error) {
    sendResponse(response, 500, { error: 'Internal Server Error' });
  }
}

//                                             Add a new contact to the JSON file
function addContact(request, response) {
  let data = '';

  request.on('data', chunk => {
    data += chunk;
  });

  request.on('end', () => {
    const newContact = JSON.parse(data);

    if (!newContact || !newContact.name || !newContact.email) {
      sendResponse(response, 400, { error: 'Invalid request. Name and email are required.' });
      return;
    }

    const contacts = readContactsSync();
    contacts.push(newContact);

    try {
      fs.writeFileSync('contacts.json', JSON.stringify(contacts, null, 2), 'utf8');
      sendResponse(response, 200, { message: 'Contact added successfully' });
    } catch (error) {
      sendResponse(response, 500, { error: 'Internal Server Error' });
    }
  });
}

//                                               read contacts from the JSON file
function readContactsSync() {
  try {
    const data = fs.readFileSync('contacts.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Send HTTP response with JSON data
function sendResponse(response, statusCode, data) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(data));
}

// Create HTTP server
const server = http.createServer((request, response) => {
  if (request.method === 'GET' && request.url === '/contacts') {
    readContacts(response);
  } else if (request.method === 'POST' && request.url === '/contacts') {
    addContact(request, response);
  } else {
    sendResponse(response, 404, { error: 'Not Found' });
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
