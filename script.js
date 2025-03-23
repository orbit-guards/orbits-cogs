// Tab Switching
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        item.classList.add('active');
        document.getElementById(item.dataset.tab).classList.add('active');
    });
});

// Collapsible Forms
document.querySelectorAll('.collapsible-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const content = btn.nextElementSibling;
        content.classList.toggle('active');
    });
});

// Settings Popup
const settingsModal = document.getElementById('settings-modal');
document.querySelector('.settings-btn').addEventListener('click', () => {
    settingsModal.style.display = 'block';
    document.getElementById('settings-orbit-price').value = settings.orbitPrice;
    document.getElementById('settings-box-cost').value = settings.boxCost;
    document.getElementById('settings-shipping-rate').value = settings.shippingRate;
    document.getElementById('settings-pigment-percent').value = settings.pigmentPercent;
    document.getElementById('settings-orbit-size').value = settings.orbitSize;
    document.getElementById('settings-oz-per-cm').value = settings.ozPerCm;
    document.getElementById('settings-stand-cost').value = settings.standCost;
    document.getElementById('settings-pack-size').value = settings.packSize;
    document.getElementById('settings-manufacturing-tax-rate').value = settings.manufacturingTaxRate;
    document.getElementById('settings-customer-sales-tax-rate').value = settings.customerSalesTaxRate;
    document.getElementById('settings-business-income-tax-rate').value = settings.businessIncomeTaxRate;
    document.getElementById('settings-amazon-rate').value = settings.amazonRate;
    document.getElementById('settings-consignment-rate').value = settings.consignmentRate;
    document.getElementById('settings-fixed-costs').value = settings.fixedCosts;
    document.getElementById('settings-target-margin').value = settings.targetMargin;
    document.getElementById('settings-reserve-fund').value = settings.reserveFund;
});
document.querySelector('.close-btn').addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

// Settings
let settings = {
    orbitPrice: 0,
    boxCost: 0,
    shippingRate: 0,
    pigmentPercent: 2,
    orbitSize: 5,
    ozPerCm: 1,
    standCost: 0,
    packSize: 5,
    manufacturingTaxRate: 5.75,
    customerSalesTaxRate: 0,
    businessIncomeTaxRate: 21, // Example federal corporate tax rate in the US
    amazonRate: 15,
    consignmentRate: 10,
    fixedCosts: 0,
    targetMargin: 20,
    reserveFund: 10
};

let resins = [], pigments = [], calcSummary = { resinCost: 0, pigmentCost: 0, manufacturingCost: 0, sellingPrice: 0, profit: 0 };
let recentProfits = [];

function updateCalcSummary() {
    document.getElementById('calc-resin-cost').textContent = calcSummary.resinCost.toFixed(2);
    document.getElementById('calc-pigment-cost').textContent = calcSummary.pigmentCost.toFixed(2);
    document.getElementById('calc-manufacturing-cost').textContent = calcSummary.manufacturingCost.toFixed(2);
    document.getElementById('calc-selling-price').textContent = calcSummary.sellingPrice.toFixed(2);
    document.getElementById('calc-profit').textContent = calcSummary.profit.toFixed(2);
}

// Resin Form
document.getElementById('resin-gallons').addEventListener('input', (e) => {
    document.getElementById('resin-ounces').value = (e.target.value * 128).toFixed(2);
});

document.getElementById('resin-form').addEventListener('submit', e => {
    e.preventDefault();
    const gallons = parseFloat(document.getElementById('resin-gallons').value) || 0;
    const ounces = parseFloat(document.getElementById('resin-ounces').value) || 0;
    const totalOunces = ounces || gallons * 128;
    const resin = {
        name: document.getElementById('resin-name').value,
        gallons: totalOunces / 128,
        ounces: totalOunces,
        cost: parseFloat(document.getElementById('resin-cost').value),
        shipping: parseFloat(document.getElementById('resin-shipping').value),
        taxes: parseFloat(document.getElementById('resin-taxes').value) || (settings.manufacturingTaxRate / 100 * document.getElementById('resin-cost').value),
        shippingDays: parseInt(document.getElementById('resin-shipping-days').value),
        source: document.getElementById('resin-source').value
    };

    resin.totalOrbits = Math.floor(resin.ounces / settings.orbitSize);
    resin.totalCost = resin.cost + resin.shipping + resin.taxes;
    resin.costPerOrbit = settings.orbitPrice;
    resin.costPerOunce = resin.totalCost / resin.ounces;
    resin.resinPerOrbitCost = resin.totalCost / (resin.totalOrbits || 1);

    resins.push(resin);
    updateResinTable();
    updateDropdowns();
    document.getElementById('resin-form').reset();
    showToast('Resin added successfully!');
});

