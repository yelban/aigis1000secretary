
const fs = require('fs');
const config = require("./config.js");
const dbox = require("./dbox.js");

class Database {
    constructor(dbName, backup) {
        this.name = dbName;
        this.fileName = dbName + ".json";
        this.data = [];
        this.uploadTaskCount = -1;  // sec
        this.backup = backup;

        this.uploadCount = (28 * 60);
        this.sordMethod = function (A, B) { return A.name.localeCompare(B.name) };
    };

    newData() { };
    addData() { };

    toString() { return "Database: " + this.name + ", upload timer: " + this.uploadCount; };

    indexOf(key) {
        for (let i in this.data) {
            if (key && this.data[i].name.toUpperCase() == key.toUpperCase()) {
                return i;
            }
        }
        return -1;
    };

    // 儲存資料
    async saveDB() {
        console.log(this.name + " saving...");

        // sort
        this.data.sort(this.sordMethod);

        // object to json
        let json = config.isLocalHost ?
            JSON.stringify(this.data, null, 4) :
            JSON.stringify(this.data);

        try {
            fs.writeFileSync(this.fileName, json);
            console.log(this.name + " saved!");
            return true;
        } catch (error) {
            console.log(this.name + " saving error...");
            throw error;
        }
    };

    // 讀取資料
    async loadDB() {
        // console.log(this.name + " loading...");

        let obj = [];
        try {
            this.data = [];
            let data = fs.readFileSync(this.fileName);

            try {
                obj = JSON.parse(data);
            } catch (e) {
                obj = eval("(" + data + ")");
            }

            for (let i in obj) {
                // 建立樣板
                let newData = this.newData();

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
            return true;
        } catch (error) {
            console.log(this.name + " loading error...");
            throw error;
        }
    };

    // 下載
    async downloadDB() {
        // console.log(this.name + " downloading...");

        // download json
        try {
            await dbox.fileDownloadToFile(this.fileName)
            console.log(this.name + " downloaded!");
            return true;
        } catch (error) {
            console.log(this.name + " downloading error...");
            throw error;
        }
    };

    // 上傳備份
    async uploadDB() {
        if (config.isLocalHost) { console.log(this.name + " uploadDB(Dry)"); return true; }
        console.log(this.name + " uploading...");

        try {
            if (this.backup) { await dbox.fileBackup(this.fileName); }

            let binary = Buffer.from(JSON.stringify(this.data));
            await dbox.fileUpload(this.fileName, binary)

            console.log(this.name + " uploaded!");
            return true;
        } catch (error) {
            console.log(this.name + " uploading error...");
            throw error;
        }
    };

    // 延時上傳
    async uploadTask() {

        if (this.uploadTaskCount > 0) {
            // counting
            this.uploadTaskCount = config.isLocalHost ? 5 : this.uploadCount;
        } else {
            // start count
            this.uploadTaskCount = config.isLocalHost ? 5 : this.uploadCount;

            // count down and upload
            while (this.uploadTaskCount > 0) {
                await sleep(1000);
                this.uploadTaskCount--;
            }

            try {
                await this.saveDB()
                await this.uploadDB();
            } catch (error) {
                console.log(this.name + " Task upload error...\n");
                console.log(error);
            }
        }
    };

    // init
    async init() {
        try {
            await this.downloadDB();
            await this.loadDB();
            return true;
        } catch (error) {
            console.log(this.name + " init error...");
            throw error;
        }
    };
}

// Character Database
class CharaDatabase extends Database {
    constructor(dbName, backup) {
        super(dbName, backup);
        this.sordMethod = function (A, B) { return (A.rarity == B.rarity) ? A.name.localeCompare(B.name) : A.rarity.localeCompare(B.rarity) };
    };

