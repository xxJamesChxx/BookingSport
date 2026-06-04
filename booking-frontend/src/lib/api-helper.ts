import Cookies from 'js-cookie';
// const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// export const getToken = () =>
//   localStorage.getItem("accessToken");

// export const setTokens = (accessToken: string, refreshToken: string) => {
//   localStorage.setItem("accessToken", accessToken);
//   localStorage.setItem("refreshToken", refreshToken);
// };

// export const clearTokens = () => {
//   localStorage.removeItem("accessToken");
//   localStorage.removeItem("refreshToken");
// };

// const buildHeaders = (extra: Record<string, string> = {}) => {
//   const token = getToken();
//   return {
//     "Content-Type": "application/json",
//     ...extra,
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//   };
// };

// const refreshAccessToken = async (): Promise<string | null> => {
//   const refreshToken = localStorage.getItem("refreshToken");

//   const res = await fetch(`${BASE_URL}/auth/refresh-token`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ refreshToken }),
//   });

//   if (!res.ok) {
//     clearTokens();
//     window.location.href = "/login";
//     return null;
//   }

//   const text = await res.text();
//   if (!text) return null;

//   try {
//     const data = JSON.parse(text);
//     const newToken = data.data.accessToken;
//     const newRefreshToken = data.data.refreshToken;
//     localStorage.setItem("accessToken", newToken);
//     localStorage.setItem("refreshToken", newRefreshToken); // ← อัพเดต RefreshToken ด้วย
//     return newToken;
//   } catch {
//     clearTokens();
//     window.location.href = "/login";
//     return null;
//   }
// };

// export const request = async (
//   url: string,
//   method: string,
//   body?: object,
//   extra?: Record<string, string>
// ) => {
//   const res = await fetch(`${BASE_URL}${url}`, {
//     method,
//     headers: buildHeaders(extra),
//     body: body ? JSON.stringify(body) : undefined,
//   });

//   // const text = await res.text();
//   // if (!text) return null;

//   try {
//     // const data = JSON.parse(text);

//     if (res.status === 401) {
//       const newToken = await refreshAccessToken();
//       if (!newToken) return null;
//       const retryRes = await fetch(`${BASE_URL}${url}`, {
//         method,
//         headers: {
//           "Content-Type": "application/json",
//           ...extra,
//           Authorization: `Bearer ${newToken}`,
//         },
//         body: body ? JSON.stringify(body) : undefined,
//       });

//       const retryText = await retryRes.text();
//       if (!retryText) return null;
//       return JSON.parse(retryText);
//     }
//     const text = await res.text();
//     if (!text) return null;
//     const data = JSON.parse(text);

//     return data;
//   } catch {
//     return null;
//   }
// };

// export const requestForm = async (
//   url: string,
//   method: string,
//   formData: FormData
// ) => {
//   const token = getToken();

//   const res = await fetch(`${BASE_URL}${url}`, {
//     method,
//     headers: token ? { Authorization: `Bearer ${token}` } : {},
//     body: formData,
//   });

//   if (res.status === 401) {
//     const newToken = await refreshAccessToken();
//     if (!newToken) return null;

//     const retryRes = await fetch(`${BASE_URL}${url}`, {
//       method,
//       headers: { Authorization: `Bearer ${newToken}` },
//       body: formData,
//     });

//     const retryText = await retryRes.text();
//     if (!retryText) return null;
//     return JSON.parse(retryText);
//   }

//   const text = await res.text();
//   if (!text) return null;

//   try {
//     return JSON.parse(text);
//   } catch {
//     return null;
//   }
// };

// export const getData = (url: string) =>
//   request(url, "GET");

// export const postData = (
//   url: string,
//   body?: object,
//   extra?: Record<string, string>
// ) => request(url, "POST", body, extra);

// export const putData = (url: string, body?: object) =>
//   request(url, "PUT", body);

// export const deleteData = (url: string) =>
//   request(url, "DELETE");

// export const postForm = (url: string, formData: FormData) =>
//   requestForm(url, "POST", formData);

