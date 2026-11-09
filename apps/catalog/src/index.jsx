// Async boundary: initialize the shared scope before consuming React.
import('./bootstrap').catch(error => { console.error(error); document.getElementById('root').textContent = 'Không khởi động được ứng dụng. Xem Console.'; });
