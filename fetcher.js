//import library
const fs = require('fs');
global.Buffer = global.Buffer || require('buffer').Buffer;

//functions
//atob btoa
if (typeof btoa === 'undefined') {
  global.btoa = function (str) {
    return new Buffer(str).toString('base64');
  };
}

if (typeof atob === 'undefined') {
  global.atob = function (b64Encoded) {
    return new Buffer(b64Encoded, 'base64').toString();
  };
}
//comare int array
function compare(a, b) {
  for (let i = a.length; -1 < i; i -= 1) {
    if ((a[i] !== b[i])) return false;
  }
  return true;
}

//import database
const db = require('better-sqlite3')('LINE_LITE.db');
const db2 = require('better-sqlite3')('CHAT.db');

//stored information
chat_history = [];
REAL_CONTACT = [];
REAL_CHAT = [];
REAL_ROOM = [];

//chat history: read database and format information
function getChatHistory() {
  const _chat_history = db2.prepare('SELECT type, status, cid, ctime, content, message FROM chat_history');
  for (const chat of _chat_history.iterate()) {
    var bytes = Uint8Array.from(chat.message ?? "");
    let type = null;
    let from = chat.status == 2 ? "me" : "other";
    let cid = chat.cid;
    let cid2 = "";
    let time = chat.ctime;
    let msg = null;
    let duration = 0;
    let status = null;
    let stkpkgid = null;
    let stkid = null;
    let image = null;
    let extra = null;

    cid2 = new TextDecoder().decode(bytes).match(/u[a-zA-z0-9]{32}/)?.[0];

    //Text
    if(chat.type == "0"){
      type = "text";
      chat_history.push({
        type: type,
        from: from,
        cid: cid,
        cid2: cid2,
        time: time,
        msg: chat.content
      });
    }
    //Photo
    if(chat.type == "1"){
      type = "photo";
      const jpgHead = new Uint8Array([0xff, 0xd8, 0xff]);
      const jpgTail = new Uint8Array([0xff, 0xd9]);
      const pngHead = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
      let pointerLeft = 0
      let pointerRight = 0;
      for(let i in bytes){
        i = parseInt(i);
        //jpg found
        if(compare(bytes.slice(i, i + jpgHead.length), jpgHead)){
          pointerLeft = i;
        }
        else if(compare(bytes.slice(i, i + jpgTail.length), jpgTail)){
          pointerRight = i;
          image = bytes.slice(pointerLeft, pointerRight);
          image = "data:image/jpeg;base64,"+ btoa(image);
        }
        //png found
        if(compare(bytes.slice(i, i + pngHead.length), pngHead)){
          pointerLeft = i;
          image = bytes.slice(pointerLeft);
          image = "data:image/png;base64,"+ btoa(image);
        }
      }

      chat_history.push({
        type: type,
        from: from,
        cid: cid,
        cid2: cid2,
        time: time,
        image: image
      });
    }
    //TODO Video
    //Call
    else if(chat.type == "6"){
      type = "call";
      duration = chat.content.match(/(\d+) ?millisecs/)?.[1] ?? "0";
      status = chat.content.match(/Result: ?(\d+)/)?.[1] ?? "";
      chat_history.push({
        type: type,
        from: from,
        cid: cid,
        cid2: cid2,
        time: time,
        duration: duration,
        status: status
      });
    }
    //Sticker
    else if(chat.type == "7"){
      type = "sticker";
      const _STKID = new TextEncoder().encode("STKID");
      const _STKPKGID = new TextEncoder().encode("STKPKGID");
      let pointerLeft = 0
      let pointerRight = 0;
      for(let i in bytes){
        i = parseInt(i);  
        if(compare(bytes.slice(i, i + _STKID.length), _STKID)){
          pointerLeft = i + _STKID.length + 4;
        }
        else if(compare(bytes.slice(i, i + _STKPKGID.length), _STKPKGID)){
          pointerRight = i - 4;
          stkid = bytes.slice(pointerLeft, pointerRight);
          pointerLeft = i + _STKPKGID.length + 4;
        }
        else if(!!stkid && i > pointerLeft && 
          (bytes[i] == 0x03 && bytes[i+1] == 0x00 && bytes[i+2] == 0x13 && bytes[i+3] == 0x00)){
          pointerRight = i;
          stkpkgid = bytes.slice(pointerLeft, pointerRight);
        }
      }
      stkid = new TextDecoder().decode(stkid);
      stkpkgid = new TextDecoder().decode(stkpkgid);
      chat_history.push({
        type: type,
        from: from,
        cid: cid,
        cid2: cid2,
        time: time,
        stkpkgid: stkpkgid,
        stkid: stkid
      });
    }
  }
}

