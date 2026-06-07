// BMI Slider
let currentSlide = 0;
let totalSlides = 6;
let autoSlideInterval;

function initBMISlider() {
    const container = document.querySelector('.bmi-slider-container');
    const wrapper = document.querySelector('.bmi-slider-wrapper');
    const prevBtn = document.querySelector('.bmi-slider-prev');
    const nextBtn = document.querySelector('.bmi-slider-next');
    const dotsContainer = document.querySelector('.bmi-slider-dots');

    if (!wrapper || !container) {
        return;
    }

    // Get all slides
    const slides = document.querySelectorAll('.bmi-slide');
    totalSlides = slides.length;

    if (totalSlides === 0) return;

    // Set wrapper width to hold all slides
    const slideWidth = container.clientWidth;
    wrapper.style.width = `${slideWidth * totalSlides}px`;

    // Set each slide width
    slides.forEach(slide => {
        slide.style.width = `${slideWidth}px`;
    });

    // Create dots
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('div');
            dot.classList.add('bmi-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }

    function updateSlider() {
        const slideWidth = container.clientWidth;
        wrapper.style.transform = `translateX(-${currentSlide * slideWidth}px)`;

        // Update dots
        const dots = document.querySelectorAll('.bmi-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }

    function goToSlide(index) {
        currentSlide = Math.max(0, Math.min(index, totalSlides - 1));
        updateSlider();
        resetAutoSlide();
    }

    function nextSlide() {
        if (currentSlide < totalSlides - 1) {
            currentSlide++;
        } else {
            currentSlide = 0;
        }
        updateSlider();
        resetAutoSlide();
    }

    function prevSlide() {
        if (currentSlide > 0) {
            currentSlide--;
        } else {
            currentSlide = totalSlides - 1;
        }
        updateSlider();
        resetAutoSlide();
    }

    function resetAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
        }
        autoSlideInterval = setInterval(nextSlide, 5000);
    }

    // Add event listeners
    if (prevBtn) {
        prevBtn.removeEventListener('click', prevSlide);
        prevBtn.addEventListener('click', prevSlide);
    }
    if (nextBtn) {
        nextBtn.removeEventListener('click', nextSlide);
        nextBtn.addEventListener('click', nextSlide);
    }

    // Handle window resize
    let resizeTimer;
    window.removeEventListener('resize', () => {});
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const newSlideWidth = container.clientWidth;
            wrapper.style.width = `${newSlideWidth * totalSlides}px`;
            slides.forEach(slide => {
                slide.style.width = `${newSlideWidth}px`;
            });
            updateSlider();
        }, 100);
    });

    // Initial update
    setTimeout(() => {
        updateSlider();
    }, 100);

    resetAutoSlide();
}

// Quantity buttons
function initQuantityButtons() {
    const quantityGroups = document.querySelectorAll('.js-quantity');
    quantityGroups.forEach(group => {
        const minusBtn = group.querySelector('.minus');
        const plusBtn = group.querySelector('.plus');
        const input = group.querySelector('input');
        if (minusBtn && plusBtn && input) {
            // Remove old listeners
            const newMinus = minusBtn.cloneNode(true);
            const newPlus = plusBtn.cloneNode(true);
            minusBtn.parentNode.replaceChild(newMinus, minusBtn);
            plusBtn.parentNode.replaceChild(newPlus, plusBtn);

            newMinus.addEventListener('click', () => {
                let val = parseInt(input.value) || 0;
                if (val > (parseInt(input.min) || 0)) {
                    input.value = val - 1;
                }
            });
            newPlus.addEventListener('click', () => {
                let val = parseInt(input.value) || 0;
                input.value = val + 1;
            });
        }
    });
}

// Calculate BMI
function calculateBMI(heightCm, weightKg) {
    if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) return null;
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    return Math.round(bmi * 10) / 10;
}

// Get BMI Category
function getBMICategory(bmi) {
    if (bmi < 18.5) return 1;
    if (bmi >= 18.5 && bmi <= 24.9) return 2;
    if (bmi >= 25 && bmi <= 29.9) return 3;
    if (bmi >= 30 && bmi <= 34.9) return 4;
    if (bmi >= 35 && bmi <= 39.9) return 5;
    if (bmi >= 40) return 6;
    return 2;
}

// Calculate Ideal Weight
function calculateIdealWeight(heightCm) {
    const heightM = heightCm / 100;
    const ideal = 22 * (heightM * heightM);
    const min = 18.5 * (heightM * heightM);
    const max = 24.9 * (heightM * heightM);
    return {
        ideal: Math.round(ideal * 10) / 10,
        min: Math.round(min * 10) / 10,
        max: Math.round(max * 10) / 10
    };
}

