export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  data?: unknown;
  params?: Record<string, string | undefined | null | number | boolean>;
}

interface FormDataRequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string>;
}

const genericStatusMessages: Record<number, string> = {
  400: "Thông tin gửi lên chưa hợp lệ. Vui lòng kiểm tra lại.",
  401: "Bạn cần đăng nhập để tiếp tục.",
  403: "Bạn không có quyền thực hiện thao tác này.",
  404: "Không tìm thấy dữ liệu phù hợp.",
  409: "Dữ liệu đã tồn tại hoặc bị trùng.",
  422: "Thông tin chưa đáp ứng điều kiện xử lý.",
  429: "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.",
  500: "Hệ thống đang gặp lỗi. Vui lòng thử lại sau.",
  502: "Máy chủ đang tạm thời gián đoạn. Vui lòng thử lại sau.",
  503: "Dịch vụ đang tạm thời chưa sẵn sàng. Vui lòng thử lại sau.",
  504: "Kết nối tới máy chủ quá lâu. Vui lòng thử lại sau.",
};

const exactMessageTranslations: Record<string, string> = {
  "password reset account not found": "Email chưa được đăng ký hoặc tài khoản chưa hoạt động.",
  "password reset email could not be sent":
    "Chưa gửi được mã xác nhận qua email. Vui lòng thử lại sau hoặc liên hệ Admin.",
  "account is not active": "Tài khoản chưa hoạt động hoặc đã bị khóa.",
  "booking change request not found": "Không tìm thấy yêu cầu đổi lịch booking.",
  "booking not found": "Không tìm thấy booking.",
  "booking cannot be rescheduled in its current state": "Booking hiện tại không thể đổi lịch.",
  "booking already has a pending reschedule request":
    "Booking này đã có yêu cầu đổi lịch đang chờ duyệt.",
  "booking can only be rescheduled at least 1 hour before scheduled time":
    "Chỉ có thể đổi lịch trước giờ đặt tối thiểu 1 tiếng.",
  "bill has already been verified": "Hóa đơn này đã được xác nhận.",
  "cancelled booking cannot be rescheduled": "Booking đã hủy không thể đổi lịch.",
  "cast not found": "Không tìm thấy cast.",
  "cast does not belong to selected store": "Cast không thuộc quán đã chọn.",
  "city must be hn, hcm, or all": "Thành phố chỉ được chọn Hà Nội, TP.HCM hoặc tất cả.",
  "code must be a 6 digit number": "Mã xác nhận phải gồm 6 chữ số.",
  "content not found": "Không tìm thấy nội dung.",
  "content slug already exists": "Đường dẫn nội dung này đã tồn tại.",
  "coupon issue not found": "Không tìm thấy mã ưu đãi đã lưu.",
  "coupon issue does not belong to the booking store": "Mã ưu đãi không thuộc quán đang đặt.",
  "coupon issue does not belong to the bill store": "Mã ưu đãi không thuộc quán của hóa đơn.",
  "coupon issue is already linked to a booking": "Mã ưu đãi này đã được liên kết với một booking.",
  "coupon issue is already linked to a bill": "Mã ưu đãi này đã được liên kết với một hóa đơn.",
  "coupon issue does not belong to this member": "Mã ưu đãi này không thuộc tài khoản của bạn.",
  "coupon issue phone does not match booking phone":
    "Số điện thoại của mã ưu đãi không khớp với booking.",
  "coupon issue is not available for booking": "Mã ưu đãi này chưa thể dùng để đặt chỗ.",
  "coupon issue is not available for bill reconciliation":
    "Mã ưu đãi này chưa thể đối soát hóa đơn.",
  "coupon issue has expired": "Mã ưu đãi đã hết hạn.",
  "coupon issue is not usable": "Mã ưu đãi không còn sử dụng được.",
  "coupon not found": "Không tìm thấy ưu đãi.",
  "couponid must match couponissue.couponid": "Mã coupon không khớp với mã ưu đãi đã lưu.",
  "couponid must match the booking couponid": "Mã coupon không khớp với booking.",
  "couponissueid must match the booking couponissueid": "Mã ưu đãi đã lưu không khớp với booking.",
  "displayname and phone are required": "Vui lòng nhập họ tên và số điện thoại.",
  "displayname and email are required": "Vui lòng nhập họ tên và email.",
  "displayname must contain letters and spaces only": "Họ tên chỉ được nhập chữ cái và khoảng trắng.",
  "file is required": "Vui lòng chọn file để tải lên.",
  "email is already registered": "Email này đã được đăng ký.",
  "google account is not active": "Tài khoản Google chưa hoạt động hoặc đã bị khóa.",
  "google credential or access token required": "Thiếu thông tin xác thực Google.",
  "google login is not configured": "Đăng nhập Google chưa được cấu hình.",
  "guest coupon issue requires a linked booking for member bill submission":
    "Mã ưu đãi của khách cần liên kết với booking khi gửi hóa đơn bằng tài khoản hội viên.",
  "invalid coupon qr payload": "Mã QR ưu đãi không hợp lệ.",
  "invalid coupon qr signature": "Chữ ký mã QR ưu đãi không hợp lệ.",
  "invalid email or password": "Email hoặc mật khẩu không đúng.",
  "invalid google access token": "Phiên đăng nhập Google không hợp lệ.",
  "invalid google credential": "Thông tin đăng nhập Google không hợp lệ.",
  "invalid or expired password reset code": "Mã xác nhận không đúng hoặc đã hết hạn.",
  "invalid or expired password reset session": "Phiên đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu mã mới.",
  "invalid line authorization code": "Mã xác thực LINE không hợp lệ.",
  "invalid line id token": "Phiên đăng nhập LINE không hợp lệ.",
  "line login is not configured": "Đăng nhập LINE chưa được cấu hình.",
  "line login state is invalid. please try again":
    "Phiên đăng nhập LINE không hợp lệ. Vui lòng thử lại.",
  "line did not return a verified email address. please approve email permission and try again":
    "LINE chưa trả về email đã xác thực. Vui lòng đồng ý chia sẻ email rồi thử lại.",
  "line account is not active": "Tài khoản LINE chưa hoạt động hoặc đã bị khóa.",
  "this line account is not a member account": "Tài khoản LINE này không phải tài khoản hội viên.",
  "media file not found": "Không tìm thấy file đã tải lên.",
  "member coupon issue cannot be linked to a guest booking":
    "Mã ưu đãi hội viên không thể dùng cho booking khách vãng lai.",
  "message is required": "Vui lòng nhập tin nhắn.",
  "new booking time must be in the future": "Thời gian đặt mới phải ở tương lai.",
  "partner request not found": "Không tìm thấy hồ sơ đối tác.",
  "payload is required": "Thiếu dữ liệu gửi lên.",
  "phone is required": "Vui lòng nhập số điện thoại.",
  "phone must be a valid phone number": "Số điện thoại chưa đúng định dạng.",
  "password confirmation does not match": "Mật khẩu nhập lại chưa khớp.",
  "password reset email is not configured": "Chưa cấu hình gửi email đặt lại mật khẩu. Vui lòng liên hệ Admin.",
  "possible duplicate bill submission": "Bill này có dấu hiệu bị gửi trùng. Vui lòng kiểm tra lại.",
  "ranking config not found": "Không tìm thấy cấu hình xếp hạng.",
  "ranking target not found": "Không tìm thấy mục xếp hạng.",
  "scheduledat must be a valid iso date": "Thời gian đặt chỗ không hợp lệ.",
  "scheduledat cannot be in the past": "Thời gian đặt chỗ không được ở quá khứ.",
  "slug is required": "Thiếu mã đường dẫn.",
  "store not found": "Không tìm thấy quán.",
  "storeid or storeslug is required": "Vui lòng chọn quán.",
  "sort=nearest requires lat and lng": "Sắp xếp theo gần nhất cần bật vị trí.",
  "startsat must be before endsat": "Thời gian bắt đầu phải trước thời gian kết thúc.",
  "targettype must be cast or store": "Loại xếp hạng phải là cast hoặc quán.",
  "this google account is not a member account":
    "Tài khoản Google này không phải tài khoản hội viên.",
  "token has been revoked": "Phiên đăng nhập đã hết hiệu lực. Vui lòng đăng nhập lại.",
  "token session is not active": "Phiên đăng nhập không còn hiệu lực. Vui lòng đăng nhập lại.",
  "too many bill submissions. please try again later":
    "Bạn gửi bill quá nhanh. Vui lòng chờ một chút rồi thử lại.",
  "type must be blog or policy": "Loại nội dung phải là blog hoặc chính sách.",
  unauthorized: "Bạn cần đăng nhập để tiếp tục.",
  "forbidden resource": "Bạn không có quyền thực hiện thao tác này.",
  "usedat cannot be in the future": "Thời gian sử dụng không được ở tương lai.",
  "usedat must be a valid iso date": "Thời gian sử dụng không hợp lệ.",
  "unsupported file type. upload image, video, or pdf files only":
    "File không đúng định dạng. Vui lòng tải ảnh, video hoặc PDF.",
  "you cannot access this media file": "Bạn không có quyền xem file này.",
  "user not found": "Không tìm thấy tài khoản.",
  "access must be public or protected": "Quyền truy cập file không hợp lệ.",
  "hasactivecoupon must be true or false": "Bộ lọc ưu đãi đang có không hợp lệ.",
  "lat and lng must be provided together": "Vui lòng gửi đủ vĩ độ và kinh độ.",
  "lat/lng must be valid coordinates": "Tọa độ vị trí không hợp lệ.",
  "bookingcode must be a valid booking code": "Mã booking không hợp lệ.",
  "limit must be a positive number": "Số lượng hiển thị phải lớn hơn 0.",
  "page must be a positive number": "Số trang phải lớn hơn 0.",
  "offset must be zero or a positive number": "Vị trí bắt đầu phải từ 0 trở lên.",
  "scope must be at most 40 characters": "Phạm vi không được vượt quá 40 ký tự.",
  "startsat must be a valid date": "Thời gian bắt đầu không hợp lệ.",
  "endsat must be a valid date": "Thời gian kết thúc không hợp lệ.",
  "days must be an integer from 1 to 365": "Số ngày phải là số nguyên từ 1 đến 365.",
};

