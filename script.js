// Initialize Cart from LocalStorage
let cart = JSON.parse(localStorage.getItem('bouqetCart')) || [];
updateCartUI();

// 1. Add to Cart Function
function addToCart() {
    // Get Data
    let buketSelect = document.getElementById("buket");
    let hargaBuket = parseInt(buketSelect.value);
    let namaBuket = buketSelect.options[buketSelect.selectedIndex].text;

    let kertas = document.getElementById("kertas").value;
    let warnaBunga = document.getElementById("warnaBunga").value;

    let aksesorisTotal = 0;
    let aksesorisList = [];
    let checkboxes = document.querySelectorAll('.aksesoris:checked');
    checkboxes.forEach((checkbox) => {
        aksesorisTotal += parseInt(checkbox.value);
        aksesorisList.push(checkbox.getAttribute('data-name'));
    });

    let jumlah = parseInt(document.getElementById("jumlah").value);
    let catatan = document.getElementById("catatan").value;

    let hargaSatuan = hargaBuket + aksesorisTotal;
    let totalHarga = hargaSatuan * jumlah;

    let item = {
        id: Date.now(), // Unique ID
        namaBuket: namaBuket,
        kertas: kertas,
        warnaBunga: warnaBunga,
        aksesoris: aksesorisList,
        catatan: catatan,
        jumlah: jumlah,
        totalHarga: totalHarga
    };

    cart.push(item);
    saveCart();
    alert("Berhasil masuk ke troli! 🛒");

    // Optional: Reset form or keep it
}

