 document.addEventListener('DOMContentLoaded', function(){
      const modal = document.getElementById('notificationModal');
      const modalClose = document.getElementById('modalClose');
      const saveNotification = document.getElementById('saveNotification');

      function openModal() {
          modal.classList.add('show'); /* modal.style.display = 'block'; */
      }

      function closeModal() {
          modal.classList.remove('show'); /* .style.display = 'none'; */
          document.getElementById('notificationForm').reset();
      }

      modalClose.addEventListener('click', closeModal);

      document.querySelectorAll('.create-notification-btn').forEach(function(button){
          button.addEventListener('click', function(){
              const offerId = this.dataset.offerId;
              const offerType = this.dataset.offerType; // 'rental'
              document.getElementById('offer_id').value = offerId;
              document.getElementById('offer_type').value = offerType;
              openModal();
          });
      });

      saveNotification.addEventListener('click', function(){
          const offerId = document.getElementById('offer_id').value;
          const offerType = document.getElementById('offer_type').value;
          const comment = document.getElementById('comment').value;
          const overwriteSum = document.getElementById('overwrite_sum').value;

          const data = {
              offer_id: offerId,
              offer_type: offerType,
              comment: comment,
              overwrite_sum: overwriteSum !== "" ? parseFloat(overwriteSum) : null,
              overwrite_amount: null  // Для аренды не передаём значение
          };

          fetch('/notification/create', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
          })
          .then(response => response.json())
          .then(data => {
              if(data.message) {
                  const btn = document.querySelector(`.create-notification-btn[data-offer-id="${offerId}"]`);
                  if(btn){
                      const span = document.createElement('span');
                      span.textContent = 'Пропозицію надіслано';
                      btn.parentNode.replaceChild(span, btn);
                  }
                  closeModal();
              }
          })
          .catch(error => {
              console.error('Ошибка:', error);
          });
      });
    });