
var buyTicketSubmit1ErrCount = 10;
var buyTicketSubmit1ErrNum = 0;
var RESPONSE_OK = 0;
var RESPONSE_FAIL = 1;

function delHtmlTag(str) {
    return str.replace(/<[^>]+>/g, "");
}

function msgFilter(mesg) {
    if (mesg == null ) {
        return "12306服务器不稳定,操作失败,请稍候重试!";
    }
    if (mesg.indexOf("第三方") > 0) {
        return "12306服务器不稳定,操作失败,请稍候重试!";
    } else {
        return mesg;
    }
}

function Message(clientId, requestId) {
    this.clientId = clientId;
    this.requestId = requestId;
}

function Message(clientId, requestId, errno, msg, data) {
    this.clientId = clientId;
    this.requestId = requestId;
    this.errno = errno;
    this.msg = msg;
    this.data = data;
}

function ObtainResultMessage(message, result) {
    var msg = new Message();
    if (typeof (message) === "object") {
        msg.clientId = message.clientId;
        msg.requestId = message.requestId;
    }
    if (typeof (result) !== "undefined") {
        msg.result = result;
    }
    return msg;
}

function sendMessage(msg) {
    js_interface.sendMessage(JSON.stringify(msg));
}

function getData(content) {
    var jsonObj = eval('(' + content + ')');
    var dataObj = eval(jsonObj.data);
    return dataObj;
}

function getElementsByClassName(className) {
    var nodeList = document.getElementsByClassName(className);
    if (nodeList.length == 0) {
        return null ;
    } else {
        return nodeList[0];
    }
}

function confirmBookTrain(msg) {
    var errorMsg = document.getElementById("error_msgmypasscode1");
    if (errorMsg != null  && errorMsg.innerHTML.length > 0) {
        var errMsg = errorMsg.innerHTML;
        errorMsg.innerHTML = "";
        var message = new Message(msg.clientId,msg.requestId,2,errMsg);
        sendMessage(message);
        return;
    }

    var orderResultInfo_id = document.getElementById("orderResultInfo_id");
    if (orderResultInfo_id != null  && orderResultInfo_id.innerHTML.indexOf("原因") > 0) {
        var errMsg = orderResultInfo_id.innerHTML;
        orderResultInfo_id.innerHTML = "";
        var xg_close_win_id = document.getElementById("qr_closeTranforDialog_id");
        if (xg_close_win_id != null ) {
            xg_close_win_id.click();
        }

        var startIndex = errMsg.indexOf("原因： ");
        var endIndex = errMsg.indexOf("</p");
        if (endIndex < 0) {
            endIndex = errMsg.indexOf("<a");
        }

        errMsg = errMsg.substr(startIndex + 3, endIndex - startIndex - 3);
        errMsg = delHtmlTag(errMsg);
        var message = new Message(msg.clientId,msg.requestId,2,errMsg,"");
        sendMessage(message);
        return;
    }
    var qr_submit_id = document.getElementById("qr_submit_id");
    if (qr_submit_id && qr_submit_id.getAttribute("class") == 'btn92s') {
        var message = new Message(msg.clientId,msg.requestId,0,"",globalRepeatSubmitToken);
        console.log(" token " + JSON.stringify(message));
        qr_submit_id.click();
        sendMessage(message);
    } else {
        setTimeout(function() {
            confirmBookTrain(msg);
        }
        , 1000);
    }
}


function getDataImage(message) {
    var img = this.getElementsByClassName('touclick-image');
    if (img == null ) {
        return;
    }
    img.onload = function() {
        getDataImage(message);
    };
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0, img.width, img.height);
    var data = canvas.toDataURL("image/png");
    var result = data.substring(22);
    var msg = ObtainResultMessage(message, result);
    sendMessage(msg);
}

function isLoginPage() {
    var nameTag = document.getElementById("login_user");
    var name = delHtmlTag(nameTag.innerHTML);
    if (name == "登录") {
        return false;
    } else {
        return true;
    }
}

function getLoginName(msg) {
    var message;
    if (isLoginPage()) {
        var nameTag = document.getElementById("login_user");
        var name = delHtmlTag(nameTag.innerHTML).replace(/\n/g, "");
        message = new Message(msg.clientId,msg.requestId,0,"",name);
        sendMessage(message);
    } else {
        message = new Message(msg.clientId,msg.requestId,1,"未登陆","");
    }
    sendMessage(message);
}

function checkLoginIsSuccess(message) {
    var errorTag = document.getElementById("error_msgmypasscode1");
    var errMsg = document.getElementById("error_msgmypasscode1").innerHTML;
    if (errMsg.length < 1) {
        var e = document.getElementById("content_defaultwarningAlert_hearder");
        if (e == null ) {
            return;
        }
        errMsg = e.innerHTML;
        if (errMsg.length > 0) {
            document.getElementById("content_defaultwarningAlert_hearder").innerHTML = "";
        }
    } else {
        document.getElementById("error_msgmypasscode1").innerHTML = "";
    }
    errMsg = msgFilter(errMsg);
    if (errMsg == "12306服务器不稳定,操作失败,请稍候重试!") {
        errMsg = errMsg + "##";
    }
    if (typeof (message) !== "undefined") {
        var message = new Message(message.clientId,message.requestId,2,errMsg);
        sendMessage(message);
    }
}

