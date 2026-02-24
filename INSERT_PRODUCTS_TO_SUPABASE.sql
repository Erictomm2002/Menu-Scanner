-- ============================================
-- INSERT PRODUCTS FROM EXCEL TEMPLATE
-- ============================================
-- Chạy các lệnh này trong SQL Editor của Supabase
-- -------------------------------------------

-- PHẦN MỀM (Category: software)
INSERT INTO products (name, category, description, unit, price, specifications) VALUES
('Phần mềm bán hàng FABi iPOS', 'software', 'Tính năng phần mềm:
1/ Bán hàng chuyên nghiệp
- Giao diện bán hàng nhanh chóng, đơn giản, dễ dùng.
- Chọn được nhiều phương thức thanh toán VNpay, Momo, Grab Moca
- Chọn được nhiều nguồn đơn hàng khác nhau Grab, shopee,...
- Chương trình khuyến mãi đa dạng
- Giảm giá theo tiền / % món/nhóm theo ngày, giờ
- Giảm giá bill theo mức tiêu, theo ngày, giờ
- Combo đa dạng phù hợp nhiều mô hình
- Biểu đồ báo cáo thông minh
- Tổng doanh thu, doanh thu theo cửa hàng
- Báo cáo theo chương trình khuyến mãi
- Báo cáo theo nguồn đơn hàng
- Báo cáo theo mặt hàng, nhóm mặt hàng bán chạy
4/ Quản lý chuỗi dễ dàng
- Quản lý doanh thu, menu, chương trình khuyến mãi, báo cáo của nhiều cửa hàng khác nhau', 'Năm/ Cửa hàng', 3000000.0, 'Full features'),

('Phí khởi tạo phần mềm Fabi', 'software', NULL, 'Lần', 300000.0, 'Setup fee for Fabi software'),

('Phần mềm Order trên Máy tính bảng + điện thoại', 'software', 'Gói', 0, 'Miễn phí', 'Free tablet ordering app'),

('Website bán hàng trên Web Order', 'software', 'Cửa hàng', 0, 'Miễn phí', 'Free online ordering platform'),

('Giải pháp Menu điện tử O2O', 'software', 'Gói', 0, 'Miễn phí', 'QR code menu ordering solution'),

('GÓI 10.000 HÓA ĐƠN iPOS Invoice', 'software', 'Gói', 2300000.0, '10,000 electronic invoices package');


-- PHẦN CỨNG (Category: hardware)
INSERT INTO products (name, category, description, unit, price) VALUES
('Máy tính tiền POS cảm ứng iAP200s - Màn 10.1 inch)', 'hardware', 'Máy tính tiền iAP200s:
Thông tin chung:
+ Kích thước: 251 (Ngang) x 154 (Sâu) x 247 mm(Cao)
+ CPU: Quad-Core, Cortex – A55, up to 1.8GHz
+ RAM: 2GB
+ Storage: 16GB
+ Màn hình: 10.1″ LCD, 800*1280, True-flat PCAP Touch with multi-touch support
+ Cổng giao tiếp: USB*4, MicroUSB*1, RJ11*1, RJ12*1, 3.5mm Audio Jack * 1, TF*1, DC Jack *1, Bluetooth, Wifi
+ Hệ điều hành: Andoid 11', 'Chiếc', 5200000.0, NULL),

('Máy tính tiền POS cảm ứng iAP250 - Màn 11.6 inch)', 'hardware', 'Máy tính tiền iAP250:
Thông tin chung:
Kích thước: 286mm*174mm*303mm
CPU: RK3568, quad-core Cortex-A55
RAM: 2GB DDR4
Storage: 16GB eMMC
Màn hình: 11.6", 1366 x 768, cảm ứng đa điểm
Scanner: 2D (quét tốt mã vạch và mã QR)
OS: Android 11
Cổng giao tiếp: 3 USB 2.0, 1 x RJ12, 1 x RJ45, 1 x DC-in, Wifi, Bluetooth, LAN
Màu sắc: Đen
Bảo hành 12 tháng tại văn phòng iPOS.vn', 'Chiếc', 5900000.0, NULL),

('Máy tính tiền POS cảm ứng iAP302 - Màn 15.6 inch)', 'hardware', 'Máy tính tiền iAP302
Thông tin chung:
Kích thước: 365mm x 190mm x 306 mm
CPU: Octa-core A55 up to 2.0GHz
RAM: 4GB
Storage: 64GB
Màn hình: 15.6" FHD 1920 x 1080, cảm ứng đa điểm
OS: Android 13
Cổng giao tiếp: USB Type-A 2.0 x4, USB Type-A 3.0 x1, USB Type-C x1, 3.5mm Audio Jack, HDMI 2.0 x 1, RJ11 x 1, RJ12 x 1, RJ45 x 1, Wifi, Bluetooth
Màu sắc: Đen', 'Chiếc', 6900000.0, NULL);
