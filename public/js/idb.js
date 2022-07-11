// Overall formatting of idb.js comes from University of Wisconsin Extended Campus Coding Bootcamp Module 18 lesson, "Pizza Hunt".
let db;

// create budget_tracker database if does not exist, else open database
const request = indexedDB.open('budget_tracker', 1);

// update database when needed
request.onupgradeneeded = function(event) {
    const db = event.target.result;

    // new object store for transactions
    db.createObjectStore('new_transaction', { autoIncrement: true });
}

// successful connection
request.onsuccess = function(event) {
    db = event.target.result;

    // send all local database data if app is online
    if (navigator.onLine) {
        uploadTransaction();
    }
}

// listen for errors
request.onerror = function(event) {
    // console log errors if they occur
    console.log(event.target.errorCode);
}

// save transaction
function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    const transactionObjectStore = transaction.objectStore('new_transaction');

    // add record to store 
    transactionObjectStore.add(record);
}

function uploadTransaction() {
    // open new transaction 
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    const transactionObjectStore = transaction.objectStore('new_transaction');

    // get all records from transaction object store
    const getAll = transactionObjectStore.getAll();

    // when connection is established
    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }

                    const transaction = db.transaction(['new_transaction'], 'readwrite');
                    const transactionObjectStore = transaction.objectStore('new_transaction');
                    // clear all itimes in transaction object store
                    transactionObjectStore.clear();

                    alert('All saved transactions have been submtitted');
                    // refresh the page
                    window.location.reload();
                })
                .catch(err => {
                    console.log(err);
                })
        }
    }
}

// listen for app to come online or back online
window.addEventListener('online', uploadTransaction);