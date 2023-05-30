var clockLocalStartTime;
var clockServerStartTime;
var currentServerTime;
function getTradeServerTime(callback) {
    const xhr = new XMLHttpRequest();
    const apiUrl = "http://worldtimeapi.org/api/timezone/Asia/Dhaka";
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            const serverTime = new Date(new Date(response.datetime).toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
            callback(serverTime);
        }
    };
    xhr.open("GET", apiUrl, true);
    xhr.send();
}
getTradeServerTime(function (serverTime) {
    clockLocalStartTime = new Date();
    clockServerStartTime = serverTime;
    clockInit(clockLocalStartTime, clockServerStartTime);
    clockOnLoad();
    var day = serverTime.getDay();
    var date = serverTime.getDate();
    var mon = serverTime.getMonth();
    var month = serverTime.getMonth() + 1;
    var year = serverTime.getFullYear();
    $("#datedisplay").text(date + "/" + month + "/" + year + " ");
});
var clockIncrementMillis = 60000;
var localTime;
var clockOffset;
var clockExpirationLocal;
var clockShowsSeconds = false;
var clockTimerID = null;
function clockInit(localDateObject, serverDateObject) {
    var origRemoteClock = parseInt(clockGetCookieData("remoteClock"));
    var origLocalClock = parseInt(clockGetCookieData("localClock"));
    var newRemoteClock = serverDateObject.getTime();
    var newLocalClock = localDateObject.getTime();
    var maxClockAge = 60 * 60 * 1000;
    if (newRemoteClock != origRemoteClock) {
        document.cookie = "remoteClock=" + newRemoteClock;
        document.cookie = "localClock=" + newLocalClock;
        clockOffset = newRemoteClock - newLocalClock;
        clockExpirationLocal = newLocalClock + maxClockAge;
        localTime = newLocalClock;
    } else if (origLocalClock != origLocalClock) {
        clockOffset = null;
        clockExpirationLocal = null;
    } else {
        clockOffset = origRemoteClock - origLocalClock;
        clockExpirationLocal = origLocalClock + maxClockAge;
        localTime = origLocalClock;
    }
    var nextDayLocal = new Date(serverDateObject.getFullYear(), serverDateObject.getMonth(), serverDateObject.getDate() + 1).getTime() - clockOffset;
    if (nextDayLocal < clockExpirationLocal) {
        clockExpirationLocal = nextDayLocal;
    }
}
function clockOnLoad() {
    clockShowsSeconds = true;
    clockIncrementMillis = 1000;
    clockUpdate();
}
function clockOnUnload() {
    clockClearTimeout();
}
function clockClearTimeout() {
    if (clockTimerID) {
        clearTimeout(clockTimerID);
        clockTimerID = null;
    }
}
function clockToggleSeconds() {
    clockClearTimeout();
    if (clockShowsSeconds) {
        clockShowsSeconds = false;
        clockIncrementMillis = 60000;
    } else {
        clockShowsSeconds = true;
        clockIncrementMillis = 1000;
    }
    clockUpdate();
}
function clockTimeString(inHours, inMinutes, inSeconds) {
    return inHours == null
        ? "-:--"
        : (inHours == 0 ? "12" : inHours <= 12 ? inHours : inHours - 12) + (inMinutes < 10 ? ":0" : ":") + inMinutes + (clockShowsSeconds ? (inSeconds < 10 ? ":0" : ":") + inSeconds : "") + (inHours < 12 ? " AM" : " PM");
}
function clockDisplayTime(inHours, inMinutes, inSeconds) {
    var time = clockTimeString(inHours, inMinutes, inSeconds);
    $("#clockdisplay").text(time);
}
function clockGetCookieData(label) {
    var c = document.cookie;
    if (c) {
        var labelLen = label.length,
            cEnd = c.length;
        while (cEnd > 0) {
            var cStart = c.lastIndexOf(";", cEnd - 1) + 1;
            while (cStart < cEnd && c.charAt(cStart) == " ") cStart++;
            if (cStart + labelLen <= cEnd && c.substr(cStart, labelLen) == label) {
                if (cStart + labelLen == cEnd) {
                    return "";
                } else if (c.charAt(cStart + labelLen) == "=") {
                    return unescape(c.substring(cStart + labelLen + 1, cEnd));
                }
            }
            cEnd = cStart - 1;
        }
    }
    return null;
}
function clockUpdate() {
    var lastLocalTime = localTime;
    localTime = new Date().getTime();
    if (clockOffset == null) {
        clockDisplayTime(null, null, null);
    } else if (localTime < lastLocalTime || clockExpirationLocal < localTime) {
        document.cookie = "remoteClock=-";
        document.cookie = "localClock=-";
        location.reload();
    } else {
        var serverTime = new Date(localTime + clockOffset);
        currentServerTime = serverTime;
        clockDisplayTime(serverTime.getHours(), serverTime.getMinutes(), serverTime.getSeconds());
        clockTimerID = setTimeout("clockUpdate()", clockIncrementMillis - (serverTime.getTime() % clockIncrementMillis));
    }
}
