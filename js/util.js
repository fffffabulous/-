const log = console.log.bind(console);

const e = (selector) => {
    let element = document.querySelector(selector);
    return element
};

const eAll = (selector) => {
    let elements = document.querySelectorAll(selector);
    return elements
};

const bindEvent = (element, eventName, callback) => {
    element.addEventListener(eventName, function (event) {
        callback(event)
    })
};

const removeAllChild = (element) => {
    let elementSeletor = e(element);
    while (elementSeletor.hasChildNodes()) {
        elementSeletor.removeChild(elementSeletor.firstChild)
    }
};

const removeAllClass = (className) => {
    let elements = eAll("." + className);
    for (let i = 0; i < elements.length; i++) {
        let item = elements[i];
        item.classList.remove(className)
    }
};

var getIndexChild = (parent, index) => {
    let childrenArray = parent.children;
    return childrenArray[index]
}

const ajax = (request) => {
    let newRequest = new XMLHttpRequest();
    let method = request.method;
    newRequest.open(method, request.url, true)
    let contentType = request.contentType;
    if (contentType !== undefined) {
        newRequest.setRequestHeader("Content-Type", contentType)
    }
    newRequest.onreadystatechange = function () {
        if (newRequest.readyState === 4) {
            let response = newRequest.response;
            if (response.includes("error")) {
                request.callback("error")
            } else {
                let parseData = JSON.parse(newRequest.response);
                request.callback(parseData)
            }
        }
    }
    if (method === "GET") {
        newRequest.send()
        return
    }
    newRequest.send(request.data)
};

const transFloatToTime = (floatNum) => {
    let f = Math.floor(floatNum);
    let minNum = Math.floor(f / 60);
    let secNum = f - minNum * 60;
    if (minNum < 10) {
        minNum = `0${minNum}`
    }
    if (secNum < 10) {
        secNum = `0${secNum}`
    }
    return `${minNum}:${secNum}`
};
