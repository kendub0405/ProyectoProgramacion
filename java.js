const carousel = document.querySelector('#carouselExampleSlidesOnly');
const heroSections = carousel.querySelectorAll('.hero-inner');

// Eventos del carrusel
carousel.addEventListener('slide.bs.carousel', () => {
  heroSections.forEach(section => {
    section.classList.remove('animate');
  });
});

carousel.addEventListener('slid.bs.carousel', () => {
  const activeSlide = carousel.querySelector('.carousel-item.active .hero-inner');
  if (activeSlide) {
    activeSlide.classList.add('animate');
  }
});

// Inicialización al cargar la página
window.addEventListener('DOMContentLoaded', () => {
  const firstSlide = carousel.querySelector('.carousel-item.active .hero-inner');
  if (firstSlide) {
    firstSlide.classList.add('animate');
  }
});

// Configuración de criptomonedas
const cryptos = ['bitcoin', 'ethereum', 'dogecoin', 'solana'];

async function fetchCryptoPrices() {
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${cryptos.join(',')}&order=market_cap_desc&per_page=4&page=1&sparkline=false`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al obtener datos de la API');
    const data = await res.json();

    const container = document.getElementById('crypto-container');
    container.innerHTML = '';

    data.forEach(crypto => {
      const price = crypto.current_price.toLocaleString('en-US', { 
        style: 'currency', 
        currency: 'USD' 
      });
      const change = crypto.price_change_percentage_24h ?? 0;
      const changeClass = change >= 0 ? 'change-positive' : 'change-negative';
      const changeFormatted = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';

      const col = document.createElement('div');
      col.className = 'col-12 col-sm-6 col-lg-3';

      col.innerHTML = `
        <article tabindex="0" aria-labelledby="${crypto.id}-title" class="card-crypto">
          <div class="crypto-logo" style="background-color: ${getColorById(crypto.id)};">
            <img src="${crypto.image}" alt="Ícono de ${crypto.name}" onerror="this.onerror=null;this.src='https://via.placeholder.com/24';" />
          </div>
          <div class="d-flex align-items-baseline mb-2">
            <h2 id="${crypto.id}-title" class="crypto-name mb-0">${crypto.name}</h2>
            <span class="crypto-symbol">${crypto.symbol}</span>
          </div>
          <div class="d-flex align-items-center">
            <div class="price" aria-label="Precio actual de ${crypto.name}">${price}</div>
            <div class="${changeClass}" aria-label="Cambio porcentual en 24 horas">${changeFormatted}</div>
          </div>
        </article>
      `;

      container.appendChild(col);
    });
  } catch (error) {
    console.error(error);
    document.getElementById('crypto-container').innerHTML = '<p class="text-danger">No se pudieron cargar los datos. Intenta nuevamente más tarde.</p>';
  }
}

function getColorById(id) {
  const colors = {
    'bitcoin': '#f7931a',
    'ethereum': '#3c3c3d',
    'dogecoin': '#c2aa4c',
    'solana': '#000000'
  };
  return colors[id] || '#666';
}

fetchCryptoPrices();

// Configuración de la tabla de precios
let sortDirection = [true, true, true, true, true]; // Estado de orden para cada columna

// Obtener y mostrar los datos
async function fetchCryptos() {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=12&page=1&sparkline=false'
    );
    if (!res.ok) throw new Error('No se pudo obtener datos');
    const data = await res.json();
    populateTable(data);
  } catch (error) {
    console.error(error);
    document.getElementById('crypto-body').innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-danger">Error al cargar los datos</td>
      </tr>
    `;
  }
}

// Llenar la tabla con los datos
function populateTable(cryptos) {
  const tbody = document.getElementById('crypto-body');
  tbody.innerHTML = '';

  cryptos.forEach(crypto => {
    const change = crypto.price_change_percentage_24h ?? 0;
    const changeClass = change >= 0 ? 'change-positive' : 'change-negative';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="d-flex align-items-center gap-2">
        <div class="crypto-logo">
          <img src="${crypto.image}" alt="${crypto.name}">
        </div>
        ${crypto.name}
      </td>
      <td>${crypto.current_price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
      <td class="${changeClass}">${change.toFixed(2)}%</td>
      <td>${crypto.total_volume.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
      <td>${crypto.market_cap.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
    `;
    tbody.appendChild(row);
  });
}

// Ordenar tabla al hacer clic en un encabezado
function sortTable(colIndex) {
  const table = document.getElementById('crypto-table');
  const tbody = table.tBodies[0];
  const rows = Array.from(tbody.rows);
  const isNumeric = colIndex !== 0;

  const direction = sortDirection[colIndex];
  sortDirection[colIndex] = !direction;

  rows.sort((a, b) => {
    const aText = a.cells[colIndex].innerText.replace(/[$,%]/g, '').replaceAll(',', '');
    const bText = b.cells[colIndex].innerText.replace(/[$,%]/g, '').replaceAll(',', '');

    const aVal = isNumeric ? parseFloat(aText) : aText.toLowerCase();
    const bVal = isNumeric ? parseFloat(bText) : bText.toLowerCase();

    return direction ? aVal - bVal : bVal - aVal;
  });

  rows.forEach(r => tbody.appendChild(r));
}

// Llamar función inicial
fetchCryptos();



