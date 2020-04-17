require('dotenv').config()
const TOKEN = '2e425b8eadd06a8054e813647cbf9c046eb5ffa5';
let Buffer = require('buffer/').Buffer

const PORT = 3000;
const username = 'obayanju';
let owner = 'expressjs';
let repo = 'express';
let jsFiles = [];

document.addEventListener('DOMContentLoaded', (event) => {
    let processCodeBtn = document.querySelector("#process-code");
    processCodeBtn.onclick = () => {
        processCode()
    }
    let parseUrlBtn = document.querySelector('#repo-input-btn');
    parseUrlBtn.onclick = () => {
        let urlTextEl = document.querySelector('#repo-input>textarea');
        parseGithubURL(urlTextEl.value);
    }
});

function processCode() {
    let outputEl = document.querySelector("#code-output>textarea");
    let inputEl = document.querySelector("#code-area");
    let text = inputEl.value;
    let req_body = {
        code: text,
    }
    fetch(`http://localhost:${PORT}`, {
        method: "POST",
        headers: {
            "Content-type": "application/json",
            'Authorization': `Basic ${new Buffer(username + ':' + TOKEN).toString('base64')}`
        },
        body: JSON.stringify(req_body),
    })
        .then((response) => response.json())
        .then((data) => {
            clear(outputEl)
            for (const token of data) {
                outputEl.innerHTML += token + '\n';
            }
        })
        .catch((error) => {
            console.error('Error:', error)
        })

}

async function sendCodeToInterpreter(code, filePath) {
    let req_body = {
        code: code,
        filePath: filePath
    }
    const url = `http://localhost:${PORT}/parse`
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-type": "application/json",
            'Authorization': `Basic ${new Buffer(username + ':' + TOKEN).toString('base64')}`
        },
        body: JSON.stringify(req_body)
    })
    const result = await response.json();
}

function clear(el) {
    el.innerHTML = ''
}

/**
 * Get all files in a directory
 */
async function getAllFiles(path) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const response = await fetch(url, {
        headers: {
            'Authorization': `Basic ${new Buffer(username + ':' + TOKEN).toString('base64')}`
        }
    });
    const result = await response.json();
    return result
}

function getJSRepos(filesArr) {
    filesArr.forEach(content => {
        if (content.type == 'file' && isJSFile(content.name)) {
            populateHTMLWithGithubURL(content)
            jsFiles.push({ path: content.path, html_url: content.html_url });
        }
        else if (content.type == 'dir') {
            getAllFiles(content.path).then(json => getJSRepos(json))
        }
    });
}

function isJSFile(fileName) {
    arr = fileName.split('');
    if (arr.length > 3 && arr.slice(-3).join('') == '.js') {
        return true;
    }
    return false;
}

async function loadCodeIntoDiv(item) {
    let inputEl = document.querySelector("#code-area");
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${item.path}`
    const response = await fetch(url, {
        headers: {
            'Authorization': `Basic ${new Buffer(username + ':' + TOKEN).toString('base64')}`
        }
    })
    const result = await response.json()
    inputEl.innerHTML = atob(result.content)
}

async function getContent(item) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${item.path}`
    const response = await fetch(url, {
        headers: {
            'Authorization': `Basic ${new Buffer(username + ':' + TOKEN).toString('base64')}`
        }
    })
    const result = await response.json()
    return result
}

function populateHTMLWithGithubURL(item) {
    let filesEl = document.querySelector('#js-files-section');
    let a = document.createElement('a');
    a.href = item.html_url;
    a.innerHTML = item.path;
    a.onclick = function () { loadCodeIntoDiv(item); return false }
    parts = item.path.split('')
    // ignore minified js
    if (parts[parts.length - 2] != 'min') {
        getContent(item).then(json => {
            sendCodeToInterpreter(atob(json.content), item.path)
        })
    }
    filesEl.appendChild(a);
    filesEl.appendChild(document.createElement('br'));
}

function parseGithubURL(url) {
    let parts = url.split('/');
    owner = parts[parts.length - 2]
    repo = parts[parts.length - 1]

    getAllFiles('').then(async result => {
        getJSRepos(result);
    });
}

