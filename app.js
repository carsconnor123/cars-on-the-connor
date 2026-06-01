// Paste your exact credentials from Supabase Dashboard -> Project Settings -> API
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co'; 
const SUPABASE_ANON_KEY = 'YOUR_LONG_ANON_PUBLIC_KEY';

// Initialize the database client connection
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// View Switching Tab Manager Engine
function switchTab(viewName) {
    const views = ['stock-view', 'about-view', 'contact-view', 'admin-view'];
    const tabs = { stock: 'tab-stock', about: 'tab-about', contact: 'tab-contact' };
    
    // Hide all view screens
    views.forEach(v => {
        const viewEl = document.getElementById(v);
        if (viewEl) viewEl.classList.add('hidden');
    });
    
    // Show chosen screen layout container
    const activeView = document.getElementById(`${viewName}-view`);
    if (activeView) activeView.classList.remove('hidden');
    
    // Switch active state tab coloring highlighting styles
    Object.keys(tabs).forEach(t => {
        const tabEl = document.getElementById(tabs[t]);
        if (!tabEl) return;
        
        if (t === viewName) {
            tabEl.classList.add('text-orange-500', 'font-bold');
            tabEl.classList.remove('text-neutral-400', 'font-medium');
        } else {
            tabEl.classList.remove('text-orange-500', 'font-bold');
            tabEl.classList.add('text-neutral-400', 'font-medium');
        }
    });
}

// Watch address bar changes for secret manager layout launch
window.addEventListener('hashchange', () => {
    if (window.location.hash === '#admin') {
        switchTab('admin');
    } else {
        switchTab('stock');
    }
});

// Download and render stock cards directly onto screen layout
async function fetchLiveStock() {
    const container = document.getElementById('stock-container');
    const countEl = document.getElementById('stock-count');
    
    if (!container) return;

    const { data: cars, error } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        container.innerHTML = `<div class="text-red-500 text-xs text-center py-6">Database error: ${error.message}</div>`;
        return;
    }

    if (countEl) countEl.innerText = `${cars.length} Units Active`;

    if (cars.length === 0) {
        container.innerHTML = `<div class="text-neutral-500 text-xs text-center py-12">No inventory listed on floor yet.</div>`;
        return;
    }

    // Map through array of vehicles and draw custom mobile UI design
    container.innerHTML = cars.map(car => `
        <div class="bg-[#141414] border border-neutral-800 rounded-2xl overflow-hidden shadow-xl relative">
            <div class="h-44 w-full bg-neutral-900 relative">
                <img src="${car.image_url}" alt="${car.title}" class="w-full h-full object-cover">
                <span class="absolute top-2 left-2 bg-black/80 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded border border-neutral-700">${car.year}</span>
                ${car.is_sold ? '<span class="absolute inset-0 bg-black/60 flex items-center justify-center text-red-500 font-black text-lg tracking-widest uppercase rotate-6">SOLD</span>' : ''}
            </div>
            <div class="p-3">
                <h3 class="text-sm font-black text-white truncate mb-1">${car.title}</h3>
                <div class="flex items-center gap-2.5 text-[11px] text-neutral-400 mb-3">
                    <span><i class="fa-solid fa-gauge-high text-orange-500 mr-1"></i>${Number(car.mileage).toLocaleString()} km</span>
                    <span>·</span>
                    <span>${car.color}</span>
                    <span>·</span>
                    <span>${car.transmission}</span>
                </div>
                <div class="flex justify-between items-center pt-2 border-t border-neutral-800/60">
                    <div class="flex flex-col">
                        <span class="text-[9px] text-neutral-500 uppercase font-bold">Price</span>
                        <span class="text-sm font-black text-white">R ${Number(car.price).toLocaleString()}</span>
                    </div>
                    <div>
                        ${window.location.hash === '#admin' ? `
                            <button onclick="deleteCar(${car.id})" class="bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white px-2.5 py-1.5 rounded-lg text-xs border border-red-500/30 transition-all"><i class="fa-solid fa-trash"></i> Delete</button>
                        ` : `
                            <a href="https://wa.me/27727780555?text=Hi%20Abdullah,%20I'm%20interested%20in%20the%20${encodeURIComponent(car.year + ' ' + car.title)}" target="_blank" class="orange-grad text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow">Enquire <i class="fa-solid fa-chevron-right text-[9px]"></i></a>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Upload Form Event Trigger Handler logic
const formEl = document.getElementById('vehicle-form');
if (formEl) {
    formEl.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const payload = {
            title: document.getElementById('car-title').value,
            year: parseInt(document.getElementById('car-year').value),
            mileage: parseInt(document.getElementById('car-mileage').value),
            color: document.getElementById('car-color').value,
            transmission: document.getElementById('car-trans').value,
            price: parseInt(document.getElementById('car-price').value),
            image_url: document.getElementById('car-image').value
        };

        const { error } = await supabase.from('cars').insert([payload]);

        if (error) {
            alert(`Error uploading file line data: ${error.message}`);
        } else {
            alert('Vehicle stock added onto live showroom floor successfully!');
            formEl.reset();
            fetchLiveStock();
            window.location.hash = ''; // Back to main view mode
        }
    });
}

// Global scope delete handler for admin system functionality
window.deleteCar = async function(id) {
    if (confirm('Are you entirely certain you want to wipe this car line row out of database storage completely?')) {
        const { error } = await supabase.from('cars').delete().eq('id', id);
        if (error) alert(error.message);
        else fetchLiveStock();
    }
}

// Kick off core data pull tracking components on application setup
if (window.location.hash === '#admin') {
    switchTab('admin');
} else {
    fetchLiveStock();
}
