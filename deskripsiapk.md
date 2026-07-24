# Deskripsi Aplikasi

## Aplikasi Manajemen Penjualan dan Stok LPG Pangkalan Raya Maju Jaya Kutaringin Darit

### Latar Belakang

Pangkalan Raya Maju Jaya Kutaringin Darit merupakan usaha penyaluran tabung LPG yang setiap harinya melayani masyarakat dalam pembelian tabung gas. Saat ini proses pencatatan transaksi, stok, serta laporan keuangan masih dilakukan secara manual sehingga berisiko terjadi kesalahan pencatatan, kesalahan perhitungan, kehilangan data, serta membutuhkan waktu yang lebih lama dalam proses rekapitulasi.

Untuk mengatasi permasalahan tersebut, diperlukan sebuah aplikasi berbasis web yang mampu mengelola seluruh aktivitas operasional pangkalan secara digital. Aplikasi ini dirancang agar seluruh proses pencatatan penjualan, pengelolaan stok, perhitungan pendapatan, hingga penyusunan laporan keuangan dapat dilakukan secara otomatis, cepat, dan akurat.

---

# Tujuan Aplikasi

Aplikasi ini bertujuan untuk membantu pemilik Pangkalan Raya Maju Jaya Kutaringin Darit dalam mengelola seluruh aktivitas penjualan LPG secara terintegrasi, mulai dari pencatatan stok, transaksi penjualan, hingga penyusunan laporan penjualan, laporan keuangan, dan laporan laba bersih secara otomatis.

Selain itu, aplikasi ini juga dirancang untuk meminimalkan kesalahan pencatatan, mempercepat proses administrasi, meningkatkan efisiensi operasional, serta memudahkan pemilik dalam memantau kondisi usaha secara real-time.

---

# Gambaran Umum Sistem

Aplikasi merupakan sistem informasi berbasis web yang hanya digunakan oleh **satu pengguna (Single Admin)**, yaitu pemilik pangkalan.

Setelah berhasil login, pengguna akan diarahkan ke halaman Dashboard yang menampilkan seluruh informasi penting mengenai kondisi usaha, seperti stok tabung, jumlah tabung terjual, total transaksi, pendapatan, laba, serta grafik penjualan.

Seluruh proses transaksi dilakukan melalui aplikasi sehingga tidak ada lagi perhitungan secara manual.

---

# Konsep Sistem

Sistem bekerja berdasarkan tiga proses utama:

1. Pengelolaan Stok
2. Penjualan Tabung
3. Pembuatan Laporan

Ketiga proses tersebut saling terhubung sehingga setiap transaksi akan langsung memperbarui stok, laporan penjualan, laporan keuangan, dan laporan laba secara otomatis tanpa perlu melakukan input ulang.

---

# Sistem Login

Aplikasi hanya memiliki satu akun administrator.

Administrator memiliki hak penuh untuk:

* Mengelola transaksi
* Mengelola stok
* Mengubah harga
* Mengelola pengaturan
* Melihat seluruh laporan
* Mengunduh laporan
* Melakukan backup data

Karena aplikasi hanya digunakan oleh pemilik pangkalan, tidak diperlukan sistem multi-user atau pembagian hak akses.

---

# Dashboard

Dashboard menjadi halaman utama aplikasi yang menyajikan informasi secara real-time.

Informasi yang ditampilkan meliputi:

* Total stok tabung yang tersedia.
* Kapasitas gudang.
* Jumlah tabung yang terjual hari ini.
* Jumlah transaksi hari ini.
* Total pendapatan hari ini.
* Total pendapatan bulan ini.
* Total laba hari ini.
* Total laba bulan ini.
* Grafik penjualan.
* Grafik pendapatan.
* Grafik laba bersih.
* Notifikasi stok hampir habis.

Dashboard juga menampilkan progress kapasitas gudang sehingga pemilik dapat mengetahui kondisi stok secara cepat.

---

# Sistem Pengelolaan Stok

Sistem stok merupakan inti dari aplikasi.

Setiap tabung yang masuk dari agen dicatat melalui menu **Stok Masuk**.

Ketika stok masuk disimpan, sistem otomatis menambahkan jumlah tabung ke stok yang tersedia.

Sebaliknya, setiap transaksi penjualan akan otomatis mengurangi stok.

Seluruh perubahan stok tercatat pada riwayat stok sehingga pemilik dapat mengetahui asal perubahan stok kapan pun dibutuhkan.

---

# Kapasitas Gudang

Gudang memiliki kapasitas maksimal **200 tabung**.

Sistem akan menolak penambahan stok apabila jumlah tabung melebihi kapasitas tersebut.

Sebagai contoh:

Stok saat ini:

190 tabung

Kemudian ditambahkan:

20 tabung

Maka sistem akan menampilkan pemberitahuan bahwa kapasitas gudang telah melebihi batas maksimal dan transaksi stok masuk tidak dapat disimpan.

---

# Sistem Penjualan

Menu penjualan digunakan untuk mencatat seluruh transaksi pembelian LPG.

Pada setiap transaksi administrator hanya perlu mengisi:

* Nama pembeli atau nama perwakilan.
* Jumlah tabung yang dijual.

