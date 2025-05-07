document.addEventListener('DOMContentLoaded', function() {
  const rolesModal = document.getElementById('rolesModal');
  const openRolesModal = document.getElementById('openRolesModal');
  const closeRolesModal = document.getElementById('closeRolesModal');
  const saveRoles = document.getElementById('saveRoles');
  const saleAmount = document.getElementById('saleAmount');
  const purchaseAmount = document.getElementById('purchaseAmount');
  const rentalAmount = document.getElementById('rentalAmount');


  function openModal() {
     fetch('/notifications/get_amount', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => response.json())
      .then(data => {
        if(data.notifications_count) {
          saleAmount.innerText = data.notifications_count[1];
          purchaseAmount.innerText = data.notifications_count[0];
          rentalAmount.innerText = data.notifications_count[2];
        }
      });
    rolesModal.style.display = 'flex';
  }

  function closeModal() {
    rolesModal.style.display = 'none';
  }

  openRolesModal.addEventListener('click', openModal);
  closeRolesModal.addEventListener('click', closeModal);

  saveRoles.addEventListener('click', function(){
    // Получаем выбранное значение радио-кнопок
    const selectedRoleInput = document.querySelector('input[name="role"]:checked');
    if (!selectedRoleInput) {
      alert('Будь ласка, оберіть роль.');
      return;
    }
    const selectedRole = selectedRoleInput.value;

    const data = { role: selectedRole, url: window.location.pathname };


    fetch('/role_change', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      if(data.redirect) {
        window.location.href = data.redirect;
      } else {
        location.reload();
      }
    })
    .catch(error => {
      console.error('Помилка:', error);
    });
  });

  // Закрытие окна при клике вне его области
  window.addEventListener('click', function(event) {
    if(event.target === rolesModal) {
      closeModal();
    }
  });
});
