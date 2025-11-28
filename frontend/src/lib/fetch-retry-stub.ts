// Stub for fetch-retry to prevent import errors in browser
// Returns the native fetch function for browser environments
const fetchRetry = (url: string, options?: RequestInit) => fetch(url, options);

export default fetchRetry;
export { fetchRetry };