const fieldLabels: Record<string, string> = {
  access: "Quyền truy cập",
  area: "Khu vực",
  bookingCode: "Mã booking",
  bookingId: "Booking",
  businessName: "Tên quán/cơ sở",
  businessType: "Loại hình kinh doanh",
  cancelCutoffMinutes: "Thời gian hủy",
  castId: "Cast",
  castSlug: "Cast",
  city: "Thành phố",
  contactEmail: "Email liên hệ",
  contactName: "Người liên hệ",
  contactPhone: "Số điện thoại liên hệ",
  couponId: "Coupon",
  couponIssueId: "Mã ưu đãi đã lưu",
  code: "Mã xác nhận",
  confirmPassword: "Nhập lại mật khẩu",
  displayName: "Họ tên",
  email: "Email",
  endsAt: "Thời gian kết thúc",
  lat: "Vĩ độ",
  lng: "Kinh độ",
  message: "Tin nhắn",
  note: "Ghi chú",
  page: "Trang",
  partySize: "Số người",
  password: "Mật khẩu",
  phone: "Số điện thoại",
  reason: "Lý do",
  resetToken: "Phiên đặt lại mật khẩu",
  scheduledAt: "Thời gian đặt chỗ",
  startsAt: "Thời gian bắt đầu",
  storeId: "Quán",
  storeSlug: "Quán",
  totalVnd: "Tổng tiền",
  usedAt: "Thời gian sử dụng",
};

