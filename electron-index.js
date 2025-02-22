console.log("Start");

const { app, BrowserWindow, ipcMain, dialog, autoUpdater, protocol } = require('electron');
const utils = require('util');
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
const { convert,convertFile } = require('convert-svg-to-png');
const {exec} = require("child_process");

const https = require("https");
const extracter = require("extract-zip");

console.log(process.platform);


let mysql_options = {
    host: "localhost",
    user: 'root',
    port: 3306,
    password: '',
    fileName: 'mysql_options.json'
};
const barcodesFolderPath = path.join(__dirname,'/barcodes/');
function checkMysqlOptions() {
    let mysql_options_path = mysql_options.fileName;
    if (fs.existsSync(mysql_options_path)) {
        let data = fs.readFileSync(mysql_options_path,{encoding:'utf-8'});
        mysql_options = JSON.parse(data);
    } else {
        fs.appendFile(mysql_options_path, JSON.stringify(mysql_options),(err)=>{console.log(err);});
    }
}
checkMysqlOptions();

async function getGitRest(relPath) {
    const defPath = `https://api.github.com/repos/MarekSinekvic/demo-app/`;
    const fullPath = path.join(defPath,relPath);

    return new Promise((resolve,reject)=>{
        let data = '';
        https.get(fullPath,{headers: {
            'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1521.3 Safari/537.36'
        }},(res)=>{
            res.on("data",c=>data += c);
            res.on("end", ()=>{
                data = JSON.parse(data);
                if (typeof(data.message) !== 'undefined') {
                    resolve("error");
                    return;
                }
                if (typeof (data.content) !== 'undefined')
                    resolve({...data,content: Buffer.from(data.content,'base64').toString('utf-8')})
                else
                    resolve({...data});
            });
        });
    })
}

let options = {
    fileName: 'options.json',
    updateServer: 'demo-7cu55vvh0-mareksinekvics-projects.vercel.app',
    version: '0.1.0'
};
function checkOptions() {
    let options_path = options.fileName;
    try {
        fs.accessSync(options_path);
        let data = fs.readFileSync(options_path,{encoding:'utf-8'});
        options = JSON.parse(data);
    } catch (error) {
        fs.appendFile(options_path, JSON.stringify(options),(err)=>{console.log(err);});
    }
}
checkOptions();

/*
    async function CheckUpdates() {
    // let zipFile = '';
    let chunksStep = 0;
    return;
    return new Promise((resolve,reject)=>{
        exec("node -v", async (err, out)=>{
            if (err !== null) {
                resolve({status: "no-node"});
                sendLog(err);
            } else {
                const file = await getGitRest("/git/blobs/704237f26b23eb17acbafcb8fc70b4be64ae644e");
                const data = JSON.parse(file.content);
                console.log(options.version, data);
                if (data.version != options.version) { // && typeof (data.version) !== 'undefined'
                    console.log('old version, should download new');
                    sendLog("new version available");

                    resolve({status:"new-version",newVersion:data.version, oldVersion:options.version});
                    
                    try {
                        fs.accessSync("new");
                    } catch (error) {
                        fs.mkdirSync("new");
                    }
                    https.get("https://codeload.github.com/MarekSinekvic/demo-app/zip/refs/heads/main", (res)=>{
                        // console.log(res.statusCode);
                        res.on("data",c=>{
                            // zipFile+=c;
                            if (chunksStep == 0) {
                                console.log(typeof(c));
                                console.log(c);
                            }
                            console.log(chunksStep);
                            fs.appendFile("new/demo-app.zip",c,{encoding: 'binary'},(err)=>{});
                            chunksStep++;
                        });
                        res.on("end", async()=>{
                            console.log("downloaded");
                            try {
                                await extracter("new/demo-app.zip", {dir:path.join(__dirname,"new")});
                                console.log("extracted");
                            } catch (error) {
                                console.log(error);
                            }
                        });
                    });
                } else {
                    resolve({status:"last-version",newVersion:data.version, oldVersion:options.version});
                }
            }
        });
    });
}
*/
//CheckUpdates();
// require('update-electron-app')({
//     updateSource: {
//         type: UpdateSourceType.StaticStorage,
//         baseUrl: `https://my-bucket.s3.amazonaws.com/my-app-updates/${process.platform}/${process.arch}`
//     }
// });

console.log(app.isPackaged, process.platform, app.getVersion());

// this.onerror = (event,src,ln,cn,error) => {ipcRenderer.send("window-error", error)}

let DBError = null;
let db = mysql.createConnection({
    host: mysql_options.host,
    user: mysql_options.user,
    password: mysql_options.password,
    port: mysql_options.port
});
db.connect((e)=>{
    DBError = e;
    console.log("Connection errors - "+e);
    db.query("use demoapp");
});

let aquery = utils.promisify(db.query).bind(db);

