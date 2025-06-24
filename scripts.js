(function() {
  var ea = function() {
    var a = window.navigator.userAgent;
    try {
      window.localStorage.setItem("ftap5caavc", "ftap5caavc");
      window.localStorage.removeItem("ftap5caavc");
      var q = true;
    } catch (l) {
      q = false;
    }
    return { Ye: function() {
      return /webkit/i.test(a);
    }, Xh: function() {
      return /Mac/.test(a);
    }, We: function() {
      return /iPad|iPod|iPhone/.test(a);
    }, Wh: function() {
      return /Android/.test(a);
    }, Sh: function() {
      return "ontouchstart" in window || !!window.DocumentTouch && document instanceof window.DocumentTouch;
    }, Rh: function() {
      return q;
    }, Qh: function() {
      var l = document.createElement("canvas");
      return !(!l.getContext || !l.getContext("2d"));
    }, qd: function(l, g) {
      return [].forEach && ea.Qh() ? l && l() : g && g();
    } };
  }();
  var la = function() {
    function a() {
      return window.performance && (window.performance.now || window.performance.mozNow || window.performance.msNow || window.performance.oNow || window.performance.webkitNow) || Date.now;
    }
    var q = a();
    return { create: function() {
      return { now: function() {
        var l = a();
        return function() {
          return l.call(window.performance);
        };
      }() };
    }, now: function() {
      return q.call(window.performance);
    } };
  }();
  function na() {
    function a() {
      if (!d) throw "AF0";
      var m = la.now();
      0 !== p && (l.wd = m - p);
      p = m;
      e = e.filter(function(h) {
        return null !== h;
      });
      l.frames++;
      for (var c = 0; c < e.length; c++) {
        var b = e[c];
        null !== b && (true === b.le.call(b.context) ? e[c] = null : P.Fc(b.repeat) && (b.repeat = b.repeat - 1, 0 >= b.repeat && (e[c] = null)));
      }
      e = e.filter(function(h) {
        return null !== h;
      });
      d = false;
      q();
      m = la.now() - m;
      0 !== m && (l.vd = m);
      l.totalTime += m;
      l.Ae = 1e3 * l.frames / l.totalTime;
      0 === e.length ? p = 0 : p = la.now();
    }
    function q() {
      0 < e.length && !d && (d = true, g(a));
    }
    var l = this.bg = {
      frames: 0,
      totalTime: 0,
      vd: 0,
      wd: 0,
      Ae: 0
    };
    qa = l;
    var g = function() {
      return ea.We() ? function(m) {
        window.setTimeout(m, 0);
      } : window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function() {
        var m = la.create();
        return function(c) {
          var b = 0;
          window.setTimeout(function() {
            var h = m.now();
            c();
            b = m.now() - h;
          }, 16 > b ? 16 - b : 0);
        };
      }();
    }(), e = [], d = false, p = 0;
    this.repeat = function(m, c, b) {
      this.cancel(m);
      e.push({ le: m, context: b, repeat: c });
      q();
    };
    this.once = function(m, c) {
      this.repeat(m, 1, c);
    };
    this.cancel = function(m) {
      for (var c = 0; c < e.length; c++) {
        var b = e[c];
        null !== b && b.le === m && (e[c] = null);
      }
    };
    this.m = function() {
      e = [];
    };
  }
  var qa;
  var ra = ea.qd(function() {
    function a() {
      this.buffer = [];
      this.la = 0;
      this.current = P.extend({}, p);
    }
    function q(m) {
      return function() {
        var c, b = this.buffer, h = this.la;
        b[h++] = "call";
        b[h++] = m;
        b[h++] = arguments.length;
        for (c = 0; c < arguments.length; c++) b[h++] = arguments[c];
        this.la = h;
      };
    }
    function l(m) {
      return function() {
        return e[m].apply(e, arguments);
      };
    }
    var g = document.createElement("canvas");
    g.width = 1;
    g.height = 1;
    var e = g.getContext("2d");
    g = ["font"];
    var d = "fillStyle globalAlpha globalCompositeOperation lineCap lineDashOffset lineJoin lineWidth miterLimit shadowBlur shadowColor shadowOffsetX shadowOffsetY strokeStyle textAlign textBaseline".split(" "), p = {};
    d.concat(g).forEach(function(m) {
      p[m] = e[m];
    });
    a.prototype.clear = function() {
      this.la = 0;
    };
    a.prototype.Ia = function() {
      return 0 === this.la;
    };
    a.prototype.Ma = function(m) {
      function c(h, f, u) {
        for (var t = 0, n = h.la, k = h.buffer; t < u; ) k[n++] = f[t++];
        h.la = n;
      }
      function b(h, f, u, t) {
        for (var n = 0; n < u; ) switch (f[n++]) {
          case "set":
            h[f[n++]] = f[n++];
            break;
          case "setGlobalAlpha":
            h[f[n++]] = f[n++] * t;
            break;
          case "call":
            var k = f[n++];
            switch (f[n++]) {
              case 0:
                h[k]();
                break;
              case 1:
                h[k](f[n++]);
                break;
              case 2:
                h[k](f[n++], f[n++]);
                break;
              case 3:
                h[k](
                  f[n++],
                  f[n++],
                  f[n++]
                );
                break;
              case 4:
                h[k](f[n++], f[n++], f[n++], f[n++]);
                break;
              case 5:
                h[k](f[n++], f[n++], f[n++], f[n++], f[n++]);
                break;
              case 6:
                h[k](f[n++], f[n++], f[n++], f[n++], f[n++], f[n++]);
                break;
              case 7:
                h[k](f[n++], f[n++], f[n++], f[n++], f[n++], f[n++], f[n++]);
                break;
              case 8:
                h[k](f[n++], f[n++], f[n++], f[n++], f[n++], f[n++], f[n++], f[n++]);
                break;
              case 9:
                h[k](f[n++], f[n++], f[n++], f[n++], f[n++], f[n++], f[n++], f[n++], f[n++]);
                break;
              default:
                throw "CB0";
            }
        }
      }
      m instanceof ra ? c(m, this.buffer, this.la) : b(m, this.buffer, this.la, P.H(
        m.globalAlpha,
        1
      ));
    };
    a.prototype.replay = a.prototype.Ma;
    a.prototype.m = function() {
      return new a();
    };
    a.prototype.scratch = a.prototype.m;
    "arc arcTo beginPath bezierCurveTo clearRect clip closePath drawImage fill fillRect fillText lineTo moveTo putImageData quadraticCurveTo rect rotate scale setLineDash setTransform stroke strokeRect strokeText transform translate".split(" ").forEach(function(m) {
      a.prototype[m] = q(m);
    });
    ["measureText", "createLinearGradient", "createRadialGradient", "createPattern", "getLineDash"].forEach(function(m) {
      a.prototype[m] = l(m);
    });
    ["save", "restore"].forEach(function(m) {
      var c = l(m), b = q(m);
      a.prototype[m] = /* @__PURE__ */ function(h, f) {
        return function() {
          h.apply(this, arguments);
          f.apply(this, arguments);
        };
      }(b, c);
    });
    g.forEach(function(m) {
      Object.defineProperty(a.prototype, m, { set: function(c) {
        e[m] = c;
        this.current[m] = c;
        var b = this.buffer;
        b[this.la++] = "set";
        b[this.la++] = m;
        b[this.la++] = c;
      }, get: function() {
        return this.current[m];
      } });
    });
    d.forEach(function(m) {
      Object.defineProperty(a.prototype, m, { set: function(c) {
        this.current[m] = c;
        var b = this.buffer;
        b[this.la++] = "globalAlpha" === m ? "setGlobalAlpha" : "set";
        b[this.la++] = m;
        b[this.la++] = c;
      }, get: function() {
        return this.current[m];
      } });
    });
    a.prototype.roundRect = function(m, c, b, h, f) {
      this.beginPath();
      this.moveTo(m + f, c);
      this.lineTo(m + b - f, c);
      this.quadraticCurveTo(m + b, c, m + b, c + f);
      this.lineTo(m + b, c + h - f);
      this.quadraticCurveTo(m + b, c + h, m + b - f, c + h);
      this.lineTo(m + f, c + h);
      this.quadraticCurveTo(m, c + h, m, c + h - f);
      this.lineTo(m, c + f);
      this.quadraticCurveTo(m, c, m + f, c);
      this.closePath();
    };
    a.prototype.fillPolygonWithText = function(m, c, b, h, f) {
      f || (f = {});
      var u = { ib: P.H(f.maxFontSize, ta.ya.ib), Lc: P.H(f.minFontSize, ta.ya.Lc), lineHeight: P.H(f.lineHeight, ta.ya.lineHeight), eb: P.H(f.horizontalPadding, ta.ya.eb), Ua: P.H(f.verticalPadding, ta.ya.Ua), jb: P.H(f.maxTotalTextHeight, ta.ya.jb), fontFamily: P.H(f.fontFamily, ta.ya.fontFamily), fontStyle: P.H(f.fontStyle, ta.ya.fontStyle), fontVariant: P.H(f.fontVariant, ta.ya.fontVariant), fontWeight: P.H(f.fontWeight, ta.ya.fontWeight), verticalAlign: P.H(f.verticalAlign, ta.ya.verticalAlign) }, t = f.cache;
      if (t && P.has(f, "area")) {
        t.Vc || (t.Vc = new ra());
        var n = f.area, k = P.H(f.cacheInvalidationThreshold, 0.05);
        m = ta.ke(u, this, h, m, wa.F(m, {}), { x: c, y: b }, f.allowForcedSplit || false, f.allowEllipsis || false, t, n, k, f.invalidateCache);
      } else m = ta.xe(u, this, h, m, wa.F(m, {}), { x: c, y: b }, f.allowForcedSplit || false, f.allowEllipsis || false);
      return m.ia ? { fit: true, lineCount: m.ec, fontSize: m.fontSize, box: { x: m.box.x, y: m.box.y, w: m.box.w, h: m.box.o }, ellipsis: m.Xb } : { fit: false };
    };
    return a;
  });
  var xa = ea.qd(function() {
    function a(b) {
      this.S = b;
      this.canvas = b.canvas;
      this.m = [];
      this.zb = [void 0];
      this.Bc = ["#SIZE#px sans-serif"];
      this.xd = [0];
      this.yd = [1];
      this.Vd = [0];
      this.Wd = [0];
      this.Xd = [0];
      this.Cd = [10];
      this.$b = [10];
      this.Hb = [this.zb, this.Bc, this.$b, this.xd, this.yd, this.Vd, this.Cd, this.Wd, this.Xd];
      this.matrix = [1, 0, 0, 1, 0, 0];
    }
    function q(b) {
      var h = b.S, f = b.Hb[0].length - 1;
      b.zb[f] && (h.setLineDash(b.zb[f]), h.lineDashOffset = b.xd[f]);
      h.miterLimit = b.Cd[f];
      h.lineWidth = b.yd[f];
      h.shadowBlur = b.Vd[f];
      h.shadowOffsetX = b.Wd[f];
      h.shadowOffsetY = b.Xd[f];
      h.font = b.Bc[f].replace("#SIZE#", b.$b[f].toString());
    }
    function l(b) {
      return function() {
        return this.S[b].apply(this.S, arguments);
      };
    }
    function g(b) {
      return function(h, f) {
        var u = this.matrix;
        return this.S[b].call(this.S, d(h, f, u), p(h, f, u));
      };
    }
    function e(b) {
      return function(h, f, u, t) {
        var n = this.matrix;
        return this.S[b].call(this.S, d(h, f, n), p(h, f, n), u * n[0], t * n[3]);
      };
    }
    function d(b, h, f) {
      return b * f[0] + h * f[2] + f[4];
    }
    function p(b, h, f) {
      return b * f[1] + h * f[3] + f[5];
    }
    function m(b, h) {
      for (var f = 0; f < b.length; f++) b[f] *= h[0];
      return b;
    }
    a.prototype.save = function() {
      this.m.push(this.matrix.slice(0));
      for (var b = 0; b < this.Hb.length; b++) {
        var h = this.Hb[b];
        h.push(h[h.length - 1]);
      }
      this.S.save();
    };
    a.prototype.restore = function() {
      this.matrix = this.m.pop();
      for (var b = 0; b < this.Hb.length; b++) this.Hb[b].pop();
      this.S.restore();
      q(this);
    };
    a.prototype.scale = function(b, h) {
      var f = this.matrix;
      f[0] *= b;
      f[1] *= b;
      f[2] *= h;
      f[3] *= h;
      b = this.matrix;
      h = this.Hb;
      f = h[0].length - 1;
      var u = this.zb[f];
      u && m(u, b);
      for (u = 2; u < h.length; u++) {
        var t = h[u];
        t[f] *= b[0];
      }
      q(this);
    };
    a.prototype.translate = function(b, h) {
      var f = this.matrix;
      f[4] += f[0] * b + f[2] * h;
      f[5] += f[1] * b + f[3] * h;
    };
    ["moveTo", "lineTo"].forEach(function(b) {
      a.prototype[b] = g(b);
    });
    ["clearRect", "fillRect", "strokeRect", "rect"].forEach(function(b) {
      a.prototype[b] = e(b);
    });
    "fill stroke beginPath closePath clip createImageData createPattern getImageData putImageData getLineDash setLineDash".split(" ").forEach(function(b) {
      a.prototype[b] = l(b);
    });
    [{ p: "lineDashOffset", a: function(b) {
      return b.xd;
    } }, { p: "lineWidth", a: function(b) {
      return b.yd;
    } }, {
      p: "miterLimit",
      a: function(b) {
        return b.Cd;
      }
    }, { p: "shadowBlur", a: function(b) {
      return b.Vd;
    } }, { p: "shadowOffsetX", a: function(b) {
      return b.Wd;
    } }, { p: "shadowOffsetY", a: function(b) {
      return b.Xd;
    } }].forEach(function(b) {
      Object.defineProperty(a.prototype, b.p, { set: function(h) {
        var f = b.a(this);
        h *= this.matrix[0];
        f[f.length - 1] = h;
        this.S[b.p] = h;
      } });
    });
    var c = /(\d+(?:\.\d+)?)px/;
    Object.defineProperty(a.prototype, "font", { set: function(b) {
      var h = c.exec(b);
      if (1 < h.length) {
        var f = this.$b.length - 1;
        this.$b[f] = parseFloat(h[1]);
        this.Bc[f] = b.replace(c, "#SIZE#px");
        b = this.S;
        f = this.Bc[f].replace("#SIZE#", (this.$b[f] * this.matrix[0]).toString());
        b.font = f;
      }
    } });
    "fillStyle globalAlpha globalCompositeOperation lineCap lineJoin shadowColor strokeStyle textAlign textBaseline".split(" ").forEach(function(b) {
      Object.defineProperty(a.prototype, b, { set: function(h) {
        this.S[b] = h;
      }, get: function() {
        return this.S[b];
      } });
    });
    a.prototype.arc = function(b, h, f, u, t, n) {
      var k = this.matrix;
      this.S.arc(d(b, h, k), p(b, h, k), f * k[0], u, t, n);
    };
    a.prototype.arcTo = function(b, h, f, u, t) {
      var n = this.matrix;
      this.S.arc(d(
        b,
        h,
        n
      ), p(b, h, n), d(f, u, n), p(f, u, n), t * n[0]);
    };
    a.prototype.transform = function() {
      throw "transform() is not implemented in double wrapper context.";
    };
    a.prototype.bezierCurveTo = function(b, h, f, u, t, n) {
      var k = this.matrix;
      this.S.bezierCurveTo(d(b, h, k), p(b, h, k), d(f, u, k), p(f, u, k), d(t, n, k), p(t, n, k));
    };
    a.prototype.drawImage = function(b, h, f, u, t, n, k, r, x) {
      function v(F, E, G, O) {
        z.push(d(F, E, w));
        z.push(p(F, E, w));
        G = P.V(G) ? b.width : G;
        O = P.V(O) ? b.height : O;
        z.push(G * w[0]);
        z.push(O * w[3]);
      }
      var w = this.matrix, z = [b];
      P.V(n) ? v(h, f, u, t) : v(
        n,
        k,
        r,
        x
      );
      this.S.drawImage.apply(this.S, z);
    };
    a.prototype.quadraticCurveTo = function(b, h, f, u) {
      var t = this.matrix;
      this.S.quadraticCurveTo(d(b, h, t), p(b, h, t), d(f, u, t), p(f, u, t));
    };
    a.prototype.fillText = function(b, h, f, u) {
      var t = this.matrix;
      this.S.fillText(b, d(h, f, t), p(h, f, t), P.Fc(u) ? u * t[0] : 1e20);
    };
    a.prototype.setLineDash = function(b) {
      b = m(b.slice(0), this.matrix);
      this.zb[this.zb.length - 1] = b;
      this.S.setLineDash(b);
    };
    return a;
  });
  var Aa = function() {
    var a = !ea.Ye() || ea.We() || ea.Wh() ? 1 : 7;
    return { estimate: function() {
      function q(k) {
        k.beginPath();
        ya.Yd(k, m);
      }
      var l = document.createElement("canvas");
      l.width = 800;
      l.height = 600;
      var g = l.getContext("2d"), e = l.width;
      l = l.height;
      var d, p = 0, m = [{ x: 0, y: 100 }];
      for (d = 1; 6 >= d; d++) p = 2 * d * Math.PI / 6, m.push({ x: 100 * Math.sin(p), y: 100 * Math.cos(p) });
      d = { polygonPlainFill: [q, function(k) {
        k.fillStyle = "rgb(255, 0, 0)";
        k.fill();
      }], polygonPlainStroke: [q, function(k) {
        k.strokeStyle = "rgb(128, 0, 0)";
        k.lineWidth = 2;
        k.closePath();
        k.stroke();
      }], polygonGradientFill: [q, function(k) {
        var r = k.createRadialGradient(0, 0, 10, 0, 0, 60);
        r.addColorStop(0, "rgb(255, 0, 0)");
        r.addColorStop(1, "rgb(255, 255, 0)");
        k.fillStyle = r;
        k.fill();
      }], polygonGradientStroke: [q, function(k) {
        var r = k.createLinearGradient(-100, -100, 100, 100);
        r.addColorStop(0, "rgb(224, 0, 0)");
        r.addColorStop(1, "rgb(32, 0, 0)");
        k.strokeStyle = r;
        k.lineWidth = 2;
        k.closePath();
        k.stroke();
      }], polygonExposureShadow: [q, function(k) {
        k.shadowBlur = 50;
        k.shadowColor = "rgba(0, 0, 0, 1)";
        k.fillStyle = "rgba(0, 0, 0, 1)";
        k.globalCompositeOperation = "source-over";
        k.fill();
        k.shadowBlur = 0;
        k.shadowColor = "transparent";
        k.globalCompositeOperation = "destination-out";
        k.fill();
      }], labelPlainFill: [function(k) {
        k.fillStyle = "#000";
        k.font = "24px sans-serif";
        k.textAlign = "center";
      }, function(k) {
        k.fillText("Some text", 0, -16);
        k.fillText("for testing purposes", 0, 16);
      }] };
      p = 100 / Object.keys(d).length;
      var c = la.now(), b = {}, h;
      for (h in d) {
        var f = d[h], u = la.now(), t = 0;
        do {
          g.save();
          g.translate(Math.random() * e, Math.random() * l);
          var n = 3 * Math.random() + 0.5;
          g.scale(
            n,
            n
          );
          for (n = 0; n < f.length; n++) f[n](g);
          g.restore();
          t++;
          n = la.now();
        } while (n - u < p);
        b[h] = a * (n - u) / t;
      }
      b.total = la.now() - c;
      return b;
    } };
  }();
  var ya = { Yd: function(a, q) {
    var l = q[0];
    a.moveTo(l.x, l.y);
    for (var g = q.length - 1; 0 < g; g--) l = q[g], a.lineTo(l.x, l.y);
  }, gj: function(a, q, l, g) {
    var e, d = [], p = 0, m = q.length;
    for (e = 0; e < m; e++) {
      var c = q[e];
      var b = q[(e + 1) % m];
      c = wa.m(c, b);
      c = Math.sqrt(c);
      d.push(c);
      p += c;
    }
    l = g * (l + 0.5 * g * p / m);
    p = {};
    var h = {}, f = {}, u = 0;
    for (e = 0; e < m; e++) {
      c = q[e];
      b = q[(e + 1) % m];
      g = q[(e + 2) % m];
      var t = d[(e + 1) % m];
      t = Math.min(0.5, l / t);
      wa.ua(1 - t, b, g, h);
      wa.ua(t, b, g, f);
      u++;
      0 == e && (wa.ua(Math.min(0.5, l / d[0]), c, b, p), u++, a.moveTo(p.x, p.y));
      a.quadraticCurveTo(b.x, b.y, h.x, h.y);
      a.lineTo(f.x, f.y);
    }
    return true;
  } };
  function Ba(a) {
    function q() {
      return "embedded" === e.getAttribute("data-foamtree");
    }
    function l(n) {
      f[n] && (f[n].style.opacity = t * u[n]);
    }
    function g(n) {
      n.width = Math.round(p * n.B);
      n.height = Math.round(m * n.B);
    }
    var e, d, p, m, c, b, h = [], f = {}, u = {}, t = 0;
    this.M = function(n) {
      e = n;
      0 !== e.clientWidth && 0 !== e.clientHeight || Ca.Ga("element has zero dimensions: " + e.clientWidth + " x " + e.clientHeight + ".");
      e.innerHTML = "";
      p = e.clientWidth;
      m = e.clientHeight;
      c = 0 !== p ? p : void 0;
      b = 0 !== m ? m : void 0;
      q() && Ca.Ga("visualization already embedded in the element.");
      e.setAttribute("data-foamtree", "embedded");
      d = document.createElement("div");
      d.style.width = "100%";
      d.style.height = "100%";
      d.style.position = "relative";
      e.appendChild(d);
      a.i.D("stage:initialized", this, d, p, m);
    };
    this.$a = function() {
      q() && (e.removeAttribute("data-foamtree"), h = [], f = {}, e.removeChild(d), a.i.D("stage:disposed", this, d));
    };
    this.u = function() {
      p = e.clientWidth;
      m = e.clientHeight;
      if (0 !== p && 0 !== m && (p !== c || m !== b)) {
        for (var n = h.length - 1; 0 <= n; n--) g(h[n]);
        a.i.D("stage:resized", c, b, p, m);
        c = p;
        b = m;
      }
    };
    this.Ui = function(n, k) {
      n.B = k;
      g(n);
    };
    this.hc = function(n, k, r) {
      var x = document.createElement("canvas");
      x.setAttribute("style", "position: absolute; top: 0; bottom: 0; left: 0; right: 0; width: 100%; height: 100%; -webkit-touch-callout: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;");
      x.B = k;
      g(x);
      h.push(x);
      f[n] = x;
      u[n] = 1;
      l(n);
      r || d.appendChild(x);
      a.i.D("stage:newLayer", n, x);
      return x;
    };
    this.cc = function(n, k) {
      P.V(k) || (u[n] = k, l(n));
      return u[n];
    };
    this.m = function(n) {
      P.V(n) || (t = n, P.Aa(
        f,
        function(k, r) {
          l(r);
        }
      ));
      return t;
    };
  }
  ;
  function Da(a) {
    function q(w, z, F) {
      v = true;
      u.x = 0;
      u.y = 0;
      t.x = 0;
      t.y = 0;
      e = h;
      d.x = f.x;
      d.y = f.y;
      z();
      p *= w;
      F ? m = p / e : m = w;
      m = Math.max(0.25 / e, m);
      return true;
    }
    function l(w, z) {
      z.x = w.x / h + f.x;
      z.y = w.y / h + f.y;
      return z;
    }
    function g(w, z, F, E, G, O, H, A, M) {
      var Q = (w - F) * (O - A) - (z - E) * (G - H);
      if (1e-5 > Math.abs(Q)) return false;
      M.x = ((w * E - z * F) * (G - H) - (w - F) * (G * A - O * H)) / Q;
      M.y = ((w * E - z * F) * (O - A) - (z - E) * (G * A - O * H)) / Q;
      return true;
    }
    var e = 1, d = { x: 0, y: 0 }, p = 1, m = 1, c = 1, b = { x: 0, y: 0 }, h = 1, f = { x: 0, y: 0 }, u = { x: 0, y: 0 }, t = { x: 0, y: 0 }, n, k, r = { x: 0, y: 0, w: 0, o: 0 }, x = { x: 0, y: 0, w: 0, o: 0, scale: 1 }, v = true;
    a.i.subscribe("stage:initialized", function(w, z, F, E) {
      n = F;
      k = E;
      r.x = 0;
      r.y = 0;
      r.w = F;
      r.o = E;
      x.x = 0;
      x.y = 0;
      x.w = F;
      x.o = E;
      x.scale = 1;
    });
    a.i.subscribe("stage:resized", function(w, z, F, E) {
      function G(M) {
        M.x *= H;
        M.y *= A;
      }
      function O(M) {
        G(M);
        M.w *= H;
        M.o *= A;
      }
      n = F;
      k = E;
      var H = F / w, A = E / z;
      G(d);
      G(f);
      G(b);
      G(u);
      G(t);
      O(r);
      O(x);
    });
    this.Qb = function(w, z) {
      return q(z, function() {
        l(w, b);
      }, true);
    };
    this.ja = function(w, z) {
      if (1 === Math.round(1e4 * z) / 1e4) {
        z = r.x - f.x;
        var F = r.y - f.y;
        q(1, function() {
        }, true);
        return this.m(-z, -F);
      }
      return q(z, function() {
        for (var E = false; !E; ) {
          E = Math.random();
          var G = Math.random(), O = Math.random(), H = Math.random();
          E = g(w.x + E * w.w, w.y + G * w.o, r.x + E * r.w, r.y + G * r.o, w.x + O * w.w, w.y + H * w.o, r.x + O * r.w, r.y + H * r.o, b);
        }
      }, true);
    };
    this.lc = function(w, z) {
      var F = w.w / w.o;
      var E = n / k;
      if (F < E) {
        var G = w.o * E;
        var O = w.o;
        F = w.x - 0.5 * (G - w.w);
        E = w.y;
      } else F > E ? (G = w.w, O = w.w * k / n, F = w.x, E = w.y - 0.5 * (O - w.o)) : (F = w.x, E = w.y, G = w.w, O = w.o);
      F -= G * z;
      E -= O * z;
      G *= 1 + 2 * z;
      if (g(F, E, f.x, f.y, F + G, E, f.x + n / h, f.y, b)) return q(n / h / G, P.pa, false);
      v = false;
      return this.m(h * (f.x - F), h * (f.y - E));
    };
    this.m = function(w, z) {
      w = Math.round(1e4 * w) / 1e4;
      z = Math.round(1e4 * z) / 1e4;
      t.x += w / h;
      t.y += z / h;
      return 0 !== w || 0 !== z;
    };
    this.reset = function(w) {
      w && this.content(0, 0, n, k);
      return this.ja({ x: r.x + f.x, y: r.y + f.y, w: r.w / h, o: r.o / h }, c / p);
    };
    this.Fb = function(w) {
      c = Math.min(1, Math.round(1e4 * (w || p)) / 1e4);
    };
    this.u = function() {
      return f.x < r.x ? (r.x - f.x) * h : f.x + n / h > r.x + r.w ? -(f.x + n / h - r.x - r.w) * h : 0;
    };
    this.L = function() {
      return f.y < r.y ? (r.y - f.y) * h : f.y + k / h > r.y + r.o ? -(f.y + k / h - r.y - r.o) * h : 0;
    };
    this.update = function(w) {
      var z = Math.abs(Math.log(m));
      6 > z ? z = 2 : (z /= 4, z += 3 * z * (1 < m ? w : 1 - w));
      z = 1 < m ? Math.pow(
        w,
        z
      ) : 1 - Math.pow(1 - w, z);
      z = (v ? z : 1) * (m - 1) + 1;
      h = e * z;
      f.x = b.x - (b.x - d.x) / z;
      f.y = b.y - (b.y - d.y) / z;
      f.x -= u.x * (1 - w) + t.x * w;
      f.y -= u.y * (1 - w) + t.y * w;
      1 === w && (u.x = t.x, u.y = t.y);
      x.x = f.x;
      x.y = f.y;
      x.w = n / h;
      x.o = k / h;
      x.scale = h;
    };
    this.U = function(w) {
      w.x = x.x;
      w.y = x.y;
      w.scale = x.scale;
      return w;
    };
    this.absolute = function(w, z) {
      return l(w, z || {});
    };
    this.Zc = function(w, z) {
      z = z || {};
      z.x = (w.x - f.x) * h;
      z.y = (w.y - f.y) * h;
      return z;
    };
    this.vc = function(w) {
      return this.scale() < c / w;
    };
    this.Dd = function() {
      return P.sd(h, 1);
    };
    this.scale = function() {
      return Math.round(1e4 * h) / 1e4;
    };
    this.content = function(w, z, F, E) {
      r.x = w;
      r.y = z;
      r.w = F;
      r.o = E;
    };
    this.xc = function(w, z) {
      var F;
      for (F = w.length - 1; 0 <= F; F--) {
        var E = w[F];
        E.save();
        E.scale(h, h);
        E.translate(-f.x, -f.y);
      }
      z(x);
      for (F = w.length - 1; 0 <= F; F--) E = w[F], E.restore();
    };
  }
  ;
  var Ea = new function() {
    function a(l) {
      if ("hsl" == l.model || "hsla" == l.model) return l;
      var g = l.r /= 255, e = l.g /= 255, d = l.b /= 255, p = Math.max(g, e, d), m = Math.min(g, e, d), c = (p + m) / 2;
      if (p == m) var b = m = 0;
      else {
        var h = p - m;
        m = 0.5 < c ? h / (2 - p - m) : h / (p + m);
        switch (p) {
          case g:
            b = (e - d) / h + (e < d ? 6 : 0);
            break;
          case e:
            b = (d - g) / h + 2;
            break;
          case d:
            b = (g - e) / h + 4;
        }
        b /= 6;
      }
      l.h = 360 * b;
      l.s = 100 * m;
      l.l = 100 * c;
      l.model = "hsl";
      return l;
    }
    var q = { h: 0, s: 0, l: 0, a: 1, model: "hsla" };
    this.va = function(l) {
      return P.Gc(l) ? a(Ea.sg(l)) : P.wb(l) ? a(l) : q;
    };
    this.sg = function(l) {
      var g;
      return (g = /rgba\(\s*([^,\s]+)\s*,\s*([^,\s]+)\s*,\s*([^,\s]+)\s*,\s*([^,\s]+)\s*\)/.exec(l)) && 5 == g.length ? { r: parseFloat(g[1]), g: parseFloat(g[2]), b: parseFloat(g[3]), a: parseFloat(g[4]), model: "rgba" } : (g = /hsla\(\s*([^,\s]+)\s*,\s*([^,%\s]+)%\s*,\s*([^,\s%]+)%\s*,\s*([^,\s]+)\s*\)/.exec(l)) && 5 == g.length ? { h: parseFloat(g[1]), s: parseFloat(g[2]), l: parseFloat(g[3]), a: parseFloat(g[4]), model: "hsla" } : (g = /rgb\(\s*([^,\s]+)\s*,\s*([^,\s]+)\s*,\s*([^,\s]+)\s*\)/.exec(l)) && 4 == g.length ? {
        r: parseFloat(g[1]),
        g: parseFloat(g[2]),
        b: parseFloat(g[3]),
        a: 1,
        model: "rgb"
      } : (g = /hsl\(\s*([^,\s]+)\s*,\s*([^,\s%]+)%\s*,\s*([^,\s%]+)%\s*\)/.exec(l)) && 4 == g.length ? { h: parseFloat(g[1]), s: parseFloat(g[2]), l: parseFloat(g[3]), a: 1, model: "hsl" } : (g = /#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/.exec(l)) && 4 == g.length ? { r: parseInt(g[1], 16), g: parseInt(g[2], 16), b: parseInt(g[3], 16), a: 1, model: "rgb" } : (g = /#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])/.exec(l)) && 4 == g.length ? { r: 17 * parseInt(g[1], 16), g: 17 * parseInt(g[2], 16), b: 17 * parseInt(g[3], 16), a: 1, model: "rgb" } : q;
    };
    this.og = function(l) {
      function g(b, h, f) {
        0 > f && (f += 1);
        1 < f && --f;
        return f < 1 / 6 ? b + 6 * (h - b) * f : 0.5 > f ? h : f < 2 / 3 ? b + (h - b) * (2 / 3 - f) * 6 : b;
      }
      function e(b, h, f) {
        return Math.sqrt(b * b * 0.241 + h * h * 0.691 + f * f * 0.068) / 255;
      }
      if ("rgb" == l.model || "rgba" == l.model) return e(l.r, l.g, l.b);
      var d = l.l / 100;
      var p = l.s / 100;
      var m = l.h / 360;
      if (0 == l.Nj) d = l = m = d;
      else {
        p = 0.5 > d ? d * (1 + p) : d + p - d * p;
        var c = 2 * d - p;
        d = g(c, p, m + 1 / 3);
        l = g(c, p, m);
        m = g(c, p, m - 1 / 3);
      }
      return e(255 * d, 255 * l, 255 * m);
    };
    this.Ig = function(l) {
      if (P.Gc(l)) return l;
      if (P.wb(l)) switch (l.model) {
        case "hsla":
          return Ea.tg(l);
        case "hsl":
          return Ea.qc(l);
        case "rgba":
          return Ea.Bg(l);
        case "rgb":
          return Ea.ug(l);
        default:
          return "#000";
      }
      else return "#000";
    };
    this.Bg = function(l) {
      return "rgba(" + (0.5 + l.r | 0) + "," + (0.5 + l.g | 0) + "," + (0.5 + l.b | 0) + "," + l.a + ")";
    };
    this.ug = function(l) {
      return "rgba(" + (0.5 + l.r | 0) + "," + (0.5 + l.g | 0) + "," + (0.5 + l.b | 0) + ")";
    };
    this.tg = function(l) {
      return "hsla(" + (0.5 + l.h | 0) + "," + (0.5 + l.s | 0) + "%," + (0.5 + l.l | 0) + "%," + l.a + ")";
    };
    this.qc = function(l) {
      return "hsl(" + (0.5 + l.h | 0) + "," + (0.5 + l.s | 0) + "%," + (0.5 + l.l | 0) + "%)";
    };
    this.ja = function(l, g, e) {
      return "hsl(" + (0.5 + l | 0) + "," + (0.5 + g | 0) + "%," + (0.5 + e | 0) + "%)";
    };
  }();
  function Fa() {
    var a = false, q, l = [], g = this, e = new function() {
      this.then = function(d) {
        d && (a ? d.apply(g, q) : l.push(d));
        return this;
      };
      this.Qg = function(d) {
        g = d;
        return { then: this.then };
      };
    }();
    this.resolve = function() {
      q = arguments;
      for (var d = 0; d < l.length; d++) l[d].apply(g, q);
      a = true;
      return this;
    };
    this.promise = function() {
      return e;
    };
  }
  function Ga(a) {
    var q = new Fa(), l = a.length;
    if (0 < a.length) for (var g = a.length - 1; 0 <= g; g--) a[g].then(function() {
      0 === --l && q.resolve();
    });
    else q.resolve();
    return q.promise();
  }
  function Ha(a) {
    var q = 0;
    this.m = function() {
      q++;
    };
    this.u = function() {
      q--;
      0 === q && a();
    };
    this.clear = function() {
      q = 0;
    };
    this.initial = function() {
      return 0 === q;
    };
  }
  ;
  var Ia = { ue: function(a, q, l, g) {
    g = g || {};
    try {
      var e = a.getBoundingClientRect();
    } catch (p) {
      if (!Ia.Uh) {
        Ia.Uh = true;
        window.console.log("getBoundingClientRect() failed.");
        window.console.log("Element", a);
        e = window.console;
        for (var d = e.log; null !== a.parentElement; ) a = a.parentElement;
        d.call(e, "Attached to DOM", a === document.body.parentElement);
      }
      e = { left: 0, top: 0 };
    }
    g.x = q - e.left;
    g.y = l - e.top;
    return g;
  } };
  function Ja() {
    var a = document, q = {};
    this.addEventListener = function(l, g, e) {
      var d = q[l];
      d || (d = [], q[l] = d);
      d.push(g);
      a.addEventListener(l, g, e);
    };
    this.m = function() {
      P.Aa(q, function(l, g) {
        for (var e = l.length - 1; 0 <= e; e--) a.removeEventListener(g, l[e]);
      });
    };
  }
  ;
  function Ka(a) {
    function q(H) {
      return function(A) {
        l(A) && H.apply(this, arguments);
      };
    }
    function l(H) {
      for (H = H.target; H; ) {
        if (H === a) return true;
        H = H.parentElement;
      }
      return false;
    }
    function g(H, A, M) {
      M = M || {};
      e(H, M);
      for (var Q = 0; Q < A.length; Q++) A[Q].call(H.target, M);
      e(H, M);
      (void 0 === M.Db && M.mi || "prevent" === M.Db) && H.preventDefault();
      return M;
    }
    function e(H, A) {
      Ia.ue(a, H.clientX, H.clientY, A);
      A.altKey = H.altKey;
      A.metaKey = H.metaKey;
      A.ctrlKey = H.ctrlKey;
      A.shiftKey = H.shiftKey;
      A.mb = 3 === H.which;
      return A;
    }
    var d = new Ja(), p = [], m = [], c = [], b = [], h = [], f = [], u = [], t = [], n = [], k = [], r = [];
    this.m = function(H) {
      p.push(H);
    };
    this.u = function(H) {
      h.push(H);
    };
    this.sa = function(H) {
      m.push(H);
    };
    this.va = function(H) {
      c.push(H);
    };
    this.Ga = function(H) {
      b.push(H);
    };
    this.ua = function(H) {
      r.push(H);
    };
    this.ta = function(H) {
      f.push(H);
    };
    this.xa = function(H) {
      u.push(H);
    };
    this.ja = function(H) {
      t.push(H);
    };
    this.L = function(H) {
      n.push(H);
    };
    this.U = function(H) {
      k.push(H);
    };
    this.$a = function() {
      d.m();
    };
    var x, v, w, z, F = { x: 0, y: 0 }, E = { x: 0, y: 0 }, G = false, O = false;
    d.addEventListener("mousedown", q(function(H) {
      if (H.target !== a) {
        var A = g(H, c);
        E.x = A.x;
        E.y = A.y;
        F.x = A.x;
        F.y = A.y;
        G = true;
        g(H, t);
        v = false;
        x = window.setTimeout(function() {
          100 > wa.m(F, A) && (window.clearTimeout(z), g(H, m), v = true);
        }, 400);
      }
    }));
    d.addEventListener("mouseup", function(H) {
      var A = g(H, b);
      G && (O && g(H, k), window.clearTimeout(x), v || O || !l(H) || (A = { x: A.x, y: A.y }, w && 100 > wa.m(A, w) ? g(H, h) : g(H, p), w = A, z = window.setTimeout(function() {
        w = null;
      }, 350)), O = G = false);
    });
    d.addEventListener("mousemove", function(H) {
      var A = e(H, {});
      l(H) && g(H, f, { type: "move" });
      F.x = A.x;
      F.y = A.y;
      G && !O && 100 < wa.m(E, F) && (O = true);
      O && g(H, n, A);
    });
    d.addEventListener("mouseout", q(function(H) {
      g(H, u, { type: "out" });
    }));
    d.addEventListener("wheel", q(/* @__PURE__ */ function() {
      return function(H) {
        if ("deltaY" in H) var A = H.deltaY;
        else A = 0, "detail" in H && (A = H.detail), "wheelDelta" in H && (A = -H.wheelDelta / 120), "wheelDeltaY" in H && (A = -H.wheelDeltaY / 120), "axis" in H && H.axis === H.HORIZONTAL_AXIS && (A = 0), A *= 10;
        A && H.deltaMode && (A = 1 === H.deltaMode ? 67 * A : 800 * A);
        g(H, r, { jd: -A / 200, mi: true });
      };
    }()), { passive: false });
    d.addEventListener("contextmenu", q(function(H) {
      H.preventDefault();
    }));
  }
  ;
  var La = function() {
    function a(e) {
      return function(d) {
        return Math.pow(d, e);
      };
    }
    function q(e) {
      return function(d) {
        return 1 - Math.pow(1 - d, e);
      };
    }
    function l(e) {
      return function(d) {
        return 1 > (d *= 2) ? 0.5 * Math.pow(d, e) : 1 - 0.5 * Math.abs(Math.pow(2 - d, e));
      };
    }
    function g(e) {
      return function(d) {
        for (var p = 0; p < e.length; p++) d = (0, e[p])(d);
        return d;
      };
    }
    return { ga: function(e) {
      switch (e) {
        case "linear":
          return La.Ab;
        case "bounce":
          return La.Cg;
        case "squareIn":
          return La.Zf;
        case "squareOut":
          return La.Gb;
        case "squareInOut":
          return La.$f;
        case "cubicIn":
          return La.Gg;
        case "cubicOut":
          return La.me;
        case "cubicInOut":
          return La.Hg;
        case "quadIn":
          return La.Fi;
        case "quadOut":
          return La.Hi;
        case "quadInOut":
          return La.Gi;
        default:
          return La.Ab;
      }
    }, Ab: function(e) {
      return e;
    }, Cg: g([l(2), function(e) {
      return 0 === e ? 0 : 1 === e ? 1 : e * (e * (e * (e * (25.9425 * e - 85.88) + 105.78) - 58.69) + 13.8475);
    }]), Zf: a(2), Gb: q(2), $f: l(2), Gg: a(3), me: q(3), Hg: l(3), Fi: a(2), Hi: q(2), Gi: l(2), Cj: g };
  }();
  var P = { V: function(a) {
    return void 0 === a;
  }, Xe: function(a) {
    return null === a;
  }, Fc: function(a) {
    return "[object Number]" === Object.prototype.toString.call(a);
  }, Gc: function(a) {
    return "[object String]" === Object.prototype.toString.call(a);
  }, Ve: function(a) {
    return "function" === typeof a;
  }, wb: function(a) {
    return a === Object(a);
  }, sd: function(a, q) {
    return 1e-6 > a - q && -1e-6 < a - q;
  }, Te: function(a) {
    return P.V(a) || P.Xe(a) || P.Gc(a) && !/\S/.test(a);
  }, has: function(a, q) {
    return a && a.hasOwnProperty(q);
  }, cb: function(a, q) {
    if (a) {
      for (var l = q.length - 1; 0 <= l; l--) if (a.hasOwnProperty(q[l])) return true;
    }
    return false;
  }, extend: function(a) {
    P.Mg(Array.prototype.slice.call(arguments, 1), function(q) {
      if (q) for (var l in q) q.hasOwnProperty(l) && (a[l] = q[l]);
    });
    return a;
  }, Lj: function(a, q) {
    return a.map(function(l) {
      return l[q];
    }, []);
  }, Mg: function(a, q, l) {
    null != a && (a.forEach ? a.forEach(q, l) : P.Aa(a, q, l));
  }, Aa: function(a, q, l) {
    for (var g in a) if (a.hasOwnProperty(g) && false === q.call(l, a[g], g, a)) break;
  }, H: function() {
    for (var a = 0; a < arguments.length; a++) {
      var q = arguments[a];
      if (!(P.V(q) || P.Fc(q) && isNaN(q) || P.Gc(q) && P.Te(q))) return q;
    }
  }, Of: function(a, q) {
    q = a.indexOf(q);
    0 <= q && a.splice(q, 1);
  }, Jg: function(a, q, l) {
    var g;
    return function() {
      var e = this, d = arguments, p = l && !g;
      clearTimeout(g);
      g = setTimeout(function() {
        g = null;
        l || a.apply(e, d);
      }, q);
      p && a.apply(e, d);
    };
  }, defer: function(a) {
    setTimeout(a, 1);
  }, Jj: function(a) {
    return a;
  }, pa: function() {
  } };
  var Ma = { Th: function(a, q, l) {
    return ea.Rh() ? function() {
      var g = q + ":" + JSON.stringify(arguments), e = window.localStorage.getItem(g);
      e && (e = JSON.parse(e));
      if (e && Date.now() - e.t < l) return e.v;
      e = a.apply(this, arguments);
      window.localStorage.setItem(g, JSON.stringify({ v: e, t: Date.now() }));
      return e;
    } : a;
  } };
  var Na = { A: function(a, q) {
    function l() {
      var g = [];
      if (Array.isArray(a)) for (var e = 0; e < a.length; e++) {
        var d = a[e];
        d && g.push(d.apply(q, arguments));
      }
      else a && g.push(a.apply(q, arguments));
      return g;
    }
    l.empty = function() {
      return 0 === a.length && !P.Ve(a);
    };
    return l;
  } };
  function Oa() {
    var a = {};
    this.subscribe = function(q, l) {
      var g = a[q];
      g || (g = [], a[q] = g);
      g.push(l);
    };
    this.D = function(q, l) {
      var g = a[q];
      if (g) for (var e = Array.prototype.slice.call(arguments, 1), d = 0; d < g.length; d++) g[d].apply(this, e);
    };
  }
  ;
  var Pa = { Vf: function(a) {
    for (var q = "", l = 0; l < a.length; l++) q += String.fromCharCode(a.charCodeAt(l) ^ 1);
    return q;
  } };
  function Qa(a) {
    function q(b, h, f) {
      var u = this, t, n = 0;
      this.id = p++;
      this.name = f ? f : "{unnamed on " + b + "}";
      this.target = function() {
        return b;
      };
      this.xb = function() {
        return -1 != c.indexOf(u);
      };
      this.start = function() {
        if (!u.xb()) {
          if (-1 == c.indexOf(u)) {
            var k = m.now();
            true === u.gf(k) && (c = c.slice(), c.push(u));
          }
          0 < c.length && a.repeat(g);
        }
        return this;
      };
      this.stop = function() {
        for (d(u); t < h.length; t++) {
          var k = h[t];
          k.Ya && k.hb.call();
        }
        return this;
      };
      this.gf = function(k) {
        n++;
        if (0 !== h.length) {
          if (P.V(t)) {
            t = 0;
            var r = h[t];
            r.before && r.before.call(
              r,
              k,
              n,
              u
            );
          } else r = h[t];
          for (; t < h.length; ) {
            if (r.hb && r.hb.call(r, k, n, u)) return true;
            r.after && r.after.call(r, k, n, u);
            P.V(t) && (t = -1);
            ++t < h.length && (r = h[t], r.before && r.before.call(r, k, n, u));
          }
        }
        return false;
      };
    }
    function l(b) {
      return P.V(b) ? c.slice() : c.filter(function(h) {
        return h.target() === b;
      });
    }
    function g() {
      e();
      0 == c.length && a.cancel(g);
    }
    function e() {
      var b = m.now();
      c.forEach(function(h) {
        true !== h.gf(b) && d(h);
      });
    }
    function d(b) {
      c = c.filter(function(h) {
        return h !== b;
      });
    }
    var p = 0, m = la.create(), c = [];
    this.m = function() {
      for (var b = c.length - 1; 0 <= b; b--) c[b].stop();
      c = [];
    };
    this.J = function() {
      function b() {
      }
      function h(k) {
        function r(E) {
          return P.Ve(E) ? E.call(void 0) : E;
        }
        var x = k.target, v = k.duration, w = k.ba, z, F;
        this.before = function() {
          z = {};
          for (var E in k.R) x.hasOwnProperty(E) && (z[E] = { start: P.V(k.R[E].start) ? x[E] : r(k.R[E].start), end: P.V(k.R[E].end) ? x[E] : r(k.R[E].end), easing: P.V(k.R[E].easing) ? La.Ab : k.R[E].easing });
          F = m.now();
        };
        this.hb = function() {
          var E = m.now() - F;
          E = 0 === v ? 1 : Math.min(v, E) / v;
          for (var G in z) {
            var O = z[G];
            x[G] = O.start + (O.end - O.start) * O.easing(E);
          }
          w && w.call(x, E);
          return 1 > E;
        };
      }
      function f(k, r, x) {
        this.Ya = x;
        this.hb = function() {
          k.call(r);
          return false;
        };
      }
      function u(k) {
        var r;
        this.before = function(x, v) {
          r = v + k;
        };
        this.hb = function(x, v) {
          return v < r;
        };
      }
      function t(k) {
        var r;
        this.before = function(x) {
          r = x + k;
        };
        this.hb = function(x) {
          return x < r;
        };
      }
      function n(k) {
        this.before = function() {
          k.forEach(function(r) {
            r.start();
          });
        };
        this.hb = function() {
          for (var r = 0; r < k.length; r++) if (k[r].xb()) return true;
          return false;
        };
      }
      b.A = function(k, r) {
        return new function() {
          function x(w, z, F, E) {
            return z ? (P.V(F) && (F = k), w.Pb(new f(z, F, E))) : w;
          }
          var v = [];
          this.Pb = function(w) {
            v.push(w);
            return this;
          };
          this.wait = function(w) {
            return this.Pb(new t(w));
          };
          this.ae = function(w) {
            return this.Pb(new u(w || 1));
          };
          this.call = function(w, z) {
            return x(this, w, z, false);
          };
          this.Ya = function(w, z) {
            return x(this, w, z, true);
          };
          this.ea = function(w) {
            P.V(w.target) && (w.target = k);
            return this.Pb(new h(w));
          };
          this.Qa = function(w) {
            return this.Pb(new n(w));
          };
          this.done = function() {
            return new q(k, v, r);
          };
          this.start = function() {
            return this.done().start();
          };
          this.rg = function() {
            var w = new Fa();
            this.ae().call(w.resolve).done();
            return w.promise();
          };
          this.Ta = function() {
            var w = this.rg();
            this.start();
            return w;
          };
        }();
      };
      b.mc = function(k) {
        l(k).forEach(function(r) {
          r.stop();
        });
        return b.A(k, void 0);
      };
      return b;
    }();
  }
  ;
  var Ra = function() {
    var a = { te: function(q, l) {
      if (q.j) {
        q = q.j;
        for (var g = 0; g < q.length; g++) l(q[g], g);
      }
    }, yc: function(q, l) {
      if (q.j) {
        q = q.j;
        for (var g = 0; g < q.length; g++) if (false === a.yc(q[g], l) || false === l(q[g], g)) return false;
      }
    } };
    a.K = a.yc;
    a.zc = function(q, l) {
      if (q.j) {
        q = q.j;
        for (var g = 0; g < q.length; g++) if (false === l(q[g], g) || false === a.zc(q[g], l)) return false;
      }
    };
    a.za = function(q, l) {
      if (q.j) {
        for (var g = q.j, e = 0; e < g.length; e++) if (false === a.za(g[e], l)) return false;
      }
      return l(q);
    };
    a.Dj = a.za;
    a.kd = function(q, l) {
      false !== l(q) && a.zc(q, l);
    };
    a.Ac = function(q, l) {
      var g = [];
      a.zc(
        q,
        function(e) {
          g.push(e);
        }
      );
      return l ? g.filter(l) : g;
    };
    a.se = function(q, l) {
      for (q = q.parent; q && false !== l(q); ) q = q.parent;
    };
    a.Vh = function(q, l) {
      for (q = q.parent; q && q !== l; ) q = q.parent;
      return !!q;
    };
    return a;
  }();
  var wa = new function() {
    function a(l, g) {
      var e = l.x - g.x;
      l = l.y - g.y;
      return e * e + l * l;
    }
    function q(l, g, e) {
      for (var d = 0; d < l.length; d++) {
        var p = wa.ta(l[d], l[d + 1] || l[0], g, e, true);
        if (p) return p;
      }
    }
    this.ta = function(l, g, e, d, p) {
      var m = l.x;
      l = l.y;
      var c = g.x - m;
      g = g.y - l;
      var b = e.x, h = e.y;
      e = d.x - b;
      var f = d.y - h;
      d = c * f - e * g;
      if (!(1e-12 >= d && -1e-12 <= d) && (b -= m, h -= l, e = (b * f - e * h) / d, d = (b * g - c * h) / d, 0 <= d && (p || 1 >= d) && 0 <= e && 1 >= e)) return { x: m + c * e, y: l + g * e };
    };
    this.mg = function(l, g, e, d) {
      var p = l.x;
      l = l.y;
      var m = g.x - p;
      g = g.y - l;
      var c = e.x;
      e = e.y;
      var b = d.x - c;
      d = d.y - e;
      var h = m * d - b * g;
      if (!(1e-12 >= h && -1e-12 <= h) && (d = ((c - p) * d - b * (e - l)) / h, 0 <= d && 1 >= d)) return { x: p + m * d, y: l + g * d };
    };
    this.rc = function(l, g, e) {
      var d = wa.u(g, {}), p = wa.u(e, {}), m = p.x - d.x, c = p.y - d.y, b = [];
      for (p = 0; p < e.length; p++) {
        var h = e[p];
        b.push({ x: h.x - m, y: h.y - c });
      }
      e = [];
      h = [];
      for (p = 0; p < l.length; p++) {
        var f = l[p], u = q(g, d, f);
        u ? (e.push(u), h.push(q(b, d, f))) : (e.push(null), h.push(null));
      }
      for (p = 0; p < l.length; p++) if (u = e[p], f = h[p], u && f) {
        g = l[p];
        b = d;
        var t = u.x - d.x;
        u = u.y - d.y;
        u = Math.sqrt(t * t + u * u);
        if (1e-12 < u) {
          t = g.x - d.x;
          var n = g.y - d.y;
          u = Math.sqrt(t * t + n * n) / u;
          g.x = b.x + u * (f.x - b.x);
          g.y = b.y + u * (f.y - b.y);
        } else g.x = b.x, g.y = b.y;
      }
      for (p = 0; p < l.length; p++) h = l[p], h.x += m, h.y += c;
    };
    this.F = function(l, g) {
      if (0 !== l.length) {
        var e, d;
        var p = e = l[0].x;
        var m = d = l[0].y;
        for (var c = l.length; 0 < --c; ) p = Math.min(p, l[c].x), e = Math.max(e, l[c].x), m = Math.min(m, l[c].y), d = Math.max(d, l[c].y);
        g.x = p;
        g.y = m;
        g.w = e - p;
        g.o = d - m;
        return g;
      }
    };
    this.L = function(l) {
      return [{ x: l.x, y: l.y }, { x: l.x + l.w, y: l.y }, { x: l.x + l.w, y: l.y + l.o }, { x: l.x, y: l.y + l.o }];
    };
    this.u = function(l, g) {
      for (var e = 0, d = 0, p = l.length, m = l[0], c = 0, b = 1; b < p - 1; b++) {
        var h = l[b], f = l[b + 1], u = m.y + h.y + f.y, t = (h.x - m.x) * (f.y - m.y) - (f.x - m.x) * (h.y - m.y);
        e += t * (m.x + h.x + f.x);
        d += t * u;
        c += t;
      }
      g.x = e / (3 * c);
      g.y = d / (3 * c);
      g.fa = c / 2;
      return g;
    };
    this.ce = function(l, g) {
      this.u(l, g);
      g.r = Math.sqrt(g.fa / Math.PI);
    };
    this.Wa = function(l, g) {
      for (var e = 0; e < l.length; e++) {
        var d = l[e], p = l[e + 1] || l[0];
        if (0 > (g.y - d.y) * (p.x - d.x) - (g.x - d.x) * (p.y - d.y)) return false;
      }
      return true;
    };
    this.Dg = function(l, g, e) {
      var d = l.x, p = g.x;
      l.x > g.x && (d = g.x, p = l.x);
      p > e.x + e.w && (p = e.x + e.w);
      d < e.x && (d = e.x);
      if (d > p) return false;
      var m = l.y, c = g.y, b = g.x - l.x;
      1e-7 < Math.abs(b) && (c = (g.y - l.y) / b, l = l.y - c * l.x, m = c * d + l, c = c * p + l);
      m > c && (d = c, c = m, m = d);
      c > e.y + e.o && (c = e.y + e.o);
      m < e.y && (m = e.y);
      return m <= c;
    };
    this.de = function(l, g, e, d, p) {
      var m;
      function c(n, k, r) {
        if (g.x === f.x && g.y === f.y) return r;
        var x = q(l, g, f), v = Math.sqrt(a(x, g) / (n * n + k * k));
        return v < b ? (b = v, m = x.x, h = x.y, 0 !== k ? Math.abs(h - g.y) / Math.abs(k) : Math.abs(m - g.x) / Math.abs(n)) : r;
      }
      d = P.H(d, 0.5);
      p = P.H(p, 0.5);
      e = P.H(e, 1);
      var b = Number.MAX_VALUE;
      var h = m = 0;
      var f = { x: 0, y: 0 }, u = d * e;
      e = (1 - d) * e;
      d = 1 - p;
      f.x = g.x - u;
      f.y = g.y - p;
      var t = c(
        u,
        p,
        t
      );
      f.x = g.x + e;
      f.y = g.y - p;
      t = c(e, p, t);
      f.x = g.x - u;
      f.y = g.y + d;
      t = c(u, d, t);
      f.x = g.x + e;
      f.y = g.y + d;
      return t = c(e, d, t);
    };
    this.qg = function(l, g) {
      function e(b, h, f) {
        var u = h.x, t = f.x;
        h = h.y;
        f = f.y;
        var n = t - u, k = f - h;
        return Math.abs(k * b.x - n * b.y - u * f + t * h) / Math.sqrt(n * n + k * k);
      }
      for (var d = l.length, p = e(g, l[d - 1], l[0]), m = 0; m < d - 1; m++) {
        var c = e(g, l[m], l[m + 1]);
        c < p && (p = c);
      }
      return p;
    };
    this.Nb = function(l, g, e) {
      var d;
      e = { x: g.x + Math.cos(e), y: g.y - Math.sin(e) };
      var p = [], m = [], c = l.length;
      for (d = 0; d < c; d++) {
        var b = wa.mg(l[d], l[(d + 1) % c], g, e);
        if (b && (p.push(b), 2 == m.push(d))) break;
      }
      if (2 == p.length) {
        b = p[0];
        p = p[1];
        var h = m[0];
        m = m[1];
        var f = [p, b];
        for (d = h + 1; d <= m; d++) f.push(l[d]);
        for (d = [b, p]; m != h; ) m = (m + 1) % c, d.push(l[m]);
        l = [f, d];
        c = e.x - g.x;
        d = p.x - b.x;
        0 === c && (c = e.y - g.y, d = p.y - b.y);
        (0 > c ? -1 : 0 < c ? 1 : 0) !== (0 > d ? -1 : 0 < d ? 1 : 0) && l.reverse();
        return l;
      }
    };
    this.ua = function(l, g, e, d) {
      d.x = l * (g.x - e.x) + e.x;
      d.y = l * (g.y - e.y) + e.y;
      return d;
    };
    this.m = a;
    this.Lb = function(l, g, e) {
      if (P.Fc(g)) var d = 2 * Math.PI * g / 360;
      else switch (d = wa.F(l, {}), g) {
        case "random":
          d = Math.random() * Math.PI * 2;
          break;
        case "top":
          d = Math.atan2(
            -d.o,
            0
          );
          break;
        case "bottom":
          d = Math.atan2(d.o, 0);
          break;
        case "left":
          d = Math.atan2(0, -d.w);
          break;
        case "right":
          d = Math.atan2(0, d.w);
          break;
        case "topleft":
          d = Math.atan2(-d.o, -d.w);
          break;
        case "topright":
          d = Math.atan2(-d.o, d.w);
          break;
        case "bottomleft":
          d = Math.atan2(d.o, -d.w);
          break;
        default:
          d = Math.atan2(d.o, d.w);
      }
      g = wa.u(l, {});
      l = q(l, g, { x: g.x + Math.cos(d), y: g.y + Math.sin(d) });
      return wa.ua(e, l, g, {});
    };
    return this;
  }();
  var Sa = new function() {
    function a(d, p) {
      this.face = d;
      this.Wc = p;
      this.ic = this.Qc = null;
    }
    function q(d, p, m) {
      this.ka = [d, p, m];
      this.I = Array(3);
      var c = p.y - d.y, b = m.z - d.z, h = p.x - d.x;
      p = p.z - d.z;
      var f = m.x - d.x;
      d = m.y - d.y;
      this.Ja = { x: c * b - p * d, y: p * f - h * b, z: h * d - c * f };
      this.Za = [];
      this.ed = this.visible = false;
    }
    this.U = function(d) {
      function p(aa, C, U) {
        var fa = aa.ka[0], ba = aa.Ja, ia = ba.x, N = ba.y;
        ba = ba.z;
        var R = Array(b);
        C = C.Za;
        var ca = C.length;
        for (c = 0; c < ca; c++) {
          var I = C[c].Wc;
          R[I.index] = true;
          0 > ia * (I.x - fa.x) + N * (I.y - fa.y) + ba * (I.z - fa.z) && a.add(aa, I);
        }
        C = U.Za;
        ca = C.length;
        for (c = 0; c < ca; c++) I = C[c].Wc, true !== R[I.index] && 0 > ia * (I.x - fa.x) + N * (I.y - fa.y) + ba * (I.z - fa.z) && a.add(aa, I);
      }
      var m, c, b = d.length;
      for (m = 0; m < b; m++) d[m].index = m, d[m].Sb = null;
      var h = [], f;
      if (0 < (f = function() {
        function aa(T, S, V, ka) {
          var y = { x: S.x - T.x, y: S.y - T.y, z: S.z - T.z };
          var B = { x: V.x - T.x, y: V.y - T.y, z: V.z - T.z };
          var D = y.y * B.z - y.z * B.y;
          var J = y.z * B.x - y.x * B.z;
          y = y.x * B.y - y.y * B.x;
          return D * ka.x + J * ka.y + y * ka.z > D * T.x + J * T.y + y * T.z ? new q(T, S, V) : new q(V, S, T);
        }
        function C(T, S, V, ka) {
          function y(B, D, J) {
            B = B.ka;
            D = B[0] == D ? 0 : B[1] == D ? 1 : 2;
            return B[(D + 1) % 3] != J ? (D + 2) % 3 : D;
          }
          S.I[y(S, V, ka)] = T;
          T.I[y(T, ka, V)] = S;
        }
        if (4 > b) return 0;
        var U = d[0], fa = d[1], ba = d[2], ia = d[3], N = aa(U, fa, ba, ia), R = aa(U, ba, ia, fa), ca = aa(U, fa, ia, ba), I = aa(fa, ba, ia, U);
        C(N, R, ba, U);
        C(N, ca, U, fa);
        C(N, I, fa, ba);
        C(R, ca, ia, U);
        C(R, I, ba, ia);
        C(ca, I, ia, fa);
        h.push(N, R, ca, I);
        for (U = 4; U < b; U++) for (fa = d[U], ba = 0; 4 > ba; ba++) ia = h[ba], N = ia.ka[0], R = ia.Ja, 0 > R.x * (fa.x - N.x) + R.y * (fa.y - N.y) + R.z * (fa.z - N.z) && a.add(ia, fa);
        return 4;
      }())) {
        for (; f < b; ) {
          var u = d[f];
          if (u.Sb) {
            for (m = u.Sb; null !== m; ) m.face.visible = true, m = m.ic;
            m = 0;
            a: for (; m < h.length; m++) {
              var t = h[m];
              if (false === t.visible) {
                var n = t.I;
                for (c = 0; 3 > c; c++) if (true === n[c].visible) {
                  var k = t;
                  var r = c;
                  break a;
                }
              }
            }
            t = [];
            n = [];
            var x = k, v = r;
            do
              if (t.push(x), n.push(v), v = (v + 1) % 3, false === x.I[v].visible) {
                do
                  for (m = x.ka[v], x = x.I[v], c = 0; 3 > c; c++) x.ka[c] == m && (v = c);
                while (false === x.I[v].visible && (x !== k || v !== r));
              }
            while (x !== k || v !== r);
            var w = null, z = null;
            for (m = 0; m < t.length; m++) {
              x = t[m];
              v = n[m];
              var F = x.I[v], E = x.ka[(v + 1) % 3], G = x.ka[v], O = E.y - u.y, H = G.z - u.z, A = E.x - u.x, M = E.z - u.z, Q = G.x - u.x, X = G.y - u.y;
              if (0 < e.length) {
                var Y = e.pop();
                Y.ka[0] = u;
                Y.ka[1] = E;
                Y.ka[2] = G;
                Y.Ja.x = O * H - M * X;
                Y.Ja.y = M * Q - A * H;
                Y.Ja.z = A * X - O * Q;
                Y.Za.length = 0;
                Y.visible = false;
                Y.ed = true;
              } else Y = { ka: [u, E, G], I: Array(3), Ja: { x: O * H - M * X, y: M * Q - A * H, z: A * X - O * Q }, Za: [], visible: false };
              h.push(Y);
              x.I[v] = Y;
              Y.I[1] = x;
              null !== z && (z.I[0] = Y, Y.I[2] = z);
              z = Y;
              null === w && (w = Y);
              p(Y, x, F);
            }
            z.I[0] = w;
            w.I[2] = z;
            m = [];
            for (c = 0; c < h.length; c++) if (t = h[c], true === t.visible) {
              n = t.Za;
              x = n.length;
              for (u = 0; u < x; u++) v = n[u], w = v.Qc, z = v.ic, null !== w && (w.ic = z), null !== z && (z.Qc = w), null === w && (v.Wc.Sb = z), l.push(v);
              t.ed && e.push(t);
            } else m.push(t);
            h = m;
          }
          f++;
        }
        for (m = 0; m < h.length; m++) t = h[m], t.ed && e.push(t);
      }
      return { ve: h };
    };
    a.add = function(d, p) {
      if (0 < l.length) {
        var m = l.pop();
        m.face = d;
        m.Wc = p;
        m.ic = null;
        m.Qc = null;
      } else m = new a(d, p);
      d.Za.push(m);
      d = p.Sb;
      null !== d && (d.Qc = m);
      m.ic = d;
      p.Sb = m;
    };
    for (var l = Array(2e3), g = 0; g < l.length; g++) l[g] = new a(null, null);
    var e = Array(1e3);
    for (g = 0; g < e.length; g++) e[g] = { ka: Array(3), I: Array(3), Ja: { x: 0, y: 0, z: 0 }, Za: [], visible: false };
  }();
  var Ta = new function() {
    function a(q, l, g, e, d, p, m, c) {
      var b = (q - g) * (p - c) - (l - e) * (d - m);
      if (!(1e-12 > Math.abs(b))) return { x: ((q * e - l * g) * (d - m) - (q - g) * (d * c - p * m)) / b, y: ((q * e - l * g) * (p - c) - (l - e) * (d * c - p * m)) / b };
    }
    this.Na = function(q, l) {
      for (var g = q[0], e = g.x, d = g.y, p = g.x, m = g.y, c = q.length - 1; 0 < c; c--) g = q[c], e = Math.min(e, g.x), d = Math.min(d, g.y), p = Math.max(p, g.x), m = Math.max(m, g.y);
      if (!(p - e < 3 * l || m - d < 3 * l)) {
        a: {
          g = true;
          void 0 == g && (g = false);
          e = [];
          d = q.length;
          for (p = 0; p <= d; p++) {
            m = q[p % d];
            c = q[(p + 1) % d];
            var b = q[(p + 2) % d];
            var h = c.x - m.x;
            var f = c.y - m.y;
            var u = Math.sqrt(h * h + f * f);
            var t = l * h / u, n = l * f / u;
            h = b.x - c.x;
            f = b.y - c.y;
            u = Math.sqrt(h * h + f * f);
            h = l * h / u;
            f = l * f / u;
            if (m = a(m.x - n, m.y + t, c.x - n, c.y + t, c.x - f, c.y + h, b.x - f, b.y + h)) {
              if (e.push(m), b = e.length, g && 3 <= b && (m = e[b - 3], c = e[b - 2], b = e[b - 1], 0 > (c.x - m.x) * (b.y - m.y) - (b.x - m.x) * (c.y - m.y))) {
                g = void 0;
                break a;
              }
            }
          }
          e.shift();
          g = 3 > e.length ? void 0 : e;
        }
        if (!g) a: {
          e = q.slice(0);
          for (g = 0; g < q.length; g++) {
            p = q[g % q.length];
            c = q[(g + 1) % q.length];
            b = c.x - p.x;
            d = c.y - p.y;
            m = Math.sqrt(b * b + d * d);
            b = l * b / m;
            m = l * d / m;
            d = p.x - m;
            p = p.y + b;
            m = c.x - m;
            b = c.y + b;
            if (0 != e.length) {
              n = d - m;
              f = p - b;
              t = [];
              h = u = true;
              for (c = 0; c < e.length; c++) {
                var k = n * (p - e[c].y) - (d - e[c].x) * f;
                1e-12 >= k && -1e-12 <= k && (k = 0);
                t.push(k);
                0 < k && (u = false);
                0 > k && (h = false);
              }
              if (u) e = [];
              else if (!h) {
                n = [];
                for (c = 0; c < e.length; c++) f = (c + 1) % e.length, u = t[c], h = t[f], 0 <= u && n.push(e[c]), (0 < u && 0 > h || 0 > u && 0 < h) && n.push(a(e[c].x, e[c].y, e[f].x, e[f].y, d, p, m, b));
                e = n;
              }
            }
            if (3 > e.length) {
              g = void 0;
              break a;
            }
          }
          g = e;
        }
        return g;
      }
    };
    return this;
  }();
  var Ua = new function() {
    function a(q) {
      for (var l = q[0].x, g = q[0].y, e = l, d = g, p = 1; p < q.length; p++) {
        var m = q[p];
        l = Math.min(l, m.x);
        g = Math.min(g, m.y);
        e = Math.max(e, m.x);
        d = Math.max(d, m.y);
      }
      q = e - l;
      d -= g;
      return [{ x: l + 2 * q, y: g + 2 * d, w: 0 }, { x: l + 2 * q, y: g - 2 * d, w: 0 }, { x: l - 2 * q, y: g + 2 * d, w: 0 }];
    }
    this.U = function(q, l) {
      function g(n) {
        var k = [n[0]], r = n[0][0], x = n[0][1], v = n.length, w = 1;
        a: for (; w < v; w++) for (var z = 1; z < v; z++) {
          var F = n[z];
          if (null !== F) {
            if (F[1] === r) if (k.unshift(F), r = F[0], n[z] = null, k.length === v) break a;
            else continue;
            if (F[0] === x && (k.push(F), x = F[1], n[z] = null, k.length === v)) break a;
          }
        }
        k[0][0] != k[v - 1][1] && k.push([k[v - 1][1], k[0][0]]);
        return k;
      }
      function e(n, k, r, x) {
        var v = [], w = [], z = r.length, F, E = k.length, G = 0, O = -1, H = -1, A, M = x;
        for (x = 0; x < z; x++) {
          var Q = (M + 1) % z, X = r[M][0], Y = r[Q][0];
          if (1e-12 < wa.m(X.da, Y.da)) if (X.kb && Y.kb) {
            var aa = [], C = [];
            for (F = 0; F < E; F++) {
              var U = (G + 1) % E;
              if (A = wa.ta(k[G], k[U], X.da, Y.da, false)) {
                if (C.push(G), 2 === aa.push(A)) break;
              }
              G = U;
            }
            if (2 === aa.length) {
              F = aa[1];
              A = wa.m(X.da, aa[0]);
              F = wa.m(X.da, F);
              X = A < F ? 0 : 1;
              A = A < F ? 1 : 0;
              F = C[X];
              -1 === O && (O = F);
              if (-1 !== H) for (; F != H; ) H = (H + 1) % E, v.push(k[H]), w.push(null);
              v.push(aa[X], aa[A]);
              w.push(r[M][2], null);
              H = C[A];
            }
          } else if (X.kb && !Y.kb) for (F = 0; F < E; F++) {
            U = (G + 1) % E;
            if (A = wa.ta(k[G], k[U], X.da, Y.da, false)) {
              if (-1 !== H) for (aa = H; G != aa; ) aa = (aa + 1) % E, v.push(k[aa]), w.push(null);
              v.push(A);
              w.push(r[M][2]);
              -1 === O && (O = G);
              break;
            }
            G = U;
          }
          else if (!X.kb && Y.kb) for (F = 0; F < E; F++) {
            U = (G + 1) % E;
            if (A = wa.ta(k[G], k[U], X.da, Y.da, false)) {
              v.push(X.da, A);
              w.push(r[M][2], null);
              H = G;
              break;
            }
            G = U;
          }
          else v.push(X.da), w.push(r[M][2]);
          M = Q;
        }
        if (0 == v.length) w = v = null;
        else if (-1 !== H) for (; O != H; ) H = (H + 1) % E, v.push(k[H]), w.push(null);
        n.C = v;
        n.I = w;
      }
      if (1 === q.length) q[0].C = l.slice(0), q[0].I = [];
      else {
        var d;
        var p = a(l);
        var m = [];
        for (d = 0; d < p.length; d++) {
          var c = p[d];
          m.push({ x: c.x, y: c.y, z: c.x * c.x + c.y * c.y - c.w });
        }
        for (d = 0; d < q.length; d++) c = q[d], c.C = null, m.push({ x: c.x, y: c.y, z: c.x * c.x + c.y * c.y - c.w });
        var b = Sa.U(m).ve;
        (function() {
          for (d = 0; d < b.length; d++) {
            var n = b[d], k = n.ka, r = k[0], x = k[1], v = k[2];
            k = r.x;
            var w = r.y;
            r = r.z;
            var z = x.x, F = x.y;
            x = x.z;
            var E = v.x, G = v.y;
            v = v.z;
            var O = k * (F - G) + z * (G - w) + E * (w - F);
            n.da = { x: -(w * (x - v) + F * (v - r) + G * (r - x)) / O / 2, y: -(r * (z - E) + x * (E - k) + v * (k - z)) / O / 2 };
          }
        })();
        (function(n) {
          for (d = 0; d < b.length; d++) {
            var k = b[d];
            k.kb = !wa.Wa(n, k.da);
          }
        })(l);
        m = function(n, k) {
          var r = Array(k.length), x;
          for (x = 0; x < r.length; x++) r[x] = [];
          for (x = 0; x < n.length; x++) {
            var v = n[x];
            if (!(0 > v.Ja.z)) for (var w = v.I, z = 0; z < w.length; z++) {
              var F = w[z];
              if (!(0 > F.Ja.z)) {
                var E = v.ka, G = E[(z + 1) % 3].index;
                E = E[z].index;
                2 < G && r[G - 3].push([v, F, 2 < E ? k[E - 3] : null]);
              }
            }
          }
          return r;
        }(b, q);
        for (d = 0; d < q.length; d++) if (c = m[d], 0 !== c.length) {
          var h = q[d];
          c = g(c);
          var f = c.length, u = -1;
          for (p = 0; p < f; p++) c[p][0].kb && (u = p);
          if (0 <= u) e(h, l, c, u);
          else {
            u = [];
            var t = [];
            for (p = 0; p < f; p++) 1e-12 < wa.m(c[p][0].da, c[(p + 1) % f][0].da) && (u.push(c[p][0].da), t.push(c[p][2]));
            h.C = u;
            h.I = t;
          }
          h.C && 3 > h.C.length && (h.C = null, h.I = null);
        }
      }
    };
    this.pc = function(q, l) {
      var g, e = false, d = q.length;
      for (g = 0; g < d; g++) {
        var p = q[g];
        null === p.C && (e = true);
        p.be = p.w;
      }
      if (e) {
        e = a(l);
        var m = [];
        g = q.length;
        for (p = 0; p < e.length; p++) {
          var c = e[p];
          m.push({ x: c.x, y: c.y, z: c.x * c.x + c.y * c.y });
        }
        for (p = 0; p < g; p++) c = q[p], m.push({ x: c.x, y: c.y, z: c.x * c.x + c.y * c.y });
        c = Sa.U(m).ve;
        e = Array(g);
        for (p = 0; p < g; p++) e[p] = {};
        m = c.length;
        for (p = 0; p < m; p++) {
          var b = c[p];
          if (0 < b.Ja.z) {
            var h = b.ka, f = h.length;
            for (b = 0; b < f - 1; b++) {
              var u = h[b].index - 3, t = h[b + 1].index - 3;
              0 <= u && 0 <= t && (e[u][t] = true, e[t][u] = true);
            }
            b = h[0].index - 3;
            0 <= t && 0 <= b && (e[t][b] = true, e[b][t] = true);
          }
        }
        for (p = 0; p < g; p++) {
          b = e[p];
          c = q[p];
          t = Number.MAX_VALUE;
          m = null;
          for (var n in b) b = q[n], h = wa.m(c, b), t > h && (t = h, m = b);
          c.Kj = m;
          c.ef = Math.sqrt(t);
        }
        for (g = 0; g < d; g++) p = q[g], n = Math.min(Math.sqrt(p.w), 0.95 * p.ef), p.w = n * n;
        this.U(q, l);
        for (g = 0; g < d; g++) p = q[g], p.be !== p.w && 0 < p.nc && (l = Math.min(
          p.nc,
          p.be - p.w
        ), p.w += l, p.nc -= l);
      }
    };
  }();
  var Va = new function() {
    this.pg = function(a) {
      a = a.j;
      for (var q = 0, l = a.length, g = 0; g < l; g++) {
        var e = a[g];
        if (e.C) {
          var d = e.x, p = e.y;
          wa.u(e.C, e);
          d -= e.x;
          e = p - e.y;
          e = (0 < d ? d : -d) + (0 < e ? e : -e);
          q < e && (q = e);
        }
      }
      return q;
    };
    this.sa = function(a, q) {
      var l = a.j;
      switch (q) {
        case "random":
          return a.j[Math.floor(l.length * Math.random())];
        case "topleft":
          a = l[0];
          var g = a.x + a.y;
          for (q = 1; q < l.length; q++) {
            var e = l[q];
            var d = e.x + e.y;
            d < g && (g = d, a = e);
          }
          return a;
        case "bottomright":
          a = l[0];
          g = a.x + a.y;
          for (q = 1; q < l.length; q++) e = l[q], d = e.x + e.y, d > g && (g = d, a = e);
          return a;
        default:
          e = l[0];
          g = d = wa.m(a, e);
          for (q = l.length - 1; 1 <= q; q--) {
            var p = l[q];
            d = wa.m(a, p);
            d < g && (g = d, e = p);
          }
          return e;
      }
    };
    this.xa = function(a, q, l) {
      var g = a.j;
      if (g[0].I) {
        var e = g.length;
        for (a = 0; a < e; a++) g[a].Xc = false, g[a].bc = 0;
        e = [];
        var d;
        var p = d = 0;
        e[d++] = q || g[0];
        for (q = q.bc = 0; p < d; ) if (g = e[p++], !g.Xc && g.I) {
          l(g, q++, g.bc);
          g.Xc = true;
          var m = g.I, c = m.length;
          for (a = 0; a < c; a++) {
            var b = m[a];
            b && true !== b.Xc && (0 === b.bc && (b.bc = g.bc + 1), e[d++] = b);
          }
        }
      } else for (a = 0; a < g.length; a++) l(g[a], a, 1);
    };
  }();
  var ta = /* @__PURE__ */ function() {
    function a(n, k, r, x, v, w, z, F) {
      var E = P.extend({}, m, n);
      1 > n.lineHeight && (n.lineHeight = 1);
      n = E.fontFamily;
      var G = E.fontStyle + " " + E.fontVariant + " " + E.fontWeight, O = E.ib, H = E.Lc, A = G + " " + n;
      E.ze = A;
      var M = { ia: false, ec: 0, fontSize: 0 };
      k.save();
      k.font = G + " 100px " + n;
      k.textBaseline = "middle";
      k.textAlign = "center";
      q(k, E);
      r = r.trim();
      u.text = r;
      e(x, v, w, t);
      if (/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(r)) g(u), l(k, u, A), d(E, u, t, H, O, true, M);
      else if (l(k, u, A), d(
        E,
        u,
        t,
        H,
        O,
        false,
        M
      ), !M.ia && (z && (g(u), l(k, u, A)), F || z)) F && (M.Xb = true), d(E, u, t, H, H, true, M);
      if (M.ia) {
        var Q = "", X = 0, Y = Number.MAX_VALUE, aa = Number.MIN_VALUE;
        p(E, u, M.ec, M.fontSize, t, M.Xb, function(C, U) {
          0 < Q.length && " " === U && (Q += " ");
          Q += C;
        }, function(C, U, fa, ba, ia) {
          "\xAD" === ba && (Q += "\u2010");
          k.save();
          k.translate(w.x, U);
          C = M.fontSize / 100;
          k.scale(C, C);
          k.fillText(Q, 0, 0);
          k.restore();
          Q = fa;
          X < ia && (X = ia);
          Y > U && (Y = U);
          aa < U && (aa = U);
        });
        M.box = { x: w.x - X / 2, y: Y - M.fontSize / 2, w: X, o: aa - Y + M.fontSize };
        k.restore();
      } else k.clear && k.clear();
      return M;
    }
    function q(n, k) {
      k = k.ze;
      var r = c[k];
      void 0 === r && (r = {}, c[k] = r);
      r[" "] = n.measureText(" ").width;
      r["\u2026"] = n.measureText("\u2026").width;
    }
    function l(n, k, r) {
      var x, v = k.text.split(/(\n|[ \f\r\t\v\u2028\u2029]+|\u00ad+|\u200b+)/), w = [], z = [], F = v.length >>> 1;
      for (x = 0; x < F; x++) w.push(v[2 * x]), z.push(v[2 * x + 1]);
      2 * x < v.length && (w.push(v[2 * x]), z.push(void 0));
      r = c[r];
      for (x = 0; x < w.length; x++) v = w[x], F = r[v], void 0 === F && (F = n.measureText(v).width, r[v] = F);
      k.Yc = w;
      k.Wf = z;
    }
    function g(n) {
      for (var k = n.text.split(/\s+/), r = [], x = {
        ".": true,
        ",": true,
        ";": true,
        "?": true,
        "!": true,
        ":": true,
        "\u3002": true
      }, v = 0; v < k.length; v++) {
        var w = k[v];
        if (3 < w.length) {
          var z = "";
          z += w.charAt(0);
          z += w.charAt(1);
          for (var F = 2; F < w.length - 2; F++) {
            var E = w.charAt(F);
            x[E] || (z += "\u200B");
            z += E;
          }
          z += "\u200B";
          z += w.charAt(w.length - 2);
          z += w.charAt(w.length - 1);
          r.push(z);
        } else r.push(w);
      }
      n.text = r.join(" ");
    }
    function e(n, k, r, x) {
      for (var v, w, z = 0; z < n.length; z++) n[z].y === k.y && (void 0 === v ? v = z : w = z);
      void 0 === w && (w = v);
      v !== w && n[w].x < n[v].x && (z = v, v = w, w = z);
      x.C = n;
      x.F = k;
      x.gd = r;
      x.cf = v;
      x.df = w;
    }
    function d(n, k, r, x, v, w, z) {
      var F = n.lineHeight, E = Math.max(n.Ua, 1e-3), G = n.jb, O = k.Yc, H = r.gd, A = r.F, M = void 0, Q = void 0;
      switch (n.verticalAlign) {
        case "top":
          H = A.y + A.o - H.y;
          break;
        case "bottom":
          H = H.y - A.y;
          break;
        default:
          H = 2 * Math.min(H.y - A.y, A.y + A.o - H.y);
      }
      G = Math.min(H, G * r.F.o);
      if (0 >= G) z.ia = false;
      else {
        H = x;
        v = Math.min(v, G);
        A = Math.min(1, G / Math.max(20, k.Yc.length));
        do {
          var X = (H + v) / 2, Y = Math.min(O.length, Math.floor((G + X * (F - 1 - 2 * E)) / (X * F))), aa = void 0;
          if (0 < Y) {
            var C = 1, U = Y;
            do {
              var fa = Math.floor((C + U) / 2);
              if (p(n, k, fa, X, r, w && X === x && fa === Y, null, null)) {
                if (U = M = aa = fa, C === U) break;
              } else if (C = fa + 1, C > U) break;
            } while (1);
          }
          void 0 !== aa ? H = Q = X : v = X;
        } while (v - H > A);
        void 0 === Q ? (z.ia = false, z.fontSize = 0) : (z.ia = true, z.fontSize = Q, z.ec = M, z.Xb = w && X === H);
        return z;
      }
    }
    function p(n, k, r, x, v, w, z, F) {
      var E = n.eb, G = x * (n.lineHeight - 1), O = Math.max(n.Ua, 1e-3), H = c[n.ze], A = k.Yc;
      k = k.Wf;
      var M = v.C, Q = v.gd, X = v.cf, Y = v.df;
      switch (n.verticalAlign) {
        case "top":
          v = Q.y + x / 2 + x * O;
          var aa = 1;
          break;
        case "bottom":
          v = Q.y - (x * r + G * (r - 1)) + x / 2 - x * O;
          aa = -1;
          break;
        default:
          v = Q.y - (x * (r - 1) / 2 + G * (r - 1) / 2), aa = 1;
      }
      n = v;
      for (O = 0; O < r; O++) b[2 * O] = v - x / 2, b[2 * O + 1] = v + x / 2, v += aa * x, v += aa * G;
      for (; h.length < b.length; ) h.push(Array(2));
      O = b;
      v = 2 * r;
      aa = h;
      var C = M.length, U = X;
      X = (X - 1 + C) % C;
      var fa = Y;
      Y = (Y + 1) % C;
      for (var ba = 0; ba < v; ) {
        for (var ia = O[ba], N = M[X]; N.y < ia; ) U = X, X = (X - 1 + C) % C, N = M[X];
        for (var R = M[Y]; R.y < ia; ) fa = Y, Y = (Y + 1) % C, R = M[Y];
        var ca = M[U], I = M[fa];
        R = I.x + (R.x - I.x) * (ia - I.y) / (R.y - I.y);
        aa[ba][0] = ca.x + (N.x - ca.x) * (ia - ca.y) / (N.y - ca.y);
        aa[ba][1] = R;
        ba++;
      }
      for (O = 0; O < r; O++) M = 2 * O, v = Q.x, aa = v - h[M][0], C = h[M][1] - v, aa = aa < C ? aa : C, C = v - h[M + 1][0], M = h[M + 1][1] - v, M = C < M ? C : M, f[O] = 2 * (aa < M ? aa : M) - E * x;
      U = H[" "] * x / 100;
      aa = H["\u2026"] * x / 100;
      E = 0;
      X = f[E];
      Q = 0;
      M = void 0;
      for (O = 0; O < A.length; O++) {
        v = A[O];
        fa = k[O];
        C = H[v] * x / 100;
        if (Q + C < X && A.length - O >= r - E && "\n" != M) Q += C, " " === fa && (Q += U), z && z(v, M);
        else {
          if (C > X && (E !== r - 1 || !w)) return false;
          if (E + 1 >= r) {
            if (w) {
              r = X - Q - aa;
              if (r > aa || C > aa) r = Math.floor(v.length * r / C), 0 < r && z && z(v.substring(0, r), M);
              z && z("\u2026", void 0);
              F && F(E, n, v, M, Q);
              return true;
            }
            return false;
          }
          E++;
          F && F(E, n, v, M, Q);
          n += x;
          n += G;
          X = f[E];
          Q = C;
          " " === fa && (Q += U);
          if (C > X && (E !== r || !w)) return false;
        }
        M = fa;
      }
      F && F(E, n, void 0, void 0, Q);
      return true;
    }
    var m = {
      ib: 72,
      Lc: 0,
      lineHeight: 1.05,
      eb: 1,
      Ua: 0.5,
      jb: 0.9,
      fontFamily: "sans-serif",
      fontStyle: "normal",
      fontWeight: "normal",
      fontVariant: "normal",
      verticalAlign: "center"
    }, c = {}, b = [], h = [], f = [], u = { text: "", Yc: void 0, Wf: void 0 }, t = { C: void 0, F: void 0, gd: void 0, cf: 0, df: 0 };
    return { xe: a, ke: function(n, k, r, x, v, w, z, F, E, G, O, H) {
      var A = 0, M = 0;
      r = r.toString().trim();
      if (!H && E.result && r === E.cg && Math.abs(G - E.fe) / G <= O) {
        var Q = E.result;
        Q.ia && (A = w.x - E.kg, M = w.y - E.lg, O = E.Vc, k.save(), k.translate(A, M), O.Ma(k), k.restore());
      }
      Q || (O = E.Vc, O.clear(), Q = a(
        n,
        O,
        r,
        x,
        v,
        w,
        z,
        F
      ), Q.ia && O.Ma(k), E.fe = G, E.kg = w.x, E.lg = w.y, E.result = Q, E.cg = r);
      return Q.ia ? { ia: true, ec: Q.ec, fontSize: Q.fontSize, box: { x: Q.box.x + A, y: Q.box.y + M, w: Q.box.w, o: Q.box.o }, Xb: Q.Xb } : { ia: false };
    }, li: function() {
      return { fe: 0, kg: 0, lg: 0, result: void 0, Vc: new ra(), cg: void 0 };
    }, ya: m };
  }();
  var Wa = new function() {
    function a(g, e) {
      return function(d, p, m, c) {
        function b(r, x, v, w, z) {
          if (0 != r.length) {
            var F = r.shift(), E = l(F);
            if (e(w, z)) {
              var G = x;
              var O = E / w;
              do {
                E = F.shift();
                var H = E.oc;
                var A = H / O;
                H = E;
                var M = v, Q = O;
                H.x = G + A / 2;
                H.y = M + Q / 2;
                m && h(E, G, v, A, O);
                G += A;
              } while (0 < F.length);
              return b(r, x, v + O, w, z - O);
            }
            G = v;
            A = E / z;
            do
              E = F.shift(), H = E.oc, O = H / A, H = E, M = G, Q = O, H.x = x + A / 2, H.y = M + Q / 2, m && h(E, x, G, A, O), G += O;
            while (0 < F.length);
            return b(r, x + A, v, w - A, z);
          }
        }
        function h(r, x, v, w, z) {
          r.C = [{ x, y: v }, { x: x + w, y: v }, { x: x + w, y: v + z }, { x, y: v + z }];
        }
        var f = p.x, u = p.y, t = p.w;
        p = p.o;
        if (0 != d.length) if (1 == d.length) d[0].x = f + t / 2, d[0].y = u + p / 2, d[0].rd = 0, m && h(d[0], f, u, t, p);
        else {
          d = d.slice(0);
          for (var n = 0, k = 0; k < d.length; k++) n += d[k].weight;
          n = t * p / n;
          for (k = 0; k < d.length; k++) d[k].oc = d[k].weight * n;
          c = g(d, t, p, [[d.shift()]], c);
          b(c, f, u, t, p);
        }
      };
    }
    function q(g, e, d, p) {
      function m(f) {
        return Math.max(Math.pow(h * f / b, d), Math.pow(b / (h * f), p));
      }
      var c = l(g), b = c * c, h = e * e;
      e = m(g[0].oc);
      for (c = 1; c < g.length; c++) e = Math.max(e, m(g[c].oc));
      return e;
    }
    function l(g) {
      for (var e = 0, d = 0; d < g.length; d++) e += g[d].oc;
      return e;
    }
    this.ee = a(function(g, e, d, p, m) {
      m = Math.pow(2, m);
      for (var c = 1 / m, b = e < d; 0 < g.length; ) {
        var h = p[p.length - 1], f = g.shift(), u = b ? e : d, t = b ? m : c, n = b ? c : m, k = q(h, u, t, n);
        h.push(f);
        u = q(h, u, t, n);
        k < u && (h.pop(), p.push([f]), b ? d -= l(h) / e : e -= l(h) / d, b = e < d);
      }
      return p;
    }, function(g, e) {
      return g < e;
    });
    this.Ob = a(function(g, e, d, p, m) {
      function c(t) {
        if (1 < p.length) {
          for (var n = p[p.length - 1], k = p[p.length - 2].slice(0), r = 0; r < n.length; r++) k.push(n[r]);
          q(k, e, b, h) < t && p.splice(-2, 2, k);
        }
      }
      for (var b = Math.pow(2, m), h = 1 / b; 0 < g.length; ) {
        d = p[p.length - 1];
        m = q(d, e, b, h);
        if (0 == g.length) return;
        var f = g.shift();
        d.push(f);
        var u = q(d, e, b, h);
        m < u && (d.pop(), c(m), p.push([f]));
      }
      c(q(p[p.length - 1], e, b, h));
      return p;
    }, function() {
      return true;
    });
  }();
  function Xa(a) {
    var q = {}, l = a.Gd, g;
    a.i.subscribe("model:loaded", function(e) {
      g = e;
    });
    this.M = function() {
      a.i.D("api:initialized", this);
    };
    this.tc = function(e, d, p, m) {
      this.ad(q, d);
      this.bd(q, d);
      this.$c(q, d, false);
      m && m(q);
      e(l, q, p);
    };
    this.fd = function(e, d, p, m, c, b, h) {
      if (e) {
        for (e = d.length - 1; 0 <= e; e--) {
          var f = d[e], u = P.extend({ group: f.group }, c);
          u[p] = m(f);
          b(u);
        }
        0 < d.length && h(P.extend({ groups: Ra.Ac(g, m).map(function(t) {
          return t.group;
        }) }, c));
      }
    };
    this.bd = function(e, d) {
      e.selected = d.selected;
      e.hovered = d.ub;
      e.open = d.open;
      e.openness = d.Cb;
      e.exposed = d.T;
      e.exposure = d.ha;
      e.transitionProgress = d.qa;
      e.revealed = !d.aa.Ia();
      e.browseable = d.Da ? d.O : void 0;
      e.visible = d.Y;
      e.labelDrawn = d.na && d.na.ia;
      return e;
    };
    this.ad = function(e, d) {
      var p = d.parent;
      e.group = d.group;
      e.parent = p && p.group;
      e.weightNormalized = d.ig;
      e.level = d.level - 1;
      e.siblingCount = p && p.j.length;
      e.hasChildren = !d.empty();
      e.index = d.index;
      e.indexByWeight = d.rd;
      e.description = d.description;
      e.attribution = d.attribution;
      return e;
    };
    this.$c = function(e, d, p) {
      e.polygonCenterX = d.P.x;
      e.polygonCenterY = d.P.y;
      e.polygonArea = d.P.fa;
      e.boxLeft = d.F.x;
      e.boxTop = d.F.y;
      e.boxWidth = d.F.w;
      e.boxHeight = d.F.o;
      if (d.na && d.na.ia) {
        var m = d.na.box;
        e.labelBoxLeft = m.x;
        e.labelBoxTop = m.y;
        e.labelBoxWidth = m.w;
        e.labelBoxHeight = m.o;
        e.labelFontSize = d.na.fontSize;
      }
      p && d.$ && (e.polygon = d.$.map(function(c) {
        return { x: c.x, y: c.y };
      }), e.neighbors = d.I && d.I.map(function(c) {
        return c && c.group;
      }));
      return e;
    };
  }
  ;
  var Ca = new function() {
    var a = window.console;
    this.Ga = function(q) {
      throw "FoamTree: " + q;
    };
    this.info = function(q) {
      a.info("FoamTree: " + q);
    };
    this.warn = function(q) {
      a.warn("FoamTree: " + q);
    };
  }();
  function Ya(a) {
    function q(k, r) {
      k.j = [];
      k.Fa = true;
      var x = e(r), v = 0;
      if (("flattened" === a.nb || "always" === a.Kg && k.group && k.group.description) && 0 < r.length && 0 < k.level) {
        var w = r.reduce(function(E, G) {
          return E + P.H(G.weight, 1);
        }, 0), z = l(k.group, false);
        z.description = true;
        z.weight = w * a.Vb;
        z.index = v++;
        z.parent = k;
        z.level = k.level + 1;
        z.id = z.id + "_d";
        k.j.push(z);
      }
      for (w = 0; w < r.length; w++) {
        var F = r[w];
        z = P.H(F.weight, 1);
        if (0 >= z) if (a.jj) z = 0.9 * x;
        else continue;
        F = l(F, true);
        F.weight = z;
        F.index = v;
        F.parent = k;
        F.level = k.level + 1;
        k.j.push(F);
        v++;
      }
    }
    function l(k, r) {
      var x = new Za();
      g(k);
      x.id = k.__id;
      x.group = k;
      r && (f[k.__id] = x);
      return x;
    }
    function g(k) {
      P.has(k, "__id") || (Object.defineProperty(k, "__id", { enumerable: false, configurable: false, writable: false, value: h }), h++);
    }
    function e(k) {
      for (var r = Number.MAX_VALUE, x = 0; x < k.length; x++) {
        var v = k[x].weight;
        0 < v && r > v && (r = v);
      }
      r === Number.MAX_VALUE && (r = 1);
      return r;
    }
    function d(k) {
      if (!k.empty()) {
        k = k.j;
        var r = 0, x;
        for (x = k.length - 1; 0 <= x; x--) {
          var v = k[x].weight;
          r < v && (r = v);
        }
        for (x = k.length - 1; 0 <= x; x--) v = k[x], v.ig = v.weight / r;
      }
    }
    function p(k) {
      if (!k.empty()) {
        k = k.j.slice(0).sort(function(x, v) {
          return x.weight < v.weight ? 1 : x.weight > v.weight ? -1 : x.index - v.index;
        });
        for (var r = 0; r < k.length; r++) k[r].rd = r;
      }
    }
    function m() {
      for (var k = b.j.reduce(function(v, w) {
        return v + w.weight;
      }, 0), r = 0; r < b.j.length; r++) {
        var x = b.j[r];
        x.attribution && (x.weight = Math.max(0.025, a.Ag) * k);
      }
    }
    var c = this, b = new Za(), h, f, u, t, n;
    this.M = function() {
      return b;
    };
    this.U = function(k) {
      var r = k.group.groups, x = a.di;
      return !k.j && !k.description && r && 0 < r.length && n + r.length <= x ? (n += r.length, q(k, r), d(k), p(k), true) : false;
    };
    this.load = function(k) {
      function r(v) {
        var w = v.groups;
        if (w) for (var z = 0; z < w.length; z++) {
          var F = w[z];
          g(F);
          var E = F.__id;
          f[E] = null;
          t[E] = v;
          E = F.id;
          P.V(E) || (u[E] = F);
          r(F);
        }
      }
      function x(v, w) {
        if (!v) return w;
        w = Math.max(w, v.__id || 0);
        if ((v = v.groups) && 0 < v.length) for (var z = v.length - 1; 0 <= z; z--) w = x(v[z], w);
        return w;
      }
      b.group = k;
      b.wa = false;
      b.O = false;
      b.Da = false;
      b.open = true;
      b.Cb = 1;
      h = x(k, 0) + 1;
      f = {};
      u = {};
      t = {};
      n = 0;
      k && (g(k), f[k.__id] = b, P.V(k.id) || (u[k.id] = k), r(k));
      q(b, k && k.groups || []);
      (function(v) {
        if (!v.empty()) {
          var w = l({ attribution: true });
          w.index = v.j.length;
          w.parent = v;
          w.level = v.level + 1;
          w.attribution = true;
          v.j.push(w);
        }
      })(b);
      d(b);
      m();
      p(b);
    };
    this.update = function(k) {
      k.forEach(function(r) {
        Ra.za(r, function(x) {
          if (!x.empty()) {
            x = x.j;
            for (var v = e(x.map(function(F) {
              return F.group;
            })), w = 0; w < x.length; w++) {
              var z = x[w];
              z.weight = 0 < z.group.weight ? z.group.weight : 0.9 * v;
            }
          }
        });
        d(r);
        r === b && m();
        p(r);
      });
    };
    this.u = function(k) {
      return function() {
        if (P.V(k) || P.Xe(k)) return [];
        if (Array.isArray(k)) return k.map(c.m, c);
        if (P.wb(k)) {
          if (P.has(k, "__id")) return [c.m(k)];
          if (P.has(k, "all")) {
            var r = [];
            Ra.K(b, function(x) {
              r.push(x);
            });
            return r;
          }
          if (P.has(k, "groups")) return c.u(k.groups);
        }
        return [c.m(k)];
      }().filter(function(r) {
        return void 0 !== r;
      });
    };
    this.m = function(k) {
      if (P.wb(k) && P.has(k, "__id")) {
        if (k = k.__id, P.has(f, k)) {
          if (null === f[k]) {
            for (var r = t[k], x = []; r; ) {
              r = r.__id;
              x.push(r);
              if (f[r]) break;
              r = t[r];
            }
            for (r = x.length - 1; 0 <= r; r--) this.U(f[x[r]]);
          }
          return f[k];
        }
      } else if (P.has(u, k)) return this.m(u[k]);
    };
    this.L = function(k, r, x) {
      return { j: c.u(k), Ca: P.H(k && k[r], true), Ba: P.H(k && k.keepPrevious, x) };
    };
  }
  function $a(a, q, l) {
    var g = {};
    q.Ba && Ra.K(a, function(m) {
      l(m) && (g[m.id] = m);
    });
    a = q.j;
    q = q.Ca;
    for (var e = a.length - 1; 0 <= e; e--) {
      var d = a[e];
      g[d.id] = q ? d : void 0;
    }
    var p = [];
    P.Aa(g, function(m) {
      void 0 !== m && p.push(m);
    });
    return p;
  }
  ;
  function ab(a) {
    function q(A, M) {
      A = A.ha;
      M.opacity = 1;
      M.Ea = 1;
      M.ra = 0 > A ? 1 - t.Oh / 100 * A : 1;
      M.saturation = 0 > A ? 1 - t.Ph / 100 * A : 1;
      M.ca = 0 > A ? 1 + 0.5 * A : 1;
    }
    function l(A) {
      A = A.ha;
      return Math.max(1e-3, 0 === A ? 1 : 1 + A * (t.Pa - 1));
    }
    function g(A, M) {
      for (var Q = A.reduce(function(C, U) {
        C[U.id] = U;
        return C;
      }, {}), X = A.length - 1; 0 <= X; X--) Ra.K(A[X], function(C) {
        Q[C.id] = void 0;
      });
      var Y = [];
      P.Aa(Q, function(C) {
        C && Ra.se(C, function(U) {
          U.open || Y.push(U);
        });
      });
      var aa = [];
      P.Aa(Q, function(C) {
        C && C.open && aa.push(C);
      });
      A = [];
      0 !== Y.length && A.push(w.Bb(
        { j: Y, Ca: true, Ba: true },
        M,
        true
      ));
      return Ga(A);
    }
    function e(A, M, Q, X) {
      var Y = m();
      if (0 === A.length && !Y) return new Fa().resolve().promise();
      var aa = A.reduce(function(ba, ia) {
        ba[ia.id] = true;
        return ba;
      }, {}), C = [];
      A = [];
      if (z.reduce(function(ba, ia) {
        return ba || aa[ia.id] && (!ia.T || 1 !== ia.ha) || !aa[ia.id] && !ia.parent.T && (ia.T || -1 !== ia.ha);
      }, false)) {
        var U = [], fa = {};
        z.forEach(function(ba) {
          aa[ba.id] && (ba.T || C.push(ba), ba.T = true, Ra.za(ba, function(ia) {
            U.push(b(ia, 1));
            fa[ia.id] = true;
          }));
        });
        0 < U.length ? (Ra.K(n, function(ba) {
          aa[ba.id] || (ba.T && C.push(ba), ba.T = false);
          fa[ba.id] || U.push(b(ba, -1));
        }), A.push(v.J.A({}).Qa(U).call(h).Ta()), d(aa), A.push(p(Y)), Q && (x.lc(F, t.ac, t.Oa, La.ga(t.Zb)), x.Fb())) : (A.push(c(Q)), M && Ra.K(n, function(ba) {
          ba.T && C.push(ba);
        }));
      }
      return Ga(A).then(function() {
        r.fd(M, C, "exposed", function(ba) {
          return ba.T;
        }, { indirect: X }, a.options.pf, a.options.nf);
      });
    }
    function d(A) {
      z.reduce(f(true, void 0, function(M) {
        return M.T || A[M.id];
      }), u(F));
      F.x -= F.w * (t.Pa - 1) / 2;
      F.y -= F.o * (t.Pa - 1) / 2;
      F.w *= t.Pa;
      F.o *= t.Pa;
    }
    function p(A) {
      if (A || !x.Dd()) return v.J.A(k).ea({ duration: 0.7 * t.Oa, R: { x: { end: F.x + F.w / 2, easing: La.ga(t.Zb) }, y: { end: F.y + F.o / 2, easing: La.ga(t.Zb) } }, ba: function() {
        a.i.D("foamtree:dirty", true);
      } }).Ta();
      k.x = F.x + F.w / 2;
      k.y = F.y + F.o / 2;
      return new Fa().resolve().promise();
    }
    function m() {
      return !!z && z.reduce(function(A, M) {
        return A || 0 !== M.ha;
      }, false);
    }
    function c(A) {
      var M = [], Q = [];
      Ra.K(n, function(X) {
        0 !== X.ha && Q.push(b(X, 0, function() {
          this.T = false;
        }));
      });
      M.push(v.J.A({}).Qa(Q).Ta());
      x.content(0, 0, E, G);
      A && (M.push(x.reset(t.Oa, La.ga(t.Zb))), x.Fb());
      return Ga(M);
    }
    function b(A, M, Q) {
      var X = v.J.A(A);
      0 === A.ha && 0 !== M && X.call(function() {
        this.sc(O);
        this.qb(q);
      });
      X.ea({ duration: t.Oa, R: { ha: { end: M, easing: La.ga(t.Zb) } }, ba: function() {
        n.N = true;
        n.Ha = true;
        a.i.D("foamtree:dirty", true);
      } });
      0 === M && X.call(function() {
        this.zd();
        this.fc();
        this.Sc(O);
        this.Rc(q);
      });
      return X.call(Q).done();
    }
    function h() {
      var A = n.j.reduce(f(false, O.transformPoint, void 0), u({})).box, M = t.ac, Q = Math.min(A.x, F.x - F.w * M), X = Math.min(A.y, F.y - F.o * M);
      x.content(Q, X, Math.max(A.x + A.w, F.x + F.w * (1 + M)) - Q, Math.max(A.y + A.o, F.y + F.o * (1 + M)) - X);
    }
    function f(A, M, Q) {
      var X = {};
      return function(Y, aa) {
        if (!Q || Q(aa)) {
          for (var C = A ? aa.$ || aa.C : aa.C, U, fa = C.length - 1; 0 <= fa; fa--) U = void 0 !== M ? M(aa, C[fa], X) : C[fa], Y.Mc = Math.min(Y.Mc, U.x), Y.Ad = Math.max(Y.Ad, U.x), Y.Nc = Math.min(Y.Nc, U.y), Y.Bd = Math.max(Y.Bd, U.y);
          Y.box.x = Y.Mc;
          Y.box.y = Y.Nc;
          Y.box.w = Y.Ad - Y.Mc;
          Y.box.o = Y.Bd - Y.Nc;
        }
        return Y;
      };
    }
    function u(A) {
      return { Mc: Number.MAX_VALUE, Ad: Number.MIN_VALUE, Nc: Number.MAX_VALUE, Bd: Number.MIN_VALUE, box: A };
    }
    var t = a.options, n, k, r, x, v, w, z, F, E, G, O = { af: function(A, M) {
      M.scale = l(A);
      return false;
    }, Ib: function(A, M) {
      A = l(A);
      var Q = k.x, X = k.y;
      M.translate(Q, X);
      M.scale(A, A);
      M.translate(-Q, -X);
    }, Jb: function(A, M, Q) {
      A = l(A);
      var X = k.x, Y = k.y;
      Q.x = (M.x - X) / A + X;
      Q.y = (M.y - Y) / A + Y;
    }, transformPoint: function(A, M, Q) {
      A = l(A);
      var X = k.x, Y = k.y;
      Q.x = (M.x - X) * A + X;
      Q.y = (M.y - Y) * A + Y;
      return Q;
    } };
    a.i.subscribe("stage:initialized", function(A, M, Q, X) {
      k = { x: Q / 2, y: X / 2 };
      E = Q;
      G = X;
      F = { x: 0, y: 0, w: E, o: G };
    });
    a.i.subscribe("stage:resized", function(A, M, Q, X) {
      k.x *= Q / A;
      k.y *= X / M;
      E = Q;
      G = X;
    });
    a.i.subscribe("api:initialized", function(A) {
      r = A;
    });
    a.i.subscribe("zoom:initialized", function(A) {
      x = A;
    });
    a.i.subscribe("model:loaded", function(A, M) {
      n = A;
      z = M;
    });
    a.i.subscribe("model:childrenAttached", function(A) {
      z = A;
    });
    a.i.subscribe("timeline:initialized", function(A) {
      v = A;
    });
    a.i.subscribe("openclose:initialized", function(A) {
      w = A;
    });
    var H = ["groupExposureScale", "groupUnexposureScale", "groupExposureZoomMargin"];
    a.i.subscribe("options:changed", function(A) {
      P.cb(A, H) && m() && (d({}), x.qj(F, t.ac), x.Fb());
    });
    this.M = function() {
      a.i.D("expose:initialized", this);
    };
    this.Yb = function(A, M, Q, X) {
      var Y = A.j.reduce(function(U, fa) {
        for (; fa = fa.parent; ) U[fa.id] = true;
        return U;
      }, {}), aa = $a(n, A, function(U) {
        return U.T && !U.open && !Y[U.id];
      }), C = new Fa();
      g(aa, M).then(function() {
        e(aa.filter(function(U) {
          return U.C && U.$;
        }), M, Q, X).then(C.resolve);
      });
      return C.promise();
    };
  }
  ;
  function bb(a) {
    function q(c) {
      function b(E, G) {
        var O = Math.min(1, Math.max(0, E.qa));
        G.opacity = O;
        G.ra = 1;
        G.saturation = O;
        G.Ea = O;
        G.ca = E.yb;
      }
      var h = a.options, f = h.ej, u = h.fj, t = h.bj, n = h.cj, k = h.dj, r = h.Sd, x = f + u + t + n + k, v = 0 < x ? r / x : 0, w = [];
      m.Mb(h.Sf, h.Rf, h.Tf, h.Uf, h.Qf);
      if (0 === v && c.j && c.O) {
        r = c.j;
        for (x = 0; x < r.length; x++) {
          var z = r[x];
          z.qa = 1;
          z.yb = 1;
          z.qb(b);
          z.fc();
          z.Rc(b);
        }
        c.N = true;
        a.i.D("foamtree:dirty", 0 < v);
        return new Fa().resolve().promise();
      }
      if (c.j && c.O) {
        Va.xa(c, Va.sa(c, a.options.Ud), function(E, G, O) {
          E.sc(m);
          E.qb(b);
          O = "groups" === a.options.Td ? O : G;
          G = g.J.A(E).wait(O * v * f).ea({ duration: v * u, R: { qa: { end: 1, easing: La.ga(h.aj) } }, ba: function() {
            this.N = true;
            a.i.D("foamtree:dirty", 0 < v);
          } }).done();
          O = g.J.A(E).wait(p ? v * (t + O * n) : 0).ea({ duration: p ? v * k : 0, R: { yb: { end: 1, easing: La.Ab } }, ba: function() {
            this.N = true;
            a.i.D("foamtree:dirty", 0 < v);
          } }).done();
          E = g.J.A(E).Qa([G, O]).ae().Ya(function() {
            this.zd();
            this.fc();
            this.Sc(m);
            this.Rc(b);
          }).done();
          w.push(E);
        });
        d.m();
        var F = new Fa();
        g.J.A({}).Qa(w).call(function() {
          d.u();
          F.resolve();
        }).start();
        return F.promise();
      }
      return new Fa().resolve().promise();
    }
    var l, g, e = [], d = new Ha(P.pa);
    a.i.subscribe("stage:initialized", function() {
    });
    a.i.subscribe("stage:resized", function() {
    });
    a.i.subscribe("stage:newLayer", function(c, b) {
      e.push(b);
    });
    a.i.subscribe("model:loaded", function(c) {
      l = c;
      d.clear();
    });
    a.i.subscribe("zoom:initialized", function() {
    });
    a.i.subscribe("timeline:initialized", function(c) {
      g = c;
    });
    var p = false;
    a.i.subscribe("render:renderers:resolved", function(c) {
      p = c.labelPlainFill || false;
    });
    var m = new function() {
      var c = 0, b = 0, h = 0, f = 0, u = 0, t = 0;
      this.Mb = function(n, k, r, x, v) {
        c = 1 + k;
        b = 1 - c;
        h = r;
        f = x;
        u = v;
        t = n;
      };
      this.af = function(n, k) {
        k.scale = c + b * n.qa;
        return 0 !== u || 0 !== h || 0 !== f;
      };
      this.Ib = function(n, k) {
        var r = c + b * n.qa, x = n.parent, v = t * n.x + (1 - t) * x.x, w = t * n.y + (1 - t) * x.y;
        k.translate(v, w);
        k.scale(r, r);
        n = 1 - n.qa;
        k.rotate(u * Math.PI * n);
        k.translate(-v, -w);
        k.translate(x.F.w * h * n, x.F.o * f * n);
      };
      this.Jb = function(n, k, r) {
        var x = c + b * n.qa, v = t * n.x + (1 - t) * n.parent.x, w = t * n.y + (1 - t) * n.parent.y, z = 1 - n.qa;
        n = n.parent;
        r.x = (k.x - v) / x + v - n.F.w * h * z;
        r.y = (k.y - w) / x + w - n.F.o * f * z;
      };
      this.transformPoint = function(n, k, r) {
        var x = c + b * n.qa, v = t * n.x + (1 - t) * n.parent.x, w = t * n.y + (1 - t) * n.parent.y, z = 1 - n.qa;
        n = n.parent;
        r.x = (k.x - v) * x + v - n.F.w * h * z;
        r.y = (k.y - w) * x + w - n.F.o * f * z;
      };
    }();
    this.M = function() {
    };
    this.u = function() {
      function c(O, H) {
        var A = Math.min(1, Math.max(0, O.qa));
        H.opacity = A;
        H.ra = 1;
        H.saturation = A;
        H.Ea = A;
        H.ca = O.yb;
      }
      function b(O, H) {
        var A = Math.min(1, Math.max(0, O.Ld));
        H.opacity = A;
        H.Ea = A;
        H.ra = 1;
        H.saturation = 1;
        H.ca = O.yb;
      }
      var h = a.options, f = h.Kd, u = h.wi, t = h.xi, n = h.yi, k = h.si, r = h.ti, x = h.ui, v = h.ni, w = h.oi, z = h.pi, F = k + r + x + v + w + z + u + t + n, E = 0 < F ? f / F : 0, G = [];
      d.initial() ? m.Mb(h.Ci, h.Ai, h.Di, h.Ei, h.zi) : m.Mb(h.Sf, h.Rf, h.Tf, h.Uf, h.Qf);
      Va.xa(l, Va.sa(l, a.options.Bi), function(O, H, A) {
        var M = "groups" === a.options.vi ? A : H;
        G.push(g.J.A(O).call(function() {
          this.qb(c);
        }).wait(p ? E * (k + M * r) : 0).ea({ duration: p ? E * x : 0, R: { yb: { end: 0, easing: La.Ab } }, ba: function() {
          this.N = true;
          a.i.D("foamtree:dirty", true);
        } }).done());
        Ra.K(O, function(Q) {
          G.push(g.J.A(Q).call(function() {
            this.sc(m);
            this.qb(b);
          }).wait(E * (v + w * M)).ea({ duration: E * z, R: { Ld: { end: 0, easing: La.Ab } }, ba: function() {
            this.N = true;
            a.i.D(
              "foamtree:dirty",
              true
            );
          } }).Ya(function() {
            this.selected = false;
            this.Sc(m);
          }).done());
        });
        G.push(g.J.A(O).call(function() {
          this.sc(m);
        }).wait(E * (u + t * M)).ea({ duration: E * n, R: { qa: { end: 0, easing: La.ga(h.ri) } }, ba: function() {
          this.N = true;
          a.i.D("foamtree:dirty", true);
        } }).Ya(function() {
          this.selected = false;
          this.Sc(m);
        }).done());
      });
      return g.J.A({}).Qa(G).Ta();
    };
    this.m = function(c) {
      return q(c);
    };
  }
  ;
  function cb(a) {
    function q(c, b) {
      var h = [];
      Ra.K(p, function(u) {
        if (u.j) {
          var t = P.has(c, u.id);
          u.open !== t && (t || u.T || Ra.K(u, function(n) {
            if (n.T) return h.push(u), false;
          }));
        }
      });
      if (0 === h.length) return new Fa().resolve().promise();
      var f;
      for (f = h.length - 1; 0 <= f; f--) h[f].open = false;
      b = d.Yb({ j: h, Ca: true, Ba: true }, b, true, true);
      for (f = h.length - 1; 0 <= f; f--) h[f].open = true;
      return b;
    }
    function l(c, b, h) {
      function f(k, r) {
        k.qb(u);
        var x = e.J.A(k).ea({ duration: a.options.Pc, R: { Cb: { end: r ? 1 : 0, easing: La.me } }, ba: function() {
          this.N = true;
          a.i.D("foamtree:dirty", true);
        } }).call(function() {
          this.open = r;
          k.Va = false;
        }).Ya(function() {
          this.fc();
          this.Rc(u);
          delete g[this.id];
        }).done();
        return g[k.id] = x;
      }
      function u(k, r) {
        r.opacity = 1 - k.Cb;
        r.ra = 1;
        r.saturation = 1;
        r.ca = 1;
        r.Ea = 1;
      }
      var t = [], n = [];
      Ra.K(p, function(k) {
        if (k.O && k.X) {
          var r = P.has(c, k.id), x = g[k.id];
          if (x && x.xb()) x.stop();
          else if (k.open === r) return;
          k.Va = r;
          r || (k.open = r, k.Fd = false);
          n.push(k);
          t.push(f(k, r));
        }
      });
      return 0 < t.length ? (a.i.D("openclose:changing"), e.J.A({}).Qa(t).Ta().then(function() {
        m.fd(b, n, "open", function(k) {
          return k.open;
        }, { indirect: h }, a.options.xf, a.options.wf);
      })) : new Fa().resolve().promise();
    }
    var g, e, d, p, m;
    a.i.subscribe("api:initialized", function(c) {
      m = c;
    });
    a.i.subscribe("model:loaded", function(c) {
      p = c;
      g = {};
    });
    a.i.subscribe("timeline:initialized", function(c) {
      e = c;
    });
    a.i.subscribe("expose:initialized", function(c) {
      d = c;
    });
    this.M = function() {
      a.i.D("openclose:initialized", this);
    };
    this.Bb = function(c, b, h) {
      if ("flattened" == a.options.nb) return new Fa().resolve().promise();
      c = $a(p, c, function(n) {
        return n.open || n.Va;
      });
      for (var f = new Fa(), u = 0; u < c.length; u++) c[u].Va = true;
      0 < c.length && a.i.D(
        "foamtree:attachChildren",
        c
      );
      var t = c.reduce(function(n, k) {
        n[k.id] = true;
        return n;
      }, {});
      q(t, b).then(function() {
        l(t, b, h).then(f.resolve);
      });
      return f.promise();
    };
  }
  ;
  function db(a) {
    function q(e, d) {
      e = $a(l, e, function(b) {
        return b.selected;
      });
      Ra.K(l, function(b) {
        true === b.selected && (b.selected = !b.selected, b.N = !b.N, b.Sa = !b.Sa);
      });
      var p;
      for (p = e.length - 1; 0 <= p; p--) {
        var m = e[p];
        m.selected = !m.selected;
        m.N = !m.N;
        m.Sa = !m.Sa;
      }
      var c = [];
      Ra.K(l, function(b) {
        b.N && c.push(b);
      });
      0 < c.length && a.i.D("foamtree:dirty", false);
      g.fd(d, c, "selected", function(b) {
        return b.selected;
      }, {}, a.options.zf, a.options.yf);
    }
    var l, g;
    a.i.subscribe("api:initialized", function(e) {
      g = e;
    });
    a.i.subscribe("model:loaded", function(e) {
      l = e;
    });
    this.M = function() {
      a.i.D("select:initialized", this);
    };
    this.select = function(e, d) {
      return q(e, d);
    };
  }
  ;
  function eb(a) {
    function q(N) {
      return function(R) {
        N.call(this, { x: R.x, y: R.y, scale: R.scale, jd: R.delta, ctrlKey: R.ctrlKey, metaKey: R.metaKey, altKey: R.altKey, shiftKey: R.shiftKey, mb: R.secondary, touches: R.touches });
      };
    }
    function l() {
      function N(R) {
        return function(ca) {
          ca.x *= Y / u.clientWidth;
          ca.y *= aa / u.clientHeight;
          return R(ca);
        };
      }
      "external" !== f.Se && ("hammerjs" === f.Se && P.has(window, "Hammer") && (ba.M(u), ba.A("tap", N(h.m), true), ba.A("doubletap", N(h.u), true), ba.A("hold", N(h.sa), true), ba.A("touch", N(h.ua), true), ba.A(
        "release",
        N(h.va),
        false
      ), ba.A("dragstart", N(h.ja), true), ba.A("drag", N(h.L), true), ba.A("dragend", N(h.U), true), ba.A("transformstart", N(h.Na), true), ba.A("transform", N(h.transform), true), ba.A("transformend", N(h.Ga), true)), Q = new Ka(u), X = new Ja(), Q.m(N(h.m)), Q.u(N(h.u)), Q.sa(N(h.sa)), Q.va(N(h.ua)), Q.Ga(N(h.va)), Q.ja(N(h.ja)), Q.L(N(h.L)), Q.U(N(h.U)), Q.ta(N(h.ta)), Q.xa(N(h.ta)), Q.ua(N(h.xa)), X.addEventListener("keyup", function(R) {
        var ca = false, I = void 0, T = f.Df({ keyCode: R.keyCode, preventDefault: function() {
          ca = true;
        }, preventOriginalEventDefault: function() {
          I = "prevent";
        }, allowOriginalEventDefault: function() {
          I = "allow";
        } });
        "prevent" === I && R.preventDefault();
        (ca = ca || 0 <= T.indexOf(false)) || 27 === R.keyCode && a.i.D("interaction:reset");
      }));
    }
    function g() {
      t.vc(2) ? a.i.D("interaction:reset") : t.normalize(f.pb, La.ga(f.Kb));
    }
    function e(N) {
      return function() {
        w.empty() || N.apply(this, arguments);
      };
    }
    function d(N, R, ca) {
      var I = {}, T = {};
      return function(S) {
        switch (N) {
          case "click":
            var V = f.hf;
            break;
          case "doubleclick":
            V = f.jf;
            break;
          case "hold":
            V = f.qf;
            break;
          case "hover":
            V = f.rf;
            break;
          case "mousemove":
            V = f.tf;
            break;
          case "mousewheel":
            V = f.vf;
            break;
          case "mousedown":
            V = f.sf;
            break;
          case "mouseup":
            V = f.uf;
            break;
          case "dragstart":
            V = f.mf;
            break;
          case "drag":
            V = f.kf;
            break;
          case "dragend":
            V = f.lf;
            break;
          case "transformstart":
            V = f.Cf;
            break;
          case "transform":
            V = f.Af;
            break;
          case "transformend":
            V = f.Bf;
        }
        var ka = false, y = !V.empty(), B = t.absolute(S, I), D = (R || y) && m(B), J = (R || y) && c(B);
        y && (y = D ? D.group : null, B = D ? D.Jb(B, T) : B, S.Db = void 0, V = V({
          type: N,
          group: y,
          topmostClosedGroup: y,
          bottommostOpenGroup: J ? J.group : null,
          x: S.x,
          y: S.y,
          xAbsolute: B.x,
          yAbsolute: B.y,
          scale: P.H(S.scale, 1),
          secondary: S.mb,
          touches: P.H(S.touches, 1),
          delta: P.H(S.jd, 0),
          ctrlKey: S.ctrlKey,
          metaKey: S.metaKey,
          altKey: S.altKey,
          shiftKey: S.shiftKey,
          preventDefault: function() {
            ka = true;
          },
          preventOriginalEventDefault: function() {
            S.Db = "prevent";
          },
          allowOriginalEventDefault: function() {
            S.Db = "allow";
          }
        }), ka = ka || 0 <= V.indexOf(false), D && D.attribution && "click" === N && (ka = false));
        ka || ca && ca({ hd: D, Eg: J }, S);
      };
    }
    function p(N) {
      function R(ka, y) {
        var B = y.j;
        if (B) {
          for (var D = -Number.MAX_VALUE, J, K = 0; K < B.length; K++) {
            var L = B[K];
            !L.description && L.Y && ia(L, ka) && L.scale > D && (J = L, D = L.scale);
          }
          var W;
          J && (W = R(ka, J));
          return W || J || y;
        }
        return y;
      }
      for (var ca = C.length, I = C[0].scale, T = C[0].scale, S = 0; S < ca; S++) {
        var V = C[S];
        V = V.scale;
        V < I && (I = V);
        V > T && (T = V);
      }
      if (I !== T) {
        for (S = 0; S < ca; S++) if (V = C[S], V.scale === T && V.Y && ia(V, N)) return R(N, V);
      }
      return R(N, w);
    }
    function m(N, R) {
      if ("flattened" === f.nb) N = p(N);
      else {
        R = R || 0;
        for (var ca = C.length, I = void 0, T = 0; T < ca; T++) {
          var S = C[T];
          S.scale > R && false === S.open && S.Y && ia(S, N) && (I = S, R = S.scale);
        }
        N = I;
      }
      N && N.description && (N = N.parent);
      return N;
    }
    function c(N) {
      var R = void 0, ca = 0;
      Ra.yc(w, function(I) {
        true === I.open && I.Y && I.scale > ca && ia(I, N) && (R = I, ca = I.scale);
      });
      return R;
    }
    var b = ea.Xh(), h = this, f = a.options, u, t, n, k, r, x, v, w, z = false, F, E, G, O, H, A, M, Q, X, Y, aa;
    a.i.subscribe("stage:initialized", function(N, R, ca, I) {
      u = R;
      Y = ca;
      aa = I;
      l();
    });
    a.i.subscribe("stage:resized", function(N, R, ca, I) {
      Y = ca;
      aa = I;
    });
    a.i.subscribe("stage:disposed", function() {
      Q.$a();
      ba.$a();
      X.m();
    });
    a.i.subscribe("expose:initialized", function(N) {
      k = N;
    });
    a.i.subscribe("zoom:initialized", function(N) {
      t = N;
    });
    a.i.subscribe(
      "openclose:initialized",
      function(N) {
        r = N;
      }
    );
    a.i.subscribe("select:initialized", function(N) {
      x = N;
    });
    a.i.subscribe("titlebar:initialized", function(N) {
      v = N;
    });
    a.i.subscribe("timeline:initialized", function(N) {
      n = N;
    });
    var C;
    a.i.subscribe("model:loaded", function(N, R) {
      w = N;
      C = R;
    });
    a.i.subscribe("model:childrenAttached", function(N) {
      C = N;
    });
    this.M = function() {
    };
    this.ua = e(d("mousedown", false, function() {
      t.ii();
    }));
    this.va = e(d("mouseup", false, void 0));
    this.m = e(d("click", true, function(N, R) {
      R.mb || R.shiftKey || !(N = N.hd) || (N.attribution ? R.ctrlKey ? document.location.href = Pa.Vf("iuuqr;..b`ssnurd`sbi/bnl.gn`lusdd") : (R = La.ga(f.Kb), N.ie ? (t.reset(f.pb, R), N.ie = false) : (t.hg(N, f.ac, f.pb, R), N.ie = true)) : x.select({ j: [N], Ca: !N.selected, Ba: R.metaKey || R.ctrlKey }, true));
    }));
    this.u = e(d("doubleclick", true, function(N, R) {
      var ca = N.hd;
      ca && ca.attribution || (R.mb || R.shiftKey ? ca && (ca.parent.T && (ca = ca.parent), N = { j: ca.parent !== w ? [ca.parent] : [], Ca: true, Ba: false }, x.select(N, true), k.Yb(N, true, true, false)) : ca && (N = { j: [ca], Ca: true, Ba: false }, ca.Va = true, a.i.D("foamtree:attachChildren", [ca]), k.Yb(N, true, true, false)), ca && n.J.A({}).wait(f.Oa / 2).call(function() {
        r.Bb({ j: Ra.Ac(w, function(I) {
          return I.Fd && !Ra.Vh(ca, I);
        }), Ca: false, Ba: true }, true, true);
        ca.Fd = true;
        r.Bb({ j: [ca], Ca: !(R.mb || R.shiftKey), Ba: true }, true, true);
      }).start());
    }));
    this.sa = e(d("hold", true, function(N, R) {
      (N = (R = !(R.metaKey || R.ctrlKey || R.shiftKey) && !R.mb) ? N.hd : N.Eg) && N !== w && r.Bb({ j: [N], Ca: R, Ba: true }, true, false);
    }));
    this.ja = e(d("dragstart", false, function(N, R) {
      F = R.x;
      E = R.y;
      G = Date.now();
      z = true;
    }));
    this.L = e(d("drag", false, function(N, R) {
      if (z) {
        N = Date.now();
        A = Math.min(1, N - G);
        G = N;
        N = R.x - F;
        var ca = R.y - E;
        t.gi(N, ca);
        O = N;
        H = ca;
        F = R.x;
        E = R.y;
      }
    }));
    this.U = e(d("dragend", false, function() {
      if (z) {
        z = false;
        var N = Math.sqrt(O * O + H * H) / A;
        4 <= N ? t.hi(N, O, H) : t.ff();
      }
    }));
    this.Na = e(d("transformstart", false, function(N, R) {
      M = 1;
      F = R.x;
      E = R.y;
    }));
    var U = 1, fa = false;
    this.transform = e(d("transform", false, function(N, R) {
      N = R.scale - 0.01;
      t.xg(R, N / M, R.x - F, R.y - E);
      M = N;
      F = R.x;
      E = R.y;
      U = M;
      fa = fa || 2 < R.touches;
    }));
    this.Ga = e(d("transformend", false, function() {
      fa && 0.8 > U ? a.i.D("interaction:reset") : g();
      fa = false;
    }));
    this.xa = e(d("mousewheel", false, function() {
      var N = P.Jg(function() {
        g();
      }, 300);
      return function(R, ca) {
        R = f.wj;
        1 !== R && (R = Math.pow(R, ca.jd), b ? (t.yg(ca, R), N()) : t.Qb(ca, R, f.pb, La.ga(f.Kb)).then(g));
      };
    }()));
    this.ta = e(function() {
      var N = void 0, R = {}, ca = false, I, T = d("hover", false, function() {
        N && (N.ub = false, 0 < N.level && (N.N = true));
        I && (I.ub = true, 0 < I.level && (I.N = true));
        v.update(I);
        a.i.D("foamtree:dirty", false);
      }), S = d("mousemove", false, void 0);
      return function(V) {
        if ("out" === V.type) I = void 0, ca = I !== N;
        else if (t.absolute(V, R), N && !N.open && ia(N, R)) {
          var ka = m(R, N.scale);
          ka && ka !== N ? (ca = true, I = ka) : ca = false;
        } else I = m(R), ca = I !== N;
        ca && (T(V), N = I, ca = false);
        N && S(V);
      };
    }());
    this.Wa = { click: q(this.m), doubleclick: q(this.u), hold: q(this.sa), mouseup: q(this.va), mousedown: q(this.ua), dragstart: q(this.ja), drag: q(this.L), dragend: q(this.U), transformstart: q(this.Na), transform: q(this.transform), transformend: q(this.Ga), hover: q(this.ta), mousewheel: q(this.xa) };
    var ba = /* @__PURE__ */ function() {
      function N(I, T) {
        return function(S) {
          S = S.gesture;
          var V = S.center;
          V = Ia.ue(u, V.pageX, V.pageY, {});
          V.scale = S.scale;
          V.mb = 1 < S.touches.length;
          V.touches = S.touches.length;
          I.call(u, V);
          (void 0 === V.Db && T || "prevent" === V.Db) && S.preventDefault();
        };
      }
      var R, ca = {};
      return { M: function(I) {
        R = window.Hammer(I, { doubletap_interval: 350, hold_timeout: 400, doubletap_distance: 10 });
      }, A: function(I, T, S) {
        ca[I] = T;
        R.on(I, N(T, S));
      }, $a: function() {
        R && P.Aa(ca, function(I, T) {
          R.off(T, I);
        });
      } };
    }(), ia = /* @__PURE__ */ function() {
      var N = {};
      return function(R, ca) {
        R.Jb(ca, N);
        return R.$ && wa.Wa(R.$, N);
      };
    }();
  }
  ;
  function fb(a) {
    function q(e, d, p, m) {
      var c, b = 0, h = [];
      for (c = 0; c < d.length; c++) {
        var f = Math.sqrt(wa.m(d[c], d[(c + 1) % d.length]));
        h.push(f);
        b += f;
      }
      for (c = 0; c < h.length; c++) h[c] /= b;
      e[0].x = p.x;
      e[0].y = p.y;
      var u = f = b = 0;
      for (c = 1; c < e.length; c++) {
        var t = e[c], n = 0.95 * Math.pow(c / e.length, m);
        for (b += 0.3819; f < b; ) f += h[u], u = (u + 1) % h.length;
        var k = (u - 1 + h.length) % h.length, r = 1 - (f - b) / h[k], x = d[k].x;
        k = d[k].y;
        var v = d[u].x, w = d[u].y;
        x = (x - p.x) * n + p.x;
        k = (k - p.y) * n + p.y;
        v = (v - p.x) * n + p.x;
        w = (w - p.y) * n + p.y;
        t.x = x * (1 - r) + v * r;
        t.y = k * (1 - r) + w * r;
      }
    }
    var l = { random: { vb: function(e, d) {
      for (var p = 0; p < e.length; p++) {
        var m = e[p];
        m.x = d.x + Math.random() * d.w;
        m.y = d.y + Math.random() * d.o;
      }
    }, Rb: "box" }, ordered: { vb: function(e, d) {
      e = e.slice(0);
      g.dc && e.sort(gb);
      Wa.Ob(e, d, false, g.Pd);
    }, Rb: "box" }, squarified: { vb: function(e, d) {
      e = e.slice(0);
      g.dc && e.sort(gb);
      Wa.ee(e, d, false, g.Pd);
    }, Rb: "box" }, fisheye: { vb: function(e, d, p) {
      e = e.slice(0);
      g.dc && e.sort(gb);
      q(e, d, p, 0.25);
    }, Rb: "polygon" }, blackhole: { vb: function(e, d, p) {
      e = e.slice(0);
      g.dc && e.sort(gb).reverse();
      q(e, d, p, 1);
    }, Rb: "polygon" } };
    l.order = l.ordered;
    l.treemap = l.squarified;
    var g = a.options;
    this.m = function(e, d, p) {
      if (0 < e.length) {
        p = l[p.relaxationInitializer || p.initializer || g.Vi || "random"];
        if ("box" === p.Rb) {
          var m = wa.F(d, {});
          p.vb(e, m);
          wa.rc(e, wa.L(m), d);
        } else p.vb(e, d, wa.u(d, {}));
        for (p = e.length - 1; 0 <= p; p--) {
          m = e[p];
          if (m.description) {
            var c = wa.Lb(d, g.wc, g.Lg);
            m.x = c.x;
            m.y = c.y;
          }
          m.attribution && (c = wa.Lb(d, g.ge, g.zg), m.x = c.x, m.y = c.y);
          P.wb(m.group.initialPosition) && (c = m.group.initialPosition, c = wa.Lb(d, c.position || "bottomright", c.distanceFromCenter || 1), m.x = c.x, m.y = c.y);
        }
      }
    };
  }
  ;
  function hb(a) {
    var q, l = a.options, g = new ib(a, this), e = new jb(a, this), d = { relaxed: g, ordered: e, squarified: e }, p = d[a.options.layout] || g;
    this.ng = 5e-5;
    a.i.subscribe("model:loaded", function(m) {
      q = m;
    });
    a.i.subscribe("options:changed", function(m) {
      m.layout && P.has(d, l.layout) && (p = d[l.layout]);
    });
    this.step = function(m, c, b, h) {
      return p.step(m, c, b, h);
    };
    this.complete = function(m) {
      p.complete(m);
    };
    this.Ue = function(m) {
      return m === q ? true : 2 * Math.sqrt(m.P.fa / (Math.PI * m.j.length)) >= Math.max(l.He, 5e-5);
    };
    this.ld = function(m, c) {
      var b = Math.pow(
        l.Ka,
        m.level
      ), h = l.ab * b;
      b *= l.nd;
      m = m.j;
      for (var f = m.length - 1; 0 <= f; f--) {
        var u = m[f];
        p.je(u, b);
        var t = u;
        t.$ = 0 < h ? Ta.Na(t.C, h) : t.C;
        t.$ && (wa.F(t.$, t.F), wa.ce(t.$, t.P));
        u.j && c.push(u);
      }
    };
    this.jc = function(m) {
      p.jc(m);
    };
    this.Eb = function(m) {
      p.Eb(m);
    };
  }
  ;
  function ib(a, q) {
    function l(n) {
      if (n.j) {
        n = n.j;
        for (var k = 0; k < n.length; k++) {
          var r = n[k];
          r.nc = r.kc * f.Ah;
        }
      }
    }
    function g(n, k) {
      q.Ue(n) && (n.G || (n.G = Ta.Na(n.C, f.nd * Math.pow(f.Ka, n.level - 1)), n.G && n.j[0] && n.j[0].description && "stab" == f.Wb && m(n)), n.G && (b.Eb(n), u.m(e(n), n.G, n.group), n.O = true, k(n)), l(n));
    }
    function e(n) {
      return "stab" === f.Wb && 0 < n.j.length && n.j[0].description ? n.j.slice(1) : n.j;
    }
    function d(n) {
      var k = e(n);
      Ua.U(k, n.G);
      Ua.pc(k, n.G);
      return Va.pg(n) * Math.sqrt(h.P.fa / n.P.fa);
    }
    function p(n) {
      return n < f.Nf || 1e-4 > n;
    }
    function m(n) {
      var k = f.Vb / (1 + f.Vb), r = wa.F(n.G, {}), x = { x: r.x, y: 0 }, v = r.y, w = r.o, z = f.pe * Math.pow(f.Ka, n.level - 1), F = w * f.oe, E = f.wc;
      "bottom" == E || 0 <= E && 180 > E ? (E = Math.PI, v += w, w = -1) : (E = 0, w = 1);
      var G = n.G, O = E, H = 0, A = 1, M = wa.u(G, {}), Q = M.fa;
      k *= Q;
      for (var X = 0; H < A && 20 > X++; ) {
        var Y = (H + A) / 2;
        x.y = r.y + r.o * Y;
        var aa = wa.Nb(G, x, O);
        wa.u(aa[0], M);
        var C = M.fa - k;
        if (0.01 >= Math.abs(C) / Q) break;
        else 0 < (0 == O ? 1 : -1) * C ? A = Y : H = Y;
      }
      wa.F(aa[0], r);
      if (r.o < z || r.o > F) x.y = r.o < z ? v + w * Math.min(z, F) : v + w * F, aa = wa.Nb(n.G, x, E);
      n.j[0].C = aa[0];
      n.G = aa[1];
    }
    function c(n) {
      n !== h && 2 * Math.sqrt(n.P.fa / (Math.PI * n.j.length)) < Math.max(0.85 * f.He, q.ng) && (n.O = false, n.wa = false, n.Da = true, n.G = null);
    }
    var b = this, h, f = a.options, u = new fb(a), t = 0;
    a.i.subscribe("model:loaded", function(n) {
      h = n;
      t = 0;
    });
    this.step = function(n, k, r, x) {
      function v(G) {
        G.O && G.wa ? c(G) : G.Da && G.C && g(G, function() {
          var H = e(G);
          Ua.U(H, G.G);
          Ua.pc(H, G.G);
          n(G);
        });
        if (!G.G || !G.O) return 0;
        if (G.parent && G.parent.Z || G.Fa) {
          var O = d(G);
          x && x(G);
          G.Fa = !p(O) && !r;
          G.Z = true;
        } else O = 0;
        q.ld(G, F);
        return O;
      }
      function w(G, O, H) {
        t < G && (t = G);
        var A = f.Nf;
        f.Ed(O ? 1 : 1 - (G - A) / (t - A || 1), O, H);
        O && (t = 0);
      }
      for (var z = 0, F = [h]; 0 < F.length; ) z = Math.max(z, v(F.shift()));
      var E = p(z);
      k && w(z, E, r);
      return E;
    };
    this.complete = function(n) {
      for (var k = [h]; 0 < k.length; ) {
        var r = k.shift();
        !r.O && r.Da && r.C && g(r, n);
        if (r.G) {
          if (r.parent && r.parent.Z || r.Fa) {
            for (var x = 1e-4 > r.P.fa, v = 0; !(p(d(r)) || x && 32 < v++); ) ;
            r.Z = true;
            r.Fa = false;
          }
          q.ld(r, k);
        }
      }
    };
    this.jc = function(n) {
      Ra.K(n, l);
    };
    this.je = function(n, k) {
      if (n.O) {
        var r = n.G;
        r && (n.Jd = r);
        n.G = Ta.Na(n.C, k);
        n.G && n.j[0] && n.j[0].description && "stab" == f.Wb && m(n);
        r && !n.G && (n.Z = true);
        n.G && n.Jd && wa.rc(e(n), n.Jd, n.G);
      }
    };
    this.Eb = function(n) {
      for (var k = e(n), r = n.fa, x, v = x = 0; v < k.length; v++) x += k[v].weight;
      n.Rj = x;
      for (n = 0; n < k.length; n++) v = k[n], v.ag = v.w, v.kc = r / Math.PI * (0 < x ? v.weight / x : 1 / k.length);
    };
  }
  ;
  function jb(a, q) {
    function l(b, h) {
      if (q.Ue(b)) {
        if (!b.G || b.parent && b.parent.Z) {
          var f = m.nd * Math.pow(m.Ka, b.level - 1);
          b.G = wa.L(e(wa.F(b.C, {}), f));
        }
        b.G && (b.O = true, h(b));
      } else b.O = false, Ra.za(b, function(u) {
        u.G = null;
      });
    }
    function g(b) {
      function h(t) {
        function n() {
          r.C = wa.L(x);
          r.x = x.x + x.w / 2;
          r.y = x.y + x.o / 2;
        }
        var k = m.Vb / (1 + m.Vb), r = t.j[0], x = wa.F(t.G, {}), v = x.o;
        k = Math.min(Math.max(v * k, m.pe * Math.pow(m.Ka, t.level - 1)), v * m.oe);
        var w = m.wc;
        "bottom" == w || 0 <= w && 180 > w ? (x.o = v - k, t.G = wa.L(x), x.y += v - k, x.o = k, n()) : (x.o = k, n(), x.y += k, x.o = v - k, t.G = wa.L(x));
      }
      if ("stab" == m.Wb && 0 < b.j.length && b.j[0].description) {
        var f = b.j.slice(1);
        h(b);
      } else f = b.j;
      m.dc && f.sort(gb);
      "floating" == m.Wb && d(f, m.wc, function(t) {
        return t.description;
      });
      d(f, m.ge, function(t) {
        return t.attribution;
      });
      var u = wa.F(b.G, {});
      (c[m.layout] || Wa.Ob)(f, u, true, m.Pd);
      b.Fa = false;
      b.Z = true;
      b.N = true;
      b.Ha = true;
    }
    function e(b, h) {
      var f = 2 * h;
      b.x += h;
      b.y += h;
      b.w -= f;
      b.o -= f;
      return b;
    }
    function d(b, h, f) {
      for (var u = 0; u < b.length; u++) {
        var t = b[u];
        if (f(t)) {
          b.splice(u, 1);
          "topleft" == h || 135 <= h && 315 > h ? b.unshift(t) : b.push(t);
          break;
        }
      }
    }
    var p, m = a.options, c = { squarified: Wa.ee, ordered: Wa.Ob };
    a.i.subscribe("model:loaded", function(b) {
      p = b;
    });
    this.step = function(b, h, f) {
      this.complete(b);
      h && m.Ed(1, true, f);
      return true;
    };
    this.complete = function(b) {
      for (var h = [p]; 0 < h.length; ) {
        var f = h.shift();
        (!f.O || f.parent && f.parent.Z) && f.Da && f.C && l(f, b);
        f.G && ((f.parent && f.parent.Z || f.Fa) && g(f), q.ld(f, h));
      }
    };
    this.Eb = this.jc = this.je = P.pa;
  }
  ;
  var kb = new function() {
    this.Rg = function(a, q) {
      var l = a.globalAlpha;
      a.fillStyle = "dark" === q ? "white" : "#1d3557";
      a.globalAlpha = 1 * l;
      a.save();
      a.translate(-78.54, -58);
      a.scale(0.94115, 0.94247);
      a.beginPath();
      a.moveTo(86.47, 533.3);
      a.bezierCurveTo(83.52, 531.5, 83.45, 530.6, 83.45, 488.3);
      a.bezierCurveTo(83.45, 444.6, 83.35, 445.7, 87.34, 443.7);
      a.bezierCurveTo(88.39, 443.1, 90.5, 442.5, 92.02, 442.4);
      a.bezierCurveTo(93.54, 442.2, 113, 441.7, 135.3, 441.4);
      a.bezierCurveTo(177.9, 440.7, 179.3, 440.7, 182.7, 443.4);
      a.bezierCurveTo(
        185.9,
        445.9,
        185.6,
        445,
        206.2,
        510.7
      );
      a.bezierCurveTo(207.8, 515.8, 209.5, 521.3, 210.1, 522.9);
      a.bezierCurveTo(211.7, 528, 211.9, 531.3, 210.6, 532.7);
      a.bezierCurveTo(209.5, 534, 208.4, 534, 148.5, 534);
      a.bezierCurveTo(106.4, 533.9, 87.3, 533.7, 86.47, 533.2);
      a.closePath();
      a.fill();
      a.globalAlpha = 0.8 * l;
      a.beginPath();
      a.moveTo(237.3, 533.3);
      a.bezierCurveTo(234.8, 532.5, 233.1, 530.9, 231.7, 528.1);
      a.bezierCurveTo(231, 526.8, 224.6, 507, 217.4, 484.1);
      a.bezierCurveTo(203.1, 438.8, 202.6, 436.7, 205, 431.4);
      a.bezierCurveTo(
        206.3,
        428.5,
        239.2,
        383.2,
        242.9,
        379.3
      );
      a.bezierCurveTo(245, 377, 246.9, 376.7, 249.7, 378.2);
      a.bezierCurveTo(250.6, 378.7, 263.1, 390.8, 277.3, 405.2);
      a.bezierCurveTo(301.1, 429.2, 303.4, 431.6, 305.1, 435.5);
      a.bezierCurveTo(306.7, 439, 306.9, 440.4, 306.9, 445.2);
      a.bezierCurveTo(306.8, 455.3, 302.2, 526.4, 301.5, 528.9);
      a.bezierCurveTo(300.2, 533.7, 301, 533.6, 268.3, 533.7);
      a.bezierCurveTo(252.2, 533.8, 238.3, 533.6, 237.3, 533.3);
      a.closePath();
      a.fill();
      a.beginPath();
      a.globalAlpha = 0.05 * l;
      a.moveTo(329, 533.3);
      a.bezierCurveTo(326.2, 532.5, 323.1, 528.8, 322.6, 525.8);
      a.bezierCurveTo(
        322,
        521.6,
        327.2,
        446.1,
        328.4,
        442.2
      );
      a.bezierCurveTo(330.6, 434.9, 332.8, 432.8, 368.5, 402.4);
      a.bezierCurveTo(387, 386.7, 403.9, 372.8, 406, 371.4);
      a.bezierCurveTo(413.1, 366.7, 416, 366.2, 436.5, 365.7);
      a.bezierCurveTo(456.8, 365.2, 463.6, 365.6, 470.2, 367.6);
      a.bezierCurveTo(476.2, 369.5, 546.1, 402.8, 549.1, 405.3);
      a.bezierCurveTo(550.4, 406.3, 552.2, 408.7, 553.2, 410.5);
      a.lineTo(555, 413.9);
      a.lineTo(555.2, 459.5);
      a.bezierCurveTo(555.3, 484.6, 555.2, 505.8, 555, 506.5);
      a.bezierCurveTo(554.4, 509.1, 548.1, 517.9, 543.8, 522.2);
      a.bezierCurveTo(
        537.7,
        528.3,
        534.2,
        530.5,
        527.8,
        532.4
      );
      a.lineTo(522.3, 534);
      a.lineTo(426.6, 533.9);
      a.bezierCurveTo(371.1, 533.9, 330.1, 533.6, 328.9, 533.3);
      a.closePath();
      a.fill();
      a.globalAlpha = 0.8 * l;
      a.beginPath();
      a.moveTo(87.66, 423);
      a.bezierCurveTo(86.23, 422.4, 85.02, 422, 84.97, 422);
      a.bezierCurveTo(84.91, 422, 84.55, 421.1, 84.16, 419.9);
      a.bezierCurveTo(83.67, 418.6, 83.45, 404.7, 83.45, 375.9);
      a.bezierCurveTo(83.45, 328.4, 83.27, 330.3, 88.12, 328.1);
      a.bezierCurveTo(90.22, 327.2, 101.7, 325.6, 135.4, 321.7);
      a.bezierCurveTo(
        159.9,
        318.8,
        181.1,
        316.5,
        182.5,
        316.5
      );
      a.bezierCurveTo(183.9, 316.5, 187, 317.3, 189.4, 318.2);
      a.bezierCurveTo(193.5, 319.8, 194.7, 320.8, 210.1, 336.2);
      a.bezierCurveTo(226.6, 352.7, 229.1, 355.7, 229.1, 360);
      a.bezierCurveTo(229.1, 363, 226.8, 366.5, 212.9, 385.4);
      a.bezierCurveTo(187.3, 420.2, 189.3, 417.7, 183.4, 420.5);
      a.lineTo(179.5, 422.3);
      a.lineTo(155.3, 422.7);
      a.bezierCurveTo(89.91, 424, 90.39, 423.9, 87.65, 423);
      a.closePath();
      a.fill();
      a.globalAlpha = 0.6 * l;
      a.beginPath();
      a.moveTo(314.6, 415);
      a.bezierCurveTo(311.4, 413.4, 213.2, 314.6, 210.9, 310.7);
      a.bezierCurveTo(
        208.9,
        307.2,
        208.5,
        303.4,
        209.9,
        300
      );
      a.bezierCurveTo(211.2, 297, 241.3, 257, 244.2, 254.4);
      a.bezierCurveTo(247.3, 251.7, 252.9, 249.7, 257.4, 249.7);
      a.bezierCurveTo(261.1, 249.7, 344.7, 255.2, 350.8, 255.8);
      a.bezierCurveTo(358.5, 256.6, 363.1, 259.5, 366, 265.1);
      a.bezierCurveTo(368.7, 270.5, 394.3, 343.7, 394.7, 347.2);
      a.bezierCurveTo(395.1, 351.6, 393.6, 356.1, 390.5, 359.5);
      a.bezierCurveTo(389.1, 361, 375.7, 372.6, 360.5, 385.4);
      a.bezierCurveTo(326.7, 414, 327, 413.7, 324.5, 415);
      a.bezierCurveTo(321.8, 416.4, 317.4, 416.3, 314.6, 414.9);
      a.closePath();
      a.fill();
      a.globalAlpha = 0.4 * l;
      a.beginPath();
      a.moveTo(547.9, 383.4);
      a.bezierCurveTo(547.1, 383.2, 533, 376.6, 516.5, 368.7);
      a.bezierCurveTo(497.2, 359.5, 485.7, 353.7, 484.3, 352.4);
      a.bezierCurveTo(481.6, 349.8, 480.2, 346.5, 480.2, 342.5);
      a.bezierCurveTo(480.2, 339.2, 499.2, 237, 500.4, 233.9);
      a.bezierCurveTo(502.2, 229.1, 506.2, 225.8, 511.3, 224.9);
      a.bezierCurveTo(516.2, 224, 545.8, 222.2, 548.2, 222.6);
      a.bezierCurveTo(551.5, 223.2, 553.7, 224.7, 555.1, 227.3);
      a.bezierCurveTo(556.2, 229.3, 556.3, 234, 556.5, 301.9);
      a.bezierCurveTo(
        556.6,
        341.8,
        556.5,
        375.7,
        556.3,
        377.2
      );
      a.bezierCurveTo(555.6, 381.8, 552, 384.4, 547.8, 383.4);
      a.closePath();
      a.fill();
      a.globalAlpha = 0.4 * l;
      a.beginPath();
      a.moveTo(418.7, 347);
      a.bezierCurveTo(416, 346.1, 413.6, 344.3, 412.3, 342.1);
      a.bezierCurveTo(411.6, 341, 404.4, 321.3, 396.3, 298.3);
      a.bezierCurveTo(382, 258.1, 381.5, 256.4, 381.5, 251.7);
      a.bezierCurveTo(381.5, 248.2, 381.8, 246.2, 382.7, 244.7);
      a.bezierCurveTo(383.4, 243.4, 389.5, 233.9, 396.5, 223.4);
      a.bezierCurveTo(412.6, 199, 411.3, 199.9, 430.6, 198.6);
      a.bezierCurveTo(
        445,
        197.6,
        449.5,
        197.9,
        454.2,
        200.4
      );
      a.bezierCurveTo(460.5, 203.7, 479.6, 217.5, 481.3, 220.1);
      a.bezierCurveTo(484.3, 224.6, 484.3, 224.6, 473.1, 284);
      a.bezierCurveTo(465.3, 325.9, 462.4, 339.9, 461.3, 341.8);
      a.bezierCurveTo(458.7, 346.4, 457.1, 346.7, 437.5, 347.1);
      a.bezierCurveTo(428.1, 347.3, 419.6, 347.3, 418.7, 347);
      a.closePath();
      a.fill();
      a.globalAlpha = 0.05 * l;
      a.beginPath();
      a.moveTo(89.33, 308.2);
      a.bezierCurveTo(88.1, 307.5, 86.5, 306.2, 85.77, 305.2);
      a.bezierCurveTo(84.42, 303.4, 84.42, 303.4, 84.24, 202.6);
      a.bezierCurveTo(
        84.11,
        131.7,
        84.27,
        100.2,
        84.77,
        96.34
      );
      a.bezierCurveTo(85.65, 89.58, 87.91, 84.64, 92.77, 78.81);
      a.bezierCurveTo(96.86, 73.9, 103.2, 68.42, 107.1, 66.53);
      a.bezierCurveTo(108.6, 65.81, 112.8, 64.64, 116.5, 63.92);
      a.bezierCurveTo(122.7, 62.73, 125.4, 62.64, 148.5, 62.81);
      a.lineTo(173.7, 63);
      a.lineTo(177.4, 64.82);
      a.bezierCurveTo(179.5, 65.82, 182.1, 67.75, 183.3, 69.12);
      a.bezierCurveTo(185.6, 71.9, 228.8, 145.1, 231.3, 150.7);
      a.bezierCurveTo(234.5, 157.7, 234.9, 160.8, 234.9, 176.9);
      a.bezierCurveTo(234.8, 201.7, 233.8, 229.6, 232.8, 233.2);
      a.bezierCurveTo(
        232.3,
        235,
        231.1,
        238.1,
        230.2,
        240
      );
      a.bezierCurveTo(228.3, 243.9, 196.9, 286.6, 192.7, 290.9);
      a.bezierCurveTo(189.8, 293.9, 184.3, 297.1, 180.2, 298.2);
      a.bezierCurveTo(177.6, 298.9, 95.84, 309.3, 93.04, 309.3);
      a.bezierCurveTo(92.22, 309.3, 90.55, 308.8, 89.33, 308.1);
      a.closePath();
      a.fill();
      a.globalAlpha = 0.4 * l;
      a.beginPath();
      a.moveTo(305.7, 235.6);
      a.bezierCurveTo(254.5, 232, 256.5, 232.3, 253.9, 227.1);
      a.lineTo(252.4, 224.2);
      a.lineTo(253.1, 196.7);
      a.bezierCurveTo(253.8, 170.5, 253.8, 169.1, 255.2, 166.3);
      a.bezierCurveTo(
        257.7,
        161.2,
        256.9,
        161.4,
        309.3,
        151.9
      );
      a.bezierCurveTo(354.1, 143.8, 356.8, 143.4, 359.7, 144.2);
      a.bezierCurveTo(361.4, 144.6, 363.8, 145.8, 365, 146.8);
      a.bezierCurveTo(367.3, 148.6, 389, 179.6, 391.9, 185.2);
      a.bezierCurveTo(393.8, 188.7, 394.1, 193.5, 392.6, 196.9);
      a.bezierCurveTo(391.5, 199.6, 370.6, 231.4, 368.4, 233.8);
      a.bezierCurveTo(365.4, 237, 362, 238.3, 356.3, 238.5);
      a.bezierCurveTo(353.5, 238.6, 330.7, 237.3, 305.7, 235.5);
      a.closePath();
      a.fill();
      a.globalAlpha = 0.2 * l;
      a.beginPath();
      a.moveTo(497.1, 207.1);
      a.bezierCurveTo(496.2, 206.8, 494.4, 206, 493.2, 205.4);
      a.bezierCurveTo(
        490,
        203.8,
        472.7,
        191.6,
        469.7,
        189
      );
      a.bezierCurveTo(467, 186.6, 465.7, 183.2, 466.2, 180.2);
      a.bezierCurveTo(466.5, 178.1, 482.4, 138.6, 484.9, 133.5);
      a.bezierCurveTo(486.5, 130.3, 488.4, 128.2, 490.9, 126.8);
      a.bezierCurveTo(492.6, 125.9, 496.3, 125.7, 522.2, 125.6);
      a.lineTo(551.5, 125.4);
      a.lineTo(553.7, 127.6);
      a.bezierCurveTo(555.2, 129.1, 556, 130.5, 556.3, 132.6);
      a.bezierCurveTo(556.5, 134.2, 556.6, 149.6, 556.5, 166.9);
      a.bezierCurveTo(556.3, 195.4, 556.2, 198.5, 555.1, 200.4);
      a.bezierCurveTo(553.1, 204.1, 551.7, 204.4, 529.8, 206.1);
      a.bezierCurveTo(
        509.2,
        207.7,
        499.9,
        207.9,
        497,
        207.1
      );
      a.closePath();
      a.fill();
      a.globalAlpha = 0.2 * l;
      a.beginPath();
      a.moveTo(412.5, 180.5);
      a.bezierCurveTo(410.9, 179.7, 408.7, 177.9, 407.5, 176.4);
      a.bezierCurveTo(403.5, 171.3, 380.5, 137.2, 379.2, 134.3);
      a.bezierCurveTo(377.2, 129.6, 377.1, 126.1, 378.9, 116.8);
      a.bezierCurveTo(386.5, 77.56, 388.4, 68.28, 389.5, 66.46);
      a.bezierCurveTo(390.1, 65.34, 391.7, 63.83, 392.9, 63.1);
      a.bezierCurveTo(395.1, 61.84, 396.2, 61.78, 419.4, 61.78);
      a.bezierCurveTo(443.4, 61.78, 443.7, 61.8, 446.5, 63.25);
      a.bezierCurveTo(
        448,
        64.06,
        449.9,
        65.81,
        450.7,
        67.14
      );
      a.bezierCurveTo(452.3, 69.73, 468, 105.5, 470, 111.1);
      a.bezierCurveTo(471.4, 114.9, 471.6, 119.1, 470.5, 122.3);
      a.bezierCurveTo(470.1, 123.5, 465.2, 135.8, 459.7, 149.5);
      a.bezierCurveTo(446.7, 181.4, 448.1, 179.8, 431.5, 181.2);
      a.bezierCurveTo(419, 182.2, 415.7, 182, 412.5, 180.5);
      a.closePath();
      a.fill();
      a.globalAlpha = 0.4 * l;
      a.beginPath();
      a.moveTo(253.6, 142.8);
      a.bezierCurveTo(250.2, 141.8, 246.6, 139.4, 244.7, 136.7);
      a.bezierCurveTo(242.1, 132.9, 207.4, 73.28, 206.2, 70.42);
      a.bezierCurveTo(
        205.1,
        67.89,
        205,
        67.1,
        205.7,
        65.54
      );
      a.bezierCurveTo(207.3, 61.54, 202.3, 61.8, 284.4, 61.59);
      a.bezierCurveTo(325.7, 61.48, 360.8, 61.58, 362.4, 61.81);
      a.bezierCurveTo(366, 62.32, 369.3, 65.36, 369.9, 68.75);
      a.bezierCurveTo(370.4, 71.55, 362.4, 113.9, 360.5, 118.1);
      a.bezierCurveTo(359.1, 121.3, 355, 125, 351.4, 126.4);
      a.bezierCurveTo(348.9, 127.3, 267.1, 142.3, 259.5, 143.2);
      a.bezierCurveTo(257.9, 143.4, 255.2, 143.2, 253.6, 142.7);
      a.closePath();
      a.fill();
      a.globalAlpha = 0.1 * l;
      a.beginPath();
      a.moveTo(493.4, 106.8);
      a.bezierCurveTo(490.3, 106, 488.2, 104.5, 486.5, 101.7);
      a.bezierCurveTo(483.8, 97.43, 471.8, 68.81, 471.8, 66.76);
      a.bezierCurveTo(471.8, 62.64, 470.7, 62.76, 512.1, 62.76);
      a.bezierCurveTo(553.3, 62.76, 552.3, 62.67, 554.4, 66.68);
      a.bezierCurveTo(555.2, 68.34, 555.3, 71.23, 555.2, 85.75);
      a.lineTo(555, 102.8);
      a.lineTo(551.4, 106.4);
      a.lineTo(534.1, 106.8);
      a.bezierCurveTo(510.7, 107.4, 495.9, 107.4, 493.3, 106.8);
      a.closePath();
      a.fill();
      a.restore();
      a.translate(-88.65, 443.2);
      a.scale(0.15905, 0.15905);
      a.globalAlpha = 1 * l;
      a.save();
      a.beginPath();
      a.moveTo(557.4, 564.9);
      a.lineTo(557.4, 98);
      a.lineTo(
        885.8,
        98
      );
      a.lineTo(885.8, 185.1);
      a.lineTo(650.8, 185.1);
      a.lineTo(650.8, 284.7);
      a.lineTo(824.1, 284.7);
      a.lineTo(824.1, 371.6);
      a.lineTo(650.8, 371.6);
      a.lineTo(650.8, 564.9);
      a.lineTo(557.4, 564.9);
      a.closePath();
      a.fill();
      a.beginPath();
      a.moveTo(1029, 568);
      a.quadraticCurveTo(961.1, 568, 915.7, 522.5);
      a.quadraticCurveTo(870.2, 476.7, 870.2, 409.2);
      a.quadraticCurveTo(870.2, 341.3, 915.7, 295.9);
      a.quadraticCurveTo(961.1, 250.4, 1029, 250.4);
      a.quadraticCurveTo(1096.8, 250.4, 1142.3, 295.9);
      a.quadraticCurveTo(1187.7, 341.3, 1187.7, 409.2);
      a.quadraticCurveTo(1187.7, 477.1, 1142.3, 522.5);
      a.quadraticCurveTo(1097.3, 568.1, 1029.3, 568.1);
      a.closePath();
      a.moveTo(1028.6, 492.6);
      a.quadraticCurveTo(1064.1, 492.6, 1086.2, 469);
      a.quadraticCurveTo(1108.3, 445, 1108.3, 409.5);
      a.quadraticCurveTo(1108.3, 374, 1086.2, 350);
      a.quadraticCurveTo(1064.1, 326.1, 1028.3, 326.1);
      a.quadraticCurveTo(993.1, 326.1, 971, 350);
      a.quadraticCurveTo(948.9, 374, 948.9, 409.5);
      a.quadraticCurveTo(948.9, 445, 971, 469);
      a.quadraticCurveTo(993.1, 492.6, 1028.6, 492.6);
      a.closePath();
      a.fill();
      a.beginPath();
      a.moveTo(1253, 291);
      a.quadraticCurveTo(1312.1, 253.6, 1390, 253.6);
      a.quadraticCurveTo(1446, 253.6, 1478.7, 284.7);
      a.quadraticCurveTo(1511.4, 315.9, 1511.4, 378.1);
      a.lineTo(1511.4, 564.9);
      a.lineTo(1424.2, 564.9);
      a.lineTo(1424.2, 540);
      a.quadraticCurveTo(1386.2, 564.9, 1355.7, 564.9);
      a.quadraticCurveTo(1293.5, 564.9, 1262.3, 538.5);
      a.quadraticCurveTo(1231.2, 512, 1231.2, 465.3);
      a.quadraticCurveTo(1231.2, 421.7, 1260.4, 387.5);
      a.quadraticCurveTo(1290, 353.3, 1355.7, 353.3);
      a.quadraticCurveTo(1385.9, 353.3, 1424.2, 371.9);
      a.lineTo(
        1424.2,
        362.6
      );
      a.quadraticCurveTo(1423.6, 328.4, 1374.4, 325.2);
      a.quadraticCurveTo(1318.3, 325.2, 1287.2, 343.9);
      a.lineTo(1253, 291);
      a.closePath();
      a.moveTo(1424.2, 471.5);
      a.lineTo(1424.2, 436.3);
      a.quadraticCurveTo(1411.7, 412.3, 1365, 412.3);
      a.quadraticCurveTo(1309, 418.5, 1305.9, 455.9);
      a.quadraticCurveTo(1309, 492.9, 1365, 496);
      a.quadraticCurveTo(1411.7, 496, 1424.2, 471.5);
      a.closePath();
      a.fill();
      a.beginPath();
      a.moveTo(1675, 365.7);
      a.lineTo(1675, 564.9);
      a.lineTo(1587.8, 564.9);
      a.lineTo(1587.8, 262.5);
      a.lineTo(1675, 253.2);
      a.lineTo(
        1675,
        280.9
      );
      a.quadraticCurveTo(1704.2, 253.5, 1749.7, 253.5);
      a.quadraticCurveTo(1808.8, 253.5, 1839.9, 289.3);
      a.quadraticCurveTo(1874.2, 253.5, 1942.6, 253.5);
      a.quadraticCurveTo(2001.8, 253.5, 2032.9, 289.3);
      a.quadraticCurveTo(2064, 325.1, 2064, 371.8);
      a.lineTo(2064, 564.8);
      a.lineTo(1976.9, 564.8);
      a.lineTo(1976.9, 393.6);
      a.quadraticCurveTo(1976.9, 362.5, 1962.9, 345.4);
      a.quadraticCurveTo(1948.8, 328.2, 1917.4, 327.3);
      a.quadraticCurveTo(1891.6, 329.2, 1872.6, 361.6);
      a.quadraticCurveTo(1871, 371.2, 1871, 381.2);
      a.lineTo(1871, 564.9);
      a.lineTo(1783.9, 564.9);
      a.lineTo(1783.9, 393.7);
      a.quadraticCurveTo(1783.9, 362.5, 1769.9, 345.4);
      a.quadraticCurveTo(1755.9, 328.3, 1724.4, 327.4);
      a.quadraticCurveTo(1695.8, 329.2, 1674.9, 365.7);
      a.closePath();
      a.fill();
      a.beginPath();
      a.moveTo(2058, 97.96);
      a.lineTo(2058, 185.1);
      a.lineTo(2213.6, 185.1);
      a.lineTo(2213.6, 564.9);
      a.lineTo(2306.9, 564.9);
      a.lineTo(2306.9, 185.1);
      a.lineTo(2462.5, 185.1);
      a.lineTo(2462.5, 97.96);
      a.lineTo(2057.8, 97.96);
      a.closePath();
      a.fill();
      a.beginPath();
      a.moveTo(2549, 287.8);
      a.quadraticCurveTo(
        2582.3,
        253.5,
        2630.2,
        253.5
      );
      a.quadraticCurveTo(2645.5, 253.5, 2659.2, 256);
      a.lineTo(2645.5, 341.9);
      a.quadraticCurveTo(2630.2, 328.2, 2601.9, 327.3);
      a.quadraticCurveTo(2570.1, 329.5, 2549, 373.4);
      a.lineTo(2549, 564.8);
      a.lineTo(2461.8, 564.8);
      a.lineTo(2461.8, 262.5);
      a.lineTo(2549, 253.1);
      a.lineTo(2549, 287.7);
      a.closePath();
      a.fill();
      a.beginPath();
      a.moveTo(2694, 409.2);
      a.quadraticCurveTo(2694, 340.7, 2737.5, 297.1);
      a.quadraticCurveTo(2781.1, 253.5, 2849.6, 253.5);
      a.quadraticCurveTo(2918.1, 253.5, 2958.5, 297.1);
      a.quadraticCurveTo(
        2999,
        340.6,
        2999,
        409.2
      );
      a.lineTo(2999, 440.3);
      a.lineTo(2784.2, 440.3);
      a.quadraticCurveTo(2787.3, 465.2, 2806, 479.2);
      a.quadraticCurveTo(2824.7, 493.2, 2849.6, 493.2);
      a.quadraticCurveTo(2893.1, 493.2, 2927.4, 468.3);
      a.lineTo(2977.2, 518.1);
      a.quadraticCurveTo(2943, 564.8, 2849.6, 564.8);
      a.quadraticCurveTo(2781.1, 564.8, 2737.5, 521.2);
      a.quadraticCurveTo(2693.9, 477.6, 2693.9, 409.1);
      a.closePath();
      a.moveTo(2911.9, 378);
      a.quadraticCurveTo(2911.9, 353.1, 2893.2, 339.1);
      a.quadraticCurveTo(2874.5, 325.1, 2849.6, 325.1);
      a.quadraticCurveTo(
        2824.7,
        325.1,
        2806,
        339.1
      );
      a.quadraticCurveTo(2787.3, 353.1, 2787.3, 378);
      a.lineTo(2911.8, 378);
      a.closePath();
      a.fill();
      a.beginPath();
      a.moveTo(3052, 409.2);
      a.quadraticCurveTo(3052, 340.7, 3095.5, 297.1);
      a.quadraticCurveTo(3139.1, 253.5, 3207.6, 253.5);
      a.quadraticCurveTo(3276.1, 253.5, 3316.5, 297.1);
      a.quadraticCurveTo(3357, 340.6, 3357, 409.2);
      a.lineTo(3357, 440.3);
      a.lineTo(3142.2, 440.3);
      a.quadraticCurveTo(3145.3, 465.2, 3164, 479.2);
      a.quadraticCurveTo(3182.7, 493.2, 3207.6, 493.2);
      a.quadraticCurveTo(3251.1, 493.2, 3285.4, 468.3);
      a.lineTo(
        3335.2,
        518.1
      );
      a.quadraticCurveTo(3301, 564.8, 3207.6, 564.8);
      a.quadraticCurveTo(3139.1, 564.8, 3095.5, 521.2);
      a.quadraticCurveTo(3051.9, 477.6, 3051.9, 409.1);
      a.closePath();
      a.moveTo(3269.9, 378);
      a.quadraticCurveTo(3269.9, 353.1, 3251.2, 339.1);
      a.quadraticCurveTo(3232.5, 325.1, 3207.6, 325.1);
      a.quadraticCurveTo(3182.7, 325.1, 3164, 339.1);
      a.quadraticCurveTo(3145.3, 353.1, 3145.3, 378);
      a.lineTo(3269.8, 378);
      a.closePath();
      a.fill();
      a.restore();
    };
  }();
  kb.re = { width: 445.2, height: 533.5 };
  function lb(a, q) {
    function l(y, B) {
      var D = y.P.r, J = D / 15, K = 0.5 * D / 15;
      D /= 5;
      var L = y.P.x;
      y = y.P.y;
      B.fillRect(L - K, y - K, J, J);
      B.fillRect(L - K - D, y - K, J, J);
      B.fillRect(L - K + D, y - K, J, J);
    }
    function g(y, B, D, J) {
      null === y && D.clearRect(0, 0, O, H);
      var K, L = Array(T.length);
      for (K = T.length - 1; 0 <= K; K--) L[K] = T[K].ma(D, J);
      for (K = T.length - 1; 0 <= K; K--) L[K] && T[K].before(D, J);
      X.xc([D, G], function(W) {
        var Z;
        if (null !== y) {
          D.save();
          D.globalCompositeOperation = "destination-out";
          D.fillStyle = D.strokeStyle = "rgba(255, 255, 255, 1)";
          for (Z = y.length - 1; 0 <= Z; Z--) {
            var ha = y[Z], ja = ha.C;
            ja && (D.save(), D.beginPath(), ha.Ib(D), ya.Yd(D, ja), D.fill(), ha = C.ab * Math.pow(C.Ka, ha.level - 1), 0 < ha && (D.lineWidth = ha / 2, D.stroke()), D.restore());
          }
          D.restore();
        }
        W = W.scale;
        if (0 !== B.length) {
          Z = {};
          for (ja = T.length - 1; 0 <= ja; ja--) T[ja].vg(Z);
          for (ha = I.length - 1; 0 <= ha; ha--) if (ja = I[ha], Z[ja.id]) {
            var pa = ja.Od;
            for (ja = 0; ja < B.length; ja++) {
              var oa = B[ja];
              !oa.parent || oa.parent.wa && oa.parent.O ? pa(oa, W) : oa.aa.clear();
            }
          }
        }
        for (Z = T.length - 1; 0 <= Z; Z--) ha = T[Z], L[Z] && ha.Rd(B, D, W);
      });
      for (K = T.length - 1; 0 <= K; K--) L[K] && T[K].after(D);
      C.cd && (D.canvas.style.opacity = 0.99, setTimeout(function() {
        D.canvas.style.opacity = 1;
      }, 1));
    }
    function e(y) {
      k === x ? y < 0.9 * u && (k = r, w = z, c()) : y >= u && (k = x, w = F, c());
    }
    function d() {
      function y(K, L, W) {
        K.sb = Math.floor(1e3 * K.scale) - W * L;
        0 < K.opacity && !K.open && L++;
        var Z = K.j;
        if (Z) for (var ha = Z.length - 1; 0 <= ha; ha--) K.W && y(Z[ha], L, W);
      }
      var B = null, D = null, J = null;
      X.xc([], function(K) {
        e(K.scale);
        var L = false;
        Ra.K(U, function(da) {
          da.W && (L = da.zd() || L, da.fc(), da.La = M.m(da) || da.La);
        });
        L && (U.N = true);
        var W = "onSurfaceDirty" === C.Xg;
        Ra.kd(U, function(da) {
          da.parent && da.parent.Z && (da.aa.clear(), da.La = true, W || (da.uc = true, da.Tb.clear()));
          W && (da.uc = true, da.Tb.clear());
        });
        var Z = K.scale * K.scale;
        Ra.kd(U, function(da) {
          if (da.O) {
            for (var ma = da.j, sa = 0; sa < ma.length; sa++) if (5 < ma[sa].P.fa * Z) {
              da.X = true;
              return;
            }
            da.X = false;
          }
        });
        f(K);
        J = [];
        Ra.zc(U, function(da) {
          if (da.parent.X && da.Y && da.W) {
            J.push(da);
            for (var ma = da.parent; ma !== U && (ma.open || 0 === ma.opacity); ) ma = ma.parent;
            ma !== U && 0.02 > Math.abs(ma.scale - da.scale) && (da.scale = Math.min(da.scale, ma.scale));
          }
        });
        y(U, 0, "flattened" === C.nb ? -1 : 1);
        J.sort(function(da, ma) {
          return da.sb - ma.sb;
        });
        if (p()) B = J, D = null;
        else {
          var ha = {}, ja = {}, pa = "none" != C.pd && C.ab < C.bb / 2, oa = C.ab < C.Ec / 2 + C.od * C.Je.a;
          Ra.K(U, function(da) {
            if (da.W && !da.description && (da.Z || da.N || da.Kc && da.parent.X && da.La)) {
              var ma, sa, ua = [da], va = da.I || da.parent.j;
              if (pa) for (ma = 0; ma < va.length; ma++) (sa = va[ma]) && ua.push(sa);
              else if (oa) if (!da.selected && da.Sa) {
                sa = true;
                for (ma = 0; ma < va.length; ma++) va[ma] ? ua.push(va[ma]) : sa = false;
                !sa && 1 < da.level && ua.push(da.parent);
              } else for (ma = 0; ma < va.length; ma++) (sa = va[ma]) && sa.selected && ua.push(sa);
              var za;
              for (ma = da.parent; ma != U; ) ma.selected && (za = ma), ma = ma.parent;
              za && ua.push(za);
              for (ma = 0; ma < ua.length; ma++) {
                za = ua[ma];
                for (da = za.parent; da && da !== U; ) 0 < da.opacity && (za = da), da = da.parent;
                ja[za.id] = true;
                Ra.za(za, function(rb) {
                  ha[rb.id] = true;
                });
              }
            }
          });
          B = J.filter(function(da) {
            return ha[da.id];
          });
          D = B.filter(function(da) {
            return ja[da.id];
          });
        }
      });
      (function() {
        var K = false;
        C.Mf && Ra.K(U, function(L) {
          if (L.W && 0 !== L.oa.a && 1 !== L.oa.a) return K = true, false;
        });
        K ? (Ra.yc(U, function(L) {
          if (L.W && (L.opacity !== L.Oc || L.Ha)) {
            var W = L.j;
            if (W) {
              for (var Z = 0, ha = W.length - 1; 0 <= ha; ha--) Z = Math.max(Z, W[ha].Jc);
              L.Jc = Z + L.opacity * L.oa.a;
            } else L.Jc = L.opacity * L.oa.a;
          }
        }), Ra.K(U, function(L) {
          if (L.W && (L.opacity !== L.Oc || L.Ha)) {
            for (var W = L.Jc, Z = L; (Z = Z.parent) && Z !== U; ) W += Z.opacity * Z.oa.a * C.Kf;
            L.dd = 0 < W ? 1 - Math.pow(1 - L.oa.a, 1 / W) : 0;
            L.Oc = L.opacity;
          }
        })) : Ra.K(U, function(L) {
          L.W && (L.dd = 1, L.Oc = -1);
        });
      })();
      return { gg: B, fg: D, Y: J };
    }
    function p() {
      var y = U.Z || U.N || "none" == C.Qe;
      if (!y && !U.empty()) {
        var B = U.j[0].scale;
        Ra.K(U, function(D) {
          if (D.W && D.Y && D.scale !== B) return y = true, false;
        });
      }
      !y && 0 < C.De && 1 != C.Pa && Ra.K(U, function(D) {
        if (D.W && 0 < D.ha) return y = true, false;
      });
      "accurate" == C.Qe && (y = (y = y || 0 === C.ab) || "none" != C.pd && C.ab < C.bb / 2, !y && C.ab < C.Ec / 2 + C.od * C.Je.a && Ra.K(U, function(D) {
        if (D.W && (D.selected && !D.Sa || !D.selected && D.Sa)) return y = true, false;
      }));
      return y;
    }
    function m() {
      if (C.B !== C.ob) return true;
      var y = "polygonPlainFill polygonPlainStroke polygonGradientFill polygonGradientStroke labelPlainFill contentDecoration".split(" ");
      Ra.K(U, function(J) {
        if (J.W && J.T) return y.push("polygonExposureShadow"), false;
      });
      for (var B = y.length - 1; 0 <= B; B--) {
        var D = y[B];
        if (!!ba[D] !== !!N[D]) return true;
      }
      return false;
    }
    function c() {
      function y(L, W, Z, ha, ja) {
        function pa(da, ma, sa, ua, va) {
          da[ua] && (ma -= sa * t[ua], da[ua] = false, va && (ma += sa * t[va], da[va] = true));
          return ma;
        }
        L = P.extend({}, L);
        switch (Z) {
          case "never":
            L.labelPlainFill = false;
            break;
          case "always":
          case "auto":
            L.labelPlainFill = true;
        }
        if (C.Dc) switch (ha) {
          case "never":
            L.contentDecoration = false;
            break;
          case "always":
          case "auto":
            L.contentDecoration = true;
        }
        else L.contentDecoration = false;
        var oa = 0;
        P.Aa(L, function(da, ma) {
          da && (oa += W * t["contentDecoration" === ma ? "labelPlainFill" : ma]);
        });
        L.polygonExposureShadow = B;
        oa += 2 * t.polygonExposureShadow;
        if (oa <= ja || (oa = pa(L, oa, 2, "polygonExposureShadow")) <= ja || (oa = pa(L, oa, W, "polygonGradientFill", "polygonPlainFill")) <= ja || (oa = pa(L, oa, W, "polygonGradientStroke")) <= ja || (oa = pa(L, oa, W, "polygonPlainStroke")) <= ja || "auto" === ha && (oa = pa(L, oa, W, "contentDecoration")) <= ja) return L;
        "auto" === Z && (oa = pa(L, oa, W, "labelPlainFill"));
        return L;
      }
      var B = k === r, D = 0, J = 0;
      Ra.te(U, function(L) {
        var W = 1;
        Ra.K(L, function() {
          W++;
        });
        D += W;
        J = Math.max(J, W);
      });
      var K = {};
      switch (C.gh) {
        case "plain":
          K.polygonPlainFill = true;
          break;
        case "gradient":
          K.polygonPlainFill = !B, K.polygonGradientFill = B;
      }
      switch (C.pd) {
        case "plain":
          K.polygonPlainStroke = true;
          break;
        case "gradient":
          K.polygonPlainStroke = !B, K.polygonGradientStroke = B;
      }
      ba = y(K, D, C.uj, C.sj, C.tj);
      N = y(K, 2 * J, "always", "always", C.Pg);
      ia = y(K, D, "always", "always", C.Og);
    }
    function b(y) {
      return function(B, D) {
        return B === k ? true === ba[y] : true === (D ? N : ia)[y];
      };
    }
    function h(y, B) {
      return function(D, J) {
        return y(D, J) && B(D, J);
      };
    }
    function f(y) {
      U.Y = true;
      Ra.kd(U, function(B) {
        if (B.W && B.X && B.wa && B.O && (U.N || B.Z || B.Zd)) {
          B.Zd = false;
          var D = B.j, J = { x: 0, y: 0, w: 0, o: 0 }, K = !!B.G;
          if (1 < O / y.w) {
            var L, W = false;
            for (L = D.length - 1; 0 <= L; L--) D[L].Y = false, W |= D[L].T;
            if ((B.Y || W) && K) {
              for (L = D.length - 1; 0 <= L; L--) if (B = D[L], 1 !== B.scale && (B.Jb(y, J), J.w = y.w / B.scale, J.o = y.o / B.scale), false === B.Y && B.C) {
                if (K = B.C, W = K.length, wa.Wa(B.C, 1 === B.scale ? y : J)) B.Y = true;
                else for (var Z = 0; Z < W; Z++) if (wa.Dg(K[Z], K[(Z + 1) % W], 1 === B.scale ? y : J)) {
                  B.Y = true;
                  B.I && (B = B.I[Z]) && (D[B.index].Y = true);
                  break;
                }
              }
            }
          } else for (L = 0; L < D.length; L++) D[L].Y = K;
        }
      });
    }
    var u = ea.Ye() ? 50 : 1e4, t, n, k, r, x, v, w, z, F, E, G, O, H, A, M = new mb(a), Q = new nb(a), X, Y, aa, C = a.options, U, fa, ba, ia, N;
    a.i.subscribe("stage:initialized", function(y, B, D, J) {
      A = y;
      O = D;
      H = J;
      n = A.hc("wireframe", C.ob, false);
      r = n.getContext("2d");
      x = new xa(r);
      v = A.hc("hifi", C.B, false);
      z = v.getContext("2d");
      F = new xa(z);
      k = r;
      w = z;
      r.B = C.ob;
      x.B = C.ob;
      z.B = C.B;
      F.B = C.B;
      E = A.hc("tmp", Math.max(C.B, C.ob), true);
      G = E.getContext("2d");
      G.B = 1;
      [r, z, G].forEach(function(K) {
        K.scale(K.B, K.B);
      });
    });
    a.i.subscribe("stage:resized", function(y, B, D, J) {
      O = D;
      H = J;
      [r, z, G].forEach(function(K) {
        K.scale(
          K.B,
          K.B
        );
      });
    });
    a.i.subscribe("model:loaded", function(y) {
      function B(D) {
        var J = 0;
        if (!D.empty()) {
          for (var K = D.j, L = K.length - 1; 0 <= L; L--) J = Math.max(J, B(K[L]));
          J += 1;
        }
        return D.Yf = J;
      }
      U = y;
      fa = true;
      B(U);
      c();
      a.i.D("render:renderers:resolved", ba, N, ia);
    });
    var R = "groupFillType groupStrokeType wireframeDrawMaxDuration wireframeLabelDrawing wireframeContentDecorationDrawing finalCompleteDrawMaxDuration finalIncrementalDrawMaxDuration groupContentDecorator".split(" "), ca = [
      "groupLabelLightColor",
      "groupLabelDarkColor",
      "groupLabelColorThreshold",
      "groupUnexposureLabelColorThreshold"
    ];
    a.i.subscribe("options:changed", function(y) {
      function B(J, K, L, W) {
        A.Ui(J, L);
        K.B = L;
        W && K.scale(L, L);
      }
      y.dataObject || (P.cb(y, R) && c(), P.cb(y, ca) && Ra.K(U, function(J) {
        J.md = -1;
      }));
      var D = P.has(y, "pixelRatio");
      y = P.has(y, "wireframePixelRatio");
      if (D || y) D && B(v, w, C.B, true), y && B(n, k, C.ob, true), B(E, G, Math.max(C.B, C.ob), false);
    });
    a.i.subscribe("zoom:initialized", function(y) {
      X = y;
    });
    a.i.subscribe("timeline:initialized", function(y) {
      Y = y;
    });
    a.i.subscribe("api:initialized", function(y) {
      aa = y;
    });
    var I = [{ id: "offsetPolygon", Od: function(y) {
      if ((y.selected || 0 < y.opacity && false === y.open || !y.X) && y.aa.Ia()) {
        var B = y.aa;
        B.clear();
        if (y.$) {
          var D = y.$, J = C.Sg;
          0 < J ? ya.gj(B, D, y.parent.P.r / 32, Math.min(1, J * Math.pow(1 - C.Tg * J, y.Yf))) : ya.Yd(B, D);
        }
        y.Hd = true;
      }
    } }, { id: "label", Od: function(y) {
      y.La && y.Kc && M.u(y);
    } }, { id: "custom", Od: function(y, B) {
      if (y.$ && (0 < y.opacity && (false === y.open || true === y.selected) || !y.X) && y.uc && a.options.Dc && !y.attribution) {
        var D = {};
        aa.ad(D, y);
        aa.bd(D, y);
        aa.$c(D, y, true);
        D.context = y.Tb;
        D.polygonContext = y.aa;
        D.labelContext = y.Hc;
        D.shapeDirty = y.Hd;
        D.viewportScale = B;
        B = { groupLabelDrawn: true, groupPolygonDrawn: true };
        a.options.Wg(a.Gd, D, B);
        y.Ze = B.groupLabelDrawn;
        y.Id = B.groupPolygonDrawn;
        y.Hd = false;
        y.uc = false;
      }
    } }].reverse(), T = [new function(y) {
      var B = Array(y.length);
      this.Rd = function(D, J, K) {
        if (0 !== D.length) {
          var L, W = [], Z = D[0].sb;
          for (L = 0; L < D.length; L++) {
            var ha = D[L];
            ha.sb !== Z && (W.push(L), Z = ha.sb);
          }
          W.push(L);
          for (var ja = Z = 0; ja < W.length; ja++) {
            for (var pa = W[ja], oa = y.length - 1; 0 <= oa; oa--) if (B[oa]) {
              var da = y[oa];
              J.save();
              for (L = Z; L < pa; L++) ha = D[L], J.save(), ha.Ib(J), da.lb.call(da, ha, J, K), J.restore();
              da.Xa.call(da, J, K);
              J.restore();
            }
            Z = pa;
          }
        }
      };
      this.ma = function(D, J) {
        for (var K = false, L = y.length - 1; 0 <= L; L--) B[L] = y[L].ma(D, J), K |= B[L];
        return K;
      };
      this.before = function(D, J) {
        for (var K = y.length - 1; 0 <= K; K--) if (B[K]) {
          var L = y[K];
          L.before.call(L, D, J);
        }
      };
      this.after = function(D) {
        for (var J = y.length - 1; 0 <= J; J--) if (B[J]) {
          var K = y[J];
          K.after.call(K, D);
        }
      };
      this.vg = function(D) {
        for (var J = y.length - 1; 0 <= J; J--) {
          var K = y[J];
          if (B[J]) for (var L = K.Ra.length - 1; 0 <= L; L--) D[K.Ra[L]] = true;
        }
      };
    }([{
      Ra: ["offsetPolygon"],
      ma: b("polygonExposureShadow"),
      before: function(y) {
        G.save();
        G.scale(y.B, y.B);
      },
      after: function() {
        G.restore();
      },
      rb: function() {
      },
      Xa: function(y) {
        this.Xf && (this.Xf = false, y.save(), y.setTransform(1, 0, 0, 1, 0, 0), y.drawImage(E, 0, 0, y.canvas.width, y.canvas.height, 0, 0, y.canvas.width, y.canvas.height), y.restore(), G.save(), G.setTransform(1, 0, 0, 1, 0, 0), G.clearRect(0, 0, E.width, E.height), G.restore());
      },
      lb: function(y, B, D) {
        if (!(y.open && y.X || y.aa.Ia())) {
          var J = C.De * y.opacity * y.ha * ("flattened" === C.nb ? 1 - y.parent.ha : (1 - y.Cb) * y.parent.Cb) * (1.1 <= C.Pa ? 1 : (C.Pa - 1) / 0.1);
          0 < J && (G.save(), G.beginPath(), y.Ib(G), y.aa.Ma(G), G.shadowBlur = D * B.B * J, G.shadowColor = C.Yg, G.fillStyle = "rgba(0, 0, 0, 1)", G.globalCompositeOperation = "source-over", G.globalAlpha = y.opacity, G.fill(), G.shadowBlur = 0, G.shadowColor = "transparent", G.globalCompositeOperation = "destination-out", G.fill(), G.restore(), this.Xf = true);
        }
      }
    }, { Ra: ["offsetPolygon"], ma: function() {
      return true;
    }, before: function() {
      function y(K) {
        var L = K.oa, W = K.ub, Z = K.selected, ha = (L.h + (W ? C.kh : 0) + (Z ? C.Bh : 0)) % 360, ja = B(L.l * K.ra + (W ? C.lh : 0) + (Z ? C.Ch : 0));
        L = B(L.s * K.saturation + (W ? C.mh : 0) + (Z ? C.Dh : 0));
        K = K.Ce;
        K.h = ha;
        K.s = L;
        K.l = ja;
        return K;
      }
      function B(K) {
        return 100 < K ? 100 : 0 > K ? 0 : K;
      }
      var D = [{ type: "fill", ma: b("polygonPlainFill"), Uc: function(K, L) {
        L.fillStyle = Ea.qc(y(K));
      } }, { type: "fill", ma: b("polygonGradientFill"), Uc: function(K, L) {
        var W = K.P.r, Z = y(K);
        W = L.createRadialGradient(K.x, K.y, 0, K.x, K.y, W * C.bh);
        var ha = Z.l, ja = C.$g;
        W.addColorStop(0, Ea.ja((Z.h + C.Zg) % 360, B(Z.s + C.ah), B(ha + ja)));
        ha = Z.l;
        ja = C.eh;
        W.addColorStop(1, Ea.ja(
          (Z.h + C.dh) % 360,
          B(Z.s + C.fh),
          B(ha + ja)
        ));
        K.aa.Ma(L);
        L.fillStyle = W;
      } }, { type: "stroke", ma: h(b("polygonPlainStroke"), function() {
        return 0 < C.bb;
      }), Uc: function(K, L) {
        var W = K.oa, Z = K.ub, ha = K.selected, ja = (W.h + C.Ne + (Z ? C.Ee : 0) + (ha ? C.Ke : 0)) % 360, pa = B(W.s * K.saturation + C.Pe + (Z ? C.Ge : 0) + (ha ? C.Me : 0));
        W = B(W.l * K.ra + C.Oe + (Z ? C.Fe : 0) + (ha ? C.Le : 0));
        L.strokeStyle = Ea.ja(ja, pa, W);
        L.lineWidth = C.bb * Math.pow(C.Ka, K.level - 1);
      } }, { type: "stroke", ma: h(b("polygonGradientStroke"), function() {
        return 0 < C.bb;
      }), Uc: function(K, L) {
        var W = K.P.r * C.Jh, Z = K.oa, ha = Math.PI * C.Fh / 180;
        W = L.createLinearGradient(K.x + W * Math.cos(ha), K.y + W * Math.sin(ha), K.x + W * Math.cos(ha + Math.PI), K.y + W * Math.sin(ha + Math.PI));
        var ja = K.ub, pa = K.selected;
        ha = (Z.h + C.Ne + (ja ? C.Ee : 0) + (pa ? C.Ke : 0)) % 360;
        var oa = B(Z.s * K.saturation + C.Pe + (ja ? C.Ge : 0) + (pa ? C.Me : 0));
        Z = B(Z.l * K.ra + C.Oe + (ja ? C.Fe : 0) + (pa ? C.Le : 0));
        ja = C.Hh;
        W.addColorStop(0, Ea.ja((ha + C.Gh) % 360, B(oa + C.Ih), B(Z + ja)));
        ja = C.Lh;
        W.addColorStop(1, Ea.ja((ha + C.Kh) % 360, B(oa + C.Mh), B(Z + ja)));
        L.strokeStyle = W;
        L.lineWidth = C.bb * Math.pow(C.Ka, K.level - 1);
      } }], J = Array(D.length);
      return function(K, L) {
        for (var W = D.length - 1; 0 <= W; W--) J[W] = D[W].ma(K, L);
        this.kj = D;
        this.Fg = J;
      };
    }(), after: function() {
    }, rb: function() {
    }, Xa: function() {
    }, lb: function(y, B) {
      if (!(!y.Id || (0 === y.opacity || y.open) && y.X || y.aa.Ia() || !C.qe && y.description)) {
        var D = this.kj, J = this.Fg;
        B.beginPath();
        y.aa.Ma(B);
        for (var K = false, L = false, W = D.length - 1; 0 <= W; W--) {
          var Z = D[W];
          if (J[W]) switch (Z.Uc(y, B), Z.type) {
            case "fill":
              K = true;
              break;
            case "stroke":
              L = true;
          }
        }
        D = (y.X ? y.opacity : 1) * y.oa.a;
        J = !y.empty();
        W = C.Mf ? y.dd : 1;
        K && (y = J && y.X && y.O && y.j[0].W ? 1 - y.j.reduce(function(ha, ja) {
          return ha + ja.qa * ja.Ld;
        }, 0) / y.j.length * (1 - C.Kf) : 1, B.globalAlpha = D * y * W, ob(B));
        L && (B.globalAlpha = D * (J ? C.ji : 1) * W, B.closePath(), pb(B), B.stroke());
      }
    } }, { Ra: ["offsetPolygon"], ma: function() {
      return 0 < C.Ec;
    }, before: function() {
    }, after: function() {
    }, rb: function() {
    }, Xa: function() {
    }, lb: function(y, B, D) {
      if (y.Id && y.selected && !y.aa.Ia()) {
        B.globalAlpha = y.Ea;
        B.beginPath();
        var J = Math.pow(C.Ka, y.level - 1);
        B.lineWidth = C.Ec * J;
        B.strokeStyle = C.Eh;
        var K = C.od;
        0 < K && (B.shadowBlur = K * J * D * B.B, B.shadowColor = C.Ie);
        y.aa.Ma(B);
        B.closePath();
        B.stroke();
      }
    } }, { Ra: [], ma: function() {
      return true;
    }, before: function() {
    }, after: function() {
    }, rb: function() {
    }, Xa: function() {
    }, ai: kb, lb: function(y, B) {
      function D(K, L, W) {
        var Z = wa.de(y.$, y.P, K / L);
        Z = Math.min(Math.min(0.9 * Z, 0.5 * y.F.o) / L, 0.5 * y.F.w / K);
        B.save();
        B.translate(y.x, y.y);
        B.globalAlpha = y.opacity * y.ca;
        B.scale(Z, Z);
        B.translate(-K / 2, -L / 2);
        W(B);
        B.restore();
      }
      var J = this.ai;
      y.attribution && !y.aa.Ia() && D(J.re.width, J.re.height, function(K) {
        J.Rg(K, C.he);
      });
    } }, { Ra: [], ma: /* @__PURE__ */ function(y, B) {
      return function(D, J) {
        return y(D, J) || B(
          D,
          J
        );
      };
    }(b("labelPlainFill"), h(b("contentDecoration"), function() {
      return C.Dc;
    })), before: function() {
    }, after: function() {
    }, rb: function() {
    }, Xa: function() {
    }, lb: function(y, B, D) {
      (0 < y.opacity && 0 < y.ca && !y.open || !y.X) && !y.aa.Ia() && (y.Ic = y.na && y.na.ia && C.B * y.na.fontSize * y.scale * D >= C.yh, "auto" === y.td ? !C.qe && y.description ? y.gb = y.parent.gb : (D = y.Ce, B = D.h + (D.s << 9) + (D.l << 16), y.md !== B && (D = Ea.og(D), y.gb = D > (0 > y.ha ? C.Nh : C.nh) ? C.oh : C.xh, y.md = B)) : y.gb = y.td);
    } }, {
      Ra: ["custom"],
      ma: h(b("contentDecoration"), function() {
        return C.Dc;
      }),
      before: function() {
      },
      after: function() {
      },
      rb: function() {
      },
      Xa: function() {
      },
      lb: function(y, B) {
        !(0 < y.opacity && 0 < y.ca && !y.open || !y.X) || y.Tb.Ia() || y.aa.Ia() || (y.Ic || void 0 === y.na ? (B.globalAlpha = y.ca * (y.X ? y.opacity : 1) * (y.empty() ? 1 : C.Lf), B.fillStyle = y.gb, B.strokeStyle = y.gb, y.Tb.Ma(B)) : l(y, B));
      }
    }, { Ra: ["label"], ma: b("labelPlainFill"), before: function() {
    }, after: function() {
    }, rb: function() {
    }, Xa: function() {
    }, lb: function(y, B, D) {
      y.Ze && y.Kc && (0 < y.opacity && 0 < y.ca && !y.open || !y.X) && !y.aa.Ia() && y.na && (B.fillStyle = y.gb, B.globalAlpha = y.ca * (y.X ? y.opacity : 1) * (y.empty() ? 1 : C.Lf), y.Ic ? qb(y, B, D) : l(y, B));
    } }].reverse())];
    this.M = function() {
      t = Ma.Th(function() {
        return Aa.estimate();
      }, "CarrotSearchFoamTree", 12096e5)(sb());
      Q.M();
    };
    this.clear = function() {
      k.clearRect(0, 0, O, H);
      w.clearRect(0, 0, O, H);
    };
    var S = false, V = void 0;
    this.u = function(y) {
      S ? V = y : y();
    };
    this.Rd = /* @__PURE__ */ function() {
      function y() {
        window.clearTimeout(B);
        S = true;
        B = setTimeout(function() {
          S = false;
          if (m()) {
            var J = !p();
            g(null, D.Y, w, J);
            P.defer(function() {
              ka.hj();
              V && (V(), V = void 0);
            });
          } else V && (V(), V = void 0);
        }, Math.max(
          C.vj,
          3 * q.bg.wd,
          3 * q.bg.vd
        ));
      }
      var B, D;
      return function(J) {
        tb(Q);
        D = d();
        var K = null !== D.fg, L = 0 < A.cc("hifi"), W = L && (K || !J);
        J = K || fa || !J;
        fa = false;
        L && !W && ka.ij();
        g(D.fg, D.gg, W ? w : k, J);
        Ra.za(U, function(Z) {
          Z.Z = false;
          Z.N = false;
          Z.Sa = false;
        });
        W || y();
        C.Gf(K);
      };
    }();
    this.m = function(y) {
      y = y || {};
      tb(Q);
      U.N = true;
      var B = d(), D = C.B;
      try {
        var J = P.H(y.pixelRatio, C.B);
        C.B = J;
        var K = A.hc("export", J, true), L = K.getContext("2d");
        k === x && (L = new xa(L));
        L.scale(J, J);
        var W = P.has(y, "backgroundColor");
        W && (L.save(), L.fillStyle = y.backgroundColor, L.fillRect(0, 0, O, H), L.restore());
        g(W ? [] : null, B.gg, L, true);
      } finally {
        C.B = D;
      }
      return K.toDataURL(P.H(y.format, "image/png"), P.H(y.quality, 0.8));
    };
    var ka = /* @__PURE__ */ function() {
      function y(J, K, L, W, Z, ha) {
        function ja(ma, sa, ua, va) {
          return Y.J.A({ opacity: A.cc(ma) }).ea({ duration: ua, R: { opacity: { end: sa, easing: va } }, ba: function() {
            A.cc(ma, this.opacity);
          } }).done();
        }
        var pa = P.sd(A.cc(J), K), oa = P.sd(A.cc(W), Z);
        if (!pa || !oa) {
          for (var da = D.length - 1; 0 <= da; da--) D[da].stop();
          D = [];
          pa || D.push(ja(J, K, L, La.Gb));
          oa || D.push(ja(W, Z, ha, La.Zf));
          return Y.J.A({}).Qa(D).start();
        }
      }
      var B, D = [];
      return { ij: function() {
        C.cd ? 1 !== n.style.opacity && (n.style.visibility = "visible", v.style.visibility = "hidden", n.style.opacity = 1, v.style.opacity = 0) : B && B.xb() || (B = y("wireframe", 1, C.ye, "hifi", 0, C.ye));
      }, hj: function() {
        C.cd ? (v.style.visibility = "visible", n.style.visibility = "hidden", n.style.opacity = 0, v.style.opacity = 1) : y("hifi", 1, C.jg, "wireframe", 0, C.jg);
      } };
    }();
    tb = function(y) {
      y.apply();
    };
    ob = function(y) {
      y.fill();
    };
    pb = function(y) {
      y.stroke();
    };
    return this;
  }
  var ob, pb, tb;
  function mb(a) {
    function q(c) {
      "undefined" !== typeof c.groupLabelFontFamily && (g.fontFamily = c.groupLabelFontFamily);
      "undefined" !== typeof c.groupLabelFontStyle && (g.fontStyle = c.groupLabelFontStyle);
      "undefined" !== typeof c.groupLabelFontVariant && (g.fontVariant = c.groupLabelFontVariant);
      "undefined" !== typeof c.groupLabelFontWeight && (g.fontWeight = c.groupLabelFontWeight);
      "undefined" !== typeof c.groupLabelLineHeight && (g.lineHeight = c.groupLabelLineHeight);
      "undefined" !== typeof c.groupLabelHorizontalPadding && (g.eb = c.groupLabelHorizontalPadding);
      "undefined" !== typeof c.groupLabelVerticalPadding && (g.Ua = c.groupLabelVerticalPadding);
      "undefined" !== typeof c.groupLabelMaxTotalHeight && (g.jb = c.groupLabelMaxTotalHeight);
      "undefined" !== typeof c.groupLabelMaxFontSize && (g.ib = c.groupLabelMaxFontSize);
    }
    var l = a.options, g = {}, e = {}, d, p = { groupLabel: "" }, m = {};
    a.i.subscribe("api:initialized", function(c) {
      d = c;
    });
    a.i.subscribe("options:changed", q);
    q(a.Gd);
    this.m = function(c) {
      if (!c.$) return false;
      var b = c.group.label;
      l.qh && !c.attribution && (p.labelText = b, d.tc(l.ph, c, p), b = p.labelText);
      c.$e = b;
      return c.ud !== b;
    };
    this.u = function(c) {
      var b = c.$e;
      c.ud = b;
      c.Hc.clear();
      c.na = void 0;
      if (c.$ && !P.Te(b) && ("flattened" !== l.nb || c.empty() || !c.O || !c.j[0].W)) {
        var h = ta, f = h.ke;
        if (l.wh) {
          m.fontFamily = g.fontFamily;
          m.fontStyle = g.fontStyle;
          m.fontVariant = g.fontVariant;
          m.fontWeight = g.fontWeight;
          m.lineHeight = g.lineHeight;
          m.horizontalPadding = g.eb;
          m.verticalPadding = g.Ua;
          m.maxTotalTextHeight = g.jb;
          m.maxFontSize = g.ib;
          d.tc(l.vh, c, m);
          e.fontFamily = m.fontFamily;
          e.fontStyle = m.fontStyle;
          e.fontVariant = m.fontVariant;
          e.fontWeight = m.fontWeight;
          e.lineHeight = m.lineHeight;
          e.eb = m.horizontalPadding;
          e.Ua = m.verticalPadding;
          e.jb = m.maxTotalTextHeight;
          e.ib = m.maxFontSize;
          var u = e;
        } else u = g;
        c.na = f.call(h, u, c.Hc, b, c.$, c.F, c.P, false, false, c.Yh, c.P.fa, l.zh, c.La);
      }
      c.La = false;
    };
    qb = this.L = function(c, b) {
      c.Hc.Ma(b);
    };
  }
  var qb;
  function nb(a) {
    function q(b, h) {
      var f = b.j, u = f.length, t, n = m.P.r;
      for (t = 0; t < u; t++) {
        var k = f[t];
        k.tb = (180 * (Math.atan2(k.x - b.x, k.y - b.y) + h) / Math.PI + 180) / 360;
        k.Cc = Math.min(1, Math.sqrt(wa.m(k, b)) / n);
      }
    }
    function l(b, h) {
      b = b.j;
      var f = b.length;
      if (1 === f || 2 === f && b[0].description) b[0].tb = 0.5;
      else {
        var u = 0, t = Number.MAX_VALUE, n = Math.sin(h), k = Math.cos(h);
        for (h = 0; h < f; h++) {
          var r = b[h];
          var x = r.x * n + r.y * k;
          u < x && (u = x);
          t > x && (t = x);
          r.tb = x;
          r.Cc = 1;
        }
        for (h = 0; h < f; h++) r = b[h], r.tb = (r.tb - t) / (u - t);
      }
    }
    function g(b, h, f, u) {
      h = h[u];
      return h + (f[u] - h) * b;
    }
    var e = { radial: q, linear: l }, d = a.options, p, m, c = { groupColor: null, labelColor: null };
    a.i.subscribe("model:loaded", function(b) {
      m = b;
    });
    a.i.subscribe("api:initialized", function(b) {
      p = b;
    });
    this.M = function() {
    };
    this.apply = function() {
      function b(z) {
        if (z.O && z.wa) {
          var F = z.j, E;
          if (z.Z || z.Ha || x) {
            0 === z.level ? u(z, d.Ji * Math.PI / 180) : t(z, d.Ni * Math.PI / 180);
            for (E = F.length - 1; 0 <= E; E--) {
              var G = F[E];
              G.Ha = true;
              var O = G.tb, H = G.Be;
              if (0 === z.level) {
                var A = g(O, n, k, "h");
                var M = (w + (1 - w) * G.Cc) * g(O, n, k, "s");
                var Q = (1 + (0 > G.ha ? v * (G.ha + 1) : v) * (1 - G.Cc)) * g(O, n, k, "l");
                var X = g(O, n, k, "a");
              } else Q = z.oa, A = Q.h, M = Q.s, Q = h(Q.l, O, d.Oi, d.Pi), X = z.Be.a;
              H.h = A;
              H.s = M;
              H.l = Q;
              H.a = X;
              A = G.oa;
              G.attribution ? (A.h = 0, A.s = 0, A.l = "light" == d.he ? 90 : 10, A.a = 1) : (A.h = H.h, A.s = H.s, A.l = H.l, A.a = H.a);
              x && !G.attribution && (c.groupColor = A, c.labelColor = "auto", p.tc(r, G, c, function(Y) {
                Y.ratio = O;
              }), G.oa = Ea.va(c.groupColor), G.oa.a = P.has(c.groupColor, "a") ? c.groupColor.a : 1, "auto" !== c.labelColor && (G.td = Ea.Ig(c.labelColor)));
            }
            z.Ha = false;
          }
          for (E = F.length - 1; 0 <= E; E--) b(F[E]);
        }
      }
      function h(z, F, E, G) {
        var O = f(z + E * G);
        z = f(z - E * (1 - G));
        return O + F * (z - O);
      }
      function f(z) {
        return 0 > z ? 0 : 100 < z ? 100 : z;
      }
      var u = e[d.Ii] || q, t = l, n = d.Si, k = d.Li, r = d.Ug, x = d.Vg, v = d.Mi, w = d.Qi;
      b(m);
    };
    return this;
  }
  ;
  function Za() {
    this.nc = this.be = this.kc = this.ag = this.w = this.ig = this.weight = this.y = this.x = this.id = 0;
    this.C = this.parent = this.j = null;
    this.F = { x: 0, y: 0, w: 0, o: 0 };
    this.I = null;
    this.ud = this.$e = void 0;
    this.Xc = false;
    this.Cc = this.tb = 0;
    this.Be = { h: 0, s: 0, l: 0, a: 0, model: "hsla" };
    this.oa = { h: 0, s: 0, l: 0, a: 0, model: "hsla" };
    this.Ce = { h: 0, s: 0, l: 0, model: "hsl" };
    this.md = -1;
    this.td = "auto";
    this.gb = "#000";
    this.Yf = this.level = this.rd = this.index = 0;
    this.attribution = false;
    this.fa = this.ef = 0;
    this.Y = false;
    this.$ = null;
    this.P = { x: 0, y: 0, fa: 0, r: 0 };
    this.Jd = this.G = null;
    this.Kc = this.W = this.Sa = this.uc = this.Zd = this.Hd = this.La = this.Ha = this.N = this.Z = this.Fa = this.wa = this.O = this.Da = false;
    this.saturation = this.ra = this.Ea = this.ca = this.opacity = this.scale = 1;
    this.qa = 0;
    this.Ld = 1;
    this.Cb = this.ha = this.yb = 0;
    this.description = this.selected = this.ub = this.Fd = this.open = this.T = false;
    this.sb = 0;
    this.Ze = this.Id = this.X = true;
    this.na = void 0;
    this.Ic = false;
    this.Hc = new ra();
    this.aa = new ra();
    this.Tb = new ra();
    this.Yh = ta.li();
    this.Jc = 0;
    this.dd = 1;
    this.Oc = -1;
    this.empty = function() {
      return !this.j || 0 === this.j.length;
    };
    var a = [];
    this.sc = function(e) {
      a.push(e);
    };
    this.Sc = function(e) {
      P.Of(a, e);
    };
    var q = { scale: 1 };
    this.zd = function() {
      var e = false;
      this.scale = 1;
      for (var d = 0; d < a.length; d++) e = a[d].af(this, q) || e, this.scale *= q.scale;
      return e;
    };
    this.Ib = function(e) {
      for (var d = 0; d < a.length; d++) a[d].Ib(this, e);
    };
    this.transformPoint = function(e, d) {
      d.x = e.x;
      d.y = e.y;
      for (e = 0; e < a.length; e++) a[e].transformPoint(this, d, d);
      return d;
    };
    this.Jb = function(e, d) {
      d.x = e.x;
      d.y = e.y;
      for (e = 0; e < a.length; e++) a[e].Jb(this, d, d);
      return d;
    };
    var l = [];
    this.qb = function(e) {
      l.push(e);
    };
    this.Rc = function(e) {
      P.Of(l, e);
    };
    var g = { opacity: 1, saturation: 1, ra: 1, ca: 1, Ea: 1 };
    this.fc = function() {
      if (0 !== l.length) {
        this.Ea = this.ca = this.ra = this.saturation = this.opacity = 1;
        for (var e = l.length - 1; 0 <= e; e--) (0, l[e])(this, g), this.opacity *= g.opacity, this.ra *= g.ra, this.saturation *= g.saturation, this.ca *= g.ca, this.Ea *= g.Ea;
      }
    };
  }
  function gb(a, q) {
    return q.weight > a.weight ? 1 : q.weight < a.weight ? -1 : a.index - q.index;
  }
  ;
  function ub(a) {
    var q = this, l, g, e, d, p = a.options, m, c;
    a.i.subscribe("stage:initialized", function(b, h, f, u) {
      e = f;
      d = u;
      l = b.hc("titlebar", p.B, false);
      g = l.getContext("2d");
      g.B = p.B;
      g.scale(g.B, g.B);
      a.i.D("titlebar:initialized", q);
    });
    a.i.subscribe("stage:resized", function(b, h, f, u) {
      e = f;
      d = u;
      g.scale(g.B, g.B);
    });
    a.i.subscribe("zoom:initialized", function(b) {
      c = b;
    });
    a.i.subscribe("api:initialized", function(b) {
      m = b;
    });
    a.i.subscribe("model:loaded", function() {
      g.clearRect(0, 0, e, d);
    });
    this.update = function(b) {
      g.clearRect(0, 0, e, d);
      if (b) {
        !b.empty() && b.j[0].description && (b = b.j[0]);
        var h = p.pj, f = p.oj, u = Math.min(d / 2, p.$d + 2 * h), t = u - 2 * h, n = e - 2 * f;
        if (!(0 >= t || 0 >= n)) {
          var k = b.Ic ? b.na.fontSize * b.scale * c.scale() : 0, r = { titleBarText: b.ud, titleBarTextColor: p.eg, titleBarBackgroundColor: p.dg, titleBarMaxFontSize: p.$d, titleBarShown: k < p.ei };
          if (b.attribution) var x = Pa.Vf("B`ssnu!Rd`sbi!Gn`lUsdd!whrt`mh{`uhno/!Busm,bmhbj!uid!mnfn!un!fn!un!iuuqr;..b`ssnurd`sbi/bnl.gn`lusdd!gns!lnsd!edu`hmr/");
          else m.tc(p.lj, b, r, function(v) {
            v.titleBarWidth = n;
            v.titleBarHeight = t;
            v.labelFontSize = k;
            v.viewportScale = c.scale();
          }), x = r.titleBarText;
          x && 0 !== x.length && r.titleBarShown && (b = c.Zc(b.transformPoint(b, {}), {}).y > d / 2, h = { x: f, y: b ? h : d - u + h, w: n, o: t }, f = wa.L(h), g.fillStyle = p.dg, g.fillRect(0, b ? 0 : d - u, e, u), g.fillStyle = p.eg, ta.xe({ fontFamily: p.mj || p.rh, fontStyle: p.Oj || p.sh, fontWeight: p.Qj || p.uh, fontVariant: p.Pj || p.th, ib: p.$d, Lc: p.nj, eb: 0, Ua: 0, jb: 1 }, g, x, f, h, { x: h.x + h.w / 2, y: h.y + h.o / 2 }, true, true).ia || g.clearRect(0, 0, e, d));
        }
      }
    };
  }
  ;
  function vb(a) {
    function q(v, w, z) {
      x = true;
      h && h.stop();
      u && u.stop();
      return p(c.reset(v), w, z).then(function() {
        x = false;
      });
    }
    function l(v) {
      c.update(v);
      k.N = true;
      a.i.D("foamtree:dirty", true);
    }
    function g(v, w) {
      return c.m((0 !== c.u() ? 0.35 : 1) * v, (0 !== c.L() ? 0.35 : 1) * w);
    }
    function e() {
      if (1 === b.ratio) {
        var v = Math.round(1e4 * c.u()) / 1e4;
        0 !== v && (f.Md = v, h = r.J.mc(f).ea({ duration: 500, R: { x: { start: v, end: 0, easing: La.Gb } }, ba: function() {
          c.m(f.x - f.Md, 0);
          l(1);
          f.Md = f.x;
        } }).start());
      }
    }
    function d() {
      if (1 === b.ratio) {
        var v = Math.round(1e4 * c.L()) / 1e4;
        0 !== v && (t.Nd = v, u = r.J.mc(t).ea({ duration: 500, R: { y: { start: v, end: 0, easing: La.Gb } }, ba: function() {
          c.m(0, t.y - t.Nd);
          l(1);
          t.Nd = t.y;
        } }).start());
      }
    }
    function p(v, w, z) {
      return v ? r.J.mc(b).ea({ duration: void 0 === w ? 700 : w, R: { ratio: { start: 0, end: 1, easing: z || La.$f } }, ba: function() {
        l(b.ratio);
      } }).Ta() : new Fa().resolve().promise();
    }
    function m(v) {
      return function() {
        return x ? new Fa().resolve().promise() : v.apply(this, arguments);
      };
    }
    var c = new Da(a), b = { ratio: 1 }, h, f = { dx: 0, x: 0, Md: 0 }, u, t = { dy: 0, y: 0, Nd: 0 }, n = this, k, r, x = false;
    a.i.subscribe(
      "model:loaded",
      function(v) {
        k = v;
        c.reset(false);
        c.update(1);
      }
    );
    a.i.subscribe("timeline:initialized", function(v) {
      r = v;
    });
    this.M = function() {
      a.i.D("zoom:initialized", this);
    };
    this.reset = function(v, w) {
      c.Fb(1);
      return q(true, v, w);
    };
    this.normalize = m(function(v, w) {
      c.vc(1) ? q(false, v, w) : n.ff();
    });
    this.ff = function() {
      e();
      d();
    };
    this.hg = m(function(v, w, z, F) {
      return n.lc(v.F, w, z, F);
    });
    this.Qb = m(function(v, w, z, F) {
      return p(c.Qb(v, w), z, F);
    });
    this.lc = m(function(v, w, z, F) {
      return p(c.lc(v, w), z, F);
    });
    this.qj = m(function(v, w) {
      c.lc(v, w) && l(1);
    });
    this.gi = m(function(v, w) {
      1 === b.ratio && g(v, w) && l(1);
    });
    this.yg = m(function(v, w) {
      c.Qb(v, w) && l(1);
    });
    this.xg = m(function(v, w, z, F) {
      v = 0 | c.Qb(v, w);
      (v |= g(z, F)) && l(1);
    });
    this.hi = m(function(v, w, z) {
      1 === b.ratio && (h = r.J.mc(f).ea({ duration: v / 0.03, R: { dx: { start: w, end: 0, easing: La.Gb } }, ba: function() {
        c.m(f.dx, 0) && l(1);
        e();
      } }).start(), u = r.J.mc(t).ea({ duration: v / 0.03, R: { dy: { start: z, end: 0, easing: La.Gb } }, ba: function() {
        g(0, t.dy) && l(1);
        d();
      } }).start());
    });
    this.ii = function() {
      h && 0 === c.u() && h.stop();
      u && 0 === c.L() && u.stop();
    };
    this.xc = function(v, w) {
      c.xc(v, w);
    };
    this.Fb = function(v) {
      return c.Fb(v);
    };
    this.vc = function(v) {
      return c.vc(v);
    };
    this.Dd = function() {
      return c.Dd();
    };
    this.absolute = function(v, w) {
      return c.absolute(v, w);
    };
    this.Zc = function(v, w) {
      return c.Zc(v, w);
    };
    this.scale = function() {
      return c.scale();
    };
    this.m = function(v) {
      return c.U(v);
    };
    this.content = function(v, w, z, F) {
      c.content(v, w, z, F);
    };
  }
  ;
  function wb(a, q, l) {
    function g(I) {
      var T = [];
      Ra.K(u, function(S) {
        I(S) && T.push(S.group);
      });
      return { groups: T };
    }
    function e(I, T) {
      var S = f.options, V = S.$i, ka = S.Zi;
      S = S.Sd;
      var y = 0 < V + ka ? S : 0, B = [];
      Va.xa(I, Va.sa(I, f.options.Ud), function(D, J, K) {
        J = "groups" === f.options.Td ? K : J;
        D.j && (D = n.J.A(D).wait(y * (ka + V * J)).call(T).done(), B.push(D));
      });
      return n.J.A({}).Qa(B).Ta();
    }
    function d(I) {
      ca || (ca = true, t.once(function() {
        ca = false;
        f.i.D("repaint:before");
        F.Rd(this.wg);
      }, { wg: I }));
    }
    function p(I) {
      function T(B, D) {
        var J = B.W;
        B.W = D <= S;
        B.Kc = D <= V;
        B.W !== J && Ra.se(B, function(K) {
          K.Zd = true;
        });
        B.open || B.Va || D++;
        if (B = B.j) for (J = 0; J < B.length; J++) T(B[J], D);
      }
      var S = f.options.bf, V = Math.min(f.options.bf, f.options.bi);
      if (I) for (var ka = 0; ka < I.length; ka++) {
        var y = I[ka];
        T(y, b(y));
      }
      else T(u, 0);
    }
    function m(I, T) {
      var S = [];
      I = c(I, T);
      I.fi && f.i.D("model:childrenAttached", Ra.Ac(u));
      I.Ti && z.complete(function(ka) {
        N.fb(ka);
        S.push(ka);
      });
      for (T = I = 0; T < S.length; T++) {
        var V = S[T];
        V.j && (I += V.j.length);
        V.wa = true;
        O.m(V);
      }
      return I;
    }
    function c(I, T) {
      function S(J, K) {
        var L = !J.attribution && K - (J.Va ? 1 : 0) < V;
        y = y || L;
        J.Da = J.Da || L;
        J.open || J.Va || K++;
        var W = J.j;
        !W && L && (ka = w.U(J) || ka, W = J.j, D && (J.La = true));
        if (W) for (J = 0; J < W.length; J++) B.push(W[J], K);
      }
      var V = T || f.options.ci, ka = false, y = false, B, D = "flattened" === q.nb;
      for (I ? B = I.reduce(function(J, K) {
        J.push(K, 1);
        return J;
      }, []) : B = [u, 1]; 0 < B.length; ) S(B.shift(), B.shift());
      return { fi: ka, Ti: y };
    }
    function b(I) {
      for (var T = 0; I.parent; ) I.open || I.Va || T++, I = I.parent;
      return T;
    }
    var h = this, f = { i: new Oa(), options: q, Gd: l }, u, t = new na(), n = new Qa(t), k = la.create(), r = new Ba(f), x = new vb(f), v = new Xa(f), w = new Ya(f.options), z = new hb(f), F = new lb(f, t), E = new eb(f);
    new ub(f);
    var G = new ab(f), O = new bb(f), H = new cb(f), A = new db(f);
    f.i.subscribe("stage:initialized", function(I, T, S, V) {
      C.Re(S, V);
    });
    f.i.subscribe("stage:resized", function(I, T, S, V) {
      C.Xi(I, T, S, V);
    });
    f.i.subscribe("foamtree:attachChildren", m);
    f.i.subscribe("openclose:changing", p);
    f.i.subscribe("interaction:reset", function() {
      R(true);
    });
    f.i.subscribe("foamtree:dirty", d);
    this.M = function() {
      f.i.D("timeline:initialized", n);
      u = w.M();
      r.M(a);
      v.M();
      F.M();
      E.M();
      G.M();
      O.M();
      x.M();
      H.M();
      A.M();
    };
    this.$a = function() {
      n.m();
      ia.stop();
      t.m();
      r.$a();
    };
    var M = "groupLabelFontFamily groupLabelFontStyle groupLabelFontVariant groupLabelFontWeight groupLabelLineHeight groupLabelHorizontalPadding groupLabelVerticalPadding groupLabelDottingThreshold groupLabelMaxTotalHeight groupLabelMinFontSize groupLabelMaxFontSize groupLabelDecorator".split(" "), Q = "rainbowColorDistribution rainbowLightnessDistribution rainbowColorDistributionAngle rainbowLightnessDistributionAngle rainbowColorModelStartPoint rainbowLightnessCorrection rainbowSaturationCorrection rainbowStartColor rainbowEndColor rainbowHueShift rainbowHueShiftCenter rainbowSaturationShift rainbowSaturationShiftCenter rainbowLightnessShift rainbowLightnessShiftCenter attributionTheme".split(" "), X = false, Y = ["groupBorderRadius", "groupBorderRadiusCorrection", "groupBorderWidth", "groupInsetWidth", "groupBorderWidthScaling"], aa = ["maxGroupLevelsDrawn", "maxGroupLabelLevelsDrawn"];
    this.Nb = function(I) {
      f.i.D("options:changed", I);
      P.cb(I, M) && Ra.K(u, function(T) {
        T.La = true;
      });
      P.cb(I, Q) && (u.Ha = true);
      P.cb(I, Y) && (X = true);
      P.cb(I, aa) && (p(), m());
    };
    this.reload = function() {
      U.reload();
    };
    this.Ob = function(I, T) {
      P.defer(function() {
        if (X) C.Zh(I), X = false;
        else {
          if (T) for (var S = w.u(T), V = S.length - 1; 0 <= V; V--) S[V].N = true;
          else u.N = true;
          d(I);
        }
      });
    };
    this.ja = function() {
      r.u();
    };
    this.update = function(I) {
      I = I ? w.u(I) : [u];
      var T = I.reduce(function(S, V) {
        S[V.id] = V;
        return S;
      }, {});
      I = I.filter(function(S) {
        for (S = S.parent; S; ) {
          if (P.has(T, S.id)) return false;
          S = S.parent;
        }
        return true;
      });
      w.update(I);
      C.rj(I);
    };
    this.reset = function() {
      return R(false);
    };
    this.U = F.m;
    this.xa = /* @__PURE__ */ function() {
      var I = {};
      return function(T, S) {
        return (T = w.m(T)) ? v.$c(I, T, S) : null;
      };
    }();
    this.va = /* @__PURE__ */ function() {
      var I = { x: 0, y: 0 }, T = { x: 0, y: 0 };
      return function(S, V) {
        return (S = w.m(S)) ? (I.x = V.x, I.y = V.y, S.transformPoint(I, I), x.Zc(I, I), T.x = I.x, T.y = I.y, T) : null;
      };
    }();
    this.sa = /* @__PURE__ */ function() {
      var I = {};
      return function(T) {
        return (T = w.m(T)) ? v.bd(I, T) : null;
      };
    }();
    this.Mb = /* @__PURE__ */ function() {
      var I = {};
      return function(T) {
        return (T = w.m(T)) ? v.ad(I, T) : null;
      };
    }();
    this.ta = /* @__PURE__ */ function() {
      var I = {};
      return function() {
        return x.m(I);
      };
    }();
    this.pc = function() {
      this.L({ groups: g(function(I) {
        return I.group.selected;
      }), newState: true, keepPrevious: false });
      this.u({ groups: g(function(I) {
        return I.group.open;
      }), newState: true, keepPrevious: false });
      this.m({ groups: g(function(I) {
        return I.group.exposed;
      }), newState: true, keepPrevious: false });
    };
    this.Ga = function() {
      return g(function(I) {
        return I.T;
      });
    };
    this.m = function(I) {
      return U.submit(function() {
        return G.Yb(w.L(I, "exposed", false), false, true, false);
      });
    };
    this.Na = function() {
      return g(function(I) {
        return I.open;
      });
    };
    this.u = function(I) {
      return U.submit(function() {
        return H.Bb(w.L(I, "open", true), false, false);
      });
    };
    this.Wa = function() {
      return g(function(I) {
        return I.selected;
      });
    };
    this.L = function(I) {
      return U.submit(function() {
        A.select(w.L(I, "selected", true), false);
        return new Fa().resolve().promise();
      });
    };
    this.rc = function(I) {
      return (I = w.m(I)) ? I === u ? x.reset(q.pb, La.ga(q.Kb)) : x.hg(I, q.ac, q.pb, La.ga(q.Kb)) : new Fa().resolve().promise();
    };
    this.ua = function(I, T) {
      return (I = w.u(I)) ? (T = m(I, T), p(I), T) : 0;
    };
    this.Lb = function(I) {
      return E.Wa[I];
    };
    this.qc = function() {
      var I = qa;
      return { frames: I.frames, totalTime: I.totalTime, lastFrameTime: I.vd, lastInterFrameTime: I.wd, fps: I.Ae };
    };
    var C = /* @__PURE__ */ function() {
      function I(B, D) {
        var J = B || ka, K = D || y;
        ka = J;
        y = K;
        (B = q.Ub && q.Ub.boundary) && 2 < B.length ? u.C = B.map(function(L) {
          return { x: J * L.x, y: K * L.y };
        }) : u.C = [{ x: 0, y: 0 }, { x: J, y: 0 }, { x: J, y: K }, { x: 0, y: K }];
        T();
      }
      function T() {
        u.Z = true;
        u.G = u.C;
        u.F = wa.F(u.C, u.F);
        u.P = u;
        wa.ce(u.C, u.P);
      }
      function S(B, D, J, K) {
        N.stop();
        var L = J / B, W = K / D;
        Ra.te(u, function(Z) {
          Z.x = Z.x * L + (Math.random() - 0.5) * J / 1e3;
          Z.y = Z.y * W + (Math.random() - 0.5) * K / 1e3;
        });
        I(J, K);
        u.Fa = true;
        z.step(N.fb, true, false, function(Z) {
          var ha = Z.j;
          if (ha) {
            z.Eb(Z);
            for (var ja = ha.length - 1; 0 <= ja; ja--) {
              var pa = ha[ja];
              pa.w = pa.kc;
            }
            Z.Fa = true;
          }
        }) ? d(false) : V();
      }
      function V() {
        z.jc(u);
        f.options.Qd ? (d(false), ia.Pf(), ia.Tc()) : (z.complete(N.fb), u.Ha = true, d(false));
      }
      var ka, y;
      return { Re: I, Xi: function(B, D, J, K) {
        switch (q.Yi) {
          case "initialize":
            N.stop();
            I(J, K);
            u.empty() || (u.O = false, u.Da = true, V());
            break;
          default:
          case "morph":
            S(B, D, J, K);
        }
      }, Zh: function(B) {
        var D = false;
        u.empty() || (T(), ia.xb() || (D = z.step(N.fb, false, false), d(B)));
        return D;
      }, rj: function(B) {
        B.forEach(function(D) {
          Ra.za(D, function(J) {
            J.empty() || z.Eb(J);
          });
          z.jc(D);
          f.options.Qd ? (ia.Pf(), Ra.za(D, function(J) {
            J.empty() || N.grow(J);
          })) : (Ra.za(D, function(J) {
            J.empty() || N.fb(J);
          }), z.complete(N.fb), D.Ha = true, d(false));
        });
      } };
    }(), U = /* @__PURE__ */ function() {
      function I() {
        0 === q.Kd && x.reset(0);
        f.options.Ff(q.Ub);
        C.Re();
        w.load(q.Ub);
        c();
        p();
        f.i.D(
          "model:loaded",
          u,
          Ra.Ac(u)
        );
        if (!u.empty()) {
          u.open = true;
          u.Da = true;
          if (q.Qd) var D = ia.Tc();
          else ia.ki(), D = V();
          T();
          0 < q.Sd ? (F.clear(), r.m(1)) : D = Ga([D, S(1)]);
        }
        f.options.Ef(q.Ub);
        D && (f.options.If(), D.then(function() {
          F.u(function() {
            t.once(f.options.Hf);
          });
        }));
      }
      function T() {
        var D = q.Oa, J = q.Pc;
        q.Oa = 0;
        q.Pc = 0;
        h.pc();
        q.Oa = D;
        q.Pc = J;
      }
      function S(D, J) {
        return 0 === q.we || J ? (r.m(D), new Fa().resolve().promise()) : n.J.A({ opacity: r.m() }).ae(2).ea({ duration: q.we, R: { opacity: { end: D, easing: La.ga(q.Ng) } }, ba: function() {
          r.m(this.opacity);
        } }).Ta();
      }
      function V() {
        Ra.za(
          u,
          function(K) {
            K.wa = false;
          }
        );
        var D = new Fa(), J = new Ha(D.resolve);
        J.m();
        u.wa = true;
        O.m(u).then(J.u);
        e(u, function L() {
          this.O && this.C && (this.Z = this.wa = true, J.m(), O.m(this).then(J.u), J.m(), e(this, L).then(J.u));
        });
        return D.promise();
      }
      function ka() {
        for (var D = 0; D < B.length; D++) {
          var J = B[D], K = J.action();
          P.has(K, "then") ? K.then(J.ne.resolve) : J.ne.resolve();
        }
        B = [];
      }
      var y = false, B = [];
      return {
        reload: function() {
          y || (u.empty() ? I() : (N.stop(), n.m(), ia.stop(), y = true, Ga(0 < q.Kd ? [O.u(), R(false)] : [S(0)]).then(function() {
            S(0, true);
            y = false;
            I();
            P.defer(ka);
          })));
        },
        submit: function(D) {
          if (y) {
            var J = new Fa();
            B.push({ action: D, ne: J });
            return J.promise();
          }
          return D();
        }
      };
    }(), fa, ba = new Ha(function() {
      fa.resolve();
    }), ia = /* @__PURE__ */ function() {
      function I() {
        V || (ba.initial() && (fa = new Fa()), ba.m(), T(), V = true, t.repeat(S));
        return fa.promise();
      }
      function T() {
        ka = k.now();
      }
      function S() {
        var y = k.now() - ka > q.Wi;
        y = z.step(function(B) {
          B.wa = true;
          N.grow(B);
          ba.m();
          O.m(B).then(ba.u);
          ba.m();
          e(B, function() {
            this.Da = true;
            I();
          }).then(ba.u);
        }, true, y) || y;
        d(true);
        y && (V = false, ba.u());
        return y;
      }
      var V = false, ka;
      return {
        ki: function() {
          z.complete(N.fb);
        },
        Tc: I,
        Pf: T,
        xb: function() {
          return !ba.initial();
        },
        stop: function() {
          t.cancel(S);
          V = false;
          ba.clear();
        }
      };
    }(), N = /* @__PURE__ */ function() {
      function I(S) {
        var V = !S.empty();
        S.wa = true;
        if (V) {
          for (var ka = S.j, y = ka.length - 1; 0 <= y; y--) {
            var B = ka[y];
            B.w = B.kc;
          }
          S.Fa = true;
        }
        return V;
      }
      var T = [];
      return { grow: function(S) {
        var V = f.options, ka = V.ih;
        0 < ka ? Va.xa(S, Va.sa(S, f.options.Ud), function(y, B, D) {
          B = "groups" === f.options.Td ? D : B;
          ba.m();
          T.push(n.J.A(y).wait(B * V.hh * ka).ea({ duration: ka, R: { w: { start: y.ag, end: y.kc, easing: La.ga(V.jh) } }, ba: function() {
            this.w = Math.max(
              0,
              this.w
            );
            this.parent.Fa = true;
            ia.Tc();
          } }).Ya(ba.u).start());
        }) : I(S) && ia.Tc();
      }, fb: I, stop: function() {
        for (var S = T.length - 1; 0 <= S; S--) T[S].stop();
        T = [];
      } };
    }(), R = /* @__PURE__ */ function() {
      var I = false;
      return function(T) {
        if (I) return new Fa().resolve().promise();
        I = true;
        var S = [];
        S.push(x.reset(q.pb, La.ga(q.Kb)));
        var V = new Fa();
        G.Yb({ j: [], Ca: false, Ba: false }, T, false, true).then(function() {
          H.Bb({ j: [], Ca: false, Ba: false }, T, false).then(V.resolve);
        });
        S.push(V.promise());
        return Ga(S).then(function() {
          I = false;
          T && q.Jf();
        });
      };
    }(), ca = false;
  }
  function sb() {
    return { version: "3.5.3-SNAPSHOT", build: "bugfix/3.5.x/465f4e7b", brandingAllowed: false };
  }
  ;
  ea.qd(function() {
    window.CarrotSearchFoamTree = function(a) {
      function q(u, t) {
        if (!m || m.exists(u)) switch (u) {
          case "selection":
            return h.Wa();
          case "open":
            return h.Na();
          case "exposure":
            return h.Ga();
          case "state":
            return h.sa.apply(this, t);
          case "geometry":
            return h.xa.apply(this, t);
          case "hierarchy":
            return h.Mb.apply(this, t);
          case "containerCoordinates":
            return h.va.apply(this, t);
          case "imageData":
            return h.U.apply(this, t);
          case "viewport":
            return h.ta();
          case "times":
            return h.qc();
          case "onModelChanged":
          case "onRedraw":
          case "onRolloutStart":
          case "onRolloutComplete":
          case "onRelaxationStep":
          case "onGroupHover":
          case "onGroupOpenOrCloseChanging":
          case "onGroupExposureChanging":
          case "onGroupSelectionChanging":
          case "onGroupSelectionChanged":
          case "onGroupClick":
          case "onGroupDoubleClick":
          case "onGroupHold":
            return u = c[u], Array.isArray(u) ? u : [u];
          default:
            return c[u];
        }
      }
      function l(u) {
        function t(x, v) {
          return P.has(n, x) ? (v(n[x]), delete n[x], 1) : 0;
        }
        if (0 === arguments.length) return 0;
        if (1 === arguments.length) var n = P.extend({}, arguments[0]);
        else 2 === arguments.length && (n = {}, n[arguments[0]] = arguments[1]);
        m && m.validate(n, b.$h);
        var k = 0;
        h && (k += t("selection", h.L), k += t("open", h.u), k += t("exposure", h.m));
        var r = {};
        P.Aa(n, function(x, v) {
          if (c[v] !== x || P.wb(x)) r[v] = x, k++;
          c[v] = x;
        });
        0 < k && e(r);
        return k;
      }
      function g(u, t) {
        u = "on" + u.charAt(0).toUpperCase() + u.slice(1);
        var n = c[u];
        c[u] = t(Array.isArray(n) ? n : [n]);
        t = {};
        t[u] = c[u];
        e(t);
      }
      function e(u) {
        (function() {
          function t(n, k) {
            return P.has(u, n) || void 0 === k ? Na.A(c[n], p) : k;
          }
          b.$h = c.logging;
          b.Ub = c.dataObject;
          b.B = c.pixelRatio;
          b.ob = c.wireframePixelRatio;
          b.nb = c.stacking;
          b.Kg = c.descriptionGroup;
          b.Wb = c.descriptionGroupType;
          b.wc = c.descriptionGroupPosition;
          b.Lg = c.descriptionGroupDistanceFromCenter;
          b.Vb = c.descriptionGroupSize;
          b.pe = c.descriptionGroupMinHeight;
          b.oe = c.descriptionGroupMaxHeight;
          b.qe = c.descriptionGroupPolygonDrawn;
          b.layout = c.layout;
          b.dc = c.layoutByWeightOrder;
          b.jj = c.showZeroWeightGroups;
          b.He = c.groupMinDiameter;
          b.Pd = c.rectangleAspectRatioPreference;
          b.Vi = c.initializer || c.relaxationInitializer;
          b.Wi = c.relaxationMaxDuration;
          b.Qd = c.relaxationVisible;
          b.Nf = c.relaxationQualityThreshold;
          b.Yi = c.resizeTransform;
          b.Ah = c.groupResizingBudget;
          b.ih = c.groupGrowingDuration;
          b.hh = c.groupGrowingDrag;
          b.jh = c.groupGrowingEasing;
          b.Sg = c.groupBorderRadius;
          b.ab = c.groupBorderWidth;
          b.Ka = c.groupBorderWidthScaling;
          b.nd = c.groupInsetWidth;
          b.Tg = c.groupBorderRadiusCorrection;
          b.bb = c.groupStrokeWidth;
          b.Ec = c.groupSelectionOutlineWidth;
          b.Eh = c.groupSelectionOutlineColor;
          b.od = c.groupSelectionOutlineShadowSize;
          b.Ie = c.groupSelectionOutlineShadowColor;
          b.Bh = c.groupSelectionFillHueShift;
          b.Dh = c.groupSelectionFillSaturationShift;
          b.Ch = c.groupSelectionFillLightnessShift;
          b.Ke = c.groupSelectionStrokeHueShift;
          b.Me = c.groupSelectionStrokeSaturationShift;
          b.Le = c.groupSelectionStrokeLightnessShift;
          b.gh = c.groupFillType;
          b.bh = c.groupFillGradientRadius;
          b.Zg = c.groupFillGradientCenterHueShift;
          b.ah = c.groupFillGradientCenterSaturationShift;
          b.$g = c.groupFillGradientCenterLightnessShift;
          b.dh = c.groupFillGradientRimHueShift;
          b.fh = c.groupFillGradientRimSaturationShift;
          b.eh = c.groupFillGradientRimLightnessShift;
          b.pd = c.groupStrokeType;
          b.bb = c.groupStrokeWidth;
          b.Ne = c.groupStrokePlainHueShift;
          b.Pe = c.groupStrokePlainSaturationShift;
          b.Oe = c.groupStrokePlainLightnessShift;
          b.Jh = c.groupStrokeGradientRadius;
          b.Fh = c.groupStrokeGradientAngle;
          b.Kh = c.groupStrokeGradientUpperHueShift;
          b.Mh = c.groupStrokeGradientUpperSaturationShift;
          b.Lh = c.groupStrokeGradientUpperLightnessShift;
          b.Gh = c.groupStrokeGradientLowerHueShift;
          b.Ih = c.groupStrokeGradientLowerSaturationShift;
          b.Hh = c.groupStrokeGradientLowerLightnessShift;
          b.kh = c.groupHoverFillHueShift;
          b.mh = c.groupHoverFillSaturationShift;
          b.lh = c.groupHoverFillLightnessShift;
          b.Ee = c.groupHoverStrokeHueShift;
          b.Ge = c.groupHoverStrokeSaturationShift;
          b.Fe = c.groupHoverStrokeLightnessShift;
          b.Pa = c.groupExposureScale;
          b.Yg = c.groupExposureShadowColor;
          b.De = c.groupExposureShadowSize;
          b.ac = c.groupExposureZoomMargin;
          b.Oh = c.groupUnexposureLightnessShift;
          b.Ph = c.groupUnexposureSaturationShift;
          b.Nh = c.groupUnexposureLabelColorThreshold;
          b.Oa = c.exposeDuration;
          b.Zb = c.exposeEasing;
          b.Pc = c.openCloseDuration;
          b.Ug = Na.A(c.groupColorDecorator, p);
          b.Vg = c.groupColorDecorator !== P.pa;
          b.ph = Na.A(c.groupLabelDecorator, p);
          b.qh = c.groupLabelDecorator !== P.pa;
          b.vh = Na.A(c.groupLabelLayoutDecorator, p);
          b.wh = c.groupLabelLayoutDecorator !== P.pa;
          b.Wg = Na.A(c.groupContentDecorator, p);
          b.Dc = c.groupContentDecorator !== P.pa;
          b.Xg = c.groupContentDecoratorTriggering;
          b.Ri = c.rainbowStartColor;
          b.Ki = c.rainbowEndColor;
          b.Ii = c.rainbowColorDistribution;
          b.Ji = c.rainbowColorDistributionAngle;
          b.Ni = c.rainbowLightnessDistributionAngle;
          b.Oi = c.rainbowLightnessShift;
          b.Pi = c.rainbowLightnessShiftCenter;
          b.Qi = c.rainbowSaturationCorrection;
          b.Mi = c.rainbowLightnessCorrection;
          b.Kf = c.parentFillOpacity;
          b.ji = c.parentStrokeOpacity;
          b.Lf = c.parentLabelOpacity;
          b.Mf = c.parentOpacityBalancing;
          b.zh = c.groupLabelUpdateThreshold;
          b.rh = c.groupLabelFontFamily;
          b.sh = c.groupLabelFontStyle;
          b.th = c.groupLabelFontVariant;
          b.uh = c.groupLabelFontWeight;
          b.yh = c.groupLabelMinFontSize;
          b.Gj = c.groupLabelMaxFontSize;
          b.Fj = c.groupLabelLineHeight;
          b.Ej = c.groupLabelHorizontalPadding;
          b.Ij = c.groupLabelVerticalPadding;
          b.Hj = c.groupLabelMaxTotalHeight;
          b.oh = c.groupLabelDarkColor;
          b.xh = c.groupLabelLightColor;
          b.nh = c.groupLabelColorThreshold;
          b.tj = c.wireframeDrawMaxDuration;
          b.uj = c.wireframeLabelDrawing;
          b.sj = c.wireframeContentDecorationDrawing;
          b.jg = c.wireframeToFinalFadeDuration;
          b.vj = c.wireframeToFinalFadeDelay;
          b.Og = c.finalCompleteDrawMaxDuration;
          b.Pg = c.finalIncrementalDrawMaxDuration;
          b.ye = c.finalToWireframeFadeDuration;
          b.cd = c.androidStockBrowserWorkaround;
          b.Qe = c.incrementalDraw;
          b.di = c.maxGroups;
          b.ci = c.maxGroupLevelsAttached;
          b.bf = c.maxGroupLevelsDrawn;
          b.bi = c.maxGroupLabelLevelsDrawn;
          b.Ud = c.rolloutStartPoint;
          b.Td = c.rolloutMethod;
          b.aj = c.rolloutEasing;
          b.Sd = c.rolloutDuration;
          b.Rf = c.rolloutScalingStrength;
          b.Tf = c.rolloutTranslationXStrength;
          b.Uf = c.rolloutTranslationYStrength;
          b.Qf = c.rolloutRotationStrength;
          b.Sf = c.rolloutTransformationCenter;
          b.ej = c.rolloutPolygonDrag;
          b.fj = c.rolloutPolygonDuration;
          b.bj = c.rolloutLabelDelay;
          b.cj = c.rolloutLabelDrag;
          b.dj = c.rolloutLabelDuration;
          b.$i = c.rolloutChildGroupsDrag;
          b.Zi = c.rolloutChildGroupsDelay;
          b.Bi = c.pullbackStartPoint;
          b.vi = c.pullbackMethod;
          b.ri = c.pullbackEasing;
          b.Mj = c.pullbackType;
          b.Kd = c.pullbackDuration;
          b.Ai = c.pullbackScalingStrength;
          b.Di = c.pullbackTranslationXStrength;
          b.Ei = c.pullbackTranslationYStrength;
          b.zi = c.pullbackRotationStrength;
          b.Ci = c.pullbackTransformationCenter;
          b.wi = c.pullbackPolygonDelay;
          b.xi = c.pullbackPolygonDrag;
          b.yi = c.pullbackPolygonDuration;
          b.si = c.pullbackLabelDelay;
          b.ti = c.pullbackLabelDrag;
          b.ui = c.pullbackLabelDuration;
          b.ni = c.pullbackChildGroupsDelay;
          b.oi = c.pullbackChildGroupsDrag;
          b.pi = c.pullbackChildGroupsDuration;
          b.we = c.fadeDuration;
          b.Ng = c.fadeEasing;
          b.wj = c.zoomMouseWheelFactor;
          b.pb = c.zoomMouseWheelDuration;
          b.Kb = c.zoomMouseWheelEasing;
          b.ei = c.maxLabelSizeForTitleBar;
          b.mj = c.titleBarFontFamily;
          b.dg = c.titleBarBackgroundColor;
          b.eg = c.titleBarTextColor;
          b.nj = c.titleBarMinFontSize;
          b.$d = c.titleBarMaxFontSize;
          b.oj = c.titleBarTextPaddingLeftRight;
          b.pj = c.titleBarTextPaddingTopBottom;
          b.lj = c.titleBarDecorator;
          b.Aj = c.attributionText;
          b.xj = c.attributionLogo;
          b.zj = c.attributionLogoScale;
          b.Bj = c.attributionUrl;
          b.ge = c.attributionPosition;
          b.zg = c.attributionDistanceFromCenter;
          b.Ag = c.attributionWeight;
          b.he = c.attributionTheme;
          b.Se = c.interactionHandler;
          b.Ff = t("onModelChanging", b.Ff);
          b.Ef = t("onModelChanged", b.Ef);
          b.Gf = t("onRedraw", b.Gf);
          b.If = t("onRolloutStart", b.If);
          b.Hf = t("onRolloutComplete", b.Hf);
          b.Ed = t("onRelaxationStep", b.Ed);
          b.Jf = t("onViewReset", b.Jf);
          b.xf = t("onGroupOpenOrCloseChanging", b.xf);
          b.wf = t("onGroupOpenOrCloseChanged", b.wf);
          b.pf = t("onGroupExposureChanging", b.pf);
          b.nf = t("onGroupExposureChanged", b.nf);
          b.zf = t("onGroupSelectionChanging", b.zf);
          b.yf = t("onGroupSelectionChanged", b.yf);
          b.rf = t("onGroupHover", b.rf);
          b.tf = t("onGroupMouseMove", b.tf);
          b.hf = t("onGroupClick", b.hf);
          b.jf = t("onGroupDoubleClick", b.jf);
          b.qf = t("onGroupHold", b.qf);
          b.vf = t("onGroupMouseWheel", b.vf);
          b.uf = t(
            "onGroupMouseUp",
            b.uf
          );
          b.sf = t("onGroupMouseDown", b.sf);
          b.mf = t("onGroupDragStart", b.mf);
          b.kf = t("onGroupDrag", b.kf);
          b.lf = t("onGroupDragEnd", b.lf);
          b.Cf = t("onGroupTransformStart", b.Cf);
          b.Af = t("onGroupTransform", b.Af);
          b.Bf = t("onGroupTransformEnd", b.Bf);
          b.Df = t("onKeyUp", b.Df);
        })();
        b.Si = Ea.va(b.Ri);
        b.Li = Ea.va(b.Ki);
        b.Je = Ea.va(b.Ie);
        b.yj = null;
        h && (h.Nb(u), P.has(u, "dataObject") && h.reload());
      }
      function d(u) {
        return function() {
          return u.apply(this, arguments).Qg(p);
        };
      }
      var p = this, m = window.CarrotSearchFoamTree.asserts, c = P.extend({}, window.CarrotSearchFoamTree.defaults), b = {};
      l(a);
      (a = c.element || document.getElementById(c.id)) || Ca.Ga("Element to embed FoamTree in not found.");
      c.element = a;
      var h = new wb(a, b, c);
      h.M();
      var f = {
        get: function(u) {
          return 0 === arguments.length ? P.extend({}, c) : q(arguments[0], Array.prototype.slice.call(arguments, 1));
        },
        set: l,
        on: function(u, t) {
          g(u, function(n) {
            n.push(t);
            return n;
          });
        },
        off: function(u, t) {
          g(u, function(n) {
            return n.filter(function(k) {
              return k !== t;
            });
          });
        },
        resize: h.ja,
        redraw: h.Ob,
        update: h.update,
        attach: h.ua,
        select: d(h.L),
        expose: d(h.m),
        open: d(h.u),
        reset: d(h.reset),
        zoom: d(h.rc),
        trigger: function(u, t) {
          (u = h.Lb(u)) && u(t);
        },
        dispose: function() {
          function u() {
            throw "FoamTree instance disposed";
          }
          h.$a();
          P.Aa(f, function(t, n) {
            "dispose" !== n && (p[n] = u);
          });
        }
      };
      P.Aa(f, function(u, t) {
        p[t] = u;
      });
      h.reload();
    };
    window["CarrotSearchFoamTree.asserts"] && (window.CarrotSearchFoamTree.asserts = window["CarrotSearchFoamTree.asserts"], delete window["CarrotSearchFoamTree.asserts"]);
    window.CarrotSearchFoamTree.supported = true;
    window.CarrotSearchFoamTree.version = sb;
    window.CarrotSearchFoamTree.defaults = Object.freeze({
      id: void 0,
      element: void 0,
      logging: false,
      dataObject: void 0,
      pixelRatio: 1,
      wireframePixelRatio: 1,
      layout: "relaxed",
      layoutByWeightOrder: true,
      showZeroWeightGroups: true,
      groupMinDiameter: 10,
      rectangleAspectRatioPreference: -1,
      relaxationInitializer: "fisheye",
      relaxationMaxDuration: 3e3,
      relaxationVisible: false,
      relaxationQualityThreshold: 1,
      resizeTransform: "morph",
      stacking: "hierarchical",
      descriptionGroup: "auto",
      descriptionGroupType: "stab",
      descriptionGroupPosition: 225,
      descriptionGroupDistanceFromCenter: 1,
      descriptionGroupSize: 0.125,
      descriptionGroupMinHeight: 35,
      descriptionGroupMaxHeight: 0.5,
      descriptionGroupPolygonDrawn: false,
      maxGroups: 5e4,
      maxGroupLevelsAttached: 4,
      maxGroupLevelsDrawn: 4,
      maxGroupLabelLevelsDrawn: 3,
      groupGrowingDuration: 0,
      groupGrowingEasing: "bounce",
      groupGrowingDrag: 0,
      groupResizingBudget: 2,
      groupBorderRadius: 0.15,
      groupBorderWidth: 4,
      groupBorderWidthScaling: 0.6,
      groupInsetWidth: 6,
      groupBorderRadiusCorrection: 1,
      groupSelectionOutlineWidth: 5,
      groupSelectionOutlineColor: "#222",
      groupSelectionOutlineShadowSize: 0,
      groupSelectionOutlineShadowColor: "#fff",
      groupSelectionFillHueShift: 0,
      groupSelectionFillSaturationShift: 0,
      groupSelectionFillLightnessShift: 0,
      groupSelectionStrokeHueShift: 0,
      groupSelectionStrokeSaturationShift: 0,
      groupSelectionStrokeLightnessShift: -10,
      groupFillType: "gradient",
      groupFillGradientRadius: 1,
      groupFillGradientCenterHueShift: 0,
      groupFillGradientCenterSaturationShift: 0,
      groupFillGradientCenterLightnessShift: 20,
      groupFillGradientRimHueShift: 0,
      groupFillGradientRimSaturationShift: 0,
      groupFillGradientRimLightnessShift: -5,
      groupStrokeType: "plain",
      groupStrokeWidth: 1.5,
      groupStrokePlainHueShift: 0,
      groupStrokePlainSaturationShift: 0,
      groupStrokePlainLightnessShift: -10,
      groupStrokeGradientRadius: 1,
      groupStrokeGradientAngle: 45,
      groupStrokeGradientUpperHueShift: 0,
      groupStrokeGradientUpperSaturationShift: 0,
      groupStrokeGradientUpperLightnessShift: 20,
      groupStrokeGradientLowerHueShift: 0,
      groupStrokeGradientLowerSaturationShift: 0,
      groupStrokeGradientLowerLightnessShift: -20,
      groupHoverFillHueShift: 0,
      groupHoverFillSaturationShift: 0,
      groupHoverFillLightnessShift: 20,
      groupHoverStrokeHueShift: 0,
      groupHoverStrokeSaturationShift: 0,
      groupHoverStrokeLightnessShift: -10,
      groupExposureScale: 1.15,
      groupExposureShadowColor: "rgba(0, 0, 0, 0.5)",
      groupExposureShadowSize: 50,
      groupExposureZoomMargin: 0.1,
      groupUnexposureLightnessShift: 65,
      groupUnexposureSaturationShift: -65,
      groupUnexposureLabelColorThreshold: 0.35,
      exposeDuration: 700,
      exposeEasing: "squareInOut",
      groupColorDecorator: P.pa,
      groupLabelDecorator: P.pa,
      groupLabelLayoutDecorator: P.pa,
      groupContentDecorator: P.pa,
      groupContentDecoratorTriggering: "onLayoutDirty",
      openCloseDuration: 500,
      rainbowColorDistribution: "radial",
      rainbowColorDistributionAngle: -45,
      rainbowLightnessDistributionAngle: 45,
      rainbowSaturationCorrection: 0.1,
      rainbowLightnessCorrection: 0.4,
      rainbowStartColor: "hsla(0, 100%, 55%, 1)",
      rainbowEndColor: "hsla(359, 100%, 55%, 1)",
      rainbowLightnessShift: 30,
      rainbowLightnessShiftCenter: 0.4,
      parentFillOpacity: 0.7,
      parentStrokeOpacity: 1,
      parentLabelOpacity: 1,
      parentOpacityBalancing: true,
      wireframeDrawMaxDuration: 15,
      wireframeLabelDrawing: "auto",
      wireframeContentDecorationDrawing: "auto",
      wireframeToFinalFadeDuration: 500,
      wireframeToFinalFadeDelay: 300,
      finalCompleteDrawMaxDuration: 80,
      finalIncrementalDrawMaxDuration: 100,
      finalToWireframeFadeDuration: 200,
      androidStockBrowserWorkaround: false,
      incrementalDraw: "fast",
      groupLabelFontFamily: "sans-serif",
      groupLabelFontStyle: "normal",
      groupLabelFontWeight: "normal",
      groupLabelFontVariant: "normal",
      groupLabelLineHeight: 1.05,
      groupLabelHorizontalPadding: 1,
      groupLabelVerticalPadding: 1,
      groupLabelMinFontSize: 6,
      groupLabelMaxFontSize: 160,
      groupLabelMaxTotalHeight: 0.9,
      groupLabelUpdateThreshold: 0.05,
      groupLabelDarkColor: "#000",
      groupLabelLightColor: "#fff",
      groupLabelColorThreshold: 0.35,
      rolloutStartPoint: "center",
      rolloutEasing: "squareOut",
      rolloutMethod: "groups",
      rolloutDuration: 2e3,
      rolloutScalingStrength: -0.7,
      rolloutTranslationXStrength: 0,
      rolloutTranslationYStrength: 0,
      rolloutRotationStrength: -0.7,
      rolloutTransformationCenter: 0.7,
      rolloutPolygonDrag: 0.1,
      rolloutPolygonDuration: 0.5,
      rolloutLabelDelay: 0.8,
      rolloutLabelDrag: 0.1,
      rolloutLabelDuration: 0.5,
      rolloutChildGroupsDrag: 0.1,
      rolloutChildGroupsDelay: 0.2,
      pullbackStartPoint: "center",
      pullbackEasing: "squareIn",
      pullbackMethod: "groups",
      pullbackDuration: 1500,
      pullbackScalingStrength: -0.7,
      pullbackTranslationXStrength: 0,
      pullbackTranslationYStrength: 0,
      pullbackRotationStrength: -0.7,
      pullbackTransformationCenter: 0.7,
      pullbackPolygonDelay: 0.3,
      pullbackPolygonDrag: 0.1,
      pullbackPolygonDuration: 0.8,
      pullbackLabelDelay: 0,
      pullbackLabelDrag: 0.1,
      pullbackLabelDuration: 0.3,
      pullbackChildGroupsDelay: 0.1,
      pullbackChildGroupsDrag: 0.1,
      pullbackChildGroupsDuration: 0.3,
      fadeDuration: 700,
      fadeEasing: "cubicInOut",
      zoomMouseWheelFactor: 1.5,
      zoomMouseWheelDuration: 500,
      zoomMouseWheelEasing: "squareOut",
      maxLabelSizeForTitleBar: 8,
      titleBarFontFamily: null,
      titleBarFontStyle: "normal",
      titleBarFontWeight: "normal",
      titleBarFontVariant: "normal",
      titleBarBackgroundColor: "rgba(0, 0, 0, 0.5)",
      titleBarTextColor: "rgba(255, 255, 255, 1)",
      titleBarMinFontSize: 10,
      titleBarMaxFontSize: 40,
      titleBarTextPaddingLeftRight: 20,
      titleBarTextPaddingTopBottom: 15,
      titleBarDecorator: P.pa,
      attributionText: null,
      attributionLogo: null,
      attributionLogoScale: 0.5,
      attributionUrl: "http://carrotsearch.com/foamtree",
      attributionPosition: "bottomright",
      attributionDistanceFromCenter: 1,
      attributionWeight: 0.025,
      attributionTheme: "light",
      interactionHandler: ea.Sh() ? "hammerjs" : "builtin",
      onModelChanging: [],
      onModelChanged: [],
      onRedraw: [],
      onRolloutStart: [],
      onRolloutComplete: [],
      onRelaxationStep: [],
      onViewReset: [],
      onGroupOpenOrCloseChanging: [],
      onGroupOpenOrCloseChanged: [],
      onGroupExposureChanging: [],
      onGroupExposureChanged: [],
      onGroupSelectionChanging: [],
      onGroupSelectionChanged: [],
      onGroupHover: [],
      onGroupMouseMove: [],
      onGroupClick: [],
      onGroupDoubleClick: [],
      onGroupHold: [],
      onGroupMouseWheel: [],
      onGroupMouseUp: [],
      onGroupMouseDown: [],
      onGroupDragStart: [],
      onGroupDrag: [],
      onGroupDragEnd: [],
      onGroupTransformStart: [],
      onGroupTransform: [],
      onGroupTransformEnd: [],
      onKeyUp: [],
      selection: null,
      open: null,
      exposure: null,
      imageData: null,
      hierarchy: null,
      geometry: null,
      containerCoordinates: null,
      state: null,
      viewport: null,
      times: null
    });
    window.CarrotSearchFoamTree.geometry = Object.freeze(/* @__PURE__ */ function() {
      return { rectangleInPolygon: function(a, q, l, g, e, d, p) {
        e = P.H(e, 1);
        d = P.H(d, 0.5);
        p = P.H(p, 0.5);
        a = wa.de(
          a,
          { x: q, y: l },
          g,
          d,
          p
        ) * e;
        return { x: q - a * g * d, y: l - a * p, w: a * g, h: a };
      }, circleInPolygon: function(a, q, l) {
        return wa.qg(a, { x: q, y: l });
      }, stabPolygon: function(a, q, l, g) {
        return wa.Nb(a, { x: q, y: l }, g);
      }, polygonCentroid: function(a) {
        a = wa.u(a, {});
        return { x: a.x, y: a.y, area: a.fa };
      }, boundingBox: function(a) {
        for (var q = a[0].x, l = a[0].y, g = a[0].x, e = a[0].y, d = 1; d < a.length; d++) {
          var p = a[d];
          p.x < q && (q = p.x);
          p.y < l && (l = p.y);
          p.x > g && (g = p.x);
          p.y > e && (e = p.y);
        }
        return { x: q, y: l, w: g - q, h: e - l };
      } };
    }());
  }, function() {
    window.CarrotSearchFoamTree = function() {
      window.console.error("FoamTree is not supported on this browser.");
    };
    window.CarrotSearchFoamTree.supported = false;
  });
})();
//# sourceMappingURL=scripts.js.map