const fieldLabel = (field: string) => fieldLabels[field] ?? field;

const normalizeKey = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[."']+$/g, "")
    .toLowerCase();

const translateSingleApiMessage = (message: string, status?: number, fallback?: string) => {
  const trimmed = message.trim();
  if (!trimmed) {
    return (
      fallback ??
      (status ? genericStatusMessages[status] : undefined) ??
      "Đã xảy ra lỗi. Vui lòng thử lại."
    );
  }

  const key = normalizeKey(trimmed);
  const exact = exactMessageTranslations[key];
  if (exact) return exact;

  if (status && status >= 500) {
    return genericStatusMessages[status] ?? "Hệ thống đang gặp lỗi. Vui lòng thử lại sau.";
  }

  const notEmptyMatch = key.match(/^([a-zA-Z][\w.]*) should not be empty$/);
  if (notEmptyMatch) return `Vui lòng nhập ${fieldLabel(notEmptyMatch[1] ?? "")}.`;

  const emailMatch = key.match(/^([a-zA-Z][\w.]*) must be an email$/);
  if (emailMatch) return `${fieldLabel(emailMatch[1] ?? "")} chưa đúng định dạng.`;

  const stringMatch = key.match(/^([a-zA-Z][\w.]*) must be a string$/);
  if (stringMatch) return `${fieldLabel(stringMatch[1] ?? "")} phải là chữ.`;

  const uuidMatch = key.match(/^([a-zA-Z][\w.]*) must be a uuid$/);
  if (uuidMatch) return `${fieldLabel(uuidMatch[1] ?? "")} không hợp lệ.`;

  const intMatch = key.match(/^([a-zA-Z][\w.]*) must be an integer number$/);
  if (intMatch) return `${fieldLabel(intMatch[1] ?? "")} phải là số nguyên.`;

  const isoMatch = key.match(/^([a-zA-Z][\w.]*) must be a valid iso 8601 date string$/);
  if (isoMatch) return `${fieldLabel(isoMatch[1] ?? "")} không hợp lệ.`;

  const dateMatch = key.match(/^([a-zA-Z][\w.]*) must be a valid iso date$/);
  if (dateMatch) return `${fieldLabel(dateMatch[1] ?? "")} không hợp lệ.`;

  const minLengthMatch = key.match(
    /^([a-zA-Z][\w.]*) must be longer than or equal to (\d+) characters$/,
  );
  if (minLengthMatch)
    return `${fieldLabel(minLengthMatch[1] ?? "")} cần tối thiểu ${minLengthMatch[2]} ký tự.`;

  const maxLengthMatch = key.match(
    /^([a-zA-Z][\w.]*) must be shorter than or equal to (\d+) characters$/,
  );
  if (maxLengthMatch)
    return `${fieldLabel(maxLengthMatch[1] ?? "")} không được vượt quá ${maxLengthMatch[2]} ký tự.`;

  const minNumberMatch = key.match(/^([a-zA-Z][\w.]*) must not be less than (\d+)$/);
  if (minNumberMatch)
    return `${fieldLabel(minNumberMatch[1] ?? "")} phải từ ${minNumberMatch[2]} trở lên.`;

  const maxNumberMatch = key.match(/^([a-zA-Z][\w.]*) must not be greater than (\d+)$/);
  if (maxNumberMatch)
    return `${fieldLabel(maxNumberMatch[1] ?? "")} không được lớn hơn ${maxNumberMatch[2]}.`;

  const passwordRuleMatch = key.match(
    /^password must contain at least one lowercase letter, one uppercase letter, and one number$/,
  );
  if (passwordRuleMatch) return "Mật khẩu cần có chữ thường, chữ hoa và chữ số.";

  const roleMatch = key.match(/^this account is not a ([a-z_]+) account$/);
  if (roleMatch) return "Tài khoản này không đúng vai trò để đăng nhập.";

  const billDeadlineMatch = key.match(
    /^bill can only be submitted within (\d+) days of usage time$/,
  );
  if (billDeadlineMatch)
    return `Chỉ có thể gửi hóa đơn trong vòng ${billDeadlineMatch[1]} ngày từ thời gian sử dụng.`;

  const bookingWindowMatch = key.match(/^scheduledat can only be within (\d+) days$/);
  if (bookingWindowMatch)
    return `Ngày đặt bàn chỉ được chọn từ hôm nay đến ${bookingWindowMatch[1]} ngày tới.`;

  const rescheduleCutoffMatch = key.match(
    /^booking can only be rescheduled at least (\d+) minutes before scheduled time$/,
  );
  if (rescheduleCutoffMatch) {
    return `Chỉ có thể đổi lịch trước giờ đặt tối thiểu ${rescheduleCutoffMatch[1]} phút.`;
  }

  if (key.includes("must be one of the following values")) {
    const field = trimmed.split(" ")[0] ?? "";
    return `${fieldLabel(field)} có giá trị chưa hợp lệ.`;
  }

  if (key.includes("not found")) return "Không tìm thấy dữ liệu phù hợp.";
  if (key.includes("must be")) return "Thông tin nhập vào chưa hợp lệ. Vui lòng kiểm tra lại.";
  if (key.includes("is required") || key.includes("required"))
    return "Vui lòng nhập đầy đủ thông tin bắt buộc.";
  if (key.includes("invalid")) return "Thông tin không hợp lệ. Vui lòng kiểm tra lại.";

  return trimmed;
};

export const translateApiMessage = (
  message: unknown,
  status?: number,
  fallback?: string,
): string => {
  if (Array.isArray(message)) {
    return message
      .map((item) => translateSingleApiMessage(String(item), status, fallback))
      .filter(Boolean)
      .join(" ");
  }

  if (typeof message === "string") {
    return translateSingleApiMessage(message, status, fallback);
  }

  return (
    fallback ??
    (status ? genericStatusMessages[status] : undefined) ??
    "Đã xảy ra lỗi. Vui lòng thử lại."
  );
};

const readApiErrorMessage = (payload: unknown, status: number, fallback: string) => {
  if (payload && typeof payload === "object") {
    const body = payload as { message?: unknown; error?: unknown };
    return translateApiMessage(body.message ?? body.error, status, fallback);
  }

  return translateApiMessage(undefined, status, fallback);
};

const normalizeApiBaseUrl = (value: string) => value.replace(/\/api\/?$/, "").replace(/\/$/, "");

const toHttpUrl = (value: string) => {
  try {
    const url = new URL(normalizeApiBaseUrl(value));
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
};

const isLoopbackUrl = (value: string) => {
  const url = toHttpUrl(value);
  return Boolean(
    url && (url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "::1"),
  );
};

export const resolveClientUrl = (url?: string | null) => {
  if (!url || typeof url !== "string") return url;
  if (typeof window === "undefined") return url;

  const isLocalHost =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const prefix = isLocalHost ? "http://localhost:3001" : "/api/backend";

  if (url.startsWith("http://localhost:3001")) {
    return url.replace("http://localhost:3001", prefix);
  }

  if (url.startsWith("https://demonightlight.test9.io.vn/api/backend")) {
    return url.replace("https://demonightlight.test9.io.vn/api/backend", prefix);
  }

  return url;
};

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    const isLocalHost =
      window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL;

    if (configuredBaseUrl) {
      const normalizedBaseUrl = normalizeApiBaseUrl(configuredBaseUrl);

      if (!isLocalHost && isLoopbackUrl(normalizedBaseUrl)) {
        return "/api/backend";
      }

      return normalizedBaseUrl;
    }

    return isLocalHost ? "http://localhost:3001" : "/api/backend";
  }

  const isProduction = process.env.NODE_ENV === "production";
  const serverBaseUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;

  if (
    serverBaseUrl &&
    toHttpUrl(serverBaseUrl) &&
    !(isProduction && !process.env.BACKEND_API_URL && isLoopbackUrl(serverBaseUrl))
  ) {
    return normalizeApiBaseUrl(serverBaseUrl);
  }

  if (isProduction) {
    throw new ApiError(503, "Thiếu BACKEND_API_URL cho server frontend production.");
  }

  return "http://localhost:3001";
};

