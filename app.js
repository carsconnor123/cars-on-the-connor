// Replace these with the exact configuration tokens from your Supabase Dashboard API Settings
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_LONG_ANON_PUBLIC_KEY';

const supabase = jsonFromSupabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Tab Views Display Controller
function switchTab(viewName) {
    const views = ['stock-view', 'about-view', 'contact-view', 'admin-view'];
    const tabs = { stock: 'tab-stock', about: 'tab-about', contact: 'tab-contact' };
    
    views.forEach(v => document.getElementById(v).classList.add('hidden'));
    document.getElementById(`${viewName}-view`).classList.remove('hidden');
    
    Object.keys(tabs).forEach(t => {
        const el = document.getElementById(tabs[t]);
        if(t === viewName) {
            el.classList.add('text-orange-500', 'font-bold');
            el.classList.remove('text-neutral-400', 'font-medium');
        } else {
            el.classList.remove('text-orange-500', 'font-bold');
            el.classList.add('text-neutral-400', 'font-medium');
        }
    });
}

// Router trigger for Secret Admin mode URL change hash checking
window.addEventListener('hashchange', () => {
    if(window.location.hash === '#admin') {
        switchTab('admin');
    } else {
        switchTab('stock');
    }
});

// Load and Render Stock Data directly from Supabase Cloud Database Sheet
async function fetchLiveStock() {
    const container = document.getElementById('stock-container');
    const countEl = document.getElementById('stock-count');
    
    const { data: cars, error } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        container.innerHTML = `<div class="text-red-500 text-xs text-center py-6">Database link error: ${error.message}</div>`;
        return;
    }

    countEl.innerText = `${cars.length} Units Available`;

    if(cars.length === 0) {
        container.innerHTML = `<div class="text-neutral-500 text-sm text-center py-12">Showroom floor is empty. Check back shortly!</div>`;
        return;
    }

    // Build responsive card layouts
    container.innerHTML = cars.map(car => `
        <div class="bg-[#141414] border border-neutral-800 rounded-2xl overflow-hidden shadow-xl relative">
            <div class="h-48 w-full bg-neutral-900 relative overflow-hidden">
                <img src="${car.image_url}" alt="${car.title}" class="w-full h-full object-cover">
                <span class="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur text-white text-[11px] font-bold px-2.5 py-1 rounded-md border border-neutral-800">${car.year} Model</span>
                ${car.is_sold ? '<span class="absolute inset-0 bg-black/70 flex items-center justify-center text-red-500 font-black text-xl tracking-widest uppercase rotate-12 border-4 border-red-500 m-8 rounded">SOLD</span>' : ''}
            </div>
            <div class="p-4">
                <h3 class="text-base font-extrabold text-white tracking-tight mb-1">${car.title}</h3>
                <div class="flex items-center gap-3 text-xs text-neutral-400 mb-4">
                    <span><i class="fa-solid fa-gauge-high text-orange-500/70 mr-1"></i>${Number(car.mileage).toLocaleString()} km</span>
                    <span><i class="fa-solid fa-circle text-neutral-600 mr-1 text-[8px]"></i>${car.color}</span>
                    <span><i class="fa-solid fa-gear text-red-500/70 mr-1"></i>${car.transmission}</span>
                </div>
                <div class="flex justify-between items-center pt-2 border-t border-neutral-800">
                    <div class="flex flex-col">
                        <span class="text-[10px] text-neutral-500 uppercase font-black tracking-wider">Price</span>
                        <span class="text-lg font-black text-white">R ${Number(car.price).toLocaleString()}</span>
                    </div>
                    <div class="flex gap-1.5">
                        ${window.location.hash === '#admin' ? `
                            <button onclick="deleteCar(${car.id})" class="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-3 py-2 rounded-lg text-xs border border-red-500/20"><i class="fa-solid fa-trash"></i></button>
                        ` : `
                            <a href="https://wa.me/27727780555?text=Hi%20Abdullah,%20I'm%20interested%20in%20the%20${encodeURIComponent(car.year + ' ' + car.title)}" class="orange-grad text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-orange-900/40 flex items-center gap-1.5">Enquire <i class="fa-solid fa-chevron-right text-[10px]"></i></a>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Admin Form Submission: Writing data securely to the Cloud Sheet
document.getElementById('vehicle-form').addEventListener('submit', async (e) => {
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
        alert(`Failed to upload vehicle: ${error.message}`);
    } else {
        alert('Vehicle successfully deployed onto the showroom floor live!');
        document.getElementById('vehicle-form').reset();
        fetchLiveStock();
        window.location.hash = ''; // Return to view mode
    }
});

// Admin Functionality: Instant row removal from the lot array
window.deleteCar = async function(id) {
    if(confirm('Are you absolutely sure you want to delete this vehicle from the live inventory database?')) {
        const { error } = await supabase.from('cars').delete().eq('id', id);
        if(error) alert(error.message);
        else fetchLiveStock();
    }
}

// Initial Boot Trigger Execution Sequence
if(window.location.hash === '#admin') switchTab('admin');
fetchLiveStock();
