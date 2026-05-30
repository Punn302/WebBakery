/**
 * TDEE Calculator Module
 * Total Daily Energy Expenditure Calculator
 */

const TDEE = (function() {
    // Configuration
    const CONFIG = {
        CALORIES_PER_KG: 7700,
        MIN_CALORIES: 1200,
        MAX_CALORIES: 4000
    };

    // Activity rates
    const ACTIVITY_RATES = {
        1: { rate: 1.2, desc: 'Ít hoạt động (dân văn phòng, ít tập thể dục)' },
        2: { rate: 1.375, desc: 'Hoạt động nhẹ (tập 1-3 ngày/tuần)' },
        3: { rate: 1.55, desc: 'Hoạt động vừa (tập 3-5 ngày/tuần)' },
        4: { rate: 1.725, desc: 'Hoạt động cao (tập 6-7 ngày/tuần)' },
        5: { rate: 1.9, desc: 'Hoạt động rất cao (vận động viên, tập 2 lần/ngày)' }
    };

    // State
    let currentState = {
        age: null,
        height: null,
        weight: null,
        gender: 'male',
        activityRate: 1.2,
        goal: '1',
        speed: 0.1,
        targetWeight: null
    };

    // DOM Elements
    let elements = {};

    // Calculate BMR using Mifflin-St Jeor formula
    function calculateBMR(age, heightCm, weightKg, gender) {
        if (!age || !heightCm || !weightKg) return null;
        if (gender === 'male') {
            return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
        } else {
            return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
        }
    }

    // Calculate TDEE
    function calculateTDEE(bmr, activityRate) {
        return bmr * activityRate;
    }

    // Calculate goal calories
    function calculateGoalCalories(tdee, goal, speed) {
        let calories = tdee;
        let goalText = '';

        if (goal === '1') { // Giảm cân
            const deficit = speed * (CONFIG.CALORIES_PER_KG / 7);
            calories = Math.max(tdee - deficit, CONFIG.MIN_CALORIES);
            goalText = 'GIẢM CÂN';
        } else if (goal === '2') { // Tăng cân
            const surplus = speed * (CONFIG.CALORIES_PER_KG / 7);
            calories = Math.min(tdee + surplus, CONFIG.MAX_CALORIES);
            goalText = 'TĂNG CÂN';
        } else { // Duy trì
            goalText = 'DUY TRÌ';
        }

        return { calories: Math.round(calories), goalText };
    }

    // Calculate time to reach goal
    function calculateTimeToGoal(currentWeight, targetWeight, speed, goal) {
        if (!currentWeight || !targetWeight) return null;

        const diff = Math.abs(currentWeight - targetWeight);
        const weeksNeeded = Math.ceil(diff / speed);

        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + (weeksNeeded * 7));

        const day = targetDate.getDate();
        const month = targetDate.getMonth() + 1;
        const year = targetDate.getFullYear();

        return { weeks: weeksNeeded, date: `${day}/${month}/${year}` };
    }

    // Validate inputs
    function validateInputs() {
        if (!currentState.age || currentState.age < 15) {
            alert('Vui lòng nhập tuổi hợp lệ (trên 15 tuổi)');
            return false;
        }
        if (!currentState.height || currentState.height < 100 || currentState.height > 250) {
            alert('Vui lòng nhập chiều cao hợp lệ (100-250 cm)');
            return false;
        }
        if (!currentState.weight || currentState.weight < 30 || currentState.weight > 300) {
            alert('Vui lòng nhập cân nặng hợp lệ (30-300 kg)');
            return false;
        }

        if (currentState.targetWeight && (currentState.goal === '1' || currentState.goal === '2')) {
            if (currentState.goal === '1' && currentState.targetWeight >= currentState.weight) {
                alert('Cân nặng mục tiêu phải nhỏ hơn cân nặng hiện tại khi giảm cân!');
                return false;
            }
            if (currentState.goal === '2' && currentState.targetWeight <= currentState.weight) {
                alert('Cân nặng mục tiêu phải lớn hơn cân nặng hiện tại khi tăng cân!');
                return false;
            }
        }

        return true;
    }

    // Show result modal
    function showResult(bmr, tdee, goalCalories, goalText, timeResult, targetWeight) {
        // Update modal content
        if (elements.tdeeValue) elements.tdeeValue.innerHTML = Math.round(tdee);
        if (elements.bmrValue) elements.bmrValue.innerHTML = Math.round(bmr);
        if (elements.caloriesValue) elements.caloriesValue.innerHTML = goalCalories;

        // Update goal title
        if (elements.goalTitle) {
            elements.goalTitle.innerHTML = `LƯỢNG CALO CẦN THIẾT ĐỂ BẠN ${goalText} LÀ`;
        }

        // Show/hide and update time prediction
        const loseWeightDiv = document.querySelector('.lose-weight');
        if (timeResult && targetWeight && (currentState.goal === '1' || currentState.goal === '2')) {
            if (loseWeightDiv) loseWeightDiv.style.display = 'block';
            const goalType = currentState.goal === '1' ? 'giảm' : 'tăng';
            const titleTime = document.querySelector('.title-time');
            if (titleTime) {
                titleTime.innerHTML = `Dự tính thời gian bạn sẽ ${goalType} còn ${targetWeight}kg là vào ngày`;
            }
            if (elements.timeValue) elements.timeValue.innerHTML = timeResult.date;
            if (elements.timeWeeks) elements.timeWeeks.innerHTML = `(khoảng ${timeResult.weeks} tuần)`;
        } else {
            if (loseWeightDiv) loseWeightDiv.style.display = 'none';
        }

        // Show modal
        if (elements.modal) {
            elements.modal.style.display = 'flex';
            elements.modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    // Calculate and display results
    function calculateAndDisplay() {
        if (!validateInputs()) return;

        const bmr = calculateBMR(
            currentState.age,
            currentState.height,
            currentState.weight,
            currentState.gender
        );

        if (!bmr) {
            alert('Không thể tính BMR!');
            return;
        }

        const tdee = calculateTDEE(bmr, currentState.activityRate);
        const goalResult = calculateGoalCalories(tdee, currentState.goal, currentState.speed);

        let timeResult = null;
        if (currentState.targetWeight && (currentState.goal === '1' || currentState.goal === '2')) {
            timeResult = calculateTimeToGoal(
                currentState.weight,
                currentState.targetWeight,
                currentState.speed,
                currentState.goal
            );
        }

        showResult(
            bmr, tdee, goalResult.calories, goalResult.goalText,
            timeResult, currentState.targetWeight
        );
    }

    // ========== INIT GENDER BUTTONS ==========
    function initGenderButtons() {
        const genderBtns = document.querySelectorAll('.gender-btn');
        console.log('Gender buttons found:', genderBtns.length);

        genderBtns.forEach(btn => {
            // Remove old listeners
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', function() {
                // Remove active class from all gender buttons
                document.querySelectorAll('.gender-btn').forEach(b => {
                    b.classList.remove('active');
                });
                // Add active class to clicked button
                this.classList.add('active');
                // Update state
                const genderValue = this.getAttribute('data-gender');
                currentState.gender = genderValue;
                console.log('Gender changed to:', currentState.gender);
            });
        });
    }

    // Initialize quantity buttons (tăng/giảm)
    function initQuantityButtons() {
        const quantityGroups = document.querySelectorAll('.js-quantity');
        quantityGroups.forEach(group => {
            const minusBtn = group.querySelector('.minus');
            const plusBtn = group.querySelector('.plus');
            const input = group.querySelector('input');

            let field = null;
            if (input?.classList.contains('js-bmi-age')) field = 'age';
            else if (input?.classList.contains('js-bmi-height')) field = 'height';
            else if (input?.classList.contains('js-bmi-weight')) field = 'weight';

            if (minusBtn && plusBtn && input && field) {
                // Remove old listeners
                const newMinus = minusBtn.cloneNode(true);
                const newPlus = plusBtn.cloneNode(true);
                minusBtn.parentNode.replaceChild(newMinus, minusBtn);
                plusBtn.parentNode.replaceChild(newPlus, plusBtn);

                const updateValue = () => {
                    let val = parseInt(input.value) || 0;
                    currentState[field] = val;
                };

                newMinus.addEventListener('click', () => {
                    let val = parseInt(input.value) || 0;
                    if (val > (parseInt(input.min) || 0)) {
                        input.value = val - 1;
                        updateValue();
                    }
                });

                newPlus.addEventListener('click', () => {
                    let val = parseInt(input.value) || 0;
                    input.value = val + 1;
                    updateValue();
                });

                input.addEventListener('input', updateValue);
                updateValue();
            }
        });
    }

    // Initialize custom select
    function initCustomSelects() {
        const selects = document.querySelectorAll('.mew-select');
        selects.forEach(select => {
            const input = select.querySelector('input');
            const ul = select.querySelector('ul');
            const options = ul.querySelectorAll('li');

            // Remove old listeners
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);

            newInput.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = ul.style.display === 'block';
                document.querySelectorAll('.mew-select ul').forEach(item => item.style.display = 'none');
                ul.style.display = isOpen ? 'none' : 'block';
            });

            options.forEach(option => {
                const newOption = option.cloneNode(true);
                option.parentNode.replaceChild(newOption, option);

                newOption.addEventListener('click', () => {
                    const value = newOption.getAttribute('data-value');
                    const content = newOption.getAttribute('data-content') || newOption.innerText;

                    newInput.value = newOption.innerText;
                    newInput.setAttribute('data-value', value);

                    if (newInput.classList.contains('js-tdee-goal')) {
                        currentState.goal = value;
                    } else if (newInput.classList.contains('js-tdee-speed')) {
                        currentState.speed = parseFloat(value);
                    }

                    ul.style.display = 'none';
                });
            });
        });

        document.addEventListener('click', () => {
            document.querySelectorAll('.mew-select ul').forEach(ul => ul.style.display = 'none');
        });
    }

    // Initialize activity rate buttons
    function initActivityRateButtons() {
        const rateBtns = document.querySelectorAll('.rate-btn');
        rateBtns.forEach(btn => {
            // Remove old listeners
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', () => {
                document.querySelectorAll('.rate-btn').forEach(b => b.classList.remove('active'));
                newBtn.classList.add('active');
                const rateValue = parseFloat(newBtn.getAttribute('data-rate'));
                currentState.activityRate = rateValue;

                // Update description
                const rateDesc = document.querySelector('.rate-desc');
                if (rateDesc) {
                    const rateKey = newBtn.getAttribute('data-key');
                    rateDesc.innerHTML = ACTIVITY_RATES[rateKey]?.desc || '';
                }
            });
        });
    }

    // Initialize target weight input
    function initTargetWeight() {
        const targetInput = document.querySelector('.js-tdee-weight');
        if (targetInput) {
            const newInput = targetInput.cloneNode(true);
            targetInput.parentNode.replaceChild(newInput, targetInput);

            newInput.addEventListener('input', (e) => {
                currentState.targetWeight = parseFloat(e.target.value) || null;
            });
        }
    }

    // Initialize modal close
    function initModalClose() {
        const closeBtns = document.querySelectorAll('.js-modal-close, .js-reset, [data-bs-dismiss="modal"]');
        closeBtns.forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', () => {
                if (elements.modal) {
                    elements.modal.style.display = 'none';
                    elements.modal.classList.remove('show');
                    document.body.style.overflow = '';
                }
            });
        });

        if (elements.modal) {
            elements.modal.addEventListener('click', (e) => {
                if (e.target === elements.modal) {
                    elements.modal.style.display = 'none';
                    elements.modal.classList.remove('show');
                    document.body.style.overflow = '';
                }
            });
        }
    }

    // Reset form
    function initReset() {
        const resetBtn = document.querySelector('.js-reset');
        if (resetBtn) {
            const newBtn = resetBtn.cloneNode(true);
            resetBtn.parentNode.replaceChild(newBtn, resetBtn);

            newBtn.addEventListener('click', () => {
                currentState = {
                    age: null,
                    height: null,
                    weight: null,
                    gender: 'male',
                    activityRate: 1.2,
                    goal: '1',
                    speed: 0.1,
                    targetWeight: null
                };

                // Reset input fields
                const ageInput = document.querySelector('.js-bmi-age');
                const heightInput = document.querySelector('.js-bmi-height');
                const weightInput = document.querySelector('.js-bmi-weight');
                const targetInput = document.querySelector('.js-tdee-weight');
                const goalInput = document.querySelector('.js-tdee-goal');
                const speedInput = document.querySelector('.js-tdee-speed');

                if (ageInput) ageInput.value = '';
                if (heightInput) heightInput.value = '';
                if (weightInput) weightInput.value = '';
                if (targetInput) targetInput.value = '';
                if (goalInput) goalInput.value = 'Giảm mỡ';
                if (speedInput) speedInput.value = 'Chậm';

                // Reset gender buttons
                document.querySelectorAll('.gender-btn').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.getAttribute('data-gender') === 'male') {
                        btn.classList.add('active');
                    }
                });

                // Reset activity rate
                document.querySelectorAll('.rate-btn').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.getAttribute('data-rate') === '1.2') {
                        btn.classList.add('active');
                    }
                });

                // Close modal if open
                if (elements.modal) {
                    elements.modal.style.display = 'none';
                    elements.modal.classList.remove('show');
                    document.body.style.overflow = '';
                }
            });
        }
    }

    // Initialize calculate button
    function initCalculateButton() {
        const calcBtn = document.querySelector('.js-tdee');
        if (calcBtn) {
            const newBtn = calcBtn.cloneNode(true);
            calcBtn.parentNode.replaceChild(newBtn, calcBtn);
            newBtn.addEventListener('click', calculateAndDisplay);
        }
    }

    // Initialize all
    function init() {
        console.log('TDEE Calculator initializing...');

        // Cache DOM elements
        elements = {
            modal: document.getElementById('tdeeModal'),
            tdeeValue: document.getElementById('tdee'),
            bmrValue: document.getElementById('bmr'),
            caloriesValue: document.getElementById('calories'),
            goalTitle: document.querySelector('.js-goal-title'),
            timeValue: document.getElementById('time'),
            timeWeeks: document.getElementById('time2')
        };

        // Initialize components
        initGenderButtons();
        initQuantityButtons();
        initCustomSelects();
        initActivityRateButtons();
        initTargetWeight();
        initCalculateButton();
        initModalClose();
        initReset();

        console.log('TDEE Calculator initialized');
    }

    // Public API
    return {
        init: init
    };
})();

// Initialize when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TDEE.init());
} else {
    TDEE.init();
}