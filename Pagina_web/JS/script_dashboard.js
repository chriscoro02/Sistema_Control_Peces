// Init
    document.addEventListener('DOMContentLoaded', function () {
      // Si manejas login por localStorage, descomenta estas líneas:
      // if (!localStorage.getItem('isLoggedIn')) {
      //   window.location.href = 'login.html'; return;
      // }

      const userEmail = localStorage.getItem('userEmail');
      if (userEmail) document.getElementById('userName').textContent = userEmail;

      const now = new Date();
      document.getElementById('currentDate').textContent = now.toLocaleDateString('es-ES', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    });

    function showDashboard(evt) {
      document.getElementById('dashboard-content').classList.add('active');
      document.getElementById('pageTitle').textContent = 'Dashboard';

      // Menú activo
      document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
      if (evt) evt.currentTarget.classList.add('active');

      // Cerrar sidebar en móvil
      if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('open');
    }

    function toggleSidebar() {
      document.getElementById('sidebar').classList.toggle('open');
    }

    function logout() {
      if (confirm('¿Deseas cerrar sesión?')) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        window.location.href = 'login.html';
      }
    }

    // Cerrar sidebar tocando fuera (móvil)
    document.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        const menuBtn = document.querySelector('.mobile-menu-btn');
        if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
          sidebar.classList.remove('open');
        }
      }
    });