
var current_user = $("#info").data(system_username);
var brokerlogodark = current_user.brokerlogodark;
var brokerlogolight = current_user.brokerlogolight;
var system_username = current_user.system_username;
var system_branch = current_user.system_branch;
var system_user_id = current_user.system_user_id;
var system_user_role = current_user.system_user_role;
var system_dealer_team_id = current_user.dealer_group_id;
var system_user_premium = current_user.system_user_premium;
var premium_start_date = current_user.system_user_premium_start_date;
var premium_end_date = current_user.system_user_premium_end_date;
var user_os = "";
var user_browser = "";
var user_device = "";
var siteAddr = "";
var defaultPageLimit = 20;
var chart_board = "public";
$(document).ready(function () {
    get_useragent();
    $(".page-loader").each(function () {
        var pageUrl = $(this).data("path");
        $(this).html("loading...").load(pageUrl);
    });
});
function get_useragent() {
    var module = {
        options: [],
        header: [navigator.platform, navigator.userAgent, navigator.appVersion, navigator.vendor, window.opera],
        dataos: [
            { name: "Windows Phone", value: "Windows Phone", version: "OS" },
            { name: "Windows", value: "Win", version: "NT" },
            { name: "iPhone", value: "iPhone", version: "OS" },
            { name: "iPad", value: "iPad", version: "OS" },
            { name: "Kindle", value: "Silk", version: "Silk" },
            { name: "Android", value: "Android", version: "Android" },
            { name: "PlayBook", value: "PlayBook", version: "OS" },
            { name: "BlackBerry", value: "BlackBerry", version: "/" },
            { name: "Macintosh", value: "Mac", version: "OS X" },
            { name: "Linux", value: "Linux", version: "rv" },
            { name: "Palm", value: "Palm", version: "PalmOS" },
        ],
        databrowser: [
            { name: "Chrome", value: "Chrome", version: "Chrome" },
            { name: "Firefox", value: "Firefox", version: "Firefox" },
            { name: "Safari", value: "Safari", version: "Version" },
            { name: "Internet Explorer", value: "MSIE", version: "MSIE" },
            { name: "Opera", value: "Opera", version: "Opera" },
            { name: "BlackBerry", value: "CLDC", version: "CLDC" },
            { name: "Mozilla", value: "Mozilla", version: "Mozilla" },
        ],
        init: function () {
            var agent = this.header.join(" "),
                os = this.matchItem(agent, this.dataos),
                browser = this.matchItem(agent, this.databrowser);
            return { os: os, browser: browser };
        },
        matchItem: function (string, data) {
            var i = 0,
                j = 0,
                html = "",
                regex,
                regexv,
                match,
                matches,
                version;
            for (i = 0; i < data.length; i += 1) {
                regex = new RegExp(data[i].value, "i");
                match = regex.test(string);
                if (match) {
                    regexv = new RegExp(data[i].version + "[- /:;]([\\d._]+)", "i");
                    matches = string.match(regexv);
                    version = "";
                    if (matches) {
                        if (matches[1]) {
                            matches = matches[1];
                        }
                    }
                    if (matches) {
                        matches = matches.split(/[._]+/);
                        for (j = 0; j < matches.length; j += 1) {
                            if (j === 0) {
                                version += matches[j] + ".";
                            } else {
                                version += matches[j];
                            }
                        }
                    } else {
                        version = "0";
                    }
                    return { name: data[i].name, version: parseFloat(version) };
                }
            }
            return { name: "unknown", version: 0 };
        },
    };
    var e = module.init();
    var tabletRegex = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i;
    var mobRegex = /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/;
    var device = "unknown";
    if (tabletRegex.test(navigator.userAgent)) device = "Tablet";
    if (mobRegex.test(navigator.userAgent)) device = "Mobile";
    else device = "Desktop";
    user_os = e.os.name + " " + e.os.version;
    user_browser = e.browser.name + " " + e.browser.version;
    user_device = device;
    $("#user_device").val(user_device);
}
var userstatus_interval = null;
if (userstatus_interval == null) {
    userstatus_interval = setInterval(function () {
        checkUserStatus();
    }, 5000);
}
function checkUserStatus() {
    $.get("/shared/getuserstatus/", function (data) {
        if (data.loginstatus == "0" || data.userstatus == "inactive") {
            redirectUrl = "index/logout";
            setTimeout(() => (location.href = redirectUrl), 1000);
            show_flash_messages("You have been logged out", "danger");
        }
    });
}
(function () {
    const idleDurationMins = 15;
    const redirectUrl = "index/logout";
    let idleTimeout;
    const resetIdleTimeout = function () {
        if (system_user_role == "brokertrader" || system_user_role == "client" || system_user_role == "associate") {
            if (idleTimeout) clearTimeout(idleTimeout);
            idleTimeout = setTimeout(() => (location.href = redirectUrl), idleDurationMins * 60 * 1000);
        }
    };
    resetIdleTimeout();
    window.onmousemove = resetIdleTimeout;
    window.onkeypress = resetIdleTimeout;
    window.click = resetIdleTimeout;
    window.onclick = resetIdleTimeout;
    window.touchstart = resetIdleTimeout;
    window.onfocus = resetIdleTimeout;
    window.onchange = resetIdleTimeout;
    window.onmouseover = resetIdleTimeout;
    window.onmouseout = resetIdleTimeout;
    window.onmousemove = resetIdleTimeout;
    window.onmousedown = resetIdleTimeout;
    window.onmouseup = resetIdleTimeout;
    window.onkeypress = resetIdleTimeout;
    window.onkeydown = resetIdleTimeout;
    window.onkeyup = resetIdleTimeout;
    window.onsubmit = resetIdleTimeout;
    window.onreset = resetIdleTimeout;
    window.onselect = resetIdleTimeout;
    window.onscroll = resetIdleTimeout;
})();