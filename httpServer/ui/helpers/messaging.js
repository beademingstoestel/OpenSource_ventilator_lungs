class MessagingCenter {
    subscriptions = {};

    subscribe(message, callback) {
        if (this.subscriptions[message]) {
            this.subscriptions[message].callbacks.push(callback);
        } else {
            this.subscriptions[message] = {
                callbacks: [
                    callback,
                ],
            };
        }
    }

    unsubscribe(message, callback) {
        if (this.subscriptions[message]) {
            var callbackIndex = this.subscriptions[message].callbacks.indexOf(callback);
            if (callbackIndex > -1) {
                this.subscriptions[message].callbacks.splice(callbackIndex, 1);
            }
        }
    }

    send(message, data) {
        if (this.subscriptions[message]) {
            this.subscriptions[message].callbacks.forEach((callback) => callback(data));
        }
    }
};

export default new MessagingCenter();
