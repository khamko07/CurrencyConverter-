
// API Configuration
const API_KEY = 'df7acea9402dd6dca059f0d9'; // Replace with your actual API key
const API_URL = 'https://v6.exchangerate-api.com/v6/';

// DOM Elements
const form = document.querySelector('.converter-form');
const amountInput = document.getElementById('amount');
const fromSelect = document.getElementById('from');
const toSelect = document.getElementById('to');
const swapBtn = document.querySelector('.swap-btn');
const resultText = document.getElementById('result-text');
const historyList = document.getElementById('history-list');
const themeToggle = document.querySelector('.theme-toggle');
const loader = document.querySelector('.loader');

// Create background particles
function createParticles() {
    const backgroundAnimation = document.querySelector('.background-animation');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.width = Math.random() * 5 + 'px';
        particle.style.height = particle.style.width;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = Math.random() * 15 + 5 + 's';
        particle.style.animationDelay = Math.random() * 5 + 's';
        backgroundAnimation.appendChild(particle);
    }
}

// Theme Toggle
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const icon = themeToggle.querySelector('i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
});

// Fetch available currencies
async function fetchCurrencies() {
    try {
        const response = await fetch(`${API_URL}${API_KEY}/codes`);
        const data = await response.json();
        return data.supported_codes;
    } catch (error) {
        console.error('Error fetching currencies:', error);
        showError('Failed to load currencies. Please try again later.');
        return [];
    }
}

// Populate currency dropdowns
async function populateCurrencyDropdowns() {
    const currencies = await fetchCurrencies();
    const options = currencies.map(([code, name]) => 
        `<option value="${code}">${code} - ${name}</option>`
    ).join('');

    fromSelect.innerHTML = options;
    toSelect.innerHTML = options;

    // Set default values
    fromSelect.value = 'USD';
    toSelect.value = 'EUR';
}

// Convert currency
async function convertCurrency(amount, from, to) {
    try {
        loader.style.display = 'block';
        const response = await fetch(`${API_URL}${API_KEY}/pair/${from}/${to}/${amount}`);
        const data = await response.json();
        
        if (data.result === 'success') {
            const result = data.conversion_result;
            const rate = data.conversion_rate;
            updateResult(amount, from, to, result, rate);
            addToHistory(amount, from, to, result);
        } else {
            throw new Error(data.error-type);
        }
    } catch (error) {
        console.error('Error converting currency:', error);
        showError('Failed to convert currency. Please try again later.');
    } finally {
        loader.style.display = 'none';
    }
}

// Update result display
function updateResult(amount, from, to, result, rate) {
    resultText.innerHTML = `
        <strong>${amount} ${from}</strong> = 
        <strong>${result.toFixed(2)} ${to}</strong>
        <br>
        <small>1 ${from} = ${rate} ${to}</small>
    `;
}

// Add conversion to history
function addToHistory(amount, from, to, result) {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
        ${amount} ${from} → ${result.toFixed(2)} ${to}
        <small>${new Date().toLocaleTimeString()}</small>
    `;
    historyList.insertBefore(historyItem, historyList.firstChild);

    // Limit history items
    if (historyList.children.length > 5) {
        historyList.removeChild(historyList.lastChild);
    }
}

// Show error message
function showError(message) {
    const error = document.createElement('div');
    error.className = 'error';
    error.textContent = message;
    form.appendChild(error);
    setTimeout(() => error.remove(), 3000);
}

// Event Listeners
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount <= 0) {
        showError('Please enter a valid amount');
        return;
    }
    convertCurrency(amount, fromSelect.value, toSelect.value);
});

swapBtn.addEventListener('click', () => {
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;
});

// Initialize
createParticles();
populateCurrencyDropdowns();