let mainWin, loadingWin;
const createMainWindow = () => {
    mainWin = new BrowserWindow({
        width: 1000,
        height: 600,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname,'mainPreload.js'),
            // webSecurity: false
        }
    });
    console.log(path.join(__dirname,'mainPreload.js'));
    mainWin.setMenuBarVisibility(false);
    mainWin.maximize();
    
    sendLog(process.env.NODE_ENV);
    // mainWin.loadURL("http://localhost:3000");
    //mainWin.loadFile(path.join(__dirname,"build/index.html"))
    if (!app.isPackaged) {
        mainWin.loadURL("http://localhost:3000");
        mainWin.webContents.openDevTools();
    } else mainWin.loadFile(path.join(__dirname,"build/index.html"));

    return mainWin;
}
const createLoadingWindow = () => {
    loadingWin = new BrowserWindow({
        show: false, frame: false
    });
    loadingWin.loadFile("src/loading.html");
    return loadingWin;
}

function sendLog(data = '') {
    mainWin.webContents.send('LOG',data);
}
let dbIpcHandlers = {
    "try-reconnect": async (ev) => {
        checkMysqlOptions();
        db = mysql.createConnection({
            host: mysql_options.host,
            user: mysql_options.user,
            password: mysql_options.password,
            port: mysql_options.port
        });
        db.connect((e)=>{
            DBError = e;
            db.query('use demoapp');
            console.log(e);
        });
        aquery = utils.promisify(db.query).bind(db);
        return DBError;
    },
    "check-error": async (ev) => {
        return DBError;
    },
    "get-users": async (ev) => {
        let result = await aquery("select * from users");
        return result;
    },
    "get-tasks": async (event) => {
        let result = await aquery("select * from user_tasks");
        return result;
    },
    "add-user": async (ev,name, password,task) => {
        // console.log(`insert into users (name,task) values (${name},${task})`);
        let result = await aquery(`insert into users (name,password,task) values ('${name}','${password}','${task}')`);
        return result;
    },
    "remove-user": async (ev,id) => {
        let result = await aquery(`delete from users where id=${id}`);
        return result;
    },
    "get-trades": async (ev) => {
        let result = await aquery("select * from trades");
        // console.log(result);
        return result;
    },
    "get-logistics": async (ev) => {
        let result = await aquery("select * from logistics");
        return result;
    },
    "get-user-by-login": async (ev,name,password) => {
        // let result = await aquery(`select * from users where (\`name\`='${name}' and \`password\`='${password}')`);
        let result = await aquery(`select users.*,user_tasks.task as task_name from users left join user_tasks on user_tasks.id=users.task_id where (\`name\`=? and \`password\`=?)`, [name,password]);
        return result;
    },
    "get-general-raw": async (ev, query) => {
        let result = await aquery(query);
        console.log(query);
        return result;
    },
    "get-general": async (ev, table,target,filters,order, additional = '') => {
        let filtersValues = 0;
        let filterCondition = [];
        filters.map((v,i)=>{
            let value = v.value;
            if (isNaN(value)) value = '\''+value+'\''; else value = Number(value);
            if (typeof (v.comparison) == 'undefined') v.comparison = '=';
            if (v.value != '') {filtersValues++; filterCondition.push(`\`${v.target}\` ${v.comparison} ${value}`);}
        });
        if (Object.keys(order).length == 0) {
            order.target = 'id';
            order.direction = 1;
        }
        // console.log(filters, filterCondition);
        let filterConditionStr=filterCondition.join(' and ');
        let query = `select ${target} from ${table} 
                    ${((filters.length > 0 && filtersValues > 0) ? 'where ('+filterConditionStr+")" : '')}
                    ${additional}
                    order by ${order.target} ${(order.direction == 1) ? 'ASC' : 'DESC'}`;
        console.log(query);
        let result = await aquery(query);

        return result;
    },
    'set-general': async (ev, table,setter,condition = '') => {
        if (condition.length > 0) condition = `where ${condition}`;
        let query = `update ${table} set ${setter} ${condition}`;
        let result = await aquery(query);
        return result;
    },
    "get-descr": async (ev,table) => {
        let result = await aquery(`describe ${table}`);

        return result;

    }
}; 

app.on("ready",() => {
    for (let prop in dbIpcHandlers) {
        ipcMain.handle(prop,dbIpcHandlers[prop]);
    }
    ipcMain.handle('open-folder',(ev,path)=>{
        require('child_process').exec(`start "" "${path}"`);
    });
    ipcMain.handle('save-barcode-svg',(ev,svg)=>{
        // require('child_process').exec(`start "" "${path}"`);
        try {
            fs.accessSync(barcodesFolderPath);
        } catch (error) {
            fs.mkdirSync(barcodesFolderPath);
        }
        let folderBarcodes = fs.readdirSync(barcodesFolderPath);
        let filePath = path.join(barcodesFolderPath,`${folderBarcodes.length}.svg`);
        fs.writeFileSync(filePath,svg);

        (async ()=>{
            const pngFilePath = await convertFile(filePath);

            require('child_process').exec(`start "" "${pngFilePath}"`);
        })();
    });
    ipcMain.handle('check-update', async (ev)=>{
        return CheckUpdates();
    })
    protocol.handle('img', (request) => {
        const pathname = decodeURIComponent(request.url.replace('img:///', ''));
        return new Response(fs.readFileSync(pathname),{headers:{"content-type":"image/*"}});
    });
    createLoadingWindow();
    loadingWin.once('show',()=>{
        createMainWindow();
        mainWin.hide();
        mainWin.webContents.once('dom-ready',()=>{
            mainWin.show();
            loadingWin.hide();
            loadingWin.close();
            autoUpdater.checkForUpdates();
        });
    });
    loadingWin.show();
});