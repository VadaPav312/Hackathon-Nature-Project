// --- CONFIGURATION ---
const API_URL = "/api/chat";

// --- INITIALIZE MAP ---
const map = L.map('map', { minZoom: 2, zoomControl: false }).setView([20, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
const markerLayer = L.layerGroup().addTo(map);

// --- ANALYSIS LOGIC ---
async function runInvasiveAnalysis() {
    console.log("DEBUG: Function 'runInvasiveAnalysis' has started.");
    const queryInput = document.getElementById('user-input');
    const query = queryInput.value.trim();
    if (!query) return;

    const responseArea = document.getElementById('response-area');
    const searchBtn = document.getElementById('search-btn');

    // UI State: Loading
    searchBtn.disabled = true;
    searchBtn.innerText = "MAPPING...";
    responseArea.innerHTML = `<div class="loading-spinner">SCANNING ${query.toUpperCase()}...</div>`;
    markerLayer.clearLayers();

    const systemPrompt = `Return JSON only. Identify 10 invasive species in ${query}. Provide "link" as a Google Search for management of that species. Format: {"brief_area_desc": "", "species_summary": "", "map_center": [lat, lon], "hotspots": [{"name": "", "lat": 0, "lon": 0, "threat": "", "solution": "", "link": ""}]}`;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: systemPrompt }, 
                    { role: "user", content: query }
                ]
            })
        });

        const result = await response.json();
        
        if (!result.choices) throw new Error("Sync Error");

        const content = JSON.parse(result.choices[0].message.content);
        
        // Populate Sidebar
        responseArea.innerHTML = `
            <span class="section-title">TARGET: ${query}</span>
            <p style="font-size: 0.9rem; color: #ddd;">${content.brief_area_desc}</p>
            <span class="section-title">THREAT SUMMARY</span>
            <p style="font-size: 0.9rem; color: #ddd;">${content.species_summary}</p>
            <span class="section-title">ACTIVE MARKERS</span>
        `;

        // Populate Map Markers
        content.hotspots.forEach(loc => {
            const marker = L.circleMarker([loc.lat, loc.lon], {
                color: '#ff4d4d', fillColor: '#ff4d4d', fillOpacity: 0.7, radius: 10, weight: 2
            }).addTo(markerLayer);

            marker.bindPopup(`
                <div style="font-family: 'Michroma', sans-serif; font-size: 10px; width: 220px; background: #121815; color: white;">
                    <b style="color:#ff4d4d; font-size: 12px;">${loc.name}</b><br><br>
                    <b>THREAT:</b> ${loc.threat}<br><br>
                    <a href="${loc.link}" target="_blank" style="color: #ff4d4d; text-decoration: none; border: 1px solid #ff4d4d; padding: 5px; display: block; text-align: center;">DATABASE LINK</a>
                </div>
            `);
        });

        // Dynamic Map Zoom
        map.flyTo(content.map_center, 6, { duration: 2 });

    } catch (error) {
        console.error("Invasive Map Error:", error);
        responseArea.innerHTML = `<p style="color:#ff4d4d;">Sync Error. Check server status.</p>`;
    } finally {
        searchBtn.disabled = false;
        searchBtn.innerText = "Run Analysis";
    }
}

// --- EVENT LISTENERS ---

document.getElementById('user-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        runInvasiveAnalysis();
    }
});