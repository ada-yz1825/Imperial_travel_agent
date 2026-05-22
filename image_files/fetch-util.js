/* global brightNotify */

function showErrorFromFetch(errorMessagePrefix, errorMsg) {
    brightNotify.notifyErrorMessage(errorMessagePrefix + ': ' + errorMsg);
}

const fetchForRedirect = (retries, errorMessagePrefix, url, options = {}) =>
    fetch(url, options)
        .then(response => {
            if (response.status === 202 && retries > 0) {
                return fetchForRedirect(retries - 1, errorMessagePrefix, url, options);
            } else if (response.status === 303 || (response.ok && response.url !== url)) {
                // This should capture either the redirect: 'manual' or the redirect: 'follow' configuration in the request options
                window.location = response.url;
            } else if (response.status >= 400 && response.status <= 500) {
                const message = 'Error fetching data: ' + response.status + ' ' + response.statusText;
                throw new Error(message);
            } else {
                return response.text();
            }
        })
        .catch((err) => {
            showErrorFromFetch(errorMessagePrefix, err.message);
            console.error(err);
            return err.response.json();
        });

const fetchWithInterruptibleRetry = (errorMessagePrefix, url, interruptionUrl, options, messageEventDispatched, messageEventHandler, continueFunction) =>
    fetch(url, options)
        .then(response => {
            if (response.status === 202) {

                if (messageEventDispatched === false) {
                    window.dispatchEvent(new CustomEvent(messageEventHandler));
                    messageEventDispatched = true;
                }

                if (continueFunction()) {
                    return new Promise(resolve => setTimeout(resolve, 250))
                        .then(() => fetchWithInterruptibleRetry(errorMessagePrefix, url, interruptionUrl, options, messageEventDispatched, messageEventHandler, continueFunction));
                } else {
                    return fetch(interruptionUrl, options)
                        .then(response => {
                            if (response.status === 202) {
                                response.text().then(message => brightNotify.notifyConfirmMessage(message));
                            } else {
                                response.text().then(message => showErrorFromFetch(errorMessagePrefix, message));
                            }
                        });
                }
            } else if (response.status === 303 || (response.ok && response.url !== url)) {
                // This should capture either the redirect: 'manual' or the redirect: 'follow' configuration in the request options
                window.location = response.url;
            } else if (response.status >= 400 && response.status <= 500) {
                const message = 'Error fetching data: ' + response.status + ' ' + response.statusText;
                throw new Error(message);
            } else {
                return response.text();
            }
        })
        .catch((err) => {
            showErrorFromFetch(errorMessagePrefix, err.message);
            console.error(err);
            return err.response.json();
        });