function updateResinTable() {
    const tbody = document.querySelector('#resin-table tbody');
    tbody.innerHTML = '';
    resins.forEach((resin, index) => {
        const pricePerOrbitDisplay = settings.orbitPrice > 0 ? `$${settings.orbitPrice.toFixed(2)}` : '<span class="exclamation">! Set in Settings</span>';
        tbody.innerHTML += `
            <tr>
                <td>${resin.name}</td>
                <td>${resin.gallons.toFixed(2)}</td>
                <td>${resin.ounces.toFixed(2)}</td>
                <td>$${resin.cost.toFixed(2)}</td>
                <td>$${resin.shipping.toFixed(2)}</td>
                <td>$${resin.taxes.toFixed(2)}</td>
                <td>$${resin.totalCost.toFixed(2)}</td>
                <td>${pricePerOrbitDisplay}</td>
                <td>${resin.totalOrbits}</td>
                <td>$${resin.costPerOunce.toFixed(2)}</td>
                <td>$${resin.resinPerOrbitCost.toFixed(2)}</td>
                <td>${resin.shippingDays}</td>
                <td><a href="${resin.source}" target="_blank">Link</a></td>
                <td><button onclick="deleteResin(${index})">Delete</button></td>
            </tr>`;
    });
}

function deleteResin(index) { resins.splice(index, 1); updateResinTable(); updateDropdowns(); }

// Pigment Form
document.getElementById('pigment-form').addEventListener('submit', e => {
    e.preventDefault();
    const pigment = {
        name: document.getElementById('pigment-name').value,
        grams: parseFloat(document.getElementById('pigment-grams').value),
        cost: parseFloat(document.getElementById('pigment-cost').value),
        shipping: parseFloat(document.getElementById('pigment-shipping').value),
        taxes: parseFloat(document.getElementById('pigment-taxes').value) || (settings.manufacturingTaxRate / 100 * document.getElementById('pigment-cost').value),
        shippingDays: parseInt(document.getElementById('pigment-shipping-days').value),
        source: document.getElementById('pigment-source').value
    };

    pigment.gramsPerOrbit = (settings.orbitSize * settings.pigmentPercent / 100) * 28.35;
    pigment.totalOrbits = Math.floor(pigment.grams / pigment.gramsPerOrbit);
    pigment.costPerGram = pigment.cost / pigment.grams;
    pigment.pigmentPerOrbitCost = pigment.gramsPerOrbit * pigment.costPerGram;
    pigment.totalCost = pigment.cost + pigment.shipping + pigment.taxes;

    pigments.push(pigment);
    updatePigmentTable();
    updateDropdowns();
    document.getElementById('pigment-form').reset();
    showToast('Pigment added successfully!');
});

