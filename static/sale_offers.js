document.addEventListener('DOMContentLoaded', function(){
    const modal = document.getElementById('notificationModal');
    const modalClose = document.getElementById('modalClose');

    const saveNotification = document.getElementById('saveNotification');

    // Функция открытия модального окна
    function openModal() {
        modal.classList.add('show'); /* modal.style.display = 'block'; */
    }

    // Функция закрытия модального окна
    function closeModal() {
        modal.classList.remove('show'); /* .style.display = 'none'; */
        document.getElementById('notificationForm').reset();
    }

    // Назначаем обработчик на крестик и кнопку "Отмена"
    modalClose.addEventListener('click', closeModal);


    // Обработчик клика по кнопкам создания оповещения
    document.querySelectorAll('.create-notification-btn').forEach(function(button) {
        button.addEventListener('click', function() {
            const offerId = this.dataset.offerId;
            const offerType = this.dataset.offerType;
            document.getElementById('offer_id').value = offerId;
            document.getElementById('offer_type').value = offerType;
            openModal();
        });
    });

    // Обработчик на кнопку "Сохранить" в модальном окне
    saveNotification.addEventListener('click', function() {
        const offerId = document.getElementById('offer_id').value;
        const offerType = document.getElementById('offer_type').value;
        const comment = document.getElementById('comment').value;
        const overwriteSum = document.getElementById('overwrite_sum').value;
        const overwriteAmount = document.getElementById('overwrite_amount').value;

        const data = {
            offer_id: offerId,
            offer_type: offerType,
            comment: comment,
            overwrite_sum: overwriteSum !== "" ? parseFloat(overwriteSum) : null,
            overwrite_amount: overwriteAmount !== "" ? parseFloat(overwriteAmount) : null
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
                // Заменяем кнопку на текст "Оповещение создано"
                const btn = document.querySelector(`.create-notification-btn[data-offer-id="${offerId}"]`);
                if (btn) {
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

    // Дополнительно: закрытие модального окна при клике вне его
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
});