//contacts: read database and format information
function getContact() {
  const _REAL_CONTACT = db.prepare('SELECT _key, _val FROM REAL_CONTACT');
  for (const contact of _REAL_CONTACT.iterate()) {
    var bytes = Uint8Array.from(contact._val);
    let pointerLeft = 0, pointerRight = 0;
    let cid = bytes.slice(7, 7 + 33);
    let named = null;
    let pic = null;
    let intro = null;
    let named2 = null;
    
    for(let i in bytes){
      i = parseInt(i);
      if(i < 7 + 33 + 7)  continue;
      else if(!named){
        if( pointerLeft == 0 &&
            (bytes[i] == 0x0A || bytes[i] == 0x0B) &&
            (bytes[i + 1] == 0x00) &&
            (bytes[i + 2] <= 0x99 && bytes[i + 2] != 0x00) &&
            (bytes[i + 3] == 0x00) &&
            (bytes[i + 4] == 0x00) &&
            (bytes[i + 5] == 0x00) &&
            (bytes[i + 6] <= 0xff && bytes[i + 6] != 0x00)){
          pointerLeft = i + 7;
        }
        else if(pointerLeft != 0 &&
            (bytes[i] == 0x0A || bytes[i] == 0x0B) &&
            (bytes[i + 1] == 0x00) &&
            (bytes[i + 2] <= 0xff) &&
            (bytes[i + 3] == 0x00) &&
            (bytes[i + 4] == 0x00) &&
            (bytes[i + 5] == 0x00) &&
            (bytes[i + 6] <= 0xff)){
          pointerRight = i;
          named = bytes.slice(pointerLeft, pointerRight);
          pointerLeft = pointerRight + 7;
          pointerRight = pointerLeft + 78;
          pic = bytes.slice(pointerLeft, pointerRight);
          pointerLeft = pointerRight + 7;
        }
      }
      else if(!intro && i >= pointerLeft){
        if( (bytes[i] == 0x0A || bytes[i] == 0x0B) &&
            (bytes[i + 1] == 0x00) &&
            (bytes[i + 2] <= 0xff) &&
            (bytes[i + 3] == 0x00) &&
            (bytes[i + 4] == 0x00) &&
            (bytes[i + 5] == 0x00) &&
            (bytes[i + 6] <= 0xff)){
          pointerRight = i;
          intro = bytes.slice(pointerLeft, pointerRight);
          pointerLeft = pointerRight + 7;
        }
      }
      else if(!named2 && i >= pointerLeft){
        if( (bytes[i] == 0x0A || bytes[i] == 0x0B) &&
            (bytes[i + 1] == 0x00) &&
            (bytes[i + 2] <= 0xff) &&
            (bytes[i + 3] == 0x00) &&
            (bytes[i + 4] == 0x00) &&
            (bytes[i + 5] == 0x00) &&
            (bytes[i + 6] <= 0xff)){
          pointerRight = i;
          named2 = bytes.slice(pointerLeft, pointerRight);
          break;
        }
        else if( (bytes[i] == 0x00) &&
            (bytes[i + 1] == 0x00) &&
            (bytes[i + 2] == 0x00)){
          pointerRight = i;
          named2 = bytes.slice(pointerLeft, pointerRight);
          break;
        }
      }
    }
    //translate to string
    cid = new TextDecoder().decode(new Uint8Array(cid));
    named = new TextDecoder().decode(new Uint8Array(named));
    pic = new TextDecoder().decode(new Uint8Array(pic));
    intro = new TextDecoder().decode(new Uint8Array(intro));
    named2 = new TextDecoder().decode(new Uint8Array(named2));
    //no picture set
    if(!!pic.search(/^0h/)){
      pic = "";
      intro = pic;
    }

    //store them
    REAL_CONTACT.push({
      cid: cid,
      named: named,
      pic: pic,
      intro: intro,
      named2: named2
    });
  }
}

