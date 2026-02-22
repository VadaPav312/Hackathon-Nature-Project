// Configuration
const API_URL = "/api/chat"; 

// Initialize Map
const map = L.map('map', { minZoom: 2, zoomControl: false }).setView([20, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
const markerLayer = L.layerGroup().addTo(map);

async function runActionAnalysis() {
    const query = document.getElementById('user-input').value.trim();
    if (!query) return;

    const responseArea = document.getElementById('response-area');
    const searchBtn = document.getElementById('search-btn');

    // UI Feedback
    searchBtn.disabled = true;
    searchBtn.innerText = "LOCATING...";
    responseArea.innerHTML = `<div class="loading-spinner">SCANNING ${query.toUpperCase()}...</div>`;
    markerLayer.clearLayers();

    const systemPrompt = `Return JSON only. Identify 8 charities in ${query}. Provide "url" as a Google Search for that charity. Format: {"area_desc": "", "impact_summary": "", "map_center": [lat, lon], "projects": [{"name": "", "lat": 0, "lon": 0, "mission": "", "url": ""}]}`;

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
        
        if (!result.choices) throw new Error("Invalid Response");

        const content = JSON.parse(result.choices[0].message.content);
        
        // Update AI Panel
        responseArea.innerHTML = `
            <span class="section-title">REGION: ${query}</span>
            <p style="font-size: 0.95rem;">${content.area_desc}</p>
            <span class="section-title">VOLUNTEER IMPACT</span>
            <p style="font-size: 0.95rem;">${content.impact_summary}</p>
            <span class="section-title">ORGANIZATIONS</span>
        `;

        // Update Map Markers
        content.projects.forEach(org => {
            const marker = L.circleMarker([org.lat, org.lon], {
                color: '#9b59b6', fillColor: '#9b59b6', fillOpacity: 0.7, radius: 10, weight: 2
            }).addTo(markerLayer);

            marker.bindPopup(`
                <div style="font-family: 'Michroma', sans-serif; font-size: 10px; width: 220px; background: #121815; color: white;">
                    <b style="color:#9b59b6; font-size: 12px;">${org.name}</b><br><br>
                    ${org.mission}<br><br>
                    <a href="${org.url}" target="_blank" style="background:#9b59b6; color:#fff; padding:8px 10px; border-radius:4px; text-decoration:none; display:block; text-align:center;">SUPPORT LINK</a>
                </div>
            `);
        });

        map.flyTo(content.map_center, 9, { duration: 1.5 });
    } catch (error) {
        console.error("Analysis Error:", error);
        responseArea.innerHTML = `<p style="color:#9b59b6;">Sync Error. Ensure server is active.</p>`;
    } finally {
        searchBtn.disabled = false;
        searchBtn.innerText = "Find Action";
    }
}

// Event Listeners
document.getElementById('search-btn').addEventListener('click', runActionAnalysis);
// Support for "Enter" key
document.getElementById('user-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') runActionAnalysis();
});