function getRandCodeElement() {
    return document.getElementsByClassName("touclick-bgimg touclick-reload touclick-reload-normal")[0];
}

function refreshRandCode(msg) {
    var reload = getRandCodeElement();
    reload.click();
    var image = document.getElementsByClassName("touclick-image")[0];
    image.onload = function() {
        getDataImage(msg);
    };
}

function initBookTrainValues(data) {
    var fromStationText = document.getElementById("fromStationText");
    var toStationText = document.getElementById("toStationText");
    fromStationText.value = "北京";
    toStationText.value = "上海";
    var fromStation = document.getElementById("fromStation");
    var toStation = document.getElementById("toStation");
    var train_date = document.getElementById("train_date");
    fromStation.value = data.index0;
    toStation.value = data.index1;
    train_date.value = data.index2;
    document.getElementById("query_ticket").click();
    setTimeout(function() {
        var queryLeftTable = document.getElementById("queryLeftTable");
        if (queryLeftTable.childNodes.length == 0) {
            console.log("num = 0");
        } else {
            var trNode = queryLeftTable.childNodes[0];
            var value = trNode.childNodes[trNode.childNodes.length - 1].innerHTML;
            if (value.indexOf("维护") > 0) {

                return;
            } else {
                var nodeList = document.getElementsByClassName("btn72");
                for (var i = 0; i < nodeList.length; i++) {
                    if (nodeList[i].getAttribute('onclick').indexOf(data.index3) > 0) {
                        console.log("found click === ");
                        nodeList[i].click();
                        var msg = new Message(data.clientId,data.requestId,0);
                        sendMessage(msg);
                        break;
                    }
                }
            }
        }
    }
    , 1000);
}

function login(message) {
    var randCode = document.getElementById("randCode");
    var userName = document.getElementById("username");
    var password = document.getElementById("password");
    if (message.arg_len == 3) {
        userName.value = message.index0;
        password.value = message.index1;
        randCode.value = message.index2;
        var submit = document.getElementById("loginSub");
        var image = document.getElementsByClassName("touclick-image")[0];
        image.onload = function() {
            message.requestId = 0;
            getDataImage(message);
        };
        submit.click();
        setTimeout(function() {
            checkLoginIsSuccess(message);
        }
        , 200);
    }
}

function getBookTrain(msg) {
    var ticket_con = document.getElementById("ticket_con_id");
    if (ticket_con) {
        ticket_con = delHtmlTag(ticket_con.innerHTML);
        ticket_con = ticket_con.replace(/\n\n/g, "#");
        ticket_con = ticket_con.replace(/\n/g, "");
        var msg = new Message(msg.clientId,msg.requestId,0,"",ticket_con);
        sendMessage(msg);
    } else {
        var msg = new Message(msg.clientId,msg.requestId,2,"","null");
        sendMessage(msg)
    }
}



function buyTicketSubmit(msg) {
    var randCodeValue = msg.index0;
    var listString = msg.index1;
    var list = JSON.parse(listString);
    if (!Array.isArray(list)) {
        return;
    }
    var dialog_add_cancel = document.getElementById("dialog_add_cancel");
    if (dialog_add_cancel) {
        dialog_add_cancel.click();
    }
    document.getElementById("show_more_passenger_id").click();
    for (var i = 0; i < list.length; i++) {
        if (list[i].index != -1) {
            var normalPassenger = document.getElementById("normalPassenger_" + list[i].index);
            document.getElementById("normalPassenger_" + list[i].index).click();
        }
        if (list[i].passenger_type > 1) {
            var dialog_xsertcj_ok = document.getElementById("dialog_xsertcj_ok");
            if (dialog_xsertcj_ok != null ) {
                dialog_xsertcj_ok.click();
            }
        } else if (list[i].passenger_type == 3) {
            document.getElementById("qd_closeDefaultWarningWindowDialog_id").click();
        }
    }
    document.getElementById("randCode").value = randCodeValue;
    document.getElementById("submitOrder_id").click();
    setTimeout(confirmBookTrain(msg), 2000);
}

function loadPayOrderInitPage(msg) {
    var tag = document.getElementById("continuePayNoMyComplete");
    if (tag) {
        tag.click();
    }
}

function getBookTicketsList(msg) {
    var message = new Message(msg.clientId,msg.requestId);
    if (parOrderDTOJson) {
        message.errno = 0;
        message.msg = "";
        message.data = parOrderDTOJson;
    } else {
        message.errno = 1;
        message.msg = "parOrderDTOJson 不存在";
    }
    sendMessage(message);
}

function receiveMessage(message) {
    if (typeof (message) === 'object') {
        var fun = message.funName;
        eval(fun)(message);
    }
}

function exitAccount() {
    document.getElementById("regist_out").click();
}

function loginIn12306(){
 document.getElementById("login_user").click();
}

