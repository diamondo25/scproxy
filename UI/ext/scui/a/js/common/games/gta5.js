define("hbs!common/templates/common/advert", ["hbs", "common/hbs/handlebars"], function (e, t) {
    var a = t.template(function (e, t, a) {
        this.compilerInfo = [4, ">= 1.0.0"], a = this.merge(a, e.helpers);
        var s, n, o = "", l = "function", i = this.escapeExpression;
        return o += '<li>\r\n    <a href="#" class="', (n = a.ClickClass) ? s = n.call(t, {hash: {}}) : (n = t && t.ClickClass, s = typeof n === l ? n.call(t, {hash: {}}) : n), o += i(s) + '" data-action="', (n = a.ActionData) ? s = n.call(t, {hash: {}}) : (n = t && t.ActionData, s = typeof n === l ? n.call(t, {hash: {}}) : n), o += i(s) + '" data-title="', (n = a.LinkText) ? s = n.call(t, {hash: {}}) : (n = t && t.LinkText, s = typeof n === l ? n.call(t, {hash: {}}) : n), o += i(s) + '">\r\n        <img src="', (n = a.ImageUrl) ? s = n.call(t, {hash: {}}) : (n = t && t.ImageUrl, s = typeof n === l ? n.call(t, {hash: {}}) : n), o += i(s) + '" />\r\n        <div>\r\n            <h2>', (n = a.Title) ? s = n.call(t, {hash: {}}) : (n = t && t.Title, s = typeof n === l ? n.call(t, {hash: {}}) : n), o += i(s) + "</h2>\r\n            <h3>", (n = a.Body) ? s = n.call(t, {hash: {}}) : (n = t && t.Body, s = typeof n === l ? n.call(t, {hash: {}}) : n), o += i(s) + "</h3>\r\n        </div>\r\n    </a>\r\n</li>"
    });
    return a
}), define("common/games/gta5", ["jquery", "utils", "underscore", "jquery.setup.environment", "jquery.setup.environment.utils", "common/jquery.datafunctions", "common/games/gamecommon", "hbs!common/templates/common/advert"], function (e, t, a, s, n, o, l, i) {
    function r() {
        var a = new e.Deferred;
        if (t.isStoreV2Enabled()) {
            var s = function () {
                a.resolve(!0)
            }, n = function () {
                a.resolve(!1)
            }, o = function () {
                a.reject()
            }, l = {ofAgeCallbkFn: s, underAgeCallbkFn: n, errorCallbkFn: o};
            t.pubsub.trigger("setupEnvUtils:checkStoreAgeAppropriate", l)
        }
        return a.promise()
    }

    function c(e) {
        switch (e) {
            case k.FIND_CREW:
            case k.GO_TO_URL:
            case k.NONE:
                return !1;
            case k.STORE_WITH_SEARCH:
            case k.STORE_WITH_CATEGORY:
            default:
                return !0
        }
    }

    function d(e) {
        switch (e) {
            case k.STORE_WITH_SEARCH:
                return "clickEvent storeWithSearch";
            case k.STORE_WITH_CATEGORY:
                return "clickEvent storeWithCategory";
            case k.FIND_CREW:
                return "clickEvent goToFindCrew";
            case k.GO_TO_URL:
                return "clickEvent goToUrl";
            case k.NONE:
                return "clickEvent none";
            default:
                return "clickEvent storeDefault"
        }
    }

    function g(t) {
        t.off("click", "a.storeWithSearch").on("click", "a.storeWithSearch", function () {
            var t = e("#storeButton");
            t.removeData(), t.data("productId", e(this).data("action")), s.showCommerceV2()
        }), t.off("click", "a.storeWithCategory").on("click", "a.storeWithCategory", function () {
            var t = e("#storeButton");
            t.removeData(), t.data("category", e(this).data("action")), s.showCommerceV2()
        }), t.off("click", "a.storeDefault").on("click", "a.storeDefault", function () {
            s.showCommerceV2()
        }), t.off("click", "a.goToFindCrew").on("click", "a.goToFindCrew", function () {
            s.showCrewSearch()
        }), t.off("click", "a.goToUrl").on("click", "a.goToUrl", function () {
            var t = e(this).data("action"), a = e(this).data("title");
            if (n.isUrlWhitelisted(t)) {
                var s = n.getText("LinkConfirm", "HomeSignin").replace("[linkText]", a);
                o.ShowConfirmModal(s, "", "setupEnvUtils:launchExternalBrowserForUrl", t)
            }
        })
    }

    function m() {
        if (0 === b) {
            var t = e("#featuredPromotion"), a = 1e4;
            b = setInterval(function () {
                if (!t.find("li").length || 1 === t.find("li").length || !n.isActivePanel("#homefeedPanel")) return void f();
                var e = t.find("li:visible"), a = e.next();
                0 === a.length && (a = t.find("li:eq(0)")), e.fadeOut(1e3), a.fadeIn(1e3)
            }, a)
        }
    }

    function u(t) {
        t.find("img").error(function () {
            h(e(this))
        })
    }

    function h(t) {
        t.parents("li").remove();
        var a = e("#featuredPromotion").find("li");
        a.length ? 1 === a.length ? (a.show(), f()) : (a.first().show(), f(), m()) : (e("#featuredPromotion").hide(), f())
    }

    function f() {
        clearInterval(b), b = 0
    }

    function p() {
        T.statsCache = {}
    }

    function v() {
        p(), globals.adsLoaded = !1, e("#featuredPromotion").hide()
    }

    var T = {};
    T.statsCache = {};
    var b = 0;
    T.GetLauncherConfig = function () {
        return {
            images: ["images/gta5/launcher/img1.jpg", "images/gta5/launcher/img2.jpg", "images/gta5/launcher/img3.jpg", "images/gta5/launcher/img4.jpg", "images/gta5/launcher/img5.jpg", "images/gta5/launcher/img6.jpg", "images/gta5/launcher/img7.jpg", "images/gta5/launcher/img8.jpg", "images/gta5/launcher/img9.jpg", "images/gta5/launcher/img10.jpg", "images/gta5/launcher/img11.jpg", "images/gta5/launcher/img12.jpg", "images/gta5/launcher/img13.jpg", "images/gta5/launcher/img14.jpg", "images/gta5/launcher/img15.jpg", "images/gta5/launcher/img16.jpg", "images/gta5/launcher/img17.jpg", "images/gta5/launcher/img18.jpg"],
            imgInterval: 5e3
        }
    }, T.LoadHomeScreen = function () {
        l.LoadHomeScreen(), globals.advertsEnabled && (globals.adsLoaded ? m() : T.loadAds())
    }, T.displayGameLogo = function () {
        e("#launcherLogo").length || e("#launcherStyleContent").prepend(e("<img>", {
            id: "launcherLogo",
            src: globals.baseUrl + "images/gta5/gtav_logo.png",
            alt: "Grand Theft Auto V"
        }))
    }, T.loadAds = function () {
        var a = n.getCredsAsync();
        a.done(function (a) {
            if (a.Ticket) {
                var s = '{ "playerTicket":"' + a.Ticket + '","env":"' + globals.rosEnvironment + '","title":"' + globals.titleName + '","version":' + globals.RosTitleVersion + '" }',
                    o = n.GetAuthHeaderAsync(a.Ticket);
                o.done(function (a) {
                    var n = t.getApiUrl("api/" + globals.titleName + "/GetAdverts");
                    e.ajax({
                        type: "POST",
                        data: s,
                        headers: a,
                        async: !1,
                        url: n,
                        dataType: "json",
                        silentFail: !0,
                        success: function (e, t) {
                            "success" === t && (T.renderAdverts(e), globals.adsLoaded = !0)
                        }
                    })
                })
            }
        })
    }, T.renderAdverts = function (a) {
        var s = a.totalAdCount, n = a.adverts;
        if (0 !== s && null !== n && "undefined" != typeof n && n.length) {
            var o = e("#featuredPromotion"), l = "", h = r();
            h.done(function (a) {
                for (var r = 0; r < n.length; r++) {
                    var h = n[r], f = h.languages[globals.titlelang];
                    "undefined" == typeof f && (f = h.languages["en-US"]);
                    var p;
                    p = "undefined" != typeof f.actionData && null !== f.actionData && "" !== f.actionData ? f.actionData : h.actionData;
                    var v = "";
                    h.clickAction === k.GO_TO_URL && (v = "undefined" != typeof f.linkText && null !== f.linkText && "" !== f.linkText ? f.linkText : p);
                    var T = d(h.clickAction), b = {
                        ImageUrl: h.imageUrl,
                        Title: f.title,
                        Body: f.body,
                        ClickClass: T,
                        ActionData: p,
                        LinkText: v
                    };
                    (a || !c(h.clickAction)) && (l += t.renderCompiledTemplate(i, b))
                }
                o.find("ul").html(l), l.length && (u(o), g(o), o.find("li:gt(0)").hide(), s > 0 && n.length > 1 && m(o), e("#featuredPromotion").fadeIn(1e3))
            })
        }
    };
    var k = {STORE_WITH_SEARCH: 0, STORE_WITH_CATEGORY: 1, FIND_CREW: 2, GO_TO_URL: 3, NONE: 4};
    T.LoadPlayerStats = function (a, s) {
        t.WriteDebugLog("LoadPlayerStats", "compareRockstarId", a);
        var n = s ? "/OnlineStats" : "/Stats",
            o = globals.baseAssetUrl + "xml/" + globals.titleName + n + globals.titlelang + ".xml";
        e.ajax({
            type: "GET",
            async: !1,
            url: o,
            dataType: "xml",
            misc: {compareId: a, onlineStats: s},
            success: function (t) {
                var a = [];
                e(t).find("id").each(function () {
                    a.push(e(this).text())
                });
                var s = this.misc.compareId, n = this.misc.onlineStats;
                T.GetPlayerStatsJS(t, a.join(","), globals.account.RockstarId, s, n), t = null, a = null
            },
            complete: function (e, a) {
                t.ToggleCompareFriendElements(a)
            }
        })
    };
    var C = function (t, a) {
        n.resetScrollbar("#statsContainer"), n.removeLoading("statsPanel"), e("#awardsLink2").removeClass("disabled"), a ? e("#statsLink2").removeClass("disabled") : e("#onlineStatsLink").removeClass("disabled"), "success" !== t && e("#comparedFriend").hide()
    }, y = function (t, a) {
        return "success" === a && "true" === e(t).find("Status").text()
    }, S = function (a, s, o, l) {
        var i, r, c = 2;
        null !== s && void 0 !== s && (e("#statsPanel").addClass("compared"), c = 3);
        var d = e(a).find("StatsRecord");
        d.each(function () {
            e(this).find("GamerHandle").text() == "SC " + o ? i = e(this).find("Values").text().split(",") : r = e(this).find("Values").text().split(",")
        });
        var g = 103, m = [], u = "";
        e(l).find("id").each(function (a) {
            var s = e(this), o = "Conditional" == s.parent().attr("Comment"),
                l = s.parent().parent().find("header_name");
            l.length > 0 && l.text() != u && (u = l.text(), m.length > 0 && m.push("</tbody>"), m.push("<tbody id='" + u + "' class='statgroup' tabindex='" + g + "'><tr class='levelName statGroupHeader'><td colspan='" + c + "' class='levelName clearfix " + s.parent().parent()[0].nodeName + "'><div class='headerName'>" + u + "</div><span></span></td></tr>"), g++);
            var d = s.text();
            if ("" != d.length) {
                var h = void 0 != i && void 0 != i[a] ? i[a] : "-";
                if (!o || o && "0" != h) {
                    var f = "", p = s.parent().find("type");
                    switch (p.text().toLowerCase()) {
                        case"duration":
                            "-" != h && (h = t.msToTime(h)), e("#statsPanel").hasClass("compared") && (f = "<td class='col3'>" + (void 0 != r && void 0 != r[a] && "-" != r[a] ? t.msToTime(r[a]) : "-") + "</td>");
                            break;
                        case"percentage":
                            "-" != h && (h = t.formatPercent(h)), e("#statsPanel").hasClass("compared") && (f = "<td class='col3'>" + (void 0 != r && void 0 != r[a] && "-" != r[a] ? t.formatPercent(r[a]) : "-") + "</td>");
                            break;
                        case"meterstomiles":
                            "-" != h && (h = t.metersToMiles(h)), e("#statsPanel").hasClass("compared") && (f = "<td class='col3'>" + (void 0 != r && void 0 != r[a] && "-" != r[a] ? t.metersToMiles(r[a]) : "-") + "</td>");
                            break;
                        case"meterstofeet":
                            "-" != h && (h = t.metersToFeet(h)), e("#statsPanel").hasClass("compared") && (f = "<td class='col3'>" + (void 0 != r && void 0 != r[a] && "-" != r[a] ? t.metersToFeet(r[a]) : "-") + "</td>");
                            break;
                        case"kphtomph":
                            "-" != h && (h = t.kphToMph(h)), e("#statsPanel").hasClass("compared") && (f = "<td class='col3'>" + (void 0 != r && void 0 != r[a] && "-" != r[a] ? t.kphToMph(r[a]) : "-") + "</td>");
                            break;
                        case"money":
                            "-" != h && (h = t.formatMoney(h)), e("#statsPanel").hasClass("compared") && (f = "<td class='col3'>" + (void 0 != r && void 0 != r[a] && "-" != r[a] ? t.formatMoney(r[a]) : "-") + "</td>");
                            break;
                        case"boolean":
                            "-" != h && (h = 0 == h ? n.getText("No", "Social") : n.getText("Yes", "Social")), e("#statsPanel").hasClass("compared") && (f = "<td class='col3'>" + (void 0 != r && void 0 != r[a] && "-" != r[a] ? 0 == r[a] ? n.getText("No", "Social") : n.getText("Yes", "Social") : "-") + "</td>");
                            break;
                        case"meters":
                            "-" != h && (h = t.formatMeters(h)), e("#statsPanel").hasClass("compared") && (f = "<td class='col3'>" + (void 0 != r && void 0 != r[a] && "-" != r[a] ? t.formatMeters(r[a]) : "-") + "</td>");
                            break;
                        case"decimaltoint":
                            "-" != h && (h = t.decimalToInt(h)), e("#statsPanel").hasClass("compared") && (f = "<td class='col3'>" + (void 0 != r && void 0 != r[a] && "-" != r[a] ? t.decimalToInt(r[a]) : "-") + "</td>");
                            break;
                        default:
                            e("#statsPanel").hasClass("compared") && (f = "<td class='col3'>" + (void 0 != r && void 0 != r[a] ? r[a] : "-") + "</td>")
                    }
                    var v = s.parent().find("name");
                    v.length > 0 && m.push("<tr style='display:none' id='statId" + d + "' class='" + s.parent().parent()[0].nodeName + "'><td class='col1'>" + v.text() + "</td>" + f + "<td class='col2'>" + h + "</td></tr>")
                }
            }
        }), m.length > 0 && m.push("</tbody>"), e("#statstable").html(m.join("")), e("#statstable .statgroup").keydown(function (t) {
            13 == t.which && e(this).click()
        }), e("#statstable .statgroup").click(function () {
            var t = e(this);
            return t.find("tr.levelName.statGroupHeader").toggleClass("open"), t.children(":not(.statGroupHeader)").toggle(), n.resetScrollbar("#statsPanel"), !1
        }), m = null, i = null, r = null
    }, x = function (a, s, n, o, l) {
        "success" == s && ("true" == e(a).find("Status").text() ? S(a, n, o, l) : t.WriteDebugLog("GetPlayerStatsJS", "Status error", e(a).find("Error").text(), t.logType.error, t.logController[globals.titleName])), e("#checkName").fadeOut()
    };
    return T.GetPlayerStatsJS = function (a, s, l, i, r) {
        var c = r ? "getgtavonlineplayerstats" : "getplayerstatsws",
            d = t.getApiUrl("api/" + globals.titleName + "/" + c), g = [globals.titleName, c, l, i ? i : -1].join(":");
        if (T.statsCache[g]) {
            var m = T.statsCache[g], u = "success";
            return x(m, u, i, l, a), void C(u, r)
        }
        var h = n.getCredsAsync();
        h.done(function (c) {
            if (c && c.Ticket) {
                var m = '{ "env":"' + globals.rosEnvironment + '","title":"' + globals.titleName + '","version":' + globals.RosTitleVersion + ', "wsURL":"' + globals.wsURL + '","platformId":' + globals.platformId + ',"statIds":"' + s + '","rockstarIds":"' + l + (void 0 != i ? "," + i : "") + '" }';
                t.WriteDebugLog("GetPlayerStatsJS", "options", m);
                var u = n.GetAuthHeaderAsync(c.Ticket);
                u.done(function (t) {
                    e.ajax({
                        type: "POST",
                        url: d,
                        headers: t,
                        data: m,
                        contentType: "application/json; charset=utf-8",
                        dataType: "xml",
                        cache: !1,
                        services: ["stats"],
                        fatalError: o.ShowErrorModal,
                        requestDescription: "GetPlayerStats",
                        misc: {xmlData: a, playerRockstarId: l, compareRockstarId: i, onlineStats: r},
                        success: function (e, t) {
                            y(e, t) && (T.statsCache[g] = e);
                            var a = this.misc.xmlData, s = this.misc.playerRockstarId, n = this.misc.compareRockstarId;
                            x(e, t, n, s, a)
                        },
                        complete: function (e, t) {
                            a = null, s = null, l = null, i = null;
                            var n = this.misc.onlineStats;
                            C(t, n)
                        }
                    })
                })
            } else n.removeLoading("statsPanel"), e("#statstable").html("<tr><td>" + n.getError("InternetAccess") + "</td></tr>")
        })
    }, t.pubsub.on("section:stats:loaded", p), t.pubsub.on("signout:completed", v), T
});