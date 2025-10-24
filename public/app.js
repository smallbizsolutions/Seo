const API_URL = window.location.origin;

const form = document.getElementById('auditForm');
const loadingState = document.getElementById('loadingState');
const resultsSection = document.getElementById('resultsSection');
const submitBtn = document.getElementById('submitBtn');
const upgradeBtn = document.getElementById('upgradeBtn');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        businessName: document.getElementById('businessName').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        email: document.getElementById('email').value
    };

    // Show loading
    form.style.display = 'none';
    loadingState.style.display = 'block';
    resultsSection.style.display = 'none';

    try {
        const response = await fetch(`${API_URL}/api/audit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            displayResults(result.data);
        } else {
            alert('Error: ' + result.error);
            form.style.display = 'block';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to perform audit. Please try again.');
        form.style.display = 'block';
    } finally {
        loadingState.style.display = 'none';
    }
});

function displayResults(data) {
    const scoreNumber = document.getElementById('scoreNumber');
    const scoreLabel = document.getElementById('scoreLabel');
    const scoreCircle = document.getElementById('scoreCircle');
    const findingsList = document.getElementById('findingsList');

    // Animate score
    let currentScore = 0;
    const targetScore = data.overallScore;
    const increment = targetScore / 50;
    
    const scoreInterval = setInterval(() => {
        currentScore += increment;
        if (currentScore >= targetScore) {
            currentScore = targetScore;
            clearInterval(scoreInterval);
        }
        scoreNumber.textContent = Math.round(currentScore);
    }, 20);

    // Set score color and label
    let scoreClass, labelText;
    if (targetScore >= 70) {
        scoreClass = 'score-good';
        labelText = 'Good - Room for improvement';
    } else if (targetScore >= 40) {
        scoreClass = 'score-average';
        labelText = 'Needs Work - Missing opportunities';
    } else {
        scoreClass = 'score-poor';
        labelText = 'Critical - Losing customers daily';
    }

    scoreCircle.className = `score-circle ${scoreClass}`;
    scoreLabel.className = `score-label ${scoreClass}`;
    scoreLabel.textContent = labelText;

    // Display findings
    findingsList.innerHTML = '';
    data.findings.forEach(finding => {
        const findingEl = document.createElement('div');
        findingEl.className = `finding-item ${finding.severity}`;
        findingEl.innerHTML = `
            <div class="finding-title">
                ${getSeverityIcon(finding.severity)} ${finding.title}
            </div>
            <div class="finding-description">${finding.description}</div>
        `;
        findingsList.appendChild(findingEl);
    });

    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function getSeverityIcon(severity) {
    switch(severity) {
        case 'critical': return '🔴';
        case 'warning': return '🟡';
        case 'good': return '🟢';
        default: return '⚪';
    }
}

upgradeBtn.addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const businessName = document.getElementById('businessName').value;

    if (!email) {
        alert('Please enter your email address to continue.');
        document.getElementById('email').focus();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/create-checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, businessName })
        });

        const { url } = await response.json();
        window.location.href = url;
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to start checkout. Please try again.');
    }
});
