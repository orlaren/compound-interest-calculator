document.getElementById("calc-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Stop form from reloading page

    // Get input values
    let principal = parseFloat(document.getElementById("principal").value);
    let rate = parseFloat(document.getElementById("rate").value) / 100;
    let years = parseFloat(document.getElementById("years").value);
    let frequency = parseInt(document.getElementById("frequency").value);
    let contrib = parseFloat(document.getElementById("contrib").value) || 0;
    let inflation = parseFloat(document.getElementById("inflation").value) / 100 || 0;

    // Validate inputs
    if (isNaN(principal) || isNaN(rate) || isNaN(years) || isNaN(frequency)) {
        alert("Please enter valid numbers.");
        return;
    }

    // Compound interest calculation
    let totalPeriods = frequency * years;
    let periodRate = rate / frequency;
    let futureValue = principal * Math.pow(1 + periodRate, totalPeriods);

    // Add contributions
    if (contrib > 0) {
        let contribFV = contrib * ((Math.pow(1 + periodRate, totalPeriods) - 1) / periodRate);
        futureValue += contribFV;
    }

    // Inflation adjustment
    let realValue = futureValue / Math.pow(1 + inflation, years);

    // Update results
    document.getElementById("ending-balance").innerText = `$${futureValue.toFixed(2)}`;
    document.getElementById("total-contrib").innerText = `$${(contrib * years * 12).toFixed(2)}`;
    document.getElementById("total-interest").innerText = `$${(futureValue - principal - contrib * years * 12).toFixed(2)}`;
    document.getElementById("real-balance").innerText = `$${realValue.toFixed(2)}`;
});
