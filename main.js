const dotenv = require('dotenv').config({ debug: process.env.DEBUG })
console.log(process.env.TOKEN);
let Buffer = require('buffer/').Buffer

const PORT = 3000;
const username = 'obayanju', token = process.env.TOKEN;
let owner = 'obayanju';
let repo = 'code-search';
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
                'Authorization': `Basic ${new Buffer(username + ':' + token).toString('base64')}`
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
});

/**
 * Get all files in a directory
 */
async function getAllFiles(path) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const response = await fetch(url, {
        headers: {
            'Authorization': `Basic ${new Buffer(username + ':' + token).toString('base64')}`
        }
    });
    const result = await response.json();
    return result
}

function getJSRepos(filesArr) {
    filesArr.forEach(content => {
        if (content.type == 'file' && isJSFile(content.name)) {
            // console.log(content.path, content.html_url)
            jsFiles.push({ path: content.path, htmlURL: content.html_url });
        }
        else if (content.type == 'dir') {
            getAllFiles(content.path).then(json => getJSRepos(json));
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

let filesJSON = [];
getAllFiles('').then(result => {
    getJSRepos(result);
    console.log(jsFiles);
});