document.addEventListener('DOMContentLoaded', function(){
  // --- Удаление заявки ---
  let currentDeleteOfferId = null;
  let currentDeleteOfferType = null;
  const deleteModal = document.getElementById('deleteModal');
  const confirmDeleteBtn = document.getElementById('confirmDelete');
  const cancelDeleteBtn = document.getElementById('cancelDelete');

  document.querySelectorAll('.delete-offer-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      currentDeleteOfferId = this.dataset.offerId;
      currentDeleteOfferType = this.dataset.offerType;
      deleteModal.style.display = 'flex';
    });
  });

  cancelDeleteBtn.addEventListener('click', function(){
    deleteModal.style.display = 'none';
    currentDeleteOfferId = null;
    currentDeleteOfferType = null;
  });

  confirmDeleteBtn.addEventListener('click', function(){
    if(!currentDeleteOfferId || !currentDeleteOfferType) return;
    fetch('/my_offers/delete', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        offer_id: currentDeleteOfferId,
        offer_type: currentDeleteOfferType
      })
    })
    .then(response => response.json())
    .then(data => {
      if(data.message){
        // Перезагружаем страницу после успешного удаления
        location.reload();
      }
    })
    .catch(error => console.error('Error:', error));
  });

  // --- Редактирование заявки ---
  let currentEditOfferId = null;
  let currentEditOfferType = null;
  const editModal = document.getElementById('editModal');
  const closeEditModal = document.getElementById('closeEditModal');
  const saveEditBtn = document.getElementById('saveEdit');
  const editFieldsDiv = document.getElementById('editFields');

  document.querySelectorAll('.edit-offer-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      currentEditOfferId = this.dataset.offerId;
      currentEditOfferType = this.dataset.offerType;
      // Получаем данные заявки с сервера для заполнения формы
      fetch(`/my_offers/get_offer?offer_id=${currentEditOfferId}&offer_type=${currentEditOfferType}`)
      .then(response => response.json())
      .then(data => {
        if(data.offer){
          // Заполняем поля формы в зависимости от типа заявки
          editFieldsDiv.innerHTML = '';
          if(currentEditOfferType === 'sale' || currentEditOfferType === 'purchase'){
            editFieldsDiv.innerHTML += `
              <div>
                <label>Тип культури/товару:</label>
                <input type="text" id="edit_commodity_type" value="${data.offer.commodity_type}">
              </div>
              <div>
                <label>Кількість тон:</label>
                <input type="number" step="0.01" id="edit_tonnage" value="${data.offer.tonnage}">
              </div>
              <div>
                <label>Вартість за тонну:</label>
                <input type="number" step="0.01" id="edit_price_per_ton" value="${data.offer.price_per_ton}">
              </div>
              <!--<div>
                <label>Регион:</label>
                <input type="text" id="edit_region" value="${data.offer.region_name}">
              </div>-->
              <div>
                <label>Додатково:</label>
                <textarea id="edit_additional_info">${data.offer.additional_info || ''}</textarea>
              </div>
            `;
          } else if(currentEditOfferType === 'rental'){
            editFieldsDiv.innerHTML += `
              <div>
                <label>Об'єкт оренди:</label>
                <input type="text" id="edit_equipment_type" value="${data.offer.equipment_type}">
              </div>
              <div>
                <label>Вартість оренди:</label>
                <input type="number" step="0.01" id="edit_rental_price" value="${data.offer.rental_price}">
              </div>
              <div>
                <!-- <label>Одиниця часу:</label>
                <input type="text" id="edit_time_unit" value="${data.offer.time_unit.display()}"> -->
                
                <label for="edit_time_unit">Одиниця часу:</label>
                <select name="time_unit" id="edit_time_unit">
                    <option value="hour">година</option>
                    <option value="day">доба</option>
                    <option value="month">місяць</option>
                </select>
                
              </div>
              <div>
                <label>Додатково:</label>
                <textarea id="edit_additional_info">${data.offer.additional_info || ''}</textarea>
              </div>
            `;
          }
          editModal.style.display = 'flex';
        }
      })
      .catch(error => console.error('Error fetching offer data:', error));
    });
  });

  closeEditModal.addEventListener('click', function(){
    editModal.style.display = 'none';
    currentEditOfferId = null;
    currentEditOfferType = null;
    editFieldsDiv.innerHTML = '';
  });

  saveEditBtn.addEventListener('click', function(){
    let updatedData = {};
    if(currentEditOfferType === 'sale' || currentEditOfferType === 'purchase'){
      updatedData = {
        commodity_type: document.getElementById('edit_commodity_type').value,
        tonnage: parseFloat(document.getElementById('edit_tonnage').value),
        price_per_ton: parseFloat(document.getElementById('edit_price_per_ton').value),
        additional_info: document.getElementById('edit_additional_info').value
        // Обновление региона здесь упрощено (для выбора региона желательно использовать select)
      };
    } else if(currentEditOfferType === 'rental'){
      updatedData = {
        equipment_type: document.getElementById('edit_equipment_type').value,
        rental_price: parseFloat(document.getElementById('edit_rental_price').value),
        time_unit: document.getElementById('edit_time_unit').value,
        additional_info: document.getElementById('edit_additional_info').value
      };
    }

    updatedData.offer_id = currentEditOfferId;
    updatedData.offer_type = currentEditOfferType;

    fetch('/my_offers/edit', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(updatedData)
    })
    .then(response => response.json())
    .then(data => {
      if(data.message){
        location.reload();
      }
    })
    .catch(error => console.error('Error updating offer:', error));
  });

  // Закрываем модальные окна при клике вне их области
  window.addEventListener('click', function(event){
    if(event.target === deleteModal) {
      deleteModal.style.display = 'none';
    }
    if(event.target === editModal) {
      editModal.style.display = 'none';
    }
  });
});