document.addEventListener('DOMContentLoaded', function(){
            let currentNotificationId = null;
            const confirmModal = document.getElementById('confirmModal');
            const confirmCancelBtn = document.getElementById('confirmCancel');
            const cancelConfirmBtn = document.getElementById('cancelConfirm');

            document.querySelectorAll('.reject-notif-btn').forEach(function(button) {
                button.addEventListener('click', function(){
                    currentNotificationId = this.dataset.notificationId;
                    confirmModal.style.display = 'flex';
                });
            });

            cancelConfirmBtn.addEventListener('click', function(){
                confirmModal.style.display = 'none';
                currentNotificationId = null;
            });

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
                        const btn = document.querySelector(`.reject-notif-btn[data-notification-id="${currentNotificationId}"]`);
                        if(btn) {
                            btn.parentNode.style.opacity = '0.9';
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

            window.addEventListener('click', function(event) {
                if (event.target === confirmModal) {
                    confirmModal.style.display = 'none';
                    currentNotificationId = null;
                }
            });
        });