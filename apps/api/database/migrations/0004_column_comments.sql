-- ============================================================================
-- 0004_column_comments.sql
-- Pi Decor — Bổ sung mô tả tiếng Việt (COMMENT) cho toàn bộ bảng và cột dữ liệu
-- ============================================================================

-- 1. BẢNG ADMINS
comment on table admins is 'Tài khoản quản trị viên hệ thống Pi Decor (/admin/*)';
comment on column admins.id is 'Khóa chính định danh quản trị viên (UUID)';
comment on column admins.email is 'Địa chỉ email đăng nhập duy nhất của quản trị viên';
comment on column admins.password_hash is 'Chuỗi băm mật khẩu bằng bcryptjs, không lưu mật khẩu gốc';
comment on column admins.role is 'Vai trò phân quyền quản trị viên: admin hoặc owner';
comment on column admins.created_at is 'Thời điểm tạo tài khoản quản trị';

-- 2. BẢNG REFRESH_TOKENS
comment on table refresh_tokens is 'Quản lý refresh token xác thực phiên làm việc của quản trị viên';
comment on column refresh_tokens.id is 'Khóa chính định danh refresh token (UUID)';
comment on column refresh_tokens.admin_id is 'Khóa ngoại tham chiếu đến tài khoản admins sở hữu';
comment on column refresh_tokens.token_hash is 'Mã băm an toàn SHA-256 của refresh token';
comment on column refresh_tokens.expires_at is 'Thời điểm hết hạn hiệu lực của refresh token';
comment on column refresh_tokens.revoked_at is 'Thời điểm token bị thu hồi khi đăng xuất hoặc xoay vòng';
comment on column refresh_tokens.created_at is 'Thời điểm khởi tạo phiên refresh token';
comment on column refresh_tokens.family_id is 'Định danh chuỗi phiên (token family) phục vụ phát hiện sử dụng lại token';
comment on column refresh_tokens.replaced_by is 'Mã băm của refresh token mới đã thay thế token hiện tại';

-- 3. BẢNG LEADS
comment on table leads is 'Thông tin liên hệ và yêu cầu tư vấn từ khách hàng tiềm năng';
comment on column leads.id is 'Khóa chính định danh khách hàng tiềm năng (UUID)';
comment on column leads.name is 'Họ và tên khách hàng liên hệ';
comment on column leads.phone is 'Số điện thoại liên hệ (10 chữ số chuẩn Việt Nam)';
comment on column leads.email is 'Địa chỉ thư điện tử của khách hàng';
comment on column leads.wedding_date is 'Ngày dự kiến tổ chức hôn lễ';
comment on column leads.message is 'Ghi chú, lời nhắn hoặc mong muốn thiết kế của khách hàng';
comment on column leads.design_snapshot is 'Dữ liệu JSON lưu trạng thái thiết kế từ Studio (BuilderState)';
comment on column leads.status is 'Trạng thái xử lý: new (mới), contacted (đã liên hệ), closed (đã chốt)';
comment on column leads.created_at is 'Thời điểm khách hàng gửi biểu mẫu liên hệ';
comment on column leads.consent_at is 'Thời điểm khách hàng đồng ý điều khoản xử lý dữ liệu cá nhân';
comment on column leads.consent_version is 'Phiên bản điều khoản chính sách bảo mật tại thời điểm đồng ý';

-- 4. BẢNG LEAD_ACTIVITIES
comment on table lead_activities is 'Nhật ký các hoạt động, trao đổi và đổi trạng thái của lead';
comment on column lead_activities.id is 'Khóa chính định danh hoạt động (UUID)';
comment on column lead_activities.lead_id is 'Khóa ngoại tham chiếu đến lead tiếp nhận';
comment on column lead_activities.admin_id is 'Khóa ngoại tham chiếu đến quản trị viên thực hiện thao tác';
comment on column lead_activities.activity_type is 'Loại hoạt động: status_change, note, quotation_sent, call_logged, system, call, email, design_saved';
comment on column lead_activities.body is 'Nội dung chi tiết của hoạt động hoặc ghi chú';
comment on column lead_activities.metadata is 'Dữ liệu bổ sung dạng JSON tùy theo loại hoạt động';
comment on column lead_activities.created_at is 'Thời điểm ghi nhận hoạt động';

