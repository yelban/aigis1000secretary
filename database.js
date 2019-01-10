
const fs = require("fs");
const dbox = require("./dbox.js");

module.exports = {
    createNewDataBase: function (dbName) { return createNewDataBase(dbName); },
};

createNewDataBase = function (dbName) {
    var newDB = {};
    newDB.name = dbName;
    newDB.fileName = dbName + ".json";
    newDB.data = [];
    newDB.uploadTaskId = null;

    newDB.newData = function () {
        return {};
    }

    newDB.indexOf = function (key) {
        if (typeof (key) == "undefined") {
            return -1;
        }

        for (let i in newDB.data) {
            if (newDB.data[i].name.toUpperCase() == key.toUpperCase()) {
                return i;
            }
        }
        return -1;
    };

    // 儲存資料
    newDB.saveDB = async function () {
        console.log(this.name + " saving...");

        // sort
        this.data.sort(function (A, B) {
            return A.name.localeCompare(B.name)
        })

        // object to json
        var json = JSON.stringify(this.data);

        try {
            await asyncSaveFile(this.fileName, json);
            console.log(this.name + " saved!");
        } catch (err) {
            console.log(err);
        }
    };

    // 讀取資料
    newDB.loadDB = async function () {
        console.log(this.name + " loading...");

        let obj = [];
        try {
            let data = await asyncReadFile(this.fileName);

            try {
                obj = JSON.parse(data);
            } catch (e) {
                obj = eval("(" + data + ")");
            }

            for (let i in obj) {
                // 建立樣板
                var newData = this.newData();

                // 讀取參數
                for (let key in obj[i]) {
                    if (typeof (newData[key]) != "undefined") {
                        newData[key] = obj[i][key];
                    }
                }
                if (this.data.indexOf(newData.name) == -1) {
                    this.data.push(newData);
                }
            }

            console.log(this.name + " loaded!");
        } catch (err) {
            console.log(err);
        }
    };

    newDB.downloadDB = async function () {
        console.log(this.name + " downloading...");

        // download json
        await dbox.fileDownload(this.fileName, this.fileName);

        console.log(this.name + " downloaded!");
    };

    // 上傳備份
    newDB.uploadDB = async function () {
        console.log(this.name + " uploading...");

        // object to json
        var binary = new Buffer.from(JSON.stringify(this.data));
        await dbox.filesBackup(this.fileName);
        await dbox.fileUpload(this.fileName, binary);

        clearTimeout(this.uploadTaskId);
        console.log(this.name + " uploaded!");
    };

    newDB.uploadTask = async function () {
        clearTimeout(this.uploadTaskId);
        await this.saveDB();
        this.uploadTaskId = setTimeout(this.uploadDB, 25 * 60 * 1000);
    };

    return newDB;
}











// readfile
const asyncReadFile = function (filePath) {
    return new Promise(function (resolve, reject) {
        fs.readFile(filePath, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}
// json to file
const asyncSaveFile = function (filePath, data) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(filePath, data, "utf8", function (err, bytesRead, buffer) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}



/*
const debugFunc = async function () {
    let ClassDataBase = createNewDataBase("ClassDataBase");
    await ClassDataBase.downloadDB();
    await ClassDataBase.loadDB();
    let a = ClassDataBase.indexOf("アコライト");
    console.log(a);
    await ClassDataBase.saveDB();
    await ClassDataBase.uploadDB();


}

setTimeout(debugFunc, 1 * 100);//*/