// export const putForm = (url: string, formData: FormData) =>
//   requestForm(url, "PUT", formData);

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type RefreshSubscriber = (token: string) => void;

let isRefreshing = false;
let refreshSubscribers: RefreshSubscriber[] = [];

const subscribeTokenRefresh = (cb: RefreshSubscriber) => {
  refreshSubscribers.push(cb);
};

const onRrefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return Cookies.get("accessToken") || null;
};

export const setTokens = (accessToken: string, refreshToken: string, userName: string, roleName: string): void => {
  Cookies.set("accessToken", accessToken, { secure: true, sameSite: "lax" });
  Cookies.set("refreshToken", refreshToken, { secure: true, sameSite: "lax" });
  Cookies.set("userName", userName, { secure: true, sameSite: "lax" });
  Cookies.set("roleName", roleName, { secure: true, sameSite: "lax" });
};

export const clearTokens = (): void => {
  Cookies.remove("accessToken");
  Cookies.remove("refreshToken");
  Cookies.remove("userName");
  Cookies.remove("roleName");
};

const buildHeaders = (extra: Record<string, string> = {}): Record<string, string> => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = Cookies.get("refreshToken");
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) throw new Error("Refresh token expired or invalid");

    const text = await res.text();
    if (!text) return null;

    const responseData = JSON.parse(text);
    const newToken = responseData.data?.accessToken;
    const newRefreshToken = responseData.data?.refreshToken;
    const newUserName = responseData.data?.userName || Cookies.get("userName") || "";
    const newRoleName = responseData.data?.roleName || Cookies.get("roleName") || "";

    if (!newToken || !newRefreshToken) throw new Error("Invalid token");

    setTokens(newToken, newRefreshToken, newUserName, newRoleName);
    return newToken;
  } catch (error) {
    clearTokens();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }
};

export const baseRequest = async (
  url: string,
  method: string,
  body?: object | FormData,
  extra?: Record<string, string>
): Promise<any> => {
  const isFormData = body instanceof FormData;
  const token = getToken();

  const headers: Record<string, string> = isFormData
    ? { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...extra }
    : buildHeaders(extra);

  const config: RequestInit = {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  };

  try {
    const res = await fetch(`${BASE_URL}${url}`, config);

    if (res.status === 401) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken: string) => {
            config.headers = { ...config.headers, Authorization: `Bearer ${newToken}` };
            resolve(fetch(`${BASE_URL}${url}`, config).then(r => r.json()));
          });
        });
      }

      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;
      const response = await res.text();
      let data_res = null;
      try {
        data_res = response ? JSON.parse(response) : null;
      } catch {
        data_res = null;
      }
      if (!newToken) {
        return { message: data_res?.message || "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" };
      }

      onRrefreshed(newToken);
      config.headers = { ...config.headers, Authorization: `Bearer ${newToken}` };
      const retryRes = await fetch(`${BASE_URL}${url}`, config);

      const retryText = await retryRes.text();
      return retryText ? JSON.parse(retryText) : {};
    }

    const text = await res.text();
    if (!text) return {};

    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }

  } catch (error) {
    console.error("Network Exception:", error);
    return { message: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้" };
  }
};

export const getData = (url: string, extra?: Record<string, string>) =>
  baseRequest(url, "GET", undefined, extra);

export const postData = (url: string, body?: object, extra?: Record<string, string>) =>
  baseRequest(url, "POST", body, extra);

export const putData = (url: string, body?: object, extra?: Record<string, string>) =>
  baseRequest(url, "PUT", body, extra);

export const deleteData = (url: string, extra?: Record<string, string>) =>
  baseRequest(url, "DELETE", undefined, extra);

export const postForm = (url: string, formData: FormData, extra?: Record<string, string>) =>
  baseRequest(url, "POST", formData, extra);

export const putForm = (url: string, formData: FormData, extra?: Record<string, string>) =>
  baseRequest(url, "PUT", formData, extra);