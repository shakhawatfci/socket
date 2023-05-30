var clockLocalStartTime;
var clockServerStartTime;
var currentServerTime;
var clockTimerID = null;
var clockShowsSeconds = false;
var clockIncrementMillis = 60000;
var clockOffset = null;
var clockExpirationLocal = null;

function clockInit(localDateObject, serverDateObject) {
    var origRemoteClock = parseInt(clockGetCookieData("remoteClock"));
    var origLocalClock = parseInt(clockGetCookieData("localClock"));
    var newRemoteClock = serverDateObject.getTime();
    var newLocalClock = localDateObject.getTime();
    var maxClockAge = 60 * 60 * 1000;

    if (newRemoteClock !== origRemoteClock) {
        document.cookie = "remoteClock=" + newRemoteClock;
        document.cookie = "localClock=" + newLocalClock;
        clockOffset = newRemoteClock - newLocalClock;
        clockExpirationLocal = newLocalClock + maxClockAge;
    } else if (origLocalClock !== origLocalClock) {
        clockOffset = null;
        clockExpirationLocal = null;
    } else {
        clockOffset = origRemoteClock - origLocalClock;
        clockExpirationLocal = origLocalClock + maxClockAge;
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
    var hours = inHours == null ? "-" : inHours === 0 ? "12" : inHours <= 12 ? inHours : inHours - 12;
    var minutes = inMinutes !== null && inMinutes < 10 ? "0" + inMinutes : inMinutes;
    var seconds = clockShowsSeconds && inSeconds !== null && inSeconds < 10 ? "0" + inSeconds : inSeconds;
    var period = inHours < 12 ? " AM" : " PM";

    return hours + ":" + minutes + (clockShowsSeconds ? ":" + seconds : "") + period;
}

function clockDisplayTime(inHours, inMinutes, inSeconds) {
    var time = clockTimeString(inHours, inMinutes, inSeconds);
    $("#clockdisplay").text(time);
}

function clockGetCookieData(label) {
    var cookies = document.cookie.split(";").map(cookie => cookie.trim());
    for (var i = 0; i < cookies.length; i++) {
        if (cookies[i].startsWith(label + "=")) {
            return decodeURIComponent(cookies[i].substring(label.length + 1));
        }
    }
    return null;
}

function clockUpdate() {
    var lastLocalTime = Date.now();
    var localTime = Date.now();

    if (clockOffset === null) {
        clockDisplayTime(null, null, null);
    } else if (localTime < lastLocalTime || clockExpirationLocal < localTime) {
        document.cookie = "remoteClock=-; expires=Thu, 01 Jan 1970 00:00:00 UTC";
        document.cookie = "localClock=-; expires=Thu, 01 Jan 1970 00:00:00 UTC";
        location.reload();
    } else {
        var serverTime = new Date(localTime + clockOffset);
        currentServerTime = serverTime;
        clockDisplayTime(serverTime.getHours(), serverTime.getMinutes(), serverTime.getSeconds());
        clockTimerID = setTimeout(clockUpdate, clockIncrementMillis - (serverTime.getTime() % clockIncrementMillis));
    }
}

function initializeClock() {
    var serverTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
    clockLocalStartTime = new Date();
    clockServerStartTime = new Date(serverTime);
    clockInit(clockLocalStartTime, clockServerStartTime);
    clockOnLoad();

    var day = clockServerStartTime.getDay();
    var date = clockServerStartTime.getDate();
    var month = clockServerStartTime.getMonth() + 1;
    var year = clockServerStartTime.getFullYear();
    $("#datedisplay").text(date + "/" + month + "/" + year + " ");
}

// Call the initialization function
initializeClock();