Harga jual tabung diambil otomatis dari menu Pengaturan sehingga administrator tidak perlu menginput harga setiap kali melakukan transaksi.

Setelah jumlah tabung dimasukkan, sistem secara otomatis menghitung total pembayaran berdasarkan harga jual yang berlaku.

---

# Sistem Pembagian Tabung

Aplikasi mempertahankan aturan operasional pangkalan yaitu **setiap orang maksimal memperoleh dua tabung LPG**.

Apabila administrator memasukkan jumlah tabung lebih dari dua, sistem akan menghitung secara otomatis berapa jumlah penerima berdasarkan ketentuan tersebut.

Sebagai contoh, apabila terdapat 25 tabung yang akan didistribusikan, sistem akan menampilkan bahwa distribusi tersebut dapat diberikan kepada 13 orang, dengan rincian 12 orang memperoleh dua tabung dan satu orang memperoleh satu tabung.

Informasi ini akan tersimpan pada transaksi sebagai data operasional tanpa memengaruhi perhitungan pendapatan maupun laba.

---

# Validasi Penjualan

Aplikasi memiliki beberapa aturan validasi agar data tetap akurat.

Sistem akan menolak transaksi apabila:

* Jumlah tabung kurang dari satu.
* Jumlah tabung melebihi stok yang tersedia.
* Jumlah tabung melebihi kapasitas transaksi yang ditentukan.
* Stok kosong.

Dengan adanya validasi tersebut, kesalahan pencatatan dapat diminimalkan.

---

# Sistem Harga

Pada menu Pengaturan, administrator dapat menentukan:

* Harga jual tabung.
* Harga modal tabung.

Harga jual digunakan untuk menghitung pendapatan.

Harga modal digunakan untuk menghitung laba bersih.

Perubahan harga hanya berlaku pada transaksi berikutnya sehingga transaksi lama tetap menggunakan harga yang berlaku saat transaksi tersebut dibuat.

---

# Laporan Penjualan

Seluruh transaksi otomatis masuk ke laporan penjualan.

Laporan berisi informasi:

* Nomor transaksi.
* Tanggal transaksi.
* Nama pembeli.
* Jumlah tabung.
* Harga jual.
* Total pembayaran.
* Jumlah penerima.
* Pembagian tabung.

Laporan dapat dicari berdasarkan nama, tanggal, bulan, maupun tahun serta dapat dicetak atau diekspor ke PDF dan Excel.

---

# Laporan Keuangan

Setiap transaksi yang berhasil disimpan otomatis masuk ke laporan keuangan.

Laporan ini menampilkan:

* Total transaksi.
* Total tabung terjual.
* Total pendapatan.
* Rekap harian.
* Rekap bulanan.
* Rekap tahunan.

---

# Laporan Laba Bersih

Selain pendapatan, sistem juga menghitung laba bersih secara otomatis.

Perhitungan dilakukan menggunakan harga modal yang telah ditentukan.

Laporan menampilkan:

* Pendapatan.
* Total modal.
* Laba bersih.
* Grafik perkembangan laba.

Dengan demikian pemilik dapat mengetahui keuntungan usaha tanpa melakukan perhitungan manual.

---

# Riwayat Stok

Seluruh aktivitas stok tersimpan dalam riwayat.

Riwayat mencatat:

* Penambahan stok.
* Pengurangan stok akibat penjualan.
* Stok sebelum transaksi.
* Stok sesudah transaksi.
* Keterangan perubahan.

---

# Backup dan Keamanan Data

Aplikasi menyediakan fitur backup database sehingga seluruh data dapat disimpan sebagai cadangan.

Administrator juga dapat melakukan restore apabila terjadi kerusakan sistem atau kehilangan data.

Seluruh password disimpan dalam bentuk hash dan setiap proses input divalidasi untuk menjaga keamanan aplikasi.

---

# Teknologi

Aplikasi dikembangkan menggunakan teknologi web modern yang kompatibel dengan hosting Netlify.

Frontend menggunakan Next.js, React, TypeScript, Tailwind CSS, dan shadcn/ui untuk menghasilkan antarmuka yang cepat, responsif, dan modern.

Backend menggunakan Supabase sebagai layanan database PostgreSQL, autentikasi, dan penyimpanan data secara real-time.

Grafik ditampilkan menggunakan Recharts, sedangkan validasi form menggunakan React Hook Form dan Zod.

Seluruh sistem dirancang agar mudah dikembangkan, aman, dan dapat digunakan baik melalui komputer maupun perangkat mobile.

---

# Hasil yang Diharapkan

Dengan adanya aplikasi ini, seluruh proses operasional Pangkalan Raya Maju Jaya Kutaringin Darit dapat dilakukan secara digital, mulai dari pencatatan stok, penjualan, distribusi tabung, pengelolaan keuangan, hingga penyusunan laporan. Pemilik tidak lagi perlu melakukan perhitungan manual karena semua proses dilakukan secara otomatis dan tersinkronisasi dalam satu sistem, sehingga pengelolaan usaha menjadi lebih cepat, akurat, efisien, dan terdokumentasi dengan baik.
