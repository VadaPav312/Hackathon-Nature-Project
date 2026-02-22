// --- CONFIGURATION ---
const API_URL = "/api/chat";

// --- DATA STREAMS ---
const co2Data = { 
    labels: ['2019', '2020', '2021', '2022', '2023', '2024'], 
    data: [411.4, 414.2, 416.4, 418.5, 421.0, 424.0] 
};
const tempData = { 
    labels: ['1880', '1920', '1960', '2000', '2020', '2023'], 
    data: [-0.16, -0.27, 0.03, 0.39, 0.98, 1.18] 
};
const seaData = { 
    labels: ['1993', '2000', '2010', '2015', '2020', '2024'], 
    data: [0, 20.1, 52.4, 75.8, 94.3, 103.5] 
};

// --- CHART LOGIC ---
function initCharts() {
    const config = (label, data, color, type='line') => ({
        type: type,
        data: { 
            labels: label, 
            datasets: [{ 
                data: data, 
                borderColor: color, 
                backgroundColor: color + '22', 
                fill: true, 
                tension: 0.4,
                borderWidth: 3
            }] 
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { legend: { display: false } }, 
            scales: { 
                y: { grid: { color: '#222' }, ticks: { color: '#777' } }, 
                x: { grid: { color: '#222' }, ticks: { color: '#777' } } 
            } 
        }
    });

    new Chart(document.getElementById('co2Chart'), config(co2Data.labels, co2Data.data, '#3498db'));
    new Chart(document.getElementById('tempChart'), config(tempData.labels, tempData.data, '#3498db', 'bar'));
    new Chart(document.getElementById('seaChart'), config(seaData.labels, seaData.data, '#3498db'));

    refreshAnalysis();
}

// --- AI ANALYSIS LOGIC ---
async function refreshAnalysis() {
    const display = document.getElementById('ai-response-area');
    display.innerHTML = `<div class="loading-spinner"></div><p style="text-align: center; color: var(--accent-blue);">AI analyzing data streams...</p>`;

    const prompt = `Act as a climate scientist. Analyze the trend: CO2 at 424PPM, Sea Levels at +103mm, Temp Anomaly at 1.18C. 
    Explain the risk in 3 bullet points using <b> tags. 
    Conclude with a specific search query link for "Renewable Energy Solutions".`;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                messages: [
                    { role: "system", content: "You are an AI Climate Analyst." }, 
                    { role: "user", content: prompt }
                ]
            })
        });

        const result = await response.json();
        
        if (!result.choices) throw new Error("Sync Error");

        const content = result.choices[0].message.content;
        const actionLink = "https://www.google.com/search?q=Global+Climate+Solutions+Explorer";

        display.innerHTML = `
            <h2 style="color:var(--accent-blue); font-size:1rem; margin-top:0; text-transform:uppercase;">AI Climate Briefing</h2>
            <div style="font-size: 0.85rem; color: #ccc;">${content.replace(/\n/g, '<br>')}</div>
            <a href="${actionLink}" target="_blank" class="action-link">EXPLORE SOLUTIONS</a>
        `;
    } catch (e) {
        console.error("AI Briefing Error:", e);
        display.innerHTML = `<p style="color:var(--accent-blue);">Data Sync Offline. Make sure the server is running.</p>`;
    }
}

// --- INITIALIZATION ---
window.onload = initCharts;

// Event Listener for the button
document.getElementById('update-btn').addEventListener('click', refreshAnalysis);