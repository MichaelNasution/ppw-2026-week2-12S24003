/**
 * Aplikasi Utama Portofolio Dinamis (Week 4 - Dynamic Client-Side Rendering)
 * Arsitektur: Decoupled Multi-Tier berbasis Data JSON, Universal Modal, REST Asinkron,
 *             localStorage Persistence & Interactive Motion Engine (Anime.js v4)
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
   * Menyimpan pesanan baru ke localStorage dan memperbarui state + UI
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
    this.updateOrderBadge(true);
    this.renderOrderHistoryModal();
    return orders;
  },

  /**
   * Menghapus seluruh riwayat pesanan dari localStorage
   */
  clearOrdersFromLocalStorage() {
    try {
      localStorage.removeItem('orders');
    } catch (e) {
      console.error('Gagal menghapus orders dari localStorage:', e);
    }
    this.state.orders = [];
    this.updateOrderBadge(true);
    this.renderOrderHistoryModal();
    this.showToast('success', 'Riwayat Dibersihkan', 'Seluruh catatan permintaan layanan di perangkat ini telah dihapus.');
  },

  /**
   * Memperbarui angka pada badge pesanan di navbar & panel layanan
   * @param {boolean} animateBump - Apakah perlu memicu animasi bump Anime.js
   */
  updateOrderBadge(animateBump = false) {
    const count = this.state.orders.length;
    const badge = document.getElementById('orderBadge');
    const inlineCount = document.getElementById('orderCountInline');

    if (badge) badge.textContent = count;
    if (inlineCount) inlineCount.textContent = count;

    if (animateBump && typeof AppAnimations !== 'undefined') {
      AppAnimations.animateOrderBadgeBump();
    }
  },

  /**
   * Merender isi Modal Riwayat Pesanan (#orderHistoryBody)
   */
  renderOrderHistoryModal() {
    const container = document.getElementById('orderHistoryBody');
    const clearBtn = document.getElementById('btnClearOrders');
    if (!container) return;

    const orders = this.state.orders;
    if (clearBtn) {
      clearBtn.disabled = orders.length === 0;
    }

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5">
          <i class="bi bi-inbox fs-1 text-muted-custom d-block mb-2"></i>
          <h4 class="h6 fw-bold text-heading mb-1">Belum Ada Riwayat Permintaan</h4>
          <p class="small text-muted-custom mb-0">
            Permintaan konsultasi yang Anda kirimkan melalui formulir akan tercatat secara otomatis di sini.
          </p>
        </div>
      `;
      return;
    }

    const rowsHTML = [...orders].reverse().map((ord) => {
      const safeId = this.escapeHTML(ord.orderId || '-');
      const safeNama = this.escapeHTML(ord.nama || 'Anonim');
      const safeEmail = this.escapeHTML(ord.email || '-');
      const safeKategori = this.escapeHTML(ord.kategoriName || ord.kategori || 'Konsultasi');
      const safeTipe = this.escapeHTML(ord.tipe_layanan || 'konsultasi');
      const safePesan = this.escapeHTML(ord.pesan || '-');
      const dateStr = ord.submittedAt
        ? new Date(ord.submittedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
        : 'Baru saja';

      return `
        <div class="p-3 mb-3 rounded-3 border bg-light bg-opacity-50">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
            <div>
              <span class="badge bg-dark font-monospace me-1">#${safeId}</span>
              <strong class="text-heading">${safeNama}</strong>
              <span class="small text-muted-custom">(${safeEmail})</span>
            </div>
            <span class="small font-monospace text-muted-custom"><i class="bi bi-clock me-1"></i>${this.escapeHTML(dateStr)}</span>
          </div>
          <div class="d-flex flex-wrap gap-2 mb-2">
            <span class="tech-tag-chip"><i class="bi bi-layers me-1 text-accent"></i>${safeKategori}</span>
            <span class="tech-tag-chip text-uppercase">${safeTipe}</span>
          </div>
          <p class="small mb-0 text-muted-custom">${safePesan}</p>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="mb-2 small text-muted-custom">
        Menampilkan <strong>${orders.length}</strong> permintaan layanan yang tersimpan di <code>localStorage</code> browser Anda:
      </div>
      <div style="max-height: 380px; overflow-y: auto;" class="pe-1">
        ${rowsHTML}
      </div>
    `;
  },

  /**
   * Menampilkan feedback Toast Bootstrap secara dinamis + animasi Anime.js
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
      toastEl.className = 'toast align-items-center text-white bg-danger border-0 shadow-lg rounded-4';
      if (toastIcon) toastIcon.className = 'bi bi-exclamation-triangle-fill fs-4 text-white';
    }

    if (toastTitle) toastTitle.textContent = title;
    if (toastMessage) toastMessage.textContent = message;

    if (typeof bootstrap !== 'undefined') {
      const toastInstance = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 4500 });
      toastInstance.show();
    }

    if (typeof AppAnimations !== 'undefined') {
      AppAnimations.animateToastShow(toastEl);
    }
  },

  /**
   * Inisialisasi aplikasi saat dokumen siap
   */
  async init() {
    const urlParams = new URLSearchParams(window.location.search);

    // 1. Simulasi error memuat proyek via ?forceError=true
    if (urlParams.get('forceError') === 'true') {
      console.warn('Force Error mode aktif. Path fetch diarahkan ke berkas non-existent.');
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
      console.warn('Force Submit Error aktif. submitServiceOrder disimulasikan gagal.');
      ApiService.submitServiceOrder = async () => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Simulasi kegagalan transmisi jaringan (HTTP 500).')), 1000);
        });
      };
    }

    // 3. Inisialisasi mesin animasi interaktif Anime.js v4
    if (typeof AppAnimations !== 'undefined') {
      AppAnimations.init();
    }

    // 4. Baca data orders dari localStorage & update badge di navbar
    this.state.orders = this.getStoredOrders();
    this.updateOrderBadge(false);
    this.renderOrderHistoryModal();

    // 5. Inisialisasi listener event delegation & form submission
    this.initEventDelegation();
    this.initFormValidation();

    // 6. Muat data profil, proyek, dan layanan secara asinkron
    await Promise.all([
      this.loadProfile(),
      this.loadProjects(),
      this.loadServices()
    ]);
  },

  /**
   * Mengatur Event Delegation pada container dinamis & elemen interaktif
   */
  initEventDelegation() {
    // Event Delegation pada Container Grid Proyek (#projectGrid)
    const grid = document.getElementById('projectGrid');
    if (grid) {
      grid.addEventListener('click', (event) => {
        const detailBtn = event.target.closest('.btn-view-detail');
        if (detailBtn) {
          const projectId = detailBtn.getAttribute('data-id');
          if (projectId) {
            this.openProjectModal(projectId);
          }
          return;
        }

        const retryBtn = event.target.closest('.btn-retry-projects');
        if (retryBtn) {
          this.loadProjects();
          return;
        }

        const resetFilterBtn = event.target.closest('.btn-reset-filter');
        if (resetFilterBtn) {
          this.filterProjects('all');
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
            if (typeof AppAnimations !== 'undefined') {
              AppAnimations.animateFilterButton(filterBtn);
            }
            this.filterProjects(category);
          }
        }
      });
    }

    // Perubahan Dropdown Layanan (#kategori) -> Update Kartu Preview Layanan
    const kategoriSelect = document.getElementById('kategori');
    if (kategoriSelect) {
      kategoriSelect.addEventListener('change', (e) => {
        this.updateServicePreview(e.target.value);
      });
    }

    // Penghitung Karakter Live pada Textarea (#pesan)
    const pesanInput = document.getElementById('pesan');
    const charCounter = document.getElementById('charCounter');
    if (pesanInput && charCounter) {
      pesanInput.addEventListener('input', () => {
        charCounter.textContent = `${pesanInput.value.length} karakter`;
      });
    }

    // Tombol Bersihkan Riwayat Pesanan
    const clearBtn = document.getElementById('btnClearOrders');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearOrdersFromLocalStorage();
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
      event.preventDefault();

      if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add('was-validated');
        if (typeof AppAnimations !== 'undefined') {
          AppAnimations.animateFormInvalidShake(form);
        }
        this.showToast('danger', 'Validasi Belum Lengkap', 'Harap lengkapi seluruh kolom wajib yang ditandai sebelum mengirim.');
        return;
      }

      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());

      // Cari nama layanan dari state.services untuk disimpan di riwayat
      const matchedService = this.state.services.find(s => String(s.id) === String(payload.kategori));
      if (matchedService) {
        payload.kategoriName = matchedService.name;
      }

      const submitBtn = document.getElementById('btnSubmitOrder') || form.querySelector('button[type="submit"]');
      const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Memproses &amp; Mengirim...
        `;
      }

      try {
        const response = await ApiService.submitServiceOrder(payload);

        if (!response || !response.success) {
          throw new Error('Server mengembalikan respons tidak valid.');
        }

        this.saveOrderToLocalStorage({
          orderId: response.orderId || Date.now(),
          ...payload,
          submittedAt: new Date().toISOString()
        });

        this.showToast(
          'success',
          'Permintaan Berhasil Terkirim!',
          `Terima kasih ${payload.nama}, permintaan Anda (#${response.orderId}) telah disimpan.`
        );

        form.reset();
        form.classList.remove('was-validated');
        const charCounter = document.getElementById('charCounter');
        if (charCounter) charCounter.textContent = '0 karakter';

      } catch (error) {
        console.error('submitServiceOrder error:', error);
        this.showToast(
          'danger',
          'Gagal Mengirim Permintaan',
          error.message || 'Terjadi gangguan jaringan, silakan coba lagi.'
        );
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHTML;
        }
      }
    });
  },

  /**
   * Mengambil data proyek dari ApiService dan menampilkannya (Mendukung 4 UI States)
   */
  async loadProjects() {
    const grid = document.getElementById('projectGrid');
    if (grid) {
      // UI STATE 1: LOADING STATE
      grid.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="spinner-border text-accent mb-3" role="status">
            <span class="visually-hidden">Memuat data proyek...</span>
          </div>
          <p class="text-muted-custom small font-monospace mb-0">Mengambil data portofolio dari data/projects.json...</p>
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
        // UI STATE 2: ERROR STATE + Retry via Event Delegation
        const safeError = this.escapeHTML(error.message);
        grid.innerHTML = `
          <div class="col-12">
            <div class="alert alert-danger d-flex flex-wrap align-items-center justify-content-between gap-3 p-4 rounded-4 shadow-sm border-2 border-danger" role="alert">
              <div class="d-flex align-items-center gap-3">
                <i class="bi bi-exclamation-octagon-fill fs-2 text-danger"></i>
                <div>
                  <h4 class="alert-heading h6 fw-bold mb-1">Gagal Memuat Portofolio Proyek</h4>
                  <p class="small mb-0 text-danger-emphasis">${safeError}</p>
                </div>
              </div>
              <button type="button" class="btn btn-sm btn-danger btn-retry-projects rounded-pill px-4 py-2 fw-bold">
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
      const label = cat === 'all' ? 'Semua Karya' : cat;
      const activeClass = isActive ? 'active btn-primary' : '';
      return `
        <button type="button" class="btn-filter-category ${activeClass}" data-category="${this.escapeHTML(cat)}">
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

    // UI STATE 3: EMPTY STATE
    if (filtered.length === 0) {
      const safeCat = this.escapeHTML(this.state.activeFilter);
      grid.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="bi bi-folder2-open fs-1 text-muted-custom mb-2 d-block"></i>
          <h3 class="h5 fw-bold text-heading">Tidak Ada Proyek Ditemukan</h3>
          <p class="text-muted-custom small mb-3">Belum ada proyek pada kategori <strong>${safeCat}</strong>.</p>
          <button type="button" class="btn btn-sm btn-outline-accent rounded-pill px-3 btn-reset-filter">
            Tampilkan Semua Proyek
          </button>
        </div>
      `;
      return;
    }

    // UI STATE 4: SUCCESS STATE
    grid.innerHTML = filtered.map((project) => {
      const safeId = this.escapeHTML(project.id);
      const safeTitle = this.escapeHTML(project.title);
      const safeDesc = this.escapeHTML(project.description);
      const safeCategory = this.escapeHTML(project.category);
      const safeRole = this.escapeHTML(project.role || 'Full-Stack Developer');
      const safeCourse = this.escapeHTML(project.course || 'Proyek Rekayasa Web');
      const safeIcon = this.escapeHTML(project.icon || project.thumbnail || 'bi-laptop');
      const safeImage = this.escapeHTML(project.image || 'img/projects/cashflow-app.svg');
      const safeYear = this.escapeHTML(project.metrics?.year ?? '2025');

      const tagsHTML = (project.tags || []).map(tag =>
        `<span class="tech-tag-chip">${this.escapeHTML(tag)}</span>`
      ).join('');

      return `
        <div class="col">
          <article class="card h-100 project-card overflow-hidden">
            <div class="project-mockup-wrap">
              <img src="${safeImage}" alt="Ilustrasi antarmuka ${safeTitle}" class="project-mockup-img" loading="lazy">
              <div class="project-Floating-badges">
                <span class="project-cat-pill"><i class="bi ${safeIcon} me-1"></i>${safeCategory}</span>
                <span class="project-year-pill">${safeYear}</span>
              </div>
            </div>
            <div class="card-body p-4 d-flex flex-column">
              <div class="project-role-meta mb-1">${safeRole} &bull; ${safeCourse}</div>
              <h3 class="card-title h5 fw-bold mb-2">${safeTitle}</h3>
              <p class="card-text text-muted-custom small flex-grow-1 mb-3">${safeDesc}</p>
              <div class="d-flex flex-wrap gap-1 mb-3" aria-label="Teknologi yang digunakan">
                ${tagsHTML}
              </div>
              <button type="button" class="btn-view-detail w-100" data-id="${safeId}">
                <i class="bi bi-arrows-angle-expand me-1"></i> Lihat Detail &amp; Arsitektur
              </button>
            </div>
          </article>
        </div>
      `;
    }).join('');

    if (typeof AppAnimations !== 'undefined') {
      AppAnimations.animateProjectCards();
    }
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

    // 1. Wajib menggunakan textContent (BUKAN innerHTML) untuk judul modal
    if (modalTitle) {
      modalTitle.textContent = project.title;
    }

    // 2. Isi konten modalBody dengan sanitasi penuh lewat escapeHTML()
    if (modalBody) {
      const safeDesc = this.escapeHTML(project.description);
      const safeCategory = this.escapeHTML(project.category);
      const safeRole = this.escapeHTML(project.role || 'Full-Stack Developer');
      const safeCourse = this.escapeHTML(project.course || 'Institut Teknologi Del');
      const safeYear = this.escapeHTML(project.metrics?.year ?? '2025');
      const safeSummary = this.escapeHTML(project.metrics?.summary || 'Implementasi Fungsional & Teruji');
      const safeImage = this.escapeHTML(project.image || 'img/projects/cashflow-app.svg');
      const safeLink = this.escapeHTML(project.link || '#');

      const safeTags = (project.tags || []).map(tag =>
        `<span class="tech-tag-chip">${this.escapeHTML(tag)}</span>`
      ).join(' ');

      const highlightsHTML = Array.isArray(project.highlights) && project.highlights.length
        ? `<div class="mb-4">
             <h4 class="h6 fw-bold text-heading mb-2"><i class="bi bi-Cpu-fill text-accent me-1"></i>Sorotan Arsitektur &amp; Implementasi</h4>
             <ul class="small text-muted-custom ps-3 mb-0">
               ${project.highlights.map(h => `<li class="mb-1">${this.escapeHTML(h)}</li>`).join('')}
             </ul>
           </div>`
        : '';

      modalBody.innerHTML = `
        <div class="rounded-3 overflow-hidden border mb-3 bg-dark">
          <img src="${safeImage}" alt="Preview ${this.escapeHTML(project.title)}" class="w-100 d-block" style="max-height: 270px; object-fit: cover;">
        </div>

        <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
          <span class="badge-mono">${safeCategory}</span>
          <span class="year-pill">Tahun ${safeYear}</span>
          <span class="small text-muted-custom fw-semibold"><i class="bi bi-person-badge me-1 text-accent"></i>${safeRole}</span>
        </div>

        <div class="p-3 rounded-3 mb-3" style="background-color: var(--color-bg-alt); border: 1px solid var(--color-border);">
          <div class="row g-2 small">
            <div class="col-sm-5">
              <span class="text-muted-custom d-block">Konteks / Mata Kuliah:</span>
              <strong class="text-heading">${safeCourse}</strong>
            </div>
            <div class="col-sm-7">
              <span class="text-muted-custom d-block">Metrik &amp; Capaian Utama:</span>
              <strong class="text-accent">${safeSummary}</strong>
            </div>
          </div>
        </div>

        <div class="mb-3">
          <h4 class="h6 fw-bold text-heading mb-1">Deskripsi Lengkap</h4>
          <p class="small text-muted-custom mb-0">${safeDesc}</p>
        </div>

        ${highlightsHTML}

        <div class="mb-4">
          <h4 class="h6 fw-bold text-heading mb-2">Stack Teknologi &amp; Alat</h4>
          <div class="d-flex flex-wrap gap-1">
            ${safeTags}
          </div>
        </div>

        <div class="pt-3 border-top d-flex flex-wrap justify-content-between align-items-center gap-2">
          <a href="${safeLink}" class="btn btn-cta-primary btn-sm px-4" target="_blank" rel="noopener noreferrer">
            <i class="bi bi-box-arrow-up-right me-1"></i>Buka Repositori / Demo
          </a>
          <button type="button" class="btn btn-sm btn-outline-custom rounded-pill px-4" data-bs-dismiss="modal">
            Tutup
          </button>
        </div>
      `;
    }

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
   * Menampilkan data profil ke UI (Hero, Vitals Card, Skills, dan Galeri)
   */
  renderProfile() {
    const p = this.state.profile;
    if (!p) return;

    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el && val !== undefined && val !== null) el.textContent = val;
    };

    setTxt('profileName', p.name);
    setTxt('profileRole', p.bio);
    setTxt('vitalNimBadge', p.nim);
    setTxt('vitalProgram', p.program || p.prodi);
    setTxt('vitalInstitution', p.institusi);
    setTxt('vitalCohort', p.cohort || '2024');
    setTxt('vitalGpa', p.gpa || '3.72 / 4.00');
    setTxt('vitalLocation', p.location || p.lokasi);
    setTxt('vitalStatus', p.status || 'Tersedia untuk Kolaborasi');

    const profileBio = document.getElementById('profileBio');
    if (profileBio) {
      profileBio.innerHTML = `Saya <strong>${this.escapeHTML(p.name)}</strong> (${this.escapeHTML(p.nim)}), mahasiswa <strong>${this.escapeHTML(p.prodi)}</strong> di <strong>${this.escapeHTML(p.institusi)}</strong> yang memiliki dedikasi tinggi pada pengembangan aplikasi web <em>full-stack</em>, perancangan skema basis data, dan rekayasa antarmuka interaktif.`;
    }

    // Daftar Identitas Kompatibilitas
    const idContainer = document.getElementById('profileIdentities');
    if (idContainer) {
      idContainer.innerHTML = `
        <li>NIM: ${this.escapeHTML(p.nim)}</li>
        <li>Institusi: ${this.escapeHTML(p.institusi)}</li>
        <li>Program Studi: ${this.escapeHTML(p.prodi)}</li>
        <li>Lokasi: ${this.escapeHTML(p.lokasi)}</li>
        <li>Email: ${this.escapeHTML(p.email)}</li>
      `;
    }

    // Chip Keahlian Utama di Hero
    const skillsContainer = document.getElementById('profileSkills');
    if (skillsContainer && Array.isArray(p.skills)) {
      skillsContainer.innerHTML = p.skills.map(s =>
        `<span class="custom-skill-badge"><i class="bi bi-check2 text-accent me-1"></i>${this.escapeHTML(s)}</span>`
      ).join('');
    }

    // Galeri Hierarki Kompetensi (#skillsGallery)
    const skillsGallery = document.getElementById('skillsGallery');
    if (skillsGallery && Array.isArray(p.skills)) {
      skillsGallery.innerHTML = p.skills.map((s, idx) => `
        <li class="skills-numbered-item">
          <span>${this.escapeHTML(s)}</span>
          <span class="skills-numbered-idx">0${idx + 1}</span>
        </li>
      `).join('');
    }
  },

  /**
   * Mengambil data layanan dari ApiService & mengisi dropdown #kategori secara dinamis
   */
  async loadServices() {
    try {
      this.state.services = await ApiService.getServices();
      this.renderServicesDropdown();
    } catch (error) {
      console.error('Gagal memuat layanan:', error);
    }
  },

  /**
   * Merender opsi <select id="kategori"> secara dinamis dari data/services.json
   */
  renderServicesDropdown() {
    const selectEl = document.getElementById('kategori');
    if (!selectEl || !Array.isArray(this.state.services) || this.state.services.length === 0) return;

    const optionsHTML = this.state.services.map((srv) => {
      const safeId = this.escapeHTML(srv.id);
      const safeName = this.escapeHTML(srv.name);
      const safePrice = srv.price ? ` (${this.escapeHTML(srv.price)})` : '';
      return `<option value="${safeId}">${safeName}${safePrice}</option>`;
    }).join('');

    selectEl.innerHTML = `
      <option value="" selected disabled>-- Pilih Topik / Paket Layanan --</option>
      ${optionsHTML}
    `;

    // Tampilkan preview layanan pertama secara default
    this.updateServicePreview(this.state.services[0].id);
  },

  /**
   * Memperbarui Kartu Preview Layanan Aktif saat pengguna memilih topik
   * @param {string} serviceId - ID layanan terpilih
   */
  updateServicePreview(serviceId) {
    const srv = this.state.services.find(s => String(s.id) === String(serviceId)) || this.state.services[0];
    if (!srv) return;

    const nameEl = document.getElementById('previewServiceName');
    const priceEl = document.getElementById('previewServicePrice');
    const descEl = document.getElementById('previewServiceDesc');
    const iconEl = document.getElementById('previewServiceIcon');
    const featEl = document.getElementById('previewServiceFeatures');

    if (nameEl) nameEl.textContent = srv.name;
    if (priceEl) priceEl.textContent = srv.price || 'Hubungi untuk Penawaran';
    if (descEl) descEl.textContent = srv.description || 'Layanan konsultasi dan pengembangan solusi perangkat lunak terarah.';
    if (iconEl) iconEl.className = `bi ${srv.icon || 'bi-layers-half'}`;

    if (featEl && Array.isArray(srv.features)) {
      featEl.innerHTML = srv.features.map(f =>
        `<li><i class="bi bi-check2-circle text-accent me-2"></i>${this.escapeHTML(f)}</li>`
      ).join('');
    }

    if (typeof AppAnimations !== 'undefined') {
      AppAnimations.animateServicePreview();
    }
  }
};

// Inisialisasi saat seluruh DOM siap
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
