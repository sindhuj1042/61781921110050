const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5008;
const WINDOW_SIZE = 10;
let numbers = [];
let windowPrevState = [];
let windowCurrState = [];


app.use(cors());

const fetchNumbers = async (type) => {
    let url;
    switch (type) {
        case 'p':
            url = 'http://20.244.56.144/numbers/primes';
            break;
        case 'f':
            url = 'http://20.244.56.144/numbers/fibo';
            break;
        case 'e':
            url = 'http://20.244.56.144/numbers/even';
            break;
        case 'r':
            url = 'http://20.244.56.144/numbers/rand';
            break;
        default:
            url = '';
            break;
    }
    try {
        const response = await axios.get(url, { timeout: 500 }); 
        const responseData = response.data.numbers;
        console.log(`Received data for type '${type}':, responseData`);
        if (!Array.isArray(responseData)) {
            console.error(`Response data for type '${type}' is not an array:, responseData`);
            return [];
        }
        return responseData;
    } catch (error) {
        console.error(`Error fetching data for type '${type}':, error.message`);
        return [];
    }
};

const calculateAverage = () => {
    if (numbers.length === 0) {
        return 0;
    }
    const sum = numbers.reduce((acc, curr) => acc + curr, 0);
    return sum / numbers.length;
};

const updateNumbers = (newNumbers) => {
    newNumbers.forEach((newNumber) => {
        if (!numbers.includes(newNumber)) {
            if (numbers.length >= WINDOW_SIZE) {
                numbers.shift();
            }
            numbers.push(newNumber);
        }
    });
    windowPrevState = windowCurrState;
    windowCurrState = numbers.slice();
};

app.use(express.static(path.join(__dirname, 'kun', 'build')));

app.get('/numbers/:numberid', async (req, res) => {
    const { numberid } = req.params;
    if (!['p', 'f', 'e', 'r'].includes(numberid)) {
        return res.status(400).json({ error: 'Invalid numberid' });
    }

    const newNumbers = await fetchNumbers(numberid);
    updateNumbers(newNumbers);

    const avg = calculateAverage();
    const response = {
        windowPrevState,
        windowCurrState,
        numbers,
        avg,
    };
    res.json(response);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'kun', 'build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});