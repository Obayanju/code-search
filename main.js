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
    let outputEl = document.querySelector("#code-output>textarea");
    processCodeBtn.onclick = () => {
        let inputEl = document.querySelector("#code-area");
        let text = inputEl.value;
        let req_body = {
            code: text
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
                // console.log(data)
                for (const token of data) {
                    outputEl.innerHTML += token + '\n';
                }
            })
            .catch((error) => {
                console.error('Error:', error)
            })
    }
    let parseUrlBtn = document.querySelector('#repo-input-btn');
    parseUrlBtn.onclick = () => {
        let urlTextEl = document.querySelector('#repo-input>textarea');
        parseGithubURL(urlTextEl.value);
        // console.log(owner, repo);
    }
});

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

function populateHTMLWithGithubURL(item) {
    let filesEl = document.querySelector('#js-files-section');
    let a = document.createElement('a');
    a.href = item.html_url;
    a.innerHTML = item.path;
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

