document.getElementById('smsForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const senderId = document.getElementById('senderId').value;
    const entityId = document.getElementId('entityId').value;
    const templateId = document.getElementById('templateId').value;
    const message = document.getElementById('message').value;
    const fileInput = document.getElementById('fileInput').files[0];

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        const numbers = json.map(row => row['Number']); // Assuming 'Number' is the column name

        const batchSize = 100; // Define the batch size

        const sendBatch = (batch) => {
            const data = {
                route: "dlt_manual",
                requests: batch.map(number => ({
                    sender_id: senderId,
                    entity_id: entityId,
                    template_id: templateId,
                    message: message,
                    flash: 0,
                    numbers: number.trim()
                }))
            };

            return fetch('https://www.fast2sms.com/dev/custom', {
                method: 'POST',
                headers: {
                    'authorization': 'sUPuBE3r8MklndvIGSKmYZotJW0yqNe6fzTbQRXHxja1L54wp2giMQtEjGHYxa9eOdNZS5L1uh8B6scR',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .catch(error => {
                console.error('Error:', error);
            });
        };

        const batches = [];
        for (let i = 0; i < numbers.length; i += batchSize) {
            batches.push(numbers.slice(i, i + batchSize));
        }

        batches.reduce((promise, batch) => {
            return promise.then(() => sendBatch(batch));
        }, Promise.resolve()).then(() => {
            document.getElementById('response').innerText = 'All SMS sent successfully';
        });
    };

    if (fileInput) {
        reader.readAsArrayBuffer(fileInput);
    }
});

document.getElementById('checkBalance').addEventListener('click', function() {
    fetch('https://www.fast2sms.com/dev/wallet', {
        method: 'POST',
        headers: {
            'authorization': 'sUPuBE3r8MklndvIGSKmYZotJW0yqNe6fzTbQRXHxja1L54wp2giMQtEjGHYxa9eOdNZS5L1uh8B6scR'
        }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('balance').innerText = `Wallet Balance: ${data.wallet}`;
    })
    .catch(error => {
        document.getElementById('balance').innerText = 'Error fetching wallet balance';
        console.error('Error:', error);
    });
});