function updatePigmentTable() {
    const tbody = document.querySelector('#pigment-table tbody');
    tbody.innerHTML = '';
    pigments.forEach((pigment, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${pigment.name}</td>
                <td>${pigment.grams.toFixed(2)}</td>
                <td>$${pigment.cost.toFixed(2)}</td>
                <td>$${pigment.shipping.toFixed(2)}</td>
                <td>$${pigment.taxes.toFixed(2)}</td>
                <td>$${pigment.totalCost.toFixed(2)}</td>
                <td>${pigment.gramsPerOrbit.toFixed(2)}</td>
                <td>${pigment.totalOrbits}</td>
                <td>$${pigment.costPerGram.toFixed(2)}</td>
                <td>$${pigment.pigmentPerOrbitCost.toFixed(2)}</td>
                <td>${pigment.shippingDays}</td>
                <td><a href="${pigment.source}" target="_blank">Link</a></td>
                <td><button onclick="deletePigment(${index})">Delete</button></td>
            </tr>`;
    });
}

function deletePigment(index) { pigments.splice(index, 1); updatePigmentTable(); updateDropdowns(); }

// Dropdowns
function updateDropdowns() {
    const resinSelect = document.getElementById('cost-resin');
    const pigmentSelect = document.getElementById('cost-pigment');
    resinSelect.innerHTML = '<option value="">Select Resin</option>' + resins.map((r, i) => `<option value="${i}">${r.name}</option>`).join('');
    pigmentSelect.innerHTML = '<option value="">Select Pigment</option>' + pigments.map((p, i) => `<option value="${i}">${p.name}</option>`).join('');
}

// Cost Form
document.getElementById('cost-quantity').addEventListener('input', (e) => {
    document.getElementById('cost-packs').value = Math.ceil(e.target.value / settings.packSize);
});
document.getElementById('cost-packs').addEventListener('input', (e) => {
    document.getElementById('cost-quantity').value = e.target.value * settings.packSize;
});

document.getElementById('cost-form').addEventListener('submit', e => {
    e.preventDefault();
    const resin = resins[parseInt(document.getElementById('cost-resin').value)];
    const pigment = pigments[parseInt(document.getElementById('cost-pigment').value)];
    const customerType = document.getElementById('cost-customer').value;
    const customDiscount = parseFloat(document.getElementById('cost-custom-discount').value) || 0;
    const shippingPayer = document.getElementById('cost-shipping-payer').value;
    const includeStand = document.getElementById('cost-include-stand').checked;
    const orbitSizeCm = parseFloat(document.getElementById('cost-orbit-size').value);
    const quantity = parseInt(document.getElementById('cost-quantity').value);
    const packs = parseInt(document.getElementById('cost-packs').value);

    const adjustedOrbitSize = orbitSizeCm * settings.ozPerCm;
    const resinOunces = adjustedOrbitSize * quantity;
    const resinCostPerGallon = resin.totalCost / (resin.ounces / 128);
    const resinCost = (resinOunces / 128) * resinCostPerGallon;
    const pigmentGrams = (adjustedOrbitSize * settings.pigmentPercent / 100) * 28.35 * quantity;
    const pigmentCost = pigmentGrams * pigment.costPerGram;

    const boxCost = packs * settings.boxCost;
    const weight = (resinOunces + pigmentGrams / 28.35) / 16;
    const shippingCost = weight * settings.shippingRate;
    const standCost = includeStand && customerType === 'retail' ? quantity * settings.standCost : 0;

    const manufacturingCost = resinCost + pigmentCost + boxCost + (shippingPayer === 'manufacturer' ? shippingCost : 0) + standCost;
    const manufacturingTax = manufacturingCost * (settings.manufacturingTaxRate / 100);
    const totalCost = manufacturingCost + manufacturingTax;

    let discountPercent = customDiscount || 0;
    if (!customDiscount) {
        if (customerType === 'amazon') discountPercent = settings.amazonRate;
        else if (customerType === 'consignment') discountPercent = settings.consignmentRate;
        else if (customerType === 'bulk') discountPercent = Math.min(20, Math.max(5, quantity / 10));
    }

    const fullPrice = quantity * settings.orbitPrice;
    const sellingPrice = fullPrice * (1 - discountPercent / 100);
    const channelFees = (customerType === 'amazon' || customerType === 'consignment') ? sellingPrice * (discountPercent / 100) : 0;
    const revenue = sellingPrice - channelFees;
    const revenuePercent = (revenue / fullPrice) * 100;
    const customerSalesTax = sellingPrice * (settings.customerSalesTaxRate / 100);
    const totalCustomerPrice = sellingPrice + customerSalesTax;

    const profitBeforeTax = revenue - totalCost;
    const businessIncomeTax = profitBeforeTax * (settings.businessIncomeTaxRate / 100);
    const profitAfterTax = profitBeforeTax - businessIncomeTax;
    const grossMargin = (profitBeforeTax / revenue) * 100;
    const netMargin = (profitAfterTax / revenue) * 100;
    const breakEvenPerOrbit = totalCost / quantity;
    const breakEvenPerPack = totalCost / packs;
    const earningsPerOrbit = profitAfterTax / quantity;
    const reserveFund = profitAfterTax * (settings.reserveFund / 100);

    // Profitability Recommendations
    const targetNetProfit = totalCost / (1 - settings.targetMargin / 100) - totalCost;
    const recommendedPricePerOrbit = (totalCost + targetNetProfit) / quantity;
    const breakEvenUnits = settings.fixedCosts / (revenue / quantity - totalCost / quantity);

    calcSummary = { resinCost, pigmentCost, manufacturingCost: totalCost, sellingPrice, profit: profitAfterTax };
    updateCalcSummary();
    recentProfits.push(profitAfterTax);
    updateDashboard();

    const profitClass = profitAfterTax < 0 ? 'profit-negative' : profitAfterTax < totalCost * 0.1 ? 'profit-low' : 'profit-good';
    document.getElementById('cost-summary').innerHTML = `
        <div class="section">
            <h4>Order Details</h4>
            <div class="grid">
                <p><strong>Invoice ID:</strong> ${document.getElementById('cost-invoice').value}</p>
                <p><strong>Resin:</strong> ${resin.name}</p>
                <p><strong>Pigment:</strong> ${pigment.name}</p>
                <p><strong>Customer Type:</strong> ${customerType}</p>
                <p><strong>Orbit Size:</strong> ${adjustedOrbitSize.toFixed(2)} oz (${orbitSizeCm} cm)</p>
                <p><strong>Quantity:</strong> ${quantity} orbits (${packs} packs)</p>
            </div>
        </div>

        <div class="section">
            <h4>Costs</h4>
            <div class="grid">
                <p class="tooltip"><strong>Resin Cost:</strong> $${resinCost.toFixed(2)}<span class="breakdown">
                    Resin Ounces Needed: ${resinOunces.toFixed(2)} oz<br>
                    Cost per Gallon: $${resinCostPerGallon.toFixed(2)}<br>
                    Proportion Used: ${(resinOunces / 128).toFixed(2)} gallons<br>
                    Total Resin Cost: $${resinCost.toFixed(2)}
                </span></p>
                <p class="tooltip"><strong>Pigment Cost:</strong> $${pigmentCost.toFixed(2)}<span class="breakdown">
                    Pigment Grams Needed: ${pigmentGrams.toFixed(2)} g<br>
                    Cost per Gram: $${pigment.costPerGram.toFixed(2)}<br>
                    Total Pigment Cost: $${pigmentCost.toFixed(2)}
                </span></p>
                <p><strong>Box Cost:</strong> $${boxCost.toFixed(2)}</p>
                <p><strong>Shipping Cost:</strong> $${shippingCost.toFixed(2)}</p>
                <p><strong>Stand Cost:</strong> $${standCost.toFixed(2)}</p>
                <p><strong>Manufacturing Cost (Before Tax):</strong> $${manufacturingCost.toFixed(2)}</p>
                <p><strong>Manufacturing Tax (Business):</strong> $${manufacturingTax.toFixed(2)}</p>
                <p><strong>Total Cost:</strong> $${totalCost.toFixed(2)}</p>
                <p><strong>Cost per Orbit:</strong> $${(totalCost / quantity).toFixed(2)}</p>
            </div>
        </div>

        <div class="section">
            <h4>Revenue & Pricing</h4>
            <div class="grid">
                <p><strong>Full Price (Before Discount):</strong> $${fullPrice.toFixed(2)}</p>
                <p><strong>Discount Applied:</strong> ${discountPercent}%</p>
                <p><strong>Selling Price (After Discount):</strong> $${sellingPrice.toFixed(2)}</p>
                <p><strong>Channel Fees:</strong> $${channelFees.toFixed(2)}</p>
                <p><strong>Revenue (After Fees):</strong> $${revenue.toFixed(2)}</p>
                <p><strong>Revenue % of Full Price:</strong> ${revenuePercent.toFixed(2)}%</p>
                <p><strong>Customer Sales Tax:</strong> $${customerSalesTax.toFixed(2)}</p>
                <p><strong>Total Customer Price:</strong> $${totalCustomerPrice.toFixed(2)}</p>
            </div>
        </div>

        <div class="section">
            <h4>Profit & Margins</h4>
            <div class="grid">
                <p><strong>Profit Before Tax:</strong> $${profitBeforeTax.toFixed(2)}</p>
                <p><strong>Business Income Tax:</strong> $${businessIncomeTax.toFixed(2)}</p>
                <p class="${profitClass}"><strong>Profit After Tax:</strong> $${profitAfterTax.toFixed(2)}</p>
                <p><strong>Earnings per Orbit:</strong> $${earningsPerOrbit.toFixed(2)}</p>
                <p><strong>Gross Margin %:</strong> ${grossMargin.toFixed(2)}%</p>
                <p class="${profitClass}"><strong>Net Margin %:</strong> ${netMargin.toFixed(2)}%</p>
                <p><strong>Break-Even Price per Orbit:</strong> $${breakEvenPerOrbit.toFixed(2)}</p>
                <p><strong>Break-Even Price per Pack:</strong> $${breakEvenPerPack.toFixed(2)}</p>
            </div>
        </div>

        <div class="section">
            <h4>Financial Planning</h4>
            <div class="grid">
                <p><strong>Reserve Fund (${settings.reserveFund}%):</strong> $${reserveFund.toFixed(2)}</p>
                <p><strong>Recommended Price per Orbit (for ${settings.targetMargin}% Net Margin):</strong> $${recommendedPricePerOrbit.toFixed(2)}</p>
                <p><strong>Break-Even Units (to Cover Fixed Costs):</strong> ${Math.ceil(breakEvenUnits)} orbits</p>
            </div>
        </div>
    `;
    showToast('Cost calculated successfully!');
});

// Settings Form
document.getElementById('settings-form').addEventListener('submit', e => {
    e.preventDefault();
    settings = {
        orbitPrice: parseFloat(document.getElementById('settings-orbit-price').value),
        boxCost: parseFloat(document.getElementById('settings-box-cost').value),
        shippingRate: parseFloat(document.getElementById('settings-shipping-rate').value),
        pigmentPercent: parseFloat(document.getElementById('settings-pigment-percent').value),
        orbitSize: parseFloat(document.getElementById('settings-orbit-size').value),
        ozPerCm: parseFloat(document.getElementById('settings-oz-per-cm').value),
        standCost: parseFloat(document.getElementById('settings-stand-cost').value),
        packSize: parseInt(document.getElementById('settings-pack-size').value),
        manufacturingTaxRate: parseFloat(document.getElementById('settings-manufacturing-tax-rate').value),
        customerSalesTaxRate: parseFloat(document.getElementById('settings-customer-sales-tax-rate').value),
        businessIncomeTaxRate: parseFloat(document.getElementById('settings-business-income-tax-rate').value),
        amazonRate: parseFloat(document.getElementById('settings-amazon-rate').value),
        consignmentRate: parseFloat(document.getElementById('settings-consignment-rate').value),
        fixedCosts: parseFloat(document.getElementById('settings-fixed-costs').value),
        targetMargin: parseFloat(document.getElementById('settings-target-margin').value),
        reserveFund: parseFloat(document.getElementById('settings-reserve-fund').value)
    };
    settingsModal.style.display = 'none';
    updateResinTable();
    showToast('Settings saved!');
});

// Dashboard
function updateDashboard() {
    const totalResin = resins.reduce((sum, r) => sum + r.gallons, 0);
    const totalPigment = pigments.reduce((sum, p) => sum + p.grams, 0);
    const avgCost = (resins.reduce((sum, r) => sum + r.resinPerOrbitCost, 0) + pigments.reduce((sum, p) => sum + p.pigmentPerOrbitCost, 0)) / (resins.length + pigments.length || 1);
    const recentProfit = recentProfits.slice(-5).reduce((sum, p) => sum + p, 0) / (recentProfits.length || 1);
    document.getElementById('dash-resin-stock').textContent = totalResin.toFixed(2);
    document.getElementById('dash-pigment-stock').textContent = totalPigment.toFixed(2);
    document.getElementById('dash-avg-cost').textContent = avgCost.toFixed(2);
    document.getElementById('dash-recent-profit').textContent = recentProfit.toFixed(2);
}

// Toast Notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.background = '#28A745';
    toast.style.color = '#FFFFFF';
    toast.style.padding = '10px';
    toast.style.borderRadius = '5px';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Validation
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', (e) => {
        if (e.target.value < 0) {
            e.target.value = 0;
            showToast('Value cannot be negative!');
        }
    });
});