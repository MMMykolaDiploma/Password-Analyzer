document.addEventListener('DOMContentLoaded', function() {
    console.log('ZXCVBN доступна:', typeof zxcvbn === 'function');
    
    const passwordInput = document.getElementById('password');
    passwordInput.addEventListener('input', checkPasswordStrength);
});

function checkPasswordStrength() {
    const password = document.getElementById('password').value;
    const resultDiv = document.getElementById('result');
    const tipsDiv = document.getElementById('tips');
    const feedbackDiv = document.getElementById('feedback');

    if (!password) {
        resultDiv.style.display = 'none';
        tipsDiv.style.display = 'none';
        feedbackDiv.style.display = 'none';
        resetCriteriaIcons();
        return;
    }

    const zxcvbnResult = zxcvbn(password);
    console.log('Результат ZXCVBN:', zxcvbnResult);

    showCrackTime(zxcvbnResult.crack_times_seconds);

    const criteria = {
        length: password.length >= 12,
        digit: /\d/.test(password),
        uppercase: /[A-ZА-ЯЄІЇҐ]/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
        noSpaces: !/\s/.test(password)
    };

    updateCriteriaIcons(criteria);

    const strength = calculateStrength(zxcvbnResult.score, criteria);
    
    showResults(strength, criteria, password.length);
    showFeedback(zxcvbnResult.feedback);
}

function updateCriteriaIcons(criteria) {
    updateCriteriaIcon('length-icon', criteria.length);
    updateCriteriaIcon('digit-icon', criteria.digit);
    updateCriteriaIcon('uppercase-icon', criteria.uppercase);
    updateCriteriaIcon('special-icon', criteria.special);
    updateCriteriaIcon('space-icon', criteria.noSpaces);
}

function calculateStrength(score, criteria) {
    if (score >= 4 && Object.values(criteria).every(Boolean)) {
        return { text: 'Надійний', class: 'strong' };
    } else if (score >= 2) {
        return { text: 'Середній', class: 'medium' };
    }
    return { text: 'Слабкий', class: 'weak' };
}

function showResults(strength, criteria, length) {
    const resultDiv = document.getElementById('result');
    const tipsDiv = document.getElementById('tips');

    resultDiv.textContent = `Оцінка надійності: ${strength.text}`;
    resultDiv.className = `result ${strength.class}`;
    resultDiv.style.display = 'block';

    const tips = [];
    if (!criteria.length) tips.push(`Збільшіть довжину до 12+ символів (зараз ${length})`);
    if (!criteria.digit) tips.push("Додайте цифри (0-9)");
    if (!criteria.uppercase) tips.push("Додайте великі літери (A-Z, А-Я)");
    if (!criteria.special) tips.push("Додайте спецсимволи (!@#$%^&*)");
    if (!criteria.noSpaces) tips.push("Видаліть пробіли");

    if (tips.length > 0) {
        tipsDiv.innerHTML = '<strong>Поради:</strong><ul>' + tips.map(tip => `<li>${tip}</li>`).join('') + '</ul>';
        tipsDiv.style.display = 'block';
    } else {
        tipsDiv.style.display = 'none';
    }
}

function showFeedback(feedback) {
    const feedbackDiv = document.getElementById('feedback');
    let feedbackHTML = '';

    if (feedback.warning) {
        feedbackHTML += `<div class="feedback-warning">⚠️ ${feedback.warning}</div>`;
    }

    if (feedback.suggestions && feedback.suggestions.length > 0) {
        feedbackHTML += `<div class="feedback-suggestions"><strong>Рекомендації:</strong><ul>${
            feedback.suggestions.map(s => `<li>${s}</li>`).join('')
        }</ul></div>`;
    }

    if (feedbackHTML) {
        feedbackDiv.innerHTML = feedbackHTML;
        feedbackDiv.style.display = 'block';
    } else {
        feedbackDiv.style.display = 'none';
    }
}

function resetCriteriaIcons() {
    document.querySelectorAll('.criteria-icon').forEach(icon => {
        icon.textContent = '❌';
        icon.className = 'criteria-icon invalid';
    });
    document.getElementById('space-icon').textContent = '✅';
    document.getElementById('space-icon').className = 'criteria-icon valid';
}

function updateCriteriaIcon(elementId, isValid) {
    const icon = document.getElementById(elementId);
    icon.textContent = isValid ? '✅' : '❌';
    icon.className = isValid ? 'criteria-icon valid' : 'criteria-icon invalid';
}

function showCrackTime(crackTimesSeconds) {
    const crackTimeDiv = document.getElementById('crack-time');
    crackTimeDiv.innerHTML = '';
    crackTimeDiv.className = 'crack-time';
    
    if (!crackTimesSeconds) {
        crackTimeDiv.style.display = 'none';
        return;
    }

    const timeStrings = [];
    let maxTime = 0;
    let isDanger = false;

    for (const [scenario, seconds] of Object.entries(crackTimesSeconds)) {
        if (seconds > maxTime) maxTime = seconds;
        
        let timeStr;
        if (seconds < 1) {
            timeStr = 'менше секунди';
        } else if (seconds < 60) {
            timeStr = `${Math.round(seconds)} сек`;
        } else if (seconds < 3600) {
            timeStr = `${Math.round(seconds/60)} хв`;
        } else if (seconds < 86400) {
            timeStr = `${Math.round(seconds/3600)} год`;
        } else if (seconds < 2592000) {
            timeStr = `${Math.round(seconds/86400)} дн`;
        } else if (seconds < 31536000) {
            timeStr = `${Math.round(seconds/2592000)} міс`;
        } else {
            timeStr = `${Math.round(seconds/31536000)} років`;
        }

        timeStrings.push(`${scenario.replace(/_/g, ' ')}: ${timeStr}`);
    }

    if (maxTime < 60) {
        crackTimeDiv.classList.add('danger');
        isDanger = true;
    } else if (maxTime < 3600) {
        crackTimeDiv.classList.add('warning');
    }

    crackTimeDiv.innerHTML = `
        <strong>Приблизний час зламу:</strong><br>
        ${timeStrings.join('<br>')}
        ${isDanger ? '⚠️ Пароль може бути зламаний миттєво!' : ''}
    `;
    crackTimeDiv.style.display = 'block';
}

document.getElementById('generate-btn').addEventListener('click', function() {
  const password = generatePassword();
  document.getElementById('password').value = password;
  checkPasswordStrength();
});

function generatePassword() {
  const length = 12;
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  let password = [
    uppercase.charAt(Math.floor(Math.random() * uppercase.length)),
    lowercase.charAt(Math.floor(Math.random() * lowercase.length)),
    numbers.charAt(Math.floor(Math.random() * numbers.length)),
    symbols.charAt(Math.floor(Math.random() * symbols.length))
  ].join('');
  
  const allChars = uppercase + lowercase + numbers + symbols;
  while (password.length < length) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  return password.split('').sort(() => Math.random() - 0.5).join('');
}