export const getAuthToken = () => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )auth_token=([^;]+)"));
  if (match && match[2]) {
    try {
      return decodeURIComponent(match[2]);
    } catch {
      return null;
    }
  }
  return null;
};

export const buildApiUrl = (endpoint: string, params?: RequestOptions["params"]) => {
  let url = endpoint.startsWith("http") ? endpoint : `${getBaseUrl()}/${endpoint.replace(/^\//, "")}`;

  if (params) {
    const cleanParams = Object.fromEntries(
      Object.entries(params)
        .filter((entry) => entry[1] !== undefined && entry[1] !== null && entry[1] !== "")
        .map(([key, value]) => [key, String(value)]),
    );
    const searchParams = new URLSearchParams(cleanParams);
    url += `?${searchParams.toString()}`;
  }

  return url;
};

export const apiClient = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  const { data, params, headers: customHeaders, ...customConfig } = options;

  const url = buildApiUrl(endpoint, params);
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: data ? "POST" : "GET",
    ...customConfig,
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorMessage = translateApiMessage(
      undefined,
      response.status,
      "Không tải được dữ liệu. Vui lòng thử lại.",
    );
    try {
      const errorData = await response.json();
      errorMessage = readApiErrorMessage(errorData, response.status, errorMessage);
    } catch {
      // Ignored
    }
    throw new ApiError(response.status, errorMessage);
  }

  // Handle empty responses (like 204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
};

export const apiFormDataClient = async <T>(
  endpoint: string,
  formData: FormData,
  options: FormDataRequestOptions = {},
): Promise<T> => {
  const { params, headers: customHeaders, ...customConfig } = options;
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(customHeaders as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildApiUrl(endpoint, params), {
    method: "POST",
    ...customConfig,
    headers,
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = translateApiMessage(
      undefined,
      response.status,
      "Không tải file lên được. Vui lòng thử lại.",
    );
    try {
      const errorData = await response.json();
      errorMessage = readApiErrorMessage(errorData, response.status, errorMessage);
    } catch {
      // Ignored
    }
    throw new ApiError(response.status, errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
};