    newData() {
        let data = {};
        data.name = "";
        data.ability = "";
        data.ability_aw = "";
        data.skill = "";
        data.skill_aw = "";
        data.urlName = "";

        data.rarity = "";
        data.class = "";

        data.getMessage = function () {
            let string = "";

            string += this.name + "　　" + this.rarity + "\n";

            let nickList = [];
            for (let i in nickDatabase.data) {
                if (nickDatabase.data[i].target == this.name) {
                    nickList.push("#" + nickDatabase.data[i].name);
                }
            }
            if (nickList.length > 0) {
                string += nickList.join(" ") + "\n";
            }

            if (this.ability != "") {
                string += "◇特：" + this.ability + "\n";
            }

            if (this.skill != "") {
                string += "◇技：" + this.skill + "\n";
            }

            if (this.ability_aw != "") {
                string += "◆特：" + this.ability_aw + "\n";
            }

            if (this.skill_aw != "") {
                string += "◆技：" + this.skill_aw + "\n";
            }

            return string;
        };
        data.getWikiUrl = function () {
            return "http://seesaawiki.jp/aigis/d/" + this.urlName;
        };

        return data;
    };

    addData(newData) {
        if (newData.name == "") return "";

        if (this.indexOf(newData.name) == -1) {
            this.data.push(newData);
            console.log("[+] Add     New character <" + newData.name + "> data!");
            return "anna " + newData.name + " New character data add!";

        } else {
            let i = this.indexOf(newData.name);
            let changed = false;

            let keys = ["ability", "ability_aw", "skill", "skill_aw", "rarity", "class", "urlName"];
            for (let j in keys) {
                let key = keys[j];
                if (this.data[i][key] == "" && newData[key]) {
                    if (newData[key] != "") { changed = true; }
                    this.data[i][key] = newData[key];
                }
            }

            if (changed) {
                console.log("[*] Update  character <" + newData.name + "> data!");
                return "anna " + newData.name + " New character data update!";
            } else {
                // if (config.isLocalHost) {
                //     console.log("[ ] Existed Character <" + newData.name + "> data no changed.");
                // }
                return "";
            }
        };
    };
}

// Nickname Database
class NickDatabase extends Database {
    newData() {
        let data = {};
        data.name = "";
        data.target = "";

        return data;
    };

    addData(name, nick) {
        if (name == "" || nick == "") return "";

        if (this.indexOf(nick) == -1) {
            let newData = this.newData();
            newData.name = nick;
            newData.target = name;
            this.data.push(newData);
        }
    };
}

// Class Database
class ClassDatabase extends Database {
    newData() {
        let data = {};
        data.name = "";
        data.index = [];
        data.type = "";

        return data;
    };

    addData(newClass) {
        if (newClass.name == "") return "";
        // console.log("New <" + newClass.name + "> Class data add...");

        if (this.indexOf(newClass.name) == -1) {
            this.data.push(newClass);
            console.log("New Class <" + newClass.name + "> add complete!");
            return "New Class <" + newClass.name + "> add complete!";

        } else {
            // console.log("Class <" + newClass.name + "> is existed!");
            return "";
        }
    };
}

// Group Database
class GroupDatabase extends Database {
    constructor(dbName, backup) {
        super(dbName, backup);
        this.uploadCount = (10 * 60);
    };

    newData() {
        let data = {};
        data.name = "";
        data.text = "";
        data.alarm = "";
        data.timestamp = "";

        return data;
    };

    addData(groupId, text, timestamp) {
        if (groupId == "" || text == "" || timestamp == "") return "";

        if (this.indexOf(groupId) == -1) {
            let newData = this.newData();
            newData.name = groupId;
            newData.text = text;
            newData.alarm = true;
            newData.timestamp = timestamp;
            this.data.push(newData);

            // sort
            this.data.sort(function (A, B) {
                return A.name.localeCompare(B.name)
            })

        } else {
            let i = this.indexOf(groupId);
            this.data[i].text = text;
            this.data[i].timestamp = timestamp;
        }
        this.uploadTask();
        return "";
    };
}

let groupDatabase = new GroupDatabase("GroupDatabase", false);
let charaDatabase = new CharaDatabase("CharaDatabase", true);
let nickDatabase = new NickDatabase("NickDatabase", true);
let classDatabase = new ClassDatabase("ClassDatabase", true);

module.exports = {
    groupDatabase: groupDatabase,
    charaDatabase: charaDatabase,
    nickDatabase: nickDatabase,
    classDatabase: classDatabase
};


/*
const debugFunc = async function () {
    let ClassDatabase = createNewDatabase("ClassDatabase");
    let a = ClassDatabase.indexOf("アコライト");
    console.log(a);
    await ClassDatabase.uploadDB();
}

setTimeout(debugFunc, 1 * 100);// */