// BMI Data
const objBmi = {
    1: {
        title: 'CÂN NẶNG THẤP',
        advise: 'Cơ thể thiếu cân bạn nên áp dụng các phương pháp ăn uống và luyện tập để tăng trọng lượng cơ thể nhé!'
    },
    2: {
        title: 'BÌNH THƯỜNG',
        advise: 'Chỉ số BMI của bạn ở mức bình thường, bạn hoàn toàn khỏe mạnh, hãy tiếp tục duy trì quá trình ăn uống và sinh hoạt như thường ngày nhé!'
    },
    3: {
        title: 'TIỀN BÉO PHÌ',
        advise: 'Chỉ số BMI của bạn đang ở mức cao, bạn cần áp dụng thực đơn ăn kiêng hợp lý cùng việc luyện tập khoa học để lấy lại vóc dáng chuẩn nhất nhé!'
    },
    4: {
        title: 'BÉO PHÌ CẤP ĐỘ I',
        advise: 'Bạn đang ở nhóm độ I, với tình trạng này kéo dài cơ thể bạn có thể gặp nhiều vấn đề về sức khỏe và cả sinh hoạt. Hãy thay đổi thực đơn ăn uống lành mạnh và tập thể dục khoa học nhé!'
    },
    5: {
        title: 'BÉO PHÌ ĐỘ II',
        advise: 'Bạn đang ở nhóm độ II, với tình trạng này kéo dài cơ thể bạn có thể gặp nhiều vấn đề về sức khỏe và cả sinh hoạt. Hãy thay đổi thực đơn ăn uống lành mạnh và tập thể dục khoa học nhé!'
    },
    6: {
        title: 'BÉO PHÌ ĐỘ III',
        advise: 'Bạn đang ở nhóm độ III, với tình trạng này kéo dài cơ thể bạn có thể gặp nhiều vấn đề về sức khỏe và cả sinh hoạt. Hãy thay đổi thực đơn ăn uống lành mạnh và tập thể dục khoa học nhé!'
    }
};

let invalidInput = "Bạn chưa nhập đủ thông tin!";

// Show Result Modal
function showResult(bmi, heightCm) {
    const category = getBMICategory(bmi);
    const bmiData = objBmi[category];
    const weights = calculateIdealWeight(heightCm);

    document.getElementById('bmi').innerHTML = bmi;
    document.getElementById('bmi-title').innerHTML = bmiData.title;
    document.getElementById('ideal').innerHTML = weights.ideal;
    document.getElementById('max').innerHTML = weights.max;
    document.getElementById('min').innerHTML = weights.min;
    document.getElementById('bmi-advise').innerHTML = bmiData.advise;

    const modal = document.getElementById('bmiModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

// Close Modal
function closeModal() {
    const modal = document.getElementById('bmiModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Init BMI Button
function initBMIButton() {
    const bmiBtn = document.querySelector('.js-bmi');
    if (bmiBtn) {
        // Remove old listener
        const newBtn = bmiBtn.cloneNode(true);
        bmiBtn.parentNode.replaceChild(newBtn, bmiBtn);

        newBtn.addEventListener('click', () => {
            const heightInput = document.querySelector('.js-bmi-height');
            const weightInput = document.querySelector('.js-bmi-weight');
            const height = parseFloat(heightInput?.value);
            const weight = parseFloat(weightInput?.value);

            if (!height || !weight || height <= 0 || weight <= 0) {
                alert(invalidInput);
                return;
            }

            const bmi = calculateBMI(height, weight);
            if (bmi !== null) {
                showResult(bmi, height);
            } else {
                alert(invalidInput);
            }
        });
    }
}

// Init Modal Close
function initModalClose() {
    const closeBtns = document.querySelectorAll('[data-bs-dismiss="modal"], .btn-close, .js-reset');
    closeBtns.forEach(btn => {
        btn.removeEventListener('click', closeModal);
        btn.addEventListener('click', closeModal);
    });

    const modal = document.getElementById('bmiModal');
    if (modal) {
        modal.removeEventListener('click', () => {});
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

// Reset Form
function initReset() {
    const resetBtn = document.querySelector('.js-reset');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            const heightInput = document.querySelector('.js-bmi-height');
            const weightInput = document.querySelector('.js-bmi-weight');
            if (heightInput) heightInput.value = '';
            if (weightInput) weightInput.value = '';
        });
    }
}

// Initialize all
function init() {
    initBMISlider();
    initQuantityButtons();
    initBMIButton();
    initModalClose();
    initReset();
}

// Run when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
