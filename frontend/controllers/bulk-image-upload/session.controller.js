const appkey = 'BIU';

export const bulkImageSessionController = {
  create: (data) => {
    localStorage.setItem(appkey, JSON.stringify(data));
  },
  get: () => {
    const value = localStorage.getItem(appkey);
    return value && JSON.parse(value);
  },
  destroy: () => {
    localStorage.removeItem(appkey);
  },
  logout: () => {
    localStorage.removeItem(appkey);
  }
};

