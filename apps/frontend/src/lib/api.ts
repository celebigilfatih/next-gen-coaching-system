/**
 * API helper functions for making authenticated requests
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface FetchOptions extends Omit<RequestInit, "headers"> {
  token?: string;
  headers?: Record<string, string>;
}

/**
 * Makes an authenticated API request
 */
export async function fetchAPI(endpoint: string, options: FetchOptions = {}) {
  const { token, headers: customHeaders, ...fetchOptions } = options;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(customHeaders || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
    credentials: "include",
  });

  return response;
}

/**
 * Makes a GET request
 */
export async function getAPI(endpoint: string, token?: string) {
  return fetchAPI(endpoint, { method: "GET", token });
}

/**
 * Makes a POST request
 */
export async function postAPI(endpoint: string, data: any, token?: string) {
  return fetchAPI(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Makes a PUT request
 */
export async function putAPI(endpoint: string, data: any, token?: string) {
  return fetchAPI(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Makes a DELETE request
 */
export async function deleteAPI(endpoint: string, token?: string) {
  return fetchAPI(endpoint, { method: "DELETE", token });
}

/**
 * Makes a PATCH request
 */
export async function patchAPI(endpoint: string, data: any, token?: string) {
  return fetchAPI(endpoint, {
    method: "PATCH",
    body: JSON.stringify(data),
    token,
  });
}
