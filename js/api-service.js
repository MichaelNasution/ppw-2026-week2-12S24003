const ApiService = {
  /**
   * Mengambil data profil dari JSON
   */
  async getProfile() {
    try {
      const response = await fetch('./data/profile.json');
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status} saat mengambil profile.json`);
      }
      return await response.json();
    } catch (error) {
      console.error('ApiService.getProfile Error:', error);
      throw error; // Re-throw error agar bisa ditangkap pemanggil (app.js)
    }
  },

  /**
   * Mengambil data proyek dari JSON
   */
  async getProjects() {
    try {
      const response = await fetch('./data/projects.json');
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status} saat mengambil projects.json`);
      }
      return await response.json();
    } catch (error) {
      console.error('ApiService.getProjects Error:', error);
      throw error;
    }
  },

  /**
   * Mengambil data layanan dari JSON
   */
  async getServices() {
    try {
      const response = await fetch('./data/services.json');
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status} saat mengambil services.json`);
      }
      return await response.json();
    } catch (error) {
      console.error('ApiService.getServices Error:', error);
      throw error;
    }
  },

  /**
   * Simulasi pengiriman form pemesanan layanan.
   * Catatan: Karena GitHub Pages (static hosting) tidak menerima POST sungguhan, 
   * maka fungsi ini menggunakan setTimeout untuk mensimulasikan latency jaringan.
   * Ini adalah pilihan simulasi (bukan memanggil mock API eksternal sungguhan).
   */
  submitServiceOrder(payload) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          orderId: Date.now(),
          data: payload
        });
      }, 1000);
    });
  }
};
