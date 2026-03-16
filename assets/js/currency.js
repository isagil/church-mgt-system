/**
 * PMCC - Currency Utility
 * Handles locale-based currency detection and formatting
 */

const localeToCurrency = {
    'en-US': 'USD',
    'en-GB': 'GBP',
    'en-NG': 'NGN',
    'en-GH': 'GHS',
    'en-ZA': 'ZAR',
    'en-KE': 'KES',
    'en-CA': 'CAD',
    'en-AU': 'AUD',
    'fr-FR': 'EUR',
    'de-DE': 'EUR',
    'it-IT': 'EUR',
    'es-ES': 'EUR',
    'ja-JP': 'JPY',
    'zh-CN': 'CNY',
    'ko-KR': 'KRW',
};

/**
 * Detects the user's currency based on their browser locale
 * @returns {string} Currency code (e.g., 'USD', 'NGN')
 */
export function getLocalCurrency() {
    return 'UGX';
}

/**
 * Formats a number as currency based on the user's locale
 * @param {number} amount The amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
    const currency = getLocalCurrency();
    const locale = navigator.language || 'en-US';
    
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    } catch (e) {
        console.error('Currency formatting error:', e);
        return `$${amount.toLocaleString()}`; // Fallback
    }
}

/**
 * Updates all elements with data-amount attribute to the local currency
 */
export function updateAllCurrencies() {
    const elements = document.querySelectorAll('[data-amount]');
    elements.forEach(el => {
        const amount = parseFloat(el.getAttribute('data-amount'));
        if (!isNaN(amount)) {
            el.textContent = formatCurrency(amount);
        }
    });

    // Update currency symbols in input groups
    const symbols = document.querySelectorAll('.currency-symbol');
    const currency = getLocalCurrency();
    const formatter = new Intl.NumberFormat(navigator.language || 'en-US', {
        style: 'currency',
        currency: currency
    });
    const parts = formatter.formatToParts(0);
    const symbol = parts.find(p => p.type === 'currency')?.value || '$';
    
    symbols.forEach(el => {
        el.textContent = symbol;
    });
}

/**
 * Gets the currency symbol for the current local currency
 * @returns {string} Currency symbol
 */
export function getCurrencySymbol() {
    const currency = getLocalCurrency();
    const formatter = new Intl.NumberFormat(navigator.language || 'en-US', {
        style: 'currency',
        currency: currency
    });
    const parts = formatter.formatToParts(0);
    return parts.find(p => p.type === 'currency')?.value || '$';
}