-- 5. BẢNG QUOTATIONS
comment on table quotations is 'Bảng báo giá dịch vụ cưới gửi đến khách hàng tiềm năng';
comment on column quotations.id is 'Khóa chính định danh báo giá (UUID)';
comment on column quotations.lead_id is 'Khóa ngoại tham chiếu đến khách hàng nhận báo giá';
comment on column quotations.admin_id is 'Khóa ngoại tham chiếu đến quản trị viên tạo báo giá';
comment on column quotations.quotation_number is 'Mã số báo giá định dạng duy nhất BG-YYYY-XXXX';
comment on column quotations.items is 'Danh sách các hạng mục chi phí và số lượng dưới dạng mảng JSON';
comment on column quotations.subtotal is 'Tổng số tiền trước chiết khấu (VNĐ)';
comment on column quotations.discount is 'Số tiền giảm giá hoặc chiết khấu (VNĐ)';
comment on column quotations.total is 'Tổng chi phí thực tế khách hàng thanh toán (VNĐ)';
comment on column quotations.status is 'Trạng thái báo giá: draft, sent, accepted, rejected, declined, expired';
comment on column quotations.valid_until is 'Hạn chót có hiệu lực của bảng báo giá';
comment on column quotations.notes is 'Ghi chú và điều khoản thanh toán đính kèm báo giá';
comment on column quotations.created_at is 'Thời điểm khởi tạo báo giá';
comment on column quotations.updated_at is 'Thời điểm cập nhật báo giá gần nhất';

-- 6. BẢNG QUOTATION_COUNTERS
comment on table quotation_counters is 'Bộ đếm số thứ tự báo giá nguyên tử theo từng năm';
comment on column quotation_counters.year is 'Năm phát hành báo giá (Khóa chính)';
comment on column quotation_counters.last_seq is 'Số thứ tự báo giá cao nhất đã phát hành trong năm';

-- 7. BẢNG TESTIMONIALS
comment on table testimonials is 'Đánh giá, phản hồi và cảm nhận thực tế từ các cặp đôi';
comment on column testimonials.id is 'Khóa chính định danh đánh giá (UUID)';
comment on column testimonials.lead_id is 'Khóa ngoại liên kết với khách hàng tiềm năng ban đầu nếu có';
comment on column testimonials.author is 'Tên cô dâu, chú rể hoặc khách hàng gửi đánh giá';
comment on column testimonials.role is 'Thông tin vai trò hiển thị (ví dụ: Cô dâu & Chú rể)';
comment on column testimonials.quote is 'Nội dung nhận xét, lời cảm ơn hoặc đánh giá chất lượng';
comment on column testimonials.rating is 'Điểm số đánh giá mức độ hài lòng từ 1 đến 5 sao';
comment on column testimonials.photos is 'Mảng JSON chứa danh sách ảnh tiệc cưới đính kèm kèm kích thước';
comment on column testimonials.status is 'Trạng thái kiểm duyệt: pending (chờ duyệt), approved (đã duyệt), rejected (từ chối)';
comment on column testimonials.source is 'Nguồn gửi: customer (khách gửi qua web), admin_seed (tạo từ admin)';
comment on column testimonials.created_at is 'Thời điểm gửi đánh giá';
comment on column testimonials.updated_at is 'Thời điểm cập nhật trạng thái kiểm duyệt gần nhất';
comment on column testimonials.consent_at is 'Thời điểm đồng ý điều khoản xử lý dữ liệu cá nhân';
comment on column testimonials.consent_version is 'Phiên bản điều khoản chính sách bảo mật tại thời điểm đồng ý';

