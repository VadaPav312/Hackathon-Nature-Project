// --- CONFIGURATION ---
const API_URL = "/api/chat";

// --- MAP INITIALIZATION ---
const map = L.map('map', { minZoom: 2, zoomControl: false }).setView([20, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
const markerLayer = L.layerGroup().addTo(map);

// --- CORE FUNCTIONS ---

async function refreshConservationData() {
    const responseArea = document.getElementById('response-area');
    const reloadBtn = document.getElementById('reload-btn');
    
    // UI Loading State
    reloadBtn.disabled = true;
    reloadBtn.innerText = "Consulting AI...";
    responseArea.innerHTML = `<div class="loading-spinner"></div><p style="text-align: center; color: var(--accent-green);">Syncing with global databases...</p>`;

    const randomSeed = Math.floor(Math.random() * 1000);
    
    const systemPrompt = `You are a conservation biologist. Respond ONLY with JSON. 
    Identify 20 DIFFERENT global hotspots (10 Animal, 10 Habitat).
    For the "link" field, generate a specific Google Search URL for that species or place.
    Format: {"hotspots": [{"name": "", "lat": 0, "lon": 0, "desc": "", "sol": "", "link": "", "type": "Animal/Habitat"}]}`;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Generate 20 unique priority markers. Seed: ${randomSeed}` }
                ]
            })
        });

        const result = await response.json();
        
        if (!result.choices) throw new Error("Sync Error");
        
        const data = JSON.parse(result.choices[0].message.content).hotspots;
        plotMarkers(data);
        
        responseArea.innerHTML = `
            <h3 style="color:var(--accent-green); font-size:1rem; margin-top:0;">Global Priority List</h3>
            <p style="font-size:0.85rem; color: #ddd;">Successfully mapped 20 critical points. Red markers (Animals) and Green markers (Habitats) are active.</p>
        `;
    } catch (error) {
        console.error("Conservation Sync Error:", error);
        responseArea.innerHTML = `<p style="color:var(--accent-red);">Error syncing data. Check server status.</p>`;
    } finally {
        reloadBtn.disabled = false;
        reloadBtn.innerText = "🔄 Sync New Priority Data";
    }
}

function plotMarkers(locations) {
    markerLayer.clearLayers();
    locations.forEach(loc => {
        const markerColor = loc.type === 'Animal' ? '#ff4d4d' : '#00ff88';
        
        const marker = L.circleMarker([loc.lat, loc.lon], {
            color: markerColor, 
            fillColor: markerColor, 
            fillOpacity: 0.7, 
            radius: 9, 
            weight: 2
        }).addTo(markerLayer);

        marker.on('click', () => {
            showDetail(loc);
            map.flyTo([loc.lat, loc.lon], 6, { duration: 1.5 });
        });
    });
}

function showDetail(data) {
    const responseArea = document.getElementById('response-area');
    const colorVar = data.type === 'Animal' ? '#ff4d4d' : '#00ff88';

    responseArea.innerHTML = `
        <h2 style="color: ${colorVar}; margin-top: 0; font-size: 1.1rem; text-transform: uppercase;">${data.name}</h2>
        <div style="margin-bottom: 15px;">
            <span class="text-label" style="color: #ff4d4d;">Threat</span>
            <p style="font-size: 0.9rem; color: #eee;">${data.desc}</p>
        </div>
        <div style="margin-bottom: 15px;">
            <span class="text-label" style="color: #00ff88;">Strategy</span>
            <p style="font-size: 0.9rem; color: #eee;">${data.sol}</p>
        </div>
        <a href="${data.link}" target="_blank" 
           style="border: 1px solid ${colorVar}; color: ${colorVar}; padding: 12px; border-radius: 8px; text-decoration: none; display: block; text-align: center; font-size: 0.7rem; font-weight: bold; transition: 0.3s;">
           ACCESS LIVE DATA
        </a>
    `;
}

// --- INITIALIZATION & EVENTS ---

// Run on page load
window.addEventListener('DOMContentLoaded', refreshConservationData);

// Button click listener
document.getElementById('reload-btn').addEventListener('click', refreshConservationData);