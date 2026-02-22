// --- CONFIGURATION ---
const API = "/api/chat";

// --- CORE SCAN LOGIC ---
async function runScan(product) {
    const scanOverlay = document.getElementById('scan-overlay');
    const resultsContainer = document.getElementById('results-container');
    
    // UI Setup: Show Scanning Overlay
    scanOverlay.style.display = 'flex';
    resultsContainer.style.display = 'none';
    
    const systemLogic = `You are an environmental auditor.
    RULES:
    1. If input is nonsense or not a physical item, grade is "N/A" and data is "N/A".
    2. If input is natural, grade is "A+" with zero impact.
    3. Return JSON: {"grade":"Letter or N/A","water":"text","carbon":"text","labor":"text","resource":"text","summary":"text"}`;

    try {
        const res = await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                messages: [
                    {role: "system", content: systemLogic}, 
                    {role: "user", content: `Audit: "${product}"`}
                ]
            })
        });

        const raw = await res.json();
        
        if (!raw.choices) throw new Error("Sync Error");
        
        const data = JSON.parse(raw.choices[0].message.content);

        // Populate the UI with AI data
        const scoreEl = document.getElementById('eco-score');
        scoreEl.innerText = data.grade;
        
        // Font size adjustment for "N/A" or "A+"
        scoreEl.style.fontSize = data.grade.length > 1 ? "1.8rem" : "2.8rem";

        document.getElementById('water-data').innerText = data.water;
        document.getElementById('carbon-data').innerText = data.carbon;
        document.getElementById('labor-data').innerText = data.labor;
        document.getElementById('resource-data').innerText = data.resource;
        document.getElementById('ai-summary').innerText = data.summary;

        // Visual Reveal Sequence
        setTimeout(() => {
            scanOverlay.style.display = 'none';
            resultsContainer.style.display = 'block';
            document.querySelectorAll('.card').forEach((card, index) => { 
                setTimeout(() => card.classList.add('active'), index * 100); 
            });
        }, 1800);

    } catch (err) { 
        console.error("Scan Error:", err);
        scanOverlay.style.display = 'none'; 
        alert("Audit failed. Ensure your server is running."); 
    }
}

// --- UI UTILITIES ---
function resetUI() {
    document.getElementById('results-container').style.display = 'none';
    document.getElementById('product-input').value = '';
    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
}

// --- EVENT LISTENERS ---
document.getElementById('product-input').addEventListener('keypress', (e) => {
    if (e.key === "Enter") { 
        const val = e.target.value; 
        if(val) runScan(val); 
    }
});

document.getElementById('reset-button').addEventListener('click', resetUI);
document.getElementById('product-input').addEventListener('keypress', (e) => {
    if (e.key === "Enter") { 
        const val = e.target.value; 
        if(val) runScan(val); 
    }
});