const fs = require('fs');
const path = require('path');
const FileHandler = require('./FileHandler');
// lets first throw some regexes at these things, moving them to python later
class Extractor {
    constructor() {
        this.dict = this.initDict();
    }

    initDict() {
        let fileNames = FileHandler.getFiles('json', __dirname + '\\dictionaries')
        let dict = [];
        for (let i = 0; i < fileNames.length; i++) {
            const r = fs.readFileSync(fileNames[i], 'utf8', (err) => {
                if (err)
                    throw err;
            });
            dict.push(JSON.parse(r))
        }
        return dict;
    }

    extract(dirs) {
        const pod = []

        for (let i = 0; i < dirs.length; i++) {
            if (!dirs[i].endsWith('.txt'))
                continue

            let data = fs.readFileSync(dirs[i], 'utf8', function (err) {
                if (err) throw err;
            });
            data = JSON.stringify(data);
            let phone = data.match(/(\+[0-9]{2}|\+[0-9]{2}\(0\)|\(\+[0-9]{2}\)\(0\)|00[0-9]{2}|0)([0-9]{9}|[0-9\-\s]{10})/g)
            let email = data.match(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/)
            let object = {
                'file': dirs[i],
                'name': 'unknown',
                'email': email,
                'phone': phone,
            }
            for (let d of this.dict) {
                let matches = []
                for (let i = 0; i < d.data.length; i++) {
                    if (data.indexOf(d.data[i]) != -1) {
                        matches.push(d.data[i])
                    }
                }
                object[d.label] = matches
            }
            pod.push(object)
        }
        return pod;
    }
}
module.exports = new Extractor;