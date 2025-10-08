!(function (e) {
  if ("object" == typeof exports && "undefined" != typeof module)
    module.exports = e();
  else if ("function" == typeof define && define.amd) define([], e);
  else {
    var r;
    (r =
      "undefined" != typeof window
        ? window
        : "undefined" != typeof global
        ? global
        : "undefined" != typeof self
        ? self
        : this),
      (r.getImageOutline = e());
  }
})(function () {
  return (function () {
    function e(r, t, n) {
      function o(u, f) {
        if (!t[u]) {
          if (!r[u]) {
            var a = "function" == typeof require && require;
            if (!f && a) return a(u, !0);
            if (i) return i(u, !0);
            var c = new Error("Cannot find module '" + u + "'");
            throw ((c.code = "MODULE_NOT_FOUND"), c);
          }
          var s = (t[u] = {
            exports: {},
          });
          r[u][0].call(
            s.exports,
            function (e) {
              return o(r[u][1][e] || e);
            },
            s,
            s.exports,
            e,
            r,
            t,
            n
          );
        }
        return t[u].exports;
      }
      for (
        var i = "function" == typeof require && require, u = 0;
        u < n.length;
        u++
      )
        o(n[u]);
      return o;
    }
    return e;
  })()(
    {
      1: [
        function (e, r, t) {
          "use strict";
          var n = e("./core.js");
          r.exports = function (e, r) {
            if (!e.complete || !e.naturalWidth)
              throw new Error("getImageOutline: imageElement must be loaded.");
            var t = e.naturalWidth,
              o = e.naturalHeight,
              i = document.createElement("canvas");
            (i.width = t), (i.height = o);
            var u = i.getContext("2d");
            u.drawImage(e, 0, 0);
            var f = u.getImageData(0, 0, t, o).data;
            return n(
              t,
              o,
              function (e, r, n) {
                return f[4 * e + 4 * r * t + n];
              },
              r
            );
          };
        },
        {
          "./core.js": 2,
        },
      ],
      2: [
        function (e, r, t) {
          "use strict";
          var n = e("line-simplify-rdp"),
            o = e("marching-squares"),
            i = e("extend"),
            u = e("./find-edge-point.js"),
            f = e("./pixel-fns.js");
          r.exports = function (e, r, t, a) {
            if (
              "number" != typeof e ||
              "number" != typeof r ||
              "function" != typeof t
            )
              throw new TypeError();
            if (
              "object" !=
              typeof (a = i(
                {
                  opacityThreshold: 170,
                  simplifyThreshold: 1,
                  pixelFn: "opaque",
                },
                a || {}
              ))
            )
              throw new TypeError();
            var c = f[a.pixelFn];
            if (!c) throw new Error("Invalid pixelFn");
            var s = a.opacityThreshold,
              l = function (n, o) {
                return !(n < 0 || o < 0 || n >= e || o >= r) && c(t, n, o, s);
              },
              p = u(e, r, l),
              d = o(p.x, p.y, l);
            return (
              a.simplifyThreshold >= 0 && (d = n(d, a.simplifyThreshold, !0)), d
            );
          };
        },
        {
          "./find-edge-point.js": 3,
          "./pixel-fns.js": 8,
          extend: 5,
          "line-simplify-rdp": 6,
          "marching-squares": 7,
        },
      ],
      3: [
        function (e, r, t) {
          "use strict";

          function n(e, r, t) {
            for (var n = Math.min(e, r), o = 0; o < n; o++)
              if (t(o, o))
                return {
                  x: o,
                  y: o,
                };
            for (var i = 0; i < r; i++)
              for (var u = 0; u < e; u++)
                if (t(u, i))
                  return {
                    x: u,
                    y: i,
                  };
            throw new Error("No point found inside region!");
          }
          r.exports = n;
        },
        {},
      ],
      4: [
        function (e, r, t) {
          "use strict";

          function n(e, r, t, n, o, i, u) {
            var f;
            o
              ? ((f = ((i - e) * t + (u - r) * n) / o),
                f < 0 ? (f = 0) : f > 1 && (f = 1))
              : (f = 0);
            var a = e + f * t,
              c = r + f * n,
              s = i - a,
              l = u - c;
            return s * s + l * l;
          }

          function o(e, r, t, o, i, u) {
            var f = t - e,
              a = o - r;
            return n(e, r, f, a, f * f + a * a, i, u);
          }

          function i(e, r, t, n, i, u) {
            return Math.sqrt(o(e, r, t, n, i, u));
          }
          (i.squared = o), (i.squaredWithPrecalc = n), (r.exports = i);
        },
        {},
      ],
      5: [
        function (e, r, t) {
          "use strict";
          var n = Object.prototype.hasOwnProperty,
            o = Object.prototype.toString,
            i = Object.defineProperty,
            u = Object.getOwnPropertyDescriptor,
            f = function (e) {
              return "function" == typeof Array.isArray
                ? Array.isArray(e)
                : "[object Array]" === o.call(e);
            },
            a = function (e) {
              if (!e || "[object Object]" !== o.call(e)) return !1;
              var r = n.call(e, "constructor"),
                t =
                  e.constructor &&
                  e.constructor.prototype &&
                  n.call(e.constructor.prototype, "isPrototypeOf");
              if (e.constructor && !r && !t) return !1;
              var i;
              for (i in e);
              return void 0 === i || n.call(e, i);
            },
            c = function (e, r) {
              i && "__proto__" === r.name
                ? i(e, r.name, {
                    enumerable: !0,
                    configurable: !0,
                    value: r.newValue,
                    writable: !0,
                  })
                : (e[r.name] = r.newValue);
            },
            s = function (e, r) {
              if ("__proto__" === r) {
                if (!n.call(e, r)) return;
                if (u) return u(e, r).value;
              }
              return e[r];
            };
          r.exports = function e() {
            var r,
              t,
              n,
              o,
              i,
              u,
              l = arguments[0],
              p = 1,
              d = arguments.length,
              y = !1;
            for (
              "boolean" == typeof l &&
                ((y = l), (l = arguments[1] || {}), (p = 2)),
                (null == l ||
                  ("object" != typeof l && "function" != typeof l)) &&
                  (l = {});
              p < d;
              ++p
            )
              if (null != (r = arguments[p]))
                for (t in r)
                  (n = s(l, t)),
                    (o = s(r, t)),
                    l !== o &&
                      (y && o && (a(o) || (i = f(o)))
                        ? (i
                            ? ((i = !1), (u = n && f(n) ? n : []))
                            : (u = n && a(n) ? n : {}),
                          c(l, {
                            name: t,
                            newValue: e(y, u, o),
                          }))
                        : void 0 !== o &&
                          c(l, {
                            name: t,
                            newValue: o,
                          }));
            return l;
          };
        },
        {},
      ],
      6: [
        function (e, r, t) {
          "use strict";

          function n(e, r, t, o, i) {
            if (((i[r] = i[t] = !0), !(t <= r + 1))) {
              for (
                var f = e[r],
                  a = e[t],
                  c = f.x,
                  s = f.y,
                  l = a.x - c,
                  p = a.y - s,
                  d = l * l + p * p,
                  y = Number.NEGATIVE_INFINITY,
                  h = -1,
                  v = r + 1;
                v < t;
                v++
              ) {
                var m = e[v],
                  x = u(c, s, l, p, d, m.x, m.y);
                x > y && ((y = x), (h = v));
              }
              y <= o || (n(e, r, h, o, i), n(e, h, t, o, i));
            }
          }

          function o(e, r) {
            return e.x === r.x && e.y === r.y;
          }

          function i(e, r, t) {
            var i = e.length;
            if (((r = r || 0), i <= 2 || r < 0)) return e.slice(0);
            t &&
              (o(e[0], e[e.length - 1])
                ? (t = !1)
                : ((e = e.slice(0)), e.push(e[0]), i++));
            var u = [];
            n(e, 0, i - 1, r, u);
            for (var f = [], a = 0; a < i; a++) u[a] && f.push(e[a]);
            return t && f.pop(), f;
          }
          var u = e("distance-to-line-segment").squaredWithPrecalc;
          r.exports = i;
        },
        {
          "distance-to-line-segment": 4,
        },
      ],
      7: [
        function (e, r, t) {
          "use strict";

          function n(e, r, t) {
            var n = e,
              c = r,
              s = [
                {
                  x: e,
                  y: r,
                },
              ],
              l = i,
              p =
                (t(e - 1, r - 1) ? 1 : 0) +
                (t(e, r - 1) ? 2 : 0) +
                (t(e - 1, r) ? 4 : 0) +
                (t(e, r) ? 8 : 0);
            if (0 === p || 15 === p) throw new Error("Bad Starting point.");
            for (;;) {
              if (
                ((l = a[p][l[2]]), (e += l[0]), (r += l[1]), e === n && r === c)
              )
                return s;
              s.push({
                x: e,
                y: r,
              }),
                l === i
                  ? (p = (12 & p) >> 2)
                  : l === o
                  ? (p = (3 & p) << 2)
                  : l === f
                  ? (p = (10 & p) >> 1)
                  : l === u && (p = (5 & p) << 1),
                (p +=
                  l === i || l === u
                    ? t(e - 1, r)
                      ? 4
                      : 0
                    : t(e, r - 1)
                    ? 2
                    : 0),
                (p +=
                  l === i || l === f
                    ? t(e, r)
                      ? 8
                      : 0
                    : t(e - 1, r - 1)
                    ? 1
                    : 0);
            }
          }
          var o = [0, -1, 1],
            i = [0, 1, 0],
            u = [-1, 0, 1],
            f = [1, 0, 0],
            a = [
              null,
              [u, u],
              [o, o],
              [u, u],
              [i, i],
              [i, i],
              [o, i],
              [i, i],
              [f, f],
              [f, u],
              [o, o],
              [u, u],
              [f, f],
              [f, f],
              [o, o],
            ];
          r.exports = n;
        },
        {},
      ],
      8: [
        function (e, r, t) {
          "use strict";
          var n = {
            opaque: function (e, r, t, n) {
              return e(r, t, 3) >= n;
            },
            "not-white": function (e, r, t, n) {
              return (
                0.299 * e(r, t, 0) + 0.587 * e(r, t, 1) + 0.114 * e(r, t, 2) <=
                n
              );
            },
            "not-black": function (e, r, t, n) {
              return (
                0.299 * e(r, t, 0) + 0.587 * e(r, t, 1) + 0.114 * e(r, t, 2) >=
                n
              );
            },
          };
          r.exports = n;
        },
        {},
      ],
    },
    {},
    [1]
  )(1);
});
