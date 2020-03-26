function getApiUrl() {
    return `${process.env.dbProtocol}://${window.location.hostname}:${process.env.dbPort}`;
};

function getWsUrl() {
    return `ws://${window.location.hostname}:${process.env.dbPort}`;
};

export { getApiUrl, getWsUrl };
