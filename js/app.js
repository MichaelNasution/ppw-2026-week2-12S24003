/**
 * Aplikasi Utama Portofolio Dinamis (Week 4 - Dynamic Client-Side Rendering)
 * Arsitektur: Decoupled Multi-Tier berbasis Data JSON, Universal Modal, REST Asinkron & localStorage
 */
const App = {
  state: {
    projects: [],
    services: [],
    profile: null,
    activeFilter: 'all',
    orders: []
  },

  /**
   * Mengamankan string dari potensi XSS dengan mengubah karakter berbahaya menjadi entity HTML
   * @param {string} str - String yang akan di-escape
   * @returns {string} - String aman untuk disisipkan ke innerHTML
   */
  escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  /**
   * Mengambil riwayat pesanan dari localStorage dengan penanganan error aman
   * @returns {Array} - Array pesanan yang tersimpan
   */
  getStoredOrders() {
    try {
      const raw = localStorage.getItem('orders');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('Gagal membaca data orders dari localStorage, fallback ke array kosong:', e);
      return [];
    }
  },

  /**
   * Menyimpan pesanan baru ke localStorage dan memperbarui state
   * @param {Object} orderData - Data pesanan yang akan disimpan
   */
  saveOrderToLocalStorage(orderData) {
    const orders = this.getStoredOrders();
    orders.push(orderData);
    try {
      localStorage.setItem('orders', JSON.stringify(orders));
    } catch (e) {
      console.error('Gagal menulis data orders ke localStorage:', e);
    }
    this.state.orders = orders;
    this.updateOrderBadge();
    return orders;
  },

  /**
   * Memperbarui angka pada badge pesanan di navbar
   */
  updateOrderBadge() {
    const badge = document.getElementById('orderBadge');
    if (badge) {
      badge.textContent = this.state.orders.length;
    }
  },

  /**
   * Menampilkan feedback Toast Bootstrap secara dinamis
   * @param {'success'|'danger'|'error'} type - Jenis notifikasi
   * @param {string} title - Judul notifikasi
   * @param {string} message - Pesan notifikasi
   */
  showToast(type, title, message) {
    const toastEl = document.getElementById('liveToast');
    const toastIcon = document.getElementById('toastIcon');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');

    if (!toastEl) return;

    if (type === 'success') {
      toastEl.className = 'toast align-items-center text-white bg-success border-0 shadow-lg rounded-4';
      if (toastIcon) toastIcon.className = 'bi bi-check-circle-fill fs-4 text-white';
    } else {
      // danger / error
      toastEl.className = 'toast align-items-center text-white bg-danger border-0 shadow-lg rounded-4';
      if (toastIcon) toastIcon.className = 'bi bi-exclamation-triangle-fill fs-4 text-white';
    }

    if (toastTitle) toastTitle.textContent = title;
    if (toastMessage) toastMessage.textContent = message;

    if (typeof bootstrap !== 'undefined') {
      const toastInstance = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 4500 });
      toastInstance.show();
    }
  },

  /**
   * Inisialisasi aplikasi saat dokumen siap
   */
  async init() {
    const urlParams = new URLSearchParams(window.location.search);

    // 1. Simulasi error memuat proyek via ?forceError=true
    if (urlParams.get('forceError') === 'true') {
      console.warn("Force Error mode aktif. Path fetch diarahkan ke berkas non-existent.");
      ApiService.getProjects = async () => {
        const response = await fetch('./data/berkas_simulasi_error.json');
        if (!response.ok) {
          throw new Error(`HTTP Error ${response.status} saat memuat data proyek.`);
        }
        return await response.json();
      };
    }

    // 2. Simulasi error pengiriman form via ?forceSubmitError=true
    if (urlParams.get('forceSubmitError') === 'true') {
      console.warn("Force Submit Error aktif. submitServiceOrder disimulasikan gagal.");
      ApiService.submitServiceOrder = async () => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Simulasi kegagalan transmisi jaringan (HTTP 500).")), 1000);
        });
      };
    }

    // 3. Baca data orders dari localStorage & update badge di navbar
    this.state.orders = this.getStoredOrders();
    this.updateOrderBadge();

    // 4. Inisialisasi listener event delegation & form submission
    this.initEventDelegation();
    this.initFormValidation();

    // 5. Muat data profil, proyek, dan layanan secara asinkron
    await Promise.all([
      this.loadProfile(),
      this.loadProjects(),
      this.loadServices()
    ]);
  },

  /**
   * Mengatur Event Delegation pada container dinamis
   */
  initEventDelegation() {
    // Event Delegation pada Container Grid Proyek (#projectGrid)
    const grid = document.getElementById('projectGrid');
    if (grid) {
      grid.addEventListener('click', (event) => {
        // Tangkap klik tombol "Lihat Detail"
        const detailBtn = event.target.closest('.btn-view-detail');
        if (detailBtn) {
          const projectId = detailBtn.getAttribute('data-id');
          if (projectId) {
            this.openProjectModal(projectId);
          }
          return;
        }

        // Tangkap klik tombol "Coba Lagi" pada Error State
        const retryBtn = event.target.closest('.btn-retry-projects');
        if (retryBtn) {
          this.loadProjects();
          return;
        }
      });
    }

    // Event Delegation pada Filter Kategori (#categoryFilters)
    const filtersContainer = document.getElementById('categoryFilters');
    if (filtersContainer) {
      filtersContainer.addEventListener('click', (event) => {
        const filterBtn = event.target.closest('.btn-filter-category');
        if (filterBtn) {
          const category = filterBtn.getAttribute('data-category');
          if (category) {
            this.filterProjects(category);
          }
        }
      });
    }
  },

  /**
   * Inisialisasi penanganan pengiriman formulir asinkron
   */
  initFormValidation() {
    const form = document.getElementById('consultationForm');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
      // 1. Cegah reload halaman secara default
      event.preventDefault();

      // Cek validasi Constraint HTML5
      if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add('was-validated');
        this.showToast('danger', 'Validasi Gagal', 'Harap isi semua kolom formulir yang wajib dengan benar.');
        return;
      }

      // 2. Ambil seluruh data form sebagai objek payload
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());

      // 3. Nonaktifkan tombol submit & tampilkan spinner loading
      const submitBtn = document.getElementById('btnSubmitOrder') || form.querySelector('button[type="submit"]');
      const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Mengirim...
        `;
      }

      try {
        // Panggil ApiService.submitServiceOrder(payload)
        const response = await ApiService.submitServiceOrder(payload);

        if (!response || !response.success) {
          throw new Error('Server mengembalikan respons tidak valid.');
        }

        // 5. Simpan payload ke localStorage dengan key "orders"
        this.saveOrderToLocalStorage({
          orderId: response.orderId || Date.now(),
          ...payload,
          submittedAt: new Date().toISOString()
        });

        // Tampilkan Toast Sukses
        this.showToast(
          'success',
          'Permintaan Berhasil Terkirim!',
          `Terima kasih, data Anda (ID: #${response.orderId}) telah dicatat ke riwayat pesanan.`
        );

        // Reset form & hapus state validasi
        form.reset();
        form.classList.remove('was-validated');

      } catch (error) {
        // 4. Tangani error pengiriman & tampilkan Toast Merah
        console.error('submitServiceOrder error:', error);
        this.showToast(
          'danger',
          'Gagal Mengirim Permintaan',
          error.message || 'Terjadi gangguan koneksi, silakan coba beberapa saat lagi.'
        );
      } finally {
        // Kembalikan tombol submit ke kondisi semula
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHTML;
        }
      }
    });
  },

  /**
   * Mengambil data proyek dari ApiService dan menampilkannya
   */
  async loadProjects() {
    const grid = document.getElementById('projectGrid');
    if (grid) {
      // Loading State (Spinner & Skeleton UI)
      grid.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="spinner-border text-accent mb-3" role="status">
            <span class="visually-hidden">Memuat data...</span>
          </div>
          <p class="text-body-secondary small mb-0">Memuat portofolio proyek dari data/projects.json...</p>
        </div>
      `;
    }

    try {
      this.state.projects = await ApiService.getProjects();
      this.renderCategoryFilters();
      this.renderProjects();
    } catch (error) {
      console.error('Error saat memuat proyek:', error);
      if (grid) {
        // Error State (Bootstrap Alert + Tombol Coba Lagi via Event Delegation)
        const safeError = this.escapeHTML(error.message);
        grid.innerHTML = `
          <div class="col-12">
            <div class="alert alert-danger d-flex align-items-center justify-content-between p-3 rounded-4 shadow-sm border-0" role="alert">
              <div class="d-flex align-items-center gap-3">
                <i class="bi bi-exclamation-triangle-fill fs-3 text-danger"></i>
                <div>
                  <h6 class="alert-heading fw-bold mb-1">Gagal Memuat Portofolio Proyek</h6>
                  <p class="small mb-0 text-danger-emphasis">${safeError}</p>
                </div>
              </div>
              <button type="button" class="btn btn-sm btn-outline-danger btn-retry-projects rounded-3 px-3">
                <i class="bi bi-arrow-clockwise me-1"></i> Coba Lagi
              </button>
            </div>
          </div>
        `;
      }
    }
  },

  /**
   * Menampilkan tombol filter kategori secara dinamis dari data proyek
   */
  renderCategoryFilters() {
    const filtersContainer = document.getElementById('categoryFilters');
    if (!filtersContainer) return;

    const categories = ['all', ...new Set(this.state.projects.map(p => p.category))];

    filtersContainer.innerHTML = categories.map(cat => {
      const isActive = this.state.activeFilter === cat;
      const label = cat === 'all' ? 'Semua Proyek' : cat;
      const btnClass = isActive ? 'btn-primary' : 'btn-outline-custom';
      return `
        <button type="button" class="btn btn-sm ${btnClass} rounded-pill px-3 py-1 btn-filter-category" data-category="${this.escapeHTML(cat)}">
          ${this.escapeHTML(label)}
        </button>
      `;
    }).join('');
  },

  /**
   * Mengubah filter kategori dan me-render ulang proyek langsung dari memori
   */
  filterProjects(category) {
    this.state.activeFilter = category;
    this.renderCategoryFilters();
    this.renderProjects();
  },

  /**
   * Render kartu proyek ke dalam #projectGrid berdasarkan activeFilter
   */
  renderProjects() {
    const grid = document.getElementById('projectGrid');
    if (!grid) return;

    let filtered = this.state.projects;
    if (this.state.activeFilter !== 'all') {
      filtered = this.state.projects.filter(p => p.category === this.state.activeFilter);
    }

    // Empty State jika filter tidak memiliki data
    if (filtered.length === 0) {
      const safeCat = this.escapeHTML(this.state.activeFilter);
      grid.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="bi bi-folder-x fs-1 text-muted mb-3 d-block"></i>
          <h5 class="fw-bold text-heading">Tidak Ada Proyek Ditemukan</h5>
          <p class="text-muted small">Tidak ada proyek pada kategori <strong>${safeCat}</strong>.</p>
        </div>
      `;
      return;
    }

    // Render daftar kartu proyek dengan template konsisten tema Rustic Charm
    grid.innerHTML = filtered.map((project, index) => {
      const safeId = this.escapeHTML(project.id);
      const safeTitle = this.escapeHTML(project.title);
      const safeDesc = this.escapeHTML(project.description);
      const safeCategory = this.escapeHTML(project.category);
      const safeThumbnail = this.escapeHTML(project.thumbnail || 'bi-laptop');
      const safeYear = this.escapeHTML(project.metrics?.year ?? '2025');
      const bannerClass = `project-banner-${(index % 4) + 1}`;

      const tagsHTML = (project.tags || []).map(tag => 
        `<span class="badge bg-secondary-subtle text-secondary-emphasis">${this.escapeHTML(tag)}</span>`
      ).join('');

      return `
        <div class="col">
          <div class="card h-100 shadow-sm border-0 rounded-4 overflow-hidden project-card">
            <div class="project-card-banner ${bannerClass} d-flex align-items-center justify-content-between p-3 text-white">
              <span class="project-icon-box"><i class="bi ${safeThumbnail} fs-4"></i></span>
              <span class="badge bg-white bg-opacity-25 text-white px-2 py-1 rounded-pill small">${safeYear}</span>
            </div>
            <div class="card-body p-4 d-flex flex-column">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="badge bg-light text-dark border small">${safeCategory}</span>
              </div>
              <h3 class="card-title h5 fw-bold mb-2">${safeTitle}</h3>
              <p class="card-text text-body-secondary small flex-grow-1 mb-3">${safeDesc}</p>
              <div class="project-tech-badges d-flex flex-wrap gap-1 mb-3" aria-label="Teknologi yang digunakan">
                ${tagsHTML}
              </div>
            </div>
            <div class="card-footer bg-transparent border-top-0 px-4 pb-4 pt-0">
              <button type="button" class="btn btn-sm btn-outline-accent w-100 rounded-3 btn-view-detail" data-id="${safeId}">
                <i class="bi bi-info-circle me-1"></i> Lihat Detail
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * Membuka Universal Modal dan menginjeksi data proyek terpilih secara aman
   * @param {string} id - ID proyek
   */
  openProjectModal(id) {
    const project = this.state.projects.find(p => String(p.id) === String(id));
    if (!project) return;

    const modalTitle = document.getElementById('projectModalTitle');
    const modalBody = document.getElementById('projectModalBody');
    const modalEl = document.getElementById('universalProjectModal');

    // 1. Wajib menggunakan textContent (BUKAN innerHTML) untuk judul
    if (modalTitle) {
      modalTitle.textContent = project.title;
    }

    // 2. Isi konten modalBody dengan sanitasi penuh lewat escapeHTML()
    if (modalBody) {
      const safeDesc = this.escapeHTML(project.description);
      const safeCategory = this.escapeHTML(project.category);
      const safeYear = this.escapeHTML(project.metrics?.year ?? '-');
      const safeLink = this.escapeHTML(project.link || '#');
      const safeTags = (project.tags || []).map(tag => 
        `<span class="badge bg-secondary-subtle text-secondary-emphasis">${this.escapeHTML(tag)}</span>`
      ).join(' ');

      modalBody.innerHTML = `
        <div class="mb-3">
          <div class="d-flex align-items-center gap-2 mb-2">
            <span class="badge custom-category-badge rounded-pill">${safeCategory}</span>
            <span class="badge bg-dark-subtle text-dark-emphasis rounded-pill">Tahun ${safeYear}</span>
          </div>
          <h6 class="fw-bold text-heading mt-3 mb-1">Deskripsi Proyek</h6>
          <p class="text-body mb-3">${safeDesc}</p>
        </div>

        <div class="mb-3">
          <h6 class="fw-bold text-heading mb-2">Teknologi &amp; Alat</h6>
          <div class="d-flex flex-wrap gap-1" aria-label="Daftar Teknologi">
            ${safeTags}
          </div>
        </div>

        <div class="pt-3 border-top d-flex justify-content-between align-items-center">
          <a href="${safeLink}" class="btn btn-sm btn-primary rounded-pill px-3" target="_blank" rel="noopener noreferrer">
            <i class="bi bi-box-arrow-up-right me-1"></i> Kunjungi Proyek
          </a>
          <button type="button" class="btn btn-sm btn-secondary rounded-3" data-bs-dismiss="modal">Tutup</button>
        </div>
      `;
    }

    // 3. Tampilkan modal menggunakan instance Bootstrap
    if (modalEl && typeof bootstrap !== 'undefined') {
      const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
      modalInstance.show();
    }
  },

  /**
   * Mengambil data profil dari ApiService
   */
  async loadProfile() {
    try {
      this.state.profile = await ApiService.getProfile();
      this.renderProfile();
    } catch (error) {
      console.error('Gagal memuat profil:', error);
    }
  },

  /**
   * Menampilkan data profil ke UI
   */
  renderProfile() {
    const p = this.state.profile;
    if (!p) return;

    const profileName = document.getElementById('profileName');
    if (profileName) profileName.textContent = p.name;
    
    const profileRole = document.getElementById('profileRole');
    if (profileRole) profileRole.textContent = p.bio;

    const profileBio = document.getElementById('profileBio');
    if (profileBio) {
      profileBio.innerHTML = `Saya adalah mahasiswa ${this.escapeHTML(p.prodi)} di ${this.escapeHTML(p.institusi)} yang memiliki minat mendalam pada pengembangan web <em>full-stack</em>. Berfokus pada perancangan antarmuka pengguna yang modern, responsif, dan aksesibel, serta pembangunan arsitektur backend dan basis data yang efisien.`;
    }

    // Daftar Identitas
    const idContainer = document.getElementById('profileIdentities');
    if (idContainer) {
      idContainer.innerHTML = `
        <li class="list-group-item bg-transparent px-0 py-2 border-0">
          <span class="identity-label">NIM</span>
          <span class="identity-value">${this.escapeHTML(p.nim)}</span>
        </li>
        <li class="list-group-item bg-transparent px-0 py-2 border-0">
          <span class="identity-label">Institusi</span>
          <span class="identity-value">${this.escapeHTML(p.institusi)}</span>
        </li>
        <li class="list-group-item bg-transparent px-0 py-2 border-0">
          <span class="identity-label">Program Studi</span>
          <span class="identity-value">${this.escapeHTML(p.prodi)}</span>
        </li>
        <li class="list-group-item bg-transparent px-0 py-2 border-0">
          <span class="identity-label">Lokasi</span>
          <span class="identity-value">${this.escapeHTML(p.lokasi)}</span>
        </li>
        <li class="list-group-item bg-transparent px-0 py-2 border-0">
          <span class="identity-label">Email</span>
          <span class="identity-value"><a href="mailto:${this.escapeHTML(p.email)}">${this.escapeHTML(p.email)}</a></span>
        </li>
      `;
    }

    // Skills Utama
    const skillsContainer = document.getElementById('profileSkills');
    if (skillsContainer && Array.isArray(p.skills)) {
      skillsContainer.innerHTML = p.skills.map(s => 
        `<span class="badge rounded-pill custom-skill-badge">${this.escapeHTML(s)}</span>`
      ).join('');
    }

    // Galeri Keahlian
    const skillsGallery = document.getElementById('skillsGallery');
    if (skillsGallery && Array.isArray(p.skills)) {
      skillsGallery.innerHTML = p.skills.map(s => `
        <li class="list-group-item bg-transparent d-flex justify-content-between align-items-center py-2 px-0">
          <span class="ms-2 fw-medium">${this.escapeHTML(s)}</span>
          <span class="badge custom-category-badge rounded-pill">Skill</span>
        </li>
      `).join('');
    }
  },

  /**
   * Mengambil data layanan dari ApiService
   */
  async loadServices() {
    try {
      this.state.services = await ApiService.getServices();
    } catch (error) {
      console.error('Gagal memuat layanan:', error);
    }
  }
};

// Inisialisasi saat seluruh DOM siap
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