-- 8. BẢNG VENUES
comment on table venues is 'Danh sách địa điểm tổ chức sự kiện và khách sạn đối tác';
comment on column venues.id is 'Khóa chính định danh địa điểm (UUID)';
comment on column venues.name is 'Tên địa điểm, trung tâm hội nghị tiệc cưới';
comment on column venues.type is 'Loại hình địa điểm: hotel, restaurant, resort, sảnh tiệc';
comment on column venues.address is 'Địa chỉ chi tiết của địa điểm tổ chức';
comment on column venues.city is 'Tỉnh hoặc thành phố nơi địa điểm tọa lạc';
comment on column venues.lat is 'Tọa độ vĩ độ (Latitude) hiển thị trên bản đồ';
comment on column venues.lng is 'Tọa độ kinh độ (Longitude) hiển thị trên bản đồ';
comment on column venues.cover_image is 'Đường dẫn ảnh đại diện của địa điểm';
comment on column venues.created_at is 'Thời điểm thêm địa điểm vào hệ thống';
comment on column venues.updated_at is 'Thời điểm cập nhật thông tin địa điểm gần nhất';

-- 9. BẢNG PROJECTS
comment on table projects is 'Dự án đám cưới mẫu và lookbook các gói trang trí thực tế';
comment on column projects.id is 'Khóa chính định danh dự án (UUID)';
comment on column projects.venue_id is 'Khóa ngoại tham chiếu đến địa điểm tổ chức';
comment on column projects.title is 'Tiêu đề dự án đám cưới hoặc concept trang trí';
comment on column projects.wedding_date is 'Ngày diễn ra tiệc cưới của dự án';
comment on column projects.style_tags is 'Mảng các thẻ phong cách dùng để lọc và tìm kiếm';
comment on column projects.cover_image is 'Đường dẫn ảnh bìa đại diện cho dự án';
comment on column projects.gallery is 'Mảng JSON chứa danh sách ảnh chi tiết trong album dự án';
comment on column projects.lead_id is 'Khóa ngoại liên kết đến khách hàng nếu dự án tạo từ lead';
comment on column projects.published is 'Cờ trạng thái hiển thị công khai trên website (true = hiển thị)';
comment on column projects.created_at is 'Thời điểm tạo hồ sơ dự án';
comment on column projects.updated_at is 'Thời điểm cập nhật thông tin dự án gần nhất';
comment on column projects.location is 'Tên địa điểm hiển thị [CẦN XÁC NHẬN: có thể thay thế bằng venues.address]';
comment on column projects.description is 'Mô tả chi tiết concept và câu chuyện trang trí tiệc cưới';
comment on column projects.budget is 'Mức ngân sách ước tính dạng văn bản [CẦN XÁC NHẬN: cột nghi thừa, đã có price_tier]';
comment on column projects.status is 'Trạng thái dự án: active [CẦN XÁC NHẬN: ít sử dụng, đã có cờ published]';
comment on column projects.category_id is 'Mã định danh danh mục dịch vụ liên quan [CẦN XÁC NHẬN]';
comment on column projects.tag is 'Nhãn phân loại bổ sung [CẦN XÁC NHẬN: cột nghi thừa, đã có style_tags]';
comment on column projects.price_tier is 'Phân khúc giá dự án: standard, premium, luxury';

-- 10. BẢNG MATERIALS
comment on table materials is 'Danh mục vật liệu trang trí tiệc cưới (vải, hoa, cổng vòm, đèn)';
comment on column materials.id is 'Khóa chính định danh vật liệu (UUID)';
comment on column materials.name is 'Tên mẫu vật liệu hoặc phụ kiện';
comment on column materials.category is 'Phân loại vật liệu: fabric, flower, flowers, arch, prop, lighting, drape_detail, text_name';
comment on column materials.color_hex is 'Mã màu đại diện định dạng Hex (ví dụ: #F8F9FA)';
comment on column materials.image_url is 'Đường dẫn hình ảnh chụp mẫu vật liệu thực tế';
comment on column materials.created_at is 'Thời điểm thêm vật liệu vào hệ thống';
comment on column materials.updated_at is 'Thời điểm cập nhật thông tin vật liệu gần nhất';

