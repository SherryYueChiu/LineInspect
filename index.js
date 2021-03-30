//functions
Date.prototype.Format = function (fmt) {
  var o = {
  "M+": this.getMonth() + 1, //月份
  "d+": this.getDate(), //日
  "h+": this.getHours(), //小時
  "H+": this.getHours(), //小時
  "m+": this.getMinutes(), //分
  "s+": this.getSeconds(), //秒
  "q+": Math.floor((this.getMonth() * 3) / 3), //季度
  "S": this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
  if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
  }


$contact = document.querySelector("#contacts");
$chatHistory = document.querySelector("#chatHistory");
  
function printContact(){
  REAL_CONTACT.forEach(contact => {
    let html = `
<div class="contact" who="${contact.cid}">
  <img class="pic" src="${contact.pic ? 'https://profile.line-scdn.net/' + contact.pic : ''}">
  <div class="named">${contact.named}
    <div class="named2">${contact.named2 ? "(" + contact.named2 + ")" : ""}</div>
  </div>
  <div class="intro">${contact.intro}</div>
</div>
    `;
    $contact.insertAdjacentHTML('beforeend', html);
  });
  //bind events
  $contacts = document.querySelectorAll("#contacts>.contact");
  $contacts?.forEach((elm) => {
    elm.addEventListener("click", () => {
      const who = elm.getAttribute("who");
      msgFilter(who);
    });
  });
}

function printChatHistory(){
  chat_history.forEach((chat) => {
    //message in group chat
    let who = where = REAL_CONTACT.filter(c => c.cid == chat.cid)[0]?.named ?? "";
    if(who.indexOf("u") != 0){
      who = chat.cid2;
    }

    //Text
    if(chat.type == "text"){
      let html = "";
      let pic = REAL_CONTACT.filter(c => c.cid == who)[0]?.pic;
      html = `
<div  class="chat text ${chat.from == 'me' ? "right" : "left"}" 
      where="${chat.cid}" who="${who}" 
      style="display: ">
  <img class="pic" src="${pic ? 'https://profile.line-scdn.net/' + pic : ''}">
  <div class="who">
    ${REAL_CONTACT.filter(c => c.cid == who)[0]?.named ?? "" }
  </div>
  <div class="msg">
    ${chat.msg}
  </div>
  <div class="time">
    ${new Date(chat.time).Format("yyyy-MM-dd HH:mm")}
  </div>
</div>
      `;
      $chatHistory.insertAdjacentHTML('beforeend', html); 
    }

    //Photo
    else if(chat.type == "photo"){
      let html = "";
      let pic = REAL_CONTACT.filter(c => c.cid == who)[0]?.pic;
      html = `
<div  class="chat photo ${chat.from == 'me' ? "right" : "left"}" 
      where="${chat.cid}" who="${who}" 
      style="display: none">
  <img class="pic" src="${pic ? 'https://profile.line-scdn.net/' + pic : ''}">
  <div class="who">
  ${REAL_CONTACT.filter(c => c.cid == who)[0]?.named ?? "" }
  </div>
  <div class="image">
    <img src="${chat.image}">
  </div>
  <div class="time">
    ${new Date(chat.time).Format("yyyy-MM-dd HH:mm")}
  </div>
</div>
      `;
      $chatHistory.insertAdjacentHTML('beforeend', html); 

    }

    //Call
    else if(chat.type == "call"){
      let html = "";
      let pic = REAL_CONTACT.filter(c => c.cid == who)[0]?.pic;
      html = `
<div  class="chat call ${chat.from == 'me' ? "right" : "left"}" 
      where="${chat.cid}" who="${who}" 
      style="display: none">
  <img class="pic" src="${pic ? 'https://profile.line-scdn.net/' + pic : ''}">
  <div class="who">
  ${REAL_CONTACT.filter(c => c.cid == who)[0]?.named ?? "" }
  </div>
  <div class="duration">
    <i class="fas fa-phone-alt"></i>
    ${Math.floor((chat.duration / 1000) / 60)}分
    ${Math.floor((chat.duration / 1000) % 60)}秒
  </div>
  <div class="time">
    ${new Date(chat.time).Format("yyyy-MM-dd HH:mm")}
  </div>
  <div class="status" style="display:none">
    ${chat.status}
  </div>
</div>
      `;
      $chatHistory.insertAdjacentHTML('beforeend', html); 

    }

    //Sticker
    else if(chat.type == "sticker"){
      let html = "";
      let pic = REAL_CONTACT.filter(c => c.cid == who)[0]?.pic;
      html = `
<div  class="chat sticker ${chat.from == 'me' ? "right" : "left"}" 
      where="${chat.cid}" who="${who}" 
      style="display: none">
  <img class="pic" src="${pic ? 'https://profile.line-scdn.net/' + pic : ''}">
  <div class="who">
  ${REAL_CONTACT.filter(c => c.cid == who)[0]?.named ?? "" }
  </div>
  <div class="img">
    <img src="https://stickershop.line-scdn.net/products/0/0/1/${chat.stkpkgid}/PC/stickers/${chat.stkid}.png">
  </div>
  <div class="time">
    ${new Date(chat.time).Format("yyyy/MM/dd HH:mm")}
  </div>
</div>
      `;
      $chatHistory.insertAdjacentHTML('beforeend', html); 

    }
  });
}

function msgFilter(where, who = null){
  $chats = document.querySelectorAll("#chatHistory>.chat");
  $chats.forEach((elm) => {
    if(elm.getAttribute("where") == where){
      elm.style.display = "grid";
    }
    else{
      elm.style.display = "none";
    }
  });
  $chatHistory.scrollTo(0,$chatHistory.scrollHeight);
}

//DOM event binding
$tabContact = document.querySelector("#sideBarTab>.contact");
$tabGroup = document.querySelector("#sideBarTab>.group");
$contactList = document.querySelector("#contacts");
$groupList = document.querySelector("#groups");
$tabContact.addEventListener("click", () => {
  $contactList.style.display = "flex";
  $groupList.style.display = "none";
});
$tabGroup.addEventListener("click", () => {
  $contactList.style.display = "none";
  $groupList.style.display = "flex";
});

//init
printContact();
printChatHistory();