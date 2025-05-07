document.addEventListener('DOMContentLoaded', function(){
            let currentNotificationId = null;
            const confirmModal = document.getElementById('confirmModal');
            const confirmCancelBtn = document.getElementById('confirmCancel');
            const cancelConfirmBtn = document.getElementById('cancelConfirm');

            // Открываем модальное окно при клике по кнопке "відмовитись"
            document.querySelectorAll('.reject-notif-btn').forEach(function(button) {
                button.addEventListener('click', function(){
                    currentNotificationId = this.dataset.notificationId;
                    confirmModal.style.display = 'flex';
                });
            });

            // Если нажато "Нет" – закрываем окно
            cancelConfirmBtn.addEventListener('click', function(){
                confirmModal.style.display = 'none';
                currentNotificationId = null;
            });

            // Если нажато "Да" – отправляем запрос для отмены уведомления
            confirmCancelBtn.addEventListener('click', function(){
                if (!currentNotificationId) return;
                fetch('/notification/cancel', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ notification_id: currentNotificationId })
                })
                .then(response => response.json())
                .then(data => {
                    if(data.message) {
                        // Удаляем уведомление из списка или обновляем страницу
                        const btn = document.querySelector(`.cancel-notification-btn[data-notification-id="${currentNotificationId}"]`);
                        if(btn) {
                            // Можно заменить кнопку или скрыть весь блок уведомления
                            btn.parentNode.style.opacity = '0.5';
                            btn.parentNode.querySelectorAll('button').forEach(b => b.disabled = true);
                        }
                    }
                    confirmModal.style.display = 'none';
                    currentNotificationId = null;
                })
                .catch(error => {
                    console.error('Ошибка:', error);
                    confirmModal.style.display = 'none';
                });
            });

            // Закрываем модальное окно при клике вне его области
            window.addEventListener('click', function(event) {
                if (event.target === confirmModal) {
                    confirmModal.style.display = 'none';
                    currentNotificationId = null;
                }
            });
        });