-- 11. BẢNG SERVICES
comment on table services is 'Danh mục gói dịch vụ tiệc cưới hiển thị trên trang chủ';
comment on column services.id is 'Khóa chính định danh gói dịch vụ (UUID)';
comment on column services.title is 'Tên gói dịch vụ cưới';
comment on column services.description is 'Mô tả tóm tắt nội dung gói dịch vụ';
comment on column services.image_url is 'Đường dẫn ảnh minh họa dịch vụ';
comment on column services."order" is 'Thứ tự ưu tiên sắp xếp hiển thị trên giao diện';
comment on column services.created_at is 'Thời điểm tạo dịch vụ';
comment on column services.updated_at is 'Thời điểm cập nhật dịch vụ gần nhất';
comment on column services.brand is 'Tên thương hiệu phụ hoặc phân nhóm dịch vụ';
comment on column services.tagline is 'Thông điệp ngắn hoặc slogan của gói dịch vụ';
comment on column services.icon is 'Tên icon đại diện cho dịch vụ';
comment on column services.accent is 'Tên lớp màu hoặc mã màu nhấn trực quan';
comment on column services.items is 'Mảng JSON danh sách các hạng mục chi tiết bao gồm trong gói';
comment on column services.href is 'Đường dẫn liên kết điều hướng khi nhấn vào thẻ dịch vụ';
comment on column services.cta_label is 'Văn bản hiển thị trên nút kêu gọi hành động';
comment on column services.featured is 'Cờ đánh dấu gói dịch vụ nổi bật hiển thị ở vị trí ưu tiên';
comment on column services.cover is 'Đường dẫn ảnh bìa lớn hiển thị trong thẻ bento';

-- 12. BẢNG STUDIO_TEMPLATES
comment on table studio_templates is 'Mẫu phông nền không gian tiệc cưới cho Studio thiết kế';
comment on column studio_templates.id is 'Khóa chính định danh mẫu không gian (UUID)';
comment on column studio_templates.name is 'Tên gọi của mẫu khung nền trang trí';
comment on column studio_templates.thumbnail is 'Đường dẫn ảnh thu nhỏ xem trước mẫu không gian';
comment on column studio_templates.svg_base is 'Mã nguồn SVG gốc của khung nền không gian';
comment on column studio_templates.category is 'Phân loại bối cảnh: backdrop, gallery_table, entrance';
comment on column studio_templates.is_active is 'Cờ cho phép sử dụng mẫu không gian trên Studio';
comment on column studio_templates.default_config is 'Cấu hình mặc định các slot vật liệu ban đầu dưới dạng JSON';
comment on column studio_templates.created_at is 'Thời điểm tạo mẫu không gian';
comment on column studio_templates.updated_at is 'Thời điểm cập nhật mẫu không gian gần nhất';