// 2. Save & Load Cart
function saveCart() {
    localStorage.setItem('bouqetCart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    document.getElementById('cart-count').innerText = cart.length;
}

// 3. Show Cart Modal
function toggleCart() {
    let modal = document.getElementById("cartModal");
    if (modal.style.display === "block") {
        modal.style.display = "none";
    } else {
        renderCartItems();
        modal.style.display = "block";
    }
}

// 4. Render Cart Items
function renderCartItems() {
    let container = document.getElementById("cartItems");
    let totalSpan = document.getElementById("cartTotal");
    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = "<p>Keranjang kosong. Yuk pesan sesuatu!</p>";
        totalSpan.innerText = "0";
        return;
    }

    let grandTotal = 0;
    cart.forEach((item, index) => {
        grandTotal += item.totalHarga;
        let aksesorisText = item.aksesoris.length > 0 ? item.aksesoris.join(", ") : "-";

        let div = document.createElement("div");
        div.style.borderBottom = "1px solid #eee";
        div.style.padding = "10px 0";
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between;">
                <strong>${item.namaBuket} (${item.jumlah}x)</strong>
                <span style="color:red; cursor:pointer;" onclick="removeItem(${index})">Hapus</span>
            </div>
            <small>Wrapping: ${item.kertas}, Bunga: ${item.warnaBunga}</small><br>
            <small>Aksesoris: ${aksesorisText}</small><br>
            <small>Catatan: ${item.catatan || "-"}</small>
            <div style="text-align:right; font-weight:bold; color:#4169e1;">Rp${item.totalHarga.toLocaleString()}</div>
        `;
        container.appendChild(div);
    });

    totalSpan.innerText = grandTotal.toLocaleString();
}

// 5. Remove Item
function removeItem(index) {
    cart.splice(index, 1);
    saveCart();
    renderCartItems();
}

// 6. Checkout Logic (Moves to Biodata Step)
// Global variable to know if we are checking out from cart or direct single buy
let isCartCheckout = false;

function checkoutCart() {
    if (cart.length === 0) {
        alert("Keranjang kosong!");
        return;
    }
    isCartCheckout = true;
    document.getElementById("cartModal").style.display = "none";
    showBiodata(); // Move to Step 2
}


// --- EXISTING FUNCTIONS (Modified) ---

// Modified Navigation
function showBiodata() {
    // If clicked "Beli Sekarang" directly, we treat it as a temporary single item cart for logic simplicity, 
    // OR we just set a flag.
    // Let's assume "Beli Sekarang" means ONLY the current form item.
    // "Checkout Cart" means ALL items in cart.

    // Note: The user might have clicked "Beli Sekarang" from the form.
    // We need to differentiate who called this.
    // Let's rely on the button click logic.
    // If the user clicked "Beli Sekarang", isCartCheckout should be false.
    // If coming from Cart Modal, isCartCheckout is true.

    // We need to reset isCartCheckout if called from "Beli Sekarang" button
    // But showBiodata is called by onclick attribute in HTML. 
    // Simple fix: "Beli Sekarang" button calls "buyNow()" instead of "showBiodata()"

    document.getElementById("step1").style.display = "none";
    document.getElementById("step2").style.display = "block";
    document.querySelector(".produk").style.display = "none";
    window.scrollTo(0, document.querySelector('.form-pesan').offsetTop);
}

// New wrapper for Direct Buy
function buyNow() { // This needs to be updated in HTML onclick
    isCartCheckout = false;
    showBiodata();
}

document.querySelector("button[onclick='showBiodata()']").onclick = buyNow; // Monkey patch or update HTML? 
// Better update the HTML in previous step, but I can't. 
// I will just handle logic in the final submit.

function backToProduct() {
    document.getElementById("step1").style.display = "block";
    document.getElementById("step2").style.display = "none";
    document.querySelector(".produk").style.display = "flex";
}

// Modified Submit Handler
document.getElementById("orderForm").addEventListener("submit", function (e) {
    e.preventDefault();

    let nama = document.getElementById("nama").value;
    let telepon = document.getElementById("telepon").value;
    let alamat = document.getElementById("alamat").value;

    let message = "";
    let grandTotal = 0;

    if (isCartCheckout) {
        // --- BULK ORDER FROM CART ---
        message = `Halo Kak, saya mau *checkout troli* dari web Bouqet Yntika.%0A%0A` +
            `*DATA PEMESAN*%0A` +
            `Nama: ${nama}%0A` +
            `No HP: ${telepon}%0A` +
            `Alamat: ${alamat}%0A%0A` +
            `*DAFTAR PESANAN:*%0A`;

        cart.forEach((item, i) => {
            let aksesorisText = item.aksesoris.length > 0 ? item.aksesoris.join(", ") : "-";
            message += `------------------------------%0A` +
                `${i + 1}. ${item.namaBuket} (${item.jumlah} pcs)%0A` +
                `   Wrapping: ${item.kertas}, Bunga: ${item.warnaBunga}%0A` +
                `   Aksesoris: ${aksesorisText}%0A` +
                `   Catatan: ${item.catatan || "-"}%0A` +
                `   Harga: Rp${item.totalHarga.toLocaleString()}%0A`;
            grandTotal += item.totalHarga;
        });

        // Clear Cart after success (optional, or wait for confirmation)
        localStorage.removeItem('bouqetCart');
        cart = []; // Reset RAM cart
        updateCartUI();

    } else {
        // --- SINGLE DIRECT ORDER ---
        let buketSelect = document.getElementById("buket");
        let hargaBuket = parseInt(buketSelect.value);
        let namaBuket = buketSelect.options[buketSelect.selectedIndex].text;
        let kertas = document.getElementById("kertas").value;
        let warnaBunga = document.getElementById("warnaBunga").value;

        let aksesorisTotal = 0;
        let aksesorisList = [];
        let checkboxes = document.querySelectorAll('.aksesoris:checked');
        checkboxes.forEach((checkbox) => {
            aksesorisTotal += parseInt(checkbox.value);
            aksesorisList.push(checkbox.getAttribute('data-name'));
        });
        let aksesorisText = aksesorisList.length > 0 ? aksesorisList.join(", ") : "-";

        let jumlah = parseInt(document.getElementById("jumlah").value);
        let catatan = document.getElementById("catatan").value;

        let hargaPerUnit = hargaBuket + aksesorisTotal;
        grandTotal = hargaPerUnit * jumlah;

        message = `Halo Kak, saya mau pesan buket dari web Bouqet Yntika.%0A%0A` +
            `*DATA PEMESAN*%0A` +
            `Nama: ${nama}%0A` +
            `No HP: ${telepon}%0A` +
            `Alamat: ${alamat}%0A%0A` +
            `*DETAIL PESANAN*%0A` +
            `Jenis: ${namaBuket}%0A` +
            `Wrapping: ${kertas}%0A` +
            `Nuansa Bunga: ${warnaBunga}%0A` +
            `Aksesoris: ${aksesorisText}%0A` +
            `Jumlah: ${jumlah} pcs%0A` +
            `Catatan: ${catatan || "-"}%0A`;
    }

    message += `------------------------------%0A` +
        `*TOTAL TAGIHAN: Rp${grandTotal.toLocaleString('id-ID')}*`;

    // Send to WhatsApp
    let adminWA = document.getElementById("adminWA").value;
    adminWA = adminWA.replace(/[^0-9]/g, '');
    if (adminWA.startsWith('0')) adminWA = '62' + adminWA.slice(1);

    document.getElementById("hasil").innerHTML = `<p style="color: green; font-weight: bold; text-align: center;">Mengarahkan ke WhatsApp...</p>`;
    window.open(`https://wa.me/${adminWA}?text=${message}`, '_blank');
});
