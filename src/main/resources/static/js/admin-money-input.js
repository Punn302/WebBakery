document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-money-target]').forEach((displayInput) => {
        const form = displayInput.closest('form');
        const targetName = displayInput.dataset.moneyTarget;
        const hiddenInput = form?.querySelector(`input[type="hidden"][name="${targetName}"]`);
        if (!hiddenInput) return;

        function formatValue(value) {
            const rawValue = String(value || '').replace(/[^\d]/g, '');
            return {
                rawValue,
                formattedValue: rawValue ? Number(rawValue).toLocaleString('vi-VN') : ''
            };
        }

        function syncFromDisplay() {
            const value = formatValue(displayInput.value);
            hiddenInput.value = value.rawValue;
            displayInput.value = value.formattedValue;
        }

        const initialValue = displayInput.dataset.initial || hiddenInput.value;
        if (initialValue) {
            const value = formatValue(initialValue);
            hiddenInput.value = value.rawValue;
            displayInput.value = value.formattedValue;
        }

        displayInput.addEventListener('input', syncFromDisplay);
        displayInput.addEventListener('blur', syncFromDisplay);
        form?.addEventListener('submit', syncFromDisplay);
    });
});