-- 13. BẢNG STUDIO_SLOT_DEFINITIONS
comment on table studio_slot_definitions is 'Định nghĩa vị trí và quy tắc hiển thị các slot trên mẫu Studio';
comment on column studio_slot_definitions.id is 'Khóa chính định danh slot (UUID)';
comment on column studio_slot_definitions.template_id is 'Khóa ngoại tham chiếu đến mẫu studio_templates chứa slot';
comment on column studio_slot_definitions.slot_key is 'Mã định danh duy nhất của slot trong cùng một mẫu không gian';
comment on column studio_slot_definitions.label is 'Tên hiển thị thân thiện của slot cho người dùng';
comment on column studio_slot_definitions.slot_type is 'Loại vật liệu cho phép gán: drape, drape_detail, flower, text_name, text_date, color_accent, prop';
comment on column studio_slot_definitions.norm_x is 'Tọa độ X chuẩn hóa (0.0 đến 1.0) tính theo tỷ lệ chiều rộng canvas';
comment on column studio_slot_definitions.norm_y is 'Tọa độ Y chuẩn hóa (0.0 đến 1.0) tính theo tỷ lệ chiều cao canvas';
comment on column studio_slot_definitions.norm_width is 'Chiều rộng chuẩn hóa (0.0 đến 1.0) theo canvas';
comment on column studio_slot_definitions.norm_height is 'Chiều cao chuẩn hóa (0.0 đến 1.0) theo canvas';
comment on column studio_slot_definitions.allow_scale is 'Cho phép người dùng tùy chỉnh kích thước vật liệu trên slot';
comment on column studio_slot_definitions.allow_rotate is 'Cho phép người dùng xoay góc nghiêng của vật liệu trên slot';
comment on column studio_slot_definitions.mirror_x is 'Hỗ trợ lật đối xứng vật liệu theo trục ngang';
comment on column studio_slot_definitions.z_index is 'Thứ tự xếp lớp hiển thị (layer) trên canvas thiết kế';
comment on column studio_slot_definitions.sort_order is 'Thứ tự hiển thị slot trong danh mục điều khiển';
comment on column studio_slot_definitions.required is 'Bắt buộc khách hàng phải chọn vật liệu cho slot này trước khi hoàn thành';

-- 14. BẢNG STUDIO_ASSETS
comment on table studio_assets is 'Thư viện vật liệu và phụ kiện họa tiết dùng cho Studio';
comment on column studio_assets.id is 'Khóa chính định danh tài nguyên Studio (UUID)';
comment on column studio_assets.asset_type is 'Phân loại tài nguyên: drape, drape_detail, flower, font, color, prop';
comment on column studio_assets.name is 'Tên phụ kiện hoặc tài nguyên trang trí';
comment on column studio_assets.thumbnail is 'Đường dẫn ảnh thu nhỏ của tài nguyên';
comment on column studio_assets.svg_data is 'Mã nguồn đồ họa vector SVG của tài nguyên';
comment on column studio_assets.color_hex is 'Mã màu Hex nếu tài nguyên thuộc loại màu sắc';
comment on column studio_assets.font_family is 'Tên bộ phông chữ nếu tài nguyên thuộc loại văn bản';
comment on column studio_assets.tags is 'Mảng JSON chứa danh sách thẻ tìm kiếm';
comment on column studio_assets.is_active is 'Cờ cho phép sử dụng tài nguyên này trên Studio';
comment on column studio_assets.dominant_colors is 'Mảng JSON chứa các màu sắc chủ đạo của tài nguyên';
comment on column studio_assets.created_at is 'Thời điểm tải lên tài nguyên';
comment on column studio_assets.updated_at is 'Thời điểm cập nhật tài nguyên gần nhất';

-- 15. BẢNG STUDIO_SLOT_RULES
comment on table studio_slot_rules is 'Quy tắc tương tác và ràng buộc giữa các slot trong Studio';
comment on column studio_slot_rules.id is 'Khóa chính định danh quy tắc (UUID)';
comment on column studio_slot_rules.template_id is 'Khóa ngoại tham chiếu đến mẫu studio_templates áp dụng quy tắc';
comment on column studio_slot_rules.rule_name is 'Tên hoặc mô tả ngắn gọn về quy tắc nghiệp vụ';
comment on column studio_slot_rules.condition_slot is 'Mã slot điều kiện để kích hoạt quy tắc';
comment on column studio_slot_rules.condition_value is 'Giá trị điều kiện kích hoạt dạng JSON';
comment on column studio_slot_rules.target_slot is 'Mã slot mục tiêu chịu tác động của quy tắc';
comment on column studio_slot_rules.action is 'Hành động thực thi: force_asset, restrict_assets, hide_slot';
comment on column studio_slot_rules.action_value is 'Tham số giá trị của hành động thực thi dạng JSON';
comment on column studio_slot_rules.priority is 'Độ ưu tiên áp dụng quy tắc khi có nhiều ràng buộc đồng thời';
