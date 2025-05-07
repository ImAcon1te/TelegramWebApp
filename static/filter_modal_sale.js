document.addEventListener('DOMContentLoaded', function() {
  const openBtn = document.getElementById('openFilterModal');
  const closeBtn = document.getElementById('closeFilterModal');
  const filterModal = document.getElementById('filterModal');
  const applyBtn = document.getElementById('applyFilters');
  const resetBtn = document.getElementById('resetFilters');

  function openModal() {
    filterModal.style.display = 'flex';
  }

  function closeModal() {
    filterModal.style.display = 'none';
  }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);

  window.addEventListener('click', function(e) {
    if (e.target === filterModal) {
      closeModal();
    }
  });

  applyBtn.addEventListener('click', function() {
    const priceMin = document.getElementById('priceMin').value;
    const priceMax = document.getElementById('priceMax').value;
    const fio = document.getElementById('fio').value;
    const cultureType = document.getElementById('cultureType').value;
    const region = document.getElementById('region').value; // region.id передаётся, если выбран

    if (priceMin && priceMax && Number(priceMin) > Number(priceMax)) {
      alert(' Мінімальна ціна не може бути більше максимальної ! ');
      return;
    }

    const params = new URLSearchParams();
    if (priceMin) {
      params.append('priceMin', priceMin);
    }
    if (priceMax) {
      params.append('priceMax', priceMax);
    }
    if (fio) {
      params.append('fio', fio);
    }
    if (cultureType) {
      params.append('cultureType', cultureType);
    }
    if (region) {
      params.append('region', region);
    }

    const newUrl = '/sale_offers_filtered?' + params.toString();

    window.location.href = newUrl;
  });

  resetBtn.addEventListener('click', function() {
    window.location.href = '/sale_offers';
  });
});