//groups: read database and format information
function getGroup(){
  const _REAL_CHAT = db.prepare('SELECT _key, _val FROM REAL_CHAT');
  for (const group of _REAL_CHAT.iterate()) {
    var bytes = Uint8Array.from(group._val);
    let byteStr = new TextDecoder().decode(bytes);
    let pointerLeft = 0, pointerRight = 0;
    let cid = group._key;
    let named = null;
    let pic = null;
    let host = null;
    let members = null;
    
    for(let i in bytes){
      i = parseInt(i);
      if(i < 0x40)  continue;
      else if(!named){
        if( pointerLeft == 0 &&
            (bytes[i] == 0x0A || bytes[i] == 0x0B) &&
            (bytes[i + 1] == 0x00) &&
            (bytes[i + 2] <= 0x99 && bytes[i + 2] != 0x00) &&
            (bytes[i + 3] == 0x00) &&
            (bytes[i + 4] == 0x00) &&
            (bytes[i + 5] == 0x00) &&
            (bytes[i + 6] <= 0xff && bytes[i + 6] != 0x00)){
          pointerLeft = i + 7;
        }
        else if((bytes[i] == 0x0A || bytes[i] == 0x0B) &&
                (bytes[i + 1] == 0x00) &&
                (bytes[i + 2] <= 0x99 && bytes[i + 2] != 0x00) &&
                (bytes[i + 3] == 0x00) &&
                (bytes[i + 4] == 0x00) &&
                (bytes[i + 5] == 0x00) &&
                (bytes[i + 6] <= 0xff && bytes[i + 6] != 0x00)){
          pointerRight = i;
          named = bytes.slice(pointerLeft, pointerRight);
        }
      }
    }
    //translate to string
    cid = byteStr.match(/c[a-zA-z0-9]{32}/)?.[0];
    named = new TextDecoder().decode(new Uint8Array(named));
    pic = byteStr.match(/0h-[a-zA-z0-9]{75}/)?.[0];
    host = byteStr.match(/u[a-zA-z0-9]{32}/)?.[0];
    members = byteStr.match(/u[a-zA-z0-9]{32}/g).slice(1);

    //store them
    REAL_CHAT.push({
      cid: cid,
      named: named,
      pic: pic,
      host: host,
      members: members
    });
  }
}

//room: read database and format information
function getRoom(){
  const _REAL_ROOM = db.prepare('SELECT _key, _val FROM REAL_ROOM');
  for (const room of _REAL_ROOM.iterate()) {
    var bytes = Uint8Array.from(room._val);
    let byteStr = new TextDecoder().decode(bytes);
    let pointerLeft = 0, pointerRight = 0;
    let cid = room._key;
    let members = null;
    
    members = byteStr.match(/u[a-zA-z0-9]{32}/g);

    //store them
    REAL_ROOM.push({
      cid: cid,
      members: members
    });
  }
  //console.log(REAL_ROOM)
}

//Chat history: read database and write file
getChatHistory();
fs.writeFile('chatHistory.js', "chat_history = " + JSON.stringify(chat_history), (err) => {
  if (err)  throw err;
  console.log("chat history is saved.");
});

//Contacts: read database and write file
getContact();
fs.writeFile('contacts.js', "REAL_CONTACT = " + JSON.stringify(REAL_CONTACT), (err) => {
  if (err)  throw err;
  console.log("contacts is saved.");
});

//Groups: read database and write file
getGroup();
fs.writeFile('groups.js', "REAL_CHAT = " + JSON.stringify(REAL_CHAT), (err) => {
  if (err)  throw err;
  console.log("groups is saved.");
});

//Rooms: read database and write file
getRoom();
fs.writeFile('rooms.js', "REAL_ROOM = " + JSON.stringify(REAL_ROOM), (err) => {
  if (err)  throw err;
  console.log("rooms is saved.");
});